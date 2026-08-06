import { renderHook, act } from "@testing-library/react";
import useActiveBrowseTimer from "./useActiveBrowseTimer";

/* The whole value of this hook is what it *refuses* to count — a wall-clock
   timer would be three lines. So the cases that matter are the idle tab and
   the backgrounded one, neither of which is reachable by driving a browser in
   any reasonable amount of time. */

const THRESHOLD = 10000;

/** Advance both the interval and Date.now, which the hook reads for idleness. */
const advance = (ms) =>
  act(() => {
    jest.advanceTimersByTime(ms);
  });

const nudge = () => act(() => { window.dispatchEvent(new Event("pointermove")); });

describe("useActiveBrowseTimer", () => {
  let hidden;

  beforeEach(() => {
    jest.useFakeTimers();
    // Fake timers advance Date.now() too (modern timers), so idleness and the
    // tick count stay in step without any extra plumbing.
    hidden = false;
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => hidden,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("stays false until the threshold and then flips", () => {
    const { result } = renderHook(() => useActiveBrowseTimer(THRESHOLD));

    advance(THRESHOLD - 1000);
    expect(result.current).toBe(false);

    advance(1000);
    expect(result.current).toBe(true);
  });

  it("does not count time while the tab is hidden", () => {
    const { result } = renderHook(() => useActiveBrowseTimer(THRESHOLD));

    hidden = true;
    advance(THRESHOLD * 3);
    expect(result.current).toBe(false);

    hidden = false;
    nudge();
    advance(THRESHOLD);
    expect(result.current).toBe(true);
  });

  it("does not count time once the visitor has gone idle", () => {
    const idleAfterMs = 4000;
    const { result } = renderHook(() =>
      useActiveBrowseTimer(THRESHOLD, { idleAfterMs })
    );

    // Half the threshold's worth of real browsing, then silence.
    advance(idleAfterMs);
    nudge();
    advance(idleAfterMs);

    advance(THRESHOLD * 5);
    expect(result.current).toBe(false);

    // Coming back adds the remaining couple of seconds.
    nudge();
    advance(THRESHOLD);
    expect(result.current).toBe(true);
  });

  it("measures nothing while disabled", () => {
    const { result } = renderHook(() =>
      useActiveBrowseTimer(THRESHOLD, { enabled: false })
    );

    advance(THRESHOLD * 5);
    expect(result.current).toBe(false);
  });
});
