#!/usr/bin/env node
/**
 * validate-loops.mjs
 *
 * Guards the loops registry (website/src/data/loops.json), the single source
 * of truth for the recurring agent loops the /loops page documents and the
 * site chat corpus describes. Checks:
 *
 *   1. Structure — every loop carries slug, icon, description, cadence,
 *      trigger, non-empty stages and guardrails, non-empty skills, and a
 *      known status; slugs are unique. A half-described loop renders as a
 *      broken card and a false public claim about what runs here.
 *   2. Skill references — every entry in a loop's `skills` is registered in
 *      .claude/skills/registry.json (displayed, external, or unlisted). The
 *      page links each one to /skills, so an unregistered slug is a link to
 *      a skill the site denies having.
 * The prose fields (description, cadence, trigger, stages, guardrails) ship
 * verbatim as /loops page copy, so their em-dash ban is enforced where every
 * other shipped-copy registry's is: the registry scan in
 * validate-shipped-prose.mjs. This script owns structure and references only.
 *
 * Runs in the validate-registry chain: it reads source registries only, no
 * build output.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
// Normalize CRLF so Windows checkouts validate identically to CI.
const read = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

const { loops } = JSON.parse(read(join(repoRoot, 'website', 'src', 'data', 'loops.json')));
const skillsRegistry = JSON.parse(read(join(repoRoot, '.claude', 'skills', 'registry.json')));
const registeredSkills = new Set([
  ...skillsRegistry.displayed,
  ...skillsRegistry.external,
  ...skillsRegistry.unlisted,
]);

const errors = [];
const STATUSES = new Set(['active', 'paused']);

const seen = new Set();
for (const loop of loops) {
  const id = loop.slug ?? '(missing slug)';
  const where = `loops.json → ${id}`;

  for (const field of ['slug', 'icon', 'description', 'cadence', 'trigger', 'status']) {
    if (typeof loop[field] !== 'string' || loop[field].trim() === '') {
      errors.push(`${where}: "${field}" must be a non-empty string`);
    }
  }
  for (const field of ['stages', 'guardrails', 'skills']) {
    if (!Array.isArray(loop[field]) || loop[field].length === 0 || loop[field].some((v) => typeof v !== 'string' || v.trim() === '')) {
      errors.push(`${where}: "${field}" must be a non-empty array of non-empty strings`);
    }
  }

  if (seen.has(loop.slug)) errors.push(`${where}: duplicate slug`);
  seen.add(loop.slug);

  if (!STATUSES.has(loop.status)) {
    errors.push(`${where}: status "${loop.status}" is not one of ${[...STATUSES].join(', ')}`);
  }

  for (const skill of loop.skills ?? []) {
    if (!registeredSkills.has(skill)) {
      errors.push(
        `${where}: skill "${skill}" is not registered in .claude/skills/registry.json — register the skill or fix the slug`,
      );
    }
  }

}

if (errors.length > 0) {
  console.error(`✗ Loops registry validation failed:\n${errors.map((e) => `  ${e}`).join('\n')}`);
  process.exit(1);
}
console.log(`✓ Loops registry valid — ${loops.length} loops, every referenced skill registered.`);
