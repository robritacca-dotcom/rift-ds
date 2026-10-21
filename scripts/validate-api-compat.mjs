#!/usr/bin/env node
/**
 * validate-api-compat.mjs
 *
 * Guards "deprecate, never remove" (CLAUDE.md, Component Anatomy) against
 * the last version actually published. The prop JSDoc, the generated API
 * and the .d.ts all describe what the working tree ships next; this script
 * compares that surface with the one at the latest release tag and fails on
 * anything a consumer's working code could trip over:
 *
 *   1. A removed component (a registry entry in the generated API).
 *   2. A removed prop, deprecated or not: deprecation keeps a prop, it never
 *      licenses deleting it.
 *   3. A prop that became required, or a new prop that is required from the
 *      start (both break every existing call site that omits it).
 *   4. A prop type that narrowed. A literal union that lost a member is the
 *      common case; any other type change is reported too, because a parse
 *      of type strings cannot prove a change is a widening, and a human
 *      saying so in SANCTIONED_BREAKS is cheap. One widening is recognised
 *      by shape: a callback typed `() => void` that became an event
 *      handler (`MouseEventHandler<…>`, or any function returning void),
 *      because a function taking no arguments is assignable to one that is
 *      handed some, so every existing call site still type-checks.
 *   5. A removed export: a package subpath, a name an explicit subpath
 *      exported (values and types, read from the module's syntax at both
 *      revisions, following `export *`), a file a wildcard subpath served
 *      as a deep import, or a bin.
 *
 * Widening is fine: new components, new optional props, new union members,
 * a prop gaining @deprecated. A default that moves is not checked, because
 * a default is behaviour, not shape; the release notes own that.
 *
 * The baseline is the highest `v*` tag (the release skill tags each published
 * commit), read with `git show <tag>:<path>`; `--against <tag>` picks an
 * older one, for auditing history (sanctions are matched the same way). The current side is the
 * working tree, which is what the next publish ships:
 *   - website/src/data/component-api.generated.ts, the generated prop API
 *     (it also covers the chat widget's documented components);
 *   - package.json's `exports` keys and `bin`, the in-repo mirror that
 *     validate-package-exports.mjs holds to scripts/package-manifest.mjs.
 *
 * The baseline's generated API is trusted as written. Before
 * validate-prop-docs.mjs gained its empty-table check, a docgen slip could
 * publish a component with no props listed (AttachmentGroup in 1.5.0), so an
 * `--against` audit of an old tag can report a long-standing prop as new.
 * Against the latest tag that cannot happen, because the check now holds
 * every release.
 *
 * A deliberate break is listed in SANCTIONED_BREAKS with the version that
 * ships it and the reason. A sanction that no longer matches a break fails
 * as stale: once the release carrying it is tagged, the baseline moves past
 * it and the row goes.
 *
 * Where it runs: `npm run verify` and CI's library job, never the
 * validate-registry chain. It needs git history and tags, and Vercel's
 * shallow, tag-less checkout runs that chain before every deploy: a missing
 * baseline there must not block the site. With no tag it says so and, in CI
 * (`CI` set), fails, because a CI checkout without tags means the workflow
 * lost `fetch-depth: 0` and the gate would otherwise pass vacuously.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const API_PATH = 'website/src/data/component-api.generated.ts';
// Normalize CRLF so Windows checkouts validate identically to CI.
const normalize = (text) => text.replace(/\r\n/g, '\n');
const readCurrent = (path) => normalize(readFileSync(join(repoRoot, path), 'utf8'));
const git = (...args) => execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

/**
 * Breaks a release ships on purpose. Each row names the version carrying it,
 * what breaks, and why, e.g.
 *   { since: '2.0.0', component: 'Widget', prop: 'size', change: 'removed', reason: '…' }
 * The keys match the record() calls below: `component` + `prop` for a prop,
 * `subpath` + `export` for a name, `subpath` + `file` for a deep import,
 * `bin` for a binary.
 */
const SANCTIONED_BREAKS = [];

/* ── Baseline ──────────────────────────────────────────────────────────── */

let tags = [];
try {
  tags = git('tag', '--list', 'v*', '--sort=-v:refname').split('\n').filter((t) => /^v\d+\.\d+\.\d+$/.test(t));
} catch {
  // not a git checkout
}
if (tags.length === 0) {
  const message =
    'No release tag (v*) is reachable, so there is no published API to compare against. ' +
    'Fetch tags (git fetch --tags), or in CI give actions/checkout `fetch-depth: 0`.';
  if (process.env.CI) {
    console.error(`✗ API compatibility validation failed:\n    - ${message}`);
    process.exit(1);
  }
  console.log(`⚠ API compatibility not checked: ${message}`);
  process.exit(0);
}
// `--against <tag>` compares with an older release instead, for auditing history.
const againstAt = process.argv.indexOf('--against');
const baseline = againstAt === -1 ? tags[0] : process.argv[againstAt + 1];
if (!tags.includes(baseline)) {
  console.error(`✗ API compatibility validation failed:\n    - ${baseline} is not a release tag.`);
  process.exit(1);
}
const readBaseline = (path) => {
  try {
    return normalize(git('show', `${baseline}:${path}`));
  } catch {
    return null;
  }
};

/* ── Parsing ───────────────────────────────────────────────────────────── */

/** The `componentApi` array literal is JSON; everything around it is TypeScript. */
function parseApi(text, label) {
  // Skip the `readonly ComponentApiEntry[]` annotation: the literal starts after `= `.
  const assign = text.indexOf('= [', text.indexOf('export const componentApi'));
  const start = assign === -1 ? -1 : assign + 2;
  const end = text.lastIndexOf(']');
  if (start === -1 || end === -1) throw new Error(`cannot find componentApi in ${label}`);
  return JSON.parse(text.slice(start, end + 1));
}

/** Top-level members of a union type string, ignoring `|` inside brackets, braces, parens and quotes. */
function unionMembers(type) {
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
    if (ch === '"' || ch === "'" || ch === '`') quote = ch;
    else if ('([{<'.includes(ch)) depth += 1;
    else if (')]}>'.includes(ch)) depth -= 1;
    if (ch === '|' && depth === 0) {
      members.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  members.push(current.trim());
  // `undefined` rides on optionality, which check 3 owns.
  return members.filter((m) => m && m !== 'undefined');
}

/**
 * Docgen prints the same type differently depending on optionality: an
 * optional callback comes back wrapped in parentheses (`((page: number) =>
 * void)`). Unwrap redundant outer parentheses and collapse whitespace, so a
 * prop that only became optional does not read as a type change.
 */
function normalizeType(type) {
  // A run of string literals joined by `|` is the same union in any order:
  // docgen prints members in the order the checker meets them, which moves
  // when an unrelated edit touches the type (`"added" | "removed" | "failed"`
  // came back as `"failed" | "added" | "removed"`).
  let t = type
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/"[^"]*"(?: \| "[^"]*")+/g, (run) => run.split(' | ').sort().join(' | '));
  for (;;) {
    if (!t.startsWith('(') || !t.endsWith(')')) return t;
    let depth = 0;
    let wraps = true;
    for (let i = 0; i < t.length; i += 1) {
      if (t[i] === '(') depth += 1;
      else if (t[i] === ')') depth -= 1;
      if (depth === 0 && i < t.length - 1) {
        wraps = false;
        break;
      }
    }
    if (!wraps) return t;
    t = t.slice(1, -1).trim();
  }
}

/**
 * A no-argument callback that became a handler which is handed arguments:
 * `() => void` to `MouseEventHandler<HTMLButtonElement>` (or any React
 * `*EventHandler<…>`, or any function type returning void). Every function
 * written for the old type is assignable to the new one, so it widens.
 */
function isHandlerWidening(oldType, newType) {
  if (normalizeType(oldType) !== '() => void') return false;
  const t = normalizeType(newType);
  return /^(?:React\.)?[A-Za-z]*EventHandler(?:<.*>)?$/.test(t) || /^\(.*\) => void$/.test(t);
}

/* ── Comparison ────────────────────────────────────────────────────────── */

const breaks = [];
const record = (key, message) => breaks.push({ key, message });

const baselineApiText = readBaseline(API_PATH);
if (baselineApiText === null) {
  console.error(`✗ API compatibility validation failed:\n    - ${API_PATH} does not exist at ${baseline}.`);
  process.exit(1);
}
const before = parseApi(baselineApiText, `${API_PATH} at ${baseline}`);
const after = parseApi(readCurrent(API_PATH), API_PATH);
const afterByName = new Map(after.map((entry) => [entry.name, entry]));

let propsCompared = 0;
for (const oldEntry of before) {
  const newEntry = afterByName.get(oldEntry.name);
  if (!newEntry) {
    record({ component: oldEntry.name, change: 'removed' }, `${oldEntry.name} was removed (it shipped in ${baseline}).`);
    continue;
  }
  const newExports = new Map(newEntry.exports.map((e) => [e.component, e]));
  for (const oldExport of oldEntry.exports) {
    const component = oldExport.component;
    const newExport = newExports.get(component);
    // A vanished export is check 5's to report, from the module's real export
    // names: older generated files also listed hooks and helpers here, which
    // the docgen filter has since dropped without the package dropping them.
    if (!newExport) continue;
    const newProps = new Map(newExport.props.map((p) => [p.name, p]));
    for (const oldProp of oldExport.props) {
      propsCompared += 1;
      const prop = oldProp.name;
      const newProp = newProps.get(prop);
      if (!newProp) {
        record(
          { component, prop, change: 'removed' },
          `${component}.${prop} was removed. Deprecate it instead and keep it working (CLAUDE.md: deprecate, never remove).`
        );
        continue;
      }
      if (!oldProp.required && newProp.required) {
        record({ component, prop, change: 'required' }, `${component}.${prop} became required; every call site omitting it breaks.`);
      }
      if (normalizeType(oldProp.type) !== normalizeType(newProp.type)) {
        const oldMembers = unionMembers(oldProp.type);
        const newMembers = new Set(unionMembers(newProp.type));
        const lost = oldMembers.filter((m) => !newMembers.has(m));
        if (lost.length === 0) continue; // every old member survives: a widening
        if (isHandlerWidening(oldProp.type, newProp.type)) continue;
        record(
          { component, prop, change: 'type' },
          oldMembers.length > 1
            ? `${component}.${prop} lost ${lost.join(', ')} from its type (${oldProp.type} → ${newProp.type}).`
            : `${component}.${prop} changed type (${oldProp.type} → ${newProp.type}). If this widens it, sanction it with that reason.`
        );
      }
    }
    const oldNames = new Set(oldExport.props.map((p) => p.name));
    for (const newProp of newExport.props) {
      if (!oldNames.has(newProp.name) && newProp.required) {
        record(
          { component, prop: newProp.name, change: 'required' },
          `${component}.${newProp.name} is new and required; existing call sites do not pass it. Make it optional with a default.`
        );
      }
    }
  }
}

const baselinePackage = JSON.parse(readBaseline('package.json') ?? '{}');
const currentPackage = JSON.parse(readCurrent('package.json'));
const currentSubpaths = new Set(Object.keys(currentPackage.exports ?? {}));
for (const subpath of Object.keys(baselinePackage.exports ?? {})) {
  if (!currentSubpaths.has(subpath)) {
    record({ subpath, change: 'removed' }, `The package export "${subpath}" was removed; imports of it stop resolving.`);
  }
}

/*
 * Check 5, at module level. The in-repo export map points at ./src, so each
 * subpath's target is a source file both revisions can be read at. An explicit
 * subpath must keep every name it exported (values and types: a removed type
 * breaks a TypeScript consumer as surely as a removed value), following
 * `export *` and `export { } from` through the files they name. A wildcard
 * subpath must keep serving every file it served, since each is a deep import
 * path a consumer may have written.
 */
const SOURCE_FILE = /^src\/.*\.(tsx?|css|woff2?)$/;
const baselineFiles = new Map();
{
  const listed = git('ls-tree', '-r', '--name-only', baseline, '--', 'src')
    .split('\n')
    .filter((p) => SOURCE_FILE.test(p));
  const textual = listed.filter((p) => /\.tsx?$/.test(p));
  const out = execFileSync('git', ['cat-file', '--batch'], {
    cwd: repoRoot,
    input: textual.map((p) => `${baseline}:${p}`).join('\n') + '\n',
    maxBuffer: 256 * 1024 * 1024,
  });
  let offset = 0;
  for (const path of textual) {
    const headerEnd = out.indexOf(10, offset);
    const size = Number(out.subarray(offset, headerEnd).toString().split(' ')[2]);
    baselineFiles.set(path, normalize(out.subarray(headerEnd + 1, headerEnd + 1 + size).toString('utf8')));
    offset = headerEnd + 1 + size + 1;
  }
  for (const path of listed) if (!baselineFiles.has(path)) baselineFiles.set(path, '');
}
const currentFiles = new Map(
  git('ls-files', '--cached', '--others', '--exclude-standard', '--', 'src')
    .split('\n')
    .filter((p) => SOURCE_FILE.test(p) && existsSync(join(repoRoot, p)))
    .map((p) => [p, null])
);
const readAt = (files, path) => {
  if (!files.has(path)) return null;
  if (files.get(path) === null) files.set(path, readCurrent(path));
  return files.get(path);
};

function resolveModule(files, fromPath, spec) {
  const base = join(dirname(fromPath), spec).replaceAll('\\', '/').replace(/\.js$/, '');
  return [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`].find(
    (candidate) => /\.tsx?$/.test(candidate) && files.has(candidate)
  );
}

function exportedNames(files, path, seen = new Set()) {
  const names = new Set();
  if (seen.has(path)) return names;
  seen.add(path);
  const text = readAt(files, path);
  if (text === null) return names;
  const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, false, ts.ScriptKind.TSX);
  for (const statement of source.statements) {
    if (ts.isExportDeclaration(statement)) {
      const target = statement.moduleSpecifier?.text;
      const resolved = target?.startsWith('.') ? resolveModule(files, path, target) : null;
      if (!statement.exportClause) {
        if (resolved) for (const n of exportedNames(files, resolved, seen)) if (n !== 'default') names.add(n);
      } else if (ts.isNamespaceExport(statement.exportClause)) {
        names.add(statement.exportClause.name.text);
      } else {
        for (const element of statement.exportClause.elements) names.add(element.name.text);
      }
      continue;
    }
    if (ts.isExportAssignment(statement)) {
      names.add('default');
      continue;
    }
    const exported = ts.canHaveModifiers(statement) && ts.getModifiers(statement)?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    if (!exported) continue;
    if (ts.getModifiers(statement).some((m) => m.kind === ts.SyntaxKind.DefaultKeyword)) names.add('default');
    else if (ts.isVariableStatement(statement)) {
      for (const d of statement.declarationList.declarations) if (ts.isIdentifier(d.name)) names.add(d.name.text);
    } else if (statement.name) names.add(statement.name.text);
  }
  return names;
}

const wildcardTarget = (target) => {
  const [prefix, suffix] = target.replace(/^\.\//, '').split('*');
  return (path) => path.startsWith(prefix) && path.endsWith(suffix) && !/\.(stories|test)\./.test(path);
};
let namesCompared = 0;
for (const [subpath, target] of Object.entries(baselinePackage.exports ?? {})) {
  if (typeof target !== 'string' || !currentSubpaths.has(subpath)) continue;
  if (target.includes('*')) {
    const matches = wildcardTarget(target);
    for (const path of baselineFiles.keys()) {
      if (matches(path) && !currentFiles.has(path)) {
        record(
          { subpath, file: path, change: 'removed' },
          `${path} was removed, so the deep import it served through "${subpath}" stops resolving.`
        );
      }
    }
    continue;
  }
  const path = target.replace(/^\.\//, '');
  if (!/\.tsx?$/.test(path)) continue;
  const currentTarget = (currentPackage.exports[subpath] ?? '').replace(/^\.\//, '');
  const now = exportedNames(currentFiles, currentTarget);
  for (const name of exportedNames(baselineFiles, path)) {
    namesCompared += 1;
    if (!now.has(name)) {
      record(
        { subpath, export: name, change: 'removed' },
        `"${name}" is no longer exported from ${subpath === '.' ? 'the package root' : `"${subpath}"`}. ` +
          `Keep exporting it (deprecated if need be).`
      );
    }
  }
}
const binNames = (pkg) => (typeof pkg.bin === 'string' ? [pkg.name] : Object.keys(pkg.bin ?? {}));
const currentBins = new Set(binNames(currentPackage));
for (const bin of binNames(baselinePackage)) {
  if (!currentBins.has(bin)) record({ bin, change: 'removed' }, `The bin "${bin}" was removed; \`npx ${bin}\` stops working.`);
}

/* ── Sanctions and report ──────────────────────────────────────────────── */

const sameKey = (a, b) => ['component', 'prop', 'subpath', 'export', 'file', 'bin', 'change'].every((k) => (a[k] ?? null) === (b[k] ?? null));
const errors = [];
for (const b of breaks) {
  if (!SANCTIONED_BREAKS.some((s) => sameKey(s, b.key))) errors.push(b.message);
}
for (const s of SANCTIONED_BREAKS) {
  if (!s.since || !s.reason) errors.push(`A SANCTIONED_BREAKS row needs \`since\` and \`reason\`: ${JSON.stringify(s)}`);
  if (!breaks.some((b) => sameKey(s, b.key))) {
    errors.push(`SANCTIONED_BREAKS row ${JSON.stringify(s)} matches no break against ${baseline}: the release carrying it has shipped, so remove it.`);
  }
}

if (errors.length > 0) {
  console.error(`✗ API compatibility validation failed against ${baseline}:`);
  for (const error of errors) console.error(`    - ${error}`);
  process.exit(1);
}

console.log(
  `✓ API compatible with ${baseline} — ${before.length} entries, ${propsCompared} props and ${namesCompared} exported names compared, nothing removed or narrowed` +
    (SANCTIONED_BREAKS.length ? ` (${SANCTIONED_BREAKS.length} sanctioned break${SANCTIONED_BREAKS.length === 1 ? '' : 's'})` : '')
);
