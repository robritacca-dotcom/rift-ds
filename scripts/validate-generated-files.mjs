#!/usr/bin/env node
/**
 * validate-generated-files.mjs
 *
 * Every generated file matches its generator. For each generator in the
 * chain (scripts/chain.mjs) that exports `surface()`, this rebuilds what it
 * writes in memory and holds the disk to it in both directions:
 *
 *   1. Each file exists and matches byte for byte, so a hand edit, or a
 *      source change committed without its regenerated output, fails.
 *   2. A folder the generator owns holds nothing it did not write, so a
 *      removed component or theme cannot leave its file behind.
 *
 * It is the one freshness check. Each generated surface used to carry its
 * own copy of this comparison in a validator of its own; the validators
 * that remain check what a surface must be (no leaked details, a closed
 * type contract, a valid shape), never whether it is fresh.
 *
 * A generator in the chain without a `surface` is listed in UNCHECKED with
 * its reason, and a new one fails here until it exports one or is listed,
 * so a generated file cannot join the build unguarded.
 *
 * Inside the chain the generators have just written, so what this catches
 * there is a generator whose output differs from one build to the next
 * (the runner drops the shared builds first, so this is a second build).
 * Run alone, or in CI before the drift guard, it catches the hand edit.
 *
 * Belongs in the validate-registry chain, first among the validators: it
 * reads source files and generated data only, never build output.
 */
import { pathToFileURL } from 'node:url';
import { CHAIN } from './chain.mjs';
import { fromRoot } from './lib/fs.mjs';
import { staleErrors } from './lib/fresh.mjs';
import { finish } from './lib/report.mjs';

/** Generators with no `surface`, and why. */
const UNCHECKED = {
  'generate-readme-content': 'rewrites marked regions of README.md in place as it loads; CI\'s drift guard holds it',
  'generate-library-barrel': 'writes the barrels as it loads, with no builder to call; CI\'s drift guard holds it',
  'sync-blueprints': 'copies three files; validate-website-surfaces holds its list, and CI\'s drift guard the copies',
  'generate-token-registry':
    'validate-token-registry compares the categories it derives, which is the part of registry.json the generator owns',
};

const errors = [];
let surfaces = 0;
let files = 0;

for (const [id] of CHAIN) {
  // An unchecked generator is never loaded: two of them write as they load.
  if (id.startsWith('validate-') || UNCHECKED[id]) continue;
  const generator = await import(pathToFileURL(fromRoot('scripts', `${id}.mjs`)).href);
  if (typeof generator.surface !== 'function') {
    errors.push(
      `scripts/${id}.mjs is a generator in the chain with no \`surface()\` export, so nothing holds its output ` +
        'to it. Export one (see scripts/lib/fresh.mjs), or list it in UNCHECKED here with the reason.'
    );
    continue;
  }
  let surface;
  try {
    surface = await generator.surface();
  } catch (error) {
    errors.push(`scripts/${id}.mjs could not build its output: ${error.message}`);
    continue;
  }
  surfaces += 1;
  files += surface.files.length;
  errors.push(...staleErrors(surface));
}
for (const id of Object.keys(UNCHECKED)) {
  if (!CHAIN.some(([step]) => step === id)) errors.push(`UNCHECKED lists ${id}, which is not a step in scripts/chain.mjs: remove the entry.`);
}

finish(
  '✗ Generated files validation failed:',
  errors,
  `✓ Generated files are current: ${files} files from ${surfaces} generators match what their generators build.`
);
