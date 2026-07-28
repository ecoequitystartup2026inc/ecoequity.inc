import React, { useState, useEffect } from "react";

const iconProps = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "#15803d",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

// Globe — TAM
const GlobeIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3c2.5 2.4 3.9 5.6 4 9-.1 3.4-1.5 6.6-4 9-2.5-2.4-3.9-5.6-4-9 .1-3.4 1.5-6.6 4-9Z" />
  </svg>
);

// Buildings — SAM
const CityIcon = () => (
  <svg {...iconProps}>
    <path d="M3 21h18" />
    <rect x="4" y="9" width="7" height="12" rx="1" />
    <rect x="13" y="4" width="7" height="17" rx="1" />
    <path d="M6.5 12v0M8.5 12v0M6.5 15v0M8.5 15v0M15.5 7v0M17.5 7v0M15.5 11v0M17.5 11v0M15.5 15v0M17.5 15v0" />
  </svg>
);

// Target — SOM
const TargetIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.4" />
  </svg>
);

const tiers = [
  {
    id: "TAM",
    Icon: GlobeIcon,
    fullName: "Total Available Market",
    tagline: "The Philippine Opportunity",
    headline: "₱10T+",
    headlineLabel: "Addressable consumer spending",
    width: "100%",
    description:
      "The entire market within the Philippines that could potentially use the product, driven by the shift towards self-sufficiency.",
    items: [
      {
        component: "Philippine Consumer Spending",
        size: "₱10T+ PHP (~$170B USD)",
        description:
          "Total annual consumer spending on food, wellness, home goods, and agriculture — the total budget addressable by local organic sustenance.",
      },
      {
        component: "Internet-Connected Population",
        size: "85M+ users",
        description:
          "The population engaging in urban farming, local sustainability, and digital learning — the \"Plantito/Plantita\" movement.",
      },
    ],
  },
  {
    id: "SAM",
    Icon: CityIcon,
    fullName: "Serviceable Available Market",
    tagline: "Reach in Major Urban Centers",
    headline: "₱5B",
    headlineLabel: "Annual sustainability-app spend",
    width: "74%",
    description:
      "The portion of the TAM our services can realistically reach, constrained by urban density and connectivity.",
    items: [
      {
        component: "Metro Manila & Key Urban Households",
        size: "15M households",
        description:
          "High-density metros (Manila, Cebu, Davao) with disposable income for events, specialized learning, and micro-commerce.",
      },
      {
        component: "Sustainability Active Users",
        size: "₱5B PHP / year",
        description:
          "Users already spending on mobile learning, digital wellness, and home/garden e-commerce — the appetite for digital-first sustainability.",
      },
    ],
  },
  {
    id: "SOM",
    Icon: TargetIcon,
    fullName: "Serviceable Obtainable Market",
    tagline: "Our Initial Focus — Year 3 Goals",
    headline: "150K+",
    headlineLabel: "Active monthly users",
    width: "48%",
    description:
      "The realistic share we can capture in the first 3 years, focusing on highly engaged early adopters.",
    items: [
      {
        component: "Core Engaged Users",
        size: "150K+ AMU",
        description:
          "Individuals using 24/7 AI guidance, attending RSVP'd events/workshops, and engaging with the Instructor/Specialist Canvas.",
      },
      {
        component: "E-Commerce / Income Generators",
        size: "3,500+ Vendors",
        description:
          "Learners who become micro-entrepreneurs, selling locally grown produce or high-demand florals (Sampaguita, Orchids).",
      },
      {
        component: "Community Impact",
        size: "500K+ meals / yr",
        description:
          "People guided toward self-sufficiency in accessible organic sustenance, lessening reliance on imported or market goods.",
      },
    ],
  },
];

function SustainabilityAppMarket() {
  const [hoveredTier, setHoveredTier] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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
          .sam-card { transition: transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s cubic-bezier(.22,1,.36,1); }
          .sam-funbar { transition: transform .3s cubic-bezier(.22,1,.36,1), box-shadow .3s cubic-bezier(.22,1,.36,1); }
        `}
      </style>

      <div className="inner-blur-glass glass-hover-zoom-sm" style={{ ...styles.badge, ...(isMobile ? styles.badgeMobile : {}) }}>
        <span style={styles.badgeDot} />
        <span>Market Sizing</span>
      </div>

      <h1 style={{ ...styles.title, ...(isMobile ? styles.titleMobile : {}) }}>
        Sustainability App Market Sizing:{" "}
        <span style={styles.accent}>TAM, SAM, SOM</span>
      </h1>
      <div style={styles.titleUnderline} />

      <p style={{ ...styles.body, ...(isMobile ? styles.bodyMobile : {}) }}>
        A Philippines-focused view of the opportunity — narrowing from the total
        market down to the share we realistically capture in our first three years.
      </p>

      {/* Overview panel */}
      <div
        className="inner-blur-glass"
        style={{ ...styles.funnel, ...(isMobile ? styles.funnelMobile : {}) }}
      >
        {tiers.map((t, i) => (
          <React.Fragment key={t.id}>
            {i > 0 && <div style={styles.funDivider} />}
            <div
              className="sam-funbar"
              style={{
                ...styles.funBar,
                ...(hoveredTier === t.id ? styles.funBarHov : {}),
              }}
              onMouseEnter={() => setHoveredTier(t.id)}
              onMouseLeave={() => setHoveredTier(null)}
            >
              <span style={styles.funTier}>{t.id}</span>
              <span style={styles.funValue}>{t.headline}</span>
              <span style={styles.funLabel}>{t.headlineLabel}</span>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Tier Detail Cards */}
      <div style={styles.cardCol}>
        {tiers.map((t) => (
          <div
            key={t.id}
            className="inner-blur-glass sam-card"
            style={{
              ...styles.card,
              ...(isMobile ? styles.cardMobile : {}),
              ...(hoveredTier === t.id ? styles.cardHov : {}),
            }}
            onMouseEnter={() => setHoveredTier(t.id)}
            onMouseLeave={() => setHoveredTier(null)}
          >
            <div style={styles.cardAccent} />

            <div style={{ ...styles.cardHead, ...(isMobile ? styles.cardHeadMobile : {}) }}>
              <div style={styles.cardIconWrap}>
                <t.Icon />
              </div>
              <div style={styles.cardHeadText}>
                <span style={styles.cardTag}>{t.id}</span>
                <h2 style={{ ...styles.cardTitle, ...(isMobile ? styles.cardTitleMobile : {}) }}>
                  {t.fullName}
                </h2>
                <span style={styles.cardTagline}>{t.tagline}</span>
              </div>
              <div style={styles.headlinePill}>
                <span style={styles.headlineValue}>{t.headline}</span>
                <span style={styles.headlineCaption}>{t.headlineLabel}</span>
              </div>
            </div>

            <p style={{ ...styles.cardDesc, ...(isMobile ? styles.cardDescMobile : {}) }}>
              {t.description}
            </p>

            <div style={styles.itemList}>
              {t.items.map((it) => (
                <div
                  key={it.component}
                  style={{ ...styles.item, ...(isMobile ? styles.itemMobile : {}) }}
                >
                  <div style={styles.itemMain}>
                    <span style={styles.itemComponent}>{it.component}</span>
                    <span style={{ ...styles.itemDesc, ...(isMobile ? styles.itemDescMobile : {}) }}>
                      {it.description}
                    </span>
                  </div>
                  <div style={styles.itemSizeWrap}>
                    <span style={styles.itemSize}>{it.size}</span>
                  </div>
                </div>
              ))}
            </div>
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
    maxWidth: "860px",
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
    fontSize: "clamp(28px, 4.2vw, 46px)",
    fontWeight: 300,
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
  body: {
    color: "#000",
    fontSize: "clamp(14px, 1.5vw, 16px)",
    fontWeight: 400,
    lineHeight: 1.72,
    maxWidth: "600px",
    marginBottom: "22px",
  },
  bodyMobile: {
    fontSize: "12.5px",
    lineHeight: "1.5",
    marginBottom: "16px",
  },

  /* Overview panel */
  funnel: {
    display: "flex",
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "center",
    gap: "4px",
    width: "100%",
    maxWidth: "560px",
    padding: "14px 10px",
    borderRadius: "18px",
    background: "linear-gradient(150deg, rgba(255,255,255,0.62), rgba(255,255,255,0.38))",
    border: "1px solid rgba(0,0,0,0.05)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 22px rgba(0,0,0,0.06)",
    backdropFilter: "blur(18px) saturate(180%)",
    WebkitBackdropFilter: "blur(18px) saturate(180%)",
    boxSizing: "border-box",
    marginBottom: "34px",
  },
  funnelMobile: {
    padding: "10px 4px",
    gap: "2px",
    marginBottom: "24px",
  },
  funDivider: {
    width: "1px",
    alignSelf: "stretch",
    margin: "4px 0",
    background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0) 100%)",
  },
  funBar: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "2px",
    padding: "8px 8px",
    borderRadius: "12px",
    cursor: "default",
    boxSizing: "border-box",
  },
  funBarHov: {
    background: "linear-gradient(135deg, rgba(74,222,128,0.14), rgba(125,211,252,0.14))",
    transform: "translateY(-2px)",
  },
  funTier: {
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "1.2px",
    color: "#15803d",
  },
  funValue: {
    fontSize: "clamp(17px, 2.4vw, 22px)",
    fontWeight: 700,
    letterSpacing: "-0.5px",
    lineHeight: 1.1,
    background: "linear-gradient(90deg, #16a34a, #0284c7)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  funLabel: {
    fontSize: "9.5px",
    fontWeight: 500,
    color: "rgba(0,0,0,0.55)",
    marginTop: "1px",
    lineHeight: 1.25,
    textAlign: "center",
  },

  /* Tier cards */
  cardCol: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    width: "100%",
  },
  card: {
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(150deg, rgba(255,255,255,0.72), rgba(255,255,255,0.42))",
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: "22px",
    padding: "24px 26px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.06)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    textAlign: "left",
    boxSizing: "border-box",
    cursor: "default",
  },
  cardMobile: {
    padding: "20px 16px",
    borderRadius: "18px",
  },
  cardHov: {
    transform: "translateY(-5px)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 18px 38px rgba(21,128,61,0.14)",
  },
  cardAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: "linear-gradient(90deg, #4ade80, #7dd3fc)",
  },
  cardHead: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "14px",
  },
  cardHeadMobile: {
    flexWrap: "wrap",
    gap: "10px",
  },
  cardIconWrap: {
    flex: "0 0 auto",
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(150deg, rgba(74,222,128,0.18), rgba(125,211,252,0.16))",
    border: "1px solid rgba(255,255,255,0.7)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 4px 12px rgba(21,128,61,0.1)",
  },
  cardHeadText: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    flex: 1,
    minWidth: 0,
  },
  cardTag: {
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "1.2px",
    textTransform: "uppercase",
    color: "#15803d",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#000",
    margin: 0,
    letterSpacing: "-0.3px",
    lineHeight: 1.2,
  },
  cardTitleMobile: {
    fontSize: "16px",
  },
  cardTagline: {
    fontSize: "12px",
    fontWeight: 500,
    color: "rgba(0,0,0,0.5)",
  },
  headlinePill: {
    flex: "0 0 auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    textAlign: "right",
    maxWidth: "140px",
  },
  headlineValue: {
    fontSize: "22px",
    fontWeight: 700,
    letterSpacing: "-0.8px",
    lineHeight: 1.05,
    background: "linear-gradient(90deg, #16a34a, #0284c7)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  headlineCaption: {
    fontSize: "10px",
    fontWeight: 500,
    color: "rgba(0,0,0,0.5)",
    lineHeight: 1.3,
  },
  cardDesc: {
    fontSize: "13.5px",
    color: "rgba(0,0,0,0.68)",
    lineHeight: 1.6,
    margin: "0 0 16px",
  },
  cardDescMobile: {
    fontSize: "12.5px",
  },
  itemList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  item: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px",
    padding: "14px 16px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.5)",
    border: "1px solid rgba(0,0,0,0.04)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
  },
  itemMobile: {
    flexDirection: "column",
    gap: "8px",
    padding: "12px 14px",
  },
  itemMain: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
    minWidth: 0,
  },
  itemComponent: {
    fontSize: "13.5px",
    fontWeight: 700,
    color: "#0f172a",
    letterSpacing: "-0.2px",
  },
  itemDesc: {
    fontSize: "12.5px",
    color: "rgba(0,0,0,0.62)",
    lineHeight: 1.55,
  },
  itemDescMobile: {
    fontSize: "12px",
  },
  itemSizeWrap: {
    flex: "0 0 auto",
  },
  itemSize: {
    display: "inline-block",
    fontSize: "12px",
    fontWeight: 700,
    color: "#0369a1",
    background: "linear-gradient(135deg, rgba(74,222,128,0.16), rgba(125,211,252,0.2))",
    border: "1px solid rgba(125,211,252,0.4)",
    padding: "6px 12px",
    borderRadius: "999px",
    whiteSpace: "nowrap",
  },
};

export default SustainabilityAppMarket;
