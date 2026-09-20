#!/usr/bin/env node
/**
 * Validates the root package.json against scripts/package-manifest.mjs:
 *   1. name/version/exports match the manifest's source form exactly
 *      (SUBPATHS in the manifest is the single source — a subpath change
 *      is made there and mirrored into package.json, never on one side alone).
 *   2. Every non-wildcard export target exists on disk; wildcard
 *      targets' base directories exist and contain at least one match.
 *   3. package-lock.json's root version matches too. npm records the
 *      version there on install, and a release bump that skips the
 *      lockfile (0.3.0 shipped that way) leaves every later plain
 *      `npm install` dirtying the tree — which breaks the worktree
 *      recipes in the site-updates and growth-loop skills. Fix with
 *      `npm install --package-lock-only` and commit the lockfile.
 *   4. Every `.ts` module under src/components is reachable by a
 *      consumer. See REACHABILITY below.
 *   5. Every explicit (non-wildcard) JS subpath is a lib entry in
 *      vite.lib.config.ts. See DIST ENTRIES below.
 *
 * Part of the validate-registry chain, so the public import surface the
 * website dogfoods can never drift from what the package declares.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PACKAGE_NAME, PACKAGE_VERSION, sourceExports } from './package-manifest.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8'));

const errors = [];

if (pkg.name !== PACKAGE_NAME) {
  errors.push(`package.json name is "${pkg.name}", manifest says "${PACKAGE_NAME}"`);
}
if (pkg.version !== PACKAGE_VERSION) {
  errors.push(`package.json version is "${pkg.version}", manifest says "${PACKAGE_VERSION}"`);
}

const lock = JSON.parse(readFileSync(join(repoRoot, 'package-lock.json'), 'utf8'));
for (const [where, v] of [
  ['root', lock.version],
  ['packages[""]', lock.packages?.['']?.version],
]) {
  if (v !== PACKAGE_VERSION) {
    errors.push(
      `package-lock.json ${where} version is "${v}", manifest says "${PACKAGE_VERSION}" — ` +
        `run \`npm install --package-lock-only\` and commit the lockfile`
    );
  }
}

const expected = sourceExports();
if (JSON.stringify(pkg.exports) !== JSON.stringify(expected)) {
  errors.push(
    `package.json "exports" is out of sync with scripts/package-manifest.mjs — ` +
      `update the manifest, then copy sourceExports() into package.json`
  );
}

for (const [key, target] of Object.entries(expected)) {
  if (target.includes('*')) {
    const starIndex = target.indexOf('*');
    const baseDir = join(repoRoot, target.slice(0, starIndex));
    const suffix = target.slice(starIndex + 1);
    let hasMatch = false;
    if (existsSync(baseDir)) {
      const stack = [baseDir];
      while (stack.length > 0 && !hasMatch) {
        const dir = stack.pop();
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
          if (entry.isDirectory()) stack.push(join(dir, entry.name));
          else if (entry.name.endsWith(suffix)) hasMatch = true;
        }
      }
    }
    if (!hasMatch) {
      errors.push(`export "${key}" → "${target}" matches nothing on disk`);
    }
  } else if (!existsSync(join(repoRoot, target))) {
    errors.push(`export "${key}" → "${target}" does not exist`);
  }
}

/* ---------------------------------------------------------------------------
 * REACHABILITY — every `.ts` module under src/components can be imported.
 *
 * The `./components/*` wildcard maps `.tsx` only, so a sibling `.ts` module
 * (a hook, a data table, a shader source) gets no deep-import path for free.
 * It reaches consumers one of two ways: an explicit entry in the manifest's
 * SUBPATHS, or a re-export from a `.tsx` in the same folder that the barrel
 * already exports. A module with neither still ships inside the tarball and
 * cannot be imported at all — dead weight, and an API that documentation can
 * describe but nobody can use.
 *
 * This is not hypothetical. `Avatar/demoAvatars.ts` is re-exported by nothing
 * and reachable *only* through its hand-written subpath; `ShaderField`'s two
 * modules were the second time the same gap had to be closed by hand. Both
 * were caught by a reader. This check is what makes the third one impossible.
 *
 * A genuinely internal module — imported by its component, exporting nothing
 * a consumer needs — belongs here with a reason rather than a subpath.
 */
const INTERNAL_MODULES = new Map([
  ['src/components/Chart/palette.ts',
    'series-colour reader shared by the chart set; the --color-chart-series tokens it reads are the public surface'],
  ['src/components/WorldMap/land.ts',
    'baked Natural Earth land path in WorldMap\'s private drawing space; the component is the public surface, and the coordinates mean nothing without its projection'],
]);

const componentsDir = join(repoRoot, 'src', 'components');
const tsModules = [];
{
  const stack = [componentsDir];
  while (stack.length > 0) {
    const dir = stack.pop();
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (
        entry.name.endsWith('.ts') &&
        !entry.name.endsWith('.d.ts') &&
        !entry.name.endsWith('.stories.ts')
      ) {
        tsModules.push(full);
      }
    }
  }
}

/** Non-wildcard export targets, normalized to repo-relative paths. */
const explicitTargets = new Set(
  Object.values(expected)
    .filter((t) => !t.includes('*'))
    .map((t) => t.replace(/^\.\//, ''))
);

for (const modulePath of tsModules) {
  const rel = relative(repoRoot, modulePath).split('\\').join('/');
  if (explicitTargets.has(rel) || INTERNAL_MODULES.has(rel)) continue;

  // Re-exported by a sibling .tsx? Textual, because that is what the bundler
  // resolves: `export … from './field.glsl'` for `field.glsl.ts`.
  const dir = dirname(modulePath);
  const base = rel.split('/').pop().replace(/\.ts$/, '');
  const reExported = readdirSync(dir)
    .filter((f) => f.endsWith('.tsx') && !f.endsWith('.stories.tsx'))
    .some((f) =>
      new RegExp(`export\\s[^;]*?\\sfrom\\s+['"]\\./${base.replace(/\./g, '\\.')}['"]`, 's')
        .test(readFileSync(join(dir, f), 'utf8'))
    );

  if (!reExported) {
    errors.push(
      `${rel} ships in the package but no consumer can import it — the ` +
        `"./components/*" wildcard maps .tsx only. Either add a subpath to ` +
        `SUBPATHS in scripts/package-manifest.mjs, re-export it from the ` +
        `.tsx beside it, or record it in INTERNAL_MODULES in this script ` +
        `with the reason it is internal`
    );
  }
}

/* ---------------------------------------------------------------------------
 * DIST ENTRIES — every explicit JS subpath is built.
 *
 * A subpath has three homes: SUBPATHS in the manifest, the root package.json
 * exports it is mirrored into (held together above), and the lib entry list
 * in vite.lib.config.ts. The build emits one module per source file
 * (preserveModules), but only for files some entry reaches — so a subpath
 * whose module nothing else imports (demoAvatars, the swatch helpers) ships
 * only if it is an entry of its own, and a module that is reached today
 * only because its component imports it stops being built the day that
 * import goes. Declaring every explicit subpath as an entry makes the dist
 * output a function of the manifest rather than of the import graph.
 *
 * The entry list is read textually, which is what keeps this check free of
 * a Vite import at validate time; an entry written in a shape the regex
 * does not recognise fails loudly here rather than passing by accident.
 */
const viteConfigPath = join(repoRoot, 'vite.lib.config.ts');
const viteConfig = readFileSync(viteConfigPath, 'utf8');
const entryBlock = viteConfig.match(/\bentry:\s*\{([\s\S]*?)\n\s*\},/);
if (!entryBlock) {
  errors.push(`could not find the lib \`entry: { … }\` block in vite.lib.config.ts`);
} else {
  const viteEntries = new Set(
    [...entryBlock[1].matchAll(/:\s*'([^']+)'/g)].map((m) => m[1])
  );
  for (const [key, target] of Object.entries(expected)) {
    if (target.includes('*') || !/\.tsx?$/.test(target)) continue;
    const src = target.replace(/^\.\//, '');
    if (!viteEntries.has(src)) {
      errors.push(
        `export "${key}" → "${target}" has no lib entry in vite.lib.config.ts — ` +
          `add it to \`build.lib.entry\` so the dist build emits it whether or ` +
          `not anything else imports it`
      );
    }
  }
}

if (errors.length > 0) {
  console.error(
    `✗ Package exports invalid:\n` + errors.map((e) => `    - ${e}`).join('\n')
  );
  process.exit(1);
}

console.log(
  `✓ Package exports valid — ${Object.keys(expected).length} subpaths, all targets present; ` +
    `${tsModules.length} component .ts module(s) reachable; every explicit subpath is a lib entry.`
);
