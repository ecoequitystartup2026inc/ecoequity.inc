// ============================================================================
// PLATFORM MEMBER RECORD — the shared copy of one person's account.
//
// Admin Portal → Users and the user's own dashboard (Profile Settings, Earn
// History, My Certificate, Settings, Wishlist) both read and write the same
// row in App.js's `platformUsers` state. Whatever the admin types there shows
// up on the member's dashboard, and whatever the member saves shows up in the
// admin table.
//
// The seed rows in AdminPortal.js predate these fields, so nothing may assume
// they exist — every read goes through normalizeMember() first.
// ============================================================================

export const MEMBER_NOTIFICATION_DEFAULTS = { email: true, sms: false };

export function normalizeMember(user) {
  const u = user || {};
  return {
    ...u,
    id: u.id || "",
    name: u.name || "",
    email: u.email || "",
    role: u.role || "Customer",
    status: u.status || "Offline",
    lastLogin: u.lastLogin || "—",
    phone: u.phone || "",
    address: u.address || "",
    ecoPoints: Number(u.ecoPoints || 0),
    earnHistory: Array.isArray(u.earnHistory) ? u.earnHistory : [],
    certificates: Array.isArray(u.certificates) ? u.certificates : [],
    notifications: { ...MEMBER_NOTIFICATION_DEFAULTS, ...(u.notifications || {}) },
    wishlist: Array.isArray(u.wishlist) ? u.wishlist : [],
  };
}

// USR-006 after USR-005 — reads the highest numeric suffix already in use so a
// deleted row can't hand the same id to two people.
export function nextMemberId(list) {
  const highest = (list || []).reduce((max, u) => {
    const n = parseInt(String(u.id || "").replace(/\D/g, ""), 10);
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  return `USR-${String(highest + 1).padStart(3, "0")}`;
}

export const memberDateLabel = () =>
  new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// One row of the member's Earn History. `icon` is an ecoProgram icon NAME, never
// JSX — these records are persisted (see data/ecoProgram.js).
export function memberEarnEntry(action, points, icon = "Gift") {
  return { action, points: Number(points) || 0, date: memberDateLabel(), icon };
}

// A certificate the admin issues by hand, in the same shape the dashboard builds
// for courses the member finished on their own.
export function memberCertificate(course, issuer = "EcoEquity Team") {
  return {
    id: `CERT-${Date.now().toString().slice(-6)}`,
    course,
    date: memberDateLabel(),
    status: "Verified",
    issuedBy: issuer,
  };
}
