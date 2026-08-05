import React, { useId, useState } from "react";

// ============================================================================
// SPLIT AESTHETIC — the shared vocabulary for the landing screen and the
// Login / Register pages.
//
// The reference this is built from is a two-panel composition: a quiet paper
// panel carrying the brand mark and the form, and a full-bleed panel of soft
// organic gradient carrying one large word of copy. Everything is pill-shaped,
// near-monochrome and generously spaced; the only strong value in the frame is
// the dark submit button.
//
// The reference palette is warm sand and taupe. Reproduced literally it would
// read as someone else's product, so the same tonal structure — pale ground,
// mid earth, one deep shadow — is voiced in this platform's greens: cream and
// clay flowing into moss and forest. The layout, the shapes and the restraint
// are the reference's; the hues are ours.
//
// Deliberately absent: the reference's top-right nav row (ABOUT · DOWNLOAD ·
// PRICING · CONTACT). These screens hide the site navbar already, and the ask
// was to leave those menus out.
// ============================================================================

// ── Tokens ──────────────────────────────────────────────────────────────────
export const T = {
  paper: "#FBF8F2", // the form panel
  sunk: "#F0EBE0", // input fill at rest
  sunkFocus: "#FFFFFF",
  ink: "var(--eco-c17)", // headings, the dark pill
  inkSoft: "rgba(var(--eco-c17-rgb), 0.58)",
  inkFaint: "rgba(var(--eco-c17-rgb), 0.34)",
  line: "rgba(var(--eco-c17-rgb), 0.10)",
  moss: "var(--eco-c11)", // the one accent, used sparingly
  radius: 30,
};

// The frame is one rounded rectangle floating on a dark ground, and it clips
// the gradient panel — so the curve of the artwork is the curve of the frame.
export function SplitFrame({ isMobile, children, maxWidth = 1180, minHeight = 620 }) {
  return (
    <div
      style={{
        width: "100%",
        height: isMobile ? "auto" : "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? "0" : "clamp(8px, 2vh, 22px) 0",
        boxSizing: "border-box",
      }}
    >
      <div
        className="split-frame"
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          width: "100%",
          maxWidth: `${maxWidth}px`,
          minHeight: isMobile ? 0 : `min(${minHeight}px, 100%)`,
          maxHeight: isMobile ? "none" : "100%",
          borderRadius: isMobile ? "24px" : `${T.radius}px`,
          overflow: "hidden",
          background: T.paper,
          // No drop shadow. Against this pale ground the old 60px-blur spread
          // did not read as lift, it read as a blurred halo bleeding out of
          // the frame — the edge is now the rounded rectangle and nothing else.
          boxShadow: "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ── The gradient panel ──────────────────────────────────────────────────────
// Two blurred organic paths over a three-stop ground, plus a film of grain.
// It is drawn rather than loaded so it scales to any panel without a raster
// asset, and so the greens can be tuned in one place.
export function OrganicMesh({ flip = false }) {
  const uid = useId().replace(/:/g, "");
  const id = (name) => `${uid}-${name}`;

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 640 900"
      preserveAspectRatio="xMidYMid slice"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        transform: flip ? "scaleX(-1)" : "none",
      }}
    >
      <defs>
        <linearGradient id={id("base")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F1E9DA" />
          <stop offset="42%" stopColor="#C9BCA1" />
          <stop offset="100%" stopColor="var(--eco-c9)" />
        </linearGradient>

        <linearGradient id={id("wave")} x1="0.15" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="var(--eco-c15)" />
          <stop offset="55%" stopColor="var(--eco-c9)" />
          <stop offset="100%" stopColor="var(--eco-c7)" />
        </linearGradient>

        <linearGradient id={id("light")} x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#FCF7EC" />
          <stop offset="100%" stopColor="#DCD0B6" />
        </linearGradient>

        {/* Enough blur that the edge never resolves into a line, but not so
            much that the S-curve dissolves into a single soft blob — at 30 it
            did, and the composition lost its flow. */}
        <filter id={id("soft")} x="-45%" y="-45%" width="190%" height="190%">
          <feGaussianBlur stdDeviation="17" />
        </filter>

        <filter id={id("grain")} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>

      <rect width="640" height="900" fill={`url(#${id("base")})`} />

      {/* The deep S-flow: down the middle, then swung left and back out. */}
      <path
        d="M680,-60 C540,120 300,170 336,362 C366,522 118,566 194,772 C240,898 430,930 690,900 Z"
        fill={`url(#${id("wave")})`}
        filter={`url(#${id("soft")})`}
        opacity="0.94"
      />

      {/* The pale counter-shape hugging the outer edge, so the dark flow reads
          as a ribbon between two lights rather than a corner fill. */}
      <path
        d="M-80,-60 L392,-60 C318,142 132,220 168,404 C202,578 -26,614 -80,744 Z"
        fill={`url(#${id("light")})`}
        filter={`url(#${id("soft")})`}
        opacity="0.95"
      />

      <rect width="640" height="900" filter={`url(#${id("grain")})`} opacity="0.06" style={{ mixBlendMode: "overlay" }} />
    </svg>
  );
}

// ── Pieces that ride on the gradient panel ──────────────────────────────────
// All of them are drawn with plain translucent white over the artwork rather
// than backdrop-filter: this panel already animates a mesh and three aurora
// forms, and a stack of blur layers on top of moving pixels is the one thing
// that reliably costs the screen its frame rate.

// The small pill at the top of the panel. Dark rather than light, because the
// top-left of the artwork is the pale cream counter-shape.
function ShowcaseBadge({ label }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "7px 14px 7px 11px",
        borderRadius: "999px",
        background: "rgba(var(--eco-c18-rgb), 0.34)",
        border: "1px solid rgba(255,255,255,0.22)",
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.4px",
        color: "rgba(255,255,255,0.92)",
        whiteSpace: "nowrap",
      }}
    >
      <span aria-hidden="true" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#FFFFFF", opacity: 0.85, flexShrink: 0 }} />
      {label}
    </span>
  );
}

// The closing strip: two or three short assurances, hairline-separated.
function ShowcaseNotes({ notes }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "10px",
        paddingTop: "14px",
        borderTop: "1px solid rgba(255,255,255,0.18)",
        fontSize: "11px",
        fontWeight: 650,
        letterSpacing: "0.3px",
        color: "rgba(255,255,255,0.66)",
      }}
    >
      {notes.map((note, i) => (
        <React.Fragment key={note}>
          {i > 0 && <span aria-hidden="true" style={{ width: "3px", height: "3px", borderRadius: "50%", background: "currentColor", opacity: 0.7 }} />}
          <span>{note}</span>
        </React.Fragment>
      ))}
    </div>
  );
}

// The gradient panel with its copy: a badge at the top of the frame, then one
// large word, a line of support and a quiet text link at the bottom.
//
// The copy is white and always sits bottom-left, which is where the deep end
// of the flow lands — so the artwork is never mirrored here. Flipping it for
// variety put "Begin." over the pale cream and the headline all but vanished;
// `flip` stays available for surfaces that place their copy elsewhere.
//
// `badge` and `notes` are optional; without them the panel is the original
// headline-and-link composition.
export function ShowcasePanel({ isMobile, headline, body, linkLabel, onLink, badge, notes, flip = false, children }) {
  const [hover, setHover] = useState(false);

  // The notes strip is a desktop affordance: on a phone this panel is a ~220px
  // banner above the form, and anything more than the headline crushes it.
  const showNotes = !isMobile && notes && notes.length > 0;

  return (
    <div
      style={{
        position: "relative",
        flex: isMobile ? "none" : "1 1 54%",
        minWidth: 0,
        width: isMobile ? "100%" : undefined,
        height: isMobile ? "clamp(180px, 30vh, 260px)" : "auto",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: badge && !isMobile ? "space-between" : "flex-end",
      }}
    >
      {/* The artwork, in motion. The SVG's geometry is never animated — it
          carries two feGaussianBlur passes and a feTurbulence grain film, and
          re-running those every frame is not affordable. Instead the mesh is
          oversized, promoted to its own layer and only translated, and the
          colour movement comes from two blurred aurora forms drifting over it.
          Transform and opacity only. See index.css for the full note. */}
      <div className="showcase-motion" aria-hidden="true">
        <div className="showcase-flow">
          <OrganicMesh flip={flip} />
        </div>
        <span className="showcase-aurora showcase-aurora-a" />
        <span className="showcase-aurora showcase-aurora-b" />
        <span className="showcase-aurora showcase-aurora-c" />
      </div>

      {/* A scrim only under the text — the artwork stays legible above it. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "70%",
          background: "linear-gradient(to top, rgba(var(--eco-c18-rgb), 0.60), rgba(var(--eco-c18-rgb), 0))",
        }}
      />

      {badge && !isMobile && (
        <div style={{ position: "relative", zIndex: 1, padding: "clamp(30px, 4.5vh, 44px) clamp(34px, 4vw, 56px) 0" }}>
          <ShowcaseBadge label={badge} />
        </div>
      )}

      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: isMobile ? "0 22px 20px" : "0 clamp(34px, 4vw, 56px) clamp(30px, 4.5vh, 48px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600,
            fontSize: isMobile ? "clamp(30px, 9vw, 40px)" : "clamp(40px, 4.6vw, 66px)",
            lineHeight: 1.0,
            letterSpacing: "-2.2px",
            color: "#FFFFFF",
          }}
        >
          {headline}
        </h2>

        {body && (
          <p
            style={{
              margin: isMobile ? "10px 0 0" : "16px 0 0",
              maxWidth: "340px",
              fontSize: isMobile ? "12px" : "13px",
              lineHeight: 1.65,
              fontWeight: 500,
              color: "rgba(255,255,255,0.74)",
            }}
          >
            {body}
          </p>
        )}

        {showNotes && (
          <div className="showcase-extras" style={{ width: "100%", maxWidth: "400px", marginTop: "18px" }}>
            <ShowcaseNotes notes={notes} />
          </div>
        )}

        {linkLabel && (
          <button
            type="button"
            onClick={onLink}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
              marginTop: isMobile ? "12px" : "20px",
              padding: 0,
              border: "none",
              background: "transparent",
              fontFamily: "inherit",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.2px",
              color: "#FFFFFF",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              borderBottom: "1px solid rgba(255,255,255,0.45)",
              paddingBottom: "3px",
            }}
          >
            {linkLabel}
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
        )}

        {children}
      </div>
    </div>
  );
}

// ── Brand mark ──────────────────────────────────────────────────────────────
// The reference puts a small logo lockup alone in the top-left of the paper
// panel; this is that, carrying the real product logo rather than a drawn
// stand-in, so the auth screens and the shell navbar show the same company.
// It appears once per screen, on the paper panel only — the gradient panel
// carries the headline and nothing else.
//
// If the logo file ever fails to load the drawn leaf takes over, because a
// broken image in the top-left corner of a login screen reads as a broken site.
export function BrandMark({ name = "EcoEquity", logoSrc = "/Eco.png", size = 30, onClick }) {
  const [logoBroken, setLogoBroken] = useState(false);
  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      {...(onClick ? { type: "button", onClick } : {})}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: 0,
        border: "none",
        background: "transparent",
        fontFamily: "inherit",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: `${Math.round(size * 0.3)}px`,
          // The logo is a full-bleed image, so it needs no plate behind it;
          // only the fallback glyph does, to stay legible.
          background: logoBroken ? T.ink : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        {logoBroken ? (
          <svg width={size * 0.53} height={size * 0.53} viewBox="0 0 24 24" fill="none" stroke="#F1E9DA" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
          </svg>
        ) : (
          <img
            src={logoSrc}
            alt=""
            onError={() => setLogoBroken(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        )}
      </span>
      <span
        style={{
          fontSize: "14.5px",
          fontWeight: 750,
          letterSpacing: "-0.3px",
          color: T.ink,
        }}
      >
        {name}
      </span>
    </Tag>
  );
}

// ── Pill form field ─────────────────────────────────────────────────────────
// A single sunken pill with a leading icon. No floating label: the reference
// keeps one word of placeholder inside the pill and nothing else, which is
// what makes the stack read as quietly as it does.
export function PillField({ label, icon, type = "text", value, onChange, autoComplete, trailing, onEnter }) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        type={type}
        placeholder={label}
        value={value}
        autoComplete={autoComplete}
        aria-label={label}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) onEnter();
        }}
        style={{
          width: "100%",
          height: "52px",
          padding: `0 ${trailing ? "48px" : "20px"} 0 46px`,
          borderRadius: "999px",
          border: `1px solid ${focused ? "rgba(var(--eco-c17-rgb), 0.42)" : "transparent"}`,
          background: focused ? T.sunkFocus : T.sunk,
          boxShadow: focused ? "0 6px 18px rgba(var(--eco-c17-rgb), 0.10)" : "none",
          fontSize: "13.5px",
          fontWeight: 600,
          letterSpacing: "0.2px",
          color: T.ink,
          outline: "none",
          boxSizing: "border-box",
          fontFamily: "inherit",
          transition: "background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
        }}
      />

      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "18px",
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          color: focused ? T.ink : T.inkFaint,
          transition: "color 0.2s ease",
        }}
      >
        {icon}
      </span>

      {trailing}
    </div>
  );
}

// ── The dark pill ───────────────────────────────────────────────────────────
export function PillButton({ label, busy, onClick, type = "submit", variant = "solid", full = true }) {
  const [hover, setHover] = useState(false);
  const solid = variant === "solid";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={busy}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: full ? "100%" : "auto",
        height: "52px",
        padding: full ? "0" : "0 30px",
        borderRadius: "999px",
        border: solid ? "none" : `1px solid ${T.line}`,
        background: solid ? T.ink : "transparent",
        color: solid ? "#F6F2E9" : T.ink,
        fontFamily: "inherit",
        fontSize: "12.5px",
        fontWeight: 750,
        letterSpacing: "1.6px",
        textTransform: "uppercase",
        cursor: busy ? "progress" : "pointer",
        opacity: busy ? 0.7 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        boxShadow: solid && hover && !busy ? "0 16px 30px rgba(var(--eco-c17-rgb), 0.28)" : solid ? "0 8px 18px rgba(var(--eco-c17-rgb), 0.18)" : "none",
        transform: hover && !busy ? "translateY(-2px)" : "none",
        transition: "transform 0.22s cubic-bezier(.22,1,.36,1), box-shadow 0.22s ease, background 0.2s ease",
      }}
    >
      {label}
      {busy && (
        <span
          aria-hidden="true"
          style={{
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            border: "2px solid rgba(246,242,233,0.35)",
            borderTopColor: "#F6F2E9",
            animation: "spin 0.7s linear infinite",
          }}
        />
      )}
    </button>
  );
}

// The reference's three dots under the form. Purely a rhythm mark — it closes
// the paper panel so the column does not end on empty space.
export function DotRule() {
  return (
    <div aria-hidden="true" style={{ display: "flex", gap: "7px", justifyContent: "center" }}>
      {[0.9, 0.35, 0.35].map((o, i) => (
        <span key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: T.ink, opacity: o }} />
      ))}
    </div>
  );
}
