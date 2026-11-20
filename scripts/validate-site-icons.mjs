#!/usr/bin/env node
/**
 * validate-site-icons.mjs
 *
 * Every icon the built pages draw must be in the website's cut of the icon
 * font. An icon the cut lacks does not fail quietly: its name is drawn as
 * the letters it is typed in, in the middle of a button.
 *
 * scripts/generate-site-icons.mjs decides what the cut holds by reading
 * the source for icon names, and a name written as a literal cannot get
 * past it. A name assembled at run time from parts can, and the source
 * cannot be read for one. The rendered pages can, so this reads them:
 *
 *   1. the text of every element carrying the icon class, and every List
 *      marker (`--ds-list-marker`), in the prerendered HTML, must be an
 *      icon in website/src/data/site-icons.generated.json;
 *   2. the built stylesheets must declare the cut font's face, so a
 *      refactor of the site's global styles cannot silently send every
 *      page back to the full download.
 *
 * What it cannot see is an icon first drawn after a press (a menu that has
 * not opened, a state not yet reached) whose name was also built at run
 * time. Write icon names as literals and the generator covers those.
 *
 * Reads built output, so it runs after the website build in `verify` and
 * CI, beside the other built-HTML checks, never in validate-registry.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fromRoot, readJson, walk } from './lib/fs.mjs';
import { finish } from './lib/report.mjs';

const nextDir = fromRoot('website', '.next');
const appHtmlDir = join(nextDir, 'server', 'app');
const FACE = 'Material Symbols Site';

if (!existsSync(appHtmlDir)) {
  console.error('validate-site-icons: website/.next/server/app missing. Run the website build first.');
  process.exit(1);
}

const icons = new Set(readJson(fromRoot('website', 'src', 'data', 'site-icons.generated.json')).icons);
const decode = (text) =>
  text.replace(/&quot;|&#x27;|&#39;/g, '').replace(/&amp;/g, '&').replace(/<!--.*?-->/g, '').trim();

const missing = new Map(); // name -> Set of routes
const note = (name, route) => {
  if (name === '' || icons.has(name)) return;
  if (!missing.has(name)) missing.set(name, new Set());
  missing.get(name).add(route);
};

let drawn = 0;
let pages = 0;
for (const file of walk(appHtmlDir, (name) => name.endsWith('.html'))) {
  const route = '/' + relative(appHtmlDir, file).split(sep).join('/').replace(/\.html$/, '');
  const html = readFileSync(file, 'utf8');
  pages += 1;
  for (const match of html.matchAll(/<[a-z]+\b[^>]*\bclass="[^"]*\bmaterial-symbols-rounded\b[^"]*"[^>]*>([^<]*)</g)) {
    drawn += 1;
    note(decode(match[1]), route === '/index' ? '/' : route);
  }
  // The marker is a quoted CSS string inside a style attribute, so its
  // quotes arrive as entities: --ds-list-marker:&quot;check&quot;
  for (const match of html.matchAll(/--ds-list-marker:\s*(?:&quot;|&#x27;|&#39;|')([a-z0-9_]+)/g)) {
    drawn += 1;
    note(match[1], route === '/index' ? '/' : route);
  }
}

const errors = [...missing].map(
  ([name, routes]) =>
    `"${name}" is drawn on ${[...routes].slice(0, 3).join(', ')}${routes.size > 3 ? ` and ${routes.size - 3} more` : ''} ` +
    `and is not in the site's icon font. If it is a real icon, write its name as a string literal where it is chosen ` +
    `and run \`node scripts/generate-site-icons.mjs\`; if it is not, the element should not carry the icon class.`
);

const staticDir = join(nextDir, 'static');
const declared =
  existsSync(staticDir) && walk(staticDir, (name) => name.endsWith('.css')).some((file) => readFileSync(file, 'utf8').includes(FACE));
if (!declared) {
  errors.push(
    `no built stylesheet declares the "${FACE}" face, so every page would download the full icon font. ` +
      `Restore its @font-face and the rule that applies it in website/src/app/globals.css.`
  );
}

finish(
  '\n✗ Site icon validation failed:\n',
  errors,
  `✓ Site icons in the cut font: ${drawn} icons drawn across ${pages} pages, all among the ${icons.size} it holds.`
);
