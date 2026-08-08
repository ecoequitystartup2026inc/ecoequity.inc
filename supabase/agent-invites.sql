-- ============================================================================
-- AGENT INVITATIONS — hiring an agent from the Admin Portal instead of the SQL
-- editor, and the roster the portal lists them from.
--
-- Run in Supabase → SQL Editor, AFTER live-agent-flow.sql. Safe to re-run.
--
-- The shape of the thing: `agent_invitations` is the roster of everyone ever
-- invited, and `profiles.is_agent` is whether they can take a chat TODAY. Two
-- facts, deliberately not one column, because the admin's list has to show
-- somebody who was invited and has not signed up yet (no profile row exists),
-- somebody who was invited and did (both exist), and somebody who was an agent
-- and was switched off (both exist, is_agent false). One boolean cannot hold
-- three states, and a roster that forgets the people it turned off cannot
-- offer to turn them back on.
--
-- The invitation EMAIL is sent by supabase/functions/invite-agent, which needs
-- the service-role key to create the auth user. Nothing here sends mail.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1. The roster.
--
-- Keyed by email rather than user id, because at the moment of inviting there
-- is no user to point at — that is the entire situation being modelled. The id
-- is filled in later, when they accept.
--
-- Emails are stored lower-cased through normalize_email() (admin-roles.sql) so
-- 'Maria@Example.com' and 'maria@example.com' cannot become two invitations to
-- the same person, each with a different status.
-- ---------------------------------------------------------------------------
create table if not exists public.agent_invitations (
  id           uuid primary key default gen_random_uuid(),
  email        text not null unique,
  full_name    text,
  status       text not null default 'pending'
                 check (status in ('pending', 'accepted', 'revoked')),
  invited_by   uuid references public.profiles (id) on delete set null,
  user_id      uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now(),
  last_sent_at timestamptz not null default now(),
  accepted_at  timestamptz,
  revoked_at   timestamptz
);

-- One live invitation per address: `email` carries a plain UNIQUE constraint
-- above, so re-inviting somebody updates their row rather than stacking a
-- second one — "resend" is a real operation and the list never shows the same
-- person twice.
--
-- A plain constraint rather than a unique index on lower(email), even though
-- the latter reads like the more careful choice. Postgres' ON CONFLICT can
-- only target a constraint or an index it can name, and PostgREST's upsert —
-- which is how the Edge Function writes this row — can only name a column.
-- An expression index would work in psql and fail from the app.
--
-- Case-insensitivity is kept by the trigger below instead, which is stricter
-- anyway: the index approach lets both spellings SIT in the table as long as
-- nothing collides, while this one means only one spelling can ever exist.
create or replace function public.normalize_invite_email()
returns trigger
language plpgsql
as $$
begin
  new.email := lower(trim(new.email));
  return new;
end;
$$;

drop trigger if exists agent_invitations_normalize on public.agent_invitations;
create trigger agent_invitations_normalize
  before insert or update on public.agent_invitations
  for each row execute function public.normalize_invite_email();

alter table public.agent_invitations enable row level security;

-- Nobody but an admin, in either direction. An invitation list is a staff
-- directory with contact details attached.
drop policy if exists agent_invitations_admin on public.agent_invitations;
create policy agent_invitations_admin on public.agent_invitations
  for all using (public.is_admin()) with check (public.is_admin());


-- ---------------------------------------------------------------------------
-- 2. Accepting an invitation, by signing up.
--
-- The moment an invited address creates an account it becomes an agent — no
-- second step, no admin having to remember to promote them afterwards. That
-- "afterwards" is where an invite flow rots: the agent signs up, sees an
-- ordinary member site, and emails you asking where their chats are.
--
-- Its OWN trigger rather than an edit to handle_new_user() in admin-roles.sql,
-- for the reason this codebase keeps running into: re-running that file would
-- replace the function and silently take this with it.
--
-- The upsert is what makes trigger ORDER stop mattering. handle_new_user also
-- fires on this insert and also writes the profiles row; whichever lands
-- second finds the row already there and updates it instead of failing.
--
-- WHEN this fires is the thing to hold on to: inviteUserByEmail creates the
-- auth.users row at INVITE time, not when the person clicks the link. So the
-- role is granted the moment the invitation is sent, and the Edge Function has
-- to have written the invitation row BEFORE calling it — otherwise the select
-- below finds nothing and the invitee arrives as an ordinary member. See the
-- ordering note in supabase/functions/invite-agent/index.ts.
-- ---------------------------------------------------------------------------
create or replace function public.accept_agent_invitation()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_invite public.agent_invitations%rowtype;
begin
  select * into v_invite
    from public.agent_invitations
   where lower(email) = lower(new.email)
     and status = 'pending';

  if not found then
    return new;   -- an ordinary signup; nothing to do
  end if;

  -- set_config, not a plain update: guard_agent_flag() reverts any write to
  -- is_agent that does not carry this flag. The guard is the point — this is
  -- one of exactly two doors through it, and both are server-side.
  perform set_config('eco.allow_agent_write', 'on', true);

  insert into public.profiles (id, full_name, is_agent)
  values (new.id, coalesce(v_invite.full_name, new.raw_user_meta_data ->> 'full_name'), true)
  on conflict (id) do update
    set is_agent  = true,
        full_name = coalesce(public.profiles.full_name, excluded.full_name);

  update public.agent_invitations
     set status = 'accepted', accepted_at = now(), user_id = new.id
   where id = v_invite.id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_agent_invite on auth.users;
create trigger on_auth_user_agent_invite
  after insert on auth.users
  for each row execute function public.accept_agent_invitation();


-- ---------------------------------------------------------------------------
-- 3. The roster as the Admin Portal draws it.
--
-- One row per invited person, with the four states the portal shows:
--
--   pending   — invited, has not signed up yet
--   active    — an agent, and their browser has checked in recently
--   offline   — an agent, but nobody is there
--   disabled  — accepted once, since switched off
--
-- Derived here rather than in JavaScript because 'active' depends on
-- now() - agent_seen_at, and a browser computing that against its own clock
-- gets it wrong on every machine with a skewed one.
-- ---------------------------------------------------------------------------
create or replace function public.admin_agent_roster()
returns table (
  email        text,
  full_name    text,
  state        text,
  agent_status text,
  user_id      uuid,
  open_chats   bigint,
  invited_at   timestamptz,
  last_seen_at timestamptz
)
language sql security definer set search_path = public
as $$
  select
    i.email,
    coalesce(p.full_name, i.full_name),
    case
      when i.status = 'revoked'    then 'disabled'
      when p.is_agent is not true  then 'disabled'
      -- "Pending Invitation" is NOT "no account exists". inviteUserByEmail
      -- creates the auth row the moment the invite is sent, so an untouched
      -- invitation already has a user, a profile and the agent role — what it
      -- does not have is anybody who has ever signed in. That is the real
      -- question the admin is asking: has this person turned up yet.
      when u.last_sign_in_at is null then 'pending'
      when p.agent_status <> 'offline'
       and p.agent_seen_at > now() - interval '2 minutes' then 'active'
      else 'offline'
    end,
    coalesce(p.agent_status, 'offline'),
    i.user_id,
    (select count(*) from public.support_tickets t
      where t.agent_id = i.user_id and t.channel = 'live'
        and t.live_status not in ('closed', 'rejected')),
    i.created_at,
    p.agent_seen_at
  from public.agent_invitations i
  left join public.profiles p on p.id = i.user_id
  left join auth.users u       on u.id = i.user_id
  where public.is_admin()          -- security definer: the check must be here
  order by i.created_at desc;
$$;

revoke execute on function public.admin_agent_roster() from public, anon;
grant  execute on function public.admin_agent_roster() to authenticated;


-- ---------------------------------------------------------------------------
-- 4. Switching an existing agent off and on.
--
-- Disabling does NOT delete the invitation or the account: their name still has
-- to render on the transcripts they answered, and "disabled" has to be
-- reversible in one click when they come back from leave.
--
-- It does force them offline. Someone switched off mid-shift must stop
-- collecting chats immediately, not in two minutes when the heartbeat lapses.
-- ---------------------------------------------------------------------------
create or replace function public.set_agent_enabled(p_email text, p_enabled boolean)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Only an admin can enable or disable an agent';
  end if;

  select u.id into v_id from auth.users u
   where public.normalize_email(u.email) = public.normalize_email(p_email);

  if v_id is null then
    -- Invited but never signed up: there is no account to disable, so the
    -- invitation itself is what gets withdrawn.
    update public.agent_invitations
       set status = case when p_enabled then 'pending' else 'revoked' end,
           revoked_at = case when p_enabled then null else now() end
     where lower(email) = lower(p_email);
    return;
  end if;

  perform set_config('eco.allow_agent_write', 'on', true);
  update public.profiles
     set is_agent = p_enabled,
         agent_status = case when p_enabled then agent_status else 'offline' end
   where id = v_id;

  update public.agent_invitations
     set status     = case when p_enabled then 'accepted' else 'revoked' end,
         revoked_at = case when p_enabled then null else now() end,
         user_id    = v_id
   where lower(email) = lower(p_email);
end;
$$;

revoke execute on function public.set_agent_enabled(text, boolean) from public, anon;
grant  execute on function public.set_agent_enabled(text, boolean) to authenticated;


-- ---------------------------------------------------------------------------
-- 5. Backfill: agents who predate this file.
--
-- Anyone already carrying is_agent was promoted by hand with set_agent(). They
-- have no invitation row, so without this they would vanish from the portal's
-- list the moment it starts reading the roster instead of the raw flag.
-- ---------------------------------------------------------------------------
insert into public.agent_invitations (email, full_name, status, user_id, accepted_at)
select lower(u.email), p.full_name, 'accepted', p.id, now()
  from public.profiles p
  join auth.users u on u.id = p.id
 where p.is_agent
on conflict (email) do nothing;


-- ---------------------------------------------------------------------------
-- 6. Agent and admin are mutually exclusive — enforced, not remembered.
--
-- Becoming an agent now drops the admin flag automatically. Without this the
-- rule lived in somebody's head: an admin who was also made an agent kept
-- landing in the Admin Portal, because the app routes on the stronger role,
-- and the only fix was noticing and running set_admin(..., false) by hand.
--
-- THE OWNER IS EXEMPT, and that exemption is the important line in this file.
-- is_owner_email() (admin-roles.sql) names the one address the project cannot
-- function without. Let this rule touch it and a single click in the Agents
-- panel would demote the only admin — with no admin left to undo it, and no
-- way back except the SQL editor. An exemption that looks like an
-- inconsistency is cheaper than an unrecoverable state.
--
-- Redefined here rather than edited into support-agents.sql on purpose: that
-- file also defines assign_ticket(), which live-agent-flow.sql replaces with a
-- newer version. Re-running it to pick up this change would silently roll
-- assignment back to the version that has no memory of the previous agent.
-- Later file wins; each file is still safe to re-run on its own.
-- ---------------------------------------------------------------------------
create or replace function public.set_agent(p_email text, p_is_agent boolean default true)
returns table (email text, full_name text, is_agent boolean)
language plpgsql security definer set search_path = public
as $$
declare
  v_id uuid;
begin
  if auth.uid() is not null and not public.is_admin() then
    raise exception 'Only an admin can change agent rights';
  end if;

  select u.id into v_id from auth.users u where lower(u.email) = lower(p_email);
  if v_id is null then
    raise exception 'No account with email %. Sign up in the app first.', p_email;
  end if;

  perform set_config('eco.allow_agent_write', 'on', true);   -- this tx only
  perform set_config('eco.allow_admin_write', 'on', true);   -- for the demotion

  update public.profiles
     set is_agent = p_is_agent,
         agent_status = case when p_is_agent then agent_status else 'offline' end,
         is_admin = case
                      when p_is_agent and not public.is_owner_email(p_email) then false
                      else is_admin
                    end
   where id = v_id;

  return query
    select u.email::text, p.full_name, p.is_agent
      from public.profiles p join auth.users u on u.id = p.id
     where p.id = v_id;
end;
$$;

revoke execute on function public.set_agent(text, boolean) from public, anon;
grant  execute on function public.set_agent(text, boolean) to authenticated;

-- The same rule on the other door in: an invited address that signs up.
create or replace function public.accept_agent_invitation()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_invite public.agent_invitations%rowtype;
begin
  select * into v_invite
    from public.agent_invitations
   where lower(email) = lower(new.email)
     and status = 'pending';

  if not found then
    return new;   -- an ordinary signup; nothing to do
  end if;

  perform set_config('eco.allow_agent_write', 'on', true);
  perform set_config('eco.allow_admin_write', 'on', true);

  insert into public.profiles (id, full_name, is_agent, is_admin)
  values (
    new.id,
    coalesce(v_invite.full_name, new.raw_user_meta_data ->> 'full_name'),
    true,
    public.is_owner_email(new.email)
  )
  on conflict (id) do update
    set is_agent  = true,
        is_admin  = public.is_owner_email(new.email),
        full_name = coalesce(public.profiles.full_name, excluded.full_name);

  update public.agent_invitations
     set status = 'accepted', accepted_at = now(), user_id = new.id
   where id = v_invite.id;

  return new;
end;
$$;


-- ---------------------------------------------------------------------------
-- 7. One-time repair — demote anyone who is currently both.
--
-- The owner keeps admin; everybody else who carries both flags loses admin and
-- stays an agent, which is the state the rule above would have produced had it
-- existed when they were promoted.
-- ---------------------------------------------------------------------------
do $$
begin
  perform set_config('eco.allow_admin_write', 'on', true);

  update public.profiles p
     set is_admin = false
    from auth.users u
   where u.id = p.id
     and p.is_agent
     and p.is_admin
     and not public.is_owner_email(u.email);
end $$;


-- ---------------------------------------------------------------------------
-- 8. Check the result.
--
-- Expect no row to have both flags except the owner address.
-- ---------------------------------------------------------------------------
select u.email, p.is_admin, p.is_agent
  from public.profiles p
  join auth.users u on u.id = p.id
 order by p.is_admin desc, p.is_agent desc;

select * from public.admin_agent_roster();
