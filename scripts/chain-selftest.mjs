#!/usr/bin/env node
/**
 * chain-selftest.mjs
 *
 * Proves the validators still fail. Each plant in
 * scripts/fixtures/chain-plants.json is one small break of one invariant
 * (a raw colour in a stylesheet, a stale byte in a generated file, an
 * orphan in a registry) and names the step that must catch it. This
 * script applies a plant, runs that step, requires a non-zero exit whose
 * output carries the plant's `expect` text, and puts the file back before
 * the next one.
 *
 * It exists because a refactor of a validator can leave it passing on
 * everything: the chain going green on a clean tree says nothing about
 * whether a check can still fail. Run it before and after any change to a
 * validator, a generator or the helpers in scripts/lib/.
 *
 * Run on demand, in no chain, and only in a clean worktree: it edits
 * tracked files while it runs (and restores them, also on Ctrl+C), so a
 * tree with work in progress is refused. It takes minutes, and it proves
 * the validators rather than the repo, so the build has no use for it.
 *
 *   node scripts/chain-selftest.mjs                 every plant
 *   node scripts/chain-selftest.mjs validate-x ...  only those steps
 *
 * A plant is one of:
 *   { step, check, file, find, replace, expect }   `find` occurs exactly once
 *   { step, check, file, append, expect }
 *   { step, check, create, content, expect }       a new file
 *   { step, check, remove, expect }                delete a file
 * `was` records the step that caught a plant before its check moved.
 * `gitAdd: true` stages the planted path first, for steps that read
 * `git ls-files`. `command` replaces `node scripts/<step>.mjs`.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fromRoot, readJson, repoRoot } from './lib/fs.mjs';

const git = (...args) => execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8' });

if (git('status', '--porcelain').trim() !== '') {
  console.error('✗ chain-selftest needs a clean tree: it edits tracked files and restores them. Commit or use a clean worktree.');
  process.exit(1);
}

const only = new Set(process.argv.slice(2));
/* A plant that has to write a string the repo forbids everywhere (a retired
   package name, a local-lab path) spells it with MASK inside, so this
   fixture does not trip the very scans it tests. */
const MASK = '@@';
const unmask = (plant) =>
  Object.fromEntries(Object.entries(plant).map(([key, value]) => [key, typeof value === 'string' ? value.replaceAll(MASK, '') : value]));
const plants = readJson(fromRoot('scripts', 'fixtures', 'chain-plants.json'))
  .map(unmask)
  .filter((plant) => only.size === 0 || only.has(plant.step));

/** Apply a plant; returns the function that undoes it. */
function apply(plant) {
  const rel = plant.file ?? plant.create ?? plant.remove;
  const path = fromRoot(rel);
  const before = existsSync(path) ? readFileSync(path) : null;
  const madeDirs = []; // folders the plant had to create, deepest first
  if (plant.create !== undefined) {
    if (before !== null) throw new Error(`${rel} already exists`);
    for (let dir = dirname(path); !existsSync(dir); dir = dirname(dir)) madeDirs.push(dir);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, plant.content);
  } else if (plant.remove !== undefined) {
    if (before === null) throw new Error(`${rel} does not exist`);
    rmSync(path);
  } else {
    if (before === null) throw new Error(`${rel} does not exist`);
    const text = before.toString('utf8');
    if (plant.append !== undefined) {
      writeFileSync(path, text + plant.append);
    } else {
      const count = text.split(plant.find).length - 1;
      if (count !== 1) throw new Error(`"find" occurs ${count} times in ${rel}, not once`);
      writeFileSync(path, text.replace(plant.find, () => plant.replace));
    }
  }
  if (plant.gitAdd) git('add', '--', rel);
  return () => {
    if (plant.gitAdd) git('reset', '-q', '--', rel);
    if (before === null) rmSync(path, { force: true });
    else writeFileSync(path, before);
    for (const dir of madeDirs) rmSync(dir, { recursive: true, force: true });
  };
}

let undo = null;
process.on('SIGINT', () => {
  undo?.();
  process.exit(130);
});

const problems = [];
const steps = new Set();
for (const plant of plants) {
  const name = `${plant.step}: ${plant.check}`;
  steps.add(plant.step);
  try {
    undo = apply(plant);
  } catch (error) {
    problems.push(`${name}: the plant no longer applies (${error.message}); update it in scripts/fixtures/chain-plants.json`);
    continue;
  }
  let result;
  try {
    const [command, ...args] = plant.command ?? [process.execPath, `scripts/${plant.step}.mjs`];
    result = spawnSync(command === 'node' ? process.execPath : command, args, { cwd: repoRoot, encoding: 'utf8' });
  } finally {
    undo();
    undo = null;
  }
  const output = `${result.stdout}${result.stderr}`;
  if (result.status === 0) {
    problems.push(`${name}: the step passed with the break planted, so it no longer guards this`);
  } else if (!output.includes(plant.expect)) {
    problems.push(`${name}: the step failed, but not with "${plant.expect}"; it said: ${output.trim().split('\n').slice(0, 3).join(' / ')}`);
  }
}

if (git('status', '--porcelain').trim() !== '') {
  problems.push('the tree is not clean after the run; a plant was not restored (see git status)');
}

if (problems.length > 0) {
  console.error('✗ Chain selftest failed:');
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log(`✓ Chain selftest: ${plants.length} planted breaks, each caught by its step (${steps.size} steps).`);
