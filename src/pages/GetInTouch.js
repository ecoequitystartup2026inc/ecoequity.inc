import React, { useState } from "react";

const CONTACT_MESSAGES_STORAGE_KEY = "ecoequity_contact_messages";

const CONTACT_INFO = [
  {
    label: "Email",
    value: "ecoequity.inc2026@gmail.com",
    href: "mailto:ecoequity.inc2026@gmail.com",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
    ),
  },
  {
    label: "Phone Number",
    value: "0927-427-9760",
    href: "tel:+639274279760",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
    ),
  },
  {
    label: "Address",
    value: "Gov Pack Rd. Baguio City, Benguet, 2600, Philippines",
    href: "https://maps.google.com/?q=Gov+Pack+Rd,+Baguio+City,+Benguet,+Philippines",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
    ),
  },
];

const SOCIAL_LINKS = [
  { name: "Facebook", url: "https://facebook.com/ecoequity", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
  { name: "Instagram", url: "https://instagram.com/ecoequity", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg> },
  { name: "X", url: "https://x.com/ecoequity", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
  { name: "Threads", url: "https://threads.net/ecoequity", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.002 0c-6.627 0-12 5.373-12 12s5.373 12 12 12c1.944 0 3.778-.464 5.4-1.278l-1.042-1.782a9.923 9.923 0 01-4.358 1.01c-5.514 0-10-4.486-10-10s4.486-10 10-10c5.514 0 10 4.486 10 10 0 1.957-.611 3.535-1.72 4.444-1.034.847-2.394 1.135-3.64.77-.962-.282-1.637-1.002-1.905-2.028-.27-.08-.553-.135-.853-.135-2.13 0-3.863-1.734-3.863-3.864s1.734-3.863 3.863-3.863c1.782 0 3.28 1.215 3.722 2.854 1.144.153 1.983.824 2.41 1.924.593 1.53.535 3.33-.163 4.8-.755 1.587-2.1 2.658-3.784 3.012-1.634.343-3.4-.047-4.838-1.066-1.577-1.116-2.45-2.88-2.45-4.965 0-4.632 3.768-8.4 8.4-8.4s8.4 3.768 8.4 8.4c0 3.82-2.553 7.042-6.042 8.037V21.4c3.967-1.063 6.942-4.683 6.942-8.987 0-5.523-4.477-10-10-10S2.002 6.477 2.002 12s4.477 10 10 10c2.14 0 4.14-.672 5.79-1.82l1.246 1.246C17.182 23.09 14.685 24 12.002 24zM12 8.136c-2.13 0-3.864 1.734-3.864 3.864s1.734 3.864 3.864 3.864c2.13 0 3.863-1.734 3.863-3.864s-1.733-3.864-3.863-3.864zm0 6c-1.178 0-2.136-.958-2.136-2.136s.958-2.136 2.136-2.136 2.136.958 2.136 2.136-.958 2.136-2.136 2.136z"/></svg> },
];

const CATEGORIES = [
  "General Inquiry",
  "Partnership",
  "Product Support",
  "Careers",
];

const MESSAGE_MAX = 800;

/* The FAQ that used to close this page now lives in the site footer
   (components/SiteFooter.js), where it reaches every visitor, not just the
   ones who made it to Contact. */

const EMPTY_FORM = { name: "", email: "", subject: "", message: "", category: CATEGORIES[0] };

function GetInTouch({ setActiveNav }) {
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredSocial, setHoveredSocial] = useState(null);
  const [hoveredInfo, setHoveredInfo] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Please enter your name.";
    if (!form.email.trim()) {
      next.email = "Please enter your email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = "Please enter a valid email address.";
    }
    if (!form.message.trim()) next.message = "Please enter a message.";
    return next;
  };

  const handleChange = (field) => (e) => {
    const value =
      field === "message" ? e.target.value.slice(0, MESSAGE_MAX) : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submitting) return;
    const next = validate();
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    const entry = {
      id: `MSG-${Date.now()}`,
      name: form.name.trim(),
      email: form.email.trim(),
      category: form.category,
      subject: form.subject.trim() || "(No subject)",
      message: form.message.trim(),
      date: new Date().toLocaleString(),
      status: "New",
    };
    setSubmitting(true);
    // Simulate a network round-trip so the button shows a loading state.
    setTimeout(() => {
      try {
        const existing = JSON.parse(
          localStorage.getItem(CONTACT_MESSAGES_STORAGE_KEY) || "[]"
        );
        localStorage.setItem(
          CONTACT_MESSAGES_STORAGE_KEY,
          JSON.stringify([entry, ...existing])
        );
      } catch (err) {
        // Non-fatal: still show success to the user.
      }
      setForm(EMPTY_FORM);
      setErrors({});
      setFocusedField(null);
      setBtnHovered(false);
      setSubmitting(false);
      setSubmitted(true);
    }, 900);
  };

  const inputStyle = (field) => ({
    ...styles.input,
    ...(focusedField === field ? styles.inputFocus : {}),
    ...(errors[field] ? styles.inputError : {}),
  });

  return (
    <div style={styles.wrap}>
      <style>
        {`
          @keyframes popIn {
            0% { opacity: 0; transform: scale(0.85); }
            100% { opacity: 1; transform: scale(1); }
          }
          .git-input::placeholder { color: rgba(0,0,0,0.4); }
          @keyframes gitSpin { to { transform: rotate(360deg); } }
          .git-spinner {
            width: 16px; height: 16px; border-radius: 50%;
            border: 2px solid rgba(255,255,255,0.4);
            border-top-color: #fff;
            animation: gitSpin 0.7s linear infinite;
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

      <p style={styles.body}>
        We'd love to hear from you! Reach out to us for any inquiries,
        partnerships, or support regarding our agricultural innovations.
      </p>

      <div style={styles.grid}>
        {/* ── CONTACT INFO COLUMN ── */}
        <div style={styles.infoCol}>
          {CONTACT_INFO.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              style={{
                ...styles.infoCard,
                ...(hoveredInfo === item.label ? styles.infoCardHov : {}),
              }}
              onMouseEnter={() => setHoveredInfo(item.label)}
              onMouseLeave={() => setHoveredInfo(null)}
            >
              <span style={styles.infoIcon}>{item.icon}</span>
              <span style={styles.infoTextWrap}>
                <span style={styles.infoLabel}>{item.label}</span>
                <span style={styles.infoValue}>{item.value}</span>
              </span>
            </a>
          ))}

          <div style={styles.socialLinksContainer}>
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                style={{
                  ...styles.socialBtn,
                  ...(hoveredSocial === social.name ? styles.socialBtnHov : {}),
                }}
                onMouseEnter={() => setHoveredSocial(social.name)}
                onMouseLeave={() => setHoveredSocial(null)}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* ── CONTACT FORM COLUMN ── */}
        <div style={styles.formCard}>
          {submitted ? (
            <div style={styles.successWrap}>
              <div style={styles.successIcon}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>
              </div>
              <h3 style={styles.successTitle}>Message sent!</h3>
              <p style={styles.successText}>
                Thanks for reaching out. Our team will get back to you within
                1–2 business days.
              </p>
              <button
                type="button"
                style={{
                  ...styles.submitBtn,
                  ...(btnHovered ? styles.submitBtnHov : {}),
                  width: "auto",
                  padding: "12px 28px",
                }}
                onClick={() => {
                  setSubmitted(false);
                  setBtnHovered(false);
                }}
                onMouseEnter={() => setBtnHovered(true)}
                onMouseLeave={() => setBtnHovered(false)}
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate style={styles.form}>
              <h3 style={styles.formHeading}>Send us a message</h3>

              <div style={styles.field}>
                <label style={styles.label}>What can we help with?</label>
                <div style={styles.pillRow}>
                  {CATEGORIES.map((cat) => {
                    const active = form.category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, category: cat }))}
                        style={{
                          ...styles.pill,
                          ...(active ? styles.pillActive : {}),
                        }}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={styles.fieldRow}>
                <div style={styles.field}>
                  <label style={styles.label} htmlFor="git-name">
                    Name<span style={styles.req}>*</span>
                  </label>
                  <input
                    id="git-name"
                    className="git-input"
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={handleChange("name")}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    style={inputStyle("name")}
                  />
                  {errors.name && <span style={styles.errorText}>{errors.name}</span>}
                </div>
                <div style={styles.field}>
                  <label style={styles.label} htmlFor="git-email">
                    Email<span style={styles.req}>*</span>
                  </label>
                  <input
                    id="git-email"
                    className="git-input"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange("email")}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    style={inputStyle("email")}
                  />
                  {errors.email && <span style={styles.errorText}>{errors.email}</span>}
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label} htmlFor="git-subject">
                  Subject
                </label>
                <input
                  id="git-subject"
                  className="git-input"
                  type="text"
                  placeholder="What is this about?"
                  value={form.subject}
                  onChange={handleChange("subject")}
                  onFocus={() => setFocusedField("subject")}
                  onBlur={() => setFocusedField(null)}
                  style={inputStyle("subject")}
                />
              </div>

              <div style={styles.field}>
                <div style={styles.labelRow}>
                  <label style={styles.label} htmlFor="git-message">
                    Message<span style={styles.req}>*</span>
                  </label>
                  <span
                    style={{
                      ...styles.charCount,
                      ...(form.message.length >= MESSAGE_MAX ? styles.charCountMax : {}),
                    }}
                  >
                    {form.message.length}/{MESSAGE_MAX}
                  </span>
                </div>
                <textarea
                  id="git-message"
                  className="git-input"
                  placeholder="Tell us how we can help..."
                  rows={5}
                  value={form.message}
                  onChange={handleChange("message")}
                  onFocus={() => setFocusedField("message")}
                  onBlur={() => setFocusedField(null)}
                  style={{ ...inputStyle("message"), resize: "vertical", minHeight: "110px" }}
                />
                {errors.message && <span style={styles.errorText}>{errors.message}</span>}
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  ...styles.submitBtn,
                  ...(btnHovered && !submitting ? styles.submitBtnHov : {}),
                  ...(submitting ? styles.submitBtnLoading : {}),
                }}
                onMouseEnter={() => setBtnHovered(true)}
                onMouseLeave={() => setBtnHovered(false)}
              >
                {submitting ? (
                  <span style={styles.btnLoadingInner}>
                    <span className="git-spinner" />
                    Sending...
                  </span>
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
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
    padding: "32px 16px 24px",
    maxWidth: "980px",
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
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(0,0,0,0.05)",
    color: "var(--eco-c13)",
    fontSize: "20px",
    fontWeight: 600,
    lineHeight: 1,
    cursor: "pointer",
    fontFamily: "inherit",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.05)",
    backdropFilter: "blur(18px) saturate(160%)",
    WebkitBackdropFilter: "blur(18px) saturate(160%)",
    transition: "transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease",
  },
  backBtnHov: {
    transform: "scale(1.08)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 8px 18px rgba(0,0,0,0.1)",
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
  accent: {
    background: "linear-gradient(90deg, var(--eco-c6), var(--eco-c5))",
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
    marginBottom: "28px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "18px",
    width: "100%",
    textAlign: "left",
    alignItems: "start",
  },
  infoCol: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  infoCard: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    textDecoration: "none",
    background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: "16px",
    padding: "16px 18px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.05)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    transition: "transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.22s ease, border-color 0.18s ease",
  },
  infoCardHov: {
    transform: "translateY(-4px)",
    borderColor: "rgba(0,0,0,0.1)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 12px 30px rgba(0,0,0,0.08)",
  },
  infoIcon: {
    flexShrink: 0,
    width: "42px",
    height: "42px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
    background: "linear-gradient(150deg, rgba(var(--eco-c6-rgb), 0.22), rgba(var(--eco-c5-rgb), 0.18))",
    color: "var(--eco-c13)",
    border: "1px solid rgba(var(--eco-c6-rgb), 0.25)",
  },
  infoTextWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    minWidth: 0,
  },
  infoLabel: {
    fontSize: "11px",
    fontWeight: 700,
    color: "var(--eco-c13)",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: "14px",
    fontWeight: 500,
    color: "#000",
    lineHeight: 1.4,
  },
  socialLinksContainer: {
    marginTop: "6px",
    display: "flex",
    gap: "10px",
    justifyContent: "flex-start",
  },
  socialBtn: {
    position: "relative",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: "none",
    color: "#000",
    cursor: "pointer",
    transition: "transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  socialBtnHov: {
    transform: "scale(1.18)",
  },
  formCard: {
    background: "linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: "20px",
    padding: "26px 24px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.05)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  formHeading: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#000",
    margin: "0 0 2px",
    letterSpacing: "-0.3px",
  },
  fieldRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: "14px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "12px",
    fontWeight: 600,
    color: "rgba(0,0,0,0.7)",
    letterSpacing: "0.2px",
  },
  req: {
    color: "var(--eco-c13)",
    marginLeft: "3px",
  },
  labelRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  charCount: {
    fontSize: "11px",
    fontWeight: 500,
    color: "rgba(0,0,0,0.4)",
  },
  charCountMax: {
    color: "var(--eco-c13)",
    fontWeight: 600,
  },
  pillRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  pill: {
    padding: "7px 14px",
    borderRadius: "999px",
    border: "1px solid rgba(0,0,0,0.08)",
    background: "rgba(255,255,255,0.5)",
    color: "rgba(0,0,0,0.65)",
    fontSize: "12.5px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.16s ease",
  },
  pillActive: {
    background: "linear-gradient(135deg, var(--eco-c7), var(--eco-c6))",
    borderColor: "transparent",
    color: "#fff",
    boxShadow: "0 4px 12px rgba(var(--eco-c7-rgb), 0.3)",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 14px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.55)",
    border: "1px solid rgba(0,0,0,0.08)",
    fontSize: "14px",
    color: "#000",
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 0.16s ease, box-shadow 0.16s ease, background 0.16s ease",
  },
  inputFocus: {
    borderColor: "var(--eco-c6)",
    background: "rgba(255,255,255,0.75)",
    boxShadow: "0 0 0 3px rgba(var(--eco-c6-rgb), 0.18)",
  },
  inputError: {
    borderColor: "var(--eco-c7)",
    boxShadow: "0 0 0 3px rgba(var(--eco-c7-rgb), 0.12)",
  },
  errorText: {
    fontSize: "11.5px",
    color: "var(--eco-c13)",
    fontWeight: 500,
  },
  submitBtn: {
    marginTop: "4px",
    width: "100%",
    padding: "13px 20px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, var(--eco-c7), var(--eco-c6))",
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    letterSpacing: "0.2px",
    cursor: "pointer",
    fontFamily: "inherit",
    boxShadow: "0 8px 20px rgba(var(--eco-c7-rgb), 0.35), inset 0 1px 0 rgba(255,255,255,0.4)",
    transition: "transform 0.18s cubic-bezier(.34,1.56,.64,1), box-shadow 0.18s ease, filter 0.18s ease",
  },
  submitBtnHov: {
    transform: "translateY(-2px)",
    filter: "brightness(1.05)",
    boxShadow: "0 12px 26px rgba(var(--eco-c7-rgb), 0.45), inset 0 1px 0 rgba(255,255,255,0.5)",
  },
  submitBtnLoading: {
    cursor: "not-allowed",
    filter: "saturate(0.85)",
    opacity: 0.9,
  },
  btnLoadingInner: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "9px",
  },
  successWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "12px",
    padding: "24px 8px",
    animation: "popIn 0.5s cubic-bezier(.34,1.56,.64,1) both",
  },
  successIcon: {
    width: "60px",
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    background: "linear-gradient(135deg, var(--eco-c7), var(--eco-c6))",
    color: "#fff",
    boxShadow: "0 10px 24px rgba(var(--eco-c7-rgb), 0.4)",
  },
  successTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#000",
    margin: 0,
  },
  successText: {
    fontSize: "14px",
    color: "rgba(0,0,0,0.7)",
    lineHeight: 1.6,
    maxWidth: "320px",
    margin: 0,
  },
};

export default GetInTouch;
