import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaSeedling, FaLeaf, FaUsers, FaChartBar, FaGlobeAmericas, FaHandshake, FaAward, FaBoxes, FaTruck, FaHandsHelping, FaChartLine, FaFlask } from "react-icons/fa";

const seedBankStats = [
  { id: 1, label: "Varieties Preserved", value: "250+", icon: <FaSeedling /> },
  { id: 2, label: "Community Participants", value: "1,200+", icon: <FaUsers /> },
  { id: 3, label: "Distribution Reach", value: "92%", icon: <FaGlobeAmericas /> },
];

const preservationPrograms = [
  {
    title: "Heirloom Seed Collection",
    desc: "Identifying, collecting, and cataloging rare and endangered native seed varieties across the Philippines.",
    icon: "🌾",
  },
  {
    title: "Community Seed Guardians",
    desc: "Training local farmers and community members to become stewards of native seeds, ensuring their long-term viability.",
    icon: "🧑‍🌾",
  },
  {
    title: "Digital Seed Registry",
    desc: "A comprehensive online database tracking all preserved seeds, their origins, and genetic information.",
    icon: "💻",
  },
];

const distributionTracking = [
  { id: 1, program: "LGU Seed Distribution", status: "Ongoing", count: "50+ LGUs", icon: <FaHandshake /> },
  { id: 2, program: "Farmer Outreach Kits", status: "Active", count: "800+ Kits", icon: <FaBoxes /> },
  { id: 3, program: "Research & Development", status: "Planned", count: "10+ Projects", icon: <FaFlask /> },
];

function NativeSeedBankPage({ setActiveNav }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isHoveredBack, setIsHoveredBack] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    setAnimate(true);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={{ ...styles.wrap, ...(isMobile ? styles.wrapMobile : {}) }}>
      <style>
        {`
          @keyframes barGrow {
            from { width: 0; }
            to { width: var(--target-width); }
          }
          .animate-bar {
            animation: barGrow 1.5s cubic-bezier(.22,1,.36,1) forwards;
          }
          .hide-scroll::-webkit-scrollbar { display: none; }
          .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>

      <div style={styles.headerRow}>
        <div style={styles.backBtnWrap}>
          <button
            type="button"
            className="inner-blur-glass"
            style={{
              ...styles.backBtn,
              ...(isHoveredBack ? styles.backBtnHov : {}),
            }}
            onClick={() => setActiveNav && setActiveNav(isMobile ? "Home" : "OurImpactPage")}
            onMouseEnter={() => setIsHoveredBack(true)}
            onMouseLeave={() => setIsHoveredBack(false)}
          > 
            <FaArrowLeft />
          </button>
        </div>
        <div className="inner-blur-glass glass-hover-zoom-sm" style={styles.badge}>
          <span style={styles.badgeDot} />
          <span style={styles.glassContentLayer}>Native Seed Bank</span>
        </div>
      </div>

      <h1 style={{ ...styles.title, ...(isMobile ? styles.titleMobile : {}) }}>
        Preserving <span style={styles.titleAccent}>Biodiversity</span>
      </h1>
      <div style={styles.titleUnderline} />

      <p style={{ ...styles.body, ...(isMobile ? styles.bodyMobile : {}) }}>
        Our Native Seed Bank program is dedicated to the conservation and propagation of indigenous crop varieties, ensuring agricultural resilience and cultural heritage for future generations.
      </p>

      <div style={{ ...styles.dashboardGrid, ...(isMobile ? styles.dashboardGridMobile : {}) }}>
        
        {/* Animated Statistics Cards */}
        <div style={styles.statsRow}>
          {seedBankStats.map((stat) => (
            <div key={stat.id} className="inner-blur-glass" style={styles.statCard}>
              <div style={styles.statIcon}>{stat.icon}</div>
              <div style={styles.statValue}>{stat.value}</div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Seed Preservation Programs */}
        <div className="inner-blur-glass" style={styles.programsCard}>
          <div style={styles.cardHeader}>
            <FaLeaf style={styles.cardIcon} />
            <h3 style={styles.cardTitle}>Preservation Programs</h3>
          </div>
          <div style={styles.programList}>
            {preservationPrograms.map((program, i) => (
              <div key={i} style={styles.programItem}>
                <span style={styles.programIconEmoji}>{program.icon}</span>
                <div style={styles.programText}>
                  <h4 style={styles.programTitle}>{program.title}</h4>
                  <p style={styles.programDesc}>{program.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <button type="button" style={styles.ctaButton} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.035)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>Learn More</button>
        </div>

        {/* Distribution Tracking */}
        <div className="inner-blur-glass" style={styles.chartCard}>
          <div style={styles.cardHeader}>
            <FaTruck style={styles.cardIcon} />
            <h3 style={styles.cardTitle}>Distribution Tracking</h3>
          </div>
          <div style={styles.distributionList}>
            {distributionTracking.map((item) => (
              <div key={item.id} style={styles.distributionItem}>
                <span style={styles.distributionIcon}>{item.icon}</span>
                <div style={styles.distributionDetails}>
                  <span style={styles.distributionProgram}>{item.program}</span>
                  <span style={styles.distributionCount}>{item.count}</span>
                </div>
                <span style={{ ...styles.distributionStatus, ...(item.status === "Ongoing" ? styles.statusOngoing : item.status === "Active" ? styles.statusActive : styles.statusPlanned) }}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
          <button type="button" style={styles.ctaButton} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.035)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>View Reports</button>
        </div>

        {/* Agricultural Sustainability Metrics */}
        <div className="inner-blur-glass" style={styles.metricsCard}>
          <div style={styles.cardHeader}>
            <FaChartLine style={styles.cardIcon} />
            <h3 style={styles.cardTitle}>Sustainability Metrics</h3>
          </div>
          <div style={styles.metricsGrid}>
            <div style={styles.metricItem}>
              <FaAward style={styles.metricIcon} />
              <span style={styles.metricValue}>+30%</span>
              <span style={styles.metricLabel}>Biodiversity Index</span>
            </div>
            <div style={styles.metricItem}>
              <FaHandsHelping style={styles.metricIcon} />
              <span style={styles.metricValue}>95%</span>
              <span style={styles.metricLabel}>Retention Rate</span>
            </div>
          </div>
          <button type="button" style={styles.ctaButton} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.035)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>Full Analytics</button>
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
    padding: "18px 16px 40px",
    maxWidth: "1100px",
    margin: "0 auto",
    animation: "fadeInUp 0.75s cubic-bezier(.22,1,.36,1) both",
    fontFamily: "'Inter', sans-serif",
    overflowY: "auto",
    height: "100%",
    boxSizing: "border-box",
  },
  wrapMobile: {
    padding: "16px 8px 30px",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    position: "relative",
    marginBottom: "12px",
  },
  backBtnWrap: {
    position: "absolute",
    left: 0,
    top: "-5px",
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
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.05)",
    transition: "transform 0.2s ease",
  },
  backBtnHov: {
    transform: "scale(1.035)",
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
  glassContentLayer: {
    position: "relative",
    zIndex: 1,
  },
  title: {
    fontSize: "clamp(24px, 3.2vw, 38px)",
    fontWeight: 800,
    color: "#000",
    margin: "0 0 10px",
    fontFamily: "'Poppins', sans-serif",
    lineHeight: 1.03,
    letterSpacing: "0",
    textShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  titleMobile: {
    fontSize: "clamp(20px, 7vw, 30px)",
  },
  titleUnderline: {
    width: "118px",
    height: "4px",
    background: "linear-gradient(90deg, rgba(22,163,74,0) 0%, #16a34a 30%, #0284c7 50%, #16a34a 70%, rgba(2,132,199,0) 100%)",
    backgroundSize: "200% 100%",
    margin: "0 auto 22px",
    boxShadow: "0 0 12px rgba(22,163,74,0.4)",
    borderRadius: "999px",
  },
  titleAccent: {
    background: "linear-gradient(90deg, #15803d, #16a34a)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  body: {
    color: "rgba(0,0,0,0.75)",
    marginBottom: "30px",
    fontSize: "clamp(14px, 1.6vw, 17px)",
    fontWeight: 400,
    lineHeight: 1.72,
    maxWidth: "640px",
    margin: "0 auto 30px",
  },
  bodyMobile: {
    fontSize: "13px",
    lineHeight: "1.5",
  },
  dashboardGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    width: "100%",
    maxWidth: "1000px",
    marginTop: "10px",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    width: "100%",
  },
  statCard: {
    padding: "24px",
    borderRadius: "20px",
    background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxShadow: "0 8px 24px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)",
    backdropFilter: "blur(20px) saturate(165%)",
    transition: "transform 0.3s ease",
  },
  statIcon: {
    fontSize: "24px",
    color: "#15803d",
    marginBottom: "8px",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: 800,
    color: "#000",
    lineHeight: 1,
  },
  statLabel: {
    fontSize: "13px",
    fontWeight: 600,
    color: "rgba(0,0,0,0.5)",
    marginTop: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  programsCard: {
    padding: "24px",
    borderRadius: "24px",
    textAlign: "left",
    background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
    boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
  },
  cardIcon: {
    fontSize: "20px",
    color: "#15803d",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: 700,
    margin: 0,
  },
  programList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  programItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "16px",
    background: "rgba(255,255,255,0.5)",
    borderRadius: "16px",
    border: "1px solid rgba(0,0,0,0.03)",
  },
  programIconEmoji: {
    fontSize: "28px",
    flexShrink: 0,
  },
  programText: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  programTitle: {
    fontSize: "15px",
    fontWeight: 700,
    margin: 0,
  },
  programDesc: {
    fontSize: "13px",
    color: "rgba(0,0,0,0.6)",
    margin: 0,
    lineHeight: 1.4,
  },
  chartCard: { // Reusing chartCard for Distribution Tracking
    padding: "24px",
    borderRadius: "24px",
    textAlign: "left",
    background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
    boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
  },
  distributionList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  distributionItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    background: "rgba(0,0,0,0.03)",
    borderRadius: "12px",
  },
  distributionIcon: {
    fontSize: "20px",
    color: "#15803d",
  },
  distributionDetails: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    flex: 1,
    marginLeft: "12px",
  },
  distributionProgram: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#000",
  },
  distributionCount: {
    fontSize: "12px",
    color: "rgba(0,0,0,0.6)",
  },
  distributionStatus: {
    fontSize: "11px",
    fontWeight: 700,
    padding: "4px 8px",
    borderRadius: "999px",
  },
  statusOngoing: {
    background: "rgba(2,132,199,0.1)",
    color: "#0284c7",
  },
  statusActive: {
    background: "rgba(22,163,74,0.1)",
    color: "#16a34a",
  },
  statusPlanned: {
    background: "rgba(251,191,36,0.1)",
    color: "#fbbf24",
  },
  metricsCard: {
    padding: "24px",
    borderRadius: "24px",
    textAlign: "left",
    background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
    boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginTop: "10px",
  },
  metricItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "15px",
    background: "rgba(0,0,0,0.03)",
    borderRadius: "15px",
  },
  metricIcon: {
    fontSize: "28px",
    color: "#15803d",
    marginBottom: "8px",
  },
  metricValue: {
    fontSize: "24px",
    fontWeight: 800,
    color: "#000",
  },
  metricLabel: {
    fontSize: "12px",
    fontWeight: 600,
    color: "rgba(0,0,0,0.6)",
    textTransform: "uppercase",
    marginTop: "4px",
  },
  ctaButton: {
    marginTop: "24px",
    padding: "12px 24px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))",
    color: "#062018",
    border: "1px solid rgba(255,255,255,0.35)",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "default",
    width: "fit-content",
    alignSelf: "center",
    boxShadow: "0 18px 38px rgba(34,197,94,0.26), inset 0 1px 0 rgba(255,255,255,0.48)",
    transition: "transform 0.2s ease",
  },
};

export default NativeSeedBankPage;
