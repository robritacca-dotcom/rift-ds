"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { describeSelection, useHeldHighlight, useSelectionFocus, type SelectedText, type ChatSelection } from "rift-ds/chat";

/**
 * What the visitor has highlighted on the page they are reading, for the
 * site chat. The page's main column (`#main-content`, which every page
 * renders) is the root, so a selection in the chat's own panel never counts,
 * and moving to another page lets the highlight go.
 *
 * The package's `describeSelection` reads what the highlight sits in (a
 * heading's section, a paragraph, a code example, a table row), and the
 * site adds two things of its own. A live demo is never the page's text:
 * anything inside a library component is ignored, except the section titles
 * the pages are built from. And a props table names its component
 * (`data-chat-source="props:<Component>"` on PropsTable), so a cell reads as
 * that component's prop. /api/chat checks all of it against the published
 * site (website/src/lib/site-chat-context.ts).
 */

/* A library component's own text (a demo, a preview), apart from the section titles every page is built from. */
const DEMO = ':is([class^="ds-"], [class*=" ds-"]):not(.ds-section-title, .ds-section-title *)';

export interface SiteFocus extends ChatSelection {
  range: Range;
}

const FocusContext = createContext<{ focus: SiteFocus | null; clear: () => void }>({ focus: null, clear: () => {} });

/* Every page renders its own main column under this id; read at each selection, so a new page's is found. */
const ROOT = {
  get current() {
    return typeof document === "undefined" ? null : document.getElementById("main-content");
  },
};

/** Holds the visitor's highlight for the site chat; mounted once, around the live chat's provider, which reads it at each send. */
export function SiteFocusProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [held, setHeld] = useState<{ path: string | null; focus: SiteFocus } | null>(null);
  /* A highlight belongs to the page it was made on. */
  const focus = held && held.path === pathname ? held.focus : null;

  useSelectionFocus(ROOT, (selected: SelectedText | null) => {
    const root = ROOT.current;
    setHeld(selected && root ? { path: pathname, focus: { ...describeSelection(selected, root, { ignore: DEMO }), range: selected.range } } : null);
  });
  useHeldHighlight(focus?.range ?? null);

  const value = useMemo(() => ({ focus, clear: () => setHeld(null) }), [focus]);
  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>;
}

export const useSiteFocus = () => useContext(FocusContext);

/** The request's context: the page, and the highlight when there is one. */
export function siteContextString(path: string | null, focus: SiteFocus | null) {
  if (!focus) return JSON.stringify({ path });
  const { text, kind, source, heading, around, column, row } = focus;
  return JSON.stringify({ path, highlight: { text, kind, source, heading, around, column, row } });
}

/* The prop a props-table cell names, as Component.prop. */
const propOf = (focus: SiteFocus) =>
  focus.kind === "cell" && focus.source?.startsWith("props:") && focus.row ? `${focus.source.slice("props:".length)}.${focus.row.replace(/\*$/, "")}` : null;

/* The highlight's first words, for a note or a chip. */
const wordsOf = (focus: SiteFocus) => (focus.text.length > 48 ? `${focus.text.slice(0, 47).trimEnd()}…` : focus.text);

/** What the sent chip calls a highlight: the prop it names, the section, or its first words (the chip's icon says which kind). */
export function focusLabel(focus: SiteFocus): string {
  const prop = propOf(focus) ?? (focus.kind === "cell" && focus.source?.startsWith("props:") ? `${focus.source.slice("props:".length)}.${focus.text}` : null);
  if (prop) return prop;
  return focus.kind === "heading" ? `${focus.text} section` : wordsOf(focus);
}

/** The note's line, the highlighted words alone in quotes: a heading reads as its section, code as code, everything else as the default `Looking at “…”`. */
export function focusNote(focus: SiteFocus): string | undefined {
  if (focus.kind === "heading") return `Looking at the “${focus.text}” section`;
  if (focus.kind === "code") return `Looking at the code “${wordsOf(focus)}”`;
  return undefined;
}

export const focusIcon = (focus: SiteFocus) =>
  focus.kind === "code" ? "code" : focus.kind === "heading" ? "segment" : focus.source?.startsWith("props:") ? "tune" : focus.kind === "cell" ? "table_rows" : "format_quote";
