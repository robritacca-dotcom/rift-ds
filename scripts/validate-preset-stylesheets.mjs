#!/usr/bin/env node
/**
 * validate-preset-stylesheets.mjs
 *
 * Holds the generated preset stylesheets (src/tokens/presets/ — one
 * <id>.css per THEME_PRESETS entry plus the presets.css aggregate) to
 * what a preset must be.
 * Whether the files are fresh (each one matches its generator, and nothing
 * else sits in the folder) is scripts/validate-generated-files.mjs's check.
 * Two checks here:
 *
 *   1. Parity proof, belt-and-braces on the shared-composer claim: for
 *      one preset (mono), the CSS blocks are parsed back out of the disk
 *      file's rift.preset layer and compared, name for name and value for
 *      value, against presetOverrides(mono, theme): the light block is the
 *      light output exactly, and dark mode (the dark block over the light
 *      one) resolves to the dark output, with nothing repeated. The
 *      freshness check already implies this through the generator; the
 *      parse goes around the generator, so a formatting bug that dropped
 *      or mangled a declaration on both sides of that comparison still
 *      fails here.
 *   2. Every rebased primitive ramp keeps a distinct colour per step. A
 *      preset that rebases a ramp around its own key rebuilt purple's 05,
 *      06 and 07 as one colour in ten presets (the ramp weights in
 *      theme-overrides.ts clamped a hue-drifted step to the key); two
 *      neighbouring steps of one ramp written alike fails here.
 *
 * Belongs in the validate-registry chain (and the website prebuild),
 * right after its generator: the source is TypeScript theme data, not
 * build output.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { assemblePresetStylesheets, loadThemeSource, outputDir } from './generate-preset-stylesheets.mjs';
import { read } from './lib/fs.mjs';
import { failStep } from './lib/report.mjs';

const REGENERATE = 'run: node scripts/generate-preset-stylesheets.mjs';
const errors = [];

const files = await assemblePresetStylesheets();

/* Parity proof (check 3): parse mono.css from disk and hold each block's
   declarations to the composer's output directly. */
const { THEME_PRESETS, presetOverrides } = await loadThemeSource();
const monoPath = join(outputDir, 'mono.css');
if (!THEME_PRESETS.mono) {
  errors.push('THEME_PRESETS has no "mono" preset — repoint the parity proof at another preset');
} else if (existsSync(monoPath)) {
  // Normalize CRLF so Windows checkouts validate identically to CI.
  const monoCss = read(monoPath);
  /* The blocks sit inside the rift.preset layer, indented one level. */
  const layer = monoCss.match(/^@layer rift\.preset \{\n([\s\S]*?)\n\}$/m);
  if (!layer) errors.push(`mono.css has no @layer rift.preset block — ${REGENERATE}`);
  const parse = (selector) => {
    const escaped = selector.replace(/[[\]"]/g, '\\$&');
    const block = (layer?.[1] ?? '').match(new RegExp(`^  ${escaped} \\{\\n([\\s\\S]*?)\\n  \\}`, 'm'));
    return block
      ? Object.fromEntries([...block[1].matchAll(/^ {4}(--[a-z0-9-]+): (.+);$/gm)].map((m) => [m[1], m[2]]))
      : null;
  };
  const light = parse('html[data-brand="mono"]');
  const dark = parse('html[data-brand="mono"][data-theme="dark"]') ?? {};
  const expectedLight = presetOverrides(THEME_PRESETS.mono, 'light');
  const expectedDark = presetOverrides(THEME_PRESETS.mono, 'dark');
  if (!light) {
    errors.push(`mono.css has no html[data-brand="mono"] block — ${REGENERATE}`);
  } else {
    // Light: the block is exactly the composer's light output.
    for (const [name, value] of Object.entries(expectedLight)) {
      if (!(name in light)) errors.push(`mono.css light block is missing ${name} — presetOverrides emits it`);
      else if (light[name] !== value)
        errors.push(`mono.css light block has ${name}: ${light[name]}, but presetOverrides says ${value}`);
    }
    for (const name of Object.keys(light)) {
      if (!(name in expectedLight)) errors.push(`mono.css light block declares ${name}, which presetOverrides does not emit`);
    }
    // Dark: the light block applies in both modes, so what dark mode sees
    // (its own block over the light one) must be the composer's dark output,
    // and the dark block holds only what differs.
    for (const [name, value] of Object.entries(expectedDark)) {
      const seen = name in dark ? dark[name] : light[name];
      if (seen === undefined) errors.push(`mono.css dark mode never sets ${name} — presetOverrides emits it`);
      else if (seen !== value)
        errors.push(`mono.css dark mode resolves ${name}: ${seen}, but presetOverrides says ${value}`);
    }
    for (const name of Object.keys(dark)) {
      if (!(name in expectedDark)) errors.push(`mono.css dark block declares ${name}, which presetOverrides does not emit`);
      else if (light[name] === dark[name]) errors.push(`mono.css dark block repeats ${name} from the light block — ${REGENERATE}`);
    }
  }
}

// 4. Distinct steps in every rebased ramp, on the files as generated.
for (const [name, content] of files) {
  if (!name.endsWith('.css') || name === 'presets.css') continue;
  const ramps = new Map();
  for (const [, family, step, hex] of content.matchAll(/--primitive-([a-z]+)-(\d\d):\s*(#[0-9A-Fa-f]{6})\s*;/g)) {
    if (family === 'neutral') continue; // the tint lever owns neutral, alpha variants and all
    const steps = ramps.get(family) ?? new Map();
    if (!steps.has(step)) steps.set(step, hex.toUpperCase());
    ramps.set(family, steps);
  }
  for (const [family, steps] of ramps) {
    const ordered = [...steps].sort(([a], [b]) => a.localeCompare(b));
    for (let i = 1; i < ordered.length; i++) {
      const [previousStep, previousHex] = ordered[i - 1];
      const [step, hex] = ordered[i];
      if (Number(step) === Number(previousStep) + 1 && hex === previousHex) {
        errors.push(`${name} writes ${family}-${previousStep} and ${family}-${step} as one colour (${hex}): the ramp rebase in website/src/lib/theme/theme-overrides.ts collapsed a step`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error(
    '✗ Preset stylesheet validation failed:\n' + errors.map((e) => `    - ${e}`).join('\n')
  );
  failStep();
}

console.log(
  `✓ Preset stylesheets sound — mono reads back as presetOverrides emits it, and no ramp step repeats across ${files.size} files.`
);
