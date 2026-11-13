#!/usr/bin/env node
/**
 * generate-component-schema.mjs
 *
 * Writes the published component schemas: one JSON file per public
 * component (the chat widget's included) under website/public/schema/components/,
 * and the index website/public/schema/components.json beside them. Each file
 * is the component's prop contract as structured data, served at
 * <SITE_URL>/schema/components/<slug>.json and declaring the hand-written
 * meta-schema website/public/schema/component.schema.json as its `$schema`,
 * so any JSON Schema tool can check it and any agent can read the allowed
 * values of a prop without parsing a type string.
 *
 * The data is assembleComponentApi() from generate-component-api.mjs, the
 * same docgen pass that renders Storybook's props tables, ships in the npm
 * tarball's .d.ts, feeds the per-component markdown and answers the MCP
 * get_component tool. Nothing here is hand-typed, and nothing here can say
 * what the published package does not. Two derivations are this file's own:
 *
 *   typeKind — the shape of the type string, so a reader can branch without
 *   parsing TypeScript: `enum` when docgen listed the members (`values` is
 *   then present), `primitive` for string/number/boolean, `array` for one
 *   top-level member ending in [] or Array<…>, `function` for one member
 *   with an arrow or an EventHandler name, `reference` for one capitalised
 *   type name (ReactNode, LinkComponent, DataTableSort), and `other` for
 *   anything mixed.
 *
 *   types — every type the props reach, defined from the source, and
 *   externalTypes, the outside ones named with their package, carried over
 *   from assembleComponentApi() (scripts/component-types.mjs owns the walk).
 *   A type name in a prop's type is always one or the other, held by
 *   validate-component-api.mjs. The type string itself is never expanded.
 *
 *   default — the source default as a value when it is a literal (`default`:
 *   a number, a boolean, null, an enum member, or a string literal on a prop
 *   of any type), and otherwise as source text (`defaultExpression`: a
 *   function, `50 * 1024 * 1024`, `inline ? 1 : 8`, a template string or a
 *   reference to another prop). validate-json-schemas.mjs fails on a
 *   `defaultExpression` that is only a quoted string, so a literal can never
 *   slide back into the expression slot. component-api.generated.ts keeps
 *   the raw docgen text untouched.
 *
 * Two properties this surface must keep, or the build breaks:
 *
 *   1. Deterministic. No network, no timestamps. validate-component-schema.mjs
 *      regenerates in memory and byte-compares against disk, and CI runs a
 *      drift guard after the generators.
 *   2. Valid against its meta-schema. validate-json-schemas.mjs compiles
 *      component.schema.json strictly and checks every generated file; the
 *      vocabulary rules there (tone, disabled, locale, linkComponent, *Label)
 *      are the data form of CLAUDE.md's Component Anatomy contract.
 *
 * Only the components/ subfolder is pruned: the schema folder's top level
 * holds the hand-written meta-schemas and the token files another generator
 * owns. Runs via the validate-registry chain and the website's
 * predev/prebuild; never edit the generated files by hand.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleComponentApi } from './generate-component-api.mjs';
import { repoRoot } from './component-docgen.mjs';
import { SITE_URL } from './brand.mjs';
import { PACKAGE_NAME, PACKAGE_VERSION } from './package-manifest.mjs';

export const schemaDir = join(repoRoot, 'website', 'public', 'schema');
export const outputDir = join(schemaDir, 'components');
export const indexPath = join(schemaDir, 'components.json');

export const META_SCHEMA_URL = `${SITE_URL}/schema/component.schema.json`;
export const INDEX_SCHEMA_URL = `${SITE_URL}/schema/components-index.schema.json`;
export const schemaUrlFor = (slug) => `${SITE_URL}/schema/components/${slug}.json`;

const PRIMITIVES = new Set(['string', 'number', 'boolean', 'bigint', 'null', 'undefined']);

/**
 * Splits a type string on its top-level `|`, ignoring bars inside
 * parentheses, angle brackets, braces, brackets and quotes.
 */
function topLevelMembers(type) {
  const members = [];
  let depth = 0;
  let quote = null;
  let current = '';
  for (const ch of type) {
    if (quote) {
      current += ch;
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      current += ch;
      continue;
    }
    if ('(<{['.includes(ch)) depth++;
    if (')>}]'.includes(ch)) depth--;
    if (ch === '|' && depth === 0) {
      members.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) members.push(current.trim());
  return members;
}

/** Strips one pair of wrapping parentheses: `((a) => b)` reads as `(a) => b`. */
function unwrap(member) {
  if (!member.startsWith('(') || !member.endsWith(')')) return member;
  let depth = 0;
  for (let i = 0; i < member.length; i++) {
    if (member[i] === '(') depth++;
    if (member[i] === ')') depth--;
    if (depth === 0 && i < member.length - 1) return member;
  }
  return member.slice(1, -1).trim();
}

export function typeKindOf(prop) {
  if (prop.values) return 'enum';
  const type = prop.type.trim();
  if (PRIMITIVES.has(type)) return 'primitive';
  const members = topLevelMembers(type);
  if (members.length !== 1) return 'other';
  const member = unwrap(members[0]);
  if (/\[\]$/.test(member) || /^(Readonly)?Array<.*>$/s.test(member)) return 'array';
  if (/=>/.test(member) || /^(React\.)?\w*EventHandler(<.*>)?$/s.test(member)) return 'function';
  if (/^[A-Z][A-Za-z0-9]*(<.*>)?$/s.test(member)) return 'reference';
  return 'other';
}

/** The default as `{ default }` or `{ defaultExpression }`, or `{}` for none. */
export function defaultOf(prop, typeKind) {
  const raw = prop.defaultValue;
  if (raw == null) return {};
  const text = raw.trim();
  if (/^-?\d+(\.\d+)?$/.test(text)) return { default: Number(text) };
  if (text === 'true' || text === 'false') return { default: text === 'true' };
  if (text === 'null') return { default: null };
  const unquoted = text.replace(/^(['"])(.*)\1$/s, '$2');
  if (typeKind === 'enum' && prop.values.includes(unquoted)) return { default: unquoted };
  // component-api's defaultValue is source text (generate-component-api.mjs
  // quotes a code string default again), so a string literal is a value
  // whatever the prop's type: `'Answers may be
  // wrong.'` on a ReactNode prop, or `'Close chat'` on a string-or-function
  // label, is still exactly that string. Only a quote pair with no other
  // quote of its kind inside counts, so `'a' + b` stays an expression.
  const literal = text.match(/^(['"])((?:\\.|(?!\1)[^\\])*)\1$/s);
  if (literal) return { default: literal[2].replace(/\\(.)/gs, '$1') };
  return { defaultExpression: text };
}

function propSchema(prop) {
  const typeKind = typeKindOf(prop);
  const out = { name: prop.name, type: prop.type, typeKind };
  if (prop.values) out.values = prop.values;
  out.required = prop.required;
  out.description = prop.description;
  Object.assign(out, defaultOf(prop, typeKind));
  if (prop.deprecated) out.deprecated = prop.deprecated;
  if (prop.typeRefs) out.typeRefs = prop.typeRefs;
  if (prop.defaultResolved !== undefined) out.defaultResolved = prop.defaultResolved;
  return out;
}

function componentSchema(entry) {
  const docsUrl = `${SITE_URL}/components/${entry.slug}`;
  return {
    $schema: META_SCHEMA_URL,
    version: PACKAGE_VERSION,
    kind: entry.kind,
    name: entry.name,
    label: entry.label,
    slug: entry.slug,
    category: entry.category,
    description: entry.description,
    client: entry.client,
    importPath: entry.importPath,
    barrel: entry.barrel,
    docsUrl,
    markdownUrl: `${docsUrl}.md`,
    ...(entry.deprecated ? { deprecated: entry.deprecated } : {}),
    exports: entry.exports.map((exported) => ({
      component: exported.component,
      ...(exported.deprecated ? { deprecated: exported.deprecated } : {}),
      props: exported.props.map(propSchema),
    })),
    ...(entry.types ? { types: entry.types } : {}),
    ...(entry.externalTypes ? { externalTypes: entry.externalTypes } : {}),
  };
}

const stringify = (value) => `${JSON.stringify(value, null, 2)}\n`;

/**
 * Every generated file as { path, content }: one per entry under
 * components/, then the index. Exported so the validator can rebuild it.
 */
export function assembleComponentSchemaFiles() {
  const entries = assembleComponentApi();
  const files = entries.map((entry) => ({
    path: join(outputDir, `${entry.slug}.json`),
    content: stringify(componentSchema(entry)),
  }));
  const index = {
    $schema: INDEX_SCHEMA_URL,
    version: PACKAGE_VERSION,
    package: PACKAGE_NAME,
    count: entries.length,
    components: entries.map((entry) => ({
      name: entry.name,
      label: entry.label,
      slug: entry.slug,
      category: entry.category,
      kind: entry.kind,
      schemaUrl: schemaUrlFor(entry.slug),
      docsUrl: `${SITE_URL}/components/${entry.slug}`,
      markdownUrl: `${SITE_URL}/components/${entry.slug}.md`,
    })),
  };
  files.push({ path: indexPath, content: stringify(index) });
  return files;
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  mkdirSync(outputDir, { recursive: true });
  const files = assembleComponentSchemaFiles();

  let written = 0;
  for (const file of files) {
    const existing = existsSync(file.path) ? readFileSync(file.path, 'utf8') : null;
    if (existing !== file.content) {
      writeFileSync(file.path, file.content);
      written++;
    }
  }

  // A component leaving the registry takes its schema with it. Only the
  // components folder is pruned: the schema root holds hand-written files.
  const wanted = new Set(
    files.filter((f) => f.path.startsWith(outputDir)).map((f) => relative(outputDir, f.path))
  );
  let pruned = 0;
  for (const name of readdirSync(outputDir)) {
    if (!wanted.has(name)) {
      rmSync(join(outputDir, name));
      pruned++;
    }
  }

  console.log(
    written + pruned > 0
      ? `✓ Component schemas regenerated — ${files.length} files (${written} written, ${pruned} pruned).`
      : `✓ Component schemas up to date — ${files.length} files.`
  );
}
