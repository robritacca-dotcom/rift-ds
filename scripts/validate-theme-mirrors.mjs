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
 *    specials carry no NN step so they never match. The same check also
 *    asserts each CSS ramp's monotonicity: computed relative luminance
 *    (WCAG, sRGB-linearized) must be strictly decreasing from step 00
 *    down to 11, so a retuned step can never reintroduce a kink where a
 *    mid step sits darker than the one below it.
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
 *    dark falling through to light). A handful of (cssVar, theme) cells
 *    diverge by design — nearest-step matching is approximate, the mirror's own doc
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
 *    One sanctioned absence: "pill" is handled by radiusOverrides' pill
 *    branch rather than the table, so it is exempt from the reverse
 *    direction — and the exemption is itself checked: the file must still
 *    reference --primitive-radius-pill literally, or the exemption fails.
 *
 * 4b. The lever tables (same file): GAP_STEPS, PADDING_STEPS,
 *    FONT_SIZE_STEPS and FONT_LINE_HEIGHT_STEPS held to their token
 *    ladders in both directions; MOTION_DURATION_STEPS held to every
 *    --motion-duration-* except instant and loop-* (both directions, so a
 *    new paced duration such as orbit cannot ship unscaled); and
 *    ELEVATION_VARIANTS.default pinned to the shipped shadows per theme.
 *    TYPE_STYLES (the weight and tracking levers' table) is held to the
 *    --font-<style>-weight and --font-<style>-letter-spacing tokens in
 *    both directions, and its display and heading tiers must each hold
 *    one weight, because each weight lever has a single shipped position.
 *    SHIPPED_ICON_WEIGHT and SHIPPED_ICON_FILL are held to the fallbacks
 *    src/fonts/material-symbols.css gives the axis hooks the icon levers
 *    write.
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
 * 9. src/tokens/motion.ts — a JS constant whose doc comment says it
 *    "mirrors --motion-duration-<name>" must equal that token's ms value
 *    (MOTION_EXIT_SYNC_MS against base, MOTION_ORBIT_REFERENCE_MS against
 *    orbit). The doc comment is the opt-in, so a new mirror is guarded the
 *    moment it says what it mirrors.
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

  /* Monotonicity: relative luminance (WCAG, sRGB-linearized) must strictly
     decrease down every CSS ramp, so light→dark ordering holds from 00 to
     11 and a retuned step cannot reintroduce a kink. */
  const linearize = (c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const relativeLuminance = (hex) => {
    const [r, g, b] = [1, 3, 5].map((i) => linearize(parseInt(hex.slice(i, i + 2), 16)));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  for (const [ramp, cssSteps] of cssChromatic) {
    const ordered = [...cssSteps.keys()].sort((a, b) => Number(a) - Number(b));
    for (let i = 1; i < ordered.length; i++) {
      const [above, below] = [ordered[i - 1], ordered[i]];
      const [lumAbove, lumBelow] = [cssSteps.get(above), cssSteps.get(below)].map(relativeLuminance);
      if (!(lumBelow < lumAbove)) {
        errors.push(
          `tokens-primitives.css: --primitive-${ramp}-${below} (${cssSteps.get(below)}, L=${lumBelow.toFixed(4)}) is not darker than ` +
            `--primitive-${ramp}-${above} (${cssSteps.get(above)}, L=${lumAbove.toFixed(4)}) — relative luminance must strictly decrease down every chromatic ramp`
        );
      }
    }
  }

  summaries.push(`CHROMATIC_RAMPS matches the ${cssChromatic.size} chromatic primitive ramps (${held} steps, both directions, luminance strictly decreasing)`);
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
  /* The 00–11 ramp widening put teal-11 in the candidate set, and the
     deepest-shade intents now sit nearest to it; the shipped CSS keeps
     the drawn teal-10 (shipped keys never render from the derivation). */
  '--color-action-primary-text-secondary|light|derived:11|css:10',
  '--color-action-primary-border|light|derived:11|css:10',
  '--color-core-ui-secondary|light|derived:11|css:10',
  '--color-action-primary-text|dark|derived:11|css:10',
  '--color-action-primary-text-active|dark|derived:11|css:10',
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
    const keyLum = luminance(hexToRgb(keyHex));
    const brighten = keyLum > 0.5 && keyLum < 0.9;
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
    [...block.matchAll(/\["([a-z0-9-]+)",\s*(\d+)\]/g)].map((m) => [m[1], Number(m[2])])
  );
  if (mirrored.size === 0) {
    errors.push(`${overridesRel}: parsed no entries out of RADIUS_STEPS — the mirror guard needs them`);
    return;
  }
  const cssRadius = new Map();
  for (const [name, value] of primitives) {
    const m = name.match(/^--primitive-radius-([a-z0-9-]+)$/);
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
    if (step === 'pill') continue; // radiusOverrides' pill branch owns it — verified below
    if (!mirrored.has(step)) {
      errors.push(`${overridesRel}: RADIUS_STEPS is missing "${step}" (--primitive-radius-${step}) — the radius lever cannot scale it`);
    }
  }
  if (!overridesSource.includes('--primitive-radius-pill')) {
    errors.push(`${overridesRel}: RADIUS_STEPS exempts "pill" because the pill branch handles --primitive-radius-pill, but the file no longer references it`);
  }
  summaries.push(`RADIUS_STEPS matches the ${cssRadius.size} radius primitives (${mirrored.size} scaled steps + the pill-branch "pill", both directions)`);
}

/* ------------------------------------------------------------------ */
/* 4b. The lever tables (density, type scale, motion, elevation)       */
/*     GAP_STEPS / PADDING_STEPS / FONT_SIZE_STEPS /                   */
/*     FONT_LINE_HEIGHT_STEPS mirror their token ladders both          */
/*     directions; MOTION_DURATION_STEPS mirrors the schedule          */
/*     durations in tokens-motion.css (loop-* and instant are          */
/*     deliberately outside the lever — instant exists to sit under    */
/*     the perception threshold, loop periods are an animation's       */
/*     identity); ELEVATION_VARIANTS.default must equal the shipped    */
/*     shadow tokens per theme, so the lever's no-op cannot drift.     */
/* ------------------------------------------------------------------ */
function checkLeverTables() {
  const parseTable = (constName) => {
    const block = parseTsBlock(overridesSource, constName, overridesRel);
    if (block === null) return null;
    const map = new Map(
      [...block.matchAll(/\["([a-z0-9-]+)",\s*(\d+)\]/g)].map((m) => [m[1], Number(m[2])])
    );
    if (map.size === 0) {
      errors.push(`${overridesRel}: parsed no entries out of ${constName} — the mirror guard needs them`);
      return null;
    }
    return map;
  };
  const holdBoth = (constName, table, cssMap, nameFor, unit) => {
    if (table === null) return 0;
    for (const [step, value] of table) {
      const cssValue = cssMap.get(nameFor(step));
      if (cssValue === undefined) {
        errors.push(`${overridesRel}: ${constName} lists "${step}", but ${nameFor(step)} does not exist`);
      } else if (cssValue !== `${value}${unit}`) {
        errors.push(`${overridesRel}: ${constName} "${step}" is ${value}${unit} but ${nameFor(step)} is ${cssValue}`);
      }
    }
    for (const name of cssMap.keys()) {
      const step = name.slice(name.lastIndexOf('-') + 1);
      if (!table.has(step)) {
        errors.push(`${overridesRel}: ${constName} has no entry for ${name} — the lever would skip it`);
      }
    }
    return table.size;
  };
  const subset = (prefix, source_) => {
    const out = new Map();
    for (const [name, value] of parseDeclarations(source_)) {
      if (name.startsWith(prefix) && /^[0-9]+$/.test(name.slice(prefix.length))) out.set(name, value);
    }
    return out;
  };

  const primitivesSource = read(join(tokensDir, 'tokens-primitives.css'));
  const typographySource = read(join(tokensDir, 'tokens-typography.css'));
  const motionSource = read(join(tokensDir, 'tokens-motion.css'));

  const gapCount = holdBoth('GAP_STEPS', parseTable('GAP_STEPS'),
    subset('--primitive-gap-', primitivesSource), (s2) => `--primitive-gap-${s2}`, 'px');
  const padCount = holdBoth('PADDING_STEPS', parseTable('PADDING_STEPS'),
    subset('--primitive-padding-', primitivesSource), (s2) => `--primitive-padding-${s2}`, 'px');
  const sizeCount = holdBoth('FONT_SIZE_STEPS', parseTable('FONT_SIZE_STEPS'),
    subset('--font-size-', typographySource), (s2) => `--font-size-${s2}`, 'px');
  const lhCount = holdBoth('FONT_LINE_HEIGHT_STEPS', parseTable('FONT_LINE_HEIGHT_STEPS'),
    subset('--font-line-height-', typographySource), (s2) => `--font-line-height-${s2}`, 'px');

  // Schedule durations: every --motion-duration-<name> that is neither
  // loop-* nor instant must be in the table with its ms value, and vice
  // versa. The reduced-motion 0.01ms re-declarations are skipped because
  // parseDeclarations keeps the first (the :root) declaration of a name.
  const motionTable = parseTable('MOTION_DURATION_STEPS');
  if (motionTable !== null) {
    const durations = new Map();
    for (const [name, value] of parseDeclarations(motionSource)) {
      const m = name.match(/^--motion-duration-([a-z-]+)$/);
      if (m && m[1] !== 'instant' && !m[1].startsWith('loop-')) durations.set(m[1], value);
    }
    for (const [name, ms] of motionTable) {
      const cssValue = durations.get(name);
      if (cssValue === undefined) {
        errors.push(`${overridesRel}: MOTION_DURATION_STEPS lists "${name}", but --motion-duration-${name} does not exist (or is instant/loop-*, which the lever must not pace)`);
      } else if (cssValue !== `${ms}ms`) {
        errors.push(`${overridesRel}: MOTION_DURATION_STEPS "${name}" is ${ms}ms but --motion-duration-${name} is ${cssValue}`);
      }
    }
    for (const name of durations.keys()) {
      if (!motionTable.has(name)) {
        errors.push(`${overridesRel}: MOTION_DURATION_STEPS has no entry for --motion-duration-${name} — the motion lever would skip it`);
      }
    }
  }

  // ELEVATION_VARIANTS.default ↔ the shipped shadow tokens, per theme.
  const defaultBlock = overridesSource.match(/default:\s*\{\s*light:\s*\{\s*floating:\s*"([^"]+)",\s*modal:\s*"([^"]+)"\s*\},\s*dark:\s*\{\s*floating:\s*"([^"]+)",\s*modal:\s*"([^"]+)"\s*\}/);
  if (!defaultBlock) {
    errors.push(`${overridesRel}: could not parse ELEVATION_VARIANTS.default — the elevation guard needs it`);
  } else {
    const darkDecls = parseDeclarations(read(join(tokensDir, 'tokens-dark.css')));
    const expected = [
      ['light', '--shadow-floating', lightDecls.get('--shadow-floating'), defaultBlock[1]],
      ['light', '--shadow-modal', lightDecls.get('--shadow-modal'), defaultBlock[2]],
      ['dark', '--shadow-floating', darkDecls.get('--shadow-floating'), defaultBlock[3]],
      ['dark', '--shadow-modal', darkDecls.get('--shadow-modal'), defaultBlock[4]],
    ];
    for (const [themeName, token, css, mirrored2] of expected) {
      if (css !== mirrored2) {
        errors.push(`${overridesRel}: ELEVATION_VARIANTS.default ${themeName} ${token} is "${mirrored2}" but the token file ships "${css}" — the lever's no-op has drifted`);
      }
    }
  }

  // TYPE_STYLES ↔ the type styles' weight and letter-spacing tokens.
  const typeBlock = parseTsBlock(overridesSource, 'TYPE_STYLES', overridesRel);
  const typeRows = typeBlock === null ? [] : [
    ...typeBlock.matchAll(/\["([a-z0-9-]+)",\s*"(display|heading|body)",\s*(\d+),\s*(-?[0-9.]+)\]/g),
  ].map((m) => ({ style: m[1], tier: m[2], weight: m[3], tracking: Number(m[4]) }));
  if (typeBlock !== null && typeRows.length === 0) {
    errors.push(`${overridesRel}: parsed no entries out of TYPE_STYLES — the mirror guard needs them`);
  }
  if (typeRows.length > 0) {
    const typeDecls = parseDeclarations(typographySource);
    for (const row of typeRows) {
      const weightName = `--font-${row.style}-weight`;
      const trackingName = `--font-${row.style}-letter-spacing`;
      const cssWeight = typeDecls.get(weightName);
      const cssTracking = typeDecls.get(trackingName);
      const mirroredTracking = row.tracking === 0 ? '0' : `${row.tracking}em`;
      if (cssWeight === undefined || cssTracking === undefined) {
        errors.push(`${overridesRel}: TYPE_STYLES lists "${row.style}", but ${weightName} or ${trackingName} does not exist`);
        continue;
      }
      if (cssWeight !== row.weight) {
        errors.push(`${overridesRel}: TYPE_STYLES "${row.style}" weight is ${row.weight} but ${weightName} is ${cssWeight}`);
      }
      if (cssTracking !== mirroredTracking) {
        errors.push(`${overridesRel}: TYPE_STYLES "${row.style}" tracking is ${mirroredTracking} but ${trackingName} is ${cssTracking}`);
      }
    }
    const listed = new Set(typeRows.map((r) => r.style));
    for (const name of typeDecls.keys()) {
      const m = name.match(/^--font-([a-z0-9-]+)-weight$/);
      if (m && !listed.has(m[1])) {
        errors.push(`${overridesRel}: TYPE_STYLES has no entry for ${name} — the weight and tracking levers would skip it`);
      }
    }
    for (const tier of ['display', 'heading']) {
      const weights = new Set(typeRows.filter((r) => r.tier === tier).map((r) => r.weight));
      if (weights.size !== 1) {
        errors.push(`${overridesRel}: TYPE_STYLES ${tier} tier holds ${weights.size} weights (${[...weights].join(', ')}) — its weight lever needs one shipped position`);
      }
    }
  }

  // SHIPPED_ICON_WEIGHT / SHIPPED_ICON_FILL ↔ the icon font's hook fallbacks.
  const iconCss = read(join(repoRoot, 'src', 'fonts', 'material-symbols.css'));
  for (const [constName, hook] of [
    ['SHIPPED_ICON_WEIGHT', '--material-symbols-weight'],
    ['SHIPPED_ICON_FILL', '--material-symbols-fill'],
  ]) {
    const mirrored = overridesSource.match(new RegExp(`export const ${constName} = (\\d+);`));
    const fallback = iconCss.match(new RegExp(`var\\(${hook},\\s*(\\d+)\\)`));
    if (!mirrored) {
      errors.push(`${overridesRel}: could not parse ${constName} — the icon lever guard needs it`);
    } else if (!fallback) {
      errors.push(`src/fonts/material-symbols.css: no longer reads ${hook} with a fallback — the icon lever writes it`);
    } else if (mirrored[1] !== fallback[1]) {
      errors.push(`${overridesRel}: ${constName} is ${mirrored[1]} but material-symbols.css falls back to ${fallback[1]} for ${hook}`);
    }
    if (!overridesSource.includes(`"${hook}"`)) {
      errors.push(`${overridesRel}: ${constName} mirrors ${hook}, but the file no longer writes that hook`);
    }
  }

  summaries.push(`Type styles match their weight and tracking tokens (${typeRows.length} styles), icon lever defaults match the icon font's fallbacks`);
  summaries.push(`Lever tables match their ladders — gap ${gapCount}, padding ${padCount}, font-size ${sizeCount}, line-height ${lhCount}, motion ${motionTable ? motionTable.size : 0} durations, elevation default pinned to the shipped shadows`);
}

/* ------------------------------------------------------------------ */
/* 4c. SHIPPED_ACCENTS ↔ the --color-core-accent-* tokens              */
/*     The accents lever's shipped seed (theme-overrides.ts) is held    */
/*     to tokens-light.css in BOTH directions: every entry's hex must   */
/*     equal what its --color-core-accent-<name> token resolves to      */
/*     (following var() through the primitives), and every accent       */
/*     token in the CSS must have an entry — a renamed or retuned       */
/*     accent cannot leave the playground seeding a stale key.          */
/* ------------------------------------------------------------------ */
function checkShippedAccents() {
  const block = overridesSource.match(/const SHIPPED_ACCENTS[^=]*=\s*\{([\s\S]*?)\n\};/);
  if (!block) {
    errors.push(`${overridesRel}: could not parse SHIPPED_ACCENTS — the accent mirror guard needs it`);
    return;
  }
  const mirrored = new Map(
    [...block[1].matchAll(/([a-z]+):\s*"(#[0-9A-Fa-f]{6})"/g)].map((m) => [m[1], m[2]])
  );
  if (mirrored.size === 0) {
    errors.push(`${overridesRel}: parsed no entries out of SHIPPED_ACCENTS — the accent mirror guard needs them`);
    return;
  }

  const resolveHex = (name) => {
    let current = lightDecls.get(name) ?? primitives.get(name);
    for (let depth = 0; current !== undefined && depth < 8; depth++) {
      const m = current.match(/^var\((--[a-z0-9-]+)\)$/);
      if (!m) return current;
      current = lightDecls.get(m[1]) ?? primitives.get(m[1]);
    }
    return current;
  };

  for (const [name, hex] of mirrored) {
    const token = `--color-core-accent-${name}`;
    if (!lightDecls.has(token)) {
      errors.push(`${overridesRel}: SHIPPED_ACCENTS lists "${name}", but ${token} does not exist in tokens-light.css`);
      continue;
    }
    const resolved = resolveHex(token);
    if (typeof resolved !== 'string' || resolved.toLowerCase() !== hex.toLowerCase()) {
      errors.push(
        `${overridesRel}: SHIPPED_ACCENTS.${name} is ${hex} but ${token} resolves to ${resolved ?? 'nothing'} in tokens-light.css`
      );
    }
  }
  for (const [name] of lightDecls) {
    const m = name.match(/^--color-core-accent-([a-z]+)$/);
    if (m && !mirrored.has(m[1])) {
      errors.push(
        `${overridesRel}: tokens-light.css defines ${name}, but SHIPPED_ACCENTS has no "${m[1]}" entry — the accents lever cannot seed it`
      );
    }
  }
  summaries.push(
    `SHIPPED_ACCENTS matches the ${mirrored.size} --color-core-accent-* tokens' resolved keys (both directions)`
  );
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

/* ------------------------------------------------------------------ */
/* 9. motion.ts constants that mirror a duration token                 */
/* ------------------------------------------------------------------ */
function checkMotionMirrors() {
  const rel = 'src/tokens/motion.ts';
  const source = read(join(repoRoot, rel));
  const motionDecls = parseDeclarations(read(join(tokensDir, 'tokens-motion.css')));
  const re = /\/\*\*((?:(?!\*\/)[\s\S])*?)\*\/\s*export const (\w+) = (\d+);/g;
  let held = 0;
  for (const [, doc, name, value] of source.matchAll(re)) {
    const m = doc.match(/mirrors (--motion-duration-[a-z-]+)/);
    if (!m) continue;
    held += 1;
    const css = motionDecls.get(m[1]);
    if (css === undefined) {
      errors.push(`${rel}: ${name} says it mirrors ${m[1]}, which tokens-motion.css does not define`);
    } else if (css !== `${value}ms`) {
      errors.push(`${rel}: ${name} is ${value}ms but ${m[1]} is ${css} — the mirror has drifted`);
    }
  }
  summaries.push(`motion.ts: ${held} constants documented as token mirrors match their --motion-duration-* values`);
}

checkChromaticRamps();
checkActionColorPresets();
checkActionSemanticRefs();
checkRadiusSteps();
checkLeverTables();
checkShippedAccents();
checkPresetTokenNames();
checkInspectModePrefixes();
checkSpatialPage();
checkDesignMdTokenNames();
checkMotionMirrors();

if (errors.length > 0) {
  console.error(
    `✗ Theme-mirror validation failed — hand-maintained token mirrors have drifted from the token CSS:\n` +
      errors.map((e) => `    - ${e}`).join('\n')
  );
  process.exit(1);
}

for (const summary of summaries) console.log(`✓ ${summary}`);
