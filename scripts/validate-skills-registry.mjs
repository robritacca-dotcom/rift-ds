#!/usr/bin/env node
/**
 * Validates .claude/skills/registry.json against the filesystem and the
 * generated /skills page data.
 *
 * Every skill folder in .claude/skills (a directory holding a SKILL.md,
 * the layout Claude Code discovers) must appear in exactly one of the
 * registry's `displayed` or `unlisted` lists; `external` entries live
 * outside the repo (personal skills folder) and must NOT have a repo
 * folder — their published copy lives in website/src/data/external-skills.
 * The /skills page renders website/src/data/skills-content.generated.ts,
 * which scripts/generate-skills-content.mjs builds from the skill files;
 * this validator fails if that file is stale. Runs before every build so
 * the public skills list can never silently drift from reality.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSkillsContent, outputPath } from './generate-skills-content.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const skillsDir = join(repoRoot, '.claude', 'skills');
const externalDir = join(repoRoot, 'website', 'src', 'data', 'external-skills');

const registry = JSON.parse(readFileSync(join(skillsDir, 'registry.json'), 'utf8'));
const { displayed, external, unlisted } = registry;

const files = readdirSync(skillsDir, { withFileTypes: true })
  .filter((e) => e.isDirectory() && existsSync(join(skillsDir, e.name, 'SKILL.md')))
  .map((e) => e.name)
  .sort();

// Every skill source we lint: repo skills + published copies of external ones.
const skillSources = [
  ...files.map((f) => [`.claude/skills/${f}/SKILL.md`, join(skillsDir, f, 'SKILL.md')]),
  ...external
    .filter((e) => existsSync(join(externalDir, `${e}.md`)))
    .map((e) => [
      `website/src/data/external-skills/${e}.md`,
      join(externalDir, `${e}.md`),
    ]),
].map(([label, path]) => [
  label,
  path,
  // Normalize CRLF so Windows checkouts lint identically to CI.
  readFileSync(path, 'utf8').replace(/\r\n/g, '\n'),
]);

// Claude Code only discovers a skill if SKILL.md opens with YAML
// frontmatter containing `name` and `description`. Skills shown on the
// /skills page additionally need the card metadata the generator reads.
const frontmatterOf = (src) => src.match(/^---\n([\s\S]*?)\n---\n/)?.[1] ?? '';
const shownOnSite = [...displayed, ...external];
const badFrontmatter = [];
for (const [label, , src] of skillSources) {
  const fm = frontmatterOf(src);
  const slug = label.replace(/^.*\/([^/]+?)(?:\/SKILL)?\.md$/, '$1');
  const required = ['name', 'description'];
  if (shownOnSite.includes(slug)) required.push('icon', 'displayDescription', 'invoke');
  const missing = required.filter((k) => !new RegExp(`^${k}:\\s*\\S`, 'm').test(fm));
  if (missing.length > 0) badFrontmatter.push(`${label}: missing ${missing.join(', ')}`);
}

// The committed skill files and their published copies are public — they
// must not leak local absolute paths (machine username) or a GA property id.
const leakPatterns = [
  [/\/Users\/[A-Za-z]/, 'local absolute path (/Users/…)'],
  [/property[\s_-]?(?:id)?\W{0,3}\d{6,}/i, 'GA property id'],
];
const leaks = [];
for (const [label, , src] of skillSources) {
  for (const [pattern, what] of leakPatterns) {
    if (pattern.test(src)) leaks.push(`${label}: ${what}`);
  }
}

// (Backticked-path existence used to be checked here; it lives in
// scripts/validate-doc-refs.mjs now, which covers the docs as well.)

// The generated page data must match what the skill files produce.
let staleGenerated = null;
try {
  const expected = buildSkillsContent();
  const onDisk = existsSync(outputPath)
    ? readFileSync(outputPath, 'utf8').replace(/\r\n/g, '\n')
    : '';
  if (onDisk !== expected) {
    staleGenerated =
      'website/src/data/skills-content.generated.ts is stale — run ' +
      '`node scripts/generate-skills-content.mjs` and commit the result.';
  }
} catch (err) {
  staleGenerated = `generating skills content failed: ${err.message}`;
}

const repoRegistered = [...displayed, ...unlisted].sort();
const missingFromRegistry = files.filter((f) => !repoRegistered.includes(f));
const missingFromDisk = repoRegistered.filter((r) => !files.includes(r));
const externalWithFile = external.filter((e) => files.includes(e));
const externalWithoutCopy = external.filter(
  (e) => !existsSync(join(externalDir, `${e}.md`))
);
const duplicates = [...displayed, ...external, ...unlisted].filter(
  (slug, i, all) => all.indexOf(slug) !== i
);

let failed = false;
const fail = (msg) => {
  failed = true;
  console.error(`✗ ${msg}`);
};

if (leaks.length > 0) {
  fail(
    `Sensitive details in public skills content (redact before committing):\n` +
      leaks.map((l) => `    - ${l}`).join('\n')
  );
}

if (badFrontmatter.length > 0) {
  fail(
    `Skill files with incomplete frontmatter (name/description for Claude Code ` +
      `discovery; icon/displayDescription/invoke for the /skills page):\n` +
      badFrontmatter.map((f) => `    - ${f}`).join('\n')
  );
}

if (missingFromRegistry.length > 0) {
  fail(
    `Skill folders missing from .claude/skills/registry.json:\n` +
      missingFromRegistry.map((f) => `    - ${f}`).join('\n') +
      `\n  Add each to "displayed" (shown on /skills) or "unlisted" (internal).`
  );
}

if (missingFromDisk.length > 0) {
  fail(
    `Registry entries with no <name>/SKILL.md in .claude/skills:\n` +
      missingFromDisk.map((r) => `    - ${r}`).join('\n')
  );
}

if (externalWithFile.length > 0) {
  fail(
    `"external" entries that DO have a repo skill folder (move to "displayed"): ` +
      externalWithFile.join(', ')
  );
}

if (externalWithoutCopy.length > 0) {
  fail(
    `"external" entries missing a published copy in website/src/data/external-skills/: ` +
      externalWithoutCopy.map((e) => `${e}.md`).join(', ')
  );
}

if (duplicates.length > 0) {
  fail(`Listed in more than one registry list: ${duplicates.join(', ')}`);
}

if (staleGenerated) {
  fail(staleGenerated);
}

if (failed) {
  process.exit(1);
}

console.log(
  `✓ Skills registry in sync — ${shownOnSite.length} skills on /skills ` +
    `(${displayed.length} repo, ${external.length} external), ` +
    `${unlisted.length} unlisted.`
);
