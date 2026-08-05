-- ============================================================================
-- EcoEquity — user-generated data migration
--
-- NOTE: everything in this file is now part of schema.sql. Running schema.sql
-- is enough; this file is kept only as a standalone patch for a database that
-- already exists and that you would rather not re-run the whole schema against.
-- Safe to re-run either way.
--
-- WHY THIS FILE EXISTS
-- schema.sql created lean tables (orders has 8 columns), but the app's records
-- are much richer — an order carries customer, phone, rider, payment method,
-- delivery speed, fees and more; a support ticket carries category, priority
-- and an attachment name. Mapping every field to its own column would mean
-- editing this schema every time a React form gains a field, and silently
-- dropping anything not mapped.
--
-- So each table gets two extra columns:
--   ref   text   the app's own human id ("ORD-2026-1234", "TKT-441233")
--   data  jsonb  the complete record exactly as the app holds it
--
-- The typed columns stay authoritative for the things the DATABASE needs to
-- reason about — ownership (buyer_id/user_id/author_id, which every RLS policy
-- reads), status, total, created_at. `data` carries the rest so nothing is lost
-- on the round trip. Same reasoning as admin_content in schema.sql.
-- ============================================================================

-- --- ORDERS -----------------------------------------------------------------
alter table public.orders add column if not exists ref  text;
alter table public.orders add column if not exists data jsonb;

create unique index if not exists orders_ref_idx on public.orders (ref)
  where ref is not null;

-- Admins move orders through Pending Approval -> Approved -> Delivered and
-- assign riders. schema.sql only granted select + insert, so those edits had
-- nowhere to land.
drop policy if exists orders_admin on public.orders;
create policy orders_admin on public.orders
  for all using (public.is_admin()) with check (public.is_admin());

-- A buyer may edit their own order (e.g. cancelling before approval).
drop policy if exists orders_update_own on public.orders;
create policy orders_update_own on public.orders
  for update using (buyer_id = auth.uid()) with check (buyer_id = auth.uid());

-- --- SUPPORT TICKETS --------------------------------------------------------
alter table public.support_tickets add column if not exists ref  text;
alter table public.support_tickets add column if not exists data jsonb;

create unique index if not exists support_tickets_ref_idx
  on public.support_tickets (ref) where ref is not null;

-- --- FORUM POSTS ------------------------------------------------------------
alter table public.forum_posts add column if not exists ref  text;
alter table public.forum_posts add column if not exists data jsonb;

create unique index if not exists forum_posts_ref_idx
  on public.forum_posts (ref) where ref is not null;

-- The author can edit/delete their own post (likes, replies, removal).
-- schema.sql granted insert but never update or delete.
drop policy if exists forum_own on public.forum_posts;
create policy forum_own on public.forum_posts
  for all using (author_id = auth.uid()) with check (author_id = auth.uid());

-- --- PLANT SCANS ------------------------------------------------------------
alter table public.plant_scans add column if not exists ref  text;
alter table public.plant_scans add column if not exists data jsonb;

create unique index if not exists plant_scans_ref_idx
  on public.plant_scans (ref) where ref is not null;

-- `confidence` is numeric in schema.sql but the app produces "94%" as a string.
-- Widen it so a scan never fails to save on a formatting detail.
alter table public.plant_scans
  alter column confidence type text using confidence::text;

-- --- PRODUCT REVIEWS --------------------------------------------------------
-- Reviews are written by logged-in buyers; reviews_insert in schema.sql already
-- requires author_id = auth.uid(). Authors may also fix their own review.
drop policy if exists reviews_own on public.product_reviews;
create policy reviews_own on public.product_reviews
  for all using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());

-- --- Helpful indexes for the per-user reads the app does on login -----------
create index if not exists orders_buyer_idx
  on public.orders (buyer_id, created_at desc);
create index if not exists support_tickets_user_idx
  on public.support_tickets (user_id, created_at desc);
create index if not exists plant_scans_user_idx
  on public.plant_scans (user_id, created_at desc);
create index if not exists forum_posts_created_idx
  on public.forum_posts (created_at desc);
