import { buildThemeRamp, buildButtonVars, SAGE_RAMP, STEP_TONES, PRIMARY_INDEX, DEFAULT_PRIMARY, DEFAULT_SECONDARY, rgbToHsl, hexToRgb, readableInk, parseButtonGradient, buttonBackground, buttonInk } from "./theme";

const lightnessOf = (hex) => rgbToHsl(hexToRgb(hex)).l;
const stepsOf = (vars) => STEP_TONES.map((_, i) => vars[`--eco-c${i}`]);

describe("buildThemeRamp", () => {
  test("the default pair reproduces the sage palette", () => {
    const vars = buildThemeRamp(DEFAULT_PRIMARY, DEFAULT_SECONDARY);
    STEP_TONES.forEach((tone, i) => {
      expect(vars[`--eco-c${i}`]).toBe(SAGE_RAMP[tone]);
    });
  });

  // The whole point of the banding: a step variable is an *address*, and every
  // address in a band resolves to the same colour, for any theme the picker can
  // produce. Five greens on screen, never a sixth.
  test("the green family stays five colours whatever the pair", () => {
    const pairs = [
      [DEFAULT_PRIMARY, DEFAULT_SECONDARY],
      ["#5f7a4b", "#efeade"],
      ["#42675f", "#ffffff"],
      ["#16211a", "#dce5db"],
      ["#a4552f", "#f3f7f2"],
    ];
    pairs.forEach(([primary, secondary]) => {
      const vars = buildThemeRamp(primary, secondary);
      expect(new Set(stepsOf(vars)).size).toBe(SAGE_RAMP.length);
      STEP_TONES.forEach((tone, i) => {
        const first = STEP_TONES.indexOf(tone);
        expect(vars[`--eco-c${i}`]).toBe(vars[`--eco-c${first}`]);
        expect(vars[`--eco-c${i}-rgb`]).toBe(vars[`--eco-c${first}-rgb`]);
      });
    });
  });

  test("emits an rgb triplet alongside every step", () => {
    const vars = buildThemeRamp(DEFAULT_PRIMARY, DEFAULT_SECONDARY);
    expect(vars["--eco-c9-rgb"]).toBe("115, 138, 110");
    STEP_TONES.forEach((_, i) => {
      expect(vars[`--eco-c${i}-rgb`]).toMatch(/^\d{1,3}, \d{1,3}, \d{1,3}$/);
    });
  });

  test("step 9 is exactly the chosen primary", () => {
    expect(buildThemeRamp("#42675f", "#ffffff")[`--eco-c${PRIMARY_INDEX}`]).toBe("#42675f");
    expect(buildThemeRamp("#5f7a4b", "#efeade")[`--eco-c${PRIMARY_INDEX}`]).toBe("#5f7a4b");
  });

  // Ordering is enforced on the computed lightness; rounding each step to 8-bit
  // channels can then move it by up to half a level, so allow one level.
  const QUANTIZATION = 1 / 255;

  test("keeps the ramp ordered light to dark for any pair", () => {
    const pairs = [
      ["#738a6e", "#f3f7f2"],
      ["#16211a", "#ffffff"],
      ["#5f7a4b", "#efeade"],
      ["#42675f", "#dce5db"],
      ["#344c3d", "#bfcfbb"],
    ];
    pairs.forEach(([primary, secondary]) => {
      const vars = buildThemeRamp(primary, secondary);
      for (let i = 1; i < STEP_TONES.length; i += 1) {
        expect(lightnessOf(vars[`--eco-c${i}`])).toBeLessThanOrEqual(
          lightnessOf(vars[`--eco-c${i - 1}`]) + QUANTIZATION
        );
      }
    });
  });

  test("light surfaces stay light even when a dark secondary is picked", () => {
    const vars = buildThemeRamp("#738a6e", "#16211a");
    expect(lightnessOf(vars["--eco-c0"])).toBeGreaterThan(0.8);
  });

  test("falls back to the sage defaults when handed junk", () => {
    const vars = buildThemeRamp("not-a-colour", undefined);
    expect(vars[`--eco-c${PRIMARY_INDEX}`]).toBe(DEFAULT_PRIMARY);
    expect(vars["--eco-c0"]).toBe(SAGE_RAMP[0]);
  });

  test("publishes the raw pair for anything reading it directly", () => {
    const vars = buildThemeRamp("#42675f", "#efeade");
    expect(vars["--eco-accent"]).toBe("#42675f");
    expect(vars["--eco-secondary"]).toBe("#efeade");
  });
});

describe("readableInk", () => {
  test("picks white on the dark greens and ink on the pale tints", () => {
    expect(readableInk("#16211a")).toBe("#ffffff");
    expect(readableInk("#738a6e")).toBe("#ffffff");
    expect(readableInk("#f3f7f2")).toBe("#16211a");
    expect(readableInk("#ffffff")).toBe("#16211a");
  });
});

describe("buildButtonVars", () => {
  test("a blank button colour follows the primary", () => {
    const vars = buildButtonVars("", "#4f6b52");
    expect(vars["--eco-btn"]).toBe("#4f6b52");
    expect(buildButtonVars(undefined, DEFAULT_PRIMARY)["--eco-btn"]).toBe(DEFAULT_PRIMARY);
  });

  test("a picked colour overrides the primary", () => {
    const vars = buildButtonVars("#a4552f", DEFAULT_PRIMARY);
    expect(vars["--eco-btn"]).toBe("#a4552f");
    expect(vars["--eco-btn-rgb"]).toBe("164, 85, 47");
  });

  test("the gradient's dark end is deeper than the fill", () => {
    const vars = buildButtonVars("#2f6b6b", DEFAULT_PRIMARY);
    expect(lightnessOf(vars["--eco-btn-deep"])).toBeLessThan(lightnessOf(vars["--eco-btn"]));
  });

  test("the label ink flips so it stays readable on any pick", () => {
    expect(buildButtonVars("#26382d", DEFAULT_PRIMARY)["--eco-btn-ink"]).toBe("#ffffff");
    expect(buildButtonVars("#f3f7f2", DEFAULT_PRIMARY)["--eco-btn-ink"]).toBe("#16211a");
  });

  test("junk falls back rather than emitting an invalid colour", () => {
    expect(buildButtonVars("not-a-colour", "#4f6b52")["--eco-btn"]).toBe("#4f6b52");
    expect(buildButtonVars("#zzz", "also junk")["--eco-btn"]).toBe(DEFAULT_PRIMARY);
  });

  test("a gradient pick keeps both stops as authored", () => {
    // The original EcoEquity button sweep. Neither stop may be recomputed —
    // --eco-btn-deep is normally a darkened copy of the fill, but here the
    // sky-blue end is *lighter* than the mint start and has to survive.
    const vars = buildButtonVars("#86efac,#7dd3fc", DEFAULT_PRIMARY);
    expect(vars["--eco-btn"]).toBe("#86efac");
    expect(vars["--eco-btn-deep"]).toBe("#7dd3fc");
    expect(vars["--eco-btn-rgb"]).toBe("134, 239, 172");
    expect(vars["--eco-btn-deep-rgb"]).toBe("125, 211, 252");
  });

  test("a gradient's ink is judged across both stops", () => {
    expect(buildButtonVars("#86efac,#7dd3fc", DEFAULT_PRIMARY)["--eco-btn-ink"]).toBe("#16211a");
    expect(buildButtonVars("#065f46,#0284c7", DEFAULT_PRIMARY)["--eco-btn-ink"]).toBe("#ffffff");
  });

  test("a flat pick still emits a deep end darker than the fill", () => {
    const vars = buildButtonVars("#2f6b6b", DEFAULT_PRIMARY);
    expect(lightnessOf(vars["--eco-btn-deep"])).toBeLessThan(lightnessOf(vars["--eco-btn"]));
    expect(vars["--eco-btn-deep-rgb"]).toMatch(/^\d{1,3}, \d{1,3}, \d{1,3}$/);
  });
});

describe("parseButtonGradient", () => {
  test("decodes a two-stop pick", () => {
    expect(parseButtonGradient("#86efac,#7dd3fc")).toEqual({ from: "#86efac", to: "#7dd3fc" });
    expect(parseButtonGradient(" #86efac , #7dd3fc ")).toEqual({ from: "#86efac", to: "#7dd3fc" });
  });

  test("anything that is not a valid pair is not a gradient", () => {
    ["", "#4f6b52", "#4f6b52,", "#4f6b52,#zzz", "#a,#b,#c", null, undefined].forEach((value) => {
      expect(parseButtonGradient(value)).toBeNull();
    });
  });

  test("buttonBackground paints a sweep for a pair and the colour itself otherwise", () => {
    expect(buttonBackground("#86efac,#7dd3fc")).toBe("linear-gradient(135deg, #86efac, #7dd3fc)");
    expect(buttonBackground("#4f6b52")).toBe("#4f6b52");
    expect(buttonBackground("", "#4f6b52")).toBe("#4f6b52");
    expect(buttonBackground("")).toBe(DEFAULT_PRIMARY);
  });

  test("buttonInk matches readableInk for flat picks", () => {
    expect(buttonInk("#26382d")).toBe(readableInk("#26382d"));
    expect(buttonInk("", "#f3f7f2")).toBe(readableInk("#f3f7f2"));
  });
});
