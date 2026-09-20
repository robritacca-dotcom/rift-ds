#!/usr/bin/env node
/**
 * generate-preset-stylesheets.mjs
 *
 * Writes src/tokens/presets/ — every theme preset as a shippable
 * stylesheet, so one `data-brand` attribute on <html> rethemes an entire
 * site or app end to end, light and dark, with zero runtime JavaScript:
 *
 *   - one <id>.css per preset in THEME_PRESETS
 *     (website/src/lib/theme/presets.ts), containing an
 *     html[data-brand="<id>"] block with the preset's light-theme
 *     declarations and an html[data-brand="<id>"][data-theme="dark"]
 *     block with its dark-theme declarations. The dark block is emitted
 *     even when it matches the light one, so the cascade is self-evident:
 *     html[data-brand] outranks the token files' :root/[data-theme]
 *     blocks, and the dark block outranks the light one.
 *   - one presets.css that only @imports them all, so a consumer imports
 *     a single file (after tokens.css) and every data-brand value works.
 *
 * The declarations are EXACTLY the output of presetOverrides(preset,
 * theme) — the one composer the playground's live preview also calls —
 * never a re-derivation, so the preview and the shipped theme cannot
 * disagree. This script imports the TypeScript source directly under
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

/** One preset's stylesheet: light block, then the always-emitted dark block. */
export function buildPresetCss(id, preset, presetOverrides) {
  const block = (theme) => {
    const overrides = presetOverrides(preset, theme);
    const selector =
      theme === 'light'
        ? `html[data-brand="${id}"]`
        : `html[data-brand="${id}"][data-theme="dark"]`;
    const declarations = Object.keys(overrides)
      .sort()
      .map((name) => `  ${name}: ${overrides[name]};`);
    return `${selector} {\n${declarations.join('\n')}\n}`;
  };
  return (
    header([
      `Theme preset "${id}" (${preset.label}).`,
      'Source of truth: website/src/lib/theme/presets.ts (THEME_PRESETS + presetOverrides).',
      `Regenerate: ${REGENERATE}`,
      'Import after tokens.css, then set data-brand="' + id + '" on <html>.',
    ]) +
    `${block('light')}\n\n${block('dark')}\n`
  );
}

/** Every file of the surface, as name -> content (LF line endings). */
export async function assemblePresetStylesheets() {
  const { THEME_PRESETS, presetOverrides } = await loadThemeSource();
  const ids = Object.keys(THEME_PRESETS).sort();
  const files = new Map();
  for (const id of ids) {
    files.set(`${id}.css`, buildPresetCss(id, THEME_PRESETS[id], presetOverrides));
  }
  files.set(
    'presets.css',
    header([
      'The whole preset family in one import.',
      'Source of truth: website/src/lib/theme/presets.ts (THEME_PRESETS + presetOverrides).',
      `Regenerate: ${REGENERATE}`,
      'Import after tokens.css, then set data-brand="<id>" on <html>.',
    ]) + ids.map((id) => `@import url("./${id}.css");`).join('\n') + '\n'
  );
  return files;
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
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
