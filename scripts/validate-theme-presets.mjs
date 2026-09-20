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
 *      src/tokens/registry.json or as a --primitive-* in
 *      tokens-primitives.css. The lever functions synthesize names from
 *      step tables, so a renamed token could otherwise leave a preset
 *      declaring a property nothing reads.
 *   b. Required coverage — the action family (--color-action-primary-bg,
 *      -bg-hover, -bg-active, -text at minimum) must be explicitly
 *      overridden, or provably intended-default. The rule: a preset
 *      whose brand for the theme (brandDark in dark, where set) equals
 *      DEFAULT_BRAND is intended-default, because actionColorPlan
 *      short-circuits that hex to a null plan by design and the shipped
 *      token files carry the family. Anything else must say what the
 *      action colour is, or the preset silently inherits the teal.
 *   c. WCAG AA — the resolved action-primary bg and text must contrast
 *      at 4.5:1 or better in both themes. Resolution follows var()
 *      chains through the preset's own override map first, then the
 *      theme's token CSS (dark falling through to light), then the
 *      primitives; rgba() values are composited over the theme's
 *      resolved page background (--color-bg-page-primary). A preset that
 *      genuinely cannot clear AA is pinned in SANCTIONED_AA_GAPS below
 *      with both the pairing and the computed ratio recorded — never
 *      silently weakened.
 *   d. Lever completeness — density, typeScale, motionScale and
 *      elevation must be present on every preset. The required TS schema
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
const registryNames = new Set(
  Object.values(JSON.parse(read(join(tokensDir, 'registry.json'))).categories).flat()
);

/** AA pairings that genuinely fail today, pinned with their computed
    ratio so a change in either direction (a fix, or a further regression)
    fails until the pin moves. Each pin's reason is its authoritative
    record — pinning is deliberate acceptance, never a silent weakening
    of the gate. Pinned 2026-09-19:
      - classic: the pre-split revert handle. It exists to reproduce the
        shipped theme as it was BEFORE the accessible-teal split, whose
        entire point was that no single teal step can carry an AA label
        in both themes — failing AA is this preset's documented identity.
      - coral: reproduces the hospitality brand's own coral fill under a
        near-white label; the reference product ships the same sub-AA
        pairing. Kept faithful to the look it demonstrates.
      - terminal: the green-08 key's darkest ramp label lands just under
        the line. Accepted for the phosphor look; the nearest AA-clearing
        alternative changes the key colour itself. */
const SANCTIONED_AA_GAPS = new Map([
  ['classic|light', '3.15'],
  ['classic|dark', '3.15'],
  ['coral|light', '3.08'],
  ['coral|dark', '3.08'],
  ['terminal|light', '4.42'],
  ['terminal|dark', '4.42'],
]);

const REQUIRED_ACTION_ROLES = [
  '--color-action-primary-bg',
  '--color-action-primary-bg-hover',
  '--color-action-primary-bg-active',
  '--color-action-primary-text',
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

for (const [id, preset] of Object.entries(THEME_PRESETS)) {
  // d. Lever completeness (runtime guard over the required schema).
  for (const lever of ['density', 'typeScale', 'motionScale']) {
    if (typeof preset[lever] !== 'number') {
      errors.push(`preset "${id}": lever "${lever}" is missing or not a number`);
    }
  }
  if (typeof preset.elevation !== 'string' || preset.elevation.length === 0) {
    errors.push(`preset "${id}": lever "elevation" is missing`);
  }

  for (const theme of ['light', 'dark']) {
    cells += 1;
    const overrides = presetOverrides(preset, theme);

    // a. Every override name is a real token or primitive.
    for (const name of Object.keys(overrides)) {
      if (!registryNames.has(name) && !primitives.has(name)) {
        errors.push(
          `preset "${id}" (${theme}): overrides ${name}, which exists neither in ` +
            `src/tokens/registry.json nor in tokens-primitives.css`
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

    // c. WCAG AA between the resolved action bg and text.
    const resolveRgb = (name, fallbackBg) => {
      const value = resolveValue(name, theme, overrides);
      const color = value === null ? null : parseColor(value);
      if (!color) {
        errors.push(
          `preset "${id}" (${theme}): ${name} resolves to ${value ?? 'nothing'}, not a colour — the AA check cannot judge it`
        );
        return null;
      }
      return fallbackBg ? compositeOver(color, fallbackBg) : color.slice(0, 3);
    };
    const pageBg = resolveRgb('--color-bg-page-primary', null);
    if (!pageBg) continue;
    const bg = resolveRgb('--color-action-primary-bg', pageBg);
    const text = bg && resolveRgb('--color-action-primary-text', bg);
    if (!bg || !text) continue;
    const ratio = contrastRatio(bg, text);
    minRatio = Math.min(minRatio, ratio);
    const pinned = SANCTIONED_AA_GAPS.get(`${id}|${theme}`);
    if (ratio < 4.5) {
      if (pinned !== ratio.toFixed(2)) {
        errors.push(
          `preset "${id}" (${theme}): action-primary bg/text contrast is ${ratio.toFixed(2)}:1, below WCAG AA 4.5:1 ` +
            `(bg rgb(${bg.map(Math.round).join(', ')}), text rgb(${text.map(Math.round).join(', ')})) — ` +
            `fix the pairing, or pin "${id}|${theme}" at "${ratio.toFixed(2)}" in SANCTIONED_AA_GAPS with the reason`
        );
      }
    } else if (pinned !== undefined) {
      errors.push(
        `preset "${id}" (${theme}): pinned in SANCTIONED_AA_GAPS but now clears AA at ${ratio.toFixed(2)}:1 — remove the pin`
      );
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
    `the action family is covered, and action bg/text holds AA across ${cells} cells ` +
    `(${SANCTIONED_AA_GAPS.size} pinned sub-AA cells, worst ratio ${minRatio.toFixed(2)}:1).`
);
