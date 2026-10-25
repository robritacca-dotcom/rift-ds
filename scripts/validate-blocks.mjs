#!/usr/bin/env node
/**
 * validate-blocks.mjs
 *
 * Guards the blocks: the whole starting pages `npx rift-ds init block`
 * copies into a consumer's app, held at their target paths under
 * src/cli/templates/blocks/ and listed in that folder's registry.json, the
 * one home of the list. Checks:
 *
 *   1. Structure: every block carries a kebab-case unique name, a label, a
 *      description of at most 160 characters ending in a full stop, a route
 *      starting with a slash, and a non-empty file list. The description
 *      ships verbatim on /docs/blocks and in the bin's listing.
 *   2. Files, both directions: every listed file exists and sits under
 *      app/ or components/ (the two places the bin knows how to write),
 *      and every file in the tree is listed by some block, so a file the
 *      bin would never write cannot sit in the package unseen.
 *   3. Closure: every relative import in a block's files resolves to a file
 *      that block also lists. A block that imports a shared file it does
 *      not write would install into an app as a broken import.
 *   4. The site, both directions: BLOCK_PREVIEWS in
 *      website/src/data/block-previews.tsx has exactly the registry's names,
 *      each block has its preview route under website/src/app/docs/blocks/
 *      and no route there lacks a block, and every preview route is in
 *      CHROMELESS_ROUTES, so the block renders as the whole page.
 *
 * Package subpath imports and git tracking are checked with the other
 * scaffold templates in validate-chat-widget.mjs, which covers this folder
 * beside chat/ and app/. Runs in the validate-registry chain: it reads
 * source files only, no build output.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, posix, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
const toPosix = (p) => p.split('\\').join('/');

const blocksDir = join(repoRoot, 'src', 'cli', 'templates', 'blocks');
const { blocks } = JSON.parse(read(join(blocksDir, 'registry.json')));
const errors = [];

/* 1. Structure. */
const names = new Set();
for (const block of blocks) {
  const where = `blocks registry → ${block.name ?? '(missing name)'}`;
  for (const field of ['name', 'label', 'description', 'route']) {
    if (typeof block[field] !== 'string' || block[field].trim() === '') {
      errors.push(`${where}: "${field}" must be a non-empty string`);
    }
  }
  if (typeof block.name === 'string' && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(block.name)) {
    errors.push(`${where}: the name must be kebab-case`);
  }
  if (names.has(block.name)) errors.push(`${where}: duplicate name`);
  names.add(block.name);
  if (typeof block.description === 'string') {
    if (block.description.length > 160) errors.push(`${where}: the description runs past 160 characters`);
    if (!block.description.endsWith('.')) errors.push(`${where}: the description must end in a full stop`);
  }
  if (typeof block.route === 'string' && !block.route.startsWith('/')) {
    errors.push(`${where}: the route must start with a slash`);
  }
  if (!Array.isArray(block.files) || block.files.length === 0) {
    errors.push(`${where}: "files" must list at least one file`);
  }
}

/* 2. Files, both directions. */
const treeFiles = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else treeFiles.push(toPosix(relative(blocksDir, full)));
  }
};
walk(blocksDir);
const claimed = new Set();
for (const block of blocks) {
  for (const file of block.files ?? []) {
    claimed.add(file);
    if (!/^(app|components)\//.test(file)) {
      errors.push(`${block.name}: "${file}" must sit under app/ or components/, the two places init block writes`);
    }
    if (!existsSync(join(blocksDir, ...file.split('/')))) {
      errors.push(`${block.name}: lists "${file}", which src/cli/templates/blocks/ does not hold`);
    }
  }
}
for (const file of treeFiles) {
  if (file === 'registry.json') continue;
  if (!claimed.has(file)) errors.push(`src/cli/templates/blocks/${file} is listed by no block, so init block never writes it`);
}

/* 3. Closure: relative imports stay inside the block's own files. */
const importRe = /(?:from|import)\s+['"](\.{1,2}\/[^'"]+)['"]/g;
const EXTENSIONS = ['', '.tsx', '.ts', '.css'];
for (const block of blocks) {
  const own = new Set(block.files ?? []);
  for (const file of block.files ?? []) {
    const full = join(blocksDir, ...file.split('/'));
    if (!existsSync(full) || !/\.(tsx?|css)$/.test(file)) continue;
    for (const match of read(full).matchAll(importRe)) {
      const base = posix.normalize(posix.join(posix.dirname(file), match[1]));
      const target = EXTENSIONS.map((ext) => base + ext).find(
        (candidate) => existsSync(join(blocksDir, ...candidate.split('/'))) && statSync(join(blocksDir, ...candidate.split('/'))).isFile()
      );
      if (!target) {
        errors.push(`${block.name}: ${file} imports "${match[1]}", which resolves to nothing in the blocks tree`);
      } else if (!own.has(target)) {
        errors.push(`${block.name}: ${file} imports ${target}, which the block does not list, so it would install as a broken import`);
      }
    }
  }
}

/* 4. The site, both directions. */
const previewsSource = read(join(repoRoot, 'website', 'src', 'data', 'block-previews.tsx'));
const mapBody = previewsSource.slice(previewsSource.indexOf('BLOCK_PREVIEWS'));
const previewKeys = new Set([...mapBody.matchAll(/^\s+"?([a-z0-9-]+)"?:\s/gm)].map((m) => m[1]));
const routesDir = join(repoRoot, 'website', 'src', 'app', 'docs', 'blocks');
const routeFolders = new Set(
  readdirSync(routesDir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)
);
const chromeless = read(join(repoRoot, 'website', 'src', 'config', 'chromeless.ts'));
for (const name of names) {
  if (!previewKeys.has(name)) errors.push(`BLOCK_PREVIEWS in website/src/data/block-previews.tsx has no entry for "${name}"`);
  if (!routeFolders.has(name)) errors.push(`website/src/app/docs/blocks/${name}/ does not exist (the block's preview route)`);
  if (!chromeless.includes(`"/docs/blocks/${name}"`)) {
    errors.push(`"/docs/blocks/${name}" is not in CHROMELESS_ROUTES (website/src/config/chromeless.ts)`);
  }
}
for (const key of previewKeys) {
  if (!names.has(key)) errors.push(`BLOCK_PREVIEWS has "${key}", which no block in the registry is named`);
}
for (const folder of routeFolders) {
  if (!names.has(folder)) errors.push(`website/src/app/docs/blocks/${folder}/ is the route of no registered block`);
}

if (errors.length) {
  console.error('\n✗ Blocks validation failed:\n');
  for (const e of errors) console.error(`  - ${e}`);
  console.error('');
  process.exit(1);
}
console.log(`✓ Blocks valid — ${blocks.length} blocks, ${claimed.size} files, previews and routes in step.`);
