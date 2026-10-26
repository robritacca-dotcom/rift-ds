import type { DropdownOption } from "rift-ds/components/Dropdown/Dropdown";
import type { RichDropdownOption } from "rift-ds/components/RichDropdown/RichDropdown";
import { BASE_THEME_ID, SERVED_THEME_ID } from "./brand";
import {
  DEFAULT_BRAND,
  accentOverrides,
  DEFAULT_BRAND_DARK,
  DEFAULT_NEUTRAL_SEED,
  FONT_OPTIONS,
  HEADING_FONT_OPTIONS,
  SHIPPED_DISPLAY_WEIGHT,
  SHIPPED_HEADING_WEIGHT,
  SHIPPED_BODY_WEIGHT,
  SHIPPED_ICON_WEIGHT,
  actionColorPlan,
  advancedColorOverrides,
  aiGradientFadeOverrides,
  ambientFadeOverrides,
  aiGradientTonalOverrides,
  densityOverrides,
  elevationOverrides,
  iconOverrides,
  isAdvancedPristine,
  motionScaleOverrides,
  neutralOverrides,
  radiusOverrides,
  trackingOverrides,
  typeScaleOverrides,
  weightOverrides,
  type AccentSextet,
  type AdvancedColorState,
  tierToneOverrides,
  type ElevationVariant,
  type Overrides,
  type LogoEndTone,
  type LogoTone,
  type TextTone,
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
  /** Schedule-motion tempo, percent of the shipped durations (never loop-*). Displayed as speed through motionSpeedPercent. */
  motionScale: number;
  /** Shadow treatment: the shipped pair, none, or the softer float. */
  elevation: ElevationVariant;
  /** Display-tier weight (Mega, Display, Sub Display); SHIPPED_DISPLAY_WEIGHT is the base look. */
  displayWeight: number;
  /** Heading-tier weight (Headings 1 to 3, Title Body); SHIPPED_HEADING_WEIGHT is the base look. */
  headingWeight: number;
  /** Body-tier weight: the paragraph's, with emphasis, overline and caption
      shifted by the same amount so they keep their distance above it;
      SHIPPED_BODY_WEIGHT is the base look. */
  bodyWeight: number;
  /** Letter-spacing offset in percent of an em, added to every style's shipped tracking (0 = shipped). */
  tracking: number;
  /** Icon stroke weight on the icon font's `wght` axis; SHIPPED_ICON_WEIGHT is the base look. */
  iconWeight: number;
  /** Filled icons instead of outlined ones. */
  iconFill: boolean;
  /** The logo's colour, apart from the action: "action" keeps the mark on
      the action colour, "ink" or a family name tones it (see
      tierToneOverrides). */
  logoTone: LogoTone;
  /** The logo gradient's second stop: "matched" follows the logo colour, a
      tone makes the mark two-colour. */
  logoEndTone: LogoEndTone;
  /** The display tier's colour (Mega, Display, Sub Display): "ink" keeps
      the neutral ink, a family name tones it. */
  displayTone: TextTone;
  /** The heading tier's colour (Headings 1 to 3), on the same terms. */
  headingTone: TextTone;
  /** Running text's colour (`--color-text-primary`): "ink" keeps the
      neutral, a family name gives the ink that family's hue. */
  textTone: TextTone;
  fontLabel: string;
  /** Heading face when split from the body face; absent means the heading
      role follows the body typeface (the shipped single-face system). */
  headingFontLabel?: string;
  /** The ambient accent sextet — the six `--color-core-accent-*` roles as
      hexes. They feed chart series 2–7 and are what the background blobs
      follow unless `ambient` says otherwise, so every theme must say what
      its ambient colours are. */
  accents: AccentSextet;
  /** The background shader's six blob colours (`--color-ambient-1` to
      `-6`) as hexes, for a theme that wants its ambient field tuned apart
      from the accents. Absent, each blob follows its accent slot. */
  ambient?: readonly [string, string, string, string, string, string];
  /** The AI gradient's stops. "tonal" draws all three from the action
      key's ramp (see aiGradientTonalOverrides); "fade" is the action
      colour fading toward the page, lighter in light mode and deeper in
      dark (see aiGradientFadeOverrides), the rule for an imported theme
      whose source states no gradient; absent keeps the base look's red
      and blue stops with the end stop on the key. */
  aiGradient?: "tonal" | "fade";
  /** The background shader's field. "fade" draws the six ambient roles
      from the action colour's ramp, fading toward the page per mode (see
      ambientFadeOverrides), the rule for an imported DESIGN.md; absent,
      the field follows the accents, or the hexes in `ambient`. */
  ambientField?: "fade";
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
    displayWeight: SHIPPED_DISPLAY_WEIGHT,
    headingWeight: SHIPPED_HEADING_WEIGHT,
    bodyWeight: SHIPPED_BODY_WEIGHT,
    tracking: 0,
    iconWeight: SHIPPED_ICON_WEIGHT,
    iconFill: false,
    logoTone: "action",
    logoEndTone: "matched",
    displayTone: "ink",
    headingTone: "ink",
    textTone: "ink",
    // The editorial pairing, and the split-face demonstration: Lora
    // carries the display personality while running text stays in a
    // humanist sans.
    fontLabel: "Source Sans 3",
    headingFontLabel: "Lora (serif)",
    // Earth sextet: every ambient colour muted toward the terracotta key.
    aiGradient: "tonal",
    accents: {
      coral: "#D4695F",
      violet: "#A5789F",
      cobalt: "#5E6FA8",
      amber: "#E0955C",
      gold: "#E7C175",
      mint: "#7FAE8F",
    },
    // The ambient field keeps the accents' gold, mint, violet and cobalt
    // and trades the coral and amber blobs for lighter tones of the key colour.
    ambient: ["#E7C175", "#7FAE8F", "#A5789F", "#5E6FA8", "#E6A792", "#F0C9BC"],
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
    displayWeight: SHIPPED_DISPLAY_WEIGHT,
    headingWeight: SHIPPED_HEADING_WEIGHT,
    bodyWeight: SHIPPED_BODY_WEIGHT,
    tracking: 0,
    iconWeight: SHIPPED_ICON_WEIGHT,
    iconFill: false,
    logoTone: "action",
    logoEndTone: "matched",
    displayTone: "ink",
    headingTone: "ink",
    textTone: "ink",
    fontLabel: "Inter",
    headingFontLabel: "Montserrat",
    // Ink-wash chromatics: hue and value hold and saturation is pulled
    // back from the base look's, so colour reads as quiet but still colour.
    advanced: bases({
      red: "#DB5B79",
      orange: "#DB895B",
      yellow: "#EDCA78",
      green: "#1EBE94",
      teal: "#25819F",
      blue: "#2F4F9F",
      purple: "#9D5BDB",
    }),
    // Greyed accents: the background glow blobs and chart series go
    // monochrome with the rest of the look. Status colours follow the
    // ink-wash ramps above, so they desaturate too.
    aiGradient: "tonal",
    accents: {
      coral: "#A3A3A3",
      violet: "#8F8F8F",
      cobalt: "#5C5C5C",
      amber: "#B8B8B8",
      gold: "#C9C9C9",
      mint: "#ADADAD",
    },
    // The ambient field keeps the accents' gold, mint, violet and cobalt
    // and trades the coral and amber blobs for lighter tones of the key colour.
    ambient: ["#C9C9C9", "#ADADAD", "#8F8F8F", "#5C5C5C", "#707070", "#A7A7A7"],
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
      // Smoke's key flips to near-white in dark mode, so the two blobs that
      // carry its lighter tones flip with it.
      "--color-ambient-5": "#F6F6F6",
      "--color-ambient-6": "#F9F9F9",
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
    displayWeight: SHIPPED_DISPLAY_WEIGHT,
    headingWeight: SHIPPED_HEADING_WEIGHT,
    bodyWeight: SHIPPED_BODY_WEIGHT,
    tracking: 0,
    iconWeight: SHIPPED_ICON_WEIGHT,
    iconFill: false,
    logoTone: "action",
    logoEndTone: "matched",
    displayTone: "ink",
    headingTone: "ink",
    textTone: "ink",
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
    displayWeight: SHIPPED_DISPLAY_WEIGHT,
    headingWeight: SHIPPED_HEADING_WEIGHT,
    bodyWeight: SHIPPED_BODY_WEIGHT,
    tracking: 0,
    iconWeight: SHIPPED_ICON_WEIGHT,
    iconFill: false,
    logoTone: "action",
    logoEndTone: "matched",
    displayTone: "ink",
    headingTone: "ink",
    textTone: "ink",
    fontLabel: "DM Sans",
    headingFontLabel: "Poppins",
    // Sunset sextet: the ambient palette leans warm around the coral key.
    aiGradient: "tonal",
    accents: {
      coral: "#FF5A5F",
      violet: "#C86B98",
      cobalt: "#5E7BD0",
      amber: "#FF8E3C",
      gold: "#FFC24B",
      mint: "#2EBFA5",
    },
    // The ambient field keeps the accents' gold, mint, violet and cobalt
    // and trades the coral and amber blobs for lighter tones of the key colour.
    ambient: ["#FFC24B", "#2EBFA5", "#C86B98", "#5E7BD0", "#E6708C", "#F0A7B8"],
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
    // Packed a notch tighter: the square corners suit a denser grid.
    density: 95,
    typeScale: 100,
    // Modern and quick on its feet: a notch under the shipped tempo.
    motionScale: 90,
    elevation: "default",
    // Both tiers a step heavier, and set tight: signage, not editorial.
    displayWeight: 500,
    headingWeight: 700,
    bodyWeight: SHIPPED_BODY_WEIGHT,
    tracking: -1,
    // Icons carry the same heavy line as the headings.
    iconWeight: 500,
    iconFill: false,
    logoTone: "action",
    logoEndTone: "matched",
    displayTone: "ink",
    headingTone: "ink",
    textTone: "ink",
    // Space Grotesk keeps the headings; Manrope takes the text, a
    // plainer geometric that reads easier at small sizes.
    fontLabel: "Manrope",
    headingFontLabel: "Space Grotesk",
    // Warm bold sextet: the ambient palette keyed hot around the gold.
    aiGradient: "tonal",
    accents: {
      coral: "#F58B5B",
      violet: "#B78AD9",
      cobalt: "#6E7FD9",
      amber: "#FFAE4F",
      gold: "#FFD166",
      mint: "#7FC9A0",
    },
    // The ambient field keeps the accents' gold, mint, violet and cobalt
    // and trades the coral and amber blobs for lighter tones of the key colour.
    ambient: ["#FFD166", "#7FC9A0", "#B78AD9", "#6E7FD9", "#FFE19C", "#FFEDC2"],
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
    // gold fill, restored below because extras apply to both themes. Its
    // hover and pressed fills brighten away from the dark label, as the
    // shipped dark teal does; deepening put yellow-09 under the yellow-11
    // label at 2.49:1. They skip a step each (04, 03) because the yellow
    // ramp is packed tight above the key, so 06 and 05 barely register.
    extraOverrides: {
      "--color-action-primary-bg": "var(--primitive-neutral-08)",
      "--color-action-primary-bg-hover": "var(--primitive-neutral-09)",
      "--color-action-primary-bg-active": "var(--primitive-neutral-10)",
      "--color-action-primary-text": "var(--primitive-yellow-07)",
      "--color-action-primary-text-active": "var(--primitive-yellow-07)",
    },
    extraOverridesDark: {
      "--color-action-primary-bg": "var(--primitive-yellow-07)",
      "--color-action-primary-bg-hover": "var(--primitive-yellow-04)",
      "--color-action-primary-bg-active": "var(--primitive-yellow-03)",
      "--color-action-primary-text": "var(--primitive-yellow-11)",
      "--color-action-primary-text-active": "var(--primitive-yellow-11)",
    },
  },
  zest: {
    label: "Zest",
    // Fintech-brand look in the Wise direction: a bright lime fill under
    // a deep forest label, heavy tight display type, and near-flat white
    // surfaces on a faintly green-grey page. The key sits a few degrees
    // greener than the reference lime (#9FE870, hue 96) so it lands in the
    // GREEN family rather than yellow (the nearest-ramp split falls at
    // hue 103). Keyed into green, the positive status goes lime with it,
    // which is the point.
    brand: "#8AE86E",
    // The forest seed at a whisper: white steps to the grey-green section
    // ground, and the near-blacks pick up the warm green cast of the
    // reference's ink.
    tintOn: true,
    tintSeed: "#163300",
    tintStrength: 4,
    // Generous corners, pills kept: pill buttons and chips, cards and
    // calculator panels rounded well past the shipped scale.
    radiusScale: 140,
    pill: true,
    density: 100,
    typeScale: 100,
    motionScale: 100,
    // Tonal depth (white on grey-green) rather than cast shadows — the
    // softer float where a surface must lift at all.
    elevation: "soft",
    displayWeight: 800,
    headingWeight: SHIPPED_HEADING_WEIGHT,
    bodyWeight: SHIPPED_BODY_WEIGHT,
    tracking: 0,
    iconWeight: SHIPPED_ICON_WEIGHT,
    iconFill: false,
    logoTone: "action",
    logoEndTone: "matched",
    displayTone: "ink",
    headingTone: "ink",
    textTone: "ink",
    // The reference pairing, near enough: Inter Tight's heavy weights
    // stand in for the brand's own display grotesque over Inter text.
    fontLabel: "Inter",
    headingFontLabel: "Inter Tight",
    // Bright sextet: the reference's candy-bright secondaries brought up
    // to chart strength around the lime, which doubles as mint.
    aiGradient: "tonal",
    accents: {
      coral: "#FF7A66",
      violet: "#B18CFF",
      cobalt: "#5AA9E6",
      amber: "#FFA94D",
      gold: "#FFE14D",
      mint: "#8AE86E",
    },
    // The ambient field keeps the accents' gold, mint, violet and cobalt
    // and trades the coral and amber blobs for lighter tones of the key colour.
    ambient: ["#FFE14D", "#8AE86E", "#B18CFF", "#5AA9E6", "#B3F0A1", "#D0F6C5"],
    // Poster-heavy display: the display tiers ship light with open
    // tracking; Zest sets them extra-bold and pulls the tracking negative,
    // the sub-display a step lighter so the hero pair keeps its hierarchy.
    // Headings 1–3 stay at the shipped 600 — the reference's section
    // titles are semibold, only its hero type shouts.
    //
    // The light theme keeps its shipped hover/active label (a near-white
    // neutral) under a custom key, which lands near 2:1 on the darkened
    // lime hover fill — pin it to the same forest step the resting label
    // derives (Volt and Bubblegum make the same repair).
    extraOverrides: {
      "--color-action-primary-text-active": "var(--primitive-green-11)",
      "--font-sub-display-weight": "700",
      "--font-mega-1-letter-spacing": "-0.03em",
      "--font-mega-2-letter-spacing": "-0.03em",
      "--font-display-1-letter-spacing": "-0.025em",
      "--font-display-2-letter-spacing": "-0.02em",
      "--font-sub-display-letter-spacing": "-0.015em",
    },
    // Fresh neighbours: every hue bright and clean beside the lime. Green
    // is the action family, left alone.
    advanced: bases({
      red: "#F0435C",
      orange: "#FF8C42",
      yellow: "#FFE14D",
      teal: "#1FB5C9",
      blue: "#3D6BE8",
      purple: "#9C5CF5",
    }),
  },
  marquee: {
    label: "Marquee",
    // A title card in mustard: it is the key, so the buttons and the AI
    // gradient come from its ramp, and the display tone below matches it.
    // A light key, so the action lever derives dark labels over the mustard
    // fill on its own.
    brand: "#C9C340",
    // The greys lean toward a deep blue-green, so the dark page is the
    // inky teal-black of a graded film still rather than a flat black.
    tintOn: true,
    tintSeed: "#1E4A52",
    tintStrength: 10,
    // Poster corners: cut almost square, no pill.
    radiusScale: 20,
    pill: false,
    density: 100,
    // A notch larger, so the condensed display type has room to shout.
    typeScale: 105,
    motionScale: 90,
    // Print-flat: depth from contrast alone.
    elevation: "flat",
    // Anton ships one weight, so both heading tiers sit at 400 and the
    // face carries the weight; the body stays at the base look's.
    displayWeight: 400,
    headingWeight: 400,
    bodyWeight: SHIPPED_BODY_WEIGHT,
    tracking: 0,
    iconWeight: 400,
    iconFill: false,
    // Mustard is the theme's one colour: the buttons and the display type
    // (the headline, its subtitle and the figures) share it, while
    // headings, running text and the mark stay in the ink, so a page reads
    // as mustard titles over a plain sign.
    logoTone: "ink",
    logoEndTone: "matched",
    displayTone: "yellow",
    headingTone: "ink",
    textTone: "ink",
    fontLabel: "Work Sans",
    headingFontLabel: "Anton (condensed)",
    // The AI gradient turns through the mustard ramp, so the hero's sweep
    // stays inside the theme's one colour.
    aiGradient: "tonal",
    // Film-still sextet: mustard and rust over cool, muddied blue-greens.
    accents: {
      coral: "#D2643E",
      violet: "#8E7FA6",
      cobalt: "#4F7F8C",
      amber: "#D69A3E",
      gold: "#C9C340",
      mint: "#7FA58C",
    },
    // The field is mostly the deep blue-green of the tint, with the
    // mustard and one rust glint moving through it.
    ambient: ["#C9C340", "#1E4A52", "#4F7F8C", "#8C8730", "#173840", "#D2643E"],
    // The yellow ramp re-keyed from a sunny yellow to a muted mustard, so
    // both modes' headline steps are drawn from it.
    advanced: bases({
      yellow: "#C9C340",
    }),
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
    displayWeight: 600,
    headingWeight: SHIPPED_HEADING_WEIGHT,
    bodyWeight: SHIPPED_BODY_WEIGHT,
    tracking: 0,
    iconWeight: SHIPPED_ICON_WEIGHT,
    iconFill: false,
    logoTone: "action",
    logoEndTone: "matched",
    displayTone: "ink",
    headingTone: "ink",
    textTone: "ink",
    // The trail-brand pairing: Montserrat's bold geometric caps-energy
    // headings over DM Sans text.
    fontLabel: "DM Sans",
    headingFontLabel: "Montserrat",
    // Deep-woods sextet: lit bark, dusk heather, shaded lake, the amber
    // light shaft, leaf-litter ochre and fern around the pine key.
    aiGradient: "tonal",
    accents: {
      coral: "#B45E4A",
      violet: "#7E6899",
      cobalt: "#446E93",
      amber: "#C97F3F",
      gold: "#C2A147",
      mint: "#4E9A6C",
    },
    // The ambient field keeps the accents' gold, mint, violet and cobalt
    // and trades the coral and amber blobs for lighter tones of the key colour.
    ambient: ["#C2A147", "#4E9A6C", "#7E6899", "#446E93", "#709282", "#A7BCB2"],
    // Trail-sign bold: the display tiers ship at a light 300, which reads
    // wispy in Montserrat — Forest sets them semibold instead, with the
    // sub-display a step lighter so the hero pair keeps its hierarchy.
    extraOverrides: {
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
    displayWeight: SHIPPED_DISPLAY_WEIGHT,
    headingWeight: SHIPPED_HEADING_WEIGHT,
    bodyWeight: SHIPPED_BODY_WEIGHT,
    tracking: 0,
    iconWeight: SHIPPED_ICON_WEIGHT,
    iconFill: false,
    logoTone: "action",
    logoEndTone: "matched",
    displayTone: "ink",
    headingTone: "ink",
    textTone: "ink",
    fontLabel: "IBM Plex Mono",
    // Phosphor band: the whole ambient sextet stays in the emerald band,
    // like a single-phosphor display.
    aiGradient: "tonal",
    accents: {
      coral: "#35D6A0",
      violet: "#3DBFA8",
      cobalt: "#2FA98F",
      amber: "#57E0B0",
      gold: "#7CE8C2",
      mint: "#06D6A0",
    },
    // The ambient field keeps the accents' gold, mint, violet and cobalt
    // and trades the coral and amber blobs for lighter tones of the key colour.
    ambient: ["#7CE8C2", "#06D6A0", "#3DBFA8", "#2FA98F", "#5DE4C1", "#9BEFD9"],
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
    // A little air around everything, like the rounded faces want.
    density: 105,
    typeScale: 100,
    // Quick on its feet — playful looks answer fast.
    motionScale: 90,
    elevation: "soft",
    // Fredoka reads thin at the shipped light display weight, so the
    // display tier comes up a step; headings stay at the shipped bold.
    displayWeight: 400,
    headingWeight: SHIPPED_HEADING_WEIGHT,
    bodyWeight: SHIPPED_BODY_WEIGHT,
    // Rounded letters like a touch of room.
    tracking: 0.5,
    // Chunkier strokes to sit beside the soft, heavy letterforms.
    iconWeight: 400,
    iconFill: false,
    logoTone: "action",
    logoEndTone: "matched",
    displayTone: "ink",
    headingTone: "ink",
    textTone: "ink",
    // Rounded all the way down: Fredoka's bubble headings over Nunito's
    // soft-terminal text.
    fontLabel: "Nunito (rounded)",
    headingFontLabel: "Fredoka (rounded)",
    // Candy-shop sextet: every ambient colour bright and sugared around
    // the hot-pink key.
    aiGradient: "tonal",
    accents: {
      coral: "#FF5A8A",
      violet: "#C45CFF",
      cobalt: "#5C7CFF",
      amber: "#FF9A4D",
      gold: "#FFD34D",
      mint: "#3DDCB8",
    },
    // The ambient field keeps the accents' gold, mint, violet and cobalt
    // and trades the coral and amber blobs for lighter tones of the key colour.
    ambient: ["#FFD34D", "#3DDCB8", "#C45CFF", "#5C7CFF", "#E064AB", "#ECA0CB"],
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
    // Unhurried spacing: the look is generous, not busy.
    density: 105,
    typeScale: 100,
    motionScale: 100,
    // The gentler float suits the rounded geometry.
    elevation: "soft",
    // Playfair's lightest cut is the regular, and its contrast does the
    // work a heavy weight would: headings step down to a medium.
    displayWeight: 400,
    headingWeight: 500,
    bodyWeight: SHIPPED_BODY_WEIGHT,
    // Drawn in a touch, the way a display serif is usually set.
    tracking: -0.5,
    iconWeight: 300,
    iconFill: false,
    logoTone: "action",
    logoEndTone: "matched",
    displayTone: "ink",
    headingTone: "ink",
    textTone: "ink",
    // The serif-over-sans split: Playfair Display's high-contrast
    // headings over Plus Jakarta Sans text.
    fontLabel: "Plus Jakarta Sans",
    headingFontLabel: "Playfair Display (serif)",
    // Violet-leaning sextet: the ambient palette calmed around the key.
    aiGradient: "tonal",
    accents: {
      coral: "#D96BA8",
      violet: "#9E47EF",
      cobalt: "#6A5BE0",
      amber: "#D9915E",
      gold: "#D9BE7A",
      mint: "#6BAE9E",
    },
    // The ambient field keeps the accents' gold, mint, violet and cobalt
    // and trades the coral and amber blobs for lighter tones of the key colour.
    ambient: ["#D9BE7A", "#6BAE9E", "#9E47EF", "#6A5BE0", "#A57BCE", "#C7AEE1"],
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
 * row and the playground's preset picker walk this list. BASE_THEME_ID
 * ("tide") is the base look the raw token files carry (no data-brand
 * attribute).
 */
/* Every look except the served one, walking the colour wheel by brand
   hue — red, orange, yellow, the greens, teal, blue, violet, magenta — so
   the swatch row reads as a spectrum. The monochrome look sits with them
   so a change of served theme never drops it from the row. */
const HUE_ORDER: ReadonlyArray<string> = [
  "mono",
  "coral",
  "warm",
  "gold",
  "marquee",
  "zest",
  "forest",
  "terminal",
  BASE_THEME_ID,
  "contrast",
  "violet",
  "pink",
];

// The served theme leads, so the row opens on the look the visitor is
// already seeing; the rest keep their hue order.
export const THEME_SELECTOR_ORDER: ReadonlyArray<string> = [
  SERVED_THEME_ID,
  ...HUE_ORDER.filter((id) => id !== SERVED_THEME_ID),
];

/** The base look's display name (the BASE_THEME_ID selector entry — no
    data-brand attribute, the raw token files). Named here, beside the
    presets' own `label` fields, so every selector surface reads the same
    registry rather than hardcoding a string. */
export const DEFAULT_THEME_LABEL = "Tide";

/** One sentence on each theme's character, the base look's included, keyed
    by theme id. Shown under the theme's name on its specimen page
    (/foundations/themes/<id>). scripts/validate-theme-presets.mjs holds it
    to THEME_SELECTOR_ORDER in both directions. */
export const THEME_TAGLINES: Readonly<Record<string, string>> = {
  [BASE_THEME_ID]: "The base look: a calm teal on quiet surfaces, set in one friendly face.",
  warm: "Warm and bookish, a serif heading over an easy sans, like a well-loved paperback.",
  mono: "Black, white and nothing else, with flat surfaces and tight corners.",
  marquee: "A film title card, heavy condensed headlines and buttons in mustard over an inky blue-green page with square corners.",
  contrast: "Precise and engineered, an electric blue with drafting-table corners and one technical face.",
  coral: "Sunny and welcoming, a hospitality look of coral warmth and soft, round corners.",
  gold: "Bold and electric, bright yellow on ink with grotesk headings and a quicker step.",
  zest: "Fresh and confident, a bright lime on clean white under heavy, tight headlines.",
  forest: "Grounded and calm, a deep woods green with organic softness throughout.",
  terminal: "A command line as a brand: monospace type, square corners, no shadows and fast replies.",
  pink: "Playful and rounded, hot pink with bubbly type and pills everywhere.",
  violet: "Luxurious and unhurried, a serif display over generous spacing and wide, soft corners.",
};

/** A theme's one-sentence description, or undefined for an unknown id. */
export const themeTagline = (id: string): string | undefined => THEME_TAGLINES[id];

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
 * One rich cell per shipped look, in THEME_SELECTOR_ORDER with the base theme
 * in place mid-list — the landing's theme tiles render this directly, and
 * the playground's preset picker composes from it, so the two surfaces can
 * never disagree on order, portraits, or labels. `theme` resolves the
 * theme-dependent key colours (black & white flips its dot with the mode).
 */
export function themeSelectorTiles(theme: "light" | "dark"): RichDropdownOption[] {
  const dark = theme === "dark";
  return THEME_SELECTOR_ORDER.map((value) => {
    if (value === BASE_THEME_ID) {
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
    tiles.find((t) => t.value === BASE_THEME_ID)!,
    {
      label: "Custom",
      value: "custom",
      color: args.custom.brand,
      swatchRadius: swatchRadius(args.custom.radiusScale, args.custom.pill),
      headingFont: headingStack(args.custom.headingFontLabel, args.custom.fontLabel),
      bodyFont: bodyStack(args.custom.fontLabel),
      description: pairingLine(args.custom.fontLabel, args.custom.headingFontLabel),
    },
    ...tiles.filter((t) => t.value !== BASE_THEME_ID),
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
   One pure function turns a preset into the exact declarations the
   generated [data-brand] stylesheets ship (scripts/generate-preset-
   stylesheets.mjs) and the playground's theme export writes
   (theme-export.ts, held to it by scripts/validate-theme-export.mjs).
   The playground's live preview does not call it: it composes the same
   lever functions in a memo of its own, so the merge order here mirrors
   the playground page's memo (action plan, tint, radius,
   density, type, motion, elevation, weight, tracking, icons, fonts,
   extras, advanced so harmonized ramps see the merged state, then the
   tones (logo and type tiers), which read the ramps as they finally stand). */
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
  if (preset.aiGradient === "tonal") {
    Object.assign(merged, aiGradientTonalOverrides(plan));
  }
  if (preset.tintOn && preset.tintStrength > 0) {
    Object.assign(merged, neutralOverrides(preset.tintSeed, preset.tintStrength / 100, theme));
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
  Object.assign(merged, weightOverrides(preset.displayWeight, preset.headingWeight, preset.bodyWeight));
  Object.assign(merged, trackingOverrides(preset.tracking));
  Object.assign(merged, iconOverrides(preset.iconWeight, preset.iconFill));

  const font = FONT_OPTIONS.find((f) => f.label === preset.fontLabel);
  if (font?.family) merged["--font-family-primary"] = font.family;
  const headingFont = preset.headingFontLabel
    ? HEADING_FONT_OPTIONS.find((f) => f.label === preset.headingFontLabel)
    : undefined;
  if (headingFont?.family) merged["--font-family-heading"] = headingFont.family;

  /* The ambient accent sextet, always all six — a declared lever, so a
     stylesheet states its ambient colours even at the shipped keys. Just
     before the extras, so a preset's extras could still specialise one. */
  Object.assign(merged, accentOverrides(preset.accents));

  preset.ambient?.forEach((hex, i) => {
    merged[`--color-ambient-${i + 1}`] = hex;
  });

  if (preset.extraOverrides) Object.assign(merged, preset.extraOverrides);
  if (theme === "dark" && preset.extraOverridesDark) {
    Object.assign(merged, preset.extraOverridesDark);
  }
  /* The fade reads the fill as the extras leave it. */
  if (preset.aiGradient === "fade") {
    Object.assign(merged, aiGradientFadeOverrides(merged["--color-action-primary-bg"], theme));
  }
  if (preset.ambientField === "fade") {
    Object.assign(merged, ambientFadeOverrides(merged["--color-action-primary-bg"], theme));
  }
  if (preset.advanced && !isAdvancedPristine(preset.advanced)) {
    Object.assign(merged, advancedColorOverrides(preset.advanced, merged));
  }
  /* The tier tones read the ramps and greys as everything above leaves
     them, so they come last. */
  Object.assign(
    merged,
    tierToneOverrides(
      { logo: preset.logoTone, logoEnd: preset.logoEndTone, display: preset.displayTone, heading: preset.headingTone, text: preset.textTone },
      merged,
      theme
    )
  );
  return merged;
}
