import React, { useEffect, useState } from "react";

const sdgItems = [
  {
    number: "01",
    image: "/1.1.png",
    bgImage: "/No poverty.jpg", // Image for SDG 01
    color: "#d71932",
    expandedTitle: "No Poverty",
    expandedContent: [
      {
        heading: "Target 1.4",
        text: "Ensure poor and vulnerable communities have equal rights to economic resources, basic services, land control, and financial services including microfinance.",
      },
      {
        heading: "Global Indicator 1.4.1",
        text: "Proportion of population living in households with access to basic services.",
      },
      {
        heading: "Platform Alignment",
        text: "Onboarding 3,500+ vulnerable or low-income micro-vendors onto a zero-setup-cost digital marketplace.",
      },
    ],
  },
  {
    number: "02",
    image: "/1.2.png",
    bgImage: "/Rice.jpg", // Image for SDG 02
    color: "#dda63a",
    expandedTitle: "Zero Hunger",
    expandedContent: [
      {
        heading: "Target 2.1",
        text: "End hunger and ensure access by all people, in particular the poor and people in vulnerable situations, including infants, all year round to safe, nutritious and sufficient food.",
      },
      {
        heading: "Global Indicator 2.1.2",
        text: "Prevalence of moderate or severe food insecurity in the population.",
      },
      {
        heading: "Platform Alignment",
        text: "Supplementing 500,000+ localized organic meals annually to urban households to buffer against high food inflation.",
      },
    ],
  },
  {
    number: "08",
    image: "/1.3.png",
    bgImage: "/Decent.png", // Update this file name for SDG 08
    color: "#a21942",
    expandedTitle: "Decent Work and Economic Growth",
    expandedContent: [
      {
        heading: "Target 8.3",
        text: "Promote development-oriented policies that support productive activities, decent job creation, entrepreneurship, creativity and innovation, and encourage the formalization and growth of micro-, small- and medium-sized enterprises, including through access to financial services.",
      },
      {
        heading: "Global Indicator 8.3.1",
        text: "Proportion of informal employment in non-agricultural employment, by sex.",
      },
      {
        heading: "Platform Alignment",
        text: "Providing an economic launchpad that generates ₱63 Million PHP in annual Gross Merchandise Value (GMV) for informal urban backyard growers.",
      },
    ],
  },
  {
    number: "09",
    image: "/1.4.png",
    bgImage: "/Establishment.jpg", // Update this file name for SDG 09
    color: "#ff6f2c",
    expandedTitle: "Industry, Innovation, and Infrastructure",
    expandedContent: [
      {
        heading: "Target 9.b",
        text: "Support domestic technology development, research and innovation in developing countries, including by ensuring a conducive policy environment for, inter alia, industrial diversification and value addition to commodities.",
      },
      {
        heading: "Global Indicator 9.b.1",
        text: "Proportion of medium and high-tech industry value added in total value added.",
      },
      {
        heading: "Platform Alignment",
        text: "Designing and deploying a locally trained, 24/7 AI Plant Doctor framework engineered specifically for Philippine native crops and micro-climates.",
      },
    ],
  },
  {
    number: "11",
    image: "/1.5.png",
    bgImage: "/No poverty.jpg", // Update this file name for SDG 11
    color: "#fd9d24",
    expandedTitle: "Sustainable Cities and Communities",
    expandedContent: [
      {
        heading: "Target 11.a",
        text: "Support positive economic, social and environmental links between urban, peri-urban and rural areas by strengthening national and regional development planning.",
      },
      {
        heading: "Global Indicator 11.a.1",
        text: "Number of countries that have national urban policies or regional development plans that respond to population dynamics.",
      },
      {
        heading: "Platform Alignment",
        text: "Creating a physical-digital logistics link that allows regional rural farmers to efficiently offload surplus produce directly to urban institutional buyers (hotels, restaurants, and commissaries).",
      },
    ],
  },
  {
    number: "12",
    image: "/6.png",
    bgImage: "/No poverty.jpg", // Update this file name for SDG 12
    color: "#bf8b2e",
    expandedTitle: "Responsible Consumption and Production",
    expandedContent: [
      {
        heading: "Target 12.3",
        text: "Halve per capita global food waste at the retail and consumer levels and reduce food losses along production and supply chains, including post-harvest losses.",
      },
      {
        heading: "Global Indicator 12.3.1",
        text: "(a) Food loss index and (b) food waste index.",
      },
      {
        heading: "Platform Alignment",
        text: "Mitigating a targeted 100+ tons of commercial agricultural waste by creating a direct, frictionless link for bulk oversupply clearance.",
      },
    ],
  },
  {
    number: "14",
    image: "/7.png",
    bgImage: "/species.jpg", // Update this file name for SDG 14
    color: "#0a97d9",
    expandedTitle: "Life Below Water",
    expandedContent: [
      {
        heading: "Target 14.1",
        text: "Prevent and significantly reduce marine pollution of all kinds, in particular from land-based activities, including marine debris and nutrient pollution.",
      },
      {
        heading: "Global Indicator 14.1.1",
        text: "(a) Index of coastal eutrophication and (b) plastic debris density.",
      },
      {
        heading: "Platform Alignment",
        text: "Standardizing educational modules on organic urban farming and hydroponics, preventing toxic synthetic chemical and fertilizer runoff from leaking into urban waterways and marine systems.",
      },
    ],
  },
  {
    number: "15",
    image: "/8.png",
    bgImage: "/No poverty.jpg", // Update this file name for SDG 15
    color: "#279b48",
    expandedTitle: "Life on Land",
    expandedContent: [
      {
        heading: "Target 15.5",
        text: "Take urgent and significant action to reduce the degradation of natural habitats, halt the loss of biodiversity and, by 2020, protect and prevent the extinction of threatened species.",
      },
      {
        heading: "Global Indicator 15.5.1",
        text: "Red List Index (Biodiversity tracking).",
      },
      {
        heading: "Platform Alignment",
        text: "Utilizing the platform's community network to track, distribute, and preserve local agricultural biodiversity through native and heirloom seed banking initiatives.",
      },
    ],
  },
  {
    number: "16",
    image: "/9.png",
    bgImage: "/No poverty.jpg", // Update this file name for SDG 16
    color: "#00689d",
    expandedTitle: "Peace, Justice, and Strong Institutions",
    expandedContent: [
      {
        heading: "Target 16.6",
        text: "Develop effective, accountable and transparent institutions at all levels.",
      },
      {
        heading: "Global Indicator 16.6.2",
        text: "Proportion of population satisfied with their last experience of public services.",
      },
      {
        heading: "Platform Alignment",
        text: "Providing an open, auditable, and transparent transaction ledger that ensures fair trade and protects smallholder micro-vendors from predatory middlemen.",
      },
    ],
  },
  {
    number: "17",
    image: "/10.png",
    bgImage: "/No poverty.jpg", // Update this file name for SDG 17
    color: "#19486a",
    expandedTitle: "Partnerships for the Goals",
    expandedContent: [
      {
        heading: "Target 17.17",
        text: "Encourage and promote effective public, public-private and civil society partnerships, building on the experience and resourcing strategies of partnerships.",
      },
      {
        heading: "Global Indicator 17.17.1",
        text: "Amount in US dollars committed to public-private partnerships for infrastructure.",
      },
      {
        heading: "Platform Alignment",
        text: "Standardizing the VerdeVersity Learning Canvas to serve as the blueprint curriculum for Local Government Unit (LGU) and Barangay urban agriculture deployment programs.",
      },
    ],
  },
];

function LearnMore({ setActiveNav }) {
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredSdg, setHoveredSdg] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleScroll = (e) => {
    const { scrollLeft, scrollWidth, clientWidth } = e.target;
    if (scrollWidth <= clientWidth) return;

    const ratio = scrollLeft / (scrollWidth - clientWidth);
    const nextIndex = Math.round(ratio * (sdgItems.length - 1));

    if (!Number.isNaN(nextIndex) && nextIndex !== activeIndex) {
      setActiveIndex(nextIndex);
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
        `}
      </style>

      <div style={styles.headerRow}>
        <div style={styles.backBtnWrap}>
          <button
            type="button"
            className="inner-blur-glass"
            style={{
              ...styles.backBtn,
              ...(isHovered ? styles.backBtnHov : {}),
            }}
            onClick={() => setActiveNav && setActiveNav("Home")}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          > 
            <span>←</span>
          </button>
        </div>
        <div className="inner-blur-glass glass-hover-zoom-sm" style={styles.badge}>
          <span style={styles.badgeDot} />
          <span>Learn More</span>
        </div>
      </div>

      <h1 style={{ ...styles.title, ...(isMobile ? styles.titleMobile : {}) }}>
        Sustainable Development Goals Aligned with <span style={styles.accent}>EcoEquity</span>
      </h1>
      <div style={styles.titleUnderline} />

      <p style={{ ...styles.body, ...(isMobile ? styles.bodyMobile : {}) }}>
        EcoEquity is a comprehensive platform built to transform agricultural practices and empower local communities. Find out more about our initiatives, our technology, and how you can get involved.
      </p>

      <div
        className="hide-scroll"
        style={{ ...styles.sdgSlider, ...(isMobile ? styles.sdgSliderMobile : {}) }}
        onScroll={handleScroll}
        aria-label="Horizontal SDG slider"
      >
        {sdgItems.map((sdg, index) => (
          <div
            key={`${sdg.number}-${sdg.title}`}
            style={{
              ...styles.sdgBox,
              "--sdg-expanded-color": sdg.color || "#e5243b",
              ...(sdg.bgImage ? { background: `url('${sdg.bgImage}') center / cover` } : {}),
              ...(isMobile ? styles.sdgBoxMobile : {}),
              ...(sdg.image ? styles.sdgBoxWithImage : {}),
              ...(hoveredSdg === index ? styles.sdgBoxHover : {}),
              ...(expandedImage === index ? styles.sdgBoxImageExpanded : {}),
            }}
            onMouseEnter={() => setHoveredSdg(index)}
            onMouseLeave={() => setHoveredSdg(null)}
          >
            {sdg.title && (
              <h3 style={{ ...styles.sdgTitle, ...(isMobile ? styles.sdgTitleMobile : {}) }}>{sdg.title}</h3>
            )}
            {sdg.text && (
              <p style={{ ...styles.sdgText, ...(isMobile ? styles.sdgTextMobile : {}) }}>{sdg.text}</p>
            )}
            {sdg.image && (
              <img
                src={sdg.image}
                alt=""
                aria-hidden="true"
                style={{
                  ...styles.sdgCardImage,
                  ...(isMobile ? styles.sdgCardImageMobile : {}),
                  ...(expandedImage === index ? styles.sdgCardImageExpanded : {}),
                }}
                onMouseEnter={() => setExpandedImage(index)}
                onMouseLeave={() => setExpandedImage(null)}
              />
            )}
            {expandedImage === index && (
              <span style={styles.expandedNumber}>{sdg.number}</span>
            )}
            {expandedImage === index && sdg.expandedContent && (
              <div style={styles.expandedContent}>
                <h3 style={styles.expandedTitle}>{sdg.expandedTitle}</h3>
                <div style={styles.expandedLine} />
                {sdg.expandedContent.map((item) => (
                  <div key={item.heading} style={styles.expandedBlock}>
                    <p style={styles.expandedHeading}>{item.heading}</p>
                    <p style={styles.expandedText}>{item.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={styles.indicatorRow} aria-hidden="true">
        {sdgItems.map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.dot,
              ...(activeIndex === i ? styles.dotActive : {}),
            }}
          />
        ))}
      </div>

      {isMobile && (
        <div style={{ marginTop: '32px', width: '100%', paddingBottom: '32px' }}>
          <h2 style={{ ...styles.titleMobile, fontSize: '24px', marginBottom: '8px' }}>
            Problem <span style={styles.accent}>Addressed</span>
          </h2>
          <div style={styles.titleUnderline} />
          <p style={{ ...styles.bodyMobile, marginBottom: '24px', padding: '0 16px', maxWidth: '100%' }}>
            Dive deeper into our platform's capabilities and discover how we are
            revolutionizing agriculture across the Philippines through sustainable practices.
          </p>

          <div style={styles.circleColMobile}>
            <div style={styles.timelineItemMobile}>
              <div className="inner-blur-glass" style={styles.circleMobile}><span>1980</span></div>
              <div style={styles.timelineTextMobile}>
                <h3 style={styles.timelineHeadingMobile}>SHIFT FROM SELF-SUFFICIENCY TO IMPORT DEPENDENCY</h3>
                <p style={styles.timelineBodyMobile}>The Peso devaluation (1980s Debt Crisis) made imported inputs expensive, immediately followed by WTO liberalization (1995). This killed local farmer profitability and formally cemented the reliance on cheap rice imports.</p>
              </div>
            </div>
            <div style={styles.timelineItemMobile}>
              <div className="inner-blur-glass" style={styles.circleMobile}><span>2000</span></div>
              <div style={styles.timelineTextMobile}>
                <h3 style={styles.timelineHeadingMobile}>WTO ACCESSION & TRADE LIBERALIZATION</h3>
                <p style={styles.timelineBodyMobile}>Cheap imports flooded the market, making local crops unprofitable. Policy formally shifted to Import-Based Security, severely reducing domestic food sufficiency.</p>
              </div>
            </div>
            <div style={styles.timelineItemMobile}>
              <div className="inner-blur-glass" style={styles.circleMobile}><span>2010</span></div>
              <div style={styles.timelineTextMobile}>
                <h3 style={styles.timelineHeadingMobile}>GLOBAL PRICE SHOCKS & RAPID URBANIZATION</h3>
                <p style={styles.timelineBodyMobile}>Import dependency caused high USD rates to translate to inaccessible domestic food prices. Rapid conversion of farmland further reduced productive capacity, heightening scarcity in urban areas.</p>
              </div>
            </div>
            <div style={styles.timelineItemMobile}>
              <div className="inner-blur-glass" style={styles.circleMobile}><span>2020</span></div>
              <div style={styles.timelineTextMobile}>
                <h3 style={styles.timelineHeadingMobile}>PANDEMIC & SUPPLY CHAIN FRAGILITY</h3>
                <p style={styles.timelineBodyMobile}>Global supply shocks demonstrated the inability to sustain the population without external aid. Chronic high food inflation coupled with low employment made food fundamentally unaffordable and inaccessible for many Filipinos.</p>
              </div>
            </div>
          </div>
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
    padding: "18px 16px 18px",
    maxWidth: "1100px",
    margin: "0 auto",
    animation: "fadeInUp 0.75s cubic-bezier(.22,1,.36,1) both",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
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
  title: {
    fontSize: "clamp(24px, 3.4vw, 40px)",
    fontWeight: 700,
    color: "#000",
    margin: "0 0 10px",
    lineHeight: 1.12,
    letterSpacing: "-0.4px",
    maxWidth: "760px",
    textShadow: "0 4px 12px rgba(0,0,0,0.1)",
    animation: "titleReveal 0.9s cubic-bezier(.22,1,.36,1) 0.15s both",
  },
  titleMobile: {
    fontSize: "clamp(22px, 6vw, 30px)",
    maxWidth: "330px",
  },
  titleUnderline: {
    width: "118px",
    height: "4px",
    background: "linear-gradient(90deg, rgba(74,222,128,0) 0%, #86efac 30%, #7dd3fc 50%, #86efac 70%, rgba(125,211,252,0) 100%)",
    backgroundSize: "200% 100%",
    margin: "0 auto 12px",
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
    lineHeight: 1.58,
    maxWidth: "580px",
    marginBottom: "12px",
  },
  bodyMobile: {
    fontSize: "12px",
    lineHeight: 1.45,
    maxWidth: "330px",
    marginBottom: "8px",
  },
  sdgSlider: {
    display: "flex",
    gap: "22px",
    alignSelf: "stretch",
    width: "100%",
    maxWidth: "none",
    overflowX: "auto",
    scrollSnapType: "x mandatory",
    scrollPadding: "0 12px",
    WebkitOverflowScrolling: "touch",
    padding: "10px 12px 16px",
    marginTop: "2px",
    overscrollBehaviorX: "contain",
  },
  sdgSliderMobile: {
    alignSelf: "center",
    width: "min(100%, 300px)",
    maxWidth: "100%",
    gap: "18px",
    padding: "10px 10px 16px",
    scrollPadding: "0 10px",
  },
  sdgBox: {
    width: "calc((100% - 68px) / 3)",
    flex: "0 0 calc((100% - 68px) / 3)",
    minWidth: "240px",
    minHeight: "300px",
    borderRadius: "16px",
    background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
    border: "1px solid rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "8px",
    padding: "22px",
    scrollSnapAlign: "start",
    scrollSnapStop: "always",
    backdropFilter: "blur(18px) saturate(170%)",
    WebkitBackdropFilter: "blur(18px) saturate(170%)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.05)",
    cursor: "default",
    textAlign: "left",
    overflow: "hidden",
    position: "relative",
    transformOrigin: "center center",
    willChange: "transform",
    transition: "transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.22s ease",
  },
  sdgBoxWithImage: {
    paddingBottom: "104px",
  },
  sdgBoxMobile: {
    width: "280px",
    flex: "0 0 280px",
    minWidth: "280px",
    minHeight: "320px",
    padding: "20px",
  },
  sdgBoxHover: {
    transform: "scale(1.018)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 12px 32px rgba(0,0,0,0.05)",
    zIndex: 2,
  },
  sdgBoxImageExpanded: {
    background: "var(--sdg-expanded-color)",
    borderColor: "transparent",
    backdropFilter: "none",
    WebkitBackdropFilter: "none",
    boxShadow: "none",
  },
  sdgTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#000",
    margin: 0,
    lineHeight: 1.2,
    letterSpacing: "-0.2px",
    maxWidth: "100%",
    textAlign: "left",
  },
  sdgTitleMobile: {
    fontSize: "16px",
    maxWidth: "100%",
  },
  sdgText: {
    fontSize: "14px",
    color: "rgba(0, 0, 0, 0.8)",
    lineHeight: 1.7,
    margin: 0,
    maxWidth: "100%",
    textAlign: "left",
  },
  sdgTextMobile: {
    fontSize: "12px",
    lineHeight: 1.5,
  },
  sdgCardImage: {
    position: "absolute",
    left: "18px",
    bottom: "16px",
    width: "130px",
    height: "130px",
    objectFit: "cover",
    borderRadius: "24px",
    padding: 0,
    background: "transparent",
    border: "none",
    boxShadow: "none",
    cursor: "default",
    userSelect: "none",
    zIndex: 2,
    transition: "all 0.32s cubic-bezier(.22,1,.36,1)",
  },
  sdgCardImageMobile: {
    left: "16px",
    bottom: "14px",
    width: "112px",
    height: "112px",
    borderRadius: "22px",
  },
  sdgCardImageExpanded: {
    left: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    padding: 0,
    borderRadius: "16px",
    objectFit: "cover",
    opacity: 0,
    background: "transparent",
    border: "none",
    boxShadow: "none",
    cursor: "default",
    zIndex: 5,
  },
  expandedNumber: {
    position: "absolute",
    top: "16px",
    right: "18px",
    zIndex: 6,
    color: "rgba(255,255,255,0.22)",
    fontSize: "clamp(42px, 5vw, 60px)", // Made the font size smaller for website version
    fontWeight: 800,
    lineHeight: 0.9,
    letterSpacing: 0,
    pointerEvents: "none",
  },
  expandedContent: {
    position: "absolute", // Keep absolute positioning
    inset: "14px", // Reduced inset for more internal space
    zIndex: 6,
    display: "flex",
    flexDirection: "column",
    gap: "4px", // Reduced gap for tighter spacing
    color: "#fff",
    textAlign: "left",
    pointerEvents: "none",
  },
  expandedTitle: {
    margin: 0,
    fontSize: "clamp(16px, 1.8vw, 22px)", // Slightly reduced font size
    fontWeight: 800,
    lineHeight: 1,
    letterSpacing: 0,
  },
  expandedLine: {
    width: "58px",
    height: "2px",
    margin: "2px 0", // Reduced vertical margin
    borderRadius: "999px",
    background: "#ffffff",
    boxShadow: "0 0 8px rgba(255,255,255,0.3)",
  },
  expandedBlock: {
    display: "flex",
    flexDirection: "column", // Keep column direction
    gap: "0px", // Reduced gap for tighter spacing
  },
  expandedHeading: {
    margin: 0,
    fontSize: "11px",
    fontWeight: 800,
    lineHeight: 1.2,
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  },
  expandedText: {
    margin: 0,
    fontSize: "clamp(8px, 0.9vw, 10px)", // Slightly reduced font size
    fontWeight: 500,
    lineHeight: 1.35,
    color: "rgba(255,255,255,0.9)",
  },
  indicatorRow: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    width: "100%",
    margin: "0 auto",
    paddingBottom: "6px",
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "rgba(0, 0, 0, 0.2)",
    flex: "0 0 6px",
    transition: "background 0.25s ease, box-shadow 0.25s ease",
  },
  dotActive: {
    background: "#4ade80",
    boxShadow: "0 0 8px rgba(74, 222, 128, 0.55)",
  },
  circleColMobile: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "24px",
    padding: "0 16px",
  },
  circleMobile: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
    border: "1px solid rgba(0,0,0,0.05)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: 700,
    color: "#000",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.05)",
    flexShrink: 0,
  },
  timelineItemMobile: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    textAlign: "center",
  },
  timelineTextMobile: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  timelineHeadingMobile: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#000",
    margin: 0,
    letterSpacing: "-0.2px",
    lineHeight: 1.4,
  },
  timelineBodyMobile: {
    fontSize: "12px",
    color: "rgba(0, 0, 0, 0.8)",
    lineHeight: 1.5,
    margin: 0,
    textAlign: "center",
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
  },
  backBtnHov: {
    transform: "scale(1.035)",
  },
};

export default LearnMore;
