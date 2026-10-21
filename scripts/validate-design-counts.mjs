#!/usr/bin/env node
/**
 * validate-design-counts.mjs
 *
 * design.md states the size of several token families in words ("a four-step
 * size scale", "the seven chromatic ramps", "the four bubble roles"). Each is
 * a countable fact the token CSS owns, and CLAUDE.md's rule is that a
 * countable fact written in prose is checked against its home, or it drifts
 * the day a family gains a member. design.md ships to /blueprints and into the
 * chat corpus, so a stale count reaches every reader and every chat answer.
 *
 * CLAIMS is the authoritative list: each names a pattern in design.md whose
 * number word must equal a count computed from the token registry or the
 * primitives file. Every claim must match at least once, so a reworded
 * sentence cannot quietly leave its count unchecked: reword the pattern with
 * it. scripts/validate-shader-background.mjs holds the shader's own counts the
 * same way.
 *
 * Runs in the `validate-registry` chain: it reads source only.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
// Normalize CRLF so Windows checkouts validate identically to CI.
const read = (path) => readFileSync(join(repoRoot, path), 'utf8').replace(/\r\n/g, '\n');

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const NUMBER = `(${WORDS.join('|')})`;

const registry = JSON.parse(read('src/tokens/registry.json'));
const tokens = Object.values(registry.categories).flat();
const count = (re) => tokens.filter((name) => re.test(name)).length;
const primitives = read('src/tokens/tokens-primitives.css');
const families = {};
for (const m of primitives.matchAll(/--primitive-([a-z]+)-(\d\d):\s*#/g)) (families[m[1]] ??= new Set()).add(m[2]);
const chromaticRamps = Object.keys(families).filter((name) => name !== 'neutral').length;
const filePrimitives = new Set([...primitives.matchAll(/--primitive-file-[a-z]+(?=\s*:)/g)].map((m) => m[0])).size;

const bubbles = count(/^--color-chat-bubble-/);
const CLAIMS = [
  { what: 'the icon size scale', pattern: `${NUMBER}-step size scale`, actual: count(/^--icon-size-/) },
  { what: 'the chromatic primitive ramps', pattern: `${NUMBER} chromatic ramps`, actual: chromaticRamps },
  { what: 'the chat bubble roles', pattern: `${NUMBER} bubble roles`, actual: bubbles },
  { what: 'the chat bubble tokens', pattern: `${NUMBER} chat bubble tokens`, actual: bubbles },
  { what: 'the chat bubble tokens', pattern: `repointing those ${NUMBER} tokens`, actual: bubbles },
  { what: 'the file-format primitives', pattern: `overrides the ${NUMBER} primitives`, actual: filePrimitives },
  { what: 'the elevation tokens', pattern: `${NUMBER} semantic elevation tokens`, actual: count(/^--shadow-/) },
  { what: 'the contribution ramp', pattern: `${NUMBER}-step contribution ramp`, actual: count(/^--color-chart-contribution-/) },
];

const design = read('design.md');
const errors = [];
let checked = 0;
for (const claim of CLAIMS) {
  const matches = [...design.matchAll(new RegExp(`\\b${claim.pattern}`, 'gi'))];
  if (matches.length === 0) {
    errors.push(
      `design.md no longer says "${claim.pattern.replace(NUMBER, '<N>')}" (${claim.what}): update its CLAIMS ` +
        `pattern in scripts/validate-design-counts.mjs so the count stays checked, or drop the claim.`
    );
  }
  for (const m of matches) {
    checked += 1;
    const stated = WORDS.indexOf(m[1].toLowerCase());
    if (stated !== claim.actual) {
      const line = design.slice(0, m.index).split('\n').length;
      errors.push(`design.md:${line} says "${m[0]}", but ${claim.what} has ${claim.actual}. Fix the number.`);
    }
  }
}

if (errors.length > 0) {
  console.error('✗ design.md count validation failed:');
  for (const error of errors) console.error(`    - ${error}`);
  process.exit(1);
}

console.log(`✓ design.md counts hold — ${checked} stated counts match the token files`);
