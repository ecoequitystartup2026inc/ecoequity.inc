import React, { useState, useEffect } from "react";
import { FaRobot, FaCalendarAlt, FaExchangeAlt, FaUserTie, FaArrowLeft } from "react-icons/fa";

const servicesData = [
  {
    category: "AI Support",
    name: "AI Plant Doctor",
    image: "/ai_doctor.png", // Placeholder image
    price: "See Plans",
    description: "24/7 localized care guides tailored to Philippine climate and native crops. Predictive diagnostics for your garden.",
    stock: "Available 24/7",
    sustainabilityBadge: "Digital Service",
  },
  {
    category: "Community",
    name: "Event Management",
    image: "/event.png", // Placeholder image
    price: "Free Access",
    description: "Real-world event management. RSVP to specialist workshops, community trainings, and local venue gatherings.",
    stock: "Limited Slots",
    sustainabilityBadge: "Community",
  },
  {
    category: "B2B Solutions",
    name: "Surplus Listing Module",
    image: "/surplus.png", // Placeholder image
    price: "Enterprise",
    description: "Dedicated system for commercial farmers to list large-volume oversupply (surplus) to institutional buyers.",
    stock: "Active Network",
    sustainabilityBadge: "Waste Reduction",
  },
  {
    category: "Education",
    name: "Specialist Workshops",
    image: "/workshop.png", // Placeholder image
    price: "Varies",
    description: "Hands-on, localized training sessions led by top agriculture specialists in your region.",
    stock: "Ongoing",
    sustainabilityBadge: "Skill Building",
  },
];

function ServicesPage({ setActiveNav, showAIChat, setShowAIChat }) {
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
                onClick={() => setActiveNav && setActiveNav("Product & Services")}
                onMouseEnter={() => setIsHoveredBack(true)}
                onMouseLeave={() => setIsHoveredBack(false)}
              > 
                <FaArrowLeft />
              </button>
            </div>
            <div className="inner-blur-glass glass-hover-zoom-sm" style={{ ...styles.badge, ...(isMobile ? styles.badgeMobile : {}) }}>
              <span style={styles.badgeDot} />
              <span style={styles.glassContentLayer}>Our Services</span>
            </div>
          </div>
          <h1 style={{ ...styles.title, fontSize: "clamp(20px, 2.8vw, 32px)", textAlign: "left", ...(isMobile ? styles.titleMobile : {}), marginTop: "20px" }}>
            Explore Our <span style={styles.titleAccent}>Core Services</span>
          </h1>
          <div style={{ ...styles.titleUnderline, marginLeft: 0, marginBottom: "16px", ...(isMobile ? { ...styles.titleUnderlineMobile, marginLeft: 0 } : {}) }}></div>
          <p style={{ ...styles.body, fontSize: "clamp(12px, 1.4vw, 15px)", marginBottom: "16px", textAlign: "left", ...(isMobile ? styles.bodyMobile : {}) }}>
            From 24/7 AI-powered diagnostics to real-world community events and B2B surplus management, we offer comprehensive services to elevate your farming.
          </p>
          {!isMobile && (
            <button
              type="button"
              style={{
                ...styles.primaryBtn,
                ...(hoveredItem === "exploreServicesBtn" ? styles.primaryBtnHov : {}),
                marginTop: "10px",
              }}
onClick={() => setShowAIChat && setShowAIChat(true)}
              onMouseEnter={() => setHoveredItem("exploreServicesBtn")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <span aria-hidden="true" style={styles.primaryInnerBlur} />
              <span style={styles.glassContentLayer}>Explore All Services</span>
            </button>
          )}
            {/* Horizontal small glass container for categories */}
            <div className="inner-blur-glass hide-scroll" style={{ ...styles.emptyGlassContainer, ...(isMobile ? styles.emptyGlassContainerMobile : {}) }}>
              {[
                { icon: <FaRobot fill="url(#iconGradient)" />, label: "AI Plant Doctor", navTarget: "AIChat" },
                { icon: <FaCalendarAlt fill="url(#iconGradient)" />, label: "Events and workshop", navTarget: "EventsAndWorkshops" },
                { icon: <FaExchangeAlt fill="url(#iconGradient)" />, label: "Surplus Exchange", navTarget: "SurplusExchangePage" },
                { icon: <FaUserTie fill="url(#iconGradient)" />, label: "Expert Support", navTarget: "ExpertSupportPage" },
              ].map((cat, i, arr) => (
                <React.Fragment key={cat.label}>
                  <button
                    type="button"
                    style={{
                      ...styles.categoryItemBtn,
                      ...(hoveredItem === `category-${i}` ? styles.categoryItemBtnHov : {}), // Apply hover styles
                    }}
onClick={() => {
                      if (cat.navTarget === "AIChat") {
                        setShowAIChat && setShowAIChat(true);
                      } else {
                        setActiveNav && setActiveNav(cat.navTarget);
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
          <div style={{ ...styles.serviceGrid, ...(isMobile ? styles.serviceGridMobile : {}) }}>
            {servicesData.map((service, index) => (
              <div
                key={service.name}
                className="inner-blur-glass"
                style={{
                  ...styles.productCard,
                  ...(isMobile ? styles.productCardMobile : {}),
                  ...(hoveredItem === `service-${index}` ? styles.productCardHov : {}),
                }}
                onMouseEnter={() => setHoveredItem(`service-${index}`)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <span aria-hidden="true" style={styles.productCardInnerBlur} />
                <div style={styles.productImageContainer}>
                  <span style={{ fontSize: "48px", color: "#15803d", display: "flex" }}>
                    {service.name === "AI Plant Doctor" ? <FaRobot /> : service.name === "Event Management" ? <FaCalendarAlt /> : service.name === "Surplus Listing Module" ? <FaExchangeAlt /> : <FaUserTie />}
                  </span>
                  <span style={styles.sustainabilityBadge}>{service.sustainabilityBadge}</span>
                </div>
                <div style={{ ...styles.serviceDetails, ...(isMobile ? styles.serviceDetailsMobile : {}) }}>
                  <h3 style={styles.productName}>{service.name}</h3>
                  <p style={{ ...styles.productDescription, ...(isMobile ? styles.productDescriptionMobile : {}) }}>{service.description}</p>
                  <div style={styles.productMeta}>
                    <span style={styles.productPrice}>{service.price}</span>
                    <span style={styles.productStock}>{service.stock}</span>
                  </div>
                  <div style={{ ...styles.serviceActions, ...(isMobile ? styles.serviceActionsMobile : {}) }}>
                    {service.name === "AI Plant Doctor" && (
                      <button 
                        type="button" 
                        style={styles.servicePrimaryBtn} 
onClick={() => setShowAIChat && setShowAIChat(true)}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.035)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >Try Now</button>
                    )}
                    {service.name === "Event Management" && (
                      <button
                        type="button"
                        style={styles.servicePrimaryBtn}
                        onClick={() => setActiveNav("EventsAndWorkshops")}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.035)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >View Event</button>
                    )}
                    {service.name === "Surplus Listing Module" && (
                      <button
                        type="button"
                        style={styles.servicePrimaryBtn}
                        onClick={() => setActiveNav("SurplusExchangePage")}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.035)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >Go to Exchange</button>
                    )}
                    {service.name === "Specialist Workshops" && (
                      <button
                        type="button"
                        style={styles.servicePrimaryBtn}
                          onClick={() => setActiveNav("ExpertSupportPage")}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.035)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >View Workshops</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Scroll Indicator Dots - Mobile Only */}
          {isMobile && (
            <div style={styles.indicatorRow}>
              {servicesData.map((_, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.dot,
                    ...(hoveredItem === `service-${i}` ? styles.dotActive : {}), 
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
    overflow: "hidden", // Prevent scrolling for the entire page
    height: "100%", // Force to fit parent container
    boxSizing: "border-box",
  },
  wrapMobile: {
    padding: "16px 8px 20px",
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
  glassContentLayer: { 
    position: "relative",
    zIndex: 1,
  },
  contentContainer: {
    display: "flex",
    gap: "40px",
    width: "100%",
    maxWidth: "1200px", 
    marginTop: "0px", // Adjusted to align with previous change
    alignItems: "stretch", // Changed to stretch to allow rightColumn to fill height
    overflow: "hidden", // Prevents horizontal overflow from children
    flex: 1, // Allow contentContainer to grow
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
    height: "100%", // Added to ensure scrollable area has a defined height
    overflowY: "auto", // Added vertical scrolling for the right column
    alignItems: "center",
    textAlign: "center",
    paddingBottom: "24px", // Add padding so the last item isn't cut off tightly
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
  serviceGrid: { // Renamed from productGrid for clarity
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "24px",
    width: "100%", 
    marginTop: "50px", 
  },
  serviceGridMobile: { // Renamed from productGridMobile for clarity
    gap: "16px",
  },
  productCard: {
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
    WebkitBackdropFilter: "blur(20px) saturate(165%)", // Corrected WebkitBackFilter typo to WebkitBackdropFilter
    transition: "transform 0.22s cubic-bezier(.34,1.56,.64,1)",
    width: "100%", 
    maxWidth: "540px",
    boxSizing: "border-box",
  },
  productCardMobile: {
    flexDirection: "column",
    textAlign: "center",
    padding: "20px",
    gap: "16px",
  },
  productCardInnerBlur: {
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
  productCardHov: {
    transform: "scale(1.03)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 12px 32px rgba(0,0,0,0.1)",
  },
  productImageContainer: {
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
  serviceDetails: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    flex: 1,
  },
  serviceDetailsMobile: {
    alignItems: "center",
  },
  productName: { fontSize: "18px", fontWeight: 800, color: "#000", margin: "0 0 4px" },
  productDescription: { fontSize: "13px", color: "rgba(0,0,0,0.7)", margin: "0 0 10px", lineHeight: "1.5" },
  productDescriptionMobile: { fontSize: "13px" },
  productMeta: { display: "flex", justifyContent: "space-between", width: "100%", marginBottom: "12px", padding: "6px 10px", background: "rgba(0,0,0,0.03)", borderRadius: "10px" },
  productPrice: { fontSize: "14px", fontWeight: 700, color: "#15803d" },
  productStock: { fontSize: "12px", fontWeight: 600, color: "rgba(0,0,0,0.6)" },
  serviceActions: { display: "flex", gap: "10px", width: "100%" },
  serviceActionsMobile: { justifyContent: "center" },
  serviceActionBtn: { flex: 1, padding: "10px 16px", borderRadius: "999px", background: "rgba(21, 128, 61, 0.1)", color: "#15803d", border: "1px solid rgba(21, 128, 61, 0.2)", fontSize: "13px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s ease" },
  servicePrimaryBtn: { flex: 1, padding: "10px 16px", borderRadius: "999px", background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))", border: "1px solid rgba(255,255,255,0.35)", color: "#062018", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "0 18px 38px rgba(34,197,94,0.26), inset 0 1px 0 rgba(255,255,255,0.48)", transition: "transform 0.2s ease" },
  primaryBtn: { position: "relative", overflow: "hidden", isolation: "isolate", padding: "13px 30px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.35)", background: "linear-gradient(135deg, rgba(134,239,172,0.95), rgba(125,211,252,0.95))", color: "#062018", fontSize: "14px", fontWeight: 700, cursor: "pointer", transform: "scale(1)", transformOrigin: "center", willChange: "transform", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", fontFamily: "inherit", letterSpacing: "0.2px", boxShadow: "0 18px 38px rgba(34,197,94,0.26), inset 0 1px 0 rgba(255,255,255,0.48)", transition: "transform 0.16s ease", backdropFilter: "blur(18px) saturate(165%)", WebkitBackdropFilter: "blur(18px) saturate(165%)" },
  primaryInnerBlur: { position: "absolute", inset: "0", zIndex: 0, pointerEvents: "none", borderRadius: "inherit", background: "radial-gradient(circle at 28% 18%, rgba(255,255,255,0.35), transparent 42%), linear-gradient(135deg, rgba(134,239,172,0.36), rgba(125,211,252,0.32))", backdropFilter: "blur(34px) saturate(185%)", WebkitBackdropFilter: "blur(34px) saturate(185%)" },
  primaryBtnHov: { transform: "scale(1.035)" },
  emptyGlassContainer: { width: "fit-content", maxWidth: "100%", height: "auto", minHeight: "64px", borderRadius: "14px", background: "rgba(255,255,255,0.3)", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.05)", backdropFilter: "blur(10px) saturate(150%)", WebkitBackdropFilter: "blur(10px) saturate(150%)", marginTop: "60px", display: "flex", alignItems: "center", justifyContent: "flex-start", flexWrap: "nowrap", overflowX: "auto", padding: "16px 20px", gap: "16px" },
  emptyGlassContainerMobile: { marginTop: "20px" },
  categoryItemBtn: { display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flexShrink: 0, width: "90px", background: "transparent", border: "none", padding: "8px 0", borderRadius: "10px", cursor: "pointer", transition: "background 0.2s ease, transform 0.1s ease", fontFamily: "inherit", color: "inherit", boxSizing: "border-box" },
  categoryIcon: { fontSize: "22px" },
  categoryLabel: { fontSize: "13px", fontWeight: 600, color: "rgba(0,0,0,0.75)", textAlign: "center", lineHeight: 1.25 },
  categoryItemBtnHov: { background: "rgba(0,0,0,0.05)", transform: "scale(1.02)" },
  categoryDivider: { width: "1px", height: "32px", background: "rgba(0,0,0,0.15)", flexShrink: 0 },
  indicatorRow: { display: "flex", justifyContent: "center", gap: "8px", marginTop: "16px" },
  dot: { width: "6px", height: "6px", borderRadius: "50%", background: "rgba(0,0,0,0.2)", transition: "all 0.3s ease" },
  dotActive: { background: "#15803d", transform: "scale(1.2)" },
};

export default ServicesPage;