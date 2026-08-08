-- ============================================================================
-- LIVE CHAT — the "Human agent" switch in the AI Chat panel, made real.
--
-- Run this in the Supabase SQL editor (or psql) once, after schema.sql.
-- Safe to re-run.
--
-- What it changes: today the switch in src/AIChatInterface.js is theatre — it
-- flips a boolean and replies with a canned line. Nothing leaves the browser
-- and no admin is ever told. This file gives that conversation somewhere to
-- live: a real `support_tickets` row, one row per message beneath it, and a
-- Realtime publication so both ends see the other type.
--
-- Why a child table and not `support_tickets.messages` jsonb: that column is
-- read-modify-write. In a form-filed ticket only one side writes at a time and
-- it is fine. In a live chat both sides write within the same second, and the
-- second writer overwrites the array the first one just extended — the message
-- does not error, it vanishes. One row per message cannot lose a race.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1. What kind of ticket this is.
--
-- `channel` is what separates the Support Tickets tab's existing queue from
-- the live lane: 'form' is somebody who filled in the support form and expects
-- an email back, 'live' is somebody sitting in the chat panel right now with
-- the window open. They deserve different response times and different UI, and
-- without this column the admin cannot tell them apart.
--
-- Existing rows predate the column and default to 'form', which is what every
-- one of them actually is.
-- ---------------------------------------------------------------------------
alter table public.support_tickets
  add column if not exists channel  text not null default 'form',
  add column if not exists agent_id uuid references public.profiles (id) on delete set null;

do $$
begin
  alter table public.support_tickets
    add constraint support_tickets_channel_check check (channel in ('form', 'live'));
exception
  when duplicate_object then null;   -- already added by an earlier run
end $$;

-- Denormalised from ticket_messages by the trigger in section 3. Both exist so
-- the admin's "who is waiting on me" queue is a plain indexed scan of this
-- table, with no join and no jsonb digging on every render:
--   last_sender = 'member'  ->  the ball is in our court
alter table public.support_tickets
  add column if not exists last_message_at timestamptz,
  add column if not exists last_sender     text;

-- The live queue, newest-waiting first.
create index if not exists support_tickets_live_idx
  on public.support_tickets (channel, status, last_message_at desc);


-- ---------------------------------------------------------------------------
-- 2. The thread itself. One row per message, member and agent alike.
--
-- `sender` is the role, `sender_id` is the person. The role is what the chat
-- bubble styling keys off (it must survive the account being deleted, hence
-- `on delete set null` on the id but `not null` on the role), and the id is
-- what tells you WHICH admin answered.
--
-- No edit or delete flow is planned: a support transcript that can be quietly
-- rewritten afterwards is not a transcript. There is no updated_at for the
-- same reason.
-- ---------------------------------------------------------------------------
create table if not exists public.ticket_messages (
  id         uuid primary key default gen_random_uuid(),
  ticket_id  uuid not null references public.support_tickets (id) on delete cascade,
  sender     text not null check (sender in ('member', 'agent')),
  sender_id  uuid references public.profiles (id) on delete set null,
  body       text not null,
  data       jsonb,                    -- attachment name, client msg id, …
  created_at timestamptz not null default now()
);

-- Every read is "this ticket's thread, oldest first" — both for the backfill
-- when the panel opens and for the admin transcript.
create index if not exists ticket_messages_ticket_idx
  on public.ticket_messages (ticket_id, created_at);

alter table public.ticket_messages enable row level security;

-- Three people may touch a thread: the member whose ticket it is, the agent it
-- was assigned to, and any admin. Reached one hop away through support_tickets
-- rather than duplicating the ownership columns onto every message row.
--
-- The condition is spelled out here rather than inherited from tickets_own —
-- a policy cannot call another policy, so the two really are separate rules
-- that happen to agree, and widening one does NOT widen the other. If you add
-- a fourth kind of reader to tickets_own in schema.sql, it has to be added
-- below by hand or that reader opens the ticket to a blank thread: not an
-- error, just silence, which is indistinguishable from "nobody has replied".
--
-- The agent clause needs its twin in tickets_own (see supabase/support-agents.sql).
-- The subquery below reads support_tickets, and that read is itself subject to
-- support_tickets' own RLS — so an agent who cannot select the ticket fails
-- this check even with `t.agent_id = auth.uid()` written right here.
--
-- `with check` matters as much as `using`: without it a member could insert a
-- message onto somebody else's ticket, which is worse than reading one.
drop policy if exists ticket_messages_own on public.ticket_messages;
create policy ticket_messages_own on public.ticket_messages
  for all
  using (
    exists (
      select 1 from public.support_tickets t
      where t.id = ticket_messages.ticket_id
        and (t.user_id = auth.uid() or t.agent_id = auth.uid() or public.is_admin())
    )
  )
  with check (
    exists (
      select 1 from public.support_tickets t
      where t.id = ticket_messages.ticket_id
        and (t.user_id = auth.uid() or t.agent_id = auth.uid() or public.is_admin())
    )
  );


-- ---------------------------------------------------------------------------
-- 3. Keep the ticket's summary in step with its thread.
--
-- Done in a trigger rather than in src/data/liveChat.js because both ends
-- write messages — the chat panel and the Admin Portal — and a rule enforced
-- in two places is a rule enforced in neither. This also means an insert made
-- straight from the SQL editor while testing behaves like a real one.
--
-- The status move is the useful part: a member who replies to a ticket marked
-- 'Waiting for Customer' has just handed it back, and it must reappear in the
-- admin's open queue without anyone remembering to click something. A ticket
-- the admin already marked 'Resolved' is left alone — reopening is a decision,
-- not a side effect of someone saying thanks.
-- ---------------------------------------------------------------------------
create or replace function public.touch_ticket_on_message()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  update public.support_tickets
     set last_message_at = new.created_at,
         last_sender     = new.sender,
         status = case
                    when new.sender = 'member' and status = 'Waiting for Customer' then 'Open'
                    else status
                  end
   where id = new.ticket_id;
  return new;
end;
$$;

drop trigger if exists ticket_messages_touch on public.ticket_messages;
create trigger ticket_messages_touch
  after insert on public.ticket_messages
  for each row execute function public.touch_ticket_on_message();


-- ---------------------------------------------------------------------------
-- 4. Realtime.
--
-- This is the line that makes the chat live. Without it the tables above are
-- correct and the panel still has to poll.
--
-- Only ticket_messages is published: the client subscribes to INSERTs filtered
-- by ticket_id, which is all a conversation needs. Realtime applies the RLS
-- policy in section 2 to each row before delivering it, so a member cannot
-- subscribe their way into somebody else's thread.
--
-- Wrapped in a guard because `alter publication … add table` is an error, not
-- a no-op, when the table is already a member — and this file has to survive
-- being re-run.
--
-- Default replica identity is enough here. `replica identity full` is only
-- needed to receive the OLD row on UPDATE/DELETE, and this table has neither.
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename  = 'ticket_messages'
     )
  then
    alter publication supabase_realtime add table public.ticket_messages;
  end if;
end $$;


-- ---------------------------------------------------------------------------
-- 5. Backfill, for a database that already has tickets.
--
-- Gives every existing ticket a last_message_at so the new index sorts them
-- sensibly instead of dumping them all at the bottom on null. Falls back to
-- created_at, which is when the ticket was filed and therefore when it was
-- last spoken on if nobody has replied yet.
-- ---------------------------------------------------------------------------
update public.support_tickets
   set last_message_at = created_at
 where last_message_at is null;


-- ---------------------------------------------------------------------------
-- 6. One set of status words.
--
-- schema.sql defaults this column to lowercase 'open', but everything that
-- READS it — the Admin Portal's queue, its filters, its badge counts, and the
-- trigger in section 3 — uses the capitalised set. A ticket that says 'open'
-- is invisible to a filter looking for 'Open', so it is not a cosmetic
-- difference: it is a ticket nobody is told about.
--
-- Fix the existing rows and the default, and let the capitalised set win
-- because it is the one the UI already speaks.
--
-- Spelled out rather than run through initcap(), which would produce
-- 'Waiting For Customer' — a capital F that matches nothing.
-- ---------------------------------------------------------------------------
update public.support_tickets
   set status = case lower(status)
                  when 'open'                 then 'Open'
                  when 'in progress'          then 'In Progress'
                  when 'waiting for customer' then 'Waiting for Customer'
                  when 'resolved'             then 'Resolved'
                  when 'closed'               then 'Resolved'
                  else status
                end
 where status is not null;

alter table public.support_tickets alter column status set default 'Open';


-- ---------------------------------------------------------------------------
-- 7. Housekeeping.
--
-- Transcripts are the record of what was promised to a customer, so there is
-- no automatic deletion here. If a retention policy is ever needed, delete the
-- TICKET and let the cascade take its thread — deleting messages out from
-- under a live ticket leaves a conversation that starts mid-sentence:
--   delete from public.support_tickets
--    where status = 'Resolved' and last_message_at < now() - interval '2 years';
-- ---------------------------------------------------------------------------
