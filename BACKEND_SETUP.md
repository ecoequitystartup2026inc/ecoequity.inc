# Backend Setup — Database & Payments

This adds a real database (Supabase / Postgres), user auth, and Philippine
payments (PayMongo — GCash, Maya, GrabPay, card) to the app. Everything is
**additive**: until you add keys, the app runs exactly as before on its sample
data. Wire entities over one at a time.

## What was scaffolded

| File | Purpose |
|------|---------|
| `supabase/schema.sql` | **The whole database** — every table, Row Level Security, and the product seed. Run this one file in Supabase; nothing else is required. |
| `supabase/user-data.sql` | Optional patch: the `ref`/`data` columns + write policies, for a database created before they existed. Already inside `schema.sql`. |
| `supabase/seed.sql` | Optional: **resets** the product catalog to the built-in list (deletes existing products first). |
| `src/supabaseClient.js` | The Supabase client (null until keys are set). |
| `src/data/auth.js` | Sign up / in / out, current user — replaces login state. |
| `src/data/products.js` | **Reference pattern** for moving an entity to the DB. |
| `src/data/adminContent.js` | Admin-authored content (config objects + lists) — already wired. |
| `src/data/checkout.js` | Creates an order + launches PayMongo checkout. |
| `src/data/icons.js` | Icon **name** ⇄ JSX (never store React elements in a DB). |
| `supabase/functions/create-payment/` | Server-side: makes a PayMongo checkout. |
| `supabase/functions/paymongo-webhook/` | Server-side: confirms payment = source of truth. |
| `.env.example` | Which keys go where. |

---

## Step 1 — Create the Supabase project

1. Go to https://supabase.com → New project (free tier is fine). Region: Singapore.
2. **SQL Editor → New query** → paste all of `supabase/schema.sql` → **Run**.
3. **Project Settings → API** → copy the **Project URL** and the **anon public** key.
4. Copy `.env.example` to `.env.local` and paste those two values. Restart `npm start`.

To make yourself an admin: Supabase → **Table Editor → profiles** → set your
row's `is_admin` to `true` (after you've signed up once).

### Step 1b — Publish the content (this is what fills the empty tables)

Running `schema.sql` creates every table and seeds `products`, but the
admin-owned tables are **deliberately empty** until an admin publishes —
`advisors`, `cert_courses`, `content_items`, `deliveries`, `riders`,
`subscription_plans`, `plant_diseases`, `events`, `harvests`, `promo_codes`,
`broadcasts`, `platform_members`, `transactions`, `subscribers`,
`surplus_listings`, `surplus_demands`, plus `site_config`. The app ships with
sample copies of all of them, which is what publishing pushes up.

Once you're an admin: reload the app → **Admin Portal → Settings → Database &
Backups → "Publish content to database"**. That writes the whole set in one go,
and every admin edit after that saves automatically.

`orders`, `support_tickets`, `forum_posts` and `plant_scans` fill up on their
own as **signed-in** users place orders, open tickets, post, and scan plants —
they stay empty while you're browsing logged out.

## Step 2 — Create the PayMongo account

1. Sign up at https://paymongo.com (start in **Test mode**).
2. **Developers → API Keys** → copy the **Secret key** (`sk_test_…`) and
   **Public key** (`pk_test_…`).
3. Put the public key in `.env.local` as `REACT_APP_PAYMONGO_PUBLIC_KEY`.
   The secret key goes ONLY into Supabase (next step) — never in the React app.

## Step 2b — Send confirmation emails from YOUR address (custom SMTP via Resend)

Supabase's built-in email is rate-limited (~2–4/hour) and sends from a generic
address that lands in spam. Plug in Resend (free: 3,000 emails/mo) so signup
confirmations come from your own sender and actually arrive.

1. Sign up at https://resend.com → **API Keys → Create API Key** → copy it.
2. **Domains** in Resend:
   - **For testing now:** skip — you can send from `onboarding@resend.dev`.
   - **For production:** **Add Domain** → add the DNS records Resend shows to your
     domain registrar → wait for "Verified". Then you can send from
     e.g. `noreply@yourdomain.com`.
3. Supabase → **Project Settings → Authentication → SMTP Settings** →
   **Enable Custom SMTP** and fill in:
   - **Host:** `smtp.resend.com`
   - **Port:** `465`
   - **Username:** `resend`
   - **Password:** *(your Resend API key)*
   - **Sender email:** `onboarding@resend.dev` (testing) or `noreply@yourdomain.com`
   - **Sender name:** `EcoEquity`
   - Save.
4. Supabase → **Authentication → Rate Limits** → raise the email limit now that
   you're not on the built-in sender.
5. Supabase → **Authentication → URL Configuration** → set **Site URL** to
   `http://localhost:3000` (add your production URL later) and add it to
   **Redirect URLs**. This is where the confirm link sends users back to.
6. (Optional) **Authentication → Email Templates → Confirm signup** and
   **Reset password** → brand the emails with your logo/colors.

Test: sign up in the app → you should get a branded email from your sender →
click the link → it returns to the app and logs you in.

### Password reset

Nothing extra to switch on — it rides the same sender and the same
**Redirect URLs** list as the confirmation email. The flow:

1. Login screen → **Forgot Password?** → the app calls
   `resetPasswordForEmail()` with the current origin as the return URL.
2. The emailed link comes back to that origin with a one-time recovery
   session; the app opens its "Set a new password" modal and saves it with
   `updateUser({ password })`.
3. Links expire after about an hour and work once. A spent or expired link
   returns an error the app reports as "That email link has expired or was
   already used" — the user just requests another.

Signed-in users can also change their password from **Settings → Security →
Change Password**; that path verifies the current password first, because
Supabase's `updateUser()` never asks for it.

If the link lands on a Supabase error page instead of the app, the origin is
missing from **Redirect URLs**. Minimum password length is set in the app
(`PASSWORD_MIN_LENGTH` in `src/data/auth.js`, 8) — keep it at or above the
project's own minimum under **Authentication → Policies**, or Supabase will
reject passwords the form accepted.

## Step 3 — Deploy the Edge Functions (payments)

Install the Supabase CLI once: `npm i -g supabase` then `supabase login`.

```bash
supabase link --project-ref YOUR-PROJECT-REF

# Secrets (server-side only — never in the browser bundle)
supabase secrets set PAYMONGO_SECRET_KEY=sk_test_xxx
supabase secrets set PAYMONGO_WEBHOOK_SECRET=whsk_xxx   # from step 4

supabase functions deploy create-payment
supabase functions deploy paymongo-webhook --no-verify-jwt
```

## Step 4 — Register the webhook with PayMongo

Point PayMongo at your webhook so it can confirm payments. URL:

```
https://YOUR-PROJECT.supabase.co/functions/v1/paymongo-webhook
```

Create it via the PayMongo API (returns a `secret_key` starting `whsk_` — set it
as `PAYMONGO_WEBHOOK_SECRET` above and redeploy):

```bash
curl https://api.paymongo.com/v1/webhooks \
  -u sk_test_xxx: \
  -d "data[attributes][url]=https://YOUR-PROJECT.supabase.co/functions/v1/paymongo-webhook" \
  -d "data[attributes][events][]=payment.paid" \
  -d "data[attributes][events][]=payment.failed"
```

---

## Step 5 — Wire the app to the data layer (incremental)

The data-layer functions return `null` when Supabase isn't configured, so you
can adopt them without breaking anything. Migrate **products first** as the model:

```js
// in App.js, near where products state is created
import { fetchProducts } from "./data/products";

useEffect(() => {
  fetchProducts().then((rows) => { if (rows) setProducts(rows); });
}, []);
```

Then in AdminPortal, route create/update/delete through
`createProduct` / `updateProduct` / `deleteProduct` instead of mutating state.
Once products work end-to-end, repeat the same `src/data/<entity>.js` pattern
for orders, forum posts, support tickets, subscriptions.

### Admin-authored content — already wired

Everything the Admin Portal authors and the user-facing screens read now goes
through `src/data/adminContent.js` and is **shared across all devices**. This is
the fix for the original problem: with localStorage only, an admin's edit was
visible in that one browser and nobody else's.

**Every feature is its own real table.** These used to share one
`admin_content` table discriminated by a `collection` column, which made them
unbrowsable — opening it in Supabase showed a wall of identical jsonb blobs.
Each one now has its own table with typed, filterable columns:

| App collection | Table |
|---|---|
| `advisors` | `advisors` |
| `cert_courses` | `cert_courses` |
| `content_items` | `content_items` |
| `deliveries` | `deliveries` |
| `riders` | `riders` |
| `subscription_plans` | `subscription_plans` |
| `plant_diseases` | `plant_diseases` |
| `admin_events` | `events` |
| `admin_harvests` | `harvests` |
| `admin_promo_codes` | `promo_codes` |
| `broadcasts` | `broadcasts` |
| `surplus_listings` | `surplus_listings` |
| `surplus_demands` | `surplus_demands` |
| `platform_users` | `platform_members` |
| `transactions` | `transactions` |
| `subscribers` | `subscribers` |

`src/data/adminContent.js` owns that mapping; nothing else needs to know it.

The genuinely singleton objects stay key/value in `site_config`:
`eco_program`, `farm_planner`, `admin_settings`, `content_seeded`.

**How the columns get filled.** Each table keeps the complete React record in a
`data jsonb` column, and a trigger (`apply_typed_columns`) projects the
interesting fields out of that jsonb into the typed columns on every write. So
`data` stays the source of truth — a form can gain a field with no migration and
nothing is ever silently dropped — while the typed columns give you something
real to sort and filter on in the dashboard. A value that won't cast is skipped
rather than failing the write, so one odd entry can never break a publish.

`platform_members`, `transactions` and `subscribers` hold names, emails and
addresses, so unlike the rest they are **not** publicly readable — admins only,
plus a member's own `platform_members` row.

**How it behaves in the app:**

- On load, `App.js` fetches all of them. Anything the database doesn't have
  falls back to the built-in sample data, so the app never renders blank.
- Admin edits are debounced (~0.7s) and pushed back automatically. Writes are
  gated on `isAdmin` because the RLS policy only accepts admin writes — a
  customer's browser would otherwise just collect permission errors.
- localStorage is still written, but it is now only an **offline cache**. The
  database is the source of truth.

**First-run step:** a brand-new project has empty tables. Go to
**Admin Portal → Settings → Database & Backups** and click
**Publish content to database**. That uploads everything currently on screen and
flips a `content_seeded` flag. Until you do this, an empty table is treated as
"nothing seeded yet" and the sample data stays on screen — deliberately, so a
fresh project can't blank your whole site. After publishing, empty means empty.

That panel also tells you at a glance whether the app is connected or still
running on local sample data.

**Still per-browser** (user-generated, needs per-row inserts rather than
whole-collection replace — a different pattern than the one above): surplus
listings and demands, forum posts, orders, support tickets, plant scans, and the
user's own EcoPoints balance / earn / redeem history. `profiles` already has
unused `eco_points` and `tier` columns waiting for that last one.

For auth, replace the `isLoggedIn` / `isAdmin` state with `getCurrentUser()` +
`onAuthChange()` from `src/data/auth.js`.

For checkout, call `startCheckout(...)` from `src/data/checkout.js` on the
CheckoutPage's pay button.

---

## Security notes (important)

- The **anon key** and **PayMongo public key** are safe in the browser.
- The **service_role key** and **PayMongo secret key** must NEVER appear in any
  `REACT_APP_*` var or client code — they live only in Edge Function secrets.
- Row Level Security (in `schema.sql`) is what actually protects data: a buyer
  can only read their own orders, only admins can edit products, etc.
- Payment success is decided by the **webhook**, not the browser redirect — a
  user reaching the "success" URL does not by itself mark an order paid.

> Reminder: `.env.local` is git-ignored by Create React App. Never commit real keys.
