import React, { useState, useEffect } from "react";

function SustainabilityAppMarket() {
  const [hoveredTableIndex, setHoveredTableIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const tamData = [
    {
      components: "Philippine Consumer Spending",
      description: "Total annual consumer spending on food,wellness, home goods, and agriculture in the Philippines. This reflects the total budget addressable by local organic sustenance.",
      estimatedSize: "₱10+ Trillion PHP (Approx. $170 Billion USD)",
    },
    {
      components: "Internet-Connected Population",
      description: "The total population actively engaging in or interested in urban farming, local sustainability initiatives, and the digital learning space (the \"Plantito/Plantita\"movement).",
      estimatedSize: "85 Million+ (Total internet users in the Philippines)",
    },
  ];

  const samData = [
    {
      components: "Metro Manila & Key Urban Households",
      description: "Households in highly connected, high-density metropolitan areas (Metro Manila, Cebu, Davao) with disposable income for events, specialized learning, and engaging in micro-commerce.",
      estimatedSize: "15 Million (Urban Households/Targeted User Base)",
    },
    {
      components: "Sustainability Active Users",
      description: "Users who currently spend on mobile learning, digital wellness, and e-commerce for home/garden supplies. This defines the current appetite for digital-first sustainability solutions..",
      estimatedSize: "₱5 Billion PHP (Total estimated annual spending on related wellness, education, and eco-friendly apps/services)",
    },
  ];

  const somData = [
    {
      components: "Core Engaged Users",
      description: "Individuals actively utilizing the 24/7 AI guidance (for native crops, florals), attending RSVPed events/workshops, and regularly engaging with the Instructor/Specialist Canvas.",
      estimatedSize: "150,000+ Active Monthly Users (AMU)",
    },
    {
      components: "E-Commerce/Income Generators",
      description: "Individuals who transition from learners to micro-entrepreneurs using the app to sell their locally grown produce or high-demand florals (e.g., Sampaguita, Orchids)..",
      estimatedSize: "3,500+ Active Micro-Vendors",
    },
    {
      components: "Community Impact",
      description: "The total number of people guided toward self-sufficiency in accessible organic sustenance, lessening reliance on imported or market goods.",
      estimatedSize: "500,000+ Organic Meals Supplemented Annually (based on user reporting)",
    },
  ];

  const renderTable = (data, index) => (
    <div
      key={index}
      className="inner-blur-glass"
      style={{
        ...styles.tableWrapper,
        ...(isMobile ? styles.tableWrapperMobile : {}),
        ...(hoveredTableIndex === index ? styles.tableWrapperHov : {}),
      }}
      onMouseEnter={() => setHoveredTableIndex(index)}
      onMouseLeave={() => setHoveredTableIndex(null)}
    >
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={{ ...styles.th, ...(isMobile ? styles.thMobile : {}) }}>Components</th>
            <th style={{ ...styles.th, ...(isMobile ? styles.thMobile : {}) }}>Description</th>
            <th style={{ ...styles.th, ...(isMobile ? styles.thMobile : {}) }}>Estimated Size (Conceptual)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td style={{ ...styles.td, ...(isMobile ? styles.tdMobile : {}) }}>{row.components}</td>
              <td style={{ ...styles.td, ...(isMobile ? styles.tdMobile : {}) }}>{row.description}</td>
              <td style={{ ...styles.td, ...(isMobile ? styles.tdMobile : {}) }}>{row.estimatedSize}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

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

      <div className="inner-blur-glass glass-hover-zoom-sm" style={{ ...styles.badge, ...(isMobile ? styles.badgeMobile : {}) }}>
        <span style={styles.badgeDot} />
        <span>Who We Serve</span>
      </div>

      <h1 style={{ ...styles.title, ...(isMobile ? styles.titleMobile : {}) }}>
        Sustainability App Market Sizing:  <span style={styles.accent}>TAM, SAM, SOM (Philippines Focus)</span>
      </h1>
      <div style={styles.titleUnderline} />

      <div style={{ ...styles.cardRow, ...(isMobile ? styles.cardRowMobile : {}) }} className="hide-scroll">
        <div style={{ ...styles.sectionCard, ...(isMobile ? styles.sectionCardMobile : {}) }}>
          <h2 style={{ ...styles.subtitle, ...(isMobile ? styles.subtitleMobile : {}) }}>1. TAM (Total Available Market) - The Philippine Opportunity</h2>
          <p style={{ ...styles.body, ...(isMobile ? styles.bodyMobile : {}) }}>The entire market within the Philippines that could potentially use the product, driven by the shift towards self-sufficiency.</p>
          {renderTable(tamData, 0)}
        </div>

        <div style={{ ...styles.sectionCard, ...(isMobile ? styles.sectionCardMobile : {}) }}>
          <h2 style={{ ...styles.subtitle, ...(isMobile ? styles.subtitleMobile : {}) }}>2. SAM (Serviceable Available Market) - Our Reach in Major Urban Centers</h2>
          <p style={{ ...styles.body, ...(isMobile ? styles.bodyMobile : {}) }}>The portion of the TAM that our services can realistically reach, constrained by urban density and connectivity.</p>
          {renderTable(samData, 1)}
        </div>

        <div style={{ ...styles.sectionCard, ...(isMobile ? styles.sectionCardMobile : {}) }}>
          <h2 style={{ ...styles.subtitle, ...(isMobile ? styles.subtitleMobile : {}) }}>3. SOM (Serviceable Obtainable Market) - Our Initial Focus (Year 3 Goals)</h2>
          <p style={{ ...styles.body, ...(isMobile ? styles.bodyMobile : {}) }}>The realistic market share we can capture in the first 3 years of operation, focusing on highly engaged early adopters.</p>
          {renderTable(somData, 2)}
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
  wrapMobile: {
    padding: "20px 10px 20px",
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
  badgeMobile: {
    marginBottom: "12px",
    padding: "4px 12px",
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
    fontSize: "clamp(20px, 6vw, 28px)",
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
  subtitle: {
    fontSize: "clamp(18px, 2.2vw, 24px)",
    fontWeight: 600,
    color: "#000",
    margin: "24px 0 16px",
    lineHeight: 1.25,
    letterSpacing: "-0.3px",
  },
  subtitleMobile: {
    fontSize: "16px",
    margin: "0 0 8px",
  },
  body: {
    color: "#000",
    fontSize: "clamp(14px, 1.5vw, 16px)",
    fontWeight: 400,
    lineHeight: 1.72,
    maxWidth: "580px",
    marginBottom: "14px",
  },
  bodyMobile: {
    fontSize: "12.5px",
    lineHeight: "1.5",
    marginBottom: "10px",
  },
  cardRow: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  cardRowMobile: {
    flexDirection: "column",
    flexWrap: "nowrap",
    gap: "25px",
    padding: "10px 0 40px",
    alignItems: "stretch",
  },
  sectionCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    boxSizing: "border-box",
    marginBottom: "40px",
  },
  sectionCardMobile: {
    width: "100%",
    boxSizing: "border-box",
    marginBottom: "30px",
    padding: "0",
  },
  tableWrapper: {
    width: "100%",
    marginTop: "24px",
    background: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: "20px",
    padding: "16px",
    boxSizing: "border-box",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.05)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    overflowX: "auto",
    cursor: "default",
  },
  tableWrapperMobile: {
    padding: "10px",
    marginTop: "14px",
    borderRadius: "15px",
  },
  tableWrapperHov: {
    transform: "scale(1.025)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
    tableLayout: "fixed",
  },
  th: {
    padding: "14px 16px",
    borderBottom: "1px solid rgba(0,0,0,0.1)",
    color: "#15803d",
    fontSize: "14px",
    fontWeight: 700,
    overflowWrap: "break-word",
  },
  thMobile: {
    padding: "10px 8px",
    fontSize: "11px",
  },
  td: {
    padding: "14px 16px",
    borderBottom: "1px solid rgba(0,0,0,0.05)",
    color: "rgba(0,0,0,0.8)",
    fontSize: "14px",
    lineHeight: 1.6,
    overflowWrap: "break-word",
  },
  tdMobile: {
    padding: "10px 8px",
    fontSize: "10.5px",
    lineHeight: "1.4",
    overflowWrap: "break-word",
  },
};

export default SustainabilityAppMarket;
