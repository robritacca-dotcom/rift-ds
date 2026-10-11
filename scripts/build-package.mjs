#!/usr/bin/env node
/**
 * Builds the publishable package into dist/ (`npm run build:lib`):
 *   1. vite build --config vite.lib.config.ts (JS + d.ts, one module
 *      per source file — see that config's header comment)
 *   2. copies the runtime assets the emitted JS references verbatim:
 *      every non-story .css under src/, the icon font and the presets'
 *      faces, and the registry JSON files
 *   3. writes dist/bin/<BIN_NAME>.mjs — the init bin, with the site
 *      origin, library skill folder and MCP server name stamped in from
 *      scripts/brand.mjs and the executable bit set (publint checks the
 *      shebang and the bit)
 *   4. writes dist/package.json — the manifest that actually ships to
 *      npm (dist-form exports, no `private`, no scripts) — plus
 *      LICENSE and README.md
 *
 * Publishing always happens FROM dist/, never from the repo root.
 */
import { execSync } from 'node:child_process';
import {
  chmodSync,
  copyFileSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BIN_NAME, MCP_SERVER_NAME, SITE_URL, SKILL_NAME } from './brand.mjs';
import { distManifest } from './package-manifest.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(repoRoot, 'src');
const distDir = join(repoRoot, 'dist');

console.log('▸ Building library (vite + dts)…');
execSync('npx vite build --config vite.lib.config.ts', { cwd: repoRoot, stdio: 'inherit' });

const collect = (dir, predicate, out = []) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) collect(path, predicate, out);
    else if (predicate(entry.name)) out.push(path);
  }
  return out;
};

const assets = [
  ...collect(srcDir, (name) => name.endsWith('.css') && !name.includes('.stories.')),
  ...collect(join(srcDir, 'fonts'), (name) => name.endsWith('.woff2')),
  join(srcDir, 'components', 'registry.json'),
  join(srcDir, 'tokens', 'registry.json'),
];

for (const asset of assets) {
  const target = join(distDir, relative(srcDir, asset));
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(asset, target);
}
console.log(`▸ Copied ${assets.length} runtime assets (css, fonts, registries).`);

// Vite's react plugin drops "use client" directives during the lib
// build, so restore them in dist from what the source declares — a
// Next.js App Router consumer needs the directive on every interactive
// module, or importing one from a Server Component throws. The registry
// cross-check keeps this step honest: a `client: true` component whose
// built module ends up unmarked fails the build.
const sourceModules = collect(srcDir, (name) => /\.(ts|tsx)$/.test(name) && !name.includes('.stories.'));
const clientDistFiles = [];
for (const sourceFile of sourceModules) {
  const firstLine = readFileSync(sourceFile, 'utf8').split('\n', 1)[0].trim();
  if (!/^(['"])use client\1;?$/.test(firstLine)) continue;
  const distFile = join(distDir, relative(srcDir, sourceFile)).replace(/\.tsx?$/, '.js');
  const built = readFileSync(distFile, 'utf8');
  if (!built.startsWith('"use client"')) writeFileSync(distFile, `"use client";\n${built}`);
  clientDistFiles.push(relative(distDir, distFile));
}
const registry = JSON.parse(readFileSync(join(srcDir, 'components', 'registry.json'), 'utf8'));
const unmarked = registry.components.filter((c) => {
  if (!c.client) return false;
  const folder = c.folder ?? c.name;
  return !clientDistFiles.includes(join('components', folder, `${c.name}.js`));
});
if (unmarked.length > 0) {
  console.error(`✗ client components missing "use client" in dist: ${unmarked.map((c) => c.name).join(', ')}`);
  process.exit(1);
}
console.log(`▸ Restored "use client" on ${clientDistFiles.length} dist modules.`);

// The init bin. The site origin, skill folder and MCP server name are
// stamped in from scripts/brand.mjs — the one home for brand facts — so
// the CLI can never fetch from a domain the site no longer lives at.
// Which skills it installs is not stamped: it reads the site's
// /skill/manifest.json at run time (SKILL_NAME is only the default for
// the deprecated --out flag). Executable bit
// and shebang are what publint checks a bin for.
const binSource = readFileSync(join(srcDir, 'cli', 'init.mjs'), 'utf8');
const binTarget = join(distDir, 'bin', `${BIN_NAME}.mjs`);
mkdirSync(dirname(binTarget), { recursive: true });
writeFileSync(
  binTarget,
  binSource
    .replaceAll('__SITE_URL__', SITE_URL)
    .replaceAll('__SKILL_NAME__', SKILL_NAME)
    .replaceAll('__MCP_SERVER_NAME__', MCP_SERVER_NAME)
);
chmodSync(binTarget, 0o755);
console.log(`▸ Wrote bin/${BIN_NAME}.mjs (brand facts stamped).`);

const rootPkg = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8'));
writeFileSync(join(distDir, 'package.json'), JSON.stringify(distManifest(rootPkg), null, 2) + '\n');
copyFileSync(join(repoRoot, 'LICENSE'), join(distDir, 'LICENSE'));
copyFileSync(join(repoRoot, 'README.md'), join(distDir, 'README.md'));

console.log('✓ Package built — publish from dist/ (npm publish --access public).');
