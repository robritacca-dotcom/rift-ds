#!/usr/bin/env node
/**
 * validate-theme-export.mjs
 *
 * Holds the playground's theme export (website/src/lib/theme/theme-export.ts:
 * the CSS, the THEME.md and the agent prompt a visitor takes away) to the
 * system it describes. A visitor pastes these files into their own project
 * and hands them to a coding agent, so a wrong declaration or a token name
 * that does not exist is a mistake shipped into someone else's codebase.
 * Four checks:
 *
 *   1. Parity. For every preset in THEME_PRESETS and both themes, the
 *      exported blocks resolve to exactly what presetOverrides states: the
 *      `:root` block is the light composition, and `:root` overlaid with
 *      the dark block is the dark one. The export trims the output (an
 *      accent still at its shipped value, a dark value equal to the light
 *      one), and this proves the trimming loses nothing.
 *   2. No light-only declaration. A name the light block states and the
 *      dark composition does not would follow a visitor into dark mode,
 *      because the pasted `:root` block loads after the token files.
 *   3. Vocabulary. Every numeric lever has a slider range and named bands
 *      (LEVER_RANGES and LEVER_VOCABULARY in theme-overrides.ts); the bands
 *      ascend and the last one reaches the top of the range, so a widened
 *      slider cannot land on a position with no word.
 *   4. Prose. Every custom property THEME.md and the prompt name resolves
 *      in the token registry or the primitives (a `--prefix-*` form needs
 *      at least one match), and neither text carries an em dash, which
 *      content-design.md bans in shipped copy.
 *
 * Belongs in the validate-registry chain (and the website prebuild): its
 * sources are TypeScript theme data and the token files, not build output.
 * It runs after the preset stylesheet generator, whose loader it shares.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadThemeSource } from './generate-preset-stylesheets.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
// Normalize CRLF so Windows checkouts validate identically to CI.
const read = (path) => readFileSync(join(repoRoot, path), 'utf8').replace(/\r\n/g, '\n');

const errors = [];

// loadThemeSource registers the hooks that let Node import the theme's
// TypeScript, so the export module loads through the same door.
const source = await loadThemeSource();
const exportPath = 'website/src/lib/theme/theme-export.ts';
const themeExport = await import(pathToFileURL(join(repoRoot, exportPath)).href);
const { THEME_PRESETS, presetOverrides, ACCENT_NAMES, SHIPPED_ACCENTS } = source;
const { LEVER_RANGES, LEVER_VOCABULARY } = source;

/* ---------- 1 + 2: parity with the composer ---------- */

const FONT_KEYS = new Set(['--font-family-primary', '--font-family-heading']);
const shippedAccent = (name) => {
  const accent = ACCENT_NAMES.find((a) => name === `--color-core-accent-${a}`);
  return accent ? SHIPPED_ACCENTS[accent] : undefined;
};
const same = (a, b) => String(a).toUpperCase() === String(b).toUpperCase();

for (const [id, preset] of Object.entries(THEME_PRESETS)) {
  const blocks = themeExport.buildThemeBlocks(preset);
  const exported = { light: blocks.light, dark: { ...blocks.light, ...blocks.dark } };

  for (const theme of ['light', 'dark']) {
    const expected = presetOverrides(preset, theme);
    for (const [name, value] of Object.entries(expected)) {
      if (FONT_KEYS.has(name)) continue; // carried as font options, printed by the snippet
      const got = exported[theme][name] ?? shippedAccent(name);
      if (got === undefined || !same(got, value)) {
        errors.push(
          `preset "${id}" (${theme}): ${name} exports as ${got ?? 'nothing'}, the composer states ${value}`
        );
      }
    }
    for (const name of Object.keys(exported[theme])) {
      if (!(name in expected)) {
        errors.push(
          theme === 'dark'
            ? `preset "${id}": ${name} is stated for light only, so the pasted :root value would follow into dark mode`
            : `preset "${id}" (light): ${name} is exported but the composer does not state it`
        );
      }
    }
  }
}

/* ---------- 3: lever vocabulary ---------- */

const levers = new Set([...Object.keys(LEVER_RANGES), ...Object.keys(LEVER_VOCABULARY)]);
for (const lever of levers) {
  const range = LEVER_RANGES[lever];
  const bands = LEVER_VOCABULARY[lever];
  if (!range) {
    errors.push(`lever "${lever}" has vocabulary but no entry in LEVER_RANGES`);
    continue;
  }
  if (!bands || bands.length === 0) {
    errors.push(`lever "${lever}" has a range but no bands in LEVER_VOCABULARY`);
    continue;
  }
  bands.forEach((band, index) => {
    if (index > 0 && band.upTo <= bands[index - 1].upTo) {
      errors.push(`lever "${lever}": band "${band.word}" does not ascend past "${bands[index - 1].word}"`);
    }
    if (band.upTo < range.min) {
      errors.push(`lever "${lever}": band "${band.word}" ends below the slider's minimum, so nothing reads as it`);
    }
  });
  const top = bands[bands.length - 1].upTo;
  if (top !== range.max) {
    errors.push(
      `lever "${lever}": the last band reaches ${top} but the slider reaches ${range.max}; move the band in LEVER_VOCABULARY`
    );
  }
}

/* ---------- 4: the prose ---------- */

const registry = JSON.parse(read('src/tokens/registry.json'));
const known = new Set(Object.values(registry.categories).flat());
for (const match of read('src/tokens/tokens-primitives.css').matchAll(/^\s*(--[\w-]+)\s*:/gm)) {
  known.add(match[1]);
}

const context = {
  productName: 'Example',
  packageName: 'example-ds',
  binName: 'example-ds',
  siteUrl: 'https://example.com',
  mcpEndpoint: 'https://example.com/api/mcp',
  mcpServerName: 'example',
};

const checked = new Set();
for (const [id, preset] of Object.entries(THEME_PRESETS)) {
  const texts = {
    'THEME.md': themeExport.buildThemeMarkdown(preset, context),
    'the agent prompt': themeExport.buildAgentPrompt(preset, context),
  };
  for (const [label, text] of Object.entries(texts)) {
    if (text.includes('—')) {
      errors.push(`preset "${id}": ${label} contains an em dash (content-design.md bans it); fix the template in ${exportPath}`);
    }
    for (const [, name, wildcard] of text.matchAll(/`(--[a-z][a-z0-9-]*?)(-\*)?`/g)) {
      const key = `${name}${wildcard ?? ''}`;
      if (checked.has(key)) continue;
      checked.add(key);
      const resolves = wildcard
        ? [...known].some((token) => token.startsWith(`${name}-`))
        : known.has(name);
      if (!resolves) {
        errors.push(`${label} names \`${key}\`, which no token file defines; fix the template in ${exportPath}`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error('✗ Theme export validation failed:');
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}
console.log(
  `✓ Theme export: ${Object.keys(THEME_PRESETS).length} presets round-trip through the export in both themes, ${levers.size} levers named, ${checked.size} token references resolve`
);
