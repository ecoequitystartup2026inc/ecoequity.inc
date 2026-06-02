import React, { useState, useEffect } from "react";

const targetMarketCards = [
  { heading: "Urban Novice", text: "AI-Guided Success: Market the 24/7 AI Plant Doctor as the indispensable tool for overcoming planting failure,leading to initial app download." },
  { heading: "Micro-Vendor", text: "Livelihood Creation: Market the Local Marketplace as the zero-friction platform to instantly monetize garden excess and florals.." },
  { heading: "Institutional Buyer (B2B)", text: "Cost & Supply Chain Efficiency:Market the B2B Surplus Module as the exclusive source for high-volume, below-market surplus produce (e.g., Baguio vegetables)." },
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
          @keyframes shimmerLine {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
        `}
      </style>

      <div className="inner-blur-glass glass-hover-zoom-sm" style={styles.badge}>
        <span style={styles.badgeDot} />
        <span>Who We Serve</span>
      </div>

      <h1 style={{ ...styles.title, ...(isMobile ? styles.titleMobile : {}) }}>
        Target <span style={styles.accent}>Market</span>
      </h1>
      <div style={styles.titleUnderline} />

      <p style={{ ...styles.body, ...(isMobile ? styles.bodyMobile : {}) }}>
        EcoEquity serves households and communities in the Philippines who are
        eager to achieve agricultural self-sufficiency through sustainable farming
        practices.
      </p>

      <div 
        style={{ ...styles.cardRow, ...(isMobile ? styles.cardRowMobile : {}) }} 
        className="hide-scroll"
        onScroll={handleScroll}
      >
        {targetMarketCards.map((c) => (
          <div
            key={c.heading}
            className="inner-blur-glass"
            style={{
              ...styles.card,
              ...(isMobile ? styles.cardMobile : {}),
              ...(hoveredCard === c.heading ? styles.cardHov : {}),
            }}
            onMouseEnter={() => setHoveredCard(c.heading)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <h3 style={{ ...styles.cardHeading, ...(isMobile ? styles.cardHeadingMobile : {}) }}>{c.heading}</h3>
            <p style={{ ...styles.cardText, ...(isMobile ? styles.cardTextMobile : {}) }}>{c.text}</p>
          </div>
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

      <p style={{ ...styles.body, ...(isMobile ? styles.bodyMobile : {}), marginTop: isMobile ? "12px" : "14px" }}>
        To achieve 150,000+ Active Monthly Users, onboard 3,500+ Active Micro-
        Vendors generating ₱63M in annual commerce fees, and successfully
        integrate the B2B network to mitigate critical food waste, thus
        validating EcoEquity as the Philippines' scalable solution for food
        security and livelihood.
      </p>
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
    maxWidth: "820px",
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
    fontWeight: 700,
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
    gap: "14px",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: "12px",
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
    background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: "20px",
    padding: "24px 20px",
    flex: "1 1 160px",
    maxWidth: "200px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.05)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    cursor: "default",
  },
  cardMobile: {
    flex: "0 0 240px",
    maxWidth: "none",
    padding: "20px 16px",
    scrollSnapAlign: "center",
    scrollSnapStop: "always",
  },
  cardHov: {
    transform: "scale(1.025)",
  },
  cardHeading: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#000",
    margin: 0,
    letterSpacing: "-0.2px",
  },
  cardHeadingMobile: {
    fontSize: "14px",
  },
  cardText: {
    fontSize: "13px",
    color: "rgba(0, 0, 0, 0.8)",
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
    background: "#4ade80",
    transform: "scale(1.25)",
    boxShadow: "0 0 10px rgba(74, 222, 128, 0.4)",
  },
};

export default TargetMarket;
