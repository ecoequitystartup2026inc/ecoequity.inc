-- ============================================================================
-- EcoEquity — Database schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query).
-- Safe to re-run: uses "if not exists" and "drop policy if exists".
-- ============================================================================

-- ---------------------------------------------------------------------------
-- PROFILES  (extends Supabase auth.users — one row per registered user)
-- Replaces App.js state: loggedInUser / isAdmin / ecoPoints / currentTier / address / phone
-- ---------------------------------------------------------------------------
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
  -- Works for both email signup (full_name) and Google OAuth (name / avatar_url).
  insert into public.profiles (id, full_name, profile_pic)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- PRODUCTS  (marketplace catalog) — replaces initialProducts / products state
-- NOTE: store the icon as a NAME string ("emoji" column), never a React element.
--       The React layer maps the name -> <Icon/> at render time (see hydrateIcons).
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id                  uuid primary key default gen_random_uuid(),
  name                text    not null,
  category            text,
  price               numeric(10,2) not null default 0,
  image               text,
  emoji               text,                 -- icon NAME, e.g. 'Cherry' / 'Leaf'
  badge               text,
  stock               text    default 'In Stock',
  description         text,
  sustainability_badge text,
  rating              numeric(2,1) default 0,
  review_count        integer default 0,
  farmer_id           uuid references public.profiles (id) on delete set null,
  created_at          timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- PRODUCT REVIEWS  (was the nested `reviews` array on each product)
-- ---------------------------------------------------------------------------
create table if not exists public.product_reviews (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid references public.products (id) on delete cascade,
  author_id  uuid references public.profiles (id) on delete set null,
  user_name  text,
  rating     integer check (rating between 1 and 5),
  comment    text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- ORDERS + ORDER ITEMS  — replaces orders / cartItems state
-- status: pending_payment -> paid -> shipped -> delivered (or cancelled)
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  buyer_id       uuid references public.profiles (id) on delete set null,
  status         text not null default 'pending_payment',
  total          numeric(10,2) not null default 0,
  promo_code     text,
  payment_ref    text,                      -- PayMongo payment/intent id
  shipping_address text,
  created_at     timestamptz not null default now()
);

create table if not exists public.order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  name       text,                          -- snapshot at purchase time
  qty        integer not null default 1,
  price      numeric(10,2) not null default 0
);

-- ---------------------------------------------------------------------------
-- SUBSCRIPTIONS  — AI Data Subscription / Plant Doctor premium
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references public.profiles (id) on delete cascade,
  plan                text not null,        -- e.g. 'ai_data', 'plant_doctor_pro'
  status              text not null default 'inactive', -- active | inactive | past_due | cancelled
  payment_ref         text,                 -- PayMongo subscription id
  current_period_end  timestamptz,
  created_at          timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Remaining content tables (mirror your existing user-facing sections).
-- Kept lean; expand columns as needed.
-- ---------------------------------------------------------------------------
create table if not exists public.forum_posts (
  id         uuid primary key default gen_random_uuid(),
  author_id  uuid references public.profiles (id) on delete set null,
  author_name text,
  title      text,
  body       text,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  event_date  timestamptz,
  location    text,
  created_at  timestamptz not null default now()
);

create table if not exists public.harvests (
  id         uuid primary key default gen_random_uuid(),
  farmer_id  uuid references public.profiles (id) on delete set null,
  crop       text,
  quantity   text,
  icon_name  text,                          -- icon NAME, not JSX
  created_at timestamptz not null default now()
);

create table if not exists public.plant_scans (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles (id) on delete set null,
  image      text,
  disease    text,
  confidence numeric,
  created_at timestamptz not null default now()
);

create table if not exists public.support_tickets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles (id) on delete set null,
  subject    text,
  status     text not null default 'open',
  messages   jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.promo_codes (
  id         uuid primary key default gen_random_uuid(),
  code       text unique not null,
  discount   numeric not null default 0,    -- percent or peso, your convention
  expires_at timestamptz,
  active     boolean not null default true
);

-- ============================================================================
-- ROW LEVEL SECURITY
-- Rule of thumb: public content is readable by everyone; writes are restricted
-- to the owner; admins (profiles.is_admin = true) can do everything.
-- ============================================================================

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

alter table public.profiles        enable row level security;
alter table public.products        enable row level security;
alter table public.product_reviews enable row level security;
alter table public.orders          enable row level security;
alter table public.order_items     enable row level security;
alter table public.subscriptions   enable row level security;
alter table public.forum_posts     enable row level security;
alter table public.events          enable row level security;
alter table public.harvests        enable row level security;
alter table public.plant_scans     enable row level security;
alter table public.support_tickets enable row level security;
alter table public.promo_codes     enable row level security;

-- PROFILES: you can read/update your own row; admins read all.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update using (id = auth.uid() or public.is_admin());

-- PRODUCTS: everyone reads; only admins write.
drop policy if exists products_read on public.products;
create policy products_read on public.products for select using (true);
drop policy if exists products_admin_write on public.products;
create policy products_admin_write on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- PRODUCT REVIEWS: everyone reads; logged-in users add their own.
drop policy if exists reviews_read on public.product_reviews;
create policy reviews_read on public.product_reviews for select using (true);
drop policy if exists reviews_insert on public.product_reviews;
create policy reviews_insert on public.product_reviews
  for insert with check (author_id = auth.uid());

-- ORDERS: a buyer sees/creates their own; admins see all. Status changes to
-- "paid" are done by the webhook via the service-role key (bypasses RLS).
drop policy if exists orders_select on public.orders;
create policy orders_select on public.orders
  for select using (buyer_id = auth.uid() or public.is_admin());
drop policy if exists orders_insert on public.orders;
create policy orders_insert on public.orders
  for insert with check (buyer_id = auth.uid());

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

-- SUBSCRIPTIONS: user sees own; admins see all. Status set by webhook.
drop policy if exists subs_select on public.subscriptions;
create policy subs_select on public.subscriptions
  for select using (user_id = auth.uid() or public.is_admin());

-- FORUM: everyone reads; logged-in users post their own; admins moderate.
drop policy if exists forum_read on public.forum_posts;
create policy forum_read on public.forum_posts for select using (true);
drop policy if exists forum_insert on public.forum_posts;
create policy forum_insert on public.forum_posts
  for insert with check (author_id = auth.uid());
drop policy if exists forum_admin on public.forum_posts;
create policy forum_admin on public.forum_posts
  for all using (public.is_admin()) with check (public.is_admin());

-- EVENTS / PROMO CODES: everyone reads; only admins write.
drop policy if exists events_read on public.events;
create policy events_read on public.events for select using (true);
drop policy if exists events_admin on public.events;
create policy events_admin on public.events
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists promos_read on public.promo_codes;
create policy promos_read on public.promo_codes for select using (active = true or public.is_admin());
drop policy if exists promos_admin on public.promo_codes;
create policy promos_admin on public.promo_codes
  for all using (public.is_admin()) with check (public.is_admin());

-- HARVESTS: everyone reads; farmer manages own; admin all.
drop policy if exists harvests_read on public.harvests;
create policy harvests_read on public.harvests for select using (true);
drop policy if exists harvests_own on public.harvests;
create policy harvests_own on public.harvests
  for all using (farmer_id = auth.uid() or public.is_admin())
  with check (farmer_id = auth.uid() or public.is_admin());

-- PLANT SCANS / SUPPORT TICKETS: user sees own; admin sees all.
drop policy if exists scans_own on public.plant_scans;
create policy scans_own on public.plant_scans
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists tickets_own on public.support_tickets;
create policy tickets_own on public.support_tickets
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());
