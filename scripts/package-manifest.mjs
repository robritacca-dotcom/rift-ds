#!/usr/bin/env node
/**
 * PACKAGE MANIFEST — the single source of truth for the published
 * package's identity and public import surface.
 *
 * The exports map exists in two forms derived from SUBPATHS below:
 *   - source form: targets under ./src, mirrored by hand into the root
 *     package.json so the website workspace (and Storybook) consume the
 *     exact specifiers a consumer would, resolved against live source.
 *   - dist form: targets under the built output, written into
 *     dist/package.json by build-package.mjs — that manifest is what
 *     actually ships to npm.
 *
 * A subpath has three homes: SUBPATHS here, the root package.json
 * exports (copy sourceExports() in after editing SUBPATHS), and the lib
 * entry list in vite.lib.config.ts, which decides what the dist build
 * emits. scripts/validate-package-exports.mjs (validate-registry chain)
 * fails the build if any of the three disagree or a target is missing,
 * so SUBPATHS is the one to edit and the other two are checked copies.
 */

export const PACKAGE_NAME = '@robr0/design-system';
export const PACKAGE_VERSION = '0.21.0';
export const PACKAGE_DESCRIPTION =
  'An AI-ready React design system: accessible components on composable tokens, light/dark theming, and CSS-variable overrides.';
export const REPOSITORY_URL = 'https://github.com/robritacca-dotcom/design-system';

/**
 * Public subpaths. `srcJs` entries get types+import conditions in the
 * dist form; `asset` entries map through verbatim (CSS, fonts).
 * Wildcards (*) match multi-segment paths, so
 * "@robr0/design-system/components/Button/Button" resolves deep imports.
 */
const SUBPATHS = [
  { key: '.', srcJs: './src/index.ts', dist: './index' },
  { key: './charts', srcJs: './src/charts.ts', dist: './charts' },
  { key: './components/registry', srcJs: './src/components/registry.ts', dist: './components/registry' },
  // Demo data for the Avatar docs (a .ts module, so the *.tsx wildcard
  // below can't serve it — it needs its own subpath).
  { key: './components/Avatar/demoAvatars', srcJs: './src/components/Avatar/demoAvatars.ts', dist: './components/Avatar/demoAvatars' },
  // ShaderField's headless renderer, for a consumer who wants the WebGL
  // lifetime without the component's canvas. A .ts module, so the *.tsx
  // wildcard below can't serve it either.
  { key: './components/ShaderField/useShaderField', srcJs: './src/components/ShaderField/useShaderField.ts', dist: './components/ShaderField/useShaderField' },
  // StreamingText's headless pacing engine, for a consumer whose streamed
  // text needs its own renderer (markdown, a highlighter). A .ts module,
  // so the *.tsx wildcard below can't serve it either.
  { key: './components/StreamingText/useStreamReveal', srcJs: './src/components/StreamingText/useStreamReveal.ts', dist: './components/StreamingText/useStreamReveal' },
  // The one published behavior: the shared page scroll lock. Host chrome
  // with its own overlays must join the modal components' counter, or two
  // locks fight over document.body — the rest of src/behaviors stays
  // internal (design.md's Components intro owns the contract).
  { key: './behaviors/useScrollLock', srcJs: './src/behaviors/useScrollLock.ts', dist: './behaviors/useScrollLock' },
  { key: './tokens/registry', srcJs: './src/tokens/registry.ts', dist: './tokens/registry' },
  // The JS-timing constants — the TypeScript side of the motion tokens,
  // for timers a CSS variable cannot reach.
  { key: './tokens/motion', srcJs: './src/tokens/motion.ts', dist: './tokens/motion' },
  { key: './components/*', srcJs: './src/components/*.tsx', dist: './components/*' },
  { key: './tokens/*.css', asset: './src/tokens/*.css', dist: './tokens/*.css' },
  { key: './fonts/*', asset: './src/fonts/*', dist: './fonts/*' },
  { key: './package.json', asset: './package.json', dist: './package.json' },
];

/** Exports map pointing at ./src — lives in the root package.json. */
export function sourceExports() {
  const map = {};
  for (const { key, srcJs, asset } of SUBPATHS) {
    map[key] = srcJs ?? asset;
  }
  return map;
}

/** Exports map for dist/package.json — paths relative to dist/. */
export function distExports() {
  const map = {};
  for (const { key, srcJs, dist } of SUBPATHS) {
    map[key] = srcJs
      ? { types: `${dist}.d.ts`, import: `${dist}.js` }
      : dist;
  }
  return map;
}

/** The manifest that ships to npm (written to dist/package.json). */
export function distManifest(rootPkg) {
  return {
    name: PACKAGE_NAME,
    version: PACKAGE_VERSION,
    description: PACKAGE_DESCRIPTION,
    license: rootPkg.license,
    repository: { type: 'git', url: `git+${REPOSITORY_URL}.git` },
    homepage: 'https://robertritacca.com',
    keywords: [
      'react',
      'design-system',
      'component-library',
      'design-tokens',
      'css-variables',
      'dark-mode',
      'typescript',
      'ai-ready',
      'ai-agents',
      'claude-code',
      'composable',
    ],
    type: 'module',
    sideEffects: ['**/*.css'],
    // The one command: `npx @robr0/design-system init` (a single bin, so
    // bare npx resolves it). Source lives at src/cli/init.mjs;
    // build-package.mjs stamps the site origin and sets the executable bit.
    bin: { 'robr0-design-system': './bin/robr0-design-system.mjs' },
    exports: distExports(),
    peerDependencies: rootPkg.peerDependencies,
    peerDependenciesMeta: rootPkg.peerDependenciesMeta,
  };
}
