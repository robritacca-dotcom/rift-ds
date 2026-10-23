import { THEME_PRESETS, presetOverrides, type ThemePreset } from "./presets";
import {
  ACCENT_NAMES,
  CHROMATIC_RAMPS,
  FONT_OPTIONS,
  HEADING_FONT_OPTIONS,
  HEADING_MATCH_LABEL,
  SHIPPED_ACCENTS,
  buildCssSnippet,
  googleFontHref,
  isAdvancedPristine,
  leverWord,
  motionSpeedPercent,
  nearestRampFor,
  shippedNeutralHex,
  type AdvancedColorState,
  type FontOption,
  type Overrides,
} from "./theme-overrides";

/* ---------- the theme export ----------
   Turns the playground's lever state into what a consumer and their coding
   agent take away: one AGENTS.md that is the library's agent starter with
   the theme set in, and the same theme as separate files (the CSS, a
   THEME.md that describes the look in words, and a setup prompt). Everything here is a pure function of the
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

/* ---------- resolved colours ----------
   The prose states colours as the exported CSS resolves them, never as the
   levers were set: an imported DESIGN.md can restate the primitives under
   a lever (its greys, its action shades), and a description read off the
   levers would then name colours the stylesheet does not draw. */

/** The shipped hex of a `--primitive-<ramp>-<step>`, or null. */
function shippedPrimitiveHex(name: string): string | null {
  const m = /^--primitive-([a-z]+)-(\d\d)$/.exec(name);
  if (!m) return null;
  if (m[1] === "neutral") return shippedNeutralHex(m[2]);
  return CHROMATIC_RAMPS.find((r) => r.name === m[1])?.steps.find(([s]) => s === m[2])?.[1] ?? null;
}

/** A custom property's colour through the theme's declarations, falling
    back to the shipped primitives; null when the chain reaches a semantic
    token the theme leaves at its base value. */
function resolveColour(name: string, decls: Overrides): string | null {
  const seen = new Set<string>();
  let current = name;
  while (!seen.has(current)) {
    seen.add(current);
    const value = decls[current]?.trim();
    if (value === undefined) return shippedPrimitiveHex(current);
    const ref = /^var\((--[\w-]+)\)$/.exec(value);
    if (!ref) return /^#[0-9a-f]{6}$/i.test(value) ? value.toUpperCase() : null;
    current = ref[1];
  }
  return null;
}

const ACTION_FILLS = [
  "--color-action-primary-bg",
  "--color-action-primary-bg-hover",
  "--color-action-primary-bg-active",
] as const;

export interface ResolvedColours {
  /** Rest, hover and pressed fills per mode, as the CSS draws them. */
  action: Record<"light" | "dark", [rest: string, hover: string, pressed: string]>;
  /** False when a fill is left at its base value, which the CSS cannot
      name; the prose then states the key alone. */
  statesKnown: boolean;
  /** True when the theme restates neutral steps with greys of its own. */
  statedNeutrals: boolean;
  /** The primitive ramps theme.css restates, neutral first. */
  restatedRamps: string[];
}

/** The colours the exported CSS draws, read back out of its declarations. */
export function resolvedColours(preset: ThemePreset): ResolvedColours {
  const blocks = buildThemeBlocks(preset);
  const modes = { light: blocks.light, dark: { ...blocks.light, ...blocks.dark } };
  const fallback = { light: preset.brand, dark: preset.brandDark ?? preset.brand };
  const action = {} as ResolvedColours["action"];
  let statesKnown = true;
  for (const mode of ["light", "dark"] as const) {
    const [rest, hover, pressed] = ACTION_FILLS.map((name) => resolveColour(name, modes[mode]));
    if (!rest || !hover || !pressed) statesKnown = false;
    const key = rest ?? fallback[mode].toUpperCase();
    action[mode] = [key, hover ?? key, pressed ?? key];
  }

  const restated = new Set<string>();
  for (const [name, value] of Object.entries(modes.dark)) {
    const shipped = shippedPrimitiveHex(name);
    if (shipped && value.trim().toUpperCase() !== shipped.toUpperCase()) {
      restated.add(name.split("-")[3]);
    }
  }
  const rampOrder = ["neutral", ...CHROMATIC_RAMPS.map((r) => r.name)];
  return {
    action,
    statesKnown,
    statedNeutrals: restated.has("neutral"),
    restatedRamps: rampOrder.filter((ramp) => restated.has(ramp)),
  };
}

const listOf = (items: string[]) =>
  items.length <= 1
    ? items.join("")
    : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

/**
 * What a reader of theme.css might take for a mistake and is not: the
 * shape of the file, and each place this theme departs from the base on
 * purpose. Built from the declarations, so a note appears only when the
 * file does the thing it explains.
 */
function readingNotes(preset: ThemePreset, colours: ResolvedColours): string[] {
  const blocks = buildThemeBlocks(preset);
  if (blocks.pristine) return [];
  const notes = [
    "- `:root` holds light mode and everything both modes share. The dark block lists only what changes in dark mode, and a token neither block names keeps its base value. A token set in one block and not the other is intended.",
    "- The colours named above are the ones `theme.css` resolves to. Where a preset swatch or the token reference says otherwise, the file is right.",
  ];
  if (colours.restatedRamps.length > 0) {
    const ramps = colours.restatedRamps.map((ramp) =>
      ramp === "neutral"
        ? "neutral"
        : (CHROMATIC_RAMPS.find((r) => r.name === ramp)?.label ?? ramp).toLowerCase()
    );
    notes.push(
      `- It restates the ${listOf(ramps)} primitive ${ramps.length === 1 ? "ramp" : "ramps"} with this theme's own steps. The semantic tokens still point at primitives through \`var()\`, so no tier is skipped: the steps hold different colours.`
    );
  }
  if (ACCENT_NAMES.some((name) => `--color-core-accent-${name}` in blocks.light)) {
    notes.push(
      "- The `--color-core-accent-*` tokens take hex values directly. That is how the accent lever sets them: the accents are the one colour role a theme states by value."
    );
  }
  return notes;
}

/**
 * The look in words, as markdown sections from Colour to Icons: what the
 * theme is, which tokens carry it. THEME.md prints them as its own `##`
 * sections; the themed AGENTS.md nests them as `###` under its theme
 * section, so the two files describe a theme in the same words.
 */
function themeLanguage(preset: ThemePreset, heading: "##" | "###"): string {
  const colours = resolvedColours(preset);
  const speed = motionSpeedPercent(preset.motionScale);
  const [lightKey] = colours.action.light;
  const [darkKey] = colours.action.dark;
  const states = (mode: "light" | "dark") => {
    const [rest, hover, pressed] = colours.action[mode];
    return `\`${rest}\` at rest, \`${hover}\` on hover and \`${pressed}\` pressed`;
  };

  const colour = [
    `- Action colour: \`${lightKey}\`, from the ${rampLabel(lightKey)} family${
      darkKey !== lightKey ? `; \`${darkKey}\` in dark mode` : ""
    }. It is carried by \`--color-action-primary-bg\`.`,
    ...(colours.statesKnown
      ? [`- Action fills: ${states("light")} in light mode; ${states("dark")} in dark mode.`]
      : []),
    preset.tintOn && preset.tintStrength > 0
      ? `- Neutrals: tinted ${preset.tintStrength}% towards \`${preset.tintSeed}\`.`
      : colours.statedNeutrals
        ? "- Neutrals: this theme's own greys, set on the `--primitive-neutral-*` steps in `theme.css` in place of the base scale's untinted ones."
        : "- Neutrals: untinted greys.",
    `- Ambient accents: ${ACCENT_NAMES.map(
      (accent) => `${accent} \`${preset.accents[accent]}\``
    ).join(", ")}. They colour chart series after the first, and the background field unless the theme sets its own ambient colours.`,
    ...(preset.ambient
      ? [`- Background field: ${preset.ambient.map((hex) => `\`${hex}\``).join(", ")}, carried by \`--color-ambient-1\` to \`--color-ambient-6\`.`]
      : []),
    ...(preset.ambientField === "fade"
      ? ["- Background field: the action colour fading toward the page, through `--color-ambient-1` to `--color-ambient-6`."]
      : []),
    ...(preset.aiGradient === "tonal"
      ? ["- AI gradient: three depths of the action colour, through the `--color-ai-gradient-*` tokens."]
      : preset.aiGradient === "fade"
        ? ["- AI gradient: the action colour fading toward the page, lighter in light mode and deeper in dark, through the `--color-ai-gradient-*` tokens."]
        : []),
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

  const reading = readingNotes(preset, colours);

  const depth =
    preset.elevation === "flat"
      ? "This theme is flat: both elevation tokens resolve to no shadow. Separate surfaces by contrast."
      : `This theme uses the ${preset.elevation} shadow pair.`;

  return `${heading} Colour

${colour.join("\n")}

${heading} Typography

${type.join("\n")}

${heading} Shape and space

${shape.join("\n")}

${heading} Motion

${leverWord("motion", speed)}: ${speed}% of the base speed. Time transitions with the \`--motion-duration-*\` and \`--motion-ease-*\` tokens.

${heading} Elevation

${depth} The only shadows are \`--shadow-floating\` and \`--shadow-modal\`.

${heading} Icons

Material Symbols Rounded at weight ${preset.iconWeight}, ${
    preset.iconFill ? "filled" : "outlined"
  }. Size an icon with the \`--icon-size-*\` scale, never with \`font-size\`.${
    reading.length > 0 ? `\n\n${heading} Reading theme.css\n\n${reading.join("\n")}` : ""
  }`;
}

/** A design-language file for the theme: what the look is and how to keep to it. */
export function buildThemeMarkdown(
  preset: ThemePreset,
  context: ThemeExportContext
): string {
  const name = themeName(preset, context);
  const pkg = context.packageName;

  return `# ${name} theme

A theme for ${pkg}, made in the playground at ${context.siteUrl}/playground. Read this before styling anything, and keep it beside \`theme.css\`.

${describeTheme(preset)}

${themeLanguage(preset, "##")}

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

/** The restyle instruction, shared by the prompt and the themed AGENTS.md. */
const restyleInstruction = (pkg: string, screens: string, against: string) =>
  `restyle ${screens} to match ${against}. Replace hardcoded colours, radii, spacing and shadows with the semantic tokens, and replace hand-built controls with ${pkg} components where one exists. List what you changed and anything you could not map to a token.`;

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

Then ${restyleInstruction(pkg, "the existing screens", "THEME.md")}`;
}

/* ---------- the themed AGENTS.md ----------
   The one file the Export theme button hands over: the library's agent
   starter (public/AGENTS.md, generated by scripts/generate-agent-skill.mjs)
   word for word, with this theme set into it. The starter brings the
   install, the setup and the rules; this adds what the theme is, how to
   apply it and the CSS itself, so a coding agent given only this file can
   set the project up in this look. The starter is passed in rather than
   imported, so this module stays loadable under Node (the validator hands
   it the generated text). */

/** The faces a theme loads from Google, as stylesheet links. */
function fontLinks(preset: ThemePreset): string[] {
  const blocks = buildThemeBlocks(preset);
  const params = [blocks.font, blocks.headingFont]
    .filter((font): font is FontOption => Boolean(font?.family && font.googleParam))
    .map((font) => font.googleParam as string);
  return [...new Set(params)].map(
    (param) => `<link rel="stylesheet" href="${googleFontHref(param)}">`
  );
}

/**
 * The theme section the AGENTS.md carries: the look in one line, how to
 * apply it, the look in words, and the restyle instruction. Set into the
 * starter right after its Setup section, where an agent following the
 * file in order needs it.
 */
function themedSection(preset: ThemePreset, context: ThemeExportContext): string {
  const name = themeName(preset, context);
  const pkg = context.packageName;
  const links = fontLinks(preset);
  const blocks = buildThemeBlocks(preset);

  const apply = blocks.pristine
    ? "This is the base theme, so there is no theme stylesheet: the setup above is the whole of it."
    : `1. Save the stylesheet at the end of this file as \`theme.css\` and import it right after \`${pkg}/tokens/tokens.css\`. It holds light mode in \`:root\` and dark mode in its own block, so the \`data-theme\` switch keeps working. Do not also import the shipped theme presets or set \`data-brand\`.
2. ${
        links.length > 0
          ? `Load the theme's faces in the document head (the stylesheet already sets the font tokens to them):\n\n\`\`\`html\n${links.join("\n")}\n\`\`\``
          : "The theme keeps the base typeface, so load it as the setup above says."
      }
3. The token values in the references below are the base theme's. Where they differ, \`theme.css\` is right.`;

  return `## The ${name} theme

This project uses a custom ${pkg} theme made at ${context.siteUrl}/playground. ${describeTheme(preset)} Keep to it whenever you style anything.

### Apply it

${apply}

${themeLanguage(preset, "###")}

### Existing screens

If the project already has screens, ${restyleInstruction(pkg, "them", "this theme")}
`;
}

/**
 * The themed AGENTS.md: the starter with this theme set in. Its title
 * names the theme, a line after the opening paragraph says how to merge it
 * into an AGENTS.md the project already has, the theme section follows the
 * starter's Setup, and the stylesheet closes the file so the instructions
 * read first. Every section of the starter is carried unchanged.
 */
export function buildThemedAgentsMd(
  preset: ThemePreset,
  context: ThemeExportContext,
  starter: string
): string {
  const name = themeName(preset, context);
  const text = starter.replace(/\r\n/g, "\n").trimEnd();
  const [opening, ...rest] = text.split("\n## ");
  const sections = rest.map((section) => `## ${section}`.trimEnd());
  const setup = sections.findIndex((section) => section.startsWith("## Setup"));
  const theme = themedSection(preset, context).trimEnd();
  sections.splice(setup >= 0 ? setup + 1 : sections.length, 0, theme);

  const titled = opening
    .replace(/^# (.+)$/m, `# $1, in the ${name} theme`)
    .trimEnd();
  const merge =
    "If this project already has an AGENTS.md, add these sections to it rather than replacing it.";

  const css = buildThemeBlocks(preset).pristine
    ? ""
    : `\n\n## theme.css\n\n\`\`\`css\n${buildThemeCss(preset)}\n\`\`\``;

  return `${titled}\n\n${merge}\n\n${sections.join("\n\n")}${css}\n`;
}
