-- ============================================================================
-- ADMIN ROLES — who gets the Admin Portal, and who doesn't.
-- Run in Supabase → SQL Editor, AFTER schema.sql. Safe to re-run.
--
-- What this fixes: profiles.is_admin already defaults to false, but
-- profiles_update (schema.sql) lets a signed-in user update their OWN row —
-- including is_admin. So any member could promote themselves to admin with one
-- API call. This locks the flag down and makes one address the only admin.
--
-- The admin address is the single literal inside is_owner_email() below —
-- change it there and re-run this file if it ever moves.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. The one address allowed to be an admin: ecoequity.inc2026@gmail.com
--
-- Gmail ignores dots in the local part, so ecoequity.inc2026@gmail.com and
-- ecoequityinc2026@gmail.com are the same mailbox — but Supabase stores the
-- address exactly as it was typed at signup. Stripping dots before comparing
-- means either spelling is recognised as the owner.
-- ----------------------------------------------------------------------------
-- Lower-cased, with dots removed from the local part.
create or replace function public.normalize_email(p_email text)
returns text
language sql
immutable
as $$
  select replace(split_part(lower(coalesce(p_email, '')), '@', 1), '.', '')
         || '@' || split_part(lower(coalesce(p_email, '')), '@', 2);
$$;

-- Both sides go through normalize_email(), so the address below can be written
-- exactly as you type it — with or without the dot — and still match.
create or replace function public.is_owner_email(p_email text)
returns boolean
language sql
immutable
as $$
  select public.normalize_email(p_email)
       = public.normalize_email('ecoequity.inc2026@gmail.com');
$$;


-- ----------------------------------------------------------------------------
-- 2. Nobody may write is_admin through the API.
-- Same shape as profiles_guard_eco_points in schema.sql: the change is silently
-- reverted rather than raising, so an ordinary profile save (name, phone,
-- address) still succeeds — it just can't carry a promotion along with it.
-- The only way past it is set_admin() below, which flips the escape hatch.
-- ----------------------------------------------------------------------------
create or replace function public.guard_admin_flag()
returns trigger
language plpgsql
as $$
begin
  if new.is_admin is distinct from old.is_admin
     and current_setting('eco.allow_admin_write', true) is distinct from 'on' then
    new.is_admin := old.is_admin;   -- ignore the attempted change
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_admin_flag on public.profiles;
create trigger profiles_guard_admin_flag
  before update on public.profiles
  for each row execute function public.guard_admin_flag();


-- ----------------------------------------------------------------------------
-- 3. New signups are always members.
-- Replaces handle_new_user() from schema.sql: same profile row, but is_admin is
-- now written explicitly instead of leaning on the column default, and only the
-- owner address is born an admin. Everyone else lands on the member dashboard.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- full_name comes from the signup form; the photo is set later in Settings.
  insert into public.profiles (id, full_name, profile_pic, is_admin)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    null,
    public.is_owner_email(new.email)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ----------------------------------------------------------------------------
-- 4. The supported way to promote/demote, by email.
-- Callable from the SQL Editor (no auth.uid(), runs as the postgres role) or by
-- an existing admin. A member calling it through the API gets refused.
-- ----------------------------------------------------------------------------
create or replace function public.set_admin(p_email text, p_is_admin boolean default true)
returns table (email text, is_admin boolean)
language plpgsql
security definer set search_path = public
as $$
declare
  v_id uuid;
begin
  if auth.uid() is not null and not public.is_admin() then
    raise exception 'Only an admin can change admin rights';
  end if;

  select u.id into v_id from auth.users u where lower(u.email) = lower(p_email);
  if v_id is null then
    raise exception 'No account with email %. Sign up in the app first.', p_email;
  end if;

  perform set_config('eco.allow_admin_write', 'on', true);  -- this tx only
  update public.profiles set is_admin = p_is_admin where id = v_id;

  return query
    select u.email::text, p.is_admin
      from public.profiles p join auth.users u on u.id = p.id
     where p.id = v_id;
end;
$$;

-- EXECUTE is granted to PUBLIC by default; take it back before handing it to
-- signed-in users only (where the is_admin() check above applies).
revoke execute on function public.set_admin(text, boolean) from public, anon;
grant  execute on function public.set_admin(text, boolean) to authenticated;


-- ----------------------------------------------------------------------------
-- 5. One-time repair — make the owner the ONLY admin.
-- Demotes every other profile, including accounts promoted by hand earlier.
-- ----------------------------------------------------------------------------
do $$
begin
  perform set_config('eco.allow_admin_write', 'on', true);

  update public.profiles p
     set is_admin = public.is_owner_email(u.email)
    from auth.users u
   where u.id = p.id
     and p.is_admin is distinct from public.is_owner_email(u.email);
end
$$;


-- ----------------------------------------------------------------------------
-- 6. Check the result — expect exactly one row with is_admin = true, and it is
-- ecoequity.inc2026@gmail.com. If that address isn't listed at all, it hasn't
-- signed up yet: create it in the app, and the trigger in step 3 makes it an
-- admin automatically — no need to re-run this file.
-- ----------------------------------------------------------------------------
select u.email, p.full_name, p.is_admin, p.created_at
  from public.profiles p
  join auth.users u on u.id = p.id
 order by p.is_admin desc, p.created_at;

-- Later, to grant or revoke by hand:
--   select * from public.set_admin('someone@example.com', true);
--   select * from public.set_admin('someone@example.com', false);
