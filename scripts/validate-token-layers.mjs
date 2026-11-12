#!/usr/bin/env node
/**
 * validate-token-layers.mjs
 *
 * Holds the token stylesheets to the cascade-layer contract that
 * src/tokens/tokens.css states: every base token sits in the rift.tokens
 * layer and every preset in rift.preset, so any unlayered rule a consumer
 * writes outranks them whatever its selector. A token declared outside the
 * layer (appended after a file's closing brace, say) would silently go back
 * to outranking a consumer's plain :root override, the bug the layers fixed,
 * and src/stories/TokenLayers.stories.tsx probes only a couple of tokens, so
 * it would not notice. Three checks, and one left to another script:
 *
 *   1. tokens.css states the layer order before its first @import.
 *   2. Each base token file in LAYERED states the same order, and every
 *      custom-property declaration in it sits inside an @layer rift.tokens
 *      block (any depth: a media block inside the layer is fine).
 *   3. The forced-colors sheet declares no layer: it is unlayered on
 *      purpose, so its system colours outrank every theme and, through the
 *      id in its selector, a consumer's own override (its header says why).
 *   -  The preset stylesheets are byte-compared to their generator by
 *      validate-preset-stylesheets.mjs, which also parses mono's layer, so
 *      they are not re-checked here.
 *
 * Runs in the validate-registry chain beside the other token validators:
 * it reads source CSS only.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const tokensDir = join(repoRoot, 'src', 'tokens');
const ORDER = '@layer rift.tokens, rift.preset;';

/** The base token files whose declarations must all sit in rift.tokens. */
const LAYERED = [
  'tokens-primitives.css',
  'tokens-typography.css',
  'tokens-motion.css',
  'tokens-light.css',
  'tokens-dark.css',
];
const UNLAYERED = 'tokens-forced-colors.css';

// Normalize CRLF so Windows checkouts validate identically to CI.
const read = (name) =>
  readFileSync(join(tokensDir, name), 'utf8')
    .replace(/\r\n/g, '\n')
    .replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '));

const lineOf = (css, index) => css.slice(0, index).split('\n').length;

const errors = [];

// Check 1: the entry point fixes the order before it imports anything.
{
  const css = read('tokens.css');
  const order = css.indexOf(ORDER);
  const firstImport = css.indexOf('@import');
  if (order === -1) errors.push(`src/tokens/tokens.css does not state "${ORDER}"`);
  else if (firstImport !== -1 && order > firstImport)
    errors.push(`src/tokens/tokens.css states the layer order after an @import; it must come first`);
}

// Check 2: every declaration in a base file is inside an @layer rift.tokens block.
for (const name of LAYERED) {
  const css = read(name);
  if (!css.includes(ORDER)) errors.push(`src/tokens/${name} does not state "${ORDER}"`);
  const stack = [];
  let preludeStart = 0;
  for (let i = 0; i < css.length; i += 1) {
    const ch = css[i];
    if (ch === '{') {
      const prelude = css.slice(preludeStart, i).trim();
      stack.push(/^@layer\s+rift\.tokens$/.test(prelude));
      preludeStart = i + 1;
    } else if (ch === '}') {
      stack.pop();
      preludeStart = i + 1;
    } else if (ch === ';') {
      const statement = css.slice(preludeStart, i).trim();
      const declared = /^(--[\w-]+)\s*:/.exec(statement);
      if (declared && !stack.includes(true)) {
        errors.push(
          `src/tokens/${name}:${lineOf(css, preludeStart + css.slice(preludeStart).indexOf(declared[1]))} — ${declared[1]} is declared outside @layer rift.tokens; move it inside the layer block`
        );
      }
      preludeStart = i + 1;
    }
  }
}

// Check 3: the forced-colors sheet stays out of every layer.
{
  const css = read(UNLAYERED);
  if (/@layer\b/.test(css))
    errors.push(`src/tokens/${UNLAYERED} declares a cascade layer; it must stay unlayered so its system colours outrank every theme`);
}

if (errors.length > 0) {
  console.error('✗ Token layer validation failed:');
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}
console.log(
  `✓ Token layers hold — ${LAYERED.length} base token files declare every token inside rift.tokens, tokens.css fixes the order first, and the forced-colors sheet stays unlayered.`
);
