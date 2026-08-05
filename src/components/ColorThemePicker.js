import React from "react";
import { Check } from "lucide-react";
import {
  DEFAULT_PRIMARY,
  DEFAULT_SECONDARY,
  readableInk,
  parseButtonGradient,
  buttonBackground,
  buttonInk,
} from "../theme";

export { DEFAULT_PRIMARY, DEFAULT_SECONDARY, readableInk, parseButtonGradient, buttonBackground, buttonInk };

/**
 * Suggested brand colours, shared by Admin Portal → Settings → Appearance and
 * the member dashboard's Account Settings → Appearance panel.
 *
 * The site reads as one sage family, so the picker leads with that family
 * rather than a generic rainbow: the primary swatches are the darker half of
 * the sage ramp, and the secondary swatches are the lighter half plus two warm
 * neutrals that sit happily next to sage. `pairsWith` is the secondary we
 * recommend for each primary, used by the "Use suggested pair" shortcut.
 */
export const PRIMARY_COLOR_PRESETS = [
  { value: "#738a6e", name: "Sage", note: "Site default — the current brand green", pairsWith: "#f3f7f2" },
  { value: "#4f6b52", name: "Fern", note: "Deeper sage, stronger on white", pairsWith: "#dce5db" },
  { value: "#3e5744", name: "Forest", note: "Balanced dark green for headings", pairsWith: "#e8efe6" },
  { value: "#344c3d", name: "Deep Forest", note: "The ink green used across the site", pairsWith: "#bfcfbb" },
  { value: "#26382d", name: "Pine", note: "Near-black green, high contrast", pairsWith: "#f3f7f2" },
  { value: "#16211a", name: "Midnight Leaf", note: "Darkest green — reads almost black", pairsWith: "#dce5db" },
  { value: "#5f7a4b", name: "Olive Grove", note: "Warmer, more yellow-leaning green", pairsWith: "#efeade" },
  { value: "#42675f", name: "Eucalyptus Deep", note: "Cooler green with a teal cast", pairsWith: "#e3edea" },
];

/**
 * Accents from outside the green family, offered as their own group so the
 * greens above stay the obvious default.
 *
 * The accent doesn't just paint links — `buildThemeRamp` shifts the whole sage
 * ramp toward its hue, so anything here repaints the site. That rules out a
 * free-for-all: every entry is a *muted, natural* hue that already appears
 * somewhere in the brand (the logo's sky blue, harvest earth tones), and every
 * one clears 4.5:1 against white so link and button text stays legible.
 *
 * `pairsWith` deliberately points at the two neutral secondaries — Stone for
 * the cool picks, Warm Sand for the earthy ones — because a sage tint under a
 * blue accent reads as a mistake rather than a pairing.
 */
export const ACCENT_ALT_COLOR_PRESETS = [
  { value: "#1a7ab5", name: "Sky Blue", note: "The logo's blue — bright, still dark enough for white text", pairsWith: "#ecefec" },
  { value: "#22668d", name: "Deep Ocean", note: "Quieter navy-leaning blue for a formal look", pairsWith: "#ecefec" },
  { value: "#2f6b6b", name: "Lagoon Teal", note: "Half-way between the sage and the blues", pairsWith: "#ecefec" },
  { value: "#a4552f", name: "Terracotta", note: "Warm clay — the classic partner to green", pairsWith: "#efeade" },
  { value: "#996515", name: "Harvest Ochre", note: "Golden earth tone, harvest-leaning", pairsWith: "#efeade" },
  { value: "#7b3f5e", name: "Mulberry", note: "Deep berry for a bolder, richer site", pairsWith: "#ffffff" },
];

export const SECONDARY_COLOR_PRESETS = [
  { value: "#f3f7f2", name: "Mist", note: "Lightest sage tint — page backgrounds" },
  { value: "#ffffff", name: "Pure White", note: "Clean cards on a tinted page" },
  { value: "#dce5db", name: "Pale Sage", note: "Soft fills, table stripes, chips" },
  { value: "#bfcfbb", name: "Soft Sage", note: "Borders and quiet badges" },
  { value: "#a7bda3", name: "Sea Sage", note: "Mid tone — hover and active states" },
  { value: "#8ea58c", name: "Moss", note: "Strongest tint before it needs white text" },
  { value: "#efeade", name: "Warm Sand", note: "Warm neutral that flatters green" },
  { value: "#ecefec", name: "Stone", note: "Cool neutral grey-green" },
];

/**
 * Button colours. Unlike the two above this list is allowed off the sage
 * ramp: the whole point of picking buttons separately is to let the calls to
 * action stand away from the surfaces around them. The sage entries come
 * first so "on brand" stays the easy choice, and every value here clears
 * 4.5:1 against the ink `readableInk` picks for it.
 */
export const BUTTON_COLOR_PRESETS = [
  { value: "", name: "Automatic", note: "Site default — buttons ride the primary colour" },
  { value: "#4f6b52", name: "Fern", note: "Sage, a shade deeper than the surfaces" },
  { value: "#344c3d", name: "Deep Forest", note: "High-contrast green, very legible" },
  { value: "#26382d", name: "Pine", note: "Near-black green for a quiet, formal look" },
  { value: "#a4552f", name: "Terracotta", note: "Warm clay — stands out against sage" },
  { value: "#996515", name: "Ochre", note: "Golden earth tone, harvest-leaning" },
  { value: "#2f6b6b", name: "Teal", note: "Cool contrast that still reads natural" },
  { value: "#7b3f5e", name: "Mulberry", note: "Deep berry for a bolder call to action" },
];

/**
 * The original EcoEquity button gradients, kept as a separate list so they
 * read as their own choice rather than as odd entries among the flat colours.
 *
 * Before the site moved to the monochrome sage ramp its calls to action were
 * painted with the logo's mint-green → sky-blue sweep, and these are those
 * exact stops recovered from the pre-sage build: `#86efac → #7dd3fc` was the
 * button fill, `#065f46 → #0284c7` the deep heading sweep. A gradient pick is
 * stored as `"#from,#to"`, which `parseButtonGradient` in theme.js decodes.
 *
 * All three take dark ink, so the labels stay legible on the pale stops.
 */
export const BUTTON_GRADIENT_PRESETS = [
  {
    value: "#86efac,#7dd3fc",
    name: "EcoEquity Classic",
    note: "The original logo gradient — mint green into sky blue",
  },
  {
    value: "#a7f3d0,#e0f2fe",
    name: "Sea Glass",
    note: "The same sweep washed out toward white — soft and airy",
  },
  {
    value: "#065f46,#0284c7",
    name: "Deep Current",
    note: "Deep forest into ocean blue, with white labels",
  },
];

/** The secondary we suggest alongside a given primary — either accent group. */
export const suggestedPairFor = (primary) => {
  const wanted = String(primary || "").toLowerCase();
  const match = [...PRIMARY_COLOR_PRESETS, ...ACCENT_ALT_COLOR_PRESETS].find(
    (p) => p.value.toLowerCase() === wanted
  );
  return (match && match.pairsWith) || DEFAULT_SECONDARY;
};

const labelStyle = { fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.6)", textTransform: "uppercase" };
const hintStyle = { margin: "0 0 12px", fontSize: "11px", color: "rgba(0,0,0,0.5)" };
const hexInput = { width: "110px", padding: "8px 10px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.6)", fontSize: "12px", fontWeight: 700, outline: "none" };
const nativePicker = { width: "34px", height: "34px", padding: 0, border: "1px solid rgba(0,0,0,0.12)", borderRadius: "999px", background: "none", cursor: "pointer" };

/**
 * `fallback` paints the swatch for a preset whose value is the empty string —
 * the "follow the theme" entry in the button list, which has no colour of its
 * own and shows whatever it would inherit.
 */
function SwatchGrid({ presets, selectedValue, onSelect, ringColor, fallback }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
      {presets.map((preset) => {
        const selected = preset.value.toLowerCase() === String(selectedValue || "").toLowerCase();
        const base = preset.value || fallback || DEFAULT_PRIMARY;
        // Gradient presets paint the sweep itself, so the swatch shows what the
        // button will actually look like. The selection ring can't take a
        // gradient, so it falls back to the first stop.
        const gradient = parseButtonGradient(base);
        const fill = buttonBackground(base);
        const ring = ringColor || (gradient ? gradient.from : base);
        // The inherit entry has no colour of its own, so a dashed edge tells it
        // apart from the preset that happens to be the same colour.
        const inherited = !preset.value;
        return (
          <button
            key={preset.value || "inherit"}
            type="button"
            onClick={() => onSelect(preset.value)}
            aria-label={preset.name}
            aria-pressed={selected}
            title={preset.note ? `${preset.name} — ${preset.note}` : preset.name}
            style={{
              width: "34px",
              height: "34px",
              padding: 0,
              borderRadius: "999px",
              background: fill,
              color: buttonInk(base),
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: inherited ? "2px dashed rgba(0,0,0,0.35)" : "1px solid rgba(0,0,0,0.12)",
              boxShadow: selected ? `0 0 0 2px rgba(255,255,255,0.9), 0 0 0 4px ${ring}` : "none",
              transition: "box-shadow 0.2s ease",
            }}
          >
            {selected && <Check size={16} strokeWidth={3} />}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Primary + secondary colour chooser with a live preview.
 *
 * Presentation only — the caller owns the values and decides where they are
 * saved (site-wide admin settings, or one member's own preference).
 */
export default function ColorThemePicker({
  primary,
  secondary,
  button,
  onChangePrimary,
  onChangeSecondary,
  onChangeButton,
  previewTitle = "EcoEquity",
  previewNote,
  footer,
}) {
  const activePrimary = primary || DEFAULT_PRIMARY;
  const activeSecondary = secondary || DEFAULT_SECONDARY;
  // Blank means "follow the primary", which is exactly what the site does
  // when no button colour has been picked.
  const activeButton = button || activePrimary;
  // Non-null only for a two-stop pick; the flat path below is unchanged.
  const buttonGradient = parseButtonGradient(activeButton);
  const buttonFill = buttonBackground(activeButton);
  const buttonLabelInk = buttonInk(activeButton);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Primary — buttons, links, active states. */}
      <div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "12px", marginBottom: "4px", flexWrap: "wrap" }}>
          <label style={labelStyle}>Primary Color</label>
          <span style={{ fontSize: "11px", color: "rgba(0,0,0,0.45)", fontWeight: 600 }}>Buttons, links and active states</span>
        </div>
        <p style={hintStyle}>Every suggestion below is from the site's sage family and stays readable with white text.</p>
        <SwatchGrid presets={PRIMARY_COLOR_PRESETS} selectedValue={activePrimary} onSelect={onChangePrimary} />

        {/* Kept as its own group: these repaint the whole ramp, not just the
            links, so they should read as a deliberate departure from sage. */}
        <div style={{ marginTop: "16px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "rgba(0,0,0,0.5)", textTransform: "uppercase", marginBottom: "4px" }}>
            Beyond green
          </div>
          <p style={hintStyle}>
            Muted blues and earth tones that still sit well with the site's photography. Picking one shifts every
            surface toward that hue, so the page stays one family rather than green with a blue button.
          </p>
          <SwatchGrid presets={ACCENT_ALT_COLOR_PRESETS} selectedValue={activePrimary} onSelect={onChangePrimary} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "12px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "rgba(0,0,0,0.5)", textTransform: "uppercase" }}>Custom</span>
          <input type="color" value={activePrimary} onChange={(e) => onChangePrimary(e.target.value)} className="eco-color-dot" style={nativePicker} />
          <input type="text" value={primary || ""} onChange={(e) => onChangePrimary(e.target.value)} placeholder={DEFAULT_PRIMARY} style={hexInput} />
          <button
            onClick={() => onChangeSecondary(suggestedPairFor(activePrimary))}
            style={{ padding: "8px 14px", borderRadius: "8px", background: "rgba(var(--eco-c9-rgb), 0.12)", border: "1px solid rgba(var(--eco-c9-rgb), 0.35)", color: "var(--eco-c13)", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
          >
            Use suggested pair
          </button>
        </div>
      </div>

      {/* Secondary — surfaces, fills, quiet borders. */}
      <div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "12px", marginBottom: "4px", flexWrap: "wrap" }}>
          <label style={labelStyle}>Secondary Color</label>
          <span style={{ fontSize: "11px", color: "rgba(0,0,0,0.45)", fontWeight: 600 }}>Section backgrounds, cards and chips</span>
        </div>
        <p style={hintStyle}>Lighter tints of the same family, plus two neutrals that keep text legible on top.</p>
        <SwatchGrid presets={SECONDARY_COLOR_PRESETS} selectedValue={activeSecondary} onSelect={onChangeSecondary} ringColor="var(--eco-c9)" />
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "12px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "rgba(0,0,0,0.5)", textTransform: "uppercase" }}>Custom</span>
          <input type="color" value={activeSecondary} onChange={(e) => onChangeSecondary(e.target.value)} className="eco-color-dot" style={nativePicker} />
          <input type="text" value={secondary || ""} onChange={(e) => onChangeSecondary(e.target.value)} placeholder={DEFAULT_SECONDARY} style={hexInput} />
        </div>
      </div>

      {/* Button — filled calls to action, picked independently of the ramp.
          Only rendered when the caller can store it. */}
      {onChangeButton && (
        <div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "12px", marginBottom: "4px", flexWrap: "wrap" }}>
            <label style={labelStyle}>Button Color</label>
            <span style={{ fontSize: "11px", color: "rgba(0,0,0,0.45)", fontWeight: 600 }}>Filled buttons and calls to action</span>
          </div>
          <p style={hintStyle}>
            On Automatic, buttons stay part of the theme. Pick a colour and only the filled buttons change —
            outlined and tinted buttons keep following the ramp. The label switches between black and white on
            its own so it stays readable.
          </p>
          <SwatchGrid
            presets={BUTTON_COLOR_PRESETS}
            selectedValue={button || ""}
            onSelect={onChangeButton}
            fallback={activePrimary}
          />

          {/* The pre-sage logo gradients, kept apart from the flat swatches
              because they behave differently: every filled button becomes a
              two-stop sweep rather than one colour. */}
          <div style={{ marginTop: "16px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "rgba(0,0,0,0.5)", textTransform: "uppercase", marginBottom: "4px" }}>
              Gradients
            </div>
            <p style={hintStyle}>
              The original EcoEquity look — the logo's green-to-blue sweep across every filled button.
            </p>
            <SwatchGrid
              presets={BUTTON_GRADIENT_PRESETS}
              selectedValue={button || ""}
              onSelect={onChangeButton}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "12px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "rgba(0,0,0,0.5)", textTransform: "uppercase" }}>Custom</span>
            {/* A native colour input can only hold one hex, so on a gradient
                pick it shows the first stop and editing it drops back to a
                flat colour — which is what moving that control means. */}
            <input type="color" value={buttonGradient ? buttonGradient.from : activeButton} onChange={(e) => onChangeButton(e.target.value)} className="eco-color-dot" style={nativePicker} />
            <input type="text" value={button || ""} onChange={(e) => onChangeButton(e.target.value)} placeholder="Follows primary" style={{ ...hexInput, width: buttonGradient ? "170px" : hexInput.width }} />
            {button && (
              <button
                onClick={() => onChangeButton("")}
                title="Go back to following the primary colour"
                style={{ padding: "8px 14px", borderRadius: "8px", background: "rgba(var(--eco-c9-rgb), 0.12)", border: "1px solid rgba(var(--eco-c9-rgb), 0.35)", color: "var(--eco-c13)", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
              >
                Back to automatic
              </button>
            )}
          </div>
        </div>
      )}

      {/* Live preview so the pair can be judged together, not swatch by swatch. */}
      <div>
        <label style={{ ...labelStyle, display: "block", marginBottom: "8px" }}>Preview</label>
        <div style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(0,0,0,0.06)", background: activeSecondary }}>
          <div style={{ padding: "14px 18px", background: activePrimary, color: readableInk(activePrimary), fontSize: "14px", fontWeight: 800 }}>
            {previewTitle}
          </div>
          <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: readableInk(activeSecondary) }}>Grow food, share surplus, earn EcoPoints.</div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ padding: "9px 18px", borderRadius: "999px", background: buttonFill, color: buttonLabelInk, fontSize: "12px", fontWeight: 800 }}>Primary button</span>
              <span style={{ padding: "9px 18px", borderRadius: "999px", background: "rgba(255,255,255,0.7)", border: `1.5px solid ${activePrimary}`, color: activePrimary, fontSize: "12px", fontWeight: 800 }}>Secondary button</span>
              <span style={{ fontSize: "12px", fontWeight: 700, color: activePrimary, textDecoration: "underline" }}>Text link</span>
            </div>
          </div>
        </div>
        {previewNote && <p style={{ fontSize: "11px", color: "rgba(0,0,0,0.5)", marginTop: "8px" }}>{previewNote}</p>}
      </div>

      {footer}
    </div>
  );
}
