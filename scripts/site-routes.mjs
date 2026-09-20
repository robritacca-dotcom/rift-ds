/**
 * site-routes.mjs
 *
 * The authoritative list of page routes on robertritacca.com, derived from the
 * filesystem: every `page.tsx` under website/src/app is a route. This is the
 * strongest possible source — a page that exists on disk is reachable whether
 * or not anyone remembered to add it to navigation — and it is what lets the
 * chat-coverage validator promise that a new page cannot ship invisible to the
 * site chat: the build fails until the page is either covered by a corpus
 * section or listed in the corpus generator's exclusion map with a reason.
 *
 * Consumers: scripts/validate-chat-coverage.mjs (build gate) and
 * evals/chat/assert-paths.js (every path the model cites must resolve).
 */
import { readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const appDir = join(repoRoot, 'website', 'src', 'app');

/** True for `[slug]`-style dynamic segments. */
export const isDynamicSegment = (segment) => segment.startsWith('[');

/**
 * Every route with a page.tsx on disk, `/`-rooted, sorted. Dynamic routes keep
 * their bracket segments (`/writing/[slug]`) so callers can treat them
 * specially — their instances come from a data source, not from files.
 */
export function siteRoutes() {
  const routes = [];
  const walk = (dir, route) => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) {
        walk(path, `${route}/${entry}`);
      } else if (entry === 'page.tsx') {
        routes.push(route === '' ? '/' : route);
      }
    }
  };
  walk(appDir, '');
  return routes.sort();
}

/** Static routes only — the set a cited path can be checked against directly. */
export function staticSiteRoutes() {
  return siteRoutes().filter((route) => !route.split('/').some(isDynamicSegment));
}

/**
 * True when a path the model cited resolves: an exact static route, or an
 * instance of a dynamic route (`/writing/anything` matches `/writing/[slug]`).
 * Trailing slashes are tolerated; query strings and fragments are not paths.
 */
export function resolvesOnSite(path) {
  const clean = path.replace(/\/+$/, '') || '/';
  const routes = siteRoutes();
  if (routes.includes(clean)) return true;
  return routes.some((route) => {
    const parts = route.split('/');
    const candidate = clean.split('/');
    if (parts.length !== candidate.length) return false;
    return parts.every((part, i) => isDynamicSegment(part) || part === candidate[i]);
  });
}
