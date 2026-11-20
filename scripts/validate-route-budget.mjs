#!/usr/bin/env node
/**
 * validate-route-budget.mjs
 *
 * Holds what a first visit to each page of the website costs to the
 * ceilings in scripts/route-budget.json, so a page cannot grow without
 * the change saying so. It is the website's twin of
 * validate-size-budget.mjs, which holds the published package.
 *
 * What is measured, per prerendered route, from the finished build:
 *   - js:   every script the document's own tags load, gzipped and summed.
 *           A chunk a page imports on demand is not in a tag, so deferring
 *           work is what lowers this figure.
 *   - css:  every stylesheet the document links, gzipped and summed.
 *   - html: the document itself, gzipped. An inline SVG or a large
 *           serialised payload shows up here and nowhere else.
 * And, apart from the routes, every picture under website/public/images is
 * held to one per-file ceiling, since a page's JavaScript can be small
 * while its hero is a megabyte.
 *
 * The budget file:
 *   - `default` is the ceiling for every route, per kind;
 *   - `routes` gives a heavier route a ceiling of its own, for the kinds it
 *     needs one in;
 *   - `images.ceiling` is the per-file ceiling, and `images.files` names
 *     the pictures over it, each with its own.
 *
 * A budget only ratchets down. Three rules keep it honest in both
 * directions:
 *   - a measure over its ceiling fails: trim the page, or raise the number
 *     in the same change, where the diff shows it;
 *   - a ceiling more than SLACK above its measure fails: a saving is locked
 *     in by lowering the number in the change that made it;
 *   - a row that does nothing fails: one naming a route or picture that no
 *     longer exists, or one at or under the default it overrides.
 *
 * `--report` prints every route against its ceilings, heaviest first, and
 * changes nothing. `--write` rewrites the budget file from the measures
 * (each ceiling a tenth over its measure, rounded up), for the change that
 * moves many pages at once; its diff is the record.
 *
 * Reads built output, so it runs after the website build in `verify` and
 * CI, beside the other built-HTML checks, never in validate-registry.
 */
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { gzipSync } from 'node:zlib';
import { display, fromRoot, readJson, walk } from './lib/fs.mjs';
import { finish } from './lib/report.mjs';

const BUDGET_PATH = fromRoot('scripts', 'route-budget.json');
const nextDir = fromRoot('website', '.next');
const appHtmlDir = join(nextDir, 'server', 'app');
const imagesDir = fromRoot('website', 'public', 'images');
const report = process.argv.includes('--report');
const write = process.argv.includes('--write');

/** How far a ceiling may sit above its measure: the larger of the two. */
const SLACK_RATIO = 0.15;
const SLACK_BYTES = 2000;
/** What `--write` leaves above a measure, and the step it rounds up to. */
const HEADROOM = 0.1;
const ROUND_TO = 1000;
/** The share of routes `--write` holds to the default; the rest get rows. */
const DEFAULT_QUANTILE = 0.9;
const KINDS = ['js', 'css', 'html'];
const PICTURE = /\.(png|jpe?g|webp|avif|gif|svg)$/i;

if (!existsSync(appHtmlDir)) {
  console.error('validate-route-budget: website/.next/server/app missing. Run the website build first.');
  process.exit(1);
}

/* ---- Measure ---- */

const gzipCache = new Map();
const missing = new Set();
/** The gzipped size of the build file a /_next/ URL names. */
function assetSize(url) {
  const path = decodeURIComponent(url.replace(/&amp;/g, '&').split('?')[0].split('#')[0]);
  if (gzipCache.has(path)) return gzipCache.get(path);
  const file = join(nextDir, ...path.replace(/^\/_next\//, '').split('/'));
  let size = 0;
  if (existsSync(file)) size = gzipSync(readFileSync(file)).length;
  else missing.add(path);
  gzipCache.set(path, size);
  return size;
}

const sum = (urls) => [...new Set(urls)].reduce((total, url) => total + assetSize(url), 0);

const routes = new Map();
for (const file of walk(appHtmlDir, (name) => name.endsWith('.html'))) {
  const name = '/' + relative(appHtmlDir, file).split(sep).join('/').replace(/\.html$/, '');
  const html = readFileSync(file);
  const text = html.toString('utf8');
  const scripts = [...text.matchAll(/<script\b[^>]*\bsrc="(\/_next\/[^"]+)"/g)].map((m) => m[1]);
  const sheets = [...text.matchAll(/<link\b[^>]*>/g)]
    .filter((m) => /\brel="stylesheet"/.test(m[0]))
    .map((m) => /\bhref="(\/_next\/[^"]+)"/.exec(m[0])?.[1])
    .filter(Boolean);
  routes.set(name === '/index' ? '/' : name, {
    js: sum(scripts),
    css: sum(sheets),
    html: gzipSync(html).length,
  });
}

const pictures = new Map();
if (existsSync(imagesDir)) {
  for (const file of walk(imagesDir, (name) => PICTURE.test(name))) {
    pictures.set(relative(imagesDir, file).split(sep).join('/'), statSync(file).size);
  }
}

/* ---- Write ---- */

const roundUp = (bytes) => Math.ceil((bytes * (1 + HEADROOM)) / ROUND_TO) * ROUND_TO;

if (write) {
  const previous = existsSync(BUDGET_PATH) ? readJson(BUDGET_PATH) : {};
  const fallback = {};
  for (const kind of KINDS) {
    const sorted = [...routes.values()].map((m) => m[kind]).sort((a, b) => a - b);
    fallback[kind] = roundUp(sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * DEFAULT_QUANTILE))]);
  }
  const rows = {};
  for (const [name, measure] of [...routes].sort(([a], [b]) => a.localeCompare(b))) {
    const row = {};
    for (const kind of KINDS) if (measure[kind] > fallback[kind]) row[kind] = roundUp(measure[kind]);
    if (Object.keys(row).length > 0) rows[name] = row;
  }
  const ceiling = previous.images?.ceiling ?? 250000;
  const files = {};
  for (const [name, size] of [...pictures].sort(([a], [b]) => a.localeCompare(b))) {
    if (size > ceiling) files[name] = roundUp(size);
  }
  writeFileSync(
    BUDGET_PATH,
    `${JSON.stringify(
      {
        $comment:
          'Ceilings, in bytes, for what a first visit to each page of the website costs: gzipped scripts, stylesheets and document per prerendered route, and the file size of each picture under website/public/images. scripts/validate-route-budget.mjs owns the method and the rules. A ceiling only moves in the change that moves its page.',
        default: fallback,
        routes: rows,
        images: { ceiling, files },
      },
      null,
      2
    )}\n`
  );
  console.log(
    `✓ Wrote ${display(BUDGET_PATH)}: ${routes.size} routes measured, ${Object.keys(rows).length} with a row of their own, ` +
      `${Object.keys(files).length} pictures over the per-file ceiling.`
  );
  process.exit(0);
}

/* ---- Check ---- */

if (!existsSync(BUDGET_PATH)) {
  console.error(`validate-route-budget: ${display(BUDGET_PATH)} missing. Run with --write to create it.`);
  process.exit(1);
}
const budget = readJson(BUDGET_PATH);
const errors = [];
const tooLoose = (ceiling, measure) => ceiling > measure + Math.max(measure * SLACK_RATIO, SLACK_BYTES);
const where = display(BUDGET_PATH);

for (const path of missing) {
  errors.push(`${path}: a page loads it, and it is not in website/.next. The build is incomplete; rebuild the website.`);
}

const heaviestDefaulted = Object.fromEntries(KINDS.map((kind) => [kind, 0]));
for (const [name, measure] of routes) {
  const row = budget.routes[name] ?? {};
  for (const kind of KINDS) {
    const own = row[kind];
    const ceiling = own ?? budget.default[kind];
    if (own === undefined) heaviestDefaulted[kind] = Math.max(heaviestDefaulted[kind], measure[kind]);
    if (measure[kind] > ceiling) {
      errors.push(
        `${name}: ${measure[kind]} bytes of ${kind} gzipped, over its ceiling of ${ceiling}. ` +
          `Trim the page, or raise the ceiling in ${where} in this change.`
      );
    } else if (own !== undefined && own <= budget.default[kind]) {
      errors.push(`"routes"["${name}"].${kind} is at or under the default, so it does nothing; remove it.`);
    } else if (own !== undefined && tooLoose(own, measure[kind])) {
      errors.push(
        `"routes"["${name}"].${kind} is ${own}, and the page now measures ${measure[kind]}. ` +
          `Lower the ceiling in this change so the saving holds.`
      );
    }
  }
}
for (const kind of KINDS) {
  if (tooLoose(budget.default[kind], heaviestDefaulted[kind])) {
    errors.push(
      `"default".${kind} is ${budget.default[kind]}, and the heaviest route held to it measures ${heaviestDefaulted[kind]}. ` +
        `Lower the default in this change so the saving holds.`
    );
  }
}
for (const name of Object.keys(budget.routes)) {
  if (!routes.has(name)) errors.push(`"routes"["${name}"] in ${where} names no prerendered route.`);
}

for (const [name, size] of pictures) {
  const own = budget.images.files[name];
  const ceiling = own ?? budget.images.ceiling;
  if (size > ceiling) {
    errors.push(
      `website/public/images/${name}: ${size} bytes, over its ceiling of ${ceiling}. ` +
        `Resize or re-encode it, or give it a row under "images"."files" in ${where} in this change.`
    );
  } else if (own !== undefined && size <= budget.images.ceiling) {
    errors.push(`"images"."files"["${name}"] is at or under the per-file ceiling, so it does nothing; remove it.`);
  } else if (own !== undefined && tooLoose(own, size)) {
    errors.push(`"images"."files"["${name}"] is ${own}, and the file is now ${size} bytes. Lower it in this change.`);
  }
}
for (const name of Object.keys(budget.images.files)) {
  if (!pictures.has(name)) errors.push(`"images"."files"["${name}"] in ${where} names no file under website/public/images.`);
}

if (report) {
  const pad = (value) => String(value).padStart(8);
  console.log(`${pad('js')} ${pad('css')} ${pad('html')}  route (gzipped bytes; a * marks a ceiling of its own)`);
  for (const [name, measure] of [...routes].sort(([, a], [, b]) => b.js + b.css + b.html - (a.js + a.css + a.html))) {
    const row = budget.routes[name] ?? {};
    console.log(`${KINDS.map((kind) => pad(`${measure[kind]}${row[kind] === undefined ? ' ' : '*'}`)).join(' ')}  ${name}`);
  }
  console.log(`\ndefault ceilings: ${KINDS.map((kind) => `${kind} ${budget.default[kind]}`).join(', ')}`);
}

const ownRows = Object.keys(budget.routes).length;
finish(
  '\n✗ Route budget validation failed:\n',
  errors,
  `✓ Route budget holds: ${routes.size} routes measured (${ownRows} with a ceiling of their own), ${pictures.size} pictures.`
);
