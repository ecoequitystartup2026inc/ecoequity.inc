import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { X, Star, PartyPopper } from "lucide-react";

// Site-experience feedback panel. This rates the EcoEquity app itself (how the
// site felt to use) — product reviews live in QuickViewModal and are separate.
// Anchored to the right edge above the support FAB cluster, matching AIChatInterface.

const RATING_LABELS = {
  1: "Very poor",
  2: "Poor",
  3: "Okay",
  4: "Good",
  5: "Excellent",
};

const TOPICS = ["Ease of use", "Design", "Speed", "Content", "Checkout", "Support"];

function SiteFeedbackWidget({ isOpen, onClose, isMobile, onSubmit, currentPage, userName }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [topics, setTopics] = useState([]);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Start every visit with a clean form.
  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setHoverRating(0);
      setTopics([]);
      setComment("");
      setSubmitted(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleTopic = (t) =>
    setTopics((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const handleSubmit = () => {
    if (!rating) return;
    if (onSubmit) {
      onSubmit({
        id: `FB-${Date.now()}`,
        rating,
        topics,
        comment: comment.trim(),
        page: currentPage || "Home",
        user: userName || "Guest",
        date: new Date().toISOString(),
      });
    }
    setSubmitted(true);
  };

  const shown = hoverRating || rating;

  return ReactDOM.createPortal(
    <div style={{ ...styles.panel, ...(isMobile ? styles.panelMobile : {}) }}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.headerTitle}>How's your experience?</h3>
          <p style={styles.headerSub}>Tell us how EcoEquity feels to use.</p>
        </div>
        <button type="button" aria-label="Close feedback" style={styles.closeBtn} onClick={onClose}>
          <X size={16} color="#062018" strokeWidth={2.6} />
        </button>
      </div>

      {submitted ? (
        <div style={styles.thanks}>
          <PartyPopper size={30} color="#16a34a" />
          <h4 style={styles.thanksTitle}>Thanks for the feedback!</h4>
          <div style={styles.thanksStars}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={16} fill={s <= rating ? "#fbbf24" : "none"} color={s <= rating ? "#fbbf24" : "rgba(0,0,0,0.2)"} strokeWidth={2} />
            ))}
          </div>
          <p style={styles.thanksText}>Your rating helps us improve the experience for every gardener.</p>
          <button type="button" style={styles.submitBtn} onClick={onClose}>Done</button>
        </div>
      ) : (
        <div style={styles.body}>
          <span style={styles.label}>Tap a star to rate</span>
          <div style={styles.starRow} onMouseLeave={() => setHoverRating(0)}>
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                aria-label={`Rate ${s} star${s === 1 ? "" : "s"}`}
                aria-pressed={rating === s}
                onClick={() => setRating(s)}
                onMouseEnter={() => setHoverRating(s)}
                style={{ ...styles.starBtn, transform: shown >= s ? "scale(1.12)" : "scale(1)" }}
              >
                <Star
                  size={30}
                  fill={shown >= s ? "#fbbf24" : "none"}
                  color={shown >= s ? "#fbbf24" : "rgba(0,0,0,0.25)"}
                  strokeWidth={2}
                />
              </button>
            ))}
          </div>
          <span style={{ ...styles.ratingLabel, opacity: shown ? 1 : 0 }}>
            {RATING_LABELS[shown] || " "}
          </span>

          <span style={styles.label}>What stood out? (optional)</span>
          <div style={styles.topicRow}>
            {TOPICS.map((t) => {
              const on = topics.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleTopic(t)}
                  style={{ ...styles.topicChip, ...(on ? styles.topicChipOn : {}) }}
                >
                  {t}
                </button>
              );
            })}
          </div>

          <div style={{ position: "relative" }}>
            <textarea
              maxLength={500}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Anything we could do better?"
              style={styles.textarea}
            />
            <span style={styles.counter}>{comment.length}/500</span>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!rating}
            style={{ ...styles.submitBtn, ...(rating ? {} : styles.submitBtnDisabled) }}
          >
            {rating ? "Send Feedback" : "Select a rating first"}
          </button>
        </div>
      )}
    </div>,
    document.body
  );
}

const styles = {
  panel: { position: "fixed", right: "28px", bottom: "112px", zIndex: 2200, width: "340px", maxHeight: "min(78vh, 620px)", display: "flex", flexDirection: "column", overflowY: "auto", background: "linear-gradient(150deg, rgba(255,255,255,0.97), rgba(240,253,244,0.95))", border: "1px solid rgba(255,255,255,0.7)", borderRadius: "20px", boxShadow: "0 24px 50px rgba(6,32,24,0.22)", backdropFilter: "blur(20px) saturate(170%)", WebkitBackdropFilter: "blur(20px) saturate(170%)", animation: "scaleUp 0.25s ease" },
  panelMobile: { right: "clamp(12px, 4vw, 20px)", left: "clamp(12px, 4vw, 20px)", width: "auto", bottom: "calc(clamp(16px, 3dvh, 24px) + 152px)", maxHeight: "70dvh" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", padding: "16px 16px 10px" },
  headerTitle: { margin: 0, fontSize: "15px", fontWeight: 850, color: "#062018" },
  headerSub: { margin: "3px 0 0", fontSize: "12px", color: "rgba(6,32,24,0.6)" },
  closeBtn: { flexShrink: 0, width: "28px", height: "28px", borderRadius: "50%", border: "none", background: "rgba(6,32,24,0.06)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  body: { display: "flex", flexDirection: "column", padding: "0 16px 16px" },
  label: { fontSize: "11.5px", fontWeight: 800, letterSpacing: "0.4px", textTransform: "uppercase", color: "rgba(6,32,24,0.45)", marginBottom: "8px" },
  starRow: { display: "flex", gap: "4px", justifyContent: "center", marginBottom: "2px" },
  starBtn: { background: "transparent", border: "none", padding: "2px", cursor: "pointer", lineHeight: 0, transition: "transform 0.15s ease" },
  ratingLabel: { display: "block", textAlign: "center", fontSize: "12.5px", fontWeight: 800, color: "#b45309", minHeight: "18px", marginBottom: "14px", transition: "opacity 0.15s ease" },
  topicRow: { display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" },
  topicChip: { padding: "6px 11px", borderRadius: "999px", border: "1px solid rgba(6,32,24,0.12)", background: "rgba(255,255,255,0.8)", color: "rgba(6,32,24,0.7)", fontSize: "12px", fontWeight: 700, fontFamily: "inherit", cursor: "pointer", transition: "all 0.18s ease" },
  topicChipOn: { background: "rgba(22,163,74,0.12)", borderColor: "rgba(22,163,74,0.35)", color: "#15803d" },
  textarea: { width: "100%", height: "76px", padding: "11px 12px 24px", borderRadius: "12px", border: "1px solid rgba(6,32,24,0.1)", background: "rgba(255,255,255,0.85)", fontSize: "13px", fontFamily: "inherit", color: "#062018", resize: "none", outline: "none", boxSizing: "border-box", marginBottom: "14px" },
  counter: { position: "absolute", bottom: "22px", right: "12px", fontSize: "11px", fontWeight: 600, color: "rgba(6,32,24,0.4)" },
  submitBtn: { width: "100%", padding: "12px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.45)", background: "linear-gradient(135deg, rgba(134,239,172,0.96), rgba(125,211,252,0.96))", color: "#062018", fontSize: "13px", fontWeight: 850, fontFamily: "inherit", cursor: "pointer", boxShadow: "0 10px 24px rgba(34,197,94,0.22)" },
  submitBtnDisabled: { opacity: 0.55, cursor: "not-allowed", boxShadow: "none" },
  thanks: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "8px", padding: "8px 16px 20px" },
  thanksTitle: { margin: 0, fontSize: "15px", fontWeight: 850, color: "#15803d" },
  thanksStars: { display: "flex", gap: "3px" },
  thanksText: { margin: "0 0 6px", fontSize: "12.5px", color: "rgba(6,32,24,0.6)", lineHeight: 1.5 },
};

export default SiteFeedbackWidget;
