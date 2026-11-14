#!/usr/bin/env node
/**
 * validate-shell-recipe.mjs — every app shell is drawn from one recipe.
 *
 * The three app shell modes (flush, floating, inset) are defined once, in
 * src/behaviors/shell.css: a host marks its root with data-ds-shell and
 * reads the recipe's --ds-shell-* properties instead of restating a token.
 * Four shells drifted apart before the recipe existed (design.md's App
 * shells section owns the story; the dated decision is in the local HISTORY.md), and
 * nothing but this script stops a fifth. It checks:
 *
 *   1. Every library file that writes the data-ds-shell marker imports the
 *      recipe (shell.css), so the properties it marks for exist wherever
 *      the component renders. A site or block host gets the recipe through
 *      AppSidebar, which imports it, so it is held to check 2 instead.
 *   2. Every host (a file writing data-ds-shell, in the library, the site
 *      or the CLI's block templates) has a stylesheet beside it, imported
 *      by it, that reads at least one --ds-shell-* property: a host that
 *      marks itself and then draws its own values has opted out of the
 *      recipe while claiming it.
 *   3. Every --ds-shell-* property read anywhere is declared, in the recipe
 *      or as one of the gap properties another stylesheet owns
 *      (HOSTED_PROPERTIES), so a misspelt property never silently falls
 *      back to nothing.
 *   4. The shell hosts' stylesheets (SHELL_STYLESHEETS) never restate the
 *      recipe's plane, surface, glass or raised-edge tokens outside a
 *      var(--ds-shell-…, …) fallback: the recipe is their one source, and a
 *      restated value drifts the first time either side changes. Sanctioned
 *      lines are listed in SANCTIONED with a reason.
 *
 * Runs in the validate-registry chain: it reads source files only.
 */
import { readdirSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isLocalPath } from './local-labs.mjs';
import { read } from './lib/fs.mjs';
import { failStep, finish } from './lib/report.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const rel = (path) => relative(root, path).replaceAll('\\', '/');

const RECIPE = join(root, 'src', 'behaviors', 'shell.css');

/** Gap properties declared outside the recipe, by the stylesheet that owns the value. */
const HOSTED_PROPERTIES = {
  '--ds-shell-inset': 'src/components/AppSidebar/AppSidebar.css',
};

/** The shell hosts' stylesheets, held to check 4. */
const SHELL_STYLESHEETS = [
  'src/components/AppLayout/AppLayout.css',
  'src/components/AppSidebar/AppSidebar.css',
  'website/src/components/templates/TemplateShell/TemplateShell.module.css',
  'src/cli/templates/blocks/components/blocks/AppShell.module.css',
];

/** The recipe's tokens a host reads through it, never directly. */
const RECIPE_TOKENS = ['--color-bg-app-shell', '--color-bg-app-surface', '--color-bg-glass', '--shadow-floating'];

/** Lines allowed to name a recipe token directly, as `file: substring` with the reason. */
const SANCTIONED = [
  {
    file: 'src/components/AppSidebar/AppSidebar.css',
    line: 'box-shadow: var(--shadow-floating);',
    reason: "the phone menu button's own lift, a floating control rather than a shell edge",
  },
];

const errors = [];

function walk(dir, keep, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const path = join(dir, entry.name);
    if (isLocalPath(rel(path))) continue;
    if (entry.isDirectory()) walk(path, keep, out);
    else if (keep(entry.name)) out.push(path);
  }
  return out;
}

if (!existsSync(RECIPE)) {
  console.error('✗ Shell recipe validation failed:\n  - src/behaviors/shell.css is missing');
  failStep();
}
const recipe = read(RECIPE);
const declared = new Set([...recipe.matchAll(/(--ds-shell-[\w-]+)\s*:/g)].map((m) => m[1]));
for (const [name, owner] of Object.entries(HOSTED_PROPERTIES)) {
  const ownerPath = join(root, owner);
  if (!existsSync(ownerPath) || !new RegExp(`${name}\\s*:`).test(read(ownerPath))) {
    errors.push(`${owner} no longer declares ${name}; move the declaration to its new home and update HOSTED_PROPERTIES`);
  }
  declared.add(name);
}

const sources = [join(root, 'src'), join(root, 'website', 'src')];
const scripts = sources.flatMap((dir) => walk(dir, (name) => /\.tsx?$/.test(name)));
const styles = sources.flatMap((dir) => walk(dir, (name) => name.endsWith('.css')));

// 1 and 2: the hosts.
let hosts = 0;
for (const file of scripts) {
  const text = read(file);
  if (!/data-ds-shell[=\s'"]/.test(text) || /\.stories\.tsx?$/.test(file)) continue;
  hosts += 1;
  const imports = [...text.matchAll(/import\s+(?:[\w{}\s,*]+from\s+)?['"]([^'"]+\.css)['"]/g)].map((m) => m[1]);
  const library = rel(file).startsWith('src/') && !rel(file).startsWith('src/cli/');
  if (library && !imports.some((spec) => spec.endsWith('/shell.css'))) {
    errors.push(`${rel(file)} writes data-ds-shell but does not import src/behaviors/shell.css`);
  }
  const ownSheets = imports
    .filter((spec) => spec.startsWith('.') && !spec.endsWith('/shell.css'))
    .map((spec) => join(dirname(file), spec))
    .filter((path) => existsSync(path));
  if (!ownSheets.some((path) => /var\(--ds-shell-/.test(read(path)))) {
    errors.push(`${rel(file)} writes data-ds-shell but no stylesheet it imports reads a --ds-shell-* property; draw the mode from the recipe`);
  }
}
if (hosts === 0) errors.push('no file writes data-ds-shell; the recipe has no hosts, so this check guards nothing');

// 3: every property read is declared.
let reads = 0;
for (const file of styles) {
  for (const match of read(file).matchAll(/var\((--ds-shell-[\w-]+)/g)) {
    reads += 1;
    if (!declared.has(match[1])) errors.push(`${rel(file)} reads ${match[1]}, which neither the recipe nor HOSTED_PROPERTIES declares`);
  }
}

// 4: the shell hosts never restate the recipe's tokens.
for (const sheet of SHELL_STYLESHEETS) {
  const path = join(root, sheet);
  if (!existsSync(path)) {
    errors.push(`${sheet} is listed in SHELL_STYLESHEETS but does not exist`);
    continue;
  }
  read(path)
    .split('\n')
    .forEach((line, index) => {
      if (line.trim().startsWith('/*') || line.trim().startsWith('*')) return;
      for (const token of RECIPE_TOKENS) {
        if (!line.includes(`var(${token})`)) continue;
        const asFallback = new RegExp(`var\\(--ds-shell-[\\w-]+,\\s*var\\(${token}\\)`).test(line);
        const sanctioned = SANCTIONED.some((s) => s.file === sheet && line.includes(s.line));
        if (!asFallback && !sanctioned) {
          errors.push(`${sheet}:${index + 1} restates ${token}; read the shell recipe's property instead (src/behaviors/shell.css)`);
        }
      }
    });
}

finish(
  '✗ Shell recipe validation failed:',
  errors,
  `✓ Shell recipe holds — ${hosts} hosts mark data-ds-shell and read the recipe, ${reads} --ds-shell-* reads all declared, ${SHELL_STYLESHEETS.length} host stylesheets restate none of its tokens.`
);
