-- ============================================================================
-- LIVE AGENT FLOW — pending queue, accept/reject, reassignment, and the
-- conversation a member can walk away from and come back to.
--
-- Run in Supabase → SQL Editor, AFTER live-chat.sql and support-agents.sql.
-- Safe to re-run.
--
-- What this adds on top of support-agents.sql:
--
--   * A lifecycle of its own. `support_tickets.status` is the ADMIN's word for
--     a ticket (Open / In Review / Waiting for Customer / Resolved) and drives
--     the Support Tickets tab's filters. What the member needs to be told is a
--     different question — "is anybody coming?" — and overloading one column
--     with both answers means every future change to one breaks the other.
--     Hence `live_status`, running pending → accepted → active → closed, with
--     rejected and reassigned off to the side.
--
--   * `previous_agent_id`, so "your agent has changed from Alex to Maria" is a
--     fact the database knows rather than something the UI has to remember
--     across a page load it did not survive.
--
--   * `my_live_chat()`, the one call a member's browser makes to find out
--     whether they have a conversation waiting and who is on it. It has to be
--     security definer: a member cannot read `profiles` rows other than their
--     own, so without it the panel could never learn its own agent's name.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1. The conversation's own lifecycle.
--
--   pending    — asked for a human, nobody has picked it up
--   accepted   — an admin took the request and/or put an agent on it
--   active     — somebody has actually spoken since it was accepted
--   reassigned — the agent changed; the member is owed an explanation
--   closed     — done, by either side. Reopenable.
--   rejected   — nobody could take it. Also reopenable, on purpose: "we are
--                busy right now" must not become "you may never ask again".
--
-- accepted and active are separate because they answer different questions.
-- accepted means an agent has been named — the panel can stop saying "waiting"
-- and show who is coming. active means that agent has spoken. A queue sorted
-- on accepted-but-not-active is exactly the list of people who were promised
-- somebody and are still sitting there, which is the failure worth surfacing.
-- ---------------------------------------------------------------------------
alter table public.support_tickets
  add column if not exists live_status       text not null default 'pending',
  add column if not exists previous_agent_id uuid references public.profiles (id) on delete set null,
  add column if not exists live_status_at    timestamptz not null default now();

do $$
begin
  alter table public.support_tickets
    add constraint support_tickets_live_status_check
    check (live_status in ('pending', 'accepted', 'active', 'reassigned', 'closed', 'rejected'));
exception
  when duplicate_object then null;   -- already added by an earlier run
end $$;

-- Existing live chats predate the column. A chat with an agent on it was
-- accepted by definition; one without is still waiting.
update public.support_tickets
   set live_status = case
                       when status = 'Resolved' then 'closed'
                       when agent_id is not null then 'accepted'
                       else 'pending'
                     end
 where channel = 'live'
   and live_status = 'pending'
   and (agent_id is not null or status = 'Resolved');

-- The admin's pending lane: "who has asked for a human and has nobody".
create index if not exists support_tickets_live_status_idx
  on public.support_tickets (channel, live_status, last_message_at desc);


-- ---------------------------------------------------------------------------
-- 2. 'away' joins the agent's vocabulary.
--
-- support-agents.sql allowed available / busy / offline. Away is the honest
-- fourth: at their desk, not taking new chats, back shortly — which is a
-- different promise to the member than busy, and a very different one to
-- offline. Dropping and re-adding the constraint is safe; no existing row can
-- violate the wider set.
-- ---------------------------------------------------------------------------
alter table public.profiles drop constraint if exists profiles_agent_status_check;
alter table public.profiles
  add constraint profiles_agent_status_check
  check (agent_status in ('available', 'busy', 'away', 'offline'));

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

  if p_status is not null and p_status not in ('available', 'busy', 'away', 'offline') then
    raise exception 'Unknown agent status: %', p_status;
  end if;

  update public.profiles
     set agent_seen_at = v_now,
         agent_status  = coalesce(p_status, agent_status)
   where id = auth.uid();

  return v_now;
end;
$$;


-- ---------------------------------------------------------------------------
-- 3. Moving a chat along its lifecycle.
--
-- One helper rather than six near-identical functions. Every transition writes
-- live_status_at, which is what "waiting 4 minutes" is measured from — and it
-- must be the moment the STATE changed, not the last message, or a member who
-- says nothing while they wait appears to have only just arrived.
-- ---------------------------------------------------------------------------
create or replace function public.set_live_status(p_ticket uuid, p_status text)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_user  uuid;
  v_agent uuid;
begin
  select user_id, agent_id into v_user, v_agent
    from public.support_tickets where id = p_ticket and channel = 'live';
  if not found then
    raise exception 'No such live chat';
  end if;

  -- The same three people the RLS policy trusts. Repeated here because this is
  -- security definer and therefore steps around that policy entirely — the
  -- check the function skips is the check the function must make itself.
  if not (v_user = auth.uid() or v_agent = auth.uid() or public.is_admin()) then
    raise exception 'Not your conversation';
  end if;

  -- Only an admin decides whether a request is taken or turned away. A member
  -- may close and reopen their own chat, which is the rest of the set.
  if p_status in ('accepted', 'rejected', 'reassigned') and not public.is_admin() then
    raise exception 'Only an admin can accept, reject or reassign a chat';
  end if;

  update public.support_tickets
     set live_status    = p_status,
         live_status_at = now(),
         status = case
                    when p_status = 'closed'   then 'Resolved'
                    when p_status = 'rejected' then 'Resolved'
                    -- Reopening puts it back in front of the admin. Without
                    -- this a reopened chat stays filed under Resolved and is
                    -- invisible to every filter they actually look at.
                    when p_status = 'pending'  then 'Open'
                    when p_status = 'accepted' then 'In Review'
                    else status
                  end
   where id = p_ticket;
end;
$$;

revoke execute on function public.set_live_status(uuid, text) from public, anon;
grant  execute on function public.set_live_status(uuid, text) to authenticated;


-- ---------------------------------------------------------------------------
-- 4. Assignment, now with a memory.
--
-- Replaces the version in support-agents.sql. Two things are new: it records
-- who the agent WAS, and it distinguishes a first assignment from a handover.
--
-- previous_agent_id is what lets the member be told "you were with Alex, you
-- are now with Maria" after closing the tab and coming back next morning —
-- a sentence the browser cannot construct on its own, because the browser that
-- knew about Alex is gone.
-- ---------------------------------------------------------------------------
create or replace function public.assign_ticket(p_ticket uuid, p_agent uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_name    text;
  v_current uuid;
  v_handover boolean;
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

  v_handover := v_current is not null;

  update public.support_tickets
     set previous_agent_id = v_current,
         agent_id          = p_agent,
         live_status       = case when v_handover then 'reassigned' else 'accepted' end,
         live_status_at    = now(),
         status            = case when status = 'Resolved' then status else 'In Review' end
   where id = p_ticket;

  insert into public.ticket_messages (ticket_id, sender, sender_id, body, data)
  values (
    p_ticket,
    'agent',
    p_agent,
    case when v_handover
      then coalesce(nullif(trim(v_name), ''), 'A support agent') || ' has taken over this conversation.'
      else coalesce(nullif(trim(v_name), ''), 'A support agent') || ' has joined the chat.'
    end,
    jsonb_build_object(
      'system', true, 'agent_id', p_agent, 'agent_name', v_name,
      'handover', v_handover
    )
  );
end;
$$;

revoke execute on function public.assign_ticket(uuid, uuid) from public, anon;
grant  execute on function public.assign_ticket(uuid, uuid) to authenticated;


-- ---------------------------------------------------------------------------
-- 5. A conversation becomes 'active' when somebody actually speaks.
--
-- Its own trigger rather than an edit to touch_ticket_on_message() in
-- live-chat.sql: re-running that file would replace the function and take this
-- with it, leaving a database that looks right and quietly never leaves
-- 'accepted'. Two triggers cannot uncover each other.
--
-- 'reassigned' is left alone deliberately. It is the flag the panel reads to
-- say "your agent has changed", and it must survive until the member has been
-- in the conversation to see it — which is what the client clearing it on
-- acknowledgement means. A message alone is not acknowledgement.
-- ---------------------------------------------------------------------------
create or replace function public.activate_live_chat_on_message()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  update public.support_tickets
     set live_status    = 'active',
         live_status_at = now()
   where id = new.ticket_id
     and channel = 'live'
     and live_status = 'accepted';
  return new;
end;
$$;

drop trigger if exists ticket_messages_activate on public.ticket_messages;
create trigger ticket_messages_activate
  after insert on public.ticket_messages
  for each row execute function public.activate_live_chat_on_message();


-- ---------------------------------------------------------------------------
-- 6. "Do I have a conversation waiting?" — the member's one call.
--
-- Security definer, and this is the whole reason it exists: profiles_select in
-- schema.sql is `id = auth.uid() or is_admin()`, so a member cannot read their
-- own agent's name, let alone their availability. Without this function the
-- panel could show a conversation but never say who was on it.
--
-- Being security definer, it is also the thing standing between one member and
-- everybody else's chats — hence the hard `user_id = auth.uid()` in the where
-- clause, which is not a filter for convenience but the access check itself.
-- It takes no arguments for the same reason: there is no ticket id to pass and
-- therefore nothing to tamper with.
--
-- Returns the most recent live chat whatever state it is in, including closed
-- and rejected. The panel needs those to offer "reopen" — deciding here that a
-- closed chat is not worth mentioning would take that choice away from the
-- person whose conversation it was.
-- ---------------------------------------------------------------------------
create or replace function public.my_live_chat()
returns table (
  ticket_id           uuid,
  ref                 text,
  subject             text,
  live_status         text,
  live_status_at      timestamptz,
  agent_id            uuid,
  agent_name          text,
  agent_status        text,
  agent_online        boolean,
  previous_agent_id   uuid,
  previous_agent_name text,
  last_message_at     timestamptz,
  message_count       bigint
)
language sql security definer set search_path = public
as $$
  select
    t.id,
    t.ref,
    t.subject,
    t.live_status,
    t.live_status_at,
    t.agent_id,
    a.full_name,
    coalesce(a.agent_status, 'offline'),
    coalesce(a.agent_status <> 'offline'
             and a.agent_seen_at > now() - interval '2 minutes', false),
    t.previous_agent_id,
    p.full_name,
    t.last_message_at,
    (select count(*) from public.ticket_messages m where m.ticket_id = t.id)
  from public.support_tickets t
  left join public.profiles a on a.id = t.agent_id
  left join public.profiles p on p.id = t.previous_agent_id
  where t.channel = 'live'
    and t.user_id = auth.uid()
  order by coalesce(t.last_message_at, t.created_at) desc
  limit 1;
$$;

revoke execute on function public.my_live_chat() from public, anon;
grant  execute on function public.my_live_chat() to authenticated;


-- ---------------------------------------------------------------------------
-- 7. Acknowledging a handover.
--
-- Once the member has seen "Maria has taken over", the conversation is just a
-- conversation again. Kept as its own call rather than folded into the first
-- message they send, because a member may read the banner and say nothing —
-- and being told about the same handover every morning until they happen to
-- type something is its own small insult.
-- ---------------------------------------------------------------------------
create or replace function public.ack_live_handover(p_ticket uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  update public.support_tickets
     set live_status = 'active', live_status_at = now()
   where id = p_ticket
     and channel = 'live'
     and live_status = 'reassigned'
     and (user_id = auth.uid() or agent_id = auth.uid() or public.is_admin());
end;
$$;

revoke execute on function public.ack_live_handover(uuid) from public, anon;
grant  execute on function public.ack_live_handover(uuid) to authenticated;


-- ---------------------------------------------------------------------------
-- 8. Check the result.
-- ---------------------------------------------------------------------------
select live_status, count(*)
  from public.support_tickets
 where channel = 'live'
 group by live_status
 order by live_status;
