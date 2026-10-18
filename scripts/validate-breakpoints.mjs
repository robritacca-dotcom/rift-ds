#!/usr/bin/env node
/**
 * Holds every media-query width in the library and the site to the
 * breakpoint set.
 *
 * CSS custom properties cannot drive an @media condition, so the widths a
 * layout switches at are written as literals wherever a query lives. That
 * left them with no home a build could check: by 2026-10 the five canonical
 * steps design.md named had been joined by a dozen others, some of them a
 * pixel off a canonical step and nothing to say whether that was meant.
 * The set now lives in two modules, and this script holds the literals to
 * them:
 *
 *   src/tokens/breakpoints.ts          — the library's set (published as
 *                                         rift-ds/tokens/breakpoints)
 *   website/src/config/breakpoints.ts  — the site's own families
 *
 * Every `export const BREAKPOINT_<NAME>_PX = <n>;` is a member. A value is
 * the last width of the narrower side, so `(max-width: n)` and
 * `(min-width: n + 1)` both name it; a name ending `_HEIGHT_PX` is a height
 * and answers to max-height / min-height instead.
 *
 * Scanned:
 *   - every @media prelude in src/**\/*.css (library set only — the library
 *     cannot depend on the site) and website/src/**\/*.css (both sets);
 *   - every media-query-shaped string in .ts/.tsx under the same roots
 *     (`(max-width: 1099px)` inside quotes — a matchMedia query or an
 *     image `sizes` list). TypeScript builds its queries from the module
 *     (mediaBelow, mediaAbove, mediaFor), so a spelled-out one fails even
 *     when its width is in the set, unless sanctioned like a CSS one.
 *
 * A width outside the set is allowed only when the comment directly above
 * the query (or above the statement holding a TS query) carries
 * `ds-allow(breakpoint): <reason>`, or the file header carries
 * `ds-allow-file(breakpoint): <reason>` — the spec's "content-driven and
 * commented in place" rule, made mechanical. Units other than px fail the
 * same way unless sanctioned, since an em or rem query tracks the reader's
 * font setting rather than the viewport the set is written in.
 *
 * Also holds design.md's statement of the canonical layout steps to the
 * library module, so the spec cannot name a different set from the one the
 * build enforces.
 *
 * Runs in the validate-registry chain and the website's prebuild.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(join(repoRoot, rel), 'utf8').replace(/\r\n/g, '\n');

const LIBRARY_MODULE = 'src/tokens/breakpoints.ts';
const SITE_MODULE = 'website/src/config/breakpoints.ts';

/** Parse a breakpoint module into { name → { px, height } }. */
function parseModule(rel) {
  const out = new Map();
  for (const m of read(rel).matchAll(/export const BREAKPOINT_([A-Z0-9_]+)_PX\s*=\s*(\d+)\s*;/g)) {
    out.set(m[1], { px: Number(m[2]), height: m[1].endsWith('_HEIGHT') });
  }
  if (out.size === 0) {
    console.error(`✗ ${rel} declares no BREAKPOINT_*_PX constants`);
    process.exit(1);
  }
  return out;
}

const library = parseModule(LIBRARY_MODULE);
const site = parseModule(SITE_MODULE);

const errors = [];

/* Each module's documented list (BREAKPOINTS / SITE_BREAKPOINTS, which
   /foundations/layout renders) names every constant exactly once, and
   nothing else, so a step cannot ship without its description. */
for (const [rel, mod, listName] of [
  [LIBRARY_MODULE, library, 'BREAKPOINTS'],
  [SITE_MODULE, site, 'SITE_BREAKPOINTS'],
]) {
  const source = read(rel);
  const start = source.indexOf(`export const ${listName}`);
  if (start < 0) {
    errors.push(`${rel}: no ${listName} list — every breakpoint needs a documented entry`);
    continue;
  }
  const listed = [...source.slice(start).matchAll(/px:\s*BREAKPOINT_([A-Z0-9_]+)_PX/g)].map((m) => m[1]);
  for (const name of mod.keys()) {
    const n = listed.filter((l) => l === name).length;
    if (n !== 1) errors.push(`${rel}: BREAKPOINT_${name}_PX appears ${n} times in ${listName} (expected once)`);
  }
  for (const name of listed) {
    if (!mod.has(name)) errors.push(`${rel}: ${listName} names BREAKPOINT_${name}_PX, which this module does not declare`);
  }
  // A _HEIGHT constant's entry measures height, and every other one width,
  // or the page would print the wrong query for it.
  for (const entry of source.slice(start).matchAll(/\{[^{}]*px:\s*BREAKPOINT_([A-Z0-9_]+)_PX[^{}]*\}/g)) {
    const axis = entry[0].match(/axis:\s*['"](\w+)['"]/)?.[1];
    const want = entry[1].endsWith('_HEIGHT') ? 'height' : 'width';
    if (axis !== want) errors.push(`${rel}: ${listName}'s BREAKPOINT_${entry[1]}_PX entry has axis ${axis}, expected ${want}`);
  }
}

const valuesOf = (...modules) => {
  const widths = new Set();
  const heights = new Set();
  for (const mod of modules) {
    for (const { px, height } of mod.values()) (height ? heights : widths).add(px);
  }
  return { widths, heights };
};
const librarySet = valuesOf(library);
const siteSet = valuesOf(library, site);

for (const [name, { px }] of site) {
  if (library.has(name)) errors.push(`${SITE_MODULE}: BREAKPOINT_${name}_PX restates a library breakpoint by name`);
  for (const [libName, lib] of library) {
    if (lib.px === px && !lib.height) {
      errors.push(`${SITE_MODULE}: BREAKPOINT_${name}_PX is ${px}, already the library's BREAKPOINT_${libName}_PX — use that one`);
    }
  }
}

/* ---------------------------------------------------------------------- */
/* Files                                                                   */
/* ---------------------------------------------------------------------- */

const walk = (dir, test) =>
  readdirSync(join(repoRoot, dir), { withFileTypes: true, recursive: true })
    .filter((e) => e.isFile() && test(e.name))
    .map((e) => relative(repoRoot, join(e.parentPath ?? e.path, e.name)).replace(/\\/g, '/'));

const isCss = (n) => n.endsWith('.css');
const isTs = (n) => /\.tsx?$/.test(n) && !n.includes('.generated.');

const targets = [
  ...walk('src', isCss).map((f) => ({ file: f, kind: 'css', set: librarySet })),
  ...walk('src', isTs).map((f) => ({ file: f, kind: 'ts', set: librarySet })),
  ...walk('website/src', isCss).map((f) => ({ file: f, kind: 'css', set: siteSet })),
  ...walk('website/src', isTs).map((f) => ({ file: f, kind: 'ts', set: siteSet })),
].filter((t) => t.file !== LIBRARY_MODULE && t.file !== SITE_MODULE);

const SANCTION = /ds-allow\(breakpoint\):\s*\S/;
const FILE_SANCTION = /ds-allow-file\(breakpoint\):\s*\S/;
const MALFORMED = /ds-allow(-file)?\(breakpoint\)(?!:\s*\S)/;
const FEATURE = /\((min|max)-(width|height)\s*:\s*([\d.]+)([a-z]+)\s*\)/g;

/** The comment(s) directly above `index`: everything back to the previous
    non-comment, non-whitespace text. */
function leadingComments(source, index) {
  let i = index;
  let text = '';
  for (;;) {
    const before = source.slice(0, i);
    const trimmed = before.replace(/\s+$/, '');
    if (trimmed.endsWith('*/')) {
      const start = trimmed.lastIndexOf('/*');
      if (start < 0) break;
      text = trimmed.slice(start) + '\n' + text;
      i = start;
      continue;
    }
    const lineStart = trimmed.lastIndexOf('\n') + 1;
    const line = trimmed.slice(lineStart);
    if (/^\s*\/\//.test(line)) {
      text = line + '\n' + text;
      i = lineStart;
      continue;
    }
    break;
  }
  return text;
}

/** The start of the line holding `index`, walked back to the start of its
    statement for a TS query (a const, an attribute) so a directive above
    the declaration covers a literal on a later line. */
function statementStart(source, index) {
  let i = source.lastIndexOf('\n', index - 1) + 1;
  // Climb continuation lines: a line whose predecessor does not end a
  // statement or block belongs to the same statement.
  while (i > 0) {
    const prevEnd = i - 1;
    const prevStart = source.lastIndexOf('\n', prevEnd - 1) + 1;
    const prev = source.slice(prevStart, prevEnd).trim();
    if (prev === '' || /[;{}]$/.test(prev) || prev.startsWith('//') || prev.endsWith('*/')) break;
    i = prevStart;
  }
  return i;
}

function check(feature, set) {
  const [, side, axis, raw, unit] = feature;
  if (unit !== 'px') return `${unit} units track the reader's font size, not the viewport the set is written in`;
  const n = Number(raw);
  const pool = axis === 'height' ? set.heights : set.widths;
  const value = side === 'max' ? n : n - 1;
  if (pool.has(value)) return null;
  return `${axis} ${value}px is not a breakpoint`;
}

let queries = 0;
let sanctioned = 0;

for (const { file, kind, set } of targets) {
  const source = read(file);
  const fileSanctioned = FILE_SANCTION.test(source.slice(0, 2000));
  for (const m of source.matchAll(new RegExp(MALFORMED, 'g'))) {
    const line = source.slice(0, m.index).split('\n').length;
    errors.push(`${file}:${line} — malformed directive; write ds-allow(breakpoint): <reason>`);
  }

  const sites = [];
  if (kind === 'css') {
    for (const m of source.matchAll(/@media([^{]*)\{/g)) {
      sites.push({ index: m.index, prelude: m[1], anchor: m.index });
    }
  } else {
    for (const m of source.matchAll(/(['"`])([^'"`\n]*\((?:min|max)-(?:width|height)\s*:\s*[\d.]+[a-z]+\)[^'"`\n]*)\1/g)) {
      // Skip a match inside a comment line.
      const lineStart = source.lastIndexOf('\n', m.index) + 1;
      const head = source.slice(lineStart, m.index);
      if (/^\s*(\/\/|\*|\/\*)/.test(head)) continue;
      sites.push({ index: m.index, prelude: m[2], anchor: statementStart(source, m.index) });
    }
  }

  for (const s of sites) {
    const problems = [];
    for (const f of s.prelude.matchAll(FEATURE)) {
      queries += 1;
      const problem = check(f, set);
      if (problem) problems.push(`${f[0]}: ${problem}`);
    }
    // TypeScript builds its queries from the module (mediaBelow,
    // mediaAbove, mediaFor) rather than spelling one out, so a literal
    // query string is a finding even when its width is in the set: the
    // number would then live in two places.
    if (kind === 'ts') {
      problems.push(`"${s.prelude.trim()}" is spelled out; build it with mediaBelow/mediaAbove from ${LIBRARY_MODULE}`);
    }
    if (problems.length === 0) continue;
    if (fileSanctioned || SANCTION.test(leadingComments(source, s.anchor))) {
      sanctioned += problems.length;
      continue;
    }
    const line = source.slice(0, s.index).split('\n').length;
    errors.push(
      `${file}:${line} — ${problems.join('; ')}. Use a breakpoint from ${
        set === librarySet ? LIBRARY_MODULE : `${LIBRARY_MODULE} or ${SITE_MODULE}`
      }, or sanction it in the comment above with ds-allow(breakpoint): <reason>`
    );
  }
}

/* ---------------------------------------------------------------------- */
/* design.md's canonical layout steps                                      */
/* ---------------------------------------------------------------------- */

const LAYOUT_STEPS = ['MID', 'STACK', 'TABLET', 'MOBILE', 'PHONE'];
const spec = read('design.md').match(/The canonical layout set is \*\*([\d /]+)\*\*/);
if (!spec) {
  errors.push('design.md: could not find "The canonical layout set is **…**" in Responsive Behavior → Breakpoints');
} else {
  const stated = spec[1].split('/').map((s) => Number(s.trim()));
  const actual = LAYOUT_STEPS.map((n) => library.get(n)?.px);
  if (stated.join() !== actual.join()) {
    errors.push(
      `design.md states the canonical layout set as ${stated.join(' / ')}, but ${LIBRARY_MODULE} holds ${actual.join(' / ')}`
    );
  }
}

if (errors.length > 0) {
  console.error(`✗ Breakpoints:\n` + errors.map((e) => `    - ${e}`).join('\n'));
  process.exit(1);
}

console.log(
  `✓ Breakpoints — ${queries} media feature(s) across ${targets.length} files held to ` +
    `${library.size} library + ${site.size} site breakpoints (${sanctioned} sanctioned in place).`
);
