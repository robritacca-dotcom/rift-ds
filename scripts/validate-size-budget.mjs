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
 * A budget only ratchets down. A ceiling more than SLACK above its measure
 * fails, so a saving is locked in by lowering the number in the change
 * that made it; `componentCeiling` is held the same way to the heaviest
 * component with no row of its own.
 *
 * `--why <entry>` (a component name or a subpath key) prints what that
 * entry's bundle is made of, module by module, largest first, and checks
 * nothing. It is where trimming an entry starts.
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

const bundle = (file, options = {}) =>
  build({
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
    ...options,
  });

const measure = async (file) => gzipSync((await bundle(file)).outputFiles[0].contents).length;

/** How far a ceiling may sit above its measure: the larger of the two. */
const SLACK_RATIO = 0.15;
const SLACK_BYTES = 500;
const tooLoose = (ceiling, size) => ceiling > size + Math.max(size * SLACK_RATIO, SLACK_BYTES);

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

const whyAt = process.argv.indexOf('--why');
if (whyAt !== -1) {
  const key = process.argv[whyAt + 1];
  const entry = entries.find((e) => e.key === key);
  if (!entry) {
    console.error(`validate-size-budget: --why needs a component name or a subpath key; "${key ?? ''}" is neither.`);
    process.exit(1);
  }
  const result = await bundle(entry.file, { metafile: true, absWorkingDir: repoRoot });
  const output = Object.values(result.metafile.outputs)[0];
  const parts = Object.entries(output.inputs)
    .map(([path, { bytesInOutput }]) => ({ path: path.replaceAll('\\', '/'), bytes: bytesInOutput }))
    .filter((part) => part.bytes > 0)
    .sort((a, b) => b.bytes - a.bytes);
  const total = parts.reduce((all, part) => all + part.bytes, 0);
  console.log(
    `${entry.key}: ${gzipSync(result.outputFiles[0].contents).length} bytes gzipped, ` +
      `${total} minified, from ${parts.length} modules. Minified bytes per module:\n`
  );
  for (const part of parts.slice(0, 40)) {
    console.log(`${String(part.bytes).padStart(8)}  ${String(Math.round((part.bytes / total) * 100)).padStart(3)}%  ${part.path}`);
  }
  if (parts.length > 40) {
    const rest = parts.slice(40).reduce((all, part) => all + part.bytes, 0);
    console.log(`${String(rest).padStart(8)}  ${String(Math.round((rest / total) * 100)).padStart(3)}%  (${parts.length - 40} more modules)`);
  }
  process.exit(0);
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

// The ratchet: a ceiling far above its measure holds nothing.
for (const row of rows) {
  const own = row.kind === 'subpath' || row.key in budget.components;
  if (own && row.ceiling !== undefined && tooLoose(row.ceiling, row.size)) {
    errors.push(
      `${row.key}: its ceiling is ${row.ceiling}, and it now measures ${row.size} bytes gzipped. ` +
        `Lower the ceiling in scripts/size-budget.json in this change so the saving holds.`
    );
  }
}
const heaviestDefaulted = Math.max(
  0,
  ...rows.filter((row) => row.kind === 'component' && !(row.key in budget.components)).map((row) => row.size)
);
if (tooLoose(budget.componentCeiling, heaviestDefaulted)) {
  errors.push(
    `componentCeiling is ${budget.componentCeiling}, and the heaviest component held to it measures ${heaviestDefaulted}. ` +
      `Lower it in scripts/size-budget.json in this change so the saving holds.`
  );
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
