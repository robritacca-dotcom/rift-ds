#!/usr/bin/env node
/**
 * Validates that component pages have real, centralized browser-tab titles:
 *
 *   1. website/src/app/components/<slug>/layout.tsx exists — without it the
 *      page falls back to the site-wide default title ("Robert Ritacca —
 *      Principal Product Designer"), which is what happened to 9 component
 *      pages before this guard existed.
 *   2. That layout resolves its metadata through componentPageMetadata("<slug>"),
 *      so the title and description come from src/components/registry.json
 *      rather than a second copy living in the layout
 *      so the tab title can never drift from the sidebar label / breadcrumb.
 *   3. No website source hardcodes a spelled-out component count (e.g.
 *      "Forty-two React components") — counts must derive from COMPONENT_COUNT.
 *   4. No page module caps prose with a ch-based max-width (e.g.
 *      `max-width: 72ch`) — doc-section paragraphs run the full content
 *      column by convention, and ad-hoc measure caps kept creeping back in
 *      and making text wrap early. Constrain the layout column, not the
 *      paragraph.
 *
 * Guards the "stale title after a page move" drift class. Runs in the
 * validate-registry chain before every build. Mirrors validate-website-surfaces.mjs.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

// Normalize CRLF so Windows checkouts validate identically to CI.
const read = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

const registry = JSON.parse(
  read(join(repoRoot, 'src', 'components', 'registry.json'))
);

/** "AlertDialog" -> "alert-dialog"; folder-name exceptions listed inline. */
const componentsDir = join(repoRoot, 'website', 'src', 'app', 'components');

const missingLayout = [];
const notCentralized = [];

// slug and label are stored in the registry, so a name-to-slug exception is
// data, not a special case each validator has to remember.
for (const { name, slug } of registry.components) {
  const layoutPath = join(componentsDir, slug, 'layout.tsx');
  if (!existsSync(layoutPath)) {
    missingLayout.push(
      `${name} → website/src/app/components/${slug}/layout.tsx (page falls back to the default title)`
    );
    continue;
  }
  // Component pages must use componentPageMetadata(slug), which resolves both
  // title and description from the registry. Plain pageMetadata() would let a
  // second copy of the description live here and drift from registry.json.
  if (!read(layoutPath).includes(`componentPageMetadata("${slug}")`)) {
    notCentralized.push(
      `${name} → components/${slug}/layout.tsx should resolve its metadata via componentPageMetadata("${slug}")`
    );
  }
}

// Guard against hardcoded, spelled-out component counts anywhere in the site.
// Tens-based number words next to "component(s)" are always count claims — this
// deliberately ignores "one"/"a" so ordinary prose ("in one component") is fine.
const TENS = 'twenty|thirty|forty|fourty|fifty|sixty|seventy|eighty|ninety';
const ONES = 'one|two|three|four|five|six|seven|eight|nine';
const countRe = new RegExp(
  `\\b(${TENS})(?:[\\s-](${ONES}))?\\s+(?:react\\s+)?components?\\b`,
  'i'
);

const hardcodedCounts = [];
const chWidthCaps = [];
const chCapRe = /max-width:\s*[\d.]+ch/;
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      walk(full);
    } else if (/\.(tsx?|json)$/.test(entry.name)) {
      const m = read(full).match(countRe);
      if (m) {
        const rel = full.slice(repoRoot.length + 1).replace(/\\/g, '/');
        hardcodedCounts.push(`${rel} → "${m[0]}" (use \${COMPONENT_COUNT})`);
      }
    } else if (entry.name.endsWith('.css')) {
      const m = read(full).match(chCapRe);
      if (m) {
        const rel = full.slice(repoRoot.length + 1).replace(/\\/g, '/');
        chWidthCaps.push(
          `${rel} → "${m[0]}" (doc prose runs full column width — constrain the layout, not the paragraph)`
        );
      }
    }
  }
};
walk(join(repoRoot, 'website', 'src'));

let failed = false;
const fail = (msg) => {
  failed = true;
  console.error(`✗ ${msg}`);
};

for (const [what, list] of [
  ['Component pages with no layout.tsx (title falls back to the site default)', missingLayout],
  ['Component layouts not deriving their title from pageMetadata', notCentralized],
  ['Hardcoded spelled-out component counts (must use COMPONENT_COUNT)', hardcodedCounts],
  ['ch-based max-width caps on website CSS (early-wrapping prose)', chWidthCaps],
]) {
  if (list.length > 0) {
    fail(`${what}:\n` + list.map((l) => `    - ${l}`).join('\n'));
  }
}

if (failed) {
  process.exit(1);
}

console.log(
  `✓ Page titles in sync — ${registry.components.length} component pages each ` +
    `set a pageMetadata title; no hardcoded component counts.`
);
