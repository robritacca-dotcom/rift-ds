/**
 * local-labs.mjs
 *
 * The contract for local labs: private work in progress that lives only on
 * the owner's machine. Two folders are gitignored, so nothing in them is ever
 * committed, built by CI or deployed:
 *
 *   website/src/app/labs/local/   pages, served at /labs/local/...
 *   website/src/app/api/local/    their server routes, at /api/local/...
 *
 * Because the files exist on disk locally, every validator that walks the
 * filesystem or the built site would otherwise see them and fail on a route
 * that no registry may name. Those validators skip anything this module calls
 * local. The route prefix has one home, LOCAL_LABS_PREFIX in
 * website/src/config/chromeless.ts (the site needs it at runtime); it is
 * parsed out of that file here.
 *
 * The one rule in the other direction is held by
 * scripts/validate-local-labs.mjs: no tracked file may import from a local
 * folder, or CI's build breaks on a file it does not have.
 */
import { readFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

const chromelessSource = readFileSync(
  join(repoRoot, 'website', 'src', 'config', 'chromeless.ts'),
  'utf8'
);
const prefixMatch = chromelessSource.match(/LOCAL_LABS_PREFIX = "([^"]+)"/);
if (!prefixMatch) {
  console.error('✗ Could not read LOCAL_LABS_PREFIX from website/src/config/chromeless.ts');
  process.exit(1);
}

/** The page route prefix, `/labs/local/`. */
export const LOCAL_LABS_PREFIX = prefixMatch[1];

/** The two gitignored folders, repo-relative with forward slashes. */
export const LOCAL_LABS_DIRS = [
  `website/src/app${LOCAL_LABS_PREFIX}`,
  'website/src/app/api/local/',
];

const API_PREFIX = '/api/local/';

/** True for a `/`-rooted route (page or API) that only exists locally. */
export function isLocalRoute(route) {
  const withSlash = route.endsWith('/') ? route : `${route}/`;
  return withSlash.startsWith(LOCAL_LABS_PREFIX) || withSlash.startsWith(API_PREFIX);
}

/** True for a file path (absolute or repo-relative) inside a local folder. */
export function isLocalPath(path) {
  const rel = (path.startsWith(repoRoot) ? relative(repoRoot, path) : path)
    .split(sep)
    .join('/');
  return LOCAL_LABS_DIRS.some(
    (dir) => rel.startsWith(dir) || `${rel}/` === dir
  );
}
