import React, { useState } from "react";
import { PillButton } from "./SplitAesthetic";

// ============================================================================
// HOME HERO — one full-bleed screen, no container and no artwork.
//
// There is no card, no panel and no gradient here: the copy sits directly on
// the app's own background, and the composition is carried entirely by type,
// spacing and the one dark pill. Both columns are therefore set in ink — the
// welcome block used to be white because it sat on a dark gradient mass, and
// white on this pale ground is invisible.
//
// The mobile home screen is a signed-in dashboard rather than a landing pitch,
// so it is untouched; App.js still renders that branch on phones.
// ============================================================================

const INK = "var(--eco-c19)";
const INK_SOFT = "rgba(var(--eco-c19-rgb), 0.62)";
const INK_FAINT = "rgba(var(--eco-c19-rgb), 0.38)";
const GREEN = "var(--eco-c9)";

const STATS = [
  { value: "98%", label: "Company growth" },
  { value: "99+", label: "Partners" },
  { value: "1000+", label: "Customers" },
];

// The single landscape photograph that sits above "Welcome.". farming.jpg is
// 626×417 natively, so a 3:2 frame shows the whole picture with nothing cropped.
// ROW_MAX is shared with the max-width of the paragraph below, so the frame and
// the copy always end on the same line and neither can run past the column.
const ROW_MAX = 420;
const WELCOME_SHOT = {
  src: "/farming.jpg",
  alt: "A tended household farm plot",
  ratio: "3 / 2",
};

function WelcomeShots() {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: `min(100%, ${ROW_MAX}px)`,
        aspectRatio: WELCOME_SHOT.ratio,
        marginBottom: "clamp(16px, 2.4vh, 26px)",
        borderRadius: "20px",
        overflow: "hidden",
        border: "5px solid var(--eco-c0)",
        background: "var(--eco-c3)",
        boxShadow: hover
          ? "0 18px 40px rgba(var(--eco-c19-rgb), 0.20)"
          : "0 12px 28px rgba(var(--eco-c19-rgb), 0.12)",
        transform: hover ? "translateY(-7px)" : "none",
        transition: "transform 0.45s cubic-bezier(.22,1,.36,1), box-shadow 0.45s ease",
      }}
    >
      <img
        src={WELCOME_SHOT.src}
        alt={WELCOME_SHOT.alt}
        // Held slightly back from full saturation so the photograph sits inside
        // the sage palette instead of competing with it. The grade lives in
        // index.css (.photo-graded), not in an inline filter: an inline filter
        // beats the dark-mode rule that un-inverts media and would leave this
        // photo inverted on dark.
        className="photo-graded"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
    </div>
  );
}

function ExploreLink({ onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        marginTop: "22px",
        padding: "0 0 4px",
        border: "none",
        borderBottom: `1px solid ${hover ? GREEN : "rgba(var(--eco-c19-rgb), 0.22)"}`,
        background: "transparent",
        fontFamily: "inherit",
        fontSize: "13px",
        fontWeight: 700,
        letterSpacing: "0.2px",
        color: GREEN,
        transition: "border-color 0.22s ease",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      Explore the platform
      <span
        aria-hidden="true"
        style={{
          display: "inline-block",
          transform: hover ? "translateX(4px)" : "none",
          transition: "transform 0.22s cubic-bezier(.22,1,.36,1)",
        }}
      >
        →
      </span>
    </button>
  );
}

/* `measure` is the reading width the home scroller no longer enforces — that
   box is now the full width of the window so its footer can bleed to the
   edges, so the hero holds the card's inner measure for itself. App.js owns
   the expression (HOME_MEASURE). */
export default function HomeHero({ onNavigate, onScrollDown, measure = "1240px" }) {
  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        flex: "0 0 auto",
        minHeight: "100%",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: measure,
          margin: "0 auto",
          padding: "clamp(24px, 5vh, 56px) clamp(20px, 3vw, 48px)",
          boxSizing: "border-box",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 0.85fr)",
          gap: "clamp(24px, 4vw, 64px)",
          alignItems: "center",
        }}
      >
        {/* ── The pitch ── */}
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "10.5px",
              fontWeight: 700,
              letterSpacing: "1.8px",
              textTransform: "uppercase",
              color: INK_FAINT,
              marginBottom: "clamp(12px, 2vh, 20px)",
            }}
          >
            <span aria-hidden="true" style={{ width: "22px", height: "1px", background: INK_FAINT }} />
            Agricultural innovation · Philippines
          </span>

          <h1
            style={{
              margin: "0 0 clamp(14px, 2.2vh, 22px)",
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600,
              fontSize: "clamp(30px, 3.4vw, 52px)",
              lineHeight: 1.06,
              letterSpacing: "-1.8px",
              color: INK,
            }}
          >
            Grow food.
            <br />
            Build community.
            <br />
            <span style={{ color: GREEN }}>Earn sustainably.</span>
          </h1>

          <p
            style={{
              margin: "0 0 clamp(22px, 3.2vh, 34px)",
              maxWidth: "400px",
              fontSize: "13.5px",
              lineHeight: 1.75,
              fontWeight: 500,
              color: INK_SOFT,
            }}
          >
            A digital-first platform built to boost agricultural self-sufficiency in the
            Philippines — starting at the household and community level.
          </p>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <PillButton label="Learn more" type="button" full={false} onClick={() => onNavigate("Learn More")} />
            <PillButton label="Get in touch" type="button" variant="ghost" full={false} onClick={() => onNavigate("Contact")} />
          </div>

          {/* Numbers close the column, the way the reference's dots do. */}
          <div style={{ display: "flex", gap: "clamp(20px, 2.6vw, 40px)", flexWrap: "wrap", marginTop: "clamp(28px, 4.5vh, 52px)" }}>
            {STATS.map((s) => (
              <div key={s.label} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                <span style={{ fontSize: "clamp(19px, 1.8vw, 26px)", fontWeight: 700, letterSpacing: "-1px", lineHeight: 1, color: INK }}>
                  {s.value}
                </span>
                <span style={{ fontSize: "9.5px", fontWeight: 600, letterSpacing: "1.1px", textTransform: "uppercase", color: INK_FAINT }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── The welcome, sitting on the saturated part of the flow ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            alignSelf: "end",
            minWidth: 0,
            paddingBottom: "clamp(8px, 4vh, 40px)",
          }}
        >
          <WelcomeShots />

          <h2
            style={{
              margin: 0,
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600,
              fontSize: "clamp(38px, 4.4vw, 64px)",
              lineHeight: 1,
              letterSpacing: "-2.2px",
              color: INK,
            }}
          >
            Welcome.
          </h2>
          <p
            style={{
              margin: "16px 0 0",
              maxWidth: `${ROW_MAX}px`,
              fontSize: "13px",
              lineHeight: 1.7,
              fontWeight: 500,
              color: INK_SOFT,
            }}
          >
            Six connected tools that take a household from an empty plot to a harvest
            worth selling.
          </p>
          <ExploreLink onClick={onScrollDown} />
        </div>
      </div>
    </section>
  );
}
