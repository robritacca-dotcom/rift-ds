#!/usr/bin/env node
/**
 * Validates website/src/data/shader-background.json — the single source of
 * truth for the site background: which renderer paints it, the eight shader
 * parameters, and the eight blob definitions. BlurBackground reads this file
 * on every page, so a bad value here is a site-wide visual failure.
 *
 * Checks:
 *  - "mode" is exactly "shader" or "css" — the one-line rollback lever, and a
 *    typo in it would silently paint nothing
 *  - every parameter is present, finite, and inside the dev tuner's slider
 *    range; out-of-range values are what blank or wash out the field, and
 *    they should fail a build rather than reach a deploy
 *  - the blob count matches BLOB_COUNT in the shader source, whose uniform
 *    arrays are fixed-size — a mismatch would silently drop or starve a blob
 *  - every blob's colour token exists in src/tokens/registry.json. This is
 *    what makes the background a real consumer of the token registry: a
 *    renamed or deleted token can never leave it sampling a custom property
 *    that nothing defines (which resolves to empty, i.e. an invisible blob).
 *  - PARAM_RANGES below matches DEFAULT_SHADER_PARAMS in the library, in both
 *    directions, so a new parameter cannot ship without a sanity range
 *  - the "<N> parameters" claims match that count in every doc the CLAIM_CHECKS
 *    loop enumerates (the list beside the loop is authoritative — it includes
 *    the ShaderField docs page, which the 2026-09 audit caught still saying
 *    seven). A parameter count is a countable fact, so it gets the same
 *    treatment as every other one in this repo: build-enforced rather than
 *    remembered. The 2026-08 drift audit is why — `crop` landed, the specs
 *    were updated, and the README kept telling npm consumers there were seven.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataPath = join(
  repoRoot, 'website', 'src', 'data', 'shader-background.json'
);
const tokenRegistryPath = join(repoRoot, 'src', 'tokens', 'registry.json');
const shaderPath = join(
  repoRoot, 'src', 'components', 'ShaderField', 'field.glsl.ts'
);

const errors = [];

const readJson = (path, label) => {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    console.error(`✗ Could not read/parse ${label}: ${err.message}`);
    process.exit(1);
  }
};

const config = readJson(dataPath, 'shader-background.json');
const tokenRegistry = readJson(tokenRegistryPath, 'src/tokens/registry.json');

/* Every semantic token the system defines, flattened across categories. */
const knownTokens = new Set(
  Object.values(tokenRegistry.categories ?? {}).flat()
);

/* BLOB_COUNT lives in the shader, where it sizes the uniform arrays. Read it
   from there rather than restating it — the shader owns that fact. */
let blobCount = null;
try {
  const source = readFileSync(shaderPath, 'utf8').replace(/\r\n/g, '\n');
  const match = source.match(/export const BLOB_COUNT = (\d+)/);
  if (match) blobCount = Number(match[1]);
} catch {
  /* reported below */
}
if (blobCount === null) {
  errors.push(
    'could not read BLOB_COUNT from src/components/ShaderField/field.glsl.ts' +
      ' — the shader owns that number and this validator reads it'
  );
}

// -- mode ---------------------------------------------------------------

const MODES = ['shader', 'css'];
if (!MODES.includes(config.mode)) {
  errors.push(
    `"mode" is ${JSON.stringify(config.mode)} — must be one of ${MODES
      .map((m) => `"${m}"`)
      .join(' | ')}`
  );
}

// -- params -------------------------------------------------------------

/* Ranges mirror the dev tuner's sliders: the panel cannot produce a value
   outside these, so anything outside them was hand-edited by mistake. */
const PARAM_RANGES = {
  intensity: [0.1, 1],
  warp: [0, 0.5],
  scale: [0.5, 6],
  speed: [0, 4],
  grain: [0, 0.4],
  streak: [0, 1],
  react: [0, 1],
  crop: [0, 1],
};

const params = config.params ?? {};
for (const [name, [min, max]] of Object.entries(PARAM_RANGES)) {
  const value = params[name];
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    errors.push(`params.${name} is ${JSON.stringify(value)} — must be a number`);
    continue;
  }
  if (value < min || value > max) {
    errors.push(`params.${name} is ${value} — must be between ${min} and ${max}`);
  }
}

for (const name of Object.keys(params)) {
  if (!(name in PARAM_RANGES)) {
    errors.push(
      `params.${name} is not a shader parameter — remove it, or add it to ` +
        'PARAM_RANGES in scripts/validate-shader-background.mjs and to ' +
        'ShaderParams in src/components/ShaderField/useShaderField.ts'
    );
  }
}

// -- the parameter set, and the prose that counts it --------------------

/* PARAM_RANGES is this file's own list, so it can drift from the component's.
   DEFAULT_SHADER_PARAMS is the authority: read the keys from it rather than
   trusting the two lists to stay in step by hand. */
const hookPath = join(
  repoRoot, 'src', 'components', 'ShaderField', 'useShaderField.ts'
);
let shipped = null;
try {
  const source = readFileSync(hookPath, 'utf8').replace(/\r\n/g, '\n');
  const block = source.match(
    /export const DEFAULT_SHADER_PARAMS: ShaderParams = \{([\s\S]*?)\n\};/
  );
  if (block) {
    shipped = [...block[1].matchAll(/^\s*([a-zA-Z]\w*):/gm)].map((m) => m[1]);
  }
} catch {
  /* reported below */
}

if (!shipped || shipped.length === 0) {
  errors.push(
    'could not read DEFAULT_SHADER_PARAMS from ' +
      'src/components/ShaderField/useShaderField.ts — that object is the ' +
      'authoritative parameter set and this validator reads it'
  );
} else {
  for (const name of shipped) {
    if (!(name in PARAM_RANGES)) {
      errors.push(
        `DEFAULT_SHADER_PARAMS declares "${name}" but PARAM_RANGES in ` +
          'scripts/validate-shader-background.mjs has no range for it — every ' +
          'parameter needs one, or an out-of-range value reaches a deploy'
      );
    }
  }
  for (const name of Object.keys(PARAM_RANGES)) {
    if (!shipped.includes(name)) {
      errors.push(
        `PARAM_RANGES has a range for "${name}" but DEFAULT_SHADER_PARAMS ` +
          'does not declare it — the parameter was renamed or removed'
      );
    }
  }
}

/* The count is a countable fact, so no doc may restate it from memory. */
const NUMBER_WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six',
  'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
];
const claimNumber = (word) =>
  NUMBER_WORDS.indexOf(word.toLowerCase()) >= 0
    ? NUMBER_WORDS.indexOf(word.toLowerCase())
    : Number(word);
/* Two countable facts, two phrasings the docs use for each. The blob claims
   check against BLOB_COUNT (the CSS fallback renders one disc per blob, so
   "blurred CSS discs" is the same count). */
const CLAIM_CHECKS = [
  { pattern: `(?:field |shader )?parameters`, expected: () => shipped?.length, name: 'ShaderField parameters' },
  { pattern: `(?:blob definitions|blurred CSS discs|CSS blobs)`, expected: () => blobCount, name: 'BLOB_COUNT' },
];
for (const doc of [
  'README.md',
  'design.md',
  'CLAUDE.md',
  'website/src/app/docs/get-started/page.tsx',
  'website/src/app/components/shader-field/page.tsx',
]) {
  let text;
  try {
    text = readFileSync(join(repoRoot, doc), 'utf8').replace(/\r\n/g, '\n');
  } catch {
    errors.push(`could not read ${doc} to check its count claims`);
    continue;
  }
  for (const { pattern, expected, name } of CLAIM_CHECKS) {
    const target = expected();
    if (target === null || target === undefined) continue;
    /* JSX prose wraps mid-sentence, so the claim may span a line break —
       match any whitespace run where the phrasing has a space. */
    const claimPattern = new RegExp(
      `\\b(${NUMBER_WORDS.join('|')}|\\d+)\\s+${pattern.replace(/ /g, '\\s+')}\\b`, 'gi'
    );
    for (const match of text.matchAll(claimPattern)) {
      const claimed = claimNumber(match[1]);
      if (claimed !== target) {
        const line = text.slice(0, match.index).split('\n').length;
        errors.push(
          `${doc}:${line} claims "${match[0]}" but ${name} is ${target}`
        );
      }
    }
  }
}

// -- blobs --------------------------------------------------------------

const blobs = config.blobs;
if (!Array.isArray(blobs) || blobs.length === 0) {
  errors.push('"blobs" must be a non-empty array');
} else {
  if (blobCount !== null && blobs.length !== blobCount) {
    errors.push(
      `"blobs" has ${blobs.length} entries but the shader declares ` +
        `BLOB_COUNT = ${blobCount}; the uniform arrays are fixed-size, so ` +
        'the counts must match exactly'
    );
  }

  const NUMERIC = ['size', 'cx', 'cy', 'period', 'phase', 'weight'];
  blobs.forEach((blob, i) => {
    const label = `blobs[${i}] (${blob?.token ?? '<no token>'})`;

    if (typeof blob?.token !== 'string' || !blob.token.startsWith('--')) {
      errors.push(`${label} — "token" must be a custom-property name`);
    } else if (!knownTokens.has(blob.token)) {
      errors.push(
        `${label} — token is not in src/tokens/registry.json; the background ` +
          'would sample a property nothing defines and render an invisible blob'
      );
    }

    for (const field of NUMERIC) {
      const value = blob?.[field];
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        errors.push(`${label} — "${field}" must be a number, got ${JSON.stringify(value)}`);
      }
    }

    if (typeof blob?.size === 'number' && blob.size <= 0) {
      errors.push(`${label} — "size" must be positive`);
    }
    if (typeof blob?.period === 'number' && blob.period <= 0) {
      errors.push(`${label} — "period" must be positive (it is a cycle length in seconds)`);
    }
  });
}

// -- report -------------------------------------------------------------

if (errors.length > 0) {
  console.error('✗ Shader background config validation failed:\n');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

const tokenList = blobs.map((b) => b.token);
const uniqueTokens = new Set(tokenList).size;
console.log(
  `✓ Shader background config valid — mode "${config.mode}", ` +
    `${blobs.length} blobs across ${uniqueTokens} tokens, all resolving; ` +
    `${Object.keys(PARAM_RANGES).length} parameters in range` +
    (params.react === 0 ? ' (cursor wake off).' : '.')
);
