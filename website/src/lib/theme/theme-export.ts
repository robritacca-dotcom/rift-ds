import { THEME_PRESETS, presetOverrides, type ThemePreset } from "./presets";
import {
  ACCENT_NAMES,
  CHROMATIC_RAMPS,
  FONT_OPTIONS,
  HEADING_FONT_OPTIONS,
  HEADING_MATCH_LABEL,
  SHIPPED_ACCENTS,
  buildCssSnippet,
  isAdvancedPristine,
  leverWord,
  motionSpeedPercent,
  nearestRampFor,
  type AdvancedColorState,
  type FontOption,
  type Overrides,
} from "./theme-overrides";

/* ---------- the theme export ----------
   Turns the playground's lever state into what a consumer and their coding
   agent take away: the theme as CSS, a THEME.md that describes the look in
   words, and a setup prompt. Everything here is a pure function of the
   lever state, built in the visitor's browser and never uploaded.

   The CSS is composed by presetOverrides, the one composer the shipped
   preset stylesheets are written from, called once per theme. So an
   exported theme and a shipped one are the same kind of object, and the
   light and dark values can never leak into each other the way a snippet
   derived from the previewed theme's overrides could.

   This module imports relatively and takes its site facts as arguments, so
   scripts/validate-theme-export.mjs can load it under Node the same way the
   preset stylesheet generator loads presets.ts. */

/** The playground's levers, as the page holds them. */
export interface PlaygroundLevers
  extends Omit<ThemePreset, "label" | "headingFontLabel" | "advanced"> {
  /** The id of the preset the levers still match, or "custom". */
  preset: string;
  /** HEADING_MATCH_LABEL when the heading role follows the body face. */
  headingFontLabel: string;
  advanced: AdvancedColorState;
}

/** The lever state as a complete theme, the shape every preset is saved in. */
export function themeFromLevers(levers: PlaygroundLevers): ThemePreset {
  const { preset, headingFontLabel, advanced, ...rest } = levers;
  return {
    ...rest,
    label: THEME_PRESETS[preset]?.label ?? "Custom",
    headingFontLabel:
      headingFontLabel === HEADING_MATCH_LABEL ? undefined : headingFontLabel,
    advanced: isAdvancedPristine(advanced) ? undefined : advanced,
  };
}

const FONT_KEYS = ["--font-family-primary", "--font-family-heading"];

export interface ThemeBlocks {
  /** Declarations for `:root`: the light theme, and everything theme-agnostic. */
  light: Overrides;
  /** Declarations for `[data-theme="dark"]`: only what differs from `light`. */
  dark: Overrides;
  font: FontOption;
  headingFont?: FontOption;
  /** True when the theme changes nothing from the shipped tokens. */
  pristine: boolean;
}

/**
 * The theme as two declaration blocks. An accent still at its shipped value
 * is dropped (the composer always states all six, which a stylesheet wants
 * and a pasted snippet does not), and the font families are carried as
 * options so the printer can name the stylesheet to load.
 */
export function buildThemeBlocks(preset: ThemePreset): ThemeBlocks {
  const light = presetOverrides(preset, "light");
  const full = presetOverrides(preset, "dark");

  for (const name of ACCENT_NAMES) {
    const key = `--color-core-accent-${name}`;
    const shipped = SHIPPED_ACCENTS[name].toUpperCase();
    if (light[key]?.toUpperCase() === shipped && full[key]?.toUpperCase() === shipped) {
      delete light[key];
      delete full[key];
    }
  }
  for (const key of FONT_KEYS) {
    delete light[key];
    delete full[key];
  }

  const dark: Overrides = {};
  for (const [name, value] of Object.entries(full)) {
    if (light[name] !== value) dark[name] = value;
  }

  const font =
    FONT_OPTIONS.find((f) => f.label === preset.fontLabel) ?? FONT_OPTIONS[0];
  const headingFont = preset.headingFontLabel
    ? HEADING_FONT_OPTIONS.find((f) => f.label === preset.headingFontLabel)
    : undefined;

  return {
    light,
    dark,
    font,
    headingFont,
    pristine:
      Object.keys(light).length === 0 &&
      Object.keys(dark).length === 0 &&
      !font.family &&
      !headingFont?.family,
  };
}

export const PRISTINE_CSS =
  "/* Everything is at its shipped default. Move a lever to generate CSS. */";

/** The theme as paste-ready CSS: light in `:root`, dark in its own block. */
export function buildThemeCss(preset: ThemePreset): string {
  const blocks = buildThemeBlocks(preset);
  if (blocks.pristine) return PRISTINE_CSS;
  return buildCssSnippet(blocks.light, blocks.font, blocks.dark, blocks.headingFont);
}

/* ---------- THEME.md ---------- */

/** Site facts the prose needs. Passed in so this module stays Node-loadable. */
export interface ThemeExportContext {
  /** What the product is called; falls back to the theme's own label. */
  productName?: string;
  packageName: string;
  /** The package's init command, which can differ from its name. */
  binName: string;
  siteUrl: string;
  mcpEndpoint: string;
  mcpServerName: string;
}

const rampLabel = (hex: string) => {
  const name = nearestRampFor(hex);
  if (name === "neutral") return "neutral";
  return (CHROMATIC_RAMPS.find((r) => r.name === name)?.label ?? name).toLowerCase();
};

const fontName = (label: string) => label.replace(/ \(.*\)$/, "");

const themeName = (preset: ThemePreset, context: ThemeExportContext) =>
  context.productName?.trim() || preset.label;

/** The look in one sentence, in the words the rail shows beside each lever. */
export function describeTheme(preset: ThemePreset): string {
  const heading = preset.headingFontLabel
    ? `${fontName(preset.headingFontLabel)} headings over ${fontName(preset.fontLabel)}`
    : `${fontName(preset.fontLabel)} throughout`;
  const corners = `${leverWord("radius", preset.radiusScale).toLowerCase()} corners${
    preset.pill ? " with pill buttons" : ""
  }`;
  return [
    `${leverWord("density", preset.density)} density`,
    `${leverWord("motion", motionSpeedPercent(preset.motionScale)).toLowerCase()} motion`,
    corners,
    `${preset.elevation} elevation`,
    heading,
  ].join(", ") + ".";
}

/** A design-language file for the theme: what the look is and how to keep to it. */
export function buildThemeMarkdown(
  preset: ThemePreset,
  context: ThemeExportContext
): string {
  const name = themeName(preset, context);
  const pkg = context.packageName;
  const darkBrand = preset.brandDark;
  const speed = motionSpeedPercent(preset.motionScale);

  const colour = [
    `- Action colour: \`${preset.brand}\`, from the ${rampLabel(preset.brand)} family${
      darkBrand ? `; \`${darkBrand}\` in dark mode` : ""
    }. It is carried by \`--color-action-primary-bg\`.`,
    preset.tintOn && preset.tintStrength > 0
      ? `- Neutrals: tinted ${preset.tintStrength}% towards \`${preset.tintSeed}\`.`
      : "- Neutrals: untinted greys.",
    `- Ambient accents: ${ACCENT_NAMES.map(
      (accent) => `${accent} \`${preset.accents[accent]}\``
    ).join(", ")}. They colour the background field and chart series after the first.`,
    "- Status uses five roles: info, positive, warning, error and neutral, through the `--color-status-*` tokens.",
  ];

  const type = [
    `- Body face: ${fontName(preset.fontLabel)} (\`--font-family-primary\`).`,
    preset.headingFontLabel
      ? `- Heading face: ${fontName(preset.headingFontLabel)} (\`--font-family-heading\`).`
      : "- Heading face: follows the body face.",
    `- Display tier weight ${preset.displayWeight}, heading tier weight ${preset.headingWeight}. Levels inside a tier share a weight and step by size.`,
    `- Type scale: ${leverWord("typeScale", preset.typeScale)} (${preset.typeScale}% of the base scale).`,
    `- Tracking: ${leverWord("tracking", preset.tracking)} (${
      preset.tracking > 0 ? "+" : ""
    }${preset.tracking}% of an em on every style).`,
  ];

  const shape = [
    `- Corners: ${leverWord("radius", preset.radiusScale)} (${preset.radiusScale}% of the base radius scale).`,
    preset.pill
      ? "- Buttons are pills: `--radius-pill`."
      : "- Buttons are squared onto the radius scale; they still use `--radius-pill`, which this theme redefines.",
    "- Inputs use `--radius-300`.",
    `- Density: ${leverWord("density", preset.density)} (${preset.density}% of the base spacing). Space with the \`--gap-*\` and \`--padding-*\` tokens.`,
  ];

  const depth =
    preset.elevation === "flat"
      ? "This theme is flat: both elevation tokens resolve to no shadow. Separate surfaces by contrast."
      : `This theme uses the ${preset.elevation} shadow pair.`;

  return `# ${name} theme

A theme for ${pkg}, made in the playground at ${context.siteUrl}/playground. Read this before styling anything, and keep it beside \`theme.css\`.

${describeTheme(preset)}

## Colour

${colour.join("\n")}

## Typography

${type.join("\n")}

## Shape and space

${shape.join("\n")}

## Motion

${leverWord("motion", speed)}: ${speed}% of the base speed. Time transitions with the \`--motion-duration-*\` and \`--motion-ease-*\` tokens.

## Elevation

${depth} The only shadows are \`--shadow-floating\` and \`--shadow-modal\`.

## Icons

Material Symbols Rounded at weight ${preset.iconWeight}, ${
    preset.iconFill ? "filled" : "outlined"
  }. Size an icon with the \`--icon-size-*\` scale, never with \`font-size\`.

## Rules

1. Style with semantic tokens only. Never write a hex value, a pixel radius or a shadow that a token already carries.
2. The action colour is for primary buttons, focus rings, active input borders, the on state of a form control and the selected item of a set. Never use it as decoration.
3. Shape belongs to the element type. Change the token, not one instance.
4. Use a ${pkg} component before writing a new one.
5. Dark mode is \`data-theme="dark"\` on the root element. Write no \`prefers-color-scheme\` queries.

## Setup

1. Import \`${pkg}/tokens/tokens.css\` once at the root of the app.
2. Import \`theme.css\` after it.
3. Component contracts: append \`.md\` to any component page at ${context.siteUrl}/components, or connect the MCP server at ${context.mcpEndpoint}.
`;
}

/* ---------- the setup prompt ---------- */

/** The prompt that hands the two files to a coding agent. */
export function buildAgentPrompt(
  preset: ThemePreset,
  context: ThemeExportContext
): string {
  const name = themeName(preset, context);
  const pkg = context.packageName;
  return `Set up the ${name} theme in this project. It comes with theme.css and THEME.md.

1. Install the design system if it is missing: npm install ${pkg}
2. Import ${pkg}/tokens/tokens.css once at the root of the app, then import theme.css after it.
3. Save THEME.md at the project root and read it before you style anything.
4. Install the ${pkg} agent skills: npx ${context.binName} init
5. Connect the MCP server for exact prop and token contracts: claude mcp add --transport http ${context.mcpServerName} ${context.mcpEndpoint}

Then restyle the existing screens to match THEME.md. Replace hardcoded colours, radii, spacing and shadows with the semantic tokens, and replace hand-built controls with ${pkg} components where one exists. List what you changed and anything you could not map to a token.`;
}

/** The prompt, THEME.md and the CSS as one paste, for a chat with no file upload. */
export function buildAgentBundle(
  preset: ThemePreset,
  context: ThemeExportContext
): string {
  return [
    buildAgentPrompt(preset, context),
    "## THEME.md",
    "````markdown\n" + buildThemeMarkdown(preset, context).trimEnd() + "\n````",
    "## theme.css",
    "```css\n" + buildThemeCss(preset) + "\n```",
  ].join("\n\n");
}
