#!/usr/bin/env node
/**
 * validate-site-corpus.mjs
 *
 * Guards website/src/data/site-corpus.generated.ts, the document /api/chat
 * sends to the model as its cached system block, and served by the MCP's
 * search_site through its search sections. Four checks:
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
 *   5. No empty-state copy — the title and description an EmptyState shows
 *      only when a list is empty never reach the corpus (the releases page
 *      once told the chat "The first entry lands with the first npm
 *      publish." beside 27 releases). Read from the page sources directly,
 *      apart from the generator's walk, so a change to the walk cannot
 *      quietly let it back in.
 *
 *   4. No holes — a value a page renders inline and the walk dropped leaves
 *      punctuation with nothing before it ("save it at your project root
 *      as .", "one mode per theme: , of the themes"). Generation already
 *      fails on an expression it cannot resolve (INLINE_VALUES in the
 *      generator owns the rules); this is the backstop on the text itself:
 *      a word, a closing bracket or a quote followed by a space and then a
 *      lone , . ; or : fails, as does a colon followed by punctuation.
 *
 * Runs before every build via the validate-registry chain.
 */
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { assembleCorpus, sanctionedFacts } from './generate-site-corpus.mjs';
import { read, repoRoot } from './lib/fs.mjs';
import { finish } from './lib/report.mjs';
import { holesIn, leaksIn } from './lib/screens.mjs';


const errors = [];
const fail = (message) => errors.push(message);

// 2. Leaked details. The corpus text itself, not the generated wrapper.
//
// The email screen is an allowlist, not a blanket ban: a page can deliberately
// publish an address through a corpus-facts() block (contact does), and only
// those sanctioned values may appear. An address that arrived any other way —
// pasted into prose, leaked through a new extraction path — still fails the
// build. The boundary is "nothing reaches the model that a page did not
// deliberately publish", enforced, not remembered.
let corpus = null;
try {
  corpus = assembleCorpus().corpus;
} catch {
  // Generation already failed above; no need to report it twice.
}

if (corpus !== null) {
  const sanctioned = [...sanctionedFacts()];
  for (const leak of leaksIn(corpus)) {
    if (leak.id === 'email' && sanctioned.some((value) => value.includes(leak.text))) continue;
    fail(
      `The site corpus contains a ${leak.what} (${leak.shown}) ` +
        `that no corpus-facts() block sanctions.\n` +
        `    It is sent to the model and can be repeated to any visitor — remove it at ` +
        `the source, or publish it deliberately with a corpus-facts directive.`
    );
  }

  // 4. No holes left by a dropped inline value.
  for (const hole of holesIn(corpus)) {
    fail(
      `The site corpus has a hole where a value was dropped: ${hole}. ` +
        `Find the page line, and resolve its inline value in INLINE_VALUES in scripts/generate-site-corpus.mjs.`
    );
  }
}

// 5. No empty-state copy.
if (corpus !== null) {
  const pages = execFileSync('git', ['ls-files', 'website/src/app/**/*.tsx'], { cwd: repoRoot, encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
  for (const page of pages) {
    const source = read(join(repoRoot, page));
    for (const block of source.matchAll(/<EmptyState\b[^>]*?\/?>/gs)) {
      for (const [, , text] of block[0].matchAll(/\b(title|description)="([^"]{12,})"/g)) {
        if (corpus.includes(text)) {
          fail(`The corpus carries ${JSON.stringify(text)}, an EmptyState's copy in ${page}, which shows only when its list is empty.`);
        }
      }
    }
  }
}

// 2b. The other system block. persona.ts is sent to the model alongside the
// corpus, so the same secret-leak rules apply to it. The email screen is
// corpus-only (it depends on corpus-facts() sanctioning); this file carries no
// such mechanism, so it is held to the non-sanctionable patterns — a local
// path, GA id, or API key must never appear in a prompt file.
const promptFiles = [
  'website/src/app/api/chat/persona.ts',
];
for (const rel of promptFiles) {
  const abs = join(repoRoot, rel);
  if (!existsSync(abs)) {
    fail(`${rel} is missing — the prompt-file leak scan expects it.`);
    continue;
  }
  // The email screen is corpus-only.
  for (const leak of leaksIn(read(abs), { skip: ['email'] })) {
    fail(`${rel} contains a ${leak.what} (${leak.shown}) — it is sent to the model as a system block; remove it at the source.`);
  }
}

finish(
  '✗ Site corpus validation failed:',
  errors,
  '✓ Site corpus is current, within budget, and free of leaked details.'
);
