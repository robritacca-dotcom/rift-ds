#!/usr/bin/env node
/**
 * generate-aaa-stylesheet.mjs
 *
 * Writes src/tokens/aaa-colours.css: the colour half of the AAA mode
 * (data-a11y="aaa" on <html>), one block per theme for the shipped tokens
 * and for every preset in THEME_PRESETS (website/src/lib/theme/presets.ts).
 * The hand-written half (motion, focus, links, translucency) is
 * src/tokens/aaa.css, which imports this file.
 *
 * The mode keeps each theme's own colours. It does not swap in a palette:
 * it resolves every colour the active theme draws, then moves only the
 * ones that fall short of their pairing, along OKLCH lightness with the
 * hue held (chroma eases only where sRGB runs out), by the smallest step
 * that clears the minimum. A theme that already passes a pairing keeps
 * that colour exactly, so the mode reads as the same theme, sharper.
 *
 * PAIRINGS below is the authoritative table: each row names the token
 * that moves, what it is read against, and the minimum. Text clears
 * AAA's 7:1 (WCAG 1.4.6); icons, input edges and the focus ring clear
 * 4.5:1, past 1.4.11's 3:1 on purpose. A token that cannot reach its
 * minimum against every surface it sits on fails generation, never
 * silently ships short. Resolution follows var() chains through the
 * preset's own overrides (light, then dark over it, as the cascade
 * does), then the theme's token CSS, then the primitives; translucent
 * values are composited over the theme's page background.
 *
 * Translucent surfaces (glass, the semi container) are flattened to the
 * opaque colour they show over the page, because aaa.css switches
 * backdrop blur off and a see-through panel would put text over whatever
 * scrolls beneath it.
 *
 * Only the tokens that change are written, as literal hex: the values are
 * computed per theme, so there is no primitive to point at.
 * scripts/validate-aaa-stylesheet.mjs regenerates in memory and
 * byte-compares. Never hand-edit the output.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadThemeSource } from './generate-preset-stylesheets.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const tokensDir = join(repoRoot, 'src', 'tokens');
export const AAA_OUTPUT = join(tokensDir, 'aaa-colours.css');

const TEXT = 7;
const MARK = 4.5;

/* The surfaces running text sits on. */
const SURFACES = [
  '--color-bg-page-primary',
  '--color-bg-container-primary',
  '--color-bg-container-secondary',
];

/** [moving token, read against (token or list), minimum, what it is].
    A token may appear in several rows: it moves once, to the nearest
    lightness that clears every row it is in. The tokens it is read
    against never move (a fill moves against its fixed label, never the
    reverse), so one pass settles every row. */
export const PAIRINGS = [
  // Running text and icons on the page and its containers.
  ['--color-text-primary', SURFACES, TEXT, 'body text'],
  ['--color-text-secondary', SURFACES, TEXT, 'supporting text'],
  ['--color-text-tertiary', SURFACES, TEXT, 'captions, metadata and hints'],
  ['--color-icon-primary', SURFACES, MARK, 'icons'],
  ['--color-icon-secondary', SURFACES, MARK, 'secondary icons'],
  ['--color-action-icon-default', SURFACES, MARK, 'icon buttons at rest'],
  ['--color-trend-up', SURFACES, TEXT, 'rising figures'],
  ['--color-trend-down', SURFACES, TEXT, 'falling figures'],
  // Action colour drawn as text on a surface: outline and text buttons, links.
  ['--color-action-primary-text-secondary', SURFACES, TEXT, 'secondary Button labels'],
  ['--color-action-primary-text-tertiary', SURFACES, TEXT, 'text Button labels and inline links'],
  ['--color-action-destructive-text-secondary', SURFACES, TEXT, 'outline destructive Button labels'],
  ['--color-core-ui-secondary', SURFACES, TEXT, 'the action colour as text'],
  // Inputs.
  ['--color-input-text-primary', ['--color-input-bg-primary'], TEXT, 'typed text'],
  ['--color-input-text-placeholder', ['--color-input-bg-primary'], TEXT, 'placeholder text'],
  ['--color-input-border-primary', ['--color-input-bg-primary', '--color-bg-page-primary'], MARK, 'input edges'],
  ['--color-input-border-hover', ['--color-input-bg-primary', '--color-bg-page-primary'], MARK, 'input edges on hover'],
  // Action fills against the labels drawn on them; the primary fill is
  // also the focus ring, so it holds against the page too.
  ['--color-action-primary-bg', ['--color-action-primary-text'], TEXT, 'primary Button label'],
  ['--color-action-primary-bg', ['--color-bg-page-primary', '--color-bg-container-primary'], MARK, 'focus ring and checked controls'],
  ['--color-action-primary-bg-hover', ['--color-action-primary-text', '--color-action-primary-text-active'], TEXT, 'primary Button label on hover'],
  ['--color-action-primary-bg-active', ['--color-action-primary-text', '--color-action-primary-text-active'], TEXT, 'primary Button label when pressed'],
  ['--color-action-primary-bg-hover', ['--color-action-icon-active'], MARK, 'outlined Button icon on hover'],
  ['--color-action-primary-bg-active', ['--color-action-icon-active'], MARK, 'outlined Button icon when pressed'],
  ['--color-action-neutral-bg', ['--color-action-neutral-text'], TEXT, 'neutral Button label'],
  ['--color-action-neutral-bg-hover', ['--color-action-neutral-text'], TEXT, 'neutral Button label on hover'],
  ['--color-action-neutral-bg-active', ['--color-action-neutral-text'], TEXT, 'neutral Button label when pressed'],
  ['--color-action-passive-text', ['--color-action-passive-bg', '--color-action-passive-bg-hover', '--color-action-passive-bg-active', ...SURFACES], TEXT, 'tertiary Button label'],
  ['--color-action-destructive-bg', ['--color-action-destructive-text'], TEXT, 'filled destructive Button label'],
  ['--color-action-destructive-bg-hover', ['--color-action-destructive-text'], TEXT, 'filled destructive Button label on hover'],
  ['--color-action-destructive-bg-active', ['--color-action-destructive-text'], TEXT, 'filled destructive Button label when pressed'],
  // Status: the message on its own tint, and on a plain surface.
  ...['info', 'positive', 'warning', 'error', 'neutral'].flatMap((role) => [
    [`--color-status-${role}-text`, [`--color-status-${role}-bg`, ...SURFACES], TEXT, `${role} status text`],
    [`--color-status-${role}-icon`, [`--color-status-${role}-bg`, ...SURFACES], MARK, `${role} status icon`],
  ]),
  // Chat bubbles.
  ['--color-chat-bubble-received-text', ['--color-chat-bubble-received-bg'], TEXT, 'received message text'],
  ['--color-chat-bubble-sent-text', ['--color-chat-bubble-sent-bg'], TEXT, 'sent message text'],
];

/* Labels a fill may hand its contrast to. When no lightness of a fill
   clears both its label and the page (a mid-tone fill with a dark label
   on a light page), the label flips to black or white, whichever leaves
   the fill nearer its own colour, and the fill moves against that. A
   family's labels flip together, so the resting, hover and pressed
   states of one button never disagree about which pole they drew on. */
export const LABEL_FAMILIES = [
  ['--color-action-primary-text', '--color-action-primary-text-active', '--color-action-icon-active'],
  ['--color-action-neutral-text'],
  ['--color-action-destructive-text'],
];
const familyOf = new Map(LABEL_FAMILIES.flatMap((family) => family.map((name) => [name, family])));

/* [resting fill, its label, hover fill, pressed fill]: the states kept
   apart after the pairings move them (see cellCss). */
const STATE_FAMILIES = [
  ['--color-action-primary-bg', '--color-action-primary-text', '--color-action-primary-bg-hover', '--color-action-primary-bg-active'],
  ['--color-action-neutral-bg', '--color-action-neutral-text', '--color-action-neutral-bg-hover', '--color-action-neutral-bg-active'],
  ['--color-action-destructive-bg', '--color-action-destructive-text', '--color-action-destructive-bg-hover', '--color-action-destructive-bg-active'],
];
const STATE_STEP = 0.05;

/* Translucent surfaces made opaque over the page (see the doc block). */
export const FLATTENED = ['--color-bg-glass', '--color-bg-container-primary-semi'];

// ---------------------------------------------------------------------------
// Colour maths: sRGB, WCAG contrast, OKLCH.

const read = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

const parseDeclarations = (css) => {
  const declarations = new Map();
  for (const m of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);/gim)) {
    if (!declarations.has(m[1])) declarations.set(m[1], m[2].trim());
  }
  return declarations;
};

const parseColor = (value) => {
  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = [...h].map((c) => c + c).join('');
    const rgb = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
    return rgb.concat(h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1);
  }
  const rgba = value.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([0-9.]+)\s*)?\)$/);
  if (rgba) return [Number(rgba[1]), Number(rgba[2]), Number(rgba[3]), Number(rgba[4] ?? 1)];
  return null;
};

const over = (fg, bg) =>
  fg[3] >= 1 ? fg.slice(0, 3) : fg.slice(0, 3).map((c, i) => Math.round(c * fg[3] + bg[i] * (1 - fg[3])));

const toLinear = (c) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const fromLinear = (l) => 255 * (l <= 0.0031308 ? 12.92 * l : 1.055 * l ** (1 / 2.4) - 0.055);
const luminance = (rgb) => {
  const [r, g, b] = rgb.map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const toOklch = (rgb) => {
  const [r, g, b] = rgb.map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return [L, Math.hypot(A, B), Math.atan2(B, A)];
};

/** OKLCH to linear sRGB, unclamped, so the caller can test the gamut. */
const oklchToLinear = ([L, C, h]) => {
  const A = C * Math.cos(h);
  const B = C * Math.sin(h);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
};

/** The colour at lightness L with the hue held, chroma eased into gamut. */
const atLightness = ([, C, h], L) => {
  let lo = 0;
  let hi = C;
  const inGamut = (c) => oklchToLinear([L, c, h]).every((v) => v >= -1e-6 && v <= 1 + 1e-6);
  if (inGamut(C)) lo = C;
  else {
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(mid)) lo = mid;
      else hi = mid;
    }
  }
  return oklchToLinear([L, lo, h]).map((v) => Math.round(fromLinear(Math.min(1, Math.max(0, v)))));
};

const toHex = (rgb) => `#${rgb.map((c) => c.toString(16).padStart(2, '0')).join('').toUpperCase()}`;

/** The nearest colour to `rgb` (by OKLCH lightness, hue held) that clears
    every [against, minimum]; null when no lightness does. */
const nearestPassing = (rgb, constraints) => {
  const passes = (c) => constraints.every(([against, min]) => contrast(c, against) >= min);
  if (passes(rgb)) return rgb;
  const lch = toOklch(rgb);
  for (let step = 1; step <= 1000; step++) {
    for (const L of [lch[0] - step / 1000, lch[0] + step / 1000]) {
      if (L < 0 || L > 1) continue;
      const candidate = atLightness(lch, L);
      if (passes(candidate)) return candidate;
    }
  }
  return null;
};

// ---------------------------------------------------------------------------

const primitives = parseDeclarations(read(join(tokensDir, 'tokens-primitives.css')));
const lightDecls = parseDeclarations(read(join(tokensDir, 'tokens-light.css')));
const darkDecls = parseDeclarations(read(join(tokensDir, 'tokens-dark.css')));

/** Every colour token, resolved to opaque sRGB for one theme cell. A token
    already moved by the mode wins at every hop of a var() chain, as it
    does in the cascade, so an alias of a moved token follows it. */
const resolveCell = (theme, overrides, label, changed) => {
  const lookup = (name) => {
    let current = name;
    for (let depth = 0; depth < 32; depth++) {
      if (changed.has(current)) return toHex(changed.get(current));
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
  const raw = (name) => {
    const value = lookup(name);
    const colour = value && parseColor(value);
    if (!colour) throw new Error(`${label}: ${name} resolves to ${value ?? 'nothing'}, not a colour`);
    return colour;
  };
  const page = () => raw('--color-bg-page-primary').slice(0, 3);
  return { get: (name) => over(raw(name), page()), raw };
};

const byToken = new Map();
for (const [token, against, min] of PAIRINGS) {
  const list = byToken.get(token) ?? [];
  for (const other of against) list.push([other, min]);
  byToken.set(token, list);
}
for (const [token, rows] of byToken) {
  for (const [other] of rows) {
    if (byToken.has(other)) throw new Error(`PAIRINGS: ${token} is read against ${other}, which also moves; one side must stay fixed`);
  }
}

const cellCss = (theme, overrides, label) => {
  const changed = new Map();
  const flipped = new Set();
  const cell = resolveCell(theme, overrides, label, changed);

  for (const name of FLATTENED) {
    if (cell.raw(name)[3] < 1) changed.set(name, cell.get(name));
  }
  /* Repeat until nothing moves: a fixed side of one row can alias a token
     another row moved (a sent bubble filled with the action colour). */
  for (let pass = 0; ; pass++) {
    if (pass === 8) throw new Error(`${label}: the pairings did not settle`);
    let moved = false;
    for (const [token, rows] of byToken) {
      const before = cell.get(token);
      let result = nearestPassing(before, rows.map(([other, min]) => [cell.get(other), min]));
      const labels = [...new Set(rows.flatMap(([other]) => familyOf.get(other) ?? []))].filter((name) => !flipped.has(name));
      if (!result && labels.length > 0) {
        const distance = (c) => Math.abs(toOklch(c)[0] - toOklch(before)[0]);
        const [pole, fill] =
          [[0, 0, 0], [255, 255, 255]]
            .map((p) => [p, nearestPassing(before, rows.map(([other, min]) => [labels.includes(other) ? p : cell.get(other), min]))])
            .filter(([, f]) => f)
            .sort(([, a], [, b]) => distance(a) - distance(b))[0] ?? [];
        if (fill) {
          for (const name of labels) {
            changed.set(name, pole);
            flipped.add(name);
          }
          result = fill;
        }
      }
      if (!result) {
        const worst = rows.map(([other, min]) => `${other} ${contrast(before, cell.get(other)).toFixed(2)}:1 (needs ${min})`).join(', ');
        throw new Error(`${label}: no lightness of ${token} clears every pairing: ${worst}`);
      }
      if (toHex(result) !== toHex(before)) {
        changed.set(token, result);
        moved = true;
      }
    }
    if (!moved) break;
  }
  /* Keep hover and pressed visible. Fills that all ran into the same AAA
     floor would otherwise land on one colour, so a state that moved and
     sits nearer its resting fill than STATE_STEP steps on, away from its
     label: further from the label only adds contrast, so every row holds. */
  for (const [rest, label, ...states] of STATE_FAMILIES) {
    const restL = toOklch(cell.get(rest))[0];
    const away = Math.sign(restL - toOklch(cell.get(label))[0]) || -1;
    states.forEach((state, index) => {
      if (!changed.has(state)) return;
      const lch = toOklch(cell.get(state));
      const target = restL + away * STATE_STEP * (index + 1);
      if (Math.abs(lch[0] - restL) < STATE_STEP * (index + 1) && target > 0 && target < 1) {
        changed.set(state, atLightness(lch, target));
      }
    });
  }
  // The proof: every row, read with the final values.
  for (const [token, against, min, usage] of PAIRINGS) {
    for (const other of against) {
      const ratio = contrast(cell.get(token), cell.get(other));
      if (ratio < min) throw new Error(`${label}: ${token} on ${other} is ${ratio.toFixed(2)}:1, under ${min}:1 (${usage})`);
    }
  }
  return [...changed].sort(([a], [b]) => a.localeCompare(b)).map(([name, rgb]) => `  ${name}: ${toHex(rgb)};`);
};

const block = (selector, lines) => (lines.length === 0 ? null : `${selector} {\n${lines.join('\n')}\n}`);

/* The attribute is repeated so every block outranks the preset sheets'
   html[data-brand][data-theme] however a bundler orders the files. */
const MODE = 'html[data-a11y="aaa"][data-a11y="aaa"]';

export async function renderAaaColours() {
  const { THEME_PRESETS, presetOverrides } = await loadThemeSource();
  const blocks = [
    block(`${MODE}:not([data-brand]):not([data-theme="dark"])`, cellCss('light', {}, 'shipped tokens (light)')),
    block(`${MODE}:not([data-brand])[data-theme="dark"]`, cellCss('dark', {}, 'shipped tokens (dark)')),
  ];
  for (const [id, preset] of Object.entries(THEME_PRESETS)) {
    const light = presetOverrides(preset, 'light');
    const dark = { ...light, ...presetOverrides(preset, 'dark') };
    blocks.push(block(`${MODE}[data-brand="${id}"]:not([data-theme="dark"])`, cellCss('light', light, `preset "${id}" (light)`)));
    blocks.push(block(`${MODE}[data-brand="${id}"][data-theme="dark"]`, cellCss('dark', dark, `preset "${id}" (dark)`)));
  }
  return `/*
 * AUTO-GENERATED by scripts/generate-aaa-stylesheet.mjs. Never hand-edit.
 * The colour half of the AAA mode: per theme, only the tokens that fall
 * short of their AAA pairing, moved to the nearest lightness that clears
 * it with the hue held. Imported by aaa.css; inert without data-a11y="aaa".
 */

${blocks.filter(Boolean).join('\n\n')}
`;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const css = await renderAaaColours();
    writeFileSync(AAA_OUTPUT, css);
    const lines = css.split('\n').filter((l) => l.startsWith('  --')).length;
    console.log(`generate-aaa-stylesheet: ${lines} colour overrides across the shipped tokens and every preset, both themes`);
  } catch (error) {
    console.error(`generate-aaa-stylesheet: ${error.message}`);
    process.exit(1);
  }
}
