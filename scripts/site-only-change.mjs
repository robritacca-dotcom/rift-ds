#!/usr/bin/env node
/**
 * site-only-change.mjs
 *
 * Decides whether a change touches nothing but the website's own pages,
 * site UI, config, data and static files. Nothing in the library imports
 * from the website, so such a change cannot move the published package,
 * a story or Storybook, and the checks that only look at those stand down:
 * the story tests, the Storybook build, the package build, its publish
 * lint, the size budget and the API gate.
 *
 * The site path is lighter in CI than it is locally, on purpose:
 *
 *   CI keeps the two served-site sweeps (the gesture check and the axe
 *   pass), because a site change is exactly what they exist to catch.
 *
 *   `npm run verify:site`, the local run, drops those two as well, and the
 *   library's lint and type check with them (the library is untouched by
 *   definition). It keeps the whole validate-registry chain, the website's
 *   lint and build, the built-HTML checks and the hydration smoke. That is
 *   the `ship` skill's quick tier: CI still runs the two sweeps after the
 *   push, beside the deploy, so a break only they catch shows up minutes
 *   after it is live rather than before. The skill's triage step owns the
 *   judgement of when that trade is acceptable; this file owns only the
 *   ceiling, and nothing may argue a change below it.
 *
 * Three modes:
 *
 *   CI (GITHUB_OUTPUT set): compares SITE_BASE with SITE_HEAD and writes
 *   `site-only=true|false` to the step output. A base it cannot resolve is
 *   never site-only, so anything ambiguous takes the full path.
 *
 *   `--check` (used by verify:site): compares the merge base with
 *   origin/main against the working tree, untracked files included, and
 *   exits 1 with the offending paths when the change is not site-only, so
 *   the lighter run cannot stand in for a change that needs the full one.
 *
 *   `--triage` (used by the ship skill): prints the lightest tier the
 *   changed paths allow (`labs`, `site` or `full`), each changed file with
 *   its line counts, and every path that forced the full tier. It always
 *   exits 0: it reports, and the skill decides.
 *
 * The allowlist below is the one home of what counts as site-only.
 */
import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { isLabs } from './labs-only-change.mjs';
import { localChange, pushedChange } from './lib/change-set.mjs';
import { isEntryScript } from './lib/report.mjs';

/** Paths a site-only change may touch. */
const SITE_ALLOWLIST = [
  // Pages, their styles and layouts.
  /^website\/src\/app\//,
  // Site UI: header, sidebar, footer, the backgrounds, the template screens.
  /^website\/src\/components\//,
  // Navigation, chromeless routes, breakpoints, social links.
  /^website\/src\/config\//,
  // The registries and their accessors. The chain validates every one of
  // them, and it still runs.
  /^website\/src\/data\//,
  // Static files the site serves.
  /^website\/public\//,
];

/** Paths inside the allowlist that still need the full verify. */
const SITE_EXCEPTIONS = [
  // Route handlers (the chat, the MCP endpoint, the table command): their
  // behaviour is held by unit tests and evals, never by a rendered page.
  /^website\/src\/app\/api\//,
  /\/route\.tsx?$/,
  // Unit tests run in `npm run test`, which this path skips.
  /\.test\.[cm]?[jt]sx?$/,
  // Written and held by the size budget, which this path skips.
  /^website\/src\/data\/component-sizes\.json$/,
  // Published contracts: the API gate holds the schemas, and the shadcn
  // registry and the consumer skills are what a consumer installs.
  /^website\/public\/schema\//,
  /^website\/public\/r\//,
  /^website\/public\/skill\//,
];

export const isSite = (path) =>
  SITE_ALLOWLIST.some((rule) => rule.test(path)) &&
  !SITE_EXCEPTIONS.some((rule) => rule.test(path));

/** The lightest tier a set of changed paths allows. */
export function tierOf(changed) {
  if (changed.length === 0) return 'full';
  if (changed.every(isLabs)) return 'labs';
  if (changed.every(isSite)) return 'site';
  return 'full';
}

/**
 * The allowlist's own guard, run before every mode. A careless edit above
 * that lets the package, the tooling or a route handler through would make
 * the quick path skip checks that change needs, and nothing downstream
 * would notice. So these paths are pinned: the first set must always need
 * the full verify, the second must always qualify, and a rule that moves
 * either one stops the script instead of answering.
 */
const MUST_BE_FULL = [
  'src/components/Button/Button.tsx',
  'src/tokens/tokens-light.css',
  'src/chat/server.ts',
  'scripts/chain.mjs',
  'package.json',
  'package-lock.json',
  'website/package.json',
  'website/next.config.ts',
  'website/src/proxy.ts',
  'website/src/lib/site-tools.ts',
  'website/src/lib/site-tools.test.ts',
  'website/src/app/api/chat/route.ts',
  'website/src/data/component-sizes.json',
  'website/public/schema/components.json',
  '.github/workflows/ci.yml',
  '.claude/skills/ship/SKILL.md',
  'design.md',
];
const MUST_BE_SITE = [
  'website/src/data/site-backgrounds.json',
  'website/src/app/page.module.css',
  'website/src/components/BlurBackground/BlurBackground.tsx',
];

function guardAllowlist() {
  const leaked = MUST_BE_FULL.filter(isSite);
  const lost = MUST_BE_SITE.filter((path) => !isSite(path));
  if (leaked.length === 0 && lost.length === 0) return;
  console.error('✗ site-only allowlist is wrong, so nothing may take the lighter path:');
  for (const path of leaked) console.error(`    - ${path} must need the full verify, and reads as site-only`);
  for (const path of lost) console.error(`    - ${path} must read as site-only, and does not`);
  process.exit(1);
}

function requireLocalChange(label) {
  const changed = localChange();
  if (changed === null) {
    console.error(`✗ ${label}: no merge base with origin/main (run git fetch first).`);
    process.exit(1);
  }
  return changed;
}

function check() {
  const changed = requireLocalChange('site-only check');
  if (changed.length === 0) {
    console.error('✗ site-only check: nothing has changed against origin/main.');
    process.exit(1);
  }
  const outside = changed.filter((path) => !isSite(path));
  if (outside.length > 0) {
    console.error('✗ Not a site-only change, so run the full `npm run verify`. Outside the site:');
    for (const path of outside) console.error(`    - ${path}`);
    process.exit(1);
  }
  console.log(`✓ Site-only change — ${changed.length} file(s), all inside the site.`);
}

/** Added and removed line counts per path against origin/main. */
function lineCounts() {
  const counts = new Map();
  try {
    const base = execFileSync('git', ['merge-base', 'origin/main', 'HEAD'], { encoding: 'utf8' }).trim();
    const out = execFileSync('git', ['diff', '--numstat', base], { encoding: 'utf8' });
    for (const line of out.split('\n').filter(Boolean)) {
      const [added, removed, path] = line.split('\t');
      counts.set(path, `+${added} -${removed}`);
    }
  } catch {
    // No counts is fine: the paths alone still set the tier.
  }
  return counts;
}

function triage() {
  const changed = requireLocalChange('ship triage');
  const tier = tierOf(changed);
  const counts = lineCounts();
  const verify = { labs: 'npm run verify:labs', site: 'npm run verify:site', full: 'npm run verify' }[tier];
  console.log(`tier ceiling: ${tier} (${verify})`);
  if (changed.length === 0) {
    console.log('nothing has changed against origin/main.');
    return;
  }
  console.log(`changed: ${changed.length} file(s)`);
  for (const path of changed) console.log(`    ${path}  ${counts.get(path) ?? 'new'}`);
  if (tier === 'full') {
    const outside = changed.filter((path) => !isSite(path));
    console.log(`needs the full verify: ${outside.length} file(s) outside the site allowlist`);
    for (const path of outside) console.log(`    - ${path}`);
  }
}

function detect() {
  const { SITE_BASE: base, SITE_HEAD: head = 'HEAD', GITHUB_OUTPUT: output } = process.env;
  const changed = pushedChange(base, head);
  let siteOnly = false;
  let reason = 'the base commit could not be resolved, so the full path runs';
  if (changed !== null) {
    const outside = changed.filter((path) => !isSite(path));
    siteOnly = changed.length > 0 && outside.length === 0;
    reason = siteOnly
      ? `${changed.length} file(s), all inside the site`
      : changed.length === 0
        ? 'no files changed'
        : `${outside.length} file(s) outside the site, first ${outside[0]}`;
  }
  console.log(`site-only=${siteOnly} (${reason})`);
  if (output) appendFileSync(output, `site-only=${siteOnly}\n`);
}

if (isEntryScript(import.meta.url)) {
  guardAllowlist();
  if (process.argv.includes('--check')) check();
  else if (process.argv.includes('--triage')) triage();
  else detect();
}
