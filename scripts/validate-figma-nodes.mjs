#!/usr/bin/env node
/**
 * validate-figma-nodes.mjs
 *
 * Guards website/src/data/figma-nodes.json, the one home of where each docs
 * page lives in the Rift DS Figma kit (FIGMA_FILE_URL in scripts/brand.mjs).
 * PageLinks reads it through website/src/data/figma-nodes.ts to draw the
 * Figma button beside Storybook. Checks:
 *
 *   1. Shape: `components` and `pages`, every value a Figma node
 *      id in URL form ("88-96").
 *   2. Components, both directions: every component in
 *      src/components/registry.json and every widget in
 *      src/chat/registry.json has a frame, and no key names a slug neither
 *      registry knows, so a new component cannot ship without its Figma
 *      link and a renamed one cannot leave a dead key behind.
 *   3. Pages: every route key has a page.tsx under website/src/app/.
 *
 * It cannot prove a node id still exists in the Figma file (that needs the
 * Figma API); a frame rebuilt under a new id is updated here by hand. Runs in
 * the validate-registry chain: it reads source files only.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (path) => JSON.parse(readFileSync(join(repoRoot, path), 'utf8'));

const MAP_PATH = 'website/src/data/figma-nodes.json';
const NODE_ID = /^\d+-\d+$/;

const map = readJson(MAP_PATH);
const errors = [];

for (const key of ['components', 'pages']) {
  if (!(key in map)) errors.push(`${MAP_PATH} is missing "${key}".`);
}

const components = map.components ?? {};
const pages = map.pages ?? {};

for (const [key, id] of [...Object.entries(components), ...Object.entries(pages)]) {
  if (typeof id !== 'string' || !NODE_ID.test(id)) {
    errors.push(`"${key}" maps to ${JSON.stringify(id)}, not a node id like "88-96".`);
  }
}

const registered = new Set([
  ...readJson('src/components/registry.json').components.map((c) => c.slug),
  ...readJson('src/chat/registry.json').widgets.map((w) => w.slug),
]);

for (const slug of registered) {
  if (!(slug in components)) {
    errors.push(`Component "${slug}" has no Figma frame in ${MAP_PATH} (components).`);
  }
}
for (const slug of Object.keys(components)) {
  if (!registered.has(slug)) {
    errors.push(`"${slug}" in ${MAP_PATH} is not a registered component or widget slug.`);
  }
}

for (const route of Object.keys(pages)) {
  const file = join(repoRoot, 'website/src/app', route, 'page.tsx');
  if (!route.startsWith('/') || !existsSync(file)) {
    errors.push(`Page route "${route}" in ${MAP_PATH} has no website/src/app${route}/page.tsx.`);
  }
}

if (errors.length) {
  console.error(`✗ validate-figma-nodes: ${errors.length} problem${errors.length === 1 ? '' : 's'}`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(
  `✓ Figma nodes: ${Object.keys(components).length} components and ${Object.keys(pages).length} pages mapped to the kit`,
);
