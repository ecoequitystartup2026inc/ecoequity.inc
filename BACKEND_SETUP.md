# Backend Setup — Database & Payments

This adds a real database (Supabase / Postgres), user auth, and Philippine
payments (PayMongo — GCash, Maya, GrabPay, card) to the app. Everything is
**additive**: until you add keys, the app runs exactly as before on its sample
data. Wire entities over one at a time.

## What was scaffolded

| File | Purpose |
|------|---------|
| `supabase/schema.sql` | All tables + Row Level Security. Run once in Supabase. |
| `src/supabaseClient.js` | The Supabase client (null until keys are set). |
| `src/data/auth.js` | Sign up / in / out, current user — replaces login state. |
| `src/data/products.js` | **Reference pattern** for moving an entity to the DB. |
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

## Step 2 — Create the PayMongo account

1. Sign up at https://paymongo.com (start in **Test mode**).
2. **Developers → API Keys** → copy the **Secret key** (`sk_test_…`) and
   **Public key** (`pk_test_…`).
3. Put the public key in `.env.local` as `REACT_APP_PAYMONGO_PUBLIC_KEY`.
   The secret key goes ONLY into Supabase (next step) — never in the React app.

## Step 2b — Enable Google login (optional)

> **Current state: the Google button is local/UI-only.** Clicking it opens an
> in-app account chooser (`LOCAL_GOOGLE_ACCOUNTS` in `src/data/auth.js`) and logs
> you in from data built in the browser — no Google Cloud Console project, no
> Supabase provider, no redirect. Sessions are not persisted, so a page reload
> signs you out. Everything below is what to do when you're ready to go live.
>
> To switch it on: in `App.js`, make `handleSocialAuth` call `signInWithGoogle()`
> (still exported from `src/data/auth.js`) instead of opening the chooser, and
> delete the chooser modal + `handleGoogleAccountPick` /
> `handleGoogleOtherAccount`. Nothing else changes — `localGoogleUser()` already
> returns the same shape the real flow hands to `applySession()`.

Supabase Auth handles the OAuth flow; you just register the app with Google.

1. **Google Cloud Console** → create/select a project →
   **APIs & Services → OAuth consent screen** → External → fill app name, support
   email, your domain. Add yourself as a test user while in "Testing" mode.
2. **Credentials → Create Credentials → OAuth client ID → Web application**.
   - **Authorized JavaScript origins:** `http://localhost:3000` and your prod URL.
   - **Authorized redirect URI:** copy this exact value from
     Supabase → **Authentication → Providers → Google** (looks like
     `https://YOUR-PROJECT.supabase.co/auth/v1/callback`).
3. Copy the generated **Client ID** and **Client secret**.
4. Supabase → **Authentication → Providers → Google** → toggle ON → paste the
   Client ID + secret → Save.
5. Supabase → **Authentication → URL Configuration** → set **Site URL** and add
   every origin the app runs on to **Redirect URLs**
   (`http://localhost:3000` plus your production URL). `signInWithGoogle()`
   passes `window.location.origin` as `redirectTo`, and Supabase refuses any
   value that isn't on this list — the most common cause of "the Google button
   does nothing".

That's it — no key goes in the React app. Call `signInWithGoogle()` from your
login button (see `src/data/auth.js`):

```js
import { signInWithGoogle } from "./data/auth";
<button onClick={() => signInWithGoogle()}>Continue with Google</button>
```

The browser redirects to Google and back; `onAuthChange()` then sees the session,
and the `profiles` row (name + avatar) is created by the same signup trigger.

## Step 2c — Send confirmation emails from YOUR address (custom SMTP via Resend)

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
6. (Optional) **Authentication → Email Templates → Confirm signup** → brand the
   email with your logo/colors.

Test: sign up in the app → you should get a branded email from your sender →
click the link → it returns to the app and logs you in.

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
for orders, forum posts, events, harvests, support tickets, subscriptions.

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
