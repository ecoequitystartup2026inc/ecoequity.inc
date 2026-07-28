import React, { useState, useEffect } from "react";
import { GraduationCap, Handshake, ShoppingCart } from "lucide-react";

const team = [
  { name: "Name Surname", role: "Founder & Lead" },
  { name: "Name Surname", role: "Operations" },
  { name: "Name Surname", role: "Technology" },
  { name: "Name Surname", role: "Community" },
];

const highlights = [
  {
    Icon: GraduationCap,
    heading: "AI-Guided Education",
    text: "Personalized growing instruction tailored to each household's space, climate, and crops.",
  },
  {
    Icon: Handshake,
    heading: "Community Hub",
    text: "Real-world learning and connection between urban and traditional Filipino farmers.",
  },
  {
    Icon: ShoppingCart,
    heading: "Micro-Commerce Engine",
    text: "A simple marketplace for users to sell local produce and earn supplementary income.",
  },
];

function AboutUs() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < 768
  );
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredMember, setHoveredMember] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={{ ...styles.wrap, ...(isMobile ? styles.wrapMobile : {}) }}>
      <style>
        {`
          @keyframes shimmerLine {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          @keyframes textShimmer {
            0% { background-position: 0% center; }
            100% { background-position: 200% center; }
          }
          @keyframes aboutFadeUp {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .about-reveal {
            opacity: 0;
            animation: aboutFadeUp 0.8s cubic-bezier(.22,1,.36,1) forwards;
          }
          .about-heading {
            position: relative;
            display: inline-block;
            transition: letter-spacing 0.3s ease;
          }
          .about-heading::after {
            content: "";
            position: absolute;
            left: 0;
            bottom: -6px;
            width: 0;
            height: 2px;
            border-radius: 999px;
            background: linear-gradient(90deg, #4ade80, #7dd3fc);
            transition: width 0.45s cubic-bezier(.22,1,.36,1);
          }
          .about-heading:hover { letter-spacing: 0.2px; }
          .about-heading:hover::after { width: 100%; }
        `}
      </style>

      {/* ── Intro ───────────────────────────────── */}
      <div style={styles.headerBlock}>
        <div className="inner-blur-glass glass-hover-zoom-sm" style={styles.badge}>
          <span style={styles.badgeDot} />
          <span>Who We Are</span>
        </div>

        <h1 style={styles.title}>
          About <span style={styles.accent}>EcoEquity</span>
        </h1>
        <div style={styles.titleUnderline} />

        <p className="about-reveal" style={{ ...styles.lead, animationDelay: "0.15s" }}>
          A digital-first platform built to boost agricultural self-sufficiency in
          the Philippines — starting at the household and community level.
        </p>
      </div>

      {/* ── Business Concept ────────────────────── */}
      <section style={styles.section}>
        <h2 className="about-heading" style={styles.subtitle}>Business Concept</h2>
        <p className="about-reveal" style={{ ...styles.body, animationDelay: "0.2s" }}>
          EcoEquity is a digital-first, high-engagement platform designed to boost
          agricultural self-sufficiency in the Philippines by starting at the
          household and community level. It acts as the “Canvas for Green Skills”
          through a hybrid model that empowers citizens to grow their own food,
          reduce reliance on imports, foster a greener environment, and create
          supplementary income.
        </p>
        <p className="about-reveal" style={{ ...styles.body, animationDelay: "0.2s" }}>
          Rather than treating farming as a specialized profession reserved for
          a few, EcoEquity reframes it as an everyday skill that anyone can learn.
          We combine personalized AI guidance, a supportive community, and an
          accessible marketplace so that families in cities, towns, and provinces
          alike can confidently turn unused spaces — balconies, backyards, rooftops,
          and vacant lots — into productive, sustainable gardens.
        </p>

        <div style={{ ...styles.featureRow, ...(isMobile ? styles.featureRowMobile : {}) }}>
          {highlights.map((h, i) => (
            <div
              key={i}
              className="inner-blur-glass"
              style={{
                ...styles.featureCard,
                ...(hoveredCard === i ? styles.featureCardHov : {}),
              }}
              onMouseEnter={() => setHoveredCard(i)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <span style={styles.featureIcon}>
                <h.Icon size={22} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <h3 style={styles.featureHeading}>{h.heading}</h3>
              <p style={styles.featureText}>{h.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Our Story ───────────────────────────── */}
      <section style={styles.section}>
        <h2 className="about-heading" style={styles.subtitle}>Our Story</h2>
        <p className="about-reveal" style={{ ...styles.body, animationDelay: "0.2s" }}>
          EcoEquity was born from a simple observation: the Philippines imports a
          large share of the food it eats, yet millions of households have the
          space, time, and willingness to grow at least some of their own. What
          they often lack is reliable guidance, encouragement, and a way to make
          their effort pay off. We set out to close that gap with technology that
          meets people exactly where they are.
        </p>
        <p className="about-reveal" style={{ ...styles.body, animationDelay: "0.2s" }}>
          By blending modern tools with grassroots community knowledge, we are
          building a movement where growing food is approachable, rewarding, and
          shared. Every garden started, every lesson learned, and every harvest
          sold is a step toward a more resilient, food-secure nation — one
          household at a time.
        </p>
      </section>

      {/* ── Mission & Vision ────────────────────── */}
      <section style={styles.section}>
        <h2 className="about-heading" style={styles.subtitle}>Mission &amp; Vision</h2>
        <div style={{ ...styles.mvRow, ...(isMobile ? styles.mvRowMobile : {}) }}>
          <div className="inner-blur-glass" style={styles.mvCard}>
            <span style={styles.mvLabel}>Mission</span>
            <p className="about-reveal" style={{ ...styles.mvText, animationDelay: "0.2s" }}>
              To empower every household in the Philippines to achieve agricultural
              self-sufficiency through innovative digital tools and community-driven
              learning.
            </p>
          </div>
          <div className="inner-blur-glass" style={styles.mvCard}>
            <span style={styles.mvLabel}>Vision</span>
            <p className="about-reveal" style={{ ...styles.mvText, animationDelay: "0.2s" }}>
              A greener, more sustainable Philippines where every family has the
              skills and confidence to grow their own food.
            </p>
          </div>
        </div>
      </section>

      {/* ── Team ────────────────────────────────── */}
      <section style={{ ...styles.section, ...styles.teamSection }}>
        <div style={styles.divider} />

        <div className="inner-blur-glass glass-hover-zoom-sm" style={{ ...styles.badge, alignSelf: "center" }}>
          <span style={styles.badgeDot} />
          <span>The People</span>
        </div>

        <h2 style={{ ...styles.subtitle, textAlign: "center", alignSelf: "center" }}>
          Meet the <span style={styles.accent}>Team</span>
        </h2>
        <p style={{ ...styles.body, textAlignLast: "center", maxWidth: "560px", margin: "0 auto 8px" }}>
          EcoEquity is built by a passionate team dedicated to transforming
          agriculture in the Philippines through innovation and community-driven
          solutions.
        </p>

        <div style={{ ...styles.teamGrid, ...(isMobile ? styles.teamGridMobile : {}) }}>
          {team.map((member, i) => (
            <div
              key={i}
              className="inner-blur-glass"
              style={{
                ...styles.memberCard,
                ...(hoveredMember === i ? styles.memberCardHov : {}),
              }}
              onMouseEnter={() => setHoveredMember(i)}
              onMouseLeave={() => setHoveredMember(null)}
            >
              <div aria-hidden="true" style={styles.avatar}>
                {member.name.charAt(0)}
              </div>
              <h3 style={styles.memberName}>{member.name}</h3>
              <p style={styles.memberRole}>{member.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const styles = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    textAlign: "left",
    padding: "32px 20px 48px",
    maxWidth: "920px",
    margin: "0 auto",
    animation: "fadeInUp 0.75s cubic-bezier(.22,1,.36,1) both",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  wrapMobile: {
    padding: "24px 14px 40px",
  },
  headerBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
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
    fontSize: "clamp(32px, 4.5vw, 50px)",
    fontWeight: 300,
    color: "var(--text-primary)",
    margin: "0 0 16px",
    lineHeight: 1.15,
    letterSpacing: "-0.8px",
    textShadow: "0 4px 12px rgba(0,0,0,0.1)",
    animation: "titleReveal 0.9s cubic-bezier(.22,1,.36,1) 0.15s both",
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
  lead: {
    color: "var(--text-primary)",
    fontSize: "clamp(15px, 1.7vw, 18px)",
    fontWeight: 500,
    lineHeight: 1.6,
    maxWidth: "640px",
    margin: "0 auto 8px",
    opacity: 0.9,
  },
  section: {
    marginTop: "40px",
  },
  subtitle: {
    fontSize: "clamp(18px, 2.2vw, 26px)",
    fontWeight: 700,
    color: "var(--text-primary)",
    margin: "0 0 14px",
    lineHeight: 1.25,
    letterSpacing: "-0.4px",
  },
  body: {
    color: "var(--text-primary)",
    fontSize: "clamp(14px, 1.5vw, 16px)",
    fontWeight: 400,
    lineHeight: 1.72,
    marginBottom: "20px",
    textAlign: "justify",
    hyphens: "auto",
  },
  featureRow: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
    marginTop: "4px",
  },
  featureRowMobile: {
    flexDirection: "column",
  },
  featureCard: {
    flex: "1 1 220px",
    background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: "20px",
    padding: "22px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.05)",
    transition: "transform 0.25s cubic-bezier(.22,1,.36,1), box-shadow 0.25s ease",
  },
  featureCardHov: {
    transform: "translateY(-4px)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 16px 32px rgba(0,0,0,0.10)",
  },
  featureIcon: {
    width: "42px",
    height: "42px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
    color: "#15803d",
    background: "linear-gradient(150deg, rgba(134,239,172,0.45), rgba(125,211,252,0.3))",
    border: "1px solid rgba(74,222,128,0.22)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
    marginBottom: "2px",
  },
  featureHeading: {
    fontSize: "15px",
    fontWeight: 700,
    color: "var(--text-primary)",
    margin: 0,
    letterSpacing: "-0.2px",
  },
  featureText: {
    fontSize: "13.5px",
    color: "var(--text-primary)",
    opacity: 0.78,
    lineHeight: 1.6,
    margin: 0,
  },
  mvRow: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
  },
  mvRowMobile: {
    flexDirection: "column",
  },
  mvCard: {
    flex: "1 1 280px",
    background: "linear-gradient(150deg, rgba(255,255,255,0.72), rgba(240,253,244,0.45))",
    border: "1px solid rgba(74,222,128,0.18)",
    borderRadius: "20px",
    padding: "24px 22px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.05)",
  },
  mvLabel: {
    display: "inline-block",
    fontSize: "11px",
    fontWeight: 700,
    color: "#15803d",
    letterSpacing: "1px",
    textTransform: "uppercase",
    marginBottom: "10px",
  },
  mvText: {
    color: "var(--text-primary)",
    fontSize: "15px",
    lineHeight: 1.7,
    margin: 0,
  },
  teamSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  divider: {
    width: "100%",
    height: "1px",
    background:
      "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0) 100%)",
    margin: "8px 0 32px",
  },
  teamGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "18px",
    width: "100%",
    marginTop: "28px",
  },
  teamGridMobile: {
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "14px",
  },
  memberCard: {
    background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: "20px",
    padding: "26px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    textAlign: "center",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.05)",
    transition: "transform 0.25s cubic-bezier(.22,1,.36,1), box-shadow 0.25s ease",
  },
  memberCardHov: {
    transform: "translateY(-4px)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 16px 32px rgba(0,0,0,0.10)",
  },
  avatar: {
    width: "76px",
    height: "76px",
    flexShrink: 0,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
    fontWeight: 700,
    color: "#15803d",
    background: "linear-gradient(150deg, rgba(134,239,172,0.5), rgba(125,211,252,0.35))",
    border: "3px solid rgba(255,255,255,0.6)",
    boxShadow: "inset 0 1px 8px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)",
    marginBottom: "4px",
    textTransform: "uppercase",
  },
  memberName: {
    fontSize: "15px",
    fontWeight: 700,
    color: "var(--text-primary)",
    margin: 0,
    letterSpacing: "-0.2px",
    lineHeight: 1.3,
  },
  memberRole: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#15803d",
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "0.8px",
  },
};

export default AboutUs;
