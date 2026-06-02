import React from "react";

function AboutUs() {
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
        <span>Who We Are</span>
      </div>

      <h1 style={styles.title}>
        About <span style={styles.accent}>EcoEquity</span>
      </h1>
      <div style={styles.titleUnderline} />

      <h2 style={styles.subtitle}>Business Concept</h2>

      <p style={styles.body}>
        EcoEquity is a digital-first, high-engagement platform designed to boost
        agricultural self-sufficiency in the Philippines by starting at the household
        and community level. It acts as the "Canvas for Green Skills" through a hybrid
        model: AI-Guided Education for personalized growing instruction, a Community Hub
        for real-world learning and connection, and a Micro-Commerce Engine for users to
        sell local produce.
      </p>

      <p style={styles.body}>
        The goal is to empower citizens to grow their own food, reduce reliance on
        imports, foster a greener environment, and create supplementary income.
      </p>

      <h2 style={styles.subtitle}>Mission & Vision</h2>

      <p style={styles.body}>
        Our mission is to empower every household in the Philippines to achieve agricultural self-sufficiency through innovative digital tools and community-driven learning. Our vision is a greener, more sustainable Philippines where every family grows their own food.
      </p>

    </div>
  );
}

const styles = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    textAlign: "left",
    padding: "32px 16px 24px",
    maxWidth: "760px",
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
    color: "var(--text-primary)",
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
    margin: "0 0 18px",
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
  subtitle: {
    fontSize: "clamp(18px, 2.2vw, 24px)",
    fontWeight: 600,
    color: "var(--text-primary)",
    margin: "0 0 12px",
    lineHeight: 1.25,
    letterSpacing: "-0.3px",
  },
body: {
    color: "var(--text-primary)",
    fontSize: "clamp(14px, 1.5vw, 16px)",
    fontWeight: 400,
    lineHeight: 1.72,
    maxWidth: "800px",
    marginBottom: "14px",
    textAlign: "justify",
  },
  cardRow: {
    display: "flex",
    gap: "14px",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: "28px",
    width: "100%",
  },
  card: {
    background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: "20px",
    padding: "24px 20px",
    flex: "1 1 180px",
    maxWidth: "220px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.05)",
  },
  cardIcon: {
    fontSize: "28px",
    lineHeight: 1,
  },
  cardHeading: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#000",
    margin: 0,
    letterSpacing: "-0.2px",
  },
  cardText: {
    fontSize: "13px",
    color: "rgba(0, 0, 0, 0.7)",
    lineHeight: 1.6,
    margin: 0,
  },
};

export default AboutUs;
