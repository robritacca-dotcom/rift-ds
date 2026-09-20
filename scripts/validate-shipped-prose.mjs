#!/usr/bin/env node
/**
 * Enforces the one content rule that is mechanically checkable: no em dashes
 * in shipped prose.
 *
 * `content-design.md` bans the character outright in shipped copy, and the
 * `content-audit` skill lists it under Banned. Both are read by a person or an
 * agent who has to remember to look. This makes the rule a build failure
 * instead, on the repo's standing convention: anything countable or checkable
 * gets build-enforced so it can never drift again.
 *
 * WHAT COUNTS AS SHIPPED PROSE HERE
 *
 * Page prose comes from `extractProse` in generate-site-corpus.mjs — the same
 * AST walk that decides what reaches the chat corpus. Sharing it is the point:
 * two readers of "what counts as page prose" would drift, one cannot. It sees
 * JSX text and prose string literals, and never comments, className strings,
 * or import specifiers, so a dash in a code comment is not a violation.
 *
 * Everything else is a plain string scan of fields that are unambiguously
 * shipped copy: the README (it ships inside the npm tarball), the Storybook
 * landing page, and the data registries whose fields render on the site.
 * One registry is delegated rather than scanned here: page-summaries.json,
 * whose own validator (validate-page-summaries.mjs) runs the em-dash check
 * alongside its structural rules.
 *
 * A handful of modules are in scope by name, because their visitor-visible
 * prose rides in string literals the page scan's prose extraction cannot
 * see — the scripted chat stories, the playground's staged copy, the graph
 * instrument's panel text. Their string literals and JSX text are scanned
 * through the AST, so comments — where an em dash is a structural
 * separator, not voice — are never seen. `STORY_MODULES` below is the list.
 *
 * WHAT IS DELIBERATELY OUT, AND WHY
 *
 *   - Agent-facing markdown — CLAUDE.md, design.md, content-design.md,
 *     SECURITY.md, and skill instruction bodies. The guide's own Overview
 *     exempts them: em dashes are structural separators there, not voice.
 *     Skill `displayDescription` frontmatter is NOT exempt, because it
 *     renders on /skills.
 *   - noindex pages — derived from the page's own `robots: { index: false }`,
 *     so a page joining or leaving the set moves itself in and out of scope
 *     with no list to maintain here. Today that is the `/labs` rebuilds
 *     (internal surfaces a visitor never reaches); when a noindex page
 *     graduates to indexed, the derivation pulls it in by itself.
 *   - Non-page `.ts` modules other than `STORY_MODULES` — their string
 *     literals are server logs and internal messages, not copy. The chat's
 *     persona and greeting strings are genuinely shipped prose but live among
 *     those, and so are the model picker's names and one-line descriptions
 *     in `website/src/lib/chat-model.ts`; the em-dash check aside, everything
 *     needing judgement (register, voice, banned words) stays the
 *     `content-audit` skill's `chat` scope, which names all of them.
 *
 * Part of the validate-registry chain.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { extractProse, isProse, PROSE_ATTRIBUTES } from './generate-site-corpus.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
const rel = (p) => relative(repoRoot, p).split('\\').join('/');

/** The banned character, and the guide's suggested repairs. */
const EM_DASH = '—';
const REPAIR =
  'replace it with a colon (and here is the point), a comma or parentheses ' +
  '(an aside), or a full stop and a second sentence';

const findings = [];

/**
 * A value that is *only* an em dash is a glyph, not a spliced sentence: it
 * stands for "nothing here", the way the disabled Input on the Field page
 * uses it. The guide bans em dash *splicing*, and every repair it offers
 * (a colon, a comma, two sentences) presupposes a sentence to repair. There
 * is nothing to rewrite here, so it is not a violation.
 */
const isGlyphOnly = (text) => /^[\s—-]*$/.test(text);

/** Report every occurrence with enough of the line to find it by eye. */
function scan(label, text, note) {
  if (!text || !text.includes(EM_DASH) || isGlyphOnly(text)) return;
  for (const line of text.split('\n')) {
    if (!line.includes(EM_DASH)) continue;
    const trimmed = line.trim();
    findings.push(
      `${label} — ${trimmed.length > 110 ? `${trimmed.slice(0, 110)}…` : trimmed}` +
        (note ? ` (${note})` : '')
    );
  }
}

// --- Page prose -------------------------------------------------------------

const appDir = join(repoRoot, 'website', 'src', 'app');
const pageFiles = [];
{
  const stack = [appDir];
  while (stack.length > 0) {
    const dir = stack.pop();
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.name === 'page.tsx') pageFiles.push(full);
    }
  }
}

/**
 * A route is out of scope when it, or a layout above it, declares noindex.
 * That attribute is how `new-page` says "deliberately hidden", so the
 * exclusion tracks the decision rather than restating it.
 */
const noIndex = (pagePath) => {
  let dir = dirname(pagePath);
  while (dir.startsWith(appDir)) {
    for (const name of ['page.tsx', 'layout.tsx']) {
      try {
        if (/index:\s*false/.test(read(join(dir, name)))) return true;
      } catch { /* no such file at this level */ }
    }
    dir = dirname(dir);
  }
  return false;
};

/**
 * Attribute copy too short for `extractProse` to treat as prose.
 *
 * The shared extractor now reads the attributes in PROSE_ATTRIBUTES, so most
 * of this text arrives through `extractProse` above. What it drops is anything
 * under its sentence threshold — a four-word button label, a stage caption of
 * three words. Those still ship to a reader, so they are still checked here,
 * and skipping what the extractor already emitted keeps one em dash from
 * being reported twice.
 */
function scanProseAttributes(label, source, fileName) {
  const sourceFile = ts.createSourceFile(
    fileName, source, ts.ScriptTarget.Latest, /* setParentNodes */ true, ts.ScriptKind.TSX
  );
  const visit = (node) => {
    if (
      ts.isJsxAttribute(node) &&
      ts.isIdentifier(node.name) &&
      PROSE_ATTRIBUTES.has(node.name.text) &&
      node.initializer &&
      ts.isStringLiteral(node.initializer) &&
      !isProse(node.initializer.text.replace(/\s+/g, ' ').trim())
    ) {
      scan(label, node.initializer.text, `${node.name.text} attribute`);
    }
    ts.forEachChild(node, visit);
  };
  ts.forEachChild(sourceFile, visit);
}

let pagesChecked = 0;
for (const file of pageFiles.sort()) {
  if (noIndex(file)) continue;
  pagesChecked += 1;
  const source = read(file);
  scan(rel(file), extractProse(source, rel(file)));
  scanProseAttributes(rel(file), source, rel(file));
}

// --- Markdown that ships ----------------------------------------------------

let surfacesChecked = 0;
for (const doc of ['README.md', 'src/stories/Configure.mdx']) {
  surfacesChecked += 1;
  scan(doc, read(join(repoRoot, doc)));
}

// --- Data registries whose fields render on the site ------------------------

const json = (p) => JSON.parse(read(join(repoRoot, p)));

const registry = json('src/components/registry.json');
surfacesChecked += 1;
for (const c of registry.components) {
  scan(`src/components/registry.json (${c.name})`, c.description);
}

const releaseLog = json('website/src/data/release-log.json');
surfacesChecked += 1;
for (const e of releaseLog.releases ?? []) {
  scan(`website/src/data/release-log.json (${e.version ?? '?'})`, `${e.title ?? ''}\n${(e.body ?? []).join('\n')}`);
}

const loopsRegistry = json('website/src/data/loops.json');
surfacesChecked += 1;
for (const l of loopsRegistry.loops ?? []) {
  scan(
    `website/src/data/loops.json (${l.slug ?? '?'})`,
    [l.description, l.cadence, l.trigger, ...(l.stages ?? []), ...(l.guardrails ?? [])].join('\n'),
  );
}

// --- Skill display descriptions (they render on /skills) --------------------

const skillsDir = join(repoRoot, '.claude', 'skills');
surfacesChecked += 1;
for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  let source;
  try {
    source = read(join(skillsDir, entry.name, 'SKILL.md'));
  } catch { continue; }
  const match = source.match(/^displayDescription:\s*(.*)$/m);
  if (match) scan(`.claude/skills/${entry.name}/SKILL.md (displayDescription)`, match[1]);
}

// --- The npm package description (renders on npmjs.com) ---------------------

surfacesChecked += 1;
const manifest = read(join(repoRoot, 'scripts', 'package-manifest.mjs'));
const desc = manifest.match(/PACKAGE_DESCRIPTION\s*=\s*(['"`])([\s\S]*?)\1/);
if (desc) scan('scripts/package-manifest.mjs (PACKAGE_DESCRIPTION)', desc[2]);

// --- The playground's scripted chat story ------------------------------------

/**
 * Modules whose string literals are visitor-visible prose the page scan
 * cannot see: the sim's scripted story and scenario copy, the director's
 * event rail, and the Chat view's staged history. Scanned through the AST
 * so comments never register — only what a visitor can read.
 */
const STORY_MODULES = [
  'website/src/lib/chat-sim.ts',
  'website/src/app/playground/ChatDirector.tsx',
  'website/src/app/playground/views/ChatView.tsx',
  'website/src/app/playground/views/TypeView.tsx',
  // The graph instrument's panel copy and the overview miniature's caption
  // render on indexed pages (/graph, /overview) while living in component
  // files outside those route folders, so the page scan never sees them.
  'website/src/components/SystemGraph/SystemGraph.tsx',
  'website/src/components/SystemGraph/GraphMiniature.tsx',
  // The chat route's visitor-visible strings: the tool trace points and
  // the notice lines render in the widget, and the CHAT_TOOLS descriptions
  // are authored copy the model reads — a route handler, so the page scan
  // never sees any of it. The shared lookup module's error and hint
  // strings can be repeated verbatim to a visitor or an agent.
  'website/src/app/api/chat/route.ts',
  'website/src/lib/site-tools.ts',
  // The guardrail notices (burst limit, daily limit, budget breaker) render
  // in the chat widget when a limit trips — visitor-visible strings in a
  // module the page scan never sees.
  'website/src/app/api/chat/guardrails.ts',
  // The package's init bin prints usage, error and success lines to a
  // consumer's terminal — shipped copy per content-design.md's register
  // table, living where no page scan reaches.
  'src/cli/init.mjs',
];

function scanStringLiterals(relPath) {
  const sourceFile = ts.createSourceFile(
    relPath,
    read(join(repoRoot, relPath)),
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    relPath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );
  const visit = (node) => {
    if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddleOrTemplateTail(node) ||
      ts.isJsxText(node)
    ) {
      scan(relPath, node.text, 'string literal');
    }
    ts.forEachChild(node, visit);
  };
  ts.forEachChild(sourceFile, visit);
}

for (const mod of STORY_MODULES) {
  surfacesChecked += 1;
  scanStringLiterals(mod);
}

// --- Report -----------------------------------------------------------------

if (findings.length > 0) {
  console.error(
    `✗ Em dashes in shipped prose (${findings.length}) — content-design.md bans ` +
      `the character in shipped copy; ${REPAIR}:\n` +
      findings.map((f) => `    - ${f}`).join('\n')
  );
  process.exit(1);
}

console.log(
  `✓ Shipped prose clean — no em dashes across ${pagesChecked} published page(s) ` +
    `and ${surfacesChecked} other shipped surface(s).`
);
