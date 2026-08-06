import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { X, Star } from "lucide-react";

// Site-experience feedback pop-up. This rates the EcoEquity app itself (how the
// site felt to use) — product reviews live in QuickViewModal and are separate.
//
// It has no trigger button: App shows it once the visitor has actively browsed
// for FEEDBACK_PROMPT_AFTER_MS (see useActiveBrowseTimer). Because it arrives
// uninvited it is kept to a single small horizontal bar docked just above the
// AI chat / support FABs — no scrim, no panel, nothing to unfold. Tapping a
// star is the whole interaction: it submits on the spot, says thanks in the
// same bar, and takes itself away. Anyone who does not want to answer can
// ignore it, and it is 56px of the corner until they do.

const RATING_LABELS = {
  1: "Very poor",
  2: "Poor",
  3: "Okay",
  4: "Good",
  5: "Excellent",
};

/** How long the thanks stays up before the bar removes itself. */
const THANKS_MS = 2200;

function SiteFeedbackWidget({ isOpen, onClose, isMobile, onSubmit, currentPage, userName }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // Start every visit with a clean bar.
  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setHoverRating(0);
      setSubmitted(false);
    }
  }, [isOpen]);

  // Escape closes it. Nobody asked for this pop-up, so the cheapest way out
  // stays available throughout.
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  // The thanks is an acknowledgement, not another thing to dismiss.
  useEffect(() => {
    if (!submitted) return undefined;
    const id = setTimeout(onClose, THANKS_MS);
    return () => clearTimeout(id);
  }, [submitted, onClose]);

  if (!isOpen) return null;

  /* One tap is the whole form: picking a star submits. There is no second step
     to abandon, which is why this can be worth showing uninvited at all. The
     empty topics/comment keep the stored shape the same as before. */
  const handleRate = (value) => {
    if (submitted) return;
    setRating(value);
    if (onSubmit) {
      onSubmit({
        id: `FB-${Date.now()}`,
        rating: value,
        topics: [],
        comment: "",
        page: currentPage || "Home",
        user: userName || "Guest",
        date: new Date().toISOString(),
      });
    }
    setSubmitted(true);
  };

  const shown = hoverRating || rating;
  const starSize = isMobile ? 20 : 24;
  /* Phone copy is shorter because the bar is one line at every width: on a
     narrow screen the long version ellipsised to "How's your experienc…",
     which is worse than asking the question in fewer words. Below ~360px even
     the short version clips, so there it shrinks again — the width is read at
     open rather than watched, which is enough: the only way to cross this
     boundary mid-prompt is a rotation, and that re-renders anyway. */
  const narrow = isMobile && typeof window !== "undefined" && window.innerWidth < 360;
  const label = submitted
    ? (isMobile ? "Thanks for rating!" : `Thanks — noted as “${RATING_LABELS[rating]}”`)
    : (narrow ? "Rate us" : isMobile ? "Rate your experience" : "How's your experience?");

  return ReactDOM.createPortal(
    <div role="dialog" aria-labelledby="site-feedback-title" style={{ ...styles.bar, ...(isMobile ? styles.barMobile : {}) }}>
      <span id="site-feedback-title" style={{ ...styles.title, ...(isMobile ? styles.titleMobile : {}) }}>
        {label}
      </span>

      <div style={styles.starRow} onMouseLeave={() => setHoverRating(0)}>
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            aria-label={`Rate ${s} star${s === 1 ? "" : "s"}`}
            aria-pressed={rating === s}
            disabled={submitted}
            onClick={() => handleRate(s)}
            onMouseEnter={() => !submitted && setHoverRating(s)}
            style={{
              ...styles.starBtn,
              cursor: submitted ? "default" : "pointer",
              transform: shown >= s ? "scale(1.12)" : "scale(1)",
            }}
          >
            <Star
              size={starSize}
              fill={shown >= s ? "var(--eco-c6)" : "none"}
              color={shown >= s ? "var(--eco-c6)" : "rgba(var(--eco-c19-rgb), 0.28)"}
              strokeWidth={2}
            />
          </button>
        ))}
      </div>

      <button
        type="button"
        aria-label="Close feedback"
        style={{ ...styles.closeBtn, ...(isMobile ? styles.closeBtnMobile : {}) }}
        onClick={onClose}
      >
        <X size={14} color="var(--eco-c19)" strokeWidth={2.6} />
      </button>
    </div>,
    document.body
  );
}

const styles = {
  /* Docked just above the FAB row (48px tall, 48px off the viewport floor), so
     it reads as belonging to the chat / support cluster rather than as chrome
     that appeared from nowhere. One line, sized to its contents rather than to
     a grid — anything wider would start to feel like a panel. zIndex clears the
     cluster's 2100 but stays under the modal tiers, so a real modal covers it. */
  bar: { position: "fixed", right: "28px", bottom: "112px", zIndex: 2200, maxWidth: "calc(100vw - 56px)", display: "flex", alignItems: "center", gap: "12px", padding: "9px 10px 9px 16px", background: "linear-gradient(150deg, rgba(255,255,255,0.97), rgba(var(--eco-c0-rgb), 0.95))", border: "1px solid rgba(255,255,255,0.7)", borderRadius: "999px", boxShadow: "0 16px 36px rgba(var(--eco-c19-rgb), 0.18)", boxSizing: "border-box", animation: "fadeInUp 0.28s ease" },
  /* Phones: hugged into the gutter and lifted clear of the tab bar and the FAB
     row above it. Right-anchored only — a full-width bar on a phone is a
     banner, and this is meant to be ignorable. */
  barMobile: { right: "calc(var(--mobile-gutter) + var(--safe-right))", bottom: "calc(var(--bottom-nav-space) + 74px)", maxWidth: "calc(100vw - 2 * var(--mobile-gutter) - var(--safe-left) - var(--safe-right))", gap: "8px", padding: "8px 8px 8px 14px" },
  /* min-width 0 lets the label ellipsis rather than push the stars off a
     narrow phone. */
  title: { flex: 1, minWidth: 0, fontSize: "13.5px", fontWeight: 800, color: "var(--eco-c19)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  titleMobile: { fontSize: "12.5px" },
  starRow: { display: "flex", alignItems: "center", gap: "1px", flexShrink: 0 },
  /* The padding is the tap target, not decoration — a 20px glyph alone is far
     under the touch minimum, and this is the only control that matters here. */
  starBtn: { background: "transparent", border: "none", padding: "5px 4px", lineHeight: 0, transition: "transform 0.15s ease" },
  closeBtn: { flexShrink: 0, width: "28px", height: "28px", borderRadius: "50%", border: "none", background: "rgba(var(--eco-c19-rgb), 0.06)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  /* 34px on a phone: this is the only way out, and 28 is under the touch
     minimum on both iOS and Android. */
  closeBtnMobile: { width: "34px", height: "34px" },
};

export default SiteFeedbackWidget;
