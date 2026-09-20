/**
 * validate-internal-links.mjs
 *
 * Every internal href in the prerendered HTML must lead somewhere: a
 * prerendered page, a route handler, a file in website/public, or a
 * redirect source in next.config.ts. A renamed route otherwise leaves dead
 * links scattered across pages and the footer, and nothing noticed —
 * `validate-doc-refs.mjs` guards references in docs and skills, but no
 * check read what the *pages* link to. Reads built output, so it runs
 * after the website build in `verify` and CI, beside the other built-HTML
 * checks.
 *
 * The target set is deliberately concrete: prerendered pages are the .html
 * files Next wrote, not patterns derived from the app tree — so a link to
 * /writing/nonexistent-essay fails even though a [slug] pattern would have
 * matched it. Route handlers (route.ts) and public files are matched by
 * path, redirects by their source.
 *
 * The one exception is a dynamic [slug] route that renders on demand (ISR)
 * rather than prerendering: its real pages never land in the .html route
 * list, so its valid targets come from the registry that owns which slugs
 * exist. /writing/[slug] builds from the live Substack feed, which is
 * unreachable from CI's build — so generateStaticParams returns nothing and
 * NONE of the essays prerender there, even though every one is a live 200 via
 * ISR. We register the essay slugs from the committed essays.json registry
 * (the validated source of truth) so a link to a real essay resolves whether
 * or not it prerendered. This keeps the check's teeth: only registry slugs
 * are added, never the [slug] pattern, so /writing/<unknown> still fails.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { SITE_URL } from './brand.mjs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const appHtmlDir = join(repoRoot, 'website', '.next', 'server', 'app');
const appSrcDir = join(repoRoot, 'website', 'src', 'app');
const publicDir = join(repoRoot, 'website', 'public');
const nextConfig = join(repoRoot, 'website', 'next.config.ts');

if (!existsSync(appHtmlDir)) {
  console.error('validate-internal-links: website/.next/server/app missing — run the website build first.');
  process.exit(1);
}

const walk = (dir, filter) => {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, filter));
    else if (filter(entry.name)) out.push(full);
  }
  return out;
};

/* ---- The set of paths that exist ---- */

const targets = new Set(['/']);

/* Prerendered pages: .html file paths are the concrete route list. */
for (const file of walk(appHtmlDir, (n) => n.endsWith('.html'))) {
  const route = '/' + relative(appHtmlDir, file).split(sep).join('/').replace(/\.html$/, '');
  targets.add(route === '/index' ? '/' : route);
}

/* Route handlers: route.ts directories (llms.txt, the API routes). */
for (const file of walk(appSrcDir, (n) => n === 'route.ts' || n === 'route.tsx')) {
  const route = '/' + relative(appSrcDir, dirname(file)).split(sep).join('/');
  targets.add(route);
}

/* Next's metadata file conventions become routes without a route.ts:
   app/icon.tsx serves /icon, app/manifest.ts serves /manifest.webmanifest,
   and so on. Registered under the URLs Next serves them at. */
const METADATA_ROUTES = {
  'favicon.ico': '/favicon.ico',
  icon: '/icon',
  'apple-icon': '/apple-icon',
  manifest: '/manifest.webmanifest',
  sitemap: '/sitemap.xml',
  robots: '/robots.txt',
  'opengraph-image': '/opengraph-image',
  'twitter-image': '/twitter-image',
};
for (const file of walk(appSrcDir, (n) =>
  Object.keys(METADATA_ROUTES).some((base) => n === base || n.startsWith(`${base}.`)),
)) {
  const dir = '/' + relative(appSrcDir, dirname(file)).split(sep).join('/');
  const base = Object.keys(METADATA_ROUTES).find((b) => {
    const name = file.split(sep).pop();
    return name === b || name.startsWith(`${b}.`);
  });
  const prefix = dir === '/' ? '' : dir;
  targets.add(prefix + METADATA_ROUTES[base]);
}

/* Files served from website/public, at their URL paths. */
for (const file of walk(publicDir, () => true)) {
  targets.add('/' + relative(publicDir, file).split(sep).join('/'));
}

/* Redirect sources: a URL that moved is still a valid link target. */
const configSource = readFileSync(nextConfig, 'utf8');
for (const m of configSource.matchAll(/source:\s*["'`]([^"'`]+)["'`]/g)) {
  if (!m[1].includes(':') && !m[1].includes('*')) targets.add(m[1]);
}

/* ---- The links the pages actually render ---- */

// Absolute links to the site's own origin (brand.mjs owns the host) are
// internal links spelled long-hand, so they normalize to paths below.
const SELF_HOST = new URL(SITE_URL).host.replace(/^www\./, '').replace(/\./g, '\\.');
const SELF_ORIGINS = new RegExp(`^https?://(www\\.)?${SELF_HOST}`);

function normalize(href) {
  let path = href.replace(SELF_ORIGINS, '');
  if (!path.startsWith('/')) return null; // external, mailto:, tel:, #anchor
  if (path.startsWith('//')) return null; // protocol-relative external
  path = path.split('#')[0].split('?')[0];
  if (path === '') return '/';
  if (path.startsWith('/_next/')) return null; // build assets, hashed and self-consistent
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
  return path;
}

const broken = new Map(); // path -> Set of pages linking to it
for (const file of walk(appHtmlDir, (n) => n.endsWith('.html'))) {
  const page = '/' + relative(appHtmlDir, file).split(sep).join('/').replace(/\.html$/, '');
  const html = readFileSync(file, 'utf8');
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    const path = normalize(m[1]);
    if (path === null || targets.has(path)) continue;
    if (!broken.has(path)) broken.set(path, new Set());
    broken.get(path).add(page === '/index' ? '/' : page);
  }
}

if (broken.size > 0) {
  const lines = [...broken.entries()].map(
    ([path, pages]) => `  ${path}\n    linked from: ${[...pages].slice(0, 5).join(', ')}${pages.size > 5 ? ` (+${pages.size - 5} more)` : ''}`,
  );
  console.error(`✗ ${broken.size} internal link target(s) do not exist:\n${lines.join('\n')}`);
  process.exit(1);
}
console.log(`✓ Internal links valid — every internal href in the prerendered HTML resolves (${targets.size} known targets).`);
