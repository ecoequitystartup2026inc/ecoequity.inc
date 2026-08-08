import React, { useRef, useState } from "react";

export const timelineData = [
  {
    year: "1980",
    tag: "Root Cause",
    heading: "Shift from Self-Sufficiency to Import Dependency",
    body: "The Peso devaluation (1980s Debt Crisis) made imported inputs expensive, immediately followed by WTO liberalization (1995). This killed local farmer profitability and formally cemented the reliance on cheap rice imports.",
  },
  {
    year: "2000",
    tag: "Policy Shift",
    heading: "WTO Accession & Trade Liberalization",
    body: "Cheap imports flooded the market, making local crops unprofitable. Policy formally shifted to Import-Based Security, severely reducing domestic food sufficiency.",
  },
  {
    year: "2010",
    tag: "Price Shocks",
    heading: "Global Price Shocks & Rapid Urbanization",
    body: "Import dependency caused high USD rates to translate to inaccessible domestic food prices. Rapid conversion of farmland further reduced productive capacity, heightening scarcity in urban areas.",
  },
  {
    year: "2020",
    tag: "Fragility",
    heading: "Pandemic & Supply-Chain Fragility",
    body: "Global supply shocks demonstrated the inability to sustain the population without external aid. Chronic high food inflation coupled with low employment made food fundamentally unaffordable and inaccessible for many Filipinos.",
  },
];

const LAST = timelineData.length - 1;

/**
 * The "Problem Addressed" timeline: a horizontal row of year circles, with the
 * selected year's detail shown in the panel below. Lives in the Problem
 * Addressed band at the foot of Learn More — its own Explore More page was
 * folded into that band, so `maxWidth` is how a host sizes the track.
 *
 * Built as a tablist — one year is always selected, and arrow keys move between
 * them, which is what the roving tabIndex below is for.
 */
function ProblemTimeline({ isMobile = false, initialIndex = 0, maxWidth = 660 }) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const nodeRefs = useRef([]);

  const nodeSize = isMobile ? 52 : 68;

  const onKeyDown = (e) => {
    const moves = {
      ArrowRight: Math.min(activeIndex + 1, LAST),
      ArrowLeft: Math.max(activeIndex - 1, 0),
      Home: 0,
      End: LAST,
    };
    const next = moves[e.key];
    if (next === undefined) return;
    e.preventDefault();
    setActiveIndex(next);
    nodeRefs.current[next]?.focus();
  };

  // Centre of the active circle, used to place the stem that links the selected
  // year down to its panel.
  const activeCentre = `calc(var(--node) / 2 + ${activeIndex} * ((100% - var(--node)) / ${LAST}))`;

  return (
    <div
      style={{
        ...styles.timeline,
        maxWidth: `${maxWidth}px`,
        ...(isMobile ? styles.timelineMobile : {}),
      }}
      data-testid="timeline-container"
    >
      <style>
        {`
          @keyframes ptPanelIn {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          /* ── Year track ─────────────────────────────────────── */
          .pt-track {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            padding: 4px 0;
          }
          .pt-rail, .pt-rail-fill {
            position: absolute;
            left: calc(var(--node) / 2);
            right: calc(var(--node) / 2);
            top: calc(50% - 1px);
            height: 2px;
            border-radius: 999px;
            pointer-events: none;
          }
          .pt-rail { background: rgba(0,0,0,0.09); }
          .pt-rail-fill {
            background: linear-gradient(90deg, var(--eco-c6), var(--eco-c7));
            transform: scaleX(var(--p));
            transform-origin: left center;
            transition: transform .5s cubic-bezier(.22,1,.36,1);
          }

          .pt-node {
            position: relative;
            z-index: 1;
            flex-shrink: 0;
            width: var(--node);
            height: var(--node);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            font-family: inherit;
            font-size: 16px;
            font-weight: 700;
            letter-spacing: -0.3px;
            cursor: pointer;
            color: var(--eco-c13);
            background: rgba(255,255,255,0.82);
            border: 1px solid rgba(var(--eco-c11-rgb), 0.18);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.9), 0 6px 16px rgba(var(--eco-c11-rgb), 0.10);
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            transition: transform .35s cubic-bezier(.34,1.56,.64,1),
                        box-shadow .35s ease, background .35s ease,
                        color .35s ease, border-color .35s ease;
          }
          @media (max-width: 767px) { .pt-node { font-size: 13px; } }
          .pt-node:hover { transform: scale(1.06); }
          .pt-node:focus-visible { outline: 2px solid var(--eco-c7); outline-offset: 3px; }
          .pt-node[aria-selected="true"] {
            color: #fff;
            background: linear-gradient(145deg, var(--eco-c6), var(--eco-c7));
            border-color: transparent;
            transform: scale(1.06);
            box-shadow: 0 0 0 5px rgba(var(--eco-c6-rgb), 0.16), 0 10px 24px rgba(var(--eco-c7-rgb), 0.32);
            cursor: default;
          }

          /* Stem tying the selected circle to the panel below it */
          .pt-stem {
            position: absolute;
            top: 100%;
            width: 2px;
            height: 22px;
            margin-left: -1px;
            border-radius: 999px;
            background: linear-gradient(180deg, rgba(var(--eco-c7-rgb), 0.85), rgba(var(--eco-c7-rgb), 0.12));
            pointer-events: none;
            transition: left .5s cubic-bezier(.22,1,.36,1);
          }
          @media (max-width: 767px) { .pt-stem { height: 16px; } }

          /* ── Detail panels ──────────────────────────────────── */
          /* All panels share one grid cell, so the container is as tall as the
             longest entry and switching years cross-fades without the layout
             below jumping around. */
          .pt-panels {
            display: grid;
            width: 100%;
            margin-top: 22px;
          }
          @media (max-width: 767px) { .pt-panels { margin-top: 16px; } }

          .pt-panel {
            grid-area: 1 / 1;
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
            text-align: left;
            border-radius: 18px;
            padding: 18px 22px 20px 24px;
            background: linear-gradient(150deg, rgba(255,255,255,0.74), rgba(255,255,255,0.46));
            border: 1px solid rgba(var(--eco-c7-rgb), 0.22);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.9), 0 14px 32px rgba(var(--eco-c11-rgb), 0.10);
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            opacity: 0;
            pointer-events: none;
            transition: opacity .3s ease;
          }
          @media (max-width: 767px) {
            .pt-panel { padding: 14px 16px 16px 18px; border-radius: 15px; }
          }
          .pt-panel.is-active {
            opacity: 1;
            pointer-events: auto;
            animation: ptPanelIn .45s cubic-bezier(.22,1,.36,1) both;
          }

          .pt-panel__edge {
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 3px;
            border-radius: 0 3px 3px 0;
            background: linear-gradient(180deg, var(--eco-c6), var(--eco-c5));
          }
          .pt-panel__tag {
            padding: 3px 10px;
            border-radius: 999px;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.7px;
            text-transform: uppercase;
            color: var(--eco-c13);
            background: rgba(var(--eco-c6-rgb), 0.16);
          }
          .pt-panel__heading {
            display: block;
            margin: 0;
            font-size: 17px;
            font-weight: 700;
            color: #000;
            letter-spacing: -0.2px;
            line-height: 1.35;
          }
          @media (max-width: 767px) { .pt-panel__heading { font-size: 14.5px; } }
          .pt-panel__body {
            margin: 2px 0 0;
            font-size: 13.5px;
            line-height: 1.65;
            color: rgba(0,0,0,0.68);
          }
          @media (max-width: 767px) {
            .pt-panel__body { font-size: 12.5px; line-height: 1.55; }
          }

          @media (prefers-reduced-motion: reduce) {
            .pt-node, .pt-rail-fill, .pt-stem, .pt-panel { transition: none; }
            .pt-node:hover, .pt-node[aria-selected="true"] { transform: none; }
            .pt-panel.is-active { animation: none; }
          }
        `}
      </style>

      <div
        className="pt-track"
        role="tablist"
        aria-label="Timeline of Philippine food-security milestones"
        style={{ "--node": `${nodeSize}px`, "--p": activeIndex / LAST }}
        onKeyDown={onKeyDown}
      >
        <div className="pt-rail" aria-hidden="true" />
        <div className="pt-rail-fill" aria-hidden="true" />
        <div className="pt-stem" aria-hidden="true" style={{ left: activeCentre }} />

        {timelineData.map((item, i) => {
          const isActive = activeIndex === i;
          return (
            <button
              key={item.year}
              ref={(el) => {
                nodeRefs.current[i] = el;
              }}
              type="button"
              className="pt-node"
              role="tab"
              id={`pt-tab-${item.year}`}
              aria-selected={isActive}
              aria-controls={`pt-panel-${item.year}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveIndex(i)}
            >
              {item.year}
            </button>
          );
        })}
      </div>

      <div className="pt-panels">
        {timelineData.map((item, i) => {
          const isActive = activeIndex === i;
          return (
            <div
              key={item.year}
              className={`pt-panel${isActive ? " is-active" : ""}`}
              role="tabpanel"
              id={`pt-panel-${item.year}`}
              aria-labelledby={`pt-tab-${item.year}`}
              aria-hidden={!isActive}
            >
              <span className="pt-panel__edge" aria-hidden="true" />
              <span className="pt-panel__tag">{item.tag}</span>
              <span className="pt-panel__heading" role="heading" aria-level="3">
                {item.heading}
              </span>
              <p className="pt-panel__body">{item.body}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  timeline: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignSelf: "center",
    marginTop: "12px",
    width: "100%",
  },
  timelineMobile: {
    marginTop: "4px",
    padding: "0 4px",
  },
};

export default ProblemTimeline;
