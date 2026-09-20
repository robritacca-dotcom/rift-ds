#!/usr/bin/env node
/**
 * generate-dependency-graph.mjs
 *
 * Reads the design system out of the source and writes it as one graph:
 * primitives → semantic tokens → library components → site UI → pages, every
 * dependency in between. The /graph page renders it. Nothing here is
 * hand-maintained — the node lists come from the same sources the build
 * already trusts (the component and token registries, the filesystem route
 * walk), and the edges come from parsing the source itself: var() references
 * in CSS (plus getCSSVar literals), cross-component imports, and the
 * `@robr0/design-system` deep and barrel imports in site code.
 *
 * Output: website/src/data/dependency-graph.generated.ts (committed;
 * validate-dependency-graph.mjs byte-compares it, CI's drift guard catches a
 * stale commit). Edges ship as node-index triples to keep the file small.
 *
 * Also the CLI behind the page's hint lines:
 *   npm run graph -- tree <name>       what <name> depends on, transitively
 *   npm run graph -- who-uses <name>   what depends on <name>, transitively
 */
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve, relative, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

export const outputPath = join(root, 'website', 'src', 'data', 'dependency-graph.generated.ts');

// Normalised read: a CRLF checkout must produce byte-identical output to a
// LF one, or the drift guard fires on whichever platform did not commit.
const read = (p) => readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
const isDir = (p) => existsSync(p) && statSync(p).isDirectory();
const ls = (dir) => readdirSync(dir).sort(); // sorted so output is identical across platforms

function* walkFiles(dir) {
  for (const entry of ls(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) yield* walkFiles(p);
    else yield p;
  }
}

const isSource = (f) => /\.(tsx|ts|css)$/.test(f) && !/\.stories\.tsx?$/.test(f) && !f.endsWith('.d.ts');

const COLUMNS = [
  { id: 'primitives', label: 'Primitives', sub: 'raw values' },
  { id: 'tokens', label: 'Tokens', sub: 'semantic' },
  { id: 'library', label: 'Library', sub: '@robr0/design-system' },
  { id: 'site', label: 'Site UI', sub: 'website/src/components' },
  { id: 'pages', label: 'Pages', sub: 'app routes' },
];

/** Build the whole graph in memory: { columns, groupOrder, nodes, edges }. */
export function buildGraph() {
  const nodes = new Map(); // id -> node
  const edgeMap = new Map(); // "s|t" -> weight

  const addNode = (node) => { if (!nodes.has(node.id)) nodes.set(node.id, node); };
  const addEdge = (s, t, w = 1) => {
    if (s === t || !nodes.has(s) || !nodes.has(t)) return;
    const key = `${s}|${t}`;
    edgeMap.set(key, (edgeMap.get(key) || 0) + w);
  };

  // -------- tokens --------
  const tokenRegistry = JSON.parse(read(join(root, 'src/tokens/registry.json')));
  const tokenCategory = new Map();
  for (const [cat, names] of Object.entries(tokenRegistry.categories)) {
    for (const name of names) tokenCategory.set(name, cat);
  }

  const primitiveValues = new Map();
  for (const m of read(join(root, 'src/tokens/tokens-primitives.css')).matchAll(/(--primitive-[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    primitiveValues.set(m[1], m[2].trim());
  }
  for (const [name, value] of primitiveValues) {
    const family = name.replace('--primitive-', '').split('-')[0];
    addNode({ id: `primitive/${name}`, label: name.replace('--primitive-', ''), col: 'primitives', group: family, value });
  }

  const semanticFiles = { light: 'src/tokens/tokens-light.css', dark: 'src/tokens/tokens-dark.css', typography: 'src/tokens/tokens-typography.css', motion: 'src/tokens/tokens-motion.css' };
  const tokenDefs = new Map();
  for (const [which, rel] of Object.entries(semanticFiles)) {
    for (const m of read(join(root, rel)).matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
      const [, name, rawValue] = m;
      if (name.startsWith('--primitive-') || !tokenCategory.has(name)) continue;
      // A declaration can wrap across source lines (the font stacks do);
      // collapse the run so the captured value is single-line.
      const value = rawValue.trim().replace(/\s+/g, ' ');
      const def = tokenDefs.get(name) || { refs: new Set() };
      if (which === 'dark') def.dark = value;
      else def.light = def.light ?? value;
      for (const r of value.matchAll(/var\(\s*(--[a-z0-9-]+)/g)) def.refs.add(r[1]);
      tokenDefs.set(name, def);
    }
  }
  for (const [name, cat] of tokenCategory) {
    const def = tokenDefs.get(name) || {};
    addNode({ id: `token/${name}`, label: name.replace(/^--/, ''), col: 'tokens', group: cat, light: def.light, dark: def.dark });
  }
  for (const [name, def] of tokenDefs) {
    for (const ref of def.refs) {
      if (ref.startsWith('--primitive-')) addEdge(`token/${name}`, `primitive/${ref}`);
      else if (tokenCategory.has(ref)) addEdge(`token/${name}`, `token/${ref}`);
    }
  }

  // -------- library components --------
  const componentRegistry = JSON.parse(read(join(root, 'src/components/registry.json')));
  const components = componentRegistry.components;
  const componentByName = new Map(components.map((c) => [c.name, c]));
  const componentsByFolder = new Map();
  for (const c of components) {
    const folder = c.folder || c.name;
    if (!componentsByFolder.has(folder)) componentsByFolder.set(folder, []);
    componentsByFolder.get(folder).push(c);
  }
  for (const c of components) {
    addNode({ id: `component/${c.slug}`, label: c.name, col: 'library', group: c.category, description: c.description });
  }

  const harvestLibraryFile = (file, ownerIds) => {
    const src = read(file);
    if (file.endsWith('.css')) {
      for (const m of src.matchAll(/var\(\s*(--[a-z0-9-]+)/g)) {
        const ref = m[1];
        if (tokenCategory.has(ref)) for (const id of ownerIds) addEdge(id, `token/${ref}`);
        else if (primitiveValues.has(ref)) for (const id of ownerIds) addEdge(id, `primitive/${ref}`);
      }
      return;
    }
    for (const m of src.matchAll(/getCSSVar\(\s*['"](--[a-z0-9-]+)['"]/g)) {
      if (tokenCategory.has(m[1])) for (const id of ownerIds) addEdge(id, `token/${m[1]}`);
    }
    for (const m of src.matchAll(/from\s+['"]\.\.\/([A-Za-z0-9]+)\/([A-Za-z0-9]+)['"]/g)) {
      const [, folder, fileName] = m;
      const target = componentByName.get(fileName) || (componentsByFolder.get(folder) || [])[0];
      if (target) for (const id of ownerIds) addEdge(id, `component/${target.slug}`);
    }
  };

  for (const [folder, folderComponents] of componentsByFolder) {
    const dir = join(root, 'src/components', folder);
    if (!isDir(dir)) continue;
    const names = folderComponents.map((c) => c.name);
    for (const file of [...walkFiles(dir)].filter(isSource)) {
      const base = basename(file);
      const owner = names.find((n) => base === `${n}.tsx` || base === `${n}.ts` || base === `${n}.css`);
      // A file named for one component belongs to it; a shared file (a chart
      // set's common CSS) is a real dependency of every component in the folder.
      const ownerIds = owner
        ? [`component/${componentByName.get(owner).slug}`]
        : folderComponents.map((c) => `component/${c.slug}`);
      harvestLibraryFile(file, ownerIds);
    }
  }

  // -------- site UI --------
  const siteComponentsRoot = join(root, 'website/src/components');
  const siteNodeIds = new Set();
  const siteNodeFor = (path) => {
    const rel = relative(siteComponentsRoot, path).replace(/\\/g, '/');
    const parts = rel.split('/');
    const segments = parts.slice(0, Math.min(2, parts.length - 1));
    return segments.length ? `site/${segments.join('/')}` : null;
  };

  for (const entry of ls(siteComponentsRoot)) {
    const dir = join(siteComponentsRoot, entry);
    if (!isDir(dir)) continue;
    const subdirs = ls(dir).filter((e) => isDir(join(dir, e)));
    const directFiles = ls(dir).filter((e) => !isDir(join(dir, e)) && isSource(e));
    if (directFiles.length || !subdirs.length) {
      addNode({ id: `site/${entry}`, label: entry, col: 'site', group: 'site' });
      siteNodeIds.add(`site/${entry}`);
    }
    for (const sub of subdirs) {
      addNode({ id: `site/${entry}/${sub}`, label: `${entry}/${sub}`, col: 'site', group: entry });
      siteNodeIds.add(`site/${entry}/${sub}`);
    }
  }

  const harvestSiteFile = (file, ownerId) => {
    const src = read(file);
    if (file.endsWith('.css')) {
      for (const m of src.matchAll(/var\(\s*(--[a-z0-9-]+)/g)) {
        if (tokenCategory.has(m[1])) addEdge(ownerId, `token/${m[1]}`);
      }
      return;
    }
    for (const m of src.matchAll(/import\s+([^;]*?)\s+from\s+['"]([^'"]+)['"]/g)) {
      const [, clause, spec] = m;
      const deep = spec.match(/^@robr0\/design-system\/components\/([A-Za-z0-9]+)\/([A-Za-z0-9]+)/);
      if (deep) {
        const target = componentByName.get(deep[2]) || (componentsByFolder.get(deep[1]) || [])[0];
        if (target) addEdge(ownerId, `component/${target.slug}`);
        continue;
      }
      if (spec === '@robr0/design-system' || spec === '@robr0/design-system/charts') {
        for (const name of clause.replace(/[{}]/g, '').split(',')) {
          const clean = name.trim().split(/\s+as\s+/)[0].trim();
          const target = componentByName.get(clean);
          if (target) addEdge(ownerId, `component/${target.slug}`);
        }
        continue;
      }
      let resolved = null;
      if (spec.startsWith('@/components/')) resolved = join(siteComponentsRoot, spec.slice('@/components/'.length));
      else if (spec.startsWith('.')) resolved = resolve(dirname(file), spec);
      if (resolved && relative(siteComponentsRoot, resolved) && !relative(siteComponentsRoot, resolved).startsWith('..')) {
        const target = siteNodeFor(join(resolved, 'x'));
        if (target && siteNodeIds.has(target) && target !== ownerId) addEdge(ownerId, target);
        else {
          const top = `site/${relative(siteComponentsRoot, resolved).replace(/\\/g, '/').split('/')[0]}`;
          if (siteNodeIds.has(top) && top !== ownerId) addEdge(ownerId, top);
        }
      }
    }
  };

  for (const file of walkFiles(siteComponentsRoot)) {
    if (!isSource(file)) continue;
    const ownerId = siteNodeFor(file);
    if (ownerId && siteNodeIds.has(ownerId)) harvestSiteFile(file, ownerId);
  }

  // -------- pages --------
  const appDir = join(root, 'website/src/app');
  const routeDirs = [];
  (function walkRoutes(dir, route) {
    const entries = ls(dir);
    if (entries.includes('page.tsx')) routeDirs.push({ route: route === '' ? '/' : route, dir });
    for (const entry of entries) {
      const p = join(dir, entry);
      if (isDir(p)) walkRoutes(p, `${route}/${entry}`);
    }
  })(appDir, '');

  const routeSet = new Set(routeDirs.map((r) => r.dir));
  const sections = ['components', 'foundations', 'templates', 'work', 'writing', 'labs', 'docs', 'blueprints', 'skills'];
  const pageGroup = (route) => {
    if (route === '/') return 'root';
    const head = route.split('/')[1];
    return sections.includes(head) ? head : 'pages';
  };

  for (const { route } of routeDirs) {
    addNode({ id: `page/${route}`, label: route, col: 'pages', group: pageGroup(route) });
  }
  for (const { route, dir } of routeDirs) {
    const ownerId = `page/${route}`;
    const collect = (d) => {
      for (const entry of ls(d)) {
        const p = join(d, entry);
        if (isDir(p)) {
          if (!routeSet.has(p)) collect(p); // co-located folders belong to the route; subroutes own themselves
        } else if (isSource(p)) {
          harvestSiteFile(p, ownerId);
        }
      }
    };
    for (const entry of ls(dir)) {
      const p = join(dir, entry);
      if (isDir(p)) { if (!routeSet.has(p)) collect(p); }
      else if (isSource(p)) harvestSiteFile(p, ownerId);
    }
  }

  // -------- assemble, deterministically --------
  const sortedNodes = [...nodes.values()].sort((a, b) => a.id.localeCompare(b.id));
  const index = new Map(sortedNodes.map((n, i) => [n.id, i]));
  const edges = [...edgeMap.entries()]
    .map(([key, w]) => {
      const [s, t] = key.split('|');
      return [index.get(s), index.get(t), w];
    })
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  return {
    columns: COLUMNS,
    groupOrder: {
      primitives: ['neutral', 'true', 'teal', 'blue', 'green', 'orange', 'purple', 'red', 'yellow', 'gap', 'padding', 'radius', 'border', 'icon'],
      tokens: Object.keys(tokenRegistry.categories),
      site: ['site'],
      pages: ['root', 'pages', 'docs', 'foundations', 'components', 'templates', 'work', 'writing', 'blueprints', 'skills', 'labs'],
    },
    nodes: sortedNodes,
    edges,
  };
}

/** The full generated-file text, LF line endings. */
export function buildDependencyGraphFile() {
  const graph = buildGraph();
  return [
    '// AUTO-GENERATED — do not edit by hand.',
    '// Source of truth: the token and component registries, the token and component',
    '// CSS, and the import statements in website/src (parsed, not declared).',
    '// Regenerate: node scripts/generate-dependency-graph.mjs (runs via predev/prebuild).',
    '',
    "export type GraphColumnId = 'primitives' | 'tokens' | 'library' | 'site' | 'pages';",
    '',
    'export interface GraphSourceNode {',
    '  id: string;',
    '  label: string;',
    '  col: GraphColumnId;',
    '  group: string;',
    '  description?: string;',
    '  value?: string;',
    '  light?: string;',
    '  dark?: string;',
    '}',
    '',
    '/** The whole graph; edges are [source index, target index, use count] into nodes. */',
    'export const graphSource: {',
    '  columns: { id: GraphColumnId; label: string; sub: string }[];',
    '  groupOrder: Record<string, string[]>;',
    '  nodes: GraphSourceNode[];',
    '  edges: [number, number, number][];',
    `} = ${JSON.stringify(graph)};`,
    '',
  ].join('\n');
}

// -------- CLI --------
const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  const [, , command, ...queryParts] = process.argv;
  if (command === 'tree' || command === 'who-uses') {
    const graph = buildGraph();
    const query = queryParts.join(' ').toLowerCase();
    const match = graph.nodes.find((n) => n.label.toLowerCase() === query || n.id.toLowerCase() === query)
      || graph.nodes.find((n) => n.label.toLowerCase().includes(query));
    if (!match) {
      console.error(`No node matches "${query}".`);
      process.exit(1);
    }
    const forward = command === 'tree';
    const adj = new Map();
    for (const [si, ti] of graph.edges) {
      const from = forward ? graph.nodes[si].id : graph.nodes[ti].id;
      const to = forward ? graph.nodes[ti].id : graph.nodes[si].id;
      if (!adj.has(from)) adj.set(from, []);
      adj.get(from).push(to);
    }
    const byId = new Map(graph.nodes.map((n) => [n.id, n]));
    const seen = new Set([match.id]);
    const print = (id, depth) => {
      const n = byId.get(id);
      console.log(`${'  '.repeat(depth)}${depth ? '- ' : ''}${n.label}  (${n.col})`);
      if (depth >= 4) return;
      for (const next of (adj.get(id) || []).sort()) {
        if (seen.has(next)) continue;
        seen.add(next);
        print(next, depth + 1);
      }
    };
    print(match.id, 0);
  } else {
    const content = buildDependencyGraphFile();
    writeFileSync(outputPath, content);
    const graph = buildGraph();
    console.log(`✓ Generated dependency graph: ${graph.nodes.length} nodes, ${graph.edges.length} edges.`);
  }
}
