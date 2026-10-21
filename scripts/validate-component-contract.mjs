#!/usr/bin/env node
/**
 * validate-component-contract.mjs
 *
 * Holds every registered component to the published props contract in
 * CLAUDE.md's Component Anatomy section. The contract is what a consumer of
 * the npm package can rely on: a ref reaches the component's primary DOM
 * node, any native attribute (`id`, `data-*`, `aria-*`, handlers) passes
 * through to it, and the component names itself in React DevTools. A
 * component that breaks it rejects `<Badge data-testid="x" />` at the type
 * level and gives a ref nothing to hold, and until this script existed
 * nothing measured how many did.
 *
 * Checks, per component in src/components/registry.json, read from the
 * syntax tree of `<folder>/<Name>.tsx` (no type checker, so it is fast and
 * cannot be fooled by inference):
 *
 *   1. forwardRef: the exported `<Name>` is a `forwardRef(...)` call
 *      (`React.forwardRef`, or wrapped in `memo`).
 *   2. displayName: the module assigns `<Name>.displayName`.
 *   3. native props: `<Name>Props` extends or intersects the native element's
 *      props (`ComponentPropsWithoutRef`, `ComponentProps` or an
 *      `*HTMLAttributes`/`SVGProps` type).
 *   4. ref and rest together: one JSX element in the render function
 *      receives both `ref` and the spread of the rest binding, and its
 *      `className` comes after the spread, so a consumer's className cannot
 *      replace the component's own `ds-*` class.
 *
 *
 * Sanctions: SANCTIONED holds the deliberate departures, each naming the
 * check and a reason a stranger could audit. Every other failing check fails
 * the build. The library reached full conformance on 2026-10-21, when the
 * migration ledger this script started with emptied and was deleted.
 *
 * Runs in the `validate-registry` chain: it reads source only.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const componentsDir = join(repoRoot, 'src', 'components');
// Normalize CRLF so Windows checkouts validate identically to CI.
const read = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

const CHECKS = ['forwardRef', 'displayName', 'native props', 'ref and rest'];

/**
 * Deliberate, documented departures from the contract. A sanctioned
 * component that starts passing the check fails as stale.
 */
const SANCTIONED = {
  PinInput: {
    'ref and rest':
      'the ref forwards to the first cell so ref.current.focus() lands in the code (its JSDoc says so); ' +
      'native attributes go on the role="group" cell row, the one node standing for the whole field',
  },
};

const NATIVE_PROPS = /ComponentPropsWithoutRef|ComponentPropsWithRef|ComponentProps<|HTMLAttributes|SVGProps|SVGAttributes/;

function isForwardRefCall(node) {
  if (!node || !ts.isCallExpression(node)) return false;
  const callee = node.expression.getText();
  if (/(^|\.)forwardRef$/.test(callee)) return true;
  if (/(^|\.)memo$/.test(callee)) return isForwardRefCall(node.arguments[0]);
  return false;
}

function forwardRefCall(node) {
  const callee = node.expression.getText();
  return /(^|\.)memo$/.test(callee) ? forwardRefCall(node.arguments[0]) : node;
}

function checkComponent(name, file) {
  const source = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const failing = new Set();

  // 1. forwardRef
  let init = null;
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const d of statement.declarationList.declarations) {
      if (ts.isIdentifier(d.name) && d.name.text === name) init = d.initializer;
    }
  }
  const usesForwardRef = isForwardRefCall(init);
  if (!usesForwardRef) failing.add('forwardRef');

  // 2. displayName
  const assignsDisplayName = source.statements.some(
    (s) =>
      ts.isExpressionStatement(s) &&
      ts.isBinaryExpression(s.expression) &&
      s.expression.left.getText() === `${name}.displayName`
  );
  if (!assignsDisplayName) failing.add('displayName');

  // 3. native props
  const propsDecl = source.statements.find(
    (s) => (ts.isInterfaceDeclaration(s) || ts.isTypeAliasDeclaration(s)) && s.name.text === `${name}Props`
  );
  const propsText = propsDecl
    ? ts.isInterfaceDeclaration(propsDecl)
      ? (propsDecl.heritageClauses ?? []).map((h) => h.getText()).join(' ')
      : propsDecl.type.getText()
    : '';
  if (!NATIVE_PROPS.test(propsText)) failing.add('native props');

  // 4. ref and rest on one element, className after the spread
  let refAndRest = false;
  if (usesForwardRef) {
    const render = forwardRefCall(init).arguments[0];
    const param = render && (ts.isArrowFunction(render) || ts.isFunctionExpression(render)) ? render.parameters[0] : null;
    // The rest binding is destructured in the parameter list, or from the
    // props parameter inside the body (`const { a, ...rest } = props`).
    let pattern = param && ts.isObjectBindingPattern(param.name) ? param.name : null;
    if (!pattern && param && ts.isIdentifier(param.name) && render.body) {
      const propsName = param.name.text;
      const find = (node) => {
        if (pattern) return;
        if (
          ts.isVariableDeclaration(node) &&
          ts.isObjectBindingPattern(node.name) &&
          node.initializer?.getText() === propsName
        ) {
          pattern = node.name;
        }
        ts.forEachChild(node, find);
      };
      find(render.body);
    }
    const restName = pattern?.elements.find((e) => e.dotDotDotToken)?.name.getText() ?? null;
    // A className written before the spread is only overwritten when the
    // rest binding can still carry one, i.e. className was not destructured.
    const restCarriesClassName = !pattern?.elements.some(
      (e) => !e.dotDotDotToken && (e.propertyName ?? e.name).getText() === 'className'
    );
    // A rest binding destructured again (`const { 'aria-label': a, ...restProps }
    // = rest`) still carries the consumer's attributes under its new name.
    const restNames = new Set(restName ? [restName] : []);
    if (restName) {
      const follow = (node) => {
        if (
          ts.isVariableDeclaration(node) &&
          ts.isObjectBindingPattern(node.name) &&
          restNames.has(node.initializer?.getText())
        ) {
          const next = node.name.elements.find((e) => e.dotDotDotToken)?.name.getText();
          if (next) restNames.add(next);
        }
        ts.forEachChild(node, follow);
      };
      follow(render.body);
    }
    if (restName) {
      const visit = (node) => {
        if (refAndRest) return;
        if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
          const props = node.attributes.properties;
          const spreadAt = props.findIndex(
            (p) => ts.isJsxSpreadAttribute(p) && restNames.has(p.expression.getText())
          );
          const hasRef = props.some((p) => ts.isJsxAttribute(p) && p.name.getText() === 'ref');
          const classAt = props.findIndex((p) => ts.isJsxAttribute(p) && p.name.getText() === 'className');
          const classSafe = classAt === -1 || classAt > spreadAt || !restCarriesClassName;
          if (spreadAt !== -1 && hasRef && classSafe) refAndRest = true;
        }
        ts.forEachChild(node, visit);
      };
      visit(render.body);
    }
  }
  if (!refAndRest) failing.add('ref and rest');

  return failing;
}

const registry = JSON.parse(read(join(componentsDir, 'registry.json')));
const errors = [];
let conforming = 0;

for (const c of registry.components) {
  const file = join(componentsDir, c.folder ?? c.name, `${c.name}.tsx`);
  if (!existsSync(file)) continue; // validate-component-registry owns a missing file
  const failing = checkComponent(c.name, file);
  const sanctioned = new Set(Object.keys(SANCTIONED[c.name] ?? {}));
  for (const check of failing) {
    if (!sanctioned.has(check)) {
      errors.push(
        `${c.name} fails the "${check}" check of the props contract (CLAUDE.md, Component Anatomy). ` +
          `Follow Button.tsx or Input.tsx; the new-component skill has the pattern.`
      );
    }
  }
  for (const check of sanctioned) {
    if (!failing.has(check)) {
      errors.push(`${c.name} now passes "${check}": remove its SANCTIONED entry in scripts/validate-component-contract.mjs.`);
    }
  }
  if ([...failing].every((check) => sanctioned.has(check))) conforming += 1;
}

for (const name of Object.keys(SANCTIONED)) {
  if (!registry.components.some((c) => c.name === name)) {
    errors.push(`SANCTIONED lists ${name}, which is not a registered component: remove the row.`);
  }
  for (const check of Object.keys(SANCTIONED[name])) {
    if (!CHECKS.includes(check)) errors.push(`SANCTIONED["${name}"] names an unknown check "${check}".`);
  }
}

if (errors.length > 0) {
  console.error('✗ Component contract validation failed:');
  for (const error of errors) console.error(`    - ${error}`);
  process.exit(1);
}

const sanctionedCount = Object.keys(SANCTIONED).length;
console.log(
  `✓ Component contract holds — ${conforming} of ${registry.components.length} components conform` +
    (sanctionedCount ? ` (${sanctionedCount} with a sanctioned departure)` : '')
);
