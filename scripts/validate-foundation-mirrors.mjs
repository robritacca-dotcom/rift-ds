#!/usr/bin/env node
/**
 * validate-foundation-mirrors.mjs
 *
 * Holds the token values the foundations pages TYPE to the token CSS that
 * owns them. Those pages print a value beside every swatch (a hex, a
 * duration, a shadow, a type size) so a reader can see what a token resolves
 * to, and each printed value is a hand mirror: retune the token and the swatch
 * itself follows, because it renders the live custom property, while the
 * caption beside it goes on stating the old number. The 2026-10-07 drift
 * audit found every one of them correct and nothing holding them there.
 *
 * validate-theme-mirrors.mjs already guards /foundations/spatial the same
 * way; this script covers the pages it does not:
 *
 *   1. /foundations/motion — every duration and easing row's value equals
 *      its token in tokens-motion.css, and every duration and easing token
 *      has a row (both directions).
 *   2. /foundations/elevation — each shadow row's light and dark value
 *      equals the token in tokens-light.css / tokens-dark.css, and every
 *      shadow token has a row (both directions).
 *   3. /foundations/colour-primitives — every swatch's hex equals its
 *      primitive in tokens-primitives.css, and its RGB caption agrees with
 *      that hex. One direction: the page shows opaque ramps and leaves the
 *      alpha variants out by design, so a primitive without a swatch is not
 *      an error here.
 *   4. /foundations/colour-mode — every semantic swatch's per-theme
 *      primitive name and value equal what the token's var() chain resolves
 *      to in that theme. (Presence, both directions, is
 *      validate-website-surfaces.mjs's check; this one holds the captions.)
 *   5. /foundations/typography — every style row's size, weight, line-height
 *      and letter-spacing equals its --font-<style>-* bundle resolved through
 *      tokens-typography.css, including the 768px step-down a row declares.
 *
 * All of it is the base theme's values, which is what those pages document.
 *
 * Runs in the validate-registry chain: it reads source files only.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
// Normalize CRLF so Windows checkouts validate identically to CI.
const read = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

const tokenFile = (name) => read(join(repoRoot, 'src', 'tokens', name));
const pageFile = (slug) => read(join(repoRoot, 'website', 'src', 'app', 'foundations', slug, 'page.tsx'));
const pageRel = (slug) => `website/src/app/foundations/${slug}/page.tsx`;

const errors = [];
const summaries = [];

/* ------------------------------------------------------------------ */
/* CSS reading                                                          */
/* ------------------------------------------------------------------ */

const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

/**
 * Split a stylesheet into the declarations outside any at-rule and those
 * inside each @media block, keyed by the block's prelude. The token files
 * nest no deeper than `@media { :root { … } }`.
 */
function parseCss(css) {
  const base = new Map();
  const media = new Map();
  const text = stripComments(css);
  let depth = 0;
  let current = null; // the @media prelude we are inside, if any
  let mediaDepth = -1;
  let buffer = '';
  const flush = (target) => {
    for (const m of buffer.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) target.set(m[1], m[2].trim());
    buffer = '';
  };
  let prelude = '';
  for (const ch of text) {
    if (ch === '{') {
      if (prelude.trim().startsWith('@media') && current === null) {
        current = prelude.trim().replace(/\s+/g, ' ');
        mediaDepth = depth;
        if (!media.has(current)) media.set(current, new Map());
      }
      depth++;
      prelude = '';
      buffer = '';
    } else if (ch === '}') {
      flush(current === null ? base : media.get(current));
      depth--;
      if (current !== null && depth === mediaDepth) {
        current = null;
        mediaDepth = -1;
      }
      prelude = '';
    } else {
      prelude += ch;
      buffer += ch;
    }
  }
  return { base, media };
}

const primitives = parseCss(tokenFile('tokens-primitives.css')).base;
const light = parseCss(tokenFile('tokens-light.css')).base;
const dark = parseCss(tokenFile('tokens-dark.css')).base;
const typography = parseCss(tokenFile('tokens-typography.css'));
const motion = parseCss(tokenFile('tokens-motion.css')).base;

/** Follow var() references until a literal, returning the last name passed through. */
function resolve(name, scopes) {
  let current = name;
  let lastName = name;
  for (let hops = 0; hops < 12; hops++) {
    const value = scopes.map((s) => s.get(current)).find((v) => v !== undefined);
    if (value === undefined) return { name: lastName, value: undefined };
    const ref = value.match(/^var\(\s*(--[a-z0-9-]+)\s*\)$/i);
    if (!ref) return { name: current, value };
    lastName = ref[1];
    current = ref[1];
  }
  return { name: lastName, value: undefined };
}

const squash = (value) => value.replace(/\s+/g, '').toLowerCase();
const hexToRgbCaption = (hex) => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)).join(' / ');
};

/* ------------------------------------------------------------------ */
/* 1. /foundations/motion                                               */
/* ------------------------------------------------------------------ */
{
  const rel = pageRel('motion');
  const source = pageFile('motion');
  const rows = [...source.matchAll(/token:\s*"(--motion-[a-z0-9-]+)",\s*value:\s*"([^"]*)"/g)];
  if (!rows.length) errors.push(`${rel}: parsed no token/value rows — the motion guard needs them`);
  const seen = new Set();
  for (const [, token, value] of rows) {
    seen.add(token);
    const actual = motion.get(token);
    if (actual === undefined) errors.push(`${rel}: row names ${token}, which tokens-motion.css does not define`);
    else if (squash(actual) !== squash(value)) errors.push(`${rel}: ${token} is captioned "${value}" but tokens-motion.css sets ${actual}`);
  }
  for (const token of motion.keys()) {
    if (/^--motion-(duration|ease)-/.test(token) && !seen.has(token)) {
      errors.push(`${rel}: tokens-motion.css defines ${token}, but the page has no row for it`);
    }
  }
  summaries.push(`motion ${rows.length} rows`);
}

/* ------------------------------------------------------------------ */
/* 2. /foundations/elevation                                            */
/* ------------------------------------------------------------------ */
{
  const rel = pageRel('elevation');
  const source = pageFile('elevation');
  const rows = [...source.matchAll(/token:\s*"(--shadow-[a-z0-9-]+)",[\s\S]*?light:\s*"([^"]*)",\s*dark:\s*"([^"]*)"/g)];
  if (!rows.length) errors.push(`${rel}: parsed no shadow rows — the elevation guard needs them`);
  const seen = new Set();
  for (const [, token, lightValue, darkValue] of rows) {
    seen.add(token);
    for (const [theme, scope, value] of [['light', light, lightValue], ['dark', dark, darkValue]]) {
      const actual = scope.get(token);
      if (actual === undefined) errors.push(`${rel}: row names ${token}, which tokens-${theme}.css does not define`);
      else if (squash(actual) !== squash(value)) errors.push(`${rel}: ${token} ${theme} is captioned "${value}" but tokens-${theme}.css sets ${actual}`);
    }
  }
  for (const token of light.keys()) {
    if (token.startsWith('--shadow-') && !seen.has(token)) errors.push(`${rel}: tokens-light.css defines ${token}, but the page has no row for it`);
  }
  summaries.push(`elevation ${rows.length} shadows × 2 themes`);
}

/* ------------------------------------------------------------------ */
/* 3. /foundations/colour-primitives                                    */
/* ------------------------------------------------------------------ */
{
  const rel = pageRel('colour-primitives');
  const source = pageFile('colour-primitives');
  const rows = [...source.matchAll(/cssVar:\s*"(--primitive-[a-z0-9-]+)",\s*hex:\s*"([^"]*)",\s*rgb:\s*"([^"]*)"/g)];
  if (!rows.length) errors.push(`${rel}: parsed no swatch rows — the primitives guard needs them`);
  for (const [, token, hex, rgb] of rows) {
    const actual = primitives.get(token);
    if (actual === undefined) errors.push(`${rel}: swatch names ${token}, which tokens-primitives.css does not define`);
    else if (squash(actual) !== squash(hex)) errors.push(`${rel}: ${token} is captioned ${hex} but tokens-primitives.css sets ${actual}`);
    else if (/^#[0-9a-f]{3,6}$/i.test(hex) && hexToRgbCaption(hex) !== rgb.trim()) {
      errors.push(`${rel}: ${token} is ${hex}, which is "${hexToRgbCaption(hex)}", but its RGB caption reads "${rgb}"`);
    }
  }
  summaries.push(`${rows.length} primitive swatches`);
}

/* ------------------------------------------------------------------ */
/* 4. /foundations/colour-mode                                          */
/* ------------------------------------------------------------------ */
{
  const rel = pageRel('colour-mode');
  const source = pageFile('colour-mode');
  // The page's display grammar for a primitive: `--teal--05--` is
  // --primitive-teal-05, `--neutral--09-a80--` is --primitive-neutral-09-a80.
  const toPrimitive = (display) => `--primitive-${display.replace(/^--|--$/g, '').replace(/--/g, '-')}`;
  const cell = String.raw`\{\s*primitive:\s*"([^"]*)",\s*hex:\s*"([^"]*)",\s*rgb:\s*"([^"]*)"\s*\}`;
  const rows = [...source.matchAll(new RegExp(String.raw`(?:cssVar|bgVar):\s*"(--color-[a-z0-9-]+)",(?:\s*borderVar:\s*"[^"]*",)?\s*dark:\s*${cell},\s*light:\s*${cell}`, 'g'))];
  if (!rows.length) errors.push(`${rel}: parsed no swatch rows — the colour-mode guard needs them`);
  for (const [, token, dPrim, dHex, , lPrim, lHex] of rows) {
    for (const [theme, scopes, display, hex] of [['light', [light, primitives], lPrim, lHex], ['dark', [dark, light, primitives], dPrim, dHex]]) {
      const resolved = resolve(token, scopes);
      if (resolved.value === undefined) {
        errors.push(`${rel}: ${token} does not resolve to a primitive in the ${theme} theme`);
        continue;
      }
      if (resolved.name !== toPrimitive(display)) {
        errors.push(`${rel}: ${token} ${theme} is captioned ${display} (${toPrimitive(display)}) but resolves to ${resolved.name}`);
      } else if (squash(resolved.value) !== squash(hex)) {
        errors.push(`${rel}: ${token} ${theme} is captioned ${hex} but ${resolved.name} is ${resolved.value}`);
      }
    }
  }
  summaries.push(`${rows.length} semantic swatches × 2 themes`);
}

/* ------------------------------------------------------------------ */
/* 5. /foundations/typography                                           */
/* ------------------------------------------------------------------ */
{
  const rel = pageRel('typography');
  const source = pageFile('typography');
  const WEIGHT_NAMES = { Thin: 100, ExtraLight: 200, Light: 300, Regular: 400, Medium: 500, SemiBold: 600, Bold: 700, ExtraBold: 800, Black: 900 };
  const scopes = [typography.base];
  const mobile = [...typography.media.entries()].find(([prelude]) => /max-width:\s*768px/.test(prelude))?.[1] ?? new Map();
  /** "2%" / "-1%" / "+8%" / "0" → em, to compare with the token's em value. */
  const captionToEm = (caption) => (caption.trim() === '0' ? 0 : parseFloat(caption) / 100);
  const tokenToEm = (value) => (value.trim() === '0' ? 0 : parseFloat(value));

  // One row per `name: "…"`; a row runs to the next one.
  const starts = [...source.matchAll(/^\s*name:\s*"([^"]+)",/gm)];
  let checked = 0;
  starts.forEach((start, i) => {
    const block = source.slice(start.index, starts[i + 1]?.index ?? source.length);
    const slug = block.match(/var\(--font-([a-z0-9-]+)-size\)/)?.[1];
    if (!slug) return; // a row with no token bundle behind it (it states its own values)
    const name = start[1];
    const field = (key) => block.match(new RegExp(`^\\s*${key}:\\s*"([^"]*)"`, 'm'))?.[1];
    const expect = (what, caption, actual) => {
      if (caption === undefined || actual === undefined) errors.push(`${rel}: ${name} — could not read its ${what} from the page or from --font-${slug}-*`);
      else if (squash(caption) !== squash(actual)) errors.push(`${rel}: ${name} ${what} is captioned "${caption}" but --font-${slug}-* resolves to ${actual}`);
    };
    checked++;

    expect('size', field('size'), resolve(`--font-${slug}-size`, scopes).value);
    expect('line-height', field('lineHeight'), resolve(`--font-${slug}-line-height`, scopes).value);

    const weight = field('weight');
    const actualWeight = resolve(`--font-${slug}-weight`, scopes).value;
    if (WEIGHT_NAMES[weight] === undefined) errors.push(`${rel}: ${name} weight "${weight}" is not a name this guard knows (WEIGHT_NAMES)`);
    else if (String(WEIGHT_NAMES[weight]) !== actualWeight) errors.push(`${rel}: ${name} weight is captioned ${weight} (${WEIGHT_NAMES[weight]}) but --font-${slug}-weight is ${actualWeight}`);

    const spacing = field('letterSpacing');
    const actualSpacing = resolve(`--font-${slug}-letter-spacing`, scopes).value;
    if (spacing === undefined || actualSpacing === undefined) errors.push(`${rel}: ${name} — could not read its letter-spacing`);
    else if (Math.abs(captionToEm(spacing) - tokenToEm(actualSpacing)) > 1e-9) errors.push(`${rel}: ${name} letter-spacing is captioned "${spacing}" but --font-${slug}-letter-spacing is ${actualSpacing}`);

    // The 768px step-down: a row's `mobile` block against the media override.
    const mobileBlock = block.match(/mobile:\s*\{([\s\S]*?)previewStyle/)?.[1];
    const steps = mobile.has(`--font-${slug}-size`);
    if (steps && !mobileBlock) errors.push(`${rel}: ${name} steps down at 768px in tokens-typography.css, but its row declares no mobile values`);
    if (mobileBlock) {
      const mobileScopes = [mobile, typography.base];
      const mSize = mobileBlock.match(/size:\s*"([^"]*)"/)?.[1];
      const mLine = mobileBlock.match(/lineHeight:\s*"([^"]*)"/)?.[1];
      expect('mobile size', mSize, resolve(`--font-${slug}-size`, mobileScopes).value);
      expect('mobile line-height', mLine, resolve(`--font-${slug}-line-height`, mobileScopes).value);
    }
  });
  if (!checked) errors.push(`${rel}: parsed no type style rows — the typography guard needs them`);
  summaries.push(`${checked} type styles`);
}

/* ------------------------------------------------------------------ */

if (errors.length) {
  console.error('✗ Foundation page mirror validation failed:');
  for (const e of errors) console.error(`  ${e}`);
  console.error('  Fix the page caption to match the token (the token CSS is the source of truth), or the token if the caption was the intent.');
  process.exit(1);
}
console.log(`✓ Foundation page captions match the token CSS — ${summaries.join(', ')}.`);
