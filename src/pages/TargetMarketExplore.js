import React, { useState, useEffect } from "react";

const acquisitionCards = [
  { heading: "Digital Acquisition", text: "• Content Marketing: Create highly shareable content leveraging the AI Plant Doctor data for localized insights.\n\n• SEO/ASO: Target high-intent search terms related to urban farming, local crop diseases, and \"Plantito/Plantita\" guides in Tagalog and regional dialects.\n\n• Monetization Strategy: Offer the AI diagnosis and basic Canvas courses for free and convert users to the Paid Subscription Tier for Certification Tracks and advanced data." },
  { heading: "Physical & Community Engagement", text: "• LGU Partnership Integration: Partner with LGUs and Barangays to promote Event RSVP for official community training, instantly providing credibility and access to organized groups.\n\n• Specialist Workshops: Host high-value workshops via the Community Hub using verified local specialists. Heavily market these events in launch cities to drive physical platform adoption.\n\n• Word-of-Mouth: Encourage successful Novice users (via events) to become Micro-Vendors, showing a clear path from learning to earning." },
  { heading: "B2B & Sector Integration", text: "• Direct Sales to Institutions: Employ a small, specialized sales team to onboard hotels, restaurants, and food processors into the Institutional Buyer Network. The pitch is based on verifiable cost savings and Corporate Social Responsibility (CSR) impact (food waste reduction).\n\n• Farmer Outreach: Partner with provincial agricultural offices and farmer cooperatives in major producing regions (e.g., Benguet for vegetables) to demonstrate the immediate financial value of the Bulk Listing / Surplus Module in preventing spoilage losses." },
];

function TargetMarketExplore() {
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
    const index = Math.round(ratio * (acquisitionCards.length - 1));

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

      <div style={styles.headerRow}>
        <div className="inner-blur-glass glass-hover-zoom-sm" style={styles.badge}>
          <span style={styles.badgeDot} />
          <span>Who We Serve</span>
        </div>
      </div>

      <h1 style={{ ...styles.title, ...(isMobile ? styles.titleMobile : {}) }}>
        Distribution Channels <span style={styles.accent}>and Acquisition Tactics</span>
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
        {acquisitionCards.map((c) => (
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
          {acquisitionCards.map((_, i) => (
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
    padding: "6px 16px 20px",
    maxWidth: "1100px",
    margin: "0 auto",
    animation: "fadeInUp 0.75s cubic-bezier(.22,1,.36,1) both",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  wrapMobile: {
    padding: "16px 12px 30px",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    position: "relative",
    marginBottom: "12px",
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
    fontSize: "clamp(28px, 4vw, 44px)",
    fontWeight: 700,
    color: "#000",
    margin: "0 0 8px",
    lineHeight: 1.15,
    letterSpacing: "-0.8px",
    textShadow: "0 4px 12px rgba(0,0,0,0.1)",
    animation: "titleReveal 0.9s cubic-bezier(.22,1,.36,1) 0.15s both",
  },
  titleMobile: {
    fontSize: "clamp(22px, 7vw, 32px)",
  },
  titleUnderline: {
    width: "118px",
    height: "4px",
    background: "linear-gradient(90deg, rgba(74,222,128,0) 0%, #86efac 30%, #7dd3fc 50%, #86efac 70%, rgba(125,211,252,0) 100%)",
    backgroundSize: "200% 100%",
    margin: "0 auto 10px",
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
    marginBottom: "0",
  },
  bodyMobile: {
    fontSize: "13px",
    lineHeight: "1.6",
    marginBottom: "8px",
  },
  cardRow: {
    display: "flex",
    gap: "24px",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "stretch",
    marginTop: "6px",
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
  },
  card: {
    background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: "16px",
    padding: "24px",
    flex: "1 1 300px",
    maxWidth: "340px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    textAlign: "left",
    gap: "12px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.05)",
    backdropFilter: "blur(20px) saturate(165%)",
    WebkitBackdropFilter: "blur(20px) saturate(165%)",
    cursor: "default",
  },
  cardMobile: {
    flex: "0 0 280px",
    padding: "18px",
    gap: "10px",
    scrollSnapAlign: "center",
    scrollSnapStop: "always",
  },
  cardHov: {
    transform: "scale(1.025)",
  },
  cardHeading: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#000",
    margin: 0,
    letterSpacing: "-0.2px",
  },
  cardHeadingMobile: {
    fontSize: "15px",
  },
  cardText: {
    fontSize: "14px",
    color: "rgba(0, 0, 0, 0.8)",
    lineHeight: 1.6,
    margin: 0,
    whiteSpace: "pre-line",
    textAlign: "left",
  },
  cardTextMobile: {
    fontSize: "12px",
    lineHeight: "1.5",
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

export default TargetMarketExplore;
