/**
 * Runtime theming for the sage ramp.
 *
 * The UI is one monochromatic sage ramp, written as literal hex/rgba values in
 * inline styles across `src/**`. Those literals were swept into CSS variables
 * (`var(--eco-c0)` … `var(--eco-c20)`, plus `--eco-cN-rgb` triplets for the
 * `rgba()` forms) so the Appearance settings can actually repaint the site.
 *
 * The green family is five tones — surface, tint, brand, deep, ink. The site
 * still addresses colour as twenty-one `--eco-cN` steps, because that is what a
 * thousand inline styles already say; STEP_TONES folds those steps onto the
 * five, so the palette can be narrowed or widened here instead of by another
 * sweep over `src/**`.
 *
 * `buildThemeRamp` regenerates the five tones from a chosen primary +
 * secondary and then emits all 21 step variables from them:
 *
 *   - Every tone keeps the *lightness* the designer picked, so contrast and the
 *     light/dark rhythm of the original design survive any colour choice.
 *   - Hue and saturation come from the primary at the dark end and blend toward
 *     the secondary at the light end, which is what those two colours actually
 *     control in this UI (ink/buttons vs. surfaces).
 *   - The ramp is nudged so the brand tone lands exactly on the chosen primary.
 *
 * Generating five tones rather than 21 steps is what keeps a custom theme to
 * five greens too: steps inside a band are the same colour by construction,
 * not by rounding.
 *
 * SAGE_RAMP is the palette and doubles as the fallback: pass the defaults and
 * you get the untouched site back.
 */

/** The five greens, lightest → darkest. Index 2 is the brand primary. */
export const SAGE_RAMP = ["#f3f7f2", "#bfcfbb", "#738a6e", "#344c3d", "#16211a"];

/**
 * Which tone each legacy `--eco-cN` step resolves to. The bands follow how the
 * steps were actually used: c0–c2 were all page/card surfaces, c3–c6 borders
 * and quiet fills, c7–c10 brand fills and muted text, c11–c14 body copy and
 * solid darks, c15–c20 headings and the near-black slabs.
 */
export const STEP_TONES = [
  0, 0, 0,
  1, 1, 1, 1,
  2, 2, 2, 2,
  3, 3, 3, 3,
  4, 4, 4, 4, 4, 4,
];

/** Where the brand primary and the lightest surface sit in the ramp. */
export const PRIMARY_TONE = 2;
export const SECONDARY_TONE = 0;

/**
 * The step variables the Appearance picker's two colours land on. Every step
 * in a band carries its tone, so these name the ones the codebase already
 * treats as the brand fill (`--eco-c9`) and the page surface (`--eco-c0`).
 */
export const PRIMARY_INDEX = 9;
export const SECONDARY_INDEX = 0;

export const DEFAULT_PRIMARY = SAGE_RAMP[PRIMARY_TONE];
export const DEFAULT_SECONDARY = SAGE_RAMP[SECONDARY_TONE];

/**
 * Where the gradient buttons darken toward. Solid brand buttons are painted
 * either flat (the brand tone) or as a brand → deep gradient, so a custom
 * button colour reproduces that same drop in lightness rather than a fixed
 * guess.
 */
export const BUTTON_DEEP_TONE = 3;

export const hexToRgb = (hex) => {
  let clean = String(hex || "").trim().replace("#", "");
  if (clean.length === 3) clean = clean.split("").map((c) => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
};

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

export const rgbToHsl = ({ r, g, b }) => {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return { h, s, l };
};

export const hslToRgb = ({ h, s, l }) => {
  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const channel = (t) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  return {
    r: Math.round(channel(h + 1 / 3) * 255),
    g: Math.round(channel(h) * 255),
    b: Math.round(channel(h - 1 / 3) * 255),
  };
};

const toHex = ({ r, g, b }) =>
  "#" + [r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0")).join("");

/** Shortest-path distance around the hue wheel, in turns. */
const hueDelta = (from, to) => {
  let delta = to - from;
  if (delta > 0.5) delta -= 1;
  if (delta < -0.5) delta += 1;
  return delta;
};

const lerp = (a, b, t) => a + (b - a) * t;

/**
 * Regenerate the ramp for a primary/secondary pair.
 *
 * Returns `{ "--eco-c0": "#rrggbb", "--eco-c0-rgb": "r, g, b", … }` plus
 * `--eco-accent` / `--eco-secondary` for anything reading the pair directly.
 */
export function buildThemeRamp(primary, secondary) {
  const primaryRgb = hexToRgb(primary) || hexToRgb(DEFAULT_PRIMARY);
  const secondaryRgb = hexToRgb(secondary) || hexToRgb(DEFAULT_SECONDARY);
  const p = rgbToHsl(primaryRgb);
  const s = rgbToHsl(secondaryRgb);

  const basePrimary = rgbToHsl(hexToRgb(SAGE_RAMP[PRIMARY_TONE]));
  const baseSecondary = rgbToHsl(hexToRgb(SAGE_RAMP[SECONDARY_TONE]));

  // How much more/less saturated the chosen colours are than the ones they
  // replace. Applied as a ratio so pale steps stay pale.
  const primarySatScale = basePrimary.s > 0 ? p.s / basePrimary.s : 0;
  const secondarySatScale = baseSecondary.s > 0 ? s.s / baseSecondary.s : 0;

  // Lightness nudges. The primary's is applied in full at its own step; the
  // secondary's is clamped so a dark pick tints the surfaces without turning
  // the page black under text colours that assume a light background.
  const primaryDeltaL = p.l - basePrimary.l;
  const secondaryDeltaL = clamp(s.l - baseSecondary.l, -0.12, 0.05);

  // Hue is shifted *relative to each step*, not overwritten, so the ramp keeps
  // the internal relationships the designer gave it — and the default pair is
  // a shift of zero, i.e. the original palette byte for byte.
  const primaryHueShift = hueDelta(basePrimary.h, p.h);
  const secondaryHueShift = hueDelta(baseSecondary.h, s.h);

  const last = SAGE_RAMP.length - 1;

  const tones = SAGE_RAMP.map((baseHex, i) => {
    const base = rgbToHsl(hexToRgb(baseHex));

    // Light half blends secondary → primary; dark half is all primary.
    const towardPrimary = i <= PRIMARY_TONE ? i / PRIMARY_TONE : 1;
    const hueShift = lerp(secondaryHueShift, primaryHueShift, towardPrimary);
    const satScale = lerp(secondarySatScale, primarySatScale, towardPrimary);

    // Both lightness nudges taper to zero away from their anchor so the
    // extremes of the ramp (near-white, near-black) stay where the design
    // needs them.
    const primaryWeight = i <= PRIMARY_TONE
      ? i / PRIMARY_TONE
      : (last - i) / (last - PRIMARY_TONE);
    const secondaryWeight = i <= PRIMARY_TONE ? 1 - i / PRIMARY_TONE : 0;

    return {
      base,
      baseHex,
      h: (base.h + hueShift % 1 + 1) % 1,
      s: clamp(base.s * satScale, 0, 1),
      l: clamp(base.l + primaryDeltaL * primaryWeight + secondaryDeltaL * secondaryWeight, 0, 1),
    };
  });

  // Keep the ramp ordered light → dark whatever the inputs. Sweeping outward
  // from the primary leaves the anchor tone untouched.
  for (let i = PRIMARY_TONE - 1; i >= 0; i -= 1) {
    tones[i].l = Math.max(tones[i].l, tones[i + 1].l);
  }
  for (let i = PRIMARY_TONE + 1; i <= last; i += 1) {
    tones[i].l = Math.min(tones[i].l, tones[i - 1].l);
  }

  const painted = tones.map((tone, i) => {
    // An untouched tone keeps its literal hex: a round trip through HSL can
    // drift by a bit, and the default theme must reproduce the palette exactly.
    const unchanged =
      Math.abs(tone.h - tone.base.h) < 1e-9 &&
      Math.abs(tone.s - tone.base.s) < 1e-9 &&
      Math.abs(tone.l - tone.base.l) < 1e-9;
    return i === PRIMARY_TONE
      ? primaryRgb
      : unchanged ? hexToRgb(tone.baseHex) : hslToRgb(tone);
  });

  const vars = {};
  STEP_TONES.forEach((tone, i) => {
    const rgb = painted[tone];
    vars[`--eco-c${i}`] = toHex(rgb);
    vars[`--eco-c${i}-rgb`] = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
  });

  vars["--eco-accent"] = toHex(primaryRgb);
  vars["--eco-secondary"] = toHex(secondaryRgb);
  return vars;
}

/** Same hue and saturation, lightness moved by `delta` (clamped to 0–1). */
export function shiftLightness(hex, delta) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const hsl = rgbToHsl(rgb);
  return toHex(hslToRgb({ ...hsl, l: clamp(hsl.l + delta, 0, 1) }));
}

/**
 * A button pick may be a two-stop gradient instead of one colour, written as
 * `"#from,#to"`. That is how the original EcoEquity buttons were painted — a
 * mint-green → sky-blue sweep rather than a flat fill — so the setting has to
 * be able to express it, not just single hexes.
 *
 * Returns `{ from, to }` normalised to 6-digit hex, or null for anything that
 * isn't a valid pair (including plain single-colour picks).
 */
export function parseButtonGradient(value) {
  const parts = String(value || "").split(",");
  if (parts.length !== 2) return null;
  const from = hexToRgb(parts[0]);
  const to = hexToRgb(parts[1]);
  if (!from || !to) return null;
  return { from: toHex(from), to: toHex(to) };
}

/** CSS background for a button pick — used by swatches and previews. */
export function buttonBackground(value, fallback) {
  const gradient = parseButtonGradient(value);
  if (gradient) return `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`;
  return value || fallback || DEFAULT_PRIMARY;
}

/**
 * Ink that stays readable on a button pick. For a gradient that is judged on
 * the average of the two stops, since the label sits across both.
 */
export function buttonInk(value, fallback) {
  const gradient = parseButtonGradient(value);
  if (!gradient) return readableInk(value || fallback || DEFAULT_PRIMARY);
  const a = hexToRgb(gradient.from);
  const b = hexToRgb(gradient.to);
  return readableInk(toHex({ r: (a.r + b.r) / 2, g: (a.g + b.g) / 2, b: (a.b + b.b) / 2 }));
}

/**
 * Variables for the standalone button colour.
 *
 * Buttons normally ride the ramp along with everything else; this pair of
 * variables is what lets them be picked separately (Appearance → Button
 * Color). Blank falls back to the primary, i.e. the original behaviour.
 *
 *   --eco-btn       flat fill, and the light end of the gradient fills
 *   --eco-btn-deep  the dark end, one brand→deep tone below the fill
 *   --eco-btn-ink   black or white, whichever stays readable on the fill
 *
 * A gradient pick uses the same two variables, but its stops are the two
 * colours as authored rather than one colour and a darker copy of it — so the
 * gradient families in index.css reproduce the pick exactly.
 */
export function buildButtonVars(button, primary) {
  const gradient = parseButtonGradient(button);
  const rgb = hexToRgb(gradient ? gradient.from : button) || hexToRgb(primary) || hexToRgb(DEFAULT_PRIMARY);
  const hex = toHex(rgb);
  const depth =
    rgbToHsl(hexToRgb(SAGE_RAMP[PRIMARY_TONE])).l -
    rgbToHsl(hexToRgb(SAGE_RAMP[BUTTON_DEEP_TONE])).l;
  const deep = gradient ? gradient.to : shiftLightness(hex, -depth);
  const deepRgb = hexToRgb(deep) || rgb;
  return {
    "--eco-btn": hex,
    "--eco-btn-rgb": `${rgb.r}, ${rgb.g}, ${rgb.b}`,
    "--eco-btn-deep": deep,
    "--eco-btn-deep-rgb": `${deepRgb.r}, ${deepRgb.g}, ${deepRgb.b}`,
    "--eco-btn-ink": gradient ? buttonInk(button) : readableInk(hex),
  };
}

/**
 * Write a ramp onto :root. No-op outside the browser.
 *
 * `button` is optional and independent of the ramp. The `data-btn-custom`
 * flag gates the override rules in index.css, so leaving it blank renders the
 * site byte-for-byte as it did before the setting existed. `data-btn-gradient`
 * additionally turns the flat-fill button families into a two-stop sweep, which
 * only a gradient pick wants.
 */
export function applyThemeRamp(primary, secondary, button) {
  if (typeof document === "undefined") return;
  const vars = { ...buildThemeRamp(primary, secondary), ...buildButtonVars(button, primary) };
  const root = document.documentElement;
  Object.keys(vars).forEach((name) => root.style.setProperty(name, vars[name]));
  const gradient = parseButtonGradient(button);
  if (hexToRgb(button) || gradient) root.setAttribute("data-btn-custom", "");
  else root.removeAttribute("data-btn-custom");
  if (gradient) root.setAttribute("data-btn-gradient", "");
  else root.removeAttribute("data-btn-gradient");
}

/** Relative luminance → picks black or white text for a swatch. */
export const readableInk = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#16211a";
  const channel = (v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const luminance = 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
  return luminance > 0.45 ? "#16211a" : "#ffffff";
};
