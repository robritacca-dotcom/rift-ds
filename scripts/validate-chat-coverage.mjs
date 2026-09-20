#!/usr/bin/env node
/**
 * validate-chat-coverage.mjs
 *
 * The registry principle applied to the chat's context: before asking whether
 * the model answered well, prove the facts were in front of it at all. Two
 * checks, both free — no API calls:
 *
 *   1. Golden-set facts — every `metadata.requiredFacts` string in
 *      evals/chat/golden-set.json must appear in the generated site corpus.
 *      A question the corpus cannot answer is a corpus bug, not a prompt bug,
 *      and it fails the build here instead of surviving until someone asks.
 *
 *   2. Route coverage — every page.tsx route on disk (scripts/site-routes.mjs)
 *      must be either covered by a corpus section or listed in the generator's
 *      exclusion map with a written reason. This is the scaling guarantee: a
 *      new page cannot ship invisible to the site chat.
 *
 * Runs in the validate-registry chain once green (registered at the end of
 * Milestone 1 — see the plan; running it earlier documents the holes).
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { siteRoutes } from './site-routes.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const fail = (message) => errors.push(message);

const generator = await import('./generate-site-corpus.mjs');

// 1. Golden-set facts appear in the corpus.
let corpus = null;
try {
  corpus = generator.assembleCorpus().corpus;
} catch (error) {
  fail(`generating the site corpus failed: ${error.message}`);
}

if (corpus !== null) {
  const goldenSet = JSON.parse(
    readFileSync(join(repoRoot, 'evals', 'chat', 'golden-set.json'), 'utf8')
  );
  for (const test of goldenSet) {
    for (const factRaw of test.metadata?.requiredFacts ?? []) {
      const fact = String(factRaw);
      if (!corpus.includes(fact)) {
        fail(
          `golden-set case "${test.description}" requires ${JSON.stringify(fact)} ` +
            `in the corpus, and it is not there. The model cannot answer this ` +
            `question — fix the corpus (or the fact), not the prompt.`
        );
      }
    }
  }
}

// 2. Every route is covered or deliberately excluded.
if (typeof generator.routeCoverage !== 'function') {
  fail(
    'generate-site-corpus.mjs does not export routeCoverage() — the corpus ' +
      'cannot prove which pages it covers. (Expected once the route-driven ' +
      'page extraction lands.)'
  );
} else {
  const { covered, excluded } = generator.routeCoverage();
  for (const route of siteRoutes()) {
    if (covered.has(route)) continue;
    if (excluded.has(route)) continue;
    fail(
      `route ${route} has a page on disk but no corpus coverage and no ` +
        `exclusion entry. Either a section must include its prose, or ` +
        `EXCLUDED_ROUTES in generate-site-corpus.mjs must name it with a reason.`
    );
  }
  // The inverse: an exclusion for a route that no longer exists is stale.
  const routes = new Set(siteRoutes());
  for (const route of excluded.keys()) {
    if (!routes.has(route)) {
      fail(`EXCLUDED_ROUTES lists ${route}, which has no page on disk — remove the stale entry.`);
    }
  }
}

if (errors.length > 0) {
  console.error('\n✗ Chat context coverage failed:\n');
  for (const error of errors) console.error(`  - ${error}\n`);
  process.exit(1);
}

console.log('✓ Chat context coverage: every golden-set fact is in the corpus, every route is covered or deliberately excluded.');
