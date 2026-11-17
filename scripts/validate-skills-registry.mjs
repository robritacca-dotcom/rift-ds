#!/usr/bin/env node
/**
 * Validates .claude/skills/registry.json against the skill folders on disk
 * and the published copies of external skills.
 *
 * Every skill folder in .claude/skills (a directory holding a SKILL.md,
 * the layout Claude Code discovers) must appear in exactly one of the
 * registry's `displayed` or `unlisted` lists; `external` entries live
 * outside the repo (personal skills folder) and must NOT have a repo
 * folder — their published copy lives in website/src/data/external-skills.
 * The /skills page renders website/src/data/skills-content.generated.ts,
 * which scripts/generate-skills-content.mjs builds from the skill files;
 * whether that file is fresh is scripts/validate-generated-files.mjs's
 * check. Runs before every build so
 * the public skills list can never silently drift from reality.
 *
 * The page groups its cards by category. The registry's `categories` list
 * is the one home of the ids, labels, descriptions and order; every skill
 * shown on the page names one of those ids in its frontmatter, and no
 * category is left empty. A skill in the `recurring` category states its
 * `cadence`, which its card prints, and no other skill carries one.
 *
 * It also holds what `npx skills add` (the vercel-labs/skills CLI) finds
 * when pointed at this repository. That CLI searches .claude/skills/ by
 * default, so without a guard it offers a consumer the maintainer skills
 * (ship, release, land) and misses the ones written for them. Two facts
 * keep it to the consumer skills: every repo skill carries
 * `metadata.internal: true` in its frontmatter, which hides it from the
 * CLI, and skills.sh.json at the repo root names website/public/skill as
 * a discovery path. Checked 2026-11-14 against skills@1.8.1, whose custom
 * paths add to the default locations and never replace them.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { read, repoRoot } from './lib/fs.mjs';
import { failStep } from './lib/report.mjs';
import { leaksIn } from './lib/screens.mjs';

const skillsDir = join(repoRoot, '.claude', 'skills');
const externalDir = join(repoRoot, 'website', 'src', 'data', 'external-skills');

const registry = JSON.parse(readFileSync(join(skillsDir, 'registry.json'), 'utf8'));
const { displayed, external, unlisted } = registry;
const categories = Array.isArray(registry.categories) ? registry.categories : [];
/** The category whose skills run on a cadence. */
const RECURRING = 'recurring';

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
  read(path),
]);

// Claude Code only discovers a skill if SKILL.md opens with YAML
// frontmatter containing `name` and `description`. Skills shown on the
// /skills page additionally need the card metadata the generator reads.
const frontmatterOf = (src) => src.match(/^---\n([\s\S]*?)\n---\n/)?.[1] ?? '';
const shownOnSite = [...displayed, ...external];
const badFrontmatter = [];
const badCategory = [];
const categoryIds = categories.map((category) => category.id);
const usedCategories = new Set();
const fieldOf = (fm, key) =>
  fm.match(new RegExp(`^${key}:[ \\t]*(\\S.*)$`, 'm'))?.[1].trim() ?? null;
for (const [label, , src] of skillSources) {
  const fm = frontmatterOf(src);
  // `.claude/skills/<slug>/SKILL.md`, or `…/external-skills/<slug>.md`.
  const slug = label.replace(/\/SKILL\.md$|\.md$/, '').split('/').pop();
  const required = ['name', 'description'];
  if (shownOnSite.includes(slug)) required.push('icon', 'displayDescription', 'invoke', 'category');
  const missing = required.filter((k) => !new RegExp(`^${k}:\\s*\\S`, 'm').test(fm));
  if (missing.length > 0) badFrontmatter.push(`${label}: missing ${missing.join(', ')}`);
  if (!shownOnSite.includes(slug)) continue;
  const category = fieldOf(fm, 'category');
  const cadence = fieldOf(fm, 'cadence');
  if (category === null) continue;
  usedCategories.add(category);
  if (!categoryIds.includes(category)) {
    badCategory.push(`${label}: category "${category}" is not in the registry's categories`);
  } else if (category === RECURRING && cadence === null) {
    badCategory.push(`${label}: a ${RECURRING} skill needs a cadence`);
  } else if (category !== RECURRING && cadence !== null) {
    badCategory.push(`${label}: only a ${RECURRING} skill carries a cadence`);
  }
}

// The category list itself: complete rows, unique ids, none left empty.
const badCategoryList = [];
for (const category of categories) {
  for (const key of ['id', 'label', 'description']) {
    if (typeof category?.[key] !== 'string' || category[key].trim() === '') {
      badCategoryList.push(`a category is missing "${key}": ${JSON.stringify(category)}`);
    }
  }
}
for (const id of categoryIds.filter((id, i) => categoryIds.indexOf(id) !== i)) {
  badCategoryList.push(`category id listed twice: ${id}`);
}
if (categories.length === 0) badCategoryList.push('the registry has no "categories" list');
for (const id of new Set(categoryIds.filter((id) => !usedCategories.has(id)))) {
  badCategoryList.push(`category "${id}" has no skill`);
}

// Hidden from `npx skills add`: every repo skill is internal to that CLI,
// and the one custom discovery path is the consumer skills' folder.
const notInternal = files.filter(
  (f) =>
    !/^metadata:\n {2}internal: true$/m.test(
      frontmatterOf(skillSources.find(([label]) => label === `.claude/skills/${f}/SKILL.md`)[2])
    )
);
const CONSUMER_SKILLS_PATH = './website/public/skill';
const skillsShPath = join(repoRoot, 'skills.sh.json');
const skillsShPaths = existsSync(skillsShPath)
  ? JSON.parse(readFileSync(skillsShPath, 'utf8')).paths
  : null;
const badDiscovery =
  JSON.stringify(skillsShPaths) !== JSON.stringify([CONSUMER_SKILLS_PATH]);

// The committed skill files and their published copies are public — they
// must not leak a local absolute path (machine username), a GA property id,
// an API key or an address: the shared screen in scripts/lib/screens.mjs.
const leaks = [];
for (const [label, , src] of skillSources) {
  const kinds = new Set(leaksIn(src).map((leak) => leak.what));
  for (const what of kinds) leaks.push(`${label}: ${what}`);
}

// (Backticked-path existence used to be checked here; it lives in
// scripts/validate-doc-refs.mjs now, which covers the docs as well.)

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
      `discovery; icon/displayDescription/invoke/category for the /skills page):\n` +
      badFrontmatter.map((f) => `    - ${f}`).join('\n')
  );
}

if (badCategory.length > 0 || badCategoryList.length > 0) {
  fail(
    `Skill categories out of step with .claude/skills/registry.json:\n` +
      [...badCategoryList, ...badCategory].map((f) => `    - ${f}`).join('\n')
  );
}

if (notInternal.length > 0) {
  fail(
    `Repo skills visible to \`npx skills add\` (add "metadata:\\n  internal: true" ` +
      `to the frontmatter):\n` +
      notInternal.map((f) => `    - .claude/skills/${f}/SKILL.md`).join('\n')
  );
}

if (badDiscovery) {
  fail(
    `skills.sh.json must exist at the repo root with "paths": ` +
      `["${CONSUMER_SKILLS_PATH}"], so \`npx skills add\` finds the consumer skills.`
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

if (failed) {
  failStep();
}

console.log(
  `✓ Skills registry in sync — ${shownOnSite.length} skills on /skills ` +
    `(${displayed.length} repo, ${external.length} external), ` +
    `${unlisted.length} unlisted, ${categories.length} categories.`
);
