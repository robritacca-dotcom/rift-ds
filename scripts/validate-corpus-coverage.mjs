#!/usr/bin/env node
/**
 * Catches page prose that never reaches the site-chat corpus.
 *
 * validate-site-corpus.mjs proves the corpus matches its generator, and
 * validate-chat-coverage.mjs proves every route is either covered or excluded
 * with a reason. Neither can see the failure that actually bites: a route that
 * is covered, whose generator ran clean, and whose words are still missing —
 * because the extractor did not know where on the page they lived.
 *
 * That happened. `extractProse` skipped every JSX attribute, so the case
 * studies' figure captions and Alert callouts were absent from the model's
 * context while all three validators stayed green. Ask the chat whether an LLM
 * could have done the 2021 compensation work and it answered blind, past a
 * callout on that very page written to answer it. The gap was invisible
 * because every check compared the corpus against the generator or the route
 * list, never against what a visitor actually reads.
 *
 * WHY THIS RUNS ON BUILT HTML
 *
 * The rendered page is the only honest statement of "what the site says".
 * Source-level checks inherit the extractor's blind spots, which is the very
 * thing being tested. So this reads the prerendered HTML and runs AFTER the
 * website build, alongside validate-rendered-spacing.mjs, rather than in the
 * prebuild validate-registry chain where no HTML exists yet.
 *
 * WHAT COUNTS
 *
 * Only <main>, so the nav and footer that repeat on every route are out of
 * scope. Only sentence-shaped runs, so labels, numbers and chrome do not
 * dominate the ratio. A route fails when a real share of its sentences are
 * missing AND there are enough of them to mean something, which keeps a
 * one-line miss on a three-line page from crying wolf.
 *
 * FIXING A FINDING
 *
 * Two possibilities, and the missing sentences tell you which. Either the
 * extractor cannot see that prose — it lives somewhere new, an attribute or a
 * file shape nothing reads yet — and generate-site-corpus.mjs needs to learn
 * about it. Or the omission is deliberate, in which case it belongs in
 * CONDENSED_ROUTES below with a reason a stranger could audit.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'node:fs/promises';

import { routeCoverage } from './generate-site-corpus.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const appDir = join(repoRoot, 'website', '.next', 'server', 'app');
const corpusPath = join(repoRoot, 'website', 'src', 'data', 'site-corpus.generated.ts');

/**
 * Routes whose page deliberately says more than the corpus carries, with the
 * reason. Unlike EXCLUDED_ROUTES in the generator, these ARE in the corpus —
 * in summary or condensed form, because carrying them whole costs more context
 * than the answers are worth.
 */
const CONDENSED_ROUTES = new Map([
  ['/skills',
    'the page publishes every SKILL.md in full; the corpus carries each skill\'s ' +
    'name and description, which is what a visitor asks about — the procedures ' +
    'themselves are instructions to agents, not facts about Rob or the site'],
  ['/blueprints/design',
    'design.md\'s per-component spec blocks (one per registered component) are ' +
    'condensed out by condenseDesignSpec: well over a third of the whole token ' +
    'budget, to restate what the Component library section already lists and ' +
    'Storybook documents from source'],
  ['/blueprints/claude',
    'condenseClaudeMd drops the step-by-step contributor checklists — they tell ' +
    'an agent how to add a component, which no visitor is asking the chat'],
  ['/blueprints/content-design',
    'content-design.md is carried in full; the shortfall is its worked ' +
    'before/after examples, which read as sentence fragments once the markdown ' +
    'table around them is stripped'],
  ['/docs/get-started',
    'the shortfall is the install and import code samples, which the page shows ' +
    'as code blocks — the chat links the page rather than reciting snippets'],
  ['/templates',
    'the shortfall is the template cards\' one-line descriptions, which live in ' +
    'templatesSidebarLinks (navigation.ts) outside the route folder the prose ' +
    'extractor reads — the index\'s own prose is carried, and the site map ' +
    'names every template route'],
]);

/** A route fails above this share of its sentences missing… */
const MAX_MISSING_RATIO = 0.25;
/** …but only once it has this many missing, so a short page can't trip it. */
const MIN_MISSING_COUNT = 5;

const read = (p) => readFileSync(p, 'utf8');

/** The corpus is a TS string literal; undo its escaping and flatten space. */
function corpusText() {
  const raw = read(corpusPath)
    .replace(/\\'/g, "'")
    .replace(/\\`/g, '`')
    .replace(/\\n/g, ' ')
    .replace(/\\\\/g, '\\');
  return raw.replace(/\s+/g, ' ');
}

const ENTITIES = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'",
  '&apos;': "'", '&nbsp;': ' ', '&rsquo;': '’', '&lsquo;': '‘',
  '&ldquo;': '“', '&rdquo;': '”', '&mdash;': '—', '&ndash;': '–',
  '&hellip;': '…', '&times;': '×', '&rarr;': '→', '&larr;': '←',
};
/**
 * Named entities from the table, numeric ones by code point. React escapes
 * apostrophes as `&#x27;`, and an entity left undecoded would read as a
 * sentence the corpus is missing when the corpus simply spells it properly.
 */
const decode = (t) =>
  t.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, body) => {
    if (body[0] === '#') {
      const code = body[1] === 'x' || body[1] === 'X'
        ? parseInt(body.slice(2), 16)
        : parseInt(body.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : entity;
    }
    return ENTITIES[entity.toLowerCase()] ?? entity;
  });

const DROPPED = /<(script|style|template|svg|noscript)\b[\s\S]*?<\/\1>/gi;

/** Sentence-shaped runs of visible text inside <main>. */
function pageSentences(html) {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  const body = decode((main ? main[1] : html).replace(DROPPED, ' ').replace(/<[^>]+>/g, '\n'));
  const seen = new Set();
  for (const line of body.split('\n')) {
    const text = line.replace(/\s+/g, ' ').trim();
    if (text.length >= 45 && text.split(' ').length >= 8) seen.add(text);
  }
  return [...seen];
}

/** Built HTML by route. Next writes one .html per prerendered route. */
async function renderedPages() {
  const pages = new Map();
  for await (const file of glob('**/*.html', { cwd: appDir })) {
    // glob returns native separators; normalize so a Windows checkout
    // computes the same /nested/route keys as CI.
    const rel = file.replaceAll('\\', '/');
    const route = '/' + rel.replace(/\.html$/, '').replace(/(^|\/)index$/, '');
    pages.set(route === '/' ? '/' : route.replace(/\/$/, ''), join(appDir, file));
  }
  return pages;
}

const pages = await renderedPages();
if (pages.size === 0) {
  console.error(
    '✗ No prerendered HTML found under website/.next/server/app.\n' +
      '  Run the website build first: npm --prefix website run build'
  );
  process.exit(1);
}

const corpus = corpusText();
const { covered } = routeCoverage();

const failures = [];
const condensed = [];
let checked = 0;

for (const route of [...covered.keys()].sort()) {
  const file = pages.get(route);
  if (!file) continue; // dynamic or non-prerendered route: nothing to compare
  checked += 1;

  const sentences = pageSentences(read(file));
  if (sentences.length === 0) continue;
  // A 70-character head is enough to identify a sentence and short enough to
  // survive the markdown the corpus wraps some prose in.
  const missing = sentences.filter((s) => !corpus.includes(s.slice(0, 70)));
  const ratio = missing.length / sentences.length;

  if (CONDENSED_ROUTES.has(route)) {
    condensed.push(route);
    continue;
  }
  if (missing.length >= MIN_MISSING_COUNT && ratio > MAX_MISSING_RATIO) {
    failures.push({ route, missing, total: sentences.length, ratio });
  }
}

const stale = [...CONDENSED_ROUTES.keys()].filter((r) => !condensed.includes(r));
if (stale.length > 0) {
  console.error(
    `✗ Stale CONDENSED_ROUTES entries in scripts/validate-corpus-coverage.mjs (${stale.length}):\n` +
      stale.map((r) => `  ${r} — not a covered, prerendered route any more`).join('\n')
  );
  process.exit(1);
}

if (failures.length > 0) {
  console.error(
    `✗ Page prose missing from the site-chat corpus on ${failures.length} route(s).\n\n` +
      '  The chat answers from the corpus alone, so these sentences are invisible\n' +
      '  to it. Either teach scripts/generate-site-corpus.mjs where this prose\n' +
      '  lives, or record the omission in CONDENSED_ROUTES with a reason.\n'
  );
  for (const f of failures) {
    console.error(
      `\n  ${f.route} — ${f.missing.length}/${f.total} sentences (${Math.round(f.ratio * 100)}%) not in the corpus:`
    );
    for (const s of f.missing.slice(0, 5)) {
      console.error(`    · ${s.length > 110 ? `${s.slice(0, 110)}…` : s}`);
    }
    if (f.missing.length > 5) console.error(`    · …and ${f.missing.length - 5} more`);
  }
  process.exit(1);
}

console.log(
  `✓ Corpus covers the rendered pages — ${checked} route(s) checked, ` +
    `${condensed.length} deliberately condensed.`
);
