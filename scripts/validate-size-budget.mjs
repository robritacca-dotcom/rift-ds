#!/usr/bin/env node
/**
 * validate-size-budget.mjs
 *
 * Holds what an import of the published package costs a consumer to the
 * ceilings in scripts/size-budget.json, so a subpath cannot grow without
 * the change saying so.
 *
 * What is measured: each entry of dist/ is bundled the way a consumer's
 * bundler would (esbuild, minified, production, tree-shaken), with the
 * peer dependencies left external and the package's own runtime
 * dependencies bundled in, since the consumer pays for those. The figure
 * is the gzipped JavaScript. Stylesheets and fonts are left out: a file
 * size in dist/ says nothing here, because dist/ is unminified and one
 * module per file, and a component's cost is the modules it pulls in.
 *
 * Two kinds of entry, both read from their source of truth:
 *   - every registered component (src/components/registry.json), held to
 *     `componentCeiling` unless it has its own row under `components`;
 *   - every non-wildcard JavaScript subpath of the dist manifest
 *     (scripts/package-manifest.mjs), each of which needs a row under
 *     `subpaths`. A new subpath with no row fails, so its budget is a
 *     decision made in the change that adds it.
 * A row that names something no longer measured fails too.
 *
 * Raising a ceiling is the sanctioned way to grow: edit the number in the
 * same change, where the diff shows it. `--report` prints every measured
 * size against its ceiling, largest first, and changes nothing.
 *
 * The measured component sizes are also published: each component's page,
 * markdown and schema print the figure in
 * website/src/data/component-sizes.json. That file is written by
 * `--write` and committed, because the generators that read it run before
 * dist/ exists. It is not byte-compared: a component may drift up to 5%
 * from its published figure before this fails and asks for `--write`, so
 * an ordinary edit does not have to republish every size.
 *
 * Needs dist/, so it runs after `npm run build:lib` in `verify` and CI's
 * library job, never in validate-registry.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { build } from 'esbuild';
import { distExports } from './package-manifest.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(repoRoot, 'dist');
const report = process.argv.includes('--report');
const write = process.argv.includes('--write');
const SIZES_PATH = join(repoRoot, 'website', 'src', 'data', 'component-sizes.json');
/** How far a component may move from its published size before the published figure is stale. */
const PUBLISHED_TOLERANCE = 0.05;

if (!existsSync(join(dist, 'package.json'))) {
  console.error('validate-size-budget: dist/package.json missing — run `npm run build:lib` first.');
  process.exit(1);
}

const budget = JSON.parse(readFileSync(join(repoRoot, 'scripts', 'size-budget.json'), 'utf8'));
const manifest = JSON.parse(readFileSync(join(dist, 'package.json'), 'utf8'));
const registry = JSON.parse(
  readFileSync(join(repoRoot, 'src', 'components', 'registry.json'), 'utf8')
);

const peers = Object.keys(manifest.peerDependencies ?? {});
const external = peers.flatMap((name) => [name, `${name}/*`]);

const measure = async (file) => {
  const result = await build({
    entryPoints: [file],
    bundle: true,
    minify: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    write: false,
    logLevel: 'silent',
    external: [...external, 'node:*'],
    define: { 'process.env.NODE_ENV': '"production"' },
    loader: { '.css': 'empty', '.woff2': 'empty' },
  });
  return gzipSync(result.outputFiles[0].contents).length;
};

// The JavaScript target of an exports value: a string, or the `import`
// condition of a conditions object. Assets and wildcards are not entries.
const jsTarget = (value) => {
  const target = typeof value === 'string' ? value : value?.import;
  return typeof target === 'string' && target.endsWith('.js') ? target : null;
};

const entries = [];
for (const { name, folder } of registry.components) {
  entries.push({
    kind: 'component',
    key: name,
    file: join(dist, 'components', folder ?? name, `${name}.js`),
    ceiling: budget.components[name] ?? budget.componentCeiling,
  });
}
for (const [key, value] of Object.entries(distExports())) {
  const target = jsTarget(value);
  if (key.includes('*') || !target) continue;
  entries.push({ kind: 'subpath', key, file: join(dist, target), ceiling: budget.subpaths[key] });
}

const errors = [];
const rows = [];
for (const entry of entries) {
  if (!existsSync(entry.file)) {
    errors.push(`${entry.key}: ${entry.file.slice(repoRoot.length + 1)} is not in dist/.`);
    continue;
  }
  if (entry.ceiling === undefined) {
    errors.push(
      `${entry.key}: a published subpath with no row under "subpaths" in scripts/size-budget.json. ` +
        `Run with --report and add its ceiling.`
    );
  }
  let size;
  try {
    size = await measure(entry.file);
  } catch (error) {
    errors.push(`${entry.key}: could not be bundled: ${error.message.split('\n')[0]}`);
    continue;
  }
  rows.push({ ...entry, size });
  if (entry.ceiling !== undefined && size > entry.ceiling) {
    errors.push(
      `${entry.key}: ${size} bytes gzipped, over its ceiling of ${entry.ceiling}. ` +
        `Trim it, or raise the ceiling in scripts/size-budget.json in this change.`
    );
  }
}

const measured = (kind) => new Set(entries.filter((e) => e.kind === kind).map((e) => e.key));
for (const name of Object.keys(budget.components)) {
  if (!measured('component').has(name)) {
    errors.push(`"components".${name} in scripts/size-budget.json names no registered component.`);
  } else if (budget.components[name] <= budget.componentCeiling) {
    errors.push(
      `"components".${name} is at or under componentCeiling, so the row does nothing; remove it.`
    );
  }
}
for (const key of Object.keys(budget.subpaths)) {
  if (!measured('subpath').has(key)) {
    errors.push(`"subpaths"["${key}"] in scripts/size-budget.json names no published subpath.`);
  }
}

const componentSizes = Object.fromEntries(
  rows.filter((row) => row.kind === 'component').map((row) => [row.key, row.size])
);
if (write) {
  writeFileSync(
    SIZES_PATH,
    `${JSON.stringify(
      {
        $comment:
          'Gzipped JavaScript, in bytes, of each component bundled with everything it imports except peer dependencies. Written by `node scripts/validate-size-budget.mjs --write` after `npm run build:lib`; never edited by hand.',
        sizes: componentSizes,
      },
      null,
      2
    )}\n`
  );
  console.log(`✓ Wrote ${Object.keys(componentSizes).length} component sizes to website/src/data/component-sizes.json`);
} else {
  const published = existsSync(SIZES_PATH) ? JSON.parse(readFileSync(SIZES_PATH, 'utf8')).sizes : {};
  const stale = Object.entries(componentSizes).filter(([name, size]) => {
    const was = published[name];
    return was === undefined || Math.abs(size - was) / was > PUBLISHED_TOLERANCE;
  });
  const gone = Object.keys(published).filter((name) => !(name in componentSizes));
  if (stale.length > 0 || gone.length > 0) {
    errors.push(
      `website/src/data/component-sizes.json is out of date for ${[...stale.map(([name]) => name), ...gone].slice(0, 8).join(', ')}` +
        `${stale.length + gone.length > 8 ? ' and more' : ''}. Run: node scripts/validate-size-budget.mjs --write`
    );
  }
}

if (report) {
  rows.sort((a, b) => b.size - a.size);
  for (const row of rows) {
    const share = row.ceiling ? `${Math.round((row.size / row.ceiling) * 100)}%` : '';
    console.log(
      `${String(row.size).padStart(7)}  ${String(row.ceiling ?? '-').padStart(7)}  ${share.padStart(4)}  ${row.kind.padEnd(9)}  ${row.key}`
    );
  }
}

if (errors.length > 0) {
  console.error('\n✗ Size budget validation failed:\n');
  for (const error of errors) console.error(`  - ${error}\n`);
  process.exit(1);
}

const ownRows = Object.keys(budget.components).length;
console.log(
  `✓ Size budget holds — ${rows.length} entries measured: ` +
    `${measured('component').size} components (${ownRows} with a ceiling of their own), ` +
    `${measured('subpath').size} subpaths.`
);
