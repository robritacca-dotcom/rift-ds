#!/usr/bin/env node
/**
 * validate-logical-properties.mjs
 *
 * Holds the stylesheets that ship in the npm package (src/components and
 * src/chat) to logical properties, so every component lays itself out from
 * the reading direction: a `dir="rtl"` anywhere up the tree mirrors it with
 * no code of its own. design.md's "Layout follows the reading direction"
 * paragraph owns the contract. Until 2026-10-26 nothing did: about forty
 * stylesheets wrote `margin-left`, `padding-right` and `left: 0`, so a
 * right-to-left product saw every icon gap, inset and indent on the wrong
 * side.
 *
 * Flags, per declaration (comments stripped, custom properties exempt):
 *   - `margin-`, `padding-`, `scroll-margin-` and `scroll-padding-` `left` or
 *     `right`, which are `-inline-start` and `-inline-end`;
 *   - `border-left`/`border-right` and their `-width`, `-style`, `-color`;
 *   - the four corner radii (`border-top-left-radius` is
 *     `border-start-start-radius`);
 *   - `left`/`right` positions, which are `inset-inline-start`/`-end`, except
 *     `left: 50%` in a block that also translates by -50% (centring), a block
 *     that sets `left` and `right` to the same value (stretching), and `auto`,
 *     all the same in either direction;
 *   - `text-align`, `float` and `clear` with `left` or `right` (`start` and
 *     `end` read the direction);
 *   - an `inset` shorthand whose left and right differ;
 *   - a background or mask gradient running `to left` or `to right` in a
 *     file with no `:dir(rtl)` rule to turn it;
 *   - a horizontal `transform`/`translate` that is not multiplied by
 *     `--ds-inline-sign` (src/behaviors/direction.css), other than zero and
 *     -50% centring: motion along the inline axis has no logical property,
 *     so it reads the direction through the sign.
 * A declaration that is genuinely physical (a map, a chart's plot area, a
 * slider whose thumb sits by value, a drawer whose `side` names a screen
 * edge) is sanctioned in place with `ds-allow(physical)`, placed the way
 * scripts/validate-raw-values.mjs reads directives: `ds-allow-file` anywhere
 * in the file, inside the rule block, in the comment directly above the rule
 * (covering the run of rules under it to the next blank line), at the end of
 * the declaration's line, or in a section banner (`/* ====`).
 *
 * It also holds the library's icons to the same contract: a glyph that
 * points along the reading direction mirrors (see the Icons block below).
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

function cssFiles(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) cssFiles(full, files);
    else if (entry.name.endsWith('.css')) files.push(full);
  }
  return files;
}

const LOGICAL = {
  left: 'inset-inline-start',
  right: 'inset-inline-end',
  'border-top-left-radius': 'border-start-start-radius',
  'border-top-right-radius': 'border-start-end-radius',
  'border-bottom-left-radius': 'border-end-start-radius',
  'border-bottom-right-radius': 'border-end-end-radius',
};

/** The logical name for a physical property, or null when the declaration reads the direction already. */
let fileHasRtlRule = false;
function physical(property, value, block) {
  const side = /^(scroll-)?(margin|padding)-(left|right)$/.exec(property);
  if (side) return `${side[1] ?? ''}${side[2]}-inline-${side[3] === 'left' ? 'start' : 'end'}`;
  const border = /^border-(left|right)(-(width|style|color))?$/.exec(property);
  if (border) return `border-inline-${border[1] === 'left' ? 'start' : 'end'}${border[2] ?? ''}`;
  if (LOGICAL[property] && property.endsWith('radius')) return LOGICAL[property];
  if (property === 'left' || property === 'right') {
    if (value === 'auto') return null;
    const centred = property === 'left' && value === '50%' && /translate(X)?\(\s*-50%|translate:\s*-50%/.test(block);
    // The same offset on both sides is the same in either direction.
    const other = property === 'left' ? 'right' : 'left';
    const matched = block.includes(`;${other}: ${value};`) || block.startsWith(`${other}: ${value};`);
    return centred || matched ? null : LOGICAL[property];
  }
  if (/^(text-align|float|clear)$/.test(property) && /^(left|right)$/.test(value)) {
    return `${property}: ${value === 'left' ? 'start' : 'end'}`;
  }
  if (property === 'transform' || property === 'translate') {
    // Motion along the inline axis has no logical form: it multiplies by the
    // direction sign. Centring (-50%), zero and a vertical-only move are the
    // same either way.
    const x = property === 'translate'
      ? value.split(/\s+(?![^(]*\))/)[0]
      : (/translate(?:X|3d)?\(([^,()]*(?:\([^()]*(?:\([^()]*\)[^()]*)*\)[^,()]*)*)/.exec(value) ?? [])[1];
    if (!x || /--ds-inline-sign/.test(value)) return null;
    if (/^\s*(0|0px|-50%|calc\(-50%[^)]*\))\s*$/.test(x)) return null;
    return 'a translation multiplied by var(--ds-inline-sign, 1) (src/behaviors/direction.css)';
  }
  if (/^(background|background-image|mask|mask-image|-webkit-mask-image)$/.test(property) && /gradient\(\s*to (left|right)\b/.test(value)) {
    // A gradient has no logical direction: one that runs along the inline
    // axis needs a :dir(rtl) rule that turns it, in the same file.
    return fileHasRtlRule ? null : 'a gradient turned by a :dir(rtl) rule in the same file';
  }
  if (property === 'inset') {
    // Split on top-level spaces only: `calc(-1 * x)` is one value.
    const parts = [];
    let depth = 0;
    let part = '';
    for (const c of value) {
      if (c === '(') depth += 1;
      if (c === ')') depth -= 1;
      if (/\s/.test(c) && depth === 0) {
        if (part) parts.push(part);
        part = '';
      } else part += c;
    }
    if (part) parts.push(part);
    if (parts.length === 4 && parts[1] !== parts[3]) return 'inset-block and inset-inline-start / -end';
  }
  return null;
}

const errors = [];
let declarations = 0;
let sanctioned = 0;

const files = [...cssFiles(join(repoRoot, 'src', 'components')), ...cssFiles(join(repoRoot, 'src', 'chat'))];
for (const file of files) {
  const text = read(file);
  fileHasRtlRule = /:dir\(rtl\)/.test(text);
  const fileWide = new Set([...text.matchAll(/ds-allow-file\(([a-z-]+)\)/g)].map((m) => m[1]));
  // A stack of open blocks, each with the categories its directives
  // sanction and the text of its declarations (read for the centring test).
  const stack = [{ allow: new Set(), body: '' }];
  let pendingComments = '';
  let sectionAllow = new Set();
  let runAllow = new Set();
  let sawNewline = false;
  let buffer = '';
  let bufferLine = 1;
  let line = 1;
  const pending = [];
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
    const property = decl.slice(0, colon).trim().toLowerCase();
    const value = decl.slice(colon + 1).replace(/!important/, '').trim();
    if (!/^[a-z-]+$/.test(property)) return;
    declarations += 1;
    stack[stack.length - 1].body += `${property}: ${value};`;
    pending.push({ frame: stack[stack.length - 1], property, value, line: bufferLine, allowed: allowedHere(trailing) });
  };
  const settle = (frame) => {
    for (let k = pending.length - 1; k >= 0; k -= 1) {
      const decl = pending[k];
      if (decl.frame !== frame) continue;
      pending.splice(k, 1);
      const logical = physical(decl.property, decl.value, frame.body);
      if (!logical) continue;
      if (decl.allowed.has('physical')) {
        sanctioned += 1;
        continue;
      }
      errors.push(
        `${display(file)}:${decl.line} — ${decl.property}: ${decl.value} is a physical side. Use ${logical}, ` +
          `so the layout follows the reading direction, or sanction it in place with ` +
          `/* ds-allow(physical): <reason> */ when the side belongs to the screen, not the text.`
      );
    }
  };
  const trailingAt = (from) => {
    const eol = text.indexOf('\n', from);
    const tail = text.slice(from, eol === -1 ? text.length : eol);
    return [...tail.matchAll(/ds-allow\(([a-z-]+)\)/g)].map((m) => m[1]);
  };
  let i = 0;
  while (i < text.length) {
    if (text.startsWith('/*', i)) {
      const end = text.indexOf('*/', i + 2);
      const comment = text.slice(i, end === -1 ? text.length : end + 2);
      const banner = stack.length === 1 && /^\/\*\s*={3,}/.test(comment);
      if (banner) sectionAllow = new Set();
      for (const m of comment.matchAll(/ds-allow\(([a-z-]+)\)/g)) {
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
      stack.push({ allow: opening, body: '' });
      pendingComments = '';
      buffer = '';
    } else if (ch === '}') {
      flush();
      settle(stack[stack.length - 1]);
      stack.pop();
      if (stack.length === 0) stack.push({ allow: new Set(), body: '' });
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
 * Icons. A Material Symbols glyph that points along the reading direction
 * (DIRECTIONAL_ICONS in src/behaviors/direction.ts, read from the source so
 * the list has one home) mirrors in a right-to-left context through the
 * `ds-mirror-rtl` class. Fails, in the library's TSX, on an icon element
 * (one whose class carries `material-symbols-rounded`) that draws such a
 * glyph by name without the class, or that draws an icon a consumer passes
 * (`{icon}`, `{item.icon}`) without `mirrorClass`, which decides it per name.
 */
const directionSource = read(join(repoRoot, 'src', 'behaviors', 'direction.ts'));
const setBody = /DIRECTIONAL_ICONS = new Set\(\[([\s\S]*?)\]\)/.exec(directionSource)?.[1] ?? '';
const DIRECTIONAL = [...setBody.matchAll(/'([a-z_]+)'/g)].map((m) => m[1]);
if (DIRECTIONAL.length === 0) errors.push('src/behaviors/direction.ts — DIRECTIONAL_ICONS could not be read.');
const glyph = new RegExp(`(^|[^a-z_])(${DIRECTIONAL.join('|')})([^a-z_]|$)`);
let icons = 0;
function tsxFiles(dir, found = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) tsxFiles(full, found);
    else if (entry.name.endsWith('.tsx') && !/\.(stories|test)\.tsx$/.test(entry.name) && !/demo/.test(entry.name)) found.push(full);
  }
  return found;
}
for (const file of [...tsxFiles(join(repoRoot, 'src', 'components')), ...tsxFiles(join(repoRoot, 'src', 'chat'))]) {
  const text = read(file);
  for (const m of text.matchAll(/className=(\{\[?[^>]*?material-symbols-rounded[\s\S]*?|"[^"]*material-symbols-rounded[^"]*"[^>]*?)>/g)) {
    const cls = m[1];
    // The element's children, up to its closing tag.
    const close = text.indexOf('</', m.index + m[0].length);
    const children = text.slice(m.index + m[0].length, close === -1 ? undefined : close);
    const line = text.slice(0, m.index).split('\n').length;
    if (/ds-mirror-rtl|mirrorClass\(/.test(cls)) {
      icons += 1;
      continue;
    }
    if (glyph.test(children)) {
      errors.push(`${display(file)}:${line} — draws a directional glyph without ds-mirror-rtl, so it points the wrong way in a right-to-left page. Add the class.`);
    } else if (/\{[\w.?]*[iI]con\}/.test(children.trim()) && /typeof [\w.?]*[iI]con === 'string'|iconClass|material-symbols-rounded/.test(cls)) {
      errors.push(`${display(file)}:${line} — draws an icon a consumer names without mirrorClass(), so a directional one (a send arrow) points the wrong way in a right-to-left page.`);
    }
  }
}

if (errors.length > 0) {
  console.error('✗ Logical property validation failed:');
  for (const error of errors) console.error(`    - ${error}`);
  console.error(`  ${errors.length} problem(s).`);
  process.exit(1);
}

console.log(
  `✓ Layout follows the reading direction — ${declarations} declarations across ${files.length} stylesheets, ${sanctioned} sanctioned physical sides; ${icons} icon elements mirror their directional glyphs`
);
