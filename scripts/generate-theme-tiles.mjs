#!/usr/bin/env node
/**
 * generate-theme-tiles.mjs
 *
 * Writes website/src/lib/theme/theme-tiles.generated.ts: the theme
 * switcher's tiles (each look's name, key colour, corner and faces) for
 * light and dark, worked out ahead of time.
 *
 * The switcher sits in the header of every page, and all it needs is this
 * short list. Building the list at run time meant importing
 * website/src/lib/theme/presets.ts, every lever of every preset, into
 * every page for the sake of a dozen labels and swatches. The list is a
 * pure function of the presets, so it is computed here and the header
 * imports the result; pages that edit themes (the playground, the themes
 * pages) still import the presets themselves.
 *
 * `themeSelectorTiles` in presets.ts stays the one place a tile is
 * derived: this calls it and writes down what it returns, so the two can
 * never disagree.
 *
 * Reads source only and is deterministic, so it belongs in the generator
 * half of the validate-registry chain, after the presets it reads from;
 * validate-generated-files.mjs holds the disk to it.
 */
import { writeFileSync } from 'node:fs';
import { loadThemeSource } from './generate-preset-stylesheets.mjs';
import { display, fromRoot } from './lib/fs.mjs';
import { isEntryScript } from './lib/report.mjs';

const outputPath = fromRoot('website', 'src', 'lib', 'theme', 'theme-tiles.generated.ts');

export async function buildThemeTiles() {
  const { themeSelectorTiles } = await loadThemeSource();
  const tiles = { light: themeSelectorTiles('light'), dark: themeSelectorTiles('dark') };
  return `// AUTO-GENERATED. Do not edit by hand.
// Source of truth: themeSelectorTiles in website/src/lib/theme/presets.ts.
// Regenerate: node scripts/generate-theme-tiles.mjs (runs via predev/prebuild).

import type { RichDropdownOption } from "rift-ds/components/RichDropdown/RichDropdown";

/** The theme switcher's tiles for each colour mode, in display order. */
export const THEME_TILES: Record<"light" | "dark", RichDropdownOption[]> = ${JSON.stringify(tiles, null, 2)};

/** The tiles for a colour mode: what themeSelectorTiles returns, without loading the presets. */
export const themeTiles = (mode: "light" | "dark"): RichDropdownOption[] => THEME_TILES[mode];
`;
}

/** What this generator writes, for the freshness check (scripts/lib/fresh.mjs). */
export const surface = async () => ({
  regenerate: 'node scripts/generate-theme-tiles.mjs',
  files: [[outputPath, await buildThemeTiles()]],
});

/** Write the generated files. The chain runner calls this; run alone, the script does. */
export async function main() {
  writeFileSync(outputPath, await buildThemeTiles());
  console.log(`✓ Generated ${display(outputPath)}`);
}

if (isEntryScript(import.meta.url)) await main();
