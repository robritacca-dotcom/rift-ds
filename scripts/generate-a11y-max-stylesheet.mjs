#!/usr/bin/env node
/**
 * generate-a11y-max-stylesheet.mjs
 *
 * PROOF OF CONCEPT. Writes website/src/app/a11y-max.generated.css: the
 * colour half of the max accessibility mode, one html[data-a11y="max"]
 * block per theme.
 *
 * The mode is not black and white. Interface surfaces and text go to ink
 * and paper (black on white, or the reverse), so every text pairing is
 * 21:1 whatever theme preset is active underneath. Colour stays wherever
 * it does a job (the action colour, status, trends, accents, file types,
 * chart data), but only from the HUES below, each held to AAA_CONTRAST
 * against its theme's paper. Colour is never the only cue: status keeps
 * its icon and wording, and charts tell series apart by line style too
 * (a11y-max.css).
 *
 * The token list is read from src/tokens/registry.json, never typed here,
 * and each name is sorted onto a hue by the RULES table below (first match
 * wins). A colour token no rule claims fails generation, so a new token
 * cannot reach the mode unmapped: decide what it is and add a rule.
 *
 * The non-colour half (no motion, no effects, no shadows, square corners,
 * overlays as page takeovers, AAA type) is hand-written in a11y-max.css
 * beside the output, because it is selectors, not tokens.
 *
 * Runs in the website's predev/prebuild. Never hand-edit the output.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(repoRoot, 'website/src/app/a11y-max.generated.css');

/* AAA's 7:1 for normal text (1.4.6). Every hue clears it against paper,
   so a hue may carry text (a status message, a link, a trend figure) as
   well as marks, and graphics clear 1.4.11's 3:1 with room to spare. */
const AAA_CONTRAST = 7;

/* The palette, per theme. Light hues all have to be dark to reach 7:1 on
   white; the dark theme has room for bright ones. Chosen for distinctness
   as well as contrast: the series sets below stay apart in simulated
   protanopia, deuteranopia and tritanopia (the light theme's closest pair
   is green and teal under tritanopia). */
const HUES = {
  light: {
    ink: '#000000',
    paper: '#FFFFFF',
    blue: '#0046B8',
    red: '#A31F00',
    green: '#00663F',
    purple: '#6E1A9E',
    amber: '#7A4200',
    gold: '#5C5C00',
    magenta: '#A0005A',
    teal: '#005A70',
  },
  dark: {
    ink: '#FFFFFF',
    paper: '#000000',
    blue: '#5CC8FF',
    red: '#FF6B3D',
    green: '#3DDC97',
    purple: '#C3A6FF',
    amber: '#FFB000',
    gold: '#FFF04D',
    magenta: '#FF8AC4',
    teal: '#4FD8E8',
  },
};

/* The chart series, by hue. The two themes differ in slots 4 and 6:
   matching them by hue made sky and lavender collide for deuteranopia in
   the dark theme, so distinctness wins over keeping a series' hue. */
const SERIES = {
  light: ['blue', 'red', 'green', 'purple', 'magenta', 'teal', 'ink'],
  dark: ['blue', 'red', 'green', 'amber', 'magenta', 'gold', 'ink'],
};

/* The one pairing that puts a colour under text: the action fill's label
   is paper, and it has to clear AAA on the fill too. */
const ACTION_HUE = 'blue';

const STATUS_HUES = { positive: 'green', warning: 'amber', error: 'red', info: 'blue', neutral: 'ink' };
const ACCENT_HUES = { coral: 'red', violet: 'purple', cobalt: 'blue', amber: 'amber', gold: 'gold', mint: 'green' };
const FILE_HUES = { pdf: 'red', spreadsheet: 'green', document: 'blue', presentation: 'amber' };
const PIXEL_HUES = ['red', 'amber', 'gold', 'green', 'blue', 'purple'];

/* [pattern, hue or (name) => hue, why]. Order matters: the specific rules
   sit above the catch-alls. "series" resolves per theme from SERIES. */
const RULES = [
  // The action colour, with paper on it.
  [/^--color-action-primary-bg/, ACTION_HUE, 'primary fill'],
  [/^--color-action-primary-text(-active)?$/, 'paper', 'label on the primary fill'],
  [/^--color-action-primary-(text|border)/, ACTION_HUE, 'action colour drawn on a surface'],
  [/^--color-action-icon-active$/, 'paper', 'icon on the primary fill'],
  [/^--color-control-thumb$/, 'paper', 'thumb on an on-state track'],
  [/^--color-core-ui-/, ACTION_HUE, 'the action colour as brand'],
  [/^--color-input-border-selected$/, ACTION_HUE, 'active input border'],
  // Inverse surfaces stay inverse.
  [/^--color-bg-(page|container)-inverse$/, 'ink', 'inverse surface'],
  [/^--color-(input-)?text-(on-)?inverse$/, 'paper', 'text on an inverse surface'],
  // A border that happens to live in the bg family.
  [/^--color-bg-container-border$/, 'ink', 'container border'],
  // Data.
  [/^--color-chart-contribution-0$/, 'paper', 'empty heatmap cell'],
  [/^--color-chart-contribution-\d+$/, 'green', 'heatmap level (the amount of fill, in a11y-max.css, says how much)'],
  [/^--color-chart-series-\d+$/, 'series', 'chart series'],
  [/^--color-trend-up$/, 'green', 'rising figure'],
  [/^--color-trend-down$/, 'red', 'falling figure'],
  // Status marks keep their meaning colour; status fills are paper.
  [/^--color-status-(\w+)-(text|icon|border)$/, (n) => STATUS_HUES[n.match(/^--color-status-(\w+)-/)[1]], 'status mark'],
  // Accents, file types and pixel inks keep a hue each.
  [/^--color-core-accent-(\w+)$/, (n) => ACCENT_HUES[n.match(/accent-(\w+)$/)[1]], 'accent'],
  [/^--color-file-(\w+)$/, (n) => FILE_HUES[n.match(/file-(\w+)$/)[1]], 'file type'],
  [/^--color-pixel-ink-(\d+)$/, (n) => PIXEL_HUES[Number(n.match(/(\d+)$/)[1]) - 1], 'pixel ink'],
  // Every other surface is paper.
  [/(^--color-bg-|-bg($|-)|^--color-scrim$)/, 'paper', 'surface'],
  // Everything left draws on a surface: text, icons, borders, dividers,
  // the ambient and AI gradient stops (their effects are off). Ink.
  [/^--color-/, 'ink', 'drawn on a surface'],
];

const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
const fail = (message) => {
  console.error(`generate-a11y-max-stylesheet: ${message}`);
  process.exit(1);
};

const registry = JSON.parse(readFileSync(join(repoRoot, 'src/tokens/registry.json'), 'utf8'));
const colourTokens = registry.categories.colour;
if (!Array.isArray(colourTokens) || colourTokens.length === 0) fail('no colour tokens in src/tokens/registry.json');

const mapped = colourTokens.map((name) => {
  const rule = RULES.find(([pattern]) => pattern.test(name));
  if (!rule) fail(`${name} matches no rule; add one to RULES`);
  const hue = typeof rule[1] === 'function' ? rule[1](name) : rule[1];
  if (!hue) fail(`${name} resolves to no hue; extend the table its rule reads`);
  return [name, hue];
});

const seriesCount = mapped.filter(([, hue]) => hue === 'series').length;
for (const theme of ['light', 'dark']) {
  const hues = HUES[theme];
  for (const [name, hex] of Object.entries(hues)) {
    if (name === 'paper') continue;
    const ratio = contrast(hex, hues.paper);
    if (ratio < AAA_CONTRAST) fail(`${theme} ${name} ${hex} is ${ratio.toFixed(2)}:1 on paper, under ${AAA_CONTRAST}:1`);
  }
  const label = contrast(hues.paper, hues[ACTION_HUE]);
  if (label < AAA_CONTRAST) fail(`${theme} label on the action fill is ${label.toFixed(2)}:1, under ${AAA_CONTRAST}:1`);
  if (SERIES[theme].length !== seriesCount) fail(`${seriesCount} chart series tokens but ${SERIES[theme].length} ${theme} series hues`);
  for (const hue of [...SERIES[theme], ...mapped.map(([, h]) => h).filter((h) => h !== 'series')]) {
    if (!(hue in hues)) fail(`${theme} has no hue "${hue}"`);
  }
}

const block = (selector, theme) =>
  [
    `${selector} {`,
    ...Object.entries(HUES[theme]).map(([name, hex]) => `  --a11y-${name}: ${hex};`),
    ...mapped.map(([name, hue]) => {
      const resolved = hue === 'series' ? SERIES[theme][Number(name.match(/\d+$/)[0]) - 1] : hue;
      return `  ${name}: var(--a11y-${resolved});`;
    }),
    '}',
  ].join('\n');

/* The attribute is doubled for specificity: the preset sheets' dark block
   is html[data-brand][data-theme], and this has to outrank it however the
   bundler orders the stylesheets. */
const css = `/* GENERATED by scripts/generate-a11y-max-stylesheet.mjs from src/tokens/registry.json. Never hand-edit. */
/* ds-allow-file(color): the max accessibility mode's palette is fixed values by definition, each held to AAA by the generator, and kept off the primitives so no theme preset can re-key them. */

${block('html[data-a11y="max"][data-a11y="max"]:not([data-theme="dark"])', 'light')}

${block('html[data-a11y="max"][data-a11y="max"][data-theme="dark"]', 'dark')}
`;

writeFileSync(OUT, css.replace(/\r\n/g, '\n'));
const coloured = mapped.filter(([, hue]) => hue !== 'ink' && hue !== 'paper').length;
console.log(`generate-a11y-max-stylesheet: ${mapped.length} colour tokens mapped, ${coloured} in colour, every hue at ${AAA_CONTRAST}:1 or more`);
