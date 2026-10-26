#!/usr/bin/env node
/**
 * Holds every table to one look, drawn from the --color-table-* family.
 *
 * On 2026-10-25 the site had three table drawings that disagreed on the
 * header, the body and the hover: the library Table, Prose's markdown
 * tables, and hand-written CSS copied into three blueprints page modules.
 * Each was on legal tokens, so no other check saw it. The fix gave tables a
 * token family of their own; this script keeps it the only source.
 *
 * Rules:
 *   - The drawing files (OWNERS below) may colour a table part only through
 *     a --color-table-* token: any var(--color-...) in a background or
 *     border on a table selector must be one. Focus outlines are exempt,
 *     since the focus ring is the action colour's job everywhere.
 *   - Every other stylesheet under src/ and website/src/ may not colour a
 *     table part at all: no background, border, box-shadow or outline on a
 *     selector that names a table element (table, thead, tbody, tfoot, tr,
 *     th, td) or a ds-table class. Layout is fine there (a block keeping its
 *     cells on one line, a mock hiding a column). A real exception goes in
 *     SANCTIONED with its reason.
 *
 * Runs in the validate-registry chain.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const posix = (p) => p.split('\\').join('/');

/** The stylesheets that draw tables. */
const OWNERS = new Set([
  'src/components/Table/Table.css',
  'src/components/DataTable/DataTable.css',
  'src/components/Prose/Prose.css',
  'website/src/components/MarkdownTable/MarkdownTable.module.css',
]);

/** Stylesheets outside OWNERS allowed to colour a table part, with the reason. */
const SANCTIONED = new Map([]);

// TableToolbar's `ds-table-toolbar` classes share the prefix but draw the
// control bar beside a table, never a table part, so they are left out.
const TABLE_SELECTOR = /(^|[\s>+~,(])(table|thead|tbody|tfoot|tr|th|td)(?![\w-])|\.ds-table\b(?!-toolbar)/;
const COLOUR_PROPERTY = /^(background(-color)?|border(-(top|right|bottom|left|block|inline|block-start|block-end|inline-start|inline-end))?(-color)?|box-shadow|outline(-color)?)$/;

const blankComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));

function cssFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...cssFiles(full));
    else if (entry.endsWith('.css')) out.push(full);
  }
  return out;
}

const errors = [];
const files = [...cssFiles(join(repoRoot, 'src')), ...cssFiles(join(repoRoot, 'website', 'src'))];
let checkedRules = 0;

for (const full of files) {
  const rel = posix(relative(repoRoot, full));
  const source = blankComments(readFileSync(full, 'utf8').replace(/\r\n/g, '\n'));
  const owner = OWNERS.has(rel);
  for (const match of source.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = match[1].trim();
    if (!TABLE_SELECTOR.test(selector) || selector.startsWith('@')) continue;
    checkedRules += 1;
    const line = source.slice(0, match.index + match[0].indexOf(selector)).split('\n').length;
    for (const declaration of match[2].split(';')) {
      const colon = declaration.indexOf(':');
      if (colon === -1) continue;
      const property = declaration.slice(0, colon).trim();
      const value = declaration.slice(colon + 1).trim();
      if (!COLOUR_PROPERTY.test(property)) continue;
      if (owner) {
        if (property.startsWith('outline')) continue;
        for (const token of value.matchAll(/var\((--color-[\w-]+)/g)) {
          if (!token[1].startsWith('--color-table-')) {
            errors.push(`${rel}:${line} — "${selector}" colours a table part with ${token[1]}; use a --color-table-* token`);
          }
        }
      } else if (!SANCTIONED.has(rel) && value !== 'none' && value !== '0') {
        errors.push(`${rel}:${line} — "${selector}" sets ${property} on a table part; tables are drawn by ${[...OWNERS].join(', ')}`);
      }
    }
  }
}

for (const owner of OWNERS) {
  if (!files.some((f) => posix(relative(repoRoot, f)) === owner)) errors.push(`${owner} is listed in OWNERS but does not exist`);
}
for (const rel of SANCTIONED.keys()) {
  if (!files.some((f) => posix(relative(repoRoot, f)) === rel)) errors.push(`${rel} is SANCTIONED but does not exist`);
}

if (errors.length) {
  console.error('\n✗ Table styles validation failed:\n');
  for (const e of errors) console.error(`  - ${e}`);
  console.error('');
  process.exit(1);
}
console.log(`✓ Table styles in one family — ${checkedRules} table rules across ${files.length} stylesheets; only the drawing files colour a table, and only through --color-table-*.`);
