/**
 * change-set.mjs
 *
 * The files a change touches, for the scripts that pick a lighter CI and
 * verify path from them (scripts/labs-only-change.mjs and
 * scripts/site-only-change.mjs). Both ask the same two questions, so the
 * git plumbing lives here once.
 *
 *   localChange()            the merge base with origin/main against the
 *                            working tree, untracked files included: what a
 *                            ship from this checkout would push.
 *   pushedChange(base, head) what a CI run is looking at. Null when either
 *                            end cannot be resolved (a new branch's all-zero
 *                            `before`, a force push), so the caller takes the
 *                            full path on anything ambiguous.
 */
import { execFileSync } from 'node:child_process';

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

/** Changed paths against origin/main, or null with no merge base. */
export function localChange() {
  let base;
  try {
    base = git('merge-base', 'origin/main', 'HEAD');
  } catch {
    return null;
  }
  return [
    ...new Set([
      ...lines(git('diff', '--name-only', base)),
      ...lines(git('ls-files', '--others', '--exclude-standard')),
    ]),
  ];
}

/** Changed paths between two commits, or null when either is unresolvable. */
export function pushedChange(base, head) {
  if (!resolves(base) || !resolves(head)) return null;
  return lines(git('diff', '--name-only', base, head));
}
