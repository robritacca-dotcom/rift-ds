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
 * The docgen settings live in scripts/component-docgen.mjs, shared with
 * generate-component-api.mjs and mirroring .storybook/main.ts, so this
 * validator sees exactly what the rendered props table sees.
 *
 * Runs as part of `npm run validate-registry` (every build, both
 * projects).
 */
import { relative } from 'node:path';
import { parseLibrary, repoRoot } from './component-docgen.mjs';

const parsed = parseLibrary();

const offenders = [];
let propCount = 0;

for (const component of parsed) {
  const props = component.props ?? {};
  const missing = [];
  for (const [propName, prop] of Object.entries(props)) {
    propCount += 1;
    if (!prop.description || !prop.description.trim()) missing.push(propName);
  }
  if (missing.length > 0) {
    offenders.push({
      file: relative(repoRoot, component.filePath ?? ''),
      displayName: component.displayName,
      missing,
    });
  }
}

if (offenders.length > 0) {
  const total = offenders.reduce((sum, o) => sum + o.missing.length, 0);
  console.error(
    `✗ Own props with no JSDoc description (${total}):\n` +
      offenders
        .map(
          (o) =>
            `    ${o.file} — ${o.displayName}\n` +
            o.missing.map((m) => `      - ${m}`).join('\n')
        )
        .join('\n') +
      `\n  Add a description above each prop: it ships in the .d.ts and renders in Storybook.`
  );
  process.exit(1);
}

console.log(
  `✓ Prop docs complete — ${propCount} own props across ${parsed.length} ` +
    `exported components, all documented.`
);
