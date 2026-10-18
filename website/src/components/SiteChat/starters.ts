/**
 * The site's conversation starters, keyed to where the visitor is standing.
 * A new chat opened on a component page should not ask the same three
 * questions as one opened on a blueprint page: the starter is the widget's
 * first guess at why someone opened it here.
 *
 * Each page holds a pool of pre-written questions, and the package's seeded
 * draw (`pickStarters` from rift-ds/chat) shows three of them. The seed
 * lives in the chat provider: rolled once per page load and again on
 * "New chat", so a refresh or a fresh conversation shows a different mix
 * while re-renders never reshuffle under the visitor.
 *
 * The pools have one home per kind of page:
 *   - every static route writes its own pool in the page-summaries registry
 *     (`website/src/data/page-summaries.json`, beside the page's TLDR), and
 *     `scripts/validate-page-summaries.mjs` fails the build on a route
 *     without one, so a new page cannot ship with another page's questions;
 *   - component pages share the item pool below, which names the component;
 *   - anything else (a labs page, a 404) gets the site-wide default.
 *
 * Every label follows one pattern: a single crisp question with no filler,
 * or a bare imperative (Summarise, Explain, Describe, Walk me through), and
 * every label has to fit on one chip: `scripts/validate-chat-starters.mjs`
 * holds the written ones to SUGGESTION_MAX_CHARS, and fails a label that
 * names a theme-owned value (a primitive colour family, the base typeface),
 * because a theme can change those and the starter would go stale. The item
 * starters name the thing the visitor is looking at, so their length
 * depends on runtime data; those fall back to the unnamed wording rather
 * than overflowing (`namedStarter`).
 */
import { namedStarter, pickStarters, type Starter } from "rift-ds/chat";
import { getPageStarters } from "@/data/page-summaries";

export type { Starter };

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

/**
 * Component pages get an item-aware pool. The route already travels to the
 * model as page context, so "this component" resolves; when the nav
 * registry knows the item's label, one starter names it.
 */
function componentStarterPool(itemLabel?: string | null): Starter[] {
  return [
    {
      id: "use",
      label: itemLabel
        ? namedStarter(`How do I use the ${itemLabel} component?`, "How do I use this component?")
        : "How do I use this component?",
    },
    { id: "tokens", label: "Which tokens does it use?" },
    { id: "props", label: "What props does it take?" },
    { id: "client", label: "Is it a client component?" },
    { id: "example", label: "Show me a quick example" },
    { id: "install", label: "How do I install the system?" },
  ];
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

  const written = getPageStarters(pathname);
  if (written) return pickStarters(written, seed, pathname);

  if (/^\/components\/[^/]+$/.test(pathname)) {
    return pickStarters(componentStarterPool(itemLabel), seed, pathname);
  }

  return pickStarters(DEFAULT_STARTERS, seed, pathname);
}
