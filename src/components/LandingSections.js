import React, { useEffect, useState } from "react";
import Reveal, { RevealStyles, useInView, prefersReducedMotion } from "./Reveal";
import ComingSoonBanner from "./ComingSoonBanner";
import {
  Store, Wrench, Microscope, Handshake, GraduationCap, Users,
  Sprout, HeartPulse, TrendingUp, ArrowRight, Sparkles, Leaf, Check,
} from "lucide-react";

/* ── Landing page sections that live BELOW the hero ──────────────────────
   The hero occupies exactly one screen; everything here is the reward for
   scrolling. Colours/glass are lifted from the hero so the fold is
   invisible: white-to-mint glass, green→sky gradients, hairline borders. */

const INK = "var(--eco-c19)";
const INK_SOFT = "rgba(var(--eco-c19-rgb), 0.6)";
const GREEN = "var(--eco-c9)";
const SKY = "var(--eco-c6)";

const FEATURES = [
  {
    nav: "Shop All Products",
    Icon: Store,
    title: "Farm-Direct Shop",
    body: "Harvests, seeds and supplies sourced straight from local growers — no middleman markup.",
  },
  {
    nav: "Starter Kits & Toolsets",
    Icon: Wrench,
    title: "Starter Kits",
    body: "Everything a first-time grower needs, boxed and ready to plant this weekend.",
  },
  {
    nav: "AIPlantDoctor",
    Icon: Microscope,
    title: "AI Plant Doctor",
    body: "Snap a photo of a sick leaf and get a diagnosis with a treatment plan in seconds.",
  },
  {
    nav: "SurplusExchangePage",
    Icon: Handshake,
    title: "Surplus Exchange",
    body: "Trade the extra harvest with neighbours instead of letting good food spoil.",
  },
  {
    nav: "Specialist Certification",
    Icon: GraduationCap,
    title: "Specialist Certification",
    body: "Short, practical courses that turn backyard growers into certified specialists.",
  },
  {
    nav: "Community",
    Icon: Users,
    title: "Community Forum",
    body: "Ask, answer and swap tips with growers and advisors across the country.",
  },
];

/* Buttons elsewhere on the page that lead to a not-yet-open tool reuse that
   tool's tile copy, so the "coming soon" card reads the same however it was
   reached. */
const feature = (nav) => FEATURES.find((f) => f.nav === nav);

const STEPS = [
  {
    nav: "Farm Planner",
    Icon: Sprout,
    title: "Plan your plot",
    body: "Tell us your space, season and goals. The Farm Planner lays out what to plant and when.",
    detail: [
      "A planting calendar matched to your barangay's season",
      "Starter kits and seeds costed out before you spend",
    ],
    cta: "Open the Farm Planner",
  },
  {
    nav: "AIPlantDoctor",
    Icon: HeartPulse,
    title: "Grow with guidance",
    body: "AI diagnosis, expert advisors and hands-on workshops keep every crop on track.",
    detail: [
      "Photo diagnosis with a treatment plan in seconds",
      "Advisors and workshops when the photo isn't enough",
    ],
    cta: "Try the AI Plant Doctor",
  },
  {
    nav: "SurplusExchangePage",
    Icon: TrendingUp,
    title: "Earn as you harvest",
    body: "Sell the surplus, redeem EcoPoints, and turn a backyard into steady income.",
    detail: [
      "List surplus to neighbours instead of letting it spoil",
      "EcoPoints convert into supplies for the next cycle",
    ],
    cta: "See the Surplus Exchange",
    // The exchange isn't open to users yet, so the CTA announces it instead of
    // navigating — carrying the tile's copy so the banner names the tool
    // ("Surplus Exchange"), not the step ("Earn as you harvest").
    comingSoon: feature("SurplusExchangePage"),
  },
];

/* Values are the programme's 2026 targets, not results to date — the caption
   under the band says so, so the big numbers can't be read as a claim. */
const TARGETS = [
  { value: 5000, suffix: "+", label: "Households growing" },
  { value: 120, suffix: "", label: "Barangays reached" },
  { value: 40, suffix: "k kg", label: "Surplus rescued" },
  // Label avoids "CO₂e" — the row is uppercased, which mangles the subscript.
  { value: 18, suffix: "t", label: "Carbon avoided" },
];

/* Counts from 0 the first time the band scrolls into view. Reduced-motion
   users get the final number immediately (useInView resolves at once). */
function useCountUp(target, active, duration = 1400) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return undefined;
    if (prefersReducedMotion()) { setN(target); return undefined; }
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      // easeOutCubic — fast start, gentle landing
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, active, duration]);
  return n;
}

function SectionHeading({ eyebrow, title, accent, body, isMobile }) {
  return (
    <Reveal style={{ width: "100%", textAlign: "center", marginBottom: isMobile ? "18px" : "34px" }}>
      <span style={{
        display: "inline-flex", alignItems: "center", gap: "7px",
        padding: "6px 14px", borderRadius: "999px",
        background: "rgba(255,255,255,0.62)",
        border: "1px solid rgba(var(--eco-c9-rgb), 0.16)",
        fontSize: isMobile ? "10px" : "11px", fontWeight: 700,
        letterSpacing: "1.2px", textTransform: "uppercase", color: GREEN,
        backdropFilter: "blur(14px) saturate(170%)",
        WebkitBackdropFilter: "blur(14px) saturate(170%)",
      }}>
        <Leaf size={12} strokeWidth={2.6} />
        {eyebrow}
      </span>
      <h2 style={{
        margin: "12px 0 0",
        fontFamily: "'Poppins', sans-serif", fontWeight: 500,
        fontSize: isMobile ? "22px" : "clamp(26px, 3.2vw, 40px)",
        lineHeight: 1.12, letterSpacing: "-1.1px", color: INK,
      }}>
        {title} <span style={{
          background: `linear-gradient(120deg, ${GREEN}, ${SKY})`,
          WebkitBackgroundClip: "text", backgroundClip: "text",
          WebkitTextFillColor: "transparent", color: "transparent",
        }}>{accent}</span>
      </h2>
      {body && (
        <p style={{
          margin: "10px auto 0", maxWidth: "560px",
          fontSize: isMobile ? "13px" : "14px", lineHeight: 1.65,
          fontWeight: 500, color: INK_SOFT,
        }}>{body}</p>
      )}
    </Reveal>
  );
}

/* Glass tile with a gradient icon chip. Hover lifts the card and slides the
   arrow — the whole tile is the button so the target is the full 240px. */
function FeatureCard({ item, index, isMobile, onSelect }) {
  const [hov, setHov] = useState(false);
  const { Icon } = item;
  return (
    <Reveal delay={index * 70} style={{ display: "flex" }}>
      <button
        type="button"
        onClick={() => onSelect(item)}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          position: "relative", overflow: "hidden",
          display: "flex", flexDirection: "column", alignItems: "flex-start",
          gap: isMobile ? "9px" : "12px", width: "100%",
          padding: isMobile ? "16px 15px" : "22px 20px",
          borderRadius: "20px", textAlign: "left", cursor: "pointer",
          fontFamily: "inherit",
          background: hov
            ? "linear-gradient(150deg, rgba(255,255,255,0.94), rgba(var(--eco-c0-rgb), 0.72))"
            : "linear-gradient(150deg, rgba(255,255,255,0.74), rgba(255,255,255,0.46))",
          border: `1px solid ${hov ? "rgba(var(--eco-c9-rgb), 0.28)" : "rgba(255,255,255,0.8)"}`,
          /* Inset highlight only. A blurred drop shadow reads as a grey halo
             bleeding outside the card on this pale ground, so depth comes from
             the hairline border and the lift instead. */
          boxShadow: hov
            ? "inset 0 1px 0 rgba(255,255,255,0.9)"
            : "inset 0 1px 0 rgba(255,255,255,0.8)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          transform: hov ? "translateY(-6px)" : "translateY(0)",
          transition: "transform 0.3s cubic-bezier(.22,1,.36,1), box-shadow 0.3s ease, background 0.3s ease, border-color 0.3s ease",
        }}
      >
        {/* Corner wash that blooms on hover */}
        <span aria-hidden="true" style={{
          position: "absolute", top: "-40px", right: "-40px",
          width: "140px", height: "140px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(var(--eco-c5-rgb), 0.5), transparent 70%)",
          opacity: hov ? 1 : 0, transition: "opacity 0.35s ease", pointerEvents: "none",
        }} />
        <span aria-hidden="true" style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: isMobile ? "40px" : "46px", height: isMobile ? "40px" : "46px",
          borderRadius: "14px", flexShrink: 0,
          background: "linear-gradient(135deg, rgba(var(--eco-c5-rgb), 0.85), rgba(var(--eco-c5-rgb), 0.8))",
          transform: hov ? "scale(1.06) rotate(-4deg)" : "none",
          transition: "transform 0.32s cubic-bezier(.22,1,.36,1), box-shadow 0.32s ease",
        }}>
          <Icon size={isMobile ? 20 : 23} color="var(--eco-c14)" strokeWidth={2.3} />
        </span>
        <span style={{ fontSize: isMobile ? "14px" : "16px", fontWeight: 800, color: INK, lineHeight: 1.25 }}>
          {item.title}
        </span>
        <span style={{ fontSize: isMobile ? "12px" : "13px", fontWeight: 500, lineHeight: 1.6, color: INK_SOFT }}>
          {item.body}
        </span>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "auto", paddingTop: "4px",
          fontSize: "12px", fontWeight: 750, color: GREEN,
          opacity: hov ? 1 : 0.72, transition: "opacity 0.25s ease",
        }}>
          Explore
          <ArrowRight size={14} strokeWidth={2.6} style={{
            transform: hov ? "translateX(4px)" : "none",
            transition: "transform 0.28s cubic-bezier(.22,1,.36,1)",
          }} />
        </span>
      </button>
    </Reveal>
  );
}

/* One numbered dot on the stepper rail. Steps already walked through stay
   filled, so the rail reads as progress rather than as three equal tabs. */
function RailDot({ step, index, active, done, onSelect, isMobile }) {
  const [hov, setHov] = useState(false);
  const size = isMobile ? 34 : 40;
  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      aria-label={`Step ${index + 1}: ${step.title}`}
      aria-current={active ? "step" : undefined}
      style={{
        position: "relative", zIndex: 1, flexShrink: 0,
        width: `${size}px`, height: `${size}px`, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", fontFamily: "'Poppins', sans-serif",
        fontSize: isMobile ? "13px" : "15px", fontWeight: 700, letterSpacing: "-0.2px",
        color: done ? "var(--eco-c14)" : GREEN,
        background: done
          ? `linear-gradient(135deg, ${GREEN}, ${SKY})`
          : "rgba(255,255,255,0.86)",
        border: `1px solid ${done ? "transparent" : "rgba(var(--eco-c9-rgb), 0.22)"}`,
        /* The active dot gets a halo ring instead of a shadow — a blurred drop
           shadow greys out on this pale ground (same call as the cards). */
        boxShadow: active
          ? `0 0 0 5px rgba(var(--eco-c9-rgb), 0.13)`
          : "inset 0 1px 0 rgba(255,255,255,0.9)",
        transform: active ? "scale(1.1)" : hov ? "scale(1.06)" : "scale(1)",
        transition: "transform 0.34s cubic-bezier(.22,1,.36,1), box-shadow 0.34s ease, background 0.4s ease, color 0.4s ease, border-color 0.4s ease",
      }}
    >
      {done && !active ? <Check size={isMobile ? 15 : 17} strokeWidth={3} /> : index + 1}
    </button>
  );
}

/* The rail itself: a hairline track with a gradient fill that grows to the
   active dot. Scaled with a transform, not width, so the glass stack around
   it never re-lays-out mid-animation. */
function StepRail({ steps, active, onSelect, isMobile }) {
  const dot = isMobile ? 34 : 40;
  const progress = steps.length > 1 ? active / (steps.length - 1) : 1;
  return (
    <div style={{
      position: "relative", display: "flex", alignItems: "center",
      justifyContent: "space-between", width: "100%",
      maxWidth: isMobile ? "260px" : "620px",
      margin: isMobile ? "0 auto 16px" : "0 auto 26px",
    }}>
      <span aria-hidden="true" style={{
        position: "absolute", top: "50%", left: `${dot / 2}px`, right: `${dot / 2}px`,
        height: "2px", borderRadius: "2px", transform: "translateY(-50%)",
        background: "rgba(var(--eco-c9-rgb), 0.14)",
      }} />
      <span aria-hidden="true" style={{
        position: "absolute", top: "50%", left: `${dot / 2}px`, right: `${dot / 2}px`,
        height: "2px", borderRadius: "2px",
        transform: `translateY(-50%) scaleX(${progress})`, transformOrigin: "left center",
        background: `linear-gradient(to right, ${GREEN}, ${SKY})`,
        transition: "transform 0.55s cubic-bezier(.22,1,.36,1)",
      }} />
      {steps.map((step, i) => (
        <RailDot
          key={step.title}
          step={step}
          index={i}
          active={i === active}
          done={i <= active}
          onSelect={onSelect}
          isMobile={isMobile}
        />
      ))}
    </div>
  );
}

/* Click once to open a step, again to jump to the tool it describes — so the
   card stays a single button and never nests interactive elements. */
function StepCard({ step, index, active, isMobile, onSelect, onOpen }) {
  const [hov, setHov] = useState(false);
  const { Icon } = step;
  const lifted = active || hov;
  return (
    <Reveal delay={index * 110} style={{ display: "flex", flex: active ? 1.25 : 1, minWidth: 0, transition: "flex 0.5s cubic-bezier(.22,1,.36,1)" }}>
      <button
        type="button"
        onClick={() => (active ? onOpen(step) : onSelect(index))}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        aria-current={active ? "step" : undefined}
        aria-label={active ? `${step.title} — ${step.cta}` : `Step ${index + 1}: ${step.title}`}
        style={{
          position: "relative", width: "100%", cursor: "pointer", fontFamily: "inherit",
          display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "10px",
          padding: isMobile ? "18px 16px" : "26px 22px",
          borderRadius: "22px", textAlign: "left",
          background: active
            ? "linear-gradient(155deg, rgba(255,255,255,0.94), rgba(240,253,250,0.72))"
            : "linear-gradient(155deg, rgba(255,255,255,0.8), rgba(240,253,250,0.5))",
          border: `1px solid ${active ? "rgba(var(--eco-c6-rgb), 0.34)" : hov ? "rgba(var(--eco-c6-rgb), 0.3)" : "rgba(255,255,255,0.82)"}`,
          boxShadow: lifted
            ? "inset 0 1px 0 rgba(255,255,255,0.9)"
            : "inset 0 1px 0 rgba(255,255,255,0.8)",
          backdropFilter: "blur(18px) saturate(175%)",
          WebkitBackdropFilter: "blur(18px) saturate(175%)",
          opacity: active || hov ? 1 : 0.78,
          transform: active ? "translateY(-6px)" : hov ? "translateY(-5px)" : "none",
          transition: "transform 0.3s cubic-bezier(.22,1,.36,1), box-shadow 0.3s ease, border-color 0.3s ease, background 0.4s ease, opacity 0.4s ease",
        }}
      >
        {/* Oversized ghost numeral — keeps the sequence readable at a glance */}
        <span aria-hidden="true" style={{
          position: "absolute", top: isMobile ? "6px" : "10px", right: "16px",
          fontFamily: "'Poppins', sans-serif", fontWeight: 700,
          fontSize: isMobile ? "44px" : "60px", lineHeight: 1,
          color: active ? "rgba(var(--eco-c9-rgb), 0.16)" : "rgba(var(--eco-c9-rgb), 0.09)",
          letterSpacing: "-3px", pointerEvents: "none",
          transition: "color 0.4s ease",
        }}>
          {index + 1}
        </span>
        <span aria-hidden="true" style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: "38px", height: "38px", borderRadius: "12px",
          background: active
            ? `linear-gradient(135deg, ${GREEN}, ${SKY})`
            : "rgba(255,255,255,0.85)",
          border: `1px solid ${active ? "transparent" : "rgba(var(--eco-c9-rgb), 0.18)"}`,
          transform: active ? "scale(1.06) rotate(-4deg)" : "none",
          transition: "transform 0.34s cubic-bezier(.22,1,.36,1), background 0.4s ease, border-color 0.4s ease",
        }}>
          <Icon size={19} color={active ? "var(--eco-c14)" : GREEN} strokeWidth={2.4} />
        </span>
        <span style={{ fontSize: isMobile ? "15px" : "17px", fontWeight: 800, color: INK, lineHeight: 1.25 }}>
          {step.title}
        </span>
        <span style={{ fontSize: isMobile ? "12px" : "13px", fontWeight: 500, lineHeight: 1.65, color: INK_SOFT }}>
          {step.body}
        </span>

        {/* Detail + CTA unfold on the open step. maxHeight (not display) so the
            card grows into it instead of snapping. */}
        <span style={{
          display: "block", width: "100%", overflow: "hidden",
          maxHeight: active ? "220px" : "0px",
          opacity: active ? 1 : 0,
          transition: "max-height 0.5s cubic-bezier(.22,1,.36,1), opacity 0.4s ease",
        }}>
          <span style={{ display: "flex", flexDirection: "column", gap: "7px", paddingTop: "4px" }}>
            {step.detail.map((line, di) => (
              <span key={line} style={{
                display: "flex", alignItems: "flex-start", gap: "7px",
                fontSize: isMobile ? "11.5px" : "12.5px", fontWeight: 550,
                lineHeight: 1.5, color: INK_SOFT,
                transform: active ? "none" : "translateY(6px)",
                opacity: active ? 1 : 0,
                transition: `transform 0.45s cubic-bezier(.22,1,.36,1) ${active ? 120 + di * 90 : 0}ms, opacity 0.45s ease ${active ? 120 + di * 90 : 0}ms`,
              }}>
                <Check size={13} strokeWidth={3} color={GREEN} style={{ flexShrink: 0, marginTop: "2px" }} />
                {line}
              </span>
            ))}
          </span>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "12px",
            padding: "7px 13px", borderRadius: "999px",
            background: `linear-gradient(120deg, ${GREEN}, ${SKY})`,
            fontSize: "12px", fontWeight: 750, color: "var(--eco-c14)",
          }}>
            {step.cta}
            <ArrowRight size={13} strokeWidth={2.8} style={{
              transform: hov ? "translateX(4px)" : "none",
              transition: "transform 0.28s cubic-bezier(.22,1,.36,1)",
            }} />
          </span>
        </span>
      </button>
    </Reveal>
  );
}

/* The three-step walkthrough. It plays itself once the section scrolls into
   view so the sequence is visible without a click, then hands control over
   for good the moment someone touches it (or hovers a card — advancing under
   the cursor would fight the reader). */
function HowItWorks({ isMobile, onNavigate, onComingSoon }) {
  const [ref, inView] = useInView();
  const [active, setActive] = useState(0);
  const [taken, setTaken] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!inView || taken || paused || prefersReducedMotion()) return undefined;
    const t = setInterval(() => setActive((a) => (a + 1) % STEPS.length), 4200);
    return () => clearInterval(t);
  }, [inView, taken, paused]);

  const select = (i) => { setTaken(true); setActive(i); };

  return (
    <div style={{ width: "100%" }} ref={ref}>
      <SectionHeading
        eyebrow="How it works"
        title="Three steps from"
        accent="plot to profit"
        isMobile={isMobile}
      />
      <StepRail steps={STEPS} active={active} onSelect={select} isMobile={isMobile} />
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        style={{
          position: "relative",
          display: "flex", flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? "12px" : "18px", alignItems: "stretch",
        }}
      >
        {STEPS.map((step, i) => (
          <StepCard
            key={step.title}
            step={step}
            index={i}
            active={i === active}
            isMobile={isMobile}
            onSelect={select}
            onOpen={(s) => (s.comingSoon ? onComingSoon(s.comingSoon) : onNavigate(s.nav))}
          />
        ))}
      </div>
    </div>
  );
}

function TargetBand({ isMobile }) {
  const [ref, inView] = useInView();
  return (
    <Reveal style={{ width: "100%" }}>
      {/* The counters watch this inner node — <Reveal> owns its own ref. */}
      <div
        ref={ref}
        style={{
          position: "relative", overflow: "hidden", width: "100%",
          padding: isMobile ? "22px 18px" : "34px 40px",
          borderRadius: "26px",
          background: "linear-gradient(135deg, rgba(var(--eco-c9-rgb), 0.94), rgba(13,148,136,0.9) 55%, rgba(var(--eco-c6-rgb), 0.86))",
        }}
      >
        {/* Dotted texture + soft glow, echoing the hero's decorative grid */}
        <span aria-hidden="true" style={{
          position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.5,
          backgroundImage: "radial-gradient(rgba(255,255,255,0.28) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
          WebkitMaskImage: "linear-gradient(to bottom, #000, transparent)",
          maskImage: "linear-gradient(to bottom, #000, transparent)",
        }} />
        <span aria-hidden="true" style={{
          position: "absolute", top: "-30%", right: "-8%", width: "320px", height: "320px",
          borderRadius: "50%", pointerEvents: "none",
          background: "radial-gradient(circle, rgba(255,255,255,0.28), transparent 68%)",
        }} />
        <div style={{
          position: "relative", display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between", gap: isMobile ? "18px" : "28px",
          flexWrap: "wrap",
        }}>
          <div style={{ maxWidth: isMobile ? "100%" : "260px" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              fontSize: "10px", fontWeight: 700, letterSpacing: "1.3px",
              textTransform: "uppercase", color: "rgba(255,255,255,0.82)",
            }}>
              <Sparkles size={12} strokeWidth={2.6} /> Where we're headed
            </span>
            <h3 style={{
              margin: "8px 0 0", fontFamily: "'Poppins', sans-serif", fontWeight: 500,
              fontSize: isMobile ? "20px" : "26px", lineHeight: 1.15,
              letterSpacing: "-0.8px", color: "#fff",
            }}>
              The 2026 goal, in numbers
            </h3>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2, minmax(0,1fr))" : "repeat(4, minmax(0,1fr))",
            gap: isMobile ? "14px 12px" : "clamp(18px, 3vw, 40px)",
            flex: 1, minWidth: 0,
          }}>
            {TARGETS.map((t) => (
              <TargetStat key={t.label} target={t} active={inView} isMobile={isMobile} />
            ))}
          </div>
        </div>
        <p style={{
          position: "relative", margin: isMobile ? "16px 0 0" : "20px 0 0",
          fontSize: "11px", fontWeight: 500, color: "rgba(255,255,255,0.72)",
        }}>
          Programme targets for 2026 — not results to date.
        </p>
      </div>
    </Reveal>
  );
}

function TargetStat({ target, active, isMobile }) {
  const n = useCountUp(target.value, active);
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{
        fontFamily: "'Poppins', sans-serif", fontWeight: 600,
        fontSize: isMobile ? "24px" : "clamp(26px, 2.6vw, 34px)",
        lineHeight: 1, letterSpacing: "-1.4px", color: "#fff",
      }}>
        {n.toLocaleString()}{target.suffix}
      </div>
      <div style={{
        marginTop: "6px", fontSize: isMobile ? "10px" : "11px", fontWeight: 600,
        letterSpacing: "0.8px", textTransform: "uppercase", color: "rgba(255,255,255,0.78)",
        lineHeight: 1.35,
      }}>
        {target.label}
      </div>
    </div>
  );
}

function ClosingCTA({ isMobile, onNavigate, onComingSoon }) {
  const [primaryHov, setPrimaryHov] = useState(false);
  const [ghostHov, setGhostHov] = useState(false);
  return (
    <Reveal style={{ width: "100%" }}>
      <div style={{
        position: "relative", overflow: "hidden", width: "100%",
        padding: isMobile ? "26px 18px" : "44px 40px",
        borderRadius: "26px", textAlign: "center",
        background: "linear-gradient(150deg, rgba(255,255,255,0.86), rgba(var(--eco-c0-rgb), 0.6))",
        border: "1px solid rgba(255,255,255,0.86)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
        backdropFilter: "blur(22px) saturate(180%)",
        WebkitBackdropFilter: "blur(22px) saturate(180%)",
      }}>
        <span aria-hidden="true" style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(60% 80% at 50% 0%, rgba(var(--eco-c5-rgb), 0.28), transparent 70%)",
        }} />
        <div style={{ position: "relative" }}>
          <h3 style={{
            margin: 0, fontFamily: "'Poppins', sans-serif", fontWeight: 500,
            fontSize: isMobile ? "21px" : "clamp(24px, 3vw, 34px)",
            lineHeight: 1.14, letterSpacing: "-1.1px", color: INK,
          }}>
            Ready to grow your first harvest?
          </h3>
          <p style={{
            margin: "10px auto 0", maxWidth: "520px",
            fontSize: isMobile ? "13px" : "14px", lineHeight: 1.65,
            fontWeight: 500, color: INK_SOFT,
          }}>
            Start with a kit, a plan and a community that answers when you ask. No farm required — a balcony is enough.
          </p>
          <div style={{
            display: "flex", flexWrap: "wrap", justifyContent: "center",
            gap: "12px", marginTop: isMobile ? "18px" : "24px",
          }}>
            <button
              type="button"
              onClick={() => onComingSoon(feature("Starter Kits & Toolsets"))}
              onMouseEnter={() => setPrimaryHov(true)}
              onMouseLeave={() => setPrimaryHov(false)}
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                minHeight: "48px", padding: "0 24px", borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.5)", cursor: "pointer",
                fontFamily: "inherit", fontSize: "14px", fontWeight: 750, color: "#fff",
                background: `linear-gradient(135deg, ${GREEN}, var(--eco-c9) 60%, ${SKY})`,
                boxShadow: "none",
                transform: primaryHov ? "translateY(-3px)" : "none",
                transition: "transform 0.26s cubic-bezier(.22,1,.36,1), box-shadow 0.26s ease",
              }}
            >
              Browse Starter Kits
              <ArrowRight size={16} strokeWidth={2.6} style={{
                transform: primaryHov ? "translateX(4px)" : "none",
                transition: "transform 0.26s cubic-bezier(.22,1,.36,1)",
              }} />
            </button>
            <button
              type="button"
              onClick={() => onNavigate("Contact")}
              onMouseEnter={() => setGhostHov(true)}
              onMouseLeave={() => setGhostHov(false)}
              style={{
                minHeight: "48px", padding: "0 24px", borderRadius: "999px",
                cursor: "pointer", fontFamily: "inherit", fontSize: "14px",
                fontWeight: 750, color: INK,
                background: ghostHov ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.7)",
                border: "1px solid rgba(var(--eco-c19-rgb), 0.1)",
                boxShadow: "none",
                transform: ghostHov ? "translateY(-3px)" : "none",
                transition: "transform 0.26s cubic-bezier(.22,1,.36,1), box-shadow 0.26s ease, background 0.26s ease",
              }}
            >
              Talk to the team
            </button>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* `measure` is the reading width the home scroller no longer enforces — that
   box is now the full width of the window so its footer can bleed to the
   edges, so these sections hold the card's inner measure for themselves. The
   phone shell still owns its gutter, so mobile stays at 100%. App.js owns the
   expression (HOME_MEASURE). */
export default function LandingSections({ isMobile = false, onNavigate = () => {}, measure = "1240px" }) {
  // The six "what's inside" tiles announce themselves rather than navigating —
  // the tools behind them are not open to users yet. The Surplus Exchange step
  // and the closing "Browse Starter Kits" button land here too. Holds the
  // feature to announce; null means no banner.
  const [comingSoon, setComingSoon] = useState(null);

  return (
    <section style={{
      width: "100%",
      maxWidth: isMobile ? "100%" : measure,
      margin: "0 auto",
      // Sibling of the hero inside the home scroller's column flexbox — opt out
      // of shrinking so the sections keep their laid-out height.
      flexShrink: 0,
      display: "flex", flexDirection: "column",
      gap: isMobile ? "34px" : "clamp(48px, 7vh, 88px)",
      padding: isMobile ? "26px 0 8px" : "clamp(40px, 7vh, 80px) 0 clamp(24px, 4vh, 48px)",
    }}>
      <RevealStyles />

      {comingSoon && (
        <ComingSoonBanner
          title={`${comingSoon.title} — Coming Soon`}
          message={`${comingSoon.body} We're still building this one — it will open up here soon.`}
          closeLabel="Close and go to the home page"
          // The X is the "take me back" action: close, then land on Home.
          onClose={() => { setComingSoon(null); onNavigate("Home"); }}
          onDismiss={() => setComingSoon(null)}
        />
      )}

      {/* ── What's on the platform ── */}
      <div style={{ width: "100%" }}>
        <SectionHeading
          eyebrow="What's inside"
          title="Everything you need,"
          accent="in one platform"
          body="Six connected tools that take a household from an empty plot to a harvest worth selling."
          isMobile={isMobile}
        />
        <div style={{
          display: "grid",
          // Fixed 3 columns, not auto-fit: six cards over four tracks left a
          // ragged two-card second row.
          gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
          gap: isMobile ? "12px" : "18px",
        }}>
          {FEATURES.map((item, i) => (
            <FeatureCard key={item.nav} item={item} index={i} isMobile={isMobile} onSelect={setComingSoon} />
          ))}
        </div>
      </div>

      {/* ── How it works ── */}
      <HowItWorks isMobile={isMobile} onNavigate={onNavigate} onComingSoon={setComingSoon} />

      {/* ── Targets ── */}
      <TargetBand isMobile={isMobile} />

      {/* ── Closing CTA ── */}
      <ClosingCTA isMobile={isMobile} onNavigate={onNavigate} onComingSoon={setComingSoon} />
    </section>
  );
}
