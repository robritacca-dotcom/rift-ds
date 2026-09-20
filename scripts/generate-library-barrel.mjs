#!/usr/bin/env node
/**
 * Generates the package's barrel entries from src/components/registry.json,
 * the single source of truth for the public component list. Never
 * hand-edit src/index.ts or src/charts.ts.
 *
 *   - src/index.ts — every public component EXCEPT modules that import
 *     recharts. recharts is an optional peer dependency, and a bundler
 *     resolving the main barrel must never be forced to resolve it.
 *   - src/charts.ts — the recharts-backed modules (detected by reading
 *     each module's imports, so a new chart lands here automatically).
 *     Consumers who install recharts import from
 *     '@robr0/design-system/charts'.
 *
 * Each public component folder contributes every non-story .tsx module
 * it contains (usually just <Name>/<Name>.tsx; Chart/ contributes each
 * chart implementation). Doc-only helpers are excluded — they stay
 * reachable via the ./components/* subpath export but are not part of
 * the headline API.
 *
 * Runs in the validate-registry chain, so CI's drift guard fails if a
 * registry change lands without the regenerated barrels.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const componentsDir = join(repoRoot, 'src', 'components');

const registry = JSON.parse(readFileSync(join(componentsDir, 'registry.json'), 'utf8'));

const importsRecharts = (path) =>
  /from\s+['"]recharts['"]/.test(readFileSync(path, 'utf8'));

const mainLines = [];
const chartLines = [];

// The registry's `recharts` flag is how prose surfaces (the get-started
// snippet) know which charts export from which barrel — hold it to the
// actual imports, so a chart cannot change sides without the flag moving.
for (const c of registry.components) {
  const folder = c.folder ?? c.name;
  const actual = importsRecharts(join(componentsDir, folder, `${c.name}.tsx`));
  if (actual !== Boolean(c.recharts)) {
    console.error(
      `✗ Barrel generation failed: ${c.name} ${actual ? 'imports' : 'does not import'} recharts ` +
        `but its registry entry says recharts: ${Boolean(c.recharts)} — update src/components/registry.json`,
    );
    process.exit(1);
  }
}

// Components sharing an implementation folder (`folder` field — the
// recharts wrapper set in Chart/) contribute that folder's modules
// exactly once.
const componentFolders = [
  ...new Set(registry.components.map((c) => c.folder ?? c.name)),
].sort((a, b) => a.localeCompare(b));
for (const name of componentFolders) {
  const modules = readdirSync(join(componentsDir, name))
    .filter((f) => f.endsWith('.tsx') && !f.endsWith('.stories.tsx'))
    .sort();
  if (modules.length === 0) {
    console.error(`✗ Barrel generation failed: ${name} has no implementation .tsx file`);
    process.exit(1);
  }
  for (const file of modules) {
    const line = `export * from './components/${name}/${file.replace(/\.tsx$/, '')}';`;
    (importsRecharts(join(componentsDir, name, file)) ? chartLines : mainLines).push(line);
  }
}

const banner = (which) => `/**
 * GENERATED FILE — do not edit.
 * Built from src/components/registry.json by scripts/generate-library-barrel.mjs
 * (validate-registry chain). ${which}
 */
`;

const registryExports = `
export {
  componentRegistry,
  componentMetadata,
  componentCategories,
  componentCategoryMetadata,
  COMPONENT_COUNT,
} from './components/registry';
export type { ComponentMeta, ComponentCategoryMeta } from './components/registry';
export { tokenRegistry, TOKEN_COUNT, TOKEN_COUNTS } from './tokens/registry';
`;

const write = (file, content, label) => {
  const target = join(repoRoot, 'src', file);
  let current = null;
  try {
    current = readFileSync(target, 'utf8');
  } catch {
    /* first generation */
  }
  if (current !== content) {
    writeFileSync(target, content);
    console.log(`✓ Generated src/${file} (${label}).`);
  } else {
    console.log(`✓ src/${file} up to date (${label}).`);
  }
};

write(
  'index.ts',
  banner('recharts-backed modules live in charts.ts, not here — recharts is an optional peer.') +
    mainLines.join('\n') +
    '\n' +
    registryExports,
  `${mainLines.length} module exports`
);
write(
  'charts.ts',
  banner('The recharts-backed components; requires the optional recharts peer dependency.') +
    chartLines.join('\n') +
    '\n',
  `${chartLines.length} chart module exports`
);
