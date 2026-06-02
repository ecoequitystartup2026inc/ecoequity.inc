import React, { useState, useEffect } from "react";

const productServicesCards = [
  { 
    heading: "Product", 
    text: "• Organic Edibles: Local produce, herbs, organic kits. Floriculture, localized seeds.\n\n• AI Data Subscription: Premium 24/7 predictive diagnostics and localized weather alerts. Specialist Certification: Paid access to comprehensive courses.\n\n• Urban Starter Kits & Toolsets: Themed kits (e.g., Balcony Herb Garden, Tomato Success Kit), customized soil mixes, localized seeds, and basic tool sets.",
    buttonText: "Explore Products"
  },
  { 
    heading: "Services", 
    text: "• 24/7 AI Plant Doctor, localized care guides tailored to Philippine climate and native crops.\n\n• Real-world event management, allowing users to RSVP to specialist workshops, trainings, and local venue gatherings.\n\n• Dedicated system for commercial farmers to list large-volume oversupply (surplus). Notifies institutional buyers (hotels, processors) for immediate purchase.",
    buttonText: "Explore Services"
  },
  { 
    heading: "Sector", 
    text: "• Provides essential digital tools and localized data, supporting both urban farming and traditional farming centers during periods of oversupply.\n\n• Creates supplementary income streams for micro-vendors, directly addressing high unemployment/underemployment rates.\n\n• Offers a platform for standardized LGU urban farming training curricula and facilitates the distribution and tracking of native seed bank programs.",
    buttonText: "View Our Impact"
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
            <button 
              type="button" 
              style={{
                ...styles.cardBtn,
                ...(isMobile ? styles.cardBtnMobile : {})
              }}
              onClick={() => {
                if (c.heading === "Product") setActiveNav("ProductsPage");
                if (c.heading === "Services") setActiveNav("ServicesPage");
                if (c.heading === "Sector") setActiveNav("OurImpactPage");
              }}
            >
              <span aria-hidden="true" style={styles.cardBtnInnerBlur} />
              <span style={styles.cardBtnContentLayer}>{c.buttonText}</span>
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
    marginBottom: "12px",
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
    gap: "24px",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "stretch", // Ensures cards stretch to fill height
    marginTop: "0", // Adjusted to rely on productIconsRow's marginBottom
    width: "100%",
  },
  cardRowMobile: {
    flexWrap: "nowrap",
    justifyContent: "flex-start",
    overflowX: "auto",
    padding: "10px 40px 30px",
    gap: "20px",
    scrollSnapType: "x mandatory",
    scrollPadding: "0 40px",
    WebkitOverflowScrolling: "touch",
    alignItems: "stretch",
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
    gap: "8px",
    backdropFilter: "blur(20px) saturate(165%)",
    WebkitBackdropFilter: "blur(20px) saturate(165%)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.05)",
    cursor: "default",
  },
  cardMobile: {
    flex: "0 0 280px",
    padding: "20px",
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
    margin: "0",
    letterSpacing: "-0.2px",
  },
  cardHeadingMobile: {
    fontSize: "15px",
  },
  cardText: {
    fontSize: "14px",
    color: "rgba(0, 0, 0, 0.8)",
    lineHeight: 1.5,
    margin: "0 0 16px", // Added bottom margin for spacing
    textAlign: "left",
    whiteSpace: "pre-line",
  },
  cardTextMobile: {
    fontSize: "12px",
    lineHeight: "1.3", // Kept original line height for mobile
    marginBottom: "12px", // Added bottom margin for mobile spacing
  },
  cardBtn: {
    position: "relative",
    overflow: "hidden",
    isolation: "isolate",
    marginTop: "auto",
    padding: "8px 18px",
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
    padding: "6px 14px",
    width: "100%",
    textAlign: "center",
    marginTop: "12px",
  },
  cardBtnHov: {
    transform: "scale(1.035)",
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
