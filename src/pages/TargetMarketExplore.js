import React, { useState, useEffect } from "react";

const iconProps = {
  width: 26,
  height: 26,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "#15803d",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

// Globe — Digital Acquisition
const DigitalIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3c2.5 2.4 3.9 5.6 4 9-.1 3.4-1.5 6.6-4 9-2.5-2.4-3.9-5.6-4-9 .1-3.4 1.5-6.6 4-9Z" />
  </svg>
);

// People — Physical & Community Engagement
const CommunityIcon = () => (
  <svg {...iconProps}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
    <path d="M16 6.5a3 3 0 0 1 0 5.8" />
    <path d="M17.5 14.5A5.5 5.5 0 0 1 20.5 20" />
  </svg>
);

// Handshake — B2B & Sector Integration
const B2BIcon = () => (
  <svg {...iconProps}>
    <path d="M11 7 8.5 9.5a1.8 1.8 0 0 0 0 2.5 1.8 1.8 0 0 0 2.5 0L13 10l3.5 3.5a1.5 1.5 0 0 0 2-2.2L14 6h-1.5L11 7Z" />
    <path d="M13 10l2.2 2.2M11 12l1.8 1.8M9 14l1.6 1.6" />
    <path d="M3 7h3v6H3M21 7h-3v6h3" />
  </svg>
);

const acquisitionCards = [
  {
    Icon: DigitalIcon,
    tag: "Online",
    heading: "Digital Acquisition",
    bullets: [
      { label: "Content Marketing", desc: "Create highly shareable content leveraging the AI Plant Doctor data for localized insights." },
      { label: "SEO / ASO", desc: "Target high-intent search terms around urban farming, local crop diseases, and \"Plantito/Plantita\" guides in Tagalog and regional dialects." },
      { label: "Monetization", desc: "Offer AI diagnosis and basic Canvas courses free, then convert users to the Paid Subscription Tier for Certification Tracks and advanced data." },
    ],
  },
  {
    Icon: CommunityIcon,
    tag: "On-Ground",
    heading: "Physical & Community",
    bullets: [
      { label: "LGU Partnerships", desc: "Partner with LGUs and Barangays to promote Event RSVP for official community training — instant credibility and access to organized groups." },
      { label: "Specialist Workshops", desc: "Host high-value workshops via the Community Hub with verified local specialists, marketed heavily in launch cities." },
      { label: "Word-of-Mouth", desc: "Encourage successful Novice users to become Micro-Vendors, showing a clear path from learning to earning." },
    ],
  },
  {
    Icon: B2BIcon,
    tag: "B2B",
    heading: "Sector Integration",
    bullets: [
      { label: "Direct Sales", desc: "A specialized sales team onboards hotels, restaurants, and food processors — pitched on verifiable cost savings and CSR impact from food-waste reduction." },
      { label: "Farmer Outreach", desc: "Partner with provincial agricultural offices and cooperatives (e.g. Benguet) to prove the value of the Bulk Listing / Surplus Module in preventing spoilage losses." },
      { label: "Impact Reporting", desc: "Give partner institutions auditable food-waste-diversion and local-sourcing metrics they can cite in CSR and ESG reports — turning procurement into a story worth telling." },
    ],
  },
];

function TargetMarketExplore() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleScroll = (e) => {
    if (!isMobile) return;
    const { scrollLeft, scrollWidth, clientWidth } = e.target;
    if (scrollWidth <= clientWidth) return;

    const ratio = scrollLeft / (scrollWidth - clientWidth);
    const index = Math.round(ratio * (acquisitionCards.length - 1));

    if (index !== activeIndex && !isNaN(index)) {
      setActiveIndex(index);
    }
  };

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
          .tme-card { transition: transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s cubic-bezier(.22,1,.36,1); }
        `}
      </style>

      <div className="inner-blur-glass glass-hover-zoom-sm" style={styles.badge}>
        <span style={styles.badgeDot} />
        <span>Go-To-Market</span>
      </div>

      <h1 style={{ ...styles.title, ...(isMobile ? styles.titleMobile : {}) }}>
        Distribution Channels <span style={styles.accent}>&amp; Acquisition Tactics</span>
      </h1>
      <div style={styles.titleUnderline} />

      <p style={{ ...styles.body, ...(isMobile ? styles.bodyMobile : {}) }}>
        A three-front strategy to reach households and communities across the
        Philippines — pairing digital reach with grassroots trust and B2B scale.
      </p>

      <div
        style={{ ...styles.cardRow, ...(isMobile ? styles.cardRowMobile : {}) }}
        className="hide-scroll"
        onScroll={handleScroll}
      >
        {acquisitionCards.map((c) => (
          <div
            key={c.heading}
            className="inner-blur-glass tme-card"
            style={{
              ...styles.card,
              ...(isMobile ? styles.cardMobile : {}),
              ...(hoveredCard === c.heading ? styles.cardHov : {}),
            }}
            onMouseEnter={() => setHoveredCard(c.heading)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={styles.cardAccent} />
            <div style={styles.cardHeaderArea}>
              <div style={styles.cardIconWrap}>
                <c.Icon />
              </div>
              <span style={styles.cardTag}>{c.tag}</span>
              <h3 style={{ ...styles.cardHeading, ...(isMobile ? styles.cardHeadingMobile : {}) }}>
                {c.heading}
              </h3>
            </div>
            <div style={styles.cardDivider} />
            <ul style={styles.bulletList}>
              {c.bullets.map((b) => (
                <li key={b.label} style={styles.bulletItem}>
                  <span style={styles.bulletDot} />
                  <span style={{ ...styles.bulletText, ...(isMobile ? styles.bulletTextMobile : {}) }}>
                    <strong style={styles.bulletLabel}>{b.label}:</strong> {b.desc}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Scroll Indicator Dots - Mobile Only */}
      {isMobile && (
        <div style={styles.indicatorRow}>
          {acquisitionCards.map((_, i) => (
            <div
              key={i}
              style={{
                ...styles.dot,
                ...(activeIndex === i ? styles.dotActive : {}),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "10px 16px 20px",
    maxWidth: "1100px",
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
  badgeDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#4ade80",
    boxShadow: "0 0 5px rgba(74,222,128,0.9)",
    display: "inline-block",
  },
  title: {
    fontSize: "clamp(28px, 4vw, 44px)",
    fontWeight: 300,
    color: "#000",
    margin: "0 0 16px",
    lineHeight: 1.15,
    letterSpacing: "-0.8px",
    textShadow: "0 4px 12px rgba(0,0,0,0.1)",
    animation: "titleReveal 0.9s cubic-bezier(.22,1,.36,1) 0.15s both",
  },
  titleMobile: {
    fontSize: "clamp(22px, 7vw, 32px)",
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
    marginBottom: "14px",
  },
  bodyMobile: {
    fontSize: "13px",
    lineHeight: "1.6",
    marginBottom: "10px",
  },
  cardRow: {
    display: "flex",
    gap: "18px",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "stretch",
    marginTop: "16px",
    width: "100%",
  },
  cardRowMobile: {
    flexWrap: "nowrap",
    justifyContent: "flex-start",
    overflowX: "auto",
    padding: "10px 40px 20px",
    gap: "16px",
    scrollSnapType: "x mandatory",
    scrollPadding: "0 40px",
    WebkitOverflowScrolling: "touch",
    width: "100%",
    boxSizing: "border-box",
    marginTop: "12px",
  },
  card: {
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(150deg, rgba(255,255,255,0.72), rgba(255,255,255,0.42))",
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: "22px",
    padding: "26px 24px 24px",
    flex: "1 1 320px",
    maxWidth: "360px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.06)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    cursor: "default",
  },
  cardMobile: {
    flex: "0 0 290px",
    maxWidth: "none",
    padding: "24px 20px 20px",
    scrollSnapAlign: "center",
    scrollSnapStop: "always",
  },
  cardHov: {
    transform: "translateY(-6px)",
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
  cardHeaderArea: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "9px",
  },
  cardIconWrap: {
    width: "52px",
    height: "52px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(150deg, rgba(74,222,128,0.18), rgba(125,211,252,0.16))",
    border: "1px solid rgba(255,255,255,0.7)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 4px 12px rgba(21,128,61,0.1)",
  },
  cardTag: {
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.7px",
    textTransform: "uppercase",
    color: "#15803d",
    background: "rgba(74,222,128,0.14)",
    padding: "3px 10px",
    borderRadius: "999px",
  },
  cardHeading: {
    fontSize: "17px",
    fontWeight: 700,
    color: "#000",
    margin: 0,
    letterSpacing: "-0.3px",
    textAlign: "center",
  },
  cardHeadingMobile: {
    fontSize: "16px",
  },
  cardDivider: {
    width: "34px",
    height: "2px",
    borderRadius: "999px",
    background: "rgba(0,0,0,0.08)",
    margin: "2px 0",
  },
  bulletList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    width: "100%",
    textAlign: "left",
  },
  bulletItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
  },
  bulletDot: {
    flex: "0 0 auto",
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    marginTop: "7px",
    background: "linear-gradient(90deg, #4ade80, #7dd3fc)",
    boxShadow: "0 0 6px rgba(74,222,128,0.5)",
  },
  bulletText: {
    fontSize: "13px",
    color: "rgba(0, 0, 0, 0.72)",
    lineHeight: 1.58,
  },
  bulletTextMobile: {
    fontSize: "12px",
  },
  bulletLabel: {
    color: "#0f172a",
    fontWeight: 700,
  },
  indicatorRow: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    marginTop: "0px",
    paddingBottom: "12px",
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "rgba(0, 0, 0, 0.2)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  dotActive: {
    background: "#4ade80",
    transform: "scale(1.25)",
    boxShadow: "0 0 10px rgba(74, 222, 128, 0.4)",
  },
};

export default TargetMarketExplore;
