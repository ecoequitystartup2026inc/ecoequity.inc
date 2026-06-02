import React, { useState } from "react";

function BenefitsOfTheProject() {  
  const [statsStripHovered, setStatsStripHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <div style={styles.wrap}>
      <style>
        {`
          @keyframes shimmerLine {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
        `}
      </style>
      <div className="inner-blur-glass glass-hover-zoom-sm" style={styles.badge}>
        <span style={styles.badgeDot} />
        <span>Project Advantages</span>
      </div>

      <h1 style={styles.title}>
        Benefits of the <span style={styles.accent}>Project</span>
      </h1>
      <div style={styles.titleUnderline} />

      <p style={styles.body}>
        This project offers a dual benefit: financial viability by
        achieving a projected 218.9% ROI over three years, and
        critical social impact by empowering 3,500+ micro-vendors
        and mitigating significant food waste, directly addressing
        the Philippines' food security crisis.
      </p>

      {/* Horizontal Glass Panel with stats */}
      <div
        className="inner-blur-glass"
        style={{
          ...styles.statsStrip,
          marginTop: '20px',
          ...(isMobile ? styles.statsStripMobile : {}),
          ...(statsStripHovered ? styles.statsStripHov : {}) }}
        onMouseEnter={() => setStatsStripHovered(true)}
        onMouseLeave={() => setStatsStripHovered(false)}
      >
        {[
          { value: "98%", label: "Company Growth" },
          { value: "99+", label: "Partners" },
          { value: "1000+", label: "Customers" },
        ].map((s, i, arr) => (
          <div
            key={s.label}
            style={{
              ...styles.statCell,
              ...(isMobile ? styles.statCellMobile : {}),
              ...(i < arr.length - 1 ? styles.statCellDivider : {}),
            }}
          >
            <span style={{ ...styles.statVal, ...(isMobile ? styles.statValMobile : {}) }}>{s.value}</span>
            <span style={{ ...styles.statLbl, ...(isMobile ? styles.statLblMobile : {}) }}>{s.label}</span>
          </div>
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
    maxWidth: "1100px",
    margin: "0 auto",
    animation: "fadeInUp 0.75s cubic-bezier(.22,1,.36,1) both",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
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
    maxWidth: "680px",
    marginBottom: "24px",
  },
  statsStrip: { 
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "15px 40px",
    borderRadius: "14px",
    background: "linear-gradient(145deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
    border: "1px solid rgba(0,0,0,0.05)",
    boxShadow:
      "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.05)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
  },
  statsStripHov: {
    transform: "scale(1.015)",
  },
  statsStripMobile: {
    padding: "12px 20px",
  },

  statCell: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "0 18px",
  },
  statCellMobile: {
    padding: "0 10px",
  },

  statCellDivider: {
    borderRight: "1px solid rgba(0,0,0,0.1)",
  },

  statVal: {
    fontSize: "24px", // Made bigger
    fontWeight: 700,
    color: "#000", 
    letterSpacing: "-0.5px",
    lineHeight: 1.1,
    marginBottom: "3px", // Adjusted spacing
  },
  statValMobile: {
    fontSize: "18px",
  },

  statLbl: {
    fontSize: "12px", // Made bigger
    fontWeight: 500,
    color: "rgba(0, 0, 0, 0.7)",
    letterSpacing: "0.9px",
    textTransform: "uppercase",
  },
  statLblMobile: {
    fontSize: "9px",
  },
};

export default BenefitsOfTheProject;
