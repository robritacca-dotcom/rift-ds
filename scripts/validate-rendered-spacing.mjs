#!/usr/bin/env node
/**
 * Catches inline-tag spacing that disappears between source and render.
 *
 * A space written after a closing inline tag in JSX can be dropped from the
 * output when the text node that follows contains an HTML entity: the
 * transform re-chunks the node around the entity and trims the leading
 * whitespace. `<strong>Why so slow?</strong> Compensation is complex` ships as
 * "Why so slow?Compensation is complex". Nothing else sees it. It type-checks,
 * it lints, it builds, and it reads as a typo to every visitor.
 *
 * WHY THIS RUNS ON BUILT HTML RATHER THAN SOURCE
 *
 * The source-level pattern (closing tag, space, text node holding an entity)
 * over-reports: of six matches in this repo, four rendered wrong and two
 * rendered fine, because whether the space survives depends on where the
 * entity falls in the chunked node. Guessing from source would either cry wolf
 * or miss cases. The rendered HTML is the ground truth, so this reads that.
 *
 * That means it runs AFTER the website build, not in the prebuild
 * `validate-registry` chain, which executes before any HTML exists.
 *
 * WHAT COUNTS
 *
 * Only inline tags whose text is prose, and only where the run that follows
 * looks like a word rather than a suffix. `<code>separator</code>s` is a
 * deliberate pluralisation, not a lost space, so a short lowercase tail is
 * ignored; a capitalised word (a new sentence) or a lowercase word of three or
 * more letters is not. Block tags are excluded, because `</div>Text` is a
 * layout choice.
 *
 * The generated blueprint mirrors under /blueprints are exempt: they render
 * markdown docs in which inline code and backticks legitimately interleave,
 * and their source is the root specs rather than page prose.
 *
 * FIXING A FINDING
 *
 * Replace the entity in the affected text node with the literal character
 * (’ “ ” instead of &rsquo; &ldquo; &rdquo;). The escaping lint rule permits
 * literal typographic characters, and an unsplit text node keeps its space.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'node:fs/promises';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const appDir = join(repoRoot, 'website', '.next', 'server', 'app');

const INLINE = ['strong', 'em', 'b', 'i', 'code', 'abbr', 'cite', 'sub', 'sup'];
/** A capitalised word, or a lowercase word of 3+ letters. A 1-2 letter
 *  lowercase tail is a suffix (`</code>s`), which is intentional. */
const PATTERN = new RegExp(
  `</(${INLINE.join('|')})>(?=[A-Z]|[a-z]{3,})`,
  'g'
);
const EXEMPT = /^blueprints\//;
const CONTEXT = 55;

const files = [];
for await (const f of glob('**/*.html', { cwd: appDir })) {
  // glob returns native separators; a Windows backslash path would dodge
  // the forward-slash EXEMPT pattern and check pages meant to be skipped.
  const rel = f.replaceAll('\\', '/');
  if (!EXEMPT.test(rel)) files.push(rel);
}

if (files.length === 0) {
  console.error(
    '✗ No prerendered HTML found under website/.next/server/app.\n' +
      '  Run the website build first: npm --prefix website run build'
  );
  process.exit(1);
}

const findings = [];
for (const rel of files) {
  const abs = join(appDir, rel);
  const html = readFileSync(abs, 'utf8');
  for (const m of html.matchAll(PATTERN)) {
    const start = Math.max(0, m.index - CONTEXT);
    const snippet = html
      .slice(start, m.index + m[0].length + 18)
      .replace(/\s+/g, ' ');
    findings.push({ page: rel.replace(/\.html$/, ''), tag: m[1], snippet });
  }
}

if (findings.length > 0) {
  console.error(
    `✗ Lost space after an inline tag in rendered output (${findings.length}):\n` +
      '  A space written in the JSX did not survive the render. This is usually an\n' +
      '  HTML entity in the text node that follows; replace it with the literal\n' +
      '  character (’ “ ”) so the node is not split.\n'
  );
  for (const f of findings) {
    console.error(`    - /${f.page} — …${f.snippet}…`);
  }
  process.exit(1);
}

console.log(
  `✓ Inline spacing intact — no lost spaces after inline tags across ${files.length} rendered page(s).`
);
