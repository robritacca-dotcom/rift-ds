/**
 * Every site path the model cites must actually exist. The model can invent
 * `/foundations/colour` with complete confidence; this is the single
 * highest-yield programmatic check in the eval. Routes come from
 * scripts/site-routes.mjs — the filesystem, the same authority the coverage
 * validator uses — plus the route handlers (route.ts files), because a
 * handler like /api/mcp is a real URL the chat may legitimately cite (it
 * has a human landing page and is advertised in llms.txt).
 *
 * Two more kinds of path are real without being a page. A published static
 * file or folder under website/public (the pattern below stops at a dot, so
 * `/schema/components/button.json` arrives as `/schema/components/button`,
 * and `/schema/components/<slug>.json` as `/schema/components`). And the
 * route a block writes into the reader's own app (`/dashboard`), which the
 * install answer names and which was never a path on this site.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolvesOnSite } from '../../scripts/site-routes.mjs';

// A path candidate: starts a `/`, lowercase-slug segments, not preceded by a
// word character, `/`, `.` or `:` (which would make it a URL tail, a file
// path like src/components, or a fraction).
const PATH_PATTERN = /(?<![\w/.:])\/[a-z][a-z0-9-]*(?:\/[a-z0-9-]+)*/g;

/** Route-handler paths (route.ts files under the app dir), from the filesystem. */
function handlerRoutes() {
  const appDir = join(dirname(fileURLToPath(import.meta.url)), '../../website/src/app');
  const found = [];
  const walk = (dir, segments) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        walk(join(dir, entry.name), [...segments, entry.name]);
      } else if (entry.name === 'route.ts' || entry.name === 'route.tsx') {
        found.push(`/${segments.join('/')}`);
      }
    }
  };
  walk(appDir, []);
  return found;
}

const HANDLERS = new Set(handlerRoutes());

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');
const publicDir = join(repoRoot, 'website/public');

/** A file or folder the site serves as-is, with or without the extension the pattern cut off. */
function isPublished(path) {
  const target = join(publicDir, path);
  if (existsSync(target)) return true;
  const folder = dirname(target);
  const stem = `${target.slice(folder.length + 1)}.`;
  return existsSync(folder) && readdirSync(folder).some((name) => name.startsWith(stem));
}

/** The routes the blocks write into a consumer's app, from the blocks registry. */
const BLOCK_ROUTES = new Set(
  JSON.parse(readFileSync(join(repoRoot, 'src/cli/templates/blocks/registry.json'), 'utf8')).blocks.map((block) => block.route)
);

export default function assertPaths(output) {
  const cited = [...new Set(String(output).match(PATH_PATTERN) ?? [])];
  const broken = cited.filter(
    (path) => {
      const clean = path.replace(/\/+$/, '');
      return !resolvesOnSite(path) && !HANDLERS.has(clean) && !isPublished(clean) && !BLOCK_ROUTES.has(clean);
    }
  );
  if (broken.length === 0) {
    return { pass: true, score: 1, reason: cited.length ? `all cited paths resolve: ${cited.join(', ')}` : 'no paths cited' };
  }
  return { pass: false, score: 0, reason: `cited paths that do not exist: ${broken.join(', ')}` };
}
