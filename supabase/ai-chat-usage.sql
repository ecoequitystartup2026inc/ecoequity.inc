-- ============================================================================
-- AI CHAT USAGE — the daily quota counter behind the `ai-chat` Edge Function.
--
-- Run this in the Supabase SQL editor (or psql) once, before deploying
-- `ai-chat`. Safe to re-run.
--
-- Why it exists: the AI runs on OUR provider key, so every message is money.
-- This table is what stops one account — or one stolen login — from spending
-- the whole balance in an afternoon.
-- ============================================================================

create table if not exists public.ai_chat_usage (
  user_id uuid    not null references public.profiles (id) on delete cascade,
  day     date    not null default current_date,
  used    integer not null default 0,
  primary key (user_id, day)
);

-- Nobody reads this from the browser; only the Edge Function (service role)
-- touches it, and service role bypasses RLS. Enabling RLS with no policy is the
-- deliberate lockdown: any client that finds the table sees nothing.
alter table public.ai_chat_usage enable row level security;

-- Atomic increment. Doing this as one statement rather than select-then-update
-- means two messages sent at the same instant cannot both read the old count
-- and each write count+1.
create or replace function public.bump_ai_chat_usage(p_user uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count integer;
begin
  insert into public.ai_chat_usage (user_id, day, used)
  values (p_user, current_date, 1)
  on conflict (user_id, day)
  do update set used = public.ai_chat_usage.used + 1
  returning used into new_count;

  return new_count;
end;
$$;

-- Only the Edge Function should be able to bump a counter. Postgres grants
-- EXECUTE to PUBLIC by default, and PUBLIC includes service_role — so the
-- grant below is NOT redundant: without it the revoke locks out the function
-- itself and every AI request fails with "permission denied".
revoke execute on function public.bump_ai_chat_usage(uuid) from public, anon, authenticated;
grant execute on function public.bump_ai_chat_usage(uuid) to service_role;

-- Optional housekeeping: yesterday's rows are dead weight once the day rolls
-- over. Run occasionally, or wire to pg_cron if it is enabled.
--   delete from public.ai_chat_usage where day < current_date - interval '7 days';
