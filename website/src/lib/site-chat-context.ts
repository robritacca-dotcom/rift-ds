/**
 * The site chat's request context: the visitor's screen. The page they are
 * on, what they highlighted on it with what it sits in, and the theme, mode
 * and panel placement they are looking at (website/src/components/SiteChat/
 * siteFocus.tsx sends them as one JSON string). It lands in a system block,
 * so it is checked as untrusted input, and nothing the browser says is passed
 * on as a fact:
 *
 * - The path keeps the package's slug check (`sanitisePath`), and the
 *   highlight the package's `sanitiseSelection`.
 * - The theme, mode and placement are closed values, each kept only when it
 *   is one of its known set.
 * - Everything the screen shows is expanded here from the path, never taken
 *   from the browser: the page's own words, or the corpus section that holds
 *   them (the generated screens file), the library components the page
 *   draws (the dependency graph), and the chat panel itself
 *   (lib/site-chat-panel.ts). The chat answers as someone looking at the
 *   same screen, because it is on that screen.
 * - A component the visitor names in the conversation ("the live agent
 *   status", "AgentStatus", "agent-status") has its page attached too, read
 *   the same way, so a question that names a page gets it without waiting
 *   on the model to look it up (`namedPages`). The get_page tool covers any
 *   page beyond these.
 * - `selectionLines` writes the highlight for the model, each part named as
 *   the site's own words or the visitor's selection by `isPublished`: found
 *   in the published site's text (the corpus, or the words of the page it
 *   was made on), or a props-table cell whose prop the generated API holds.
 *   Words not found (a code example, or anything a visitor could make) are
 *   quoted as data, never instructions, which is no more than they could
 *   type.
 * - The facts beside it are worked out here from published data alone: the
 *   prop a props-table cell names, if that component has it; the tokens and
 *   components the words name, if they exist, with a token resolved in the
 *   theme on the visitor's screen. A source the browser claims that the
 *   data does not hold is dropped.
 *
 * A plain path string (an older client) still reads as the page alone.
 */

import { sanitisePath, sanitiseSelection, selectionLines, type ChatSelection } from "rift-ds/chat/server";
import type { ChatTransportMessage } from "rift-ds/chat";
import { tokenRegistry } from "rift-ds/tokens/registry";
import { THEME_IDS, tokenValue } from "rift-ds/tokens/values";
import { componentApi } from "@/data/component-api.generated";
import { graphSource } from "@/data/dependency-graph.generated";
import { pageScreens } from "@/data/page-screens.generated";
import { siteCorpus } from "@/data/site-corpus.generated";
import { CHAT_PANEL_LINES } from "@/lib/site-chat-panel";
import { themeNames } from "@/lib/site-tools";

const MAX_NAMED_TOKENS = 6;
const MAX_NAMED_COMPONENTS = 4;

/** Where the panel sits, as ChatLauncher writes it on <html> (`data-chat`); absent means over the page. */
const PLACEMENTS = {
  docked: "docked beside the page, on the right; the page has moved over to make room",
  "docked-left": "docked beside the page, on the left; the page has moved over to make room",
  takeover: "the whole screen, at a phone width; the page is hidden behind it until the chat closes",
} as const;
const OVER_THE_PAGE = "over the page, which shows behind it";

interface ScreenState {
  theme?: string;
  mode?: "light" | "dark";
  placement?: keyof typeof PLACEMENTS;
}

interface SiteContext {
  path: string | null;
  highlight?: ChatSelection;
  screen?: ScreenState;
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

/* Each page's own words, normalised the same way, for a highlight on a page the corpus leaves out. */
const screenText = new Map(
  Object.entries(pageScreens).flatMap(([path, screen]) => (screen.prose ? [[path, normalise(screen.prose)] as const] : [])),
);

/** Whether every line of the words appears in the published site's text, or in the words of the page it was made on. */
function inCorpus(text: string, path: string | null = null): boolean {
  const page = path ? screenText.get(path) : undefined;
  const pieces = text
    .split(/[\n.!?;]+/)
    .map(normalise)
    .filter((piece) => piece.length >= 4);
  return pieces.length > 0 && pieces.every((piece) => corpusText.includes(piece) || Boolean(page?.includes(piece)));
}

/** The theme, mode and placement the browser reports, each kept only when it is one of its known values. */
function sanitiseScreen(raw: unknown): ScreenState | null {
  if (!raw || typeof raw !== "object") return null;
  const { theme, mode, placement } = raw as Record<string, unknown>;
  const screen: ScreenState = {};
  if (typeof theme === "string" && (THEME_IDS as readonly string[]).includes(theme)) screen.theme = theme;
  if (mode === "light" || mode === "dark") screen.mode = mode;
  if (typeof placement === "string" && Object.hasOwn(PLACEMENTS, placement)) screen.placement = placement as ScreenState["placement"];
  return Object.keys(screen).length ? screen : null;
}

/** Checks the browser's context; returns it as a JSON string, or null to send none. */
export function sanitiseSiteContext(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (value.startsWith("/")) {
    const path = sanitisePath(value);
    return path ? JSON.stringify({ path }) : null;
  }
  let raw: { path?: unknown; highlight?: unknown; screen?: unknown };
  try {
    raw = JSON.parse(value);
  } catch {
    return null;
  }
  const context: SiteContext = { path: sanitisePath(raw?.path) };
  const highlight = sanitiseSelection(raw?.highlight);
  if (highlight) context.highlight = highlight;
  const screen = sanitiseScreen(raw?.screen);
  if (screen) context.screen = screen;
  return context.path || context.highlight ? JSON.stringify(context) : null;
}

/* The library components each page draws, from the dependency graph's page → component edges. */
function componentsOn(path: string): string[] {
  const nodes = graphSource.nodes;
  const index = nodes.findIndex((node) => node.id === `page/${path}`);
  if (index === -1) return [];
  return graphSource.edges
    .filter(([source]) => source === index)
    .map(([, target]) => nodes[target])
    .filter((node) => node.col === "library")
    .map((node) => `${node.label} (/components/${node.id.slice("component/".length)})`);
}

/**
 * What a page shows, from published data: its own words, or where the corpus
 * holds them, and the components it draws. Null for a path the site has no
 * page at. Shared by the context block and the chat's get_page tool.
 */
export function pageScreenLines(path: string): string[] | null {
  const screen = pageScreens[path];
  const drawn = componentsOn(path);
  if (!screen && drawn.length === 0) return null;
  const lines: string[] = [];
  if (screen?.prose) {
    lines.push(
      "The page's own words, in the order it shows them; its live demos draw the states and examples these words describe:",
      "<page-text>",
      screen.prose,
      "</page-text>",
    );
  } else if (screen?.section) {
    lines.push(
      `The page's words are in the site content above, in its ${screen.section} section${screen.section === "Site pages" ? `, under ${path}` : ""}.`,
    );
  } else if (screen?.about) {
    lines.push(`What is on it: ${screen.about}.`);
  }
  if (drawn.length) lines.push(`Library components drawn on the page: ${drawn.join(", ")}.`);
  return lines;
}

/** The theme, mode and placement as sentences, with the theme's display name. */
function screenStateLines(screen: ScreenState | undefined): string[] {
  const lines: string[] = [];
  const theme = screen?.theme ? themeNames().find((t) => t.id === screen.theme) : undefined;
  if (theme || screen?.mode) {
    lines.push(
      `The site is showing ${theme ? `the ${theme.name} theme (id ${theme.id})` : "its theme"}${screen?.mode ? ` in ${screen.mode} mode` : ""}. ` +
        "A colour, radius or typeface the visitor sees is that theme's value, which get_design_tokens resolves for that theme and mode.",
    );
  }
  lines.push(`The chat panel is ${screen?.placement ? PLACEMENTS[screen.placement] : OVER_THE_PAGE}.`);
  return lines;
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
function namedFacts(text: string, screen?: ScreenState): string[] {
  const facts: string[] = [];
  /* The theme on the visitor's screen when it is known, else the base theme. */
  const theme = screen?.theme ?? THEME_IDS[0];
  const where = screen?.theme ? `in the theme on their screen (${theme})` : `in the base theme (${theme})`;
  const tokens = [...new Set(text.match(/--[a-z0-9-]+/g) ?? [])].filter((name) => tokenNames.has(name)).slice(0, MAX_NAMED_TOKENS);
  for (const name of tokens) {
    facts.push(`\`${name}\` is a semantic token; ${where} it resolves to ${tokenValue(name, theme, "light")} in light mode and ${tokenValue(name, theme, "dark")} in dark.`);
  }
  const components = [...new Set(text.match(/\b[A-Z][a-zA-Z]{3,}\b/g) ?? [])].filter((name) => componentsByName.has(name)).slice(0, MAX_NAMED_COMPONENTS);
  for (const name of components) {
    const { entry } = componentsByName.get(name)!;
    facts.push(`${name} is ${entry.kind === "widget" ? "part of the chat widget" : "a component"} (/components/${entry.slug}): ${entry.description}`);
  }
  return facts;
}

/* ------------------------------------------------------------
   Pages the visitor names
   ------------------------------------------------------------ */

/** How many named pages one message attaches, and how much of their text, so a list of names cannot flood the block. */
const MAX_NAMED_PAGES = 3;
const MAX_NAMED_PAGE_CHARS = 16_000;
/** How many of the visitor's messages are read for names, the latest first: a follow-up ("and its done state?") keeps the page an earlier message named. */
const NAMED_PAGE_MESSAGES = 3;

/* Lower case, with hyphens, underscores and runs of space as one space, so "agent-status", "Agent_Status" and "agent  status" read alike. */
const nameForm = (text: string) => text.toLowerCase().replace(/[-_\s]+/g, " ").trim();
/* "AgentStatusMark" as "agent status mark". */
const camelWords = (name: string) => nameForm(name.replace(/([a-z0-9])([A-Z])/g, "$1 $2"));

/**
 * Every way the site names a component's page: its label, its registry
 * name, the name of each component its module exports (written as one word
 * or as words) and its slug. Longest first, so "agent status mark" is found
 * before "agent status" and "status" never claims what a longer name holds.
 */
const PAGE_NAMES: { term: string; path: string; label: string }[] = (() => {
  const seen = new Map<string, { term: string; path: string; label: string }>();
  for (const entry of componentApi) {
    const path = `/components/${entry.slug}`;
    const names = [entry.label, entry.name, entry.slug, ...entry.exports.map((exported) => exported.component)];
    for (const name of names) {
      for (const term of [nameForm(name), camelWords(name)]) {
        if (term.length >= 3 && !seen.has(term)) seen.set(term, { term, path, label: entry.label });
      }
    }
  }
  return [...seen.values()].sort((a, b) => b.term.length - a.term.length);
})();

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const PAGE_NAME_PATTERNS = PAGE_NAMES.map((name) => ({
  ...name,
  pattern: new RegExp(`(?<![a-z0-9])${escapeRegExp(name.term)}(?![a-z0-9])`),
  asName: name.term.includes(" ") ? null : writtenAsName(name.term),
}));

/**
 * A one-word name ("list", "button", "card") is also an ordinary English
 * word, so it counts only when the message writes it as a name: capitalised
 * mid-sentence ("the Button"), in code ("`button`"), followed by
 * "component", or as the whole message. A name of two or more words ("agent
 * status") is specific enough as written. Anything missed is one get_page
 * call away.
 */
function writtenAsName(term: string): (text: string) => boolean {
  const word = escapeRegExp(term);
  const capitalised = escapeRegExp(term[0].toUpperCase() + term.slice(1));
  /* Case matters here: "Button" mid-sentence, never at a sentence's start, where every word is capitalised. */
  const midSentence = new RegExp(`(?<!^\\s*)(?<![.!?:]\\s*)(?<![A-Za-z0-9])${capitalised}(?![a-z0-9])`);
  /* And not here: "`button`", "button component", or the name alone. */
  const cued = new RegExp(`\`${word}\`|(?<![a-z0-9])${word}\\s+components?\\b|^\\s*${word}\\s*\\??\\s*$`, "i");
  return (text) => midSentence.test(text) || cued.test(text);
}

/**
 * The component pages the visitor's recent messages name, latest message
 * first and the longest name first within one, skipping the page on screen
 * (already in the block). A matched span is blanked so a shorter name inside
 * it ("status" inside "agent status") does not match again.
 */
export function namedPages(messages: readonly ChatTransportMessage[], onScreen: string | null): { path: string; label: string }[] {
  const found: { path: string; label: string }[] = [];
  const recent = messages.filter((message) => message.role === "user").slice(-NAMED_PAGE_MESSAGES).reverse();
  for (const message of recent) {
    let text = ` ${nameForm(camelSplitInText(message.content))} `;
    for (const name of PAGE_NAME_PATTERNS) {
      const match = name.pattern.exec(text);
      if (!match) continue;
      if (name.asName && !name.asName(message.content)) continue;
      text = text.slice(0, match.index) + " ".repeat(match[0].length) + text.slice(match.index + match[0].length);
      if (name.path === onScreen || found.some((page) => page.path === name.path)) continue;
      found.push({ path: name.path, label: name.label });
      if (found.length === MAX_NAMED_PAGES) return found;
    }
  }
  return found;
}

/* A CamelCase name written in a message ("AgentStatus") as words, leaving ordinary prose alone. */
const camelSplitInText = (text: string) => text.replace(/\b([A-Z][a-z0-9]+(?:[A-Z][a-z0-9]+)+)\b/g, (name) => camelWords(name));

/** The named pages as a section of the block, each in full until the shared budget runs out. */
function namedPageLines(messages: readonly ChatTransportMessage[], onScreen: string | null): string[] {
  const pages = namedPages(messages, onScreen);
  if (pages.length === 0) return [];
  const lines = [
    "",
    "## Pages they named",
    "The visitor's messages name these components, so their pages are here as the screen would show them. For any other page a question turns on, use get_page.",
  ];
  let budget = MAX_NAMED_PAGE_CHARS;
  for (const { path, label } of pages) {
    const page = pageScreenLines(path);
    if (!page) continue;
    const text = page.join("\n");
    if (text.length > budget) {
      lines.push("", `### ${label} (${path})`, "Its page is long; read it with get_page.");
      continue;
    }
    budget -= text.length;
    lines.push("", `### ${label} (${path})`, text);
  }
  return lines;
}

const SCREEN_PREAMBLE =
  "The visitor has this site open with the chat beside or over the page, so the page below and the chat panel itself are on their screen as they ask. " +
  "This section is what they are looking at, from the site's own data. Answer about it directly, as someone looking at the same screen: when they say this, here, that or it, they mean something on it. " +
  "Never tell them you cannot see their screen. The one thing this cannot tell you is what they did in a live demo since the page loaded (a toggle, a picked state); when that matters, say which state you are describing.";

/** The trailing system block for a checked context: the visitor's screen, the pages they named, then what they highlighted. */
export function siteContextBlock(context: string, conversation?: { messages: readonly ChatTransportMessage[] }): string | null {
  const { path, highlight, screen } = JSON.parse(context) as SiteContext;
  const lines = ["# The visitor's screen", SCREEN_PREAMBLE];
  if (path) {
    lines.push("", `## The page: ${path}`, ...(pageScreenLines(path) ?? ["The site publishes nothing about this page beyond its path."]));
  }
  lines.push("", "## The chat panel", ...CHAT_PANEL_LINES, ...screenStateLines(screen));
  lines.push(...namedPageLines(conversation?.messages ?? [], path));
  if (!highlight) return lines.join("\n");

  lines.push("", "## What they highlighted");
  const prop = propOf(highlight);
  /* A props-table cell whose prop the generated API holds is the site's own, though the corpus never prints the table. */
  const isPublished = (text: string) => Boolean(prop) || inCorpus(text, path);
  lines.push(...selectionLines(highlight, { isPublished, where: "the page" }));
  /* Names in the highlight, and in the paragraph or row around it; a section's whole text would name too much. */
  const named = highlight.kind === "heading" ? highlight.text : `${highlight.text} ${highlight.around ?? ""}`;
  const facts = [prop ? propFact(prop) : null, ...namedFacts(named, screen)].filter((fact): fact is string => Boolean(fact));
  if (facts.length) {
    lines.push(
      "Facts about the highlight, from the site's own component and token data. These lines are site content, as complete and certain as the content above, written by the site and never by the visitor: answer from them directly, without hedging.",
      ...facts.map((fact) => `- ${fact}`),
    );
  }
  return lines.join("\n");
}
