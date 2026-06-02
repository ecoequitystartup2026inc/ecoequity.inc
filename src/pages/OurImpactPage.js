import React, { useState, useEffect } from "react";
import { FaLeaf, FaSeedling, FaRecycle, FaLightbulb, FaArrowLeft, FaUserTie, FaRobot, FaHandshake, FaMoneyBillWave, FaChartLine } from "react-icons/fa";

const ourImpactData = [
  {
    category: "LGU Partnerships",
    name: "LGU Partnerships Dashboard",
    icon: <FaHandshake style={{ color: "#15803d" }} />,
    price: "42 Active LGUs",
    description: "Collaborating with local government units to implement sustainable agricultural programs and community initiatives.",
    stock: "Expanding Network",
    sustainabilityBadge: "Community Impact",
    navTarget: "LGUPartnershipPage",
  },
  {
    category: "Income Generation",
    name: "Income Generation Impact",
    icon: <FaMoneyBillWave style={{ color: "#15803d" }} />,
    price: "₱63M+ Annual GMV",
    description: "Empowering micro-vendors and farmers through direct market access and sustainable income streams.",
    stock: "Continuous Growth",
    sustainabilityBadge: "Economic Empowerment",
    navTarget: "IncomeGenerationPage",
  },
  {
    category: "Native Seed Bank Program",
    name: "Native Seed Bank Management",
    icon: <FaSeedling style={{ color: "#15803d" }} />,
    price: "250+ Varieties",
    description: "Preserving indigenous crop varieties and promoting biodiversity through community-managed seed banks.",
    stock: "Growing Collection",
    sustainabilityBadge: "Biodiversity",
    navTarget: "NativeSeedBankPage",
  },
  {
    category: "Impact Tracking",
    name: "Environmental Impact Tracking",
    icon: <FaChartLine style={{ color: "#15803d" }} />,
    price: "100+ Tons CO2 Reduced",
    description: "Monitoring and reporting key environmental metrics to ensure transparency and drive sustainable practices.",
    stock: "Real-time Data",
    sustainabilityBadge: "Climate Action",
    navTarget: "ImpactTrackingPage",
  },
];

const impactCategories = [
  { icon: <FaHandshake fill="url(#iconGradient)" />, label: "LGU Partnerships", navTarget: "LGUPartnershipPage" },
  { icon: <FaMoneyBillWave fill="url(#iconGradient)" />, label: "Income Generation", navTarget: "IncomeGenerationPage" },
  { icon: <FaSeedling fill="url(#iconGradient)" />, label: "Native Seed Bank Program", navTarget: "NativeSeedBankPage" },
  { icon: <FaChartLine fill="url(#iconGradient)" />, label: "Impact Tracking", navTarget: "ImpactTrackingPage" },
];

function OurImpactPage({ setActiveNav }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [hoveredItem, setHoveredItem] = useState(null); 
  const [isHoveredBack, setIsHoveredBack] = useState(false);

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

      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(134,239,172,0.95)" />
            <stop offset="100%" stopColor="rgba(125,211,252,0.95)" />
          </linearGradient>
        </defs>
      </svg>

      <div style={{ ...styles.contentContainer, ...(isMobile ? styles.contentContainerMobile : {}) }}>
        <div style={{ ...styles.leftColumn, ...(isMobile ? styles.leftColumnMobile : {}) }}>
          <div style={styles.headerRow}>
            <div style={styles.backBtnWrap}>
              <button
                type="button"
                className="inner-blur-glass"
                style={{
                  ...styles.backBtn,
                  ...(isHoveredBack ? styles.backBtnHov : {}),
                }}
                onClick={() => setActiveNav && setActiveNav(isMobile ? "Home" : "Product & Services")}
                onMouseEnter={() => setIsHoveredBack(true)}
                onMouseLeave={() => setIsHoveredBack(false)}
              > 
                <FaArrowLeft />
              </button>
            </div>
            <div className="inner-blur-glass glass-hover-zoom-sm" style={{ ...styles.badge, ...(isMobile ? styles.badgeMobile : {}) }}>
              <span style={styles.badgeDot} />
              <span style={styles.glassContentLayer}>Our Impact</span>
            </div>
          </div>
          <h1 style={{ ...styles.title, fontSize: "clamp(20px, 2.8vw, 32px)", textAlign: "left", ...(isMobile ? styles.titleMobile : {}), marginTop: "20px" }}>
            Driving Sustainable <span style={styles.titleAccent}>Change</span>
          </h1>
          <div style={{ ...styles.titleUnderline, marginLeft: 0, marginBottom: "16px", ...(isMobile ? { ...styles.titleUnderlineMobile, marginLeft: 0 } : {}) }}></div>
          <p style={{ ...styles.body, fontSize: "clamp(12px, 1.4vw, 15px)", marginBottom: "16px", textAlign: "left", ...(isMobile ? styles.bodyMobile : {}) }}>
            EcoEquity is committed to creating tangible positive change, from empowering local communities to fostering food security and environmental stewardship.
          </p>
          <button
            type="button"
            style={{
              ...styles.primaryBtn,
              ...(hoveredItem === "exploreImpactBtn" ? styles.primaryBtnHov : {}),
              marginTop: "10px",
            }}
            onClick={() => setActiveNav && setActiveNav("Learn More")}
            onMouseEnter={() => setHoveredItem("exploreImpactBtn")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <span aria-hidden="true" style={styles.primaryInnerBlur} />
            <span style={styles.glassContentLayer}>Explore More Impact</span>
          </button>
          {/* Horizontal small glass container for categories */}
          <div className="inner-blur-glass hide-scroll" style={{ ...styles.emptyGlassContainer, ...(isMobile ? styles.emptyGlassContainerMobile : {}) }}>
            {impactCategories.map((cat, i, arr) => (
              <React.Fragment key={cat.label}>
                <button
                  type="button"
                  style={{
                    ...styles.categoryItemBtn,
                    ...(hoveredItem === `category-${i}` ? styles.categoryItemBtnHov : {}),
                  }}
                  onClick={() => {
                    if (cat.navTarget) {
                      setActiveNav(cat.navTarget);
                    }
                  }}
                  onMouseEnter={() => setHoveredItem(`category-${i}`)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <span style={styles.categoryIcon}>{cat.icon}</span>
                  <span style={styles.categoryLabel}>{cat.label}</span>
                </button>
                {i < arr.length - 1 && <div style={styles.categoryDivider} />}
              </React.Fragment>
            ))}
          </div>

        </div>

        <div className="hide-scroll" style={{ ...styles.rightColumn, ...(isMobile ? styles.rightColumnMobile : {}), paddingTop: 0 }}>
          <div style={{ ...styles.impactGrid, ...(isMobile ? styles.impactGridMobile : {}) }}>
            {ourImpactData.map((impact, index) => (
              <div
                key={impact.name}
                className="inner-blur-glass"
                style={{
                  ...styles.impactCard,
                  ...(isMobile ? styles.impactCardMobile : {}),
                  ...(hoveredItem === `impact-${index}` ? styles.impactCardHov : {}),
                }}
                onMouseEnter={() => setHoveredItem(`impact-${index}`)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <span aria-hidden="true" style={styles.impactCardInnerBlur} />
                <div style={styles.impactImageContainer}>
                  <span style={{ fontSize: "48px", color: "#15803d", display: "flex" }}>
                    {impact.icon}
                  </span>
                  <span style={styles.sustainabilityBadge}>{impact.sustainabilityBadge}</span>
                </div>
                <div style={{ ...styles.impactDetails, ...(isMobile ? styles.impactDetailsMobile : {}) }}>
                  <h3 style={styles.impactName}>{impact.name}</h3>
                  <p style={{ ...styles.impactDescription, ...(isMobile ? styles.impactDescriptionMobile : {}) }}>{impact.description}</p>
                  <div style={styles.impactMeta}>
                    <span style={styles.impactPrice}>{impact.price}</span>
                    <span style={styles.impactStock}>{impact.stock}</span>
                  </div>
                  <div style={{ ...styles.impactActions, ...(isMobile ? styles.impactActionsMobile : {}) }}>
                    <button 
                      type="button" 
                      style={{ ...styles.impactPrimaryBtn, cursor: "pointer" }} 
                      onClick={() => setActiveNav(impact.navTarget || "OurImpactPage")}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.035)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      View Impact
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Scroll Indicator Dots - Mobile Only */}
          {isMobile && (
            <div style={styles.indicatorRow}>
              {ourImpactData.map((_, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.dot,
                    ...(hoveredItem === `impact-${i}` ? styles.dotActive : {}), 
                  }}
                />
              ))}
            </div>
          )}
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
    overflow: "hidden", 
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
  contentContainer: {
    display: "flex",
    gap: "40px",
    width: "100%",
    maxWidth: "1200px", 
    marginTop: "0px", 
    alignItems: "stretch", 
    overflow: "hidden", 
    flex: 1, 
  },
  contentContainerMobile: {
    flexDirection: "column",
    gap: "20px",
    marginTop: "10px",
  },
  leftColumn: {
    flex: "0 0 400px", 
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    textAlign: "left",
    paddingTop: "50px", 
    paddingRight: "20px",
    borderRight: "1px solid rgba(0,0,0,0.05)",
  },
  leftColumnMobile: {
    flex: "none",
    width: "100%",
    padding: 0,
    borderRight: "none",
  },
  rightColumn: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    height: "100%", 
    overflowY: "auto", 
    alignItems: "center",
    textAlign: "center",
    paddingBottom: "24px", 
  },
  rightColumnMobile: {
    width: "100%",
    padding: "0 10px",
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
  titleUnderlineMobile: {
    width: "clamp(70px, 22vw, 94px)",
    height: "3px",
    margin: "0 auto clamp(7px, 1.2dvh, 11px)",
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
  impactGrid: { 
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "24px",
    width: "100%", 
    marginTop: "50px", 
  },
  impactGridMobile: { 
    gap: "16px",
  },
  impactCard: {
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: "20px",
    padding: "16px 20px",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    textAlign: "left",
    gap: "20px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.05)",
    backdropFilter: "blur(20px) saturate(165%)",
    WebkitBackdropFilter: "blur(20px) saturate(165%)", 
    transition: "transform 0.22s cubic-bezier(.34,1.56,.64,1)",
    width: "100%", 
    maxWidth: "540px",
    boxSizing: "border-box",
  },
  impactCardMobile: {
    flexDirection: "column",
    textAlign: "center",
    padding: "20px",
    gap: "16px",
  },
  impactCardInnerBlur: {
    position: "absolute",
    inset: "0",
    zIndex: 0,
    pointerEvents: "none",
    borderRadius: "inherit",
    background: "radial-gradient(circle at 30% 18%, rgba(255,255,255,0.6), transparent 42%), linear-gradient(155deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))",
    backdropFilter: "blur(34px) saturate(180%)",
    WebkitBackdropFilter: "blur(34px) saturate(180%)",
    filter: "blur(0.2px)",
  },
  impactCardHov: {
    transform: "scale(1.03)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 12px 32px rgba(0,0,0,0.1)",
  },
  impactImageContainer: {
    position: "relative",
    width: "120px",
    height: "120px",
    flexShrink: 0,
    borderRadius: "20px",
    overflow: "hidden",
    background: "linear-gradient(135deg, rgba(22,163,74,0.1), rgba(22,163,74,0.05))",
    border: "4px solid rgba(255,255,255,0.9)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  sustainabilityBadge: {
    position: "absolute",
    bottom: "10px",
    background: "#15803d",
    color: "#fff",
    padding: "4px 8px",
    borderRadius: "999px",
    fontSize: "10px",
    fontWeight: 600,
    zIndex: 1,
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  },
  impactDetails: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    flex: 1,
  },
  impactDetailsMobile: {
    alignItems: "center",
  },
  impactName: { fontSize: "18px", fontWeight: 800, color: "#000", margin: "0 0 4px" },
  impactDescription: { fontSize: "13px", color: "rgba(0,0,0,0.7)", margin: "0 0 10px", lineHeight: "1.5" },
  impactDescriptionMobile: { fontSize: "13px" },
  impactMeta: { display: "flex", justifyContent: "space-between", width: "100%", marginBottom: "12px", padding: "6px 10px", background: "rgba(0,0,0,0.03)", borderRadius: "10px" },
  impactPrice: { fontSize: "14px", fontWeight: 700, color: "#15803d" },
  impactStock: { fontSize: "12px", fontWeight: 600, color: "rgba(0,0,0,0.6)" },
  impactActions: { display: "flex", gap: "10px", width: "100%" },
  impactActionsMobile: { justifyContent: "center" },
  impactPrimaryBtn: { flex: 1, padding: "10px 16px", borderRadius: "999px", background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))", border: "1px solid rgba(255,255,255,0.35)", color: "#062018", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "0 18px 38px rgba(34,197,94,0.26), inset 0 1px 0 rgba(255,255,255,0.48)", transition: "transform 0.2s ease" },
  indicatorRow: { display: "flex", justifyContent: "center", gap: "8px", marginTop: "16px" },
  dot: { width: "6px", height: "6px", borderRadius: "50%", background: "rgba(0,0,0,0.2)", transition: "all 0.3s ease" },
  dotActive: { background: "#15803d", transform: "scale(1.2)" },
};

styles.primaryBtn = {
  position: "relative",
  overflow: "hidden",
  isolation: "isolate",
  padding: "13px 30px",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.35)",
  background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))",
  color: "#062018",
  fontSize: "14px",
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
};

styles.primaryInnerBlur = {
  position: "absolute",
  inset: "0",
  zIndex: 0,
  pointerEvents: "none",
  borderRadius: "inherit",
  background:
    "radial-gradient(circle at 28% 18%, rgba(255,255,255,0.35), transparent 42%), " +
    "linear-gradient(135deg, rgba(134,239,172,0.36), rgba(125,211,252,0.32))",
  backdropFilter: "blur(34px) saturate(185%)",
  WebkitBackdropFilter: "blur(34px) saturate(185%)",
};

styles.primaryBtnHov = {
  transform: "scale(1.035)",
};

styles.emptyGlassContainer = {
  width: "fit-content",
  maxWidth: "100%",
  height: "auto",
  minHeight: "64px",
  borderRadius: "14px",
  background: "rgba(255,255,255,0.3)",
  border: "1px solid rgba(0,0,0,0.05)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.05)",
  backdropFilter: "blur(10px) saturate(150%)",
  WebkitBackdropFilter: "blur(10px) saturate(150%)",
  marginTop: "60px", // Spacing from the button above
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  flexWrap: "nowrap", // Forces items into a single horizontal line
  overflowX: "auto", // Allows scrolling if items overflow
  padding: "16px 20px",
  gap: "16px",
};

styles.emptyGlassContainerMobile = {
  marginTop: "20px",
};

styles.categoryItemBtn = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "6px",
  flexShrink: 0,
  width: "90px",
  background: "transparent",
  border: "none",
  padding: "8px 0",
  borderRadius: "10px",
  cursor: "pointer",
  transition: "background 0.2s ease, transform 0.1s ease",
  fontFamily: "inherit",
  color: "inherit",
  boxSizing: "border-box",
};

styles.categoryIcon = {
  fontSize: "22px",
};

styles.categoryLabel = {
  fontSize: "13px",
  fontWeight: 600,
  color: "rgba(0,0,0,0.75)",
  textAlign: "center", // Centers the wrapped text
  lineHeight: 1.25, // Adds a slight gap between wrapped lines
};

styles.categoryItemBtnHov = {
  background: "rgba(0,0,0,0.05)",
  transform: "scale(1.02)",
};

styles.categoryDivider = {
  width: "1px",
  height: "32px",
  background: "rgba(0,0,0,0.15)",
  flexShrink: 0,
};

export default OurImpactPage;
