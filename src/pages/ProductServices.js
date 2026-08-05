import React, { useState, useEffect } from "react";
import Reveal, { RevealStyles } from "../components/Reveal";

const iconProps = {
  width: 26,
  height: 26,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "var(--eco-c11)",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

// Package — Product
const PackageIcon = () => (
  <svg {...iconProps}>
    <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
    <path d="M3 8l9 5 9-5" />
    <path d="M12 13v8" />
    <path d="M7.5 5.5 16.5 10.5" />
  </svg>
);

// Tools — Services
const ServiceIcon = () => (
  <svg {...iconProps}>
    <path d="M14.5 5.5a3.5 3.5 0 0 0-4.9 4.3L4 15.4 6 17.4l5.6-5.6a3.5 3.5 0 0 0 4.3-4.9l-2 2-1.8-.4-.4-1.8 2-2Z" />
    <path d="M14.5 14.5 19 19" />
  </svg>
);

// Community — Sector
const SectorIcon = () => (
  <svg {...iconProps}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
    <path d="M16 6.5a3 3 0 0 1 0 5.8" />
    <path d="M17.5 14.5A5.5 5.5 0 0 1 20.5 20" />
  </svg>
);

const productServicesCards = [
  {
    Icon: PackageIcon,
    tag: "Goods",
    heading: "Product",
    image: "/herb_kit.png",
    imageAlt: "Potted basil and mint growing in a balcony planter box",
    bullets: [
      { label: "Organic Edibles", desc: "Local produce, herbs, and floriculture grown for Philippine conditions, plus localized seed varieties you can trust to thrive." },
      { label: "Urban Starter Kits & Toolsets", desc: "Themed kits like the Balcony Herb Garden and Tomato Success Kit — customized soil mixes, localized seeds, and starter tools in one box." },
      { label: "AI Data Subscription", desc: "Premium 24/7 predictive crop diagnostics and hyper-local weather alerts delivered before problems hit your garden." },
      { label: "Specialist Certification", desc: "Structured paid courses that take growers from hobbyist to certified urban-farming specialist." },
    ],
    buttonText: "Explore Products",
    nav: "ProductsPage",
  },
  {
    Icon: ServiceIcon,
    tag: "Platform",
    heading: "Services",
    image: "/starter_kit.png",
    imageAlt: "A vendor tending trays of seedlings at an outdoor market stall",
    bullets: [
      { label: "AI Plant Doctor", desc: "24/7 photo-based plant diagnosis with care guides tuned to the Philippine climate and native crops." },
      { label: "Events & Workshops", desc: "RSVP to specialist workshops, hands-on trainings, and community gatherings hosted at local venues." },
      { label: "Surplus Exchange", desc: "Commercial farmers list large-volume oversupply; verified institutional buyers — hotels, restaurants, processors — are notified for immediate purchase." },
      { label: "Community Hub", desc: "A forum for growers to swap advice plus a farm planner to map plots, schedule crops, and track harvests." },
    ],
    buttonText: "Explore Services",
    nav: "ServicesPage",
  },
  {
    Icon: SectorIcon,
    tag: "Impact",
    heading: "Sector",
    image: "/farming.jpg",
    imageAlt: "Farmers working rows of crops in an open field",
    bullets: [
      { label: "Food Security & Waste Reduction", desc: "Digital tools and localized data support both urban farms and traditional farming centers through oversupply periods — keeping harvests in the food system instead of landfills." },
      { label: "Livelihood Creation", desc: "Supplementary income streams for micro-vendors and home growers, directly addressing high unemployment and underemployment rates." },
      { label: "LGU & Seed Bank Programs", desc: "Standardized urban-farming training curricula for LGUs, plus distribution and tracking of native seed bank programs nationwide." },
    ],
    buttonText: "View Our Impact",
    nav: "OurImpactPage",
  },
];

function ProductServices({ setActiveNav }) {
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
    const index = Math.round(ratio * (productServicesCards.length - 1));

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
          .ps-card { transition: transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s cubic-bezier(.22,1,.36,1); }

          @keyframes psDotPulse {
            0%, 100% { transform: scale(1);   opacity: 1; }
            50%      { transform: scale(1.5); opacity: 0.55; }
          }
          .ps-dot { animation: psDotPulse 2.4s ease-in-out infinite; }

          .ps-media img { transition: transform .7s cubic-bezier(.22,1,.36,1); }
          .ps-media:hover img { transform: scale(1.06); }
          .ps-media .ps-icon { transition: transform .35s cubic-bezier(.34,1.56,.64,1), box-shadow .35s ease; }
          .ps-media:hover .ps-icon {
            transform: translateY(-3px) scale(1.07);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.9), 0 12px 24px rgba(var(--eco-c11-rgb), 0.28);
          }

          @media (prefers-reduced-motion: reduce) {
            .ps-dot { animation: none; }
            .ps-media img, .ps-media:hover img,
            .ps-media .ps-icon, .ps-media:hover .ps-icon {
              transition: none;
              transform: none;
            }
          }
        `}
      </style>
      <RevealStyles />

      <Reveal className="inner-blur-glass glass-hover-zoom-sm" style={styles.badge}>
        <span className="ps-dot" style={styles.badgeDot} />
        <span>What We Offer</span>
      </Reveal>

      <h1 style={{ ...styles.title, ...(isMobile ? styles.titleMobile : {}) }}>
        Product &amp; <span style={styles.accent}>Services</span>
      </h1>

      <Reveal as="p" delay={120} style={{ ...styles.body, ...(isMobile ? styles.bodyMobile : {}) }}>
        EcoEquity offers a comprehensive suite of digital tools and resources
        to help you grow food, build community, and earn sustainably.
      </Reveal>

      <div
        style={{ ...styles.cardRow, ...(isMobile ? styles.cardRowMobile : {}) }}
        className="hide-scroll"
        onScroll={handleScroll}
      >
        {productServicesCards.map((c, ci) => (
          <Reveal
            key={c.heading}
            delay={ci * 120}
            className="inner-blur-glass ps-card ps-media"
            style={{
              ...styles.card,
              ...(isMobile ? styles.cardMobile : {}),
              ...(hoveredCard === c.heading ? styles.cardHov : {}),
            }}
            onMouseEnter={() => setHoveredCard(c.heading)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={styles.cardAccent} />

            <div style={{ ...styles.cardMedia, ...(isMobile ? styles.cardMediaMobile : {}) }}>
              <img
                src={c.image}
                alt={c.imageAlt}
                loading="lazy"
                decoding="async"
                style={styles.cardImg}
              />
              <span aria-hidden="true" style={styles.cardMediaScrim} />
              <span style={styles.cardTag}>{c.tag}</span>
            </div>

            <div className="ps-icon" style={styles.cardIconWrap}>
              <c.Icon />
            </div>
            <h3 style={{ ...styles.cardHeading, ...(isMobile ? styles.cardHeadingMobile : {}) }}>{c.heading}</h3>
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

            <button
              type="button"
              style={{
                ...styles.cardBtn,
                ...(isMobile ? styles.cardBtnMobile : {}),
              }}
              onClick={() => setActiveNav(c.nav)}
            >
              <span aria-hidden="true" style={styles.cardBtnInnerBlur} />
              <span style={styles.cardBtnContentLayer}>{c.buttonText} →</span>
            </button>
          </Reveal>
        ))}
      </div>

      {/* Scroll Indicator Dots - Mobile Only */}
      {isMobile && (
        <div style={styles.indicatorRow}>
          {productServicesCards.map((_, i) => (
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
    padding: "8px 16px 20px",
    maxWidth: "1100px",
    margin: "0 auto",
    animation: "fadeInUp 0.75s cubic-bezier(.22,1,.36,1) both",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  wrapMobile: {
    padding: "12px 12px 24px",
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
    color: "var(--eco-c13)",
    letterSpacing: "0.6px",
    textTransform: "uppercase",
    marginBottom: "20px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.05)",
  },
  badgeDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "var(--eco-c6)",
    boxShadow: "0 0 5px rgba(var(--eco-c6-rgb), 0.9)",
    display: "inline-block",
  },
  title: {
    fontSize: "clamp(32px, 4.5vw, 50px)",
    fontWeight: 300,
    color: "#000",
    margin: "0 0 16px",
    lineHeight: 1.15,
    letterSpacing: "-0.8px",
    textShadow: "0 4px 12px rgba(0,0,0,0.1)",
    animation: "titleReveal 0.9s cubic-bezier(.22,1,.36,1) 0.15s both",
  },
  titleMobile: {
    fontSize: "clamp(26px, 7.5vw, 36px)",
  },
  accent: {
    background: "linear-gradient(90deg, var(--eco-c6), var(--eco-c5))",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  body: {
    color: "#000",
    fontSize: "clamp(13px, 1.4vw, 15px)",
    fontWeight: 400,
    lineHeight: 1.72,
    maxWidth: "680px",
    marginBottom: "12px",
  },
  bodyMobile: {
    fontSize: "12px",
    lineHeight: "1.6",
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
    padding: "10px 40px 30px",
    gap: "16px",
    scrollSnapType: "x mandatory",
    scrollPadding: "0 40px",
    WebkitOverflowScrolling: "touch",
    alignItems: "stretch",
  },
  card: {
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(150deg, rgba(255,255,255,0.72), rgba(255,255,255,0.42))",
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: "22px",
    padding: "26px 24px 24px",
    flex: "1 1 300px",
    maxWidth: "350px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    textAlign: "left",
    gap: "9px",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.06)",
    cursor: "default",
  },
  cardMobile: {
    flex: "0 0 280px",
    maxWidth: "none",
    padding: "24px 20px 20px",
    scrollSnapAlign: "center",
    scrollSnapStop: "always",
  },
  cardHov: {
    transform: "translateY(-6px)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 18px 38px rgba(var(--eco-c11-rgb), 0.14)",
  },
  cardAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    zIndex: 2,
    background: "linear-gradient(90deg, var(--eco-c6), var(--eco-c5))",
  },
  /* Full-bleed photo banner: negative margins cancel the card's padding so the
     image meets the card's rounded top edge. */
  cardMedia: {
    position: "relative",
    margin: "-26px -24px 0",
    height: "148px",
    overflow: "hidden",
    flexShrink: 0,
    alignSelf: "stretch",
  },
  cardMediaMobile: {
    margin: "-24px -20px 0",
    height: "128px",
  },
  cardImg: {
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  cardMediaScrim: {
    position: "absolute",
    inset: "auto 0 0 0",
    height: "62%",
    pointerEvents: "none",
    background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 100%)",
  },
  cardIconWrap: {
    position: "relative",
    zIndex: 1,
    marginTop: "-30px",
    width: "52px",
    height: "52px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(150deg, rgba(236,253,243,0.96), rgba(var(--eco-c2-rgb), 0.94))",
    border: "1px solid rgba(255,255,255,0.9)",
    backdropFilter: "blur(14px) saturate(180%)",
    WebkitBackdropFilter: "blur(14px) saturate(180%)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 8px 20px rgba(var(--eco-c11-rgb), 0.18)",
  },
  cardTag: {
    position: "absolute",
    right: "14px",
    bottom: "12px",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.7px",
    textTransform: "uppercase",
    color: "var(--eco-c16)",
    background: "rgba(255,255,255,0.92)",
    padding: "4px 11px",
    borderRadius: "999px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.22)",
  },
  cardHeading: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#000",
    margin: "0",
    letterSpacing: "-0.3px",
  },
  cardHeadingMobile: {
    fontSize: "16px",
  },
  cardDivider: {
    width: "34px",
    height: "2px",
    borderRadius: "999px",
    background: "rgba(0,0,0,0.08)",
    margin: "2px 0 4px",
  },
  bulletList: {
    listStyle: "none",
    padding: 0,
    margin: "0 0 8px",
    display: "flex",
    flexDirection: "column",
    gap: "11px",
    width: "100%",
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
    background: "linear-gradient(90deg, var(--eco-c6), var(--eco-c5))",
    boxShadow: "0 0 6px rgba(var(--eco-c6-rgb), 0.5)",
  },
  bulletText: {
    fontSize: "13px",
    color: "rgba(0, 0, 0, 0.72)",
    lineHeight: 1.55,
    textAlign: "left",
  },
  bulletLabel: {
    color: "#0f172a",
    fontWeight: 700,
  },
  bulletTextMobile: {
    fontSize: "12px",
    lineHeight: 1.5,
  },
  cardBtn: {
    position: "relative",
    overflow: "hidden",
    isolation: "isolate",
    marginTop: "auto",
    padding: "9px 20px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.35)",
    background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.95), rgba(var(--eco-c5-rgb), 0.95))",
    color: "var(--eco-c19)",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    transform: "scale(1)",
    transformOrigin: "center",
    willChange: "transform",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    fontFamily: "inherit",
    letterSpacing: "0.2px",
    boxShadow: "0 18px 38px rgba(var(--eco-c7-rgb), 0.26), inset 0 1px 0 rgba(255,255,255,0.48)",
    transition: "transform 0.16s ease",
    backdropFilter: "blur(18px) saturate(165%)",
    WebkitBackdropFilter: "blur(18px) saturate(165%)",
  },
  cardBtnInnerBlur: {
    position: "absolute",
    inset: "0",
    zIndex: 0,
    pointerEvents: "none",
    borderRadius: "inherit",
    background: "radial-gradient(circle at 28% 18%, rgba(255,255,255,0.35), transparent 42%), linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.36), rgba(var(--eco-c5-rgb), 0.32))",
    backdropFilter: "blur(34px) saturate(185%)",
    WebkitBackdropFilter: "blur(34px) saturate(185%)",
  },
  cardBtnContentLayer: {
    position: "relative",
    zIndex: 1,
  },
  cardBtnMobile: {
    fontSize: "11px",
    padding: "8px 16px",
    width: "100%",
    textAlign: "center",
    marginTop: "12px",
  },
  indicatorRow: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    marginTop: "0px",
    paddingBottom: "24px",
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "rgba(0, 0, 0, 0.2)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  dotActive: {
    background: "var(--eco-c6)",
    transform: "scale(1.25)",
    boxShadow: "0 0 10px rgba(var(--eco-c6-rgb), 0.4)",
  },
};

export default ProductServices;
