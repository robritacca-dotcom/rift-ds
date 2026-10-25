/**
 * Reading a theme out of a DESIGN.md file.
 *
 * DESIGN.md is a spec format for describing a product's look: YAML front
 * matter holding colour, type, radius and spacing tokens plus component
 * recipes, then prose. Collections of them circulate as analyses of real
 * products. This module turns one into positions on the playground's
 * levers, the same way lib/theme/image-palette.ts turns a photograph into
 * them, with one difference that follows from having more to go on. A
 * photo is a guess, so it only moves levers. A file states colours
 * outright, so the colours it states are kept: the grey scale is rebuilt
 * through the greys it names for rift's neutral roles, the action ramp
 * through its primary shades and its stated hover and pressed fills, and
 * each status family around the status colour it names (the anchored
 * builders in theme-overrides.ts). A dark-first file's greys land on the
 * steps dark mode paints each role with, so light mode reads them
 * inverted; the visitor's own light or dark setting is never changed.
 * The neutral tint is never switched on: the file's own greys, or
 * rift's, never a wash it did not ask for.
 * Where a stated colour would break one of rift's own contracts, a fixed
 * rule bends it and the report says so: greys outside NEUTRAL_ANCHOR_BAND
 * of their step, status colours outside STATUS_DEPTH_BAND of their
 * family's depth, an action fill invisible on the mode the file does not
 * describe, a label under 4.5:1, an accent on the action colour's hue
 * (see importedActionColours and the accent builder). The rules are
 * deterministic: the same file always gives the same theme.
 * Nothing is added to the token set and no colour skips a tier: the
 * stated colours become primitive values, carried on the theme's extra
 * overrides and the Advanced colours lever, so the export reproduces them.
 * Everything else lands on a lever that already exists, through the same
 * functions a hand-moved lever goes through.
 *
 * It all runs in the visitor's browser. The file is read as text, parsed
 * here, and dropped; it is never uploaded and never stored. The one request
 * an import can cause is the Google Fonts stylesheet for a matched face, the
 * same request the playground's font picker makes.
 *
 * Any text file within the size cap is read, and none is refused for
 * what it says: one with nothing recognisable gives the base theme with
 * every lever reported kept. A binary passed off as text is refused, and
 * the guards under "untrusted text" below say what else is held back.
 *
 * Three steps, kept apart so each can be judged on its own:
 *
 *   parseFrontMatter — a strict YAML subset (nested maps of scalars), which
 *                      is all the format's front matter uses. Lists,
 *                      anchors and block scalars are skipped, never
 *                      evaluated, since the file is untrusted text.
 *   proseDoc         — the same token map read from a file with no front
 *                      matter, from its colour lines, type table, radius
 *                      and spacing bullets and shadows.
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
  SHIPPED_CARD_RADIUS_PX,
  SHIPPED_DISPLAY_TRACKING_EM,
  SHIPPED_GAP_LADDER_PX,
  SHIPPED_INPUT_RADIUS_PX,
  SHIPPED_PARAGRAPH_TRACKING_EM,
  TYPE_WEIGHT_RANGE,
  hexToRgb,
  DEFAULT_ADVANCED,
  NEUTRAL_ROLE_STEPS,
  importedActionColours,
  findPrimitive,
  anchoredNeutralOverrides,
  nearestRampFor,
  shippedNeutralHex,
  neutralStepOverrides,
  NEUTRAL_SURFACE_STEPS,
  CHROMATIC_RAMPS,
  TEXT_TONE_LABELS,
  hslToRgb,
  type AdvancedColorState,
  type Overrides,
  rgbToHex,
  rgbToHsl,
  type AccentSextet,
  type ElevationVariant,
  type FontOption,
  type TextTone,
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
    if (raw.length > MAX_LINE) continue;
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

/* ---------- the prose form ----------
   Many DESIGN.md files carry no front matter: the same facts are written
   as markdown, colours as `**Name** (`#hex`): role` bullets or a quick
   reference of `Role: Name (`#hex`)` lines, type as a table, radius and
   spacing as bullets. This reads what it can into the same token map the
   front matter would give, under the keys the fitters already look for,
   so one set of fitters serves both forms. A role is read from the words
   beside a colour, which is a guess rather than a stated key; a colour
   with no role it recognises still counts toward the accents. */

/** A line longer than this is not a token line, and is skipped rather
    than handed to a pattern. */
const MAX_LINE = 2000;

const HEX = /#(?:[0-9a-f]{6}|[0-9a-f]{3})\b/i;

/** The roles a colour line can name, tried in order: the first that fits
    takes the line. `label` is the name or the text before the colon, `all`
    the whole line. Keys are the ones the fitters read. */
const PROSE_ROLES: ReadonlyArray<[key: string, fits: (label: string, all: string) => boolean]> = [
  ["primary-hover", (l) => /hover/.test(l) && /primary|brand|accent|cta|button/.test(l)],
  ["primary-pressed", (l) => /press|active/.test(l) && /primary|brand|accent|cta|button/.test(l)],
  ["error", (_, a) => /\b(error|negative|danger|destructive|critical)\b/.test(a)],
  ["warning", (_, a) => /\b(warning|caution)\b/.test(a)],
  ["success", (_, a) => /\b(success|positive)\b/.test(a)],
  ["info", (_, a) => /\b(info|informational|announcement)\b/.test(a)],
  [
    "primary",
    (_, a) =>
      /\b(primary brand|brand accent|accent|brand colou?r|primary colou?r|cta|primary action|primary button|call to action)\b/.test(a) &&
      !/\b(border|text|link|variant|hover|pressed)\b/.test(a),
  ],
  ["ink", (l, a) => /\b(primary text|text-base|body text|main text|text colou?r)\b/.test(a) || /^(text|ink|foreground)$/.test(l)],
  ["text-muted", (l, a) => /\b(secondary text|muted|inactive|subdued)\b/.test(a) || /^secondary text$/.test(l)],
  ["hairline", (_, a) => /\b(border|divider|separator|hairline|outline)s?\b/.test(a) && !/\bbutton/.test(a)],
  ["canvas", (_, a) => /\b(page background|background|deepest|canvas|base layer)\b/.test(a)],
  ["surface", (_, a) => /\b(card|surface|container|elevated|panel)\b/.test(a)],
];

const slugOf = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);

/** The first length in a cell like "24px (1.50rem)" or "6px–8px". */
const firstLength = (text: string) => /-?\d*\.?\d+\s*(?:px|rem|em|%)/i.exec(text)?.[0].replace(/\s+/g, "");

/** Markdown and inline code stripped, for reading the words. */
const plain = (text: string) => text.replace(/[`*_]/g, "").replace(/\s+/g, " ").trim();

/**
 * The prose form read into a token map: `colors`, `typography`,
 * `components` (the corners and a shadow, under keys fitShape and
 * fitElevation read) and `spacing`. Empty groups are left out, so a file
 * with nothing to read gives an empty map and changes nothing.
 */
function proseDoc(text: string): YamlMap {
  const colors: YamlMap = {};
  const typography: YamlMap = {};
  const components: YamlMap = {};
  const spacing: YamlMap = {};
  const roleScore = new Map<string, number>();
  const fallbacks = new Map<string, string>();
  let h2 = "";
  let h3 = "";
  let table: { cols: Record<string, number> } | null = null;
  let others = 0;

  const setColour = (key: string, hex: string, score: number) => {
    if ((roleScore.get(key) ?? 0) >= score) return;
    roleScore.set(key, score);
    colors[key] = hex;
  };

  for (const raw of text.split("\n")) {
    if (raw.length > MAX_LINE) continue;
    const line = raw.trim();
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      if (heading[1].length <= 2) {
        h2 = heading[2].toLowerCase();
        h3 = "";
      } else h3 = heading[2].toLowerCase();
      table = null;
      continue;
    }
    const section = `${h2} / ${h3}`;

    /* The type table: its header names the columns, every row after it is
       a style, until the table ends. */
    if (line.startsWith("|")) {
      const cells = line.slice(1, line.endsWith("|") ? -1 : undefined).split("|").map((c) => plain(c));
      if (!table && cells.some((c) => /font|family/i.test(c)) && cells.some((c) => /size/i.test(c))) {
        const find = (re: RegExp) => cells.findIndex((c) => re.test(c));
        table = {
          cols: {
            role: Math.max(0, find(/role|style|name|token|level/i)),
            font: find(/font|family/i),
            size: find(/size/i),
            weight: find(/weight/i),
            tracking: find(/letter|tracking/i),
          },
        };
        continue;
      }
      if (table) {
        if (cells.every((c) => /^:?-+:?$/.test(c))) continue;
        const cell = (k: string) => (table!.cols[k] >= 0 ? cells[table!.cols[k]] ?? "" : "");
        const size = firstLength(cell("size"));
        const key = slugOf(cell("role"));
        if (size && key && !(key in typography)) {
          const style: YamlMap = { fontSize: size };
          const family = cell("font").split(/[,(]/)[0].trim();
          if (family) style.fontFamily = family;
          const weight = /\d{3}/.exec(cell("weight"))?.[0];
          if (weight) style.fontWeight = weight;
          const tracking = firstLength(cell("tracking"));
          if (tracking) style.letterSpacing = tracking;
          typography[key] = style;
        }
        continue;
      }
    } else table = null;

    /* A face's fallbacks, from a "Font Families" line, so the face matcher
       has the file's own stack to work down. */
    const stack = /`([^`]+)`[^`]*fallbacks?:?\s*`([^`]+)`/i.exec(line);
    if (stack) fallbacks.set(stack[1].trim(), stack[2].trim());

    const hex = HEX.exec(line)?.[0];
    if (hex && /colou?r|palette|depth|elevation|surface/.test(section)) {
      const text = plain(line.replace(/^[-*+]\s+/, "").replace(/^\|/, "").replace(/\|/g, " : "));
      const bold = /\*\*([^*]+)\*\*/.exec(line)?.[1];
      const colon = text.indexOf(":");
      const label = (bold ?? (colon > 0 ? text.slice(0, colon) : "")).toLowerCase().trim();
      const all = text.toLowerCase();
      /* "Role: Name (#hex)" names the role outright, which outranks a role
         read from a description further up the file. */
      const score = !bold && colon > 0 && label.split(" ").length <= 3 ? 2 : 1;
      const role = PROSE_ROLES.find(([, fits]) => fits(label, all))?.[0];
      if (role) setColour(role, hex, score);
      else if (others < 24) colors[`x-${others++}-${slugOf(label || "colour")}`] = hex;
    }

    /* Corners, from the component sections and the radius scale. */
    const radius = /radius:?\s*`?(-?\d*\.?\d+\s*(?:px|rem|%))/i.exec(line)?.[1]?.replace(/\s+/g, "");
    if (radius) {
      if (/input|field|search/.test(h3) && !components.input) components.input = { rounded: radius };
      if (/card|container/.test(h3) && !components.card) components.card = { rounded: radius };
      if (/button/.test(h3) && !components["button-primary"]) components["button-primary"] = { rounded: radius };
    }
    if (/radius/.test(section) && /primary button/i.test(line)) {
      const value = firstLength(line);
      if (value) components["button-primary"] = { rounded: value };
    }

    if (/spacing/.test(section)) {
      for (const m of line.matchAll(/(\d+(?:\.\d+)?)px/g)) {
        if (Object.keys(spacing).length < 32) spacing[`s-${Object.keys(spacing).length}`] = `${m[1]}px`;
      }
    }

    if (/shadow|depth|elevation/.test(section) && /rgba?\([^)]*\)\s*-?\d+px|\d+px\s+\d+px[^|]*rgba?\(/i.test(line)) {
      components["x-shadow"] = { shadow: "stated" };
    }
  }

  for (const style of Object.values(typography)) {
    if (!isMap(style) || typeof style.fontFamily !== "string") continue;
    const stack = fallbacks.get(style.fontFamily);
    if (stack) style.fontFamily = `${style.fontFamily}, ${stack}`;
  }

  const doc: YamlMap = {};
  if (Object.keys(colors).length > 0) doc.colors = colors;
  if (Object.keys(typography).length > 0) doc.typography = typography;
  if (Object.keys(components).length > 0) doc.components = components;
  if (Object.keys(spacing).length > 0) doc.spacing = spacing;
  return doc;
}

/** The first paragraph of prose under the title, for the card. */
function proseDescription(body: string): string {
  for (const block of body.split(/\n\s*\n/)) {
    const text = block.trim();
    if (!text || /^(#|[-*+|>]|```|\d+\.)/.test(text)) continue;
    return plain(text);
  }
  return "";
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
 * A Google face the file's own prose offers as a stand-in for `requested`.
 * Only sentences that say so count ("closest", "substitute", "falling
 * back"...), and only whole, case-exact family names, so an ordinary word
 * that happens to name a font cannot match. A file names a stand-in per
 * role ("Cormorant Garamond for Copernicus; Inter for StyreneB"), so the
 * sentences that mention the requested face are read first, and within
 * them the catalogue face nearest that mention wins: the stand-in sits
 * beside the face it stands in for. Sentences that name no face fall
 * back to the whole section, where the first catalogue face stands.
 */
function suggestedFace(
  prose: string,
  fonts: Readonly<Record<string, string>>,
  requested = ""
): string | null {
  const sentences = prose
    .replace(/[*_`]/g, "")
    .split(/(?<=[.!?])\s+|\n+/)
    .filter((s) =>
      /substitut|closest|close match|alternative|equivalent|fall(ing|s)? ?back|similar|stand-in|instead|open[- ]source/i.test(s)
    );
  /* A platform face in a fallback stack (Roboto, Segoe UI) is the stack's
     own, not a stand-in the file chose, so it never counts here. */
  const facesIn = (sentence: string) => {
    const found: Array<{ name: string; at: number }> = [];
    for (const word of sentence.matchAll(/[A-Z][\w-]*(?: [A-Z0-9][\w-]*)*/g)) {
      /* Try the longest run of capitalised words first, so "Hanken
         Grotesk" wins over a family named "Hanken" if one existed. */
      const parts = word[0].split(" ");
      for (let len = parts.length; len > 0; len -= 1) {
        for (let i = 0; i + len <= parts.length; i += 1) {
          const name = parts.slice(i, i + len).join(" ");
          if (name.length < 4 || !fonts[name] || SYSTEM_STACK_FACES.has(name.toLowerCase())) continue;
          const at = (word.index ?? 0) + parts.slice(0, i).join(" ").length;
          if (!found.some((f) => f.at === at)) found.push({ name, at });
        }
      }
    }
    return found;
  };

  const mention = requested.split(/[\s,]/)[0]?.toLowerCase() ?? "";
  if (mention.length >= 4) {
    let best: { name: string; distance: number } | null = null;
    for (const sentence of sentences) {
      const at = sentence.toLowerCase().indexOf(mention);
      if (at < 0) continue;
      for (const face of facesIn(sentence)) {
        if (face.name.toLowerCase() === mention) continue;
        const distance = Math.abs(face.at - at);
        if (!best || distance < best.distance) best = { name: face.name, distance };
      }
    }
    if (best) return best.name;
  }
  for (const sentence of sentences) {
    const first = facesIn(sentence).sort((a, b) => a.at - b.at)[0];
    if (first) return first.name;
  }
  return null;
}

/** The faces a generic system stack lists after a licensed one. A file
    whose stack reads "-apple-system, Roboto, sans-serif" is naming the
    platform's own face, not choosing one, so a stand-in its prose names
    outranks such a stack hit. */
const SYSTEM_STACK_FACES = new Set([
  "roboto",
  "segoe ui",
  "helvetica",
  "helvetica neue",
  "arial",
  "system-ui",
  "-apple-system",
  "blinkmacsystemfont",
  "ui-sans-serif",
  "oxygen",
  "ubuntu",
  "cantarell",
  "fira sans",
  "droid sans",
]);

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
 * The nearest Google face to a font stack: the face itself, a later face
 * the file chose for its stack, the stand-in the file's prose names for
 * this face, a platform face the stack falls to, rift's stand-in table, or
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

  let systemHit: string | null = null;
  for (const [index, name] of named.entries()) {
    const hit = byLower.get(name.toLowerCase());
    if (!hit) continue;
    if (index === 0) return build(hit, "exact");
    if (!SYSTEM_STACK_FACES.has(name.toLowerCase())) return build(hit, "stack");
    systemHit ??= hit;
  }
  const suggested = suggestedFace(prose, catalogue.fonts, requested);
  if (suggested) return build(suggested, "suggested");
  if (systemHit) return build(systemHit, "stack");
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
  /** The style is set in capitals (`textTransform: uppercase`). */
  uppercase: boolean;
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
      uppercase: /^uppercase$/i.test(resolve(doc, raw.textTransform) ?? ""),
    });
  }
  return out;
}

const DISPLAY_NAME = /display|hero|mega|jumbo|giant/i;
const HEADING_NAME = /heading|headline|title|^h[1-6]$|subhead/i;
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
  /** The primitives the file's stated colours rebuild, and the action
      pointers it pins, in both themes (the light map applies to both,
      the dark map over it in dark mode). These ride the theme's extra
      overrides, so the export carries them like any preset's. */
  extraOverrides?: Overrides;
  extraOverridesDark?: Overrides;
  /** The AI gradient: "fade", the action colour fading toward the page,
      whenever the file names an action colour. The format carries no
      gradient tokens, so the ring takes the brand rather than keeping
      rift's own hues around a colour the file chose. */
  aiGradient?: "fade";
  /** The background field: "fade", the action colour's ramp fading toward
      the page, whenever the file names an action colour. The format
      carries no field, and the accents it fills come from its status and
      secondary hues, which would put another brand's mood behind this one. */
  ambientField?: "fade";
  /** Ramps rebased around a stated colour (the status families), on the
      Advanced colours lever. */
  advanced?: AdvancedColorState;
  radiusScale?: number;
  pill?: boolean;
  density?: number;
  typeScale?: number;
  displayWeight?: number;
  headingWeight?: number;
  bodyWeight?: number;
  tracking?: number;
  elevation?: ElevationVariant;
  accents?: AccentSextet;
  bodyFont?: FontMatch;
  /** Absent when the headings share the body face. */
  headingFont?: FontMatch;
  /** The display and heading tiers' colour families, when the file names a
      coloured one; absent, the tier stays in the ink. */
  displayTone?: TextTone;
  headingTone?: TextTone;
  /** The colours the theme was read from, for the source card. */
  swatches: string[];
  report: MatchRow[];
  /** What the file states that rift has no lever for, each with what rift
      does instead (see SourceTrait). */
  traits: SourceTrait[];
}

/** A trait the file states that no lever carries: casing, a monospace
    face, the secondary button's shape, a second action colour, corners the
    one scale cannot hold both of. Each names what rift does instead, in
    rift's own words, so the export can tell a coding agent without
    copying the file's prose. */
export interface SourceTrait {
  kind: "uppercase" | "mono" | "secondary" | "second-action" | "radius";
  text: string;
}

/** The brand a file's title names, for the theme's name: the format's
    titles run "Figma-design-analysis" and "1win Analysis". */
export function brandNameOf(title: string): string {
  return title
    .replace(/^(a |the )?design system (inspired by|for|of) /i, "")
    .replace(/^inspired by /i, "")
    .replace(/[\s-]*(design[\s-]*)?(analysis|system)$/i, "")
    .replace(/[\s-]+$/, "")
    .trim();
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

/* ---------- type-tier colours ----------
   A file that colours its headlines apart from its copy names the colour
   under a display or heading key, in either mode. The tier takes the
   colour's family (the nearest chromatic ramp), never the stated step:
   rift picks the step per mode that holds the tier's contrast, as it does
   for every theme. A grey there is the ink, which is where the tier
   already sits. */
const TIER_COLOUR_KEYS: Array<{ tier: "display" | "heading"; lever: string; keys: RegExp }> = [
  {
    tier: "display",
    lever: "Display colour",
    keys: /^(display|text-display|display-text|display-colou?r|hero-text|text-hero)([-_](light|dark))?$/i,
  },
  {
    tier: "heading",
    lever: "Heading colour",
    keys: /^(heading|headings|headline|text-heading|heading-text|heading-colou?r|text-headline|headline-text)([-_](light|dark))?$/i,
  },
];

function fitTierTones(
  colours: ReadonlyArray<[string, string]>,
  report: MatchRow[]
): { displayTone?: TextTone; headingTone?: TextTone } {
  const out: { displayTone?: TextTone; headingTone?: TextTone } = {};
  for (const { tier, lever, keys } of TIER_COLOUR_KEYS) {
    const stated = colours.filter(([key]) => keys.test(key));
    const chromatic = stated
      .map(([key, hex]) => ({ key, hex, ramp: nearestRampFor(hex) }))
      .find(({ ramp }) => ramp !== "neutral");
    if (chromatic) {
      const tone = chromatic.ramp as TextTone;
      out[tier === "display" ? "displayTone" : "headingTone"] = tone;
      report.push({
        lever,
        value: TEXT_TONE_LABELS[tone],
        status: "approximated",
        note: `The file colours this tier ${chromatic.hex}; rift takes its family and picks the step that holds contrast in each mode.`,
      });
    } else {
      report.push({
        lever,
        value: "Ink",
        status: stated.length > 0 ? "matched" : "kept",
        note: stated.length > 0 ? "The file sets this tier in a grey, the ink." : "The file gives this tier no colour of its own.",
      });
    }
  }
  return out;
}

/** The first component key, in file order, that the pattern matches (a
    regex on the key, or a test of the key and its node). */
const componentKey = (
  doc: YamlMap,
  pattern: RegExp | ((key: string, node: YamlMap) => boolean)
): string | undefined => {
  const group = doc.components;
  if (!isMap(group)) return undefined;
  return Object.keys(group).find((k) => {
    const node = group[k];
    if (!isMap(node)) return false;
    return pattern instanceof RegExp ? pattern.test(k) : pattern(k, node);
  });
};

const component = (doc: YamlMap, pattern: RegExp): YamlMap | undefined => {
  const key = componentKey(doc, pattern);
  return key ? ((doc.components as YamlMap)[key] as YamlMap) : undefined;
};

/** The action colour: what the primary button is filled with, which is the
    role rift's action colour plays. The colour named `primary` is the
    fallback, since some files reserve it for something narrower. */
/** What the action fit needs from the neutral fit: which mode the file
    describes, and the grey scale the theme will have. */
interface ActionContext {
  described: "light" | "dark";
  neutralExtras?: Overrides;
  /** Dark mode's own neutral steps where they differ (see fitNeutrals). */
  neutralExtrasDark?: Overrides;
}

function fitAction(
  doc: YamlMap,
  colours: Array<[string, string]>,
  report: MatchRow[],
  ctx: ActionContext
) {
  /* The primary button by its usual names, else the first filled button
     the file has: a file that reserves `primary` for its identity draws
     its actions with a button named for its look (button-pill-dark), and
     that fill is the action colour. Outline, ghost, text and secondary
     buttons draw no action fill, so they never stand in. */
  const buttonKey =
    componentKey(doc, /^button-primary$/) ??
    componentKey(doc, /^button-(primary|cta)/) ??
    componentKey(doc, (key, node) =>
      /^button/.test(key) &&
      !/secondary|tertiary|ghost|outline|text|link|icon|glass|tint|hover|active|press|disabled|focus/.test(key) &&
      toHex(resolve(doc, node.backgroundColor)) !== null
    );
  const button = buttonKey ? (doc.components as YamlMap)[buttonKey] as YamlMap : undefined;
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

  /* The states the file states for the primary button, and the other
     shades it names on the same family, rebuild the action ramp through
     them, so a stated hover is the hover rather than rift's guess at one. */
  const stateOf = (pattern: RegExp, field: RegExp) => {
    const node = component(doc, pattern);
    const fromNode = node ? toHex(resolve(doc, node.backgroundColor)) : null;
    const nested = button
      ? Object.entries(button).find(([k]) => field.test(k))?.[1]
      : undefined;
    const fromField = isMap(nested)
      ? toHex(resolve(doc, nested.backgroundColor))
      : toHex(resolve(doc, nested));
    return fromNode ?? fromField ?? named(new RegExp(`^(primary|brand|action)-${field.source}$`)) ?? undefined;
  };
  /* Variant names sit between the role and the state (Stripe's
     button-primary-pill-pressed), and "press" is the format's short form. */
  const states = {
    hover: stateOf(/^button-(primary|cta)(-[a-z]+)?-hover$/, /hover/),
    active: stateOf(/^button-(primary|cta)(-[a-z]+)?-(active|pressed?)$/, /(active|pressed?)/),
  };
  const shades = colours
    .filter(([key]) => /^(primary|brand|action)[-_]/.test(key) && !/hover|active|press|dark|text|^on-|border|focus|bg/.test(key))
    .map(([, hex]) => hex);
  const statedDark = brandDark;
  const neutralHex = (step: string) =>
    ctx.neutralExtras?.[`--primitive-neutral-${step}`] ?? shippedNeutralHex(step) ?? "#000000";
  const darkNeutralHex = (step: string) =>
    ctx.neutralExtrasDark?.[`--primitive-neutral-${step}`] ?? neutralHex(step);
  const imported = neutral
    ? null
    : importedActionColours({
        key: brand,
        statedDark,
        states,
        shades,
        described: ctx.described,
        pages: { light: neutralHex("01"), dark: darkNeutralHex("10") },
        neutral: neutralHex,
      });
  const extra = imported ? imported.anchors.length - 1 : 0;
  const lightKey = imported?.lightKey ?? brand;
  const darkKey = imported?.darkKey ?? brandDark;
  /* A neutral key's dark partner is a preset's hex that names a neutral
     step; the theme draws that step with the file's own grey when it
     restates one, so the note names what the stylesheet resolves to. */
  const darkStep = neutral && darkKey ? findPrimitive(darkKey)?.step : undefined;
  const darkShown = darkStep ? darkNeutralHex(darkStep) : darkKey;

  const clauses: string[] = [];
  if (extra > 0) {
    clauses.push(
      `rebuilt through ${extra} more of the file's own shades${
        imported!.pinned.length > 0 ? ` (its ${imported!.pinned.join(" and ")} fill${imported!.pinned.length > 1 ? "s" : ""} exactly)` : ""
      }`
    );
  } else clauses.push("with rift's own steps between");
  if (imported?.adjusted) {
    clauses.push(
      `${imported.adjusted} mode, which the file does not describe, uses ${imported.adjusted === "light" ? lightKey : darkKey} from the same ramp so the fill stays visible on its page`
    );
  } else if (darkKey && darkKey !== lightKey) clauses.push(`${darkShown} in dark mode`);
  if (imported && imported.relabelled.length > 0) {
    clauses.push(`the label switches to the neutral scale's end in ${imported.relabelled.join(" and ")} mode to hold its contrast`);
  }
  report.push({
    lever: "Action colour",
    value: brand,
    status: extra > 0 ? "matched" : "approximated",
    note: `${
      fromButton
        ? buttonKey === "button-primary"
          ? "The primary button's fill"
          : `The ${buttonKey} fill`
        : "The primary colour"
    }, on rift's ${
      neutral ? "neutral" : imported?.ramp ?? nearestRampFor(brand)
    } ramp, ${clauses.join("; ")}.`,
  });
  return {
    brand: lightKey,
    brandDark: darkKey && darkKey !== lightKey ? darkKey : undefined,
    actionRamp: neutral ? "neutral" : imported?.ramp ?? nearestRampFor(brand),
    actionExtras: imported
      ? { light: { ...imported.primitives, ...imported.light }, dark: imported.dark }
      : undefined,
  };
}

/** The neutral roles a file can name a colour for: the step each one fits
    (NEUTRAL_ROLE_STEPS owns the steps), the key patterns that name it, in
    preference order, and the lightness the colour must have to belong to a
    light theme's role. A dark-first file names a near-black page, which
    would turn the scale inside out, so its greys are left to rift.
    Files commonly name a white canvas beside a soft one (canvas-soft,
    parchment); rift's page sits a step below its white containers, so the
    soft one is the page and the white one the container. */
const NEUTRAL_ROLE_KEYS: Record<
  string,
  { keys: RegExp[]; light: (l: number) => boolean; dark: (l: number) => boolean }
> = {
  "--color-bg-page-primary": {
    keys: [
      /^(canvas|background|bg|surface|page)[-_](soft|parchment|subtle|muted|alt|secondary|page)$/,
      /^(canvas|background|bg|page|background-primary|bg-primary|surface-page|page-background|parchment|paper)$/,
      /* A file that describes both modes names each page: the lightness
         window sorts the light one from the dark. */
      /^(canvas|background|bg|page|surface)[-_](light|dark)$|^night$/,
    ],
    light: (l) => l > 0.85,
    dark: (l) => l < 0.2,
  },
  "--color-text-primary": {
    keys: [
      /^(text|ink|foreground|fg|on-surface|on-background|body|text-primary|content)$/,
      /^(on-dark|text-on-dark|ink-dark|on-light|text-on-light|ink-light)$/,
    ],
    light: (l) => l < 0.3,
    dark: (l) => l > 0.75,
  },
  "--color-bg-container-primary": {
    keys: [
      /^(surface|card|container|surface-primary|surface-card|panel|elevated|surface-elevated|white)$/,
      /^(surface|card|canvas|background)[-_](card-dark|dark-elevated|elevated-dark|raised|dark|light|card-light)$|^night-raised$/,
      /^(canvas|background|bg)$/,
    ],
    light: (l) => l > 0.85,
    dark: (l) => l < 0.3,
  },
  "--color-bg-container-border": {
    keys: [/^(border|divider|outline|hairline|stroke|line|border-default|border-subtle|separator)$/],
    light: (l) => l > 0.6 && l < 0.96,
    dark: (l) => l > 0.12 && l < 0.5,
  },
  "--color-text-secondary": {
    keys: [/^(text|ink|foreground|fg|body)[-_](secondary|muted?(-\d+)?)$|^muted(-foreground)?$/],
    light: (l) => l < 0.6,
    dark: (l) => l > 0.45 && l < 0.9,
  },
  "--color-text-tertiary": {
    keys: [/^(text|ink|foreground|fg|body)[-_](tertiary|subtle|faint|placeholder|muted?(-\d+)?)$|^subtle$/],
    light: (l) => l > 0.25 && l < 0.75,
    dark: (l) => l > 0.3 && l < 0.8,
  },
};

/** Greys only: a deep navy ink still reads as ink, a teal does not. */
const NEUTRAL_MAX_CHROMA = 0.25;

/**
 * How far a stated grey's lightness may sit from rift's own value at the
 * step it would anchor. Every neutral step does a second job in the other
 * mode (light mode's secondary text is dark mode's secondary surface;
 * dark mode's border fills its neutral buttons; light mode's tertiary
 * text is its icon colour), so a grey far from the step's own depth would
 * suit its stated role and break the other one: a mid-grey muted text
 * turns dark surfaces grey, a hairline-light faint text turns icons
 * invisible. Within the band the file's grey is kept exactly; outside it,
 * a text grey may take the neighbouring text step instead, and otherwise
 * the step keeps rift's value.
 */
const NEUTRAL_ANCHOR_BAND = 0.15;

/** The other text step a muted or faint grey may take, per mode, when its
    own step's depth is too far from it. */
const TEXT_STEP_SIBLING: Record<"light" | "dark", Record<string, string>> = {
  light: { "07": "06", "06": "07" },
  dark: { "03": "04", "04": "03" },
};

const withinBand = (hex: string, step: string) => {
  const shipped = shippedNeutralHex(step);
  return shipped !== null && Math.abs(lightnessOf(hex) - lightnessOf(shipped)) <= NEUTRAL_ANCHOR_BAND;
};

/** The neutral scale, rebuilt through the greys the file names for rift's
    neutral roles. A light-first file's greys land on the steps the light
    theme paints each role with. A dark-first file (no light page, a dark
    one) lands on the dark theme's steps instead: dark mode shows its
    greys, light mode reads the same scale inverted, and the visitor's own
    light or dark setting is never touched. The tint lever stays off either
    way: a file that states its greys gets those greys, and one that states
    none gets rift's, never a wash it did not ask for. */
function fitNeutrals(colours: Array<[string, string]>, report: MatchRow[]) {
  const read = (mode: "light" | "dark") => {
    const anchors: Array<[string, string]> = [];
    const named: string[] = [];
    const claimed = new Set<string>();
    const used = new Set<string>();
    for (const { cssVar, step: lightStep, darkStep } of NEUTRAL_ROLE_STEPS) {
      const rule = NEUTRAL_ROLE_KEYS[cssVar];
      let step = mode === "light" ? lightStep : darkStep;
      let hit: [string, string] | undefined;
      for (const pattern of rule.keys) {
        hit = colours.find(
          ([key, hex]) =>
            !claimed.has(key) &&
            pattern.test(key.toLowerCase()) &&
            rule[mode](lightnessOf(hex)) &&
            chromaOf(hexToRgb(hex)) < NEUTRAL_MAX_CHROMA &&
            /* Step 01 is the light page and the dark ink. Pure white there
               would sit the light page flush with rift's white containers,
               so the step keeps rift's grey instead. */
            !(step === "01" && hex === "#FFFFFF")
        );
        if (hit) break;
      }
      if (hit && !withinBand(hit[1], step)) {
        /* Too far from the step's depth for its other job. A text grey may
           take the neighbouring text step; anything else is left out. */
        const sibling = TEXT_STEP_SIBLING[mode][step];
        if (sibling && !used.has(sibling) && withinBand(hit[1], sibling)) step = sibling;
        else hit = undefined;
      }
      if (hit && !used.has(step)) {
        claimed.add(hit[0]);
        used.add(step);
        anchors.push([step, hit[1]]);
        named.push(hit[0]);
      }
    }
    return { anchors, named, page: anchors.some(([s]) => s === (mode === "light" ? "01" : "10")) };
  };

  const light = read("light");
  const dark = read("dark");
  const darkFirst = !light.page && dark.page;

  /* A file that names a page for each mode (canvas-light and canvas-dark,
     canvas and night) describes both, so each mode is rebuilt through its
     own greys exactly: nothing is inverted and no surface is muted. Dark
     mode's extras are the steps its own scale sets differently from light
     mode's. The light page counts by name even when it is pure white,
     which step 01 bars from anchoring: the file still described it. */
  const namedPage = (mode: "light" | "dark") =>
    colours.some(
      ([key, hex]) =>
        (mode === "light" ? /^(canvas|background|bg|page|surface)[-_]light$/ : /^(canvas|background|bg|page|surface)[-_]dark$|^night$/).test(key.toLowerCase()) &&
        NEUTRAL_ROLE_KEYS["--color-bg-page-primary"][mode](lightnessOf(hex))
    );
  if ((light.page || namedPage("light")) && (dark.page || namedPage("dark")) && light.anchors.length > 0 && dark.anchors.length > 0) {
    const rebuiltLight = anchoredNeutralOverrides(light.anchors);
    const rebuiltDark = anchoredNeutralOverrides(dark.anchors);
    if (rebuiltLight && rebuiltDark) {
      const darkOnly: Overrides = {};
      for (const [name, value] of Object.entries(rebuiltDark.overrides)) {
        if (rebuiltLight.overrides[name] !== value) darkOnly[name] = value;
      }
      const usedIn = (mode: typeof light, rebuilt: typeof rebuiltLight) =>
        rebuilt.anchors.map(([step]) => mode.named[mode.anchors.findIndex(([s]) => s === step)]);
      report.push({
        lever: "Neutral scale",
        value: `${rebuiltLight.anchors.length + rebuiltDark.anchors.length} greys`,
        status: "matched",
        note: `The file names surfaces for both modes: light mode is rebuilt through its ${usedIn(light, rebuiltLight).join(", ")} and dark mode through its ${usedIn(dark, rebuiltDark).join(", ")}, each on the step that paints its role; greys too far from any step's depth keep rift's.`,
      });
      return {
        neutralExtras: rebuiltLight.overrides,
        neutralExtrasDark: Object.keys(darkOnly).length > 0 ? darkOnly : undefined,
        darkFirst: false,
      };
    }
  }

  const { anchors, named } = darkFirst ? dark : light;
  const rebuilt = anchoredNeutralOverrides(anchors);
  if (!rebuilt) {
    report.push({ lever: "Neutral scale", value: "Rift's", status: "kept", note: "The file names no greys for rift's roles, so the scale and its tint stay rift's." });
    return { neutralExtras: undefined, neutralExtrasDark: undefined, darkFirst };
  }
  const used = rebuilt.anchors.map(([step]) => named[anchors.findIndex(([s]) => s === step)]);

  /* The mode the file does not describe reads the scale inverted, so its
     surfaces are built from the described mode's ink end: a light file's
     deep navy text becomes the dark page. Those surface steps keep their
     hue but only a hint of its saturation (about what the Tint neutrals
     lever gives), so the undescribed mode's page reads as a tinted
     neutral rather than a field of brand colour. The described mode keeps
     every stated grey exactly; the two modes differ through the extras. */
  const other = darkFirst ? "light" : "dark";
  const exact: Overrides = {};
  const muted: Overrides = {};
  for (const step of NEUTRAL_SURFACE_STEPS[other]) {
    const hex = rebuilt.overrides[`--primitive-neutral-${step}`];
    if (!hex) continue;
    const [h, s, l] = rgbToHsl(hexToRgb(hex));
    if (s <= SURFACE_MAX_SATURATION) continue;
    Object.assign(exact, neutralStepOverrides(step, hex));
    Object.assign(muted, neutralStepOverrides(step, rgbToHex(hslToRgb([h, SURFACE_MAX_SATURATION, l])).toUpperCase()));
  }
  const mutedAny = Object.keys(muted).length > 0;

  report.push({
    lever: "Neutral scale",
    value: `${rebuilt.anchors.length} greys`,
    status: "matched",
    note: `${
      darkFirst
        ? `A dark-first file: its ${used.join(", ")} sit on the steps dark mode paints those roles with, and light mode reads the same scale inverted.`
        : `Rebuilt through the file's ${used.join(", ")}, each on the step that paints its role at its depth; greys too far from any step's depth keep rift's.`
    }${mutedAny ? ` In ${other} mode, which the file does not describe, the surfaces keep the greys' hue at a neutral's saturation.` : ""}`,
  });
  /* Base extras apply in both modes and the dark extras over them in dark,
     so a muted light mode is the base with the exact values restored for
     dark, and a muted dark mode is the exact base with the muted values
     for dark. */
  return darkFirst
    ? { neutralExtras: { ...rebuilt.overrides, ...muted }, neutralExtrasDark: mutedAny ? exact : undefined, darkFirst }
    : { neutralExtras: rebuilt.overrides, neutralExtrasDark: mutedAny ? muted : undefined, darkFirst };
}

/** The most saturation an undescribed mode's surface step keeps. A navy
    ink at 0.65 becomes a cool near-black; a grey already under it is
    left alone. */
const SURFACE_MAX_SATURATION = 0.18;

/** The status families: each status colour the file names rebases its
    ramp around it, the step the status border and the ramp's key share.
    A family the action colour already owns keeps the action's rebuild. */
const STATUS_FAMILIES: ReadonlyArray<{ ramp: string; label: string; key: RegExp }> = [
  { ramp: "red", label: "Error", key: /^(error|danger|destructive|critical|negative)$/ },
  { ramp: "green", label: "Positive", key: /^(success|positive)$/ },
  { ramp: "orange", label: "Warning", key: /^(warning|caution|attention)$/ },
  { ramp: "blue", label: "Info", key: /^(info|informational|notice)$/ },
];

/** How far a stated status colour's lightness may sit from its family's
    shipped key step and still be used exactly. */
const STATUS_DEPTH_BAND = 0.12;

function fitStatus(colours: Array<[string, string]>, actionRamp: string | undefined, report: MatchRow[]) {
  const bases: Record<string, string> = {};
  const stated: string[] = [];
  for (const family of STATUS_FAMILIES) {
    const hit = colours.find(([key]) =>
      family.key.test(key.toLowerCase().replace(/^(color|status|semantic|feedback)[-_]/, ""))
    );
    if (!hit || family.ramp === actionRamp) continue;
    const [hue, sat, light] = rgbToHsl(hexToRgb(hit[1]));
    if (sat < 0.25) continue;
    /* The family is rebased around its key step, which status borders use
       directly and from which the text, icon and wash steps are derived.
       A status colour tuned for one mode (a pale red for a dark UI) at
       that step would leave the other mode's icons and text too faint, so
       a stated colour far from the step's shipped depth keeps its hue and
       saturation and takes rift's depth: the colour the file chose, at the
       contrast rift's status roles are built on. */
    const shipped = CHROMATIC_RAMPS.find((r) => r.name === family.ramp)?.steps.find(([s]) => s === "07")?.[1];
    const shippedLight = shipped ? lightnessOf(shipped) : light;
    const atDepth = Math.abs(light - shippedLight) <= STATUS_DEPTH_BAND;
    const base = atDepth ? hit[1] : rgbToHex(hslToRgb([hue, sat, shippedLight])).toUpperCase();
    bases[family.ramp] = base;
    stated.push(`${family.label.toLowerCase()} ${hit[1]}${atDepth ? "" : ` (at rift's depth, ${base})`}`);
  }
  report.push(
    stated.length > 0
      ? { lever: "Status colours", value: `${stated.length} of 4`, status: "matched", note: `Rebuilt around the file's ${stated.join(", ")}; the rest keep rift's roles.` }
      : { lever: "Status colours", value: "Rift's", status: "kept", note: "The file names no status colours." }
  );
  return { statusBases: stated.length > 0 ? bases : undefined };
}

/** Radius and pill: the input's corner (rift's inputs and standard
    containers share one radius step) or, failing that, the cards'. */
/** A control corner this round or rounder is a capsule: rift's squared
    button lands on the 16px step, so anything past it reads as a pill,
    and an input past it is a capsule no input step of rift's reaches. */
const CAPSULE_MIN_PX = 16;

/** Whether a button corner is a pill: the pill token, half or more of the
    button's stated height, or past CAPSULE_MIN_PX when no height is given.
    Files state their pills in px as often as with a pill token (32px on a
    40px button), so the proportion decides, not the token. */
const isPillButton = (corner: string, height: number | null) => {
  if (isPillRadius(corner)) return true;
  const px = toPx(corner);
  if (px === null) return false;
  return height !== null ? px >= height / 2 : px >= CAPSULE_MIN_PX;
};

/** How far the input and card medians may disagree before the report
    names the contradiction: one band of the radius vocabulary. */
const RADIUS_DISAGREEMENT = 0.5;

function fitShape(doc: YamlMap, report: MatchRow[], traits: SourceTrait[]) {
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
      /* A stated 0px is a corner too: a square system fits at 0%. */
      .filter((px): px is number => px !== null && px >= 0);

  const median = (values: number[]) => [...values].sort((a, b) => a - b)[values.length >> 1];
  /* The scale is read from the surfaces: input corners against rift's
     input step and card corners against its card step, each a ratio, the
     median of all of them the scale. A capsule input is a shape rift's
     scale never reaches, so it is left out rather than letting it blow the
     cards up. */
  const inputs = cornerOf(/(^|-)(input|field|textarea|select)(-|$)/i).filter((px) => px < CAPSULE_MIN_PX);
  const cards = cornerOf(/(^|-)(card|tile|panel|container|modal|dialog)(-|$)/i);
  const ratios = [
    ...inputs.map((px) => px / SHIPPED_INPUT_RADIUS_PX),
    ...cards.map((px) => px / SHIPPED_CARD_RADIUS_PX),
  ];

  if (ratios.length > 0) {
    const range = LEVER_RANGES.radius;
    out.radiusScale = clamp(snap(median(ratios) * 100, range.step), range.min, range.max);
    const fed = [
      inputs.length > 0 ? `${inputs.length} input corner${inputs.length > 1 ? "s" : ""} (${median(inputs)}px)` : "",
      cards.length > 0 ? `${cards.length} card corner${cards.length > 1 ? "s" : ""} (${median(cards)}px)` : "",
    ].filter(Boolean);
    const inputRatio = inputs.length > 0 ? median(inputs) / SHIPPED_INPUT_RADIUS_PX : null;
    const cardRatio = cards.length > 0 ? median(cards) / SHIPPED_CARD_RADIUS_PX : null;
    const disagree =
      inputRatio !== null && cardRatio !== null && Math.abs(inputRatio - cardRatio) > RADIUS_DISAGREEMENT;
    if (disagree) {
      traits.push({
        kind: "radius",
        text: `Its inputs (${median(inputs)}px) and cards (${median(cards)}px) round at different ratios of rift's scale. One scale holds both, so the fitted value sits between them.`,
      });
    }
    report.push({
      lever: "Radius",
      value: `${out.radiusScale}%`,
      status: "approximated",
      note: `From ${fed.join(" and ")}, each against its step on rift's radius scale${
        disagree ? "; the inputs and cards disagree, so the scale sits between them" : ""
      }.`,
    });
  } else {
    report.push({ lever: "Radius", value: "100%", status: "kept", note: "The file gives no input or card corner on rift's scale." });
  }

  const button = component(doc, /^button-primary$/) ?? component(doc, /^button/);
  const buttonCorner = button ? resolve(doc, button.rounded ?? button.borderRadius) : undefined;
  if (buttonCorner) {
    const height = button ? toPx(resolve(doc, button.height)) : null;
    out.pill = isPillButton(buttonCorner, height);
    report.push({
      lever: "Pill buttons",
      value: out.pill ? "On" : "Off",
      status: "matched",
      note: `The primary button's corner is ${buttonCorner}${height !== null ? ` on a ${height}px button` : ""}.`,
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
    out.bodyWeight = leverWeight(body.weight);
    report.push({
      lever: "Body weight",
      value: String(out.bodyWeight),
      status: out.bodyWeight === body.weight ? "matched" : "approximated",
      note: `From ${body.key} (${body.size}px at ${body.weight}); emphasis and labels keep their distance above it.`,
    });
  }

  /* Tracking is read from the display tier and the body, since a brand's
     signature is tight headlines over plain body copy and rift's display
     tier opens by default. One lever moves every style by the same amount,
     so it takes the offset that errs least against both samples (the mean
     of the two), and the note says what each stated. A display tracking
     of zero is the format's default rather than a request, so only a
     tightened display counts; rift's open display tier is its own. */
  const samples = [
    display?.trackingEm !== null && display?.trackingEm !== undefined && display.trackingEm < 0
      ? { label: "display", stated: display.trackingEm, shipped: SHIPPED_DISPLAY_TRACKING_EM }
      : null,
    body?.trackingEm !== null && body?.trackingEm !== undefined
      ? { label: "body", stated: body.trackingEm, shipped: SHIPPED_PARAGRAPH_TRACKING_EM }
      : null,
  ].filter((s): s is NonNullable<typeof s> => s !== null);
  if (samples.length > 0) {
    const t = LEVER_RANGES.tracking;
    const exact = samples.reduce((sum, s) => sum + (s.stated - s.shipped) * 100, 0) / samples.length;
    out.tracking = clamp(snap(exact, t.step), t.min, t.max);
    const stated = samples.map((s) => `${s.label} ${(s.stated * 100).toFixed(1)}%`).join(" and ");
    report.push({
      lever: "Tracking",
      value: `${out.tracking}%`,
      status: samples.length === 1 && Math.abs(out.tracking - exact) < 1e-6 ? "matched" : "approximated",
      note: `${samples.length > 1 ? "Tracking of" : "Tracking of"} ${stated} of an em; the lever moves every style together${
        samples.length > 1 ? ", so it sits where both err least" : ""
      }.`,
    });
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
  /* A statement about the system, never a table cell: "no shadow" alone
     is how a depth table labels its flat level, in files that keep a soft
     tier beside it. */
  if (/shadow-free|no (drop )?shadows\b|never (add|uses?)? ?(a |any )?(drop )?shadows?\b|without shadows|(essentially|predominantly) flat|don.t add (drop )?shadows/i.test(body)) {
    report.push({ lever: "Elevation", value: "Flat", status: "matched", note: "The file describes a shadow-free system." });
    return { elevation: "flat" as ElevationVariant };
  }
  /* One faint tier for what floats (a menu, a sticky bar) is rift's soft
     pair, not its default one. */
  if (/(one|single) (shadow|elevation) tier|single shadow|(soft|subtle|faint|whisper|light|minimal|rare)[-\s]?(drop )?shadow|shadows? (is |are |stay |stays )?(rare|minimal|soft|subtle|faint|light)\b/i.test(body)) {
    report.push({ lever: "Elevation", value: "Soft", status: "approximated", note: "The file keeps one faint shadow for what floats, which is rift's softer pair." });
    return { elevation: "soft" as ElevationVariant };
  }
  report.push({ lever: "Elevation", value: "Default", status: "kept", note: "The file says nothing about depth." });
  return {};
}

/** The traits the file states that no lever carries, each with what rift
    does instead, in rift's own words. Built from the front matter alone,
    never from the file's prose, so nothing a stranger wrote is repeated. */
function readTraits(doc: YamlMap, brand: string | undefined, bodyFamily: string): SourceTrait[] {
  const traits: SourceTrait[] = [];
  const styles = typeStyles(doc);
  const group = isMap(doc.components) ? doc.components : {};

  if (styles.some((s) => s.uppercase)) {
    traits.push({
      kind: "uppercase",
      text: "Its labels and eyebrows are set in capitals. Rift sets casing at the use site: the overline style carries the metrics, so add text-transform: uppercase where the brand would.",
    });
  }

  const bodyGeneric = genericOf(splitStack(bodyFamily));
  const mono = styles.find(
    (s) => genericOf(splitStack(s.family)) === "monospace" && bodyGeneric !== "monospace"
  );
  if (mono) {
    traits.push({
      kind: "mono",
      text: `It sets ${/code/i.test(mono.key) ? "code" : "labels"} in a monospace face. Rift's one monospace stack is --font-family-code, read by CodeBlock and inline code and set by no lever, so that face stays rift's.`,
    });
  }

  const brandHue = brand ? rgbToHsl(hexToRgb(brand))[0] : null;
  const brandNeutral = brand ? nearestRampFor(brand) === "neutral" : true;
  const hueGap = (hex: string) => {
    if (brandHue === null) return 360;
    const d = Math.abs(rgbToHsl(hexToRgb(hex))[0] - brandHue);
    return Math.min(d, 360 - d);
  };
  const isNeutralHex = (hex: string | null) => hex !== null && chromaOf(hexToRgb(hex)) < 0.1;

  for (const [key, node] of Object.entries(group)) {
    if (!isMap(node) || !/^button-(secondary|outline|ghost)/.test(key)) continue;
    const fill = resolve(doc, node.backgroundColor);
    const fillHex = toHex(fill);
    const border = toHex(resolve(doc, node.borderColor));
    const text = toHex(resolve(doc, node.textColor));
    const fillIsCanvas = fill === undefined || /transparent/i.test(fill) || isNeutralHex(fillHex);
    const edgeIsInk = isNeutralHex(border) || (border === null && isNeutralHex(text));
    if (fillIsCanvas && edgeIsInk) {
      traits.push({
        kind: "secondary",
        text: "Its secondary button is an outline in ink or a plain canvas fill, not the action colour. Rift's secondary-neutral Button variant is that shape; use it where the brand would use its secondary.",
      });
      break;
    }
  }

  /* A second action colour: a chromatic `secondary` or `accent`, or a
     second filled button on another hue (or any hue, when the action
     colour is a neutral). */
  const isSecondAction = (hex: string | null) =>
    hex !== null && hex !== brand && !isNeutralHex(hex) && (brandNeutral || hueGap(hex) > 30);
  const secondHex =
    colourEntries(doc).find(([key, hex]) => /^(secondary|accent)$/.test(key) && isSecondAction(hex))?.[1] ??
    Object.entries(group)
      .filter(
        ([key, node]) =>
          isMap(node) &&
          /^button/.test(key) &&
          !/secondary|tertiary|ghost|outline|text|link|icon|hover|active|press|disabled/.test(key)
      )
      .map(([, node]) => toHex(resolve(doc, (node as YamlMap).backgroundColor)))
      .find(isSecondAction) ??
    null;
  if (secondHex) {
    traits.push({
      kind: "second-action",
      text: `It carries a second action colour (${secondHex}). Rift has one action colour; the second lands among the accents, for charts and the background field, never on a control.`,
    });
  }
  return traits;
}

/**
 * Reads a DESIGN.md's text into lever positions: the front matter when it
 * carries tokens, the prose otherwise. Never null: a file with nothing to
 * read reports every lever kept, and the theme is the base one.
 */
export function readDesignMd(text: string, catalogue: FontCatalogue): DesignMdTheme {
  const normalised = cleanText(text);
  const front = parseFrontMatter(normalised);
  const fromFront = Boolean(front && (isMap(front.colors) || isMap(front.colours) || isMap(front.typography)));
  const body = normalised.replace(/^﻿?---[\s\S]*?\n---[^\n]*\n?/, "");
  const doc = fromFront && front ? front : proseDoc(body);

  const report: MatchRow[] = [];
  const colours = colourEntries(doc);
  /* Greys first: the action fit needs each mode's page to keep its fill
     visible, and the mode the file describes. The report keeps its usual
     order, action colour first. */
  const neutralReport: MatchRow[] = [];
  const { neutralExtras, neutralExtrasDark, darkFirst } = fitNeutrals(colours, neutralReport);
  const { actionExtras, actionRamp, ...action } = fitAction(doc, colours, report, {
    described: darkFirst ? "dark" : "light",
    neutralExtras,
    neutralExtrasDark,
  });
  report.push(...neutralReport);
  const { statusBases } = fitStatus(colours, actionRamp, report);
  const traits: SourceTrait[] = [];
  const shape = fitShape(doc, report, traits);
  const density = fitDensity(doc, report);
  const type = fitType(doc, typographyProse(body), catalogue, report);
  const elevation = fitElevation(doc, body, report);
  const tones = fitTierTones(colours, report);
  traits.push(...readTraits(doc, action.brand, type.bodyFont?.requested ?? ""));

  const accents = accentsFromColours(colours.map(([, hex]) => hex), action.brand) ?? undefined;
  report.push(
    accents
      ? { lever: "Accents", value: "Six roles", status: "approximated", note: "The file's colours, placed on rift's six accent hues." }
      : { lever: "Accents", value: "Rift default", status: "kept", note: "The file has too few distinct hues to fill six roles." }
  );
  report.push(
    action.brand
      ? { lever: "AI gradient", value: "Action fade", status: "approximated", note: "The file states no gradient, so the ring fades the action colour toward the page: lighter in light mode, deeper in dark." }
      : { lever: "AI gradient", value: "Rift default", status: "kept", note: "The file names no action colour to fade." },
    action.brand
      ? { lever: "Background field", value: "Action fade", status: "approximated", note: "The file states no field, so the shader banner is the action colour's ramp fading toward the page." }
      : { lever: "Background field", value: "Rift default", status: "kept", note: "The file names no action colour, so the field follows the accents." },
    { lever: "Motion", value: "100%", status: "kept", note: "The format carries no motion tokens." }
  );

  /* The stated colours as overrides: the rebuilt grey scale first, then
     the action ramp and its pinned states, which own their family. */
  const extraOverrides = { ...neutralExtras, ...actionExtras?.light };
  const extraOverridesDark = { ...neutralExtrasDark, ...actionExtras?.dark };

  /* Names in the format are often slugs ("Apple-design-analysis"); joined
     words read as a title once the hyphens and underscores are spaces. */
  const rawTitle = resolve(doc, doc.name)?.trim() || (/^#\s+(.+)$/m.exec(body)?.[1] ?? "").trim();
  const spaced = rawTitle.replace(/(?<=\w)[-_]+(?=\w)/g, " ").replace(/\s+/g, " ").trim();
  const title = capText(spaced.charAt(0).toUpperCase() + spaced.slice(1), TITLE_MAX);
  const description = capText(
    (resolve(doc, doc.description) ?? "").trim() || (fromFront ? "" : proseDescription(body)),
    DESCRIPTION_MAX
  );
  const swatches = [...new Set([action.brand, ...colours.map(([, hex]) => hex)].filter(Boolean) as string[])].slice(0, 8);

  return {
    title,
    description,
    ...action,
    aiGradient: action.brand ? "fade" : undefined,
    ambientField: action.brand ? "fade" : undefined,
    extraOverrides: Object.keys(extraOverrides).length > 0 ? extraOverrides : undefined,
    extraOverridesDark:
      extraOverridesDark && Object.keys(extraOverridesDark).length > 0 ? extraOverridesDark : undefined,
    advanced: statusBases ? { ...DEFAULT_ADVANCED, bases: statusBases } : undefined,
    ...shape,
    ...density,
    ...type,
    ...elevation,
    ...tones,
    accents,
    swatches,
    report,
    traits,
  };
}

/** What a dropped or chosen DESIGN.md yields. */
export interface DesignMdSource {
  name: string;
  theme: DesignMdTheme;
}

/** Whether a file is a candidate DESIGN.md, by name or type. */
/** The text files the importer reads, by extension alone: markdown, and
    plain text, since a DESIGN.md saved as .txt is still one. A type the
    browser reports is not enough on its own: it guesses text/plain for
    CSVs, logs and files with no extension, none of which is a DESIGN.md. */
export const isDesignMdFile = (file: File) => /\.(md|markdown|txt)$/i.test(file.name);

/* ---------- untrusted text ----------
   The file is a stranger's text. It is never executed, never rendered as
   markup (React escapes what the card prints) and never uploaded, and no
   raw string from it reaches a style: colours pass through toHex, lengths
   through toPx, faces through the built Google catalogue. These guards
   cover what is left: a binary passed off as text, characters that
   reorder or hide what the card shows, and text long enough to slow the
   patterns down. */

const TITLE_MAX = 120;
const DESCRIPTION_MAX = 400;

/** Binary content: a NUL byte, or more than one character in a hundred
    outside printable text and ordinary whitespace. */
function looksBinary(text: string): boolean {
  if (text.includes("\u0000")) return true;
  const sample = text.slice(0, 64 * 1024);
  const control = sample.match(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g)?.length ?? 0;
  return sample.length > 0 && control / sample.length > 0.01;
}

/** Line endings normalised, and control and bidirectional-override
    characters removed, so nothing can reorder or hide the text the card
    prints. Tabs and newlines stay. */
const cleanText = (text: string) =>
  text
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁦-⁩]/g, "");

/** A string cut to a length at a word, with an ellipsis when cut. */
function capText(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 20)).trimEnd()}…`;
}

/** Why a file could not be read, for the caller to show. */
export type DesignMdRejection = "type" | "size" | "binary";

/**
 * Reads a local DESIGN.md and fits the levers to it. The text is read in
 * this tab and nowhere else; the font catalogue is imported on demand, so
 * the playground pays for it only when a file is actually dropped. Any
 * text file within the size cap is read: one with nothing the importer
 * recognises gives the base theme with every lever reported kept.
 */
export async function themeFromDesignMd(
  file: File
): Promise<DesignMdSource | { rejected: DesignMdRejection }> {
  if (!isDesignMdFile(file)) return { rejected: "type" };
  if (file.size > DESIGN_MD_MAX_BYTES) return { rejected: "size" };
  try {
    const [text, catalogue] = await Promise.all([
      file.text(),
      import("@/data/google-fonts.generated").then((m) => ({
        fonts: m.GOOGLE_FONTS,
        substitutes: m.FONT_SUBSTITUTES,
      })),
    ]);
    if (looksBinary(text)) return { rejected: "binary" };
    return { name: file.name, theme: readDesignMd(text, catalogue) };
  } catch {
    return { rejected: "binary" };
  }
}
