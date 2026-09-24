#!/usr/bin/env node
/**
 * generate-shadcn-registry.mjs
 *
 * Writes website/public/r/ — a shadcn-compatible component registry, the
 * third install path beside the npm package and the cloned repo. Any
 * consumer of the shadcn CLI can pull single components as source:
 *
 *   npx shadcn@latest add <SITE_URL>/r/button.json
 *
 * Shape:
 *   - registry.json               the index (names, titles, descriptions)
 *   - <slug>.json                 one item per public component, its
 *                                 source files EMBEDDED (tsx + css, the
 *                                 whole relative-import closure inside
 *                                 its folder)
 *   - base.json                   the shared layer every item depends
 *                                 on: tokens.css and its imports, the
 *                                 generated theme presets, the icon
 *                                 font's CSS, the JS motion constants,
 *                                 and src/behaviors/
 *   - assets/<name>.woff2         font binaries, copied so the site can
 *                                 serve them (JSON can only embed text)
 *
 * Two load-bearing decisions:
 *   1. NO import rewriting. Every file's target preserves its src/
 *      layout under a brand-named folder in the consumer's project
 *      (src/components/Button/Button.tsx ->
 *      rift/components/Button/Button.tsx), so the library's own
 *      relative imports resolve verbatim after install. Cross-component
 *      imports become registryDependencies instead, as absolute URLs so
 *      they resolve without namespace configuration.
 *   2. The ONE rewrite is url(*.woff2) in CSS copies: JSON cannot carry
 *      the binaries, so they are copied to assets/ and the registry's
 *      CSS copies point at `${SITE_URL}/r/assets/<file>`. The package's
 *      own stylesheets are untouched.
 *
 * The whole surface is generated, committed, and byte-compared by
 * validate-shadcn-registry.mjs (both directions, plus a leak screen —
 * file contents ship verbatim to strangers, so corpus rules apply).
 * Runs in the validate-registry chain and the website's predev/prebuild.
 * Never hand-edit the files.
 */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BRAND_SHORT, SITE_URL } from './brand.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(repoRoot, 'src');
export const outputDir = join(repoRoot, 'website', 'public', 'r');

const registry = JSON.parse(
  readFileSync(join(srcDir, 'components', 'registry.json'), 'utf8')
);

const ITEM_SCHEMA = 'https://ui.shadcn.com/schema/registry-item.json';
/** Consumer-side folder name, derived so it can never drift from the brand. */
const TARGET_ROOT = BRAND_SHORT.toLowerCase().replace(/[^a-z0-9]+/g, '-');

/** repo path under src/ -> the consumer-side target path. */
const targetFor = (absPath) => `${TARGET_ROOT}/${relative(srcDir, absPath).replace(/\\/g, '/')}`;

/** Resolve a relative import specifier the way a bundler would. */
function resolveSpecifier(fromFile, spec) {
  const base = resolve(dirname(fromFile), spec);
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, `${base}.css`, join(base, 'index.ts')]) {
    if (existsSync(candidate) && !readdirSyncSafe(candidate)) return candidate;
  }
  return null;
}
const readdirSyncSafe = (p) => {
  try {
    readdirSync(p);
    return true; // a directory, not a file
  } catch {
    return false;
  }
};

/** Every import/export specifier in a TS/TSX source: `from '...'` covers
    named and re-export forms (multiline included), the second pattern the
    side-effect `import './x.css'` form. */
const specifiersIn = (source) => [
  ...[...source.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((m) => m[1]),
  ...[...source.matchAll(/(?:^|\n)\s*import\s+['"]([^'"]+)['"]/g)].map((m) => m[1]),
];

/** @import targets in a CSS source. */
const cssImportsIn = (source) =>
  [...source.matchAll(/@import\s+(?:url\()?['"]([^'"]+)['"]\)?/g)].map((m) => m[1]);

/** url(...) font references in a CSS source. */
const fontUrlsIn = (source) =>
  [...source.matchAll(/url\(['"]?([^'")]+\.woff2)['"]?\)/g)].map((m) => m[1]);

/** slug per component folder name, for cross-component dependency edges. */
const slugByFolder = new Map(registry.components.map((c) => [c.folder ?? c.name, c.slug]));

const binaries = new Map(); // assets/<name> -> Buffer

/**
 * Walk one entry file's relative-import closure. Returns
 * { files: Map<abs path, content>, deps: Set<slug>, npm: Set<pkg>, external: Set<abs path> }
 * where `external` collects files outside the component's own folder
 * (behaviors, fonts css, tokens/motion) that the base item must carry.
 */
function walkClosure(entryFiles, ownDir) {
  const files = new Map();
  const deps = new Set();
  const npm = new Set();
  const external = new Set();
  const queue = [...entryFiles];
  const seen = new Set();
  while (queue.length > 0) {
    const file = queue.shift();
    if (seen.has(file)) continue;
    seen.add(file);
    const inOwnDir = ownDir && file.startsWith(ownDir + '/');
    const rel = relative(srcDir, file).replace(/\\/g, '/');
    const inComponents = rel.startsWith('components/');
    if (inComponents && !inOwnDir) {
      // Another component's file: a dependency edge, not a copy.
      const folder = rel.split('/')[1];
      const slug = slugByFolder.get(folder);
      if (!slug) throw new Error(`${rel} is imported but ${folder} is not a registered component`);
      deps.add(slug);
      continue;
    }
    if (!inOwnDir) external.add(file);
    let content = readFileSync(file, 'utf8');
    const isCss = file.endsWith('.css');
    const specs = isCss ? cssImportsIn(content) : specifiersIn(content);
    for (const spec of specs) {
      if (!spec.startsWith('.')) {
        if (spec === 'recharts') npm.add('recharts');
        continue; // react/react-dom are peers; everything else is flagged by tsc anyway
      }
      const resolved = resolveSpecifier(file, spec);
      if (!resolved) throw new Error(`${rel}: unresolvable import "${spec}"`);
      queue.push(resolved);
    }
    if (isCss) {
      for (const fontUrl of fontUrlsIn(content)) {
        const fontPath = resolve(dirname(file), fontUrl);
        const name = fontPath.split('/').pop();
        binaries.set(name, readFileSync(fontPath));
        content = content.replaceAll(fontUrl, `${SITE_URL}/r/assets/${name}`);
      }
    }
    if (inOwnDir || !ownDir) files.set(file, content);
  }
  return { files, deps, npm, external };
}

const stringify = (obj) => JSON.stringify(obj, null, 2) + '\n';

const fileEntry = (absPath, content) => ({
  path: relative(repoRoot, absPath).replace(/\\/g, '/'),
  type: 'registry:file',
  target: targetFor(absPath),
  content,
});

/** Every file of the surface, as name -> content (string, or Buffer for assets). */
export function assembleShadcnRegistry() {
  binaries.clear();
  const out = new Map();
  const baseExternal = new Set();

  const items = [];
  for (const component of [...registry.components].sort((a, b) => a.slug.localeCompare(b.slug))) {
    const folder = component.folder ?? component.name;
    const ownDir = join(srcDir, 'components', folder);
    const entry = join(ownDir, `${component.name}.tsx`);
    if (!existsSync(entry)) throw new Error(`No entry file for ${component.name} at ${entry}`);
    const { files, deps, npm, external } = walkClosure([entry], ownDir);
    for (const file of external) baseExternal.add(file);
    const item = {
      $schema: ITEM_SCHEMA,
      name: component.slug,
      type: 'registry:ui',
      title: component.label,
      description: component.description,
      ...(npm.size > 0 ? { dependencies: [...npm].sort() } : {}),
      registryDependencies: [
        `${SITE_URL}/r/base.json`,
        ...[...deps].sort().map((slug) => `${SITE_URL}/r/${slug}.json`),
      ],
      files: [...files.keys()]
        .sort()
        .map((absPath) => fileEntry(absPath, files.get(absPath))),
    };
    out.set(`${component.slug}.json`, stringify(item));
    items.push({ name: item.name, type: item.type, title: item.title, description: item.description });
  }

  /* The base item: the token layer whole (tokens.css closure + the
     generated presets), the icon font's CSS, the JS motion constants,
     all of src/behaviors/, and whatever else a component reached
     outside its own folder. */
  const baseEntries = [
    join(srcDir, 'tokens', 'tokens.css'),
    join(srcDir, 'tokens', 'presets', 'presets.css'),
    join(srcDir, 'tokens', 'motion.ts'),
    join(srcDir, 'fonts', 'material-symbols.css'),
    ...readdirSync(join(srcDir, 'behaviors'))
      .filter((n) => n.endsWith('.ts'))
      .map((n) => join(srcDir, 'behaviors', n)),
    ...baseExternal,
  ];
  const base = walkClosure([...new Set(baseEntries)].sort(), null);
  const baseItem = {
    $schema: ITEM_SCHEMA,
    name: 'base',
    type: 'registry:lib',
    title: `${BRAND_SHORT} base`,
    description:
      'The shared layer every component builds on: the token stylesheets, the generated theme presets, the icon font, the motion constants, and the overlay behavior hooks.',
    files: [...base.files.keys()]
      .sort()
      .map((absPath) => fileEntry(absPath, base.files.get(absPath))),
  };
  out.set('base.json', stringify(baseItem));

  out.set(
    'registry.json',
    stringify({
      $schema: 'https://ui.shadcn.com/schema/registry.json',
      name: TARGET_ROOT,
      homepage: SITE_URL,
      items: [
        { name: baseItem.name, type: baseItem.type, title: baseItem.title, description: baseItem.description },
        ...items,
      ],
    })
  );

  for (const [name, buffer] of [...binaries.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    out.set(`assets/${name}`, buffer);
  }
  return out;
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const files = assembleShadcnRegistry();
  mkdirSync(join(outputDir, 'assets'), { recursive: true });

  let written = 0;
  for (const [name, content] of files) {
    const dest = join(outputDir, name);
    mkdirSync(dirname(dest), { recursive: true });
    const existing = existsSync(dest) ? readFileSync(dest) : null;
    const next = Buffer.isBuffer(content) ? content : Buffer.from(content);
    if (existing === null || !existing.equals(next)) {
      writeFileSync(dest, next);
      written++;
    }
  }

  /* A component leaving the registry takes its item with it. */
  let pruned = 0;
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else {
        const key = relative(outputDir, path).replace(/\\/g, '/');
        if (!files.has(key)) {
          rmSync(path);
          pruned++;
        }
      }
    }
  };
  walk(outputDir);

  console.log(
    written + pruned > 0
      ? `✓ shadcn registry regenerated — ${files.size} files (${written} written, ${pruned} pruned).`
      : `✓ shadcn registry up to date — ${files.size} files.`
  );
}
