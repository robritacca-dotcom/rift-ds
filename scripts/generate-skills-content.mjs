#!/usr/bin/env node
/**
 * Generates website/src/data/skills-content.generated.ts from the skill
 * files themselves, so the /skills page never drifts from what's in
 * .claude/skills/ (single source of truth).
 *
 * Sources, in display order:
 *   - registry.json `displayed` → .claude/skills/<slug>/SKILL.md
 *   - registry.json `external`  → website/src/data/external-skills/<slug>.md
 *     (skills that live outside the repo keep a published copy there)
 *
 * Card metadata (icon, card description, invoke phrases) lives in each
 * skill's frontmatter as `icon` / `displayDescription` / `invoke`.
 * The published content keeps only the `name` + `description` frontmatter
 * Claude Code needs, so a copied skill works as-is.
 *
 * Runs automatically before dev/build (predev/prebuild) — never edit the
 * generated file by hand. validate-skills-registry.mjs fails the build if
 * the file on disk is stale.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const skillsDir = join(repoRoot, '.claude', 'skills');
const externalDir = join(repoRoot, 'website', 'src', 'data', 'external-skills');
export const outputPath = join(
  repoRoot, 'website', 'src', 'data', 'skills-content.generated.ts'
);

function parseSkillFile(path, slug) {
  // Normalize CRLF so Windows checkouts (core.autocrlf=true) parse and
  // generate byte-identical output to CI's LF checkouts.
  const src = readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
  const fmMatch = src.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fmMatch) throw new Error(`${path}: missing frontmatter`);
  const fm = fmMatch[1];
  const body = src.slice(fmMatch[0].length).replace(/^\n+/, '');

  const line = (key) => {
    const m = fm.match(new RegExp(`^${key}:[ \\t]*(.+)$`, 'm'));
    return m ? m[1].trim() : null;
  };
  const json = (key) => {
    const raw = line(key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw);
    } catch {
      throw new Error(`${path}: frontmatter "${key}" must be JSON-parseable, got: ${raw}`);
    }
  };

  const name = line('name');
  const description = line('description');
  const icon = line('icon');
  const displayDescription = json('displayDescription');
  const invoke = json('invoke');
  for (const [key, value] of Object.entries({ name, description, icon, displayDescription, invoke })) {
    if (value === null) throw new Error(`${path}: frontmatter is missing "${key}"`);
  }
  if (!Array.isArray(invoke) || invoke.length === 0) {
    throw new Error(`${path}: frontmatter "invoke" must be a non-empty array`);
  }

  return {
    slug,
    name,
    icon,
    description: displayDescription,
    invoke,
    // Published copy: minimal frontmatter Claude Code needs + the body.
    content: `---\nname: ${name}\ndescription: ${description}\n---\n\n${body.trimEnd()}\n`,
  };
}

export function buildSkillsContent() {
  const registry = JSON.parse(readFileSync(join(skillsDir, 'registry.json'), 'utf8'));
  const entries = [
    ...registry.displayed.map((slug) =>
      parseSkillFile(join(skillsDir, slug, 'SKILL.md'), slug)
    ),
    ...registry.external.map((slug) =>
      parseSkillFile(join(externalDir, `${slug}.md`), slug)
    ),
  ];

  return `// AUTO-GENERATED — do not edit by hand.
// Source of truth: .claude/skills/*/SKILL.md and website/src/data/external-skills/*.md,
// in the display order set by .claude/skills/registry.json.
// Regenerate: node scripts/generate-skills-content.mjs (runs automatically via predev/prebuild).

export interface SkillContent {
  slug: string;
  name: string;
  icon: string;
  description: string;
  invoke: string[];
  content: string;
}

export const skillsContent: SkillContent[] = ${JSON.stringify(entries, null, 2)};
`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(outputPath, buildSkillsContent());
  console.log(`✓ Generated ${outputPath.replace(repoRoot + '/', '')}`);
}
