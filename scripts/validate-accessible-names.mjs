#!/usr/bin/env node
/**
 * validate-accessible-names.mjs
 *
 * Holds CLAUDE.md's rule that a literal English accessible name is a prop.
 * Every name a component announces to assistive technology must be one a
 * consumer can replace, or the library cannot be localised: a Spanish app
 * built on it would still read "Dismiss notification" to its users. On
 * 2026-10-21 about forty such names were hard-coded across two dozen
 * components; each became an optional `*Label` prop with the English text as
 * its default.
 *
 * Checks every non-story .tsx file in src/components and src/chat. A JSX
 * `aria-label` or `aria-roledescription` whose value is literal text (a
 * string, a template literal, with or without interpolation) fails, unless:
 *
 *   - the same element spreads the component's rest props AFTER it, so the
 *     consumer's native `aria-label` overrides the default (the contract's
 *     "a consumer-overridable default goes before the spread"), or
 *   - SANCTIONED names the file and the text with a reason.
 *
 * Any attribute ending in `Label` counts too (literal text handed to a child
 * component's label prop is the same hard-coded name), and the scripted chat
 * demo (`src/chat/demo*.tsx`, `DemoWelcome.tsx`) is exempt: its English is
 * fixture content, like its prompts and replies.
 *
 * A value that reads a prop (`aria-label={dismissLabel}`, `label ?? 'Close'`)
 * passes: the text is then the prop's default, which is the fix.
 *
 * Out of scope: visually hidden text nodes (no reliable syntax to find them)
 * and `aria-label`s inside stories. The api-consistency skill's review covers
 * the first.
 *
 * Runs in the `validate-registry` chain: it reads source only.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
// Normalize CRLF so Windows checkouts validate identically to CI.
const read = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
const display = (path) => relative(repoRoot, path).replaceAll('\\', '/');

// `ariaLabel` too: an inner CircularButton or PromptSuggestions given literal text
// writes the same hard-coded name one level down.
const NAME_ATTRIBUTES = new Set(['aria-label', 'aria-roledescription', 'ariaLabel']);

/** File (repo-relative) → literal text → why it stays literal. */
const SANCTIONED = {};

function walk(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.tsx$/.test(entry.name) && !/\.(stories|test)\.tsx$/.test(entry.name)) files.push(full);
  }
  return files;
}

/** The literal text of an attribute value, or null when the value reads anything. */
function literalText(initializer) {
  if (!initializer) return null;
  if (ts.isStringLiteral(initializer)) return initializer.text;
  if (!ts.isJsxExpression(initializer) || !initializer.expression) return null;
  return literalExpression(initializer.expression);
}

/**
 * The English an expression writes. A conditional counts when any branch
 * writes English (`isOpen ? 'Close' : 'Open'` is two literal names, and
 * CodeDiff's region name once hid behind one), and parentheses are see-through.
 */
function literalExpression(expr) {
  if (ts.isParenthesizedExpression(expr)) return literalExpression(expr.expression);
  if (ts.isConditionalExpression(expr)) {
    const branches = [literalExpression(expr.whenTrue), literalExpression(expr.whenFalse)].filter(Boolean);
    return branches.length ? branches.join(' / ') : null;
  }
  if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) return expr.text;
  // A template counts only by its literal parts: `${closeLabel}: ${tab.label}`
  // is built from props and data, `Remove ${tag}` writes English.
  if (ts.isTemplateExpression(expr)) {
    const literal = [expr.head.text, ...expr.templateSpans.map((span) => span.literal.text)].join(' … ');
    return /[A-Za-z]/.test(literal) ? expr.getText().slice(1, -1).replace(/\s+/g, ' ') : null;
  }
  return null;
}

const errors = [];
const usedSanctions = new Set();
let checked = 0;

for (const file of [...walk(join(repoRoot, 'src', 'components')), ...walk(join(repoRoot, 'src', 'chat'))]) {
  const path = display(file);
  // The scripted chat demo's English is fixture content (rift-ds/chat/demo).
  if (/^src\/chat\/(demo[^/]*|DemoWelcome)\.tsx$/.test(path)) continue;
  const source = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const visit = (node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const props = node.attributes.properties;
      props.forEach((attr, index) => {
        // Any `*Label` attribute too: literal text handed to a child component's
        // label prop (`closeLabel="Close chat"`) is the same hard-coded name.
        const attrName = ts.isJsxAttribute(attr) ? attr.name.getText() : '';
        if (!ts.isJsxAttribute(attr) || !(NAME_ATTRIBUTES.has(attrName) || attrName.endsWith('Label'))) return;
        const text = literalText(attr.initializer);
        if (text === null || !/[A-Za-z]/.test(text)) return;
        checked += 1;
        const overridable = props.slice(index + 1).some((p) => ts.isJsxSpreadAttribute(p));
        if (overridable) return;
        if (SANCTIONED[path]?.[text]) {
          usedSanctions.add(`${path}#${text}`);
          return;
        }
        const line = source.getLineAndCharacterOfPosition(attr.getStart()).line + 1;
        errors.push(
          `${path}:${line} hard-codes ${attr.name.getText()}="${text}". Make it an optional *Label prop ` +
            `with this text as its default (CLAUDE.md, Component Anatomy), or write it before the ` +
            `element's {...rest} spread so the consumer's native attribute overrides it.`
        );
      });
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
}

for (const [path, texts] of Object.entries(SANCTIONED)) {
  for (const text of Object.keys(texts)) {
    if (!usedSanctions.has(`${path}#${text}`)) {
      errors.push(`SANCTIONED lists "${text}" in ${path}, which no longer hard-codes it: remove the entry.`);
    }
  }
}

if (errors.length > 0) {
  console.error('✗ Accessible name validation failed:');
  for (const error of errors) console.error(`    - ${error}`);
  process.exit(1);
}

console.log(`✓ Accessible names replaceable — ${checked} literal defaults checked, all overridable`);
