/**
 * validate-package-publish.mjs
 *
 * Static correctness of the publishable package in dist/: `publint` checks
 * the manifest against what the tarball actually contains, and
 * `arethetypeswrong` resolves every export subpath the way each consumer
 * kind would — bundlers, and Node ESM under node16/nodenext. The existing
 * consumer smoke (`scripts/smoke-consumer.mjs`) proves one Vite consumer
 * builds; these two see the resolution modes that smoke never exercises.
 * Runs after `build:lib` in `verify` and CI's library job, and belongs in
 * any release preflight.
 *
 * Three deliberate attw narrowings:
 * - `--profile esm-only`: the package ships ESM only, by decision — the
 *   node10 and require() resolution failures that profile skips are the
 *   cost of that stance, not defects.
 * - `--ignore-rules internal-resolution-error`: a KNOWN OPEN FINDING, not a
 *   stance. The emitted .d.ts files use extensionless relative imports,
 *   which node16/nodenext type resolution cannot follow, so consumers on
 *   those modes get broken types today (bundler resolution is fine).
 *   Recorded 2026-09-06; remove this flag once the d.ts emission ships
 *   extensioned specifiers.
 * - `--exclude-entrypoints` for the stylesheet subpaths: a subpath that
 *   maps straight to a .css file (the chat widget's `./chat/chat.css`) is
 *   an asset, not a module, and attw reports it as an import that resolves
 *   to no JavaScript or types. The wildcard stylesheet subpaths skip
 *   themselves; the single-file ones are read off the dist manifest's
 *   exports, so a new asset subpath needs no edit here. publint still
 *   checks that the file is in the tarball.
 *
 * One rift rule rides here too, because it is about the shipped types: no
 * .d.ts in dist/ may name @tanstack/. TanStack Table is the engine under
 * DataTable, and every type it touches is wrapped in rift's own, so its
 * major version never becomes part of rift's public API (the API gate holds
 * every exported name, and a TanStack rename would otherwise fail it or
 * force a rift major). Added 2026-10-25 with the engine.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { distExports } from './package-manifest.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(repoRoot, 'dist');

if (!existsSync(join(dist, 'package.json'))) {
  console.error('validate-package-publish: dist/package.json missing — run `npm run build:lib` first.');
  process.exit(1);
}

// Resolve each tool's JS entry and run it with this node binary: the
// node_modules/.bin shims are shell scripts Windows spawnSync cannot
// execute (exit null), and Node refuses the .cmd variants without a shell.
const bin = (pkg) => {
  const pkgDir = join(repoRoot, 'node_modules', pkg);
  const manifest = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'));
  const entry = typeof manifest.bin === 'string' ? manifest.bin : Object.values(manifest.bin)[0];
  return join(pkgDir, entry);
};

const run = (label, script, args, opts = {}) => {
  const res = spawnSync(process.execPath, [script, ...args], { stdio: 'inherit', ...opts });
  if (res.status !== 0) {
    console.error(`✗ ${label} failed (exit ${res.status})`);
    process.exit(1);
  }
};

/* No shipped type names TanStack: the engine stays an implementation detail. */
const declarationFiles = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return entry === 'node_modules' ? [] : declarationFiles(full);
    return entry.endsWith('.d.ts') ? [full] : [];
  });
const leaks = declarationFiles(dist).filter((file) => readFileSync(file, 'utf8').includes('@tanstack/'));
if (leaks.length > 0) {
  console.error('✗ Shipped types name TanStack; wrap the type in a rift one instead:');
  for (const file of leaks) console.error(`  - ${file.slice(dist.length + 1)}`);
  process.exit(1);
}

run('publint', bin('publint'), [dist]);
/* Single-file stylesheet subpaths: assets, excluded from module resolution. */
const assetSubpaths = Object.entries(distExports())
  .filter(([key, target]) => !key.includes('*') && typeof target === 'string' && target.endsWith('.css'))
  .map(([key]) => key);
run(
  'arethetypeswrong',
  bin('@arethetypeswrong/cli'),
  [
    '--pack', '.',
    '--profile', 'esm-only',
    '--ignore-rules', 'internal-resolution-error',
    ...(assetSubpaths.length > 0 ? ['--exclude-entrypoints', ...assetSubpaths] : []),
  ],
  { cwd: dist }
);

console.log(
  `✓ Package publish surface valid — no shipped type names TanStack, publint clean, every module subpath resolves for ESM and bundler consumers` +
    (assetSubpaths.length > 0 ? ` (${assetSubpaths.length} stylesheet subpath(s) checked by publint alone).` : '.')
);
