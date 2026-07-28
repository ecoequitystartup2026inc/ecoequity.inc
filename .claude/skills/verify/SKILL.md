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
  `input[placeholder="Email or Phone Number"]` and `input[type="password"]`,
  click `button:has-text("Login")`, then wait ~2.2s (simulated 1.5s delay).
  Admin: `admin@ecoequity.com` / `Ecoequity` → lands on Admin Portal.
- **Navigation:** hamburger at ALL viewport widths (per user request
  2026-07-09): click `[aria-label="Toggle navigation menu"]`, then the
  nav item text. The open panel is `.nav-links-panel.mobile-menu-open` —
  a vertical menu, full-width on phones, a right-anchored 340px dropdown
  card at ≥768px. Section sub-menus are accordions; the chevron is the
  last `span` inside the item button. Navigating auto-closes the panel.
  Items: Home, About Us, Product & Services, Target Market, Seasonal
  Harvest, Get in Touch, Learn More. Nav is state-based (`activeNav` in
  App.js), no routes/URLs.
- At mobile widths some pages (e.g. About Us) render as a full-screen
  sheet with an X close button that covers the navbar — close it before
  clicking the hamburger.
- Contact page form field ids: `#git-name`, `#git-email`, `#git-subject`,
  `#git-message`; messages persist to localStorage key
  `ecoequity_contact_messages`.

## Gotchas

- Demo mode has NO session persistence, so bugs in the Supabase
  session-restore path (page reload, Google OAuth return → `applySession`
  in App.js) never reproduce in demo browser-driving. Cover that path with
  Jest instead: mock `./data/auth` and `./supabaseClient`
  (`isSupabaseConfigured: true`) — see `src/sessionRestoreNav.test.js`.
  CRA's jest sets `resetMocks: true`, wiping mock-factory implementations;
  set implementations in `beforeEach`, not the factory.

- Hover styles are inline React state, not CSS `:hover` — to check for
  stuck-hover glitches, `page.mouse.move(5, 5)` away and read
  `getComputedStyle(el).transform`.
- Working directory resets between Bash calls; `cd` into the scratchpad
  before `node -e` scripts that require playwright.
