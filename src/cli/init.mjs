#!/usr/bin/env node
/**
 * The package's one command: `npx @robr0/design-system init`.
 *
 * Fetches the generated agent skill (SKILL.md + references/components.md)
 * from the live site into the project's .claude/skills/ folder, then prints
 * the MCP connect line. The files are fetched rather than bundled because
 * they regenerate with every site deploy, while the package moves only on a
 * release — a bundled copy would always be the staler one. Re-running the
 * command overwrites the pair; that is the refresh story.
 *
 * Zero dependencies by design: global fetch plus node:fs, so npx never
 * installs anything beyond the package itself. SITE_ORIGIN is stamped by
 * build-package.mjs from the website's own SITE_URL constant (one
 * authoritative home for the origin); running this file straight from
 * source fails fast rather than guessing a domain.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const SITE_ORIGIN = '__SITE_URL__';
const SKILL_NAME = 'robr0-design-system';
const SKILL_FILES = ['SKILL.md', 'references/components.md'];
const DEFAULT_OUT = join('.claude', 'skills', SKILL_NAME);

const USAGE = `Usage: npx @robr0/design-system init [--out <dir>]

Fetches the agent skill for this package from ${SITE_ORIGIN} into
${DEFAULT_OUT}/ so a skill-capable coding agent carries the
library's install, theming and catalogue rules into every session.
Re-run any time to refresh; the files regenerate with every site deploy.

Options:
  --out <dir>   Write the skill somewhere else (default: ${DEFAULT_OUT})
  --help        Show this message`;

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

async function init(outDir) {
  if (SITE_ORIGIN.startsWith('__')) {
    fail('this copy was not built: run the published bin (npx @robr0/design-system init).');
  }
  for (const file of SKILL_FILES) {
    const url = `${SITE_ORIGIN}/skill/${SKILL_NAME}/${file}`;
    let response;
    try {
      response = await fetch(url);
    } catch (error) {
      fail(`could not reach ${url} (${error?.message ?? error}). Check your network and retry.`);
    }
    if (!response.ok) {
      fail(`${url} answered ${response.status}. The site may be mid-deploy; retry in a minute.`);
    }
    const target = join(outDir, file);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, await response.text());
    console.log(`▸ ${target}`);
  }
  console.log(`✓ Agent skill installed. Skill-capable agents load it automatically.`);
  console.log(`\nFor on-demand lookups too, connect the MCP endpoint:`);
  console.log(`  claude mcp add --transport http robr0-ds ${SITE_ORIGIN}/api/mcp`);
}

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h') || args.length === 0) {
  console.log(USAGE);
  process.exit(args.length === 0 ? 1 : 0);
}
if (args[0] !== 'init') {
  fail(`unknown command "${args[0]}"\n\n${USAGE}`);
}
const outFlag = args.indexOf('--out');
let outDir = DEFAULT_OUT;
if (outFlag !== -1) {
  if (!args[outFlag + 1]) fail('--out needs a directory');
  outDir = resolve(args[outFlag + 1]);
}
await init(outDir);
