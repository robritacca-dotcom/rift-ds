#!/usr/bin/env node
/**
 * validate-nav-panels.mjs
 *
 * Holds the mega panels' icon tables in website/src/config/navigation.ts to
 * the sidebar arrays their rows are built from, in both directions:
 *
 *   1. Every page in a panel-backed sidebar array has an icon. The panel
 *      groups are derived from the arrays, so a new page joins its panel by
 *      existing; the icon is the one thing it still needs by hand, and a
 *      missing one falls back to a generic glyph nothing would flag. The
 *      docs table also feeds the command palette's rows.
 *   2. Every icon belongs to a listed page. An orphan is a renamed or
 *      retired page's icon left behind.
 *
 * The group membership itself needs no check: no panel group is a hand
 * list (the Docs panel's Learn group takes every docs page the other groups
 * and the showcase do not claim), so it cannot leave a page out.
 *
 * Runs in the validate-registry chain: it reads source files only.
 */
import { readFileSync } from 'node:fs';
import { NAVIGATION_FILE, navLinks } from './nav-links.mjs';

/* Each icon table, and the sidebar array whose pages its panel shows. */
const PANELS = [
  { table: 'DOC_ITEM_ICONS', links: 'docsSidebarLinks' },
  { table: 'FOUNDATION_ICONS', links: 'foundationsSidebarLinks' },
];

const source = readFileSync(NAVIGATION_FILE, 'utf8');

/** The keys of `const <name>: Record<string, string> = { … };`. */
function iconKeys(name) {
  const match = source.match(new RegExp(`const ${name}: Record<string, string> = \\{([^}]*)\\}`));
  if (!match) throw new Error(`navigation.ts: no icon table named ${name}`);
  return new Set([...match[1].matchAll(/"([^"]+)"\s*:/g)].map((m) => m[1]));
}

const errors = [];
let checked = 0;
for (const { table, links } of PANELS) {
  const icons = iconKeys(table);
  const hrefs = new Set(navLinks(source, links).map((l) => l.href));
  checked += hrefs.size;
  for (const href of hrefs) {
    if (!icons.has(href)) errors.push(`${href} is in ${links} but has no icon in ${table}`);
  }
  for (const href of icons) {
    if (!hrefs.has(href)) errors.push(`${table} has an icon for ${href}, which ${links} does not list`);
  }
}

if (errors.length) {
  console.error('✗ Nav panels:');
  for (const error of errors) console.error(`    - ${error}`);
  process.exit(1);
}
console.log(`✓ Nav panels: ${checked} panel pages, each with an icon and no orphans.`);
