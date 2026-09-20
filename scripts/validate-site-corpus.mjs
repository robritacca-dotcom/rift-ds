#!/usr/bin/env node
/**
 * validate-site-corpus.mjs
 *
 * Guards website/src/data/site-corpus.generated.ts, the document /api/chat
 * sends to the model as its cached system block. Three checks:
 *
 *   1. Freshness — regenerates in memory and byte-compares against disk, so a
 *      page edit that changes the corpus can't land without the regenerated
 *      file. (CI also runs a drift guard after the generators.)
 *
 *   2. No leaked details — the corpus is read aloud by a model to strangers,
 *      so a local path or an analytics id in it is worse than the same string
 *      sitting in a source file. Contact-shaped details (email addresses) are
 *      allowlisted against corpus-facts() blocks: a page may deliberately
 *      publish them, and nothing else may.
 *
 *   3. Budget — the corpus is billed on every chat message. Generation already
 *      refuses to write an over-budget corpus; this catches a file that was
 *      committed before the gate existed, or edited by hand.
 *
 * Runs before every build via the validate-registry chain.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSiteCorpus, assembleCorpus, sanctionedFacts, outputPath } from './generate-site-corpus.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const relative = (path) => path.replace(repoRoot + '/', '');

const errors = [];
const fail = (message) => errors.push(message);

// 1. Freshness.
try {
  const expected = buildSiteCorpus();
  const onDisk = existsSync(outputPath)
    ? readFileSync(outputPath, 'utf8').replace(/\r\n/g, '\n')
    : null;

  if (onDisk === null) {
    fail(
      `${relative(outputPath)} is missing — run ` +
        `\`node scripts/generate-site-corpus.mjs\` and commit the result.`
    );
  } else if (onDisk !== expected) {
    fail(
      `${relative(outputPath)} is stale — run ` +
        `\`node scripts/generate-site-corpus.mjs\` and commit the result.`
    );
  }
} catch (error) {
  fail(`generating the site corpus failed: ${error.message}`);
}

// 2. Leaked details. The corpus text itself, not the generated wrapper.
//
// The email screen is an allowlist, not a blanket ban: a page can deliberately
// publish an address through a corpus-facts() block (contact does), and only
// those sanctioned values may appear. An address that arrived any other way —
// pasted into prose, leaked through a new extraction path — still fails the
// build. The boundary is "nothing reaches the model that a page did not
// deliberately publish", enforced, not remembered.
const leakPatterns = [
  [/\/Users\/[A-Za-z]/g, 'local absolute path (/Users/…)', false],
  [/property[\s_-]?(?:id)?\W{0,3}\d{6,}/gi, 'GA property id', false],
  [/sk-ant-[A-Za-z0-9-]/g, 'Anthropic API key', false],
  [/\b[A-Za-z0-9._%+-]+@(?!example\.)[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, 'email address', true],
];

try {
  const { corpus } = assembleCorpus();
  const sanctioned = [...sanctionedFacts()];
  for (const [pattern, what, sanctionable] of leakPatterns) {
    for (const match of corpus.matchAll(pattern)) {
      if (sanctionable && sanctioned.some((value) => value.includes(match[0]))) continue;
      fail(
        `The site corpus contains a ${what} (${JSON.stringify(match[0].slice(0, 40))}) ` +
          `that no corpus-facts() block sanctions.\n` +
          `    It is sent to the model and can be repeated to any visitor — remove it at ` +
          `the source, or publish it deliberately with a corpus-facts directive.`
      );
    }
  }
} catch {
  // Generation already failed above; no need to report it twice.
}

// 2b. The other system blocks. persona.ts and easter-eggs.ts are sent to the
// model alongside the corpus, so the same secret-leak rules apply to them. The
// email screen is corpus-only (it depends on corpus-facts() sanctioning); these
// files carry no such mechanism, so they are held to the non-sanctionable
// patterns — a local path, GA id, or API key must never appear in a prompt file.
const promptFiles = [
  'website/src/app/api/chat/persona.ts',
  'website/src/app/api/chat/easter-eggs.ts',
];
for (const rel of promptFiles) {
  const abs = join(repoRoot, rel);
  if (!existsSync(abs)) {
    fail(`${rel} is missing — the prompt-file leak scan expects it.`);
    continue;
  }
  const text = readFileSync(abs, 'utf8');
  for (const [pattern, what, sanctionable] of leakPatterns) {
    if (sanctionable) continue; // the email screen is corpus-only
    for (const match of text.matchAll(pattern)) {
      fail(
        `${rel} contains a ${what} (${JSON.stringify(match[0].slice(0, 40))}) — ` +
          `it is sent to the model as a system block; remove it at the source.`
      );
    }
  }
}

if (errors.length > 0) {
  console.error('\n✗ Site corpus validation failed:\n');
  for (const error of errors) console.error(`  - ${error}\n`);
  process.exit(1);
}

console.log('✓ Site corpus is current, within budget, and free of leaked details.');
