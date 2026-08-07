-- ============================================================================
-- EcoEquity — the core database schema.
-- Run it in the Supabase SQL Editor (Dashboard → SQL → New query).
--
-- Safe to re-run. Every statement is idempotent: "if not exists", "add column
-- if not exists", "drop policy if exists", a migration that only moves rows it
-- hasn't moved yet, and a product seed that only fires when the table is empty.
--
-- THIS FILE IS NOT THE WHOLE DATABASE. Run these in order, top to bottom:
--
--   1. schema.sql              this file — tables, RLS, EcoPoints, seed
--   2. admin-roles.sql         MUST come after. It redefines handle_new_user()
--                              so only the owner address is born an admin. This
--                              file defines an older handle_new_user(), so
--                              running it alone silently reverts that.
--   3. ai-chat-usage.sql       the AI assistant's daily quota counter. The
--                              `ai-chat` Edge Function 500s without it.
--   4. subscriptions-unique.sql  the unique key the PayMongo webhook upserts
--                              on. Needed before the first real subscription
--                              payment, not before that.
--
-- Two files here are DESTRUCTIVE and are not part of that sequence:
--   seed.sql         wipes `products` and re-inserts the catalog below
--   reset-users.sql  deletes every auth user, yours included
--
-- user-data.sql is fully absorbed into this file; it is kept only as a
-- standalone patch for a database you would rather not re-run this against.
--
-- WHAT CHANGED IN THIS VERSION
--   Previously eleven different admin-managed features were crammed into ONE
--   table (`admin_content`) as anonymous jsonb, discriminated by a `collection`
--   text column. Nothing was browsable: opening it in Supabase showed a wall of
--   identical-looking blobs, and five more features (members, transactions,
--   subscribers, surplus exchange, broadcasts) never reached the database at
--   all — they lived only in each browser's localStorage.
--
--   Now EVERY feature is its own real table with real, typed, readable columns.
--   Open Supabase → Table Editor and you see `advisors`, `riders`, `deliveries`,
--   `plant_diseases`, `surplus_listings`, `platform_members` … each one browsable
--   and filterable like a normal table.
--
--   The app still saves the complete React record into a `data jsonb` column on
--   each table, and a trigger copies the interesting fields OUT of that jsonb
--   into the typed columns. That is the important design point, so it is worth
--   stating plainly: `data` is the source of truth, the typed columns are a
--   derived, queryable projection of it. A React form can gain a field without
--   this schema changing and without that field being silently dropped, and you
--   still get real columns to sort and filter on in the dashboard.
--
-- IF YOUR TABLES LOOK EMPTY IN SUPABASE, READ THIS FIRST
--   1. products — seeded at the bottom of this file. Run it and they appear.
--   2. Admin content (advisors, riders, courses, diseases, events, …) stays
--      EMPTY until an admin publishes. Sign in as an admin, open
--      Admin Portal → Settings → Database & Backups → "Publish content to
--      database". The button only appears for a profile with is_admin = true —
--      see the LAST STEP section at the bottom for how to flip that on.
--   3. orders / support_tickets / forum_posts / plant_scans — written only by a
--      SIGNED-IN user, as they use the app.
--   4. profiles — one row per signed-up user, created automatically by the
--      trigger below. No signups yet means no rows.
-- ============================================================================


-- ============================================================================
-- SECTION 1 — SHARED PLUMBING
-- ============================================================================

-- Is the current user an admin? Used by nearly every policy below.
-- security definer so the policy can read profiles without recursing into
-- profiles' own RLS.
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- ---------------------------------------------------------------------------
-- The jsonb -> typed column projector.
--
-- Every admin-managed table below stores the whole React record in `data` and
-- declares a trigger like:
--
--   create trigger riders_typed before insert or update on public.riders
--     for each row execute function public.apply_typed_columns('name:name', 'status:status');
--
-- Each argument is 'column_name:json_key'. On every write this copies
-- data->'json_key' into that column, so the Table Editor shows real values.
--
-- Two deliberate safety choices, both so that a single odd value in an admin's
-- content can never fail the whole publish:
--   * a key that is absent or json null is skipped (column stays null)
--   * a value that will not cast to the column's type is caught and skipped
-- In both cases the row still saves with `data` complete. You lose a projected
-- column, never the record.
-- ---------------------------------------------------------------------------
create or replace function public.apply_typed_columns()
returns trigger
language plpgsql
as $$
declare
  rec  jsonb := coalesce(new.data, '{}'::jsonb);
  pair text;
  col  text;
  src  text;
begin
  if tg_nargs = 0 then
    return new;
  end if;

  foreach pair in array tg_argv loop
    col := split_part(pair, ':', 1);
    src := split_part(pair, ':', 2);

    if rec ? src and jsonb_typeof(rec -> src) <> 'null' then
      begin
        new := jsonb_populate_record(new, jsonb_build_object(col, rec -> src));
      exception when others then
        null;  -- unparseable for this column's type: keep `data`, skip the column
      end;
    end if;
  end loop;

  new.updated_at := now();
  return new;
end;
$$;


-- ============================================================================
-- SECTION 2 — PROFILES (extends Supabase auth.users, one row per registered user)
-- Replaces App.js state: loggedInUser / isAdmin / address / phone
-- ============================================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  phone       text,
  address     text,
  profile_pic text,
  is_admin    boolean      not null default false,
  eco_points  integer      not null default 0,
  tier        text         not null default 'Seedling',
  created_at  timestamptz  not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- full_name comes from the signup form; the photo is set later in Settings.
  insert into public.profiles (id, full_name, profile_pic)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    null
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================================
-- SECTION 3 — MARKETPLACE
-- ============================================================================

-- PRODUCTS — replaces initialProducts / products state.
-- NOTE: store the icon as a NAME string ("emoji" column), never a React element.
--       The React layer maps the name -> <Icon/> at render time (hydrateIcons).
create table if not exists public.products (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,
  category             text,
  price                numeric(10,2) not null default 0,
  image                text,
  emoji                text,                -- icon NAME, e.g. 'Cherry' / 'Leaf'
  badge                text,
  stock                text default 'In Stock',
  description          text,
  sustainability_badge text,
  rating               numeric(2,1) default 0,
  review_count         integer default 0,
  farmer_id            uuid references public.profiles (id) on delete set null,
  created_at           timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);

-- PRODUCT REVIEWS — was the nested `reviews` array on each product.
create table if not exists public.product_reviews (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid references public.products (id) on delete cascade,
  author_id  uuid references public.profiles (id) on delete set null,
  user_name  text,
  rating     integer check (rating between 1 and 5),
  comment    text,
  created_at timestamptz not null default now()
);

create index if not exists product_reviews_product_idx
  on public.product_reviews (product_id, created_at desc);

-- ---------------------------------------------------------------------------
-- ORDERS + ORDER ITEMS — replaces orders / cartItems state.
--
-- ref/data: every user-generated table carries these two columns.
--   ref   the app's own human id ("ORD-2026-1234"), used to find the row again
--   data  the complete record exactly as React holds it
-- The typed columns stay authoritative for what the DATABASE reasons about —
-- ownership (buyer_id/user_id/author_id, which every RLS policy reads), status,
-- total, created_at.
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  buyer_id         uuid references public.profiles (id) on delete set null,
  status           text not null default 'pending_payment',
  total            numeric(10,2) not null default 0,
  promo_code       text,
  payment_ref      text,                    -- PayMongo payment/intent id
  shipping_address text,
  ref              text,                    -- app id, e.g. 'ORD-2026-1234'
  data             jsonb,                   -- the whole app record
  created_at       timestamptz not null default now()
);

-- For databases created by an earlier version of this file.
alter table public.orders add column if not exists ref  text;
alter table public.orders add column if not exists data jsonb;

create unique index if not exists orders_ref_idx on public.orders (ref)
  where ref is not null;
create index if not exists orders_buyer_idx
  on public.orders (buyer_id, created_at desc);

create table if not exists public.order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  name       text,                          -- snapshot at purchase time
  qty        integer not null default 1,
  price      numeric(10,2) not null default 0
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- SUBSCRIPTIONS — a real, paid subscription belonging to one user.
-- (The admin's PRICING PLAN catalog is a different thing: subscription_plans.)
create table if not exists public.subscriptions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid references public.profiles (id) on delete cascade,
  plan               text not null,         -- e.g. 'ai_data', 'plant_doctor_pro'
  status             text not null default 'inactive', -- active | inactive | past_due | cancelled
  payment_ref        text,                  -- PayMongo subscription id
  current_period_end timestamptz,
  created_at         timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- CART + WISHLIST — the signed-in user's own working state, so a cart survives
-- a browser change instead of living only in localStorage.
-- ---------------------------------------------------------------------------
create table if not exists public.cart_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  product_ref text not null,                -- the app's product id
  qty         integer not null default 1,
  data        jsonb,                        -- the cart line as React holds it
  updated_at  timestamptz not null default now(),
  unique (user_id, product_ref)
);

create table if not exists public.wishlists (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  product_ref text not null,
  data        jsonb,
  created_at  timestamptz not null default now(),
  unique (user_id, product_ref)
);


-- ============================================================================
-- SECTION 4 — ADMIN-AUTHORED CONTENT, ONE REAL TABLE PER FEATURE
--
-- These are the eleven collections that used to share `admin_content`. Each is
-- now its own table. The shape is the same everywhere:
--
--   id          uuid       surrogate key
--   ref         text       the app's own id ("USR-001", 1, "DIS-001") — the app
--                          is the source of ids, so this is text, not a number
--   <typed>     …          projected out of `data` by the trigger, for browsing
--   data        jsonb      the complete React record
--   sort_order  integer    the array position the admin arranged them in
--   updated_at  timestamptz
--
-- The app replaces a whole collection at a time (delete-then-insert), matching
-- how App.js holds each one as a single array in state. These are small — tens
-- of rows — so that is cheaper than diffing.
-- ============================================================================

-- --- Expert Support specialists --------------------------------------------
create table if not exists public.advisors (
  id         uuid primary key default gen_random_uuid(),
  ref        text,
  name       text,
  specialty  text,
  image      text,
  verified   boolean,
  rating     numeric(3,2),
  data       jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

drop trigger if exists advisors_typed on public.advisors;
create trigger advisors_typed before insert or update on public.advisors
  for each row execute function public.apply_typed_columns(
    'ref:id', 'name:name', 'specialty:specialty', 'image:image',
    'verified:verified', 'rating:rating');

-- --- Specialist Certification courses --------------------------------------
create table if not exists public.cert_courses (
  id          uuid primary key default gen_random_uuid(),
  ref         text,
  title       text,
  description text,
  instructor  text,
  level       text,
  duration    text,
  data        jsonb not null default '{}'::jsonb,
  sort_order  integer not null default 0,
  updated_at  timestamptz not null default now()
);

drop trigger if exists cert_courses_typed on public.cert_courses;
create trigger cert_courses_typed before insert or update on public.cert_courses
  for each row execute function public.apply_typed_columns(
    'ref:id', 'title:title', 'description:desc', 'instructor:instructor',
    'level:level', 'duration:duration');

-- --- CMS content items (articles, guides, banners) --------------------------
create table if not exists public.content_items (
  id         uuid primary key default gen_random_uuid(),
  ref        text,
  title      text,
  type       text,
  status     text,
  author     text,
  data       jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

drop trigger if exists content_items_typed on public.content_items;
create trigger content_items_typed before insert or update on public.content_items
  for each row execute function public.apply_typed_columns(
    'ref:id', 'title:title', 'type:type', 'status:status', 'author:author');

-- --- Delivery riders --------------------------------------------------------
create table if not exists public.riders (
  id         uuid primary key default gen_random_uuid(),
  ref        text,
  name       text,
  status     text,
  phone      text,
  area       text,
  data       jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

drop trigger if exists riders_typed on public.riders;
create trigger riders_typed before insert or update on public.riders
  for each row execute function public.apply_typed_columns(
    'ref:id', 'name:name', 'status:status', 'phone:phone', 'area:area');

-- --- Deliveries (drives the customer's Track Order screen) ------------------
create table if not exists public.deliveries (
  id         uuid primary key default gen_random_uuid(),
  ref        text,
  order_ref  text,
  customer   text,
  rider      text,
  status     text,
  eta        text,
  data       jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

drop trigger if exists deliveries_typed on public.deliveries;
create trigger deliveries_typed before insert or update on public.deliveries
  for each row execute function public.apply_typed_columns(
    'ref:id', 'order_ref:orderId', 'customer:customer', 'rider:rider',
    'status:status', 'eta:eta');

-- --- Subscription pricing plans (the catalog, not anyone's subscription) ----
-- Prices are TEXT on purpose: the app authors them as "Free" / "₱299", and a
-- publish must never fail because a plan is priced in words.
create table if not exists public.subscription_plans (
  id            uuid primary key default gen_random_uuid(),
  ref           text,
  name          text,
  description   text,
  price_monthly text,
  price_yearly  text,
  color         text,
  data          jsonb not null default '{}'::jsonb,
  sort_order    integer not null default 0,
  updated_at    timestamptz not null default now()
);

drop trigger if exists subscription_plans_typed on public.subscription_plans;
create trigger subscription_plans_typed before insert or update on public.subscription_plans
  for each row execute function public.apply_typed_columns(
    'ref:id', 'name:name', 'description:description',
    'price_monthly:priceMonthly', 'price_yearly:priceYearly', 'color:color');

-- --- AI Plant Doctor disease library ---------------------------------------
-- `confidence` is text: the app produces "94%", not 94.
create table if not exists public.plant_diseases (
  id         uuid primary key default gen_random_uuid(),
  ref        text,
  name       text,
  plant      text,
  crop       text,
  severity   text,
  confidence text,
  data       jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

drop trigger if exists plant_diseases_typed on public.plant_diseases;
create trigger plant_diseases_typed before insert or update on public.plant_diseases
  for each row execute function public.apply_typed_columns(
    'ref:id', 'name:name', 'plant:plant', 'crop:crop',
    'severity:severity', 'confidence:confidence');

-- --- Events & Workshops -----------------------------------------------------
-- `event_date` (timestamptz) is legacy from an earlier version of this schema
-- and is left unmapped; the app authors dates as free text, which is projected
-- into `date_label`. Filter on date_label, not event_date.
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  event_date  timestamptz,
  location    text,
  created_at  timestamptz not null default now()
);

alter table public.events add column if not exists ref        text;
alter table public.events add column if not exists date_label text;
alter table public.events add column if not exists data       jsonb not null default '{}'::jsonb;
alter table public.events add column if not exists sort_order integer not null default 0;
alter table public.events add column if not exists updated_at timestamptz not null default now();
-- Admin-authored events arrive from a form that may not have a title yet.
alter table public.events alter column title drop not null;

drop trigger if exists events_typed on public.events;
create trigger events_typed before insert or update on public.events
  for each row execute function public.apply_typed_columns(
    'ref:id', 'title:title', 'description:description',
    'date_label:date', 'location:location');

-- --- Seasonal harvest calendar ----------------------------------------------
create table if not exists public.harvests (
  id         uuid primary key default gen_random_uuid(),
  farmer_id  uuid references public.profiles (id) on delete set null,
  crop       text,
  quantity   text,
  icon_name  text,                          -- icon NAME, not JSX
  created_at timestamptz not null default now()
);

alter table public.harvests add column if not exists ref        text;
alter table public.harvests add column if not exists name       text;
alter table public.harvests add column if not exists category   text;
alter table public.harvests add column if not exists peak       text;
alter table public.harvests add column if not exists region     text;
alter table public.harvests add column if not exists location   text;
alter table public.harvests add column if not exists data       jsonb not null default '{}'::jsonb;
alter table public.harvests add column if not exists sort_order integer not null default 0;
alter table public.harvests add column if not exists updated_at timestamptz not null default now();

drop trigger if exists harvests_typed on public.harvests;
create trigger harvests_typed before insert or update on public.harvests
  for each row execute function public.apply_typed_columns(
    'ref:id', 'name:name', 'category:category', 'peak:peak',
    'region:region', 'location:location', 'icon_name:icon');

-- --- Promo codes ------------------------------------------------------------
create table if not exists public.promo_codes (
  id         uuid primary key default gen_random_uuid(),
  code       text unique not null,
  discount   numeric not null default 0,
  expires_at timestamptz,
  active     boolean not null default true
);

alter table public.promo_codes add column if not exists ref         text;
alter table public.promo_codes add column if not exists type        text;
alter table public.promo_codes add column if not exists description text;
alter table public.promo_codes add column if not exists uses        integer;
alter table public.promo_codes add column if not exists data        jsonb not null default '{}'::jsonb;
alter table public.promo_codes add column if not exists sort_order  integer not null default 0;
alter table public.promo_codes add column if not exists updated_at  timestamptz not null default now();

-- The app is the source of truth for this list and replaces it wholesale, so a
-- draft row with a blank or repeated code must not fail the entire publish.
alter table public.promo_codes alter column code drop not null;
do $$
declare c text;
begin
  for c in
    select conname from pg_constraint
     where conrelid = 'public.promo_codes'::regclass and contype = 'u'
  loop
    execute format('alter table public.promo_codes drop constraint %I', c);
  end loop;
end
$$;
create index if not exists promo_codes_code_idx on public.promo_codes (code);

drop trigger if exists promo_codes_typed on public.promo_codes;
create trigger promo_codes_typed before insert or update on public.promo_codes
  for each row execute function public.apply_typed_columns(
    'ref:id', 'code:code', 'type:type', 'discount:value',
    'description:desc', 'uses:uses');

-- --- Broadcasts (admin announcements -> the customer notification bell) -----
create table if not exists public.broadcasts (
  id         uuid primary key default gen_random_uuid(),
  ref        text,
  title      text,
  message    text,
  audience   text,
  sent_at    text,
  data       jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

drop trigger if exists broadcasts_typed on public.broadcasts;
create trigger broadcasts_typed before insert or update on public.broadcasts
  for each row execute function public.apply_typed_columns(
    'ref:id', 'title:title', 'message:message', 'audience:audience', 'sent_at:sentAt');


-- ============================================================================
-- SECTION 5 — ADMIN-MANAGED RECORDS THAT CONTAIN PERSONAL DATA
--
-- Same shape as Section 4, but these are NOT publicly readable: they hold
-- names, emails, addresses and payment references. Read is restricted to the
-- admin (and, for platform_members, to the member themselves). See the RLS
-- section for exactly how.
-- ============================================================================

-- --- Platform members (Admin Portal → Users, and the member's own dashboard) -
-- Money and points are the profile's job; this row is the admin-facing record:
-- role, status, earn history, certificates, wishlist, notification preferences.
create table if not exists public.platform_members (
  id          uuid primary key default gen_random_uuid(),
  ref         text,                          -- 'USR-001'
  auth_id     uuid references auth.users (id) on delete set null,
  name        text,
  email       text,
  role        text,
  status      text,
  last_login  text,
  phone       text,
  address     text,
  eco_points  integer,
  data        jsonb not null default '{}'::jsonb,
  sort_order  integer not null default 0,
  updated_at  timestamptz not null default now()
);

create index if not exists platform_members_email_idx on public.platform_members (lower(email));

drop trigger if exists platform_members_typed on public.platform_members;
create trigger platform_members_typed before insert or update on public.platform_members
  for each row execute function public.apply_typed_columns(
    'ref:id', 'name:name', 'email:email', 'role:role', 'status:status',
    'last_login:lastLogin', 'phone:phone', 'address:address', 'eco_points:ecoPoints');

-- --- Transactions (Admin Portal → Payments) ---------------------------------
-- `amount` is text: the app authors it as "₱1,250".
create table if not exists public.transactions (
  id         uuid primary key default gen_random_uuid(),
  ref        text,                           -- 'TXN-001'
  order_ref  text,
  customer   text,
  method     text,
  amount     text,
  status     text,
  txn_date   text,
  ref_no     text,
  data       jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

drop trigger if exists transactions_typed on public.transactions;
create trigger transactions_typed before insert or update on public.transactions
  for each row execute function public.apply_typed_columns(
    'ref:id', 'order_ref:orderId', 'customer:customer', 'method:method',
    'amount:amount', 'status:status', 'txn_date:date', 'ref_no:refNo');

-- --- Subscribers (Admin Portal → Subscriptions) -----------------------------
create table if not exists public.subscribers (
  id         uuid primary key default gen_random_uuid(),
  ref        text,                           -- 'SUB-001'
  user_name  text,
  email      text,
  plan       text,
  status     text,
  renewal    text,
  payment    text,
  joined     text,
  ai_scans   integer,
  ai_limit   integer,
  data       jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

drop trigger if exists subscribers_typed on public.subscribers;
create trigger subscribers_typed before insert or update on public.subscribers
  for each row execute function public.apply_typed_columns(
    'ref:id', 'user_name:user', 'email:email', 'plan:plan', 'status:status',
    'renewal:renewal', 'payment:payment', 'joined:joined',
    'ai_scans:aiScans', 'ai_limit:aiLimit');


-- ============================================================================
-- SECTION 6 — COMMUNITY & USER-GENERATED CONTENT
-- Everything a signed-in person creates by using the app.
-- ============================================================================

-- --- Community Forum --------------------------------------------------------
create table if not exists public.forum_posts (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid references public.profiles (id) on delete set null,
  author_name text,
  title       text,
  body        text,
  ref         text,
  data        jsonb,
  created_at  timestamptz not null default now()
);

alter table public.forum_posts add column if not exists ref  text;
alter table public.forum_posts add column if not exists data jsonb;

create unique index if not exists forum_posts_ref_idx
  on public.forum_posts (ref) where ref is not null;
create index if not exists forum_posts_created_idx
  on public.forum_posts (created_at desc);

-- --- AI Plant Doctor scan history -------------------------------------------
create table if not exists public.plant_scans (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles (id) on delete set null,
  image      text,
  disease    text,
  confidence text,
  ref        text,
  data       jsonb,
  created_at timestamptz not null default now()
);

alter table public.plant_scans add column if not exists ref  text;
alter table public.plant_scans add column if not exists data jsonb;
alter table public.plant_scans
  alter column confidence type text using confidence::text;

create unique index if not exists plant_scans_ref_idx
  on public.plant_scans (ref) where ref is not null;
create index if not exists plant_scans_user_idx
  on public.plant_scans (user_id, created_at desc);

-- --- Support tickets --------------------------------------------------------
create table if not exists public.support_tickets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles (id) on delete set null,
  subject    text,
  status     text not null default 'open',
  messages   jsonb default '[]'::jsonb,      -- the reply thread
  ref        text,                           -- 'TKT-441233'
  data       jsonb,                          -- category, priority, attachment…
  created_at timestamptz not null default now()
);

alter table public.support_tickets add column if not exists ref  text;
alter table public.support_tickets add column if not exists data jsonb;

create unique index if not exists support_tickets_ref_idx
  on public.support_tickets (ref) where ref is not null;
create index if not exists support_tickets_user_idx
  on public.support_tickets (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- SITE FEEDBACK — the star-rating panel next to the support and AI Chat
-- buttons (src/SiteFeedbackWidget.js). This rates the APP itself; product
-- reviews are separate and live in product_reviews.
--
-- Unlike every other user table here, `user_id` is nullable on purpose: a
-- visitor can rate the site without an account, and those rows come in with
-- user_id null and user_name 'Guest'. The insert policy below is what allows
-- that, so do not "tighten" it to user_id = auth.uid() alone.
-- ---------------------------------------------------------------------------
create table if not exists public.site_feedback (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles (id) on delete set null,
  user_name  text,                           -- 'Guest' when signed out
  rating     integer not null check (rating between 1 and 5),
  topics     text[] not null default '{}',   -- 'Ease of use', 'Speed', …
  comment    text,
  page       text,                           -- which screen they were on
  ref        text,
  data       jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists site_feedback_ref_idx
  on public.site_feedback (ref) where ref is not null;
create index if not exists site_feedback_created_idx
  on public.site_feedback (created_at desc);
create index if not exists site_feedback_rating_idx
  on public.site_feedback (rating);

-- ---------------------------------------------------------------------------
-- SURPLUS EXCHANGE — farmers list surplus produce, restaurants post demand.
--
-- These are admin-managed like Section 4 (the Admin Portal owns the arrays),
-- but they also carry `owner_id` and allow a signed-in farmer or buyer to post
-- their own row directly. A row posted that way is owned by its author, who is
-- the only non-admin who can change it.
-- ---------------------------------------------------------------------------
create table if not exists public.surplus_listings (
  id          uuid primary key default gen_random_uuid(),
  ref         text,
  owner_id    uuid references auth.users (id) on delete set null,
  product     text,
  category    text,
  quantity    numeric,
  unit        text,
  price       numeric,
  location    text,
  farmer      text,
  status      text,
  best_before text,
  description text,
  data        jsonb not null default '{}'::jsonb,
  sort_order  integer not null default 0,
  updated_at  timestamptz not null default now()
);

drop trigger if exists surplus_listings_typed on public.surplus_listings;
create trigger surplus_listings_typed before insert or update on public.surplus_listings
  for each row execute function public.apply_typed_columns(
    'ref:id', 'product:product', 'category:category', 'quantity:quantity',
    'unit:unit', 'price:price', 'location:location', 'farmer:farmer',
    'status:status', 'best_before:bestBefore', 'description:description');

create table if not exists public.surplus_demands (
  id           uuid primary key default gen_random_uuid(),
  ref          text,
  owner_id     uuid references auth.users (id) on delete set null,
  restaurant   text,
  product      text,
  category     text,
  quantity     numeric,
  unit         text,
  target_price numeric,
  location     text,
  needed_date  text,
  match_score  numeric,
  urgent       boolean,
  verified     boolean,
  status       text,
  data         jsonb not null default '{}'::jsonb,
  sort_order   integer not null default 0,
  updated_at   timestamptz not null default now()
);

drop trigger if exists surplus_demands_typed on public.surplus_demands;
create trigger surplus_demands_typed before insert or update on public.surplus_demands
  for each row execute function public.apply_typed_columns(
    'ref:id', 'restaurant:restaurant', 'product:product', 'category:category',
    'quantity:quantity', 'unit:unit', 'target_price:targetPrice',
    'location:location', 'needed_date:neededDate', 'match_score:matchScore',
    'urgent:urgent', 'verified:verified', 'status:status');

-- --- Course enrolments & event sign-ups -------------------------------------
create table if not exists public.course_enrollments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  course_ref  text not null,
  progress    integer not null default 0,
  status      text not null default 'Enrolled',  -- Enrolled | Completed
  certificate jsonb,
  data        jsonb,
  created_at  timestamptz not null default now(),
  unique (user_id, course_ref)
);

create table if not exists public.event_registrations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  event_ref  text not null,
  status     text not null default 'Registered',
  data       jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, event_ref)
);


-- ============================================================================
-- SECTION 7 — ECOPOINTS
--
-- `profiles.eco_points` is the balance. The two tables here are its history:
-- eco_ledger is every +/- movement, eco_redemptions is the fulfilment queue the
-- Admin Portal works through.
--
-- The important rule: the browser never sends an amount. Every write goes
-- through one of the security-definer functions below, which read the point
-- values out of the admin catalog in site_config ('eco_program') and do the
-- arithmetic here. See src/data/ecoPoints.js for the client half.
-- ============================================================================

create table if not exists public.eco_ledger (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  kind       text not null default 'earn',   -- 'earn' | 'redeem' | 'adjust'
  action     text not null,
  points     integer not null,
  icon       text,
  created_at timestamptz not null default now()
);

create index if not exists eco_ledger_user_idx
  on public.eco_ledger (user_id, created_at desc);

create table if not exists public.eco_redemptions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  reward_id    text not null,
  reward_title text not null,
  points_spent integer not null,
  status       text not null default 'Active',   -- Active | Shipped | Used
  created_at   timestamptz not null default now()
);

create index if not exists eco_redemptions_user_idx
  on public.eco_redemptions (user_id, created_at desc);

-- The balance is derived, never set by hand. profiles_update lets a user edit
-- their own row (name, phone, address) — without this they could also just set
-- eco_points. The balance is only allowed to move from inside the functions
-- below, which run as security definer.
--
-- Consequence worth knowing when you are poking at data by hand:
-- `update profiles set eco_points = 500` will silently do nothing. To hand out
-- points as an admin, call eco_adjust(), or disable the trigger for one tx:
--   begin; alter table public.profiles disable trigger profiles_guard_eco_points;
--   update public.profiles set eco_points = 500 where id = '<user-uuid>'; commit;
create or replace function public.guard_eco_points()
returns trigger
language plpgsql
as $$
begin
  if new.eco_points is distinct from old.eco_points
     and current_setting('eco.allow_balance_write', true) is distinct from 'on' then
    new.eco_points := old.eco_points;   -- silently ignore the attempted change
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_eco_points on public.profiles;
create trigger profiles_guard_eco_points
  before update on public.profiles
  for each row execute function public.guard_eco_points();

-- Award the points the admin attached to `p_action`. The amount comes from the
-- earnRules table in site_config, never from the caller.
create or replace function public.eco_earn(p_action text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_points  integer;
  v_icon    text;
  v_balance integer;
  v_row     public.eco_ledger;
begin
  if auth.uid() is null then
    raise exception 'Not signed in.';
  end if;

  select (rule->>'points')::int, rule->>'icon'
    into v_points, v_icon
    from public.site_config,
         jsonb_array_elements(value->'earnRules') as rule
   where key = 'eco_program'
     and rule->>'action' = p_action
   limit 1;

  if v_points is null then
    raise exception 'No earn rule for "%".', p_action;
  end if;

  perform set_config('eco.allow_balance_write', 'on', true);

  insert into public.eco_ledger (user_id, kind, action, points, icon)
  values (auth.uid(), 'earn', p_action, v_points, coalesce(v_icon, 'Gift'))
  returning * into v_row;

  update public.profiles
     set eco_points = eco_points + v_points
   where id = auth.uid()
  returning eco_points into v_balance;

  return jsonb_build_object(
    'balance', v_balance,
    'action', v_row.action,
    'points', v_row.points,
    'icon', v_row.icon,
    'created_at', v_row.created_at
  );
end;
$$;

-- Checkout: scales with the order total using the admin-configured earnRate
-- (0.1 = 1 point per 10 pesos) instead of a flat rule.
create or replace function public.eco_earn_order(p_total numeric)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_rate    numeric;
  v_points  integer;
  v_balance integer;
  v_row     public.eco_ledger;
begin
  if auth.uid() is null then
    raise exception 'Not signed in.';
  end if;

  select coalesce((value->>'earnRate')::numeric, 0.1)
    into v_rate
    from public.site_config
   where key = 'eco_program';

  v_points := floor(coalesce(p_total, 0) * coalesce(v_rate, 0.1));

  if v_points <= 0 then
    return jsonb_build_object('balance', (select eco_points from public.profiles where id = auth.uid()));
  end if;

  perform set_config('eco.allow_balance_write', 'on', true);

  insert into public.eco_ledger (user_id, kind, action, points, icon)
  values (auth.uid(), 'earn', 'Buy Organic Products', v_points, 'ShoppingCart')
  returning * into v_row;

  update public.profiles
     set eco_points = eco_points + v_points
   where id = auth.uid()
  returning eco_points into v_balance;

  return jsonb_build_object(
    'balance', v_balance,
    'action', v_row.action,
    'points', v_row.points,
    'icon', v_row.icon,
    'created_at', v_row.created_at
  );
end;
$$;

-- Spend points on a reward. Cost lookup, affordability check and deduction all
-- happen in this one transaction, so the client only names the reward.
create or replace function public.eco_redeem(p_reward_id text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_cost      integer;
  v_title     text;
  v_stock     integer;
  v_per_user  integer;
  v_claimed   integer;
  v_mine      integer;
  v_balance   integer;
  v_row       public.eco_redemptions;
begin
  if auth.uid() is null then
    raise exception 'Not signed in.';
  end if;

  -- nullif('') is what makes a cleared admin field mean "no limit" rather than
  -- zero; a stock of 0 would otherwise lock the reward forever.
  select (reward->>'points')::int,
         reward->>'title',
         nullif(reward->>'stock', '')::int,
         nullif(reward->>'limitPerUser', '')::int
    into v_cost, v_title, v_stock, v_per_user
    from public.site_config,
         jsonb_array_elements(value->'rewards') as reward
   where key = 'eco_program'
     and reward->>'id' = p_reward_id
     and coalesce((reward->>'active')::boolean, true)
   limit 1;

  if v_cost is null then
    raise exception 'That reward is not available.';
  end if;

  -- Cancelled redemptions were refunded, so they release their stock again.
  if v_stock is not null and v_stock > 0 then
    select count(*) into v_claimed
      from public.eco_redemptions
     where reward_id = p_reward_id
       and status <> 'Cancelled';

    if v_claimed >= v_stock then
      raise exception 'That reward has been fully claimed.';
    end if;
  end if;

  if v_per_user is not null and v_per_user > 0 then
    select count(*) into v_mine
      from public.eco_redemptions
     where reward_id = p_reward_id
       and user_id = auth.uid()
       and status <> 'Cancelled';

    if v_mine >= v_per_user then
      raise exception 'You have already claimed this reward the maximum % time(s).', v_per_user;
    end if;
  end if;

  select eco_points into v_balance
    from public.profiles
   where id = auth.uid();

  if coalesce(v_balance, 0) < v_cost then
    raise exception 'Not enough EcoPoints to redeem this reward.';
  end if;

  perform set_config('eco.allow_balance_write', 'on', true);

  update public.profiles
     set eco_points = eco_points - v_cost
   where id = auth.uid()
  returning eco_points into v_balance;

  insert into public.eco_ledger (user_id, kind, action, points, icon)
  values (auth.uid(), 'redeem', v_title, -v_cost, 'Gift');

  insert into public.eco_redemptions (user_id, reward_id, reward_title, points_spent)
  values (auth.uid(), p_reward_id, v_title, v_cost)
  returning * into v_row;

  return jsonb_build_object(
    'balance', v_balance,
    'id', v_row.id,
    'reward_id', v_row.reward_id,
    'reward_title', v_row.reward_title,
    'points_spent', v_row.points_spent,
    'status', v_row.status,
    'created_at', v_row.created_at
  );
end;
$$;

-- Admin correction: credit or debit a member by hand, logged like any other
-- movement so it shows up in their Earn History.
create or replace function public.eco_adjust(p_user_id uuid, p_points integer, p_reason text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_balance integer;
begin
  if not public.is_admin() then
    raise exception 'Admins only.';
  end if;

  perform set_config('eco.allow_balance_write', 'on', true);

  update public.profiles
     set eco_points = greatest(eco_points + p_points, 0)
   where id = p_user_id
  returning eco_points into v_balance;

  insert into public.eco_ledger (user_id, kind, action, points, icon)
  values (p_user_id, 'adjust', coalesce(p_reason, 'Points adjustment by the team'),
          p_points, case when p_points >= 0 then 'Award' else 'ShieldCheck' end);

  return jsonb_build_object('balance', v_balance);
end;
$$;

-- Cancel a redemption the team cannot fulfil and hand the points back. The
-- refund, the ledger entry and the status change are one transaction, so there
-- is no window where the member has lost the points AND lost the reward.
-- Re-cancelling an already-cancelled row is a no-op rather than a double refund.
create or replace function public.eco_cancel_redemption(p_id uuid)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_row     public.eco_redemptions;
  v_balance integer;
begin
  if not public.is_admin() then
    raise exception 'Admins only.';
  end if;

  select * into v_row from public.eco_redemptions where id = p_id for update;

  if v_row.id is null then
    raise exception 'That redemption no longer exists.';
  end if;

  if v_row.status = 'Cancelled' then
    return jsonb_build_object(
      'refunded', 0,
      'balance', (select eco_points from public.profiles where id = v_row.user_id));
  end if;

  perform set_config('eco.allow_balance_write', 'on', true);

  update public.profiles
     set eco_points = eco_points + v_row.points_spent
   where id = v_row.user_id
  returning eco_points into v_balance;

  update public.eco_redemptions set status = 'Cancelled' where id = p_id;

  insert into public.eco_ledger (user_id, kind, action, points, icon)
  values (v_row.user_id, 'adjust',
          'Refund: ' || v_row.reward_title, v_row.points_spent, 'Recycle');

  return jsonb_build_object('refunded', v_row.points_spent, 'balance', v_balance);
end;
$$;

-- How many times each reward has been claimed across everyone, so the user's
-- marketplace can show "12 of 50 left" on a limited reward. Customers can only
-- read their OWN eco_redemptions rows, hence security definer — it returns
-- counts per reward and never exposes who claimed what.
create or replace function public.eco_reward_claims()
returns table (reward_id text, claimed bigint)
language sql security definer set search_path = public stable
as $$
  select reward_id, count(*)
    from public.eco_redemptions
   where status <> 'Cancelled'
   group by reward_id;
$$;


-- ============================================================================
-- SECTION 8 — SINGLETON CONFIG
--
-- The three admin-authored objects that are genuinely ONE object rather than a
-- list, so they stay key/value rather than becoming tables:
--   'eco_program'    rewards, earn rules, tiers, badges, referral offer
--   'farm_planner'   region weather + advisories
--   'admin_settings' the Admin Portal's own preferences
--   'content_seeded' the "has an admin published at least once?" flag
-- ============================================================================
create table if not exists public.site_config (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

-- The pre-split blob table. Kept so the migration in Section 10 has something
-- to read, and so a browser still running old code does not error. Nothing
-- writes to it any more.
create table if not exists public.admin_content (
  id         uuid primary key default gen_random_uuid(),
  collection text  not null,
  data       jsonb not null,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists admin_content_collection_idx
  on public.admin_content (collection, sort_order);


-- ============================================================================
-- SECTION 9 — ROW LEVEL SECURITY
--
-- Three tiers:
--   PUBLIC CONTENT   readable by everyone (it drives the marketing and user
--                    screens), writable only by an admin.
--   PERSONAL DATA    readable by its owner and by an admin, nobody else.
--   USER-GENERATED   the owner does what they like with their own rows;
--                    admins moderate.
-- ============================================================================

alter table public.profiles            enable row level security;
alter table public.products            enable row level security;
alter table public.product_reviews     enable row level security;
alter table public.orders              enable row level security;
alter table public.order_items         enable row level security;
alter table public.subscriptions       enable row level security;
alter table public.cart_items          enable row level security;
alter table public.wishlists           enable row level security;
alter table public.advisors            enable row level security;
alter table public.cert_courses        enable row level security;
alter table public.content_items       enable row level security;
alter table public.riders              enable row level security;
alter table public.deliveries          enable row level security;
alter table public.subscription_plans  enable row level security;
alter table public.plant_diseases      enable row level security;
alter table public.events              enable row level security;
alter table public.harvests            enable row level security;
alter table public.promo_codes         enable row level security;
alter table public.broadcasts          enable row level security;
alter table public.platform_members    enable row level security;
alter table public.transactions        enable row level security;
alter table public.subscribers         enable row level security;
alter table public.forum_posts         enable row level security;
alter table public.plant_scans         enable row level security;
alter table public.support_tickets     enable row level security;
alter table public.site_feedback       enable row level security;
alter table public.surplus_listings    enable row level security;
alter table public.surplus_demands     enable row level security;
alter table public.course_enrollments  enable row level security;
alter table public.event_registrations enable row level security;
alter table public.eco_ledger          enable row level security;
alter table public.eco_redemptions     enable row level security;
alter table public.site_config         enable row level security;
alter table public.admin_content       enable row level security;

-- ---------------------------------------------------------------------------
-- Drop the policies from the PREVIOUS version of this schema, by their old
-- names. Policies are permissive and OR together, so a leftover one is not
-- overridden by the stricter policy that replaces it — it silently keeps
-- granting what it always granted. The one that matters most is
-- `admin_content_read`: it was `using (true)`, so leaving it in place would
-- keep that table world-readable no matter what is written below.
-- ---------------------------------------------------------------------------
do $$
declare p record;
begin
  for p in
    select * from (values
      ('products',      'products_read'),
      ('events',        'events_read'),
      ('events',        'events_admin'),
      ('harvests',      'harvests_read'),
      ('harvests',      'harvests_own'),
      ('promo_codes',   'promos_read'),
      ('promo_codes',   'promos_admin'),
      ('site_config',   'site_config_read'),
      ('site_config',   'site_config_admin'),
      ('admin_content', 'admin_content_read'),
      ('admin_content', 'admin_content_admin')
    ) as t(tbl, pol)
  loop
    execute format('drop policy if exists %I on public.%I', p.pol, p.tbl);
  end loop;
end
$$;

-- --- PROFILES: you read/update your own row; admins read all ----------------
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update using (id = auth.uid() or public.is_admin());

-- --- PUBLIC CONTENT: everyone reads, only admins write ----------------------
-- Applied to every table whose rows drive a user-facing screen. Doing it in a
-- loop keeps the eleven tables provably identical rather than eleven
-- near-copies that quietly drift apart.
do $$
declare t text;
begin
  foreach t in array array[
    'products', 'advisors', 'cert_courses', 'content_items', 'riders',
    'deliveries', 'subscription_plans', 'plant_diseases', 'events',
    'harvests', 'promo_codes', 'broadcasts', 'site_config'
  ] loop
    execute format('drop policy if exists %I on public.%I', t || '_public_read', t);
    execute format(
      'create policy %I on public.%I for select using (true)',
      t || '_public_read', t);

    execute format('drop policy if exists %I on public.%I', t || '_admin_write', t);
    execute format(
      'create policy %I on public.%I for all using (public.is_admin()) with check (public.is_admin())',
      t || '_admin_write', t);
  end loop;
end
$$;

-- --- PERSONAL DATA: admin only ----------------------------------------------
-- Members, payments and subscriber lists carry names, emails, addresses and
-- payment references. They are NOT part of the public content tier above.
do $$
declare t text;
begin
  foreach t in array array['transactions', 'subscribers', 'admin_content'] loop
    execute format('drop policy if exists %I on public.%I', t || '_admin_all', t);
    execute format(
      'create policy %I on public.%I for all using (public.is_admin()) with check (public.is_admin())',
      t || '_admin_all', t);
  end loop;
end
$$;

-- platform_members is admin-managed, but a member may read and correct their
-- OWN row — that row is what backs their profile dashboard.
drop policy if exists platform_members_admin on public.platform_members;
create policy platform_members_admin on public.platform_members
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists platform_members_own_read on public.platform_members;
create policy platform_members_own_read on public.platform_members
  for select using (
    auth_id = auth.uid()
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

drop policy if exists platform_members_own_update on public.platform_members;
create policy platform_members_own_update on public.platform_members
  for update using (
    auth_id = auth.uid()
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

-- --- PRODUCT REVIEWS: everyone reads; you write your own; admins moderate ---
drop policy if exists reviews_read on public.product_reviews;
create policy reviews_read on public.product_reviews for select using (true);
drop policy if exists reviews_insert on public.product_reviews;
create policy reviews_insert on public.product_reviews
  for insert with check (author_id = auth.uid());
drop policy if exists reviews_own on public.product_reviews;
create policy reviews_own on public.product_reviews
  for all using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());

-- --- ORDERS -----------------------------------------------------------------
-- A buyer sees/creates their own; admins see all and move them through
-- Pending Approval -> Approved -> Delivered. Status changes to "paid" are done
-- by the payment webhook via the service-role key, which bypasses RLS.
drop policy if exists orders_select on public.orders;
create policy orders_select on public.orders
  for select using (buyer_id = auth.uid() or public.is_admin());
drop policy if exists orders_insert on public.orders;
create policy orders_insert on public.orders
  for insert with check (buyer_id = auth.uid());
drop policy if exists orders_admin on public.orders;
create policy orders_admin on public.orders
  for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists orders_update_own on public.orders;
create policy orders_update_own on public.orders
  for update using (buyer_id = auth.uid()) with check (buyer_id = auth.uid());

drop policy if exists order_items_select on public.order_items;
create policy order_items_select on public.order_items
  for select using (
    exists (select 1 from public.orders o
            where o.id = order_id and (o.buyer_id = auth.uid() or public.is_admin()))
  );
drop policy if exists order_items_insert on public.order_items;
create policy order_items_insert on public.order_items
  for insert with check (
    exists (select 1 from public.orders o where o.id = order_id and o.buyer_id = auth.uid())
  );
drop policy if exists order_items_admin on public.order_items;
create policy order_items_admin on public.order_items
  for all using (public.is_admin()) with check (public.is_admin());

-- --- SUBSCRIPTIONS: user sees own; admins see all. Status set by webhook. ---
drop policy if exists subs_select on public.subscriptions;
create policy subs_select on public.subscriptions
  for select using (user_id = auth.uid() or public.is_admin());

-- --- OWNER-ONLY tables: cart, wishlist, enrolments, registrations -----------
-- Nobody else reads these, not even an admin — they are the user's own working
-- state, and an admin has no screen that needs them.
do $$
declare t text;
begin
  foreach t in array array[
    'cart_items', 'wishlists', 'course_enrollments', 'event_registrations'
  ] loop
    execute format('drop policy if exists %I on public.%I', t || '_own', t);
    execute format(
      'create policy %I on public.%I for all using (user_id = auth.uid()) with check (user_id = auth.uid())',
      t || '_own', t);
  end loop;
end
$$;

-- --- FORUM: everyone reads; you post as yourself; admins moderate -----------
drop policy if exists forum_read on public.forum_posts;
create policy forum_read on public.forum_posts for select using (true);
drop policy if exists forum_insert on public.forum_posts;
create policy forum_insert on public.forum_posts
  for insert with check (author_id = auth.uid());
drop policy if exists forum_own on public.forum_posts;
create policy forum_own on public.forum_posts
  for all using (author_id = auth.uid()) with check (author_id = auth.uid());
drop policy if exists forum_admin on public.forum_posts;
create policy forum_admin on public.forum_posts
  for all using (public.is_admin()) with check (public.is_admin());

-- --- PLANT SCANS / SUPPORT TICKETS: user sees own; admin sees all -----------
drop policy if exists scans_own on public.plant_scans;
create policy scans_own on public.plant_scans
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists tickets_own on public.support_tickets;
create policy tickets_own on public.support_tickets
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- --- SITE FEEDBACK ----------------------------------------------------------
-- Anyone may leave it, including a signed-out visitor — that is the whole point
-- of the widget. A signed-in person must stamp their own id (they cannot file
-- feedback as someone else); a guest sends user_id null.
-- Reading is restricted: your own rows, and admins see everything.
drop policy if exists feedback_insert on public.site_feedback;
create policy feedback_insert on public.site_feedback
  for insert with check (user_id is null or user_id = auth.uid());
drop policy if exists feedback_read on public.site_feedback;
create policy feedback_read on public.site_feedback
  for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists feedback_admin on public.site_feedback;
create policy feedback_admin on public.site_feedback
  for all using (public.is_admin()) with check (public.is_admin());

-- --- SURPLUS EXCHANGE -------------------------------------------------------
-- Public to read (it is a marketplace). An admin manages the whole board; a
-- signed-in user may post their own listing/demand and edit only that one.
do $$
declare t text;
begin
  foreach t in array array['surplus_listings', 'surplus_demands'] loop
    execute format('drop policy if exists %I on public.%I', t || '_read', t);
    execute format('create policy %I on public.%I for select using (true)', t || '_read', t);

    execute format('drop policy if exists %I on public.%I', t || '_admin', t);
    execute format(
      'create policy %I on public.%I for all using (public.is_admin()) with check (public.is_admin())',
      t || '_admin', t);

    execute format('drop policy if exists %I on public.%I', t || '_own', t);
    execute format(
      'create policy %I on public.%I for all using (owner_id = auth.uid()) with check (owner_id = auth.uid())',
      t || '_own', t);
  end loop;
end
$$;

-- --- ECOPOINTS --------------------------------------------------------------
-- A member reads their own ledger and redemptions; admins read all. There is
-- deliberately no insert/update policy for eco_ledger — rows only appear via
-- eco_earn / eco_earn_order / eco_redeem / eco_adjust, which are security
-- definer and bypass RLS.
drop policy if exists eco_ledger_read on public.eco_ledger;
create policy eco_ledger_read on public.eco_ledger
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists eco_redemptions_read on public.eco_redemptions;
create policy eco_redemptions_read on public.eco_redemptions
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists eco_redemptions_admin_update on public.eco_redemptions;
create policy eco_redemptions_admin_update on public.eco_redemptions
  for update using (public.is_admin()) with check (public.is_admin());


-- ============================================================================
-- SECTION 10 — MIGRATION OFF THE OLD `admin_content` BLOB TABLE
--
-- If you published content under the previous schema, your rows are sitting in
-- admin_content as {collection, data, sort_order}. This moves them into the new
-- per-feature tables. It only runs for a target table that is still empty, so
-- re-running this file never duplicates rows or overwrites newer edits.
-- ============================================================================
do $migrate$
declare
  m record;
  moved integer;
begin
  if to_regclass('public.admin_content') is null then
    return;
  end if;

  for m in
    select * from (values
      ('advisors',           'advisors'),
      ('cert_courses',       'cert_courses'),
      ('content_items',      'content_items'),
      ('deliveries',         'deliveries'),
      ('riders',             'riders'),
      ('subscription_plans', 'subscription_plans'),
      ('plant_diseases',     'plant_diseases'),
      ('admin_events',       'events'),
      ('admin_harvests',     'harvests'),
      ('admin_promo_codes',  'promo_codes'),
      ('broadcasts',         'broadcasts'),
      ('platform_users',     'platform_members'),
      ('transactions',       'transactions'),
      ('subscribers',        'subscribers'),
      ('surplus_listings',   'surplus_listings'),
      ('surplus_demands',    'surplus_demands')
    ) as t(collection, target)
  loop
    execute format('select count(*) from public.%I', m.target) into moved;
    if moved > 0 then
      continue;  -- already has data; leave it alone
    end if;

    execute format(
      'insert into public.%I (data, sort_order) '
      'select data, sort_order from public.admin_content '
      ' where collection = %L order by sort_order',
      m.target, m.collection);

    get diagnostics moved = row_count;
    if moved > 0 then
      raise notice 'migrated % row(s) from admin_content/% -> %', moved, m.collection, m.target;
    end if;
  end loop;
end
$migrate$;


-- ============================================================================
-- SECTION 11 — PRODUCT CATALOG SEED
-- Only runs when `products` is empty, so re-running this whole file never wipes
-- a catalog an admin has since edited. To force a full reset back to this list,
-- run supabase/seed.sql instead — that one clears the table first.
-- The `emoji` column holds the icon NAME (string); the app turns it into <Icon/>.
-- ============================================================================
do $seed$
begin
  if exists (select 1 from public.products) then
    raise notice 'products already has rows — seed skipped';
    return;
  end if;

  insert into public.products
    (name, category, price, image, emoji, badge, stock, description, sustainability_badge, rating, review_count)
  values
    ('Heirloom Tomatoes',        'Organic Edibles',  150, '/tomato.png',      'Cherry',  'Best Seller', 'In Stock',  'Freshly harvested, pesticide-free organic tomatoes, perfect for salads and cooking.', 'Eco-Friendly',     4.8, 124),
    ('Basil Grow Kit',           'Herbs',            350, '/basil.png',       'Leaf',    'New',         'Low Stock', 'Everything you need to grow your own aromatic basil at home. Includes seeds, soil, and pot.', 'Sustainable',  4.5,  89),
    ('Sampaguita Starter',       'Floriculture',     200, '/sampaguita.png',  'Flower2', null,          'In Stock',  'Smells wonderful, arrived healthy.', 'Local & Organic', 4.9, 210),
    ('Native Adlai Seeds',       'Native Seeds',     250, '/adlai.png',       'Wheat',   'Organic',     'In Stock',  'High-quality native Adlai seeds, a healthy and sustainable alternative to rice.', 'Local & Organic', 4.7, 56),
    ('Premium Potting Mix',      'Soil Mixes',       280, '/potting_mix.png', 'Sprout',  null,          'Low Stock', 'Nutrient-rich organic potting mix, ideal for all types of plants and urban gardens.', 'Recycled Content', 4.6, 340),
    ('Ergonomic Hand Trowel',    'Gardening Tools',  450, '/trowel.png',      'Shovel',  null,          'In Stock',  'Sturdy and comfortable to hold.', 'Essential', 4.8, 112),
    ('Organic Eggplant',         'Organic Edibles',  120, '/eggplant.png',    'Salad',   null,          'In Stock',  'Fresh, but a bit smaller than expected.', 'Eco-Friendly', 4.3, 45),
    ('Peppermint Seeds',         'Herbs',             90, '/mint.png',        'Sprout',  null,          'In Stock',  'Grows very fast!', 'Sustainable', 4.5, 78),
    ('Compost Booster',          'Soil Mixes',       320, '/compost.png',     'Recycle', 'Eco',         'In Stock',  'Speeds up composting significantly.', 'Eco-Friendly', 4.9, 150),
    ('Urban Farming Starter Kit','Starter Kits',    1200, '/starter_kit.png', 'Package', 'Popular',     'In Stock',  'Everything you need to start your urban farm. Includes varied seeds, tools, and premium soil.', 'Eco-Friendly', 4.9, 88),
    ('Calamansi Seedling',       'Organic Edibles',  180, '/calamansi.png',   'Citrus',  'New',         'In Stock',  'Healthy grafted calamansi seedling, ready to transplant. Bears fruit within 2-3 years.', 'Local & Organic', 4.7, 63),
    ('Organic Carrots',          'Organic Edibles',  140, '/carrot.png',      'Carrot',  null,          'In Stock',  'Sweet, crunchy carrots grown without synthetic pesticides in the Benguet highlands.', 'Eco-Friendly', 4.6, 97),
    ('Lemongrass (Tanglad) Bundle','Herbs',          110, '/lemongrass.png',  'Leaf',    null,          'In Stock',  'Fresh tanglad stalks with roots intact — cook with them or replant in your garden.', 'Local & Organic', 4.8, 132),
    ('Sunflower Seed Pack',      'Floriculture',     130, '/sunflower.png',   'Sun',     'New',         'In Stock',  'Giant sunflower variety, easy to grow and pollinator-friendly. About 20 seeds per pack.', 'Sustainable', 4.6, 71),
    ('Heirloom Black Rice Seeds','Native Seeds',     300, '/black_rice.png',  'Wheat',   'Organic',     'Low Stock', 'Traditional pigmented rice seeds from Cordillera farmers, rich in antioxidants.', 'Local & Organic', 4.9, 41),
    ('Vermicast Organic Fertilizer','Soil Mixes',    260, '/vermicast.png',   'Recycle', 'Eco',         'In Stock',  'Pure worm castings that enrich soil naturally — gentle enough for seedlings.', 'Eco-Friendly', 4.8, 118),
    ('Garden Pruning Shears',    'Gardening Tools',  390, '/pruning_shears.png','Scissors', null,       'In Stock',  'Sharp stainless-steel bypass shears with a comfortable non-slip grip and safety lock.', 'Essential', 4.7, 84),
    ('Okra Seeds',               'Organic Edibles',   95, '/okra.png',        'Sprout',  null,          'In Stock',  'Fast-growing native okra variety that thrives in warm Philippine weather. About 30 seeds per pack.', 'Local & Organic', 4.5, 52),
    ('Malunggay Seedling',       'Organic Edibles',  150, '/malunggay.png',   'Trees',   'Best Seller', 'In Stock',  'Hardy moringa seedling packed with nutrients — a low-maintenance superfood tree for any backyard.', 'Local & Organic', 4.9, 143),
    ('Oregano Plant',            'Herbs',            160, '/oregano.png',     'Leaf',    null,          'In Stock',  'Established Filipino oregano in a nursery pot — aromatic, medicinal, and nearly impossible to kill.', 'Sustainable', 4.7, 66),
    ('Gumamela Cutting',         'Floriculture',     170, '/gumamela.png',    'Flower2', null,          'In Stock',  'Rooted hibiscus cutting in classic red — blooms year-round and attracts butterflies.', 'Local & Organic', 4.6, 58),
    ('Native Mung Bean Seeds',   'Native Seeds',     120, '/mungbean.png',    'Sprout',  'Organic',     'In Stock',  'Locally sourced munggo seeds for sprouting or field planting — a natural soil nitrogen fixer.', 'Local & Organic', 4.6, 74),
    ('Cocopeat Grow Blocks',     'Soil Mixes',       190, '/cocopeat.png',    'Recycle', 'Eco',         'In Stock',  'Compressed coconut coir blocks that expand into a light, water-retaining growing medium.', 'Recycled Content', 4.7, 105),
    ('Drip Irrigation Kit',      'Gardening Tools',  650, '/drip_kit.png',    'Droplet', 'New',         'Low Stock', 'Water-saving drip kit for up to 20 plants — timers, tubing, and drippers included.', 'Eco-Friendly', 4.8, 39),
    ('Herb Garden Starter Kit',  'Starter Kits',     850, '/herb_kit.png',    'Package', 'Popular',     'In Stock',  'Grow basil, mint, and oregano from one box — pots, soil discs, seeds, and a care guide included.', 'Sustainable', 4.8, 92),
    ('Pechay Seeds',             'Organic Edibles',   85, '/pechay.png',      'Salad',   null,          'In Stock',  'Quick-harvest native pechay — ready to eat in just 30 days, perfect for container gardens.', 'Local & Organic', 4.6, 88),
    ('Sili Labuyo Seedling',     'Organic Edibles',  135, '/labuyo.png',      'Flame',   'Hot',         'In Stock',  'Fiery native bird''s eye chili seedling — compact, productive, and thrives in pots.', 'Local & Organic', 4.8, 67),
    ('Pandan Plant',             'Herbs',            145, '/pandan.png',      'Leaf',    null,          'In Stock',  'Fragrant pandan in a nursery pot — fresh leaves on demand for rice, drinks, and desserts.', 'Local & Organic', 4.7, 79),
    ('Waling-Waling Orchid Seedling','Floriculture', 450, '/walingwaling.png','Flower2', 'Rare',        'Low Stock', 'The queen of Philippine orchids — nursery-propagated seedling with care instructions included.', 'Local & Organic', 4.9, 34),
    ('Native Ube Tubers',        'Native Seeds',     220, '/ube.png',         'Sprout',  'Organic',     'In Stock',  'Planting-grade purple yam tubers from local growers — grow your own ube at home.', 'Local & Organic', 4.7, 48),
    ('Carbonized Rice Hull',     'Soil Mixes',       150, '/rice_hull.png',   'Wheat',   'Eco',         'In Stock',  'Upcycled rice hulls that improve drainage and aeration — a Filipino farming classic.', 'Recycled Content', 4.6, 93),
    ('Bamboo Garden Stakes (10 pcs)','Gardening Tools',120,'/bamboo_stakes.png','Trees', null,          'In Stock',  'Sturdy locally sourced bamboo stakes for supporting tomatoes, beans, and climbing vines.', 'Sustainable', 4.5, 61),
    ('Kids Gardening Kit',       'Starter Kits',     950, '/kids_kit.png',    'Gift',    'New',         'In Stock',  'Child-friendly tools, fast-sprouting seeds, and activity cards to get little hands growing.', 'Sustainable', 4.9, 45);
end
$seed$;


-- ============================================================================
-- LAST STEP — MAKE YOURSELF AN ADMIN
--
-- Every admin table stays empty until an admin publishes, and the publish
-- button only exists for a profile with is_admin = true. Sign up in the app
-- first (that creates the auth user and the profile row), then run this with
-- your own address:
--
--   update public.profiles set is_admin = true
--    where id = (select id from auth.users where email = 'admin@ecoequity.com');
--
-- Then: reload the app, Admin Portal → Settings → Database & Backups →
-- "Publish content to database". After that every content table is populated
-- and every later admin edit saves automatically.
--
-- To verify what landed:
--   select 'advisors' t, count(*) from public.advisors
--   union all select 'cert_courses',       count(*) from public.cert_courses
--   union all select 'content_items',      count(*) from public.content_items
--   union all select 'riders',             count(*) from public.riders
--   union all select 'deliveries',         count(*) from public.deliveries
--   union all select 'subscription_plans', count(*) from public.subscription_plans
--   union all select 'plant_diseases',     count(*) from public.plant_diseases
--   union all select 'events',             count(*) from public.events
--   union all select 'harvests',           count(*) from public.harvests
--   union all select 'promo_codes',        count(*) from public.promo_codes
--   union all select 'broadcasts',         count(*) from public.broadcasts
--   union all select 'platform_members',   count(*) from public.platform_members
--   union all select 'transactions',       count(*) from public.transactions
--   union all select 'subscribers',        count(*) from public.subscribers
--   union all select 'surplus_listings',   count(*) from public.surplus_listings
--   union all select 'surplus_demands',    count(*) from public.surplus_demands
--   order by 1;
-- ============================================================================
