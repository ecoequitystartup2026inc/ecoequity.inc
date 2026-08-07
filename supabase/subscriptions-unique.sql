-- ============================================================================
-- SUBSCRIPTIONS — the unique key the PayMongo webhook's upsert depends on.
--
-- Run this in the Supabase SQL editor once, before taking a real subscription
-- payment. Safe to re-run.
--
-- Why it exists: paymongo-webhook writes the subscription with
--   .upsert({...}, { onConflict: "user_id,plan" })
-- and Postgres rejects ON CONFLICT unless a matching unique constraint exists
-- ("there is no unique or exclusion constraint matching the ON CONFLICT
-- specification"). Without this the payment succeeds at PayMongo, the webhook
-- throws, and the customer is charged while staying on the free tier.
--
-- One row per (user, plan) is also the behaviour we want: renewing or
-- re-subscribing to the same plan should update the existing row's period end,
-- not pile up duplicates that the "is this user paid?" check would trip over.
-- ============================================================================

-- Collapse any pre-existing duplicates first, keeping the newest row of each
-- pair — the constraint cannot be added while duplicates exist.
delete from public.subscriptions a
using public.subscriptions b
where a.user_id = b.user_id
  and a.plan = b.plan
  and a.created_at < b.created_at;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'subscriptions_user_plan_key'
  ) then
    alter table public.subscriptions
      add constraint subscriptions_user_plan_key unique (user_id, plan);
  end if;
end $$;

-- The ai-chat function looks up "does this user have an active subscription?"
-- on every message, so give that lookup an index.
create index if not exists subscriptions_user_status_idx
  on public.subscriptions (user_id, status);
