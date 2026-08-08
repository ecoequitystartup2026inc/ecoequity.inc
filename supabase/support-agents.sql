-- ============================================================================
-- SUPPORT AGENTS — the people a live chat can be handed to.
--
-- Run in Supabase → SQL Editor, AFTER schema.sql, admin-roles.sql and
-- live-chat.sql. Safe to re-run.
--
-- What this adds: live-chat.sql gave a conversation somewhere to live and an
-- `agent_id` column to point at, but nothing to point it AT. The database has
-- exactly two kinds of person — one admin (admin-roles.sql) and everybody else
-- — and neither is a support agent. This file adds the third kind, a way to
-- say which of them is at their desk right now, and the one call that hands a
-- waiting member to one of them.
--
-- Why a flag on `profiles` and not a `support_agents` table: an agent is a
-- member of staff who already has an account, a name and an avatar, and every
-- screen that shows an agent wants exactly those three things. A side table
-- would be a join on every render to reach columns that are already there.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1. The three new columns.
--
-- `is_agent`      — may this account be assigned live chats. Staff, not admin.
-- `agent_status`  — what they say they are: available, busy, offline.
-- `agent_seen_at` — when their browser last said anything at all.
--
-- The last two are separate on purpose, and this is the whole reason presence
-- works. `agent_status` is a claim: it is whatever the agent last clicked, and
-- it stays that way forever if they close the laptop lid without clicking
-- 'offline' — which is what everybody does. `agent_seen_at` is evidence, moved
-- by a heartbeat the portal sends while it is open. An agent counts as
-- available only when the claim and the evidence agree (see the view in
-- section 4), so a shut laptop drops out of the queue on its own.
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists is_agent      boolean not null default false,
  add column if not exists agent_status  text    not null default 'offline',
  add column if not exists agent_seen_at timestamptz;

do $$
begin
  alter table public.profiles
    add constraint profiles_agent_status_check
    check (agent_status in ('available', 'busy', 'offline'));
exception
  when duplicate_object then null;   -- already added by an earlier run
end $$;

-- The admin's "who can I hand this to" list: agents only, freshest first.
create index if not exists profiles_agent_idx
  on public.profiles (is_agent, agent_status, agent_seen_at desc)
  where is_agent;


-- ---------------------------------------------------------------------------
-- 2. Nobody may promote themselves to agent.
--
-- Same hole admin-roles.sql section 2 closes for is_admin, and for the same
-- reason: profiles_update in schema.sql lets a signed-in user update their own
-- row. Unguarded, `is_agent` is one API call away from any member, and an
-- agent can be assigned other people's support conversations — which is a
-- privacy breach, not a cosmetic one.
--
-- This is a SEPARATE trigger from profiles_guard_admin_flag rather than an
-- edit to guard_admin_flag(). Re-running admin-roles.sql would replace that
-- function and silently take the is_agent guard with it, leaving a database
-- that looks fine and is not. Two triggers cannot uncover each other.
--
-- agent_status and agent_seen_at are deliberately NOT guarded: an agent sets
-- their own availability, many times a day. A member writing them achieves
-- nothing, because everything downstream filters on is_agent first.
-- ---------------------------------------------------------------------------
create or replace function public.guard_agent_flag()
returns trigger
language plpgsql
as $$
begin
  if new.is_agent is distinct from old.is_agent
     and current_setting('eco.allow_agent_write', true) is distinct from 'on' then
    new.is_agent := old.is_agent;   -- ignore the attempted change
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_agent_flag on public.profiles;
create trigger profiles_guard_agent_flag
  before update on public.profiles
  for each row execute function public.guard_agent_flag();


-- ---------------------------------------------------------------------------
-- 3. The supported way to hire and un-hire, by email.
--
-- Mirrors set_admin() in admin-roles.sql — callable from the SQL Editor, where
-- auth.uid() is null and the postgres role is running, or through the API by
-- an admin. A member calling it is refused.
--
-- Demoting also drops the agent out of every queue immediately by clearing
-- their claimed status. It deliberately does NOT unassign their open chats:
-- the transcript should keep saying who actually answered, and an admin can
-- reassign the live ones by hand.
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
  update public.profiles
     set is_agent = p_is_agent,
         agent_status = case when p_is_agent then agent_status else 'offline' end
   where id = v_id;

  return query
    select u.email::text, p.full_name, p.is_agent
      from public.profiles p join auth.users u on u.id = p.id
     where p.id = v_id;
end;
$$;

revoke execute on function public.set_agent(text, boolean) from public, anon;
grant  execute on function public.set_agent(text, boolean) to authenticated;


-- ---------------------------------------------------------------------------
-- 4. Who is actually available.
--
-- `is_available` is the AND of the claim and the evidence described in section
-- 1. Two minutes is the grace: long enough that a heartbeat lost to a flaky
-- connection does not blink the agent out mid-sentence, short enough that a
-- closed laptop stops collecting new chats before the member gives up waiting.
-- It pairs with a heartbeat sent every ~60s — the interval must stay
-- comfortably under half the grace or a single missed beat looks like an exit.
--
-- security_invoker means the view obeys profiles' own RLS instead of the
-- view owner's rights. That matters: profiles_select in schema.sql is
-- `id = auth.uid() or is_admin()`, so this returns the full roster to an admin
-- and nothing to a member. Without it the view would hand every signed-in user
-- a list of staff names, which the underlying table refuses them.
--
-- The member's chat panel never reads this. It learns its agent's name from
-- the system message in section 6, which arrives on the socket it already has.
-- ---------------------------------------------------------------------------
create or replace view public.available_agents
with (security_invoker = true) as
  select
    p.id,
    p.full_name,
    p.profile_pic,
    p.agent_status,
    p.agent_seen_at,
    (p.agent_status = 'available'
     and p.agent_seen_at > now() - interval '2 minutes') as is_available,
    (select count(*)
       from public.support_tickets t
      where t.agent_id = p.id
        and t.channel  = 'live'
        and t.status not in ('Resolved')) as open_chats
  from public.profiles p
 where p.is_agent;

grant select on public.available_agents to authenticated;


-- ---------------------------------------------------------------------------
-- 5. The heartbeat, and the availability switch.
--
-- One call does both: the portal sends it every ~60s with the agent's current
-- choice, and it moves agent_seen_at every time. Sending the status on every
-- beat rather than only on change means a reconnecting tab re-asserts what it
-- believes without needing to know whether anything was missed.
--
-- security definer so it can write is_agent-gated columns without opening
-- profiles further, and because it must refuse a non-agent outright — the flag
-- is checked here rather than trusted from the client.
-- ---------------------------------------------------------------------------
create or replace function public.agent_heartbeat(p_status text default null)
returns timestamptz
language plpgsql security definer set search_path = public
as $$
declare
  v_now timestamptz := now();
begin
  if not coalesce((select is_agent from public.profiles where id = auth.uid()), false) then
    raise exception 'Not a support agent';
  end if;

  if p_status is not null and p_status not in ('available', 'busy', 'offline') then
    raise exception 'Unknown agent status: %', p_status;
  end if;

  update public.profiles
     set agent_seen_at = v_now,
         agent_status  = coalesce(p_status, agent_status)
   where id = auth.uid();

  return v_now;
end;
$$;

revoke execute on function public.agent_heartbeat(text) from public, anon;
grant  execute on function public.agent_heartbeat(text) to authenticated;


-- ---------------------------------------------------------------------------
-- 6. Handing a member to an agent.
--
-- Three writes that must not half-happen: point the ticket at the agent, move
-- it out of the unassigned queue, and TELL THE MEMBER. Done in one function so
-- the portal cannot produce a ticket that is assigned but silent — a member
-- staring at "waiting for an agent" while an agent stares back at them is the
-- exact failure this whole feature exists to prevent.
--
-- The system message is the clever part, and it is why support_tickets does
-- not need to be published to Realtime. The member's panel is already
-- subscribed to this ticket's messages; the handoff arrives down that same
-- socket, carrying the agent's name in `data` for the panel header. Section 4
-- of live-chat.sql stays true: ticket_messages is the only published table.
--
-- 'In Review' matches supportStatusOptions in src/pages/AdminPortal.js. A
-- status this file invents on its own would land the ticket in a filter tab
-- that does not exist, which reads to the admin as the ticket vanishing.
--
-- Re-assigning is the same call with a different agent: allowed, and it posts
-- a fresh joined-the-chat line so the member is never talking to a name that
-- has quietly changed underneath them.
-- ---------------------------------------------------------------------------
create or replace function public.assign_ticket(p_ticket uuid, p_agent uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_name    text;
  v_current uuid;
begin
  if not public.is_admin() then
    raise exception 'Only an admin can assign a chat';
  end if;

  select full_name into v_name
    from public.profiles
   where id = p_agent and is_agent;

  if not found then
    raise exception 'That account is not a support agent';
  end if;

  select agent_id into v_current from public.support_tickets where id = p_ticket;
  if not found then
    raise exception 'No such ticket';
  end if;

  -- Nothing to do, and nothing to announce. Without this an admin clicking the
  -- same name twice posts "X has joined the chat" twice.
  if v_current is not distinct from p_agent then
    return;
  end if;

  update public.support_tickets
     set agent_id = p_agent,
         status   = case when status = 'Resolved' then status else 'In Review' end
   where id = p_ticket;

  insert into public.ticket_messages (ticket_id, sender, sender_id, body, data)
  values (
    p_ticket,
    'agent',
    p_agent,
    coalesce(nullif(trim(v_name), ''), 'A support agent') || ' has joined the chat.',
    jsonb_build_object('system', true, 'agent_id', p_agent, 'agent_name', v_name)
  );
end;
$$;

revoke execute on function public.assign_ticket(uuid, uuid) from public, anon;
grant  execute on function public.assign_ticket(uuid, uuid) to authenticated;


-- ---------------------------------------------------------------------------
-- 7. Letting an agent reach the chat they were given.
--
-- The twin of the agent clause added to ticket_messages_own in live-chat.sql,
-- and useless without it — that policy's subquery reads support_tickets, and
-- that read is subject to THIS policy. An agent who cannot select the ticket
-- fails the message check no matter what the message policy says.
--
-- Redefined here rather than edited into schema.sql, the same way
-- admin-roles.sql replaces handle_new_user(): schema.sql stays the file you
-- can run on an empty project, and each feature carries its own changes.
-- ---------------------------------------------------------------------------
drop policy if exists tickets_own on public.support_tickets;
create policy tickets_own on public.support_tickets
  for all
  using      (user_id = auth.uid() or agent_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or agent_id = auth.uid() or public.is_admin());

-- The agent's own inbox: "chats assigned to me, the ones waiting on me first".
-- support_tickets_live_idx in live-chat.sql leads on `channel` and cannot serve
-- this — a scan filtered by agent_id would not use it.
create index if not exists support_tickets_agent_idx
  on public.support_tickets (agent_id, status, last_message_at desc);


-- ---------------------------------------------------------------------------
-- 8. Check the result.
--
-- Expect one row per agent. Nothing is listed until you hire somebody:
--
--   select * from public.set_agent('someone@example.com', true);
--   select * from public.set_agent('someone@example.com', false);
--
-- is_available stays false until that person opens the portal and their
-- browser sends the first heartbeat — which is correct, not a bug: an agent
-- who has never opened the app is not standing by.
-- ---------------------------------------------------------------------------
select u.email, a.full_name, a.agent_status, a.is_available, a.open_chats
  from public.available_agents a
  join auth.users u on u.id = a.id
 order by a.is_available desc, a.full_name;
