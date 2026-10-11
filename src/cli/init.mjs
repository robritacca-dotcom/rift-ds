#!/usr/bin/env node
/**
 * The package's one command: `npx rift-ds init`.
 *
 * Fetches the generated agent skills from the live site into the
 * project's .claude/skills/ folder, one folder per skill, then prints the
 * MCP connect line. Which skills exist and which files each holds comes
 * from the site's /skill/manifest.json, never from a list in this file:
 * the skills regenerate with every site deploy while the package moves
 * only on a release, so a bundled list (or a bundled copy of the files)
 * would always be the staler one, and a skill added to the site reaches
 * this command with no new version of the package. Re-running overwrites
 * what is there; that is the refresh story.
 *
 * The manifest is data from the network that decides where this command
 * writes, so every name and path in it is checked before anything touches
 * the disk: a skill name is one kebab-case folder, a file is a plain
 * relative path, and nothing may climb out of the target folder.
 *
 * Zero dependencies by design: global fetch plus node:fs, so npx never
 * installs anything beyond the package itself. SITE_ORIGIN, SKILL_NAME
 * and MCP_SERVER_NAME are stamped by build-package.mjs from
 * scripts/brand.mjs (the one home for brand facts); running this file
 * straight from source fails fast rather than guessing a domain.
 * SKILL_NAME is the library skill, kept only for --out without --skill,
 * which has always meant that one.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const SITE_ORIGIN = '__SITE_URL__';
const SKILL_NAME = '__SKILL_NAME__';
const MCP_SERVER_NAME = '__MCP_SERVER_NAME__';
const MANIFEST_URL = `${SITE_ORIGIN}/skill/manifest.json`;
const DEFAULT_DIR = join('.claude', 'skills');

const USAGE = `Usage: npx rift-ds init [--skill <name>] [--dir <dir>]

Fetches the agent skills for this package from ${SITE_ORIGIN} into
${DEFAULT_DIR}/, one folder per skill, so a skill-capable coding agent
carries the library's install, theming and catalogue rules into every
session. Re-run any time to refresh; the files regenerate with every
site deploy.

Options:
  --skill <name>  Install one skill instead of all of them
  --dir <dir>     Folder that receives one folder per skill (default: ${DEFAULT_DIR})
  --out <dir>     Deprecated: write one skill's files straight into <dir>
                  (${SKILL_NAME} unless --skill names another). Use --dir.
  --help          Show this message

The list of skills is at ${MANIFEST_URL}`;

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

async function get(url) {
  let response;
  try {
    response = await fetch(url);
  } catch (error) {
    fail(`could not reach ${url} (${error?.message ?? error}). Check your network and retry.`);
  }
  if (!response.ok) {
    fail(`${url} answered ${response.status}. The site may be mid-deploy; retry in a minute.`);
  }
  return response.text();
}

/** The manifest's skills, with every name and path checked before use. */
async function readManifest() {
  let manifest;
  try {
    manifest = JSON.parse(await get(MANIFEST_URL));
  } catch {
    fail(`${MANIFEST_URL} is not valid JSON. The site may be mid-deploy; retry in a minute.`);
  }
  const skills = manifest?.skills;
  if (!Array.isArray(skills) || skills.length === 0) {
    fail(`${MANIFEST_URL} lists no skills. Update the package (npm install rift-ds@latest) and retry.`);
  }
  const segment = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
  for (const skill of skills) {
    const filesOk =
      Array.isArray(skill?.files) &&
      skill.files.length > 0 &&
      skill.files.every(
        (file) => typeof file === 'string' && file.split('/').every((part) => segment.test(part))
      );
    if (typeof skill?.name !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(skill.name) || !filesOk) {
      fail(`${MANIFEST_URL} holds an entry this command will not write to disk. Nothing was installed.`);
    }
  }
  return skills;
}

async function init({ only, dir, out }) {
  if (SITE_ORIGIN.startsWith('__')) {
    fail('this copy was not built: run the published bin (npx rift-ds init).');
  }
  const skills = await readManifest();
  const wanted = only ?? (out ? SKILL_NAME : null);
  const selected = wanted ? skills.filter((skill) => skill.name === wanted) : skills;
  if (selected.length === 0) {
    fail(`no skill named "${wanted}". Available: ${skills.map((skill) => skill.name).join(', ')}.`);
  }
  for (const skill of selected) {
    const target = out ?? join(dir, skill.name);
    for (const file of skill.files) {
      const text = await get(`${SITE_ORIGIN}/skill/${skill.name}/${file}`);
      const path = join(target, ...file.split('/'));
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, text);
      console.log(`▸ ${path}`);
    }
  }
  const names = selected.map((skill) => skill.name).join(', ');
  console.log(
    selected.length === 1
      ? `✓ Agent skill installed: ${names}. Skill-capable agents load it automatically.`
      : `✓ ${selected.length} agent skills installed: ${names}. Skill-capable agents load them automatically.`
  );
  if (out) {
    console.log(`\n--out is deprecated. Use --dir to choose the folder that holds the skill folders.`);
  }
  console.log(`\nFor on-demand lookups too, connect the MCP endpoint:`);
  console.log(`  claude mcp add --transport http ${MCP_SERVER_NAME} ${SITE_ORIGIN}/api/mcp`);
}

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h') || args.length === 0) {
  console.log(USAGE);
  process.exit(args.length === 0 ? 1 : 0);
}
if (args[0] !== 'init') {
  fail(`unknown command "${args[0]}"\n\n${USAGE}`);
}
/** The value after a flag, or undefined when the flag is absent. */
function option(flag, what) {
  const at = args.indexOf(flag);
  if (at === -1) return undefined;
  const value = args[at + 1];
  if (!value || value.startsWith('--')) fail(`${flag} needs ${what}`);
  return value;
}
const only = option('--skill', 'a skill name');
const dirFlag = option('--dir', 'a directory');
const outFlag = option('--out', 'a directory');
if (dirFlag && outFlag) fail('use --dir or --out, not both');
await init({
  only,
  dir: dirFlag ? resolve(dirFlag) : DEFAULT_DIR,
  out: outFlag ? resolve(outFlag) : undefined,
});
