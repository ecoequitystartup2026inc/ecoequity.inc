import React, { useState, useEffect, useRef } from "react";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Fires once when the element first scrolls into view. Pages live inside an
   inner scroll container, but observing against the viewport still works
   because the element physically moves as that container scrolls. */
export function useInView() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === "undefined" || prefersReducedMotion()) {
      setInView(true);
      return undefined;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return [ref, inView];
}

const OFFSETS = {
  up: "translate3d(0, 28px, 0)",
  left: "translate3d(-32px, 0, 0)",
  right: "translate3d(32px, 0, 0)",
  scale: "scale(0.965)",
};

/* The transition rides on the `reveal-anim` class rather than an inline style:
   `.inner-blur-glass` declares `transition: ... !important`, which an inline
   style cannot beat. Doubling the selector out-specifies it. Drop this once
   on every page that uses <Reveal>. */
export function RevealStyles() {
  return (
    <style>
      {`
        .reveal-anim.reveal-anim {
          transition:
            opacity 0.7s cubic-bezier(.22,1,.36,1) var(--reveal-delay, 0ms),
            transform 0.8s cubic-bezier(.22,1,.36,1) var(--reveal-delay, 0ms) !important;
        }
      `}
    </style>
  );
}

/* Wraps children in a scroll-triggered entrance.

   The `reveal-anim` class is removed once the entrance finishes so each
   element's own hover transition (and the glass zoom) takes back over at its
   normal, snappier speed. */
export default function Reveal({
  as: Tag = "div",
  variant = "up",
  delay = 0,
  style,
  className,
  children,
  ...rest
}) {
  const [ref, inView] = useInView();
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (!inView) return undefined;
    const t = setTimeout(() => setSettled(true), delay + 900);
    return () => clearTimeout(t);
  }, [inView, delay]);

  /* Fade toward the style's own opacity, not a hard 1 — body copy often sits
     below 1, and animating past it would snap back when the entrance settles. */
  const entrance = settled
    ? style
    : {
        ...style,
        opacity: inView ? style?.opacity ?? 1 : 0,
        transform: inView ? "none" : OFFSETS[variant],
      };

  return (
    <Tag
      ref={ref}
      className={[className, settled ? null : "reveal-anim"].filter(Boolean).join(" ")}
      style={{ ...entrance, "--reveal-delay": `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
