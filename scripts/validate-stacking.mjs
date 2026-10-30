#!/usr/bin/env node
/**
 * Holds every z-index in the library and the site to the stacking layers.
 *
 * Before 2026-10-14 the stack was a set of numbers each component picked
 * (10, 50, 80, 90, 99, 100, 110, 200, 1080…), agreed only by habit, with
 * no single place a reader could see the order. The order now lives in
 * two token sets:
 *
 *   src/tokens/tokens-light.css   --layer-*       the library's layers
 *   website/src/app/globals.css   --layer-site-*  the site's, above them
 *
 * Rules:
 *   - A z-index from -1 to 9 is local order inside one component (a label
 *     over a sliding pill) and needs nothing.
 *   - Anything from 10 up names a layer: a var(--layer-*) reference, or a
 *     calc() stepping off one (a panel one step under its rail).
 *   - A larger number that is still local (a ladder inside a drawn device
 *     frame, a grip inside a card) says so in the comment directly above
 *     the declaration with `ds-allow(stacking): <reason>`, or for a whole
 *     file in its header with `ds-allow-file(stacking): <reason>`.
 *   - Library CSS may reference library layers only; the site may use both.
 *   - Each token set is declared lowest to highest, so the file reads as
 *     the stack it defines.
 *
 *
 * Tooltips sit above every layer: a component that places a tooltip panel
 * against its trigger (it calls useAnchoredPosition and renders
 * role="tooltip", or SegmentedControl's `__label--tip`) must also call
 * useTopLayer (src/behaviors/useTopLayer.ts), which paints the panel in the
 * browser's top layer while it shows, where no z-index can cover it.
 *
 * /foundations/layout renders both sets. Runs in the validate-registry
 * chain and the website's prebuild.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(join(repoRoot, rel), 'utf8').replace(/\r\n/g, '\n');

/** Comments blanked to spaces, so offsets and line numbers survive. */
const blankComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));

const errors = [];

/** Every `--<prefix>…: <int>;` in declared order. */
function ladder(rel, prefix) {
  const source = blankComments(read(rel));
  const out = [...source.matchAll(new RegExp(`(${prefix}[\\w-]*)\\s*:\\s*(-?\\d+)\\s*;`, 'g'))].map((m) => ({
    name: m[1],
    value: Number(m[2]),
  }));
  if (!out.length) errors.push(`${rel}: declares no ${prefix}* layers`);
  // /foundations/layout prints each layer's trailing comment as its
  // description, so a layer without one would render blank.
  const raw = read(rel);
  for (const { name } of out) {
    if (!new RegExp(`${name}\\s*:\\s*-?\\d+\\s*;[ \\t]*/\\*\\s*\\S`).test(raw)) {
      errors.push(`${rel}: ${name} needs a trailing /* comment */ saying what sits on it; /foundations/layout prints it`);
    }
  }
  for (let i = 1; i < out.length; i++) {
    if (out[i].value < out[i - 1].value) {
      errors.push(`${rel}: ${out[i].name} (${out[i].value}) is declared after ${out[i - 1].name} (${out[i - 1].value}); keep the layers lowest to highest`);
    }
  }
  return out;
}

const libraryLayers = ladder('src/tokens/tokens-light.css', '--layer-');
const siteLayers = ladder('website/src/app/globals.css', '--layer-site-');
for (const l of libraryLayers) {
  if (l.name.startsWith('--layer-site-')) errors.push(`src/tokens/tokens-light.css: ${l.name} uses the site's prefix`);
}

const libraryNames = new Set(libraryLayers.map((l) => l.name));
const siteNames = new Set([...libraryNames, ...siteLayers.map((l) => l.name)]);

const walk = (dir) =>
  readdirSync(join(repoRoot, dir), { withFileTypes: true, recursive: true })
    .filter((e) => e.isFile() && e.name.endsWith('.css'))
    .map((e) => relative(repoRoot, join(e.parentPath ?? e.path, e.name)).replace(/\\/g, '/'));

const targets = [
  ...walk('src').map((file) => ({ file, names: libraryNames, scope: 'library' })),
  ...walk('website/src').map((file) => ({ file, names: siteNames, scope: 'site' })),
];

let declarations = 0;
let layered = 0;
let local = 0;
let sanctioned = 0;

for (const { file, names, scope } of targets) {
  const raw = read(file);
  const source = blankComments(raw);
  const fileSanctioned = /ds-allow-file\(stacking\):\s*\S/.test(raw.slice(0, 2000));

  for (const m of source.matchAll(/z-index\s*:\s*([^;}]+)[;}]/g)) {
    declarations += 1;
    const value = m[1].trim();
    const line = raw.slice(0, m.index).split('\n').length;
    const at = `${file}:${line}`;

    if (/^-?\d+$/.test(value)) {
      if (Number(value) < 10) {
        local += 1;
        continue;
      }
      // The comment block(s) directly above this declaration's line.
      const lines = raw.split('\n');
      let above = '';
      for (let i = line - 2; i >= 0; i--) {
        const t = lines[i].trim();
        if (t === '') break;
        if (t.startsWith('/*') || t.startsWith('*') || t.endsWith('*/')) {
          above = t + '\n' + above;
          continue;
        }
        break;
      }
      if (fileSanctioned || /ds-allow\(stacking\):\s*\S/.test(above)) {
        sanctioned += 1;
        continue;
      }
      errors.push(`${at} — z-index ${value} is 10 or more: use a --layer-* token, or say why it is local with ds-allow(stacking): <reason> directly above it`);
      continue;
    }

    const refs = [...value.matchAll(/var\((--layer-[\w-]+)/g)].map((r) => r[1]);
    if (!refs.length) {
      errors.push(`${at} — z-index ${value} names no --layer-* token`);
      continue;
    }
    for (const ref of refs) {
      if (!names.has(ref)) {
        errors.push(`${at} — ${ref} is not a ${scope === 'library' ? 'library layer (library CSS cannot reach the site\'s)' : 'declared layer'}`);
      }
    }
    layered += 1;
  }
}

// Tooltips always paint in the top layer.
let tooltips = 0;
for (const dir of ['src', 'website/src']) {
  for (const e of readdirSync(join(repoRoot, dir), { withFileTypes: true, recursive: true })) {
    if (!e.isFile() || !/\.tsx?$/.test(e.name) || /\.stories\./.test(e.name)) continue;
    const file = relative(repoRoot, join(e.parentPath ?? e.path, e.name)).replace(/\\/g, '/');
    const source = read(file);
    if (!/\buseAnchoredPosition\(/.test(source) || !/role="tooltip"|__label--tip/.test(source)) continue;
    tooltips += 1;
    if (!/\buseTopLayer\(/.test(source)) {
      errors.push(`${file} — places a tooltip without useTopLayer: tooltips always paint in the top layer (src/behaviors/useTopLayer.ts)`);
    }
  }
}

if (errors.length) {
  console.error('✗ Stacking:\n' + errors.map((e) => `    - ${e}`).join('\n'));
  process.exit(1);
}

console.log(
  `✓ Stacking — ${declarations} z-index declarations: ${layered} on ${libraryLayers.length} library + ${siteLayers.length} site layers, ` +
    `${local} local, ${sanctioned} sanctioned in place; ${tooltips} tooltips in the top layer.`
);
