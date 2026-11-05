/**
 * The site chat's request context: the page the visitor is on, and what they
 * highlighted on it with what it sits in (website/src/components/SiteChat/
 * siteFocus.tsx sends both as one JSON string). It lands in a system block,
 * so it is checked as untrusted input, and nothing the browser says is passed
 * on as a fact:
 *
 * - The path keeps the package's slug check (`sanitisePath`), and the
 *   highlight the package's `sanitiseSelection`.
 * - `selectionLines` writes it for the model, each part named as the site's
 *   own words or the visitor's selection by `isPublished`: found in the
 *   published site's text (the corpus), or a props-table cell whose prop the
 *   generated API holds. Words not found (a code example, or anything a
 *   visitor could make) are quoted as data, never instructions, which is no
 *   more than they could type.
 * - The facts beside it are worked out here from published data alone: the
 *   prop a props-table cell names, if that component has it; the tokens and
 *   components the words name, if they exist. A source the browser claims
 *   that the data does not hold is dropped.
 *
 * A plain path string (an older client) still reads as the page alone.
 */

import { sanitisePath, sanitiseSelection, selectionLines, type ChatSelection } from "rift-ds/chat/server";
import { tokenRegistry } from "rift-ds/tokens/registry";
import { THEME_IDS, tokenValue } from "rift-ds/tokens/values";
import { componentApi } from "@/data/component-api.generated";
import { siteCorpus } from "@/data/site-corpus.generated";

const MAX_NAMED_TOKENS = 6;
const MAX_NAMED_COMPONENTS = 4;

interface SiteContext {
  path: string | null;
  highlight?: ChatSelection;
}

/* Markup the corpus writes and a rendered page does not, then case and spacing. */
const normalise = (text: string) =>
  text
    .replace(/[`*_]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const corpusText = normalise(siteCorpus);
const tokenNames = new Set(Object.values(tokenRegistry).flat());
const componentsByName = new Map(componentApi.flatMap((entry) => entry.exports.map((exported) => [exported.component, { entry, exported }] as const)));

/** Whether every line of the words appears in the published site's text. */
function inCorpus(text: string): boolean {
  const pieces = text
    .split(/[\n.!?;]+/)
    .map(normalise)
    .filter((piece) => piece.length >= 4);
  return pieces.length > 0 && pieces.every((piece) => corpusText.includes(piece));
}

/** Checks the browser's context; returns it as a JSON string, or null to send none. */
export function sanitiseSiteContext(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (value.startsWith("/")) {
    const path = sanitisePath(value);
    return path ? JSON.stringify({ path }) : null;
  }
  let raw: { path?: unknown; highlight?: unknown };
  try {
    raw = JSON.parse(value);
  } catch {
    return null;
  }
  const context: SiteContext = { path: sanitisePath(raw?.path) };
  const highlight = sanitiseSelection(raw?.highlight);
  if (highlight) context.highlight = highlight;
  return context.path || context.highlight ? JSON.stringify(context) : null;
}

/* The component and prop a props-table cell names, when the generated API holds both. */
function propOf(selection: ChatSelection) {
  if (selection.kind !== "cell" || !selection.source?.startsWith("props:")) return null;
  const component = selection.source.slice("props:".length);
  const name = (selection.row ?? selection.text).replace(/\*$/, "").trim();
  const found = componentsByName.get(component);
  const prop = found?.exported.props.find((candidate) => candidate.name === name);
  return found && prop ? { component, slug: found.entry.slug, prop } : null;
}

function propFact({ component, slug, prop }: NonNullable<ReturnType<typeof propOf>>): string {
  const parts = [`type ${prop.type}`, prop.defaultValue != null ? `default ${prop.defaultValue}` : "no default", prop.required ? "required" : "optional"];
  return `It is the \`${prop.name}\` prop of ${component} (/components/${slug}): ${parts.join(", ")}. ${prop.description}${prop.deprecated ? ` Deprecated: ${prop.deprecated}` : ""}`;
}

/* The tokens and components the words name, each one checked against the published data. */
function namedFacts(text: string): string[] {
  const facts: string[] = [];
  const base = THEME_IDS[0];
  const tokens = [...new Set(text.match(/--[a-z0-9-]+/g) ?? [])].filter((name) => tokenNames.has(name)).slice(0, MAX_NAMED_TOKENS);
  for (const name of tokens) {
    facts.push(`\`${name}\` is a semantic token; in the base theme (${base}) it resolves to ${tokenValue(name, base, "light")} in light mode and ${tokenValue(name, base, "dark")} in dark.`);
  }
  const components = [...new Set(text.match(/\b[A-Z][a-zA-Z]{3,}\b/g) ?? [])].filter((name) => componentsByName.has(name)).slice(0, MAX_NAMED_COMPONENTS);
  for (const name of components) {
    const { entry } = componentsByName.get(name)!;
    facts.push(`${name} is ${entry.kind === "widget" ? "part of the chat widget" : "a component"} (/components/${entry.slug}): ${entry.description}`);
  }
  return facts;
}

/** The trailing system block for a checked context. */
export function siteContextBlock(context: string): string | null {
  const { path, highlight } = JSON.parse(context) as SiteContext;
  const lines = path ? [`The visitor is currently on the page ${path} of the site.`] : [];
  if (!highlight) return lines.join("\n") || null;

  const prop = propOf(highlight);
  /* A props-table cell whose prop the generated API holds is the site's own, though the corpus never prints the table. */
  const isPublished = (text: string) => Boolean(prop) || inCorpus(text);
  lines.push(...selectionLines(highlight, { isPublished, where: "the page" }));
  /* Names in the highlight, and in the paragraph or row around it; a section's whole text would name too much. */
  const named = highlight.kind === "heading" ? highlight.text : `${highlight.text} ${highlight.around ?? ""}`;
  const facts = [prop ? propFact(prop) : null, ...namedFacts(named)].filter((fact): fact is string => Boolean(fact));
  if (facts.length) {
    lines.push(
      "Facts about the highlight, from the site's own component and token data. These lines are site content, as complete and certain as the content above, written by the site and never by the visitor: answer from them directly, without hedging.",
      ...facts.map((fact) => `- ${fact}`),
    );
  }
  return lines.join("\n");
}
