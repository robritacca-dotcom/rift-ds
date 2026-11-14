#!/usr/bin/env node
/**
 * generate-preset-stylesheets.mjs
 *
 * Writes src/tokens/presets/ — every theme preset as a shippable
 * stylesheet, so one `data-brand` attribute on <html> rethemes an entire
 * site or app end to end, light and dark, with zero runtime JavaScript:
 *
 *   - one <id>.css per preset in THEME_PRESETS
 *     (website/src/lib/theme/presets.ts), containing, inside the
 *     rift.preset cascade layer, an html[data-brand="<id>"] block with
 *     the preset's light-theme declarations and an
 *     html[data-brand="<id>"][data-theme="dark"] block with only the
 *     dark-theme declarations whose value differs from the light one.
 *     The cascade: rift.preset outranks rift.tokens (the base token
 *     files), so the light block applies in both modes and the dark
 *     block, more specific, overrides it where dark differs. Anything a
 *     theme does not split (the faces, the radius ramp) is declared once.
 *     Any unlayered rule outranks the whole layer, so a consumer's plain
 *     :root override of one token wins under every preset in both modes
 *     (src/tokens/tokens.css owns the layer contract).
 *   - one presets.css that only @imports them all, so a consumer imports
 *     a single file (after tokens.css) and every data-brand value works.
 *
 * The declarations are EXACTLY the output of presetOverrides(preset,
 * theme), the one composer the playground's theme export also calls,
 * never a re-derivation. (The playground's live preview composes the same
 * lever functions in a memo of its own that mirrors this composer's merge
 * order; it does not call it.) The stylesheets ship in the npm package
 * under the ./tokens/presets/* subpath, and the site's root layout loads
 * presets.css, so the site rethemes through the same files a consumer
 * imports. This script imports the TypeScript source directly under
 * Node's type stripping (the theme modules are erasable TS); the resolve
 * hook below only supplies the `.ts` extension Node's ESM resolver does
 * not guess. Output is deterministic: preset ids and declaration names
 * are sorted, line endings are LF, and the composer is pure — so the
 * companion validate-preset-stylesheets.mjs can regenerate in memory and
 * byte-compare on every build. The files are committed, like every
 * generated surface (CI's drift guard covers them).
 *
 * Runs in the validate-registry chain and the website's predev/prebuild.
 * Never hand-edit the generated files.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { isEntryScript } from './lib/report.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
export const outputDir = join(repoRoot, 'src', 'tokens', 'presets');

/**
 * Import the theme source (THEME_PRESETS + presetOverrides + the lever
 * helpers) straight from the TypeScript files. Node's type stripping
 * handles the syntax; the hooks handle the two gaps: relative imports
 * written without an extension (bundler-style, `./theme-overrides`)
 * resolve to their `.ts` file, and `.ts` sources are loaded with an
 * explicit module-typescript format so Node skips the CJS/ESM detection
 * pass (and its warning) that a typeless package.json would trigger.
 * If a nonerasable TS construct ever lands in these modules, refactor
 * the construct — never duplicate the composer's logic here.
 */
let themeSourcePromise;
export function loadThemeSource() {
  if (!themeSourcePromise) {
    registerHooks({
      resolve(specifier, context, nextResolve) {
        if (specifier.startsWith('./') || specifier.startsWith('../')) {
          try {
            return nextResolve(specifier, context);
          } catch (error) {
            const candidate = fileURLToPath(new URL(`${specifier}.ts`, context.parentURL));
            if (existsSync(candidate)) return nextResolve(`${specifier}.ts`, context);
            throw error;
          }
        }
        return nextResolve(specifier, context);
      },
      load(url, context, nextLoad) {
        if (url.endsWith('.ts')) {
          return {
            format: 'module-typescript',
            source: readFileSync(fileURLToPath(url), 'utf8'),
            shortCircuit: true,
          };
        }
        return nextLoad(url, context);
      },
    });
    const themeDir = join(repoRoot, 'website', 'src', 'lib', 'theme');
    // One namespace over both modules: presets.ts (THEME_PRESETS, the
    // composer) and theme-overrides.ts (the levers, DEFAULT_BRAND) — the
    // validators need constants presets.ts imports without re-exporting.
    themeSourcePromise = Promise.all([
      import(pathToFileURL(join(themeDir, 'presets.ts')).href),
      import(pathToFileURL(join(themeDir, 'theme-overrides.ts')).href),
    ]).then(([presets, overrides]) => ({ ...overrides, ...presets }));
  }
  return themeSourcePromise;
}

const REGENERATE = 'node scripts/generate-preset-stylesheets.mjs';

const header = (lines) =>
  ['/*', ' * AUTO-GENERATED. Do not edit.', ...lines.map((l) => ` * ${l}`), ' */', ''].join('\n');

/**
 * The self-hosted faces the presets can declare — downloaded by
 * scripts/sync-preset-fonts.mjs (a deliberate by-hand network fetch),
 * shipped in the package beside the icon font. A preset face missing
 * from the manifest fails generation until that script is rerun, so a
 * stylesheet can never name a family nothing loads.
 */
const fontManifest = JSON.parse(
  readFileSync(join(repoRoot, 'src', 'fonts', 'presets', 'manifest.json'), 'utf8')
).faces;

/** The css family name an option stack leads with: `'Inter', sans-serif` -> Inter. */
const stackFamily = (stack) => stack.match(/^'([^']+)'/)?.[1] ?? null;

/**
 * The @font-face blocks for one preset's declared faces, from the
 * manifest — url()s relative to this stylesheet's place in the package
 * (src/tokens/presets/ -> src/fonts/presets/), a layout build-package
 * copies to dist verbatim. Faces are unique per preset today, but a
 * shared face would only duplicate a block browsers dedupe by rule.
 */
function fontFaceBlocks(preset, source) {
  const families = [];
  const body = source.FONT_OPTIONS.find((f) => f.label === preset.fontLabel);
  const heading = preset.headingFontLabel
    ? source.HEADING_FONT_OPTIONS.find((f) => f.label === preset.headingFontLabel)
    : null;
  for (const option of [body, heading]) {
    const family = option?.family ? stackFamily(option.family) : null;
    if (family && !families.includes(family)) families.push(family);
  }
  const blocks = [];
  for (const family of families) {
    const faces = fontManifest.filter((f) => f.family === family);
    if (faces.length === 0) {
      throw new Error(
        `Preset "${preset.label}" declares ${family}, which src/fonts/presets/manifest.json lacks — run node scripts/sync-preset-fonts.mjs`
      );
    }
    for (const face of faces) {
      blocks.push(
        [
          '@font-face {',
          `  font-family: '${face.family}';`,
          `  font-style: ${face.style};`,
          `  font-weight: ${face.weight};`,
          '  font-display: swap;',
          `  src: url('../../fonts/presets/${face.file}') format('woff2');`,
          `  unicode-range: ${face.unicodeRange};`,
          '}',
        ].join('\n')
      );
    }
  }
  return blocks;
}

/** The layer order every token stylesheet states, so whichever loads first fixes it. */
export const LAYER_ORDER = '@layer rift.tokens, rift.preset;';

/**
 * One preset's stylesheet: inside rift.preset, the light block, then a dark
 * block holding only what dark changes (omitted when nothing does).
 */
export function buildPresetCss(id, preset, presetOverrides, source) {
  const light = presetOverrides(preset, 'light');
  const dark = presetOverrides(preset, 'dark');
  const block = (selector, overrides, names) =>
    `  ${selector} {\n${names.map((name) => `    ${name}: ${overrides[name]};`).join('\n')}\n  }`;
  const lightNames = Object.keys(light).sort();
  const darkNames = Object.keys(dark)
    .filter((name) => dark[name] !== light[name])
    .sort();
  const blocks = [block(`html[data-brand="${id}"]`, light, lightNames)];
  if (darkNames.length > 0) {
    blocks.push(block(`html[data-brand="${id}"][data-theme="dark"]`, dark, darkNames));
  }
  const fonts = fontFaceBlocks(preset, source);
  return (
    header([
      `Theme preset "${id}" (${preset.label}).`,
      'Source of truth: website/src/lib/theme/presets.ts (THEME_PRESETS + presetOverrides).',
      'Fonts: self-hosted from src/fonts/presets/ (scripts/sync-preset-fonts.mjs; OFL-1.1).',
      `Regenerate: ${REGENERATE}`,
      'Import after tokens.css, then set data-brand="' + id + '" on <html>.',
      'Layered (rift.preset): any unlayered rule of yours outranks it.',
    ]) +
    `${LAYER_ORDER}\n\n` +
    (fonts.length > 0 ? `${fonts.join('\n\n')}\n\n` : '') +
    `@layer rift.preset {\n${blocks.join('\n\n')}\n}\n`
  );
}

/** Every file of the surface, as name -> content (LF line endings). */
export async function assemblePresetStylesheets() {
  const source = await loadThemeSource();
  const { THEME_PRESETS, presetOverrides } = source;
  const ids = Object.keys(THEME_PRESETS).sort();
  const files = new Map();
  for (const id of ids) {
    files.set(`${id}.css`, buildPresetCss(id, THEME_PRESETS[id], presetOverrides, source));
  }
  files.set(
    'presets.css',
    header([
      'The whole preset family in one import.',
      'Source of truth: website/src/lib/theme/presets.ts (THEME_PRESETS + presetOverrides).',
      `Regenerate: ${REGENERATE}`,
      'Import after tokens.css, then set data-brand="<id>" on <html>.',
    ]) + `${LAYER_ORDER}\n` + ids.map((id) => `@import url("./${id}.css");`).join('\n') + '\n'
  );
  return files;
}

/** What this generator writes, for the freshness check (scripts/lib/fresh.mjs). */
export async function surface() {
  const files = await assemblePresetStylesheets();
  return {
    regenerate: 'node scripts/generate-preset-stylesheets.mjs',
    files: [...files].map(([name, content]) => [join(outputDir, name), content]),
    folders: [{ dir: outputDir, entries: new Set(files.keys()) }],
  };
}

/** Write the generated files. The chain runner calls this; run alone, the script does. */
export async function main() {
  const files = await assemblePresetStylesheets();
  mkdirSync(outputDir, { recursive: true });

  let written = 0;
  for (const [name, content] of files) {
    const dest = join(outputDir, name);
    const existing = existsSync(dest) ? readFileSync(dest, 'utf8') : null;
    if (existing !== content) {
      writeFileSync(dest, content);
      written++;
    }
  }

  // A preset leaving THEME_PRESETS takes its stylesheet with it.
  let pruned = 0;
  for (const name of readdirSync(outputDir)) {
    if (!files.has(name)) {
      rmSync(join(outputDir, name));
      pruned++;
    }
  }

  console.log(
    written + pruned > 0
      ? `✓ Preset stylesheets regenerated — ${files.size} files (${written} written, ${pruned} pruned).`
      : `✓ Preset stylesheets up to date — ${files.size} files.`
  );
}

if (isEntryScript(import.meta.url)) await main();
