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
| `supabase/functions/ai-chat/` | Server-side: the live AI chat + plant photo scan. |
| `supabase/functions/ai-chat/knowledge.ts` | **What the bot knows** about EcoEquity. Edit this to change its answers. |
| `supabase/ai-chat-usage.sql` | The daily quota counter that caps AI spend. |
| `src/data/aiChat.js` | Calls the `ai-chat` function; throws so the chat can fall back. |
| `supabase/functions/notify/` | Server-side: sends the email/SMS behind Account Settings → Notifications. |
| `supabase/notifications.sql` | The channel switches on `profiles` + the delivery log. |
| `src/data/notifications.js` | Reads/writes the switches; calls the `notify` function. **Message wording lives here.** |
| `supabase/live-chat.sql` | The live-chat thread table + Realtime, behind the AI Chat panel's "Human agent" switch. Run after `schema.sql`. |
| `supabase/support-agents.sql` | Support agents: who they are, whether they're at their desk, and assigning a live chat to one. Run after `live-chat.sql`. |
| `supabase/live-agent-flow.sql` | Pending queue, accept/reject, reassignment, and the conversation a member can leave and come back to. Run after `support-agents.sql`. |
| `supabase/agent-invites.sql` | The agent roster + auto-promotion when an invited address signs up. Run after `live-agent-flow.sql`. |
| `supabase/functions/invite-agent/` | Server-side: creates the account and mails the set-password link. Needs the service-role key, so it cannot be done in the browser. |
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

---

## Step 6 — Turn on the live AI chat (optional)

Until you do this, the chat widget runs on its built-in keyword bot exactly as
before. Nothing breaks if you skip it.

**1. Create the quota table.** SQL Editor → paste `supabase/ai-chat-usage.sql` →
Run. This is what stops one account from spending your whole API balance.

**2. Get an API key.** Either provider works — the function supports both:

| | Where | Secret name | Cost |
|---|---|---|---|
| **Gemini** | aistudio.google.com/app/apikey | `GEMINI_API_KEY` | **Free tier, no card** |
| ChatGPT | platform.openai.com | `OPENAI_API_KEY` | Prepaid credit required |

Gemini is the default because its free tier needs no card — the assistant can go
live before there is any subscription revenue paying for it. The trade-off is
real: the free tier is rate-limited (requests per minute and per day; check
ai.google.dev for current numbers) and the answers are not as sharp as a paid
model. Switch to `openai` when the spend is worth it.

⚠️ A ChatGPT Plus subscription does **not** include API access. The OpenAI API is
prepaid credit, billed per message, bought separately.

**3. Set the secrets and deploy.**

```bash
# Gemini (default) — free tier, no card needed
supabase secrets set AI_PROVIDER=gemini GEMINI_API_KEY=xxx

# …or ChatGPT — same function, no code change
supabase secrets set AI_PROVIDER=openai OPENAI_API_KEY=sk-xxx

# …or BOTH, with one as automatic backup (see "Running both" below)
supabase secrets set AI_PROVIDER=gemini AI_FALLBACK_PROVIDER=openai \
  GEMINI_API_KEY=xxx OPENAI_API_KEY=sk-xxx

supabase functions deploy ai-chat
```

### Running both at once

With `AI_FALLBACK_PROVIDER` set, every request tries the primary first and
silently retries on the other one if it errors — an outage, a spent balance, or
Gemini's free-tier rate limit. The user sees an answer instead of dropping to
the keyword bot.

It costs nothing extra in normal operation: the fallback is only called when the
primary actually fails, and the user's daily quota is counted once per message
no matter how many providers it took to answer.

Gemini primary with ChatGPT as backup is the sensible pairing — free for the
common case, paid only when the free tier is exhausted. Swap the two values to
reverse it.

**4. Set a spend cap** if you are on a paid provider (OpenAI: Settings → Limits,
$10–20 while testing). If something goes wrong, requests fail and the chat falls
back to the keyword bot instead of running up a bill. On Gemini's free tier
there is nothing to cap — you hit a rate limit instead of a charge.

### Tuning it

| Secret | Default | What it does |
|---|---|---|
| `AI_PROVIDER` | `gemini` | `gemini` or `openai` |
| `AI_FALLBACK_PROVIDER` | *(unset)* | The other provider, used only when the primary errors |
| `AI_MODEL` | `gemini-flash-latest` | Model for the primary provider. The alias tracks the current Flash release; pin one (e.g. `gemini-3.6-flash`) for predictable behaviour |
| `AI_FALLBACK_MODEL` | `gpt-4o-mini` | Model for the fallback provider |
| `AI_DAILY_LIMIT_FREE` | `100` | Messages/day for users with no active subscription |
| `AI_DAILY_LIMIT_PAID` | `300` | Messages/day for users with an active subscription |

The free cap is deliberately generous while the assistant is a free trial and
the paid plans cannot be bought yet. It is not a paywall — it is the brake on a
shared API key, so one scripted account cannot burn the whole Gemini free-tier
quota and take the assistant down for everybody. Lower it when plans go live.

**A secret that is already set overrides the default in the code.** Editing
`index.ts` and redeploying will NOT change the limit if
`AI_DAILY_LIMIT_FREE` exists as a secret — the secret always wins. Check what
is set under **Project Settings → Edge Functions → Secrets** (or
`supabase secrets list`); to fall back to the default above, **delete** the
secret rather than blanking it. An empty value is `Number("")` → `0`, which
blocks every message.

### How it degrades

The chat **never** breaks. `src/data/aiChat.js` throws on any failure and
`AIChatInterface` catches it, so a missing key, a dead function, a spent quota,
or a signed-out visitor all quietly fall back to the keyword bot. Escalation to
a human agent is always handled locally and never depends on the model.

Signed-out visitors deliberately never reach the API — an anonymous endpoint
that costs money per request is the one thing not worth shipping.

### Testing before you deploy

```bash
supabase functions serve ai-chat --env-file supabase/.env.local
```

Then run the app, log in, and open the chat, watching the terminal for errors.

Once deployed, the logs are **dashboard-only**: Supabase → Edge Functions →
ai-chat → Logs. There is no `supabase functions logs` subcommand — the CLI's
`functions` command only has list/delete/download/deploy/new/serve. The line to
look for is `ai-chat failed:`, which carries the real exception; the browser
only ever sees the sanitized "The AI assistant is unavailable right now."

Secrets are stored as a plain SHA-256 of their value, so `supabase secrets list`
can tell you whether the key you are holding is the key that is deployed,
without revealing either:

```bash
printf '%s' "$YOUR_KEY" | shasum -a 256   # compare to the `value` column
```

To typecheck the function without deploying:

```bash
deno check --node-modules-dir=none supabase/functions/ai-chat/index.ts
```

The `--node-modules-dir=none` matters. Without it Deno sees this repo's React
`node_modules/`, decides npm packages must be installed there, and reports a
bogus *"Could not find a matching package for 'npm:openai'"*. The flag makes it
resolve `npm:` specifiers from the registry, which is what the Supabase Edge
runtime does anyway.

---

## Step 7 — Turn on notifications (email & SMS)

This is what makes **Account Settings → Notifications** real: the two switches
stop being a saved preference nobody reads, and start deciding whether a member
actually gets told when their order moves or support answers their ticket.

Skip this and nothing breaks. The switches still save to the database, the app
still runs, and every send is recorded as `skipped` with the reason.

### Why the switches live in Postgres

The send is decided **server-side**, by the Edge Function, at the moment an
admin approves an order. The browser that flipped the switch is long gone. A
preference the sender cannot read is not a preference — so `notify_email` and
`notify_sms` are columns on `profiles`, and the function reads the live row.
Nothing in the browser is ever trusted to decide whether a message goes out.

**1. Run the SQL.** SQL Editor → paste `supabase/notifications.sql` → Run. Safe
to re-run. It adds:

- `profiles.notify_email` (default **on**) and `profiles.notify_sms`
  (default **off** — SMS costs money per message and needs a verified phone,
  so it is opt-in)
- `notification_log` — every attempt, sent/skipped/failed alike, readable by the
  member it was sent to and by admins
- `notification_target()` — the recipient lookup the function uses, kept
  `security definer` so the `auth.users` read stays server-side

**2. Deploy the function.**

```bash
supabase functions deploy notify
```

**3. Set the secrets for the channels you want.** Both are optional and
independent — email works with no SMS provider, and vice versa.

| | Provider | Secrets | Cost |
|---|---|---|---|
| **Email** | Resend (already used for auth mail in Step 2b) | `RESEND_API_KEY`, `NOTIFY_FROM` | Free: 3,000/mo |
| **SMS** | Semaphore (Philippines) | `SMS_PROVIDER=semaphore`, `SEMAPHORE_API_KEY` | ~₱0.50–0.70/text, prepaid credits |
| SMS | Twilio | `SMS_PROVIDER=twilio`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` | Per-message, card required |

```bash
# Email — reuse the Resend key from Step 2b
supabase secrets set RESEND_API_KEY=re_xxx \
  NOTIFY_FROM="EcoEquity <onboarding@resend.dev>"

# SMS — Philippines
supabase secrets set SMS_PROVIDER=semaphore SEMAPHORE_API_KEY=xxx
```

Semaphore is suggested over Twilio for a PH audience: it is domestic, sells
prepaid credits without a subscription, and skips the sender-ID registration
Twilio requires for Philippine numbers. Leave `SEMAPHORE_SENDER_NAME` unset to
use your account's default sender — sending a blank one is rejected outright.

`NOTIFY_FROM` can stay on `onboarding@resend.dev` while testing. Move it to your
own verified domain before production or the mail lands in spam.

**4. Test it.** Log in as a normal member → **Account Settings → Notifications**
→ **Send a test**. The result line reports each channel separately:

| What you see | What it means |
|---|---|
| `Email: sent · SMS: skipped (SMS updates switched off)` | Working. The switch was honoured. |
| `Email: skipped (RESEND_API_KEY not set)` | Step 3 not done for that channel. |
| `Email: skipped (email notifications switched off)` | The switch is off — that is the feature working. |
| `Email: failed (…)` | The provider rejected it; the detail is theirs. |
| `SMS: skipped (no phone number on file)` | Add a phone under **My Profile** first. |

Every one of those lines is also a row in `notification_log`.

### What sends, and when

| Trigger | Where | Event slug |
|---|---|---|
| Admin approves / disapproves an order | Admin Portal → Orders | `order_status` |
| Admin changes an order's status | Admin Portal → Orders → Edit | `order_status` |
| Admin replies to a support ticket | Admin Portal → Support | `ticket_reply` |
| Member presses "Send a test" | Account Settings → Notifications | `test` |

The wording for each lives in `src/data/notifications.js`
(`orderStatusMessage`, `ticketReplyMessage`) — one place, so the email and the
SMS of the same event cannot drift apart.

**Adding a new trigger** is two lines. Build a message, hand it to the function,
and let it decide the channels:

```js
import { notifyUser } from "../data/notifications";

notifyUser({
  to: member.email,
  event: "event_reminder",
  subject: "Your workshop is tomorrow",
  message: "Seed-saving basics, 9am at the community hall.",
  sms: "EcoEquity: seed-saving workshop tomorrow, 9am.",   // optional shorter text
}).catch(console.error);
```

Never check the member's preference yourself before calling — the function reads
the live one. A cached copy in the browser is exactly how people get mail they
switched off.

### Security

- The endpoint requires a signed-in caller. An open one is a spam relay for your
  domain.
- An **admin** may notify anybody; a **member** may only notify themselves. That
  is what makes the "Send a test" button safe to ship.
- `notification_log` has a read policy and no write policy at all — only the
  function (service role) writes it, so a browser cannot forge a delivery record.
- Provider keys are Edge Function secrets and never enter the browser bundle.

### Guest checkouts

An order placed by someone with no account has an email and no stored
preference. They get the email — they gave the address for this order — and
never an SMS, because nobody opted in.

### Typechecking before deploy

```bash
deno check --node-modules-dir=none supabase/functions/notify/index.ts
```

Same `--node-modules-dir=none` reasoning as the AI function above. Logs are
dashboard-only: Supabase → Edge Functions → notify → Logs.
