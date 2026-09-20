/**
 * Pure colour/radius math for the playground.
 *
 * Everything here produces `--primitive-*` override values: the Phase-1
 * token invariant (every semantic colour token references a primitive)
 * means overriding primitives re-themes both light and dark modes at
 * once. Two deliberate exceptions ride the same pipeline: the typeface
 * levers set `--font-family-primary` (body) and `--font-family-heading`
 * (the heading role, when split from the body face), and the mono
 * preset's extraOverrides set semantic `--color-core-accent-*` values.
 */

export interface Overrides {
  [cssVar: string]: string;
}

/* ---------- colour helpers ---------- */

const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
};

const rgbToHex = (rgb: [number, number, number]): string =>
  "#" +
  rgb
    .map((c) => Math.round(Math.min(255, Math.max(0, c))).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

/** Mix `a` toward `b` by weight w (0..1). */
const mix = (
  a: [number, number, number],
  b: [number, number, number],
  w: number
): [number, number, number] => [
  a[0] + (b[0] - a[0]) * w,
  a[1] + (b[1] - a[1]) * w,
  a[2] + (b[2] - a[2]) * w,
];

const WHITE: [number, number, number] = [255, 255, 255];
const BLACK: [number, number, number] = [0, 0, 0];

const luminance = ([r, g, b]: [number, number, number]): number =>
  (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

/* ---------- brand (action colour) ramp ---------- */

/**
 * Tint/shade weights that reproduce the shipped teal ramp from its 07 base
 * (positive = toward white, negative = toward black). Derived by solving
 * mix(teal-07, white|black, w) against the actual primitives.
 */
const BRAND_RAMP_WEIGHTS: ReadonlyArray<[step: string, weight: number]> = [
  ["01", 0.93],
  ["02", 0.82],
  ["03", 0.63],
  ["04", 0.43],
  ["05", 0.22],
  ["06", 0.11],
  ["07", 0],
  ["08", -0.2],
  ["09", -0.43],
  ["10", -0.66],
];

/** The shipped light-theme action fill (teal-08). The dark theme inverts
    to teal-05, but the lever is keyed by the light hex: the shipped hex in
    either theme short-circuits to the token files (null plan). */
export const DEFAULT_BRAND = "#0E6E8F";

/** The shipped dark-theme action fill (teal-05) — display only, e.g. a
    swatch showing what the default looks like in the current theme. The
    lever itself always takes DEFAULT_BRAND. */
export const DEFAULT_BRAND_DARK = "#3CA5C6";

/**
 * Preset action colours: steps 07 and 08 of every chromatic primitive ramp
 * (the values in tokens-primitives.css), plus a theme-dependent neutral per
 * row — dark grey buttons in light mode that flip to light grey in dark
 * mode (`hexDark`/`labelDark`), riding the same `brandDark` machinery as
 * the black & white preset. Listed 07s-first so an 8-column grid renders
 * one row per step. Like NEUTRALS below, these are shipped constants —
 * reading them from the DOM would return their overridden values once a
 * brand is applied.
 */
export const ACTION_COLOR_PRESETS: ReadonlyArray<{
  label: string;
  hex: string;
  /** Dark-mode counterpart for theme-dependent entries (the neutrals). */
  hexDark?: string;
  labelDark?: string;
}> = [
  { label: "Red 07", hex: "#EF476F" },
  { label: "Orange 07", hex: "#EF8247" },
  { label: "Yellow 07", hex: "#FFD166" },
  { label: "Green 07", hex: "#06D6A0" },
  { label: "Teal 07", hex: "#118AB2" },
  { label: "Blue 07", hex: "#1E47B0" },
  { label: "Purple 07", hex: "#9E47EF" },
  { label: "Neutral 07", hex: "#303030", labelDark: "Neutral 01", hexDark: "#F1F1F1" },
  { label: "Red 08", hex: "#C93A5C" },
  { label: "Orange 08", hex: "#C65E33" },
  { label: "Yellow 08", hex: "#C49A3E" },
  { label: "Green 08", hex: "#05A67C" },
  { label: "Teal 08", hex: "#0E6E8F" },
  { label: "Blue 08", hex: "#163789" },
  { label: "Purple 08", hex: "#7434B3" },
  { label: "Neutral 08", hex: "#232323", labelDark: "Neutral 02", hexDark: "#D6D6D6" },
];

/**
 * The ideal ramp around a key colour, as rgb per teal-weight step — the
 * role intents pointer mode matches against real steps. The shipped
 * weights assume a mid-dark key: tint steps (01–06) head toward white —
 * step 02 is the text ON the primary fill — and shade steps (08–10)
 * toward black for hover/pressed. For a LIGHT key (a white button), both
 * jobs invert toward black, so white buttons never get white text.
 */
function brandRampValues(brandHex: string): Record<string, [number, number, number]> {
  const base = hexToRgb(brandHex);
  const lightBrand = luminance(base) > 0.5;
  const values: Record<string, [number, number, number]> = {};
  for (const [step, weight] of BRAND_RAMP_WEIGHTS) {
    const pole = lightBrand ? BLACK : weight > 0 ? WHITE : BLACK;
    values[step] = weight === 0 ? base : mix(base, pole, Math.abs(weight));
  }
  return values;
}

/* ---------- advanced mode: every chromatic ramp ---------- */

const RAMP_BASE_STEP = "07";

/**
 * The shipped chromatic primitives (the values in tokens-primitives.css).
 * Like NEUTRALS and ACTION_COLOR_PRESETS these are constants on purpose:
 * once an override is applied, the DOM no longer knows the originals.
 * Neutral stays out — its alpha variants and the tint lever already own it.
 */
export const CHROMATIC_RAMPS: ReadonlyArray<{
  name: string;
  label: string;
  steps: ReadonlyArray<[step: string, hex: string]>;
}> = [
  {
    name: "red",
    label: "Red",
    steps: [
      ["01", "#FDEFF3"], ["02", "#FAD3DD"], ["03", "#F8B7C7"], ["04", "#F69BB1"],
      ["05", "#F37F9B"], ["06", "#F16385"], ["07", "#EF476F"], ["08", "#C93A5C"],
      ["09", "#8E2641"], ["10", "#571727"],
    ],
  },
  {
    name: "orange",
    label: "Orange",
    steps: [
      ["01", "#FFF3EC"], ["02", "#FBD9C5"], ["03", "#F6B794"], ["04", "#F1996E"],
      ["05", "#E98256"], ["06", "#E07045"], ["07", "#EF8247"], ["08", "#C65E33"],
      ["09", "#8F4324"], ["10", "#552716"],
    ],
  },
  {
    name: "yellow",
    label: "Yellow",
    steps: [
      ["01", "#FFF9EA"], ["02", "#FFF0C9"], ["03", "#FFE5A3"], ["04", "#FFD97F"],
      ["05", "#F2C55E"], ["06", "#E0B654"], ["07", "#FFD166"], ["08", "#C49A3E"],
      ["09", "#8A6B2A"], ["10", "#544016"],
    ],
  },
  {
    name: "green",
    label: "Green",
    steps: [
      ["01", "#ECFCF7"], ["02", "#CEF6E8"], ["03", "#9DEBD4"], ["04", "#6DE0C0"],
      ["05", "#3ED4AA"], ["06", "#1FCB9A"], ["07", "#06D6A0"], ["08", "#05A67C"],
      ["09", "#03765A"], ["10", "#024336"],
    ],
  },
  {
    name: "teal",
    label: "Teal",
    steps: [
      ["01", "#ECF7FB"], ["02", "#CFEAF3"], ["03", "#9ED4E5"], ["04", "#6DBCD6"],
      ["05", "#3CA5C6"], ["06", "#2C9AB9"], ["07", "#118AB2"], ["08", "#0E6E8F"],
      ["09", "#0A4E66"], ["10", "#052F3E"],
    ],
  },
  {
    name: "blue",
    label: "Blue",
    steps: [
      ["01", "#EEF3FD"], ["02", "#D3DDF8"], ["03", "#AABCEF"], ["04", "#7F99E3"],
      ["05", "#5475D4"], ["06", "#345AC4"], ["07", "#1E47B0"], ["08", "#163789"],
      ["09", "#0F265E"], ["10", "#081633"],
    ],
  },
  {
    name: "purple",
    label: "Purple",
    steps: [
      ["01", "#F7F0FE"], ["02", "#E6D2FB"], ["03", "#CFABF7"], ["04", "#B785F0"],
      ["05", "#A86AE8"], ["06", "#9754DC"], ["07", "#9E47EF"], ["08", "#7434B3"],
      ["09", "#52247D"], ["10", "#31164A"],
    ],
  },
];

/* HSL round-trip for the all-ramps levers. h in degrees, s/l in 0..1. */

const rgbToHsl = ([r, g, b]: [number, number, number]): [number, number, number] => {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
  else if (max === gn) h = ((bn - rn) / d + 2) * 60;
  else h = ((rn - gn) / d + 4) * 60;
  return [h, s, l];
};

const hslToRgb = ([h, s, l]: [number, number, number]): [number, number, number] => {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = ((h % 360) + 360) % 360 / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    hp < 1 ? [c, x, 0] :
    hp < 2 ? [x, c, 0] :
    hp < 3 ? [0, c, x] :
    hp < 4 ? [0, x, c] :
    hp < 5 ? [x, 0, c] : [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
};

/**
 * Per-step mix weight (toward white if positive, black if negative) that
 * best reproduces `target` from `base` — the same model brandOverrides
 * uses, but derived per ramp instead of hardcoded for teal, so each ramp
 * keeps its own tint/shade geometry when rebuilt from a new base.
 */
const stepWeight = (
  base: [number, number, number],
  target: [number, number, number]
): number => {
  const towardWhite = luminance(target) > luminance(base);
  const pole = towardWhite ? 255 : 0;
  let sum = 0;
  let n = 0;
  for (let i = 0; i < 3; i++) {
    const denom = pole - base[i];
    if (Math.abs(denom) < 8) continue;
    sum += (target[i] - base[i]) / denom;
    n++;
  }
  const w = Math.min(1, Math.max(0, n ? sum / n : 0));
  return towardWhite ? w : -w;
};

const rampWeights = new Map<string, ReadonlyArray<[string, number]>>();

const weightsFor = (ramp: (typeof CHROMATIC_RAMPS)[number]) => {
  let weights = rampWeights.get(ramp.name);
  if (!weights) {
    const base = hexToRgb(ramp.steps.find(([s]) => s === RAMP_BASE_STEP)![1]);
    weights = ramp.steps.map(([step, hex]) => [step, stepWeight(base, hexToRgb(hex))]);
    rampWeights.set(ramp.name, weights);
  }
  return weights;
};

/** A chromatic ramp rebuilt around a new key (step 07) colour, using the
    ramp's own derived tint/shade geometry. */
export function rampRebaseSteps(
  rampName: string,
  keyHex: string
): Array<[step: string, hex: string]> {
  const ramp = CHROMATIC_RAMPS.find((r) => r.name === rampName)!;
  const key = hexToRgb(keyHex);
  return ramp.steps.map(([step]) => {
    const weight = weightsFor(ramp).find(([s]) => s === step)![1];
    const rgb =
      weight === 0 ? key : mix(key, weight > 0 ? WHITE : BLACK, Math.abs(weight));
    return [step, rgbToHex(rgb)];
  });
}

/**
 * The ramp family a colour belongs to, by hue distance to each chromatic
 * key. Greys (and near-black/near-white) belong to neutral. This is what
 * keeps a custom action colour honest: a warm orange brand reshapes the
 * orange ramp, never the teal one.
 */
export function nearestRampFor(hex: string): string {
  const [h, s, l] = rgbToHsl(hexToRgb(hex));
  if (s < 0.1 || l < 0.04 || l > 0.97) return "neutral";
  let best = "teal";
  let bestD = Infinity;
  for (const ramp of CHROMATIC_RAMPS) {
    const [rampHue] = rgbToHsl(
      hexToRgb(ramp.steps.find(([step]) => step === RAMP_BASE_STEP)![1])
    );
    const d = Math.abs(h - rampHue);
    const dist = Math.min(d, 360 - d);
    if (dist < bestD) {
      bestD = dist;
      best = ramp.name;
    }
  }
  return best;
}

export interface AdvancedColorState {
  /** Degrees added to every chromatic hue (-180..180). */
  hueShift: number;
  /** Saturation multiplier as a percentage (100 = shipped). */
  satScale: number;
  /** Per-ramp replacement base (step 07) colours, keyed by ramp name. */
  bases: Record<string, string>;
}

export const DEFAULT_ADVANCED: AdvancedColorState = {
  hueShift: 0,
  satScale: 100,
  bases: {},
};

export const isAdvancedPristine = (s: AdvancedColorState): boolean =>
  s.hueShift === 0 && s.satScale === 100 && Object.keys(s.bases).length === 0;

/**
 * Overrides for the advanced-mode levers. Per-ramp bases rebuild that
 * ramp with its own derived weights; the hue/saturation levers then
 * transform every chromatic step. `current` is the overrides already
 * computed by the simpler levers (the action-colour ramp, mostly) so the
 * global levers start from what is on screen, not the shipped values.
 */
export function advancedColorOverrides(
  state: AdvancedColorState,
  current: Overrides
): Overrides {
  const overrides: Overrides = {};
  const global = state.hueShift !== 0 || state.satScale !== 100;
  for (const ramp of CHROMATIC_RAMPS) {
    const pickedBase = state.bases[ramp.name];
    if (!pickedBase && !global) continue;
    const rebased = pickedBase
      ? new Map(rampRebaseSteps(ramp.name, pickedBase))
      : null;
    for (const [step, shippedHex] of ramp.steps) {
      const varName = `--primitive-${ramp.name}-${step}`;
      let rgb: [number, number, number] = hexToRgb(
        rebased ? rebased.get(step)! : (current[varName] ?? shippedHex)
      );
      if (global) {
        const hsl = rgbToHsl(rgb);
        hsl[0] += state.hueShift;
        hsl[1] = Math.min(1, Math.max(0, hsl[1] * (state.satScale / 100)));
        rgb = hslToRgb(hsl);
      }
      overrides[varName] = rgbToHex(rgb);
    }
  }
  return overrides;
}

/* ---------- neutral tint ---------- */

interface NeutralDef {
  step: string;
  hex: string;
  /** rgba() variants that share this base: suffix → alpha */
  alphas?: Record<string, number>;
}

/** The shipped neutral scale, including every rgba() variant's alpha. */
const NEUTRALS: NeutralDef[] = [
  { step: "00", hex: "#FFFFFF", alphas: { "-transparent": 0.01, "-semi": 0.6, "-glass": 0.9 } },
  { step: "01", hex: "#F1F1F1", alphas: { "-transparent": 0.01, "-semi": 0.6, "-glass": 0.82 } },
  { step: "02", hex: "#D6D6D6", alphas: { "-semi": 0.8 } },
  { step: "03", hex: "#BCBCBC", alphas: { "-semi": 0.8 } },
  { step: "04", hex: "#A2A2A2" },
  { step: "05", hex: "#888888" },
  { step: "06", hex: "#6D6D6D" },
  { step: "07", hex: "#303030", alphas: { "-semi": 0.8 } },
  { step: "08", hex: "#232323", alphas: { "-semi": 0.8 } },
  {
    step: "09",
    hex: "#0E0E0E",
    alphas: { "-transparent": 0.01, "-semi": 0.8, "-semi-transparent": 0.6, "-glass": 0.66 },
  },
  { step: "10", hex: "#050505", alphas: { "-semi": 0.6, "-subtle": 0.01 } },
  { step: "11", hex: "#000000" },
];

export const DEFAULT_NEUTRAL_SEED = "#0E6E8F";

/**
 * Tints every neutral primitive toward a seed colour. `strength` is
 * 0..0.2 — even 6% turns the white floor into a subtle brand wash.
 * rgba() variants are regenerated with their original alphas.
 */
export function neutralOverrides(seedHex: string, strength: number): Overrides {
  const seed = hexToRgb(seedHex);
  const overrides: Overrides = {};
  for (const { step, hex, alphas } of NEUTRALS) {
    const tinted = mix(hexToRgb(hex), seed, strength);
    overrides[`--primitive-neutral-${step}`] = rgbToHex(tinted);
    for (const [suffix, alpha] of Object.entries(alphas ?? {})) {
      const [r, g, b] = tinted.map((c) => Math.round(c));
      overrides[`--primitive-neutral-${step}${suffix}`] = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  }
  return overrides;
}

/* ---------- pointer mode: repoint semantics at a real ramp ---------- */

/**
 * Every semantic token the shipped themes point at the teal (action) ramp,
 * as role intents in key-relative weight steps ("07" is the key itself,
 * lower tints, higher shades). Mirrors the SHAPE of tokens-light/dark.css
 * by hand — if those files repoint a role, update this map. The shipped
 * themes split per theme (light: deep fill under a light label; dark
 * inverts to a light fill under a dark label), so the two columns differ.
 * Nearest-step matching cannot always land the exact shipped step from an
 * arbitrary key — for the shipped keys the token files are authoritative
 * (the default hex never derives; it short-circuits to a null plan).
 * `null` means that theme keeps its shipped value for the role.
 */
const ACTION_SEMANTIC_REFS: ReadonlyArray<{
  cssVar: string;
  light: string | null;
  dark: string | null;
}> = [
  { cssVar: "--color-action-primary-bg", light: "07", dark: "07" },
  { cssVar: "--color-action-primary-bg-hover", light: "08", dark: "06" },
  { cssVar: "--color-action-primary-bg-active", light: "09", dark: "05" },
  /* Label steps are "02" in both themes on purpose: brandRampValues
     inverts the tint pole for a light key, so "02" always means "oppose
     the fill" — near-white on a dark fill, near-black on a light one. For
     the shipped dark key (teal-05) it lands on teal-10, the shipped label. */
  { cssVar: "--color-action-primary-text", light: "02", dark: "02" },
  { cssVar: "--color-action-primary-text-active", light: null, dark: "02" },
  { cssVar: "--color-action-primary-text-secondary", light: "10", dark: "10" },
  { cssVar: "--color-action-primary-text-tertiary", light: "08", dark: "07" },
  { cssVar: "--color-action-primary-border", light: "10", dark: "07" },
  { cssVar: "--color-action-primary-border-secondary", light: "07", dark: "08" },
  { cssVar: "--color-action-primary-border-tertiary", light: "07", dark: "07" },
  { cssVar: "--color-action-icon-active", light: "02", dark: "02" },
  { cssVar: "--color-core-ui-primary", light: "07", dark: "07" },
  { cssVar: "--color-core-ui-secondary", light: "10", dark: "09" },
  { cssVar: "--color-input-border-hover", light: "05", dark: "08" },
  { cssVar: "--color-input-border-selected", light: "07", dark: "08" },
  { cssVar: "--color-ai-gradient-end", light: "07", dark: "08" },
];

/** Steps of any primitive ramp, the neutral scale included. */
const rampStepsOf = (ramp: string): ReadonlyArray<[string, string]> =>
  ramp === "neutral"
    ? NEUTRALS.map(({ step, hex }) => [step, hex] as [string, string])
    : CHROMATIC_RAMPS.find((r) => r.name === ramp)!.steps;

/**
 * The primitive a hex value is, if it is one. This is what decides pointer
 * mode: an action colour that names a real primitive (every preset swatch
 * does) can be expressed as semantic re-pointing instead of a rewritten
 * teal ramp.
 */
export function findPrimitive(
  hex: string
): { ramp: string; step: string } | null {
  const target = hex.toUpperCase();
  for (const ramp of CHROMATIC_RAMPS) {
    for (const [step, stepHex] of ramp.steps) {
      if (stepHex === target) return { ramp: ramp.name, step };
    }
  }
  for (const { step, hex: stepHex } of NEUTRALS) {
    if (stepHex === target) return { ramp: "neutral", step };
  }
  return null;
}

const distSq = (
  a: [number, number, number],
  b: [number, number, number]
): number => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;

/**
 * Semantic overrides that repoint the action roles at a real ramp — the
 * honest version of brandOverrides. Each role's intended colour (key
 * shifted by the shipped tint/shade weight) is matched to the nearest
 * actual step of the target ramp, so the output is pure
 * `var(--primitive-…)` references and the teal primitives stay teal.
 * A light key (a white or yellow button) shifts every supporting role
 * toward the dark end via the same inversion brandOverrides uses.
 */
export function actionPointerOverrides(
  ramp: string,
  keyHex: string,
  theme: "light" | "dark",
  /** Match against these step values instead of the shipped ramp — used
      when the target ramp is itself being rebased around the key. */
  candidateSteps?: ReadonlyArray<[string, string]>
): Overrides {
  const ideal = brandRampValues(keyHex);
  const steps = candidateSteps ?? rampStepsOf(ramp);
  const order = steps.map(([s]) => s);
  const rgbByStep = new Map(steps.map(([s, h]) => [s, hexToRgb(h)]));

  const nearest = (
    target: [number, number, number],
    preferred: string
  ): string => {
    let best = order[0];
    let bestD = Infinity;
    for (const [step, rgb] of rgbByStep) {
      const d = distSq(rgb, target);
      if (d < bestD) {
        bestD = d;
        best = step;
      }
    }
    /* Ties happen on irregular ramps (a rebased step can duplicate the
       key) — prefer the canonical step the shipped theme uses. */
    const preferredRgb = rgbByStep.get(preferred);
    if (preferredRgb && distSq(preferredRgb, target) === bestD) return preferred;
    return best;
  };

  const picked: Record<string, string> = {};
  const overrides: Overrides = {};
  for (const ref of ACTION_SEMANTIC_REFS) {
    const tealStep = theme === "light" ? ref.light : ref.dark;
    if (!tealStep) continue; // that theme keeps its shipped value
    picked[ref.cssVar] = nearest(ideal[tealStep], tealStep);
  }

  /* Nearest-match can collapse bg/hover/active onto one step, which would
     erase the interaction states — force them onto distinct steps. The
     direction is the theme's: light hover/active deepen away from the white
     page, dark ones brighten away from the near-black one — unless the key
     is already near-white (the black & white preset's dark button), where
     there is no brightening headroom and a slight deepen reads correctly. */
  const idx = (s: string) => order.indexOf(s);
  const brighten = theme === "dark" && luminance(hexToRgb(keyHex)) < 0.8;
  const dir = brighten ? -1 : 1;
  const walk = (s: string) =>
    order[Math.min(order.length - 1, Math.max(0, idx(s) + dir))];
  const collapsed = (outer: string, inner: string) =>
    brighten ? idx(outer) >= idx(inner) : idx(outer) <= idx(inner);
  const bg = "--color-action-primary-bg";
  const hover = "--color-action-primary-bg-hover";
  const active = "--color-action-primary-bg-active";
  if (collapsed(picked[hover], picked[bg])) picked[hover] = walk(picked[bg]);
  if (collapsed(picked[active], picked[hover])) picked[active] = walk(picked[hover]);

  for (const [cssVar, step] of Object.entries(picked)) {
    overrides[cssVar] = `var(--primitive-${ramp}-${step})`;
  }
  return overrides;
}

/**
 * Everything the action-colour lever does for one hex in one theme.
 * `primitives` is theme-agnostic (a custom hex rebases its nearest ramp);
 * `semantics` is the theme's pointer map. Null for the shipped default.
 */
export interface ActionColorPlan {
  /** The ramp the action tokens point at. */
  ramp: string;
  /** True when the hex names a real primitive — nothing is rewritten. */
  isPrimitive: boolean;
  /** Rebased `--primitive-*` values for a custom hex; empty otherwise. */
  primitives: Overrides;
  /** Semantic `var(--primitive-…)` pointers for the requested theme. */
  semantics: Overrides;
}

export function actionColorPlan(
  hex: string,
  theme: "light" | "dark"
): ActionColorPlan | null {
  const upper = hex.toUpperCase();
  if (upper === DEFAULT_BRAND) return null;
  const prim = findPrimitive(upper);
  if (prim) {
    if (prim.ramp === "teal" && prim.step === "08") return null;
    return {
      ramp: prim.ramp,
      isPrimitive: true,
      primitives: {},
      semantics: actionPointerOverrides(prim.ramp, upper, theme),
    };
  }
  const ramp = nearestRampFor(upper);
  if (ramp === "neutral") {
    /* A grey custom hex points at the shipped neutral scale — rebasing
       the neutral primitives would drag every page surface with it. */
    return {
      ramp,
      isPrimitive: false,
      primitives: {},
      semantics: actionPointerOverrides(ramp, upper, theme),
    };
  }
  const rebased = rampRebaseSteps(ramp, upper);
  const primitives: Overrides = {};
  for (const [step, stepHex] of rebased) {
    primitives[`--primitive-${ramp}-${step}`] = stepHex;
  }
  return {
    ramp,
    isPrimitive: false,
    primitives,
    semantics: actionPointerOverrides(ramp, upper, theme, rebased),
  };
}

/* ---------- radius ---------- */

const RADIUS_STEPS: ReadonlyArray<[step: string, px: number]> = [
  ["xxs", 2],
  ["xs", 4],
  ["sm", 8],
  ["md", 12],
  ["lg", 16],
  ["xl", 24],
  ["xxl", 48],
  // The composer shell's concentric corner (see tokens-primitives.css).
  ["composer", 29],
];

/**
 * Scales the radius scale (0..2). `pill` keeps `--radius-full` at its
 * shipped 999px; turning it off squares the pills to the scaled lg step.
 */
export function radiusOverrides(scale: number, pill: boolean): Overrides {
  const overrides: Overrides = {};
  for (const [step, px] of RADIUS_STEPS) {
    overrides[`--primitive-radius-${step}`] = `${Math.round(px * scale)}px`;
  }
  if (!pill) {
    overrides["--primitive-radius-full"] = `${Math.max(2, Math.round(16 * scale))}px`;
  }
  return overrides;
}

/* ---------- fonts ---------- */

export interface FontOption {
  /** Display label + dropdown value */
  label: string;
  /** CSS font-family value (quoted family + fallback) */
  family: string;
  /** Google Fonts css2 family parameter; null for the bundled default */
  googleParam: string | null;
}

export const FONT_OPTIONS: FontOption[] = [
  { label: "Nunito Sans (default)", family: "", googleParam: null },
  { label: "Inter", family: "'Inter', sans-serif", googleParam: "Inter:wght@300;400;500;600;700" },
  { label: "DM Sans", family: "'DM Sans', sans-serif", googleParam: "DM+Sans:wght@300;400;500;600;700" },
  { label: "Poppins", family: "'Poppins', sans-serif", googleParam: "Poppins:wght@300;400;500;600;700" },
  { label: "Montserrat", family: "'Montserrat', sans-serif", googleParam: "Montserrat:wght@300;400;500;600;700" },
  { label: "Work Sans", family: "'Work Sans', sans-serif", googleParam: "Work+Sans:wght@300;400;500;600;700" },
  { label: "Source Sans 3", family: "'Source Sans 3', sans-serif", googleParam: "Source+Sans+3:wght@300;400;500;600;700" },
  { label: "IBM Plex Sans", family: "'IBM Plex Sans', sans-serif", googleParam: "IBM+Plex+Sans:wght@300;400;500;600;700" },
  { label: "Space Grotesk", family: "'Space Grotesk', sans-serif", googleParam: "Space+Grotesk:wght@300;400;500;600;700" },
  { label: "Lora (serif)", family: "'Lora', serif", googleParam: "Lora:wght@400;500;600;700" },
  { label: "IBM Plex Mono", family: "'IBM Plex Mono', monospace", googleParam: "IBM+Plex+Mono:wght@300;400;500;600;700" },
];

/**
 * The heading lever's list. "Match body" is the shipped single-face
 * system (the heading role keeps chaining to the primary token, so the
 * body lever drives everything); a real Nunito Sans entry follows because
 * the body default is Nunito only by way of the site's own next/font
 * face — splitting the other way (Nunito headings over another body face)
 * needs it loadable by name.
 */
export const HEADING_MATCH_LABEL = "Match body";

export const HEADING_FONT_OPTIONS: FontOption[] = [
  { label: HEADING_MATCH_LABEL, family: "", googleParam: null },
  { label: "Nunito Sans", family: "'Nunito Sans', sans-serif", googleParam: "Nunito+Sans:opsz,wght@6..12,300..700" },
  ...FONT_OPTIONS.slice(1),
];

export function googleFontHref(googleParam: string): string {
  return `https://fonts.googleapis.com/css2?family=${googleParam}&display=swap`;
}

/* ---------- copy-paste CSS ---------- */

/** The consumer-ready snippet reproducing the current playground state.
    `darkOverrides` adds a theme-scoped block for presets whose action
    colour differs between themes; `headingFont` adds the heading role
    when it is split from the body face. */
export function buildCssSnippet(
  overrides: Overrides,
  font: FontOption,
  darkOverrides?: Overrides,
  headingFont?: FontOption
): string {
  const lines: string[] = [];
  const googleParams = [font.googleParam, headingFont?.googleParam].filter(
    (p, i, all): p is string => Boolean(p) && all.indexOf(p) === i
  );
  if (googleParams.length > 0) {
    lines.push(
      `/* Load the font${googleParams.length > 1 ? "s" : ""} first, e.g.:`,
      ...googleParams.map(
        (p) => `   <link rel="stylesheet" href="${googleFontHref(p)}">`
      ),
      `*/`
    );
  }
  lines.push(":root {");
  if (font.family) {
    lines.push(`  --font-family-primary: ${font.family};`);
  }
  if (headingFont?.family) {
    lines.push(`  --font-family-heading: ${headingFont.family};`);
  }
  for (const [name, value] of Object.entries(overrides)) {
    lines.push(`  ${name}: ${value};`);
  }
  lines.push("}");
  if (darkOverrides && Object.keys(darkOverrides).length > 0) {
    lines.push("", '[data-theme="dark"] {');
    for (const [name, value] of Object.entries(darkOverrides)) {
      lines.push(`  ${name}: ${value};`);
    }
    lines.push("}");
  }
  return lines.join("\n");
}
