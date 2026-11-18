#!/usr/bin/env node
/**
 * validate-figma-nodes.mjs
 *
 * Advisory only: it never fails a step, a build, `verify`, CI or a ship.
 * Keeping the Rift DS Figma kit (FIGMA_FILE_URL in scripts/brand.mjs) in
 * step with the code is the owner's call, so this script nudges and the
 * owner decides. The site cannot break on what it reports:
 * website/src/data/figma-nodes.ts links the Figma community page for any
 * route with no entry or an entry that is not a node id.
 *
 * It reads website/src/data/figma-nodes.json, the one home of where each
 * docs page lives in the kit, and prints a warning for:
 *
 *   1. Shape: a missing `components` or `pages` key, or a value that is not
 *      a node id in URL form ("88-96").
 *   2. Components, both directions: a component in
 *      src/components/registry.json or a widget in src/chat/registry.json
 *      with no frame yet (the `new-figma-component` skill draws one), and a
 *      key naming a slug neither registry knows.
 *   3. Pages: a route key with no page.tsx under website/src/app/.
 *
 * It cannot prove a node id still exists in the Figma file (that needs the
 * Figma API); a frame rebuilt under a new id is updated here by hand. Runs in
 * the validate-registry chain, which it never stops: it reads source files
 * only.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { repoRoot } from './lib/fs.mjs';

const readJson = (path) => JSON.parse(readFileSync(join(repoRoot, path), 'utf8'));

const MAP_PATH = 'website/src/data/figma-nodes.json';
const NODE_ID = /^\d+-\d+$/;

const map = readJson(MAP_PATH);
const notes = [];

for (const key of ['components', 'pages']) {
  if (!(key in map)) notes.push(`${MAP_PATH} is missing "${key}".`);
}

const components = map.components ?? {};
const pages = map.pages ?? {};

for (const [key, id] of [...Object.entries(components), ...Object.entries(pages)]) {
  if (typeof id !== 'string' || !NODE_ID.test(id)) {
    notes.push(`"${key}" maps to ${JSON.stringify(id)}, not a node id like "88-96".`);
  }
}

const registered = new Set([
  ...readJson('src/components/registry.json').components.map((c) => c.slug),
  ...readJson('src/chat/registry.json').widgets.map((w) => w.slug),
]);

const unmapped = [...registered].filter((slug) => !(slug in components));
for (const slug of Object.keys(components)) {
  if (!registered.has(slug)) {
    notes.push(`"${slug}" in ${MAP_PATH} is not a registered component or widget slug.`);
  }
}

for (const route of Object.keys(pages)) {
  const file = join(repoRoot, 'website/src/app', route, 'page.tsx');
  if (!route.startsWith('/') || !existsSync(file)) {
    notes.push(`Page route "${route}" in ${MAP_PATH} has no website/src/app${route}/page.tsx.`);
  }
}

if (unmapped.length > 0) {
  notes.push(
    `${unmapped.length} component${unmapped.length === 1 ? ' has' : 's have'} no Figma frame yet (${unmapped.join(', ')}). Optional: run the new-figma-component skill when you want them in the kit.`,
  );
}

if (notes.length > 0) {
  console.log(`! Figma nodes (advisory, never blocks): ${notes.length} note${notes.length === 1 ? '' : 's'}`);
  for (const note of notes) console.log(`  - ${note}`);
} else {
  console.log(
    `✓ Figma nodes: ${Object.keys(components).length} components and ${Object.keys(pages).length} pages mapped to the kit`,
  );
}
