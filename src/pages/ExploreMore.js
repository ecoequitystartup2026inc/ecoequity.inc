import React, { useState } from "react";

function ExploreMore({ setActiveNav }) {
  const [isHovered, setIsHovered] = useState(false);

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
      <div style={styles.headerRow}>
        <div style={styles.backBtnWrap}>
          <button
            type="button"
            className="inner-blur-glass"
            style={{
              ...styles.backBtn,
              ...(isHovered ? styles.backBtnHov : {}),
            }}
            onClick={() => setActiveNav && setActiveNav("Learn More")}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          > 
            <span>←</span>
          </button>
        </div>
        <div className="inner-blur-glass glass-hover-zoom-sm" style={styles.badge}>
          <span style={styles.badgeDot} />
          <span>Explore More</span>
        </div>
      </div>

      <h1 style={styles.title}>
        Problem <span style={styles.accent}>Addressed</span>
      </h1>
      <div style={styles.titleUnderline} />

      <p style={styles.body}>
        Dive deeper into our platform's capabilities and discover how we are
        revolutionizing agriculture across the Philippines through sustainable practices.
      </p>

      <div style={styles.circleCol} data-testid="timeline-container">
        <div style={styles.timelineItem}>
          <div className="inner-blur-glass glass-hover-zoom" style={styles.circle}><span>1980</span></div>
          <div style={styles.timelineText}>
            <h3 style={styles.timelineHeading}>
              SHIFT FROM SELF-SUFFICIENCY TO IMPORT DEPENDENCY
            </h3>
            <p style={styles.timelineBody}>
              The Peso devaluation (1980s Debt Crisis) made imported inputs expensive, immediately followed by WTO liberalization (1995). This killed local farmer profitability and formally cemented the reliance on cheap rice imports.
            </p>
          </div>
        </div>
        <div style={styles.timelineItem}>
          <div className="inner-blur-glass glass-hover-zoom" style={styles.circle}><span>2000</span></div>
          <div style={styles.timelineText}>
            <h3 style={styles.timelineHeading}>
              WTO ACCESSION & TRADE LIBERALIZATION
            </h3>
            <p style={styles.timelineBody}>
              Cheap imports flooded the market, making local crops unprofitable. Policy formally shifted to Import-Based Security, severely reducing domestic food sufficiency.
            </p>
          </div>
        </div>
        <div style={styles.timelineItem}>
          <div className="inner-blur-glass glass-hover-zoom" style={styles.circle}><span>2010</span></div>
          <div style={styles.timelineText}>
            <h3 style={styles.timelineHeading}>
              GLOBAL PRICE SHOCKS & RAPID URBANIZATION
            </h3>
            <p style={styles.timelineBody}>
              Import dependency caused high USD rates to translate to inaccessible domestic food prices. Rapid conversion of farmland further reduced productive capacity, heightening scarcity in urban areas.
            </p>
          </div>
        </div>
        <div style={styles.timelineItem}>
          <div className="inner-blur-glass glass-hover-zoom" style={styles.circle}><span>2020</span></div>
          <div style={styles.timelineText}>
            <h3 style={styles.timelineHeading}>
              PANDEMIC & SUPPLY CHAIN FRAGILITY
            </h3>
            <p style={styles.timelineBody}>
              Global supply shocks demonstrated the inability to sustain the population without external aid. Chronic high food inflation coupled with low employment made food fundamentally unaffordable and inaccessible for many Filipinos.
            </p>
          </div>
        </div>
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
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    position: "relative",
    marginBottom: "20px",
  },
  backBtnWrap: {
    position: "absolute",
    left: 0,
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
    marginBottom: "24px",
  },
  backBtn: {
    padding: "8px 16px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(0,0,0,0.05)",
    color: "#000",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: "0.2px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.05)",
  },
  backBtnHov: {
    transform: "scale(1.035)",
  },
  circleCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    alignSelf: "center",
    gap: "24px",
    marginTop: "20px",
  },
  circle: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
    border: "1px solid rgba(0,0,0,0.05)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: 600,
    color: "#000",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.05)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    flexShrink: 0,
  },
  timelineItem: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
    textAlign: "left",
  },
  timelineText: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    maxWidth: "500px",
  },
  timelineHeading: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#000",
    margin: 0,
    letterSpacing: "-0.2px",
    lineHeight: 1.4,
  },
  timelineBody: {
    fontSize: "14px",
    color: "rgba(0, 0, 0, 0.8)",
    lineHeight: 1.6,
    margin: 0,
    textAlign: "left",
  },
};

export default ExploreMore;
