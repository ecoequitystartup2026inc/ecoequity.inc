import { supabase, isSupabaseConfigured, supabaseUrl, supabaseAnonKey } from "../supabaseClient";

// ============================================================================
// AUTH data layer — replaces the App.js login state (isLoggedIn / loggedInUser
// / isAdmin / loggedInEmail). Supabase Auth manages the session + token for you.
// ============================================================================

export async function signUp({ email, password, fullName }) {
  if (!isSupabaseConfigured) throw new Error("Supabase not configured");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName }, // -> profiles.full_name via trigger
      // Where the confirmation-email link sends the user back to.
      emailRedirectTo: window.location.origin,
    },
  });
  if (error) throw error;
  return data;
}

// Re-send the signup confirmation email (for the "didn't get it?" button).
export async function resendConfirmation(email) {
  if (!isSupabaseConfigured) throw new Error("Supabase not configured");
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: window.location.origin },
  });
  if (error) throw error;
}

export async function signIn({ email, password }) {
  if (!isSupabaseConfigured) throw new Error("Supabase not configured");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

// Which auth providers the project has switched on. signInWithOAuth navigates
// the whole browser away, so if the provider is off the user lands on a raw
// Supabase JSON error page ("Unsupported provider: provider is not enabled")
// with no way back — checking first lets us fail inside the app instead.
async function isProviderEnabled(provider) {
  const res = await fetch(`${supabaseUrl}/auth/v1/settings`, {
    headers: { apikey: supabaseAnonKey },
  });
  if (!res.ok) return null; // unknown — caller should proceed rather than block
  const settings = await res.json();
  return Boolean(settings?.external?.[provider]);
}

// Google OAuth. Redirects the browser to Google, then back to redirectTo.
// On return, onAuthChange()/getCurrentUser() pick up the session automatically,
// and the profiles row is created by the same on-signup trigger as email signup.
export async function signInWithGoogle(redirectTo = window.location.origin) {
  if (!isSupabaseConfigured) throw new Error("Supabase not configured");

  // Only block on a definitive "off". A null (network error, unexpected shape)
  // falls through to the normal flow so a flaky preflight can't break sign-in.
  let enabled = null;
  try {
    enabled = await isProviderEnabled("google");
  } catch {
    enabled = null;
  }
  if (enabled === false) {
    throw new Error(
      "Google sign-in isn't enabled on this Supabase project yet. " +
      "Dashboard → Authentication → Providers → Google: toggle it on and add " +
      "your Google Cloud Client ID + secret (see BACKEND_SETUP.md)."
    );
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: { access_type: "offline", prompt: "consent" },
    },
  });
  if (error) throw error;
  return data;
}

// ============================================================================
// LOCAL (UI-ONLY) GOOGLE SIGN-IN
// The Google button currently runs entirely in the browser: the user picks a
// demo account (or types any address) and we build the session data ourselves.
// Nothing is sent to Google Cloud Console or Supabase, so the flow works with
// no OAuth credentials and no provider toggled on.
//
// To go live later: point App.js's handleSocialAuth back at signInWithGoogle()
// above and delete the chooser modal — the rest of the app needs no changes,
// because localGoogleUser() returns the same shape hydrateUser() does.
// ============================================================================

// Inline SVG avatar so the picture needs no network request (a real Google
// photo URL would be an external fetch, and there is no real account here).
function initialsAvatar(name, color) {
  const initials = (name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96">` +
    `<rect width="96" height="96" fill="${color}"/>` +
    `<text x="48" y="52" font-family="Inter, Arial, sans-serif" font-size="38" ` +
    `font-weight="600" fill="#ffffff" text-anchor="middle" dominant-baseline="central">${initials}</text>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// The accounts the chooser offers. Same admin address the simulated password
// login uses, so both demo routes land on the same Admin Portal.
export const LOCAL_GOOGLE_ACCOUNTS = [
  { email: "juan.delacruz@gmail.com", name: "Juan Dela Cruz", color: "#1a73e8" },
  { email: "maria.santos@gmail.com", name: "Maria Santos", color: "#0f9d58" },
  { email: "admin@ecoequity.com", name: "EcoEquity Admin", color: "#5f6368" },
];

const LOCAL_ADMIN_EMAIL = "admin@ecoequity.com";

// Builds a logged-in user from a picked/typed address — same normalized shape
// as getCurrentUser(), so App.js's applySession() consumes it unchanged.
export function localGoogleUser({ email, name, color } = {}) {
  const address = (email || "").trim();
  const display =
    (name || "").trim() ||
    (address ? address.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Google User");
  const isAdmin = address.toLowerCase() === LOCAL_ADMIN_EMAIL;
  const avatarUrl = initialsAvatar(display, color || (isAdmin ? "#5f6368" : "#1a73e8"));

  return {
    user: {
      id: `local-google-${address.toLowerCase()}`,
      email: address,
      user_metadata: { full_name: display, name: display, email: address, avatar_url: avatarUrl },
    },
    profile: { full_name: display, profile_pic: avatarUrl, is_admin: isAdmin },
    email: address,
    name: display,
    avatarUrl,
    isAdmin,
    isLocal: true,
  };
}

export async function signOut() {
  if (!isSupabaseConfigured) return;
  await supabase.auth.signOut();
}

// Normalizes an auth user (+ its profiles row) for the UI.
//   { user, profile, name, email, avatarUrl, isAdmin }
// Pulls name/avatar from the profiles row first, then falls back to the OAuth
// metadata Google provides (full_name/name, avatar_url/picture) so the user's
// Google photo + name + email always show even if the profile row is sparse.
async function hydrateUser(user) {
  if (!user) return null;
  // A brand-new Google user may not have a profiles row yet (the on-signup
  // trigger races the redirect), so a missing row is not an error here — the
  // OAuth metadata below covers name/avatar until the row lands.
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const meta = user.user_metadata || {};
  return {
    user,
    profile,
    email: user.email || meta.email || "",
    name: profile?.full_name || meta.full_name || meta.name || (user.email ? user.email.split("@")[0] : "User"),
    avatarUrl: profile?.profile_pic || meta.avatar_url || meta.picture || null,
    isAdmin: Boolean(profile?.is_admin),
  };
}

// Returns the logged-in user normalized for the UI, or null.
export async function getCurrentUser() {
  if (!isSupabaseConfigured) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return hydrateUser(user);
}

// Same shape as getCurrentUser(), but built from a session onAuthChange already
// handed us — skips the extra auth.getUser() round trip.
export async function getUserFromSession(session) {
  if (!isSupabaseConfigured) return null;
  return hydrateUser(session?.user);
}

// Subscribe to login/logout changes. Use in a top-level useEffect:
//   useEffect(() => { const sub = onAuthChange(setSession); return () => sub?.unsubscribe(); }, [])
//
// The callback is deferred to a fresh task on purpose: supabase-js invokes and
// awaits these callbacks while holding its internal auth lock, so calling any
// other supabase.auth.* / supabase.from() method *synchronously* inside one can
// deadlock and hang the sign-in. Deferring lets the lock release first.
export function onAuthChange(callback) {
  if (!isSupabaseConfigured) return null;
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    setTimeout(() => callback(session, event), 0);
  });
  return data.subscription;
}

// Supabase reports a failed OAuth round trip by redirecting back to the app with
// error params (hash for the implicit flow, query string for PKCE) — e.g. the
// provider isn't enabled, or redirectTo isn't in the allowed Redirect URLs.
// Without this the browser just lands on the app and nothing happens, which
// looks exactly like a broken button. Returns a message and cleans the URL.
export function consumeAuthErrorFromUrl() {
  if (typeof window === "undefined") return null;
  const hash = new URLSearchParams((window.location.hash || "").replace(/^#/, ""));
  const query = new URLSearchParams(window.location.search || "");
  const code = hash.get("error") || query.get("error");
  if (!code) return null;

  const description =
    hash.get("error_description") || query.get("error_description") || "";
  const readable = description.replace(/\+/g, " ");

  // Strip the error params so a refresh doesn't replay the same message.
  window.history.replaceState(null, "", window.location.pathname);

  if (/provider is not enabled|Unsupported provider/i.test(readable)) {
    return "Google sign-in isn't enabled on the Supabase project yet. Turn it on under Authentication → Providers → Google (see BACKEND_SETUP.md).";
  }
  if (/redirect/i.test(readable)) {
    return `This app's URL isn't in the Supabase allowed Redirect URLs. Add ${window.location.origin} under Authentication → URL Configuration.`;
  }
  return readable || `Sign-in failed (${code}).`;
}
