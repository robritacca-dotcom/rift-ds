#!/usr/bin/env node
/**
 * generate-quality-gate.mjs
 *
 * Writes website/src/data/quality-gate.generated.ts: every check a ship
 * runs, in the order it runs, for the list on /skills/super-ship.
 *
 * The list has three sources and this file copies none of them by hand:
 *
 *   1. The build chain in scripts/chain.mjs, which `npm run
 *      validate-registry` runs: generators first and validators after.
 *   2. The `verify` entry in the root package.json: the builds, the
 *      tests, and the checks that need a finished build.
 *   3. The run steps of .github/workflows/ci.yml that verify does not
 *      mirror. Setup steps (`npm ci`, the browser install) are left out by
 *      CI_SETUP below, and a step with a multi-line script is named by its
 *      `name:` line.
 *
 * Membership and order come from those files. The one hand-written part is
 * the one-line description and group of each check, in
 * website/src/data/quality-gate.json. A check in a chain with no
 * description, or a description for a check no chain runs, fails generation,
 * so adding a validator to the chain without a line for this page fails the
 * build, and so does retiring one without removing its line.
 *
 * Belongs in the generator half of the validate-registry chain: it
 * reads source files only. validate-generated-files.mjs holds disk to it.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chainSteps } from './chain.mjs';
import { isEntryScript } from './lib/report.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
export const outputPath = join(repoRoot, 'website', 'src', 'data', 'quality-gate.generated.ts');
const descriptionsPath = join(repoRoot, 'website', 'src', 'data', 'quality-gate.json');

// Normalize CRLF so Windows checkouts generate identically to CI.
const read = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

/** CI steps that prepare the runner rather than check anything. */
const CI_SETUP = new Set(['npm ci', 'npx playwright install chromium']);

/** A chain entry's key: a script's basename, or the command itself. */
function keyOf(command) {
  const script = command.match(/^node scripts\/([\w-]+)\.mjs$/);
  return script ? script[1] : command;
}

function chain(entry) {
  return entry.split('&&').map((part) => part.trim()).filter(Boolean);
}

/**
 * The run steps of a workflow, without a YAML dependency: a step starts at
 * a `- ` item under `steps:`, and the keys this needs are `name`, `run`
 * (one line, or a `|` block) and `working-directory`.
 */
function workflowSteps(source) {
  const steps = [];
  let step = null;
  let block = null;
  for (const line of source.split('\n')) {
    if (block) {
      if (line.trim() === '' || line.match(/^\s*/)[0].length > block.indent) {
        if (line.trim()) block.lines.push(line.trim());
        continue;
      }
      step.run = block.lines.join('\n');
      block = null;
    }
    const item = line.match(/^(\s*)- (\w[\w-]*):\s*(.*)$/);
    const field = line.match(/^(\s*)(\w[\w-]*):\s*(.*)$/);
    if (item) {
      step = {};
      steps.push(step);
      step[item[2]] = item[3];
      if (item[2] === 'run' && item[3] === '|') block = { indent: item[1].length + 2, lines: [] };
    } else if (step && field && ['name', 'run', 'working-directory'].includes(field[2])) {
      step[field[2]] = field[3];
      if (field[2] === 'run' && field[3] === '|') block = { indent: field[1].length, lines: [] };
    } else if (field && field[1].length <= 4) {
      step = null;
    }
  }
  if (block) step.run = block.lines.join('\n');
  return steps.filter((s) => s.run !== undefined);
}

/** A CI step written the way verify writes the same command. */
function asVerifyCommand(step) {
  if (step['working-directory'] === 'website') {
    const npm = step.run.match(/^npm run (.+)$/);
    if (npm) return `npm --prefix website run ${npm[1]}`;
  }
  return step.run;
}

export function buildQualityGate() {
  const pkg = JSON.parse(read(join(repoRoot, 'package.json')));
  const { groups, checks } = JSON.parse(read(descriptionsPath));
  const errors = [];

  const registry = chainSteps('all');
  const verify = chain(pkg.scripts.verify).map(keyOf);
  const verifySet = new Set(verify);
  const ci = workflowSteps(read(join(repoRoot, '.github', 'workflows', 'ci.yml')))
    .filter((step) => !CI_SETUP.has(step.run))
    .map((step) => {
      const command = asVerifyCommand(step);
      if (verifySet.has(keyOf(command))) return null;
      return step.run.includes('\n') ? step.name : command;
    })
    .filter(Boolean);

  const order = [...registry, ...verify, ...ci];
  const ran = new Set(order);
  for (const key of order) {
    if (!checks[key]) errors.push(`"${key}" runs but has no line in website/src/data/quality-gate.json`);
  }
  for (const key of Object.keys(checks)) {
    if (!ran.has(key)) {
      errors.push(`"${key}" has a line in website/src/data/quality-gate.json, but no chain runs it`);
    }
  }
  const groupIds = new Set(groups.map((g) => g.id));
  for (const [key, check] of Object.entries(checks)) {
    if (!groupIds.has(check.group)) errors.push(`"${key}" names an unknown group "${check.group}"`);
  }
  if (errors.length > 0) {
    throw new Error(`quality gate:\n  - ${errors.join('\n  - ')}`);
  }

  return groups.map((group) => ({
    ...group,
    checks: order
      .filter((key) => checks[key].group === group.id)
      .map((key) => ({ name: key, text: checks[key].text })),
  }));
}

export function renderQualityGate() {
  const data = buildQualityGate();
  return `// GENERATED by scripts/generate-quality-gate.mjs from scripts/chain.mjs, package.json, ci.yml and
// website/src/data/quality-gate.json. Never edit by hand.

export interface QualityGateCheck {
  /** A script's basename, or the command itself. */
  name: string;
  /** One line on what it holds. */
  text: string;
}

export interface QualityGateGroup {
  id: string;
  title: string;
  body: string;
  checks: QualityGateCheck[];
}

export const QUALITY_GATE: QualityGateGroup[] = ${JSON.stringify(data, null, 2)};
`;
}

/** What this generator writes, for the freshness check (scripts/lib/fresh.mjs). */
export const surface = () => ({
  regenerate: 'node scripts/generate-quality-gate.mjs',
  files: [[outputPath, renderQualityGate()]],
});

/** Write the generated files. The chain runner calls this; run alone, the script does. */
export async function main() {
  writeFileSync(outputPath, renderQualityGate());
  console.log('✓ Wrote website/src/data/quality-gate.generated.ts');
}

if (isEntryScript(import.meta.url)) await main();
