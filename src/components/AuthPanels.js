import React from "react";
import { Eye, EyeOff, Lock, Mail, User as UserIcon, ShieldCheck } from "lucide-react";
import AuthNotice from "./AuthNotice";
import { PASSWORD_MIN_LENGTH } from "../data/auth";
import { T, SplitFrame, ShowcasePanel, BrandMark, PillField, PillButton, DotRule } from "./SplitAesthetic";

// ============================================================================
// AUTH PANELS — Login and Register, as the two-panel composition described in
// components/SplitAesthetic.js: a paper column holding the brand mark, an
// avatar medallion and the form, beside a full-bleed panel of organic gradient
// carrying a single large word.
//
// Both modes are still one component driven by `mode`, so a change to a field,
// a button or a spacing token lands on both at once. App.js owns every piece of
// state and every handler; this file is presentation only.
//
// The `styles` prop is no longer read — these screens deliberately step out of
// the site's glass tokens — but it stays in the signature because App.js passes
// it alongside a dozen other props.
// ============================================================================

// ── Password strength, mirroring the rule signup actually enforces ──────────
function strengthOf(password) {
  if (!password) return null;
  let score = 0;
  if (password.length >= PASSWORD_MIN_LENGTH) score += 2;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (password.length < PASSWORD_MIN_LENGTH) {
    const missing = PASSWORD_MIN_LENGTH - password.length;
    return { filled: 1, color: "var(--eco-c13)", label: `${missing} more character${missing === 1 ? "" : "s"}` };
  }
  if (score <= 3) return { filled: 2, color: "var(--eco-c13)", label: "Fair" };
  if (score <= 4) return { filled: 3, color: T.moss, label: "Good" };
  return { filled: 4, color: T.ink, label: "Strong" };
}

function PasswordStrength({ password }) {
  const s = strengthOf(password);
  if (!s) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 6px" }}>
      <div style={{ display: "flex", gap: "4px", flex: 1 }}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            style={{
              flex: 1,
              height: "3px",
              borderRadius: "999px",
              background: i < s.filled ? s.color : "rgba(var(--eco-c17-rgb), 0.12)",
              transition: "background 0.25s ease",
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.6px", textTransform: "uppercase", color: s.color, whiteSpace: "nowrap" }}>
        {s.label}
      </span>
    </div>
  );
}

// ── Checkbox used by "Remember me" and the Terms tick ───────────────────────
function AuthCheck({ checked, onToggle, label, invalid }) {
  return (
    <div
      role="checkbox"
      aria-checked={checked}
      aria-invalid={invalid || undefined}
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onToggle();
        }
      }}
      style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", userSelect: "none" }}
    >
      <span
        style={{
          width: "16px",
          height: "16px",
          flexShrink: 0,
          borderRadius: "5px",
          border: checked ? "none" : `1.5px solid ${invalid ? "var(--eco-c11)" : "rgba(var(--eco-c17-rgb), 0.28)"}`,
          background: checked ? T.ink : invalid ? "rgba(var(--eco-c11-rgb), 0.08)" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.18s ease",
        }}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#F6F2E9" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
      <span style={{ color: invalid ? "var(--eco-c13)" : T.inkSoft, fontWeight: 600, fontSize: "12px" }}>{label}</span>
    </div>
  );
}

// ── The medallion: the reference's round avatar above the field stack ───────
function Medallion({ isLogin }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: "64px",
        height: "64px",
        borderRadius: "50%",
        background: T.ink,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 12px 26px rgba(var(--eco-c17-rgb), 0.22)",
      }}
    >
      {isLogin ? (
        <UserIcon size={26} color="#F1E9DA" strokeWidth={2} />
      ) : (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#F1E9DA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="19" y1="8" x2="19" y2="14" />
          <line x1="22" y1="11" x2="16" y2="11" />
        </svg>
      )}
    </div>
  );
}

// ── What the gradient panel advertises ──────────────────────────────────────
// The feature card stack is gone: the panel is back to the headline-and-link
// composition the reference uses, with the badge pinned to the top of the frame
// and one line of assurances closing the copy. No counts of users or hectares
// here — nothing on this screen is in a position to know them, and an invented
// figure is the fastest way to lose a grower's trust.
//
// Two items, not three: at this width a third wraps and leaves a separator dot
// dangling at the end of the first line.
const LOGIN_NOTES = ["Your plan is saved", "Works on any device"];
const SIGNUP_NOTES = ["Free to join", "No card required", "Set up in a minute"];

// ── The whole page ──────────────────────────────────────────────────────────
function AuthPanels({
  mode,
  isMobile,
  brandName = "EcoEquity.Inc",
  shake,
  notice,
  onDismissNotice,
  busy,
  fullName,
  setFullName,
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  rememberMe,
  setRememberMe,
  agreeTerms,
  toggleAgreeTerms,
  termsInvalid,
  onSubmit,
  onForgotPassword,
  onSwitchMode,
}) {
  const isLogin = mode === "login";

  const eyeToggle = (
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      aria-label={showPassword ? "Hide password" : "Show password"}
      style={{
        position: "absolute",
        right: "10px",
        top: "50%",
        transform: "translateY(-50%)",
        width: "32px",
        height: "32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        border: "none",
        background: "transparent",
        color: T.inkFaint,
        cursor: "pointer",
        padding: 0,
      }}
    >
      {showPassword ? <EyeOff size={16} strokeWidth={2.2} /> : <Eye size={16} strokeWidth={2.2} />}
    </button>
  );

  // The gradient half. On a phone it becomes a short banner above the form
  // rather than disappearing — it is the only piece of brand on the screen.
  const showcase = (
    <ShowcasePanel
      key="showcase"
      isMobile={isMobile}
      headline={isLogin ? "Welcome." : "Begin."}
      body={
        isLogin
          ? "A digital-first platform for agricultural self-sufficiency in the Philippines — starting at the household."
          : "Join growers, households and community farming centres already building toward a self-sufficient harvest."
      }
      linkLabel={isLogin ? "Create an account" : "I already have an account"}
      onLink={() => onSwitchMode(isLogin ? "signup" : "login")}
      badge={isLogin ? "Grow · Track · Trade" : "Free account · Philippines"}
      notes={isLogin ? LOGIN_NOTES : SIGNUP_NOTES}
    />
  );

  // The paper half.
  const paper = (
    <div
      key="paper"
      className={`slim-scroll ${shake ? "animate-shakeError" : ""}`}
      style={{
        flex: isMobile ? "none" : "0 0 46%",
        minWidth: 0,
        width: isMobile ? "100%" : undefined,
        background: T.paper,
        display: "flex",
        flexDirection: "column",
        padding: isMobile ? "26px 22px 28px" : "clamp(26px, 4vh, 42px) clamp(28px, 3.4vw, 54px)",
        boxSizing: "border-box",
        overflowY: isMobile ? "visible" : "auto",
      }}
    >
      <BrandMark name={brandName} />

      {/* The form column: centred in whatever height is left over. */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "stretch",
          width: "100%",
          maxWidth: "360px",
          margin: "0 auto",
          padding: isMobile ? "26px 0 0" : "clamp(20px, 3vh, 34px) 0",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "18px" }}>
          <Medallion isLogin={isLogin} />
        </div>

        <h1
          style={{
            margin: "0 0 4px",
            textAlign: "center",
            fontFamily: "'Poppins', sans-serif",
            fontSize: "21px",
            fontWeight: 600,
            letterSpacing: "-0.6px",
            color: T.ink,
          }}
        >
          {isLogin ? "Sign in" : "Create account"}
        </h1>
        <p style={{ margin: "0 0 22px", textAlign: "center", fontSize: "12.5px", fontWeight: 500, color: T.inkSoft }}>
          {isLogin ? "Your sustainable journey continues." : "It takes a minute, and it's free."}
        </p>

        <AuthNotice notice={notice} onDismiss={onDismissNotice} />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}
        >
          {!isLogin && (
            <PillField
              label="Full name"
              icon={<UserIcon size={17} strokeWidth={2.1} />}
              value={fullName}
              autoComplete="name"
              onChange={(e) => setFullName(e.target.value)}
            />
          )}

          <PillField
            label={isLogin ? "Username or email" : "Email address"}
            icon={<Mail size={17} strokeWidth={2.1} />}
            value={email}
            autoComplete={isLogin ? "username" : "email"}
            onChange={(e) => setEmail(e.target.value)}
          />

          <PillField
            label="Password"
            type={showPassword ? "text" : "password"}
            icon={<Lock size={17} strokeWidth={2.1} />}
            value={password}
            autoComplete={isLogin ? "current-password" : "new-password"}
            onChange={(e) => setPassword(e.target.value)}
            trailing={eyeToggle}
          />

          {!isLogin && <PasswordStrength password={password} />}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", padding: "2px 6px 4px" }}>
            {isLogin ? (
              <>
                <AuthCheck checked={rememberMe} onToggle={() => setRememberMe(!rememberMe)} label="Remember me" />
                <button
                  type="button"
                  onClick={onForgotPassword}
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    fontFamily: "inherit",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: T.inkSoft,
                    textDecoration: "underline",
                    textUnderlineOffset: "3px",
                    cursor: "pointer",
                  }}
                >
                  Forgot your password?
                </button>
              </>
            ) : (
              <AuthCheck checked={agreeTerms} onToggle={toggleAgreeTerms} invalid={termsInvalid} label="I agree to the Terms & Conditions" />
            )}
          </div>

          <PillButton label={isLogin ? "Login" : "Register"} busy={busy} />
        </form>

        {/* The switch also lives on the gradient panel, but the phone banner is
            short and easy to scroll past, so it is repeated here. */}
        <p style={{ margin: "16px 0 0", textAlign: "center", fontSize: "12px", fontWeight: 500, color: T.inkSoft }}>
          {isLogin ? "New to the platform? " : "Already registered? "}
          <button
            type="button"
            onClick={() => onSwitchMode(isLogin ? "signup" : "login")}
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              fontFamily: "inherit",
              fontSize: "12px",
              fontWeight: 750,
              color: T.ink,
              textDecoration: "underline",
              textUnderlineOffset: "3px",
              cursor: "pointer",
            }}
          >
            {isLogin ? "Register" : "Sign in"}
          </button>
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px", alignItems: "center", marginTop: isMobile ? "24px" : "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: T.inkFaint, fontSize: "11px", fontWeight: 600 }}>
          <ShieldCheck size={12} strokeWidth={2.4} />
          <span>Your details are encrypted and never shared.</span>
        </div>
        <DotRule />
      </div>
    </div>
  );

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: isMobile ? "auto" : "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* No ground of its own: the frame floats on the app's own background —
          the same `page-bg-scrim` wash the homepage sits on — so the two screens
          read as one surface. That scrim is also dark mode's only repaint
          target, which a local override here would have skipped. */}
      <div style={{ position: "relative", zIndex: 1, width: "100%", height: isMobile ? "auto" : "100%", padding: isMobile ? "10px 0 20px" : 0, boxSizing: "border-box" }}>
        <SplitFrame isMobile={isMobile}>
          {isMobile ? [showcase, paper] : [paper, showcase]}
        </SplitFrame>
      </div>
    </div>
  );
}

export default AuthPanels;
