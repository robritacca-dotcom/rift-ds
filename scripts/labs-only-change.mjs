#!/usr/bin/env node
/**
 * labs-only-change.mjs
 *
 * Decides whether a change touches nothing but labs: the experiment pages
 * under website/src/app/labs/ and the few files a new lab has to register
 * itself in. Labs are noindex, chromeless surface experiments, built for
 * fun, so a labs-only change takes the lighter CI path: the slow jobs that
 * cannot be affected by a labs page (story tests, the Storybook build, the
 * package build, its publish lint and the API gate) stand down.
 *
 * What still runs on the labs path, and why it is enough: lint, the library
 * type check (whose prebuild is the full validate-registry chain, so the
 * corpus, the dependency graph and every source scanner still hold), the
 * drift guard, the website build and its built-HTML checks, and the
 * hydration smoke. `npm run verify:labs` is the local mirror of that path.
 *
 * Two modes:
 *
 *   CI (GITHUB_OUTPUT set): compares LABS_BASE with LABS_HEAD and writes
 *   `labs-only=true|false` to the step output. A base it cannot resolve (a
 *   new branch's all-zero `before`, a force push) is never labs-only, so
 *   anything ambiguous takes the full path.
 *
 *   Local (`--check`, used by verify:labs): compares the merge base with
 *   origin/main against the working tree, untracked files included, and
 *   exits 1 with the offending paths when the change is not labs-only, so
 *   the lighter mirror cannot be used to skip checks a change needs.
 *
 * The allowlist below is the one home of what counts as labs.
 */
import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

/** Paths a labs-only change may touch. */
const LABS_ALLOWLIST = [
  // The experiment pages themselves.
  /^website\/src\/app\/labs\//,
  // Assets a lab serves (a backdrop picture, say).
  /^website\/public\/labs\//,
  // Where a new lab registers itself: no shared chrome, out of the corpus,
  // and the dependency graph regenerated to include its page.
  /^website\/src\/config\/chromeless\.ts$/,
  /^scripts\/generate-site-corpus\.mjs$/,
  /^website\/src\/data\/dependency-graph\.generated\.ts$/,
];

const isLabs = (path) => LABS_ALLOWLIST.some((rule) => rule.test(path));

const git = (...args) =>
  execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

const lines = (text) => text.split('\n').map((line) => line.trim()).filter(Boolean);

function resolves(ref) {
  if (!ref || /^0+$/.test(ref)) return false;
  try {
    git('rev-parse', '--verify', '--quiet', `${ref}^{commit}`);
    return true;
  } catch {
    return false;
  }
}

if (process.argv.includes('--check')) {
  let base;
  try {
    base = git('merge-base', 'origin/main', 'HEAD');
  } catch {
    console.error('✗ labs-only check: no merge base with origin/main (run git fetch first).');
    process.exit(1);
  }
  const changed = [
    ...lines(git('diff', '--name-only', base)),
    ...lines(git('ls-files', '--others', '--exclude-standard')),
  ];
  const outside = [...new Set(changed)].filter((path) => !isLabs(path));
  if (changed.length === 0) {
    console.error('✗ labs-only check: nothing has changed against origin/main.');
    process.exit(1);
  }
  if (outside.length > 0) {
    console.error('✗ Not a labs-only change, so run the full `npm run verify`. Outside labs:');
    for (const path of outside) console.error(`    - ${path}`);
    process.exit(1);
  }
  console.log(`✓ Labs-only change — ${changed.length} file(s), all inside labs.`);
  process.exit(0);
}

const { LABS_BASE: base, LABS_HEAD: head = 'HEAD', GITHUB_OUTPUT: output } = process.env;
let labsOnly = false;
let reason = 'the base commit could not be resolved, so the full path runs';
if (resolves(base) && resolves(head)) {
  const changed = lines(git('diff', '--name-only', base, head));
  const outside = changed.filter((path) => !isLabs(path));
  labsOnly = changed.length > 0 && outside.length === 0;
  reason = labsOnly
    ? `${changed.length} file(s), all inside labs`
    : changed.length === 0
      ? 'no files changed'
      : `${outside.length} file(s) outside labs, first ${outside[0]}`;
}
console.log(`labs-only=${labsOnly} (${reason})`);
if (output) appendFileSync(output, `labs-only=${labsOnly}\n`);
