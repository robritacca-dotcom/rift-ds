#!/usr/bin/env node
/**
 * validate-raw-values.mjs
 *
 * The build half of the token-audit skill, over the stylesheets that ship in
 * the npm package (src/components and src/chat). CLAUDE.md's Token
 * Architecture says component CSS never hardcodes a value a token owns, and
 * that a deliberate off-token value is sanctioned in place with a
 * `ds-allow(<category>)` directive. Until 2026-10-21 only a manual audit read
 * that rule, and about fifteen files had drifted: raw pixel sizes and font
 * sizes that a theme's density and type-scale levers never reach, because a
 * literal does not move when a token does. The skill still owns judgement
 * (near-twins, the right replacement token); this script owns the floor.
 *
 * Flags, per declaration (comments stripped, custom-property declarations
 * and `var()` fallbacks exempt, since a fallback is a consumer override hook):
 *
 *   color       a hex colour, or rgb()/rgba()/hsl()/hsla() with no var() in it
 *   motion      a literal duration or easing (`200ms`, `ease`, a cubic-bezier)
 *               in a transition or animation property
 *   typography  a literal font-size, line-height, letter-spacing or
 *               font-weight (numbers and `bold`/`normal` keywords; `inherit`
 *               and friends are fine)
 *   spacing     a literal px value in padding, margin, gap or border-radius,
 *               other than 0 and 1px (the hairline)
 *
 * It also holds the reduced-motion contract's one exception: a component's
 * own `prefers-reduced-motion` query (to park a loop or drop an entrance)
 * needs a ds-allow(motion) comment directly above it saying which.
 *
 * A value inside calc() or min()/max()/clamp() is arithmetic and is not
 * flagged. A declaration is sanctioned when a directive of its category (or
 * `mockup` / `platform`, the categories that restate a whole foreign look)
 * covers it: `ds-allow-file(<category>)` anywhere in the file;
 * `ds-allow(<category>)` inside the same rule block (or an enclosing one);
 * in a comment directly above that rule; or in a section banner comment
 * (`/* ====` between rules), which covers every rule up to the next banner. The category set itself is owned by
 * scripts/validate-css-directives.mjs.
 *
 * Runs in the `validate-registry` chain: it reads source only.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
// Normalize CRLF so Windows checkouts validate identically to CI.
const read = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
const display = (path) => relative(repoRoot, path).replaceAll('\\', '/');

const WHOLE_LOOK = ['mockup', 'platform'];

function cssFiles(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) cssFiles(full, files);
    else if (entry.name.endsWith('.css')) files.push(full);
  }
  return files;
}

/** Blank out arithmetic and fallbacks so their contents never count. */
function stripExempt(value) {
  let v = value;
  // var(--x, <fallback>) → var(--x)
  for (let guard = 0; guard < 20 && /var\(\s*--[\w-]+\s*,/.test(v); guard += 1) {
    v = v.replace(/var\(\s*(--[\w-]+)\s*,((?:[^()]|\([^()]*\))*)\)/g, 'var($1)');
  }
  // A token reference is the fix, never the finding: drop its name so
  // `--motion-ease-standard` cannot read as the keyword `ease`, nor the digit
  // in `--font-heading-3-size` as a literal size. Done before arithmetic, so
  // `calc((var(--x) - 32px) / 2)` strips whole.
  v = v.replace(/var\(\s*--[\w-]+\s*\)/g, 'TOKEN');
  for (let guard = 0; guard < 20 && /\b(calc|min|max|clamp)\(/.test(v); guard += 1) {
    v = v.replace(/\b(calc|min|max|clamp)\(((?:[^()]|\([^()]*\))*)\)/g, 'ARITH');
  }
  return v;
}

function violations(property, rawValue) {
  const found = [];
  const value = stripExempt(rawValue);
  const prop = property.toLowerCase();
  // A mask's gradient stops are alpha, not colour: `#000` there means opaque.
  const isMask = /^(-webkit-)?mask(-image)?$/.test(prop);
  if (!isMask && (/#[0-9a-f]{3,8}\b/i.test(value) || /\b(rgba?|hsla?)\((?![^)]*TOKEN)/i.test(value))) {
    found.push('color');
  }
  if (/^(transition|animation)(-duration|-delay|-timing-function)?$/.test(prop)) {
    // A discrete property (visibility, display) flips after a delay; its `0s`
    // and `linear` are mechanics, not a timing choice. Judge the rest.
    const timed = value
      .split(',')
      .filter((segment) => !/^\s*(visibility|display|overlay|content-visibility)\b/.test(segment))
      .join(',');
    // A zero duration (`0s`, `0ms`) is structural, not a timing choice.
    const durations = timed.match(/(^|[\s,])\d*\.?\d+m?s\b/g) ?? [];
    if (
      durations.some((d) => !/^[\s,]*0+(\.0+)?m?s$/.test(d)) ||
      /\b(ease|ease-in|ease-out|ease-in-out|linear|step-start|step-end)\b|cubic-bezier\(|steps\(/.test(timed)
    ) {
      found.push('motion');
    }
  }
  // font-size: any literal size. line-height: a length, or a ratio other
  // than the structural 1. letter-spacing: any non-zero length.
  if (prop === 'font-size' && /\d/.test(value)) found.push('typography');
  if (prop === 'line-height' && (/\d(px|rem|em|%)/.test(value) || /^\s*\d*\.?\d+\s*$/.test(value) && !['0', '1'].includes(value.trim()))) {
    found.push('typography');
  }
  if (prop === 'letter-spacing' && /\d*\.?\d+(px|em|rem)/.test(value) && !/^\s*-?0+(\.0+)?(px|em|rem)?\s*$/.test(value)) {
    found.push('typography');
  }
  if (prop === 'font-weight' && /^\s*(\d+|bold|bolder|lighter|normal)\s*$/.test(value)) found.push('typography');
  if (/^(padding|margin|gap|row-gap|column-gap|border-radius)(-[a-z-]+)?$/.test(prop)) {
    const px = value.match(/(^|[\s,])(-?\d*\.?\d+)px\b/g) ?? [];
    if (px.some((m) => !/^\s*-?(0|1)px$/.test(m.replace(/^[\s,]/, '')))) found.push('spacing');
  }
  return found;
}

const errors = [];
let declarations = 0;
let sanctioned = 0;

for (const file of [...cssFiles(join(repoRoot, 'src', 'components')), ...cssFiles(join(repoRoot, 'src', 'chat'))]) {
  const text = read(file);
  const fileWide = new Set([...text.matchAll(/ds-allow-file\(([a-z-]+)\)/g)].map((m) => m[1]));
  // A component's own reduced-motion query is the exception the motion
  // contract allows (design.md, Reduced motion contract): parking a looping
  // animation, or dropping an entrance outright. It says which, in a
  // ds-allow(motion) comment directly above the query.
  for (const m of text.matchAll(/@media[^{]*prefers-reduced-motion/g)) {
    const before = text.slice(0, m.index).trimEnd();
    const comment = before.endsWith('*/') ? before.slice(before.lastIndexOf('/*')) : '';
    if (!/ds-allow\(motion\)/.test(comment) && !fileWide.has('motion')) {
      const line = text.slice(0, m.index).split('\n').length;
      errors.push(
        `${display(file)}:${line} writes its own prefers-reduced-motion query. The duration tokens already ` +
          `collapse under the preference; a component query is allowed only to park a looping animation or ` +
          `drop an entrance, and says which in a /* ds-allow(motion): … */ comment directly above it.`
      );
    }
  }
  // Walk the stylesheet keeping a stack of open blocks, each with the
  // categories its directives sanction: directives inside the block, plus
  // those in the comment just above its opening brace.
  const stack = [{ allow: new Set() }];
  let pendingComments = '';
  // A banner comment between rules (`/* ====`) opens a section, and a
  // directive inside it covers every rule up to the next banner.
  let sectionAllow = new Set();
  // A directive in a plain comment between rules covers the run of rules
  // under it, up to the next blank line (one comment over four one-line
  // stagger rules is the pattern).
  let runAllow = new Set();
  let sawNewline = false;
  let i = 0;
  let line = 1;
  let buffer = '';
  let bufferLine = 1;
  const allowedHere = (extra = []) => {
    const all = new Set([...fileWide, ...extra]);
    for (const frame of stack) for (const c of frame.allow) all.add(c);
    return all;
  };
  const flush = (trailing = []) => {
    const decl = buffer.trim();
    buffer = '';
    const colon = decl.indexOf(':');
    if (colon <= 0 || decl.startsWith('--') || decl.startsWith('@')) return;
    const property = decl.slice(0, colon).trim();
    const value = decl.slice(colon + 1).trim();
    if (!/^[a-z-]+$/i.test(property)) return;
    declarations += 1;
    const allowed = allowedHere(trailing);
    for (const category of violations(property, value)) {
      // A font-size on an icon glyph is icon sizing, sanctioned as such.
      const accepts = category === 'typography' && property === 'font-size' ? ['typography', 'icon-size'] : [category];
      if (accepts.some((c) => allowed.has(c)) || WHOLE_LOOK.some((c) => allowed.has(c))) {
        sanctioned += 1;
        continue;
      }
      errors.push(
        `${display(file)}:${bufferLine} — ${property}: ${value} is a raw ${category} value. Use the token ` +
          `that owns it (the token-audit skill finds the match), or sanction it in place with ` +
          `/* ds-allow(${category}): <reason> */ when it is deliberately off the scale.`
      );
    }
  };
  // Directives in a comment on the rest of the current line, after the
  // declaration's semicolon.
  const trailingAt = (from) => {
    const eol = text.indexOf('\n', from);
    const tail = text.slice(from, eol === -1 ? text.length : eol);
    return [...tail.matchAll(/ds-allow\(([a-z-]+)\)/g)].map((m) => m[1]);
  };
  while (i < text.length) {
    if (text.startsWith('/*', i)) {
      const end = text.indexOf('*/', i + 2);
      const comment = text.slice(i, end === -1 ? text.length : end + 2);
      const banner = stack.length === 1 && /^\/\*\s*={3,}/.test(comment);
      if (banner) sectionAllow = new Set();
      for (const m of comment.matchAll(/ds-allow\(([a-z-]+)\)/g)) {
        // Inside a block it covers that block; in a banner, the section; in
        // any other comment between rules, the run of rules under it.
        if (stack.length > 1) stack[stack.length - 1].allow.add(m[1]);
        else if (banner) sectionAllow.add(m[1]);
        else pendingComments += ` ${m[1]}`;
      }
      line += (comment.match(/\n/g) ?? []).length;
      sawNewline = false;
      i += comment.length;
      continue;
    }
    const ch = text[i];
    if (ch === '{') {
      const opening = new Set(pendingComments.trim().split(/\s+/).filter(Boolean));
      if (stack.length === 1) {
        for (const c of opening) runAllow.add(c);
        for (const c of runAllow) opening.add(c);
        for (const c of sectionAllow) opening.add(c);
      }
      stack.push({ allow: opening });
      pendingComments = '';
      buffer = '';
    } else if (ch === '}') {
      flush();
      stack.pop();
      if (stack.length === 0) stack.push({ allow: new Set() });
      pendingComments = '';
      sawNewline = false;
    } else if (ch === ';') {
      flush(trailingAt(i + 1));
    } else {
      if (buffer.trim() === '' && !/\s/.test(ch)) bufferLine = line;
      buffer += ch;
    }
    if (ch === '\n') {
      line += 1;
      // A blank line between rules ends a directive's run.
      if (stack.length === 1 && buffer.trim() === '') {
        if (sawNewline) runAllow = new Set();
        sawNewline = true;
      }
    } else if (!/\s/.test(ch)) {
      sawNewline = false;
    }
    i += 1;
  }
}

/*
 * Type in TypeScript. A chart's recharts ticks and an inline SVG style set
 * type through props, out of reach of the stylesheet scan above; until
 * 2026-10-21 every chart wrote `fontSize: 12` (RadarChart 10, under the
 * type floor), so no theme's type scale reached a chart label. A literal
 * numeric fontSize or fontWeight in library TypeScript fails: read the token
 * (`readTokenPx('--font-caption-size', '12px')` from Chart/palette.ts for an SVG attribute, or
 * `'var(--font-caption-size)'` in a style).
 */
function tsFiles(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) tsFiles(full, files);
    else if (/\.tsx?$/.test(entry.name) && !/\.(stories|test)\.tsx?$/.test(entry.name)) files.push(full);
  }
  return files;
}
for (const file of [...tsFiles(join(repoRoot, 'src', 'components')), ...tsFiles(join(repoRoot, 'src', 'chat'))]) {
  const text = read(file);
  for (const m of text.matchAll(/\bfont(Size|Weight):\s*['"]?\d/g)) {
    const line = text.slice(0, m.index).split('\n').length;
    errors.push(
      `${display(file)}:${line} sets font${m[1]} to a literal. Read the type token instead: ` +
        `readTokenPx('--font-caption-size', '12px') where recharts needs a number, 'var(--font-…)' in a style.`
    );
  }
}

if (errors.length > 0) {
  console.error('✗ Raw value validation failed:');
  for (const error of errors) console.error(`    - ${error}`);
  console.error(`  ${errors.length} raw value(s).`);
  process.exit(1);
}

console.log(`✓ Library CSS on tokens — ${declarations} declarations checked, ${sanctioned} sanctioned off-scale values`);
