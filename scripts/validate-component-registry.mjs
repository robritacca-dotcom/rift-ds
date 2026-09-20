#!/usr/bin/env node
/**
 * Validates src/components/registry.json against the filesystem.
 *
 * Every folder in src/components must appear in exactly one of the
 * registry's two lists (`components` or `docOnlyHelpers`), and every
 * registry entry must have a folder. Runs before every build — library,
 * Storybook, and website — so the public component count can never
 * silently drift from reality.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const componentsDir = join(repoRoot, 'src', 'components');

/**
 * macOS (Finder copy-paste, iCloud sync conflicts) creates duplicates
 * named "original 2.ext". They silently shadow the real file — fail the
 * build so they get deleted instead of committed.
 */
const FINDER_DUPLICATE = /^.+ [2-9]\d*(\.[^ ]+)?$/;
const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  '.venv',
  'dist',
  'out',
  'build',
  'storybook-static',
]);

function findFinderDuplicates(dir, found = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (FINDER_DUPLICATE.test(entry.name)) {
      found.push(relative(repoRoot, full));
      continue;
    }
    if (entry.isDirectory()) findFinderDuplicates(full, found);
  }
  return found;
}

const registry = JSON.parse(
  readFileSync(join(componentsDir, 'registry.json'), 'utf8')
);

const folders = readdirSync(componentsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const componentNames = registry.components.map((c) => c.name);
// A component's implementation folder is its name unless `folder` points at a
// shared one (the nine chart components live in Chart/).
const componentFolder = (c) => c.folder ?? c.name;
const registered = [
  ...new Set([
    ...registry.components.map(componentFolder),
    ...registry.docOnlyHelpers,
  ]),
].sort();

const missingFromRegistry = folders.filter((f) => !registered.includes(f));
const missingFromDisk = registered.filter((r) => !folders.includes(r));
const duplicates = componentNames.filter((c) =>
  registry.docOnlyHelpers.includes(c)
);

/*
 * Metadata checks. Every field below is consumed somewhere real — the slug
 * routes the website, the label names the sidebar entry, the description
 * becomes the page title and feeds sidebar search, and `client` records
 * whether the component declares 'use client'. A malformed entry would
 * otherwise surface as a broken page or a missing title, far from the cause.
 */
const metaErrors = [];
const seenSlugs = new Map();
const seenLabels = new Map();

/*
 * Category checks. Categories are objects because their label and description
 * are displayed — the /components index sections, the sidebar accordions, and
 * the chat corpus all read them. Ids are the index's `#<id>` anchor namespace
 * and have historically been routes, so they stay disjoint from component
 * slugs rather than ever ambiguously naming both a section and a component.
 */
const categoryIds = registry.categories.map((cat) => cat.id);

for (const cat of registry.categories) {
  const where = `categories["${cat.id ?? '?'}"]`;
  for (const field of ['id', 'label', 'description']) {
    if (typeof cat[field] !== 'string' || cat[field].trim() === '') {
      metaErrors.push(`${where}.${field} is missing or empty`);
    }
  }
  if (cat.id && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(cat.id)) {
    metaErrors.push(`${where}.id "${cat.id}" is not kebab-case`);
  }
  if (cat.description && !cat.description.trim().endsWith('.')) {
    metaErrors.push(`${where}.description should end in a full stop`);
  }
  if (cat.description && cat.description.length > 160) {
    metaErrors.push(`${where}.description is ${cat.description.length} chars — keep it under 160`);
  }
}

const dupCategoryIds = categoryIds.filter((id, i) => categoryIds.indexOf(id) !== i);
if (dupCategoryIds.length > 0) {
  metaErrors.push(`duplicate category ids: ${[...new Set(dupCategoryIds)].join(', ')}`);
}
if (JSON.stringify(categoryIds) !== JSON.stringify([...categoryIds].sort())) {
  metaErrors.push('categories must be sorted alphabetically by id');
}
for (const cat of registry.categories) {
  if (cat.id && !registry.components.some((c) => c.category === cat.id)) {
    metaErrors.push(
      `categories["${cat.id}"] has no components — an empty category is drift, remove it or assign it a component`
    );
  }
}

for (const c of registry.components) {
  const where = `components["${c.name}"]`;
  for (const field of ['name', 'label', 'slug', 'description', 'category']) {
    if (typeof c[field] !== 'string' || c[field].trim() === '') {
      metaErrors.push(`${where}.${field} is missing or empty`);
    }
  }
  if (typeof c.client !== 'boolean') {
    metaErrors.push(`${where}.client must be a boolean (does the component declare 'use client'?)`);
  }
  if (c.slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(c.slug)) {
    metaErrors.push(`${where}.slug "${c.slug}" is not kebab-case`);
  }
  if (c.description && !c.description.trim().endsWith('.')) {
    metaErrors.push(`${where}.description should end in a full stop`);
  }
  if (c.description && c.description.length > 160) {
    metaErrors.push(`${where}.description is ${c.description.length} chars — keep it under 160`);
  }
  if (c.category && !categoryIds.includes(c.category)) {
    metaErrors.push(
      `${where}.category "${c.category}" is not in the registry's categories list — ` +
        `add it deliberately rather than inventing a category per component`
    );
  }
  if (c.slug) {
    if (seenSlugs.has(c.slug)) metaErrors.push(`slug "${c.slug}" is used by both ${seenSlugs.get(c.slug)} and ${c.name}`);
    else seenSlugs.set(c.slug, c.name);
    if (categoryIds.includes(c.slug)) {
      metaErrors.push(
        `slug "${c.slug}" collides with a category id — slugs route /components/* pages and ` +
          `ids anchor the index sections, so the two sets must stay disjoint`
      );
    }
  }
  if (c.label) {
    if (seenLabels.has(c.label)) metaErrors.push(`label "${c.label}" is used by both ${seenLabels.get(c.label)} and ${c.name}`);
    else seenLabels.set(c.label, c.name);
  }
}

// `client` must match reality, or the registry is documenting a bug.
for (const c of registry.components) {
  const file = join(componentsDir, componentFolder(c), `${c.name}.tsx`);
  if (!existsSync(file)) continue;
  const declares = /^'use client'/m.test(readFileSync(file, 'utf8'));
  if (declares !== c.client) {
    metaErrors.push(
      `components["${c.name}"].client is ${c.client} but ${c.name}.tsx ` +
        `${declares ? 'declares' : 'does not declare'} 'use client'`
    );
  }
}

/*
 * Every public component needs at least one stories file. Stories are not
 * just docs here: `npm run test` renders every story headlessly and runs
 * axe against it, so a component without one silently gets zero render
 * tests, zero a11y coverage, and no Storybook page — and nothing else in
 * the chain would notice.
 */
const missingStories = registry.components
  .filter(
    (c) =>
      !readdirSync(join(componentsDir, componentFolder(c))).some((f) =>
        f.startsWith(`${c.name}.stories.`)
      )
  )
  .map((c) => c.name);
if (missingStories.length > 0) {
  metaErrors.push(
    `no stories file — these components get no render tests, no a11y ` +
      `coverage, and no Storybook page: ${missingStories.join(', ')}`
  );
}

const sortedNames = [...componentNames].sort();
if (JSON.stringify(componentNames) !== JSON.stringify(sortedNames)) {
  metaErrors.push('components must be sorted alphabetically by name');
}

const finderDuplicates = findFinderDuplicates(repoRoot);

let failed = false;

if (metaErrors.length > 0) {
  failed = true;
  console.error('✗ Component registry metadata is invalid:');
  for (const e of metaErrors) console.error(`    - ${e}`);
}

if (finderDuplicates.length > 0) {
  failed = true;
  console.error(
    `✗ Finder-style duplicate files (" 2" copies) — delete them:\n` +
      finderDuplicates.map((f) => `    - ${f}`).join('\n')
  );
}

if (missingFromRegistry.length > 0) {
  failed = true;
  console.error(
    `✗ Component folders missing from src/components/registry.json:\n` +
      missingFromRegistry.map((f) => `    - ${f}`).join('\n') +
      `\n  Add each to "components" (public) or "docOnlyHelpers" (internal).`
  );
}

if (missingFromDisk.length > 0) {
  failed = true;
  console.error(
    `✗ Registry entries with no folder in src/components:\n` +
      missingFromDisk.map((r) => `    - ${r}`).join('\n')
  );
}

if (duplicates.length > 0) {
  failed = true;
  console.error(
    `✗ Listed in both "components" and "docOnlyHelpers": ${duplicates.join(', ')}`
  );
}

if (failed) {
  process.exit(1);
}

console.log(
  `✓ Component registry in sync — ${registry.components.length} public components, ` +
    `${registry.docOnlyHelpers.length} doc-only helpers.`
);
