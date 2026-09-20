#!/usr/bin/env node
/**
 * validate-preset-stylesheets.mjs
 *
 * Holds the generated preset stylesheets (src/tokens/presets/ — one
 * <id>.css per THEME_PRESETS entry plus the presets.css aggregate) to
 * their source. Three checks:
 *
 *   1. Every file byte-matches what generate-preset-stylesheets.mjs
 *      produces now (regenerated in memory), so a preset edit cannot ship
 *      with a stale stylesheet beside it — and every expected file exists.
 *   2. Every file in the folder is an expected one — an orphan means a
 *      preset left THEME_PRESETS without taking its stylesheet along.
 *   3. Parity proof, belt-and-braces on the shared-composer claim: for
 *      one preset (mono), the CSS blocks are parsed back out of the disk
 *      file and their declarations compared, name for name and value for
 *      value, against presetOverrides(mono, theme) for both themes. The
 *      byte-compare already implies this through the generator; the parse
 *      goes around the generator, so a formatting bug that dropped or
 *      mangled a declaration on both sides of the byte-compare still
 *      fails here.
 *
 * Belongs in the validate-registry chain (and the website prebuild),
 * right after its generator: the source is TypeScript theme data, not
 * build output.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  assemblePresetStylesheets,
  loadThemeSource,
  outputDir,
} from './generate-preset-stylesheets.mjs';

const REGENERATE = 'run: node scripts/generate-preset-stylesheets.mjs';
const errors = [];

const files = await assemblePresetStylesheets();

for (const [name, content] of files) {
  const dest = join(outputDir, name);
  if (!existsSync(dest)) {
    errors.push(`missing src/tokens/presets/${name} — ${REGENERATE}`);
    continue;
  }
  // Normalize CRLF so Windows checkouts validate identically to CI.
  if (readFileSync(dest, 'utf8').replace(/\r\n/g, '\n') !== content) {
    errors.push(`src/tokens/presets/${name} is stale — ${REGENERATE}`);
  }
}

const onDisk = existsSync(outputDir) ? readdirSync(outputDir) : [];
for (const name of onDisk) {
  if (!files.has(name)) {
    errors.push(
      `src/tokens/presets/${name} matches no preset in THEME_PRESETS — ${REGENERATE}`
    );
  }
}

/* Parity proof (check 3): parse mono.css from disk and hold each block's
   declarations to the composer's output directly. */
const { THEME_PRESETS, presetOverrides } = await loadThemeSource();
const monoPath = join(outputDir, 'mono.css');
if (!THEME_PRESETS.mono) {
  errors.push('THEME_PRESETS has no "mono" preset — repoint the parity proof at another preset');
} else if (existsSync(monoPath)) {
  // Normalize CRLF so Windows checkouts validate identically to CI.
  const monoCss = readFileSync(monoPath, 'utf8').replace(/\r\n/g, '\n');
  for (const theme of ['light', 'dark']) {
    const selector =
      theme === 'light' ? 'html[data-brand="mono"]' : 'html[data-brand="mono"][data-theme="dark"]';
    const escaped = selector.replace(/[[\]"]/g, '\\$&');
    const block = monoCss.match(new RegExp(`^${escaped} \\{\\n([\\s\\S]*?)\\n\\}`, 'm'));
    if (!block) {
      errors.push(`mono.css has no ${selector} block — ${REGENERATE}`);
      continue;
    }
    const parsed = Object.fromEntries(
      [...block[1].matchAll(/^ {2}(--[a-z0-9-]+): (.+);$/gm)].map((m) => [m[1], m[2]])
    );
    const expected = presetOverrides(THEME_PRESETS.mono, theme);
    for (const [name, value] of Object.entries(expected)) {
      if (!(name in parsed)) {
        errors.push(`mono.css ${theme} block is missing ${name} — presetOverrides emits it`);
      } else if (parsed[name] !== value) {
        errors.push(
          `mono.css ${theme} block has ${name}: ${parsed[name]}, but presetOverrides says ${value}`
        );
      }
    }
    for (const name of Object.keys(parsed)) {
      if (!(name in expected)) {
        errors.push(`mono.css ${theme} block declares ${name}, which presetOverrides does not emit`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error(
    '✗ Preset stylesheet validation failed:\n' + errors.map((e) => `    - ${e}`).join('\n')
  );
  process.exit(1);
}

console.log(
  `✓ Preset stylesheets in sync — ${files.size} files match presetOverrides (mono parity proof included).`
);
