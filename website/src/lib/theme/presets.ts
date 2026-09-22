import type { DropdownOption } from "@robr0/design-system/components/Dropdown/Dropdown";
import type { RichDropdownOption } from "@robr0/design-system/components/RichDropdown/RichDropdown";
import {
  ACCENT_NAMES,
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
  type AccentSextet,
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
  /** The ambient accent sextet — the six `--color-core-accent-*` roles as
      hexes. They colour the WebGL background blobs and feed chart series
      2–7, so every theme must say what its ambient colours are. */
  accents: AccentSextet;
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
  warm: {
    label: "Ember",
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
    // Earth sextet: every ambient colour muted toward the terracotta key.
    accents: {
      coral: "#D4695F",
      violet: "#A5789F",
      cobalt: "#5E6FA8",
      amber: "#E0955C",
      gold: "#E7C175",
      mint: "#7FAE8F",
    },
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
    label: "Smoke",
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
    headingFontLabel: "Montserrat",
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
    // Greyed accents: the background glow blobs and chart series go
    // monochrome with the rest of the look. Status colours are a separate
    // token set and deliberately keep their meaning.
    accents: {
      coral: "#A3A3A3",
      violet: "#8F8F8F",
      cobalt: "#5C5C5C",
      amber: "#B8B8B8",
      gold: "#C9C9C9",
      mint: "#ADADAD",
    },
    // Hairlines carry Smoke's depth, so its dividers step ONE ramp
    // notch stronger than the base theme's (which they inherit as
    // near-invisible on this look's flat grounds): 02 to 03 in light,
    // 08 to 07 in dark, alpha dropped. One notch is the middle ground:
    // two lit the section rules but made every table hairline shout,
    // since dozens of components ride this token.
    extraOverrides: {
      "--color-divider": "var(--primitive-neutral-03)",
    },
    extraOverridesDark: {
      "--color-divider": "var(--primitive-neutral-07)",
    },
  },
  contrast: {
    label: "Blueprint",
    brand: "#003DFF",
    tintOn: true,
    tintSeed: "#003DFF",
    tintStrength: 4,
    // Drafting-table corners: squarer than Getaway, rounder than Smoke,
    // and no pill anywhere.
    radiusScale: 70,
    pill: false,
    density: 100,
    typeScale: 100,
    motionScale: 100,
    elevation: "default",
    fontLabel: "IBM Plex Sans",
    // Electric sextet: the ambient palette run hot around the pure-blue key.
    accents: {
      coral: "#FF3D7A",
      violet: "#7A3DFF",
      cobalt: "#2E5BFF",
      amber: "#FF8A3D",
      gold: "#FFC53D",
      mint: "#00E0B8",
    },
    // Electric neighbours: every hue saturated up to sit beside the
    // pure-blue key. Blue is the action family, left alone.
    advanced: bases({
      red: "#FF2E63",
      orange: "#FF6B2E",
      yellow: "#FFC72E",
      green: "#00D68F",
      teal: "#00A8E8",
      purple: "#8A2EFF",
    }),
  },
  coral: {
    label: "Getaway",
    // Hospitality-brand look in the Airbnb direction: the coral key lands
    // in the red family, so the lever rebases red and every other hue is
    // re-keyed toward the travel palette (a beach teal, a sunset orange).
    // The key sits deeper than the reference coral so the button label can
    // clear WCAG AA; the bright coral lives on in the accent sextet.
    brand: "#D9234E",
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
    // Sunset sextet: the ambient palette leans warm around the coral key.
    accents: {
      coral: "#FF5A5F",
      violet: "#C86B98",
      cobalt: "#5E7BD0",
      amber: "#FF8E3C",
      gold: "#FFC24B",
      mint: "#2EBFA5",
    },
    // Red is the action family, left alone.
    advanced: bases({
      orange: "#FC642D",
      yellow: "#F5B93F",
      green: "#3FA97C",
      teal: "#00A699",
      blue: "#4A7BD0",
      purple: "#A6527F",
    }),
    // The derived label (a 02-step pink) tops out below AA on any fill
    // that still reads coral — lift it to plain white, the reference
    // brand's own label colour.
    extraOverrides: {
      "--color-action-primary-text": "var(--primitive-neutral-00)",
    },
  },
  gold: {
    label: "Volt",
    // The yellow key is a light colour, so the action lever derives dark
    // labels over gold fills on its own — no brandDark needed. Dark mode
    // keeps that derivation (restored in extraOverridesDark); light mode
    // deliberately inverts to an ink fill under a gold label via the
    // extras below.
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
    // Warm bold sextet: the ambient palette keyed hot around the gold.
    accents: {
      coral: "#F58B5B",
      violet: "#B78AD9",
      cobalt: "#6E7FD9",
      amber: "#FFAE4F",
      gold: "#FFD166",
      mint: "#7FC9A0",
    },
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
    // Light mode inverts the button: ink fill (mono's exact trio, so the
    // hover/active steps have proven headroom) under the gold label —
    // yellow-07 is the rebased key, #FFD166. Dark mode keeps the derived
    // gold fill, restored below because extras apply to both themes.
    extraOverrides: {
      "--color-action-primary-bg": "var(--primitive-neutral-08)",
      "--color-action-primary-bg-hover": "var(--primitive-neutral-09)",
      "--color-action-primary-bg-active": "var(--primitive-neutral-10)",
      "--color-action-primary-text": "var(--primitive-yellow-07)",
      "--color-action-primary-text-active": "var(--primitive-yellow-07)",
    },
    extraOverridesDark: {
      "--color-action-primary-bg": "var(--primitive-yellow-07)",
      "--color-action-primary-bg-hover": "var(--primitive-yellow-08)",
      "--color-action-primary-bg-active": "var(--primitive-yellow-09)",
      "--color-action-primary-text": "var(--primitive-yellow-11)",
      "--color-action-primary-text-active": "var(--primitive-yellow-11)",
    },
  },
  forest: {
    label: "Forest",
    // Deep-woods green, landing in the green family — dark enough that
    // the derived near-white label clears AA over it in both themes, so
    // one key serves light and dark. The brighter leaf greens live on in
    // the accent sextet.
    brand: "#23573F",
    tintOn: true,
    tintSeed: "#23573F",
    tintStrength: 6,
    // Organic softness: the shipped corner scale, pills kept.
    radiusScale: 100,
    pill: true,
    density: 100,
    typeScale: 100,
    // Unhurried — the woodland look moves at the shipped tempo under the
    // gentler float.
    motionScale: 100,
    elevation: "soft",
    // The trail-brand pairing: Montserrat's bold geometric caps-energy
    // headings over DM Sans text.
    fontLabel: "DM Sans",
    headingFontLabel: "Montserrat",
    // Deep-woods sextet: lit bark, dusk heather, shaded lake, the amber
    // light shaft, leaf-litter ochre and fern around the pine key.
    accents: {
      coral: "#B45E4A",
      violet: "#7E6899",
      cobalt: "#446E93",
      amber: "#C97F3F",
      gold: "#C2A147",
      mint: "#4E9A6C",
    },
    // Trail-sign bold: the display tiers ship at a light 300, which reads
    // wispy in Montserrat — Forest sets them semibold instead, with the
    // sub-display a step lighter so the hero pair keeps its hierarchy.
    extraOverrides: {
      "--font-mega-1-weight": "600",
      "--font-mega-2-weight": "600",
      "--font-display-1-weight": "600",
      "--font-display-2-weight": "600",
      "--font-sub-display-weight": "500",
    },
    // Woodland neighbours: every hue muted toward the understory. Green
    // is the action family, left alone.
    advanced: bases({
      red: "#C9524B",
      orange: "#C06B32",
      yellow: "#D0A339",
      teal: "#2E8B83",
      blue: "#3A6B9C",
      purple: "#7D5BA6",
    }),
  },
  terminal: {
    label: "Terminal",
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
    // Phosphor band: the whole ambient sextet stays in the emerald band,
    // like a single-phosphor display.
    accents: {
      coral: "#35D6A0",
      violet: "#3DBFA8",
      cobalt: "#2FA98F",
      amber: "#57E0B0",
      gold: "#7CE8C2",
      mint: "#06D6A0",
    },
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
  pink: {
    label: "Bubblegum",
    // Hot pink, landing in the red family — deep enough that the lifted
    // label clears AA over it (the tinted neutrals pull neutral-00 a
    // shade off white, so the key sits a touch under the classic
    // #DA1884); the brighter candy pinks live on in the accent sextet.
    brand: "#D0117E",
    tintOn: true,
    tintSeed: "#D0117E",
    tintStrength: 6,
    // Bubble-round: a notch past the shipped scale, pills everywhere.
    radiusScale: 120,
    pill: true,
    density: 100,
    typeScale: 100,
    // Quick on its feet — playful looks answer fast.
    motionScale: 90,
    elevation: "soft",
    // The candy-shop split: Fraunces' soft wonk over Inter's plain text.
    fontLabel: "Inter",
    headingFontLabel: "Fraunces (serif)",
    // Candy-shop sextet: every ambient colour bright and sugared around
    // the hot-pink key.
    accents: {
      coral: "#FF5A8A",
      violet: "#C45CFF",
      cobalt: "#5C7CFF",
      amber: "#FF9A4D",
      gold: "#FFD34D",
      mint: "#3DDCB8",
    },
    // Candy neighbours: every hue keyed sweet and bright beside the pink.
    // Red is the action family, left alone.
    advanced: bases({
      orange: "#FF7A3D",
      yellow: "#FFC93D",
      green: "#2ED98A",
      teal: "#22C4D6",
      blue: "#4D6BFF",
      purple: "#B44DF0",
    }),
    // The derived label (a 02-step pink) tops out below AA on any fill
    // that still reads hot pink — lift it to neutral-00 (the tinted
    // near-white, same story as Getaway).
    extraOverrides: {
      "--color-action-primary-text": "var(--primitive-neutral-00)",
      "--color-action-primary-text-active": "var(--primitive-neutral-00)",
    },
  },
  violet: {
    label: "Velvet",
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
    headingFontLabel: "Fraunces (serif)",
    // Violet-leaning sextet: the ambient palette calmed around the key.
    accents: {
      coral: "#D96BA8",
      violet: "#9E47EF",
      cobalt: "#6A5BE0",
      amber: "#D9915E",
      gold: "#D9BE7A",
      mint: "#6BAE9E",
    },
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
 * the shipped Dragonspine look (no data-brand attribute).
 */
export const THEME_SELECTOR_ORDER: ReadonlyArray<string> = [
  // Smoke leads: it is the default the server ships, so the row
  // opens on the look the visitor is already seeing.
  "mono",
  "coral",
  "warm",
  "forest",
  "gold",
  "terminal",
  "default",
  "contrast",
  "pink",
  "violet",
];

/** The shipped look's display name (the "default" selector entry — no
    data-brand attribute, the raw token files). Named here, beside the
    presets' own `label` fields, so every selector surface reads the same
    registry rather than hardcoding a string. */
export const DEFAULT_THEME_LABEL = "Tide";

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
 * One rich cell per shipped look, in THEME_SELECTOR_ORDER with "default"
 * in place mid-list — the landing's theme tiles render this directly, and
 * the playground's preset picker composes from it, so the two surfaces can
 * never disagree on order, portraits, or labels. `theme` resolves the
 * theme-dependent key colours (black & white flips its dot with the mode).
 */
export function themeSelectorTiles(theme: "light" | "dark"): RichDropdownOption[] {
  const dark = theme === "dark";
  return THEME_SELECTOR_ORDER.map((value) => {
    if (value === "default") {
      return {
        label: DEFAULT_THEME_LABEL,
        value,
        color: dark ? DEFAULT_BRAND_DARK : DEFAULT_BRAND,
        swatchRadius: swatchRadius(100, true),
        headingFont: SHIPPED_FONT_STACK,
        bodyFont: SHIPPED_FONT_STACK,
        description: pairingLine(FONT_OPTIONS[0].label),
      };
    }
    const p = THEME_PRESETS[value];
    return {
      label: p.label,
      value,
      color: dark && p.brandDark ? p.brandDark : p.brand,
      swatchRadius: swatchRadius(p.radiusScale, p.pill),
      headingFont: headingStack(p.headingFontLabel, p.fontLabel),
      bodyFont: bodyStack(p.fontLabel),
      description: pairingLine(p.fontLabel, p.headingFontLabel),
    };
  });
}

/**
 * The preset selector's options: the same tiles re-ordered for a menu
 * (the shipped look first), plus the Custom row — `custom` is the live
 * levers, so that row is always a portrait of the current state rather
 * than a bare word.
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
  const tiles = themeSelectorTiles(args.theme);
  return [
    tiles.find((t) => t.value === "default")!,
    {
      label: "Custom",
      value: "custom",
      color: args.custom.brand,
      swatchRadius: swatchRadius(args.custom.radiusScale, args.custom.pill),
      headingFont: headingStack(args.custom.headingFontLabel, args.custom.fontLabel),
      bodyFont: bodyStack(args.custom.fontLabel),
      description: pairingLine(args.custom.fontLabel, args.custom.headingFontLabel),
    },
    ...tiles.filter((t) => t.value !== "default"),
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

  /* The ambient accent sextet, always all six — a declared lever, so a
     stylesheet states its ambient colours even at the shipped keys. Just
     before the extras, so a preset's extras could still specialise one. */
  for (const name of ACCENT_NAMES) {
    merged[`--color-core-accent-${name}`] = preset.accents[name];
  }

  if (preset.extraOverrides) Object.assign(merged, preset.extraOverrides);
  if (theme === "dark" && preset.extraOverridesDark) {
    Object.assign(merged, preset.extraOverridesDark);
  }
  if (preset.advanced && !isAdvancedPristine(preset.advanced)) {
    Object.assign(merged, advancedColorOverrides(preset.advanced, merged));
  }
  return merged;
}
