/**
 * lib/report.mjs
 *
 * How a chain script ends. A validator collects every failure, then calls
 * `finish`: on failure it prints the header and one line per error and
 * fails the step; on success it prints one line.
 *
 * "Fails the step" has two forms. Run on its own (`node scripts/x.mjs`) a
 * script exits 1, as it always has. Run inside scripts/run-chain.mjs,
 * which imports each step into one process so expensive work is shared, it
 * throws StepFailed instead, and the runner stops the chain there. A
 * step the runner imports never calls process.exit itself: `failStep` is the
 * one way out. The generators in SPAWNED in scripts/run-chain.mjs run as
 * processes of their own and may exit.
 *
 * A helper module, not a chain script: it checks nothing by itself.
 */
import { pathToFileURL } from 'node:url';

/** Thrown in place of exiting when the chain runner is driving. */
export class StepFailed extends Error {
  constructor() {
    super('a chain step failed');
    this.name = 'StepFailed';
  }
}

/** Set by scripts/run-chain.mjs before it imports a step. */
export const inChain = () => globalThis.__riftChainRunner === true;

/** Fail the step: exit 1 standalone, throw inside the runner. */
export function failStep() {
  if (inChain()) throw new StepFailed();
  process.exit(1);
}

/**
 * Print the outcome and end the step.
 *
 * @param {string} header  The failure header, e.g. "✗ JS timing validation failed:".
 * @param {string[]} errors  Every failure found; each names its fix.
 * @param {string | (() => string)} ok  The one success line, with its ✓.
 * @param {{ hint?: string }} [options]  A closing line printed after the errors.
 */
export function finish(header, errors, ok, { hint } = {}) {
  if (errors.length > 0) {
    console.error(header);
    for (const error of errors) console.error(`  - ${error}`);
    if (hint) console.error(hint);
    failStep();
  }
  console.log(typeof ok === 'function' ? ok() : ok);
}

/**
 * True when `url` (a module's import.meta.url) is the script node was
 * started with. A generator writes its files from an exported `main`, and
 * ends with `if (isEntryScript(import.meta.url)) await main();`, so it
 * still runs alone while the chain runner, and any validator that imports
 * its builders, can load it without it writing anything.
 */
export const isEntryScript = (url) =>
  process.argv[1] !== undefined && pathToFileURL(process.argv[1]).href === url;
