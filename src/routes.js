// The URL side of navigation.
//
// App.js drives the whole site from one piece of state, `activeNav`, holding a
// human-readable page name ("Shop All Products"). That works, but the address
// bar never moved: every page was the same URL, so nothing could be linked to,
// the browser Back button left the site entirely, and a reload dropped you back
// on the landing page.
//
// This module is the translation layer between those page names and real paths.
// It is deliberately a lookup table rather than a router: the nav is not a tree
// of components to be re-parented, it is a switch on a string, and the only
// thing it was missing was a URL.
//
// Adding a page? Add it here too, or it will work but stay unlinkable.

// Page name → path. The name on the left must match the string App.js compares
// `activeNav` against, exactly.
export const PAGE_PATHS = {
  "Home": "/",

  // Auth screens.
  "Login": "/login",
  "Sign Up": "/signup",

  // Marketing / information.
  "About Us": "/about-us",
  "Learn More": "/learn-more",
  "Benefits of the Project": "/benefits",
  "OurImpactPage": "/our-impact",
  "ImpactTrackingPage": "/impact-tracking",
  "IncomeGenerationPage": "/income-generation",
  "LGUPartnershipPage": "/lgu-partnership",

  // Product & services.
  "Product & Services": "/product-and-services",
  "ProductsPage": "/products",
  "ServicesPage": "/services",
  "Shop All Products": "/shop",
  "Starter Kits & Toolsets": "/starter-kits",
  "AI Data Subscription": "/ai-data-subscription",
  "Specialist Certification": "/specialist-certification",
  "ExpertSupportPage": "/expert-support",

  // Target market.
  "Target Market": "/target-market",
  "Target Market Explore": "/target-market/explore",
  "Sustainability App Market": "/sustainability-app-market",

  // Growing tools.
  "Seasonal Harvest": "/seasonal-harvest",
  "Farm Planner": "/farm-planner",
  "NativeSeedBankPage": "/native-seed-bank",
  "SurplusExchangePage": "/surplus-exchange",

  // Community.
  "Community": "/community",
  "EventsAndWorkshops": "/events-and-workshops",

  // Transactional / staff.
  "CheckoutPage": "/checkout",
  "Admin Portal": "/admin",
  "Agent Inbox": "/agent-inbox",
};

// Reverse lookup, built once.
const PAGES_BY_PATH = Object.fromEntries(
  Object.entries(PAGE_PATHS).map(([page, path]) => [path, page])
);

// Pages a signed-out visitor must never be dropped onto by typing a URL, and
// which have no business in a sitemap. Everything else is gated by the login
// screen anyway; these two are gated by role on top of it.
const ROLE_ONLY = {
  "Admin Portal": (roles) => Boolean(roles?.isAdmin),
  "Agent Inbox": (roles) => Boolean(roles?.isAgent || roles?.isAdmin),
};

// Never linked publicly: auth screens, a half-finished order, staff tooling.
const PRIVATE_PAGES = new Set([
  "Login", "Sign Up", "CheckoutPage", "Admin Portal", "Agent Inbox",
]);

/** Path for a page name. Unknown pages fall back to "/" rather than throwing —
 *  a page that forgot to register here should still render, just not be linkable. */
export function pathForPage(page) {
  return PAGE_PATHS[page] || "/";
}

/** Page name for a path, or null if the path matches nothing. Tolerates a
 *  trailing slash so /shop and /shop/ are the same page. */
export function pageForPath(pathname) {
  if (!pathname) return null;
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return PAGES_BY_PATH[clean] || PAGES_BY_PATH[clean + "/"] || null;
}

/** Whether a restored session is allowed to land on a deep-linked page.
 *  `roles` is { isAdmin, isAgent }. Guards the staff pages only — the login
 *  screen already stands between a stranger and everything else. */
export function canLandOn(page, roles) {
  if (!page || !PAGE_PATHS[page]) return false;
  // Someone who already has a session must not be handed the login screen as a
  // destination — /login with a live session would strand them on a form they
  // have no reason to fill in, with the navbar hidden.
  if (page === "Login" || page === "Sign Up") return false;
  const gate = ROLE_ONLY[page];
  return gate ? gate(roles) : true;
}

/** The pages worth putting in sitemap.xml. */
export const PUBLIC_PAGES = Object.keys(PAGE_PATHS).filter(
  (page) => !PRIVATE_PAGES.has(page)
);
