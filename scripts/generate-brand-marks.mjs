#!/usr/bin/env node
/**
 * generate-brand-marks.mjs
 *
 * Writes website/src/data/brand-marks.generated.ts: the brand marks the
 * playground's DESIGN.md import can show beside an imported file's title,
 * when the file names a brand it recognises (lib/theme/brand-mark.ts owns
 * the matching; a file it cannot place gets a monogram instead).
 *
 * The marks come from Simple Icons (CC0, the `simple-icons` package the
 * website depends on), cut to BRANDS below: the products a DESIGN.md is
 * most often written about. The full set is several megabytes of path
 * data, far too much to hand a visitor for one logo, so the playground
 * imports this file on demand, only when a DESIGN.md is dropped, the way
 * it imports the Google font catalogue. Nothing is fetched at runtime and
 * nothing leaves the visitor's browser.
 *
 * The marks are trademarks. The playground shows one only to identify
 * whose look a file describes, on the source card; it is never put into
 * the themed mock product, whose mark stays the Product name lever's.
 *
 * Generation fails when a slug in BRANDS is not in the installed icon set,
 * so a brand the set drops cannot silently disappear. Brands Simple Icons
 * does not carry (several were removed at their owners' request) are in
 * NOT_CARRIED for the record; they get the monogram.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
export const outputPath = join(repoRoot, 'website', 'src', 'data', 'brand-marks.generated.ts');

/** The brands the import recognises, by Simple Icons slug. */
export const BRANDS = [
  // Product and design tools
  'airtable', 'asana', 'atlassian', 'basecamp', 'calendly', 'clickup', 'dribbble', 'behance', 'evernote',
  'figma', 'framer', 'grammarly', 'hubspot', 'intercom', 'jira', 'loom', 'mailchimp', 'miro', 'notion',
  'obsidian', 'raycast', 'shortcut', 'todoist', 'trello', 'typeform', 'webflow', 'wix', 'squarespace',
  'wordpress', 'ghost', 'zapier', 'linear', 'producthunt',
  // Developer platforms
  'cloudflare', 'cursor', 'datadog', 'digitalocean', 'docker', 'github', 'gitlab', 'bitbucket',
  'huggingface', 'mongodb', 'netlify', 'npm', 'posthog', 'postgresql', 'redis', 'replit', 'retool',
  'sentry', 'stackoverflow', 'supabase', 'vercel', 'nextdotjs', 'react', 'tailwindcss', 'svelte',
  'anthropic', 'claude', 'perplexity',
  // Finance
  'stripe', 'paypal', 'square', 'cashapp', 'venmo', 'coinbase', 'robinhood', 'revolut', 'monzo', 'wise',
  'klarna', 'brex', 'visa', 'mastercard',
  // Consumer, media and social
  'airbnb', 'apple', 'google', 'meta', 'facebook', 'instagram', 'whatsapp', 'threads', 'x', 'tiktok',
  'snapchat', 'pinterest', 'reddit', 'discord', 'telegram', 'twitch', 'youtube', 'netflix', 'spotify',
  'soundcloud', 'tidal', 'deezer', 'audible', 'medium', 'substack', 'duolingo', 'strava', 'peloton',
  'headspace', 'zoom', 'dropbox', 'gmail', 'protonmail', 'duckduckgo', 'brave', 'firefox', 'opera',
  'vivaldi', 'googlechrome', 'letterboxd', 'imdb', 'goodreads',
  // Commerce, travel and mobility
  'shopify', 'etsy', 'ebay', 'ikea', 'nike', 'starbucks', 'mcdonalds', 'tesla', 'uber', 'lyft',
  'doordash', 'deliveroo', 'expedia', 'tripadvisor', 'bookingdotcom',
  // Hardware and platforms
  'samsung', 'sony', 'playstation', 'steam',
];

/** Well-known brands Simple Icons does not carry, kept for the record so
    nobody re-adds them expecting a mark. They get the monogram. */
export const NOT_CARRIED = [
  'mobbin', 'slack', 'microsoft', 'openai', 'amazon', 'adobe', 'canva', 'linkedin', 'salesforce',
  'nintendo', 'xbox', 'lego', 'disney', 'hulu',
];

const require = createRequire(join(repoRoot, 'website', 'package.json'));
/* The package's data files are not in its exports map, so they are read
   by path from the installed package's folder. */
const packageDir = dirname(require.resolve('simple-icons'));
const readJson = (rel) => JSON.parse(readFileSync(join(packageDir, rel), 'utf8'));

const pathOf = (slug) => {
  const svg = readFileSync(join(packageDir, 'icons', `${slug}.svg`), 'utf8');
  const d = /<path d="([^"]+)"/.exec(svg)?.[1];
  if (!d) throw new Error(`simple-icons/icons/${slug}.svg has no path`);
  return d;
};

/** The file as a string, so the validator can byte-compare it. */
export function assembleBrandMarks() {
  const data = readJson('data/simple-icons.json');
  const icons = Array.isArray(data) ? data : data.icons;
  const bySlug = new Map(icons.filter((icon) => icon.slug).map((icon) => [icon.slug, icon]));
  const missing = BRANDS.filter((slug) => !bySlug.has(slug));
  if (missing.length > 0) {
    throw new Error(
      `BRANDS names slugs the installed simple-icons does not carry: ${missing.join(', ')}. ` +
        'Move them to NOT_CARRIED or correct the slug.'
    );
  }
  const version = readJson('package.json').version;
  const marks = [...new Set(BRANDS)].sort().map((slug) => {
    const icon = bySlug.get(slug);
    const aliases = [
      ...(icon.aliases?.aka ?? []),
      ...Object.values(icon.aliases?.loc ?? {}),
    ];
    return { slug, title: icon.title, hex: `#${icon.hex.toUpperCase()}`, aliases, path: pathOf(slug) };
  });

  return `/**
 * GENERATED by scripts/generate-brand-marks.mjs from simple-icons ${version}
 * (CC0) — never hand-edit. Imported on demand by lib/theme/brand-mark.ts.
 */
export interface BrandMarkData {
  slug: string;
  title: string;
  hex: string;
  aliases: string[];
  /** The mark as one SVG path on a 24 by 24 grid. */
  path: string;
}

export const BRAND_MARKS: BrandMarkData[] = ${JSON.stringify(marks, null, 2)};
`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const output = assembleBrandMarks();
  writeFileSync(outputPath, output);
  console.log(`✓ Generated brand marks — ${BRANDS.length} brands from simple-icons.`);
}
