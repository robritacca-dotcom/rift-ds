#!/usr/bin/env node
/**
 * generate-theme-design-md.mjs
 *
 * Writes website/public/themes/<id>/DESIGN.md: every shipped theme (the
 * base look and each preset in THEME_SELECTOR_ORDER) described in the
 * DESIGN.md format other systems publish their look in, so a theme can be
 * taken on its own by a person, an agent or another tool. It is purely
 * visual: colours, type, shape, space and depth. How the components
 * behave is the library's, the same in every theme, and stays in
 * design.md.
 *
 * Every value is what the theme actually resolves to: the preset's
 * declarations come from presetOverrides (the one composer the shipped
 * stylesheets are written from) and are laid over the token CSS by
 * token-values.mjs, the one resolver. Nothing is restated by hand, so a
 * retuned token or preset reaches the file on the next build.
 *
 * The front matter is the token-front-matter form the playground's
 * importer (website/src/lib/theme/design-md.ts) reads, and
 * validate-theme-design-md.mjs reads every file back through it: a theme
 * exported here and dropped on the playground must land on its own
 * levers. The /foundations/themes/<id> page renders the same file.
 *
 * Runs in the validate-registry chain and the website's predev/prebuild.
 * Never hand-edit the generated files.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadThemeSource } from './generate-preset-stylesheets.mjs';
import { resolveTokenValues } from './token-values.mjs';
import { PACKAGE_NAME, SITE_URL } from './brand.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
export const outputDir = join(repoRoot, 'website', 'public', 'themes');
export const FILE_NAME = 'DESIGN.md';

/* ---------- what the file states, token by token ---------- */

/** Colour roles: front-matter key -> semantic token. `-dark` keys carry the
    dark-mode value, in the names the importer reads a second mode by. */
const COLOURS = [
  ['primary', '--color-action-primary-bg', 'light'],
  ['primary-hover', '--color-action-primary-bg-hover', 'light'],
  ['primary-active', '--color-action-primary-bg-active', 'light'],
  ['on-primary', '--color-action-primary-text', 'light'],
  ['primary-dark', '--color-action-primary-bg', 'dark'],
  ['canvas-light', '--color-bg-page-primary', 'light'],
  ['canvas-dark', '--color-bg-page-primary', 'dark'],
  ['surface', '--color-bg-container-primary', 'light'],
  ['surface-dark', '--color-bg-container-primary', 'dark'],
  ['surface-soft', '--color-bg-container-secondary', 'light'],
  ['ink', '--color-text-primary', 'light'],
  ['ink-dark', '--color-text-primary', 'dark'],
  ['display', '--color-text-display', 'light'],
  ['display-dark', '--color-text-display', 'dark'],
  ['heading', '--color-text-heading', 'light'],
  ['heading-dark', '--color-text-heading', 'dark'],
  ['logo', '--color-brand-mark', 'light'],
  ['logo-dark', '--color-brand-mark', 'dark'],
  ['text-secondary', '--color-text-secondary', 'light'],
  ['text-tertiary', '--color-text-tertiary', 'light'],
  ['border', '--color-bg-container-border', 'light'],
  ['input', '--color-input-bg-primary', 'light'],
  ['error', '--color-status-error-icon', 'light'],
  ['success', '--color-status-positive-icon', 'light'],
  ['warning', '--color-status-warning-icon', 'light'],
  ['info', '--color-status-info-icon', 'light'],
];

const ACCENTS = ['amber', 'cobalt', 'coral', 'gold', 'mint', 'violet'];
const SERIES = [1, 2, 3, 4, 5, 6];

/** Type styles: front-matter key -> token stem. */
const TYPE = [
  ['display-lg', 'display-1'],
  ['display-md', 'display-2'],
  ['sub-display', 'sub-display'],
  ['heading-1', 'heading-1'],
  ['heading-2', 'heading-2'],
  ['heading-3', 'heading-3'],
  ['title', 'title-body'],
  ['body-md', 'paragraph'],
  ['body-emphasis', 'paragraph-emphasis'],
  ['body-sm', 'paragraph-sm'],
  ['caption', 'caption'],
  ['overline', 'overline'],
];
const TYPE_FIELDS = [
  ['fontFamily', 'family'],
  ['fontSize', 'size'],
  ['fontWeight', 'weight'],
  ['lineHeight', 'line-height'],
  ['letterSpacing', 'letter-spacing'],
];

const RADII = [
  ['xs', '--radius-050'],
  ['sm', '--radius-100'],
  ['md', '--radius-200'],
  ['input', '--radius-300'],
  ['lg', '--radius-400'],
  ['card', '--radius-600'],
  ['xl', '--radius-1200'],
  ['pill', '--radius-pill'],
];

const SPACING = [
  ['xxs', '--gap-050'],
  ['xs', '--gap-100'],
  ['sm', '--gap-200'],
  ['md', '--gap-300'],
  ['lg', '--gap-400'],
  ['xl', '--gap-500'],
  ['xxl', '--gap-1000'],
];

const MOTION = [
  ['fast', '--motion-duration-fast'],
  ['base', '--motion-duration-base'],
  ['slow', '--motion-duration-slow'],
];

const allTokens = () => [
  ...new Set([
    ...COLOURS.map(([, t]) => t),
    ...ACCENTS.map((a) => `--color-core-accent-${a}`),
    ...SERIES.map((n) => `--color-chart-series-${n}`),
    ...TYPE.flatMap(([, stem]) => TYPE_FIELDS.map(([, f]) => `--font-${stem}-${f}`)),
    ...RADII.map(([, t]) => t),
    ...SPACING.map(([, t]) => t),
    ...MOTION.map(([, t]) => t),
    '--shadow-floating',
    '--shadow-modal',
    '--font-family-primary',
    '--font-family-heading',
    '--padding-200',
    '--font-paragraph-emphasis-line-height',
  ]),
];

/* ---------- formatting ---------- */

const hex = (value) => {
  const v = value.trim();
  if (/^#[0-9a-f]{6}$/i.test(v)) return v.toLowerCase();
  if (/^#[0-9a-f]{3}$/i.test(v)) return `#${[...v.slice(1)].map((c) => c + c).join('')}`.toLowerCase();
  return v;
};
const quote = (value) => `"${String(value).replace(/"/g, "'")}"`;
/** The face a stack leads with: `'Inter', sans-serif` -> Inter. */
const face = (stack) => stack.split(',')[0].trim().replace(/^['"]|['"]$/g, '');
const pxOf = (value) => {
  const m = /^(-?\d*\.?\d+)px$/.exec(value.trim());
  return m ? Number(m[1]) : null;
};

/* ---------- one theme ---------- */

export function buildThemeDesignMd({ id, label, values, siteUrl, packageName }) {
  const light = (token) => values.get(token).light.value;
  const dark = (token) => values.get(token).dark.value;
  const mode = (token, m) => (m === 'dark' ? dark(token) : light(token));

  const bodyFace = face(light('--font-family-primary'));
  const headingFace = face(light('--font-family-heading'));
  /* The button's height, as Button.css builds it: its vertical padding
     around one line of its label style. Stated so a reader (and the
     importer) can tell a pill from a rounded corner by proportion. */
  const buttonHeight =
    2 * (pxOf(light('--padding-200')) ?? 0) + (pxOf(light('--font-paragraph-emphasis-line-height')) ?? 0);
  const pill = (pxOf(light('--radius-pill')) ?? 0) >= buttonHeight / 2;
  const cardRadius = light('--radius-600');
  const floating = light('--shadow-floating');
  const baseFloating = values.baseFloating;
  const depth = floating === 'none' ? 'flat' : floating === baseFloating ? 'default' : 'soft';

  const fm = [];
  fm.push('---', 'version: alpha', `name: ${quote(label)}`);
  fm.push(
    `description: ${quote(`The ${label} theme of ${packageName}: its colours, type, shape, space and depth, as the theme resolves them.`)}`,
    ''
  );

  fm.push('colors:');
  for (const [key, token, m] of COLOURS) fm.push(`  ${key}: ${quote(hex(mode(token, m)))}`);
  for (const a of ACCENTS) fm.push(`  accent-${a}: ${quote(hex(light(`--color-core-accent-${a}`)))}`);
  for (const n of SERIES) fm.push(`  chart-${n}: ${quote(hex(light(`--color-chart-series-${n}`)))}`);
  fm.push('');

  fm.push('typography:');
  for (const [key, stem] of TYPE) {
    fm.push(`  ${key}:`);
    for (const [field, suffix] of TYPE_FIELDS) {
      const v = light(`--font-${stem}-${suffix}`);
      fm.push(`    ${field}: ${field === 'fontFamily' ? quote(v) : v}`);
    }
  }
  fm.push('');

  fm.push('rounded:');
  for (const [key, token] of RADII) fm.push(`  ${key}: ${light(token)}`);
  fm.push('');

  fm.push('spacing:');
  for (const [key, token] of SPACING) fm.push(`  ${key}: ${light(token)}`);
  fm.push('');

  fm.push('components:');
  fm.push(
    '  button-primary:',
    '    backgroundColor: "{colors.primary}"',
    '    textColor: "{colors.on-primary}"',
    '    rounded: "{rounded.pill}"',
    `    height: ${buttonHeight}px`,
    '  button-primary-hover:',
    '    backgroundColor: "{colors.primary-hover}"',
    '  button-primary-active:',
    '    backgroundColor: "{colors.primary-active}"',
    '  text-input:',
    '    backgroundColor: "{colors.input}"',
    '    textColor: "{colors.ink}"',
    '    rounded: "{rounded.input}"',
    '  card:',
    '    backgroundColor: "{colors.surface}"',
    '    rounded: "{rounded.card}"'
  );
  if (depth === 'default') {
    fm.push(`    shadow: ${quote(floating)}`, '  modal:', `    shadow: ${quote(light('--shadow-modal'))}`);
  }
  fm.push('---', '');

  /* The prose: short, visual, and built from the same values. */
  const pairing =
    headingFace === bodyFace ? `${bodyFace} throughout` : `${headingFace} headings over ${bodyFace} text`;
  const shape = pill
    ? `pill buttons, ${light('--radius-300')} inputs and ${cardRadius} cards`
    : `buttons squared to ${light('--radius-pill')}, ${light('--radius-300')} inputs and ${cardRadius} cards`;
  const depthLine = {
    flat: 'Flat: no shadows at all. Surfaces separate from the page by contrast alone.',
    soft: 'Soft shadows, kept for what floats: menus, popovers and dialogs.',
    default: 'Two shadows, one for what floats and one for dialogs. Everything else separates by contrast.',
  }[depth];

  /* Whether the logo wears the action colour or a tone of its own. */
  const logoLine =
    hex(light('--color-brand-mark')) === hex(light('--color-action-primary-bg')) &&
    hex(dark('--color-brand-mark')) === hex(dark('--color-action-primary-bg'))
      ? 'The logo wears the action colour (`logo`).'
      : 'The logo has a colour of its own (`logo`), apart from the action colour.';
  /* Which type tiers take a colour of their own rather than the ink. */
  const toned = [
    ['Display type', 'display', '--color-text-display'],
    ['headings', 'heading', '--color-text-heading'],
  ].filter(
    ([, , token]) =>
      hex(light(token)) !== hex(light('--color-text-primary')) || hex(dark(token)) !== hex(dark('--color-text-primary'))
  );
  const tierColourLine =
    toned.length === 0
      ? 'Every tier is set in the ink.'
      : `${toned.map(([name, key]) => `${name} take \`${key}\``).join(' and ').replace(/^./, (c) => c.toUpperCase())}, while running text stays in the ink.`;
  const row = (cells) => `| ${cells.join(' | ')} |`;
  const colourRows = COLOURS.filter(([, , m]) => m === 'light').map(([key, token]) =>
    row([`\`${key}\``, `\`${hex(light(token))}\``, `\`${hex(dark(token))}\``, `\`${token}\``])
  );
  const typeRows = TYPE.map(([key, stem]) =>
    row([
      `\`${key}\``,
      face(light(`--font-${stem}-family`)),
      light(`--font-${stem}-size`),
      light(`--font-${stem}-weight`),
      light(`--font-${stem}-line-height`),
      light(`--font-${stem}-letter-spacing`),
    ])
  );

  const prose = `# ${label} theme

${label}: ${pairing}, ${hex(light('--color-action-primary-bg'))} for actions, ${shape}. ${depthLine}

Take it whole: \`import '${packageName}/tokens/presets/presets.css'\` after the tokens, then set \`data-brand="${id}"\` on \`<html>\`. See it at ${siteUrl}/foundations/themes/${id}.

## Colour

One action colour, kept for primary buttons, focus rings, the checked state of a control and the selected item of a set. Everything else is the neutral scale and five status roles. ${logoLine}

${row(['Role', 'Light', 'Dark', 'Token'])}
${row(['---', '---', '---', '---'])}
${colourRows.join('\n')}

Accents, for charts and the background field: ${ACCENTS.map((a) => `${a} \`${hex(light(`--color-core-accent-${a}`))}\``).join(', ')}.

## Typography

${pairing}. Levels inside a tier share a weight and step by size. ${tierColourLine}

${row(['Style', 'Face', 'Size', 'Weight', 'Line height', 'Tracking'])}
${row(['---', '---', '---', '---', '---', '---'])}
${typeRows.join('\n')}

## Shape

${shape[0].toUpperCase()}${shape.slice(1)}. Radius belongs to the element type, never to one instance.

${RADII.map(([key, token]) => `- \`${key}\`: ${light(token)} (\`${token}\`)`).join('\n')}

## Space

${SPACING.map(([key, token]) => `- \`${key}\`: ${light(token)} (\`${token}\`)`).join('\n')}

## Depth

${depthLine}

## Motion

${MOTION.map(([key, token]) => `- \`${key}\`: ${light(token)}`).join('\n')}
`;

  return `${fm.join('\n')}\n${prose}`;
}

/** Every file of the surface, as relative path -> content. */
export async function assembleThemeDesignMd() {
  const source = await loadThemeSource();
  const { THEME_PRESETS, THEME_SELECTOR_ORDER, DEFAULT_THEME_LABEL, presetOverrides } = source;
  const names = allTokens();
  const base = resolveTokenValues(names);
  const files = new Map();
  for (const id of THEME_SELECTOR_ORDER) {
    const preset = THEME_PRESETS[id];
    const values = preset
      ? resolveTokenValues(names, {
          light: presetOverrides(preset, 'light'),
          dark: presetOverrides(preset, 'dark'),
        })
      : base;
    values.baseFloating = base.get('--shadow-floating').light.value;
    files.set(
      `${id}/${FILE_NAME}`,
      buildThemeDesignMd({
        id,
        label: preset?.label ?? DEFAULT_THEME_LABEL,
        values,
        siteUrl: SITE_URL,
        packageName: PACKAGE_NAME,
      })
    );
  }
  return files;
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const files = await assembleThemeDesignMd();
  let written = 0;
  for (const [path, content] of files) {
    const dest = join(outputDir, path);
    mkdirSync(dirname(dest), { recursive: true });
    if (!existsSync(dest) || readFileSync(dest, 'utf8') !== content) {
      writeFileSync(dest, content);
      written++;
    }
  }
  // A theme leaving the selector order takes its folder with it.
  let pruned = 0;
  const ids = new Set([...files.keys()].map((p) => p.split('/')[0]));
  for (const dir of readdirSync(outputDir)) {
    if (!ids.has(dir)) {
      rmSync(join(outputDir, dir), { recursive: true });
      pruned++;
    }
  }
  console.log(
    written + pruned > 0
      ? `✓ Theme DESIGN.md files regenerated: ${files.size} (${written} written, ${pruned} pruned).`
      : `✓ Theme DESIGN.md files up to date: ${files.size}.`
  );
}
