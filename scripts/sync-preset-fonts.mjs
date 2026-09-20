#!/usr/bin/env node
/**
 * sync-preset-fonts.mjs
 *
 * Downloads the typefaces the shipped theme presets declare and writes
 * them into src/fonts/presets/ as self-hosted woff2 files plus a
 * manifest.json describing every face (family, style, weight,
 * unicode-range, file). generate-preset-stylesheets.mjs reads the
 * manifest to emit @font-face blocks into each preset's stylesheet, so
 * `import presets.css` + one data-brand attribute is the complete look
 * — offline, with no Google request at runtime, for package consumers
 * and this site alike.
 *
 * Like sync-worldmap-land.mjs this is a DELIBERATE network fetch, run by
 * hand — never part of the build. Run it again when a preset gains a
 * face the manifest lacks (the stylesheet generator fails loudly until
 * you do, naming this script):
 *
 *   node scripts/sync-preset-fonts.mjs
 *
 * FAMILIES below is the authoritative download spec: family name (as the
 * FONT_OPTIONS `family` stacks spell it) -> the css2 axis param to
 * request. Variable ranges where Google ships a variable font; explicit
 * weight lists where the family is static-only (css2 rejects a range
 * with a 400 there). Latin and latin-ext subsets only — the subset
 * split, weights and unicode-ranges are parsed straight out of Google's
 * css2 response, so this script invents nothing.
 *
 * Every family here is licensed under the SIL Open Font License 1.1,
 * which permits exactly this redistribution; the manifest records the
 * license per face.
 */
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = join(repoRoot, 'src', 'fonts', 'presets');

/** family name -> css2 axis param (variable range, or static weight list). */
const FAMILIES = {
  'DM Sans': 'DM+Sans:wght@300..700',
  Fraunces: 'Fraunces:opsz,wght@9..144,300..700',
  'IBM Plex Mono': 'IBM+Plex+Mono:wght@300;400;500;600;700',
  'IBM Plex Sans': 'IBM+Plex+Sans:wght@300..700',
  Inter: 'Inter:wght@300..700',
  Lora: 'Lora:wght@400..700',
  Montserrat: 'Montserrat:wght@300..700',
  Poppins: 'Poppins:wght@300;400;500;600;700',
  'Source Sans 3': 'Source+Sans+3:wght@300..700',
  'Space Grotesk': 'Space+Grotesk:wght@300..700',
  'Work Sans': 'Work+Sans:wght@300..700',
};

const SUBSETS = new Set(['latin', 'latin-ext']);

/* A modern-browser UA is load-bearing: css2 serves woff2 (and variable
   files) only to clients that advertise support. */
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

const slug = (family) => family.toLowerCase().replace(/[^a-z0-9]+/g, '-');

/** Parse css2 output into faces: Google precedes each @font-face with a
    subset comment, so pair them up. */
function parseCss2(css) {
  const faces = [];
  const re = /\/\* ([a-z-]+) \*\/\s*@font-face \{([\s\S]*?)\}/g;
  for (const match of css.matchAll(re)) {
    const [, subset, body] = match;
    const prop = (name) => body.match(new RegExp(`${name}: ([^;]+);`))?.[1];
    faces.push({
      subset,
      style: prop('font-style'),
      weight: prop('font-weight'),
      unicodeRange: prop('unicode-range'),
      url: body.match(/src: url\((\S+?)\) format\('woff2'\)/)?.[1],
    });
  }
  return faces;
}

const manifest = [];
const files = new Map();

for (const [family, param] of Object.entries(FAMILIES)) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${param}&display=swap`;
  const res = await fetch(cssUrl, { headers: { 'user-agent': UA } });
  if (!res.ok) {
    throw new Error(`css2 refused ${family} (${res.status}) — check the axis param: ${param}`);
  }
  const faces = parseCss2(await res.text()).filter((f) => SUBSETS.has(f.subset));
  if (faces.length === 0) {
    throw new Error(`css2 returned no latin faces for ${family} — response format changed?`);
  }
  for (const face of faces) {
    if (!face.url || !face.weight || !face.unicodeRange) {
      throw new Error(`Unparseable @font-face for ${family} — response format changed?`);
    }
    const fontRes = await fetch(face.url, { headers: { 'user-agent': UA } });
    if (!fontRes.ok) throw new Error(`Font download failed for ${family}: ${face.url}`);
    const file = `${slug(family)}-${face.weight.replace(/\s+/g, '-')}-${face.subset}.woff2`;
    files.set(file, Buffer.from(await fontRes.arrayBuffer()));
    manifest.push({
      family,
      style: face.style ?? 'normal',
      weight: face.weight,
      subset: face.subset,
      unicodeRange: face.unicodeRange,
      file,
      license: 'OFL-1.1',
    });
  }
  console.log(`✓ ${family} — ${faces.length} face(s).`);
}

/* Deterministic order, so reruns with unchanged upstream fonts produce
   an identical manifest. */
manifest.sort((a, b) =>
  a.family.localeCompare(b.family) ||
  a.subset.localeCompare(b.subset) ||
  a.weight.localeCompare(b.weight)
);

mkdirSync(outputDir, { recursive: true });
for (const name of readdirSync(outputDir)) {
  if (!files.has(name) && name !== 'manifest.json') rmSync(join(outputDir, name));
}
for (const [name, buffer] of files) writeFileSync(join(outputDir, name), buffer);
writeFileSync(
  join(outputDir, 'manifest.json'),
  JSON.stringify({ generatedBy: 'scripts/sync-preset-fonts.mjs', faces: manifest }, null, 2) + '\n'
);

const totalKb = Math.round([...files.values()].reduce((n, b) => n + b.length, 0) / 1024);
console.log(`✓ ${files.size} woff2 files (${totalKb} KB) + manifest.json written to src/fonts/presets/.`);
