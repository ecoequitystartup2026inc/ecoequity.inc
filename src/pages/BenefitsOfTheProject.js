import React, { useState, useEffect } from "react";
import { TrendingUp, HandCoins, Recycle, ShieldCheck } from "lucide-react";
import Reveal, { RevealStyles } from "../components/Reveal";

/* Headline figures. These mirror the claims made in the intro paragraph —
   keep the two in sync if the projections change. */
const stats = [
  { value: "218.9%", label: "3-Yr ROI" },
  { value: "3,500+", label: "Micro-Vendors" },
  { value: "99+", label: "Partners" },
];

const pillars = [
  {
    Icon: TrendingUp,
    title: "Financial Viability",
    desc: "A projected 218.9% return over three years, carried by subscription revenue and marketplace commissions rather than one-off grants.",
    metric: "218.9% ROI",
  },
  {
    Icon: HandCoins,
    title: "Livelihood Empowerment",
    desc: "Micro-vendors reach buyers directly and keep the margin that layers of middlemen used to absorb along the way.",
    metric: "3,500+ Vendors",
  },
  {
    Icon: Recycle,
    title: "Food Waste Mitigation",
    desc: "Surplus harvests are matched to buyers through the exchange while they are still sellable, instead of spoiling unsold.",
    metric: "Surplus Rerouted",
  },
  {
    Icon: ShieldCheck,
    title: "Food Security",
    desc: "Backyard and community plots add steady local supply where imported produce prices swing hardest.",
    metric: "Local Supply",
  },
];

const beneficiaries = [
  { who: "Urban households", how: "Turn idle yard space into food and a second income stream." },
  { who: "Micro-vendors", how: "Digital storefront, logistics support, and direct market access." },
  { who: "LGUs & barangays", how: "Measurable food-security programs without building the platform." },
  { who: "Institutional buyers", how: "Traceable local sourcing at a predictable volume and price." },
];

function BenefitsOfTheProject() {
  const [statsStripHovered, setStatsStripHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={{ ...styles.wrap, ...(isMobile ? styles.wrapMobile : {}) }}>
      <RevealStyles />

      <div className="inner-blur-glass glass-hover-zoom-sm" style={styles.badge}>
        <span style={styles.badgeDot} />
        <span style={styles.glassContentLayer}>Project Advantages</span>
      </div>

      <h1 style={styles.title}>
        Benefits of the <span style={styles.accent}>Project</span>
      </h1>

      <p style={styles.body}>
        This project offers a dual benefit: financial viability by achieving a
        projected 218.9% ROI over three years, and critical social impact by
        empowering 3,500+ micro-vendors and mitigating significant food waste,
        directly addressing the Philippines' food security crisis.
      </p>

      {/* Headline figures */}
      <Reveal
        className="inner-blur-glass"
        style={{
          ...styles.statsStrip,
          ...(isMobile ? styles.statsStripMobile : {}),
          ...(statsStripHovered ? styles.statsStripHov : {}),
        }}
        onMouseEnter={() => setStatsStripHovered(true)}
        onMouseLeave={() => setStatsStripHovered(false)}
      >
        {stats.map((s, i, arr) => (
          <div
            key={s.label}
            style={{
              ...styles.statCell,
              ...(isMobile ? styles.statCellMobile : {}),
              ...(i < arr.length - 1 ? styles.statCellDivider : {}),
            }}
          >
            <span style={{ ...styles.statVal, ...(isMobile ? styles.statValMobile : {}) }}>
              {s.value}
            </span>
            <span style={{ ...styles.statLbl, ...(isMobile ? styles.statLblMobile : {}) }}>
              {s.label}
            </span>
          </div>
        ))}
      </Reveal>

      {/* The four benefits themselves */}
      <div style={{ ...styles.pillarGrid, ...(isMobile ? styles.pillarGridMobile : {}) }}>
        {pillars.map(({ Icon, title, desc, metric }, i) => (
          <Reveal
            key={title}
            delay={i * 90}
            className="inner-blur-glass glass-hover-zoom-sm"
            style={styles.pillarCard}
          >
            <span style={styles.pillarIconWrap}>
              <Icon size={20} color="var(--eco-c13)" strokeWidth={1.75} />
            </span>
            <h3 style={styles.pillarTitle}>{title}</h3>
            <p style={styles.pillarDesc}>{desc}</p>
            <span style={styles.pillarMetric}>{metric}</span>
          </Reveal>
        ))}
      </div>

      {/* Who it reaches, next to the work on the ground */}
      <div style={{ ...styles.splitRow, ...(isMobile ? styles.splitRowMobile : {}) }}>
        <Reveal
          variant="left"
          className="inner-blur-glass glass-hover-zoom-sm"
          style={styles.imageCard}
        >
          <img
            src="/Planting.jpg"
            alt="Farmers planting crops as part of the project"
            style={styles.image}
          />
          <span style={styles.imageCaption}>
            Empowering local farmers and micro-vendors on the ground
          </span>
        </Reveal>

        <Reveal variant="right" delay={120} className="inner-blur-glass" style={styles.whoCard}>
          <h3 style={styles.whoTitle}>Who Benefits</h3>
          <div style={styles.whoList}>
            {beneficiaries.map(({ who, how }) => (
              <div key={who} style={styles.whoItem}>
                <span style={styles.whoDot} />
                <div>
                  <div style={styles.whoWho}>{who}</div>
                  <div style={styles.whoHow}>{how}</div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "32px 16px 40px",
    maxWidth: "1100px",
    margin: "0 auto",
    animation: "fadeInUp 0.75s cubic-bezier(.22,1,.36,1) both",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    overflowY: "auto",
    height: "100%",
    boxSizing: "border-box",
  },
  wrapMobile: {
    padding: "20px 10px 32px",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    padding: "5px 14px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(0,0,0,0.05)",
    fontSize: "11px",
    fontWeight: 600,
    color: "var(--eco-c13)",
    letterSpacing: "0.6px",
    textTransform: "uppercase",
    marginBottom: "20px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.05)",
    flexShrink: 0,
  },
  badgeDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "var(--eco-c6)",
    boxShadow: "0 0 5px rgba(var(--eco-c6-rgb), 0.9)",
    display: "inline-block",
  },
  glassContentLayer: {
    position: "relative",
    zIndex: 1,
  },
  title: {
    fontSize: "clamp(32px, 4.5vw, 50px)",
    fontWeight: 300,
    color: "#000",
    margin: "0 0 16px",
    lineHeight: 1.15,
    letterSpacing: "-0.8px",
    textShadow: "0 4px 12px rgba(0,0,0,0.1)",
    animation: "titleReveal 0.9s cubic-bezier(.22,1,.36,1) 0.15s both",
    flexShrink: 0,
  },
  accent: {
    background: "linear-gradient(90deg, var(--eco-c6), var(--eco-c5))",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  body: {
    color: "#000",
    fontSize: "clamp(14px, 1.5vw, 16px)",
    fontWeight: 400,
    lineHeight: 1.72,
    maxWidth: "680px",
    marginBottom: "24px",
    flexShrink: 0,
  },
  statsStrip: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    /* `wrap` is a column flexbox with a constrained height, so every section
       below is a flex item on the main axis — without this they get squashed
       instead of scrolling. */
    flexShrink: 0,
    marginTop: "20px",
    padding: "15px 40px",
    borderRadius: "14px",
    background: "linear-gradient(145deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
    border: "1px solid rgba(0,0,0,0.05)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.05)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
  },
  statsStripHov: {
    transform: "scale(1.015)",
  },
  statsStripMobile: {
    padding: "12px 14px",
    width: "100%",
    maxWidth: "420px",
  },
  statCell: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    padding: "0 18px",
  },
  statCellMobile: {
    padding: "0 8px",
  },
  statCellDivider: {
    borderRight: "1px solid rgba(0,0,0,0.1)",
  },
  statVal: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#000",
    letterSpacing: "-0.5px",
    lineHeight: 1.1,
    marginBottom: "3px",
    whiteSpace: "nowrap",
  },
  statValMobile: {
    fontSize: "17px",
  },
  statLbl: {
    fontSize: "12px",
    fontWeight: 500,
    color: "rgba(0, 0, 0, 0.7)",
    letterSpacing: "0.9px",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },
  statLblMobile: {
    fontSize: "8.5px",
    letterSpacing: "0.5px",
  },

  pillarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "16px",
    width: "100%",
    maxWidth: "1000px",
    marginTop: "26px",
    flexShrink: 0,
  },
  pillarGridMobile: {
    gridTemplateColumns: "1fr",
    gap: "12px",
    marginTop: "20px",
  },
  pillarCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    textAlign: "left",
    gap: "9px",
    padding: "20px",
    borderRadius: "18px",
    background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
    border: "1px solid rgba(0,0,0,0.05)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.05)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
  },
  pillarIconWrap: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "38px",
    height: "38px",
    borderRadius: "12px",
    background: "rgba(var(--eco-c6-rgb), 0.28)",
    border: "1px solid rgba(255,255,255,0.5)",
  },
  pillarTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#000",
    margin: 0,
    letterSpacing: "-0.2px",
  },
  pillarDesc: {
    fontSize: "13px",
    fontWeight: 400,
    color: "rgba(0,0,0,0.68)",
    lineHeight: 1.6,
    margin: 0,
    flexGrow: 1,
  },
  pillarMetric: {
    marginTop: "2px",
    padding: "5px 11px",
    borderRadius: "999px",
    background: "rgba(var(--eco-c9-rgb), 0.12)",
    color: "var(--eco-c13)",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },

  splitRow: {
    display: "grid",
    gridTemplateColumns: "1.15fr 1fr",
    alignItems: "stretch",
    gap: "16px",
    width: "100%",
    maxWidth: "1000px",
    marginTop: "18px",
    flexShrink: 0,
  },
  splitRowMobile: {
    gridTemplateColumns: "1fr",
    gap: "12px",
  },
  imageCard: {
    padding: "10px",
    borderRadius: "18px",
    background: "linear-gradient(145deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
    border: "1px solid rgba(0,0,0,0.05)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 12px 30px rgba(0,0,0,0.08)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    /* Capped so the photo's aspect ratio can't stretch the whole row past the
       height of the list beside it. */
    minHeight: "220px",
    maxHeight: "330px",
    objectFit: "cover",
    borderRadius: "12px",
    display: "block",
  },
  imageCaption: {
    fontSize: "12px",
    fontWeight: 500,
    color: "rgba(0,0,0,0.65)",
    letterSpacing: "0.4px",
    padding: "10px 6px 4px",
  },
  whoCard: {
    textAlign: "left",
    /* Centred so the leftover height next to the photo reads as breathing
       room rather than a gap under the list. */
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "22px",
    borderRadius: "18px",
    background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
    border: "1px solid rgba(0,0,0,0.05)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 12px 30px rgba(0,0,0,0.08)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
  },
  whoTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#000",
    margin: "0 0 14px",
    letterSpacing: "-0.2px",
  },
  whoList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  whoItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
  },
  whoDot: {
    width: "7px",
    height: "7px",
    marginTop: "6px",
    borderRadius: "50%",
    background: "var(--eco-c9)",
    flexShrink: 0,
  },
  whoWho: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#000",
    marginBottom: "2px",
  },
  whoHow: {
    fontSize: "12.5px",
    fontWeight: 400,
    color: "rgba(0,0,0,0.65)",
    lineHeight: 1.55,
  },
};

export default BenefitsOfTheProject;
