#!/usr/bin/env node
/**
 * validate-theme-presets.mjs
 *
 * The completeness gate on the theme presets — separate from
 * validate-preset-stylesheets.mjs's byte-compare on purpose: that one
 * proves the shipped CSS matches the composer; this one proves the
 * composer's output actually delivers "one data-brand attribute, whole
 * site rethemed" for every preset in THEME_PRESETS
 * (website/src/lib/theme/presets.ts), in both themes:
 *
 *   a. Every override NAME resolves — each custom property
 *      presetOverrides(preset, theme) emits must exist in
 *      src/tokens/registry.json, as a --primitive-* in
 *      tokens-primitives.css, or as one of the icon font's axis hooks
 *      (the --material-symbols-* properties src/fonts/material-symbols.css
 *      consumes with a fallback: documented override hooks, not registry
 *      tokens, read from that file rather than listed here). The lever
 *      functions synthesize names from step tables, so a renamed token
 *      could otherwise leave a preset declaring a property nothing reads.
 *   b. Required coverage — the action family (--color-action-primary-bg,
 *      -bg-hover, -bg-active, -text at minimum) must be explicitly
 *      overridden, or provably intended-default. The rule: a preset
 *      whose brand for the theme (brandDark in dark, where set) equals
 *      DEFAULT_BRAND is intended-default, because actionColorPlan
 *      short-circuits that hex to a null plan by design and the shipped
 *      token files carry the family. Anything else must say what the
 *      action colour is, or the preset silently inherits the teal.
 *      The ambient accent sextet (--color-core-accent-*) is required too,
 *      with NO intended-default exemption: the accents are a declared
 *      lever (they drive the background blobs and chart series 2-7), so
 *      every preset must emit all six in both themes — the shipped keys
 *      are still a declaration.
 *   c. Contrast in every state — each row of ACTION_PAIRINGS below (an
 *      action fill, the label or icon a component draws on it, and the
 *      minimum: 4.5:1 for text, 3:1 for icons and strokes) must hold in
 *      both themes, for every preset AND for the shipped token files.
 *      Resting, hover and pressed fills are all rows, because a theme
 *      override that repaints a fill without its foreground is exactly
 *      how Volt shipped a near-black hover icon on a near-black fill.
 *      The table is held in both directions: every --color-action-*-bg*
 *      token in the registry must be some row's fill, so a new state fill
 *      cannot ship without naming what sits on it. Resolution follows
 *      var() chains through the preset's own override map first, then
 *      the theme's token CSS (dark falling through to light), then the
 *      primitives; rgba() values are composited over the theme's
 *      resolved page background (--color-bg-page-primary). A cell that
 *      genuinely cannot clear its minimum is pinned in SANCTIONED_AA_GAPS
 *      with the pairing and the computed ratio recorded — never silently
 *      weakened.
 *   d. Lever completeness — every lever in NUMBER_LEVERS below, plus
 *      elevation and iconFill, must be present on every preset. The required TS schema
 *      already guarantees this at compile time; the runtime assert
 *      guards JS-side consumers of the object (and any future
 *      JSON-shaped source that bypasses the type).
 *
 * Belongs in the validate-registry chain (and the website prebuild),
 * right after validate-preset-stylesheets.mjs: it reads theme source and
 * token CSS, never build output.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadThemeSource } from './generate-preset-stylesheets.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const tokensDir = join(repoRoot, 'src', 'tokens');

// Normalize CRLF so Windows checkouts validate identically to CI.
const read = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

const parseDeclarations = (css) => {
  const declarations = new Map();
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of stripped.matchAll(/^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);/gim)) {
    if (!declarations.has(m[1])) declarations.set(m[1], m[2].trim());
  }
  return declarations;
};

const primitives = parseDeclarations(read(join(tokensDir, 'tokens-primitives.css')));
const lightDecls = parseDeclarations(read(join(tokensDir, 'tokens-light.css')));
const darkDecls = parseDeclarations(read(join(tokensDir, 'tokens-dark.css')));
/* The icon font's axis hooks: every custom property material-symbols.css
   reads with a fallback. The icon levers write these. */
const iconHooks = new Set(
  [...read(join(repoRoot, 'src', 'fonts', 'material-symbols.css')).matchAll(
    /var\((--material-symbols-[a-z-]+)\s*,/g
  )].map((m) => m[1])
);
const registryNames = new Set(
  Object.values(JSON.parse(read(join(tokensDir, 'registry.json'))).categories).flat()
);

/** Every foreground the components draw on an action fill, per state:
    [fill, foreground, minimum ratio, what draws it]. Text needs WCAG AA
    4.5:1; an icon or check stroke is non-text UI and needs 3:1 (WCAG
    1.4.11). The resting pair alone is not enough: hover and pressed fills
    move while a theme's label override may not move with them, which is
    how Volt shipped a near-black icon on a near-black hover fill.

    Held in both directions: every --color-action-*-bg* token in the
    registry must be the fill of at least one row, so a new state fill
    cannot ship without saying what sits on it. */
const ACTION_PAIRINGS = [
  ['--color-action-primary-bg', '--color-action-primary-text', 4.5, 'primary Button, selected Chip and SegmentedControl labels'],
  ['--color-action-primary-bg-hover', '--color-action-primary-text', 4.5, 'selected Chip and SegmentedControl labels on hover'],
  ['--color-action-primary-bg-active', '--color-action-primary-text', 4.5, 'selected Chip label when pressed'],
  ['--color-action-primary-bg-hover', '--color-action-primary-text-active', 4.5, 'Button and CircularButton labels on hover'],
  ['--color-action-primary-bg-active', '--color-action-primary-text-active', 4.5, 'Button and CircularButton labels when pressed'],
  ['--color-action-primary-bg', '--color-action-primary-text-active', 3, 'Checkbox check stroke'],
  ['--color-action-primary-bg-hover', '--color-action-icon-active', 3, 'outlined Button and CircularButton icons on hover'],
  ['--color-action-primary-bg-active', '--color-action-icon-active', 3, 'outlined Button and CircularButton icons when pressed'],
  ['--color-action-neutral-bg', '--color-action-neutral-text', 4.5, 'neutral Button labels'],
  ['--color-action-neutral-bg-hover', '--color-action-neutral-text', 4.5, 'neutral Button labels on hover'],
  ['--color-action-neutral-bg-active', '--color-action-neutral-text', 4.5, 'neutral Button labels when pressed'],
  ['--color-action-passive-bg', '--color-action-passive-text', 4.5, 'tertiary Button labels'],
  ['--color-action-passive-bg-hover', '--color-action-passive-text', 4.5, 'tertiary Button labels on hover'],
  ['--color-action-passive-bg-active', '--color-action-passive-text', 4.5, 'tertiary Button labels when pressed'],
];

/** Pairings that genuinely fail today, keyed "<preset>|<theme>|<fill>|<foreground>"
    (the preset id "shipped" is the unthemed token files) and pinned with
    their computed ratio, so a change in either direction (a fix, or a
    further regression) fails until the pin moves. Each pin's reason is
    its authoritative record — pinning is deliberate acceptance, never a
    silent weakening of the gate. Currently empty: every cell holds. */
const SANCTIONED_AA_GAPS = new Map([]);

/** d. The levers a preset stores as a number. */
const NUMBER_LEVERS = [
  'density',
  'typeScale',
  'motionScale',
  'displayWeight',
  'headingWeight',
  'tracking',
  'iconWeight',
];

const REQUIRED_ACTION_ROLES = [
  '--color-action-primary-bg',
  '--color-action-primary-bg-hover',
  '--color-action-primary-bg-active',
  '--color-action-primary-text',
];

/* The ambient accent sextet is a declared lever on every preset — unlike
   the action family there is no intended-default exemption (see doc
   block, check b). */
const REQUIRED_ACCENT_ROLES = [
  '--color-core-accent-coral',
  '--color-core-accent-violet',
  '--color-core-accent-cobalt',
  '--color-core-accent-amber',
  '--color-core-accent-gold',
  '--color-core-accent-mint',
];

const errors = [];

const { THEME_PRESETS, presetOverrides, DEFAULT_BRAND } = await loadThemeSource();

/** Resolve a custom property to a literal value: the preset's override
    map first, then the theme's semantic CSS (dark falls through to
    light), then the primitives, following var() chains. */
const resolveValue = (name, theme, overrides) => {
  let current = name;
  for (let depth = 0; depth < 32; depth++) {
    const value =
      overrides[current] ??
      (theme === 'dark' ? (darkDecls.get(current) ?? lightDecls.get(current)) : lightDecls.get(current)) ??
      primitives.get(current);
    if (value === undefined) return null;
    const m = value.match(/^var\((--[a-z0-9-]+)\)$/);
    if (!m) return value;
    current = m[1];
  }
  return null;
};

/** [r, g, b, a] out of #RRGGBB or rgba(r, g, b, a); null otherwise. */
const parseColor = (value) => {
  const hex = value.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    return [1, 3, 5].map((i) => parseInt(hex[1].slice(i - 1, i + 1), 16)).concat(1);
  }
  const rgba = value.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([0-9.]+)\s*)?\)$/);
  if (rgba) return [Number(rgba[1]), Number(rgba[2]), Number(rgba[3]), Number(rgba[4] ?? 1)];
  return null;
};

const compositeOver = (fg, bg) =>
  fg[3] >= 1 ? fg.slice(0, 3) : fg.slice(0, 3).map((c, i) => c * fg[3] + bg[i] * (1 - fg[3]));

const relativeLuminance = ([r, g, b]) => {
  const linearize = (c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
};

const contrastRatio = (a, b) => {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

let minRatio = Infinity;
let cells = 0;
let pairChecks = 0;

/** c. Contrast for every ACTION_PAIRINGS row in one theme cell. */
const checkPairings = (id, theme, overrides) => {
  const label = id === 'shipped' ? `shipped tokens (${theme})` : `preset "${id}" (${theme})`;
  const resolveRgb = (name, under) => {
    const value = resolveValue(name, theme, overrides);
    const color = value === null ? null : parseColor(value);
    if (!color) {
      errors.push(`${label}: ${name} resolves to ${value ?? 'nothing'}, not a colour — the contrast check cannot judge it`);
      return null;
    }
    return under ? compositeOver(color, under) : color.slice(0, 3);
  };
  const pageBg = resolveRgb('--color-bg-page-primary', null);
  if (!pageBg) return;
  for (const [fillName, fgName, min, usage] of ACTION_PAIRINGS) {
    const fill = resolveRgb(fillName, pageBg);
    const fg = fill && resolveRgb(fgName, fill);
    if (!fill || !fg) continue;
    pairChecks += 1;
    const ratio = contrastRatio(fill, fg);
    minRatio = Math.min(minRatio, ratio / min);
    const key = `${id}|${theme}|${fillName}|${fgName}`;
    const pinned = SANCTIONED_AA_GAPS.get(key);
    if (ratio < min) {
      if (pinned !== ratio.toFixed(2)) {
        errors.push(
          `${label}: ${fgName} on ${fillName} is ${ratio.toFixed(2)}:1, below ${min}:1 (${usage}; ` +
            `fill rgb(${fill.map(Math.round).join(', ')}), foreground rgb(${fg.map(Math.round).join(', ')})) — ` +
            `fix the pairing, or pin "${key}" at "${ratio.toFixed(2)}" in SANCTIONED_AA_GAPS with the reason`
        );
      }
    } else if (pinned !== undefined) {
      errors.push(`${label}: "${key}" is pinned in SANCTIONED_AA_GAPS but now clears ${min}:1 at ${ratio.toFixed(2)}:1 — remove the pin`);
    }
  }
};

for (const [id, preset] of Object.entries(THEME_PRESETS)) {
  // d. Lever completeness (runtime guard over the required schema).
  for (const lever of NUMBER_LEVERS) {
    if (typeof preset[lever] !== 'number') {
      errors.push(`preset "${id}": lever "${lever}" is missing or not a number`);
    }
  }
  if (typeof preset.elevation !== 'string' || preset.elevation.length === 0) {
    errors.push(`preset "${id}": lever "elevation" is missing`);
  }
  if (typeof preset.iconFill !== 'boolean') {
    errors.push(`preset "${id}": lever "iconFill" is missing or not a boolean`);
  }

  for (const theme of ['light', 'dark']) {
    cells += 1;
    const overrides = presetOverrides(preset, theme);

    // a. Every override name is a real token or primitive.
    for (const name of Object.keys(overrides)) {
      if (!registryNames.has(name) && !primitives.has(name) && !iconHooks.has(name)) {
        errors.push(
          `preset "${id}" (${theme}): overrides ${name}, which exists neither in ` +
            `src/tokens/registry.json nor in tokens-primitives.css, and is not an icon axis hook in src/fonts/material-symbols.css`
        );
      }
    }

    // b. Action-family coverage, or provably intended-default.
    const themeBrand =
      theme === 'dark' && preset.brandDark ? preset.brandDark : preset.brand;
    const intendedDefault = themeBrand.toUpperCase() === DEFAULT_BRAND.toUpperCase();
    if (!intendedDefault) {
      for (const role of REQUIRED_ACTION_ROLES) {
        if (!(role in overrides)) {
          errors.push(
            `preset "${id}" (${theme}): ${role} is neither overridden nor intended-default ` +
              `(brand ${themeBrand} !== DEFAULT_BRAND ${DEFAULT_BRAND}) — the preset would inherit the shipped teal`
          );
        }
      }
    }

    // b (continued). Ambient accent coverage — all six, no exemption.
    for (const role of REQUIRED_ACCENT_ROLES) {
      const value = overrides[role];
      if (typeof value !== 'string' || value.trim().length === 0) {
        errors.push(
          `preset "${id}" (${theme}): ${role} is ${value === undefined ? 'not declared' : 'empty'} — ` +
            `the ambient accent sextet is a required lever (it drives the background blobs and chart series 2-7)`
        );
      }
    }

    checkPairings(id, theme, overrides);
  }
}

// c (continued). The shipped token files are held to the same table, so
// the base theme cannot regress a state the presets inherit.
for (const theme of ['light', 'dark']) {
  cells += 1;
  checkPairings('shipped', theme, {});
}

// c (reverse). Every action fill in the registry is some row's fill.
const pairedFills = new Set(ACTION_PAIRINGS.map(([fill]) => fill));
for (const name of registryNames) {
  if (/^--color-action-.*-bg(-[a-z]+)?$/.test(name) && !pairedFills.has(name)) {
    errors.push(
      `${name} is an action fill with no row in ACTION_PAIRINGS (scripts/validate-theme-presets.mjs) — ` +
        `add the label or icon each component draws on it, so its contrast is checked in every preset`
    );
  }
}
for (const [fill, fg] of ACTION_PAIRINGS) {
  for (const name of [fill, fg]) {
    if (!registryNames.has(name)) {
      errors.push(`ACTION_PAIRINGS names ${name}, which is not in src/tokens/registry.json`);
    }
  }
}

if (errors.length > 0) {
  console.error(
    '✗ Theme preset validation failed — a preset does not deliver a complete data-brand theme:\n' +
      errors.map((e) => `    - ${e}`).join('\n')
  );
  process.exit(1);
}

console.log(
  `✓ Theme presets complete — ${Object.keys(THEME_PRESETS).length} presets × 2 themes: every override names a real token, ` +
    `the action family and all ${REQUIRED_ACCENT_ROLES.length} ambient accents are covered, and all ${ACTION_PAIRINGS.length} action ` +
    `fill/foreground pairings hold contrast across ${cells} theme cells (${pairChecks} checks, ${SANCTIONED_AA_GAPS.size} pinned gaps, ` +
    `tightest at ${minRatio.toFixed(2)}× its minimum).`
);
