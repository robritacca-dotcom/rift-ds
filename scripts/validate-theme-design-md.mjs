#!/usr/bin/env node
/**
 * validate-theme-design-md.mjs
 *
 * Holds website/public/themes/<id>/DESIGN.md to its generator and to the
 * importer that reads the format.
 *
 *   1. Drift: every file regenerates byte for byte, and the folder holds
 *      exactly the themes in THEME_SELECTOR_ORDER (an orphan fails).
 *   2. Round trip: each file, read by the playground's importer
 *      (website/src/lib/theme/design-md.ts), lands on its own theme's
 *      levers: shape, density, depth, the tier weights, the display,
 *      heading and both logo colours, the type scale, tracking and both faces, and the action colour the file states. A
 *      theme that exports a file its own importer misreads is a bug in one
 *      of the two, and this is where it shows.
 *
 *   3. Every tone: a synthetic theme that sets all five tones, which no
 *      shipped theme does, carries each of them through the file.
 *
 * A difference the format cannot carry is sanctioned in SANCTIONED_DRIFT
 * with the reason; a stale entry fails too.
 *
 * Belongs in the validate-registry chain and the website prebuild.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { assembleThemeDesignMd, outputDir } from './generate-theme-design-md.mjs';
import { loadThemeSource } from './generate-preset-stylesheets.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];

/** theme id -> lever -> why the file reads back differently. */
const SANCTIONED_DRIFT = {
  zest: {
    tracking:
      'Zest tightens its display tier through its own extras, not the tracking lever; the file states the tightened display, which the importer fits as a lever.',
  },
};

/* ---------- 1. drift ---------- */

const files = await assembleThemeDesignMd();
for (const [path, content] of files) {
  const dest = join(outputDir, path);
  if (!existsSync(dest)) errors.push(`${path} is missing — run node scripts/generate-theme-design-md.mjs`);
  else if (readFileSync(dest, 'utf8') !== content) errors.push(`${path} is stale — run node scripts/generate-theme-design-md.mjs`);
}
const ids = new Set([...files.keys()].map((p) => p.split('/')[0]));
if (existsSync(outputDir)) {
  for (const dir of readdirSync(outputDir)) {
    if (!ids.has(dir)) errors.push(`website/public/themes/${dir} belongs to no theme — run the generator to prune it`);
  }
}

/* ---------- 2. round trip ---------- */

const source = await loadThemeSource();
const designMd = await import(pathToFileURL(join(repoRoot, 'website/src/lib/theme/design-md.ts')).href);
const fonts = await import(pathToFileURL(join(repoRoot, 'website/src/data/google-fonts.generated.ts')).href);
const catalogue = { fonts: fonts.GOOGLE_FONTS, substitutes: fonts.FONT_SUBSTITUTES };

/** The base look's levers: the shipped defaults, as the playground starts. */
const BASE = {
  pill: true,
  radiusScale: 100,
  density: 100,
  elevation: 'default',
  typeScale: 100,
  tracking: 0,
  displayWeight: source.SHIPPED_DISPLAY_WEIGHT,
  headingWeight: source.SHIPPED_HEADING_WEIGHT,
  bodyWeight: source.SHIPPED_BODY_WEIGHT,
};
const faceOf = (label) => (label ? label.replace(/ \(.*\)$/, '') : undefined);

const used = new Set();
for (const [path, content] of files) {
  const id = path.split('/')[0];
  const preset = source.THEME_PRESETS[id];
  const want = preset ?? BASE;
  const got = designMd.readDesignMd(content, catalogue);
  const stated = /^\s+primary: "(#[0-9a-f]{6})"/m.exec(content)?.[1]?.toUpperCase();

  const checks = [
    ['pill', want.pill, got.pill ?? BASE.pill],
    ['radius', want.radiusScale, got.radiusScale ?? BASE.radiusScale],
    ['density', want.density, got.density ?? BASE.density],
    ['elevation', want.elevation, got.elevation ?? BASE.elevation],
    ['type scale', want.typeScale, got.typeScale ?? BASE.typeScale],
    ['tracking', want.tracking, got.tracking ?? BASE.tracking],
    ['display weight', want.displayWeight, got.displayWeight ?? BASE.displayWeight],
    ['heading weight', want.headingWeight, got.headingWeight ?? BASE.headingWeight],
    ['body weight', want.bodyWeight, got.bodyWeight ?? BASE.bodyWeight],
    ['action colour', stated, got.brand?.toUpperCase()],
    ['display colour', want.displayTone ?? 'ink', got.displayTone ?? 'ink'],
    ['heading colour', want.headingTone ?? 'ink', got.headingTone ?? 'ink'],
    ['logo colour', want.logoTone ?? 'action', got.logoTone ?? 'action'],
    ['logo end colour', want.logoEndTone ?? 'matched', got.logoEndTone ?? 'matched'],
  ];
  if (preset) {
    checks.push(['body face', faceOf(preset.fontLabel), got.bodyFont?.family]);
    checks.push([
      'heading face',
      faceOf(preset.headingFontLabel) ?? faceOf(preset.fontLabel),
      got.headingFont?.family ?? got.bodyFont?.family,
    ]);
  }
  for (const [lever, expected, actual] of checks) {
    if (expected === actual) continue;
    const key = lever.replace(/ /g, '');
    if (SANCTIONED_DRIFT[id]?.[lever] || SANCTIONED_DRIFT[id]?.[key]) {
      used.add(`${id}.${lever}`);
      continue;
    }
    errors.push(`${path}: ${lever} reads back as ${actual}, expected ${expected}`);
  }
}
/* ---------- 3. every tone ----------
   No shipped theme sets all five tones, so a synthetic one does: the
   format must carry each of them back. The logo, its end and the two type
   tiers read back as their families; running text reads back as its exact
   colour on the neutral ink step, the importer's deliberate reading. */
{
  const { designMdForPreset } = await import('./generate-theme-design-md.mjs');
  const want = { logo: 'purple', logoEnd: 'orange', display: 'blue', heading: 'red', text: 'teal' };
  const preset = {
    ...source.THEME_PRESETS.mono,
    advanced: undefined,
    logoTone: want.logo,
    logoEndTone: want.logoEnd,
    displayTone: want.display,
    headingTone: want.heading,
    textTone: want.text,
  };
  const file = designMdForPreset({ preset, id: 'synthetic', label: 'Synthetic', presetOverrides: source.presetOverrides });
  const got = designMd.readDesignMd(file, catalogue);
  for (const [lever, expected, actual] of [
    ['logo colour', want.logo, got.logoTone],
    ['logo end colour', want.logoEnd, got.logoEndTone],
    ['display colour', want.display, got.displayTone],
    ['heading colour', want.heading, got.headingTone],
  ]) {
    if (expected !== actual) errors.push(`synthetic all-tone theme: ${lever} reads back as ${actual}, expected ${expected}`);
  }
  const ink = /^\s+ink: "(#[0-9a-f]{6})"/m.exec(file)?.[1]?.toUpperCase();
  if (!ink || got.extraOverrides?.['--primitive-neutral-10']?.toUpperCase() !== ink) {
    errors.push(`synthetic all-tone theme: the toned text colour ${ink} does not land exactly on the ink step`);
  }
}

for (const [id, levers] of Object.entries(SANCTIONED_DRIFT)) {
  for (const lever of Object.keys(levers)) {
    if (!used.has(`${id}.${lever}`)) errors.push(`SANCTIONED_DRIFT.${id}.${lever} is stale: the file now reads back exactly`);
  }
}

if (errors.length > 0) {
  console.error(`✗ Theme DESIGN.md files: ${errors.length} problem(s)\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
console.log(`✓ Theme DESIGN.md files: ${files.size} in sync, each reading back onto its own theme, and a synthetic theme carries all five tones through.`);
