#!/usr/bin/env node
/**
 * validate-visible-text.mjs
 *
 * The visible half of CLAUDE.md's rule that the English a component writes is
 * a prop. validate-accessible-names.mjs holds the names a screen reader
 * announces; this script holds the words on screen. A component published to
 * npm that writes "Loading…", "Today" or "to navigate" as literal JSX text
 * cannot be shipped in another language, and on 2026-10-21 about two dozen
 * such strings were converted into props whose defaults are the English text.
 *
 * Checks every non-story .tsx file in src/components and src/chat: a JSX text
 * node containing a word (two or more letters) fails. Exempt by design:
 *   - icon ligature names (a single lowercase_word inside the icon font span,
 *     which the font draws as a glyph, not text). The exemption reads the
 *     parent element: its class names the icon font (`material-symbols`, or an
 *     expression that names an icon class, such as `iconClass`), or
 *     its tag is an icon component. A lone lowercase word anywhere else is
 *     English like any other (CodeDiff's " added" and CommandPalette's "esc"
 *     passed an older version of this check that trusted the word's shape);
 *   - HTML entities and punctuation (`&hellip;`, `&mdash;`);
 *   - the doc-only helpers, read from src/components/registry.json's
 *     `docOnlyHelpers`, which exist to label the docs site's own swatches;
 *   - the scripted chat demo (`src/chat/demo*.tsx`, `DemoWelcome.tsx`), whose
 *     English is fixture content, like its prompts and replies.
 * Text in string literals and arrays (a weekday list, a template) cannot be
 * told from code by syntax; the api-consistency skill reviews those.
 *
 * Runs in the `validate-registry` chain: it reads source only.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
// Normalize CRLF so Windows checkouts validate identically to CI.
const read = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
const display = (path) => relative(repoRoot, path).replaceAll('\\', '/');

const registry = JSON.parse(read(join(repoRoot, 'src', 'components', 'registry.json')));
const docOnly = new Set(registry.docOnlyHelpers.map((h) => (typeof h === 'string' ? h : h.name)));
const isDemo = (path) => /^src\/chat\/(demo[^/]*|DemoWelcome)\.tsx$/.test(path);

function walk(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.tsx$/.test(entry.name) && !/\.(stories|test)\.tsx$/.test(entry.name)) files.push(full);
  }
  return files;
}

/** Whether a JSX text node sits directly inside an icon: the icon font's span, or an icon component. */
function insideIcon(node) {
  const parent = node.parent;
  if (!parent || !ts.isJsxElement(parent)) return false;
  const opening = parent.openingElement;
  if (/Icon$/.test(opening.tagName.getText())) return true;
  return opening.attributes.properties.some(
    (attr) => ts.isJsxAttribute(attr) && attr.name.getText() === 'className' && /material-symbols|icon/i.test(attr.initializer?.getText() ?? '')
  );
}

const errors = [];
let files = 0;
for (const file of [...walk(join(repoRoot, 'src', 'components')), ...walk(join(repoRoot, 'src', 'chat'))]) {
  const path = display(file);
  if (isDemo(path) || docOnly.has(basename(dirname(file)))) continue;
  files += 1;
  const source = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const visit = (node) => {
    if (ts.isJsxText(node)) {
      const text = node.text.replace(/&[a-z]+;/gi, '').trim();
      if (/[A-Za-z]{2,}/.test(text) && !(/^[a-z_0-9]+$/.test(text) && insideIcon(node))) {
        const line = source.getLineAndCharacterOfPosition(node.getStart()).line + 1;
        errors.push(
          `${path}:${line} writes "${text.replace(/\s+/g, ' ').slice(0, 60)}" as literal text. Make it a prop whose ` +
            `default is this English text (CLAUDE.md, Component Anatomy), so the component can be localised.`
        );
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
}

if (errors.length > 0) {
  console.error('✗ Visible text validation failed:');
  for (const error of errors) console.error(`    - ${error}`);
  process.exit(1);
}
console.log(`✓ Visible text comes from props — ${files} component files hold no literal English`);
