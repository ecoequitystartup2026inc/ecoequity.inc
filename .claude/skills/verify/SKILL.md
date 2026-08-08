---
name: verify
description: Build, launch, and browser-drive this CRA app to verify changes at the UI surface.
---

# Verify recipe — EcoEquity CRA app

## Launch (demo mode, no Supabase)

A real `.env.local` with Supabase keys exists — you MUST blank them or login
hits real auth and fails with "Invalid login credentials":

```bash
BROWSER=none PORT=3457 REACT_APP_SUPABASE_URL= REACT_APP_SUPABASE_ANON_KEY= npm start
```

Wait for `webpack compiled` (~30–60s). Poll `curl http://localhost:3457`.

## Drive (Playwright, install in scratchpad)

```bash
npm install playwright@1.61.1 && npx playwright install chromium
```

- **Login (demo mode accepts any credentials):** fill
  `input[placeholder="Username or email"]` and `input[type="password"]`,
  click `button:has-text("Login")`, then wait ~2.2s (simulated 1.5s delay).
  Signing in lands on Home with nothing over it — the profile dashboard no
  longer auto-opens (changed 2026-08-02; only a first signup opens it). To
  reach it, click the avatar chip in the navbar (~1388,85 at 1440w) and pick
  **Manage Account**; `button[aria-label="Change profile photo"]` (the
  sidebar avatar, which since 2026-08-03 opens an upload/remove menu) is the
  reliable "dashboard is open" probe. Close it with the round × top-right.
  Login / Sign Up are one framed two-panel screen; switch between them with
  `button:has-text("Create an account")` / `button:has-text("Sign in")`.
  Admin: `admin@ecoequity.com` / `Ecoequity` → lands on Admin Portal.
- **Navigation:** no hamburger — it was removed 2026-08-02. Every item
  sits inline in the navbar row (`.nav-inline-links`) at all widths:
  Home, About Us, Product & Services, Target Market, Seasonal Harvest.
  Click the nav item text directly. Product & Services, Target Market
  and Seasonal Harvest carry dropdowns that open on **hover** (`.hover()`,
  not `.click()`) — the menu is an absolutely-positioned card under the
  item. On phones the row drops to its own full-width line under the logo
  and scrolls sideways, so `scrollIntoViewIfNeeded()` before clicking the
  later items. Nav is state-based (`activeNav` in App.js) but is now mirrored
  into the URL: clicking About Us pushes `/about-us`, Back works, and a deep
  link is honoured after sign-in. The page↔path table is `src/routes.js`.
  Pages are code-split, so assert with `findBy`/`waitFor`, not `getBy` —
  the chunk lands a tick after the click.
- At mobile widths some pages (e.g. About Us) render as a full-screen
  sheet with an X close button that covers the navbar — close it before
  clicking the hamburger.
- Contact page form field ids: `#git-name`, `#git-email`, `#git-subject`,
  `#git-message`; messages persist to localStorage key
  `ecoequity_contact_messages`.

## Gotchas

- Demo mode has NO session persistence, so bugs in the Supabase
  session-restore path (page reload, or return from an emailed link →
  `applySession` in App.js) never reproduce in demo browser-driving. Cover it with
  Jest instead: mock `./data/auth` and `./supabaseClient`
  (`isSupabaseConfigured: true`) — see `src/sessionRestoreNav.test.js`.
  CRA's jest sets `resetMocks: true`, wiping mock-factory implementations;
  set implementations in `beforeEach`, not the factory.

- Hover styles are inline React state, not CSS `:hover` — to check for
  stuck-hover glitches, `page.mouse.move(5, 5)` away and read
  `getComputedStyle(el).transform`.
- Working directory resets between Bash calls; `cd` into the scratchpad
  before `node -e` scripts that require playwright.
