/**
 * The deterministic tool implementations shared by the two model-facing
 * surfaces: the public MCP endpoint (/api/mcp, which registers them as MCP
 * tools) and the site chat (/api/chat, which exposes two of them to the
 * model as Anthropic tools). One home for the logic so the two surfaces can
 * never answer the same question differently.
 *
 * Everything here is a cheap in-memory read over generated, already-published
 * data — the component prop API, the token registry, the site corpus. That is
 * the security boundary, inherited from the corpus rule: the worst case of
 * any call is a stranger reading what was already public. Never add a lookup
 * that reads anything else.
 */
import pkg from "@robr0/design-system/package.json";
import {
  TOKEN_COUNT,
  TOKEN_COUNTS,
  tokenRegistry,
} from "@robr0/design-system/tokens/registry";

import { componentApi } from "@/data/component-api.generated";
import { siteCorpus } from "@/data/site-corpus.generated";
import { SITE_URL } from "@/lib/structuredData";

/* ============================================
   lookupComponent: one component's full contract
   ============================================ */

export function lookupComponent(name: string) {
  const wanted = name.trim().toLowerCase();
  const entry = componentApi.find(
    (candidate) =>
      candidate.name.toLowerCase() === wanted ||
      candidate.label.toLowerCase() === wanted ||
      candidate.slug === wanted
  );
  if (!entry) {
    // A one-character name would "contain" its way to most of the list.
    const near =
      wanted.length > 1
        ? componentApi
            .filter((candidate) => candidate.name.toLowerCase().includes(wanted))
            .map((candidate) => candidate.name)
        : [];
    return {
      error: `No component named ${JSON.stringify(name)}.`,
      didYouMean: near.length > 0 ? near : undefined,
      hint: "Call list_components for the full list.",
    };
  }
  return {
    ...entry,
    docsUrl: `${SITE_URL}/components/${entry.slug}`,
    markdownUrl: `${SITE_URL}/components/${entry.slug}.md`,
    usage:
      entry.barrel === "charts"
        ? `import { ${entry.name} } from '${pkg.name}/charts'; // needs the optional recharts peer`
        : `import { ${entry.name} } from '${pkg.name}';`,
  };
}

/* ============================================
   lookupTokens: the semantic token registry
   ============================================ */

export function lookupTokens(category?: string) {
  if (category && !(category in tokenRegistry)) {
    return {
      error: `No token category named ${JSON.stringify(category)}.`,
      categories: Object.keys(TOKEN_COUNTS),
    };
  }
  const names = category
    ? { [category]: tokenRegistry[category as keyof typeof tokenRegistry] }
    : tokenRegistry;
  // The summed total ships with the data: a model asked "how many tokens?"
  // will otherwise add eight numbers itself, and models miscount.
  return { total: TOKEN_COUNT, counts: TOKEN_COUNTS, tokens: names };
}

/* ============================================
   searchCorpus: the corpus, sectioned and scored
   ============================================ */

/** The corpus split at its headings (### and up), computed once per instance. */
const corpusSections: { heading: string; body: string }[] = siteCorpus
  .split(/\n(?=#{1,3} )/)
  .map((section) => {
    const newline = section.indexOf("\n");
    return newline === -1
      ? { heading: section.trim(), body: "" }
      : { heading: section.slice(0, newline).trim(), body: section.slice(newline + 1).trim() };
  })
  .filter((section) => section.body.length > 0);

const SEARCH_RESULTS = 3;
const SEARCH_SECTION_CHARS = 6000;

export function searchCorpus(query: string): string[] {
  const terms = query.toLowerCase().split(/\s+/).filter((term) => term.length > 1);
  if (terms.length === 0) return [];
  const scored = corpusSections
    .map((section) => {
      const haystack = `${section.heading}\n${section.body}`.toLowerCase();
      let score = 0;
      for (const term of terms) {
        let hits = 0;
        let index = haystack.indexOf(term);
        while (index !== -1) {
          hits += 1;
          index = haystack.indexOf(term, index + term.length);
        }
        // Every term present beats one term repeated.
        score += hits + (hits > 0 ? 5 : 0);
      }
      return { section, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, SEARCH_RESULTS).map(({ section }) => {
    const body =
      section.body.length > SEARCH_SECTION_CHARS
        ? `${section.body.slice(0, SEARCH_SECTION_CHARS)}\n[section truncated]`
        : section.body;
    return `${section.heading}\n${body}`;
  });
}
