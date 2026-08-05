import React from "react";
import {
  Truck, Sprout, Wrench, Bot, ShoppingCart, CalendarDays, UserPlus, Users,
  ShieldCheck, Building2, Globe, Trees, Wheat, Cloud, Gift, GraduationCap,
  Leaf, Recycle, Droplet, Sun, Award, Star, Heart, Package, Ticket, BookOpen,
} from "lucide-react";

// The EcoPoints program (rewards, earn rules, tiers, badges, impact stats and
// the referral offer) is authored in the Admin Portal and rendered by the user
// dashboard. Everything here is the seed used until an admin edits it.
export const ECO_PROGRAM_STORAGE_KEY = "ecoequity_eco_program";

// Same lesson as data/icons.js: never persist JSX, only the icon NAME.
const ECO_ICONS = {
  Truck, Sprout, Wrench, Bot, ShoppingCart, CalendarDays, UserPlus, Users,
  ShieldCheck, Building2, Globe, Trees, Wheat, Cloud, Gift, GraduationCap,
  Leaf, Recycle, Droplet, Sun, Award, Star, Heart, Package, Ticket, BookOpen,
};

export const ecoIconOptions = Object.keys(ECO_ICONS).map((name) => ({ value: name, label: name }));

export function ecoIcon(name, size = 24, color = "var(--eco-c11)") {
  const Cmp = ECO_ICONS[name] || Gift;
  return <Cmp size={size} color={color} />;
}

export const defaultEcoProgram = {
  // `stock` is how many of this reward exist in total (null = unlimited) and
  // `limitPerUser` how many one member may claim (0/null = unlimited). Both are
  // previewed in the UI but ENFORCED in eco_redeem() — see supabase/schema.sql,
  // because a browser check alone would be trivial to skip.
  rewards: [
    { id: "RWD-001", title: "Free Delivery Voucher", shortTitle: "Free Delivery", description: "One free eco-delivery on your next order.", points: 500, badge: "Eco-Logistics", icon: "Truck", active: true, featured: false, stock: null, limitPerUser: 0 },
    { id: "RWD-002", title: "Native Seed Kit", shortTitle: "Native Seed Kit", description: "A starter pack of heirloom seeds native to your region.", points: 1200, badge: "Biodiversity", icon: "Sprout", active: true, featured: true, stock: 50, limitPerUser: 1 },
    { id: "RWD-003", title: "Organic Gardening Set", shortTitle: "Gardening Set", description: "Hand tools, gloves and compost starter for a small plot.", points: 2500, badge: "Zero Waste", icon: "Wrench", active: true, featured: false, stock: 25, limitPerUser: 1 },
    { id: "RWD-004", title: "Premium AI Subscription", shortTitle: "AI Premium", description: "One month of unlimited AI Plant Doctor diagnoses.", points: 3000, badge: "Digital", icon: "Bot", active: true, featured: false, stock: null, limitPerUser: 0 },
  ],
  // Every action the site can award points for MUST appear here — the database
  // reads the amount out of this table (see eco_earn in supabase/schema.sql)
  // rather than trusting whatever the browser asks for, so an action with no
  // rule earns nothing. `action` is the key the app passes to addEcoPoints().
  earnRules: [
    { id: "ERN-001", action: "Buy Organic Products", shortAction: "Buy Organic Products", points: 50, icon: "ShoppingCart" },
    { id: "ERN-002", action: "Attend Workshop", shortAction: "Attend Workshop", points: 75, icon: "CalendarDays" },
    { id: "ERN-003", action: "Invite Friend", shortAction: "Invite Friend", points: 200, icon: "UserPlus" },
    { id: "ERN-004", action: "Complete AI Diagnosis", shortAction: "AI Diagnosis", points: 30, icon: "Bot" },
    { id: "ERN-005", action: "Order Review", shortAction: "Review an Order", points: 10, icon: "Star" },
    { id: "ERN-006", action: "Experience Feedback", shortAction: "Site Feedback", points: 10, icon: "Heart" },
  ],
  // Checkout is the one action that scales with the order rather than paying a
  // flat rate, so what the admin controls here is the rate: 0.1 = 1 point per
  // ₱10 spent. Used by eco_earn_order() and by the checkout preview.
  earnRate: 0.1,
  // `max: null` means "no upper bound" — the top tier.
  tiers: [
    { id: "TIER-001", title: "Seedling", min: 0, max: 999, benefits: ["Basic rewards", "Community access"] },
    { id: "TIER-002", title: "Green Grower", min: 1000, max: 4999, benefits: ["Free delivery", "5% Discounts"] },
    { id: "TIER-003", title: "Eco Guardian", min: 5000, max: 9999, benefits: ["Exclusive workshops", "10% Discounts"] },
    { id: "TIER-004", title: "Sustainability Hero", min: 10000, max: null, benefits: ["Bonus EcoPoints", "VIP Support", "15% Discounts"] },
  ],
  // `threshold` is the EcoPoints balance that unlocks the badge.
  badges: [
    { id: "BDG-001", name: "Tree Protector", icon: "ShieldCheck", threshold: 0 },
    { id: "BDG-002", name: "Urban Farmer", icon: "Building2", threshold: 500 },
    { id: "BDG-003", name: "Seed Guardian", icon: "Sprout", threshold: 2000 },
    { id: "BDG-004", name: "Climate Warrior", icon: "Globe", threshold: 5000 },
  ],
  impactStats: [
    { id: "IMP-001", label: "Trees Planted", shortLabel: "Trees Planted", value: "12", icon: "Trees" },
    { id: "IMP-002", label: "Farmers Supported", shortLabel: "Farmers Supported", value: "3", icon: "Users" },
    { id: "IMP-003", label: "Native Seeds Preserved", shortLabel: "Seeds Preserved", value: "250", icon: "Wheat" },
    { id: "IMP-004", label: "CO₂ Reduced", shortLabel: "CO2 Reduced", value: "45kg", icon: "Cloud" },
  ],
  // The line under the impact figures. Was hardcoded in the dashboard, which
  // meant the one sentence users actually read couldn't be changed by the team.
  impactQuote: "Your EcoPoints helped support 3 local farmers",
  referral: {
    code: "ECO-GROW-26",
    points: 500,
    headline: "Invite Friends → Earn 500 EcoPoints",
    blurb: "Share your unique referral code with friends. You both earn points when they sign up!",
  },
};

// Tier the balance currently sits in, plus how far along it is towards the next
// one. Shared by the desktop and mobile EcoPoints dashboards so both read the
// admin-configured tier table instead of hardcoded numbers.
export function tierProgress(points, tiers) {
  const list = [...(tiers || [])].sort((a, b) => (a.min || 0) - (b.min || 0));
  if (!list.length) return { current: null, next: null, percent: 0 };
  let idx = 0;
  for (let i = 0; i < list.length; i += 1) {
    if (points >= (list[i].min || 0)) idx = i;
  }
  const current = list[idx];
  const next = list[idx + 1] || null;
  if (!next) return { current, next: null, percent: 100 };
  const span = (next.min || 0) - (current.min || 0);
  const percent = span > 0 ? Math.min(100, Math.max(0, ((points - (current.min || 0)) / span) * 100)) : 0;
  return { current, next, percent };
}

// "0 - 999 pts" / "10,000+ pts"
export function tierRangeLabel(tier) {
  const min = Number(tier?.min || 0).toLocaleString();
  if (tier?.max === null || tier?.max === undefined || tier?.max === "") return `${min}+ pts`;
  return `${min} - ${Number(tier.max).toLocaleString()} pts`;
}

// An empty string from a number input means "no limit", not zero — treat both
// null and "" as unlimited so a cleared admin field never locks a reward.
function limitOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

// Everything the reward card needs to decide what to render, in one place so
// desktop and mobile can never disagree about whether something is claimable.
//
// `claimed` is how many of this reward the whole community has taken (from
// eco_reward_stock(); null when we don't know, e.g. offline demo mode) and
// `myClaims` how many the signed-in user already has.
export function rewardAvailability(reward, balance, { claimed = null, myClaims = 0 } = {}) {
  const cost = Number(reward?.points || 0);
  const stock = limitOrNull(reward?.stock);
  const perUser = limitOrNull(reward?.limitPerUser);
  const remaining = stock === null ? null : Math.max(0, stock - Number(claimed || 0));
  const soldOut = remaining !== null && remaining <= 0;
  const limitReached = perUser !== null && Number(myClaims || 0) >= perUser;
  const missing = Math.max(0, cost - Number(balance || 0));
  const affordable = missing === 0;
  return {
    cost,
    stock,
    perUser,
    remaining,
    soldOut,
    limitReached,
    missing,
    affordable,
    myClaims: Number(myClaims || 0),
    canRedeem: affordable && !soldOut && !limitReached,
    // How far the balance has come towards the cost, for the card's meter.
    percent: cost > 0 ? Math.min(100, Math.max(0, (Number(balance || 0) / cost) * 100)) : 100,
    reason: soldOut
      ? "Fully claimed"
      : limitReached
        ? `Limit ${perUser} per member`
        : affordable
          ? "Ready to redeem"
          : `${missing.toLocaleString()} pts to go`,
  };
}

// Lifetime totals derived from the two ledgers the dashboard already holds.
// Redemption points arrive pre-formatted as "-1,200", hence the parse.
export function pointsSummary(earnHistory = [], redeemHistory = []) {
  const earned = earnHistory.reduce((sum, e) => {
    const n = Number(e?.points || 0);
    return n > 0 ? sum + n : sum;
  }, 0);
  const spent = redeemHistory.reduce((sum, r) => {
    const n = Math.abs(parseInt(String(r?.points ?? 0).replace(/[^0-9-]/g, ""), 10) || 0);
    return sum + n;
  }, 0);
  return { earned, spent, claims: redeemHistory.length };
}

// The nearest badge the user has NOT unlocked, plus how close they are — drives
// the "next badge" progress card. Returns null once every badge is earned.
export function nextBadgeProgress(badges = [], points = 0) {
  const locked = badges
    .filter((b) => Number(points) < Number(b?.threshold || 0))
    .sort((a, b) => Number(a.threshold || 0) - Number(b.threshold || 0));
  const target = locked[0];
  if (!target) return null;
  const threshold = Number(target.threshold || 0);
  return {
    badge: target,
    remaining: Math.max(0, threshold - Number(points)),
    percent: threshold > 0 ? Math.min(100, Math.max(0, (Number(points) / threshold) * 100)) : 100,
  };
}

// How often the user has actually triggered each earn rule, and what it has
// paid them in total. Matched on the action name, which is the ledger's key.
export function earnRuleStats(rule, earnHistory = []) {
  const rows = earnHistory.filter((e) => e?.action === rule?.action);
  return {
    times: rows.length,
    total: rows.reduce((sum, e) => sum + Number(e?.points || 0), 0),
  };
}
