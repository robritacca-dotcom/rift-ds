#!/usr/bin/env node
/**
 * Validates that prose references in skills and docs point at things that
 * exist: backticked repo paths, `npm run <script>` mentions, and documented
 * API symbols. A skill prescribing a deleted script or a moved file passes
 * every build and fails silently, months later, for whoever follows it —
 * two drift audits in a row (2026-07) found exactly that class of rot
 * (the release skill's stale verify block and component-doc-page's dead
 * pageMetadata() reference were the motivating incidents).
 *
 * Scans an EXPLICIT file list, never a glob:
 *   - .claude/skills/<name>/SKILL.md          (repo skills)
 *   - website/src/data/external-skills/*.md   (published external copies)
 *   - CLAUDE.md, README.md, design.md, content-design.md, SECURITY.md
 *   - evals/chat/README.md, evals/chat/SPEC.md, website/README.md
 *
 * Deliberately excluded:
 *   - website/src/data/skills-content.generated.ts and the website/public
 *     blueprint copies — generated mirrors of the files above; scanning
 *     them would double-report every finding.
 *
 * Runs in the validate-registry chain before every build.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const skillsDir = join(repoRoot, '.claude', 'skills');
const externalDir = join(repoRoot, 'website', 'src', 'data', 'external-skills');

// Normalize CRLF so Windows checkouts validate identically to CI.
const read = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

const sources = [
  ...readdirSync(skillsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && existsSync(join(skillsDir, e.name, 'SKILL.md')))
    .map((e) => [`.claude/skills/${e.name}/SKILL.md`, join(skillsDir, e.name, 'SKILL.md')]),
  ...readdirSync(externalDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => [`website/src/data/external-skills/${f}`, join(externalDir, f)]),
  ...[
    'CLAUDE.md',
    'README.md',
    'design.md',
    'content-design.md',
    'SECURITY.md',
    // Non-root instruction docs: CLAUDE.md sends readers to the evals README
    // by name, and they all prescribe commands — so they rot the same way.
    'evals/chat/README.md',
    'evals/chat/SPEC.md',
    'website/README.md',
  ].map((f) => [f, join(repoRoot, f)]),
].map(([label, path]) => [label, read(path)]);

// ---------------------------------------------------------------------------
// Check A — backticked repo paths exist.
// A string only counts as a path claim when it starts with a known top-level
// entry; placeholder-ish mentions (globs, <slug> templates, ComponentName
// examples, $VAR/~ shell forms, YYYY dates) are skipped. A false positive
// here is fixed by extending the placeholder pattern, not by deleting the
// reference.
const pathPrefix =
  /^(src|website|scripts|evals|\.claude|\.storybook|\.github|design\.md|content-design\.md|CLAUDE\.md|README\.md|SECURITY\.md)(\/|$)/;
const placeholder = /[<>*{}[\] $~]|ComponentName|MyComponent|my-component|component-slug|YYYY/;
const deadPaths = [];
let pathCount = 0;

// A missing path that the repo's own .gitignore covers is a claim about a
// runtime artifact (GA credentials, generated output) — those legitimately
// exist on one machine and not in a fresh checkout or CI, so existence is
// the wrong test for them. Everything else must exist.
// A trailing-slash span is tested through a probe child instead: a child
// of an ignored directory is ignored, so the answer is the same — and the
// slash-less probe dodges a git quirk (observed on Windows) where ANY
// nonexistent trailing-slash path reports ignored, matching an empty
// pattern, which silently excused refs here that CI then caught.
// Vercel's build container checks the tree out without a usable .git, so
// `git check-ignore` cannot answer there (status null/128, not 0/1). Fall
// back to the .gitignore files themselves for the simple pattern shapes
// this repo uses — the git answer stays authoritative wherever git works.
const gitignorePatterns = ['/.gitignore', '/website/.gitignore']
  .flatMap((rel) => {
    const path = join(repoRoot, ...rel.split('/').filter(Boolean));
    if (!existsSync(path)) return [];
    return readFileSync(path, 'utf8')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#'));
  })
  .map((raw) => {
    const pattern = raw.replace(/\/$/, '').replace(/^\//, '');
    return new RegExp(
      `(^|/)${pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*')}(/|$)`
    );
  });
const isGitignored = (span) => {
  const probe = span.endsWith('/') ? `${span}__doc_refs_probe__` : span;
  const status = spawnSync('git', ['check-ignore', '-q', probe], { cwd: repoRoot }).status;
  if (status === 0 || status === 1) return status === 0;
  return gitignorePatterns.some((pattern) => pattern.test(span.replace(/\/$/, '')));
};

// Check B — every `npm run X` mention resolves to a real script in the root
// or website workspace package.json. The union is deliberately context-free:
// workspace-scoped forms (`cd website && npm run dev`, `--workspace`) stay
// valid without parsing shell context. Placeholders like `npm run <script>`
// never match the name pattern.
const knownScripts = new Set([
  ...Object.keys(JSON.parse(read(join(repoRoot, 'package.json'))).scripts ?? {}),
  ...Object.keys(JSON.parse(read(join(repoRoot, 'website', 'package.json'))).scripts ?? {}),
]);
const unknownScripts = [];
let scriptCount = 0;

// Check C — documented API symbols still exist where they live. Opt-in
// table: only identifiers listed here are checked, so arbitrary `foo()`
// mentions can't false-positive. If a home file moves, existsSync fails
// loudly — update the table entry.
const SYMBOL_HOMES = {
  pageMetadata: 'website/src/config/navigation.ts',
  componentPageMetadata: 'website/src/config/navigation.ts',
  useField: 'src/components/Field/FieldContext.tsx',
};
const missingSymbols = [];
let symbolCount = 0;

for (const [label, src] of sources) {
  for (const [, span] of src.matchAll(/`([^`\n]+)`/g)) {
    if (pathPrefix.test(span) && !placeholder.test(span)) {
      pathCount += 1;
      if (!existsSync(join(repoRoot, span)) && !isGitignored(span)) {
        deadPaths.push(`${label}: \`${span}\` does not exist — rename or restore it`);
      }
    }

    for (const [, name] of span.matchAll(/([A-Za-z_$][\w$]*)\(/g)) {
      // Object.hasOwn, not `in`: `in` walks the prototype chain, so a doc
      // mentioning `toLocaleString()` or `toString()` would resolve to the
      // Object.prototype method and crash the path join.
      if (!Object.hasOwn(SYMBOL_HOMES, name)) continue;
      symbolCount += 1;
      const home = SYMBOL_HOMES[name];
      const exported =
        existsSync(join(repoRoot, home)) &&
        new RegExp(`export (function|const) ${name}\\b`).test(read(join(repoRoot, home)));
      if (!exported) {
        missingSymbols.push(
          `${label}: \`${name}()\` is not exported from ${home} — ` +
            `re-export it or update SYMBOL_HOMES in scripts/validate-doc-refs.mjs`
        );
      }
    }
  }

  for (const [, name] of src.matchAll(/npm run ([A-Za-z0-9:_-]+)/g)) {
    scriptCount += 1;
    if (!knownScripts.has(name)) {
      unknownScripts.push(
        `${label}: \`npm run ${name}\` — no such script in the root or website package.json`
      );
    }
  }
}

let failed = false;
const fail = (msg) => {
  failed = true;
  console.error(`✗ ${msg}`);
};

for (const [what, list] of [
  ['Prose referencing repo paths that don\'t exist (stale instructions)', deadPaths],
  ['Prose referencing npm scripts that don\'t exist', unknownScripts],
  ['Prose referencing API symbols that are no longer exported', missingSymbols],
]) {
  const unique = [...new Set(list)];
  if (unique.length > 0) {
    fail(`${what}:\n` + unique.map((l) => `    - ${l}`).join('\n'));
  }
}

if (failed) {
  process.exit(1);
}

console.log(
  `✓ Doc references resolve — ${sources.length} files scanned: ` +
    `${pathCount} path refs, ${scriptCount} npm-script mentions, ${symbolCount} symbol calls.`
);
