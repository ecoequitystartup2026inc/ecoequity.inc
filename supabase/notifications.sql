-- ============================================================================
-- NOTIFICATIONS — the two switches in Account Settings → Notifications, and
-- the record of everything sent because of them.
--
-- Run this in the Supabase SQL editor (or psql) once, before deploying the
-- `notify` Edge Function. Safe to re-run.
--
-- Why the preference lives on `profiles` and not in localStorage: a send is
-- decided SERVER-SIDE, by the Edge Function, at the moment an order moves or a
-- ticket is answered. The browser that flipped the switch is long gone by then.
-- A preference the sender cannot read is not a preference — it is decoration.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1. The preferences themselves.
--
-- Defaults mirror MEMBER_NOTIFICATION_DEFAULTS in src/data/platformUsers.js:
-- email on, SMS off. SMS costs real money per message and needs a verified
-- phone, so it is opt-in; email is the channel people expect to be told on.
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists notify_email boolean not null default true,
  add column if not exists notify_sms   boolean not null default false;

-- Existing rows predate the columns and take the defaults above, which is the
-- behaviour we want (everyone keeps getting email, nobody is signed up for SMS
-- without asking).


-- ---------------------------------------------------------------------------
-- 2. What was sent, and what happened to it.
--
-- Every attempt lands here — delivered, skipped or failed alike. Three jobs:
--   * the member can see what was sent to them, so "I never got it" is answerable
--   * the admin can see a provider outage as a wall of status='failed'
--   * a missing provider key shows up as status='skipped', not as silence
-- ---------------------------------------------------------------------------
create table if not exists public.notification_log (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles (id) on delete cascade,
  channel    text not null check (channel in ('email', 'sms')),
  event      text not null,              -- 'order_status', 'ticket_reply', 'test', …
  recipient  text,                       -- the address/number actually used
  subject    text,
  body       text,
  status     text not null check (status in ('sent', 'skipped', 'failed')),
  detail     text,                       -- provider id when sent, reason when not
  created_at timestamptz not null default now()
);

create index if not exists notification_log_user_idx
  on public.notification_log (user_id, created_at desc);

alter table public.notification_log enable row level security;

-- Read your own; admins read everyone's. There is deliberately NO insert or
-- update policy: only the Edge Function writes here, and it uses the service
-- role, which bypasses RLS. A browser cannot forge a delivery record.
drop policy if exists notification_log_read_own on public.notification_log;
create policy notification_log_read_own on public.notification_log
  for select using (user_id = auth.uid() or public.is_admin());


-- ---------------------------------------------------------------------------
-- 3. Recipient lookup for the Edge Function.
--
-- The function is handed an email address (that is what an order record
-- carries) and needs the matching member's id, phone and switches. Doing it as
-- one security-definer function rather than a join in the function keeps the
-- auth.users read — which the anon key must never be able to do — on this side
-- of the wall.
--
-- Returns no row for an address that has never signed up. That is not an error:
-- a guest checkout has an email and no account, and the caller treats it as
-- "email only, no stored preference".
-- ---------------------------------------------------------------------------
create or replace function public.notification_target(p_email text)
returns table (
  user_id      uuid,
  full_name    text,
  phone        text,
  notify_email boolean,
  notify_sms   boolean
)
language sql stable security definer set search_path = public
as $$
  select p.id, p.full_name, p.phone, p.notify_email, p.notify_sms
  from public.profiles p
  join auth.users u on u.id = p.id
  where lower(u.email) = lower(p_email)
  limit 1;
$$;

-- Same reasoning as bump_ai_chat_usage: PUBLIC includes service_role, so the
-- grant after the revoke is load-bearing, not decoration.
revoke execute on function public.notification_target(text) from public, anon, authenticated;
grant execute on function public.notification_target(text) to service_role;


-- ---------------------------------------------------------------------------
-- 4. Housekeeping.
--
-- The log grows one row per message forever. Run occasionally, or wire to
-- pg_cron if it is enabled:
--   delete from public.notification_log where created_at < now() - interval '90 days';
-- ---------------------------------------------------------------------------
