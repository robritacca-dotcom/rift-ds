#!/usr/bin/env node
/**
 * validate-chat-widget.mjs
 *
 * Holds the chat widget's registry (src/chat/registry.json) to the things it
 * describes, so the one widget the package ships can never be documented as
 * something other than what it is. The widget sits between the components
 * and the templates and has registries on both sides to agree with:
 *
 *   1. `parts` is exactly the set of registered components the widget's own
 *      modules import (src/components/registry.json names, read from the
 *      `../components/<Folder>/<Name>` imports in src/chat/ outside the demo
 *      and the stories), in both directions: a part that nothing imports is
 *      a claim the code contradicts, and a component the widget starts
 *      composing cannot stay out of the anatomy the component page draws.
 *   2. Every key in `subpaths` is a SUBPATHS row in
 *      scripts/package-manifest.mjs, and every explicit `./chat*` subpath the
 *      manifest declares is in the registry (both directions).
 *   3. Every package in `peers` is an optional peer dependency in
 *      package.json (declared, and marked optional), and every optional peer
 *      the chat subpaths import is listed for the subpath that imports it.
 *   4. The main barrel's import closure never reaches src/chat or any
 *      optional peer (OPTIONAL_PEER_PACKAGES in generate-library-barrel.mjs):
 *      a consumer who installed none of them must still build.
 *   5. The two numbers the stylesheet mirrors from the TypeScript side agree:
 *      TAKEOVER_QUERY's width against the panel's phone media query in
 *      ChatWidget.css, and DOCK_MIN_WIDTH against the --ds-chat-width default;
 *      and the rail thresholds design.md states (threads, the trailing seat,
 *      the width under which the threads rail yields, the artifact grip's
 *      column floor) are the ones queries.ts holds, the last also against
 *      the stylesheet's flex basis.
 *   6. The surfaces that document the widget exist: its page under
 *      website/src/app/components/<slug>/ (the props and every option, held
 *      to the component page rules by validate-website-surfaces.mjs), the
 *      docs page website/src/app/docs/chat/page.tsx (how to add it) and a
 *      `### ChatWidget` section in design.md; and its `category` is a
 *      registered component category, since its page joins that section.
 *   7. Every `documented` export is a component the barrel exports.
 *   8. The init bin's templates (src/cli/templates/chat/, app/ and blocks/) import only
 *      package subpaths the manifest declares, so `npx rift-ds init chat`
 *      can never scaffold an import that does not resolve; and every file
 *      under the templates folder is tracked by git, because the tarball is
 *      built from the working tree while CI and the release build from a
 *      checkout. The scaffold's env example is a dotfile the root `.env.*`
 *      ignore rule would swallow (it did, on 2026-10-13: the local smoke
 *      passed and CI could not open the file), so this check fails locally
 *      for exactly the file a consumer would never receive.
 *   9. The docs page (website/src/app/docs/chat/page.tsx) states
 *      what the command writes and which env it reads: its SCAFFOLD_FILES
 *      list is held to the template files and its ENV_VARS names to
 *      .env.chat.example, in both directions, so a template added or an env
 *      renamed cannot leave the page describing a scaffold that no longer
 *      exists.
 *  10. The root layout get-started shows (LAYOUT_SNIPPET) is the one
 *      `init app` prints, line for line, so a first-time user is never
 *      handed two different layouts.
 *
 * Part of the validate-registry chain.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { OPTIONAL_PEER_PACKAGES } from './optional-peers.mjs';
import { PACKAGE_NAME, sourceExports } from './package-manifest.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
const posix = (path) => path.split('\\').join('/');

const registry = JSON.parse(read(join(repoRoot, 'src', 'chat', 'registry.json')));
const components = JSON.parse(read(join(repoRoot, 'src', 'components', 'registry.json')));
const pkg = JSON.parse(read(join(repoRoot, 'package.json')));
const exportsMap = sourceExports();

const errors = [];

/* Relative imports only: a bare specifier is a package, and the question each
   closure walk answers is which packages a module reaches. */
/* Type-only imports are erased at build time and pull nothing in, so they are
   left out of the walk: the upstash module reads the handler's types without
   reaching the Anthropic SDK. */
const IMPORT_RE =
  /(?:^|\n)\s*(?:import|export)\s(?!type\s)[^;]*?from\s+['"]([^'"]+)['"]|(?:^|\n)\s*import\s+['"]([^'"]+)['"]/g;

if (!Array.isArray(registry.widgets) || registry.widgets.length === 0) {
  errors.push('src/chat/registry.json has no widgets');
}

const componentNames = new Set(components.components.map((c) => c.name));

for (const widget of registry.widgets ?? []) {
  const at = `widget "${widget.name}"`;
  for (const field of ['name', 'slug', 'label', 'description', 'command']) {
    if (typeof widget[field] !== 'string' || widget[field].trim() === '') {
      errors.push(`${at}: "${field}" must be a non-empty string`);
    }
  }
  if (!/^[a-z0-9-]+$/.test(widget.slug ?? '')) errors.push(`${at}: slug must be kebab-case`);
  if (widget.description && !widget.description.endsWith('.')) {
    errors.push(`${at}: description must end with a full stop`);
  }

  /* 1. Parts are the registered components the widget's modules import,
     both directions. The demo and the stories are not the widget: a demo
     card's chart or plan is content a reply carries, not the widget's
     anatomy, so those files are left out of the census. */
  for (const part of widget.parts ?? []) {
    if (!componentNames.has(part)) {
      errors.push(`${at}: part "${part}" is not in src/components/registry.json`);
    }
  }
  const composed = new Set();
  const widgetDir = join(repoRoot, 'src', 'chat');
  for (const file of readdirSync(widgetDir)) {
    if (!/\.tsx?$/.test(file) || /^demo|^DemoWelcome|\.stories\./.test(file)) continue;
    const source = read(join(widgetDir, file));
    for (const m of source.matchAll(/from '\.\.\/components\/[A-Za-z]+\/([A-Za-z]+)'/g)) {
      if (componentNames.has(m[1])) composed.add(m[1]);
    }
  }
  const parts = new Set(widget.parts ?? []);
  for (const name of composed) {
    if (!parts.has(name)) {
      errors.push(`${at}: the widget imports ${name} but "parts" does not list it`);
    }
  }
  for (const name of parts) {
    if (!composed.has(name)) {
      errors.push(`${at}: "parts" lists ${name} but no widget module imports it (the demo and stories do not count)`);
    }
  }

  /* 2. Subpaths, both directions. */
  const declared = Object.keys(widget.subpaths ?? {});
  for (const key of declared) {
    if (!(key in exportsMap)) {
      errors.push(`${at}: subpath "${key}" is not a SUBPATHS row in scripts/package-manifest.mjs`);
    }
  }
  for (const key of Object.keys(exportsMap)) {
    if (key.startsWith('./chat') && !declared.includes(key)) {
      errors.push(
        `scripts/package-manifest.mjs declares "${key}" but src/chat/registry.json does not list it under subpaths`
      );
    }
  }

  /* 3. Peers are optional peers, and the imports agree with the list. */
  const peerMeta = pkg.peerDependenciesMeta ?? {};
  for (const [subpath, peers] of Object.entries(widget.peers ?? {})) {
    if (!declared.includes(subpath)) {
      errors.push(`${at}: peers lists "${subpath}", which is not one of its subpaths`);
    }
    for (const peer of peers) {
      if (!pkg.peerDependencies?.[peer]) {
        errors.push(`${at}: peer "${peer}" (${subpath}) is not in package.json peerDependencies`);
      } else if (!peerMeta[peer]?.optional) {
        errors.push(`${at}: peer "${peer}" (${subpath}) must be marked optional in peerDependenciesMeta`);
      }
    }
    const entry = exportsMap[subpath];
    if (entry && /\.tsx?$/.test(entry)) {
      const imported = optionalPeersInClosure(join(repoRoot, entry));
      for (const peer of imported) {
        if (!peers.includes(peer)) {
          errors.push(
            `${at}: ${subpath} imports the optional peer "${peer}" but src/chat/registry.json does not list it under peers["${subpath}"]`
          );
        }
      }
    }
  }

  /* 7. Documented exports are exported by the barrel. */
  const barrel = read(join(repoRoot, 'src', 'chat', 'index.ts'));
  for (const name of widget.documented ?? []) {
    if (!new RegExp(`\\b${name}\\b`).test(barrel)) {
      errors.push(`${at}: documented export "${name}" is not exported from src/chat/index.ts`);
    }
    if (!existsSync(join(repoRoot, 'src', 'chat', `${name}.tsx`))) {
      errors.push(`${at}: documented export "${name}" has no src/chat/${name}.tsx (docgen reads it by that name)`);
    }
  }

  /* 6. The documenting surfaces exist, and the category is real. */
  if (!existsSync(join(repoRoot, 'website', 'src', 'app', 'components', widget.slug, 'page.tsx'))) {
    errors.push(`${at}: website/src/app/components/${widget.slug}/page.tsx does not exist`);
  }
  if (!existsSync(join(repoRoot, 'website', 'src', 'app', 'docs', 'chat', 'page.tsx'))) {
    errors.push(`${at}: website/src/app/docs/chat/page.tsx does not exist (how to add the chat)`);
  }
  if (!components.categories.some((category) => category.id === widget.category)) {
    errors.push(`${at}: category "${widget.category}" is not a category in src/components/registry.json`);
  }
  if (!read(join(repoRoot, 'design.md')).includes(`\n### ${widget.name}\n`)) {
    errors.push(`${at}: design.md has no "### ${widget.name}" section`);
  }
}

/* ---------------------------------------------------------------------------
 * Import closures. Relative imports only: a bare specifier is a package, and
 * the question each walk answers is which packages a module reaches.
 */

function resolveRelative(fromFile, spec) {
  const base = resolve(dirname(fromFile), spec);
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, join(base, 'index.ts')]) {
    if (existsSync(candidate) && !/\.css$/.test(candidate)) return candidate;
  }
  return null;
}

function walk(entry, visit) {
  const seen = new Set();
  const stack = [entry];
  while (stack.length > 0) {
    const file = stack.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    const text = read(file);
    for (const match of text.matchAll(IMPORT_RE)) {
      const spec = match[1] ?? match[2];
      if (!spec) continue;
      if (spec.startsWith('.')) {
        if (spec.endsWith('.css') || spec.endsWith('.json')) continue;
        const target = resolveRelative(file, spec);
        if (target) stack.push(target);
      } else {
        visit(spec, file);
      }
    }
  }
  return seen;
}

function optionalPeersInClosure(entry) {
  const found = new Set();
  walk(entry, (spec) => {
    const peer = OPTIONAL_PEER_PACKAGES.find((name) => spec === name || spec.startsWith(`${name}/`));
    if (peer) found.add(peer);
  });
  return [...found];
}

/* 4. The main barrel never reaches src/chat or an optional peer. */
{
  const chatDir = join(repoRoot, 'src', 'chat');
  const reached = walk(join(repoRoot, 'src', 'index.ts'), (spec, file) => {
    const peer = OPTIONAL_PEER_PACKAGES.find((name) => spec === name || spec.startsWith(`${name}/`));
    if (peer) {
      errors.push(
        `src/index.ts reaches the optional peer "${peer}" through ${posix(relative(repoRoot, file))}: ` +
          `the main barrel must build for a consumer who installed none of them`
      );
    }
  });
  for (const file of reached) {
    if (file.startsWith(chatDir)) {
      errors.push(
        `src/index.ts reaches ${posix(relative(repoRoot, file))}: the chat widget lives only in its own subpaths`
      );
    }
  }
}

/* 5. The stylesheet's mirrors of the TypeScript constants. */
{
  const queries = read(join(repoRoot, 'src', 'chat', 'queries.ts'));
  const placement = read(join(repoRoot, 'src', 'chat', 'placement.ts'));
  const css = read(join(repoRoot, 'src', 'chat', 'ChatWidget.css'));

  /* TAKEOVER_QUERY is built from the breakpoint module, so its width is
     read there. */
  const takeover = queries.includes('TAKEOVER_QUERY = mediaBelow(BREAKPOINT_CHAT_TAKEOVER_PX)')
    ? read(join(repoRoot, 'src', 'tokens', 'breakpoints.ts')).match(/BREAKPOINT_CHAT_TAKEOVER_PX = (\d+);/)
    : null;
  const cssTakeover = css.match(/@media \(max-width: (\d+)px\) \{\s*\n\s*\.ds-chat-launcher__panel \{/);
  if (!takeover || !cssTakeover) {
    errors.push('could not read TAKEOVER_QUERY or the panel\'s phone media query');
  } else if (takeover[1] !== cssTakeover[1]) {
    errors.push(
      `TAKEOVER_QUERY is ${takeover[1]}px but ChatWidget.css puts the panel in flow at ${cssTakeover[1]}px: the two must agree`
    );
  }

  const dockMin = placement.match(/DOCK_MIN_WIDTH = (\d+)/);
  const cssWidth = css.match(/--ds-chat-width: (\d+)px;/);
  if (!dockMin || !cssWidth) {
    errors.push('could not read DOCK_MIN_WIDTH or the --ds-chat-width default');
  } else if (dockMin[1] !== cssWidth[1]) {
    errors.push(
      `DOCK_MIN_WIDTH is ${dockMin[1]} but --ds-chat-width defaults to ${cssWidth[1]}px: the resting width is the drag's floor`
    );
  }

  const threads = queries.match(/THREADS_RAIL_MIN_WIDTH = (\d+)/);
  const aside = queries.match(/ASIDE_RAIL_MIN_WIDTH = (\d+)/);
  const spec = read(join(repoRoot, 'design.md'));
  if (threads && !spec.includes(`THREADS_RAIL_MIN_WIDTH\` (${threads[1]}px)`)) {
    errors.push(`design.md's ChatWidget section does not state THREADS_RAIL_MIN_WIDTH as ${threads[1]}px`);
  }
  if (aside && !spec.includes(`ASIDE_RAIL_MIN_WIDTH\` (${aside[1]}px)`)) {
    errors.push(`design.md's ChatWidget section does not state ASIDE_RAIL_MIN_WIDTH as ${aside[1]}px`);
  }
  /* The trailing seat's other two numbers: the width under which the
     threads rail yields, stated in the spec, and the floor both columns
     keep under the artifact's size grip, stated in the spec and mirrored
     by the stylesheet's flex basis for the conversation. */
  const withThreads = queries.match(/ASIDE_WITH_THREADS_MIN_WIDTH = (\d+)/);
  const columnFloor = queries.match(/ARTIFACT_MIN_COLUMN_WIDTH = (\d+)/);
  if (!withThreads || !columnFloor) {
    errors.push('could not read ASIDE_WITH_THREADS_MIN_WIDTH or ARTIFACT_MIN_COLUMN_WIDTH from src/chat/queries.ts');
  } else {
    if (!spec.includes(`ASIDE_WITH_THREADS_MIN_WIDTH\` (${withThreads[1]}px)`)) {
      errors.push(`design.md's ChatWidget section does not state ASIDE_WITH_THREADS_MIN_WIDTH as ${withThreads[1]}px`);
    }
    if (!spec.includes(`ARTIFACT_MIN_COLUMN_WIDTH\` (${columnFloor[1]}px)`)) {
      errors.push(`design.md's ChatWidget section does not state ARTIFACT_MIN_COLUMN_WIDTH as ${columnFloor[1]}px`);
    }
    const cssFloor = css.match(/\[data-artifact-sized\] > \.ds-chat-widget \{\s*flex: 1 0 (\d+)px;/);
    if (!cssFloor) {
      errors.push("could not read the sized conversation's flex basis from ChatWidget.css");
    } else if (cssFloor[1] !== columnFloor[1]) {
      errors.push(
        `ARTIFACT_MIN_COLUMN_WIDTH is ${columnFloor[1]} but ChatWidget.css floors the sized conversation at ${cssFloor[1]}px: the two must agree`
      );
    }
  }
}

/* 8. The scaffold templates import only subpaths that exist. Every one of
   the init bin's scaffolds rides beside it the same way, `init chat`'s,
   `init app`'s and the blocks `init block` copies, so all are held here
   (the blocks' own registry and closure are validate-blocks.mjs's). */
for (const scaffoldName of ['chat', 'app', 'blocks']) {
  const templatesDir = join(repoRoot, 'src', 'cli', 'templates', scaffoldName);
  if (!existsSync(templatesDir)) {
    errors.push(`src/cli/templates/${scaffoldName}/ does not exist (the init bin's ${scaffoldName} scaffold)`);
  } else {
    const files = [];
    const collect = (dir) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) collect(full);
        else files.push(full);
      }
    };
    collect(templatesDir);
    const tracked = new Set(
      execFileSync('git', ['ls-files', '--', posix(relative(repoRoot, templatesDir))], {
        cwd: repoRoot,
        encoding: 'utf8',
      })
        .split('\n')
        .filter(Boolean)
    );
    for (const file of files) {
      const rel = posix(relative(repoRoot, file));
      if (!tracked.has(rel)) {
        errors.push(`${rel} is not tracked by git (an ignore rule?), so CI and the release tarball will not have it`);
      }
    }
    const specifierRe = new RegExp(`from\\s+['"](${PACKAGE_NAME.replace('/', '\\/')}(?:\\/[^'"]+)?)['"]`, 'g');
    for (const file of files) {
      for (const match of read(file).matchAll(specifierRe)) {
        const subpath = match[1] === PACKAGE_NAME ? '.' : `.${match[1].slice(PACKAGE_NAME.length)}`;
        // An exact key, or a wildcard one (`./components/*`) the subpath fits.
        const exported =
          subpath in exportsMap ||
          Object.keys(exportsMap).some((key) => {
            if (!key.includes('*')) return false;
            const [head, tail] = key.split('*');
            return subpath.startsWith(head) && subpath.endsWith(tail) && subpath.length > head.length + tail.length;
          });
        if (!exported) {
          errors.push(
            `${posix(relative(repoRoot, file))} imports "${match[1]}", which is not a subpath the package exports`
          );
        }
      }
    }
  }
}

/* 9. The full-install page mirrors the scaffold's file list and env names. */
{
  const templatesDir = join(repoRoot, 'src', 'cli', 'templates', 'chat');
  const pagePath = join(repoRoot, 'website', 'src', 'app', 'docs', 'chat', 'page.tsx');
  if (!existsSync(pagePath)) {
    errors.push('website/src/app/docs/chat/page.tsx does not exist (how to add the chat)');
  } else if (existsSync(templatesDir)) {
    const page = read(pagePath);
    const templateFiles = [];
    const collect = (dir) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) collect(full);
        else templateFiles.push(posix(relative(templatesDir, full)));
      }
    };
    collect(templatesDir);
    const listMatch = page.match(/SCAFFOLD_FILES\s*=\s*\[([^\]]*)\]/);
    const listed = listMatch ? [...listMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]) : [];
    if (!listMatch) errors.push('docs/chat/page.tsx has no SCAFFOLD_FILES list');
    for (const file of templateFiles) {
      if (!listed.includes(file)) errors.push(`docs/chat/page.tsx SCAFFOLD_FILES is missing template "${file}"`);
    }
    for (const file of listed) {
      if (!templateFiles.includes(file)) errors.push(`docs/chat/page.tsx SCAFFOLD_FILES lists "${file}", which src/cli/templates/chat/ does not hold`);
    }
    const envExample = read(join(templatesDir, '.env.chat.example'));
    const envNames = [...envExample.matchAll(/^([A-Z][A-Z0-9_]*)=/gm)].map((m) => m[1]);
    const envMatch = page.match(/ENV_VARS\s*=\s*\[([\s\S]*?)\n\];/);
    const pageEnv = envMatch ? [...envMatch[1].matchAll(/name:\s*"([A-Z][A-Z0-9_]*)"/g)].map((m) => m[1]) : [];
    if (!envMatch) errors.push('docs/chat/page.tsx has no ENV_VARS table');
    for (const name of envNames) {
      if (!pageEnv.includes(name)) errors.push(`docs/chat/page.tsx ENV_VARS is missing "${name}" from .env.chat.example`);
    }
    for (const name of pageEnv) {
      if (!envNames.includes(name)) errors.push(`docs/chat/page.tsx ENV_VARS lists "${name}", which .env.chat.example does not set`);
    }
  }
}

/* 10. The root layout `init app` prints and the one get-started shows are
   the same layout. The page's LAYOUT_SNIPPET is a hand mirror of the
   lines initApp prints, read here with the package name and the default
   components/rift path filled in, so the terminal and the page cannot
   hand a first-time user two different files. */
{
  const initSource = read(join(repoRoot, 'src', 'cli', 'init.mjs'));
  const printed = initSource.match(/for \(const line of \[\n([\s\S]*?)\n {2}\]\) \{/);
  const pageSource = read(join(repoRoot, 'website', 'src', 'app', 'docs', 'get-started', 'page.tsx'));
  const shown = pageSource.match(/const LAYOUT_SNIPPET = `([\s\S]*?)`;/);
  if (!printed || !shown) {
    errors.push('could not find the layout initApp prints (src/cli/init.mjs) or LAYOUT_SNIPPET (docs/get-started/page.tsx)');
  } else {
    const fromInit = [...printed[1].matchAll(/^\s+`(.*)`,$/gm)].map((m) =>
      m[1].replaceAll('${PACKAGE_NAME}', PACKAGE_NAME).replaceAll('${rift}', '../components/rift')
    );
    const fromPage = shown[1].split('\n').filter((line) => !line.startsWith('// '));
    if (fromInit.join('\n') !== fromPage.join('\n')) {
      errors.push('get-started LAYOUT_SNIPPET does not match the root layout `init app` prints (src/cli/init.mjs initApp); change them together');
    }
  }
}

if (errors.length > 0) {
  console.error(`✗ Chat widget registry invalid:\n` + errors.map((e) => `    - ${e}`).join('\n'));
  process.exit(1);
}

const widget = registry.widgets[0];
console.log(
  `✓ Chat widget: ${widget.name} composes ${widget.parts.length} registered components across ` +
    `${Object.keys(widget.subpaths).length} subpaths; main barrel clean of src/chat and optional peers; ` +
    `CSS mirrors agree; scaffold imports resolve; the docs page mirrors the scaffold.`
);
