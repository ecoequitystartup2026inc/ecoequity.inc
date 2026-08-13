import React, { useEffect, useState } from "react";
import Reveal, { RevealStyles, useInView, prefersReducedMotion } from "./Reveal";
import ComingSoonBanner from "./ComingSoonBanner";
import {
  Store, Wrench, Microscope, Handshake, GraduationCap, Users,
  Sprout, HeartPulse, TrendingUp, ArrowRight, Sparkles, Leaf, Check,
  HeartHandshake, School, Droplets, ShieldCheck, Heart,
  Receipt, CheckCircle2, Truck, Wallet, Clock, Globe2, Plus, Minus,
} from "lucide-react";

/* ── Landing page sections that live BELOW the hero ──────────────────────
   The hero occupies exactly one screen; everything here is the reward for
   scrolling. Colours/glass are lifted from the hero so the fold is
   invisible: white-to-mint glass, green→sky gradients, hairline borders. */

const INK = "var(--eco-c19)";
const INK_SOFT = "rgba(var(--eco-c19-rgb), 0.6)";
const GREEN = "var(--eco-c9)";
const SKY = "var(--eco-c6)";

const FEATURES = [
  {
    nav: "Shop All Products",
    Icon: Store,
    title: "Farm-Direct Shop",
    body: "Harvests, seeds and supplies sourced straight from local growers — no middleman markup.",
  },
  {
    nav: "Starter Kits & Toolsets",
    Icon: Wrench,
    title: "Starter Kits",
    body: "Everything a first-time grower needs, boxed and ready to plant this weekend.",
  },
  {
    nav: "AIPlantDoctor",
    Icon: Microscope,
    title: "AI Plant Doctor",
    body: "Snap a photo of a sick leaf and get a diagnosis with a treatment plan in seconds.",
  },
  {
    nav: "SurplusExchangePage",
    Icon: Handshake,
    title: "Surplus Exchange",
    body: "Trade the extra harvest with neighbours instead of letting good food spoil.",
  },
  {
    nav: "Specialist Certification",
    Icon: GraduationCap,
    title: "Specialist Certification",
    body: "Short, practical courses that turn backyard growers into certified specialists.",
  },
  {
    nav: "Community",
    Icon: Users,
    title: "Community Forum",
    body: "Ask, answer and swap tips with growers and advisors across the country.",
  },
];

/* Buttons elsewhere on the page that lead to a not-yet-open tool reuse that
   tool's tile copy, so the "coming soon" card reads the same however it was
   reached. */
const feature = (nav) => FEATURES.find((f) => f.nav === nav);

const STEPS = [
  {
    nav: "Farm Planner",
    Icon: Sprout,
    title: "Plan your plot",
    body: "Tell us your space, season and goals. The Farm Planner lays out what to plant and when.",
    detail: [
      "A planting calendar matched to your barangay's season",
      "Starter kits and seeds costed out before you spend",
    ],
    cta: "Open the Farm Planner",
  },
  {
    nav: "AIPlantDoctor",
    Icon: HeartPulse,
    title: "Grow with guidance",
    body: "AI diagnosis, expert advisors and hands-on workshops keep every crop on track.",
    detail: [
      "Photo diagnosis with a treatment plan in seconds",
      "Advisors and workshops when the photo isn't enough",
    ],
    cta: "Try the AI Plant Doctor",
  },
  {
    nav: "SurplusExchangePage",
    Icon: TrendingUp,
    title: "Earn as you harvest",
    body: "Sell the surplus, redeem EcoPoints, and turn a backyard into steady income.",
    detail: [
      "List surplus to neighbours instead of letting it spoil",
      "EcoPoints convert into supplies for the next cycle",
    ],
    cta: "See the Surplus Exchange",
    // The exchange isn't open to users yet, so the CTA announces it instead of
    // navigating — carrying the tile's copy so the banner names the tool
    // ("Surplus Exchange"), not the step ("Earn as you harvest").
    comingSoon: feature("SurplusExchangePage"),
  },
];

/* Values are the programme's 2026 targets, not results to date — the caption
   under the band says so, so the big numbers can't be read as a claim. */
const TARGETS = [
  { value: 5000, suffix: "+", label: "Households growing" },
  { value: 120, suffix: "", label: "Barangays reached" },
  { value: 40, suffix: "k kg", label: "Surplus rescued" },
  // Label avoids "CO₂e" — the row is uppercased, which mangles the subscript.
  { value: 18, suffix: "t", label: "Carbon avoided" },
];

/* ── Community support ────────────────────────────────────────────────────
   Partner organisations and the seed fund that pays for the kits they hand
   out. Everything here is illustrative placeholder copy, same as TARGETS
   above — the captions under each block say so, so a reader can't take the
   partner names or the raised total as a claim about money already moved. */

/* The ten goals the platform claims on the Learn More page, keyed by goal
   number. Titles and colours are lifted from `sdgItems` in pages/LearnMore.js
   so the two surfaces can't disagree about what a goal is called or what
   colour it is — including SDG 15, which that page renders in the sage deep
   tone rather than the UN green. Colours are stored as RGB triplets so the
   tinted chips below can be mixed at any alpha; official SDG colours are one
   of the deliberate off-palette sites (see the Appearance presets), so they
   stay as literals here rather than being folded onto --eco-cN.

   Goal titles are shortened for a chip — the full title and the target the
   platform aligns with live on Learn More, which the section links to. */
const SDG_GOALS = {
  1: { short: "No Poverty", rgb: "215, 25, 50" },
  2: { short: "Zero Hunger", rgb: "221, 166, 58" },
  8: { short: "Decent Work", rgb: "162, 25, 66" },
  9: { short: "Innovation", rgb: "255, 111, 44" },
  11: { short: "Sustainable Cities", rgb: "253, 157, 36" },
  12: { short: "Responsible Consumption", rgb: "191, 139, 46" },
  14: { short: "Life Below Water", rgb: "10, 151, 217" },
  15: { short: "Life on Land", rgb: "var(--eco-c13-rgb)" },
  16: { short: "Strong Institutions", rgb: "0, 104, 157" },
  17: { short: "Partnerships", rgb: "25, 72, 106" },
};

/* Goal numbers are printed two-digit ("SDG 02") to match the Learn More cards. */
const sdgNo = (n) => String(n).padStart(2, "0");

const NGO_PARTNERS = [
  {
    Icon: HeartHandshake,
    name: "Kapit-Bisig Growers",
    focus: "Food security",
    body: "Turns idle barangay lots into communal vegetable plots that feed the households tending them.",
    stat: "38 barangays",
    sdgs: [2, 1],
  },
  {
    Icon: School,
    name: "Buhay Aral Foundation",
    focus: "Youth education",
    body: "Runs school gardens and agri-science clubs in public elementary schools across the region.",
    stat: "6,400 students",
    sdgs: [2, 17],
  },
  {
    Icon: Sprout,
    name: "Binhi Heritage Trust",
    focus: "Native seeds",
    body: "Collects, stores and re-issues heirloom Philippine seed lines before they drop out of use.",
    stat: "210 seed lines",
    sdgs: [15, 2],
  },
  {
    Icon: Droplets,
    name: "Tubig at Lupa Network",
    focus: "Climate resilience",
    body: "Rebuilds soil and rainwater catchment on smallholder farms hit by typhoons and dry spells.",
    stat: "94 farms",
    sdgs: [15, 14],
  },
];

/* Tiers are priced off what a kit actually costs in the shop, so the impact
   line under each one is a description of the goods, not a promise. */
const GIVING_TIERS = [
  { amount: 150, impact: "A seed pack and soil starter for one household" },
  { amount: 500, impact: "A full starter kit — seeds, tools and a season of guidance", popular: true },
  { amount: 1500, impact: "One school garden bed, built and planted with the class" },
];

/* Where a peso goes. Shares sum to 100 — the bars are drawn from these. Each
   line also names the goal it buys down, so the plan is stated in the same
   vocabulary as the ledger underneath it. */
const FUND_SPLIT = [
  { label: "Starter kits & seeds", share: 45, sdgs: [2, 1] },
  { label: "Barangay training", share: 30, sdgs: [8] },
  { label: "Seed bank & storage", share: 25, sdgs: [15] },
];

const FUND_RAISED = 412900;
const FUND_GOAL = 750000;

/* Where a peso actually went. FUND_SPLIT above is the plan; this is the record
   the plan is judged against, newest first. The reconciliation strip on the
   board is derived from these rows rather than typed out a second time, so the
   four figures at the top can never drift out of agreement with the list under
   them.

   Every row carries the goals its spending advances, lead goal first. The
   lead is what the money is counted against in the per-goal strip — a release
   is attributed once and only once, so those figures still reconcile to the
   allocated total even though most rows touch two goals. */
const FUND_LEDGER = [
  {
    date: "18 Jul 2026", ref: "CSF-2607-018",
    partner: "Kapit-Bisig Growers",
    item: "62 starter kits — Brgy. Malanday",
    amount: 31000, status: "Receipt filed", sdgs: [1, 2],
  },
  {
    date: "02 Jul 2026", ref: "CSF-2607-002",
    partner: "Binhi Heritage Trust",
    item: "Cold storage for 210 heirloom seed lines",
    amount: 48500, status: "Receipt filed", sdgs: [15],
  },
  {
    date: "21 Jun 2026", ref: "CSF-2606-021",
    partner: "Buhay Aral Foundation",
    item: "9 school garden beds, built and planted",
    amount: 54000, status: "Receipt filed", sdgs: [2, 17],
  },
  {
    date: "09 Jun 2026", ref: "CSF-2606-009",
    partner: "Tubig at Lupa Network",
    item: "Rainwater catchment rebuilt on 12 farms",
    amount: 96400, status: "Released", sdgs: [15, 14],
  },
  {
    date: "27 May 2026", ref: "CSF-2605-027",
    partner: "Kapit-Bisig Growers",
    item: "Barangay training — 4 sessions, 180 growers",
    amount: 72000, status: "Released", sdgs: [8, 17],
  },
  {
    date: "14 May 2026", ref: "CSF-2605-014",
    partner: "Buhay Aral Foundation",
    item: "Seed packs for 6,400 students",
    amount: 59500, status: "In transit", sdgs: [2, 1],
  },
  {
    date: "03 Aug 2026", ref: "CSF-2608-003",
    partner: "Binhi Heritage Trust",
    item: "Q3 seed multiplication plots",
    amount: 44000, status: "Committed", sdgs: [15, 2],
  },
];

/* Statuses stay on the green→sky ramp instead of a traffic-light palette:
   none of them is an error state, they only say how far along the money is.
   `fill` is the pill's tint, rising as the row gets closer to settled. */
const LEDGER_STATUS = {
  "Receipt filed": { Icon: CheckCircle2, fill: 0.5 },
  Released: { Icon: Wallet, fill: 0.34 },
  "In transit": { Icon: Truck, fill: 0.22 },
  Committed: { Icon: Clock, fill: 0.12 },
};

/* Money that has left the fund vs money still only promised to a partner. */
const OUTGOING = ["Receipt filed", "Released", "In transit"];
const sumWhere = (statuses) => FUND_LEDGER
  .filter((row) => statuses.includes(row.status))
  .reduce((total, row) => total + row.amount, 0);

const FUND_DISBURSED = sumWhere(OUTGOING);
const FUND_COMMITTED = sumWhere(["Committed"]);
const FUND_UNALLOCATED = FUND_RAISED - FUND_DISBURSED - FUND_COMMITTED;
const FUND_ALLOCATED = FUND_DISBURSED + FUND_COMMITTED;
const FUND_RECONCILED = "31 July 2026";

/* Money per goal, folded out of the ledger on the lead goal of each row —
   derived, like the four reconciliation figures, so tagging a new release is
   the only edit needed. Biggest first, and every peso allocated lands in
   exactly one bar, so the strip sums to FUND_ALLOCATED. */
const SDG_ALLOCATION = Object.entries(
  FUND_LEDGER.reduce((totals, row) => {
    const lead = row.sdgs[0];
    return { ...totals, [lead]: (totals[lead] || 0) + row.amount };
  }, {})
)
  .map(([goal, amount]) => ({ goal: Number(goal), amount }))
  .sort((a, b) => b.amount - a.amount);

/* Every goal named anywhere in the section, lead or not — the row of chips
   under the heading, so the reader sees the whole spread before the detail. */
const SDG_COVERED = [...new Set([
  ...NGO_PARTNERS.flatMap((p) => p.sdgs),
  ...FUND_SPLIT.flatMap((r) => r.sdgs),
  ...FUND_LEDGER.flatMap((r) => r.sdgs),
])].sort((a, b) => a - b);

const peso = (n) => `₱${n.toLocaleString()}`;

/* Counts from 0 the first time the band scrolls into view. Reduced-motion
   users get the final number immediately (useInView resolves at once). */
function useCountUp(target, active, duration = 1400) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return undefined;
    if (prefersReducedMotion()) { setN(target); return undefined; }
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      // easeOutCubic — fast start, gentle landing
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, active, duration]);
  return n;
}

function SectionHeading({ eyebrow, title, accent, body, isMobile }) {
  return (
    <Reveal style={{ width: "100%", textAlign: "center", marginBottom: isMobile ? "18px" : "34px" }}>
      <span style={{
        display: "inline-flex", alignItems: "center", gap: "7px",
        padding: "6px 14px", borderRadius: "999px",
        background: "rgba(255,255,255,0.62)",
        border: "1px solid rgba(var(--eco-c9-rgb), 0.16)",
        fontSize: isMobile ? "10px" : "11px", fontWeight: 700,
        letterSpacing: "1.2px", textTransform: "uppercase", color: GREEN,
        backdropFilter: "blur(14px) saturate(170%)",
        WebkitBackdropFilter: "blur(14px) saturate(170%)",
      }}>
        <Leaf size={12} strokeWidth={2.6} />
        {eyebrow}
      </span>
      <h2 style={{
        margin: "12px 0 0",
        fontFamily: "'Poppins', sans-serif", fontWeight: 500,
        fontSize: isMobile ? "22px" : "clamp(26px, 3.2vw, 40px)",
        lineHeight: 1.12, letterSpacing: "-1.1px", color: INK,
      }}>
        {title} <span style={{
          background: `linear-gradient(120deg, ${GREEN}, ${SKY})`,
          WebkitBackgroundClip: "text", backgroundClip: "text",
          WebkitTextFillColor: "transparent", color: "transparent",
        }}>{accent}</span>
      </h2>
      {body && (
        <p style={{
          margin: "10px auto 0", maxWidth: "560px",
          fontSize: isMobile ? "13px" : "14px", lineHeight: 1.65,
          fontWeight: 500, color: INK_SOFT,
        }}>{body}</p>
      )}
    </Reveal>
  );
}

/* Glass tile with a gradient icon chip. Hover lifts the card and slides the
   arrow — the whole tile is the button so the target is the full 240px. */
function FeatureCard({ item, index, isMobile, onSelect }) {
  const [hov, setHov] = useState(false);
  const { Icon } = item;
  return (
    <Reveal delay={index * 70} style={{ display: "flex" }}>
      <button
        type="button"
        onClick={() => onSelect(item)}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          position: "relative", overflow: "hidden",
          display: "flex", flexDirection: "column", alignItems: "flex-start",
          gap: isMobile ? "9px" : "12px", width: "100%",
          padding: isMobile ? "16px 15px" : "22px 20px",
          borderRadius: "20px", textAlign: "left", cursor: "pointer",
          fontFamily: "inherit",
          background: hov
            ? "linear-gradient(150deg, rgba(255,255,255,0.94), rgba(var(--eco-c0-rgb), 0.72))"
            : "linear-gradient(150deg, rgba(255,255,255,0.74), rgba(255,255,255,0.46))",
          border: `1px solid ${hov ? "rgba(var(--eco-c9-rgb), 0.28)" : "rgba(255,255,255,0.8)"}`,
          /* Inset highlight only. A blurred drop shadow reads as a grey halo
             bleeding outside the card on this pale ground, so depth comes from
             the hairline border and the lift instead. */
          boxShadow: hov
            ? "inset 0 1px 0 rgba(255,255,255,0.9)"
            : "inset 0 1px 0 rgba(255,255,255,0.8)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          transform: hov ? "translateY(-6px)" : "translateY(0)",
          transition: "transform 0.3s cubic-bezier(.22,1,.36,1), box-shadow 0.3s ease, background 0.3s ease, border-color 0.3s ease",
        }}
      >
        {/* Corner wash that blooms on hover */}
        <span aria-hidden="true" style={{
          position: "absolute", top: "-40px", right: "-40px",
          width: "140px", height: "140px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(var(--eco-c5-rgb), 0.5), transparent 70%)",
          opacity: hov ? 1 : 0, transition: "opacity 0.35s ease", pointerEvents: "none",
        }} />
        <span aria-hidden="true" style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: isMobile ? "40px" : "46px", height: isMobile ? "40px" : "46px",
          borderRadius: "14px", flexShrink: 0,
          background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.85), rgba(var(--eco-c5-rgb), 0.8))",
          transform: hov ? "scale(1.06) rotate(-4deg)" : "none",
          transition: "transform 0.32s cubic-bezier(.22,1,.36,1), box-shadow 0.32s ease",
        }}>
          <Icon size={isMobile ? 20 : 23} color="var(--eco-c14)" strokeWidth={2.3} />
        </span>
        <span style={{ fontSize: isMobile ? "14px" : "16px", fontWeight: 800, color: INK, lineHeight: 1.25 }}>
          {item.title}
        </span>
        <span style={{ fontSize: isMobile ? "12px" : "13px", fontWeight: 500, lineHeight: 1.6, color: INK_SOFT }}>
          {item.body}
        </span>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "auto", paddingTop: "4px",
          fontSize: "12px", fontWeight: 750, color: GREEN,
          opacity: hov ? 1 : 0.72, transition: "opacity 0.25s ease",
        }}>
          Explore
          <ArrowRight size={14} strokeWidth={2.6} style={{
            transform: hov ? "translateX(4px)" : "none",
            transition: "transform 0.28s cubic-bezier(.22,1,.36,1)",
          }} />
        </span>
      </button>
    </Reveal>
  );
}

/* One numbered dot on the stepper rail. Steps already walked through stay
   filled, so the rail reads as progress rather than as three equal tabs. */
function RailDot({ step, index, active, done, onSelect, isMobile }) {
  const [hov, setHov] = useState(false);
  const size = isMobile ? 34 : 40;
  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      aria-label={`Step ${index + 1}: ${step.title}`}
      aria-current={active ? "step" : undefined}
      style={{
        position: "relative", zIndex: 1, flexShrink: 0,
        width: `${size}px`, height: `${size}px`, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", fontFamily: "'Poppins', sans-serif",
        fontSize: isMobile ? "13px" : "15px", fontWeight: 700, letterSpacing: "-0.2px",
        color: done ? "var(--eco-c14)" : GREEN,
        background: done
          ? `linear-gradient(135deg, ${GREEN}, ${SKY})`
          : "rgba(255,255,255,0.86)",
        border: `1px solid ${done ? "transparent" : "rgba(var(--eco-c9-rgb), 0.22)"}`,
        /* The active dot gets a halo ring instead of a shadow — a blurred drop
           shadow greys out on this pale ground (same call as the cards). */
        boxShadow: active
          ? `0 0 0 5px rgba(var(--eco-c9-rgb), 0.13)`
          : "inset 0 1px 0 rgba(255,255,255,0.9)",
        transform: active ? "scale(1.1)" : hov ? "scale(1.06)" : "scale(1)",
        transition: "transform 0.34s cubic-bezier(.22,1,.36,1), box-shadow 0.34s ease, background 0.4s ease, color 0.4s ease, border-color 0.4s ease",
      }}
    >
      {done && !active ? <Check size={isMobile ? 15 : 17} strokeWidth={3} /> : index + 1}
    </button>
  );
}

/* The rail itself: a hairline track with a gradient fill that grows to the
   active dot. Scaled with a transform, not width, so the glass stack around
   it never re-lays-out mid-animation. */
function StepRail({ steps, active, onSelect, isMobile }) {
  const dot = isMobile ? 34 : 40;
  const progress = steps.length > 1 ? active / (steps.length - 1) : 1;
  return (
    <div style={{
      position: "relative", display: "flex", alignItems: "center",
      justifyContent: "space-between", width: "100%",
      maxWidth: isMobile ? "260px" : "620px",
      margin: isMobile ? "0 auto 16px" : "0 auto 26px",
    }}>
      <span aria-hidden="true" style={{
        position: "absolute", top: "50%", left: `${dot / 2}px`, right: `${dot / 2}px`,
        height: "2px", borderRadius: "2px", transform: "translateY(-50%)",
        background: "rgba(var(--eco-c9-rgb), 0.14)",
      }} />
      <span aria-hidden="true" style={{
        position: "absolute", top: "50%", left: `${dot / 2}px`, right: `${dot / 2}px`,
        height: "2px", borderRadius: "2px",
        transform: `translateY(-50%) scaleX(${progress})`, transformOrigin: "left center",
        background: `linear-gradient(to right, ${GREEN}, ${SKY})`,
        transition: "transform 0.55s cubic-bezier(.22,1,.36,1)",
      }} />
      {steps.map((step, i) => (
        <RailDot
          key={step.title}
          step={step}
          index={i}
          active={i === active}
          done={i <= active}
          onSelect={onSelect}
          isMobile={isMobile}
        />
      ))}
    </div>
  );
}

/* Click once to open a step, again to jump to the tool it describes — so the
   card stays a single button and never nests interactive elements. */
function StepCard({ step, index, active, isMobile, onSelect, onOpen }) {
  const [hov, setHov] = useState(false);
  const { Icon } = step;
  const lifted = active || hov;
  return (
    <Reveal delay={index * 110} style={{ display: "flex", flex: active ? 1.25 : 1, minWidth: 0, transition: "flex 0.5s cubic-bezier(.22,1,.36,1)" }}>
      <button
        type="button"
        onClick={() => (active ? onOpen(step) : onSelect(index))}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        aria-current={active ? "step" : undefined}
        aria-label={active ? `${step.title} — ${step.cta}` : `Step ${index + 1}: ${step.title}`}
        style={{
          position: "relative", width: "100%", cursor: "pointer", fontFamily: "inherit",
          display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "10px",
          padding: isMobile ? "18px 16px" : "26px 22px",
          borderRadius: "22px", textAlign: "left",
          background: active
            ? "linear-gradient(155deg, rgba(255,255,255,0.94), rgba(240,253,250,0.72))"
            : "linear-gradient(155deg, rgba(255,255,255,0.8), rgba(240,253,250,0.5))",
          border: `1px solid ${active ? "rgba(var(--eco-c6-rgb), 0.34)" : hov ? "rgba(var(--eco-c6-rgb), 0.3)" : "rgba(255,255,255,0.82)"}`,
          boxShadow: lifted
            ? "inset 0 1px 0 rgba(255,255,255,0.9)"
            : "inset 0 1px 0 rgba(255,255,255,0.8)",
          backdropFilter: "blur(18px) saturate(175%)",
          WebkitBackdropFilter: "blur(18px) saturate(175%)",
          opacity: active || hov ? 1 : 0.78,
          transform: active ? "translateY(-6px)" : hov ? "translateY(-5px)" : "none",
          transition: "transform 0.3s cubic-bezier(.22,1,.36,1), box-shadow 0.3s ease, border-color 0.3s ease, background 0.4s ease, opacity 0.4s ease",
        }}
      >
        {/* Oversized ghost numeral — keeps the sequence readable at a glance */}
        <span aria-hidden="true" style={{
          position: "absolute", top: isMobile ? "6px" : "10px", right: "16px",
          fontFamily: "'Poppins', sans-serif", fontWeight: 700,
          fontSize: isMobile ? "44px" : "60px", lineHeight: 1,
          color: active ? "rgba(var(--eco-c9-rgb), 0.16)" : "rgba(var(--eco-c9-rgb), 0.09)",
          letterSpacing: "-3px", pointerEvents: "none",
          transition: "color 0.4s ease",
        }}>
          {index + 1}
        </span>
        <span aria-hidden="true" style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: "38px", height: "38px", borderRadius: "12px",
          background: active
            ? `linear-gradient(135deg, ${GREEN}, ${SKY})`
            : "rgba(255,255,255,0.85)",
          border: `1px solid ${active ? "transparent" : "rgba(var(--eco-c9-rgb), 0.18)"}`,
          transform: active ? "scale(1.06) rotate(-4deg)" : "none",
          transition: "transform 0.34s cubic-bezier(.22,1,.36,1), background 0.4s ease, border-color 0.4s ease",
        }}>
          <Icon size={19} color={active ? "var(--eco-c14)" : GREEN} strokeWidth={2.4} />
        </span>
        <span style={{ fontSize: isMobile ? "15px" : "17px", fontWeight: 800, color: INK, lineHeight: 1.25 }}>
          {step.title}
        </span>
        <span style={{ fontSize: isMobile ? "12px" : "13px", fontWeight: 500, lineHeight: 1.65, color: INK_SOFT }}>
          {step.body}
        </span>

        {/* Detail + CTA unfold on the open step. maxHeight (not display) so the
            card grows into it instead of snapping. */}
        <span style={{
          display: "block", width: "100%", overflow: "hidden",
          maxHeight: active ? "220px" : "0px",
          opacity: active ? 1 : 0,
          transition: "max-height 0.5s cubic-bezier(.22,1,.36,1), opacity 0.4s ease",
        }}>
          <span style={{ display: "flex", flexDirection: "column", gap: "7px", paddingTop: "4px" }}>
            {step.detail.map((line, di) => (
              <span key={line} style={{
                display: "flex", alignItems: "flex-start", gap: "7px",
                fontSize: isMobile ? "11.5px" : "12.5px", fontWeight: 550,
                lineHeight: 1.5, color: INK_SOFT,
                transform: active ? "none" : "translateY(6px)",
                opacity: active ? 1 : 0,
                transition: `transform 0.45s cubic-bezier(.22,1,.36,1) ${active ? 120 + di * 90 : 0}ms, opacity 0.45s ease ${active ? 120 + di * 90 : 0}ms`,
              }}>
                <Check size={13} strokeWidth={3} color={GREEN} style={{ flexShrink: 0, marginTop: "2px" }} />
                {line}
              </span>
            ))}
          </span>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "12px",
            padding: "7px 13px", borderRadius: "999px",
            background: `linear-gradient(120deg, ${GREEN}, ${SKY})`,
            fontSize: "12px", fontWeight: 750, color: "var(--eco-c14)",
          }}>
            {step.cta}
            <ArrowRight size={13} strokeWidth={2.8} style={{
              transform: hov ? "translateX(4px)" : "none",
              transition: "transform 0.28s cubic-bezier(.22,1,.36,1)",
            }} />
          </span>
        </span>
      </button>
    </Reveal>
  );
}

/* The three-step walkthrough. It plays itself once the section scrolls into
   view so the sequence is visible without a click, then hands control over
   for good the moment someone touches it (or hovers a card — advancing under
   the cursor would fight the reader). */
function HowItWorks({ isMobile, onNavigate, onComingSoon }) {
  const [ref, inView] = useInView();
  const [active, setActive] = useState(0);
  const [taken, setTaken] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!inView || taken || paused || prefersReducedMotion()) return undefined;
    const t = setInterval(() => setActive((a) => (a + 1) % STEPS.length), 4200);
    return () => clearInterval(t);
  }, [inView, taken, paused]);

  const select = (i) => { setTaken(true); setActive(i); };

  return (
    <div style={{ width: "100%" }} ref={ref}>
      <SectionHeading
        eyebrow="How it works"
        title="Three steps from"
        accent="plot to profit"
        isMobile={isMobile}
      />
      <StepRail steps={STEPS} active={active} onSelect={select} isMobile={isMobile} />
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        style={{
          position: "relative",
          display: "flex", flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? "12px" : "18px", alignItems: "stretch",
        }}
      >
        {STEPS.map((step, i) => (
          <StepCard
            key={step.title}
            step={step}
            index={i}
            active={i === active}
            isMobile={isMobile}
            onSelect={select}
            onOpen={(s) => (s.comingSoon ? onComingSoon(s.comingSoon) : onNavigate(s.nav))}
          />
        ))}
      </div>
    </div>
  );
}

function TargetBand({ isMobile }) {
  const [ref, inView] = useInView();
  return (
    <Reveal style={{ width: "100%" }}>
      {/* The counters watch this inner node — <Reveal> owns its own ref. */}
      <div
        ref={ref}
        style={{
          position: "relative", overflow: "hidden", width: "100%",
          padding: isMobile ? "22px 18px" : "34px 40px",
          borderRadius: "26px",
          background: "linear-gradient(135deg, rgba(var(--eco-c9-rgb), 0.94), rgba(13,148,136,0.9) 55%, rgba(var(--eco-c6-rgb), 0.86))",
        }}
      >
        {/* Dotted texture + soft glow, echoing the hero's decorative grid */}
        <span aria-hidden="true" style={{
          position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.5,
          backgroundImage: "radial-gradient(rgba(255,255,255,0.28) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
          WebkitMaskImage: "linear-gradient(to bottom, #000, transparent)",
          maskImage: "linear-gradient(to bottom, #000, transparent)",
        }} />
        <span aria-hidden="true" style={{
          position: "absolute", top: "-30%", right: "-8%", width: "320px", height: "320px",
          borderRadius: "50%", pointerEvents: "none",
          background: "radial-gradient(circle, rgba(255,255,255,0.28), transparent 68%)",
        }} />
        <div style={{
          position: "relative", display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between", gap: isMobile ? "18px" : "28px",
          flexWrap: "wrap",
        }}>
          <div style={{ maxWidth: isMobile ? "100%" : "260px" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              fontSize: "10px", fontWeight: 700, letterSpacing: "1.3px",
              textTransform: "uppercase", color: "rgba(255,255,255,0.82)",
            }}>
              <Sparkles size={12} strokeWidth={2.6} /> Where we're headed
            </span>
            <h3 style={{
              margin: "8px 0 0", fontFamily: "'Poppins', sans-serif", fontWeight: 500,
              fontSize: isMobile ? "20px" : "26px", lineHeight: 1.15,
              letterSpacing: "-0.8px", color: "#fff",
            }}>
              The 2026 goal, in numbers
            </h3>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2, minmax(0,1fr))" : "repeat(4, minmax(0,1fr))",
            gap: isMobile ? "14px 12px" : "clamp(18px, 3vw, 40px)",
            flex: 1, minWidth: 0,
          }}>
            {TARGETS.map((t) => (
              <TargetStat key={t.label} target={t} active={inView} isMobile={isMobile} />
            ))}
          </div>
        </div>
        <p style={{
          position: "relative", margin: isMobile ? "16px 0 0" : "20px 0 0",
          fontSize: "11px", fontWeight: 500, color: "rgba(255,255,255,0.72)",
        }}>
          Programme targets for 2026 — not results to date.
        </p>
      </div>
    </Reveal>
  );
}

function TargetStat({ target, active, isMobile }) {
  const n = useCountUp(target.value, active);
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{
        fontFamily: "'Poppins', sans-serif", fontWeight: 600,
        fontSize: isMobile ? "24px" : "clamp(26px, 2.6vw, 34px)",
        lineHeight: 1, letterSpacing: "-1.4px", color: "#fff",
      }}>
        {n.toLocaleString()}{target.suffix}
      </div>
      <div style={{
        marginTop: "6px", fontSize: isMobile ? "10px" : "11px", fontWeight: 600,
        letterSpacing: "0.8px", textTransform: "uppercase", color: "rgba(255,255,255,0.78)",
        lineHeight: 1.35,
      }}>
        {target.label}
      </div>
    </div>
  );
}

/* One goal, as a pill. The UN colour is carried by a dot and a hairline tint
   rather than a solid fill: half the SDG palette is a mid-yellow that would
   leave 10px white text unreadable, so the label stays in page ink and the
   colour only has to be recognised, not read through. */
function SdgChip({ goal, compact = false }) {
  const sdg = SDG_GOALS[goal];
  if (!sdg) return null;
  const label = `SDG ${sdgNo(goal)} · ${sdg.short}`;
  return (
    <span
      title={label}
      style={{
        position: "relative",
        display: "inline-flex", alignItems: "center", gap: "5px",
        padding: compact ? "2px 7px" : "3px 9px", borderRadius: "999px",
        background: `rgba(${sdg.rgb}, 0.1)`,
        border: `1px solid rgba(${sdg.rgb}, 0.34)`,
        fontSize: compact ? "9.5px" : "10px", fontWeight: 700,
        letterSpacing: "0.3px", color: INK, whiteSpace: "nowrap",
      }}
    >
      <span aria-hidden="true" style={{
        width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0,
        background: `rgb(${sdg.rgb})`,
      }} />
      {compact ? (
        <>
          {sdgNo(goal)}
          <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
            {label}
          </span>
        </>
      ) : label}
    </span>
  );
}

/* A row of them. `compact` drops the goal titles — used where the pills ride
   alongside dense figures and the full labels would wrap the row. */
function SdgChips({ goals, compact = false, style }) {
  return (
    <span style={{ display: "flex", flexWrap: "wrap", gap: "6px", ...style }}>
      {goals.map((g) => <SdgChip key={g} goal={g} compact={compact} />)}
    </span>
  );
}

/* Partner tile. Laid out on its side — icon chip beside the copy — so the row
   of NGOs reads differently from the vertical "what's inside" tiles above and
   the page doesn't say the same shape twice. Not a button: these are named
   organisations, not destinations, so nothing here claims to be clickable. */
function PartnerCard({ item, index, isMobile }) {
  const [hov, setHov] = useState(false);
  const { Icon } = item;
  return (
    <Reveal delay={index * 80} style={{ display: "flex" }}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          position: "relative", overflow: "hidden",
          display: "flex", alignItems: "flex-start", gap: isMobile ? "12px" : "15px",
          width: "100%", padding: isMobile ? "15px 15px" : "20px 22px",
          borderRadius: "20px",
          background: hov
            ? "linear-gradient(150deg, rgba(255,255,255,0.94), rgba(var(--eco-c0-rgb), 0.72))"
            : "linear-gradient(150deg, rgba(255,255,255,0.74), rgba(255,255,255,0.46))",
          border: `1px solid ${hov ? "rgba(var(--eco-c9-rgb), 0.28)" : "rgba(255,255,255,0.8)"}`,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          transform: hov ? "translateY(-5px)" : "translateY(0)",
          transition: "transform 0.3s cubic-bezier(.22,1,.36,1), background 0.3s ease, border-color 0.3s ease",
        }}
      >
        <span aria-hidden="true" style={{
          position: "absolute", top: "-46px", right: "-46px",
          width: "150px", height: "150px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(var(--eco-c5-rgb), 0.5), transparent 70%)",
          opacity: hov ? 1 : 0, transition: "opacity 0.35s ease", pointerEvents: "none",
        }} />
        <span aria-hidden="true" style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: isMobile ? "42px" : "48px", height: isMobile ? "42px" : "48px",
          borderRadius: "15px", flexShrink: 0,
          background: `linear-gradient(135deg, ${GREEN}, ${SKY})`,
          transform: hov ? "scale(1.06) rotate(-4deg)" : "none",
          transition: "transform 0.32s cubic-bezier(.22,1,.36,1)",
        }}>
          <Icon size={isMobile ? 20 : 23} color="var(--eco-c14)" strokeWidth={2.3} />
        </span>
        <div style={{ position: "relative", minWidth: 0, flex: 1 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            flexWrap: "wrap", marginBottom: "5px",
          }}>
            <span style={{ fontSize: isMobile ? "14px" : "15.5px", fontWeight: 800, color: INK, lineHeight: 1.25 }}>
              {item.name}
            </span>
            <span style={{
              padding: "3px 9px", borderRadius: "999px",
              background: "rgba(var(--eco-c5-rgb), 0.5)",
              fontSize: "10px", fontWeight: 700, letterSpacing: "0.5px",
              textTransform: "uppercase", color: GREEN, whiteSpace: "nowrap",
            }}>
              {item.focus}
            </span>
          </div>
          <p style={{
            margin: 0, fontSize: isMobile ? "12px" : "13px",
            fontWeight: 500, lineHeight: 1.6, color: INK_SOFT,
          }}>
            {item.body}
          </p>
          <span style={{
            display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap",
            marginTop: "9px",
          }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              fontSize: "11.5px", fontWeight: 750, color: GREEN,
            }}>
              <Leaf size={12} strokeWidth={2.6} />
              {item.stat}
            </span>
            {/* Which goals this partner's work counts towards. Sits on the
                stat line, not under the body copy, so the card still reads
                name → what they do → what it adds up to. */}
            <SdgChips goals={item.sdgs} compact={isMobile} />
          </span>
        </div>
      </div>
    </Reveal>
  );
}

/* One-time / Monthly. A sliding gradient thumb under two labels, moved with a
   transform rather than by repainting each half, so the glass behind it never
   re-composites mid-slide. */
function CadenceToggle({ cadence, onChange, isMobile }) {
  const options = ["One-time", "Monthly"];
  return (
    <div
      role="radiogroup"
      aria-label="Giving frequency"
      style={{
        position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr",
        padding: "4px", borderRadius: "999px",
        background: "rgba(255,255,255,0.66)",
        border: "1px solid rgba(var(--eco-c9-rgb), 0.14)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
      }}
    >
      <span aria-hidden="true" style={{
        position: "absolute", top: "4px", bottom: "4px", left: "4px",
        width: "calc(50% - 4px)", borderRadius: "999px",
        background: `linear-gradient(120deg, ${GREEN}, ${SKY})`,
        transform: cadence === "Monthly" ? "translateX(100%)" : "translateX(0)",
        transition: "transform 0.42s cubic-bezier(.22,1,.36,1)",
      }} />
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          role="radio"
          aria-checked={cadence === opt}
          onClick={() => onChange(opt)}
          style={{
            position: "relative", zIndex: 1, minHeight: isMobile ? "34px" : "38px",
            border: "none", background: "transparent", cursor: "pointer",
            fontFamily: "inherit", fontSize: isMobile ? "12px" : "13px", fontWeight: 750,
            letterSpacing: "0.2px", borderRadius: "999px",
            color: cadence === opt ? "var(--eco-c14)" : INK_SOFT,
            transition: "color 0.35s ease",
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

/* A giving tier. The amount sits in its own chip on the left and the impact
   line explains what the money buys — the row is the radio, so the target is
   the full width rather than a dot. */
function TierRow({ tier, selected, cadence, onSelect, isMobile }) {
  const [hov, setHov] = useState(false);
  const lit = selected || hov;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(tier.amount)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: isMobile ? "11px" : "14px",
        width: "100%", padding: isMobile ? "11px 12px" : "13px 15px",
        borderRadius: "16px", textAlign: "left", cursor: "pointer", fontFamily: "inherit",
        background: selected
          ? "linear-gradient(140deg, rgba(255,255,255,0.96), rgba(var(--eco-c0-rgb), 0.78))"
          : hov ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.58)",
        border: `1px solid ${selected ? "rgba(var(--eco-c9-rgb), 0.34)" : "rgba(255,255,255,0.82)"}`,
        boxShadow: selected
          ? "inset 0 1px 0 rgba(255,255,255,0.95)"
          : "inset 0 1px 0 rgba(255,255,255,0.8)",
        transform: lit ? "translateX(3px)" : "none",
        transition: "transform 0.28s cubic-bezier(.22,1,.36,1), background 0.3s ease, border-color 0.3s ease",
      }}
    >
      <span aria-hidden="true" style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        minWidth: isMobile ? "62px" : "72px", padding: "7px 10px",
        borderRadius: "12px", flexShrink: 0,
        fontFamily: "'Poppins', sans-serif", fontWeight: 700, letterSpacing: "-0.4px",
        fontSize: isMobile ? "14px" : "15px",
        color: selected ? "var(--eco-c14)" : GREEN,
        background: selected
          ? `linear-gradient(135deg, ${GREEN}, ${SKY})`
          : "rgba(var(--eco-c5-rgb), 0.5)",
        transition: "background 0.35s ease, color 0.35s ease",
      }}>
        {peso(tier.amount)}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          display: "flex", alignItems: "center", gap: "7px", flexWrap: "wrap",
        }}>
          <span style={{
            fontSize: isMobile ? "11.5px" : "12.5px", fontWeight: 600,
            lineHeight: 1.5, color: INK_SOFT,
          }}>
            {tier.impact}
          </span>
          {tier.popular && (
            <span style={{
              padding: "2px 8px", borderRadius: "999px",
              background: "rgba(var(--eco-c5-rgb), 0.62)",
              fontSize: "9.5px", fontWeight: 800, letterSpacing: "0.7px",
              textTransform: "uppercase", color: GREEN, whiteSpace: "nowrap",
            }}>
              Most chosen
            </span>
          )}
        </span>
        {cadence === "Monthly" && (
          <span style={{
            display: "block", marginTop: "3px",
            fontSize: "11px", fontWeight: 600, color: GREEN, opacity: 0.85,
          }}>
            every month
          </span>
        )}
      </span>
      <span aria-hidden="true" style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: "22px", height: "22px", borderRadius: "50%", flexShrink: 0,
        background: selected ? `linear-gradient(135deg, ${GREEN}, ${SKY})` : "transparent",
        border: `1px solid ${selected ? "transparent" : "rgba(var(--eco-c9-rgb), 0.24)"}`,
        transition: "background 0.3s ease, border-color 0.3s ease",
      }}>
        {selected && <Check size={13} strokeWidth={3.2} color="var(--eco-c14)" />}
      </span>
    </button>
  );
}

/* Raised-so-far meter. The bar is scaled with a transform (not width) for the
   same reason the step rail is, and the number counts up once on entry. */
function FundMeter({ isMobile }) {
  const [ref, inView] = useInView();
  const raised = useCountUp(FUND_RAISED, inView, 1600);
  const pct = Math.min(FUND_RAISED / FUND_GOAL, 1);
  return (
    <div ref={ref} style={{ width: "100%" }}>
      <div style={{
        display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap",
      }}>
        <span style={{
          fontFamily: "'Poppins', sans-serif", fontWeight: 600,
          fontSize: isMobile ? "26px" : "clamp(28px, 2.6vw, 34px)",
          lineHeight: 1, letterSpacing: "-1.4px", color: INK,
        }}>
          {peso(raised)}
        </span>
        <span style={{ fontSize: isMobile ? "12px" : "13px", fontWeight: 600, color: INK_SOFT }}>
          pledged of {peso(FUND_GOAL)}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={FUND_GOAL}
        aria-valuenow={FUND_RAISED}
        aria-label="Community Seed Fund progress"
        style={{
          position: "relative", overflow: "hidden",
          width: "100%", height: "9px", marginTop: "12px",
          borderRadius: "999px",
          background: "rgba(var(--eco-c9-rgb), 0.13)",
        }}
      >
        <span aria-hidden="true" style={{
          position: "absolute", inset: 0, borderRadius: "999px",
          background: `linear-gradient(to right, ${GREEN}, ${SKY})`,
          transform: `scaleX(${inView ? pct : 0})`, transformOrigin: "left center",
          transition: "transform 1.4s cubic-bezier(.22,1,.36,1)",
        }} />
      </div>
      <p style={{
        margin: "9px 0 0", fontSize: "11px", fontWeight: 600,
        letterSpacing: "0.3px", color: INK_SOFT,
      }}>
        {Math.round(pct * 100)}% of the 2026 Community Seed Fund
      </p>
    </div>
  );
}

/* The giving panel: what the fund is and where it goes on the left, the
   amount picker on the right. Same glass slab as the closing CTA so the two
   read as one family rather than two different cards. */
function DonationPanel({ isMobile, onGive, onNavigate }) {
  const [cadence, setCadence] = useState("One-time");
  const [amount, setAmount] = useState(500);
  const [custom, setCustom] = useState("");
  const [customFocus, setCustomFocus] = useState(false);
  const [giveHov, setGiveHov] = useState(false);
  const [partnerHov, setPartnerHov] = useState(false);

  // A typed amount wins over the tier rows; clearing the field hands the
  // selection back to whichever tier was last lit.
  const customValue = Number(custom.replace(/[^0-9]/g, ""));
  const chosen = custom && customValue > 0 ? customValue : amount;

  return (
    <Reveal style={{ width: "100%" }}>
      <div style={{
        position: "relative", overflow: "hidden", width: "100%",
        padding: isMobile ? "24px 18px" : "38px 40px",
        borderRadius: "26px",
        background: "linear-gradient(150deg, rgba(255,255,255,0.86), rgba(var(--eco-c0-rgb), 0.6))",
        border: "1px solid rgba(255,255,255,0.86)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
        backdropFilter: "blur(22px) saturate(180%)",
        WebkitBackdropFilter: "blur(22px) saturate(180%)",
      }}>
        <span aria-hidden="true" style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(65% 80% at 15% 0%, rgba(var(--eco-c5-rgb), 0.32), transparent 70%)",
        }} />

        <div style={{
          position: "relative", display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1fr) minmax(0, 1.05fr)",
          gap: isMobile ? "24px" : "clamp(28px, 4vw, 54px)",
          alignItems: "start",
        }}>
          {/* ── What the fund is ── */}
          <div style={{ minWidth: 0 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "7px",
              padding: "6px 13px", borderRadius: "999px",
              background: "rgba(255,255,255,0.66)",
              border: "1px solid rgba(var(--eco-c9-rgb), 0.16)",
              fontSize: "10px", fontWeight: 700, letterSpacing: "1.2px",
              textTransform: "uppercase", color: GREEN,
            }}>
              <Heart size={11} strokeWidth={2.8} /> Community Seed Fund
            </span>
            <h3 style={{
              margin: "12px 0 0", fontFamily: "'Poppins', sans-serif", fontWeight: 500,
              fontSize: isMobile ? "20px" : "clamp(22px, 2.6vw, 30px)",
              lineHeight: 1.16, letterSpacing: "-1px", color: INK,
            }}>
              Give once, and a household{" "}
              <span style={{
                background: `linear-gradient(120deg, ${GREEN}, ${SKY})`,
                WebkitBackgroundClip: "text", backgroundClip: "text",
                WebkitTextFillColor: "transparent", color: "transparent",
              }}>eats all season</span>
            </h3>
            <p style={{
              margin: "10px 0 0", maxWidth: "440px",
              fontSize: isMobile ? "13px" : "14px", lineHeight: 1.65,
              fontWeight: 500, color: INK_SOFT,
            }}>
              The fund buys the kits, seeds and training our partner NGOs hand out in
              barangays that can't yet pay for them. Nothing is held back for the
              platform.
            </p>

            <div style={{ marginTop: isMobile ? "20px" : "26px" }}>
              <FundMeter isMobile={isMobile} />
            </div>

            {/* ── Where a peso goes ── */}
            <span style={{
              display: "block", marginTop: isMobile ? "20px" : "26px",
              fontSize: "10px", fontWeight: 700, letterSpacing: "0.9px",
              textTransform: "uppercase", color: INK_SOFT,
            }}>
              Where a peso goes — and the goal it buys down
            </span>
            <div style={{
              display: "flex", flexDirection: "column", gap: "13px",
              marginTop: "12px",
            }}>
              {FUND_SPLIT.map((row) => (
                <div key={row.label} style={{ width: "100%" }}>
                  <div style={{
                    display: "flex", justifyContent: "space-between", gap: "10px",
                    fontSize: isMobile ? "11.5px" : "12.5px", fontWeight: 650, color: INK,
                  }}>
                    <span>{row.label}</span>
                    <span style={{ color: GREEN }}>{row.share}%</span>
                  </div>
                  <div style={{
                    position: "relative", overflow: "hidden",
                    height: "5px", marginTop: "6px", borderRadius: "999px",
                    background: "rgba(var(--eco-c9-rgb), 0.11)",
                  }}>
                    <span aria-hidden="true" style={{
                      position: "absolute", inset: 0, borderRadius: "999px",
                      background: `linear-gradient(to right, ${GREEN}, ${SKY})`,
                      transform: `scaleX(${row.share / 100})`, transformOrigin: "left center",
                    }} />
                  </div>
                  <SdgChips goals={row.sdgs} compact={isMobile} style={{ marginTop: "7px" }} />
                </div>
              ))}
            </div>
          </div>

          {/* ── Pick an amount ── */}
          <div style={{
            minWidth: 0, display: "flex", flexDirection: "column",
            gap: isMobile ? "12px" : "14px",
            padding: isMobile ? "16px 14px" : "22px 22px",
            borderRadius: "22px",
            background: "linear-gradient(155deg, rgba(255,255,255,0.8), rgba(255,255,255,0.5))",
            border: "1px solid rgba(255,255,255,0.86)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
          }}>
            <CadenceToggle cadence={cadence} onChange={setCadence} isMobile={isMobile} />

            <div role="radiogroup" aria-label="Donation amount" style={{
              display: "flex", flexDirection: "column", gap: "9px",
            }}>
              {GIVING_TIERS.map((tier) => (
                <TierRow
                  key={tier.amount}
                  tier={tier}
                  selected={!custom && amount === tier.amount}
                  cadence={cadence}
                  onSelect={(v) => { setCustom(""); setAmount(v); }}
                  isMobile={isMobile}
                />
              ))}
            </div>

            {/* Custom amount. Sits outside the radio group — it's an input, and
                announcing it as a fourth radio would lie about what it is. */}
            <label style={{
              display: "flex", alignItems: "center", gap: "9px",
              padding: isMobile ? "10px 13px" : "12px 15px",
              borderRadius: "16px", cursor: "text",
              background: customFocus ? "rgba(255,255,255,0.94)" : "rgba(255,255,255,0.58)",
              border: `1px solid ${customFocus ? "rgba(var(--eco-c9-rgb), 0.34)" : "rgba(255,255,255,0.82)"}`,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
              transition: "background 0.28s ease, border-color 0.28s ease",
            }}>
              <span style={{
                fontFamily: "'Poppins', sans-serif", fontSize: "15px",
                fontWeight: 700, color: GREEN,
              }}>₱</span>
              <input
                type="text"
                inputMode="numeric"
                value={custom}
                onChange={(e) => setCustom(e.target.value.replace(/[^0-9]/g, "").slice(0, 7))}
                onFocus={() => setCustomFocus(true)}
                onBlur={() => setCustomFocus(false)}
                placeholder="Another amount"
                aria-label="Custom donation amount in pesos"
                style={{
                  flex: 1, minWidth: 0, border: "none", outline: "none",
                  background: "transparent", fontFamily: "inherit",
                  fontSize: isMobile ? "13px" : "14px", fontWeight: 650, color: INK,
                }}
              />
            </label>

            <button
              type="button"
              onClick={() => onGive({ amount: chosen, cadence })}
              onMouseEnter={() => setGiveHov(true)}
              onMouseLeave={() => setGiveHov(false)}
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px",
                width: "100%", minHeight: "48px", padding: "0 20px",
                borderRadius: "999px", cursor: "pointer",
                border: "1px solid rgba(255,255,255,0.5)",
                fontFamily: "inherit", fontSize: "14px", fontWeight: 750, color: "#fff",
                background: `linear-gradient(135deg, ${GREEN}, var(--eco-c9) 60%, ${SKY})`,
                transform: giveHov ? "translateY(-3px)" : "none",
                transition: "transform 0.26s cubic-bezier(.22,1,.36,1)",
              }}
            >
              Donate {peso(chosen)}{cadence === "Monthly" ? " / month" : ""}
              <ArrowRight size={16} strokeWidth={2.6} style={{
                transform: giveHov ? "translateX(4px)" : "none",
                transition: "transform 0.26s cubic-bezier(.22,1,.36,1)",
              }} />
            </button>

            <button
              type="button"
              onClick={() => onNavigate("Contact")}
              onMouseEnter={() => setPartnerHov(true)}
              onMouseLeave={() => setPartnerHov(false)}
              style={{
                width: "100%", minHeight: "44px", padding: "0 20px",
                borderRadius: "999px", cursor: "pointer", fontFamily: "inherit",
                fontSize: "13px", fontWeight: 750, color: INK,
                background: partnerHov ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.7)",
                border: "1px solid rgba(var(--eco-c19-rgb), 0.1)",
                transition: "background 0.26s ease",
              }}
            >
              Partner your organisation with us
            </button>

            <span style={{
              display: "flex", alignItems: "flex-start", gap: "7px",
              fontSize: "11px", fontWeight: 550, lineHeight: 1.5, color: INK_SOFT,
            }}>
              <ShieldCheck size={13} strokeWidth={2.4} color={GREEN} style={{ flexShrink: 0, marginTop: "1px" }} />
              Donations go to the receiving partner NGO, which issues the receipt.
            </span>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* One of the four figures across the top of the board. The three that come
   from the ledger are tinted; the unallocated remainder is left plain so the
   eye reads it as what's left over rather than a fourth achievement. */
function ReconcileStat({ label, value, note, tinted, isMobile }) {
  return (
    <div style={{
      minWidth: 0, padding: isMobile ? "12px 13px" : "14px 16px",
      borderRadius: "16px",
      background: tinted
        ? "linear-gradient(150deg, rgba(255,255,255,0.9), rgba(var(--eco-c0-rgb), 0.66))"
        : "rgba(255,255,255,0.52)",
      border: `1px solid ${tinted ? "rgba(var(--eco-c9-rgb), 0.16)" : "rgba(255,255,255,0.82)"}`,
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
    }}>
      <span style={{
        display: "block", fontSize: "10px", fontWeight: 700,
        letterSpacing: "0.9px", textTransform: "uppercase", color: INK_SOFT,
      }}>
        {label}
      </span>
      <span style={{
        display: "block", marginTop: "6px",
        fontFamily: "'Poppins', sans-serif", fontWeight: 500,
        fontSize: isMobile ? "18px" : "clamp(19px, 2vw, 23px)",
        letterSpacing: "-0.6px", lineHeight: 1.1,
        color: tinted ? GREEN : INK,
      }}>
        {peso(value)}
      </span>
      <span style={{
        display: "block", marginTop: "4px",
        fontSize: "10.5px", fontWeight: 550, lineHeight: 1.45, color: INK_SOFT,
      }}>
        {note}
      </span>
    </div>
  );
}

/* A single line of the ledger. Laid out as a wrapping flex row rather than a
   table: the description takes the slack, and the amount + status ride
   together on the right, so the same markup stacks cleanly on a phone without
   a second grid definition. */
function LedgerRow({ row, index, isMobile }) {
  const { Icon, fill } = LEDGER_STATUS[row.status];
  return (
    <Reveal delay={Math.min(index, 5) * 60} style={{ display: "flex" }}>
      <li style={{
        display: "flex", alignItems: "flex-start", flexWrap: "wrap",
        gap: isMobile ? "10px" : "16px",
        width: "100%", padding: isMobile ? "13px 14px" : "15px 18px",
        borderRadius: "16px",
        background: "linear-gradient(150deg, rgba(255,255,255,0.74), rgba(255,255,255,0.44))",
        border: "1px solid rgba(255,255,255,0.8)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
      }}>
        <div style={{ flex: "1 1 220px", minWidth: 0 }}>
          <div style={{
            display: "flex", alignItems: "baseline", gap: "9px", flexWrap: "wrap",
          }}>
            <span style={{
              fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.4px",
              color: INK_SOFT, whiteSpace: "nowrap",
            }}>
              {row.date}
            </span>
            <span style={{
              fontSize: isMobile ? "13px" : "14px", fontWeight: 750,
              color: INK, lineHeight: 1.3,
            }}>
              {row.partner}
            </span>
          </div>
          <p style={{
            margin: "5px 0 0", fontSize: isMobile ? "12px" : "12.5px",
            fontWeight: 500, lineHeight: 1.55, color: INK_SOFT,
          }}>
            {row.item}
          </p>
          <span style={{
            display: "flex", alignItems: "center", gap: "7px", flexWrap: "wrap",
            marginTop: "7px",
          }}>
            <span style={{
              padding: "2px 8px", borderRadius: "7px",
              background: "rgba(var(--eco-c9-rgb), 0.08)",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: "10px", fontWeight: 600, letterSpacing: "0.3px", color: INK_SOFT,
            }}>
              {row.ref}
            </span>
            {/* Lead goal first — the one this release is counted against in
                the strip above, so a reader can trace a figure back to rows. */}
            <SdgChips goals={row.sdgs} compact={isMobile} />
          </span>
        </div>

        <div style={{
          display: "flex", flexDirection: "column", alignItems: "flex-end",
          gap: "7px", flexShrink: 0, marginLeft: "auto",
        }}>
          <span style={{
            fontFamily: "'Poppins', sans-serif", fontWeight: 500,
            fontSize: isMobile ? "15px" : "17px", letterSpacing: "-0.4px", color: INK,
          }}>
            {peso(row.amount)}
          </span>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "5px",
            padding: "4px 10px", borderRadius: "999px",
            background: `rgba(var(--eco-c5-rgb), ${fill})`,
            border: "1px solid rgba(var(--eco-c9-rgb), 0.12)",
            fontSize: "10px", fontWeight: 700, letterSpacing: "0.4px",
            color: GREEN, whiteSpace: "nowrap",
          }}>
            <Icon size={11} strokeWidth={2.6} />
            {row.status}
          </span>
        </div>
      </li>
    </Reveal>
  );
}

/* Allocated money, folded onto the goals it was spent against. The bar takes
   the goal's own UN colour — this is the one place in the section where the
   colour is carrying data rather than decorating a chip, so a reader can match
   a bar to a ledger row's pill without reading either label. Bars are scaled
   against the biggest goal, not the total, so the smallest one is still
   visible; the peso figure beside each is the number that matters. */
function SdgAllocationStrip({ isMobile }) {
  const top = SDG_ALLOCATION[0]?.amount || 1;
  return (
    <div style={{
      marginTop: isMobile ? "20px" : "26px",
      padding: isMobile ? "16px 14px" : "20px 22px",
      borderRadius: "20px",
      background: "linear-gradient(155deg, rgba(255,255,255,0.78), rgba(255,255,255,0.46))",
      border: "1px solid rgba(255,255,255,0.84)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
    }}>
      <div style={{
        display: "flex", alignItems: "baseline", justifyContent: "space-between",
        gap: "12px", flexWrap: "wrap",
      }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: "7px",
          fontSize: "10px", fontWeight: 700, letterSpacing: "0.9px",
          textTransform: "uppercase", color: INK_SOFT,
        }}>
          <Globe2 size={12} strokeWidth={2.6} color={GREEN} />
          Allocated by Global Goal
        </span>
        <span style={{ fontSize: "11px", fontWeight: 600, color: INK_SOFT }}>
          {peso(FUND_ALLOCATED)} across {SDG_ALLOCATION.length} goals
        </span>
      </div>

      <div style={{
        display: "flex", flexDirection: "column", gap: isMobile ? "12px" : "13px",
        marginTop: "14px",
      }}>
        {SDG_ALLOCATION.map(({ goal, amount }) => {
          const sdg = SDG_GOALS[goal];
          return (
            <div key={goal} style={{ width: "100%" }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: "10px", flexWrap: "wrap",
              }}>
                <SdgChip goal={goal} />
                <span style={{
                  display: "inline-flex", alignItems: "baseline", gap: "7px",
                  fontSize: isMobile ? "12px" : "13px", fontWeight: 750, color: INK,
                }}>
                  {peso(amount)}
                  <span style={{ fontSize: "10.5px", fontWeight: 600, color: INK_SOFT }}>
                    {Math.round((amount / FUND_ALLOCATED) * 100)}%
                  </span>
                </span>
              </div>
              <div style={{
                position: "relative", overflow: "hidden",
                height: "5px", marginTop: "7px", borderRadius: "999px",
                background: "rgba(var(--eco-c9-rgb), 0.11)",
              }}>
                <span aria-hidden="true" style={{
                  position: "absolute", inset: 0, borderRadius: "999px",
                  background: `rgb(${sdg.rgb})`,
                  transform: `scaleX(${amount / top})`, transformOrigin: "left center",
                }} />
              </div>
            </div>
          );
        })}
      </div>

      <p style={{
        margin: "13px 0 0", fontSize: "10.5px", fontWeight: 550,
        lineHeight: 1.5, color: INK_SOFT,
      }}>
        Counted against each release's lead goal, so the four figures above still
        reconcile. Most releases advance a second goal too — both are named on the
        row.
      </p>
    </div>
  );
}

/* The transparency board: what came in, what went out, and the line-by-line
   record of the difference. Sits under the giving panel rather than inside it
   — the panel is already two dense columns, and a ledger squeezed into either
   one would collapse on a phone. */
function TransparencyBoard({ isMobile, onNavigate }) {
  const [ledgerHov, setLedgerHov] = useState(false);
  // The line-by-line history, folded away. Open by default: the record is the
  // point of the board, and a visitor should not have to ask for it.
  const [historyOpen, setHistoryOpen] = useState(true);
  const [toggleHov, setToggleHov] = useState(false);
  return (
    <Reveal style={{ width: "100%" }}>
      <div style={{
        position: "relative", overflow: "hidden", width: "100%",
        padding: isMobile ? "24px 18px" : "38px 40px",
        borderRadius: "26px",
        background: "linear-gradient(150deg, rgba(255,255,255,0.86), rgba(var(--eco-c0-rgb), 0.6))",
        border: "1px solid rgba(255,255,255,0.86)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
        // The one blurred layer in the board. The rows inside use flat
        // gradients — seven more backdrop filters here would cost far more
        // than they'd show through.
        backdropFilter: "blur(22px) saturate(180%)",
        WebkitBackdropFilter: "blur(22px) saturate(180%)",
      }}>
        <span aria-hidden="true" style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(60% 70% at 85% 0%, rgba(var(--eco-c5-rgb), 0.3), transparent 70%)",
        }} />

        <div style={{ position: "relative" }}>
          {/* ── Heading + the platform-fee claim, as a number ── */}
          <div style={{
            display: "flex", alignItems: "flex-start", justifyContent: "space-between",
            gap: "16px", flexWrap: "wrap",
          }}>
            <div style={{ minWidth: 0 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "7px",
                padding: "6px 13px", borderRadius: "999px",
                background: "rgba(255,255,255,0.66)",
                border: "1px solid rgba(var(--eco-c9-rgb), 0.16)",
                fontSize: "10px", fontWeight: 700, letterSpacing: "1.2px",
                textTransform: "uppercase", color: GREEN,
              }}>
                <Receipt size={11} strokeWidth={2.8} /> Transparency board
              </span>
              <h3 style={{
                margin: "12px 0 0", fontFamily: "'Poppins', sans-serif", fontWeight: 500,
                fontSize: isMobile ? "20px" : "clamp(22px, 2.6vw, 30px)",
                lineHeight: 1.16, letterSpacing: "-1px", color: INK,
              }}>
                Every peso that{" "}
                <span style={{
                  background: `linear-gradient(120deg, ${GREEN}, ${SKY})`,
                  WebkitBackgroundClip: "text", backgroundClip: "text",
                  WebkitTextFillColor: "transparent", color: "transparent",
                }}>left the fund</span>
              </h3>
              <p style={{
                margin: "10px 0 0", maxWidth: "560px",
                fontSize: isMobile ? "13px" : "14px", lineHeight: 1.65,
                fontWeight: 500, color: INK_SOFT,
              }}>
                The split above is the plan. This is the record it gets judged against —
                every release to a partner, what it bought, which Global Goal it counts
                against, and whether the receipt is back yet.
              </p>
            </div>

            <span style={{
              display: "inline-flex", alignItems: "center", gap: "7px",
              padding: "9px 14px", borderRadius: "999px", flexShrink: 0,
              background: "rgba(255,255,255,0.72)",
              border: "1px solid rgba(var(--eco-c9-rgb), 0.16)",
              fontSize: "11.5px", fontWeight: 750, color: INK,
            }}>
              <ShieldCheck size={13} strokeWidth={2.5} color={GREEN} />
              ₱0 kept by the platform
            </span>
          </div>

          {/* ── The four figures, which reconcile to the total received ── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))",
            gap: isMobile ? "9px" : "12px",
            marginTop: isMobile ? "20px" : "26px",
          }}>
            <ReconcileStat
              label="Received" value={FUND_RAISED} note="Pledged to date" tinted isMobile={isMobile}
            />
            <ReconcileStat
              label="Disbursed" value={FUND_DISBURSED} note="Already with partners" tinted isMobile={isMobile}
            />
            <ReconcileStat
              label="Committed" value={FUND_COMMITTED} note="Allocated, not yet released" tinted isMobile={isMobile}
            />
            <ReconcileStat
              label="Unallocated" value={FUND_UNALLOCATED} note="Waiting on the next request" isMobile={isMobile}
            />
          </div>

          {/* The same allocated money, read a second way: by the goal it was
              spent against. Sits between the totals and the rows because it is
              the bridge — the figures above summarise it, the rows below
              itemise it. */}
          <SdgAllocationStrip isMobile={isMobile} />

          {/* Sits above the rows, not under them: dated entries with reference
              codes read as a real record, so the disclaimer has to arrive
              before the ledger does rather than after.

              It doubles as the ledger's header, which is why the fold control
              lives on it. The strip stays put whether the rows are open or
              shut, so there is always something to press and always a line of
              text saying what the hidden thing is. */}
          <p style={{
            display: "flex", alignItems: "center", gap: "8px",
            margin: isMobile ? "20px 0 0" : "26px 0 0",
            padding: isMobile ? "8px 8px 8px 12px" : "9px 10px 9px 14px",
            borderRadius: "13px",
            background: "rgba(var(--eco-c5-rgb), 0.24)",
            border: "1px solid rgba(var(--eco-c9-rgb), 0.14)",
            fontSize: "11.5px", fontWeight: 600, lineHeight: 1.5, color: INK,
          }}>
            <Sparkles size={13} strokeWidth={2.5} color={GREEN} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, minWidth: 0 }}>
              Sample ledger — entries are illustrative. The live board opens with the
              donation portal.
            </span>

            {/* A bare +/− disc rather than a labelled button, as asked: the
                strip it sits on already says what the rows are, and a
                "Show donation history" pill here would compete with
                "Request the full ledger" at the foot of the board. The words
                live in aria-label/title instead, so the control is still
                announced to a screen reader and still names itself on hover. */}
            <button
              type="button"
              onClick={() => setHistoryOpen((open) => !open)}
              onMouseEnter={() => setToggleHov(true)}
              onMouseLeave={() => setToggleHov(false)}
              aria-expanded={historyOpen}
              aria-controls="fund-history"
              aria-label={historyOpen ? "Hide donation history" : "Show donation history"}
              title={historyOpen ? "Hide donation history" : "Show donation history"}
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: "26px", height: "26px", padding: 0, flexShrink: 0,
                borderRadius: "999px", cursor: "pointer", color: INK,
                background: toggleHov ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.72)",
                border: "1px solid rgba(var(--eco-c19-rgb), 0.1)",
                transition: "background 0.26s ease",
              }}
            >
              {historyOpen
                ? <Minus size={14} strokeWidth={2.8} />
                : <Plus size={14} strokeWidth={2.8} />}
            </button>
          </p>

          {historyOpen && (
            <ul id="fund-history" style={{
              listStyle: "none", margin: isMobile ? "12px 0 0" : "14px 0 0", padding: 0,
              display: "flex", flexDirection: "column", gap: isMobile ? "9px" : "10px",
            }}>
              {FUND_LEDGER.map((row, i) => (
                <LedgerRow key={row.ref} row={row} index={i} isMobile={isMobile} />
              ))}
            </ul>
          )}

          {/* ── When it was last squared off, and how to ask for the rest ── */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: "14px", flexWrap: "wrap",
            marginTop: isMobile ? "18px" : "22px",
          }}>
            <span style={{
              display: "inline-flex", alignItems: "flex-start", gap: "7px",
              fontSize: "11px", fontWeight: 550, lineHeight: 1.5, color: INK_SOFT,
            }}>
              <CheckCircle2 size={13} strokeWidth={2.4} color={GREEN} style={{ flexShrink: 0, marginTop: "1px" }} />
              Last reconciled {FUND_RECONCILED} · partner receipts on file
            </span>
            <button
              type="button"
              onClick={() => onNavigate("Contact")}
              onMouseEnter={() => setLedgerHov(true)}
              onMouseLeave={() => setLedgerHov(false)}
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                minHeight: "42px", padding: "0 20px",
                borderRadius: "999px", cursor: "pointer", fontFamily: "inherit",
                fontSize: "13px", fontWeight: 750, color: INK,
                background: ledgerHov ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.7)",
                border: "1px solid rgba(var(--eco-c19-rgb), 0.1)",
                transition: "background 0.26s ease",
              }}
            >
              Request the full ledger
              <ArrowRight size={15} strokeWidth={2.6} style={{
                transform: ledgerHov ? "translateX(3px)" : "none",
                transition: "transform 0.26s cubic-bezier(.22,1,.36,1)",
              }} />
            </button>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* ── Community support: the partner row + the giving panel ── */
function CommunitySupport({ isMobile, onNavigate, onComingSoon }) {
  const [goalsHov, setGoalsHov] = useState(false);
  return (
    <div style={{ width: "100%" }}>
      <SectionHeading
        eyebrow="Community support"
        title="The people already"
        accent="doing the work"
        body="EcoEquity builds the tools. These partners get them into the barangays that need them first, the seed fund is how that gets paid for, and every peso is booked against a UN Global Goal."
        isMobile={isMobile}
      />

      {/* The goals this section actually touches, gathered from the partners,
          the split and the ledger rather than typed out — tagging a new
          partner or release adds its goal here automatically. */}
      <Reveal style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: "12px",
        width: "100%", marginBottom: isMobile ? "18px" : "26px",
      }}>
        <SdgChips
          goals={SDG_COVERED}
          compact={isMobile}
          style={{ justifyContent: "center", maxWidth: "760px" }}
        />
        <button
          type="button"
          onClick={() => onNavigate("Learn More")}
          onMouseEnter={() => setGoalsHov(true)}
          onMouseLeave={() => setGoalsHov(false)}
          style={{
            display: "inline-flex", alignItems: "center", gap: "7px",
            minHeight: "36px", padding: "0 16px", borderRadius: "999px",
            cursor: "pointer", fontFamily: "inherit",
            fontSize: "12px", fontWeight: 750, color: INK,
            background: goalsHov ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.66)",
            border: "1px solid rgba(var(--eco-c19-rgb), 0.1)",
            transition: "background 0.26s ease",
          }}
        >
          <Globe2 size={13} strokeWidth={2.5} color={GREEN} />
          See the target and indicator behind each goal
          <ArrowRight size={13} strokeWidth={2.6} style={{
            transform: goalsHov ? "translateX(3px)" : "none",
            transition: "transform 0.26s cubic-bezier(.22,1,.36,1)",
          }} />
        </button>
      </Reveal>

      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))",
        gap: isMobile ? "12px" : "18px",
      }}>
        {NGO_PARTNERS.map((item, i) => (
          <PartnerCard key={item.name} item={item} index={i} isMobile={isMobile} />
        ))}
      </div>

      <p style={{
        margin: isMobile ? "14px 0 0" : "18px 0 0", textAlign: "center",
        fontSize: "11px", fontWeight: 500, color: INK_SOFT,
      }}>
        Partner organisations and fund figures shown here are illustrative — the live
        partner directory opens with the donation portal.
      </p>

      <div style={{ marginTop: isMobile ? "22px" : "32px" }}>
        <DonationPanel
          isMobile={isMobile}
          onNavigate={onNavigate}
          onGive={({ amount, cadence }) =>
            onComingSoon({
              title: "Community Seed Fund",
              body: `Thank you — a ${cadence === "Monthly" ? "monthly" : "one-time"} gift of ${peso(amount)} is exactly what the partner barangays need.`,
            })
          }
        />
      </div>

      <div style={{ marginTop: isMobile ? "14px" : "18px" }}>
        <TransparencyBoard isMobile={isMobile} onNavigate={onNavigate} />
      </div>
    </div>
  );
}

function ClosingCTA({ isMobile, onNavigate, onComingSoon }) {
  const [primaryHov, setPrimaryHov] = useState(false);
  const [ghostHov, setGhostHov] = useState(false);
  return (
    <Reveal style={{ width: "100%" }}>
      <div style={{
        position: "relative", overflow: "hidden", width: "100%",
        padding: isMobile ? "26px 18px" : "44px 40px",
        borderRadius: "26px", textAlign: "center",
        background: "linear-gradient(150deg, rgba(255,255,255,0.86), rgba(var(--eco-c0-rgb), 0.6))",
        border: "1px solid rgba(255,255,255,0.86)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
        backdropFilter: "blur(22px) saturate(180%)",
        WebkitBackdropFilter: "blur(22px) saturate(180%)",
      }}>
        <span aria-hidden="true" style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(60% 80% at 50% 0%, rgba(var(--eco-c5-rgb), 0.28), transparent 70%)",
        }} />
        <div style={{ position: "relative" }}>
          <h3 style={{
            margin: 0, fontFamily: "'Poppins', sans-serif", fontWeight: 500,
            fontSize: isMobile ? "21px" : "clamp(24px, 3vw, 34px)",
            lineHeight: 1.14, letterSpacing: "-1.1px", color: INK,
          }}>
            Ready to grow your first harvest?
          </h3>
          <p style={{
            margin: "10px auto 0", maxWidth: "520px",
            fontSize: isMobile ? "13px" : "14px", lineHeight: 1.65,
            fontWeight: 500, color: INK_SOFT,
          }}>
            Start with a kit, a plan and a community that answers when you ask. No farm required — a balcony is enough.
          </p>
          <div style={{
            display: "flex", flexWrap: "wrap", justifyContent: "center",
            gap: "12px", marginTop: isMobile ? "18px" : "24px",
          }}>
            <button
              type="button"
              onClick={() => onComingSoon(feature("Starter Kits & Toolsets"))}
              onMouseEnter={() => setPrimaryHov(true)}
              onMouseLeave={() => setPrimaryHov(false)}
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                minHeight: "48px", padding: "0 24px", borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.5)", cursor: "pointer",
                fontFamily: "inherit", fontSize: "14px", fontWeight: 750, color: "#fff",
                background: `linear-gradient(135deg, ${GREEN}, var(--eco-c9) 60%, ${SKY})`,
                boxShadow: "none",
                transform: primaryHov ? "translateY(-3px)" : "none",
                transition: "transform 0.26s cubic-bezier(.22,1,.36,1), box-shadow 0.26s ease",
              }}
            >
              Browse Starter Kits
              <ArrowRight size={16} strokeWidth={2.6} style={{
                transform: primaryHov ? "translateX(4px)" : "none",
                transition: "transform 0.26s cubic-bezier(.22,1,.36,1)",
              }} />
            </button>
            <button
              type="button"
              onClick={() => onNavigate("Contact")}
              onMouseEnter={() => setGhostHov(true)}
              onMouseLeave={() => setGhostHov(false)}
              style={{
                minHeight: "48px", padding: "0 24px", borderRadius: "999px",
                cursor: "pointer", fontFamily: "inherit", fontSize: "14px",
                fontWeight: 750, color: INK,
                background: ghostHov ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.7)",
                border: "1px solid rgba(var(--eco-c19-rgb), 0.1)",
                boxShadow: "none",
                transform: ghostHov ? "translateY(-3px)" : "none",
                transition: "transform 0.26s cubic-bezier(.22,1,.36,1), box-shadow 0.26s ease, background 0.26s ease",
              }}
            >
              Talk to the team
            </button>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* `measure` is the reading width the home scroller no longer enforces — that
   box is now the full width of the window so its footer can bleed to the
   edges, so these sections hold the card's inner measure for themselves. The
   phone shell still owns its gutter, so mobile stays at 100%. App.js owns the
   expression (HOME_MEASURE). */
export default function LandingSections({ isMobile = false, onNavigate = () => {}, measure = "1240px" }) {
  // The six "what's inside" tiles announce themselves rather than navigating —
  // the tools behind them are not open to users yet. The Surplus Exchange step
  // and the closing "Browse Starter Kits" button land here too. Holds the
  // feature to announce; null means no banner.
  const [comingSoon, setComingSoon] = useState(null);

  return (
    <section style={{
      width: "100%",
      maxWidth: isMobile ? "100%" : measure,
      margin: "0 auto",
      // Sibling of the hero inside the home scroller's column flexbox — opt out
      // of shrinking so the sections keep their laid-out height.
      flexShrink: 0,
      display: "flex", flexDirection: "column",
      gap: isMobile ? "34px" : "clamp(48px, 7vh, 88px)",
      padding: isMobile ? "26px 0 8px" : "clamp(40px, 7vh, 80px) 0 clamp(24px, 4vh, 48px)",
    }}>
      <RevealStyles />

      {comingSoon && (
        <ComingSoonBanner
          title={`${comingSoon.title} — Coming Soon`}
          message={`${comingSoon.body} We're still building this one — it will open up here soon.`}
          closeLabel="Close and go to the home page"
          // The X is the "take me back" action: close, then land on Home.
          onClose={() => { setComingSoon(null); onNavigate("Home"); }}
          onDismiss={() => setComingSoon(null)}
        />
      )}

      {/* ── What's on the platform ── */}
      <div style={{ width: "100%" }}>
        <SectionHeading
          eyebrow="What's inside"
          title="Everything you need,"
          accent="in one platform"
          body="Six connected tools that take a household from an empty plot to a harvest worth selling."
          isMobile={isMobile}
        />
        <div style={{
          display: "grid",
          // Fixed 3 columns, not auto-fit: six cards over four tracks left a
          // ragged two-card second row.
          gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
          gap: isMobile ? "12px" : "18px",
        }}>
          {FEATURES.map((item, i) => (
            <FeatureCard key={item.nav} item={item} index={i} isMobile={isMobile} onSelect={setComingSoon} />
          ))}
        </div>
      </div>

      {/* ── How it works ── */}
      <HowItWorks isMobile={isMobile} onNavigate={onNavigate} onComingSoon={setComingSoon} />

      {/* ── Targets ── */}
      <TargetBand isMobile={isMobile} />

      {/* ── NGO partners + the donation panel ── */}
      <CommunitySupport isMobile={isMobile} onNavigate={onNavigate} onComingSoon={setComingSoon} />

      {/* ── Closing CTA ── */}
      <ClosingCTA isMobile={isMobile} onNavigate={onNavigate} onComingSoon={setComingSoon} />
    </section>
  );
}
