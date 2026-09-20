import type { DropdownOption } from "@robr0/design-system/components/Dropdown/Dropdown";
import type { RichDropdownOption } from "@robr0/design-system/components/RichDropdown/RichDropdown";
import {
  DEFAULT_BRAND,
  DEFAULT_BRAND_DARK,
  DEFAULT_NEUTRAL_SEED,
  FONT_OPTIONS,
  HEADING_FONT_OPTIONS,
  actionColorPlan,
  advancedColorOverrides,
  densityOverrides,
  elevationOverrides,
  isAdvancedPristine,
  motionScaleOverrides,
  neutralOverrides,
  radiusOverrides,
  typeScaleOverrides,
  type AdvancedColorState,
  type ElevationVariant,
  type Overrides,
} from "./theme-overrides";

/** A preset is a saved position for EVERY lever — a complete theme, not a
    partial one. `fontLabel` must match a FONT_OPTIONS entry,
    `headingFontLabel` a HEADING_FONT_OPTIONS entry. Every lever is
    required (100 / "default" is the shipped position) so a preset can
    ship as a whole-site stylesheet: one `data-brand` attribute swaps the
    entire look, and a lever a preset forgot would silently inherit
    whatever came before it. */
export interface ThemePreset {
  label: string;
  brand: string;
  /** Theme-dependent action colour: used instead of `brand` in dark mode
      (the black & white preset flips to a white button there). */
  brandDark?: string;
  tintOn: boolean;
  tintSeed: string;
  tintStrength: number;
  radiusScale: number;
  pill: boolean;
  /** Spacing density, percent of the shipped ladders (100 = shipped). */
  density: number;
  /** Type scale, percent of the shipped size + line-height ladders. */
  typeScale: number;
  /** Schedule-motion tempo, percent of the shipped durations (never loop-*). */
  motionScale: number;
  /** Shadow treatment: the shipped pair, none, or the softer float. */
  elevation: ElevationVariant;
  fontLabel: string;
  /** Heading face when split from the body face; absent means the heading
      role follows the body typeface (the shipped single-face system). */
  headingFontLabel?: string;
  /** Hand-tuned adjacent ramp keys: every chromatic ramp re-keyed to sit
      in the theme (the action colour's own family is left to the action
      lever). Loads into the Advanced colours state. */
  advanced?: AdvancedColorState;
  /** Preset-specific extras beyond the levers (e.g. greyscale accents). */
  extraOverrides?: Overrides;
  /**
   * Extras that only apply in dark mode, layered over `extraOverrides`.
   * Same reason `brandDark` exists: a few action roles cannot hold one
   * value across both themes, and the derived ramp assumes the light-mode
   * shape (fills that deepen under a light label). A preset that inverts
   * that shape corrects the affected roles here.
   */
  extraOverridesDark?: Overrides;
}

/** Shorthand: an AdvancedColorState that only sets ramp keys. */
const bases = (b: Record<string, string>): AdvancedColorState => ({
  hueShift: 0,
  satScale: 100,
  bases: b,
});

export const THEME_PRESETS: Record<string, ThemePreset> = {
  classic: {
    label: "Classic (pre-split teal)",
    // The pre-promotion shipped theme, kept as a revert handle: teal-07 as
    // one action colour across both themes, before "Accessible teal" (the
    // per-theme split now shipped in the token files) became the default.
    // The lever derives an inverted dark plan from teal-07, so every role
    // is pinned to the exact steps the old tokens-light/dark.css used.
    brand: "#118AB2",
    tintOn: false,
    tintSeed: DEFAULT_NEUTRAL_SEED,
    tintStrength: 6,
    radiusScale: 100,
    pill: true,
    density: 100,
    typeScale: 100,
    motionScale: 100,
    elevation: "default",
    fontLabel: "Nunito Sans (default)",
    extraOverrides: {
      "--color-action-primary-bg": "var(--primitive-teal-07)",
      "--color-action-primary-bg-hover": "var(--primitive-teal-08)",
      "--color-action-primary-bg-active": "var(--primitive-teal-09)",
      "--color-action-primary-text": "var(--primitive-teal-02)",
      "--color-action-primary-text-tertiary": "var(--primitive-teal-07)",
      "--color-action-primary-border": "var(--primitive-teal-09)",
      "--color-action-primary-border-secondary": "var(--primitive-teal-06)",
      "--color-action-primary-border-tertiary": "var(--primitive-teal-04)",
      "--color-action-icon-active": "var(--primitive-teal-02)",
      "--color-core-ui-primary": "var(--primitive-teal-07)",
      "--color-core-ui-secondary": "var(--primitive-teal-10)",
      "--color-input-border-hover": "var(--primitive-teal-04)",
      "--color-input-border-selected": "var(--primitive-teal-06)",
      "--color-ai-gradient-end": "var(--primitive-teal-06)",
    },
    // The classic theme pointed both themes at the same fills; only these
    // five roles differed in its dark file.
    extraOverridesDark: {
      "--color-action-primary-text-active": "var(--primitive-neutral-01)",
      "--color-action-icon-active": "var(--primitive-neutral-01)",
      "--color-core-ui-secondary": "var(--primitive-teal-09)",
      "--color-input-border-hover": "var(--primitive-teal-09)",
      "--color-ai-gradient-end": "var(--primitive-teal-05)",
    },
  },
  warm: {
    label: "Warm serif",
    brand: "#D97757",
    tintOn: true,
    tintSeed: "#C08B5C",
    tintStrength: 8,
    radiusScale: 100,
    pill: true,
    density: 100,
    typeScale: 100,
    motionScale: 100,
    elevation: "default",
    // The editorial pairing, and the split-face demonstration: Lora
    // carries the display personality while running text stays in a
    // humanist sans.
    fontLabel: "Source Sans 3",
    headingFontLabel: "Lora (serif)",
    // Earthy neighbours: every hue muted and pulled a few degrees toward
    // the terracotta key. Orange is the action family, left alone.
    advanced: bases({
      red: "#D45B66",
      yellow: "#EAC57B",
      green: "#44A87D",
      teal: "#28929B",
      blue: "#3D4E9E",
      purple: "#9B67BE",
    }),
  },
  mono: {
    label: "Black & white",
    // Real neutral primitives (08 / 01), so the action colour applies as
    // semantic re-pointing at the neutral ramp instead of a rewritten teal.
    brand: "#232323",
    brandDark: "#F1F1F1",
    tintOn: false,
    tintSeed: DEFAULT_NEUTRAL_SEED,
    tintStrength: 6,
    radiusScale: 40,
    pill: false,
    // Print-like: hairlines carry the depth, shadows go entirely.
    density: 100,
    typeScale: 100,
    motionScale: 100,
    elevation: "flat",
    fontLabel: "Inter",
    // Ink-wash chromatics: hue and value hold, saturation drops hard, so
    // any colour that does appear reads as a tinted grey.
    advanced: bases({
      red: "#BB7B8A",
      orange: "#BB927B",
      yellow: "#D0BE95",
      green: "#469681",
      teal: "#437180",
      blue: "#4B5B83",
      purple: "#9C7BBB",
    }),
    // Grey out the decorative accents (they colour the background glow
    // blobs, among other things). Status colours are a separate token set
    // and deliberately keep their meaning.
    extraOverrides: {
      "--color-core-accent-coral": "#A3A3A3",
      "--color-core-accent-violet": "#8F8F8F",
      "--color-core-accent-cobalt": "#5C5C5C",
      "--color-core-accent-amber": "#B8B8B8",
      "--color-core-accent-gold": "#C9C9C9",
      "--color-core-accent-mint": "#ADADAD",
    },
  },
  contrast: {
    label: "Modern blue tint",
    brand: "#1E40AF",
    tintOn: true,
    tintSeed: "#1E40AF",
    tintStrength: 4,
    radiusScale: 100,
    pill: true,
    density: 100,
    typeScale: 100,
    motionScale: 100,
    elevation: "default",
    fontLabel: "IBM Plex Sans",
    // Cool neighbours: every hue eased toward the cobalt key and slightly
    // calmed. Blue is the action family, left alone.
    advanced: bases({
      red: "#E25489",
      orange: "#E27354",
      yellow: "#F4BB71",
      green: "#16C6AB",
      teal: "#1D7DA6",
      purple: "#9354E2",
    }),
  },
  coral: {
    label: "Coral getaway",
    // Hospitality-brand look in the Airbnb direction: the coral key lands
    // in the red family, so the lever rebases red and every other hue is
    // re-keyed toward the travel palette (a beach teal, a sunset orange).
    brand: "#FF385C",
    tintOn: false,
    tintSeed: DEFAULT_NEUTRAL_SEED,
    tintStrength: 6,
    // Rounded but never pill: friendly 8px-feel buttons, like a booking
    // card's reserve button rather than a chip.
    radiusScale: 100,
    pill: false,
    // Hospitality float: the softer, lower shadow pair.
    density: 100,
    typeScale: 100,
    motionScale: 100,
    elevation: "soft",
    fontLabel: "DM Sans",
    headingFontLabel: "Poppins",
    // Red is the action family, left alone.
    advanced: bases({
      orange: "#FC642D",
      yellow: "#F5B93F",
      green: "#3FA97C",
      teal: "#00A699",
      blue: "#4A7BD0",
      purple: "#A6527F",
    }),
  },
  gold: {
    label: "Crisp gold",
    // The yellow key is a light colour, so the action lever derives dark
    // labels over gold fills on its own — no brandDark needed.
    brand: "#FFD166",
    tintOn: true,
    tintSeed: "#FFD166",
    tintStrength: 4,
    // Crisp: corners cut hard toward square, and no pill anywhere.
    radiusScale: 30,
    pill: false,
    density: 100,
    typeScale: 100,
    // Modern and quick on its feet: a notch under the shipped tempo.
    motionScale: 90,
    elevation: "default",
    // One bold geometric face carries the whole look.
    fontLabel: "Space Grotesk",
    // Bold neighbours: every hue keyed hot around the gold. Yellow is
    // the action family, left alone.
    advanced: bases({
      red: "#F04E5E",
      orange: "#FF9A3D",
      green: "#2FBF8F",
      teal: "#1A9BB8",
      blue: "#3355D8",
      purple: "#8A4DE8",
    }),
  },
  terminal: {
    label: "Terminal green",
    brand: "#06D6A0",
    tintOn: true,
    tintSeed: "#06D6A0",
    tintStrength: 4,
    radiusScale: 0,
    pill: false,
    // A terminal answers fast and casts no shadows.
    density: 100,
    typeScale: 100,
    motionScale: 80,
    elevation: "flat",
    fontLabel: "IBM Plex Mono",
    // Phosphor neighbours: hues lean toward the emerald key, slightly
    // softened. Green is the action family, left alone.
    advanced: bases({
      red: "#E05665",
      orange: "#E09956",
      yellow: "#F1DC74",
      teal: "#1F8AA4",
      blue: "#2B59A3",
      purple: "#7E5BC8",
    }),
  },
  violet: {
    label: "Soft violet",
    brand: "#7434B3",
    tintOn: true,
    tintSeed: "#9E47EF",
    tintStrength: 5,
    // Rounder than the shipped scale, pills kept — the generous corner
    // is the theme's signature.
    radiusScale: 140,
    pill: true,
    density: 100,
    typeScale: 100,
    motionScale: 100,
    // The gentler float suits the rounded geometry.
    elevation: "soft",
    // The serif-over-sans split: Lora display over Work Sans text.
    fontLabel: "Work Sans",
    headingFontLabel: "Lora (serif)",
    // Violet-leaning neighbours, slightly calmed. Purple is the action
    // family, left alone.
    advanced: bases({
      red: "#E0568F",
      orange: "#D97B62",
      yellow: "#E8C77B",
      green: "#3FAF95",
      teal: "#4B8FB8",
      blue: "#5C63D8",
    }),
  },
};


/**
 * The selector order every theme surface renders — the landing's dot
 * row and the playground's preset picker walk this list. "default" is
 * the shipped Dragonspine look (no data-brand attribute); "classic"
 * stays out on purpose (a revert handle, not a destination).
 */
export const THEME_SELECTOR_ORDER: ReadonlyArray<string> = [
  "coral",
  "warm",
  "gold",
  "terminal",
  "default",
  "contrast",
  "violet",
  "mono",
];

/* ---------- rich picker cells ----------
   The preset selector renders each option as a self-portrait (RichDropdown):
   name in the preset's heading face, the pairing's names in its body face,
   and its key colour as the swatch. Everything below turns a ThemePreset
   into that cell. */

/** The shipped face, written out because the cells must stay truthful while
    the live levers override the theme's own family roles. */
const SHIPPED_FONT_STACK = "'Nunito Sans', sans-serif";

/** Strip a label's parenthetical qualifier for display: "Lora (serif)" → "Lora". */
const fontName = (label: string) => label.replace(/\s*\(.+\)$/, "");

const bodyStack = (label: string) =>
  FONT_OPTIONS.find((f) => f.label === label)?.family || SHIPPED_FONT_STACK;

const headingStack = (label: string | undefined, bodyLabel: string) => {
  if (!label) return bodyStack(bodyLabel);
  const face = HEADING_FONT_OPTIONS.find((f) => f.label === label);
  return face?.family || bodyStack(bodyLabel);
};

/** The swatch carries the preset's corner language: pill looks keep the
    full circle, sharp looks square off. Hard values by design — this is
    drawing geometry scaled to the 24px dot, not theme; even the circle is
    pinned, because the live levers override --radius-pill itself and a
    preset's portrait must not bend to whatever theme is applied. */
const swatchRadius = (radiusScale: number, pill: boolean) =>
  pill ? "999px" : `${Math.round(radiusScale * 0.08)}px`;

const pairingLine = (bodyLabel: string, headingLabel?: string) => {
  const body = fontName(bodyLabel);
  if (!headingLabel || !HEADING_FONT_OPTIONS.find((f) => f.label === headingLabel)?.family) {
    return body;
  }
  const heading = fontName(headingLabel);
  return heading === body ? body : `${heading} over ${body}`;
};

/**
 * The preset selector's options, one rich cell per look. `theme` resolves the
 * theme-dependent key colours (black & white flips its dot with the mode);
 * `custom` is the live levers, so the Custom row is always a portrait of the
 * current state rather than a bare word.
 */
export function presetPickerOptions(args: {
  theme: "light" | "dark";
  custom: {
    brand: string;
    fontLabel: string;
    headingFontLabel: string;
    radiusScale: number;
    pill: boolean;
  };
}): RichDropdownOption[] {
  const dark = args.theme === "dark";
  return [
    {
      label: "System default",
      value: "default",
      color: dark ? DEFAULT_BRAND_DARK : DEFAULT_BRAND,
      swatchRadius: swatchRadius(100, true),
      headingFont: SHIPPED_FONT_STACK,
      bodyFont: SHIPPED_FONT_STACK,
      description: pairingLine(FONT_OPTIONS[0].label),
    },
    {
      label: "Custom",
      value: "custom",
      color: args.custom.brand,
      swatchRadius: swatchRadius(args.custom.radiusScale, args.custom.pill),
      headingFont: headingStack(args.custom.headingFontLabel, args.custom.fontLabel),
      bodyFont: bodyStack(args.custom.fontLabel),
      description: pairingLine(args.custom.fontLabel, args.custom.headingFontLabel),
    },
    /* Preset rows walk THEME_SELECTOR_ORDER (minus "default", which is
       the first row above), so this menu and the landing's dot row can
       never disagree on order. classic stays defined as the revert
       handle for the accessible teal split, deliberately not offered. */
    ...THEME_SELECTOR_ORDER
      .filter((value) => value !== "default")
      .map((value) => [value, THEME_PRESETS[value]] as const)
      .map(([value, p]) => ({
        label: p.label,
        value,
        color: dark && p.brandDark ? p.brandDark : p.brand,
        swatchRadius: swatchRadius(p.radiusScale, p.pill),
        headingFont: headingStack(p.headingFontLabel, p.fontLabel),
        bodyFont: bodyStack(p.fontLabel),
        description: pairingLine(p.fontLabel, p.headingFontLabel),
      })),
  ];
}

/**
 * The typeface levers as plain Dropdown options, each font's name set in the
 * font itself via the option-level `font` field. The default body face pins
 * the shipped stack (the theme's family roles are being overridden live, so
 * inheriting would lie), and the heading list's "match body" row previews
 * whatever the body lever holds.
 */
export function fontPickerOptions(
  kind: "body" | "heading",
  currentBodyLabel: string,
): DropdownOption[] {
  const list = kind === "body" ? FONT_OPTIONS : HEADING_FONT_OPTIONS;
  return list.map((f) => ({
    label: f.label,
    value: f.label,
    font:
      f.family ||
      (kind === "heading" ? bodyStack(currentBodyLabel) : SHIPPED_FONT_STACK),
  }));
}

/** Every Google Fonts param a picker cell can need — the font levers preview
    all of them, so the playground loads the lot once on mount (the CSS is
    tiny; woff2s only download when a face actually renders). */
export const PICKER_FONT_PARAMS = Array.from(
  new Set(
    [...FONT_OPTIONS, ...HEADING_FONT_OPTIONS]
      .map((f) => f.googleParam)
      .filter((param): param is string => Boolean(param)),
  ),
);

/* ---------- the composer ----------
   One pure function turns a preset into the exact override map the
   playground's live preview applies — and the exact declarations the
   generated [data-brand] stylesheets ship. Both consumers call THIS, so
   the preview and the shipped theme cannot disagree; the merge order
   mirrors the playground page's own memo (action plan, tint, radius,
   density, type, motion, elevation, fonts, extras, advanced last so
   harmonized ramps see the merged state). */
export function presetOverrides(
  preset: ThemePreset,
  theme: "light" | "dark"
): Overrides {
  const merged: Overrides = {};

  const brand =
    preset.brandDark && theme === "dark" ? preset.brandDark : preset.brand;
  const plan = actionColorPlan(brand, theme);
  if (plan) {
    Object.assign(merged, plan.primitives, plan.semantics);
  }
  if (preset.tintOn && preset.tintStrength > 0) {
    Object.assign(merged, neutralOverrides(preset.tintSeed, preset.tintStrength / 100));
  }
  if (preset.radiusScale !== 100 || !preset.pill) {
    Object.assign(merged, radiusOverrides(preset.radiusScale / 100, preset.pill));
  }
  if (preset.density !== 100) {
    Object.assign(merged, densityOverrides(preset.density / 100));
  }
  if (preset.typeScale !== 100) {
    Object.assign(merged, typeScaleOverrides(preset.typeScale / 100));
  }
  if (preset.motionScale !== 100) {
    Object.assign(merged, motionScaleOverrides(preset.motionScale / 100));
  }
  Object.assign(merged, elevationOverrides(preset.elevation, theme));

  const font = FONT_OPTIONS.find((f) => f.label === preset.fontLabel);
  if (font?.family) merged["--font-family-primary"] = font.family;
  const headingFont = preset.headingFontLabel
    ? HEADING_FONT_OPTIONS.find((f) => f.label === preset.headingFontLabel)
    : undefined;
  if (headingFont?.family) merged["--font-family-heading"] = headingFont.family;

  if (preset.extraOverrides) Object.assign(merged, preset.extraOverrides);
  if (theme === "dark" && preset.extraOverridesDark) {
    Object.assign(merged, preset.extraOverridesDark);
  }
  if (preset.advanced && !isAdvancedPristine(preset.advanced)) {
    Object.assign(merged, advancedColorOverrides(preset.advanced, merged));
  }
  return merged;
}
