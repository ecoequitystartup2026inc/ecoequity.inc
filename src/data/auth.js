import { supabase, isSupabaseConfigured } from "../supabaseClient";

// ============================================================================
// AUTH data layer — replaces the App.js login state (isLoggedIn / loggedInUser
// / isAdmin / loggedInEmail). Supabase Auth manages the session + token for you.
// ============================================================================

// The URL emailed links (signup confirmation, password reset) come back to.
// Follows whatever origin is actually serving the page, so one build works on
// localhost AND on the live domain — nothing is pinned to localhost, and
// there's no URL to edit before deploying. Two adjustments:
//   - PUBLIC_URL keeps the sub-path when the app isn't served from the domain
//     root (GitHub Pages, /app/…); window.location.origin alone drops it.
//   - REACT_APP_SITE_URL, when set, wins outright — use it when every emailed
//     link should land on the production site no matter where it was requested
//     from. Leave it unset to keep the follow-the-origin behaviour.
// Whatever this returns must appear verbatim in Supabase → Authentication →
// URL Configuration → Redirect URLs, or Supabase rejects the round trip.
export function appRedirectUrl() {
  const override = (process.env.REACT_APP_SITE_URL || "").trim();
  if (override) return override.replace(/\/+$/, "");

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  // CRA sets PUBLIC_URL to "" at the root, or to an absolute URL / "/sub-path".
  const base = (process.env.PUBLIC_URL || "").replace(/\/+$/, "");
  if (/^https?:\/\//i.test(base)) return base;
  return `${origin}${base}`;
}

export async function signUp({ email, password, fullName }) {
  if (!isSupabaseConfigured) throw new Error("Supabase not configured");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName }, // -> profiles.full_name via trigger
      // Where the confirmation-email link sends the user back to.
      emailRedirectTo: appRedirectUrl(),
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
    options: { emailRedirectTo: appRedirectUrl() },
  });
  if (error) throw error;
}

export async function signIn({ email, password }) {
  if (!isSupabaseConfigured) throw new Error("Supabase not configured");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

// ============================================================================
// FRIENDLY MESSAGES
// Supabase writes its errors for developers ("Invalid login credentials",
// "User already registered") and sends a few as bare 4xx codes. Every failure
// the login/signup forms can hit is translated in one place here, so the two
// forms can't drift apart on wording. Returns { text, kind }; `kind` is what
// lets the UI offer the obvious next step — a link to Login for an address
// that already exists, a resend button for an unconfirmed one.
// ============================================================================

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || "").trim());
}

// Signing up with an address that already exists does NOT raise when email
// confirmation is on — Supabase returns a decoy user with an empty `identities`
// array instead, so the screen can't be used to discover who has an account.
// The form still needs to know, or "check your email" is a lie.
export function isExistingAccount(signUpData) {
  const user = signUpData?.user;
  return Boolean(user && Array.isArray(user.identities) && user.identities.length === 0);
}

export function describeAuthError(err, context = "login") {
  const raw = String(err?.message || "");
  const code = String(err?.code || err?.error_code || "");
  const status = err?.status;
  const says = (re) => re.test(raw);

  // supabase-js surfaces an unreachable backend as a plain TypeError.
  if (says(/failed to fetch|networkerror|network request failed|load failed/i)
      || (typeof navigator !== "undefined" && navigator.onLine === false)) {
    return { text: "You appear to be offline. Check your internet connection and try again.", kind: "offline" };
  }

  if (code === "user_already_exists" || says(/already registered|already been registered|user already exists/i)) {
    return {
      text: "That email is already registered. Log in instead — or reset the password if you've forgotten it.",
      kind: "already-registered",
    };
  }

  if (code === "email_not_confirmed" || says(/email not confirmed/i)) {
    return {
      text: "Almost there — your email isn't confirmed yet. Open the confirmation link we sent you, then log in.",
      kind: "unconfirmed",
    };
  }

  if (code === "invalid_credentials" || says(/invalid login credentials/i)) {
    return context === "signup"
      ? { text: "Those details weren't accepted. Check the email and password and try again.", kind: "wrong-password" }
      : {
          text: "Wrong email or password. Check your password and try again, or use \"Forgot Password?\".",
          kind: "wrong-password",
        };
  }

  if (code === "weak_password" || says(/password should be at least|password is too weak/i)) {
    return {
      text: `Password is too weak. Use at least ${PASSWORD_MIN_LENGTH} characters, mixing letters and numbers.`,
      kind: "weak-password",
    };
  }

  if (code === "email_address_invalid" || code === "validation_failed" || says(/unable to validate email address/i)) {
    return { text: "That email address doesn't look valid. Check it for typos.", kind: "invalid-email" };
  }

  // Supabase throttles repeated sign-ins and outgoing emails, and says how long.
  const wait = raw.match(/after (\d+) seconds?/i);
  if (code.startsWith("over_") || status === 429 || wait || says(/rate limit|too many requests/i)) {
    return {
      text: wait
        ? `Too many attempts. Please wait ${wait[1]} seconds and try again.`
        : "Too many attempts. Please wait a minute and try again.",
      kind: "rate-limit",
    };
  }

  if (code === "signup_disabled" || says(/signups? (are )?not allowed|disabled/i)) {
    return { text: "New sign-ups are turned off right now. Please try again later.", kind: "signups-disabled" };
  }

  if (code === "user_banned" || says(/banned/i)) {
    return { text: "This account is locked. Please contact support for help.", kind: "banned" };
  }

  return {
    text: raw || (context === "signup" ? "Could not create your account. Please try again." : "Could not log you in. Please try again."),
    kind: "unknown",
  };
}

// ============================================================================
// PASSWORD RESET
// Two halves that run in different browser sessions:
//   1. requestPasswordReset() — login screen, emails a recovery link.
//   2. The link lands back on the app with a short-lived recovery session, the
//      app opens its "set a new password" modal, and updatePassword() saves it.
// The same updatePassword() also backs Settings → Security → Change Password,
// where the user already has a normal session.
// ============================================================================

export const PASSWORD_MIN_LENGTH = 8;

// One rule for every place a new password is typed (reset link + Settings), so
// the wording can't drift between them. Returns a message, or null when valid.
// Pass `confirm` only where there's a second field to match against.
export function passwordProblem(password, confirm) {
  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  if (confirm !== undefined && password !== confirm) return "Passwords do not match.";
  return null;
}

// Emails the recovery link. `redirectTo` must be listed under Authentication →
// URL Configuration → Redirect URLs, or the link comes back as an error.
// Supabase resolves successfully even for an address with no account (so the
// screen can't be used to discover who has signed up) — never treat the absence
// of an error as proof the address exists.
export async function requestPasswordReset(email, redirectTo = appRedirectUrl()) {
  if (!isSupabaseConfigured) throw new Error("Supabase not configured");
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw error;
}

// Sets the password on whichever session is active — the recovery session from
// the email link, or the signed-in user changing it from Settings.
export async function updatePassword(newPassword) {
  if (!isSupabaseConfigured) throw new Error("Supabase not configured");
  // A recovery link is single-use and short-lived; without a session the update
  // fails with an opaque 401, so say what actually happened.
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("This reset link has expired or was already used. Request a new one from the login screen.");
  }
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

// updateUser() doesn't ask for the old password, so a change started from
// Settings checks it here first — otherwise an unlocked tab is enough to take
// an account over. Re-signing in with credentials the user already holds just
// re-issues their session, so this is safe to call mid-session.
export async function verifyPassword(email, password) {
  if (!isSupabaseConfigured) throw new Error("Supabase not configured");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return !error;
}

// Writes the member's avatar onto their own profiles row, so the photo belongs
// to the account rather than to one browser. `dataUrl` is the downscaled image
// App.js produced, or null to clear it. A no-op offline, where the only copy is
// the one localStorage holds.
export async function saveProfilePic(dataUrl) {
  if (!isSupabaseConfigured) return;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase
    .from("profiles")
    .update({ profile_pic: dataUrl })
    .eq("id", user.id);
  if (error) throw error;
}

// The URL as it looked on page load. supabase-js parses the tokens out of it
// and strips them asynchronously, which can finish before React mounts — read
// window.location later and the marker is sometimes already gone.
const initialUrl = typeof window !== "undefined"
  ? { hash: window.location.hash || "", search: window.location.search || "" }
  : { hash: "", search: "" };

// True when this page load came from a password-recovery email link. The
// implicit flow puts `type=recovery` in the hash, PKCE in the query string.
export function arrivedFromRecoveryLink() {
  return linkType() === "recovery";
}

// An invitation link (Admin Portal → Support Agents → Send invite). Supabase
// signs them in on arrival, which is the trap: without this check they land in
// the app fully authenticated and never set a password, so they can never get
// back in once that session expires. Same modal as recovery — the difference is
// only what it is called.
export function arrivedFromInviteLink() {
  return linkType() === "invite";
}

function linkType() {
  const fromHash = new URLSearchParams(initialUrl.hash.replace(/^#/, "")).get("type");
  const fromQuery = new URLSearchParams(initialUrl.search).get("type");
  return fromHash || fromQuery || "";
}

export async function signOut() {
  if (!isSupabaseConfigured) return;
  await supabase.auth.signOut();
}

// Normalizes an auth user (+ its profiles row) for the UI.
//   { user, profile, name, email, avatarUrl, isAdmin }
// Pulls name/avatar from the profiles row first, then falls back to the auth
// user's own metadata (full_name/name, set at signup) so a name and email still
// show even if the profile row is sparse.
async function hydrateUser(user) {
  if (!user) return null;
  // A brand-new user may not have a profiles row yet (the on-signup trigger can
  // land just after the first read), so a missing row is not an error here —
  // the metadata below covers name/avatar until the row arrives.
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
    name: profile?.full_name || meta.full_name || (user.email ? user.email.split("@")[0] : "User"),
    avatarUrl: profile?.profile_pic || null,
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

// Supabase reports a failed email-link round trip by redirecting back to the app
// with error params (hash for the implicit flow, query string for PKCE) — e.g.
// the link has expired, or redirectTo isn't in the allowed Redirect URLs.
// Without this the browser just lands on the app and nothing happens, which
// looks exactly like a broken link. Returns a message and cleans the URL.
export function consumeAuthErrorFromUrl() {
  if (typeof window === "undefined") return null;
  const hash = new URLSearchParams((window.location.hash || "").replace(/^#/, ""));
  const query = new URLSearchParams(window.location.search || "");
  const code = hash.get("error") || query.get("error");
  if (!code) return null;

  const description =
    hash.get("error_description") || query.get("error_description") || "";
  const readable = description.replace(/\+/g, " ");
  const errorCode = hash.get("error_code") || query.get("error_code") || "";

  // Strip the error params so a refresh doesn't replay the same message.
  window.history.replaceState(null, "", window.location.pathname);

  // Recovery and confirmation links are single-use and time-limited; both come
  // back through here once they're spent, and "access_denied" alone tells the
  // user nothing about what to do next.
  if (/otp_expired|expired/i.test(errorCode) || /invalid or has expired/i.test(readable)) {
    return "That email link has expired or was already used. Request a new one to continue.";
  }
  if (/redirect/i.test(readable)) {
    return `This app's URL isn't in the Supabase allowed Redirect URLs. Add ${appRedirectUrl()} under Authentication → URL Configuration.`;
  }
  return readable || `Sign-in failed (${code}).`;
}
