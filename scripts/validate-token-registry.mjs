#!/usr/bin/env node
/**
 * Validates src/tokens/registry.json against the token CSS files.
 *
 * Two checks:
 *   1. The registry matches what generate-token-registry.mjs would derive
 *      from the semantic token CSS (tokens-light.css + tokens-typography.css
 *      + tokens-motion.css) right now — catches hand-edits and stale
 *      checkouts.
 *   2. Light/dark colour parity: every --color-* token in tokens-light.css
 *      has a dark value in tokens-dark.css and vice versa (the token
 *      architecture invariant — see CLAUDE.md).
 *
 * Runs before every build — library, Storybook, and website — so the
 * public token count can never silently drift from the CSS.
 */
import { join } from 'node:path';
import {
  deriveTokenRegistry,
  parseTokenNames,
  summarize,
} from './generate-token-registry.mjs';
import { fromRoot, read, readJson } from './lib/fs.mjs';
import { failStep } from './lib/report.mjs';

const tokensDir = fromRoot('src', 'tokens');

let failed = false;

const registry = readJson(join(tokensDir, 'registry.json'));
const derived = deriveTokenRegistry();

if (JSON.stringify(registry.categories) !== JSON.stringify(derived.categories)) {
  failed = true;
  console.error(
    `✗ src/tokens/registry.json is out of sync with the token CSS — ` +
      `run \`npm run validate-registry\` to regenerate it (never hand-edit).`
  );
}

const lightColors = new Set(derived.categories.colour);
const darkColors = new Set(
  parseTokenNames(read(join(tokensDir, 'tokens-dark.css'))).filter((n) =>
    n.startsWith('--color-')
  )
);

const missingFromDark = [...lightColors].filter((n) => !darkColors.has(n)).sort();
const missingFromLight = [...darkColors].filter((n) => !lightColors.has(n)).sort();

if (missingFromDark.length > 0) {
  failed = true;
  console.error(
    `✗ Colour tokens defined in tokens-light.css but missing from tokens-dark.css:\n` +
      missingFromDark.map((n) => `    - ${n}`).join('\n')
  );
}

if (missingFromLight.length > 0) {
  failed = true;
  console.error(
    `✗ Colour tokens defined in tokens-dark.css but missing from tokens-light.css:\n` +
      missingFromLight.map((n) => `    - ${n}`).join('\n')
  );
}

if (failed) failStep();

const { total, perCategory } = summarize(registry.categories);
console.log(
  `✓ Token registry in sync — ${total} semantic tokens (${perCategory}); ` +
    `light/dark colour parity holds.`
);
