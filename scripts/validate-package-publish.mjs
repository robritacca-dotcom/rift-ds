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
 * Two deliberate attw narrowings:
 * - `--profile esm-only`: the package ships ESM only, by decision — the
 *   node10 and require() resolution failures that profile skips are the
 *   cost of that stance, not defects.
 * - `--ignore-rules internal-resolution-error`: a KNOWN OPEN FINDING, not a
 *   stance. The emitted .d.ts files use extensionless relative imports,
 *   which node16/nodenext type resolution cannot follow, so consumers on
 *   those modes get broken types today (bundler resolution is fine).
 *   Recorded 2026-09-06; remove this flag once the d.ts emission ships
 *   extensioned specifiers.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

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

run('publint', bin('publint'), [dist]);
run('arethetypeswrong', bin('@arethetypeswrong/cli'), ['--pack', '.', '--profile', 'esm-only', '--ignore-rules', 'internal-resolution-error'], { cwd: dist });

console.log('✓ Package publish surface valid — publint clean, every subpath resolves for ESM and bundler consumers.');
