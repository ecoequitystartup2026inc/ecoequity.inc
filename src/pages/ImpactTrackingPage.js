import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaChartLine, FaLeaf, FaCloudMeatball, FaUsers, FaHandshake, FaSeedling, FaTractor } from "react-icons/fa6";

const impactStats = [
  { id: 1, label: "Crops Grown", value: "150+ Tons", icon: <FaLeaf /> },
  { id: 2, label: "CO₂ Reduced", value: "100+ Tons", icon: <FaCloudMeatball /> },
  { id: 3, label: "People Reached", value: "15,000+", icon: <FaUsers /> },
  { id: 4, label: "Community Projects", value: "128", icon: <FaHandshake /> },
];

const communityImpactData = [
  { id: 1, area: "Food Security", progress: 85, color: "#16a34a" },
  { id: 2, area: "Economic Empowerment", progress: 70, color: "#0284c7" },
  { id: 3, area: "Environmental Stewardship", progress: 90, color: "#15803d" },
  { id: 4, area: "Biodiversity Preservation", progress: 65, color: "#fbbf24" },
];

function ImpactTrackingPage({ setActiveNav }) {
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
          <span style={styles.glassContentLayer}>Impact Tracking</span>
        </div>
      </div>

      <h1 style={{ ...styles.title, ...(isMobile ? styles.titleMobile : {}) }}>
        Measuring Our <span style={styles.titleAccent}>Impact</span>
      </h1>
      <div style={styles.titleUnderline} />

      <p style={{ ...styles.body, ...(isMobile ? styles.bodyMobile : {}) }}>
        Our commitment to sustainability is backed by data. We meticulously track key metrics to ensure transparency and drive meaningful environmental and community impact.
      </p>

      <div style={{ ...styles.dashboardGrid, ...(isMobile ? styles.dashboardGridMobile : {}) }}>
        
        {/* Animated Statistics Cards */}
        <div style={styles.statsRow}>
          {impactStats.map((stat) => (
            <div key={stat.id} className="inner-blur-glass" style={styles.statCard}>
              <div style={styles.statIcon}>{stat.icon}</div>
              <div style={styles.statValue}>{stat.value}</div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Community Impact Data (Chart-like visualization) */}
        <div className="inner-blur-glass" style={styles.chartCard}>
          <div style={styles.cardHeader}>
            <FaHandshake style={styles.cardIcon} />
            <h3 style={styles.cardTitle}>Community Impact Areas</h3>
          </div>
          <div style={styles.chartContainer}>
            {communityImpactData.map((item, i) => (
              <div key={item.id} style={styles.chartBarGroup}>
                <div style={styles.barLabelRow}>
                  <span>{item.area}</span>
                  <span>{item.progress}%</span>
                </div>
                <div style={styles.barTrack}>
                  <div 
                    className={animate ? "animate-bar" : ""}
                    style={{ 
                      ...styles.barFill, 
                      backgroundColor: item.color, 
                      "--target-width": `${item.progress}%` 
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
          <button type="button" style={styles.ctaButton} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.035)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>View Detailed Report</button>
        </div>

        {/* Environmental Metrics (Example: Crops Grown vs. CO2 Reduced) */}
        <div className="inner-blur-glass" style={styles.metricsCard}>
          <div style={styles.cardHeader}>
            <FaTractor style={styles.cardIcon} />
            <h3 style={styles.cardTitle}>Environmental Metrics</h3>
          </div>
          <div style={styles.metricsGrid}>
            <div style={styles.metricItem}>
              <FaLeaf style={styles.metricIcon} />
              <span style={styles.metricValue}>150+ Tons</span>
              <span style={styles.metricLabel}>Crops Grown</span>
            </div>
            <div style={styles.metricItem}>
              <FaCloudMeatball style={styles.metricIcon} />
              <span style={styles.metricValue}>100+ Tons</span>
              <span style={styles.metricLabel}>CO₂ Reduced</span>
            </div>
          </div>
          <button type="button" style={styles.ctaButton} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.035)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>Analyze Trends</button>
        </div>

        {/* People Reached (Visual) */}
        <div className="inner-blur-glass" style={styles.peopleReachedCard}>
          <div style={styles.cardHeader}>
            <FaUsers style={styles.cardIcon} />
            <h3 style={styles.cardTitle}>People Reached</h3>
          </div>
          <div style={styles.peopleCount}>
            <span style={styles.peopleValue}>15,000+</span>
            <span style={styles.peopleLabel}>Individuals Empowered</span>
          </div>
          <p style={styles.peopleDescription}>
            Through workshops, direct support, and community programs, we've empowered thousands to embrace sustainable agriculture.
          </p>
          <button type="button" style={styles.ctaButton} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.035)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>Explore Stories</button>
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
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
    width: "100%",
    maxWidth: "1000px",
    marginTop: "10px",
  },
  dashboardGridMobile: {
    gridTemplateColumns: "1fr",
    gap: "16px",
  },
  statsRow: {
    gridColumn: "1 / -1", // Span full width
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
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
    fontSize: "28px",
    color: "#15803d",
    marginBottom: "8px",
  },
  statValue: {
    fontSize: "32px",
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
  chartCard: {
    padding: "24px",
    borderRadius: "24px",
    textAlign: "left",
    background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
    boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
    display: "flex",
    flexDirection: "column",
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
  chartContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    flexGrow: 1,
  },
  chartBarGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  barLabelRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    fontWeight: 600,
    color: "rgba(0,0,0,0.7)",
  },
  barTrack: {
    width: "100%",
    height: "10px",
    background: "rgba(0,0,0,0.05)",
    borderRadius: "999px",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: "999px",
  },
  metricsCard: {
    padding: "24px",
    borderRadius: "24px",
    textAlign: "left",
    background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
    boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
    display: "flex",
    flexDirection: "column",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginTop: "10px",
    flexGrow: 1,
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
  peopleReachedCard: {
    padding: "24px",
    borderRadius: "24px",
    textAlign: "center",
    background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
    boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  peopleCount: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: "10px 0 15px",
  },
  peopleValue: {
    fontSize: "48px",
    fontWeight: 800,
    color: "#15803d",
    lineHeight: 1,
  },
  peopleLabel: {
    fontSize: "14px",
    fontWeight: 600,
    color: "rgba(0,0,0,0.6)",
    textTransform: "uppercase",
    marginTop: "8px",
  },
  peopleDescription: {
    fontSize: "14px",
    color: "rgba(0,0,0,0.7)",
    lineHeight: 1.5,
    marginBottom: "20px",
    maxWidth: "300px",
  },
  ctaButton: {
    marginTop: "auto", // Pushes button to the bottom
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

export default ImpactTrackingPage;