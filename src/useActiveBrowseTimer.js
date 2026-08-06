import { useEffect, useRef, useState } from "react";

/**
 * Measures how long the visitor has *actively* been browsing, and flips true
 * once that reaches `thresholdMs`.
 *
 * "Actively" is the whole point. A wall-clock timer would count a tab left open
 * in a background window, or one parked on a page while its owner is at lunch —
 * so the feedback prompt would be waiting on screen the moment they came back,
 * which is exactly the intrusive behaviour it is meant to avoid. The clock here
 * only advances while the document is visible *and* there has been some input
 * (pointer, key, wheel, touch, scroll) within `idleAfterMs`.
 *
 * The accumulated time lives in a ref and only the single threshold crossing is
 * state, so the countdown itself never re-renders the tree — it ticks once a
 * second for three minutes behind an app with a lot of glass in it.
 *
 * @param {number} thresholdMs Active browsing time to accumulate before firing.
 * @param {object}  [options]
 * @param {number}  [options.idleAfterMs] Silence after which browsing is
 *   considered paused. Generous by design: reading a long page without touching
 *   anything is still browsing.
 * @param {number}  [options.tickMs] Sampling interval.
 * @param {boolean} [options.enabled] When false nothing is measured and no
 *   listeners are attached — pass false once the prompt is spent.
 * @returns {boolean} Whether the threshold has been reached.
 */
export default function useActiveBrowseTimer(
  thresholdMs,
  { idleAfterMs = 60000, tickMs = 1000, enabled = true } = {}
) {
  const [reached, setReached] = useState(false);
  const activeMsRef = useRef(0);
  const lastInputRef = useRef(Date.now());

  useEffect(() => {
    if (!enabled || reached) return undefined;

    lastInputRef.current = Date.now();
    const markInput = () => {
      lastInputRef.current = Date.now();
    };
    /* Capture phase: `scroll` does not bubble, and in this app the scroller is
       usually the shell div rather than the document, so a bubble-phase window
       listener would never see someone reading their way down a page. */
    const events = ["pointerdown", "pointermove", "keydown", "wheel", "touchstart", "scroll"];
    events.forEach((name) =>
      window.addEventListener(name, markInput, { passive: true, capture: true })
    );

    const id = setInterval(() => {
      if (document.hidden) return;
      if (Date.now() - lastInputRef.current > idleAfterMs) return;
      activeMsRef.current += tickMs;
      if (activeMsRef.current >= thresholdMs) setReached(true);
    }, tickMs);

    return () => {
      clearInterval(id);
      events.forEach((name) =>
        window.removeEventListener(name, markInput, { capture: true })
      );
    };
  }, [enabled, reached, thresholdMs, idleAfterMs, tickMs]);

  return reached;
}
