/**
 * Reading a theme out of a DESIGN.md file.
 *
 * DESIGN.md is a spec format for describing a product's look: YAML front
 * matter holding colour, type, radius and spacing tokens plus component
 * recipes, then prose. Collections of them circulate as analyses of real
 * products. This module turns one into positions on the playground's
 * levers, the same way lib/theme/image-palette.ts turns a photograph into
 * them: the result is an approximation of the described look built entirely
 * from rift's own system. Nothing is added to the token set, no colour skips
 * a tier, and every value lands on a lever that already exists, through the
 * same functions a hand-moved lever goes through.
 *
 * It all runs in the visitor's browser. The file is read as text, parsed
 * here, and dropped; it is never uploaded and never stored. The one request
 * an import can cause is the Google Fonts stylesheet for a matched face, the
 * same request the playground's font picker makes.
 *
 * Three steps, kept apart so each can be judged on its own:
 *
 *   parseFrontMatter — a strict YAML subset (nested maps of scalars), which
 *                      is all the format's front matter uses. Lists,
 *                      anchors and block scalars are skipped, never
 *                      evaluated, since the file is untrusted text.
 *   fit*             — one function per lever, each reading the tokens it
 *                      needs and fitting the lever to them: sweep the
 *                      lever's own range through its own override function
 *                      and keep the position whose output is closest.
 *   matchFont        — the exact Google face where the file names one,
 *                      otherwise the nearest (scripts/generate-google-font-
 *                      index.mjs owns the catalogue and the stand-in table).
 *
 * Every lever the file says nothing about keeps rift's shipped position,
 * and the report says so, row by row.
 */
import {
  ACTION_COLOR_PRESETS,
  FONT_OPTIONS,
  HEADING_FONT_OPTIONS,
  LEVER_RANGES,
  SHIPPED_BODY_SIZE_PX,
  SHIPPED_GAP_LADDER_PX,
  SHIPPED_INPUT_RADIUS_PX,
  SHIPPED_PARAGRAPH_TRACKING_EM,
  TYPE_WEIGHT_RANGE,
  hexToRgb,
  hslToRgb,
  neutralOverrides,
  nearestRampFor,
  rgbToHex,
  rgbToHsl,
  type AccentSextet,
  type ElevationVariant,
  type FontOption,
} from "./theme-overrides";
import { accentsFromColours } from "./image-palette";

/* ---------- the YAML subset ---------- */

type YamlMap = { [key: string]: YamlValue };
type YamlValue = string | YamlMap;

/** Largest file the importer reads. The format's files run to tens of
    kilobytes; anything far past that is not one. */
export const DESIGN_MD_MAX_BYTES = 512 * 1024;

const unquote = (value: string) => {
  const quoted = /^"(.*)"$/.exec(value) ?? /^'(.*)'$/.exec(value);
  return quoted ? quoted[1] : value;
};

/** A scalar with any trailing comment removed. A block scalar marker
    (| or >) reads as empty, so its indented lines are ignored rather than
    mistaken for keys of their own. */
const scalar = (raw: string): string => {
  const value = raw.trim();
  if (value.startsWith('"') || value.startsWith("'")) {
    const close = value.indexOf(value[0], 1);
    return close > 0 ? value.slice(1, close) : value.slice(1);
  }
  if (value === "|" || value === ">" || value.startsWith("|") || value.startsWith(">")) {
    return "";
  }
  const comment = value.search(/\s#/);
  return (comment >= 0 ? value.slice(0, comment) : value).trim();
};

/**
 * The front matter between the opening and closing `---`, as nested maps.
 * Null when the file has none, which is the case the caller reports.
 */
export function parseFrontMatter(text: string): YamlMap | null {
  const match = /^﻿?---[ \t]*\n([\s\S]*?)\n---[ \t]*(?:\n|$)/.exec(text);
  if (!match) return null;

  const root: YamlMap = {};
  const stack: Array<{ indent: number; map: YamlMap }> = [{ indent: -1, map: root }];
  /* Lines indented under a block scalar or a list belong to it, not to the
     map; this is the indent they must clear before keys count again. */
  let skipDeeperThan = Infinity;

  for (const raw of match[1].split("\n")) {
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const indent = raw.length - raw.trimStart().length;
    if (indent > skipDeeperThan) continue;
    skipDeeperThan = Infinity;
    if (trimmed.startsWith("- ") || trimmed === "-") {
      skipDeeperThan = indent;
      continue;
    }

    const pair = /^("[^"]*"|'[^']*'|[^:]+?):(?:\s+(.*))?$/.exec(trimmed);
    if (!pair) continue;

    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
    const key = unquote(pair[1].trim());
    const parent = stack[stack.length - 1].map;
    const rest = pair[2]?.trim() ?? "";

    if (rest === "") {
      const child: YamlMap = {};
      parent[key] = child;
      stack.push({ indent, map: child });
    } else {
      parent[key] = scalar(rest);
      if (/^[|>]/.test(rest)) skipDeeperThan = indent;
    }
  }
  return root;
}

const isMap = (value: YamlValue | undefined): value is YamlMap =>
  typeof value === "object" && value !== null;

const lookup = (doc: YamlMap, path: string): YamlValue | undefined => {
  let node: YamlValue | undefined = doc;
  for (const part of path.split(".")) {
    if (!isMap(node)) return undefined;
    node = node[part];
  }
  return node;
};

/** A value with its `{group.token}` references resolved, whole or inline. */
function resolve(doc: YamlMap, value: YamlValue | undefined, depth = 0): string | undefined {
  if (typeof value !== "string") return undefined;
  if (depth > 6) return value;
  const whole = /^\{([\w.-]+)\}$/.exec(value);
  if (whole) return resolve(doc, lookup(doc, whole[1]), depth + 1);
  return value.replace(/\{([\w.-]+)\}/g, (ref, path: string) => {
    const hit = resolve(doc, lookup(doc, path), depth + 1);
    return hit ?? ref;
  });
}

/* ---------- value parsing ---------- */

type Rgb = [number, number, number];

/** A colour as uppercase hex. rgba() below half opacity reads as no colour:
    a wash over something else is not a colour the file chose. */
function toHex(value: string | undefined): string | null {
  if (!value) return null;
  const v = value.trim();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})(?:[0-9a-f]{2})?$/i.exec(v);
  if (hex) {
    const digits =
      hex[1].length === 3 ? hex[1].replace(/./g, (c) => c + c) : hex[1];
    return `#${digits.toUpperCase()}`;
  }
  const rgb = /^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+%?))?\s*\)$/i.exec(v);
  if (rgb) {
    const alpha = rgb[4]
      ? rgb[4].endsWith("%")
        ? Number(rgb[4].slice(0, -1)) / 100
        : Number(rgb[4])
      : 1;
    if (alpha < 0.5) return null;
    return rgbToHex([Number(rgb[1]), Number(rgb[2]), Number(rgb[3])]).toUpperCase();
  }
  return null;
}

/** A length in px. rem and em count at 16px; a bare number is px. */
function toPx(value: string | undefined): number | null {
  if (!value) return null;
  const m = /^(-?\d*\.?\d+)\s*(px|rem|em)?$/i.exec(value.trim());
  if (!m) return null;
  const n = Number(m[1]);
  return m[2] && m[2].toLowerCase() !== "px" ? n * 16 : n;
}

/** Whether a radius is a pill: a huge px value or a half-or-more percent. */
function isPillRadius(value: string | undefined): boolean {
  if (!value) return false;
  const v = value.trim().toLowerCase();
  if (v === "full" || v === "pill") return true;
  const pct = /^(\d+(?:\.\d+)?)%$/.exec(v);
  if (pct) return Number(pct[1]) >= 50;
  const px = toPx(v);
  return px !== null && px >= 100;
}

const chromaOf = ([r, g, b]: Rgb) => (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
const lightnessOf = (hex: string) => rgbToHsl(hexToRgb(hex))[2];
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
const snap = (value: number, step: number) => Math.round(value / step) * step;

/* ---------- the report ---------- */

/** How a lever position relates to the file: stated outright, fitted onto
    the nearest position rift has, or left at rift's own default. */
export type MatchStatus = "matched" | "approximated" | "kept";

export interface MatchRow {
  /** The lever, as the rail names it. */
  lever: string;
  /** Where the lever landed, in the rail's words. */
  value: string;
  status: MatchStatus;
  /** Where the position came from, or why it stayed put. */
  note: string;
}

/* ---------- fonts ---------- */

export type FontMatchKind =
  | "exact" // the file's own face is a Google face
  | "stack" // a later face in the file's font stack is a Google face
  | "suggested" // the file's prose names a Google face as its stand-in
  | "substitute" // rift's stand-in table maps the face to a Google one
  | "generic"; // only the face's category could be matched

export interface FontMatch {
  /** The face the file asks for. */
  requested: string;
  /** The Google face rift loads instead (or the same one). */
  family: string;
  kind: FontMatchKind;
  /** The picker entry the face loads through. A face outside the roster is
      a fresh entry the caller adds for the session (addSessionFont). */
  option: FontOption;
}

export interface FontCatalogue {
  /** Family → weight encoding, from google-fonts.generated.ts. */
  fonts: Readonly<Record<string, string>>;
  /** Face-name prefix → Google family. */
  substitutes: Readonly<Record<string, string>>;
}

const GENERIC_FAMILIES = new Set([
  "serif",
  "sans-serif",
  "monospace",
  "cursive",
  "fantasy",
  "ui-sans-serif",
  "ui-serif",
  "ui-monospace",
  "ui-rounded",
]);

const splitStack = (family: string) =>
  family
    .split(",")
    .map((name) => unquote(name.trim()))
    .filter(Boolean);

/** The CSS generic a stack falls back to, for a fresh picker entry. */
const genericOf = (stack: string[]) => {
  const lower = stack.map((s) => s.toLowerCase());
  if (lower.some((s) => s === "monospace" || s === "ui-monospace")) return "monospace";
  if (lower.some((s) => s === "serif" || s === "ui-serif")) return "serif";
  return "sans-serif";
};

/** The css2 family parameter for a catalogue face, asking for exactly the
    weights the levers can reach that the face has: Google rejects the whole
    stylesheet when one listed weight is missing. */
function googleParamFor(family: string, encoding: string): string {
  const name = family.replace(/ /g, "+");
  const lo = TYPE_WEIGHT_RANGE.min / 100;
  const hi = TYPE_WEIGHT_RANGE.max / 100;
  const variable = /^v(\d)-(\d)$/.exec(encoding);
  if (variable) {
    const min = Number(variable[1]);
    const max = Number(variable[2]);
    const from = Math.max(min, lo);
    const to = Math.min(max, hi);
    return from <= to
      ? `${name}:wght@${from * 100}..${to * 100}`
      : `${name}:wght@${min * 100}..${max * 100}`;
  }
  const weights = encoding
    .split(",")
    .map(Number)
    .filter((w) => w >= lo && w <= hi);
  return weights.length > 0
    ? `${name}:wght@${weights.map((w) => w * 100).join(";")}`
    : name;
}

/** The roster entry for a Google face, or a fresh one. The bundled default
    face is its own entry: Nunito Sans is the base theme's face already. */
function optionFor(
  family: string,
  encoding: string,
  generic: string,
  role: "body" | "heading"
): FontOption {
  if (family === "Nunito Sans" && role === "body") return FONT_OPTIONS[0];
  const known = [...FONT_OPTIONS, ...HEADING_FONT_OPTIONS].find((f) =>
    f.family.startsWith(`'${family}'`)
  );
  if (known) return known;
  return {
    label: family,
    family: `'${family}', ${generic}`,
    googleParam: googleParamFor(family, encoding),
  };
}

/** The Typography section of the prose, where a file names its stand-ins. */
const typographyProse = (body: string) => {
  const start = body.search(/^##\s+Typography\b/im);
  if (start < 0) return "";
  const rest = body.slice(start + 2);
  const end = rest.search(/^##\s/m);
  return end < 0 ? rest : rest.slice(0, end);
};

/**
 * A Google face the file's own prose offers as a stand-in. Only sentences
 * that say so count ("closest", "substitute", "fallback"...), and only
 * whole, case-exact family names, so an ordinary word that happens to name
 * a font cannot match.
 */
function suggestedFace(prose: string, fonts: Readonly<Record<string, string>>): string | null {
  const sentences = prose
    .replace(/[*_`]/g, "")
    .split(/(?<=[.!?])\s+|\n+/)
    .filter((s) => /substitut|closest|alternative|equivalent|fallback|similar|stand-in|instead/i.test(s));
  for (const sentence of sentences) {
    let best: { name: string; at: number } | null = null;
    for (const word of sentence.matchAll(/[A-Z][\w-]*(?: [A-Z0-9][\w-]*)*/g)) {
      /* Try the longest run of capitalised words first, so "Hanken
         Grotesk" wins over a family named "Hanken" if one existed. */
      const parts = word[0].split(" ");
      for (let len = parts.length; len > 0; len -= 1) {
        for (let i = 0; i + len <= parts.length; i += 1) {
          const name = parts.slice(i, i + len).join(" ");
          if (name.length < 4 || !fonts[name]) continue;
          const at = (word.index ?? 0) + parts.slice(0, i).join(" ").length;
          if (!best || at < best.at) best = { name, at };
        }
      }
    }
    if (best) return best.name;
  }
  return null;
}

/** Longest stand-in key the face name starts with, case-insensitively. */
function substituteFor(name: string, substitutes: Readonly<Record<string, string>>): string | null {
  const lower = name.toLowerCase();
  let best: string | null = null;
  let bestLength = 0;
  for (const [key, target] of Object.entries(substitutes)) {
    if (lower.startsWith(key.toLowerCase()) && key.length > bestLength) {
      best = target;
      bestLength = key.length;
    }
  }
  return best;
}

/**
 * The nearest Google face to a font stack: the face itself, a later face in
 * the stack, the stand-in the file's prose names, rift's stand-in table, or
 * the category. Null only for an empty stack.
 */
export function matchFont(
  familyValue: string,
  prose: string,
  catalogue: FontCatalogue,
  role: "body" | "heading"
): FontMatch | null {
  const stack = splitStack(familyValue);
  const named = stack.filter((s) => !GENERIC_FAMILIES.has(s.toLowerCase()));
  if (stack.length === 0) return null;
  const generic = genericOf(stack);
  const requested = named[0] ?? stack[0];

  const byLower = new Map(Object.keys(catalogue.fonts).map((name) => [name.toLowerCase(), name]));
  const build = (family: string, kind: FontMatchKind): FontMatch => ({
    requested,
    family,
    kind,
    option: optionFor(family, catalogue.fonts[family], generic, role),
  });

  for (const [index, name] of named.entries()) {
    const hit = byLower.get(name.toLowerCase());
    if (hit) return build(hit, index === 0 ? "exact" : "stack");
  }
  const suggested = suggestedFace(prose, catalogue.fonts);
  if (suggested) return build(suggested, "suggested");
  for (const name of named) {
    const sub = substituteFor(name, catalogue.substitutes);
    if (sub) return build(sub, "substitute");
  }
  const fallback =
    generic === "monospace" ? "IBM Plex Mono" : generic === "serif" ? "Lora" : "Nunito Sans";
  return build(fallback, "generic");
}

/* ---------- typography ---------- */

interface TypeStyle {
  key: string;
  size: number;
  weight: number;
  /** Letter spacing in em, when stated. */
  trackingEm: number | null;
  family: string;
}

function typeStyles(doc: YamlMap): TypeStyle[] {
  const group = doc.typography;
  if (!isMap(group)) return [];
  const out: TypeStyle[] = [];
  for (const [key, raw] of Object.entries(group)) {
    if (!isMap(raw)) continue;
    const size = toPx(resolve(doc, raw.fontSize));
    if (!size) continue;
    const weightValue = Number(resolve(doc, raw.fontWeight));
    const spacing = resolve(doc, raw.letterSpacing);
    let trackingEm: number | null = null;
    if (spacing !== undefined) {
      const em = /^(-?\d*\.?\d+)\s*em$/i.exec(spacing.trim());
      const px = toPx(spacing);
      trackingEm = em ? Number(em[1]) : px !== null ? px / size : null;
    }
    out.push({
      key,
      size,
      weight: Number.isFinite(weightValue) && weightValue > 0 ? weightValue : 400,
      trackingEm,
      family: resolve(doc, raw.fontFamily) ?? "",
    });
  }
  return out;
}

const DISPLAY_NAME = /display|hero|mega|jumbo|giant/i;
const HEADING_NAME = /heading|headline|^title|^h[1-6]$|subhead/i;
const BODY_NAME = /^(body|paragraph|text|copy)(-(md|base|default|regular|m))?$/i;

/** The file's styles split into rift's three tiers, by name first and by
    size where the names say nothing. */
function tiers(styles: TypeStyle[]) {
  const display = styles.filter((s) => DISPLAY_NAME.test(s.key));
  let heading = styles.filter((s) => HEADING_NAME.test(s.key) && !/subtitle/i.test(s.key));
  if (heading.length === 0) heading = display.filter((s) => s.size < 40);
  const displayTier = display.filter((s) => !heading.includes(s));
  const body =
    styles.find((s) => BODY_NAME.test(s.key)) ??
    [...styles]
      .filter((s) => /body|paragraph|text/i.test(s.key) && s.size >= 14 && s.size <= 18)
      .sort((a, b) => Math.abs(a.size - 16) - Math.abs(b.size - 16))[0];
  const largest = (list: TypeStyle[]) => [...list].sort((a, b) => b.size - a.size)[0];
  return { display: largest(displayTier), heading: largest(heading), body };
}

const leverWeight = (weight: number) =>
  clamp(snap(weight, TYPE_WEIGHT_RANGE.step), TYPE_WEIGHT_RANGE.min, TYPE_WEIGHT_RANGE.max);

/* ---------- the theme ---------- */

/** A set of lever positions read from a DESIGN.md. An absent field means
    the file says nothing about that lever, and it keeps rift's default. */
export interface DesignMdTheme {
  /** The file's own name for the look. */
  title: string;
  description: string;
  brand?: string;
  /** Dark-mode action colour, when the file states one or the light one is
      a grey that needs its own dark partner. */
  brandDark?: string;
  tintOn: boolean;
  tintSeed?: string;
  tintStrength?: number;
  radiusScale?: number;
  pill?: boolean;
  density?: number;
  typeScale?: number;
  displayWeight?: number;
  headingWeight?: number;
  tracking?: number;
  elevation?: ElevationVariant;
  accents?: AccentSextet;
  bodyFont?: FontMatch;
  /** Absent when the headings share the body face. */
  headingFont?: FontMatch;
  /** The colours the theme was read from, for the source card. */
  swatches: string[];
  report: MatchRow[];
}

/** Every colour in the `colors` group, resolved, as [key, hex]. */
function colourEntries(doc: YamlMap): Array<[string, string]> {
  const group = doc.colors ?? doc.colours;
  if (!isMap(group)) return [];
  const out: Array<[string, string]> = [];
  for (const [key, value] of Object.entries(group)) {
    const hex = toHex(resolve(doc, value));
    if (hex) out.push([key, hex]);
  }
  return out;
}

const component = (doc: YamlMap, pattern: RegExp): YamlMap | undefined => {
  const group = doc.components;
  if (!isMap(group)) return undefined;
  const key = Object.keys(group).find((k) => pattern.test(k));
  const node = key ? group[key] : undefined;
  return isMap(node) ? node : undefined;
};

/** The action colour: what the primary button is filled with, which is the
    role rift's action colour plays. The colour named `primary` is the
    fallback, since some files reserve it for something narrower. */
function fitAction(doc: YamlMap, colours: Array<[string, string]>, report: MatchRow[]) {
  const button = component(doc, /^button-primary$/) ?? component(doc, /^button-(primary|cta)/);
  const fromButton = button ? toHex(resolve(doc, button.backgroundColor)) : null;
  const named = (pattern: RegExp) => colours.find(([key]) => pattern.test(key))?.[1] ?? null;
  const brand = fromButton ?? named(/^(primary|brand|action)$/) ?? named(/^accent$/);
  if (!brand) {
    report.push({ lever: "Action colour", value: "Rift default", status: "kept", note: "The file names no primary colour." });
    return {};
  }

  let brandDark = named(/^(primary|brand|action)-(on-)?dark$/) ?? undefined;
  const neutral = nearestRampFor(brand) === "neutral";
  if (!brandDark && neutral) {
    /* A grey or black button would vanish on a dark page. Rift's own
       neutral action colours carry a dark partner; take the nearest one's,
       the way the black and white theme does. */
    const [r, g, b] = hexToRgb(brand);
    const nearest = ACTION_COLOR_PRESETS.filter((p) => p.hexDark).sort((p, q) => {
      const d = (hex: string) => {
        const [x, y, z] = hexToRgb(hex);
        return (x - r) ** 2 + (y - g) ** 2 + (z - b) ** 2;
      };
      return d(p.hex) - d(q.hex);
    })[0];
    brandDark = nearest?.hexDark;
  }

  report.push({
    lever: "Action colour",
    value: brand,
    status: "approximated",
    note: `${fromButton ? "The primary button's fill" : "The primary colour"}, set on rift's ${
      neutral ? "neutral" : nearestRampFor(brand)
    } ramp so every state keeps its contrast${brandDark ? `, with ${brandDark} in dark mode` : ""}.`,
  });
  return { brand, brandDark };
}

/** The neutral tint: the cast of the file's light surfaces, fitted onto the
    tint strength that gives rift's matching surface step the same cast. */
function fitTint(colours: Array<[string, string]>, report: MatchRow[]) {
  const surfaces = colours.filter(
    ([key, hex]) =>
      /canvas|surface|background|^bg|page|parchment|cloud|field|paper|base/i.test(key) &&
      !/dark|tile|black|inverse|ink|^on-|chip|overlay|scrim/i.test(key) &&
      lightnessOf(hex) > 0.85
  );
  if (surfaces.length === 0) {
    report.push({ lever: "Neutral tint", value: "Off", status: "kept", note: "The file names no light surfaces." });
    return { tintOn: false };
  }
  const [, castHex] = [...surfaces].sort(
    ([, a], [, b]) => chromaOf(hexToRgb(b)) - chromaOf(hexToRgb(a))
  )[0];
  const cast = hexToRgb(castHex);
  const castChroma = chromaOf(cast);
  if (castChroma < 0.012) {
    report.push({ lever: "Neutral tint", value: "Off", status: "matched", note: "The surfaces are greys with no cast worth tinting." });
    return { tintOn: false };
  }

  const [hue] = rgbToHsl(cast);
  const seed = rgbToHex(hslToRgb([hue, 0.6, 0.45])).toUpperCase();
  const shipped = neutralOverrides(seed, 0, "light");
  const castLight = lightnessOf(castHex);
  const [step] = Object.entries(shipped)
    .filter(([name, value]) => /^--primitive-neutral-\d\d$/.test(name) && value.startsWith("#"))
    .sort(([, a], [, b]) => Math.abs(lightnessOf(a) - castLight) - Math.abs(lightnessOf(b) - castLight))[0];

  let strength = 1;
  let bestGap = Infinity;
  for (let k = 1; k <= 16; k += 1) {
    const tinted = neutralOverrides(seed, k / 100, "light")[step];
    const gap = Math.abs(chromaOf(hexToRgb(tinted)) - castChroma);
    if (gap < bestGap) {
      bestGap = gap;
      strength = k;
    }
  }
  report.push({
    lever: "Neutral tint",
    value: `${strength}%`,
    status: "approximated",
    note: `The cast of ${castHex}, fitted onto rift's neutral scale.`,
  });
  return { tintOn: true, tintSeed: seed, tintStrength: strength };
}

/** Radius and pill: the input's corner (rift's inputs and standard
    containers share one radius step) or, failing that, the cards'. */
function fitShape(doc: YamlMap, report: MatchRow[]) {
  const out: { radiusScale?: number; pill?: boolean } = {};
  const group = isMap(doc.components) ? doc.components : {};
  const cornerOf = (pattern: RegExp) =>
    Object.entries(group)
      /* State variants restate the resting corner, and the format's `ex-`
         entries are illustrative surfaces, not the product's own. */
      .filter(
        ([key, node]) =>
          pattern.test(key) &&
          !key.startsWith("ex-") &&
          !/focus|error|active|selected|pressed|disabled/.test(key) &&
          isMap(node)
      )
      .map(([, node]) => resolve(doc, (node as YamlMap).rounded ?? (node as YamlMap).borderRadius))
      .filter((v): v is string => Boolean(v) && !isPillRadius(v))
      .map(toPx)
      .filter((px): px is number => px !== null && px > 0);

  const median = (values: number[]) => [...values].sort((a, b) => a - b)[values.length >> 1];
  const inputs = cornerOf(/(^|-)(input|field|textarea|select)(-|$)/i);
  const cards = cornerOf(/(^|-)(card|tile|panel|container|modal|dialog)(-|$)/i);
  const corner = inputs.length > 0 ? median(inputs) : cards.length > 0 ? median(cards) : null;

  if (corner !== null) {
    const range = LEVER_RANGES.radius;
    out.radiusScale = clamp(snap((corner / SHIPPED_INPUT_RADIUS_PX) * 100, range.step), range.min, range.max);
    report.push({
      lever: "Radius",
      value: `${out.radiusScale}%`,
      status: "approximated",
      note: `The ${inputs.length > 0 ? "input" : "card"} corner (${corner}px), on rift's radius scale.`,
    });
  } else {
    report.push({ lever: "Radius", value: "100%", status: "kept", note: "The file gives no input or card corner." });
  }

  const button = component(doc, /^button-primary$/) ?? component(doc, /^button/);
  const buttonCorner = button ? resolve(doc, button.rounded ?? button.borderRadius) : undefined;
  if (buttonCorner) {
    out.pill = isPillRadius(buttonCorner);
    report.push({
      lever: "Pill buttons",
      value: out.pill ? "On" : "Off",
      status: "matched",
      note: `The primary button's corner is ${buttonCorner}.`,
    });
  } else {
    report.push({ lever: "Pill buttons", value: "On", status: "kept", note: "The file gives no button corner." });
  }
  return out;
}

/** Density: the scale of rift's gap ladder that sits closest to the file's
    spacing steps, judged relatively so a 4px miss counts more than at 48px. */
function fitDensity(doc: YamlMap, report: MatchRow[]) {
  const group = doc.spacing;
  const values = isMap(group)
    ? Object.values(group)
        .map((v) => toPx(resolve(doc, v)))
        .filter((px): px is number => px !== null && px >= 4 && px <= 64)
    : [];
  if (values.length < 4) {
    report.push({ lever: "Density", value: "100%", status: "kept", note: "The file gives too few spacing steps to fit." });
    return {};
  }
  const range = LEVER_RANGES.density;
  let best = 100;
  let bestCost = Infinity;
  for (let s = range.min; s <= range.max; s += range.step) {
    const cost = values.reduce(
      (sum, v) => sum + Math.min(...SHIPPED_GAP_LADDER_PX.map((step) => Math.abs(v - (step * s) / 100))) / v,
      0
    );
    /* Ties go to the shipped scale: a spacing system on the same 4px grid
       as rift's should read as rift's. */
    if (cost < bestCost - 1e-6 || (Math.abs(cost - bestCost) < 1e-6 && s === 100)) {
      bestCost = cost;
      best = s;
    }
  }
  report.push({
    lever: "Density",
    value: `${best}%`,
    status: "approximated",
    note: `${values.length} spacing steps, fitted onto rift's gap ladder.`,
  });
  return { density: best };
}

function fitType(doc: YamlMap, prose: string, catalogue: FontCatalogue, report: MatchRow[]) {
  const out: Partial<DesignMdTheme> = {};
  const styles = typeStyles(doc);
  if (styles.length === 0) {
    report.push({ lever: "Type", value: "Rift default", status: "kept", note: "The file gives no type styles." });
    return out;
  }
  const { display, heading, body } = tiers(styles);

  if (display) {
    out.displayWeight = leverWeight(display.weight);
    report.push({
      lever: "Display weight",
      value: String(out.displayWeight),
      status: out.displayWeight === display.weight ? "matched" : "approximated",
      note: `From ${display.key} (${display.size}px at ${display.weight}).`,
    });
  } else {
    report.push({ lever: "Display weight", value: "Rift default", status: "kept", note: "The file has no display style." });
  }
  if (heading) {
    out.headingWeight = leverWeight(heading.weight);
    report.push({
      lever: "Heading weight",
      value: String(out.headingWeight),
      status: out.headingWeight === heading.weight ? "matched" : "approximated",
      note: `From ${heading.key} (${heading.size}px at ${heading.weight}).`,
    });
  } else {
    report.push({ lever: "Heading weight", value: "Rift default", status: "kept", note: "The file has no heading style." });
  }

  if (body) {
    const range = LEVER_RANGES.typeScale;
    out.typeScale = clamp(snap((body.size / SHIPPED_BODY_SIZE_PX) * 100, range.step), range.min, range.max);
    report.push({
      lever: "Type scale",
      value: `${out.typeScale}%`,
      status: body.size === SHIPPED_BODY_SIZE_PX ? "matched" : "approximated",
      note: `Body copy at ${body.size}px against rift's ${SHIPPED_BODY_SIZE_PX}px.`,
    });
    if (body.trackingEm !== null) {
      const t = LEVER_RANGES.tracking;
      const exact = (body.trackingEm - SHIPPED_PARAGRAPH_TRACKING_EM) * 100;
      out.tracking = clamp(snap(exact, t.step), t.min, t.max);
      report.push({
        lever: "Tracking",
        value: `${out.tracking}%`,
        status: Math.abs(out.tracking - exact) < 1e-6 ? "matched" : "approximated",
        note: `Body tracking of ${(body.trackingEm * 100).toFixed(1)}% of an em; the lever moves every style together.`,
      });
    }
  }

  /* The faces: the body style's, and the largest heading or display
     style's. Headings that land on the body's face share it. */
  const bodyFamily = body?.family || styles.find((s) => s.family)?.family || "";
  const headingFamily = (display ?? heading)?.family || bodyFamily;
  const bodyMatch = bodyFamily ? matchFont(bodyFamily, prose, catalogue, "body") : null;
  if (bodyMatch) {
    out.bodyFont = bodyMatch;
    report.push(fontRow("Body face", bodyMatch));
  }
  const headingMatch = headingFamily ? matchFont(headingFamily, prose, catalogue, "heading") : null;
  if (headingMatch && headingMatch.family !== bodyMatch?.family) {
    out.headingFont = headingMatch;
    report.push(fontRow("Heading face", headingMatch));
  }
  return out;
}

const FONT_NOTES: Record<FontMatchKind, (m: FontMatch) => string> = {
  exact: (m) => `${m.requested} is a Google face, loaded as is.`,
  stack: (m) => `${m.requested} is not a Google face; ${m.family} is next in the file's font stack.`,
  suggested: (m) => `${m.requested} is not a Google face; the file names ${m.family} as its stand-in.`,
  substitute: (m) => `${m.requested} is not a Google face; ${m.family} is the closest in build.`,
  generic: (m) => `${m.requested} is not a Google face, and nothing closer than its category matched.`,
};

const fontRow = (lever: string, match: FontMatch): MatchRow => ({
  lever,
  value: match.family,
  status: match.kind === "exact" ? "matched" : "approximated",
  note: FONT_NOTES[match.kind](match),
});

/** Elevation: flat when the file has no shadows and says it wants none. */
function fitElevation(doc: YamlMap, body: string, report: MatchRow[]) {
  const shadows: string[] = [];
  const walk = (node: YamlValue) => {
    if (!isMap(node)) return;
    for (const [key, value] of Object.entries(node)) {
      if (/shadow|elevation/i.test(key) && typeof value === "string") {
        const v = resolve(doc, value);
        if (v && v !== "none" && v !== "0") shadows.push(v);
      } else walk(value);
    }
  };
  walk(doc.components ?? {});
  if (shadows.length > 0) {
    report.push({ lever: "Elevation", value: "Default", status: "approximated", note: "The file uses shadows; rift keeps its own two." });
    return { elevation: "default" as ElevationVariant };
  }
  if (/shadow-free|no (drop )?shadows|never (add )?(drop )?shadows|without shadows|(essentially|predominantly) flat|don.t add (drop )?shadows/i.test(body)) {
    report.push({ lever: "Elevation", value: "Flat", status: "matched", note: "The file describes a shadow-free system." });
    return { elevation: "flat" as ElevationVariant };
  }
  report.push({ lever: "Elevation", value: "Default", status: "kept", note: "The file says nothing about depth." });
  return {};
}

/**
 * Reads a DESIGN.md's text into lever positions. Null when the file has no
 * front matter with tokens in it, which is the case the caller reports.
 */
export function readDesignMd(text: string, catalogue: FontCatalogue): DesignMdTheme | null {
  const normalised = text.replace(/\r\n?/g, "\n");
  const doc = parseFrontMatter(normalised);
  if (!doc || !(isMap(doc.colors) || isMap(doc.colours) || isMap(doc.typography))) return null;
  const body = normalised.replace(/^﻿?---[\s\S]*?\n---[^\n]*\n?/, "");

  const report: MatchRow[] = [];
  const colours = colourEntries(doc);
  const action = fitAction(doc, colours, report);
  const tint = fitTint(colours, report);
  const shape = fitShape(doc, report);
  const density = fitDensity(doc, report);
  const type = fitType(doc, typographyProse(body), catalogue, report);
  const elevation = fitElevation(doc, body, report);

  const accents = accentsFromColours(colours.map(([, hex]) => hex)) ?? undefined;
  report.push(
    accents
      ? { lever: "Accents", value: "Six roles", status: "approximated", note: "The file's colours, placed on rift's six accent hues." }
      : { lever: "Accents", value: "Rift default", status: "kept", note: "The file has too few distinct hues to fill six roles." }
  );
  report.push(
    { lever: "Motion", value: "100%", status: "kept", note: "The format carries no motion tokens." },
    { lever: "Status colours", value: "Rift's", status: "kept", note: "Info, positive, warning and error keep rift's roles." }
  );

  /* Names in the format are often slugs ("Apple-design-analysis"); joined
     words read as a title once the hyphens and underscores are spaces. */
  const rawTitle = resolve(doc, doc.name)?.trim() || (/^#\s+(.+)$/m.exec(body)?.[1] ?? "").trim();
  const spaced = rawTitle.replace(/(?<=\w)[-_]+(?=\w)/g, " ").replace(/\s+/g, " ").trim();
  const title = spaced.charAt(0).toUpperCase() + spaced.slice(1);
  const description = (resolve(doc, doc.description) ?? "").trim();
  const swatches = [...new Set([action.brand, ...colours.map(([, hex]) => hex)].filter(Boolean) as string[])].slice(0, 8);

  return {
    title,
    description,
    ...action,
    ...tint,
    ...shape,
    ...density,
    ...type,
    ...elevation,
    accents,
    swatches,
    report,
  };
}

/** What a dropped or chosen DESIGN.md yields. */
export interface DesignMdSource {
  name: string;
  theme: DesignMdTheme;
}

/** Whether a file is a candidate DESIGN.md, by name or type. */
export const isDesignMdFile = (file: File) =>
  /\.(md|markdown)$/i.test(file.name) || file.type === "text/markdown";

/**
 * Reads a local DESIGN.md and fits the levers to it. The text is read in
 * this tab and nowhere else; the font catalogue is imported on demand, so
 * the playground pays for it only when a file is actually dropped.
 */
export async function themeFromDesignMd(file: File): Promise<DesignMdSource | null> {
  if (!isDesignMdFile(file) || file.size > DESIGN_MD_MAX_BYTES) return null;
  try {
    const [text, catalogue] = await Promise.all([
      file.text(),
      import("@/data/google-fonts.generated").then((m) => ({
        fonts: m.GOOGLE_FONTS,
        substitutes: m.FONT_SUBSTITUTES,
      })),
    ]);
    const theme = readDesignMd(text, catalogue);
    return theme ? { name: file.name, theme } : null;
  } catch {
    return null;
  }
}
