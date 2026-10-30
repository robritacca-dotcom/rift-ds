/**
 * validate-local-labs.mjs
 *
 * Holds the two rules that keep local labs local (scripts/local-labs.mjs owns
 * the contract):
 *
 * 1. No tracked file imports from a gitignored local folder. Locally such an
 *    import resolves and everything builds; in CI and on Vercel the folder
 *    does not exist, so the build breaks on a missing module.
 * 2. No tracked file names a local route or folder, outside the few files
 *    that define the contract. This is the leak check: a generator that walks
 *    the filesystem and forgets to skip the local folders writes their routes
 *    into a tracked, published file. It runs last in the chain, after every
 *    generator has written.
 *
 * Reads the tracked file list from git, so it checks exactly what a push
 * would carry. A local file importing tracked code is fine and expected.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isLocalPath } from './local-labs.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: repoRoot, encoding: 'utf8' })
  .split('\0')
  .filter((path) => /\.(m?[jt]sx?|css)$/.test(path))
  .filter((path) => !isLocalPath(path));

/* Any module specifier (import, export from, dynamic import, require, CSS
   @import) that reaches into labs/local or api/local. */
const SPECIFIER = /(?:from\s*|import\s*\(\s*|require\s*\(\s*|@import\s+(?:url\()?\s*|import\s+)["']([^"']+)["']/g;
const LOCAL_SEGMENT = /(?:^|\/)(?:labs|api)\/local(?:\/|$)/;

/* The files that define the contract, and so name the folders by design. */
const CONTRACT_FILES = new Set([
  '.gitignore',
  'website/src/config/chromeless.ts',
  'scripts/local-labs.mjs',
  'scripts/validate-local-labs.mjs',
]);
const LOCAL_MENTION = /(?:labs|api)\/local\//;

const errors = [];

const everyTracked = execFileSync('git', ['ls-files', '-z'], { cwd: repoRoot, encoding: 'utf8' })
  .split('\0')
  .filter(Boolean)
  .filter((path) => !CONTRACT_FILES.has(path) && !isLocalPath(path))
  .filter((path) => !/\.(png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf|pdf|mp4|webm|zip)$/i.test(path));
for (const path of everyTracked) {
  let source;
  try {
    source = readFileSync(join(repoRoot, path), 'utf8');
  } catch {
    continue; // deleted in the working tree
  }
  if (LOCAL_MENTION.test(source)) {
    errors.push(`${path}: names a local lab route or folder; if a generator wrote it, make it skip isLocalPath() from scripts/local-labs.mjs`);
  }
}

for (const path of tracked) {
  let source;
  try {
    source = readFileSync(join(repoRoot, path), 'utf8');
  } catch {
    continue;
  }
  for (const [, specifier] of source.matchAll(SPECIFIER)) {
    if (LOCAL_SEGMENT.test(specifier)) {
      errors.push(`${path}: imports "${specifier}", a gitignored local lab that CI does not have`);
    }
  }
}

if (errors.length) {
  console.error('✗ Local-labs validation failed:');
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}
console.log(`✓ Local labs: no tracked file imports or names a local folder (${everyTracked.length} files checked)`);
