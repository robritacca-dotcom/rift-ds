#!/usr/bin/env node
/**
 * The package-rename sweep. Half of rename day; brand.mjs's PACKAGE_NAME
 * doc block owns the full recipe.
 *
 * Reads the OLD name from the root package.json (what the repo still
 * says) and the NEW name from scripts/brand.mjs (what it should say),
 * then rewrites every occurrence used as a package specifier — import
 * statements, the manifest name, the website workspace dependency key,
 * install snippets in the authored docs. Generated surfaces are swept
 * too so the tree is consistent before the chain regenerates them.
 *
 * Safe to run any time: when the two names already agree it does
 * nothing. After a real sweep, run `npm install` (re-links the
 * workspace and refreshes the lockfile), then `npm run verify`.
 * validate-package-exports fails the build while any retired name
 * survives, so a missed file cannot ship.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PACKAGE_NAME } from './brand.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Directories the sweep never enters. */
const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  'dist',
  'storybook-static',
  'coverage',
  // A git worktree under .claude/worktrees is a second checkout with its
  // own branch and another session's work in it. Sweeping it rewrites
  // files this repo does not own on this branch.
  'worktrees',
]);

/** Files the sweep never touches: npm owns the lockfile (refresh with
    `npm install` after the sweep), and brand.mjs is the sweep's own
    source of truth — it holds the new name AND the old one in
    RETIRED_PACKAGE_NAMES, so rewriting it would retire the new name and
    leave the scan chasing itself. validate-package-exports exempts the
    same file, for the same reason. */
const SKIP_FILES = new Set(['package-lock.json', 'brand.mjs']);

/** Text extensions worth rewriting; everything else is binary or noise. */
const TEXT_EXT = /\.(ts|tsx|mjs|js|jsx|json|md|mdx|css|ya?ml|txt)$/;

const from = JSON.parse(
  readFileSync(join(repoRoot, 'package.json'), 'utf8')
).name;
const to = PACKAGE_NAME;

if (from === to) {
  console.log(
    `✓ Nothing to rename — package.json and brand.mjs both say "${to}".`
  );
  process.exit(0);
}

/* The old name, only where it ends as a specifier would: followed by a
   subpath, a quote, whitespace, or punctuation — never mid-word. */
const pattern = new RegExp(
  from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![A-Za-z0-9-])',
  'g'
);

const changed = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) {
      if (!SKIP_DIRS.has(entry)) walk(path);
      continue;
    }
    if (SKIP_FILES.has(entry) || !TEXT_EXT.test(entry)) continue;
    const text = readFileSync(path, 'utf8');
    if (!pattern.test(text)) continue;
    writeFileSync(path, text.replace(pattern, to));
    changed.push(relative(repoRoot, path));
  }
};

walk(repoRoot);

console.log(`✓ Renamed "${from}" → "${to}" in ${changed.length} files.`);
console.log('  Next: npm install   (re-links the workspace, refreshes the lockfile)');
console.log('        npm run verify');
