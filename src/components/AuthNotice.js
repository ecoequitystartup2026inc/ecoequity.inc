import React from "react";

// ============================================================================
// AUTH NOTICE — the banner above the Login / Sign Up forms.
// One component for every message the two forms raise: a missing field, a
// password that didn't match, an email that's already registered, "you're
// already signed in". Takes the { text, type, action } object the form puts in
// state and gives it an icon, a colour, an optional next-step button, and a
// dismiss control.
//
// role="alert" + aria-live make screen readers announce it, which matters here
// because the message appears far from the button that triggered it.
// ============================================================================

const TONES = {
  success: {
    color: "var(--eco-c13)",
    background: "rgba(var(--eco-c9-rgb), 0.1)",
    border: "1px solid rgba(var(--eco-c9-rgb), 0.2)",
    icon: <polyline points="20 6 9 17 4 12" />,
  },
  error: {
    color: "var(--eco-c13)",
    background: "rgba(var(--eco-c9-rgb), 0.08)",
    border: "1px solid rgba(var(--eco-c9-rgb), 0.15)",
    icon: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>,
  },
  warning: {
    color: "var(--eco-c13)",
    background: "rgba(var(--eco-c7-rgb), 0.1)",
    border: "1px solid rgba(var(--eco-c7-rgb), 0.25)",
    icon: <><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
  },
  info: {
    color: "var(--eco-c13)",
    background: "rgba(var(--eco-c9-rgb), 0.08)",
    border: "1px solid rgba(var(--eco-c9-rgb), 0.18)",
    icon: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></>,
  },
};

// notice: { text, type: success|error|warning|info, action?: { label, onClick } }
function AuthNotice({ notice, onDismiss }) {
  if (!notice?.text) return null;
  const tone = TONES[notice.type] || TONES.info;

  return (
    <div
      role="alert"
      aria-live={notice.type === "error" ? "assertive" : "polite"}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        padding: "12px 14px",
        borderRadius: "12px",
        marginBottom: "20px",
        fontSize: "13px",
        fontWeight: 600,
        textAlign: "left",
        lineHeight: 1.45,
        boxSizing: "border-box",
        animation: "fadeIn 0.3s ease",
        background: tone.background,
        border: tone.border,
        color: tone.color,
      }}
    >
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ flexShrink: 0, marginTop: "1px" }}
      >
        {tone.icon}
      </svg>

      <div style={{ flex: 1, minWidth: 0 }}>
        <span>{notice.text}</span>
        {notice.action && (
          <button
            type="button"
            onClick={notice.action.onClick}
            style={{
              display: "block",
              marginTop: "6px",
              padding: 0,
              background: "transparent",
              border: "none",
              color: "inherit",
              font: "inherit",
              fontWeight: 800,
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            {notice.action.label}
          </button>
        )}
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss message"
          style={{
            flexShrink: 0,
            width: "20px",
            height: "20px",
            lineHeight: "18px",
            padding: 0,
            borderRadius: "50%",
            border: "none",
            background: "transparent",
            color: "inherit",
            opacity: 0.6,
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          &times;
        </button>
      )}
    </div>
  );
}

export default AuthNotice;
