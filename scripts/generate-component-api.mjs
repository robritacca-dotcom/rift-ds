#!/usr/bin/env node
/**
 * generate-component-api.mjs
 *
 * Builds website/src/data/component-api.generated.ts — the machine-readable
 * prop reference for every public component, one entry per registry
 * component with the exported components and documented props behind it.
 *
 * The props come from the same JSDoc-through-docgen pass that renders
 * Storybook's props tables and ships in the npm tarball's .d.ts (settings
 * shared via scripts/component-docgen.mjs, completeness enforced by
 * validate-prop-docs.mjs), so this file cannot say anything the published
 * package does not. That is what makes it safe to serve verbatim: the
 * website's /api/mcp route hands it to any MCP client that asks, so an
 * agent building with @robr0/design-system reads the exact prop contract
 * instead of guessing.
 *
 * Two properties this file must keep, or the build breaks:
 *
 *   1. Deterministic. No network, no timestamps. validate-component-api.mjs
 *      regenerates in memory and byte-compares against disk, and CI runs a
 *      drift guard after the generators.
 *
 *   2. Public-only. Every fact here is already published — the registry, the
 *      prop JSDoc, the generated barrels. Do not add a source that is not.
 *
 * Runs via the validate-registry chain and the website's predev/prebuild —
 * never edit the generated file by hand.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  componentsDir,
  parseLibrary,
  registry,
  repoRoot,
  sourceFilesFor,
} from './component-docgen.mjs';

export const outputPath = join(
  repoRoot, 'website', 'src', 'data', 'component-api.generated.ts'
);

/**
 * Docgen strings carry the source file's own line endings, so a CRLF
 * checkout would bake literal \r\n into the generated JSON and diff
 * against CI's LF regeneration. Normalize every string that can span
 * lines.
 */
const lf = (value) => value.replace(/\r\n/g, '\n');

/** Assemble the data structure — exported so the validator can rebuild it. */
export function assembleComponentApi() {
  const parsed = parseLibrary();

  // Group docgen output by source file: a single file can export several
  // documented components (Checkbox + CheckboxGroup), and all of them belong
  // to that file's registry entry.
  const byFile = new Map();
  for (const doc of parsed) {
    const docs = byFile.get(doc.filePath) ?? [];
    docs.push(doc);
    byFile.set(doc.filePath, docs);
  }

  // Which barrel re-exports the module. The generated charts barrel is the
  // authority on what needs the optional recharts peer — read it rather than
  // restating the rule that produced it.
  const chartsBarrel = readFileSync(join(repoRoot, 'src', 'charts.ts'), 'utf8');

  return registry.components.map((component) => {
    const folder = component.folder ?? component.name;
    const files = sourceFilesFor(component.name, join(componentsDir, folder));

    const exportedComponents = files
      .flatMap((file) => byFile.get(file) ?? [])
      .map((doc) => ({
        component: doc.displayName,
        props: Object.entries(doc.props ?? {}).map(([propName, prop]) => {
          const entry = {
            name: propName,
            // Docgen collapses a literal union to the name "enum"; the raw
            // text is the actual contract, so prefer it there.
            type: lf(
              (prop.type?.name === 'enum' ? prop.type?.raw : prop.type?.name) ??
                prop.type?.name ??
                'unknown'
            ),
            required: Boolean(prop.required),
            description: lf((prop.description ?? '').trim()),
          };
          if (prop.defaultValue?.value != null) {
            entry.defaultValue = lf(String(prop.defaultValue.value));
          }
          if (prop.tags && 'deprecated' in prop.tags) {
            entry.deprecated =
              lf(String(prop.tags.deprecated || '').trim()) || 'Deprecated.';
          }
          return entry;
        }),
      }))
      // The registry-named component leads; companions follow alphabetically.
      .sort((a, b) => {
        if (a.component === component.name) return -1;
        if (b.component === component.name) return 1;
        return a.component.localeCompare(b.component);
      });

    return {
      name: component.name,
      label: component.label,
      slug: component.slug,
      category: component.category,
      description: component.description,
      client: component.client,
      importPath: `@robr0/design-system/components/${folder}/${component.name}`,
      barrel: chartsBarrel.includes(`./components/${folder}/${component.name}'`)
        ? 'charts'
        : 'main',
      exports: exportedComponents,
    };
  });
}

export function buildComponentApiFile() {
  const entries = assembleComponentApi();

  const empty = entries.filter((entry) => entry.exports.length === 0);
  if (empty.length > 0) {
    throw new Error(
      `docgen found no exported component for: ${empty.map((e) => e.name).join(', ')}.\n` +
        `Every registry entry must document at least one export — if a component ` +
        `legitimately stopped parsing, fix the source shape rather than shipping a hole.`
    );
  }

  return `// AUTO-GENERATED — do not edit by hand.
// Source of truth: src/components/registry.json and the prop JSDoc in
// src/components (via react-docgen-typescript — settings in
// scripts/component-docgen.mjs, shared with Storybook's props tables).
// Regenerate: node scripts/generate-component-api.mjs (runs via predev/prebuild).

/** One documented own prop, as it ships in the .d.ts and Storybook. */
export interface ComponentPropApi {
  name: string;
  /** The resolved TypeScript type, literal unions expanded. */
  type: string;
  required: boolean;
  /** The prop's JSDoc description — present on every own prop, build-enforced. */
  description: string;
  defaultValue?: string;
  /** Set when the prop carries an @deprecated tag; the replacement guidance. */
  deprecated?: string;
}

/** One exported component and its documented props. */
export interface ComponentExportApi {
  component: string;
  props: ComponentPropApi[];
}

/** One public registry component: metadata, import paths, and every export behind it. */
export interface ComponentApiEntry {
  name: string;
  label: string;
  slug: string;
  category: string;
  description: string;
  /** Whether the module declares 'use client'. */
  client: boolean;
  /** Deep import subpath; the barrel named in \`barrel\` also re-exports it. */
  importPath: string;
  /** 'charts' modules need the optional recharts peer; 'main' modules never do. */
  barrel: 'main' | 'charts';
  exports: ComponentExportApi[];
}

/** The full prop API for every public component, in registry (alphabetical) order. */
export const componentApi: readonly ComponentApiEntry[] = ${JSON.stringify(entries, null, 2)};
`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(outputPath, buildComponentApiFile());
  console.log(`✓ Generated ${outputPath.replace(repoRoot + '/', '')}`);
}
