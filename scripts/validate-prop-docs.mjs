#!/usr/bin/env node
/**
 * Validates that every prop this project owns carries a JSDoc description.
 *
 * The prop-level JSDoc in src/components is not a comment convention —
 * it is the source the documented surface is generated from: Storybook's
 * autodocs props tables, the .d.ts declarations that ship inside the
 * npm tarball, and the component-API registry the website's /api/mcp
 * route serves. An undocumented prop is a hole in the published API
 * reference, so it fails the build.
 *
 * Scope is deliberately the component's *own* props. Every component
 * spreads native attributes through
 * `Omit<React.ComponentPropsWithoutRef<'el'>, keyof XOwnProps>` (see the
 * component contract in CLAUDE.md); those belong to React and the HTML
 * spec, not to this project, so props inherited from node_modules are
 * filtered out rather than demanded to carry local documentation.
 *
 * A second check closes the hole the first one leaves. "Every parsed prop is
 * documented" passes vacuously for a component the parser resolved to no
 * props at all, and that is how it fails in practice: the parser can hand a
 * component's name to another export of the same file (a helper or type
 * re-exported above it), and the component then ships an empty props table
 * to every surface at once. So each `<Name>OwnProps` or `<Name>Props` type that
 * declares members in a component file, where the file also exports a
 * `<Name>`, must come back as a parsed component called `<Name>` with at
 * least one prop. The declaration is read from the syntax
 * tree directly, never through the docgen parse, because the parse is the
 * thing under test.
 *
 * The docgen settings live in scripts/component-docgen.mjs, shared with
 * generate-component-api.mjs and mirroring .storybook/main.ts, so this
 * validator sees exactly what the rendered props table sees.
 *
 * Runs as part of `npm run validate-registry` (every build, both
 * projects): it reads source only, nothing a build produces.
 */
import { readFileSync } from 'node:fs';
import { relative } from 'node:path';
import ts from 'typescript';
import { librarySourceFiles, parseLibrary, repoRoot } from './component-docgen.mjs';

// Normalize CRLF so Windows checkouts validate identically to CI.
const read = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
const display = (path) => relative(repoRoot, path).replaceAll('\\', '/');

const parsed = parseLibrary();
const errors = [];

/* ── 1. Every parsed own prop carries a description ───────────────────── */

let propCount = 0;

for (const component of parsed) {
  const missing = [];
  for (const [propName, prop] of Object.entries(component.props ?? {})) {
    propCount += 1;
    if (!prop.description || !prop.description.trim()) missing.push(propName);
  }
  if (missing.length > 0) {
    errors.push(
      `${display(component.filePath ?? '')} — ${component.displayName}: own props with no ` +
        `JSDoc description (${missing.join(', ')}). Add a description above each prop: it ` +
        `ships in the .d.ts and renders in Storybook.`
    );
  }
}

/* ── 2. Every declared props type reaches the parse ─── ────────────────── */

/** Whether a type declaration writes out at least one member of its own. */
function declaresMembers(node) {
  let found = false;
  const visit = (child) => {
    if (ts.isPropertySignature(child) || ts.isMethodSignature(child)) found = true;
    else if (!found) ts.forEachChild(child, visit);
  };
  ts.forEachChild(node, visit);
  return found;
}

/** The values a module declares and exports itself, by name. */
const exportedValuesCache = new Map();
function exportedValues(source) {
  if (!exportedValuesCache.has(source)) {
    const names = new Set();
    for (const statement of source.statements) {
      const exported = ts.canHaveModifiers(statement) &&
        ts.getModifiers(statement)?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      if (!exported) continue;
      if (ts.isVariableStatement(statement)) {
        for (const declaration of statement.declarationList.declarations) {
          if (ts.isIdentifier(declaration.name)) names.add(declaration.name.text);
        }
      } else if (
        (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) &&
        statement.name
      ) {
        names.add(statement.name.text);
      }
    }
    exportedValuesCache.set(source, names);
  }
  return exportedValuesCache.get(source);
}

const propCountByComponent = new Map(
  parsed.map((doc) => [
    `${doc.filePath}#${doc.displayName}`,
    Object.keys(doc.props ?? {}).length,
  ])
);

let ownPropsCount = 0;

for (const file of librarySourceFiles()) {
  const source = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true);
  for (const statement of source.statements) {
    if (!ts.isTypeAliasDeclaration(statement) && !ts.isInterfaceDeclaration(statement)) continue;
    const match = /^(.+?)(?:Own)?Props$/.exec(statement.name.text);
    if (!match || !declaresMembers(statement)) continue;
    // A props type for a component the module keeps to itself (a chart's
    // tooltip, a menu's inner panel) documents nothing public.
    if (!exportedValues(source).has(match[1])) continue;
    ownPropsCount += 1;
    const resolved = propCountByComponent.get(`${file}#${match[1]}`);
    if (resolved) continue;
    errors.push(
      `${display(file)} — ${statement.name.text} declares props, but the docs parser ` +
        (resolved === 0
          ? `resolved ${match[1]} to none.`
          : `found no component called ${match[1]}.`) +
        ` Its props table, its .md page and the MCP prop reference would all be empty. ` +
        `The usual cause is a re-export (\`export { a } from './x'\` or \`export type { T } ` +
        `from './x'\`) placed above the component: move it below the component's ` +
        `declaration. Otherwise check that the component is exported under the name its ` +
        `props type carries.`
    );
  }
}

if (errors.length > 0) {
  console.error('✗ Prop docs validation failed:');
  for (const error of errors) console.error(`    ${error}`);
  process.exit(1);
}

console.log(
  `✓ Prop docs complete — ${propCount} own props across ${parsed.length} ` +
    `exported components, all documented; ${ownPropsCount} declared props ` +
    `types all reach the parse.`
);
