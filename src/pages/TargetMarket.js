import React, { useState, useEffect } from "react";
import Reveal, { RevealStyles } from "../components/Reveal";

const iconProps = {
  width: 26,
  height: 26,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "var(--eco-c11)",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

// Sprout — Urban Novice
const SproutIcon = () => (
  <svg {...iconProps}>
    <path d="M12 21v-8" />
    <path d="M12 13c0-3.3-2.7-6-6-6 0 3.3 2.7 6 6 6Z" />
    <path d="M12 11c0-2.8 2.2-5 5-5 0 2.8-2.2 5-5 5Z" />
  </svg>
);

// Storefront — Micro-Vendor
const StoreIcon = () => (
  <svg {...iconProps}>
    <path d="M4 9h16l-1-4H5L4 9Z" />
    <path d="M4 9v0a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0" />
    <path d="M5 9v10h14V9" />
    <path d="M10 19v-5h4v5" />
  </svg>
);

// Building — Institutional Buyer
const BuildingIcon = () => (
  <svg {...iconProps}>
    <rect x="4" y="3" width="16" height="18" rx="1.5" />
    <path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2" />
    <path d="M10 21v-3h4v3" />
  </svg>
);

const targetMarketCards = [
  {
    Icon: SproutIcon,
    tag: "B2C · Learner",
    heading: "Urban Novice",
    image: "/kit_balcony_herb.webp",
    imageAlt: "Herbs growing in a windowsill planter above a city rooftop",
    product: "24/7 AI Plant Doctor",
    text: "AI-Guided Success: positioned as the indispensable tool for overcoming planting failure, driving the initial app download.",
  },
  {
    Icon: StoreIcon,
    tag: "B2C · Seller",
    heading: "Micro-Vendor",
    image: "/starter_kit.webp",
    imageAlt: "A vendor selling trays of seedlings at an outdoor market stall",
    product: "Local Marketplace",
    text: "Livelihood Creation: a zero-friction platform to instantly monetize garden excess and florals.",
  },
  {
    Icon: BuildingIcon,
    tag: "B2B · Buyer",
    heading: "Institutional Buyer",
    image: "/IMG_6223.webp",
    imageAlt: "A large field of cabbages grown for bulk supply",
    product: "B2B Surplus Module",
    text: "Cost & Supply-Chain Efficiency: the exclusive source for high-volume, below-market surplus produce (e.g. Baguio vegetables).",
  },
];

const goalStats = [
  { value: "150K+", label: "Active Monthly Users" },
  { value: "3,500+", label: "Active Micro-Vendors" },
  { value: "₱63M", label: "Annual Commerce Fees" },
];

function TargetMarket() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleScroll = (e) => {
    if (!isMobile) return;
    const { scrollLeft, scrollWidth, clientWidth } = e.target;
    if (scrollWidth <= clientWidth) return;

    const ratio = scrollLeft / (scrollWidth - clientWidth);
    const index = Math.round(ratio * (targetMarketCards.length - 1));

    if (index !== activeIndex && !isNaN(index)) {
      setActiveIndex(index);
    }
  };

  return (
    <div style={{ ...styles.wrap, ...(isMobile ? styles.wrapMobile : {}) }}>
      <style>
        {`
          .hide-scroll::-webkit-scrollbar { display: none; }
          .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
          .tm-card { transition: transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s cubic-bezier(.22,1,.36,1); }

          @keyframes tmDotPulse {
            0%, 100% { transform: scale(1);   opacity: 1; }
            50%      { transform: scale(1.5); opacity: 0.55; }
          }
          .tm-dot { animation: tmDotPulse 2.4s ease-in-out infinite; }

          .tm-media img { transition: transform .7s cubic-bezier(.22,1,.36,1); }
          .tm-media:hover img { transform: scale(1.06); }
          .tm-media .tm-icon { transition: transform .35s cubic-bezier(.34,1.56,.64,1), box-shadow .35s ease; }
          .tm-media:hover .tm-icon {
            transform: translateY(-3px) scale(1.07);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.9), 0 12px 24px rgba(var(--eco-c11-rgb), 0.28);
          }

          @media (prefers-reduced-motion: reduce) {
            .tm-dot { animation: none; }
            .tm-media img, .tm-media:hover img,
            .tm-media .tm-icon, .tm-media:hover .tm-icon { transition: none; transform: none; }
          }
        `}
      </style>
      <RevealStyles />

      <Reveal className="inner-blur-glass glass-hover-zoom-sm" style={styles.badge}>
        <span className="tm-dot" style={styles.badgeDot} />
        <span>Who We Serve</span>
      </Reveal>

      <h1 style={{ ...styles.title, ...(isMobile ? styles.titleMobile : {}) }}>
        Target <span style={styles.accent}>Market</span>
      </h1>

      <Reveal as="p" delay={120} style={{ ...styles.body, ...(isMobile ? styles.bodyMobile : {}) }}>
        EcoEquity serves households and communities in the Philippines who are
        eager to achieve agricultural self-sufficiency through sustainable farming
        practices.
      </Reveal>

      <div
        style={{ ...styles.cardRow, ...(isMobile ? styles.cardRowMobile : {}) }}
        className="hide-scroll"
        onScroll={handleScroll}
      >
        {targetMarketCards.map((c, ci) => (
          <Reveal
            key={c.heading}
            delay={ci * 120}
            className="inner-blur-glass tm-card tm-media"
            style={{
              ...styles.card,
              ...(isMobile ? styles.cardMobile : {}),
              ...(hoveredCard === c.heading ? styles.cardHov : {}),
            }}
            onMouseEnter={() => setHoveredCard(c.heading)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={styles.cardAccent} />

            <div style={{ ...styles.cardMedia, ...(isMobile ? styles.cardMediaMobile : {}) }}>
              <img
                src={c.image}
                alt={c.imageAlt}
                loading="lazy"
                decoding="async"
                style={styles.cardImg}
              />
              <span aria-hidden="true" style={styles.cardMediaScrim} />
              <span style={styles.cardTag}>{c.tag}</span>
            </div>

            <div className="tm-icon" style={styles.cardIconWrap}>
              <c.Icon />
            </div>
            <h3 style={{ ...styles.cardHeading, ...(isMobile ? styles.cardHeadingMobile : {}) }}>
              {c.heading}
            </h3>
            <span style={styles.cardProduct}>{c.product}</span>
            <div style={styles.cardDivider} />
            <p style={{ ...styles.cardText, ...(isMobile ? styles.cardTextMobile : {}) }}>{c.text}</p>
          </Reveal>
        ))}
      </div>

      {/* Scroll Indicator Dots - Mobile Only */}
      {isMobile && (
        <div style={styles.indicatorRow}>
          {targetMarketCards.map((_, i) => (
            <div
              key={i}
              style={{
                ...styles.dot,
                ...(activeIndex === i ? styles.dotActive : {}),
              }}
            />
          ))}
        </div>
      )}

      {/* Goal Callout */}
      <Reveal
        className="inner-blur-glass"
        style={{ ...styles.goalCard, ...(isMobile ? styles.goalCardMobile : {}) }}
      >
        <span style={styles.goalLabel}>Our Goal</span>
        <div style={{ ...styles.statRow, ...(isMobile ? styles.statRowMobile : {}) }}>
          {goalStats.map((s, i) => (
            <React.Fragment key={s.label}>
              <div style={styles.stat}>
                <span style={styles.statValue}>{s.value}</span>
                <span style={styles.statLabel}>{s.label}</span>
              </div>
              {i < goalStats.length - 1 && (
                <div style={{ ...styles.statSep, ...(isMobile ? styles.statSepMobile : {}) }} />
              )}
            </React.Fragment>
          ))}
        </div>
        <p style={{ ...styles.goalText, ...(isMobile ? styles.goalTextMobile : {}) }}>
          Integrate the B2B network to mitigate critical food waste — validating
          EcoEquity as the Philippines' scalable solution for food security and
          livelihood.
        </p>
      </Reveal>
    </div>
  );
}

const styles = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "10px 16px 20px",
    maxWidth: "900px",
    margin: "0 auto",
    animation: "fadeInUp 0.75s cubic-bezier(.22,1,.36,1) both",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  wrapMobile: {
    padding: "20px 10px 20px",
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
  },
  badgeDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "var(--eco-c6)",
    boxShadow: "0 0 5px rgba(var(--eco-c6-rgb), 0.9)",
    display: "inline-block",
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
  },
  titleMobile: {
    fontSize: "clamp(24px, 7vw, 36px)",
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
    maxWidth: "580px",
    marginBottom: "14px",
  },
  bodyMobile: {
    fontSize: "13px",
    lineHeight: "1.6",
    marginBottom: "10px",
  },
  cardRow: {
    display: "flex",
    gap: "18px",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "stretch",
    marginTop: "16px",
    width: "100%",
  },
  cardRowMobile: {
    flexWrap: "nowrap",
    justifyContent: "flex-start",
    overflowX: "auto",
    padding: "10px 40px 20px",
    gap: "16px",
    scrollSnapType: "x mandatory",
    scrollPadding: "0 40px",
    WebkitOverflowScrolling: "touch",
    width: "100%",
    boxSizing: "border-box",
    marginTop: "12px",
  },
  card: {
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(150deg, rgba(255,255,255,0.72), rgba(255,255,255,0.42))",
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: "22px",
    padding: "26px 22px 24px",
    flex: "1 1 220px",
    maxWidth: "250px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "9px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.06)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    cursor: "default",
  },
  cardMobile: {
    flex: "0 0 240px",
    maxWidth: "none",
    padding: "24px 18px 20px",
    scrollSnapAlign: "center",
    scrollSnapStop: "always",
  },
  cardHov: {
    transform: "translateY(-6px)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 18px 38px rgba(var(--eco-c11-rgb), 0.14)",
  },
  cardAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    zIndex: 2,
    background: "linear-gradient(90deg, var(--eco-c6), var(--eco-c5))",
  },
  /* Full-bleed photo banner: negative margins cancel the card's padding so the
     image meets the card's rounded top edge. */
  cardMedia: {
    position: "relative",
    margin: "-26px -22px 0",
    height: "132px",
    overflow: "hidden",
    flexShrink: 0,
    alignSelf: "stretch",
  },
  cardMediaMobile: {
    margin: "-24px -18px 0",
    height: "118px",
  },
  cardImg: {
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  cardMediaScrim: {
    position: "absolute",
    inset: "auto 0 0 0",
    height: "62%",
    pointerEvents: "none",
    background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 100%)",
  },
  cardIconWrap: {
    position: "relative",
    zIndex: 1,
    marginTop: "-30px",
    width: "52px",
    height: "52px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(150deg, rgba(236,253,243,0.96), rgba(var(--eco-c2-rgb), 0.94))",
    backdropFilter: "blur(14px) saturate(180%)",
    WebkitBackdropFilter: "blur(14px) saturate(180%)",
    border: "1px solid rgba(255,255,255,0.9)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 4px 12px rgba(var(--eco-c11-rgb), 0.1)",
    marginBottom: "2px",
  },
  cardTag: {
    /* Top-left, clear of the icon chip that overlaps the photo's bottom edge. */
    position: "absolute",
    top: "13px",
    left: "13px",
    whiteSpace: "nowrap",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.7px",
    textTransform: "uppercase",
    color: "var(--eco-c16)",
    background: "rgba(255,255,255,0.92)",
    padding: "4px 11px",
    borderRadius: "999px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.22)",
  },
  cardHeading: {
    fontSize: "17px",
    fontWeight: 700,
    color: "#000",
    margin: 0,
    letterSpacing: "-0.3px",
  },
  cardHeadingMobile: {
    fontSize: "16px",
  },
  cardProduct: {
    fontSize: "12px",
    fontWeight: 600,
    color: "var(--eco-c13)",
    letterSpacing: "-0.1px",
  },
  cardDivider: {
    width: "34px",
    height: "2px",
    borderRadius: "999px",
    background: "rgba(0,0,0,0.08)",
    margin: "4px 0 2px",
  },
  cardText: {
    fontSize: "13px",
    color: "rgba(0, 0, 0, 0.72)",
    lineHeight: 1.6,
    margin: 0,
  },
  cardTextMobile: {
    fontSize: "12px",
  },
  indicatorRow: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    marginTop: "0px",
    paddingBottom: "12px",
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "rgba(0, 0, 0, 0.2)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  dotActive: {
    background: "var(--eco-c6)",
    transform: "scale(1.25)",
    boxShadow: "0 0 10px rgba(var(--eco-c6-rgb), 0.4)",
  },
  goalCard: {
    position: "relative",
    marginTop: "26px",
    width: "100%",
    maxWidth: "660px",
    borderRadius: "24px",
    padding: "26px 28px",
    background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
    border: "1px solid rgba(0,0,0,0.05)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 10px 30px rgba(0,0,0,0.06)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    boxSizing: "border-box",
  },
  goalCardMobile: {
    padding: "22px 18px",
    marginTop: "18px",
  },
  goalLabel: {
    display: "inline-block",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.8px",
    textTransform: "uppercase",
    color: "var(--eco-c13)",
    marginBottom: "16px",
  },
  statRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginBottom: "18px",
  },
  statRowMobile: {
    flexDirection: "column",
    gap: "14px",
  },
  stat: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    flex: 1,
  },
  statValue: {
    fontSize: "clamp(24px, 3.4vw, 32px)",
    fontWeight: 700,
    letterSpacing: "-1px",
    background: "linear-gradient(90deg, var(--eco-c9), var(--eco-c9))",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    lineHeight: 1.1,
  },
  statLabel: {
    fontSize: "11px",
    fontWeight: 600,
    color: "rgba(0,0,0,0.55)",
    letterSpacing: "0.2px",
  },
  statSep: {
    width: "1px",
    alignSelf: "stretch",
    background: "rgba(0,0,0,0.1)",
    margin: "4px 0",
  },
  statSepMobile: {
    width: "40px",
    height: "1px",
    alignSelf: "center",
  },
  goalText: {
    fontSize: "clamp(13px, 1.4vw, 15px)",
    color: "rgba(0,0,0,0.72)",
    lineHeight: 1.7,
    margin: 0,
    maxWidth: "540px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  goalTextMobile: {
    fontSize: "12.5px",
    lineHeight: 1.6,
  },
};

export default TargetMarket;
