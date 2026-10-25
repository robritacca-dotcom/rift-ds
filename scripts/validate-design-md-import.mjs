#!/usr/bin/env node
/**
 * validate-design-md-import.mjs
 *
 * Holds the playground's DESIGN.md importer (website/src/lib/theme/design-md.ts)
 * to the rules it reads a file by. A visitor drops a third-party brand file
 * and takes away a theme; each rule below was written against a set of
 * real ones (fifteen brand analyses read on 2026-10-22) where the engine
 * had read the file wrong, so the fixtures in scripts/fixtures/design-md/
 * are fictional brands that each carry one pattern from that set (the real files stay outside the repo):
 *
 *   black-button-named-primary  the action fill is the primary button's,
 *                               found by any button name, never `primary`
 *                               when the file reserves that for identity
 *   tinted-near-black           a key the eye reads as black rides the
 *                               neutral scale and takes a preset's dark
 *                               partner, not a chromatic ramp rebuilt
 *                               around it
 *   px-tracking                 tracking stated in px per role is read
 *                               from the display tier and the body, and
 *                               the lever sits where both err least
 *   zero-tracking               a zero display tracking is the format's
 *                               default, not a request to close rift's
 *                               open display tier
 *   capsule-input               a button corner past half its height is a
 *                               pill; a capsule input does not feed the
 *                               scale, the cards do
 *   square-system               a stated 0px corner fits at 0%
 *   both-modes                  a page named for each mode anchors both
 *                               modes exactly, with no inversion
 *   serif-heading               a prose stand-in is read per role, and
 *                               outranks a platform face in the stack
 *   soft-depth                  one faint shadow tier is rift's soft pair
 *   pastel-accents              the accent band is the shipped sextet's
 *                               own envelope, so pastels keep their
 *                               lightness
 *   body-weight                 the body style's weight reaches the body
 *                               weight lever
 *   uppercase-and-mono          casing, a monospace face, an ink-outlined
 *                               secondary and a second action colour are
 *                               reported as traits rift does not take
 *
 * Every report note and trait line is also held to content-design.md's em
 * dash ban, since the export ships them, and the three shipped samples
 * (website/public/samples) must still read with their action colour.
 *
 * Belongs in the validate-registry chain (and the website prebuild): it
 * loads TypeScript the way the preset stylesheet generator does.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadThemeSource } from './generate-preset-stylesheets.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(repoRoot, path), 'utf8');

await loadThemeSource();
const designMd = await import(pathToFileURL(join(repoRoot, 'website/src/lib/theme/design-md.ts')).href);
const fonts = await import(pathToFileURL(join(repoRoot, 'website/src/data/google-fonts.generated.ts')).href);
const overrides = await import(pathToFileURL(join(repoRoot, 'website/src/lib/theme/theme-overrides.ts')).href);
const catalogue = { fonts: fonts.GOOGLE_FONTS, substitutes: fonts.FONT_SUBSTITUTES };

const errors = [];
const fixturesDir = 'scripts/fixtures/design-md';
const fixture = (name) => designMd.readDesignMd(read(`${fixturesDir}/${name}.md`), catalogue);
const row = (theme, lever) => theme.report.find((r) => r.lever === lever);
const expect = (name, condition, message) => {
  if (!condition) errors.push(`${name}: ${message}`);
};
const lightnessOf = (hex) => overrides.rgbToHsl(overrides.hexToRgb(hex))[2];

/* ---------- the rules, one fixture each ---------- */

{
  const t = fixture('black-button-named-primary');
  expect('black-button-named-primary', t.brand === '#000000', `action colour is ${t.brand}, expected the button-pill-dark fill #000000`);
  expect('black-button-named-primary', /button-pill-dark/.test(row(t, 'Action colour')?.note ?? ''), 'the action note does not name the button it read');
  expect('black-button-named-primary', t.brandDark !== undefined, 'a black key has no dark partner');
}

{
  const t = fixture('tinted-near-black');
  expect('tinted-near-black', /neutral ramp/.test(row(t, 'Action colour')?.note ?? ''), `#181D26 did not ride the neutral ramp: ${row(t, 'Action colour')?.note}`);
  expect('tinted-near-black', t.brandDark === '#D6D6D6', `dark partner is ${t.brandDark}, expected the nearest preset's #D6D6D6`);
  expect('tinted-near-black', !Object.keys(t.extraOverrides ?? {}).some((k) => k.startsWith('--primitive-blue-')), 'the blue ramp was rebuilt around a near-black key');
}

{
  const t = fixture('px-tracking');
  expect('px-tracking', t.tracking === -2, `tracking is ${t.tracking}, expected -2 (display -2% in px, body 0, mean against rift's +2% display)`);
  expect('px-tracking', /display -2\.0%/.test(row(t, 'Tracking')?.note ?? ''), 'the tracking note does not state the display sample');
}

{
  const t = fixture('zero-tracking');
  expect('zero-tracking', t.tracking === 0, `tracking is ${t.tracking}, expected 0 when every style states zero`);
  expect('zero-tracking', t.pill === true, 'a 540px button corner is not read as a pill');
}

{
  const t = fixture('capsule-input');
  expect('capsule-input', t.pill === true, '18px on a pill-padded button is not read as a pill');
  expect('capsule-input', t.radiusScale === 40, `radius is ${t.radiusScale}%, expected 40% from the 10px card (the 22px capsule input left out)`);
  expect('capsule-input', /card corner/.test(row(t, 'Radius')?.note ?? '') && !/input corner/.test(row(t, 'Radius')?.note ?? ''), 'the radius note does not say the scale came from the cards alone');
}

{
  const t = fixture('square-system');
  expect('square-system', t.radiusScale === 0, `radius is ${t.radiusScale}%, expected 0% from stated 0px corners`);
  expect('square-system', t.pill === false, '0px on a 48px button reads as a pill');
  expect('square-system', t.bodyWeight === 300, `body weight is ${t.bodyWeight}, expected 300`);
  expect('square-system', t.elevation === 'flat', `elevation is ${t.elevation}, expected flat`);
}

{
  const t = fixture('both-modes');
  expect('both-modes', /both modes/.test(row(t, 'Neutral scale')?.note ?? ''), `both pages were not read: ${row(t, 'Neutral scale')?.note}`);
  expect('both-modes', t.extraOverridesDark !== undefined && Object.keys(t.extraOverridesDark).length > 0, 'dark mode has no extras of its own');
  expect('both-modes', t.brand === '#FCD535', `light action colour is ${t.brand}, expected the stated #FCD535 kept exactly`);
  expect('both-modes', t.bodyFont?.family === 'Inter', `body face is ${t.bodyFont?.family}, expected the prose stand-in Inter over the system stack`);
}

{
  const t = fixture('serif-heading');
  expect('serif-heading', t.headingFont?.family === 'Cormorant Garamond', `heading face is ${t.headingFont?.family}, expected Cormorant Garamond from the prose`);
  expect('serif-heading', t.bodyFont?.family === 'Inter', `body face is ${t.bodyFont?.family}, expected Inter (not the stack's Roboto)`);
}

{
  const t = fixture('soft-depth');
  expect('soft-depth', t.elevation === 'soft', `elevation is ${t.elevation}, expected soft for one faint tier`);
}

{
  const t = fixture('pastel-accents');
  const lightest = Math.max(...Object.values(t.accents ?? {}).map(lightnessOf));
  const shippedCeiling = Math.max(...Object.values(overrides.SHIPPED_ACCENTS).map(lightnessOf));
  expect('pastel-accents', t.accents !== undefined, 'six pastel blocks did not fill the accents');
  expect('pastel-accents', lightest > 0.66 && lightest <= shippedCeiling + 1e-6, `the lightest accent is L ${lightest.toFixed(2)}; expected a pastel kept up to the shipped ceiling L ${shippedCeiling.toFixed(2)}`);
  expect('pastel-accents', t.pill === true, 'a 50px pill corner is not read as a pill');
  expect('pastel-accents', t.displayWeight === 300 && t.bodyWeight === 300, 'fine variable weights did not snap to the lever steps');
}

{
  const t = fixture('body-weight');
  expect('body-weight', t.bodyWeight === 600, `body weight is ${t.bodyWeight}, expected 600`);
  expect('body-weight', row(t, 'Body weight')?.status === 'matched', 'a stated 600 body weight is not reported as matched');
}

{
  const t = fixture('uppercase-and-mono');
  const kinds = t.traits.map((trait) => trait.kind);
  for (const kind of ['uppercase', 'mono', 'secondary', 'second-action']) {
    expect('uppercase-and-mono', kinds.includes(kind), `the ${kind} trait was not detected (got ${kinds.join(', ') || 'none'})`);
  }
  expect('uppercase-and-mono', t.traits.some((trait) => trait.text.includes('#0075FF')), 'the second-action trait does not name the colour');
}

{
  const t = fixture('coloured-headlines');
  expect('coloured-headlines', t.displayTone === 'yellow', `display tone is ${t.displayTone}, expected yellow from the mustard display key`);
  expect('coloured-headlines', t.headingTone === undefined, `heading tone is ${t.headingTone}, expected the ink from a grey heading key`);
  expect('coloured-headlines', row(t, 'Heading colour')?.status === 'matched', 'a grey heading key is not reported as the ink');
  expect('coloured-headlines', t.brand?.toUpperCase() === '#1A1A1A', `action colour is ${t.brand}; a coloured headline must not become the action colour`);
}

/* ---------- the theme's name, from the file's title ---------- */

for (const [title, name] of [
  ['Figma design analysis', 'Figma'],
  ['1win Analysis', '1win'],
  ['Design System Inspired by Spotify', 'Spotify'],
  ['Al Jazeera Analysis', 'Al Jazeera'],
]) {
  const got = designMd.brandNameOf(title);
  expect('brandNameOf', got === name, `"${title}" names the theme "${got}", expected "${name}"`);
}

/* The dark partner a neutral key takes is a preset's hex naming a neutral
   step; when the file restates that step, the report names the file's
   grey, the one theme.css resolves to. */
{
  const t = designMd.readDesignMd(read('website/public/samples/meta/DESIGN.md'), catalogue);
  const step02 = t.extraOverrides?.['--primitive-neutral-02'];
  const note = row(t, 'Action colour')?.note ?? '';
  expect('sample meta', step02 !== undefined && note.includes(`${step02} in dark mode`), `the action note says "${note.split('; ').pop()}", expected the restated neutral-02 ${step02}`);
}

/* ---------- every fixture and sample: shipped copy, and still readable ---------- */

/* The light-mode action key each shipped sample reads to (spotify is a
   dark-first file, so its light key is the step adjusted for a light page). */
const samples = { apple: '#0066CC', meta: '#000000', spotify: '#117835' };
const all = [
  ...readdirSync(join(repoRoot, fixturesDir)).filter((f) => f.endsWith('.md')).map((f) => [`fixture ${f}`, `${fixturesDir}/${f}`]),
  ...Object.keys(samples).map((id) => [`sample ${id}`, `website/public/samples/${id}/DESIGN.md`]),
];
for (const [label, path] of all) {
  const t = designMd.readDesignMd(read(path), catalogue);
  for (const r of t.report) {
    if (/—/.test(r.note) || /—/.test(r.value)) errors.push(`${label}: the ${r.lever} report row carries an em dash, which content-design.md bans in shipped copy`);
  }
  for (const trait of t.traits) {
    if (/—/.test(trait.text)) errors.push(`${label}: the ${trait.kind} trait carries an em dash`);
  }
  const sample = /^sample (\w+)$/.exec(label)?.[1];
  if (sample && t.brand !== samples[sample]) {
    errors.push(`${label}: action colour is ${t.brand}, expected ${samples[sample]}; a shipped example changed what it reads`);
  }
}

if (errors.length > 0) {
  console.error('✗ DESIGN.md import validation failed:');
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}
console.log(`✓ DESIGN.md import: ${all.length - Object.keys(samples).length} fixtures read by their rule, ${Object.keys(samples).length} shipped samples keep their action colour, every report line free of em dashes`);
