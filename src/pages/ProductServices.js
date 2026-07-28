import React, { useState, useEffect } from "react";

const iconProps = {
  width: 26,
  height: 26,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "#15803d",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

// Package — Product
const PackageIcon = () => (
  <svg {...iconProps}>
    <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
    <path d="M3 8l9 5 9-5" />
    <path d="M12 13v8" />
    <path d="M7.5 5.5 16.5 10.5" />
  </svg>
);

// Tools — Services
const ServiceIcon = () => (
  <svg {...iconProps}>
    <path d="M14.5 5.5a3.5 3.5 0 0 0-4.9 4.3L4 15.4 6 17.4l5.6-5.6a3.5 3.5 0 0 0 4.3-4.9l-2 2-1.8-.4-.4-1.8 2-2Z" />
    <path d="M14.5 14.5 19 19" />
  </svg>
);

// Community — Sector
const SectorIcon = () => (
  <svg {...iconProps}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
    <path d="M16 6.5a3 3 0 0 1 0 5.8" />
    <path d="M17.5 14.5A5.5 5.5 0 0 1 20.5 20" />
  </svg>
);

const productServicesCards = [
  {
    Icon: PackageIcon,
    tag: "Goods",
    heading: "Product",
    bullets: [
      { label: "Organic Edibles", desc: "Local produce, herbs, and floriculture grown for Philippine conditions, plus localized seed varieties you can trust to thrive." },
      { label: "Urban Starter Kits & Toolsets", desc: "Themed kits like the Balcony Herb Garden and Tomato Success Kit — customized soil mixes, localized seeds, and starter tools in one box." },
      { label: "AI Data Subscription", desc: "Premium 24/7 predictive crop diagnostics and hyper-local weather alerts delivered before problems hit your garden." },
      { label: "Specialist Certification", desc: "Structured paid courses that take growers from hobbyist to certified urban-farming specialist." },
    ],
    buttonText: "Explore Products",
    nav: "ProductsPage",
  },
  {
    Icon: ServiceIcon,
    tag: "Platform",
    heading: "Services",
    bullets: [
      { label: "AI Plant Doctor", desc: "24/7 photo-based plant diagnosis with care guides tuned to the Philippine climate and native crops." },
      { label: "Events & Workshops", desc: "RSVP to specialist workshops, hands-on trainings, and community gatherings hosted at local venues." },
      { label: "Surplus Exchange", desc: "Commercial farmers list large-volume oversupply; verified institutional buyers — hotels, restaurants, processors — are notified for immediate purchase." },
      { label: "Community Hub", desc: "A forum for growers to swap advice plus a farm planner to map plots, schedule crops, and track harvests." },
    ],
    buttonText: "Explore Services",
    nav: "ServicesPage",
  },
  {
    Icon: SectorIcon,
    tag: "Impact",
    heading: "Sector",
    bullets: [
      { label: "Food Security & Waste Reduction", desc: "Digital tools and localized data support both urban farms and traditional farming centers through oversupply periods — keeping harvests in the food system instead of landfills." },
      { label: "Livelihood Creation", desc: "Supplementary income streams for micro-vendors and home growers, directly addressing high unemployment and underemployment rates." },
      { label: "LGU & Seed Bank Programs", desc: "Standardized urban-farming training curricula for LGUs, plus distribution and tracking of native seed bank programs nationwide." },
    ],
    buttonText: "View Our Impact",
    nav: "OurImpactPage",
  },
];

function ProductServices({ setActiveNav }) {
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
    const index = Math.round(ratio * (productServicesCards.length - 1));

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
          @keyframes shimmerLine {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          .ps-card { transition: transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s cubic-bezier(.22,1,.36,1); }
        `}
      </style>

      <div className="inner-blur-glass glass-hover-zoom-sm" style={styles.badge}>
        <span style={styles.badgeDot} />
        <span>What We Offer</span>
      </div>

      <h1 style={{ ...styles.title, ...(isMobile ? styles.titleMobile : {}) }}>
        Product &amp; <span style={styles.accent}>Services</span>
      </h1>
      <div style={styles.titleUnderline} />

      <p style={{ ...styles.body, ...(isMobile ? styles.bodyMobile : {}) }}>
        EcoEquity offers a comprehensive suite of digital tools and resources
        to help you grow food, build community, and earn sustainably.
      </p>

      <div
        style={{ ...styles.cardRow, ...(isMobile ? styles.cardRowMobile : {}) }}
        className="hide-scroll"
        onScroll={handleScroll}
      >
        {productServicesCards.map((c) => (
          <div
            key={c.heading}
            className="inner-blur-glass ps-card"
            style={{
              ...styles.card,
              ...(isMobile ? styles.cardMobile : {}),
              ...(hoveredCard === c.heading ? styles.cardHov : {}),
            }}
            onMouseEnter={() => setHoveredCard(c.heading)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={styles.cardAccent} />
            <div style={styles.cardIconWrap}>
              <c.Icon />
            </div>
            <span style={styles.cardTag}>{c.tag}</span>
            <h3 style={{ ...styles.cardHeading, ...(isMobile ? styles.cardHeadingMobile : {}) }}>{c.heading}</h3>
            <div style={styles.cardDivider} />

            <ul style={styles.bulletList}>
              {c.bullets.map((b) => (
                <li key={b.label} style={styles.bulletItem}>
                  <span style={styles.bulletDot} />
                  <span style={{ ...styles.bulletText, ...(isMobile ? styles.bulletTextMobile : {}) }}>
                    <strong style={styles.bulletLabel}>{b.label}:</strong> {b.desc}
                  </span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              style={{
                ...styles.cardBtn,
                ...(isMobile ? styles.cardBtnMobile : {}),
              }}
              onClick={() => setActiveNav(c.nav)}
            >
              <span aria-hidden="true" style={styles.cardBtnInnerBlur} />
              <span style={styles.cardBtnContentLayer}>{c.buttonText} →</span>
            </button>
          </div>
        ))}
      </div>

      {/* Scroll Indicator Dots - Mobile Only */}
      {isMobile && (
        <div style={styles.indicatorRow}>
          {productServicesCards.map((_, i) => (
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
    </div>
  );
}

const styles = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "8px 16px 20px",
    maxWidth: "1100px",
    margin: "0 auto",
    animation: "fadeInUp 0.75s cubic-bezier(.22,1,.36,1) both",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  wrapMobile: {
    padding: "12px 12px 24px",
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
    color: "#15803d",
    letterSpacing: "0.6px",
    textTransform: "uppercase",
    marginBottom: "20px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.05)",
  },
  badgeDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#4ade80",
    boxShadow: "0 0 5px rgba(74,222,128,0.9)",
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
    fontSize: "clamp(26px, 7.5vw, 36px)",
  },
  titleUnderline: {
    width: "118px",
    height: "4px",
    background: "linear-gradient(90deg, rgba(74,222,128,0) 0%, #86efac 30%, #7dd3fc 50%, #86efac 70%, rgba(125,211,252,0) 100%)",
    backgroundSize: "200% 100%",
    margin: "0 auto 18px",
    boxShadow: "0 0 18px rgba(134,239,172,0.75)",
    borderRadius: "999px",
    animation: "titleReveal 0.9s cubic-bezier(.22,1,.36,1) 0.15s both, shimmerLine 2.5s linear infinite",
  },
  accent: {
    background: "linear-gradient(90deg, #4ade80, #86efac)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  body: {
    color: "#000",
    fontSize: "clamp(13px, 1.4vw, 15px)",
    fontWeight: 400,
    lineHeight: 1.72,
    maxWidth: "680px",
    marginBottom: "12px",
  },
  bodyMobile: {
    fontSize: "12px",
    lineHeight: "1.6",
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
    padding: "10px 40px 30px",
    gap: "16px",
    scrollSnapType: "x mandatory",
    scrollPadding: "0 40px",
    WebkitOverflowScrolling: "touch",
    alignItems: "stretch",
  },
  card: {
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(150deg, rgba(255,255,255,0.72), rgba(255,255,255,0.42))",
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: "22px",
    padding: "26px 24px 24px",
    flex: "1 1 300px",
    maxWidth: "350px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    textAlign: "left",
    gap: "9px",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.06)",
    cursor: "default",
  },
  cardMobile: {
    flex: "0 0 280px",
    maxWidth: "none",
    padding: "24px 20px 20px",
    scrollSnapAlign: "center",
    scrollSnapStop: "always",
  },
  cardHov: {
    transform: "translateY(-6px)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 18px 38px rgba(21,128,61,0.14)",
  },
  cardAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: "linear-gradient(90deg, #4ade80, #7dd3fc)",
  },
  cardIconWrap: {
    width: "52px",
    height: "52px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(150deg, rgba(74,222,128,0.18), rgba(125,211,252,0.16))",
    border: "1px solid rgba(255,255,255,0.7)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 4px 12px rgba(21,128,61,0.1)",
  },
  cardTag: {
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.7px",
    textTransform: "uppercase",
    color: "#15803d",
    background: "rgba(74,222,128,0.14)",
    padding: "3px 10px",
    borderRadius: "999px",
  },
  cardHeading: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#000",
    margin: "0",
    letterSpacing: "-0.3px",
  },
  cardHeadingMobile: {
    fontSize: "16px",
  },
  cardDivider: {
    width: "34px",
    height: "2px",
    borderRadius: "999px",
    background: "rgba(0,0,0,0.08)",
    margin: "2px 0 4px",
  },
  bulletList: {
    listStyle: "none",
    padding: 0,
    margin: "0 0 8px",
    display: "flex",
    flexDirection: "column",
    gap: "11px",
    width: "100%",
  },
  bulletItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
  },
  bulletDot: {
    flex: "0 0 auto",
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    marginTop: "7px",
    background: "linear-gradient(90deg, #4ade80, #7dd3fc)",
    boxShadow: "0 0 6px rgba(74,222,128,0.5)",
  },
  bulletText: {
    fontSize: "13px",
    color: "rgba(0, 0, 0, 0.72)",
    lineHeight: 1.55,
    textAlign: "left",
  },
  bulletLabel: {
    color: "#0f172a",
    fontWeight: 700,
  },
  bulletTextMobile: {
    fontSize: "12px",
    lineHeight: 1.5,
  },
  cardBtn: {
    position: "relative",
    overflow: "hidden",
    isolation: "isolate",
    marginTop: "auto",
    padding: "9px 20px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.35)",
    background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))",
    color: "#062018",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    transform: "scale(1)",
    transformOrigin: "center",
    willChange: "transform",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    fontFamily: "inherit",
    letterSpacing: "0.2px",
    boxShadow: "0 18px 38px rgba(34,197,94,0.26), inset 0 1px 0 rgba(255,255,255,0.48)",
    transition: "transform 0.16s ease",
    backdropFilter: "blur(18px) saturate(165%)",
    WebkitBackdropFilter: "blur(18px) saturate(165%)",
  },
  cardBtnInnerBlur: {
    position: "absolute",
    inset: "0",
    zIndex: 0,
    pointerEvents: "none",
    borderRadius: "inherit",
    background: "radial-gradient(circle at 28% 18%, rgba(255,255,255,0.35), transparent 42%), linear-gradient(135deg, rgba(134,239,172,0.36), rgba(125,211,252,0.32))",
    backdropFilter: "blur(34px) saturate(185%)",
    WebkitBackdropFilter: "blur(34px) saturate(185%)",
  },
  cardBtnContentLayer: {
    position: "relative",
    zIndex: 1,
  },
  cardBtnMobile: {
    fontSize: "11px",
    padding: "8px 16px",
    width: "100%",
    textAlign: "center",
    marginTop: "12px",
  },
  indicatorRow: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    marginTop: "0px",
    paddingBottom: "24px",
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "rgba(0, 0, 0, 0.2)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  dotActive: {
    background: "#4ade80",
    transform: "scale(1.25)",
    boxShadow: "0 0 10px rgba(74, 222, 128, 0.4)",
  },
};

export default ProductServices;
