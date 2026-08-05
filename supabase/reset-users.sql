-- ============================================================================
-- RESET USERS — wipe every account so signup starts from a clean slate.
-- Run in Supabase -> SQL Editor. DESTRUCTIVE and irreversible.
--
-- Delete from auth.users, NOT from public.profiles. The profile's id is a
-- foreign key to auth.users with `on delete cascade` (schema.sql SECTION 2),
-- so removing the auth user removes the profile with it. Doing it the other
-- way round leaves an orphan login that can never sign up again ("User
-- already registered") and has no profile row to log in against.
--
-- After this runs, sign up again normally. The on_auth_user_created trigger
-- rebuilds the profile row, and ecoequity.inc2026@gmail.com is born an admin
-- again via is_owner_email() (admin-roles.sql).
-- ============================================================================


-- ----------------------------------------------------------------------------
-- STEP 0 — look before you delete. Run this on its own first.
-- ----------------------------------------------------------------------------
select id, email, created_at, last_sign_in_at
from auth.users
order by created_at;


-- ----------------------------------------------------------------------------
-- STEP 1 — delete the accounts. This is the whole reset.
--
-- Cascades automatically (all `on delete cascade` off auth.users or profiles):
--   profiles, cart_items, wishlists, course_enrollments, event_registrations,
--   eco_ledger, eco_redemptions, subscriptions
-- Sessions and identities go too, so anyone still logged in is signed out on
-- their next token refresh.
-- ----------------------------------------------------------------------------

-- ALL accounts:
delete from auth.users;

-- ...or keep the owner and drop everyone else — swap the line above for this:
-- delete from auth.users where not public.is_owner_email(email);

-- ...or a single account:
-- delete from auth.users where lower(email) = lower('someone@example.com');


-- ----------------------------------------------------------------------------
-- STEP 2 (OPTIONAL) — clear what STEP 1 leaves behind.
--
-- These tables reference the user with `on delete set null`, so the ROWS
-- SURVIVE with a null owner: old forum posts, tickets and orders would still
-- be visible after the reset. Run this section only if you want the content
-- gone as well, not just the accounts.
-- ----------------------------------------------------------------------------

-- Admin Portal -> Users list. Its auth_id is set to null, not deleted, so
-- stale member rows linger in the portal unless you clear them.
delete from public.platform_members;

-- User-generated content.
delete from public.forum_posts;
delete from public.plant_scans;
delete from public.support_tickets;
delete from public.site_feedback;
delete from public.surplus_listings;
delete from public.surplus_demands;
delete from public.product_reviews;

-- Orders (order_items cascade from orders).
delete from public.orders;

-- NOT touched on purpose — this is your admin-authored catalog, not user data:
--   products, subscription_plans, events, cert_courses, advisors, riders,
--   plant_diseases, promo_codes, broadcasts, content_items, admin_content
-- Re-run seed.sql only if you actually want that catalog rebuilt too.


-- ----------------------------------------------------------------------------
-- STEP 3 — confirm the slate is clean. Both counts should be 0.
-- ----------------------------------------------------------------------------
select (select count(*) from auth.users)       as auth_users,
       (select count(*) from public.profiles)  as profiles;
