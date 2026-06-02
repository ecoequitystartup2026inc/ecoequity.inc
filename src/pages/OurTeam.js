import React, { useState, useEffect } from "react";

function OurTeam() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const team = [
    { name: "JHUN RUSSEL D. CLEMENTE", role: "ROLE", img: "Russel.jpeg" },
    { name: "NAME", role: "ROLE", img: "Rus3.jpeg" },
    { name: "NAME", role: "ROLE", img: "Rus4.jpeg" },
    { name: "NAME", role: "ROLE", img: "Rus5.jpeg" },
  ];

  const handleScroll = (e) => {
    const { scrollLeft, scrollWidth, clientWidth } = e.target;
    if (scrollWidth <= clientWidth) return;

    // Calculate which item is most centered/visible based on scroll position
    const ratio = scrollLeft / (scrollWidth - clientWidth);
    const index = Math.round(ratio * (team.length - 1));

    if (index !== activeIndex && !isNaN(index)) {
      setActiveIndex(index);
    }
  };

  return (
    <div style={{ ...styles.wrap, ...(isMobile ? styles.wrapMobile : {}) }}>
      {/* Inject styles to hide scrollbar while keeping functionality */}
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
        <span>The People</span>
      </div>

      <h1 style={styles.title}>
        Our <span style={styles.accent}>Team</span>
      </h1>
      <div style={styles.titleUnderline} />

      <p style={styles.body}>
        EcoEquity is built by a passionate team dedicated to transforming
        agriculture in the Philippines through innovation and community-driven
        solutions.
      </p>

      <div 
        style={{ ...styles.cardRow, ...(isMobile ? styles.cardRowMobile : {}) }} 
        className="hide-scroll"
        onScroll={handleScroll}
      >
        {team.map((c, index) => (
          <div
            key={index}
            className="inner-blur-glass"
            style={{
              ...styles.card,
              ...(isMobile ? styles.cardMobile : {}),
              ...(hoveredCard === index ? styles.cardHov : {}),
            }}
            onMouseEnter={() => setHoveredCard(index)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <img src={c.img} alt={c.name} style={{ ...styles.cardImage, ...(isMobile ? styles.cardImageMobile : {}) }} />
            <h3 style={{ ...styles.cardHeading, ...(isMobile ? styles.cardHeadingMobile : {}) }}>{c.name}</h3>
            <p style={{ ...styles.cardRole, ...(isMobile ? styles.cardRoleMobile : {}) }}>{c.role}</p>
          </div>
        ))}
      </div>

      {/* Scroll Indicator Dots */}
      <div style={styles.indicatorRow}>
        {team.map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.dot,
              ...(activeIndex === i ? styles.dotActive : {}),
            }}
          />
        ))}
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
    padding: "32px 16px 24px",
    maxWidth: "820px",
    margin: "0 auto",
    animation: "fadeInUp 0.75s cubic-bezier(.22,1,.36,1) both",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  wrapMobile: {
    padding: "24px 10px 30px",
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
  cardRow: {
    display: "flex",
    flexWrap: "nowrap",
    gap: "24px",
    justifyContent: "flex-start",
    marginTop: "32px",
    padding: "16px 8px 32px 8px", // Padding allows box-shadows to show without clipping
    width: "100%",
    overflowX: "auto",
    scrollSnapType: "x mandatory",
    WebkitOverflowScrolling: "touch",
  },
  cardRowMobile: {
    gap: "16px",
    padding: "16px 40px 32px",
    scrollPadding: "0 40px",
  },
  card: {
    background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: "20px",
    padding: "32px 24px",
    flex: "0 0 240px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.05)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    scrollSnapAlign: "center",
    cursor: "default",
  },
  cardMobile: {
    flex: "0 0 200px",
    padding: "24px 18px",
    scrollSnapAlign: "center",
  },
  cardHov: {
    transform: "scale(1.025)",
  },
  cardImage: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid rgba(0, 0, 0, 0.05)",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
    marginBottom: "8px",
  },
  cardImageMobile: {
    width: "80px",
    height: "80px",
  },
  cardHeading: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#000",
    margin: 0,
    letterSpacing: "-0.3px",
  },
  cardHeadingMobile: {
    fontSize: "16px",
  },
  cardRole: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#15803d",
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "0.8px",
  },
  cardRoleMobile: {
    fontSize: "11px",
  },
  indicatorRow: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    marginTop: "-12px",
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

export default OurTeam;
