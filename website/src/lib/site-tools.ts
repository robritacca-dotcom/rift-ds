/**
 * The deterministic tool implementations shared by the two model-facing
 * surfaces: the public MCP endpoint (/api/mcp, which registers them as MCP
 * tools) and the site chat (/api/chat, which exposes two of them to the
 * model as Anthropic tools). One home for the logic so the two surfaces can
 * never answer the same question differently.
 *
 * Everything here is a cheap in-memory read over generated, already-published
 * data — the component prop API and the types it names, the token registry
 * and its resolved values, the documentation search index. That is
 * the security boundary, inherited from the corpus rule: the worst case of
 * any call is a stranger reading what was already public. Never add a lookup
 * that reads anything else.
 */
import pkg from "rift-ds/package.json";
import { componentCategoryMetadata } from "rift-ds/components/registry";
import {
  TOKEN_COUNT,
  TOKEN_COUNTS,
  tokenRegistry,
} from "rift-ds/tokens/registry";
import { THEME_IDS, tokenValue, type ThemeMode } from "rift-ds/tokens/values";

import { componentApi, type ComponentApiEntry } from "@/data/component-api.generated";
import { componentTypes } from "@/data/component-types.generated";
import { siteSearchSections, type SiteSearchSection } from "@/data/site-search.generated";
import { SITE_URL } from "@/lib/structuredData";
import { DEFAULT_THEME_LABEL, THEME_PRESETS } from "@/lib/theme/presets";

/* ============================================
   listComponents: the library, by category
   ============================================ */

/** The chat widget's category: not a component category, but listed beside them. */
export const WIDGET_CATEGORY = {
  id: "widget",
  label: "Widget",
  description:
    "Whole features assembled from the components, each imported from its own subpath: the AI chat is one.",
} as const;

/** Every category id list_components accepts, the widget's last. */
const categoryIds = () => [...componentCategoryMetadata.map((c) => c.id), WIDGET_CATEGORY.id];

/**
 * A category as a visitor might write it ("AI", "Data display",
 * "data-display") folded to its id, or null when nothing matches.
 */
function resolveCategory(category: string): string | null {
  const fold = (value: string) => value.trim().toLowerCase().replace(/[\s_]+/g, "-");
  const wanted = fold(category);
  const all = [...componentCategoryMetadata, WIDGET_CATEGORY];
  return all.find((c) => c.id === wanted || fold(c.label) === wanted)?.id ?? null;
}

const listing = (entry: ComponentApiEntry) => ({
  name: entry.name,
  label: entry.label,
  category: entry.category,
  description: entry.description,
  docsUrl: `${SITE_URL}/components/${entry.slug}`,
  schemaUrl: `${SITE_URL}/schema/components/${entry.slug}.json`,
});

/**
 * The components, and the widgets in their own list (the chat widget is not
 * one of the components the count describes). A category filter ignores
 * case and takes the label too; an unknown one is an error that lists the
 * valid ids, the shape lookupTokens answers an unknown category with. With
 * a filter set, the categories table is left out: the caller already chose.
 */
export function listComponents(category?: string, fields?: string) {
  const wanted = category === undefined || category.trim() === "" ? null : resolveCategory(category);
  if (category !== undefined && category.trim() !== "" && wanted === null) {
    return {
      error: `No component category named ${JSON.stringify(category)}.`,
      categories: categoryIds(),
    };
  }
  // Opt-in compact rows: name, slug, category and description, with the URLs
  // written once as patterns. The full rows stay the default so no caller
  // reading docsUrl from a row breaks.
  const compact = fields === "compact";
  const row = (entry: ComponentApiEntry) =>
    compact
      ? { name: entry.name, slug: entry.slug, category: entry.category, description: entry.description }
      : listing(entry);
  const components = componentApi
    .filter((entry) => entry.kind === "component")
    .filter((entry) => !wanted || entry.category === wanted)
    .map(row);
  const widgets = componentApi
    .filter((entry) => entry.kind === "widget")
    .filter(() => !wanted || wanted === WIDGET_CATEGORY.id)
    .map(row);
  return {
    package: pkg.name,
    version: pkg.version,
    ...(wanted ? { category: wanted } : { categories: [...componentCategoryMetadata, WIDGET_CATEGORY] }),
    count: components.length,
    schemaIndexUrl: `${SITE_URL}/schema/components.json`,
    ...(compact
      ? { urlPatterns: { docs: `${SITE_URL}/components/<slug>`, schema: `${SITE_URL}/schema/components/<slug>.json` } }
      : {}),
    components,
    widgets,
  };
}

/* ============================================
   lookupComponent: one component's full contract
   ============================================ */

/** Levenshtein distance, for "did you mean" on a miss. */
function editDistance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const current = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[b.length];
}

/**
 * The names closest to a miss: any name, label or slug that contains it,
 * then any within an edit distance of a third of its length (at least 2),
 * nearest first, at most five.
 */
function nearestNames(wanted: string): string[] {
  const fold = (value: string) => value.toLowerCase().replace(/[\s_-]+/g, "");
  const target = fold(wanted);
  if (target.length < 2) return [];
  const limit = Math.max(2, Math.floor(target.length / 3));
  const scored = componentApi
    .map((entry) => {
      const keys = [entry.name, entry.label, entry.slug].map(fold);
      const contains = keys.some((key) => key.includes(target) || (target.length > 3 && target.includes(key)));
      const distance = Math.min(...keys.map((key) => editDistance(target, key)));
      return { name: entry.name, score: contains ? -1 : distance };
    })
    .filter(({ score }) => score <= limit)
    .sort((a, b) => a.score - b.score || a.name.localeCompare(b.name));
  return scored.slice(0, 5).map(({ name }) => name);
}

/** The local types one export's props reach, nested ones included. */
function typesReachedBy(slug: string, propsRefs: readonly string[]) {
  const all = componentTypes[slug]?.types ?? {};
  const seen = new Set<string>();
  const queue = [...propsRefs];
  while (queue.length > 0) {
    const name = queue.shift()!;
    if (seen.has(name) || !all[name]) continue;
    seen.add(name);
    queue.push(...(all[name].refs ?? []));
  }
  return Object.fromEntries([...seen].sort().map((name) => [name, all[name]]));
}

export function lookupComponent(name: string, exportName?: string) {
  const wanted = name.trim().toLowerCase();
  const entry = componentApi.find(
    (candidate) =>
      candidate.name.toLowerCase() === wanted ||
      candidate.label.toLowerCase() === wanted ||
      candidate.slug === wanted
  );
  if (!entry) {
    const near = nearestNames(name);
    return {
      error: `No component named ${JSON.stringify(name)}.`,
      didYouMean: near.length > 0 ? near : undefined,
      hint: "Call list_components for the full list.",
    };
  }
  // One export of a module that has several (the chat widget's eight), so
  // an agent can take the part it is building without the rest.
  let exportsOut = entry.exports;
  const typeMap = componentTypes[entry.slug];
  let types = typeMap?.types;
  if (exportName !== undefined && exportName.trim() !== "") {
    const match = entry.exports.find((e) => e.component.toLowerCase() === exportName.trim().toLowerCase());
    if (!match) {
      return {
        error: `${entry.name} has no export named ${JSON.stringify(exportName)}.`,
        exportNames: entry.exports.map((e) => e.component),
      };
    }
    exportsOut = [match];
    types = typesReachedBy(entry.slug, match.props.flatMap((prop) => prop.typeRefs ?? []));
  }
  // The chat widget is served through the same tool as a component and its
  // page sits under /components with the rest; it imports from its own
  // subpath, and how to add it lives on /docs/chat.
  const path = `/components/${entry.slug}`;
  return {
    ...entry,
    exports: exportsOut,
    // Every type the props name: defined here when this package owns it,
    // named with its package otherwise.
    ...(types && Object.keys(types).length > 0 ? { types } : {}),
    ...(typeMap && Object.keys(typeMap.externalTypes).length > 0 ? { externalTypes: typeMap.externalTypes } : {}),
    docsUrl: `${SITE_URL}${path}`,
    markdownUrl: `${SITE_URL}${path}.md`,
    schemaUrl: `${SITE_URL}/schema/components/${entry.slug}.json`,
    usage:
      entry.kind === "widget"
        ? `import { ${exportsOut.map((e) => e.component).join(", ")} } from '${entry.importPath}'; // see ${SITE_URL}/docs/chat for the server half and the scaffold`
        : entry.barrel === "charts"
          ? `import { ${entry.name} } from '${pkg.name}/charts'; // needs the optional recharts peer`
          : `import { ${entry.name} } from '${pkg.name}';`,
  };
}

/* ============================================
   lookupTokens: the semantic token registry
   ============================================ */

/** Spellings a caller may use for a category: the US one, mostly. */
const TOKEN_CATEGORY_ALIASES: Readonly<Record<string, string>> = {
  color: "colour",
  colors: "colour",
  colours: "colour",
  icon: "icons",
  control: "controls",
};

/**
 * Every theme as the id the data keys by and the name the site shows
 * (`mono` is shown as Smoke), in THEME_IDS order. The base theme has no
 * preset entry; its name is DEFAULT_THEME_LABEL.
 */
export const themeNames = (): { id: string; name: string }[] =>
  THEME_IDS.map((id) => ({ id, name: THEME_PRESETS[id]?.label ?? DEFAULT_THEME_LABEL }));

/** A theme as an id or a display name, in any case, resolved to its id. */
function resolveTheme(theme: string): string | null {
  const wanted = theme.trim().toLowerCase();
  return themeNames().find((t) => t.id === wanted || t.name.toLowerCase() === wanted)?.id ?? null;
}

export function lookupTokens(category?: string, theme?: string, mode?: string) {
  const folded = category?.trim().toLowerCase();
  const resolvedCategory = folded ? (TOKEN_CATEGORY_ALIASES[folded] ?? folded) : undefined;
  if (resolvedCategory && !(resolvedCategory in tokenRegistry)) {
    return {
      error: `No token category named ${JSON.stringify(category)}.`,
      categories: Object.keys(TOKEN_COUNTS),
    };
  }
  // A mode only means something for a theme's values; ignoring it would
  // answer a different question than the one asked.
  if (mode && !theme) {
    return {
      error: "mode requires theme: pass a theme id or name to resolve the tokens in light or dark mode.",
      themes: THEME_IDS,
      themeNames: themeNames(),
    };
  }
  const names = resolvedCategory
    ? { [resolvedCategory]: tokenRegistry[resolvedCategory as keyof typeof tokenRegistry] }
    : tokenRegistry;
  // The published twins of the registry: the DTCG file per theme and mode,
  // and the resolved values subpath (src/tokens/values.json, generated by
  // scripts/generate-token-values.mjs from the same CSS). With a theme, only
  // that theme's files.
  const dtcgFor = (id: string) => ({
    light: `${SITE_URL}/schema/tokens/${id}.light.tokens.json`,
    dark: `${SITE_URL}/schema/tokens/${id}.dark.tokens.json`,
  });
  const published = (ids: readonly string[]) => ({
    valuesModule: `${pkg.name}/tokens/values`,
    dtcgUrls: Object.fromEntries(ids.map((id) => [id, dtcgFor(id)])),
    guideUrl: `${SITE_URL}/docs/schemas`,
  });
  // With a theme, the names come back resolved to that theme's literal
  // values, so "what colour is the action fill in the mono theme, dark
  // mode" is answered from data rather than guessed.
  if (theme) {
    const themeId = resolveTheme(theme);
    if (!themeId) {
      return { error: `No theme named ${JSON.stringify(theme)}.`, themes: THEME_IDS, themeNames: themeNames() };
    }
    const resolvedMode: ThemeMode = mode === "dark" ? "dark" : "light";
    const wanted = Object.values(names).flat() as string[];
    const values = Object.fromEntries(
      wanted.map((name) => [name, tokenValue(name, themeId, resolvedMode)])
    );
    const name = themeNames().find((t) => t.id === themeId)!.name;
    return { theme: themeId, themeName: name, mode: resolvedMode, total: wanted.length, values, ...published([themeId]) };
  }
  // The summed total ships with the data: a model asked "how many tokens?"
  // will otherwise add eight numbers itself, and models miscount.
  return {
    total: TOKEN_COUNT,
    counts: TOKEN_COUNTS,
    tokens: names,
    themes: THEME_IDS,
    themeNames: themeNames(),
    ...published(THEME_IDS),
  };
}

/* ============================================
   searchSite: the documentation, sectioned and ranked

   Reads the search index (scripts/generate-site-search.mjs), which holds
   consumer documentation only, each section with its URL. Ranking, in
   order of weight:
     - a query about the latest release or what changed answers with the
       newest release entry first, whatever its words
     - a term in the heading or page title counts far more than in the body
     - every term present beats one term repeated, and body hits are capped
       so a long page cannot win on volume
     - on a tie, the docs, components, foundations and release pages come
       before the specs at /blueprints
   Each section is held to about 300 words, ending with its URL.
   A term matches its compound spellings (DataTable, data table, data-table)
   and a crude stem (theming finds theme).
   ============================================ */

const SEARCH_RESULTS = 3;
const SEARCH_SECTION_WORDS = 300;

/** Words that carry no topic, dropped from a query before ranking. */
const STOPWORDS = new Set([
  "a", "an", "and", "are", "can", "do", "does", "for", "from", "get", "how", "i", "in",
  "is", "it", "me", "my", "of", "on", "or", "the", "to", "use", "what", "when", "where",
  "which", "who", "why", "with", "you",
]);

/** A query asking what is newest, or what a release changed. */
const RELEASE_INTENT = /\b(latest|newest|recent|last|current)\b.*\b(release|version|changes?|changelog)\b|\bwhat('s| is)? new\b|\bwhat changed\b|\bchangelog\b|\brelease notes\b/i;

/** The forms a query term is matched in. */
function termForms(term: string): string[] {
  const lower = term.toLowerCase();
  const forms = new Set([lower]);
  // DataTable → data table, data-table.
  const words = term.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase().split(/[\s_-]+/).filter(Boolean);
  if (words.length > 1) {
    forms.add(words.join(" "));
    forms.add(words.join("-"));
    forms.add(words.join(""));
  }
  // theming → them(e), components → component, changed → chang(e).
  const stem = lower.replace(/(ings?|ed|es|s)$/, "");
  if (stem.length >= 4 && stem !== lower) forms.add(stem);
  return [...forms];
}

function countHits(haystack: string, form: string): number {
  let hits = 0;
  let index = haystack.indexOf(form);
  while (index !== -1) {
    hits += 1;
    index = haystack.indexOf(form, index + form.length);
  }
  return hits;
}

/**
 * The section's body held to about SEARCH_SECTION_WORDS words, cut at the
 * last sentence or line end inside them, with the URL that holds the rest.
 * A whole design.md section ran past 800 words, which an agent pays for in
 * context on every search.
 */
function excerpt(section: SiteSearchSection): string {
  const words = section.body.split(/(?<=\s)/);
  const wordCount = section.body.split(/\s+/).filter(Boolean).length;
  if (wordCount <= SEARCH_SECTION_WORDS) return section.body;
  let head = "";
  let count = 0;
  for (const piece of words) {
    if (piece.trim()) count += 1;
    if (count > SEARCH_SECTION_WORDS) break;
    head += piece;
  }
  const ends = [head.lastIndexOf("\n"), ...[". ", "! ", "? "].map((mark) => head.lastIndexOf(mark) + 1)];
  const cut = Math.max(...ends);
  const kept = cut > head.length / 2 ? head.slice(0, cut) : head;
  return `${kept.trimEnd()}\n[Section shortened. Full text at ${section.url}]`;
}

/**
 * Pages for people building with the package, preferred over the specs at
 * /blueprints when the score is the same.
 */
const isDocsPage = (url: string) => /\/(docs|components|foundations|releases)(\/|$)/.test(new URL(url).pathname);

export function searchSite(query: string): string[] {
  const terms = query
    .split(/[^\p{L}\p{N}.'-]+/u)
    .map((term) => term.replace(/^[.'-]+|[.'-]+$/g, ""))
    .filter((term) => term.length > 1 && !STOPWORDS.has(term.toLowerCase()));
  const releaseIntent = RELEASE_INTENT.test(query);
  const newest = siteSearchSections
    .filter((section) => section.date)
    .reduce<SiteSearchSection | null>((best, s) => (!best || s.date! > best.date! ? s : best), null);
  if (terms.length === 0 && !releaseIntent) return [];

  const scored = siteSearchSections
    .map((section) => {
      const heading = `${section.title} ${section.heading}`.toLowerCase();
      const body = section.body.toLowerCase();
      let score = 0;
      let matched = 0;
      for (const term of terms) {
        const forms = termForms(term);
        const inHeading = forms.some((form) => heading.includes(form));
        const bodyHits = Math.max(...forms.map((form) => countHits(body, form)));
        if (inHeading || bodyHits > 0) matched += 1;
        score += (inHeading ? 20 : 0) + Math.min(bodyHits, 6) + (bodyHits > 0 ? 4 : 0);
      }
      // Every term present beats one term repeated.
      if (terms.length > 1 && matched === terms.length) score += 10 * terms.length;
      if (releaseIntent && section === newest) score += 1000;
      return { section, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || Number(isDocsPage(b.section.url)) - Number(isDocsPage(a.section.url)));

  return scored.slice(0, SEARCH_RESULTS).map(({ section }) =>
    [
      `## ${section.heading === section.title ? section.title : `${section.title}: ${section.heading}`}`,
      `Source: ${section.url}${section.date ? ` (published ${section.date})` : ""}`,
      "",
      excerpt(section),
    ].join("\n")
  );
}

/** The earlier name of searchSite, kept for any caller still on it. */
export const searchCorpus = searchSite;
