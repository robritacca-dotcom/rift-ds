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
 * agent building with rift-ds reads the exact prop contract
 * instead of guessing.
 * The site chat's get_component tool (website/src/lib/site-tools.ts) serves
 * the same data, so a visitor asking the chat reads that contract too.
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
 * It also writes website/src/data/component-types.generated.ts: every type
 * the props name, nested ones included, walked from the source by
 * scripts/component-types.mjs, so the contract it serves is closed (the
 * typesOutputPath comment says why the types live in a file of their own).
 * Each prop's `defaultValue` is source text: a string default is written
 * quoted, whether docgen read it from code or from a JSDoc @default.
 *
 * Runs via the validate-registry chain and the website's predev/prebuild —
 * never edit the generated files by hand.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  chatRegistry,
  componentsDir,
  parseLibrary,
  registry,
  repoRoot,
  sourceFilesFor,
} from './component-docgen.mjs';
import {
  declaredUnionText,
  resolveComponentTypes,
  stringLiteralDefaults,
} from './component-types.mjs';
import { memo } from './lib/memo.mjs';
import { PACKAGE_NAME } from './package-manifest.mjs';
import { isEntryScript } from './lib/report.mjs';

export const outputPath = join(
  repoRoot, 'website', 'src', 'data', 'component-api.generated.ts'
);

/**
 * The types each entry's props reference live in a second file, keyed by
 * slug: the prop reference is imported by a client page (the chat widget's
 * component page reads its exports), and the type definitions would add a
 * third to that bundle for nothing it renders. Only the server surfaces
 * (/api/mcp, the site chat's tools) import this one.
 */
export const typesOutputPath = join(
  repoRoot, 'website', 'src', 'data', 'component-types.generated.ts'
);

/**
 * Docgen strings carry the source file's own line endings, so a CRLF
 * checkout would bake literal \r\n into the generated JSON and diff
 * against CI's LF regeneration. Normalize every string that can span
 * lines.
 */
const lf = (value) => value.replace(/\r\n/g, '\n');

/**
 * The value of a default written as plain arithmetic on number literals
 * (digits, + - * / and parentheses, with at least one operator), or
 * undefined. Evaluated by a small parser, never by eval.
 */
export function arithmeticValue(text) {
  if (!/^[\d\s+\-*/().]+$/.test(text) || !/\d\s*[+\-*/]\s*[\d(]/.test(text)) return undefined;
  const tokens = text.match(/\d+(?:\.\d+)?|[+\-*/()]/g);
  let at = 0;
  const peek = () => tokens[at];
  const factor = () => {
    const token = tokens[at++];
    if (token === '(') {
      const value = sum();
      at++;
      return value;
    }
    if (token === '-') return -factor();
    return Number(token);
  };
  const product = () => {
    let value = factor();
    while (peek() === '*' || peek() === '/') value = tokens[at++] === '*' ? value * factor() : value / factor();
    return value;
  };
  const sum = () => {
    let value = product();
    while (peek() === '+' || peek() === '-') value = tokens[at++] === '+' ? value + product() : value - product();
    return value;
  };
  const value = sum();
  return at === tokens.length && Number.isFinite(value) ? value : undefined;
}

/** A copy of an object without the named keys. */
const omit = (object, keys) =>
  Object.fromEntries(Object.entries(object).filter(([key]) => !keys.includes(key)));

/**
 * Assemble the data structure. Exported so the generators that write from
 * it and the validators that rebuild it read one assembly: it is memoised
 * and frozen (scripts/lib/memo.mjs), so every caller in a process shares
 * it and none can change what the next one reads.
 */
export const assembleComponentApi = memo(() => {
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

  const propsOf = (doc) => {
    const literalDefaults = stringLiteralDefaults(doc.filePath, doc.displayName);
    return Object.entries(doc.props ?? {}).map(([propName, prop]) => {
      // Docgen collapses a literal union to the name "enum"; the raw
      // text is the actual contract, so prefer it there.
      let type = lf(
        (prop.type?.name === 'enum' ? prop.type?.raw : prop.type?.name) ??
          prop.type?.name ??
          'unknown'
      );
      // The checker folds a union into a wider member (`boolean | ReactNode`
      // reads as ReactNode), which hides a value the prop documents. When
      // the declaration is a union and the docgen string has lost its bars,
      // the declaration as written is the contract.
      if (!type.includes('|') && !Array.isArray(prop.type?.value)) {
        type = declaredUnionText(doc.filePath, doc.displayName, propName) ?? type;
      }
      // An optional prop already says it may be left out; a trailing
      // `| undefined` the checker printed on a wrapped type (a Pick, an
      // indexed access) repeats it and buries the type an agent writes.
      if (!prop.required) type = type.replace(/(?:\s*\|\s*undefined)+\s*$/, '');
      const entry = {
        name: propName,
        type,
        required: Boolean(prop.required),
        description: lf((prop.description ?? '').trim()),
      };
      // Docgen lists a literal union's members even when the prop is typed
      // through a named alias (`state: AgentStatusState`), where `raw` is
      // only the alias name. Keep the members beside the type so a schema
      // reader gets the allowed values without resolving the alias. String
      // literals arrive double-quoted; numeric ones bare. The checker orders
      // union members by type id, not by declaration, so the list is sorted
      // to keep the generated file deterministic across machines.
      if (Array.isArray(prop.type?.value) && prop.type.value.length > 0) {
        entry.values = prop.type.value
          .map((member) => String(member.value).replace(/^"(.*)"$/s, '$1'))
          .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
      }
      if (prop.defaultValue?.value != null) {
        // Always source text: a string default comes back from docgen
        // unquoted when it is code and quoted when it is a JSDoc @default,
        // so the code case is quoted again here. `'Close chat'` then reads
        // as a string everywhere it is shown, and `DEFAULT_LOCALE` as the
        // identifier it is.
        const raw = lf(String(prop.defaultValue.value));
        const literal = literalDefaults.get(propName);
        entry.defaultValue =
          literal !== undefined && literal === raw
            ? `'${raw.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
            : raw;
        // A default written as arithmetic (`50 * 1024 * 1024`) also carries
        // the number it comes to, so an agent need not work it out.
        const resolved = arithmeticValue(entry.defaultValue);
        if (resolved !== undefined) entry.defaultResolved = resolved;
      }
      if (prop.tags && 'deprecated' in prop.tags) {
        entry.deprecated = lf(String(prop.tags.deprecated || '').trim()) || 'Deprecated.';
      }
      return entry;
    });
  };

  // A whole component deprecated in its JSDoc (`@deprecated` on the
  // component, not a prop) says so on the export, and on the entry when it is
  // the registry-named one, so an agent reading the API is told before it
  // reaches for it.
  const deprecationOf = (doc) =>
    doc.tags && 'deprecated' in doc.tags
      ? lf(String(doc.tags.deprecated || '').trim()) || 'Deprecated.'
      : undefined;
  const exportOf = (doc) => {
    const entry = { component: doc.displayName, props: propsOf(doc), file: doc.filePath };
    const deprecated = deprecationOf(doc);
    if (deprecated) entry.deprecated = deprecated;
    return entry;
  };

  // The closed type map for one entry (scripts/component-types.mjs owns the
  // walk): every in-repo type its props reference, nested ones included,
  // and the outside ones named with their package. Each prop lists the
  // local types it mentions in `typeRefs`, so a reader taking one export
  // can take only the types that export needs.
  // Which `*Props` / `*OwnProps` names are a documented component's props,
  // and the get_component call that returns them: a registry component by
  // name, or one export of the chat widget.
  const componentNames = new Set(registry.components.map((c) => c.name));
  const widgetExports = new Map(
    chatRegistry.widgets.flatMap((w) => w.documented.map((name) => [name, w.name]))
  );
  const pointerFor = (typeName) => {
    const stem = typeName.match(/^([A-Z]\w*?)(?:Own)?Props$/)?.[1];
    if (!stem) return null;
    if (componentNames.has(stem)) return { component: stem, see: `get_component("${stem}")` };
    const widget = widgetExports.get(stem);
    if (widget) return { component: stem, see: `get_component("${widget}", { export: "${stem}" })` };
    return null;
  };

  const withTypes = (exportsList) => {
    const { types, externalTypes, propRefs } = resolveComponentTypes(
      exportsList.map(({ file, component, props }) => ({ file, component, props })),
      pointerFor
    );
    const exportsOut = exportsList.map((exported) => ({
      ...omit(exported, ['file']),
      props: exported.props.map((prop) => {
        const refs = propRefs.get(`${exported.component}.${prop.name}`);
        return refs ? { ...prop, typeRefs: refs } : prop;
      }),
    }));
    return {
      exports: exportsOut,
      ...(Object.keys(types).length > 0 ? { types } : {}),
      ...(Object.keys(externalTypes).length > 0 ? { externalTypes } : {}),
    };
  };

  const componentEntries = registry.components.map((component) => {
    const folder = component.folder ?? component.name;
    const files = sourceFilesFor(component.name, join(componentsDir, folder));

    const exportedComponents = files
      .flatMap((file) => byFile.get(file) ?? [])
      .map(exportOf)
      // The registry-named component leads; companions follow alphabetically.
      .sort((a, b) => {
        if (a.component === component.name) return -1;
        if (b.component === component.name) return 1;
        return a.component.localeCompare(b.component);
      });

    const deprecated = exportedComponents.find((e) => e.component === component.name)?.deprecated;
    return {
      kind: 'component',
      name: component.name,
      label: component.label,
      slug: component.slug,
      category: component.category,
      description: component.description,
      client: component.client,
      importPath: `${PACKAGE_NAME}/components/${folder}/${component.name}`,
      barrel: chartsBarrel.includes(`./components/${folder}/${component.name}'`)
        ? 'charts'
        : 'main',
      ...(deprecated ? { deprecated } : {}),
      ...withTypes(exportedComponents),
    };
  });

  // The chat widget: one entry per registered widget, its documented exports
  // in the registry's order (the widget itself first). Served through the
  // same tool and the same .md shape as a component, distinguished by `kind`
  // so the component listings can leave it out and the widget's component page can find it.
  const widgetEntries = chatRegistry.widgets.map((widget) => {
    const exportedComponents = widget.documented.flatMap((name) => {
      const file = join(repoRoot, 'src', 'chat', `${name}.tsx`).replaceAll('\\', '/');
      return (byFile.get(file) ?? [])
        .filter((doc) => doc.displayName === name)
        .map(exportOf);
    });
    return {
      kind: 'widget',
      name: widget.name,
      label: widget.label,
      slug: widget.slug,
      category: 'widget',
      description: widget.description,
      client: true,
      importPath: `${PACKAGE_NAME}/chat`,
      barrel: 'chat',
      ...withTypes(exportedComponents),
    };
  });

  return [...componentEntries, ...widgetEntries];
}, { freeze: true });

/** The entries without their type maps: the prop reference file's shape. */
const withoutTypes = (entries) => entries.map((entry) => omit(entry, ['types', 'externalTypes']));

export function buildComponentApiFile(entries = assembleComponentApi()) {
  entries = withoutTypes(entries);

  const empty = entries.filter((entry) => entry.exports.length === 0);
  if (empty.length > 0) {
    throw new Error(
      `docgen found no exported component for: ${empty.map((e) => e.name).join(', ')}.\n` +
        `Every registry entry must document at least one export — if a component ` +
        `legitimately stopped parsing, fix the source shape rather than shipping a hole.`
    );
  }

  return `// AUTO-GENERATED — do not edit by hand.
// Source of truth: src/components/registry.json, src/chat/registry.json and
// the prop JSDoc in src/components and src/chat (via react-docgen-typescript
// — settings in scripts/component-docgen.mjs, shared with Storybook's props
// tables).
// Regenerate: node scripts/generate-component-api.mjs (runs via predev/prebuild).

/** One documented own prop, as it ships in the .d.ts and Storybook. */
export interface ComponentPropApi {
  name: string;
  /** The resolved TypeScript type, literal unions expanded. */
  type: string;
  /** The members of a literal union, quotes stripped and sorted: set whenever docgen reports one, a named alias (\`AgentStatusState\`, whose \`type\` is only the alias name) included. */
  values?: string[];
  required: boolean;
  /** The prop's JSDoc description — present on every own prop, build-enforced. */
  description: string;
  defaultValue?: string;
  /** The number a default written as arithmetic comes to (\`50 * 1024 * 1024\` is 52428800). */
  defaultResolved?: number;
  /** Set when the prop carries an @deprecated tag; the replacement guidance. */
  deprecated?: string;
  /** The in-repo types the prop's declared type mentions, each a key of the entry's \`types\`. */
  typeRefs?: string[];
}

/** One exported component and its documented props. */
export interface ComponentExportApi {
  component: string;
  props: ComponentPropApi[];
  /** Set when the component itself carries an @deprecated tag; the replacement guidance. */
  deprecated?: string;
}

/** One public registry entry: a component, or the chat widget. */
export interface ComponentApiEntry {
  /** A library component, or the composed chat widget (src/chat/registry.json). */
  kind: 'component' | 'widget';
  name: string;
  label: string;
  slug: string;
  /** A component category id, or 'widget'. */
  category: string;
  description: string;
  /** Whether the module declares 'use client'. */
  client: boolean;
  /** Deep import subpath; the barrel named in \`barrel\` also re-exports it. */
  importPath: string;
  /** 'charts' modules need the optional recharts peer; 'main' modules never do; 'chat' is the widget's own subpath with its own peers. */
  barrel: 'main' | 'charts' | 'chat';
  /** Set when the registry-named component is deprecated; the replacement guidance. */
  deprecated?: string;
  exports: ComponentExportApi[];
}

/** The full prop API for every public component, in registry (alphabetical) order, then the chat widget. */
export const componentApi: readonly ComponentApiEntry[] = ${JSON.stringify(entries, null, 2)};
`;
}

export function buildComponentTypesFile(entries = assembleComponentApi()) {
  const bySlug = Object.fromEntries(
    entries
      .filter((entry) => entry.types || entry.externalTypes)
      .map((entry) => [
        entry.slug,
        { types: entry.types ?? {}, externalTypes: entry.externalTypes ?? {} },
      ])
  );
  return `// AUTO-GENERATED — do not edit by hand.
// Source of truth: the type declarations under src/, walked from each
// component's props by scripts/component-types.mjs.
// Regenerate: node scripts/generate-component-api.mjs (runs via predev/prebuild).

/**
 * One in-repo type a prop reaches, as declared in the source, or, for
 * another component's props interface, a pointer to the call that returns
 * them (kind \`component-props\`, with \`component\` and \`see\`).
 */
export interface ComponentTypeApi {
  kind: 'interface' | 'type' | 'enum' | 'class' | 'component-props';
  /** The declaration as written in the source, keywords such as \`export\` dropped. Absent on a pointer. */
  definition?: string;
  /** On a pointer: the component whose props these are. */
  component?: string;
  /** On a pointer: the get_component call that returns them. */
  see?: string;
  /** The declaration's JSDoc summary, when it has one. */
  description?: string;
  /** The other in-repo types the definition mentions, each a key of the entry's \`types\`. */
  refs?: string[];
}

/** One entry's closed type map. */
export interface ComponentTypesApi {
  /** Every in-repo type the props reference, nested ones included, by name. */
  types: Record<string, ComponentTypeApi>;
  /** Every outside type the props or \`types\` mention, with the package that defines it (\`typescript\` for a built-in). */
  externalTypes: Record<string, string>;
}

/** The type map for every entry whose props reference a named type, by slug. */
export const componentTypes: Readonly<Record<string, ComponentTypesApi>> = ${JSON.stringify(bySlug, null, 2)};
`;
}

/** What this generator writes, for the freshness check (scripts/lib/fresh.mjs). */
export function surface() {
  const entries = assembleComponentApi();
  return {
    regenerate: 'node scripts/generate-component-api.mjs',
    files: [
      [outputPath, buildComponentApiFile(entries)],
      [typesOutputPath, buildComponentTypesFile(entries)],
    ],
  };
}

/** Write the generated files. The chain runner calls this; run alone, the script does. */
export async function main() {
  const entries = assembleComponentApi();
  writeFileSync(outputPath, buildComponentApiFile(entries));
  writeFileSync(typesOutputPath, buildComponentTypesFile(entries));
  console.log(`✓ Generated ${outputPath.replace(repoRoot + '/', '')} and ${typesOutputPath.replace(repoRoot + '/', '')}`);
}

if (isEntryScript(import.meta.url)) await main();
