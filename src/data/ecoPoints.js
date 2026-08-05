import { supabase, isSupabaseConfigured } from "../supabaseClient";

// ============================================================================
// ECOPOINTS data layer — the user's balance, ledger and redemptions.
//
// Same two-mode contract as data/adminContent.js: with Supabase configured
// these hit the database, without it they return null and App.js keeps its
// existing localStorage behaviour, so the app still runs before any keys exist.
//
// The asymmetry to know about: reads are plain table selects (RLS scopes them
// to the signed-in user), but every WRITE goes through an RPC. The point values
// live in the admin catalog and the arithmetic happens in Postgres — see the
// ECOPOINTS section of supabase/schema.sql for why. That means this module
// never sends an amount, only the name of what happened.
// ============================================================================

// The ledger stores timestamps; the UI renders "May 27, 2026" strings.
function dateLabel(iso) {
  const d = iso ? new Date(iso) : new Date();
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Ledger row -> the { action, points, date, icon } shape earnHistory holds.
function toEarnEntry(row) {
  return {
    action: row.action,
    points: Number(row.points || 0),
    date: dateLabel(row.created_at || row.date),
    icon: row.icon || "Gift",
  };
}

// Redemption row -> the { reward, points, date, status } shape redeemHistory
// holds. `points` is the pre-formatted negative string the timeline renders.
function toRedeemEntry(row) {
  const spent = Number(row.points_spent || 0);
  return {
    id: row.id,
    // The catalog id, kept alongside the title so per-member reward limits can
    // be counted exactly rather than by matching on a renameable title.
    rewardId: row.reward_id,
    reward: row.reward_title,
    points: `-${spent.toLocaleString()}`,
    date: dateLabel(row.created_at || row.date),
    status: row.status || "Active",
  };
}

// Everything the EcoPoints dashboard needs for one user, in the shapes App.js
// already stores. Returns null when Supabase is off (caller keeps local state).
export async function fetchEcoState(userId) {
  if (!isSupabaseConfigured || !userId) return null;
  const [profileRes, ledgerRes, redemptionRes] = await Promise.all([
    supabase.from("profiles").select("eco_points").eq("id", userId).maybeSingle(),
    supabase
      .from("eco_ledger")
      .select("action, points, icon, created_at")
      .eq("user_id", userId)
      // Redemptions get their own list below, but everything else belongs here
      // INCLUDING negative rows: an admin debit is part of the member's history
      // and hiding it made a shrinking balance look unexplained.
      .neq("kind", "redeem")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("eco_redemptions")
      .select("id, reward_id, reward_title, points_spent, status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);
  if (profileRes.error) throw profileRes.error;
  if (ledgerRes.error) throw ledgerRes.error;
  if (redemptionRes.error) throw redemptionRes.error;
  const redemptions = redemptionRes.data || [];
  return {
    points: Number(profileRes.data?.eco_points || 0),
    earnHistory: (ledgerRes.data || []).map(toEarnEntry),
    redeemHistory: redemptions.map(toRedeemEntry),
    // Kept for the saved-rewards state App.js carries; the catalog fields are
    // whatever the redemption snapshotted, not a live join.
    redeemedRewards: redemptions.map((r) => ({
      id: r.reward_id,
      title: r.reward_title,
      points: Number(r.points_spent || 0),
      status: r.status,
    })),
  };
}

// Award the points the admin attached to `action`. Returns
// { balance, entry } — the entry is the ledger row the database just wrote, so
// the caller can prepend it without re-fetching. Throws when no rule matches.
export async function earnPoints(action) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.rpc("eco_earn", { p_action: action });
  if (error) throw error;
  return { balance: Number(data.balance || 0), entry: toEarnEntry(data) };
}

// Checkout: the amount scales with the order, so the server applies the
// admin-configured rate to the total rather than taking a flat rule.
export async function earnOrderPoints(total) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.rpc("eco_earn_order", { p_total: total });
  if (error) throw error;
  // A total too small to earn anything comes back as balance-only.
  if (!data || data.points === undefined || data.points === null) {
    return { balance: Number(data?.balance || 0), entry: null };
  }
  return { balance: Number(data.balance || 0), entry: toEarnEntry(data) };
}

// Spend points on a reward. The cost and the affordability check are both
// server-side; an unaffordable reward throws with a readable message.
export async function redeemRewardRemote(rewardId) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.rpc("eco_redeem", { p_reward_id: rewardId });
  if (error) throw error;
  return { balance: Number(data.balance || 0), entry: toRedeemEntry(data) };
}

// How many of each reward the whole community has claimed, as
// { [rewardId]: count }. Needed for the "N left" counter on limited rewards:
// a customer can only read their OWN eco_redemptions rows, so the totals come
// from a security-definer function rather than a select.
export async function fetchRewardClaims() {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.rpc("eco_reward_claims");
  if (error) throw error;
  return (data || []).reduce((acc, row) => {
    acc[row.reward_id] = Number(row.claimed || 0);
    return acc;
  }, {});
}

// --- Admin ------------------------------------------------------------------

// Every user's redemptions, newest first, for the Admin Portal fulfilment
// queue. RLS returns rows to admins only; a customer session gets just its own.
export async function fetchAllRedemptions() {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from("eco_redemptions")
    .select("id, user_id, reward_id, reward_title, points_spent, status, created_at, profiles:user_id (full_name)")
    .order("created_at", { ascending: false })
    .limit(300);
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    userName: row.profiles?.full_name || "Member",
    rewardId: row.reward_id,
    reward: row.reward_title,
    points: Number(row.points_spent || 0),
    status: row.status || "Active",
    date: dateLabel(row.created_at),
  }));
}

// "Cancelled" is deliberately NOT settable through updateRedemptionStatus —
// cancelling refunds the points, so it has to go through the RPC below.
export const REDEMPTION_STATUSES = ["Active", "Shipped", "Used"];
export const REDEMPTION_FILTERS = [...REDEMPTION_STATUSES, "Cancelled"];

// Move a redemption along the fulfilment queue (admin-only at the RLS layer).
export async function updateRedemptionStatus(id, status) {
  if (!isSupabaseConfigured) return null;
  const { error } = await supabase.from("eco_redemptions").update({ status }).eq("id", id);
  if (error) throw error;
  return true;
}

// Cancel a redemption the team can't fulfil and give the member their points
// back. The refund and the status change are one transaction server-side, so
// there is no window where the reward is cancelled but the points are gone.
export async function cancelRedemption(id) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.rpc("eco_cancel_redemption", { p_id: id });
  if (error) throw error;
  return { refunded: Number(data?.refunded || 0), balance: Number(data?.balance || 0) };
}

// Every member with a balance or any ledger history, for the admin's balances
// panel. RLS lets admins read all profiles; a non-admin session gets one row.
export async function fetchMemberBalances() {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, eco_points, tier, is_admin")
    .order("eco_points", { ascending: false })
    .limit(300);
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    name: row.full_name || "Member",
    // The stored tier label; the dashboard recomputes it from the live tier
    // table, so treat this as a hint rather than the truth.
    tier: row.tier || "Seedling",
    role: row.is_admin ? "Admin" : "Customer",
    points: Number(row.eco_points || 0),
  }));
}

// Credit or debit one member by hand. The ledger entry is written server-side
// so the correction shows up in that member's Earn History like any other
// movement — see eco_adjust in supabase/schema.sql.
export async function adjustMemberPoints(userId, points, reason) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.rpc("eco_adjust", {
    p_user_id: userId,
    p_points: Math.trunc(Number(points) || 0),
    p_reason: reason || "Points adjustment by the team",
  });
  if (error) throw error;
  return { balance: Number(data?.balance || 0) };
}

// The health of the points economy, for the admin's stat cards. Reads the whole
// ledger rather than a rollup table — fine at this scale, and it means the
// numbers can never drift from the movements that produced them.
export async function fetchEcoEconomy() {
  if (!isSupabaseConfigured) return null;
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const [ledgerRes, balanceRes] = await Promise.all([
    supabase.from("eco_ledger").select("kind, points, created_at").limit(5000),
    supabase.from("profiles").select("eco_points"),
  ]);
  if (ledgerRes.error) throw ledgerRes.error;
  if (balanceRes.error) throw balanceRes.error;
  const rows = ledgerRes.data || [];
  const issued = rows.reduce((s, r) => (Number(r.points) > 0 ? s + Number(r.points) : s), 0);
  const spent = rows.reduce((s, r) => (Number(r.points) < 0 ? s + Math.abs(Number(r.points)) : s), 0);
  const recent = rows.filter((r) => (r.created_at || "") >= since);
  return {
    // What members are collectively holding — the outstanding liability.
    circulating: (balanceRes.data || []).reduce((s, p) => s + Number(p.eco_points || 0), 0),
    issued,
    spent,
    // What share of everything ever issued has actually been redeemed.
    burnRate: issued > 0 ? Math.round((spent / issued) * 100) : 0,
    issued30d: recent.reduce((s, r) => (Number(r.points) > 0 ? s + Number(r.points) : s), 0),
    spent30d: recent.reduce((s, r) => (Number(r.points) < 0 ? s + Math.abs(Number(r.points)) : s), 0),
    movements: rows.length,
  };
}
