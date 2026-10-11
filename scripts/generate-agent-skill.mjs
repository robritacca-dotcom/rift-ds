#!/usr/bin/env node
/**
 * generate-agent-skill.mjs
 *
 * Builds the consumer agent skills: the folders a consumer of the package
 * drops into their own .claude/skills/ so their coding agent knows the
 * library, can restyle existing screens onto it, and can audit styles
 * against its tokens. Served from website/public/skill/<name>/ beside a
 * manifest.json that lists every skill and its files (the blueprints
 * precedent: generated, tracked, drift-guarded), advertised in llms.txt
 * and on the get-started page.
 *
 * Which skills exist is AGENT_SKILLS in scripts/brand.mjs (the folder
 * names are brand facts). Which files each one holds is decided here, by
 * the builder bound to the row's role, and published through the
 * manifest: the init bin and the website both read the list from there,
 * so nothing restates it. A row with no builder, or a builder with no
 * row, fails generation.
 *
 * These are for people using the package, not for this repo (whose own
 * skills live in .claude/skills/ and publish through /skills). Every fact
 * derives from an existing source of truth: the component registry and
 * prop JSDoc via assembleComponentApi(), the token registry, the token
 * CSS (resolved values, through token-values.mjs), the generated preset
 * stylesheets, the package manifest, and the site origin. The
 * instructional prose is hand-written here, but every token and component
 * it names passes through token() or component(), which throw on a name
 * the registries do not hold, so a rename cannot leave a skill teaching a
 * name that no longer exists. Props are deliberately not restated: the
 * catalogue points at the shipped .d.ts, the per-component .md pages and
 * the MCP endpoint instead, so a truncated copy can never shadow the real
 * contract.
 *
 * Deterministic (version-stamped with PACKAGE_VERSION, no timestamps) and
 * byte-compared by validate-agent-skill.mjs. A file the builders stop
 * emitting is pruned on the next run. Runs via the validate-registry
 * chain and the website's predev/prebuild; never edit the output by hand.
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  rmdirSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { registry, repoRoot } from './component-docgen.mjs';
import { assembleComponentApi } from './generate-component-api.mjs';
import { siteUrl } from './generate-component-md.mjs';
import { CATEGORY_PREFIXES } from './generate-token-registry.mjs';
import { PACKAGE_NAME, PACKAGE_VERSION } from './package-manifest.mjs';
import { AGENT_SKILLS, AUTHOR_NAME, AUTHOR_URL, BIN_NAME } from './brand.mjs';
import { resolveTokenValues } from './token-values.mjs';

/** The folder every skill folder and the manifest are written into. */
export const skillRoot = join(repoRoot, 'website', 'public', 'skill');
/** The manifest's path under skillRoot. */
export const MANIFEST_FILE = 'manifest.json';

const tokenRegistry = JSON.parse(
  readFileSync(join(repoRoot, 'src', 'tokens', 'registry.json'), 'utf8')
);
const tokenNames = new Set(Object.values(tokenRegistry.categories).flat());
const componentNames = new Set(registry.components.map((entry) => entry.name));

/** A semantic token name, checked against the registry. */
function token(name) {
  if (!tokenNames.has(name)) {
    throw new Error(
      `generate-agent-skill.mjs names ${name}, which is not in src/tokens/registry.json. ` +
        `Update the skill prose to the token's current name.`
    );
  }
  return `\`${name}\``;
}

/** A component name, checked against the registry. */
function component(name) {
  if (!componentNames.has(name)) {
    throw new Error(
      `generate-agent-skill.mjs names the component ${name}, which is not in ` +
        `src/components/registry.json. Update the skill prose to its current name.`
    );
  }
  return `\`${name}\``;
}

/** A category's prefixes as wildcard patterns: `--gap-*`, `--padding-*`. */
function prefixes(category) {
  const row = CATEGORY_PREFIXES.find(([id]) => id === category);
  if (!row) throw new Error(`generate-agent-skill.mjs: no token category "${category}"`);
  return row[1].map((prefix) => `\`${prefix}*\``).join(', ');
}

const skillName = (role) => {
  const row = AGENT_SKILLS.find((skill) => skill.role === role);
  if (!row) throw new Error(`generate-agent-skill.mjs: AGENT_SKILLS has no "${role}" row`);
  return row.name;
};

/** The shipped preset ids, from the generated stylesheets (one per preset). */
function presetIds() {
  return readdirSync(join(repoRoot, 'src', 'tokens', 'presets'))
    .filter((name) => name.endsWith('.css') && name !== 'presets.css')
    .map((name) => name.replace(/\.css$/, ''))
    .sort();
}

/** Inline code in markdown. */
const c = (text) => `\`${text}\``;

/**
 * One line per skill, keyed by role: what it is for, as a fragment ending
 * in a full stop. Published through the manifest, and from there into
 * llms.txt, the get-started page and the MCP setup text.
 */
const SUMMARIES = {
  library:
    'Install, theming and dark mode rules, the component catalogue and the token reference.',
  'apply-theme': 'Restyles existing screens onto the tokens and components.',
  'style-audit': "Audits a project's styles for hardcoded values that should be tokens.",
};

/** One markdown table cell: pipes escaped. */
const cell = (value) => String(value).replace(/\|/g, '\\|');

/**
 * references/tokens.md: every semantic token with its category and what
 * it resolves to. A category whose tokens resolve identically in both
 * themes gets one Value column; the theme-split ones get Light and Dark.
 * Any @media block that changes a token in the category adds a column
 * named for its condition.
 */
function buildTokensMd(origin) {
  const values = resolveTokenValues(tokenNames);
  const show = ({ value, primitive }) =>
    primitive ? `\`${cell(value)}\` (\`${primitive}\`)` : `\`${cell(value)}\``;

  const themed = [];
  const sections = CATEGORY_PREFIXES.map(([category]) => {
    const names = tokenRegistry.categories[category];
    const split = names.some((name) => {
      const entry = values.get(name);
      return entry.light.value !== entry.dark.value;
    });
    if (split) themed.push(category);
    const preludes = [
      ...new Set(names.flatMap((name) => Object.keys(values.get(name).media))),
    ];
    const condition = (prelude) => prelude.replace(/^@media\s*\(\s*|\s*\)$/g, '');
    const columns = [
      'Token',
      ...(split ? ['Light', 'Dark'] : ['Value']),
      ...preludes.map((prelude) => `At ${condition(prelude)}`),
    ];
    const rows = names.map((name) => {
      const entry = values.get(name);
      const cells = [
        `\`${name}\``,
        ...(split ? [show(entry.light), show(entry.dark)] : [show(entry.light)]),
        ...preludes.map((prelude) => (entry.media[prelude] ? show(entry.media[prelude]) : '')),
      ];
      return `| ${cells.join(' | ')} |`;
    });
    return [
      `## ${category[0].toUpperCase()}${category.slice(1)} (${names.length})`,
      '',
      `Prefix: ${prefixes(category)}.`,
      '',
      `| ${columns.join(' | ')} |`,
      `| ${columns.map(() => '---').join(' | ')} |`,
      ...rows,
    ].join('\n');
  });

  return `# ${PACKAGE_NAME} token reference

Generated from the token registry and the token stylesheets at version ${PACKAGE_VERSION}. One row per semantic token, grouped by category, with the value it resolves to in the base theme. A name in brackets is the primitive the token points at.

How to read it:

- These are the base theme's values. A project that overrides tokens (a \`theme.css\` from the playground, a \`data-brand\` preset, its own overrides) changes what a token resolves to. The token names stay the same, so match on the role first and treat these values as the default.
- The ${themed.join(' and ')} categories differ between light and dark, so they list both. Every other category holds one value in both themes.
- A column headed "At" gives the value inside that media condition, where it differs.
- Use the semantic token in your code, never the primitive. Override a primitive to re-theme.

The live reference with swatches is at ${origin}/foundations, and the MCP endpoint's \`list_tokens\` tool serves the names.

${sections.join('\n\n')}
`;
}

/** The files of every skill as { skill, path, content }; paths are relative to the skill's folder, forward-slashed. */
export function assembleAgentSkill() {
  const origin = siteUrl();
  const api = assembleComponentApi();
  const categories = registry.categories;
  const countFor = (id) => api.filter((entry) => entry.category === id).length;
  const tokenCount = tokenNames.size;
  const librarySkill = skillName('library');
  const applySkill = skillName('apply-theme');
  const auditSkill = skillName('style-audit');
  const tokensRef = `the \`${librarySkill}\` skill's \`references/tokens.md\``;
  const componentsRef = `the \`${librarySkill}\` skill's \`references/components.md\``;
  const refUrl = (file) => `${origin}/skill/${librarySkill}/references/${file}`;
  const siblingNote = `Both files install beside this skill with \`npx ${BIN_NAME} init\`. If they are missing, run that command, or read them at ${refUrl('tokens.md')} and ${refUrl('components.md')}.`;
  const tokensNote = `That file installs beside this skill with \`npx ${BIN_NAME} init\`. If it is missing, run that command, or read it at ${refUrl('tokens.md')}.`;

  const categoryLines = categories.map(
    (category) =>
      `- ${category.label} (${countFor(category.id)}): ${category.description}`
  );

  const skillMd = `---
name: ${librarySkill}
description: Build React UI with ${PACKAGE_NAME}. Use when installing the package, composing its components, theming with its design tokens, or reading a component's exact prop contract.
---

# Using ${PACKAGE_NAME}

Generated from the library's registries at version ${PACKAGE_VERSION}, alongside every deploy of ${origin}. The library is ${api.length} React components across ${categories.length} categories, themed by ${tokenCount} semantic design tokens, published to npm. Designed and built by ${AUTHOR_NAME} (${AUTHOR_URL}), MIT licensed.

## Install

\`\`\`bash
npm install ${PACKAGE_NAME}
\`\`\`

Import the token stylesheet once, then components from the barrel or by deep subpath:

\`\`\`tsx
import '${PACKAGE_NAME}/tokens/tokens.css';
import { Button } from '${PACKAGE_NAME}';
import { Input } from '${PACKAGE_NAME}/components/Input/Input';
\`\`\`

The package is ESM-only, resolved via exports subpaths: use a bundler that handles CSS and font imports from node_modules (Vite, Next.js, webpack) and set TypeScript's \`moduleResolution\` to \`"bundler"\` (or \`"nodenext"\`). Components are provider-free with one exception: wrap the tree in \`ToastProvider\` if (and only if) the toast queue is used via \`useToast\`.

## Dark mode

Set \`data-theme="dark"\` on the root element. Every semantic colour token has a light and a dark value; components never query \`prefers-color-scheme\` themselves.

## Theming

Components read semantic tokens (\`--color-*\`, \`--radius-*\`, \`--font-*\`, \`--motion-*\`, ...), and every semantic colour token references a \`--primitive-*\` value. Re-theme by overriding primitives: one override cascades through both themes at once. Never hardcode a colour beside the components; override the token it should come from. references/tokens.md lists every semantic token with the value it resolves to in light and dark; the live reference is at ${origin}/foundations, and the MCP endpoint's \`list_tokens\` tool serves the registry.

## Charts

Components that import recharts ship from \`${PACKAGE_NAME}/charts\` and need the optional recharts peer dependency. Everything in the main barrel is dependency-free.

## Fonts

The primary typeface is not bundled: set \`--font-family-primary\` to your own (the system is designed around Nunito Sans). The Material Symbols icon font ships inside the package, and any component import loads it.

## Timings in JavaScript

Timer-driven timings (hover delays, toast auto-dismiss, the streaming reveal's pacing) are exported as constants from \`${PACKAGE_NAME}/tokens/motion\`. Import the constant rather than writing a literal millisecond value.

## The catalog

references/components.md lists every component with its import line and description. The categories:

${categoryLines.join('\n')}

## Exact prop contracts

Do not guess props. Three equivalent sources, all generated from the same JSDoc that ships in the package:

- The \`.d.ts\` files in \`node_modules/${PACKAGE_NAME}\` once installed.
- \`${origin}/components/<slug>.md\`: one markdown contract per component, next to its live docs page.
- The MCP endpoint at \`${origin}/api/mcp\`: the \`get_component\` tool returns the full contract for one component.

## Related skills

The other skills \`npx ${BIN_NAME} init\` installs beside this one read this skill's references:

${AGENT_SKILLS.filter((skill) => skill.role !== 'library').map((skill) => `- \`${skill.name}\`: ${SUMMARIES[skill.role]}`).join('\n')}
`;

  const catalogSections = categories.map((category) => {
    const entries = api
      .filter((entry) => entry.category === category.id)
      .map((entry) => {
        const importLine =
          entry.barrel === 'charts'
            ? `\`import { ${entry.name} } from '${PACKAGE_NAME}/charts';\` (needs the optional recharts peer)`
            : `\`import { ${entry.name} } from '${PACKAGE_NAME}';\``;
        const rendering = entry.client
          ? `client component (declares 'use client')`
          : `server-renderable (no 'use client')`;
        return [
          `### ${entry.label}`,
          '',
          entry.description,
          '',
          `- Import: ${importLine}`,
          `- Rendering: ${rendering}`,
          `- Contract: ${origin}/components/${entry.slug}.md`,
        ].join('\n');
      });
    return `## ${category.label} (${entries.length})\n\n${category.description}\n\n${entries.join('\n\n')}`;
  });

  const componentsMd = `# ${PACKAGE_NAME} component catalog

Generated from the component registry at version ${PACKAGE_VERSION}. One entry per public component; each Contract link is the component's full prop table as markdown.

${catalogSections.join('\n\n')}
`;

  // --- The apply-theme skill ---------------------------------------------

  const typeStyles = tokenRegistry.categories.typography
    .map((name) => name.match(/^--font-(.+)-size$/)?.[1])
    .filter((style) => style && tokenNames.has(`--font-${style}-weight`));
  const presets = presetIds();

  const applyMd = [
    '---',
    `name: ${applySkill}`,
    `description: Restyle existing screens onto the ${PACKAGE_NAME} design tokens and components. Use when asked to apply a theme, adopt the design system in an existing app, move hand-written styles onto tokens, or make a screen match THEME.md.`,
    '---',
    '',
    `# Applying a ${PACKAGE_NAME} theme`,
    '',
    `Generated from the library's registries at version ${PACKAGE_VERSION}. You take screens that already exist and move them onto the library's components and semantic tokens, so one theme styles all of them. Token names and values are in ${tokensRef}; the component catalogue is ${componentsRef}. ${siblingNote}`,
    '',
    '## Before you change anything',
    '',
    `1. Check the wiring. The package is installed and ${c(`${PACKAGE_NAME}/tokens/tokens.css`)} is imported once at the root of the app. If either is missing, follow the Install section of the ${c(librarySkill)} skill first.`,
    `2. Find the theme. If the project has a ${c('THEME.md')} (the playground at ${origin}/playground exports one beside a ${c('theme.css')}), read it: it describes the look in words, and where it disagrees with a default in this skill, it wins. If the root element carries a ${c('data-brand')} attribute, the project uses a shipped preset. With neither, the project is on the base theme.`,
    '3. Agree the scope with the user: one screen, one folder or the whole app. Work one screen at a time and keep each one working before you start the next.',
    '',
    '## Order of work',
    '',
    `1. Wire the theme. ${c('theme.css')}, when there is one, is imported after ${c('tokens.css')}. A shipped preset needs ${c(`${PACKAGE_NAME}/tokens/presets/presets.css`)} imported once and ${c('data-brand')} on the root element set to one of: ${presets.map(c).join(', ')}. Dark mode is ${c('data-theme="dark"')} on the root element.`,
    `2. Swap components first. Where the screen hand-builds a control the library ships (a button, an input, a dialog, a table), replace it with the library component. Find it in the catalogue, then read its prop contract before you write the JSX: do not guess props. Once a component is in place, do not restyle it from outside to recover the old look. If it looks wrong, the theme is wrong, and the fix is a token.`,
    '3. Then move what is left onto tokens. Every remaining raw colour, radius, spacing value, shadow, font value and timing becomes a semantic token, chosen by the rules below.',
    `4. Remove the duplicate dark styles. Each colour token already holds a light and a dark value, so a ${c('prefers-color-scheme')} branch or a second set of dark colours for a tokenised value is dead weight. Delete it.`,
    '5. Check the result in light and dark, then write the report.',
    '',
    '## Choosing a token',
    '',
    'Choose by role, never by the nearest value. A grey that is body text and the same grey used as a border are two different tokens, and they will part ways the first time the theme changes.',
    '',
    `- Text: ${token('--color-text-primary')} for body and headings, ${token('--color-text-secondary')} and ${token('--color-text-tertiary')} for supporting text. Icons take ${token('--color-icon-primary')} or ${token('--color-icon-secondary')}.`,
    `- Page and surfaces: the page is ${token('--color-bg-page-primary')}. A card, panel or sheet on it is ${token('--color-bg-container-primary')}, stepping to ${token('--color-bg-container-secondary')} and ${token('--color-bg-container-tertiary')} for surfaces nested inside. A surface border is ${token('--color-bg-container-border')}.`,
    `- Form fields: the ${c('--color-input-*')} family (${token('--color-input-bg-primary')}, ${token('--color-input-border-primary')}, ${token('--color-input-text-placeholder')} and the rest). Better still, use the library's ${component('Input')}.`,
    `- Status: success, warning, error, info and neutral states use the ${c('--color-status-*')} family, each with a bg, border, icon and text token (${token('--color-status-error-text')}, ${token('--color-status-positive-bg')}). Never a hand-picked red or green.`,
    `- The action colour, ${token('--color-action-primary-bg')}, means "this is the main action or the current selection". Use it for a primary button, a focus ring, an active input border, a checked control and the selected item of a set. Never as decoration: an accent stripe or a coloured heading in the action colour teaches the user that it is not a signal.`,
    `- Shape: ${prefixes('radius')}. Shape belongs to the element type, not the instance: every button takes ${token('--radius-pill')} and every input takes ${token('--radius-300')}. Do not pick a radius per screen.`,
    `- Spacing: ${prefixes('spacing')}. Take the step that matches the old value. If the old value falls between two steps, take the nearer one and say so in the report.`,
    `- Depth: the only shadows are ${token('--shadow-floating')} for floating surfaces and ${token('--shadow-modal')} for modals. Everything else separates from the page through the container colours, so remove other shadows instead of mapping them.`,
    `- Type: each text style is a bundle of tokens, ${c('--font-<style>-family')}, ${c('-size')}, ${c('-weight')}, ${c('-line-height')} and ${c('-letter-spacing')}. The styles are ${typeStyles.map(c).join(', ')}. Apply a whole bundle. Do not mix one style's size with another's weight.`,
    `- Icons: set ${c('--icon-size')} on the icon to a step from ${prefixes('icons')}. Never set ${c('font-size')} on an icon.`,
    `- Motion: ${prefixes('motion')} for durations and easings in CSS. A timing that lives in a JavaScript timer comes from ${c(`${PACKAGE_NAME}/tokens/motion`)}.`,
    '',
    'In Tailwind, point the theme at the tokens (a colour named for its role whose value is the token\'s `var()`), then use those names. An arbitrary value such as `bg-[#1a1a1a]` is a hardcoded value with extra steps. In CSS-in-JS and inline styles, write the same `var()` reference a stylesheet would.',
    '',
    '## When nothing fits',
    '',
    '- No token matches the role: keep the raw value, leave the code working, and list it in the report. Do not invent a token name, and do not borrow a token from another role because its value is close.',
    `- The user wants the old colour kept: that is a theme decision, not a per-screen one. Override the primitive or the token once, in the project's theme file, so every screen follows.`,
    '- A screen needs a component the library does not ship: build it from tokens alone, and say so in the report.',
    '',
    '## Report',
    '',
    'End with a short report in plain language:',
    '',
    '- The screens you changed.',
    '- The components you swapped in, as old to new.',
    '- The values you moved onto tokens, counted by category.',
    '- Every value you left raw, with its file and line and the reason.',
    '- Anything that now looks different and deserves a look from the user.',
    '',
    `Then offer to run the ${c(auditSkill)} skill over the same scope to catch what is left.`,
    '',
  ].join('\n');

  // --- The style-audit skill ---------------------------------------------

  const values = resolveTokenValues(tokenNames);
  // The worked examples use real tokens with their real base values, so
  // an agent reading them learns a true mapping. The near-twin is the
  // action colour moved one step on its last channel.
  const actionHex = values.get('--color-action-primary-bg').light.value;
  const textHex = values.get('--color-text-primary').light.value;
  if (!/^#[0-9a-f]{6}$/i.test(actionHex) || !/^#[0-9a-f]{6}$/i.test(textHex)) {
    throw new Error(
      'generate-agent-skill.mjs: the audit examples need --color-action-primary-bg and ' +
        '--color-text-primary to resolve to six-digit hexes in the light theme; pick other example tokens.'
    );
  }
  const lastChannel = parseInt(actionHex.slice(5), 16);
  const twinHex =
    actionHex.slice(0, 5) +
    (lastChannel === 255 ? 254 : lastChannel + 1).toString(16).toUpperCase().padStart(2, '0');

  const auditMd = [
    '---',
    `name: ${auditSkill}`,
    `description: Scan a project's styles for hardcoded values that should use the ${PACKAGE_NAME} design tokens, and report them, including near-twins of existing tokens. Use when asked to check for hardcoded values, raw colours or pixel values, or to audit token usage and design system compliance.`,
    '---',
    '',
    `# Auditing styles against ${PACKAGE_NAME} tokens`,
    '',
    `Generated from the library's registries at version ${PACKAGE_VERSION}. You scan the project's own styles for hardcoded values that should reference a design token, and you report them. You do not fix anything unless the user asks. Token names and values are in ${tokensRef}. ${tokensNote}`,
    '',
    '## Instructions',
    '',
    '1. **Determine the scope.** Accept one of:',
    '   - A single file or component',
    '   - A folder',
    '   - The whole project',
    '',
    `   Skip ${c('node_modules')}, build output, generated files and the package's own files. Scan every place the project writes a style:`,
    '   - Stylesheets: CSS, CSS modules, Sass and Less',
    '   - CSS-in-JS: styled-components and Emotion templates, style objects, theme objects',
    `   - Tailwind: arbitrary values in class names (${c('bg-[#1a1a1a]')}, ${c('p-[13px]')}) and raw values in the Tailwind theme config`,
    `   - Inline styles: ${c('style')} props and attributes`,
    '',
    `2. **Read the tokens first.** Read ${tokensRef} to know which tokens exist and what each resolves to in light and dark. Then read the project's own theme file if it has one (a ${c('theme.css')}, or wherever it overrides ${c('--primitive-*')} or semantic tokens). Where the project overrides a token, the project's value is the one that counts, and the reference's value is only the default.`,
    '',
    '3. **Scan each file** in scope for violations.',
    '',
    '   **Flag as violations:**',
    `   - Hardcoded hex colours: ${c('#rrggbb')}, ${c('#rgb')}, ${c('#rrggbbaa')}`,
    `   - Raw ${c('rgb()')}, ${c('rgba()')} or ${c('hsl()')} calls that could map to a semantic colour token`,
    `   - Pixel values for ${c('padding')}, ${c('margin')}, ${c('gap')}, ${c('border-radius')}, ${c('font-size')} and ${c('line-height')} that correspond to a token (${prefixes('spacing')}, ${prefixes('radius')}, ${prefixes('typography')})`,
    `   - Hardcoded font weights (${c('font-weight: 600')}) where a typography token exists`,
    `   - Icon sizing done wrong: ${c('font-size')} set directly on an icon, or raw pixel icon dimensions that match a step. The fix is setting ${c('--icon-size')} to a step from ${prefixes('icons')}`,
    `   - Hardcoded ${c('transition')} and ${c('animation')} durations and easings (${c('0.2s')}, ${c('ease')}, a literal cubic-bezier) where a ${prefixes('motion')} token matches`,
    `   - Shadows written by hand. The system has two, ${token('--shadow-floating')} and ${token('--shadow-modal')}`,
    '',
    '   **Do not flag:**',
    `   - The project's theme file, where it overrides tokens or primitives. That file defines the theme`,
    `   - ${c('0px')}, ${c('0')}, ${c('100%')}, ${c('50%')}. These are structural, not replaceable by a token`,
    `   - ${c('1px')} border widths`,
    `   - Values inside ${c('calc()')} that are real arithmetic, not replaceable by a single token`,
    `   - Custom property declarations themselves (lines starting with ${c('--')})`,
    '   - A value the project marks as deliberate in a comment beside it. Count it as an acceptable raw value and quote the reason',
    '',
    `   **Hunt near-twins, not only strays.** A raw value that is almost a token is a typo recorded as a decision, and a check that only asks "is this a token" never sees it. Compare every raw value you collect against the resolved token values and against the other raw values in scope. A colour within a few points per channel of a token is a near-twin, and so is the same colour written another way: a hex, an ${c('hsl()')} and an ${c('rgb()')} of one colour are one value written three times. A spacing value one pixel off a scale step is a near-twin too. Report a near-twin as its own class of finding, separate from a plain stray, and name what it is a twin of. A twin of a token is repaired by pointing at the token. Two raw values that are twins of each other collapse into one.`,
    '',
    `   **Colour literals in components count.** Hex, ${c('rgb()')} and ${c('hsl()')} literals also live in ${c('.ts')}, ${c('.tsx')}, ${c('.js')} and ${c('.jsx')} files: chart colours, canvas drawing, theme objects. Scan them too and judge each hit. Fixed data that is meant to stay the same in every theme can be legitimate, but a near-twin of a token in it is still a typo.`,
    '',
    '4. **For each violation**, give:',
    '   - The file path, relative to the project root',
    '   - The line number',
    '   - The offending value',
    '   - The recommended token, when the reference has a clear match',
    '',
    '   Format, with an invented file:',
    '',
    '   ```',
    `   src/components/GadgetTile.css:42 - ${textHex} → var(--color-text-primary)`,
    `   src/components/GadgetTile.css:17 - ${twinHex} → near-twin of var(--color-action-primary-bg), probably a mistyped copy`,
    '   ```',
    '',
    '   Recommend by role, not by value alone. When two tokens share a value, name the one whose role matches how the value is used, and say when you cannot tell.',
    '',
    '5. **Summarise** at the end:',
    `   - ${c('X violation(s) found')}`,
    `   - ${c('Y near-twin(s) found')}`,
    `   - ${c('Z acceptable raw value(s) noted')}`,
    '   - With zero violations: "No token violations found. The styles are token-compliant."',
    '',
    `If the user wants the findings fixed, the ${c(applySkill)} skill has the rules for choosing a token by role.`,
    '',
  ].join('\n');

  const built = {
    library: [
      { path: 'SKILL.md', content: skillMd },
      { path: 'references/components.md', content: componentsMd },
      { path: 'references/tokens.md', content: buildTokensMd(origin) },
    ],
    'apply-theme': [{ path: 'SKILL.md', content: applyMd }],
    'style-audit': [{ path: 'SKILL.md', content: auditMd }],
  };

  // The table and the builders must agree in both directions.
  const roles = AGENT_SKILLS.map((skill) => skill.role);
  const unbuilt = roles.filter((role) => !built[role]);
  const unlisted = Object.keys(built).filter((role) => !roles.includes(role));
  if (unbuilt.length > 0 || unlisted.length > 0 || Object.keys(SUMMARIES).sort().join() !== [...roles].sort().join()) {
    throw new Error(
      `generate-agent-skill.mjs: AGENT_SKILLS in scripts/brand.mjs and the builders here disagree ` +
        `(no builder: ${unbuilt.join(', ') || 'none'}; no table row: ${unlisted.join(', ') || 'none'}). ` +
        `Every role needs a row, a builder and a SUMMARIES entry.`
    );
  }

  return AGENT_SKILLS.flatMap((skill) =>
    built[skill.role].map((file) => ({ skill: skill.name, ...file }))
  );
}

/**
 * manifest.json: every skill, a one-line summary, and its files. The init
 * bin fetches this to learn what to install, and the website reads it to
 * write its install snippets, so a new skill or file reaches both with no
 * second edit (and reaches `npx <pkg> init` users with no package release).
 * `schema` moves only if the shape changes in a way an older bin cannot read.
 */
export function assembleSkillManifest(files = assembleAgentSkill()) {
  const manifest = {
    schema: 1,
    skills: AGENT_SKILLS.map((skill) => ({
      name: skill.name,
      summary: SUMMARIES[skill.role],
      files: files.filter((file) => file.skill === skill.name).map((file) => file.path),
    })),
  };
  return JSON.stringify(manifest, null, 2) + '\n';
}

/** Every file under a folder, as forward-slashed paths relative to it. */
export function listFiles(dir, prefix = '') {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? listFiles(join(dir, entry.name), `${prefix}${entry.name}/`)
      : [`${prefix}${entry.name}`]
  );
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const files = assembleAgentSkill();
  const outputs = new Map([
    ...files.map((file) => [`${file.skill}/${file.path}`, file.content]),
    [MANIFEST_FILE, assembleSkillManifest(files)],
  ]);

  let written = 0;
  for (const [path, content] of outputs) {
    const dest = join(skillRoot, ...path.split('/'));
    mkdirSync(dirname(dest), { recursive: true });
    const existing = existsSync(dest) ? readFileSync(dest, 'utf8') : null;
    if (existing !== content) {
      writeFileSync(dest, content);
      written++;
    }
  }

  // A skill leaving the table, or a file a builder stops emitting, takes
  // its published copy with it; a folder emptied that way goes too.
  let pruned = 0;
  for (const path of listFiles(skillRoot)) {
    if (outputs.has(path)) continue;
    const parts = path.split('/');
    rmSync(join(skillRoot, ...parts));
    pruned++;
    for (let depth = parts.length - 1; depth > 0; depth--) {
      const folder = join(skillRoot, ...parts.slice(0, depth));
      if (readdirSync(folder).length > 0) break;
      rmdirSync(folder);
    }
  }

  console.log(
    written + pruned > 0
      ? `✓ Agent skills regenerated — ${AGENT_SKILLS.length} skills, ${outputs.size} files (${written} written, ${pruned} pruned).`
      : `✓ Agent skills up to date — ${AGENT_SKILLS.length} skills, ${outputs.size} files match the registries.`
  );
}
