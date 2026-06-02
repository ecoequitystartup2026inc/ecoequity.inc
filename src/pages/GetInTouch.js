import React, { useState } from "react";

function GetInTouch({ setActiveNav }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [hoveredSocial, setHoveredSocial] = useState(null);

  return (
    <div style={styles.wrap}>
      <style>
        {`
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
            style={{
              ...styles.backBtn,
              ...(isHovered ? styles.backBtnHov : {}),
            }}
            onClick={() => setActiveNav && setActiveNav("Home")}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          > 
            ←
          </button>
        </div>
        <div style={styles.badge}>
          <span style={styles.badgeDot} />
          Contact Us
        </div>
      </div>
      <h1 style={styles.title}>
        Get in <span style={styles.accent}>Touch</span>
      </h1>
      <div style={styles.titleUnderline} />

      <p style={styles.body}>
        We'd love to hear from you! Reach out to us for any inquiries,
        partnerships, or support regarding our agricultural innovations.
      </p>

      <div
        style={{ ...styles.card, ...(isCardHovered ? styles.cardHov : {}) }}
        onMouseEnter={() => setIsCardHovered(true)}
        onMouseLeave={() => setIsCardHovered(false)}
      >
        <h3 style={styles.cardHeading}>Email</h3>
        <p style={styles.cardText}>hello@verdeversity.com</p>
        <h3 style={{ ...styles.cardHeading, marginTop: "16px" }}>Phone Number</h3>
        <p style={styles.cardText}>0927-427-9760</p>
        <h3 style={{ ...styles.cardHeading, marginTop: "16px" }}>Address</h3>
        <p style={styles.cardText}>Gov Pack Rd. Baguio City, <br />Benguet, 2600, Philippines</p>
      </div>

      {/* ── SOCIAL MEDIA LINKS ── */}
      <div style={styles.socialLinksContainer}>
        {[
          { name: "Facebook", url: "https://facebook.com/verdeversity", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
          { name: "Instagram", url: "https://instagram.com/verdeversity", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg> },
          { name: "X", url: "https://x.com/verdeversity", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
          { name: "Threads", url: "https://threads.net/verdeversity", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.002 0c-6.627 0-12 5.373-12 12s5.373 12 12 12c1.944 0 3.778-.464 5.4-1.278l-1.042-1.782a9.923 9.923 0 01-4.358 1.01c-5.514 0-10-4.486-10-10s4.486-10 10-10c5.514 0 10 4.486 10 10 0 1.957-.611 3.535-1.72 4.444-1.034.847-2.394 1.135-3.64.77-.962-.282-1.637-1.002-1.905-2.028-.27-.08-.553-.135-.853-.135-2.13 0-3.863-1.734-3.863-3.864s1.734-3.863 3.863-3.863c1.782 0 3.28 1.215 3.722 2.854 1.144.153 1.983.824 2.41 1.924.593 1.53.535 3.33-.163 4.8-.755 1.587-2.1 2.658-3.784 3.012-1.634.343-3.4-.047-4.838-1.066-1.577-1.116-2.45-2.88-2.45-4.965 0-4.632 3.768-8.4 8.4-8.4s8.4 3.768 8.4 8.4c0 3.82-2.553 7.042-6.042 8.037V21.4c3.967-1.063 6.942-4.683 6.942-8.987 0-5.523-4.477-10-10-10S2.002 6.477 2.002 12s4.477 10 10 10c2.14 0 4.14-.672 5.79-1.82l1.246 1.246C17.182 23.09 14.685 24 12.002 24zM12 8.136c-2.13 0-3.864 1.734-3.864 3.864s1.734 3.864 3.864 3.864c2.13 0 3.863-1.734 3.863-3.864s-1.733-3.864-3.863-3.864zm0 6c-1.178 0-2.136-.958-2.136-2.136s.958-2.136 2.136-2.136 2.136.958 2.136 2.136-.958 2.136-2.136 2.136z"/></svg> },
        ].map((social) => (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              ...styles.socialBtn,
              ...(hoveredSocial === social.name ? styles.socialBtnHov : {}),
            }}
            onMouseEnter={() => setHoveredSocial(social.name)}
            onMouseLeave={() => setHoveredSocial(null)}
          >
            <span aria-hidden="true" style={styles.glassInnerBlur} />
            <span style={styles.glassContentLayer}>{social.icon}</span>
          </a>
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
    maxWidth: "820px",
    margin: "0 auto",
    animation: "fadeInUp 0.75s cubic-bezier(.22,1,.36,1) both",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    position: "relative",
    marginBottom: "20px",
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
    fontWeight: 700,
    color: "#000",
    margin: "0 0 16px", // Adjusted margin to align with badge
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
  body: {
    color: "#000",
    fontSize: "clamp(14px, 1.5vw, 16px)",
    fontWeight: 400,
    lineHeight: 1.72,
    maxWidth: "580px",
    marginBottom: "24px",
  },
  card: {
    background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: "20px",
    padding: "32px 40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.05)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    width: "100%",
    maxWidth: "400px",
  },
  cardHov: {
    transform: "translateY(-6px) scale(1.03)",
    background: "linear-gradient(150deg, rgba(255,255,255,0.8), rgba(255,255,255,0.5))",
    border: "1px solid rgba(0,0,0,0.1)",
    boxShadow:
      "inset 0 1px 0 rgba(255,255,255,0.9), " +
      "0 12px 32px rgba(0,0,0,0.05), " +
      "0 0 0 0.5px rgba(0,0,0,0.05)",
    transition: "transform 0.22s cubic-bezier(.34,1.56,.64,1), background 0.18s ease, box-shadow 0.22s ease, border-color 0.18s ease",
  },
  cardHeading: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#000",
    margin: "0",
    letterSpacing: "-0.2px",
  },
  cardText: {
    fontSize: "14px",
    color: "rgba(0, 0, 0, 0.8)",
    margin: "0",
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
    transition: "background 0.16s ease, border-color 0.16s ease",
  },
  backBtnHov: {
    background: "rgba(255,255,255,0.8)",
    borderColor: "rgba(0,0,0,0.1)",
  },
  socialLinksContainer: {
    marginTop: "24px",
    display: "flex",
    gap: "10px",
    justifyContent: "center",
  },
  socialBtn: {
    position: "relative",
    overflow: "hidden",
    isolation: "isolate",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "9px",
    background: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(0,0,0,0.05)",
    color: "#000",
    cursor: "pointer",
    transition: "transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
    backdropFilter: "blur(18px) saturate(160%)",
    WebkitBackdropFilter: "blur(18px) saturate(160%)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.05)",
  },
  socialBtnHov: {
    transform: "scale(1.18)",
  },
  glassInnerBlur: {
    position: "absolute",
    inset: "0",
    zIndex: 0,
    pointerEvents: "none",
    borderRadius: "inherit",
    background:
      "radial-gradient(circle at 28% 18%, rgba(255,255,255,0.8), transparent 45%), " +
      "linear-gradient(145deg, rgba(255,255,255,0.6), rgba(255,255,255,0.2))",
    backdropFilter: "blur(34px) saturate(185%)",
    WebkitBackdropFilter: "blur(34px) saturate(185%)",
  },
  glassContentLayer: {
    position: "relative",
    zIndex: 1,
  },
};

export default GetInTouch;
