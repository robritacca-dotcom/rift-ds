#!/usr/bin/env node
/**
 * validate-agent-skill.mjs
 *
 * Holds the consumer agent skill (website/public/skill/robr0-design-system/)
 * to its source. Three checks:
 *
 *   1. Byte-compare: both files match what generate-agent-skill.mjs
 *      produces now, so a registry or JSDoc change cannot ship with a stale
 *      skill beside it.
 *   2. Leak screen: the same patterns the component-api validator applies —
 *      the skill is served publicly and copied into consumers' repos.
 *   3. Advertised and reachable, both directions: the SKILL.md URL must
 *      appear in the llms.txt route and on the get-started page, so the
 *      skill can be neither generated but unfindable, nor unpublished but
 *      still advertised.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { assembleAgentSkill, skillDir } from './generate-agent-skill.mjs';
import { repoRoot } from './component-docgen.mjs';

const errors = [];

// 1. Byte-compare.
const files = assembleAgentSkill();
for (const file of files) {
  const dest = join(skillDir, file.path);
  if (!existsSync(dest)) {
    errors.push(`missing skill/${file.path} — run: node scripts/generate-agent-skill.mjs`);
    continue;
  }
  if (readFileSync(dest, 'utf8').replace(/\r\n/g, '\n') !== file.content) {
    errors.push(`skill/${file.path} is stale — run: node scripts/generate-agent-skill.mjs`);
  }
}

// 2. Leak screen — same list as validate-component-api.mjs; the email ban is
// hard because nothing here can sanction an address.
const leakPatterns = [
  [/\/Users\/[A-Za-z]/g, 'local absolute path (/Users/…)'],
  [/property[\s_-]?(?:id)?\W{0,3}\d{6,}/gi, 'GA property id'],
  [/sk-ant-[A-Za-z0-9-]/g, 'Anthropic API key'],
  [/\b[A-Za-z0-9._%+-]+@(?!example\.)[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, 'email address'],
];
for (const file of files) {
  for (const [pattern, what] of leakPatterns) {
    for (const match of file.content.matchAll(pattern)) {
      errors.push(
        `skill/${file.path} contains a ${what} (${JSON.stringify(match[0].slice(0, 40))}) — ` +
          `it is copied into consumers' repos; remove it at the source.`
      );
    }
  }
}

// 3. Advertised and reachable. The two surfaces that tell people the skill
// exists must name its path; if the skill is ever unpublished, they fail
// here instead of advertising a 404.
const SKILL_PATH = '/skill/robr0-design-system/SKILL.md';
const advertisers = [
  'website/src/app/llms.txt/route.ts',
  'website/src/app/docs/get-started/page.tsx',
];
for (const file of advertisers) {
  const content = readFileSync(join(repoRoot, file), 'utf8');
  if (!content.includes(SKILL_PATH)) {
    errors.push(
      `${file} no longer mentions ${SKILL_PATH} — the skill must stay advertised ` +
        `where agents and readers look, or be removed deliberately (update this script too).`
    );
  }
}

if (errors.length > 0) {
  console.error('\n✗ Agent skill validation failed:\n');
  for (const error of errors) console.error(`  - ${error}\n`);
  process.exit(1);
}

console.log('✓ Agent skill in sync — both files match the registries and stay advertised.');
