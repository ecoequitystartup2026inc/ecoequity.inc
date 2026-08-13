/**
 * Shared modal design tokens.
 *
 * Every pop-up in the app scrims the page the same way: a pure backdrop blur
 * with no tint, a 20px gutter so the panel never touches the viewport edge,
 * and a 0.25s fade-in. Before this module each modal carried its own
 * hand-written copy of that object, so the scrims drifted apart (0.4/0.45/0.5/
 * 0.6 black, 6/8/10/12px blur, some with no blur at all) and the app looked
 * like several different products depending on which button you pressed.
 *
 * Stacking is the one thing that legitimately varies, so `zIndex` is the
 * argument callers pass. Use the LAYER constants rather than raw numbers.
 */

/** Stacking tiers. A modal opened from inside another modal goes one tier up. */
export const MODAL_LAYER = {
  /** A menu pinned to the control that opened it. Portalled out of the page to
   *  escape a clipping ancestor, so it needs a layer — but it is page furniture,
   *  not a modal, and must lose to anything that scrims the page. */
  popover: 9990,
  /** Page-level modals (quick view, cart, checkout, forms). */
  base: 9999,
  /** A modal launched from inside a base modal. */
  nested: 10000,
  /** A confirmation launched from inside a nested modal. */
  nestedConfirm: 10001,
  /** Chrome that must clear absolutely everything (announcements, session alerts). */
  top: 100000,
  /** A confirmation raised over `top`-tier chrome. */
  topConfirm: 100001,
};

/** The scrim itself, minus stacking. Prefer `modalOverlay()` over spreading this. */
export const MODAL_OVERLAY_BASE = {
  position: "fixed",
  inset: 0,
  /* No tint: the dark wash read as a grey film over every container behind
     the modal. Separation comes from the blur and the panel's own shadow
     instead, so the page stays its real colour — just out of focus. The blur
     is heavier than the old 8px to make up for the missing dim. */
  background: "transparent",
  backdropFilter: "blur(20px) saturate(140%)",
  WebkitBackdropFilter: "blur(20px) saturate(140%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  /* The 20px gutter grows to clear a notch or home indicator when the
     device reports one; the insets are 0px everywhere else, so this is the
     plain 20px on hardware without them. */
  padding:
    "max(20px, var(--safe-top, 0px)) max(20px, var(--safe-right, 0px)) " +
    "max(20px, var(--safe-bottom, 0px)) max(20px, var(--safe-left, 0px))",
  boxSizing: "border-box",
  /* A panel taller than a short viewport (a phone in landscape, or a
     keyboard-shrunk one) scrolls within the scrim instead of having its
     top and bottom cut off with no way to reach them. */
  overflowY: "auto",
  overscrollBehavior: "contain",
  WebkitOverflowScrolling: "touch",
  animation: "fadeIn 0.25s ease",
};

/**
 * The standard full-screen modal scrim.
 *
 * @param {number} zIndex Stacking tier — pass a `MODAL_LAYER` value.
 * @param {object} [extra] Per-modal overrides (e.g. `{ padding: 0 }` for sheets).
 */
export const modalOverlay = (zIndex = MODAL_LAYER.base, extra = {}) => ({
  ...MODAL_OVERLAY_BASE,
  zIndex,
  ...extra,
});

/**
 * Mobile sheet variant: the panel fills the screen from the top, so the
 * overlay drops its gutter and stops centring. The scrim is unchanged.
 */
export const MODAL_OVERLAY_SHEET = {
  padding: 0,
  alignItems: "flex-start",
  justifyContent: "flex-start",
};

/**
 * A confirmation scrim drawn *inside* an already-open modal panel — a light
 * wash instead of a dark one, since it sits on top of a light surface. The
 * host element needs `position: relative`; `borderRadius: inherit` keeps the
 * wash inside the panel's rounded corners.
 */
export const nestedConfirmOverlay = (zIndex = 60) => ({
  position: "absolute",
  inset: 0,
  zIndex,
  background: "rgba(255,255,255,0.7)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  boxSizing: "border-box",
  borderRadius: "inherit",
  animation: "fadeIn 0.2s ease",
});

/**
 * The modal card surface: glass gradient, hairline border, lifted shadow,
 * 24px radius, and the scale-up entrance. Size (`maxWidth`, `maxHeight`) and
 * layout stay with the caller — those are genuinely per-modal.
 */
export const MODAL_PANEL_BASE = {
  background: "linear-gradient(145deg, rgba(255,255,255,0.97), rgba(var(--eco-c0-rgb), 0.94))",
  border: "1px solid rgba(255,255,255,0.8)",
  borderRadius: "24px",
  boxShadow: "0 24px 60px rgba(var(--eco-c19-rgb), 0.28), inset 0 1px 0 rgba(255,255,255,0.85)",
  position: "relative",
  boxSizing: "border-box",
  animation: "scaleUp 0.3s ease",
};

/** The modal card surface plus caller overrides. */
export const modalPanel = (extra = {}) => ({ ...MODAL_PANEL_BASE, ...extra });

/**
 * The circular close button that sits in a panel's top-right corner.
 *
 * 44px, not 32: on a phone this is often the only way out of a modal, and
 * 32px is below the touch-target minimum on both iOS and Android. The glyph
 * itself stays small — the extra size is hit area.
 */
export const MODAL_CLOSE_BTN = {
  position: "absolute",
  top: "12px",
  right: "12px",
  zIndex: 50,
  width: "44px",
  height: "44px",
  borderRadius: "50%",
  background: "rgba(0,0,0,0.05)",
  border: "1px solid rgba(0,0,0,0.05)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "16px",
  lineHeight: 1,
  color: "rgba(0,0,0,0.6)",
  cursor: "pointer",
  WebkitTapHighlightColor: "transparent",
  transition: "background 0.2s ease",
};
