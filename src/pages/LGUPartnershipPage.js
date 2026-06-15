import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaHandshake, FaChartBar, FaUsers, FaMapMarkerAlt, FaCalendarAlt, FaCheckCircle, FaHourglassHalf, FaLightbulb } from "react-icons/fa";

const partnershipData = [
  {
    id: 1,
    lgu: "Baguio City",
    program: "Urban Green Initiative",
    status: "Active",
    startDate: "2023-01-15",
    impact: "15 community gardens established, 500+ participants",
    icon: <FaMapMarkerAlt style={{ color: "#15803d" }} />,
  },
  {
    id: 2,
    lgu: "Davao City",
    program: "Sustainable Food Hub",
    status: "Active",
    startDate: "2023-03-01",
    impact: "3 food hubs operational, 200+ local farmers supported",
    icon: <FaMapMarkerAlt style={{ color: "#15803d" }} />,
  },
  {
    id: 3,
    lgu: "Quezon City",
    program: "Barangay Agri-Tech Program",
    status: "Planning",
    startDate: "2024-06-01",
    impact: "Awaiting implementation",
    icon: <FaMapMarkerAlt style={{ color: "#15803d" }} />,
  },
  {
    id: 4,
    lgu: "Cebu City",
    program: "Coastal Farm Restoration",
    status: "Completed",
    startDate: "2022-09-10",
    impact: "10 hectares of coastal farms restored, 100+ families benefited",
    icon: <FaMapMarkerAlt style={{ color: "#15803d" }} />,
  },
];

function LGUPartnershipPage({ setActiveNav }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isHoveredBack, setIsHoveredBack] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
          <span style={styles.glassContentLayer}>LGU Partnerships</span>
        </div>
      </div>

      <h1 style={{ ...styles.title, ...(isMobile ? styles.titleMobile : {}) }}>
        LGU Partnerships <span style={styles.titleAccent}>Dashboard</span>
      </h1>
      <div style={styles.titleUnderline} />

      <p style={{ ...styles.body, ...(isMobile ? styles.bodyMobile : {}) }}>
        Explore our collaborative programs with local government units, driving sustainable agricultural development and community empowerment across the Philippines.
      </p>

      <div style={{ ...styles.dashboardGrid, ...(isMobile ? styles.dashboardGridMobile : {}) }}>
        {/* Analytics Cards */}
        <div className="inner-blur-glass" style={styles.analyticsCard}>
          <FaHandshake style={styles.analyticsIcon} />
          <h3 style={styles.analyticsTitle}>Active LGUs</h3>
          <p style={styles.analyticsValue}>42</p>
        </div>
        <div className="inner-blur-glass" style={styles.analyticsCard}>
          <FaChartBar style={styles.analyticsIcon} />
          <h3 style={styles.analyticsTitle}>Programs Launched</h3>
          <p style={styles.analyticsValue}>128</p>
        </div>
        <div className="inner-blur-glass" style={styles.analyticsCard}>
          <FaUsers style={styles.analyticsIcon} />
          <h3 style={styles.analyticsTitle}>Community Reach</h3>
          <p style={styles.analyticsValue}>15,000+</p>
        </div>

        {/* Program List */}
        <div className="inner-blur-glass" style={{ ...styles.panelCard, ...styles.programListCard }}>
          <h3 style={styles.panelTitle}>Collaboration Programs</h3>
          <ul style={styles.programList}>
            {partnershipData.map((item) => (
              <li key={item.id} style={styles.programListItem}>
                <div style={styles.programHeader}>
                  <span style={styles.programIcon}>{item.icon}</span>
                  <span style={styles.programName}>{item.program}</span>
                </div>
                <p style={styles.programLGU}>{item.lgu}</p>
                <div style={styles.programMeta}>
                  <span style={styles.programStatus}>
                    {item.status === "Active" ? <FaCheckCircle style={{ color: "#22c55e" }} /> : <FaHourglassHalf style={{ color: "#fbbf24" }} />} {item.status}
                  </span>
                  <span style={styles.programDate}><FaCalendarAlt /> {item.startDate}</span>
                </div>
                <p style={styles.programImpact}>{item.impact}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Institutional Management Panel */}
        <div className="inner-blur-glass" style={{ ...styles.panelCard, ...styles.managementPanel }}>
          <h3 style={styles.panelTitle}>Institutional Management</h3>
          <div style={styles.managementItem}>
            <FaLightbulb style={styles.managementIcon} />
            <div style={styles.managementDetails}>
              <span style={styles.managementLabel}>Policy Integration</span>
              <p style={styles.managementText}>Facilitating policy alignment for sustainable agriculture.</p>
            </div>
          </div>
          <div style={styles.managementItem}>
            <FaUsers style={styles.managementIcon} />
            <div style={styles.managementDetails}>
              <span style={styles.managementLabel}>Capacity Building</span>
              <p style={styles.managementText}>Training programs for LGU personnel and community leaders.</p>
            </div>
          </div>
          <button type="button" style={styles.ctaButton} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.035)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>View Reports</button>
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
    padding: "18px 16px 18px",
    maxWidth: "1100px",
    margin: "0 auto",
    animation: "fadeInUp 0.75s cubic-bezier(.22,1,.36,1) both",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    overflowY: "auto",
    height: "100%",
    boxSizing: "border-box",
  },
  wrapMobile: {
    padding: "16px 8px 20px",
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
    fontFamily: "inherit",
    letterSpacing: "0.2px",
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
    whiteSpace: "pre-line",
    textShadow: "0 4px 12px rgba(0,0,0,0.1)",
    animation: "titleReveal 0.9s cubic-bezier(.22,1,.36,1) 0.15s both",
  },
  titleMobile: {
    fontSize: "clamp(20px, min(7vw, 3.25dvh), 30px)",
    lineHeight: 1.02,
    maxWidth: "100%",
    overflowWrap: "break-word",
    marginBottom: "clamp(4px, 0.8dvh, 7px)",
  },
  titleUnderline: {
    width: "118px",
    height: "4px",
    background: "linear-gradient(90deg, rgba(22,163,74,0) 0%, #16a34a 30%, #0284c7 50%, #16a34a 70%, rgba(2,132,199,0) 100%)",
    backgroundSize: "200% 100%",
    margin: "0 auto 22px",
    boxShadow: "0 0 12px rgba(22,163,74,0.4)",
    borderRadius: "999px",
    animation: "titleReveal 0.9s cubic-bezier(.22,1,.36,1) 0.15s both, shimmerLine 2.5s linear infinite",
  },
  titleAccent: {
    background: "linear-gradient(90deg, #15803d, #16a34a)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  body: {
    color: "#000",
    marginBottom: "30px",
    fontSize: "clamp(14px, 1.6vw, 17px)",
    fontWeight: 400,
    lineHeight: 1.72,
    maxWidth: "640px",
    textShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  bodyMobile: {
    fontSize: "clamp(10px, min(3.3vw, 1.55dvh), 13px)",
    lineHeight: 1.34,
    marginBottom: "clamp(8px, 1.2dvh, 12px)",
    width: "100%",
    maxWidth: "min(320px, 100%)",
    padding: "0 4px",
    overflowWrap: "break-word",
  },
  dashboardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
    width: "100%",
    maxWidth: "1000px",
    marginTop: "20px",
  },
  dashboardGridMobile: {
    gridTemplateColumns: "1fr",
    gap: "16px",
  },
  analyticsCard: {
    background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: "20px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.05)",
    backdropFilter: "blur(20px) saturate(165%)",
    WebkitBackdropFilter: "blur(20px) saturate(165%)",
    transition: "transform 0.2s ease",
  },
  analyticsCardHov: {
    transform: "scale(1.03)",
  },
  analyticsIcon: {
    fontSize: "36px",
    color: "#15803d",
    marginBottom: "10px",
  },
  analyticsTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#000",
    margin: "0 0 5px",
  },
  analyticsValue: {
    fontSize: "28px",
    fontWeight: 800,
    color: "#16a34a",
    margin: 0,
  },
  panelCard: {
    background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.05)",
    backdropFilter: "blur(20px) saturate(165%)",
    WebkitBackdropFilter: "blur(20px) saturate(165%)",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  panelTitle: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#000",
    marginBottom: "10px",
  },
  programListCard: {
    gridColumn: "1 / -1", // Span full width
  },
  programList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "15px",
  },
  programListItem: {
    background: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(0,0,0,0.03)",
    borderRadius: "15px",
    padding: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
  },
  programHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  programIcon: {
    fontSize: "20px",
    color: "#15803d",
  },
  programName: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#000",
  },
  programLGU: {
    fontSize: "13px",
    color: "rgba(0,0,0,0.7)",
    margin: 0,
  },
  programMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "12px",
    color: "rgba(0,0,0,0.6)",
    marginTop: "5px",
  },
  programStatus: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontWeight: 600,
  },
  programDate: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  programImpact: {
    fontSize: "13px",
    color: "rgba(0,0,0,0.8)",
    margin: "10px 0 0",
    lineHeight: 1.5,
  },
  managementPanel: {
    gridColumn: "1 / -1", // Span full width
  },
  managementItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "15px",
    padding: "15px 0",
    borderBottom: "1px solid rgba(0,0,0,0.05)",
  },
  managementIcon: {
    fontSize: "24px",
    color: "#16a34a",
    flexShrink: 0,
  },
  managementDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  managementLabel: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#000",
  },
  managementText: {
    fontSize: "13px",
    color: "rgba(0,0,0,0.7)",
    margin: 0,
    lineHeight: 1.5,
  },
  ctaButton: {
    padding: "12px 20px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))",
    border: "1px solid rgba(255,255,255,0.35)",
    color: "#062018",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "default",
    boxShadow: "0 18px 38px rgba(34,197,94,0.26), inset 0 1px 0 rgba(255,255,255,0.48)",
    marginTop: "20px",
    alignSelf: "center",
    width: "fit-content",
    transition: "transform 0.2s ease",
  },
};

export default LGUPartnershipPage;
