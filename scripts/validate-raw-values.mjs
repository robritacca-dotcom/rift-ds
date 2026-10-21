#!/usr/bin/env node
/**
 * validate-raw-values.mjs
 *
 * Holds the library's component CSS to the token rule CLAUDE.md states:
 * never a hardcoded colour, and no raw pixel value where a token belongs.
 * The semantic token files are held by validate-token-references.mjs; this
 * is the same guarantee one tier down, in the CSS that ships beside every
 * component (src/ outside src/tokens/ and src/fonts/, which are where raw
 * values legitimately live).
 *
 *   1. Hex colours need a sanction. A hex colour in a declaration value
 *      fails unless a `ds-allow(<category>): <reason>` directive for one of
 *      HEX_CATEGORIES sits in the rule that holds it, or in the comment that
 *      leads into that rule, or the file header carries the `ds-allow-file`
 *      form. Mechanical scope, so "covers the section it sits at" (the
 *      grammar validate-css-directives.mjs owns) means the enclosing rule
 *      here, never a banner fifty lines up.
 *   2. Pixel literals only go down. The library has far too many to fix in
 *      one change, so a ratchet holds them instead: PX_BASELINE_FILE records
 *      each file's count of unsanctioned px literals, and a file that rises
 *      above its entry fails. A file that falls below it fails too, until
 *      the baseline is lowered with `--update` (which refuses to raise any
 *      entry), so the recorded number is always the true one and every
 *      improvement is locked in. A new file starts at zero. Not counted:
 *      `0px`, values inside an @media or @container condition (the
 *      breakpoint set owns those), and values a directive for one of
 *      PX_CATEGORIES sanctions under the rule-1 scope.
 *
 * Comments are blanked before scanning, so a hex or px written in prose
 * (a Figma note, a geometry derivation) is never a finding.
 *
 * Runs in the validate-registry chain. `node scripts/validate-raw-values.mjs
 * --update` rewrites the baseline after a cleanup.
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const PX_BASELINE_FILE = 'scripts/raw-values-baseline.json';
const SCAN_ROOT = 'src';
const EXCLUDED_DIRS = ['src/tokens/', 'src/fonts/'];

/** Directive categories that sanction a raw colour. */
const HEX_CATEGORIES = ['color', 'platform', 'mockup'];
/** Directive categories that sanction a raw pixel value. */
const PX_CATEGORIES = ['icon-size', 'typography', 'platform', 'mockup', 'breakpoint', 'motion'];

const update = process.argv.includes('--update');
const read = (rel) => readFileSync(join(repoRoot, rel), 'utf8').replace(/\r\n/g, '\n');
const blankComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
const lineOf = (text, index) => text.slice(0, index).split('\n').length;

const files = readdirSync(join(repoRoot, SCAN_ROOT), { withFileTypes: true, recursive: true })
  .filter((e) => e.isFile() && e.name.endsWith('.css'))
  .map((e) => relative(repoRoot, join(e.parentPath ?? e.path, e.name)).replace(/\\/g, '/'))
  .filter((f) => !EXCLUDED_DIRS.some((dir) => f.startsWith(dir)))
  .sort();

const directive = (categories, form = 'ds-allow') =>
  new RegExp(`${form}\\((?:${categories.join('|')})\\):\\s*\\S`);

const errors = [];
const counts = {};
let hexChecked = 0;
let hexSanctioned = 0;

for (const file of files) {
  const raw = read(file);
  const source = blankComments(raw);
  const header = raw.slice(0, 2000);
  const hexFileWide = directive(HEX_CATEGORIES, 'ds-allow-file').test(header);
  const pxFileWide = directive(PX_CATEGORIES, 'ds-allow-file').test(header);

  // For every offset, the start of the window a directive must sit in: from
  // the structural character before the enclosing rule's selector (so the
  // rule's lead-in comment counts) up to the value itself.
  const windowStart = (index) => {
    let depth = 0;
    for (let i = index - 1; i >= 0; i--) {
      const ch = source[i];
      if (ch === '}') depth += 1;
      else if (ch === '{') {
        if (depth === 0) {
          for (let j = i - 1; j >= 0; j--) {
            if (source[j] === '}' || source[j] === '{' || source[j] === ';') return j + 1;
          }
          return 0;
        }
        depth -= 1;
      }
    }
    return 0;
  };
  const sanctioned = (index, categories) => directive(categories).test(raw.slice(windowStart(index), index));

  // Ranges of @media / @container preludes, whose px are breakpoints.
  const conditionRanges = [...source.matchAll(/@(?:media|container)[^{]*\{/g)].map((m) => [m.index, m.index + m[0].length]);
  const inCondition = (index) => conditionRanges.some(([a, b]) => index >= a && index < b);

  let px = 0;
  for (const decl of source.matchAll(/(?<=[{;\s])(--?[\w-]+|[a-z-]+)\s*:\s*([^;{}]+)(?=[;}])/g)) {
    const value = decl[2];
    const valueStart = decl.index + decl[0].length - value.length;

    for (const m of value.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
      const at = valueStart + m.index;
      hexChecked += 1;
      if (hexFileWide || sanctioned(at, HEX_CATEGORIES)) {
        hexSanctioned += 1;
        continue;
      }
      errors.push(
        `${file}:${lineOf(raw, at)} — raw colour ${m[0]}: use a semantic --color-* token, or sanction it in ` +
          `the rule with ds-allow(${HEX_CATEGORIES.join('|')}): <reason>`
      );
    }

    if (pxFileWide) continue;
    for (const m of value.matchAll(/(?<![\w.-])(-?\d*\.?\d+)px\b/g)) {
      const at = valueStart + m.index;
      if (Number(m[1]) === 0 || inCondition(at) || sanctioned(at, PX_CATEGORIES)) continue;
      px += 1;
    }
  }
  if (px > 0) counts[file] = px;
}

const baselinePath = join(repoRoot, PX_BASELINE_FILE);
const baseline = existsSync(baselinePath) ? JSON.parse(readFileSync(baselinePath, 'utf8')).files ?? {} : {};
const total = Object.values(counts).reduce((a, b) => a + b, 0);

if (update) {
  // With no baseline yet, the first --update seeds it from today's counts.
  const seeding = !existsSync(baselinePath);
  const raised = seeding ? [] : Object.entries(counts).filter(([file, n]) => n > (baseline[file] ?? 0));
  if (raised.length > 0) {
    console.error('✗ Raw values — refusing to raise the px baseline. Use tokens instead:');
    for (const [file, n] of raised) console.error(`    - ${file}: ${baseline[file] ?? 0} → ${n}`);
    process.exit(1);
  }
  const body = {
    $comment:
      'Written by scripts/validate-raw-values.mjs --update. Each library CSS file\'s count of unsanctioned px literals; a file may only go down. Never raise an entry by hand.',
    total,
    files: counts,
  };
  writeFileSync(baselinePath, JSON.stringify(body, null, 2) + '\n');
  console.log(`✓ Raw values — px baseline written: ${total} literals across ${Object.keys(counts).length} files.`);
  if (errors.length === 0) process.exit(0);
}

for (const [file, n] of Object.entries(counts)) {
  const allowed = baseline[file] ?? 0;
  if (n > allowed) {
    errors.push(
      `${file} — ${n} raw px literals, above its baseline of ${allowed}. Use a spacing, radius, border or ` +
        'size token, or sanction the value in its rule with a ds-allow directive.'
    );
  } else if (n < allowed) {
    errors.push(
      `${file} — ${n} raw px literals, below its baseline of ${allowed}. Lock the improvement in with ` +
        '`node scripts/validate-raw-values.mjs --update`.'
    );
  }
}
for (const [file, allowed] of Object.entries(baseline)) {
  if (!(file in counts) && allowed > 0) {
    errors.push(
      `${file} — baseline records ${allowed} px literals but ${existsSync(join(repoRoot, file)) ? 'it has none' : 'the file is gone'}. ` +
        'Run `node scripts/validate-raw-values.mjs --update`.'
    );
  }
}

if (errors.length > 0) {
  console.error('✗ Raw values validation failed:');
  for (const error of errors) console.error(`    - ${error}`);
  process.exit(1);
}

console.log(
  `✓ Raw values — ${files.length} library stylesheets: ${hexChecked} hex colours, all ${hexSanctioned} sanctioned; ` +
    `${total} raw px literals, none above the baseline.`
);
