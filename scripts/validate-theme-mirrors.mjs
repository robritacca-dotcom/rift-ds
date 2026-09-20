#!/usr/bin/env node
/**
 * validate-theme-mirrors.mjs
 *
 * Holds every hand-maintained mirror of token data in the website sources
 * and the design spec to the token CSS and the generated token registry,
 * so a token rename or retune that misses a mirror fails the build instead
 * of shipping silently. Companion to validate-token-references.mjs, which
 * owns the NEUTRALS table, the chart SSR fallbacks, the getCSSVar literals
 * and the ogImage blob mirror; this script owns the rest:
 *
 * 1. CHROMATIC_RAMPS (website/src/lib/theme/theme-overrides.ts) — the
 *    playground's copy of the chromatic primitive ramps, held to
 *    tokens-primitives.css in BOTH directions: every (ramp, step) it lists
 *    must exist as --primitive-<ramp>-<step> with exactly that hex
 *    (case-insensitive), and every chromatic primitive step in the CSS
 *    must appear in the table. "Chromatic" means the ramps matching
 *    --primitive-<name>-<NN> with name !== neutral; the neutral scale is
 *    excluded here because the NEUTRALS table in
 *    validate-token-references.mjs already owns it, and the true-black
 *    specials carry no NN step so they never match.
 *
 * 2. ACTION_COLOR_PRESETS (same file) — each preset's label names a
 *    primitive ("Teal 07" → --primitive-teal-07); the hex (and
 *    hexDark/labelDark, where present) must equal that primitive's value,
 *    and a label naming a primitive that does not exist fails.
 *
 * 3. ACTION_SEMANTIC_REFS (same file) — the pointer-mode map of every
 *    semantic token the shipped themes point at the teal (action) ramp.
 *    Its step strings are KEY-RELATIVE weight steps ("07" is the key
 *    itself), not literal teal steps, so they cannot be compared to the
 *    CSS by name. Instead this check replays the map's own derivation —
 *    BRAND_RAMP_WEIGHTS (parsed from the same file) → brandRampValues →
 *    nearest-step matching with the bg/hover/active collapse fix, exactly
 *    as actionPointerOverrides implements it — with the key set to
 *    whatever teal step the CSS actually resolves --color-action-primary-bg
 *    to per theme, and compares the derived step to the CSS's parsed
 *    var(--primitive-teal-NN) reference (following one --color-* level,
 *    dark falling through to light). Five (cssVar, theme) cells diverge by
 *    design — nearest-step matching is approximate, the mirror's own doc
 *    block says the token files are authoritative for the shipped keys,
 *    and at runtime the shipped key short-circuits to a null plan so these
 *    cells never render from the derivation. They are pinned in
 *    SANCTIONED_DERIVATION_GAPS with BOTH sides recorded, so a change to
 *    either the CSS step or the mirror's ref still fails.
 *    Also held: every cssVar exists in the token registry; a null cell's
 *    token must NOT resolve to a teal primitive in that theme (null means
 *    "keeps its shipped value", which pointer mode would wrongly skip for
 *    a teal role); and in the REVERSE direction, every semantic token in
 *    tokens-light.css / tokens-dark.css whose value is directly
 *    var(--primitive-teal-*) must appear in the map with a non-null cell
 *    for that theme. Tokens that reach teal through another --color-* var
 *    (--color-chart-series-1 → --color-action-primary-bg) are exempt on
 *    purpose: they chain to a mapped role, so a repoint carries them along.
 *
 * 4. RADIUS_STEPS (same file) — each step's px held to
 *    --primitive-radius-<step> in tokens-primitives.css, both directions.
 *    One sanctioned absence: "full" is handled by radiusOverrides' pill
 *    branch rather than the table, so it is exempt from the reverse
 *    direction — and the exemption is itself checked: the file must still
 *    reference --primitive-radius-full literally, or the exemption fails.
 *
 * 5. website/src/lib/theme/presets.ts — every literal custom-property
 *    name in the file, whether a var(--…) reference or a quoted "--…"
 *    object key, must exist in the token registry or as a --primitive-*
 *    in tokens-primitives.css. (Prose in comments is not scanned: the
 *    extraction anchors on var() calls and quoted string literals.)
 *
 * 6. website/src/components/InspectMode/InspectMode.tsx — inspect mode
 *    hardcodes token-prefix strings to family-rank its matches
 *    (`--color-${family}`, "--border", "--radius", "--padding", "--gap",
 *    "--motion-duration-"). Each is held to CATEGORY_PREFIXES in
 *    scripts/generate-token-registry.mjs (imported, not restated): a
 *    hardcoded string is valid only when it extends, or is a stem of, a
 *    registered category prefix. The extraction anchors on every string
 *    or template literal that begins with "--" — tolerant of formatting,
 *    and any new hardcoded prefix is scanned automatically. The same
 *    check holds every `tokenRegistry.<name>` dotted access and the
 *    `[...] as const` category-list literal to the registered category
 *    names, so a renamed category cannot leave inspect mode reading an
 *    absent key.
 *
 * 7. website/src/app/foundations/spatial/page.tsx — the Border / Radius /
 *    Gap / Padding swatch data. The page presents the four categories as
 *    complete ("Border, radius, gap, and padding tokens…" over a grid per
 *    category), so each row's label+px is held to
 *    --primitive-<category>-<label lowercased> in BOTH directions. The
 *    mobile column is held too: a row's mobilePx must equal what the
 *    @media (max-width: 768px) block in tokens-light.css re-points the
 *    matching semantic token to, and every spacing override in that block
 *    must have a row declaring a mobile value.
 *
 * 8. design.md — every string matching a token-shaped name
 *    (--<known-category-or-primitive>-…) must exist in the token registry
 *    or tokens-primitives.css, which turns the spec's ~1,350 token
 *    mentions into a mechanical rename checklist. Skip rule: a match whose
 *    matched text ends in a hyphen is a family stem or placeholder, not a
 *    token name (`--color-status-{name}-bg`, `--font-paragraph-sm-*`,
 *    `--color-chart-series-N`, `--color-<family>` all terminate the match
 *    at the placeholder character, leaving a trailing hyphen), and is
 *    skipped. A full-name family mention with no trailing hyphen is NOT
 *    skipped — write it with the repo's `-*` placeholder convention
 *    instead, so the checker can tell it from a stale name.
 *
 * Runs in the validate-registry chain (and the website prebuild): it reads
 * only source files, token CSS and the generated registry — no build
 * output — so it belongs before the builds, next to
 * validate-token-references.mjs.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CATEGORY_PREFIXES } from './generate-token-registry.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const tokensDir = join(repoRoot, 'src', 'tokens');
const themeDir = join(repoRoot, 'website', 'src', 'lib', 'theme');

// Normalize CRLF so Windows checkouts validate identically to CI.
const read = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

const stripCssComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const parseDeclarations = (css) => {
  const declarations = new Map();
  for (const m of stripCssComments(css).matchAll(/^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);/gim)) {
    if (!declarations.has(m[1])) declarations.set(m[1], m[2].trim());
  }
  return declarations;
};

const primitives = parseDeclarations(read(join(tokensDir, 'tokens-primitives.css')));
const lightSource = read(join(tokensDir, 'tokens-light.css'));
// The mobile block re-points the section-rhythm tokens below 768px; parse
// it separately from the base declarations (parseDeclarations keeps the
// first occurrence, so the base map is unaffected by the block's repeats).
const mobileSplit = lightSource.split(/@media\s*\(max-width:\s*768px\)/);
const lightDecls = parseDeclarations(mobileSplit[0]);
const mobileDecls = parseDeclarations(mobileSplit[1] ?? '');
const darkDecls = parseDeclarations(read(join(tokensDir, 'tokens-dark.css')));

const tokenRegistry = JSON.parse(read(join(tokensDir, 'registry.json'))).categories;
const registryNames = new Set(Object.values(tokenRegistry).flat());

const overridesSource = read(join(themeDir, 'theme-overrides.ts'));
const overridesRel = 'website/src/lib/theme/theme-overrides.ts';

/** The chromatic primitive ramps as the CSS defines them:
    --primitive-<name>-<NN>, name !== neutral (see doc block, check 1). */
const cssChromatic = new Map(); // ramp -> Map(step -> hex)
for (const [name, value] of primitives) {
  const m = name.match(/^--primitive-([a-z]+)-(\d\d)$/);
  if (!m || m[1] === 'neutral') continue;
  if (!cssChromatic.has(m[1])) cssChromatic.set(m[1], new Map());
  cssChromatic.get(m[1]).set(m[2], value);
}

const errors = [];
const summaries = [];

const parseTsBlock = (source, constName, file) => {
  const block = source.match(new RegExp(`const ${constName}[^=]*=\\s*\\[([\\s\\S]*?)\\n\\];`));
  if (!block) {
    errors.push(`${file}: could not parse ${constName} — the mirror guard needs it`);
    return null;
  }
  return block[1];
};

/* ------------------------------------------------------------------ */
/* 1. CHROMATIC_RAMPS ↔ the chromatic primitives, both directions      */
/* ------------------------------------------------------------------ */
function checkChromaticRamps() {
  const block = parseTsBlock(overridesSource, 'CHROMATIC_RAMPS', overridesRel);
  if (block === null) return;
  const mirrored = new Map(); // ramp -> Map(step -> hex)
  for (const rampMatch of block.matchAll(/name:\s*"([a-z]+)"[\s\S]*?steps:\s*\[([\s\S]*?)\]\s*,\s*\}/g)) {
    const steps = new Map(
      [...rampMatch[2].matchAll(/\["(\d\d)",\s*"(#[0-9A-Fa-f]{6})"\]/g)].map((m) => [m[1], m[2]])
    );
    mirrored.set(rampMatch[1], steps);
  }
  if (mirrored.size === 0) {
    errors.push(`${overridesRel}: parsed no ramps out of CHROMATIC_RAMPS — the mirror guard needs them`);
    return;
  }

  let held = 0;
  for (const [ramp, cssSteps] of cssChromatic) {
    const mirror = mirrored.get(ramp);
    if (!mirror) {
      errors.push(`${overridesRel}: CHROMATIC_RAMPS has no "${ramp}" ramp, but --primitive-${ramp}-* exists in tokens-primitives.css`);
      continue;
    }
    for (const [step, hex] of cssSteps) {
      held += 1;
      const mirroredHex = mirror.get(step);
      if (mirroredHex === undefined) {
        errors.push(`${overridesRel}: CHROMATIC_RAMPS ${ramp} is missing step ${step} (--primitive-${ramp}-${step} is ${hex})`);
      } else if (mirroredHex.toLowerCase() !== hex.toLowerCase()) {
        errors.push(`${overridesRel}: CHROMATIC_RAMPS ${ramp} ${step} is ${mirroredHex} but --primitive-${ramp}-${step} is ${hex}`);
      }
    }
  }
  for (const [ramp, steps] of mirrored) {
    const cssSteps = cssChromatic.get(ramp);
    if (!cssSteps) {
      errors.push(`${overridesRel}: CHROMATIC_RAMPS lists a "${ramp}" ramp, but no --primitive-${ramp}-* steps exist`);
      continue;
    }
    for (const step of steps.keys()) {
      if (!cssSteps.has(step)) {
        errors.push(`${overridesRel}: CHROMATIC_RAMPS ${ramp} lists step ${step}, but --primitive-${ramp}-${step} does not exist`);
      }
    }
  }
  summaries.push(`CHROMATIC_RAMPS matches the ${cssChromatic.size} chromatic primitive ramps (${held} steps, both directions)`);
}

/* ------------------------------------------------------------------ */
/* 2. ACTION_COLOR_PRESETS labels name real primitives with their hex  */
/* ------------------------------------------------------------------ */
function checkActionColorPresets() {
  const block = parseTsBlock(overridesSource, 'ACTION_COLOR_PRESETS', overridesRel);
  if (block === null) return;
  const pairs = []; // [label, hex]
  for (const m of block.matchAll(
    /\{\s*label:\s*"([A-Za-z]+ \d\d)",\s*hex:\s*"(#[0-9A-Fa-f]{6})"(?:,\s*labelDark:\s*"([A-Za-z]+ \d\d)",\s*hexDark:\s*"(#[0-9A-Fa-f]{6})")?\s*\}/g
  )) {
    pairs.push([m[1], m[2]]);
    if (m[3]) pairs.push([m[3], m[4]]);
  }
  if (pairs.length === 0) {
    errors.push(`${overridesRel}: parsed no entries out of ACTION_COLOR_PRESETS — the mirror guard needs them`);
    return;
  }
  for (const [label, hex] of pairs) {
    const [ramp, step] = label.split(' ');
    const primitiveName = `--primitive-${ramp.toLowerCase()}-${step}`;
    const value = primitives.get(primitiveName);
    if (value === undefined) {
      errors.push(`${overridesRel}: ACTION_COLOR_PRESETS "${label}" names ${primitiveName}, which does not exist in tokens-primitives.css`);
    } else if (value.toLowerCase() !== hex.toLowerCase()) {
      errors.push(`${overridesRel}: ACTION_COLOR_PRESETS "${label}" is ${hex} but ${primitiveName} is ${value}`);
    }
  }
  summaries.push(`ACTION_COLOR_PRESETS: ${pairs.length} preset swatches name real primitives with their exact hex`);
}

/* ------------------------------------------------------------------ */
/* 3. ACTION_SEMANTIC_REFS ↔ the teal-pointing semantic tokens         */
/* ------------------------------------------------------------------ */

/** Derivation cells where nearest-step matching lands off the shipped CSS
    step, by design (see doc block, check 3). Keyed with both sides pinned,
    so a change to either the mirror's ref or the CSS reference fails. */
const SANCTIONED_DERIVATION_GAPS = new Set([
  '--color-ai-gradient-end|light|derived:08|css:07',
  '--color-action-primary-text-tertiary|dark|derived:05|css:04',
  '--color-action-primary-border-tertiary|dark|derived:05|css:04',
  '--color-input-border-hover|dark|derived:06|css:07',
  '--color-ai-gradient-end|dark|derived:06|css:07',
]);

function checkActionSemanticRefs() {
  const refsBlock = parseTsBlock(overridesSource, 'ACTION_SEMANTIC_REFS', overridesRel);
  const weightsBlock = parseTsBlock(overridesSource, 'BRAND_RAMP_WEIGHTS', overridesRel);
  if (refsBlock === null || weightsBlock === null) return;

  const refs = [...refsBlock.matchAll(
    /\{\s*cssVar:\s*"(--[a-z0-9-]+)",\s*light:\s*(?:"(\d\d)"|null),\s*dark:\s*(?:"(\d\d)"|null)\s*,?\s*\}/g
  )].map((m) => ({ cssVar: m[1], light: m[2] ?? null, dark: m[3] ?? null }));
  const weights = [...weightsBlock.matchAll(/\["(\d\d)",\s*(-?[0-9.]+)\]/g)].map(
    (m) => [m[1], Number(m[2])]
  );
  if (refs.length === 0 || weights.length === 0) {
    errors.push(`${overridesRel}: parsed no entries out of ACTION_SEMANTIC_REFS / BRAND_RAMP_WEIGHTS — the mirror guard needs them`);
    return;
  }

  /* The teal step a semantic token resolves to in a theme: parse the
     var() reference, following one --color-* level; dark falls through to
     the light sheet for non-overridden tokens. Returns the step, or null
     for a non-teal resolution. */
  const tealStepOf = (theme, name, depth = 0) => {
    const value =
      theme === 'dark' ? (darkDecls.get(name) ?? lightDecls.get(name)) : lightDecls.get(name);
    const m = value?.match(/^var\((--[a-z0-9-]+)\)$/);
    if (!m) return null;
    const teal = m[1].match(/^--primitive-teal-(\d\d)$/);
    if (teal) return teal[1];
    if (m[1].startsWith('--color-') && depth === 0) return tealStepOf(theme, m[1], 1);
    return null;
  };

  /* Faithful port of the mirror's own derivation (brandRampValues +
     actionPointerOverrides' nearest matching and collapse fix), with the
     weight table parsed from the source above rather than restated. */
  const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const mixTo = (a, pole, w) => a.map((c) => c + (pole - c) * w);
  const luminance = ([r, g, b]) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  const distSq = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
  const tealRamp = cssChromatic.get('teal');
  if (!tealRamp) {
    errors.push('tokens-primitives.css: no --primitive-teal-* ramp found — the action-pointer guard needs it');
    return;
  }

  const deriveSteps = (keyHex, refStepByVar) => {
    const key = hexToRgb(keyHex);
    const lightKey = luminance(key) > 0.5;
    const ideal = {};
    for (const [step, w] of weights) {
      const pole = lightKey ? 0 : w > 0 ? 255 : 0;
      ideal[step] = w === 0 ? key : mixTo(key, pole, Math.abs(w));
    }
    const rgbByStep = new Map([...tealRamp].map(([s, h]) => [s, hexToRgb(h)]));
    const order = weights.map(([s]) => s);
    const nearest = (target, preferred) => {
      let best = order[0];
      let bestD = Infinity;
      for (const [step, rgb] of rgbByStep) {
        const d = distSq(rgb, target);
        if (d < bestD) { bestD = d; best = step; }
      }
      const preferredRgb = rgbByStep.get(preferred);
      if (preferredRgb && distSq(preferredRgb, target) === bestD) return preferred;
      return best;
    };
    const picked = {};
    for (const [cssVar, refStep] of Object.entries(refStepByVar)) {
      picked[cssVar] = nearest(ideal[refStep], refStep);
    }
    return { picked, order, lightKey };
  };

  let checkedCells = 0;
  for (const theme of ['light', 'dark']) {
    const keyStep = tealStepOf(theme, '--color-action-primary-bg');
    if (!keyStep) {
      errors.push(`tokens-${theme}.css: --color-action-primary-bg does not resolve to a teal primitive — the action-pointer guard keys on it`);
      continue;
    }
    const keyHex = tealRamp.get(keyStep);
    const refStepByVar = {};
    for (const ref of refs) {
      if (ref[theme]) refStepByVar[ref.cssVar] = ref[theme];
    }
    const { picked, order, lightKey } = deriveSteps(keyHex, refStepByVar);

    /* The bg/hover/active collapse fix, as actionPointerOverrides has it. */
    const idx = (s) => order.indexOf(s);
    const brighten = theme === 'dark' && luminance(hexToRgb(keyHex)) < 0.8;
    const dir = brighten ? -1 : 1;
    const walk = (s) => order[Math.min(order.length - 1, Math.max(0, idx(s) + dir))];
    const collapsed = (outer, inner) =>
      brighten ? idx(outer) >= idx(inner) : idx(outer) <= idx(inner);
    const bg = picked['--color-action-primary-bg'];
    if (bg) {
      const hover = '--color-action-primary-bg-hover';
      const active = '--color-action-primary-bg-active';
      if (picked[hover] && collapsed(picked[hover], bg)) picked[hover] = walk(bg);
      if (picked[active] && picked[hover] && collapsed(picked[active], picked[hover])) {
        picked[active] = walk(picked[hover]);
      }
    }
    void lightKey;

    for (const ref of refs) {
      const cssStep = tealStepOf(theme, ref.cssVar);
      if (!registryNames.has(ref.cssVar)) continue; // reported once, below
      if (!ref[theme]) {
        if (cssStep) {
          errors.push(
            `${overridesRel}: ACTION_SEMANTIC_REFS ${ref.cssVar} is null for ${theme}, but tokens-${theme}.css points it at --primitive-teal-${cssStep} — pointer mode would skip a teal role`
          );
        }
        continue;
      }
      checkedCells += 1;
      if (!cssStep) {
        errors.push(
          `${overridesRel}: ACTION_SEMANTIC_REFS maps ${ref.cssVar} for ${theme}, but tokens-${theme}.css does not resolve it to a teal primitive`
        );
        continue;
      }
      const derived = picked[ref.cssVar];
      if (derived !== cssStep) {
        const gapKey = `${ref.cssVar}|${theme}|derived:${derived}|css:${cssStep}`;
        if (!SANCTIONED_DERIVATION_GAPS.has(gapKey)) {
          errors.push(
            `${overridesRel}: ACTION_SEMANTIC_REFS ${ref.cssVar} (${theme}) claims weight step "${ref[theme]}", which derives teal-${derived}, but tokens-${theme}.css points it at teal-${cssStep} — repoint the map or the CSS (or, for a deliberate nearest-match gap, pin it in SANCTIONED_DERIVATION_GAPS in scripts/validate-theme-mirrors.mjs)`
          );
        }
      }
    }
  }

  for (const ref of refs) {
    if (!registryNames.has(ref.cssVar)) {
      errors.push(`${overridesRel}: ACTION_SEMANTIC_REFS names ${ref.cssVar}, which is not in src/tokens/registry.json`);
    }
  }

  /* Reverse direction: every DIRECT var(--primitive-teal-*) semantic token
     must be mapped for that theme (chained --color-* refs follow a mapped
     role and are exempt — see doc block). */
  const mappedFor = (theme) =>
    new Set(refs.filter((r) => r[theme]).map((r) => r.cssVar));
  for (const [theme, decls] of [['light', lightDecls], ['dark', darkDecls]]) {
    const mapped = mappedFor(theme);
    for (const [name, value] of decls) {
      if (!/^var\(--primitive-teal-\d\d\)$/.test(value)) continue;
      if (!mapped.has(name)) {
        errors.push(
          `tokens-${theme}.css: ${name} points at the teal (action) ramp, but ACTION_SEMANTIC_REFS in ${overridesRel} has no ${theme} entry for it — pointer mode would leave it teal under a re-pointed action colour`
        );
      }
    }
  }

  summaries.push(`ACTION_SEMANTIC_REFS: ${refs.length} roles derive their shipped CSS steps (${checkedCells} theme cells, ${SANCTIONED_DERIVATION_GAPS.size} pinned nearest-match gaps, reverse teal sweep included)`);
}

/* ------------------------------------------------------------------ */
/* 4. RADIUS_STEPS ↔ the radius primitives, both directions            */
/* ------------------------------------------------------------------ */
function checkRadiusSteps() {
  const block = parseTsBlock(overridesSource, 'RADIUS_STEPS', overridesRel);
  if (block === null) return;
  const mirrored = new Map(
    [...block.matchAll(/\["([a-z-]+)",\s*(\d+)\]/g)].map((m) => [m[1], Number(m[2])])
  );
  if (mirrored.size === 0) {
    errors.push(`${overridesRel}: parsed no entries out of RADIUS_STEPS — the mirror guard needs them`);
    return;
  }
  const cssRadius = new Map();
  for (const [name, value] of primitives) {
    const m = name.match(/^--primitive-radius-([a-z-]+)$/);
    if (m) cssRadius.set(m[1], value);
  }
  for (const [step, px] of mirrored) {
    const value = cssRadius.get(step);
    if (value === undefined) {
      errors.push(`${overridesRel}: RADIUS_STEPS lists "${step}", but --primitive-radius-${step} does not exist`);
    } else if (value !== `${px}px`) {
      errors.push(`${overridesRel}: RADIUS_STEPS "${step}" is ${px}px but --primitive-radius-${step} is ${value}`);
    }
  }
  for (const step of cssRadius.keys()) {
    if (step === 'full') continue; // radiusOverrides' pill branch owns it — verified below
    if (!mirrored.has(step)) {
      errors.push(`${overridesRel}: RADIUS_STEPS is missing "${step}" (--primitive-radius-${step}) — the radius lever cannot scale it`);
    }
  }
  if (!overridesSource.includes('--primitive-radius-full')) {
    errors.push(`${overridesRel}: RADIUS_STEPS exempts "full" because the pill branch handles --primitive-radius-full, but the file no longer references it`);
  }
  summaries.push(`RADIUS_STEPS matches the ${cssRadius.size} radius primitives (${mirrored.size} scaled steps + the pill-branch "full", both directions)`);
}

/* ------------------------------------------------------------------ */
/* 5. presets.ts custom-property names all exist                       */
/* ------------------------------------------------------------------ */
function checkPresetTokenNames() {
  const rel = 'website/src/lib/theme/presets.ts';
  const source = read(join(themeDir, 'presets.ts'));
  const names = new Set();
  for (const m of source.matchAll(/var\((--[a-z0-9-]+)\)/g)) names.add(m[1]);
  for (const m of source.matchAll(/"(--[a-z0-9-]+)"/g)) names.add(m[1]);
  if (names.size === 0) {
    errors.push(`${rel}: found no custom-property names — the preset guard expects the extraOverrides maps`);
    return;
  }
  for (const name of names) {
    if (!registryNames.has(name) && !primitives.has(name)) {
      errors.push(`${rel}: references ${name}, which exists neither in src/tokens/registry.json nor in tokens-primitives.css`);
    }
  }
  summaries.push(`presets.ts: ${names.size} distinct custom-property names all resolve to real tokens`);
}

/* ------------------------------------------------------------------ */
/* 6. InspectMode's hardcoded prefixes ↔ CATEGORY_PREFIXES             */
/* ------------------------------------------------------------------ */
function checkInspectModePrefixes() {
  const rel = 'website/src/components/InspectMode/InspectMode.tsx';
  const source = read(join(repoRoot, 'website', 'src', 'components', 'InspectMode', 'InspectMode.tsx'));
  const registeredPrefixes = CATEGORY_PREFIXES.flatMap(([, prefixes]) => prefixes);
  const categoryNames = new Set(CATEGORY_PREFIXES.map(([category]) => category));

  /* Anchor: every string/template literal beginning with "--" (the file
     builds family filters and startsWith() probes from such literals);
     valid when it extends, or is a stem of, a registered prefix. */
  const found = new Set([...source.matchAll(/["'`](--[a-z][a-z0-9-]*)/g)].map((m) => m[1]));
  if (found.size === 0) {
    errors.push(`${rel}: found no hardcoded token-prefix strings — the inspect-mode guard expects its family filters`);
    return;
  }
  for (const literal of found) {
    const matches = registeredPrefixes.some(
      (prefix) => literal.startsWith(prefix) || prefix.startsWith(literal)
    );
    if (!matches) {
      errors.push(
        `${rel}: hardcodes "${literal}", which matches no prefix in CATEGORY_PREFIXES (scripts/generate-token-registry.mjs) — a stale token-family string`
      );
    }
  }

  /* Registry-category accesses: dotted (tokenRegistry.colour) and the
     ["…"] as const category list. Dynamic bracket access rides the list. */
  const usedCategories = new Set(
    [...source.matchAll(/tokenRegistry\.([a-zA-Z]+)/g)].map((m) => m[1])
  );
  const constList = source.match(/\[((?:\s*"[a-z]+"\s*,?)+)\]\s*as const/);
  for (const m of (constList?.[1] ?? '').matchAll(/"([a-z]+)"/g)) usedCategories.add(m[1]);
  for (const category of usedCategories) {
    if (!categoryNames.has(category)) {
      errors.push(
        `${rel}: reads tokenRegistry category "${category}", which is not in CATEGORY_PREFIXES (scripts/generate-token-registry.mjs)`
      );
    }
  }
  summaries.push(`InspectMode: ${found.size} hardcoded prefix strings and ${usedCategories.size} registry-category reads all match CATEGORY_PREFIXES`);
}

/* ------------------------------------------------------------------ */
/* 7. /foundations/spatial swatch data ↔ the spacing primitives        */
/* ------------------------------------------------------------------ */
function checkSpatialPage() {
  const rel = 'website/src/app/foundations/spatial/page.tsx';
  const source = read(join(repoRoot, 'website', 'src', 'app', 'foundations', 'spatial', 'page.tsx'));
  const categories = ['border', 'radius', 'gap', 'padding'];
  let rows = 0;
  let mobileRows = 0;
  const pageMobile = new Set(); // semantic names the page declares a mobile value for

  for (const category of categories) {
    const block = source.match(new RegExp(`const ${category}Tokens[^=]*=\\s*\\[([\\s\\S]*?)\\n\\];`));
    if (!block) {
      errors.push(`${rel}: could not parse ${category}Tokens — the spatial-page guard needs it`);
      continue;
    }
    const entries = [...block[1].matchAll(
      /\{\s*label:\s*"([A-Za-z0-9-]+)",\s*value:\s*"(\d+)px",\s*px:\s*(\d+),\s*variant:\s*"[a-z]+"(?:,\s*mobileValue:\s*"(\d+)px",\s*mobilePx:\s*(\d+))?\s*\}/g
    )].map((m) => ({
      label: m[1],
      px: Number(m[3]),
      mobilePx: m[5] === undefined ? null : Number(m[5]),
    }));
    if (entries.length === 0) {
      errors.push(`${rel}: parsed no rows out of ${category}Tokens — the spatial-page guard needs them`);
      continue;
    }

    const seen = new Set();
    for (const entry of entries) {
      rows += 1;
      const step = entry.label.toLowerCase();
      seen.add(step);
      const primitiveName = `--primitive-${category}-${step}`;
      const value = primitives.get(primitiveName);
      if (value === undefined) {
        errors.push(`${rel}: ${category}Tokens row "${entry.label}" names ${primitiveName}, which does not exist in tokens-primitives.css`);
        continue;
      }
      if (value !== `${entry.px}px`) {
        errors.push(`${rel}: ${category}Tokens "${entry.label}" is ${entry.px}px but ${primitiveName} is ${value}`);
      }
      if (entry.mobilePx !== null) {
        mobileRows += 1;
        const semanticName = `--${category}-${step}`;
        pageMobile.add(semanticName);
        const override = mobileDecls.get(semanticName);
        const target = override?.match(/^var\((--primitive-[a-z0-9-]+)\)$/);
        const resolved = target ? primitives.get(target[1]) : override;
        if (override === undefined) {
          errors.push(`${rel}: ${category}Tokens "${entry.label}" claims a mobile value, but the 768px block in tokens-light.css does not override ${semanticName}`);
        } else if (resolved !== `${entry.mobilePx}px`) {
          errors.push(`${rel}: ${category}Tokens "${entry.label}" claims ${entry.mobilePx}px on mobile but ${semanticName} resolves to ${resolved ?? override} below 768px`);
        }
      }
    }
    /* Reverse direction: the page presents each category as complete. */
    for (const [name] of primitives) {
      const m = name.match(new RegExp(`^--primitive-${category}-([a-z-]+)$`));
      if (m && !seen.has(m[1])) {
        errors.push(`${rel}: ${category}Tokens has no row for ${name} — the page claims to document the ${category} tokens`);
      }
    }
  }

  /* Reverse direction for the mobile column: every spacing override in the
     768px block must surface as a row's mobile value. */
  for (const [name] of mobileDecls) {
    if (!categories.some((c) => name.startsWith(`--${c}-`))) continue;
    if (!pageMobile.has(name)) {
      errors.push(`${rel}: the 768px block in tokens-light.css overrides ${name}, but no spatial-page row declares its mobile value`);
    }
  }
  summaries.push(`/foundations/spatial: ${rows} swatch rows match the border/radius/gap/padding primitives (both directions, ${mobileRows} mobile overrides included)`);
}

/* ------------------------------------------------------------------ */
/* 8. design.md token names all exist                                  */
/* ------------------------------------------------------------------ */
function checkDesignMdTokenNames() {
  const source = read(join(repoRoot, 'design.md'));
  const lines = source.split('\n');
  const re = /--(?:color|font|radius|gap|padding|border|motion|icon-size|shadow|primitive)-[a-z0-9-]+/g;
  let mentions = 0;
  const stale = new Map(); // name -> first line
  lines.forEach((line, index) => {
    for (const m of line.matchAll(re)) {
      // Skip rule (see doc block): a match ending in "-" is a family stem
      // or placeholder (`--color-status-{name}-bg`, `--font-…-*`, `…-N`,
      // `--color-<family>`), not a token name.
      if (m[0].endsWith('-')) continue;
      mentions += 1;
      if (!registryNames.has(m[0]) && !primitives.has(m[0])) {
        if (!stale.has(m[0])) stale.set(m[0], index + 1);
      }
    }
  });
  for (const [name, line] of stale) {
    errors.push(
      `design.md:${line}: mentions ${name}, which exists neither in src/tokens/registry.json nor in tokens-primitives.css — a stale or misspelled token name (a family mention belongs in \`-*\` placeholder form)`
    );
  }
  summaries.push(`design.md: ${mentions} token mentions all name real tokens`);
}

checkChromaticRamps();
checkActionColorPresets();
checkActionSemanticRefs();
checkRadiusSteps();
checkPresetTokenNames();
checkInspectModePrefixes();
checkSpatialPage();
checkDesignMdTokenNames();

if (errors.length > 0) {
  console.error(
    `✗ Theme-mirror validation failed — hand-maintained token mirrors have drifted from the token CSS:\n` +
      errors.map((e) => `    - ${e}`).join('\n')
  );
  process.exit(1);
}

for (const summary of summaries) console.log(`✓ ${summary}`);
