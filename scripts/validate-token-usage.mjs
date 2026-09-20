#!/usr/bin/env node
/**
 * Fails the build when component CSS references a custom property that is
 * never defined anywhere — a typo'd or phantom token.
 *
 * Why this exists: Dialog and AlertDialog shipped styling their titles with
 * --font-heading-6-* (a token family that never existed — the type scale
 * stops at heading-3), so both modal titles silently fell back to inherited
 * body type. validate-token-references.mjs guards the semantic→primitive
 * chain inside the token files; nothing guarded the component→token edge.
 *
 * Scope: src/ CSS only (the published library). A reference counts as
 * defined if ANY of these declare it:
 *   - a declaration (--name: …) in any scanned CSS file (tokens included)
 *   - a string occurrence of the property name in src/**&#47;*.tsx / *.ts
 *     (components set custom properties like --ds-swatch-color from JS)
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

function walk(dir, exts, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, exts, out);
    else if (exts.some((e) => entry.endsWith(e))) out.push(full);
  }
  return out;
}

const srcDir = join(repoRoot, 'src');
const cssFiles = walk(srcDir, ['.css']);
const tsFiles = walk(srcDir, ['.tsx', '.ts']);

const defined = new Set();
// Declarations in CSS: `--name:` (also catches fallback-less custom-prop
// definitions inside component files, e.g. Swatch's --ds-swatch-color).
for (const file of cssFiles) {
  for (const m of readFileSync(file, 'utf8').matchAll(/(--[\w-]+)\s*:/g)) {
    defined.add(m[1]);
  }
}
// Custom properties set from TS/TSX (inline style objects).
for (const file of tsFiles) {
  for (const m of readFileSync(file, 'utf8').matchAll(/["'`](--[\w-]+)["'`]/g)) {
    defined.add(m[1]);
  }
}

const problems = [];
for (const file of cssFiles) {
  const text = readFileSync(file, 'utf8');
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    for (const m of line.matchAll(/var\(\s*(--[\w-]+)\s*([,)])/g)) {
      // A var() with a fallback is a deliberate override hook (e.g.
      // --material-symbols-weight) — it degrades gracefully, so skip it.
      if (m[2] === ',') continue;
      if (!defined.has(m[1])) {
        problems.push(
          `${file.slice(repoRoot.length + 1)}:${i + 1} — var(${m[1]}) is never defined anywhere in src/`
        );
      }
    }
  });
}

if (problems.length) {
  console.error('✗ Undefined custom-property references in library CSS:\n');
  for (const p of problems) console.error(`  ${p}`);
  console.error(
    '\nEvery var(--…) in component CSS must resolve to a token or a custom property the component itself defines. Fix the reference or define the property.'
  );
  process.exit(1);
}

console.log(
  `✓ Token usage valid — every var(--…) reference in ${cssFiles.length} library CSS files resolves to a defined property.`
);
