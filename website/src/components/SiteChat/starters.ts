/**
 * Conversation starters, keyed to where the visitor is standing. A new chat
 * opened on the about page should not ask the same three questions as one
 * opened on a blueprint page — the starter is the widget's first guess at
 * why someone opened it here.
 *
 * Each route holds a pool of pre-written questions, and a seeded pick draws
 * three of them. The seed lives in the chat provider: rolled once per page
 * load and again on "New chat", so a refresh or a fresh conversation shows a
 * different mix while re-renders and client-side navigation never reshuffle
 * under the visitor. Pre-written on purpose — the variety is theatre, not
 * tokens: no model is asked for any of these.
 *
 * Every label follows one pattern: a single crisp question with no filler,
 * or a bare imperative (Summarise, Explain, Describe, Walk me through).
 *
 * The route also travels to the model as page context (see the sanitised
 * `path` in /api/chat), which is what lets a starter say "this page" or
 * "this component" and resolve.
 *
 * Every label here has to fit on one chip: the budget is SUGGESTION_MAX_CHARS
 * and `scripts/validate-chat-starters.mjs` holds the written ones to it. The
 * item starters below name the thing the visitor is looking at, so their
 * length depends on runtime data — those fall back to the unnamed wording
 * rather than overflowing.
 */
import { fitsChip } from "@/lib/chat-suggestions";

export interface Starter {
  id: string;
  label: string;
}

/** How many chips the welcome screen shows, drawn from the pools below. */
export const STARTER_COUNT = 3;

/** The named wording when it fits the chip, the unnamed one when it does not. */
const named = (withName: string, without: string): string =>
  fitsChip(withName) ? withName : without;

/* FNV-1a over the pathname, so each page draws a different slice of the
   load's seed — two pages seen in one visit should not echo each other. */
function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/* mulberry32 — a tiny deterministic PRNG. Deterministic matters more than
   quality here: the same (seed, page) must pick the same chips on every
   render, or the set would churn as the visitor types. */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Draw STARTER_COUNT starters from a pool, deterministically for a given
 * (seed, key) pair. A null seed returns the head of the pool unshuffled —
 * the pools lead with their strongest questions, so callers without a seed
 * (and the server, if one ever renders this) get the curated order.
 */
function pickStarters(pool: Starter[], seed: number | null, key: string): Starter[] {
  if (pool.length <= STARTER_COUNT) return pool;
  if (seed === null) return pool.slice(0, STARTER_COUNT);
  const rand = mulberry32(hashString(key) ^ Math.floor(seed * 0xffffffff));
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, STARTER_COUNT);
}

const DEFAULT_STARTERS: Starter[] = [
  { id: "recent", label: "What shipped recently?" },
  { id: "system", label: "How does this system work?" },
  { id: "site", label: "What is this site?" },
  { id: "claude", label: "How was this built with Claude?" },
  { id: "start", label: "Where should I start?" },
  { id: "install", label: "How do I install it?" },
  { id: "tokens", label: "How do tokens drive theming?" },
  { id: "agents", label: "Can my coding agent use this?" },
];

/** Longest-prefix wins, so /components/button beats /components. */
const STARTERS_BY_PREFIX: Array<[string, Starter[]]> = [
  ["/components", [
    { id: "organised", label: "How are components organised?" },
    { id: "install", label: "How do I install the system?" },
    { id: "different", label: "What makes this system different?" },
    { id: "count", label: "How many components are there?" },
    { id: "ai-set", label: "Which components are AI-specific?" },
    { id: "charts", label: "How do the charts work?" },
    { id: "server", label: "Do these work in Server Components?" },
    { id: "standout", label: "Which component stands out?" },
  ]],
  ["/foundations", [
    { id: "tokens", label: "Explain the token architecture" },
    { id: "dark", label: "How does dark mode work?" },
    { id: "teal", label: "Why is teal reserved for actions?" },
    { id: "semantic", label: "What are semantic tokens?" },
    { id: "type", label: "What typefaces are used?" },
    { id: "motion", label: "How is motion kept consistent?" },
    { id: "override", label: "How do I override the theme?" },
  ]],
  ["/blueprints", [
    { id: "this-spec", label: "What does this spec govern?" },
    { id: "maintain", label: "How does the system maintain itself?" },
    { id: "claude", label: "How was this built with Claude?" },
    { id: "why-publish", label: "Why publish the specs?" },
    { id: "validators", label: "What do the validators enforce?" },
    { id: "first", label: "Which spec should I read?" },
    { id: "split", label: "How do the specs divide the work?" },
  ]],
  ["/overview", [
    { id: "pipeline", label: "Explain the build pipeline" },
    { id: "registries", label: "What do the registries prevent?" },
    { id: "claude", label: "How was this built with Claude?" },
    { id: "ci", label: "What runs in CI?" },
    { id: "counts", label: "How do counts stay accurate?" },
    { id: "push", label: "What happens on a push to main?" },
    { id: "honest", label: "How does the site stay honest?" },
  ]],
  ["/docs", [
    { id: "start", label: "How do I get started?" },
    { id: "install", label: "How do I install the package?" },
    { id: "theme", label: "How do I theme it for my brand?" },
    { id: "agents", label: "Can my coding agent use this?" },
    { id: "mcp", label: "What's the MCP endpoint for?" },
    { id: "tokens", label: "Explain the token architecture" },
    { id: "honest", label: "How do the docs stay honest?" },
  ]],
  ["/skills", [
    { id: "skills", label: "What are the agent skills?" },
    { id: "loops", label: "What runs on a schedule?" },
    { id: "claude", label: "How was this built with Claude?" },
    { id: "ship", label: "What does the ship skill do?" },
    { id: "honest", label: "How do skills keep the site honest?" },
    { id: "vs-loops", label: "How do skills differ from loops?" },
    { id: "copy", label: "Can I copy these for my repo?" },
  ]],
  ["/loops", [
    { id: "loops", label: "What do the loops do?" },
    { id: "growth", label: "How does the growth loop work?" },
    { id: "journal", label: "Who writes the project journal?" },
    { id: "guardrails", label: "What guards the loops?" },
    { id: "cadence", label: "How often does each loop run?" },
    { id: "chat-quality", label: "What does the chat quality loop do?" },
    { id: "deploy", label: "Do loops deploy on their own?" },
  ]],
  ["/releases", [
    { id: "latest", label: "What shipped in the latest release?" },
    { id: "install", label: "How do I install the latest version?" },
    { id: "cadence", label: "How often do releases happen?" },
    { id: "contents", label: "What's in the npm package?" },
    { id: "log", label: "How is this log kept accurate?" },
  ]],
  ["/playground", [
    { id: "retheme", label: "How does re-theming work?" },
    { id: "tokens", label: "Explain the token architecture" },
    { id: "install", label: "How do I install the system?" },
    { id: "levers", label: "How do the theme levers work?" },
    { id: "purpose", label: "What is this playground for?" },
    { id: "whole-site", label: "Why does the whole site re-theme?" },
    { id: "override", label: "How do I override the theme?" },
  ]],
  ["/", [
    { id: "nutshell", label: "What is this system?" },
    { id: "install", label: "How do I install it?" },
    { id: "different", label: "What makes it different?" },
    { id: "count", label: "How many components are there?" },
    { id: "tokens", label: "How do tokens drive theming?" },
    { id: "storybook", label: "Where is the Storybook?" },
    { id: "claude", label: "How was this built with Claude?" },
    { id: "agents", label: "Can my coding agent use this?" },
  ]],
];

/**
 * Item pages get item-aware starter pools. The route already travels to the
 * model as page context, so "this component" resolves; when the nav
 * registry knows the item's label, one starter names it.
 */
function itemStarterPool(pathname: string, itemLabel?: string | null): Starter[] | null {
  if (/^\/components\/[^/]+$/.test(pathname)) {
    return [
      {
        id: "use",
        label: itemLabel
          ? named(`How do I use the ${itemLabel} component?`, "How do I use this component?")
          : "How do I use this component?",
      },
      { id: "tokens", label: "Which tokens does it use?" },
      { id: "props", label: "What props does it take?" },
      { id: "client", label: "Is it a client component?" },
      { id: "dark", label: "How does it look in dark mode?" },
      { id: "install", label: "How do I install the system?" },
    ];
  }
  if (/^\/foundations\/[^/]+$/.test(pathname)) {
    return [
      {
        id: "this-foundation",
        label: itemLabel
          ? named(
              `Explain how ${itemLabel.toLowerCase()} works here`,
              "Explain this part of the system"
            )
          : "Explain this part of the system",
      },
      { id: "tokens", label: "Explain the token architecture" },
      { id: "teal", label: "Why is teal reserved for actions?" },
      { id: "semantic", label: "What are semantic tokens?" },
      { id: "override", label: "How do I override the theme?" },
      { id: "dark", label: "How does dark mode work?" },
    ];
  }
  return null;
}

/**
 * The welcome screen's chips for a page. `seed` is the provider's per-load
 * draw (rolled again by "New chat"); the same (pathname, seed) always
 * returns the same set, so re-renders and navigation never reshuffle a set
 * the visitor is looking at.
 */
export function startersForPath(
  pathname: string | null,
  itemLabel?: string | null,
  seed: number | null = null
): Starter[] {
  if (!pathname) return pickStarters(DEFAULT_STARTERS, seed, "");

  const item = itemStarterPool(pathname, itemLabel);
  if (item) return pickStarters(item, seed, pathname);

  let best: Starter[] | null = null;
  let bestLength = 0;
  for (const [prefix, starters] of STARTERS_BY_PREFIX) {
    if (pathname.startsWith(prefix) && prefix.length > bestLength) {
      best = starters;
      bestLength = prefix.length;
    }
  }
  return pickStarters(best ?? DEFAULT_STARTERS, seed, pathname);
}
