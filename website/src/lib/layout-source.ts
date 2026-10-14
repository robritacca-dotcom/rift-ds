/**
 * Reads the site's `--layout-*` custom properties out of globals.css at
 * build time, for /foundations/layout. The stylesheet is the one home of
 * the values; the page prints what it declares rather than restating it.
 *
 * For each property: the value declared on :root, the value the mid
 * breakpoint's override gives it (when it has one), and both resolved to
 * a plain length where the declaration is a bare var() chain onto the
 * token files or the chat widget's stylesheet. A calc() stays as written.
 *
 * Node-only (it reads the filesystem), so it is imported by server
 * components alone. Paths are relative to the website root, which is the
 * working directory of both `next dev` and `next build`.
 */
import fs from "fs";
import path from "path";
import { BREAKPOINT_MID_PX, mediaBelow } from "rift-ds/tokens/breakpoints";

export interface LayoutValue {
  /** The declaration as written, whitespace collapsed. */
  declared: string;
  /** The length a bare var() chain lands on, or null for a calc(). */
  resolved: string | null;
}

export interface LayoutPropertyValues {
  base: LayoutValue;
  /** The mid breakpoint's override, when the property has one. */
  mid: LayoutValue | null;
}

const read = (rel: string) =>
  fs.readFileSync(path.join(process.cwd(), rel), "utf-8").replace(/\r\n/g, "\n");

/** The body of the first top-level `selector {…}` block at or after `from`. */
function block(source: string, open: number): string {
  let depth = 0;
  for (let i = source.indexOf("{", open); i < source.length; i++) {
    if (source[i] === "{") depth++;
    else if (source[i] === "}" && --depth === 0) {
      return source.slice(source.indexOf("{", open) + 1, i);
    }
  }
  throw new Error("layout-source: unbalanced block");
}

/** Declarations of the given prefix in a block, without its nested blocks. */
function declarations(body: string, prefix: string): Map<string, string> {
  const flat = body.replace(/\/\*[\s\S]*?\*\//g, "");
  const out = new Map<string, string>();
  for (const m of flat.matchAll(new RegExp(`(${prefix}[\\w-]*)\\s*:\\s*([^;{}]+);`, "g"))) {
    const value = m[2].replace(/\s+/g, " ").replace(/\(\s/g, "(").replace(/\s\)/g, ")").trim();
    if (!out.has(m[1])) out.set(m[1], value);
  }
  return out;
}

export interface Layer {
  /** The custom property. */
  name: string;
  /** Its z-index. */
  value: number;
  /** The comment beside the declaration: what sits on the layer. */
  role: string;
  /** Which stylesheet owns it. */
  scope: "Library" | "Site";
}

/**
 * The stacking layers, lowest first: the library's `--layer-*` from the
 * token file, then the site's `--layer-site-*` from globals.css. Each
 * declaration's trailing comment is its description, so the stylesheet
 * stays the one home of both the number and the words.
 */
export function readLayers(): Layer[] {
  const parse = (rel: string, prefix: string, scope: Layer["scope"]) =>
    [...read(rel).matchAll(new RegExp(`(${prefix}[\\w-]*)\\s*:\\s*(\\d+)\\s*;[ \\t]*/\\*\\s*([^*]+?)\\s*\\*/`, "g"))].map(
      (m): Layer => ({ name: m[1], value: Number(m[2]), role: m[3], scope })
    );
  const layers = [
    ...parse("../src/tokens/tokens-light.css", "--layer-", "Library"),
    ...parse("src/app/globals.css", "--layer-site-", "Site"),
  ];
  if (!layers.length) throw new Error("layout-source: found no --layer-* declarations");
  return layers.sort((a, b) => a.value - b.value);
}

let cache: Map<string, LayoutPropertyValues> | null = null;

/** Every `--layout-*` property globals.css declares on :root, in order. */
export function readLayoutProperties(): Map<string, LayoutPropertyValues> {
  if (cache) return cache;
  const globals = read("src/app/globals.css");
  const root = block(globals, globals.indexOf(":root"));
  const midAt = globals.indexOf(`@media ${mediaBelow(BREAKPOINT_MID_PX)}`);
  if (midAt < 0) throw new Error("layout-source: globals.css has no mid-breakpoint override block");
  const mid = declarations(block(globals, midAt), "--layout-");

  /* Lookup for resolving var() chains: the token files and the chat
     widget's defaults, top-level declarations only (first wins, so a
     breakpoint override further down never shadows the base value). */
  const lookup = new Map<string, string>();
  for (const rel of [
    "../src/tokens/tokens-primitives.css",
    "../src/tokens/tokens-light.css",
    "../src/chat/ChatWidget.css",
  ]) {
    const topLevel = read(rel).replace(/\/\*[\s\S]*?\*\//g, "").split("@media")[0];
    for (const [k, v] of declarations(topLevel, "--")) {
      if (!lookup.has(k)) lookup.set(k, v);
    }
  }
  const resolve = (declared: string): LayoutValue => {
    let value = declared;
    for (let i = 0; i < 8; i++) {
      const m = value.match(/^var\((--[\w-]+)\)$/);
      if (!m) break;
      const next = lookup.get(m[1]);
      if (!next) return { declared, resolved: null };
      value = next;
    }
    return { declared, resolved: /^-?[\d.]+(px|rem|svh|vh|%)$/.test(value) ? value : null };
  };

  cache = new Map();
  for (const [name, declared] of declarations(root, "--layout-")) {
    const override = mid.get(name);
    cache.set(name, { base: resolve(declared), mid: override ? resolve(override) : null });
  }
  return cache;
}
