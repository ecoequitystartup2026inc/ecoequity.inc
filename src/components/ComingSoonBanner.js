import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { FaTimes, FaSeedling } from "react-icons/fa";
import { MODAL_CLOSE_BTN, MODAL_LAYER, modalOverlay, modalPanel } from "../styles/modal";
import { isMobileViewport } from "../mobile";

/**
 * Announcement overlay that pops up once when a page mounts.
 * The X button runs `onClose` when given (host pages use it to navigate back);
 * the backdrop and Escape always just dismiss so the section stays browsable.
 *
 * A host that mounts this conditionally (rather than once per page) must pass
 * `onDismiss` so it can clear its own "is showing" flag when the backdrop or
 * Escape closes the card — otherwise its flag stays true and the banner cannot
 * be reopened. `closeLabel` names where the X leads, for screen readers.
 */
function ComingSoonBanner({
  title = "Coming Soon",
  message = "This section is still being planted. Feel free to look around — full functionality is on the way.",
  onClose,
  onDismiss,
  closeLabel,
}) {
  const [open, setOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(isMobileViewport);

  useEffect(() => {
    // orientationchange fires before resize on iOS, so listen for both.
    const handleResize = () => setIsMobile(isMobileViewport());
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  const dismiss = () => {
    setOpen(false);
    if (onDismiss) onDismiss();
  };

  // Note: body scroll lock is deliberately left alone — host pages own
  // document.body.style.overflow for their own modals and would clobber it.
  useEffect(() => {
    if (!open) return undefined;
    const handleKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        if (onDismiss) onDismiss();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onDismiss]);

  if (!open) return null;

  return ReactDOM.createPortal(
    <div style={styles.overlay} onClick={dismiss}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ ...styles.card, ...(isMobile ? styles.cardMobile : {}) }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          style={styles.closeBtn}
          aria-label={closeLabel || (onClose ? "Go back to Product & Services" : "Close announcement")}
          onClick={() => (onClose ? onClose() : dismiss())}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.05)")}
        >
          <FaTimes />
        </button>

        <div style={styles.iconCircle}>
          <FaSeedling size={26} color="var(--eco-c11)" />
        </div>

        <h2 style={styles.title}>{title}</h2>
        <p style={styles.message}>{message}</p>
      </div>
    </div>,
    document.body
  );
}

const styles = {
  overlay: modalOverlay(MODAL_LAYER.top),
  card: modalPanel({
    width: "100%",
    maxWidth: "440px",
    padding: "36px 32px 32px",
    textAlign: "center",
    /* Never taller than the scrim's content box, so the card cannot be
       clipped top-and-bottom on a short viewport. */
    maxHeight: "100%",
    overflowY: "auto",
  }),
  /* Phones: a tighter gutter, and enough head room that the 44px close
     button clears the icon rather than crowding it. */
  cardMobile: {
    padding: "56px 20px 26px",
    borderRadius: "20px",
  },
  closeBtn: MODAL_CLOSE_BTN,
  iconCircle: {
    width: "clamp(54px, 16vw, 64px)",
    height: "clamp(54px, 16vw, 64px)",
    borderRadius: "50%",
    margin: "0 auto 16px",
    background: "linear-gradient(135deg, var(--eco-c3), var(--eco-c4))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 8px 20px rgba(var(--eco-c9-rgb), 0.18)",
  },
  /* Scales with width, not height — a fixed 26px pushed the heading onto
     three lines on a 320px screen. */
  title: {
    margin: "0 0 10px",
    fontSize: "clamp(20px, 5.6vw, 26px)",
    lineHeight: 1.25,
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "-0.02em",
    overflowWrap: "break-word",
  },
  message: {
    margin: 0,
    fontSize: "clamp(14px, 3.8vw, 15px)",
    lineHeight: 1.6,
    color: "rgba(15, 23, 42, 0.7)",
  },
};

export default ComingSoonBanner;
