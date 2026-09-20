#!/usr/bin/env node
/**
 * validate-page-summaries.mjs
 *
 * Guards the page-summaries registry (website/src/data/page-summaries.json)
 * — the per-page content for the chat FAB's TLDR panel — so a page can never
 * ship without a summary, and a summary can never ship malformed:
 *
 *   1. Coverage: every route on the site (scripts/site-routes.mjs) either
 *      has a summary or is deliberately without one. A static route must
 *      have an entry in the registry's `routes` map; a component page is
 *      covered by the component registry's description; a case-study page
 *      by its registry's dek; an essay by the registry's `essays` map. The
 *      chromeless routes (parsed from website/src/config/chromeless.ts,
 *      their one authoritative home) render no FAB and so need no entry.
 *      Without this check, a new page ships with the plain button and
 *      nobody notices — the exact drift this validator exists to catch.
 *   2. Both directions: an entry for a route or essay that no longer exists
 *      fails too, so a renamed page cannot leave its summary orphaned.
 *   3. Shape: titles present; summary text non-empty, at most 160
 *      characters (the panel is a TLDR — a paragraph is a failure), ending
 *      in a full stop, and free of em dashes (content-design.md's ban
 *      covers shipped copy, and this copy ships); one or two chips per
 *      entry, each with id, label, and prompt.
 *   4. Chip labels fit the suggestion chip budget (SUGGESTION_MAX_CHARS,
 *      read from website/src/lib/chat-suggestions.ts — a chip never wraps).
 *      The component pages' derived label template is re-derived here
 *      against every registered component label; the template string lives
 *      in website/src/data/page-summaries.ts (componentChipLabel) and a
 *      change there needs the matching change here.
 *
 * Runs in the validate-registry chain: it reads registries and source only,
 * never build output.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { siteRoutes } from './site-routes.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

// Normalize CRLF so Windows checkouts validate identically to CI.
const read = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

const MAX_TEXT_CHARS = 160;

const errors = [];

/* ---- Sources ---- */

const summaries = JSON.parse(
  read(join(repoRoot, 'website', 'src', 'data', 'page-summaries.json'))
);
const componentRegistry = JSON.parse(
  read(join(repoRoot, 'src', 'components', 'registry.json'))
);
/* The chip budget has one home; read it the way validate-chat-starters does. */
const suggestionsSource = read(
  join(repoRoot, 'website', 'src', 'lib', 'chat-suggestions.ts')
);
const budgetMatch = suggestionsSource.match(/export const SUGGESTION_MAX_CHARS\s*=\s*(\d+)/);
if (!budgetMatch) {
  console.error('✗ Could not read SUGGESTION_MAX_CHARS from chat-suggestions.ts');
  process.exit(1);
}
const maxChipChars = Number(budgetMatch[1]);

/* The chromeless set has one home; parse the Set literal out of it. */
const chromelessSource = read(
  join(repoRoot, 'website', 'src', 'config', 'chromeless.ts')
);
const chromelessBlock = chromelessSource.match(
  /CHROMELESS_ROUTES = new Set\(\[([\s\S]*?)\]\)/
);
if (!chromelessBlock) {
  console.error('✗ Could not read CHROMELESS_ROUTES from chromeless.ts');
  process.exit(1);
}
const chromeless = new Set(
  [...chromelessBlock[1].matchAll(/"([^"]+)"/g)].map((m) => m[1])
);

/* ---- Shape checks ---- */

const checkEntry = (where, entry) => {
  if (!entry || typeof entry !== 'object') {
    errors.push(`${where}: entry is not an object`);
    return;
  }
  if (!entry.title?.trim()) errors.push(`${where}: missing title`);
  const text = entry.text?.trim() ?? '';
  if (!text) {
    errors.push(`${where}: missing summary text`);
  } else {
    if (text.length > MAX_TEXT_CHARS)
      errors.push(`${where}: text is ${text.length} chars (max ${MAX_TEXT_CHARS} — it is a TLDR, shorten it)`);
    if (!text.endsWith('.')) errors.push(`${where}: text must end in a full stop`);
  }
  for (const field of ['title', 'text']) {
    if (entry[field]?.includes('—'))
      errors.push(`${where}: ${field} contains an em dash (banned in shipped copy — rewrite with a colon or comma)`);
  }
  const chips = entry.chips;
  if (!Array.isArray(chips) || chips.length < 1 || chips.length > 2) {
    errors.push(`${where}: needs 1 or 2 chips, has ${Array.isArray(chips) ? chips.length : 'none'}`);
    return;
  }
  for (const c of chips) {
    const label = c.label?.trim() ?? '';
    if (!c.id?.trim() || !label || !c.prompt?.trim()) {
      errors.push(`${where}: chip "${c.id ?? '?'}" needs id, label, and prompt`);
      continue;
    }
    if (label.length > maxChipChars)
      errors.push(`${where}: chip label "${label}" is ${label.length} chars (budget ${maxChipChars} — a chip never wraps)`);
    if (label.includes('—'))
      errors.push(`${where}: chip label "${label}" contains an em dash (banned in shipped copy)`);
  }
};

for (const [route, entry] of Object.entries(summaries.routes)) {
  checkEntry(`routes["${route}"]`, entry);
}

/* ---- Coverage: every route has a summary or a reason not to ---- */

const routes = siteRoutes();
const componentSlugs = new Set(componentRegistry.components.map((c) => c.slug));

for (const route of routes) {
  if (chromeless.has(route)) continue; // no FAB, no panel
  if (/^\/components\/[^/]+$/.test(route)) {
    const slug = route.split('/')[2];
    if (!componentSlugs.has(slug))
      errors.push(`${route}: component page not in src/components/registry.json — its summary cannot derive`);
    continue;
  }
  if (!summaries.routes[route]) {
    errors.push(
      `${route}: no summary — add an entry to website/src/data/page-summaries.json (or, for a chromeless page, register it in chromeless.ts)`
    );
  }
}

/* Both directions: no orphaned entries. */
const routeSet = new Set(routes);
for (const route of Object.keys(summaries.routes)) {
  if (!routeSet.has(route))
    errors.push(`routes["${route}"]: no such page on the site — remove or rename the entry`);
}

/* The derived component chip label must fit the budget for every label. */
for (const c of componentRegistry.components) {
  const label = `How do I use ${c.label}?`;
  if (label.length > maxChipChars)
    errors.push(
      `component "${c.name}": derived chip label "${label}" is ${label.length} chars (budget ${maxChipChars})`
    );
}

/* ---- Report ---- */

if (errors.length > 0) {
  console.error('✗ Page-summaries validation failed:');
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}

const covered = Object.keys(summaries.routes).length + componentSlugs.size;
console.log(
  `✓ Page summaries in sync — ${Object.keys(summaries.routes).length} written routes and ${componentSlugs.size} component pages derived (${covered} pages with a TLDR panel).`
);
