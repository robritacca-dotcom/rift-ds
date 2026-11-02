#!/usr/bin/env node
/**
 * generate-token-values.mjs
 *
 * One token-resolution pass, two outputs:
 *
 *   A. src/tokens/values.json: every semantic token's resolved literal
 *      value, per theme (the base look and every preset in
 *      THEME_SELECTOR_ORDER) and per mode (light, dark), plus the values a
 *      token takes inside each @media block that redefines it. Ships in
 *      the package behind the ./tokens/values subpath (src/tokens/values.ts
 *      is the accessor), so a consumer, an agent or the MCP endpoint can
 *      read what a token resolves to without parsing CSS. The token
 *      registry (src/tokens/registry.json) stays names-only; this file is
 *      the one home for resolved values. Item 3 of the paved-path plan.
 *
 *   B. website/public/schema/tokens/<themeId>.<mode>.tokens.json: the same
 *      themes in the W3C Design Tokens Community Group format (DTCG
 *      2025.10), one file per theme per mode, so Figma, Style Dictionary
 *      and other tools that speak DTCG take a theme on its own. The DTCG
 *      files keep the token CSS's structure: a primitive is a literal and a
 *      semantic token that is a bare `var(--x)` in the CSS is an alias
 *      (`"{group.name}"`) onto it, so the tiers survive the export.
 *
 * Both outputs are written from the same resolver the rest of the repo
 * uses (scripts/token-values.mjs) over the same inputs: the token CSS and
 * presetOverrides, the one composer the preset stylesheets are written
 * from. generate-theme-design-md.mjs and generate-agent-skill.mjs keep
 * their own resolver calls on purpose: same resolver, same inputs, and the
 * byte-compare in validate-token-values.mjs proves the three agree on
 * every build. Nothing here reads the network or the clock, so the
 * validator can regenerate in memory and byte-compare. Every input is
 * already published (the token CSS ships in the package), so the output
 * is public-only by construction.
 *
 * The alias rule (DTCG only): a token's RAW CSS value, with the preset's
 * overrides laid over it as raw values and tokens-dark.css laid over
 * tokens-light.css for the dark file, that is exactly one `var(--x)`
 * becomes an alias whose $type is the target's own. A literal is mapped
 * by TYPE_MAPPERS, keyed by the family the token's NAME and category
 * place it in (a `--font-*-weight` is a fontWeight, a `--layer-*` a
 * number), never by guessing from the value; a literal that does not fit
 * its family throws. A mixed expression (a var() inside something longer;
 * none exists today) is mapped from its resolved value. Anything
 * TYPE_MAPPERS cannot place (a percentage, calc(), steps()) throws naming
 * the token, so the generator fails rather than emit an invalid token.
 *
 * Out of scope: the @media overrides as DTCG (values.json carries them;
 * DTCG has no breakpoint axis) and tokens-forced-colors.css (a system
 * palette, not a theme).
 *
 * Runs in the validate-registry chain and the website's predev/prebuild.
 * Writes only changed files, prunes orphans under the DTCG folder only.
 * Never hand-edit the generated files.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CATEGORY_PREFIXES,
  SEMANTIC_FILES,
  deriveTokenRegistry,
  parseTokenNames,
} from './generate-token-registry.mjs';
import { loadThemeSource } from './generate-preset-stylesheets.mjs';
import { parseCss, resolveTokenValues } from './token-values.mjs';
import { PACKAGE_NAME, PACKAGE_VERSION } from './package-manifest.mjs';
import { SITE_URL } from './brand.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const tokensDir = join(repoRoot, 'src', 'tokens');
export const valuesPath = join(tokensDir, 'values.json');
export const dtcgDir = join(repoRoot, 'website', 'public', 'schema', 'tokens');

const SCRIPT = 'scripts/generate-token-values.mjs';
const MODES = ['light', 'dark'];

// Normalize CRLF so Windows checkouts generate identically to CI.
const read = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

/* ---------- names and groups ---------- */

const PRIMITIVE_PREFIX = '--primitive-';

/** Every prefix a token may carry, in DTCG group order: primitives first,
    then CATEGORY_PREFIXES in its display order. */
const GROUP_PREFIXES = [PRIMITIVE_PREFIX, ...CATEGORY_PREFIXES.flatMap(([, prefixes]) => prefixes)];

/** `--icon-size-sm` -> { group: 'icon-size', name: 'sm' }. */
function splitName(css) {
  const prefix = GROUP_PREFIXES.find((p) => css.startsWith(p));
  if (!prefix) throw new Error(`${css} carries no prefix CATEGORY_PREFIXES knows`);
  return { group: prefix.slice(2, -1), name: css.slice(prefix.length) };
}

const toRef = (css) => {
  const { group, name } = splitName(css);
  return `{${group}.${name}}`;
};

/* ---------- value parsers ---------- */

const NUMBER = '-?(?:\\d+\\.?\\d*|\\.\\d+)';
const round4 = (n) => Math.round(n * 10000) / 10000;
const toNumber = (s) => Number.parseFloat(s);

/** `#rgb`, `#rrggbb`, `#rrggbbaa`, `rgb()` or `rgba()` -> the DTCG colour
    object, or null when the text is not a colour. */
function parseColor(value) {
  const hex = value.match(/^#([0-9a-f]{3,8})$/i);
  if (hex) {
    let digits = hex[1].toLowerCase();
    if (digits.length === 3 || digits.length === 4) digits = [...digits].map((d) => d + d).join('');
    if (digits.length !== 6 && digits.length !== 8) return null;
    const channel = (i) => Number.parseInt(digits.slice(i, i + 2), 16);
    const alpha = digits.length === 8 ? round4(channel(6) / 255) : 1;
    return colorObject([channel(0), channel(2), channel(4)], alpha, `#${digits.slice(0, 6)}`);
  }
  const fn = value.match(/^rgba?\(\s*([^)]*)\)$/i);
  if (fn) {
    const parts = fn[1].split(/\s*[,/]\s*|\s+/).filter(Boolean);
    if (parts.length !== 3 && parts.length !== 4) return null;
    const rgb = parts.slice(0, 3).map(toNumber);
    if (rgb.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return null;
    let alpha = 1;
    if (parts.length === 4) {
      alpha = parts[3].endsWith('%') ? toNumber(parts[3]) / 100 : toNumber(parts[3]);
      if (Number.isNaN(alpha) || alpha < 0 || alpha > 1) return null;
    }
    const hex = `#${rgb.map((n) => Math.round(n).toString(16).padStart(2, '0')).join('')}`;
    return colorObject(rgb, round4(alpha), hex);
  }
  return null;
}

const colorObject = (rgb, alpha, hex) => ({
  colorSpace: 'srgb',
  components: rgb.map((n) => round4(n / 255)),
  alpha,
  hex,
});

/** `<n>px`, `<n>rem` or a bare `0` -> the DTCG dimension object, else null. */
function parseDimension(value) {
  if (value === '0') return { value: 0, unit: 'px' };
  const m = value.match(new RegExp(`^(${NUMBER})(px|rem)$`));
  return m ? { value: toNumber(m[1]), unit: m[2] } : null;
}

function parseDuration(value) {
  const m = value.match(new RegExp(`^(${NUMBER})(ms|s)$`));
  return m ? { value: toNumber(m[1]), unit: m[2] } : null;
}

const EASING_KEYWORDS = {
  ease: [0.25, 0.1, 0.25, 1],
  linear: [0, 0, 1, 1],
  'ease-in': [0.42, 0, 1, 1],
  'ease-out': [0, 0, 0.58, 1],
  'ease-in-out': [0.42, 0, 0.58, 1],
};

function parseCubicBezier(value) {
  if (EASING_KEYWORDS[value]) return EASING_KEYWORDS[value];
  const m = value.match(/^cubic-bezier\(\s*([^)]*)\)$/);
  if (!m) return null;
  const points = m[1].split(/\s*,\s*/).map(toNumber);
  return points.length === 4 && points.every((n) => !Number.isNaN(n)) ? points : null;
}

/** A comma list of family names, quotes stripped, whitespace collapsed. */
function parseFontFamily(value) {
  const families = value
    .split(',')
    .map((f) => f.replace(/\s+/g, ' ').trim().replace(/^(['"])(.*)\1$/, '$2'))
    .filter(Boolean);
  return families.length > 0 ? families : null;
}

const parseInteger = (value) => (/^\d+$/.test(value) ? Number.parseInt(value, 10) : null);

function parseNumber(value) {
  return new RegExp(`^${NUMBER}$`).test(value) ? toNumber(value) : null;
}

/** `<n>em` or `0` -> the multiple of the font size, else null. */
function parseEm(value) {
  if (value === '0') return 0;
  const m = value.match(new RegExp(`^(${NUMBER})em$`));
  return m ? toNumber(m[1]) : null;
}

/** Split on a separator outside parentheses. */
function splitTopLevel(value, separator) {
  const parts = [];
  let depth = 0;
  let current = '';
  for (const ch of value) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (depth === 0 && separator.test(ch)) {
      if (current.trim()) parts.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

/** CSS `none`: the shadow that draws nothing, written as a DTCG shadow
    with no spread and a fully transparent colour, since the format has
    no empty shadow. Presets with flat depth set it. */
const NO_SHADOW = {
  color: colorObject([0, 0, 0], 0, '#000000'),
  offsetX: { value: 0, unit: 'px' },
  offsetY: { value: 0, unit: 'px' },
  blur: { value: 0, unit: 'px' },
  spread: { value: 0, unit: 'px' },
  inset: false,
};

/** `0 4px 16px rgba(...)`, comma-separated, optional `inset` -> one DTCG
    shadow object or an array of them; `none` -> NO_SHADOW; else null. */
function parseShadow(value) {
  if (value === 'none') return NO_SHADOW;
  const layers = splitTopLevel(value, /,/).map((layer) => {
    const parts = splitTopLevel(layer, /\s/);
    const inset = parts.includes('inset');
    const rest = parts.filter((p) => p !== 'inset');
    const colorIndex = rest.findIndex((p) => parseColor(p) !== null);
    if (colorIndex === -1) return null;
    const color = parseColor(rest[colorIndex]);
    const lengths = rest.filter((_, i) => i !== colorIndex).map(parseDimension);
    if (lengths.length < 2 || lengths.length > 4 || lengths.some((l) => l === null)) return null;
    const zero = { value: 0, unit: 'px' };
    const [offsetX, offsetY, blur = zero, spread = zero] = lengths;
    return { color, offsetX, offsetY, blur, spread, inset };
  });
  if (layers.length === 0 || layers.some((l) => l === null)) return null;
  return layers.length === 1 ? layers[0] : layers;
}

/* ---------- families and their mappers ---------- */

/**
 * Family -> mapper. A mapper takes the literal CSS value and returns the
 * DTCG token body ({ $type, $value, $description? }) or null when the
 * value does not fit the family. A family missing here is a build error
 * naming this table, so a new kind of value is placed deliberately.
 */
export const TYPE_MAPPERS = {
  color: (v) => wrap('color', parseColor(v)),
  dimension: (v) => wrap('dimension', parseDimension(v)),
  duration: (v) => wrap('duration', parseDuration(v)),
  cubicBezier: (v) => wrap('cubicBezier', parseCubicBezier(v)),
  fontFamily: (v) => wrap('fontFamily', parseFontFamily(v)),
  fontWeight: (v) => wrap('fontWeight', parseInteger(v)),
  number: (v) => wrap('number', parseNumber(v)),
  // A primitive is a raw colour or a raw length; nothing else lives there.
  primitive: (v) => wrap('color', parseColor(v)) ?? wrap('dimension', parseDimension(v)),
  // A line height is unitless (a multiple) on the type styles and a px
  // length on the ladder they alias.
  lineHeight: (v) => wrap('number', parseNumber(v)) ?? wrap('dimension', parseDimension(v)),
  letterSpacing: (v) => {
    const em = parseEm(v);
    return em === null
      ? null
      : { $type: 'number', $value: em, $description: 'A multiple of the font size (CSS em).' };
  },
  shadow: (v) => wrap('shadow', parseShadow(v)),
};

const wrap = ($type, $value) => ($value === null ? null : { $type, $value });

/** The family a token's name and category place it in. */
function familyOf(css) {
  const { group, name } = splitName(css);
  switch (group) {
    case 'primitive':
      return 'primitive';
    case 'color':
      return 'color';
    case 'gap':
    case 'padding':
    case 'radius':
    case 'border':
    case 'icon-size':
    case 'control-height':
      return 'dimension';
    case 'shadow':
      return 'shadow';
    case 'layer':
      return 'number';
    case 'motion':
      if (name.startsWith('duration-')) return 'duration';
      if (name.startsWith('ease-')) return 'cubicBezier';
      break;
    case 'font':
      if (/(^|-)family(-|$)/.test(name)) return 'fontFamily';
      if (/(^|-)weight(-|$)/.test(name)) return 'fontWeight';
      if (/(^|-)line-height(-|$)/.test(name)) return 'lineHeight';
      if (/(^|-)letter-spacing$/.test(name)) return 'letterSpacing';
      if (/(^|-)size(-|$)/.test(name)) return 'dimension';
      break;
  }
  throw new Error(`${css}: no family in TYPE_MAPPERS covers it; add one to familyOf in ${SCRIPT}`);
}

/* ---------- the themes ---------- */

/** The base look is the one selector entry without a preset; it leads. */
function themeOrder({ THEME_PRESETS, THEME_SELECTOR_ORDER }) {
  const base = THEME_SELECTOR_ORDER.filter((id) => !THEME_PRESETS[id]);
  if (base.length !== 1) {
    throw new Error(
      `expected exactly one base theme in THEME_SELECTOR_ORDER (an id with no preset), found ${base.length}`
    );
  }
  return [base[0], ...THEME_SELECTOR_ORDER.filter((id) => id !== base[0])];
}

/** The raw CSS declarations of the token files, light and dark. */
function rawDeclarations() {
  const light = new Map();
  for (const file of [...SEMANTIC_FILES, 'tokens-primitives.css']) {
    for (const [name, value] of parseCss(read(join(tokensDir, file))).base) {
      if (!light.has(name)) light.set(name, value);
    }
  }
  const dark = parseCss(read(join(tokensDir, 'tokens-dark.css'))).base;
  return { light, dark };
}

const sortedEntries = (map) => [...map.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
const sortedObject = (entries) => Object.fromEntries(entries);

/** One DTCG file: the raw layer decides alias or literal, the resolved
    values supply the literal, and every alias's $type is its target's. */
function buildDtcg({ id, label, mode, names, raw, resolved }) {
  const ALIAS = /^var\(\s*(--[a-z0-9-]+)\s*\)$/i;
  const bodies = new Map();
  const visiting = new Set();
  const bodyOf = (css) => {
    if (bodies.has(css)) return bodies.get(css);
    if (visiting.has(css)) throw new Error(`${css} aliases itself in a cycle`);
    visiting.add(css);
    const rawValue = raw.get(css);
    if (rawValue === undefined) throw new Error(`${css} has no raw declaration for ${id}/${mode}`);
    const alias = rawValue.match(ALIAS);
    let body;
    if (alias) {
      const target = alias[1];
      if (!raw.has(target) || !names.includes(target)) {
        throw new Error(`${css} aliases ${target}, which the ${id}.${mode} DTCG file does not carry`);
      }
      body = { $type: bodyOf(target).$type, $value: toRef(target) };
    } else {
      const family = familyOf(css);
      const mapper = TYPE_MAPPERS[family];
      if (!mapper) throw new Error(`${css}: family "${family}" has no mapper in TYPE_MAPPERS (${SCRIPT})`);
      const literal = resolved.get(css)[mode].value;
      body = mapper(literal);
      if (!body) {
        throw new Error(
          `${css}: the value "${literal}" does not fit its ${family} family; TYPE_MAPPERS in ${SCRIPT} cannot place it`
        );
      }
    }
    visiting.delete(css);
    bodies.set(css, body);
    return body;
  };

  const groups = new Map();
  for (const css of names) {
    const { group, name } = splitName(css);
    if (!groups.has(group)) groups.set(group, new Map());
    groups.get(group).set(name, bodyOf(css));
  }
  const file = {
    $description: `${PACKAGE_NAME} design tokens, ${label}, ${mode} mode. Generated by ${SCRIPT} from the token CSS.`,
    $extensions: { 'com.rift-ds': { version: PACKAGE_VERSION, theme: id, mode } },
  };
  for (const prefix of GROUP_PREFIXES) {
    const group = prefix.slice(2, -1);
    if (groups.has(group)) file[group] = sortedObject(sortedEntries(groups.get(group)));
  }
  return file;
}

/**
 * Both outputs, in memory: { values, dtcg } where `values` is the text of
 * src/tokens/values.json and `dtcg` maps a file name under dtcgDir to its
 * text. Async because the theme source is.
 */
export async function assembleTokenValues() {
  const source = await loadThemeSource();
  const { THEME_PRESETS, DEFAULT_THEME_LABEL, presetOverrides } = source;
  const semantic = Object.values(deriveTokenRegistry().categories).flat().sort();
  const primitives = parseTokenNames(read(join(tokensDir, 'tokens-primitives.css'))).sort();
  const names = [...primitives, ...semantic];
  const base = rawDeclarations();

  const themes = {};
  const dtcg = new Map();
  for (const id of themeOrder(source)) {
    const preset = THEME_PRESETS[id];
    const label = preset?.label ?? DEFAULT_THEME_LABEL;
    const overrides = {
      light: preset ? presetOverrides(preset, 'light') : {},
      dark: preset ? presetOverrides(preset, 'dark') : {},
    };
    const resolved = resolveTokenValues(names, preset ? overrides : {});

    const theme = {};
    for (const mode of MODES) {
      theme[mode] = sortedObject(semantic.map((name) => [name, resolved.get(name)[mode].value]));
    }
    const media = new Map();
    for (const name of semantic) {
      for (const [prelude, inside] of Object.entries(resolved.get(name).media)) {
        const key = prelude.replace(/^@media\s+/, '');
        if (!media.has(key)) media.set(key, new Map());
        media.get(key).set(name, inside.value);
      }
    }
    if (media.size > 0) {
      theme.media = sortedObject(sortedEntries(media).map(([key, m]) => [key, sortedObject(sortedEntries(m))]));
    }
    themes[id] = theme;

    // The cascade on <html>: a preset's light block outranks the token
    // files in both modes, and its dark block outranks everything in dark.
    const rawLight = new Map([...base.light, ...Object.entries(overrides.light)]);
    const rawDark = new Map([
      ...base.light,
      ...base.dark,
      ...Object.entries(overrides.light),
      ...Object.entries(overrides.dark),
    ]);
    for (const mode of MODES) {
      const file = buildDtcg({ id, label, mode, names, raw: mode === 'light' ? rawLight : rawDark, resolved });
      dtcg.set(`${id}.${mode}.tokens.json`, JSON.stringify(file, null, 2) + '\n');
    }
  }

  const values =
    JSON.stringify(
      {
        $schema: `${SITE_URL}/schema/token-values.schema.json`,
        '//': `GENERATED by ${SCRIPT} from the token CSS and the preset composer; never hand-edit; run \`npm run validate-registry\`.`,
        themes,
      },
      null,
      2
    ) + '\n';

  return { values, dtcg };
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    const { values, dtcg } = await assembleTokenValues();
    let written = 0;
    const writeIfChanged = (dest, content) => {
      if (!existsSync(dest) || readFileSync(dest, 'utf8') !== content) {
        writeFileSync(dest, content);
        written++;
      }
    };
    writeIfChanged(valuesPath, values);
    mkdirSync(dtcgDir, { recursive: true });
    for (const [name, content] of dtcg) writeIfChanged(join(dtcgDir, name), content);

    // A theme leaving the selector order takes its DTCG files with it.
    let pruned = 0;
    for (const name of readdirSync(dtcgDir)) {
      if (!dtcg.has(name)) {
        rmSync(join(dtcgDir, name), { recursive: true });
        pruned++;
      }
    }
    const themeCount = Object.keys(JSON.parse(values).themes).length;
    console.log(
      written + pruned > 0
        ? `✓ Token values regenerated: ${themeCount} themes, ${dtcg.size} DTCG files (${written} written, ${pruned} pruned).`
        : `✓ Token values up to date: ${themeCount} themes, ${dtcg.size} DTCG files.`
    );
  } catch (error) {
    console.error(`✗ ${error.message}`);
    process.exit(1);
  }
}
