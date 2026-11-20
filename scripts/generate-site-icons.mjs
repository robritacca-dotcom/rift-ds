#!/usr/bin/env node
/**
 * generate-site-icons.mjs
 *
 * Writes the website's own cut of the icon font: only the icons the site
 * and the library draw, from the full Material Symbols file the package
 * ships. The full font holds every icon Google publishes, and a first
 * visit to any page downloaded all of it to draw a few dozen glyphs; the
 * cut is a small fraction of the size and draws the same pixels, because it
 * is the same outlines with the unused ones removed.
 *
 * Two files, both generated:
 *   - website/src/fonts/material-symbols-site.woff2, the cut font, which
 *     website/src/app/globals.css loads ahead of the full one;
 *   - website/src/data/site-icons.generated.json, the icons it holds and
 *     the fingerprint of everything it was cut from.
 *
 * The package is untouched: a consumer may draw any icon, so
 * src/fonts/ keeps the full font and the published API does not narrow.
 *
 * Which icons: every single-word string literal, and every single word
 * that is the whole text of an element, anywhere in the library and site
 * source, that the full font draws as one glyph. That is deliberately
 * generous. A word that happens to be an icon name is included whether or
 * not it is drawn, so a name written as a literal can never be missed;
 * the cost is a few kilobytes of unused outlines. A name assembled at run
 * time from parts is the one case this cannot see, and
 * scripts/validate-site-icons.mjs reads the built pages for it.
 *
 * What is kept of the font: all four axes, whole, so weight, fill, grade
 * and optical size behave exactly as before. Narrowing an axis to the
 * stretch the site uses was tried and rejected: cutting grade to the dark
 * theme's correction and the default saved a quarter of the file and moved
 * pixels on icons in dark mode (scripts/compare-screens.mjs showed it),
 * because the outlines are re-fitted to the new range. Removing whole
 * glyphs moves nothing, and that is all this does.
 *
 * Cutting takes seconds and the icon set rarely changes, so the result is
 * reused: the manifest records a fingerprint of the full font, the icon
 * list and the tool versions, and of the cut itself.
 * While all of those match what is on disk, nothing is rebuilt; a hand
 * edit to either file breaks a fingerprint and is rebuilt over.
 *
 * Deterministic and offline (HarfBuzz and the woff2 codec both run as
 * WebAssembly, pinned to exact versions in package.json), so it belongs in
 * the generator half of the validate-registry chain, and
 * validate-generated-files.mjs holds the disk to it.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { display, fromRoot, read, readJson, walk } from './lib/fs.mjs';
import { isEntryScript } from './lib/report.mjs';

const require = createRequire(import.meta.url);

const FULL_FONT = fromRoot('src', 'fonts', 'MaterialSymbolsRounded-VariableFont_FILL,GRAD,opsz,wght.woff2');
export const SITE_FONT = fromRoot('website', 'src', 'fonts', 'material-symbols-site.woff2');
export const MANIFEST = fromRoot('website', 'src', 'data', 'site-icons.generated.json');
const REGENERATE = 'node scripts/generate-site-icons.mjs';

/** The characters an icon name is typed in; their glyphs stay so a ligature has its parts. */
const NAME_CHARACTERS = 'abcdefghijklmnopqrstuvwxyz0123456789_';
/** hb_subset_flags_t: do not pull in every glyph a kept glyph could turn into. */
const NO_LAYOUT_CLOSURE = 0x200;
/** hb_memory_mode_t: the blob's bytes outlive it and are never written. */
const MEMORY_MODE_WRITABLE = 2;

const sha = (data) => createHash('sha256').update(data).digest('hex');
/** A tool's version as package.json pins it: exact, so every machine cuts the same bytes. */
const version = (name) => readJson(fromRoot('package.json')).devDependencies[name];

/** Source the site renders: the library and the site, without stories, tests and generated data. */
const isSource = (name) =>
  /\.(tsx?|css|json|mdx?)$/.test(name) && !/\.(stories|test)\./.test(name) && !/\.generated\./.test(name);
const sourceFiles = () =>
  [fromRoot('src'), fromRoot('website', 'src')].flatMap((dir) => walk(dir, isSource, (name) => name === 'stories'));
/** The skills, whose frontmatter names the icon each card on /skills draws. */
const skillFiles = () => walk(fromRoot('.claude', 'skills'), (name) => name === 'SKILL.md');

/** Every word in the source that could be an icon name. */
function scanSource() {
  const words = new Set();
  for (const file of sourceFiles()) {
    const text = read(file);
    for (const match of text.matchAll(/(['"`])([a-z][a-z0-9_]*)\1/g)) words.add(match[2]);
    for (const match of text.matchAll(/>\s*([a-z][a-z0-9_]*)\s*</g)) words.add(match[1]);
  }
  for (const file of [...skillFiles(), ...walk(fromRoot('website', 'src'), (name) => name.endsWith('.md'))]) {
    for (const match of read(file).matchAll(/^icon:\s*['"]?([a-z][a-z0-9_]*)['"]?\s*$/gm)) words.add(match[1]);
  }
  return words;
}

let harfbuzz;
const loadHarfbuzz = async () => (harfbuzz ??= await import('harfbuzzjs'));

/** A function from text to the glyph ids a font draws it with. */
async function shaperFor(sfnt) {
  const hb = await loadHarfbuzz();
  const font = new hb.Font(new hb.Face(new hb.Blob(sfnt)));
  return (text) => {
    const buffer = new hb.Buffer();
    buffer.addText(text);
    buffer.guessSegmentProperties();
    hb.shape(font, buffer);
    return buffer.getGlyphInfos().map((glyph) => glyph.codepoint);
  };
}

/** The full font as an uncompressed sfnt, and the icons the source names: name → glyph id. */
async function readIcons() {
  const words = scanSource();
  const woff2 = readFileSync(FULL_FONT);
  const sfnt = Buffer.from(await require('wawoff2').decompress(woff2));
  const shape = await shaperFor(sfnt);
  const icons = new Map();
  for (const word of [...words].sort()) {
    if (word.length < 2) continue;
    const glyphs = shape(word);
    if (glyphs.length === 1) icons.set(word, glyphs[0]);
  }
  return { fullSha: sha(woff2), sfnt, icons };
}

/** The cut font, as woff2: the named glyphs and the letters their names are typed in. */
async function cut(sfnt, icons) {
  const module = await WebAssembly.instantiate(readFileSync(require.resolve('harfbuzzjs/dist/harfbuzz-subset.wasm')), {});
  const hb = module.instance.exports;
  hb._initialize?.();
  const data = hb.malloc(sfnt.length);
  new Uint8Array(hb.memory.buffer).set(sfnt, data);
  const blob = hb.hb_blob_create(data, sfnt.length, MEMORY_MODE_WRITABLE, 0, 0);
  const face = hb.hb_face_create(blob, 0);
  const input = hb.hb_subset_input_create_or_fail();
  const glyphs = hb.hb_subset_input_glyph_set(input);
  for (const glyph of icons.values()) hb.hb_set_add(glyphs, glyph);
  const characters = hb.hb_subset_input_unicode_set(input);
  for (const character of NAME_CHARACTERS) hb.hb_set_add(characters, character.codePointAt(0));
  hb.hb_subset_input_set_flags(input, hb.hb_subset_input_get_flags(input) | NO_LAYOUT_CLOSURE);
  const result = hb.hb_subset_or_fail(face, input);
  if (!result) throw new Error('HarfBuzz could not cut the icon font.');
  const out = hb.hb_face_reference_blob(result);
  const small = Buffer.from(new Uint8Array(hb.memory.buffer, hb.hb_blob_get_data(out, 0), hb.hb_blob_get_length(out)));

  // The cut must draw what the full font drew: each name one glyph, still.
  const shape = await shaperFor(small);
  const broken = [...icons.keys()].filter((name) => shape(name).length !== 1);
  if (broken.length > 0) {
    throw new Error(`the cut icon font no longer draws ${broken.slice(0, 5).join(', ')} as one glyph each.`);
  }
  return Buffer.from(await require('wawoff2').compress(small));
}

const manifestText = (fields) =>
  `${JSON.stringify(
    {
      $comment:
        'The icons in the website\'s cut of the icon font, and the fingerprints of what it was cut from. Written by scripts/generate-site-icons.mjs; never edited by hand.',
      ...fields,
    },
    null,
    2
  )}\n`;

/** Both files' contents, reusing the cut on disk while its fingerprints still match. */
async function build() {
  const { fullSha, sfnt, icons } = await readIcons();
  const names = [...icons.keys()];
  const from = sha(JSON.stringify([fullSha, names, version('harfbuzzjs'), version('wawoff2'), NAME_CHARACTERS]));
  if (existsSync(MANIFEST) && existsSync(SITE_FONT)) {
    const onDisk = readJson(MANIFEST);
    const font = readFileSync(SITE_FONT);
    if (onDisk.from === from && onDisk.font === sha(font)) {
      return { font, manifest: manifestText({ from, font: onDisk.font, icons: names }), reused: true };
    }
  }
  const font = await cut(sfnt, icons);
  return { font, manifest: manifestText({ from, font: sha(font), icons: names }), reused: false };
}

/** What this generator writes, for the freshness check (scripts/lib/fresh.mjs). */
export const surface = async () => {
  const { font, manifest } = await build();
  return {
    regenerate: REGENERATE,
    files: [
      [SITE_FONT, font],
      [MANIFEST, manifest],
    ],
  };
};

/** Write the generated files. The chain runner calls this; run alone, the script does. */
export async function main() {
  const { font, manifest, reused } = await build();
  mkdirSync(dirname(SITE_FONT), { recursive: true });
  if (!reused) writeFileSync(SITE_FONT, font);
  writeFileSync(MANIFEST, manifest);
  const count = JSON.parse(manifest).icons.length;
  console.log(
    `✓ ${reused ? 'Site icon font is current' : `Cut ${display(SITE_FONT)}`}: ${count} icons, ${font.length} bytes.`
  );
}

if (isEntryScript(import.meta.url)) await main();
