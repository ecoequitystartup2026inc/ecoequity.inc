/**
 * The one definition of "this is a phone-shaped viewport".
 *
 * Width alone misses a phone held sideways — an iPhone 14 Pro Max in
 * landscape reports 932x430 and would fall through to the desktop layout,
 * which needs far more vertical room than 430px. The second clause catches
 * that: short, and a touch-primary pointer so a short desktop window is
 * unaffected.
 *
 * MOBILE_QUERY must stay in sync with the matching media query in
 * index.css, which locks body scroll and applies the touch styling.
 */
export const MOBILE_QUERY = "(max-width: 768px), (max-height: 540px) and (pointer: coarse)";

/** Whether the viewport is phone-shaped right now. Safe during SSR/tests. */
export function isMobileViewport() {
  if (typeof window === "undefined") return false;
  return typeof window.matchMedia === "function"
    ? window.matchMedia(MOBILE_QUERY).matches
    : window.innerWidth < 768;
}
