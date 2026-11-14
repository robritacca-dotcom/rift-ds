#!/usr/bin/env node
/**
 * run-chain.mjs
 *
 * Runs the build chain in scripts/chain.mjs, in order, and stops at the
 * first step that fails, the way the `&&` list it replaced did.
 *
 *   node scripts/run-chain.mjs                    the whole chain
 *   node scripts/run-chain.mjs --set site-build   the website's prebuild steps
 *   node scripts/run-chain.mjs --set site-dev     the website's predev steps
 *   node scripts/run-chain.mjs --only <id> ...    only the named steps, in chain order
 *
 * Every step runs inside this process. A validator is imported, and its
 * top level is the check. A generator is imported and its exported `main`
 * is called. That is what lets expensive work happen once: the docgen
 * parse and its TypeScript program are cached by the modules that build
 * them (scripts/lib/memo.mjs), so ten steps that each used to parse the
 * library in a process of their own now share one parse. A failing step
 * ends through `finish` or `failStep` in scripts/lib/report.mjs, which
 * throw here instead of exiting.
 *
 * The memo is dropped once, between the generators and the validators, so
 * the freshness checks compare the disk with a second, independent build.
 *
 * SPAWNED lists the generators that still run as a process of their own,
 * each with its reason.
 *
 * Every step also still runs alone, as `node scripts/<id>.mjs`.
 */
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { CHAIN, chainSteps } from './chain.mjs';
import { repoRoot } from './lib/fs.mjs';
import { clearMemos } from './lib/memo.mjs';
import { StepFailed } from './lib/report.mjs';

const args = process.argv.slice(2);
const flag = (name) => {
  const at = args.indexOf(name);
  return at === -1 ? undefined : args.slice(at + 1).filter((arg, i, rest) => rest.slice(0, i + 1).every((a) => !a.startsWith('--')));
};

let steps;
try {
  steps = chainSteps(flag('--set')?.[0] ?? 'all');
} catch (error) {
  console.error(`✗ ${error.message}`);
  process.exit(1);
}
const only = flag('--only');
if (only) {
  const known = new Set(CHAIN.map(([id]) => id));
  const unknown = only.filter((id) => !known.has(id));
  if (only.length === 0 || unknown.length > 0) {
    console.error(`✗ --only needs step ids from scripts/chain.mjs${unknown.length ? `; unknown: ${unknown.join(', ')}` : ''}`);
    process.exit(1);
  }
  steps = steps.filter((id) => only.includes(id));
}

const scriptOf = (id) => join(repoRoot, 'scripts', `${id}.mjs`);
const isValidator = (id) => id.startsWith('validate-');

/** Generators that write at module top level, or parse their own command line. */
const SPAWNED = new Set([
  // Writes README.md as the module loads, and exits on version drift.
  'generate-readme-content',
  // Writes the two barrels as the module loads.
  'generate-library-barrel',
  // A command line of its own (`npm run graph -- tree <name>`) around the write.
  'generate-dependency-graph',
]);

globalThis.__riftChainRunner = true;
const started = process.hrtime.bigint();

let generated = false;
for (const id of steps) {
  // The generators have written; the validators now rebuild from nothing.
  // A validator that regenerates a file and compares it with the disk must
  // do a build of its own, or a generator whose output changes from one
  // build to the next would be compared with itself and pass.
  if (isValidator(id) && generated) {
    clearMemos();
    generated = false;
  } else if (!isValidator(id)) {
    generated = true;
  }
  if (!SPAWNED.has(id)) {
    try {
      const step = await import(pathToFileURL(scriptOf(id)).href);
      if (!isValidator(id)) {
        if (typeof step.main !== 'function') throw new Error(`scripts/${id}.mjs exports no main(), so the chain cannot run it`);
        await step.main();
      }
    } catch (error) {
      // A StepFailed has already printed its errors; anything else is a crash.
      if (!(error instanceof StepFailed)) console.error(error);
      console.error(`\n✗ Chain stopped at ${id}. Run it alone with: node scripts/${id}.mjs`);
      process.exit(1);
    }
  } else {
    const result = spawnSync(process.execPath, [scriptOf(id)], { stdio: 'inherit' });
    if (result.status !== 0) {
      console.error(`\n✗ Chain stopped at ${id}. Run it alone with: node scripts/${id}.mjs`);
      process.exit(result.status ?? 1);
    }
  }
}

const seconds = (Number(process.hrtime.bigint() - started) / 1e9).toFixed(1);
console.log(`✓ Chain complete: ${steps.length} steps in ${seconds}s.`);
