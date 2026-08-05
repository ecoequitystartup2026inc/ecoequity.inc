import React from "react";

/**
 * Profile-dashboard design system.
 *
 * The nine sections behind the avatar menu (Profile Settings, My Certificate,
 * Earn History, EcoPoints & Rewards, Order History, Updates, Wishlist, Support
 * Tickets, Settings) each grew their own headings, card chrome and empty
 * states, so moving between tabs felt like moving between products: five
 * different card radii, three shades of "muted" label text, native checkboxes
 * next to hand-built pills, and headings that were sometimes 24px/800 and
 * sometimes not.
 *
 * Everything here is that vocabulary written down once. Sections should reach
 * for these instead of re-deriving a card or a heading inline.
 */

// --- Tokens ----------------------------------------------------------------

export const DASH = {
  ink: "var(--eco-c19)",
  inkSoft: "rgba(var(--eco-c19-rgb), 0.62)",
  inkFaint: "rgba(var(--eco-c19-rgb), 0.42)",
  green: "var(--eco-c11)",
  greenBright: "var(--eco-c9)",
  rose: "var(--eco-c9)",
  amber: "var(--eco-c11)",
  sky: "var(--eco-c9)",
  violet: "var(--eco-c9)",
  line: "rgba(var(--eco-c19-rgb), 0.07)",
  radius: 18,
  radiusSm: 12,
};

/** Tinted surfaces for pills, icon chips and stat accents. */
export const TONES = {
  green: { fg: "var(--eco-c11)", bg: "rgba(var(--eco-c9-rgb), 0.10)", edge: "rgba(var(--eco-c9-rgb), 0.20)" },
  rose: { fg: "var(--eco-c9)", bg: "rgba(var(--eco-c9-rgb), 0.09)", edge: "rgba(var(--eco-c9-rgb), 0.20)" },
  amber: { fg: "var(--eco-c11)", bg: "rgba(var(--eco-c7-rgb), 0.12)", edge: "rgba(var(--eco-c7-rgb), 0.22)" },
  sky: { fg: "var(--eco-c9)", bg: "rgba(var(--eco-c9-rgb), 0.10)", edge: "rgba(var(--eco-c9-rgb), 0.20)" },
  violet: { fg: "var(--eco-c9)", bg: "rgba(var(--eco-c9-rgb), 0.10)", edge: "rgba(var(--eco-c9-rgb), 0.20)" },
  slate: { fg: "rgba(var(--eco-c19-rgb), 0.62)", bg: "rgba(var(--eco-c19-rgb), 0.05)", edge: "rgba(var(--eco-c19-rgb), 0.10)" },
};

export const tone = (name) => TONES[name] || TONES.slate;

/** The standard content surface. One radius, one border, one shadow. */
export const dashCard = {
  background: "rgba(255,255,255,0.72)",
  border: `1px solid ${DASH.line}`,
  borderRadius: `${DASH.radius}px`,
  boxShadow: "0 8px 22px rgba(var(--eco-c19-rgb), 0.04), inset 0 1px 0 rgba(255,255,255,0.8)",
  boxSizing: "border-box",
};

/** A card that is also a list row: same surface, tighter padding, hover lift. */
export const dashRow = {
  ...dashCard,
  padding: "16px 18px",
  display: "flex",
  alignItems: "center",
  gap: "14px",
  transition: "transform 0.18s ease, box-shadow 0.18s ease",
};

/** Uppercase micro-label used above values throughout the dashboard. */
export const dashLabel = {
  fontSize: "11px",
  fontWeight: 800,
  color: DASH.inkFaint,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

export const dashValue = { fontSize: "14px", fontWeight: 700, color: "rgba(var(--eco-c19-rgb), 0.85)" };

/** Form field chrome, shared by every editable field on the dashboard. */
export const dashInput = {
  width: "100%",
  padding: "13px 15px",
  borderRadius: `${DASH.radiusSm}px`,
  border: `1px solid ${DASH.line}`,
  background: "rgba(255,255,255,0.85)",
  fontSize: "14px",
  color: DASH.ink,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color 0.18s ease, box-shadow 0.18s ease",
};

/** The one primary action style — mint/sky gradient, used for the main CTA. */
export const dashPrimaryBtn = {
  padding: "13px 20px",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.35)",
  background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.95), rgba(var(--eco-c5-rgb), 0.95))",
  color: DASH.ink,
  fontSize: "14px",
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 14px 30px rgba(var(--eco-c7-rgb), 0.24), inset 0 1px 0 rgba(255,255,255,0.48)",
  transition: "transform 0.18s ease",
  fontFamily: "inherit",
};

/** Secondary/ghost action, and its tinted destructive variant. */
export const dashGhostBtn = {
  padding: "11px 16px",
  borderRadius: "999px",
  border: `1px solid ${DASH.line}`,
  background: "rgba(255,255,255,0.7)",
  color: "rgba(var(--eco-c19-rgb), 0.72)",
  fontSize: "13px",
  fontWeight: 700,
  cursor: "pointer",
  transition: "all 0.18s ease",
  fontFamily: "inherit",
};

export const dashToneBtn = (name) => ({
  ...dashGhostBtn,
  background: tone(name).bg,
  border: `1px solid ${tone(name).edge}`,
  color: tone(name).fg,
});

// --- Components -------------------------------------------------------------

/** Section title + one-line explainer, with an optional right-hand action. */
export function SectionHead({ title, subtitle, action, isMobile }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: isMobile ? "flex-start" : "center",
        justifyContent: "space-between",
        flexDirection: isMobile ? "column" : "row",
        gap: "12px",
        marginBottom: "20px",
        paddingBottom: "16px",
        /* The modal's close button floats over this row's right end on desktop,
           so the action keeps clear of it rather than tucking underneath. */
        paddingRight: isMobile ? 0 : "52px",
        borderBottom: `1px solid ${DASH.line}`,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <h2 style={{ margin: 0, fontSize: "23px", fontWeight: 850, color: DASH.ink, letterSpacing: "-0.4px" }}>{title}</h2>
        {subtitle && (
          <p style={{ margin: "5px 0 0", fontSize: "13px", color: DASH.inkSoft, lineHeight: 1.5 }}>{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

/** Small colour-coded status/category chip. */
export function Pill({ children, tone: toneName = "slate", title }) {
  const t = tone(toneName);
  return (
    <span
      title={title}
      style={{
        padding: "4px 10px",
        borderRadius: "999px",
        background: t.bg,
        color: t.fg,
        border: `1px solid ${t.edge}`,
        fontSize: "11px",
        fontWeight: 800,
        whiteSpace: "nowrap",
        lineHeight: 1.6,
      }}
    >
      {children}
    </span>
  );
}

/** Rounded tinted square holding a section or row icon. */
export function IconChip({ children, tone: toneName = "green", size = 42 }) {
  const t = tone(toneName);
  return (
    <span
      style={{
        width: `${size}px`,
        height: `${size}px`,
        flexShrink: 0,
        borderRadius: `${Math.round(size / 3.2)}px`,
        background: t.bg,
        border: `1px solid ${t.edge}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: t.fg,
      }}
    >
      {children}
    </span>
  );
}

/**
 * The at-a-glance row that opens most sections. `items` are
 * { label, value, tone?, hint? } — value carries the emphasis, hint explains it.
 */
export function StatStrip({ items, isMobile }) {
  if (!items || !items.length) return null;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : `repeat(${items.length}, minmax(0, 1fr))`,
        gap: "12px",
        marginBottom: "18px",
      }}
    >
      {items.map((item) => (
        <div key={item.label} style={{ ...dashCard, padding: "14px 16px" }}>
          <div style={dashLabel}>{item.label}</div>
          <div
            style={{
              marginTop: "6px",
              fontSize: "26px",
              fontWeight: 850,
              lineHeight: 1.1,
              color: item.tone ? tone(item.tone).fg : DASH.ink,
            }}
          >
            {item.value}
          </div>
          {item.hint && (
            <div style={{ marginTop: "3px", fontSize: "11.5px", fontWeight: 600, color: DASH.inkFaint, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.hint}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/** Consistent "nothing here yet" panel, with room for a call to action. */
export function EmptyState({ icon, title, body, action }) {
  return (
    <div
      style={{
        padding: "44px 26px",
        borderRadius: `${DASH.radius}px`,
        background: "rgba(255,255,255,0.55)",
        border: `1px dashed rgba(var(--eco-c19-rgb), 0.14)`,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "14px",
      }}
    >
      {icon && <IconChip size={52} tone="green">{icon}</IconChip>}
      <div>
        <h3 style={{ margin: "0 0 6px", fontSize: "17px", fontWeight: 850, color: DASH.ink }}>{title}</h3>
        {body && <p style={{ margin: 0, fontSize: "13px", color: DASH.inkSoft, lineHeight: 1.55, maxWidth: "420px" }}>{body}</p>}
      </div>
      {action}
    </div>
  );
}

/**
 * Switch replacing the native checkbox. The native control stays in the tree
 * (visually hidden) so the label, keyboard focus and form semantics still work.
 */
export function Toggle({ checked, onChange, label, hint }) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "12px 0",
        cursor: "pointer",
      }}
    >
      <input
        type="checkbox"
        checked={Boolean(checked)}
        onChange={onChange}
        style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
      />
      <span
        aria-hidden="true"
        style={{
          width: "44px",
          height: "26px",
          flexShrink: 0,
          borderRadius: "999px",
          background: checked ? "linear-gradient(135deg, var(--eco-c6), var(--eco-c7))" : "rgba(var(--eco-c19-rgb), 0.14)",
          boxShadow: checked ? "0 6px 16px rgba(var(--eco-c7-rgb), 0.32)" : "inset 0 1px 3px rgba(var(--eco-c19-rgb), 0.12)",
          position: "relative",
          transition: "background 0.22s ease, box-shadow 0.22s ease",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: "3px",
            left: checked ? "21px" : "3px",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 2px 6px rgba(var(--eco-c19-rgb), 0.22)",
            transition: "left 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block", fontSize: "14px", fontWeight: 700, color: DASH.ink }}>{label}</span>
        {hint && <span style={{ display: "block", fontSize: "12px", color: DASH.inkSoft, marginTop: "2px" }}>{hint}</span>}
      </span>
    </label>
  );
}

/**
 * Product photo with the catalog emoji as fallback. The wishlist used to show
 * the same generic sprout for every saved item, which made a list of six
 * products read as one repeated row.
 */
export function ProductThumb({ src, alt, emoji, size = 54 }) {
  const [errored, setErrored] = React.useState(false);
  const box = {
    width: `${size}px`,
    height: `${size}px`,
    flexShrink: 0,
    borderRadius: "14px",
    background: TONES.green.bg,
    border: `1px solid ${TONES.green.edge}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    fontSize: `${Math.round(size / 2.2)}px`,
  };
  if (!src || errored) return <span style={box}>{emoji}</span>;
  return (
    <span style={box}>
      <img
        src={src}
        alt={alt || ""}
        loading="lazy"
        onError={() => setErrored(true)}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </span>
  );
}

/** Label/value pair used by the read-only account panels. */
export function Field({ label, value, tone: toneName }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
      <span style={dashLabel}>{label}</span>
      <span style={{ ...dashValue, color: toneName ? tone(toneName).fg : dashValue.color, wordBreak: "break-word" }}>
        {value}
      </span>
    </div>
  );
}

/**
 * Thin progress meter — tier progress, badge progress and "how close is this
 * reward" all used to hand-roll their own two nested divs with slightly
 * different heights and radii.
 */
export function MeterBar({ percent, height = 8, tone: toneName = "green" }) {
  const t = tone(toneName);
  return (
    <div style={{ width: "100%", height: `${height}px`, background: t.bg, borderRadius: "999px", overflow: "hidden" }}>
      <div
        style={{
          height: "100%",
          width: `${Math.min(100, Math.max(0, Number(percent) || 0))}%`,
          background: "linear-gradient(90deg, var(--eco-c6), var(--eco-c9))",
          borderRadius: "999px",
          transition: "width 0.4s ease",
        }}
      />
    </div>
  );
}

/**
 * One reward in the marketplace, in the two sizes the dashboard needs.
 *
 * The card is the single place that knows what an unaffordable, sold-out or
 * already-claimed reward looks like — `state` comes from rewardAvailability()
 * in data/ecoProgram, so desktop and mobile can never disagree about whether
 * something is claimable. `icon` is passed in already rendered because this
 * module deliberately knows nothing about the EcoPoints icon table.
 */
export function RewardCard({ reward, state, icon, onRedeem, compact = false }) {
  const blocked = !state.canRedeem;
  const stockLabel = state.remaining !== null
    ? `${state.remaining.toLocaleString()} of ${state.stock.toLocaleString()} left`
    : null;

  return (
    <div
      style={{
        ...dashCard,
        padding: compact ? "12px" : "16px",
        display: "flex",
        flexDirection: "column",
        gap: compact ? "7px" : "10px",
        position: "relative",
        opacity: state.soldOut ? 0.62 : 1,
        borderColor: state.canRedeem ? TONES.green.edge : DASH.line,
      }}
    >
      {!compact && (
        <div
          style={{
            height: "110px",
            borderRadius: `${DASH.radiusSm}px`,
            background: state.canRedeem ? TONES.green.bg : "rgba(var(--eco-c19-rgb), 0.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {reward.badge && (
            <span style={{ position: "absolute", top: "8px", left: "8px" }}>
              <Pill tone={reward.featured ? "amber" : "green"}>{reward.badge}</Pill>
            </span>
          )}
          {state.canRedeem && (
            <span style={{ position: "absolute", top: "8px", right: "8px" }}>
              <Pill tone="green">Redeemable</Pill>
            </span>
          )}
          <span style={{ filter: state.soldOut ? "grayscale(100%)" : "none" }}>{icon}</span>
        </div>
      )}

      {compact && <span style={{ filter: state.soldOut ? "grayscale(100%)" : "none" }}>{icon}</span>}

      <div style={{ display: "flex", flexDirection: "column", gap: "3px", minWidth: 0 }}>
        <h4 style={{ margin: 0, fontSize: compact ? "11.5px" : "15px", fontWeight: 800, color: DASH.ink, lineHeight: 1.2 }}>
          {compact ? (reward.shortTitle || reward.title) : reward.title}
        </h4>
        {!compact && reward.description && (
          <p style={{ margin: 0, fontSize: "12px", color: DASH.inkSoft, lineHeight: 1.45 }}>{reward.description}</p>
        )}
        <span style={{ fontSize: compact ? "11px" : "14px", fontWeight: 800, color: DASH.green }}>
          {state.cost.toLocaleString()} pts
        </span>
      </div>

      {/* An unaffordable reward is the interesting case: show how close it is
          rather than a dead button with no explanation. */}
      {!state.affordable && !state.soldOut && (
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <MeterBar percent={state.percent} height={compact ? 5 : 6} />
          <span style={{ fontSize: compact ? "9.5px" : "11.5px", fontWeight: 700, color: DASH.inkFaint }}>
            {state.missing.toLocaleString()} pts to go
          </span>
        </div>
      )}

      {(stockLabel || state.limitReached || state.myClaims > 0) && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {stockLabel && <Pill tone={state.soldOut ? "slate" : "amber"}>{stockLabel}</Pill>}
          {state.myClaims > 0 && <Pill tone="sky">Claimed {state.myClaims}×</Pill>}
        </div>
      )}

      <button
        type="button"
        onClick={() => onRedeem(reward)}
        disabled={blocked}
        title={blocked ? state.reason : undefined}
        style={{
          ...dashPrimaryBtn,
          marginTop: "auto",
          width: "100%",
          padding: compact ? "9px 10px" : "11px 14px",
          minHeight: compact ? "40px" : undefined,
          fontSize: compact ? "12px" : "13px",
          cursor: blocked ? "not-allowed" : "pointer",
          ...(blocked
            ? {
                background: "rgba(var(--eco-c19-rgb), 0.05)",
                border: `1px solid ${DASH.line}`,
                color: DASH.inkFaint,
                boxShadow: "none",
              }
            : null),
        }}
        onMouseEnter={(e) => { if (!blocked) e.currentTarget.style.transform = "scale(1.03)"; }}
        onMouseLeave={(e) => { if (!blocked) e.currentTarget.style.transform = "scale(1)"; }}
      >
        {state.soldOut ? "Fully claimed" : state.limitReached ? "Limit reached" : state.affordable ? "Redeem" : `Need ${state.missing.toLocaleString()} pts`}
      </button>
    </div>
  );
}

/** Titled panel — a card with a heading and optional explainer. */
export function Panel({ title, subtitle, children, right, style }) {
  return (
    <div style={{ ...dashCard, padding: "20px 22px", ...style }}>
      {(title || right) && (
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: subtitle ? "14px" : "16px" }}>
          <div style={{ minWidth: 0 }}>
            {title && <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 850, color: DASH.ink }}>{title}</h3>}
            {subtitle && <p style={{ margin: "4px 0 0", fontSize: "12.5px", color: DASH.inkSoft, lineHeight: 1.5 }}>{subtitle}</p>}
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}
