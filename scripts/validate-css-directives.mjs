#!/usr/bin/env node
/**
 * Validates the grammar of ds-allow sanctioned-exception directives in CSS.
 *
 * A deliberate off-token value is sanctioned by a machine-readable line
 * inside a CSS comment at the site of the value:
 *
 *   ds-allow(<category>): <reason>        — covers the declaration/rule/section it sits at
 *   ds-allow-file(<category>): <reason>   — in the file header; whole file, that category
 *
 * The token-audit skill treats a ds-allow directive as the ONLY signal that a
 * raw value is sanctioned — it never maintains a list of components. That
 * design collapses if a directive is typo'd (ds-allow(icon) instead of
 * icon-size): the grep silently misses the sanction and the exception drifts
 * back into prose, which is the exact failure mode (ColorPicker's hsl()
 * exception hand-appended to the skill, 2026-07) this system replaces. So a
 * malformed directive fails the build instead.
 *
 * CATEGORIES below is the single authoritative category set. Extend it
 * deliberately — a new category is a design decision, not a spelling fix.
 * Scope (which values a directive covers) is judged by the reader, not
 * validated here; only the grammar is mechanical.
 *
 * Runs in the validate-registry chain before every build.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

export const CATEGORIES = new Set([
  'icon-size',
  'motion',
  'color',
  'mockup',
  // Type-scale values restated outside the token files — today only the
  // chat panel's container-width copy of the sub-display 768px step, which
  // cannot reference the value inside the token layer's media query.
  'typography',
]);

// Normalize CRLF so Windows checkouts validate identically to CI.
const read = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

/** Recursively collect .css files under a repo-relative directory. */
const cssFiles = (dir) =>
  readdirSync(join(repoRoot, dir), { withFileTypes: true, recursive: true })
    .filter((e) => e.isFile() && e.name.endsWith('.css'))
    .map((e) => relative(repoRoot, join(e.parentPath ?? e.path, e.name)));

const files = [...cssFiles('src'), ...cssFiles(join('website', 'src'))];

const malformed = [];
const unknownCategory = [];
const emptyReason = [];

const directiveRe = /ds-allow(-file)?\s*(\(([^)\n]*)\))?\s*(:)?[ \t]*([^\n]*)/g;

let directiveCount = 0;
const filesWithDirectives = new Set();
const categoriesSeen = new Set();

for (const file of files) {
  const source = read(join(repoRoot, file));
  // Directives live only inside comments; scan comment bodies so a stray
  // "ds-allow" in a selector or content string can't count as one.
  for (const commentMatch of source.matchAll(/\/\*[\s\S]*?\*\//g)) {
    for (const match of commentMatch[0].matchAll(directiveRe)) {
      const [, , parens, category, colon, rest] = match;
      const line = source.slice(0, commentMatch.index + match.index).split('\n').length;
      const at = `${file}:${line}`;
      directiveCount += 1;
      filesWithDirectives.add(file);

      if (!parens || !colon) {
        malformed.push(
          `${at} — "${match[0].trim().slice(0, 60)}" must be ds-allow(<category>): <reason>`
        );
        continue;
      }
      if (!CATEGORIES.has(category.trim())) {
        unknownCategory.push(
          `${at} — category "${category.trim()}" is not one of: ${[...CATEGORIES].join(', ')} ` +
            `(extend CATEGORIES in scripts/validate-css-directives.mjs deliberately if a new one is needed)`
        );
        continue;
      }
      if (rest.trim().length === 0) {
        emptyReason.push(`${at} — directive has no reason; say why the value cannot be a token`);
        continue;
      }
      categoriesSeen.add(category.trim());
    }
  }
}

let failed = false;
const fail = (msg) => {
  failed = true;
  console.error(`✗ ${msg}`);
};

for (const [what, list] of [
  ['Malformed ds-allow directives', malformed],
  ['ds-allow directives with an unknown category', unknownCategory],
  ['ds-allow directives with no reason', emptyReason],
]) {
  if (list.length > 0) {
    fail(`${what}:\n` + list.map((l) => `    - ${l}`).join('\n'));
  }
}

if (failed) {
  process.exit(1);
}

console.log(
  `✓ CSS exception directives well-formed — ${directiveCount} ds-allow directive(s) across ` +
    `${filesWithDirectives.size} file(s) (categories: ${[...categoriesSeen].sort().join(', ')}).`
);
