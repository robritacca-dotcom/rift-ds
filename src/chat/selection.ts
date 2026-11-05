'use client';

/**
 * What the reader highlights on a page, for a chat that follows it.
 *
 * `useSelectionFocus` hears the document's selection inside one root (the
 * page a chat sits beside, never the chat's own panel) and reports each
 * highlight as its text, its range and the smallest element that holds all
 * of it, which is where a host reads what the highlight came from: a
 * `data-chat-source` on a card or a figure, a table's `tr[data-row]` and
 * `[data-col]`. A selection outside the root leaves the last one standing, so
 * clicking into the composer keeps it; a click that collapses a highlight
 * inside the root reports null.
 *
 * `describeSelection` reads what a highlight is about from the page's own
 * structure (its section, paragraph, code example or table row; the shape
 * is `ChatSelection`, selectionContext.ts), for the request a host sends.
 *
 * `useHeldHighlight` repaints a range through the CSS Custom Highlight API
 * while it is the chat's context, because typing moves the browser's one
 * selection into the composer and the page's highlight goes with it. It is
 * drawn in `::highlight(ds-chat-focus)` on `--color-chat-context-bg`, the
 * context note's own fill, so the page and the note read as one thing. A
 * browser without the API shows no held highlight; nothing else changes.
 */

import { useEffect, useRef, type RefObject } from 'react';
import { DEFAULT_SELECTION_LIMITS, type ChatSelection, type SelectionLimits } from './selectionContext';
import './selection.css';

/** A highlight inside the root, as a chat reads it. */
export interface SelectedText {
  /** The words, whitespace collapsed and icon ligature names left out. */
  text: string;
  /** A copy of the range, for `useHeldHighlight` to repaint. */
  range: Range;
  /** The smallest element that holds all of the highlight: where its source is read. */
  holder: Element;
}

/** The attribute a host puts on an element to name what a highlight inside it is about. */
export const CHAT_SOURCE_ATTRIBUTE = 'data-chat-source';

/** The highlight name `useHeldHighlight` paints, styled in selection.css. */
export const HELD_HIGHLIGHT_NAME = 'ds-chat-focus';

/* An icon is a ligature: its name is text to the selection but never words on the page. */
const ICON_SELECTOR = '.material-symbols-rounded, [aria-hidden="true"]';

const elementOf = (node: Node | null) => (node instanceof Element ? node : node?.parentElement ?? null);

/** Reads the current selection as a highlight inside `root`, or null when it is empty or elsewhere. */
export function readSelection(root: Element): SelectedText | null | undefined {
  const selection = document.getSelection();
  const anchor = elementOf(selection?.anchorNode ?? null);
  if (!selection || !anchor || !root.contains(anchor)) return undefined;
  if (selection.isCollapsed || !selection.rangeCount) return null;
  const range = selection.getRangeAt(0);
  const hidden = [...root.querySelectorAll(ICON_SELECTOR)].filter((node) => range.intersectsNode(node));
  const words = hidden.reduce((rest, node) => rest.replace(node.textContent ?? '', ' '), selection.toString());
  const text = words.replace(/\s+/g, ' ').trim();
  const holder = elementOf(range.commonAncestorContainer);
  if (!text || !holder) return null;
  return { text, range: range.cloneRange(), holder };
}

/**
 * Calls `onSelect` with each highlight the reader makes inside `root`, and with
 * null when one inside it collapses. A selection outside the root is ignored.
 */
export function useSelectionFocus(root: RefObject<Element | null>, onSelect: (selected: SelectedText | null) => void) {
  const callback = useRef(onSelect);
  useEffect(() => {
    callback.current = onSelect;
  });
  useEffect(() => {
    const onSelectionChange = () => {
      if (!root.current) return;
      const selected = readSelection(root.current);
      if (selected !== undefined) callback.current(selected);
    };
    document.addEventListener('selectionchange', onSelectionChange);
    return () => document.removeEventListener('selectionchange', onSelectionChange);
  }, [root]);
}

/** Paints `range` as the held highlight while it is set, and clears it when it is not. */
export function useHeldHighlight(range: Range | null) {
  useEffect(() => {
    if (typeof CSS === 'undefined' || !('highlights' in CSS)) return;
    if (!range || !range.startContainer.isConnected) {
      CSS.highlights.delete(HELD_HIGHLIGHT_NAME);
      return;
    }
    CSS.highlights.set(HELD_HIGHLIGHT_NAME, new Highlight(range));
    return () => {
      CSS.highlights.delete(HELD_HIGHLIGHT_NAME);
    };
  }, [range]);
}

export interface DescribeSelectionOptions {
  /** Elements whose text is never the page's own, such as a live demo: matched against each ancestor. */
  ignore?: string;
  /** How much of each part is kept, in characters: the same limits `sanitiseSelection` holds the route to, so nothing the page sends is cut again or refused. */
  limits?: Partial<SelectionLimits>;
}

const HEADINGS = 'h1, h2, h3, h4, h5, h6';
const PROSE = 'p, li, dd, blockquote, figcaption';
const clean = (text: string | null | undefined) => (text ?? '').replace(/\s+/g, ' ').trim();
/* An element's words, its icons' ligature names left out, as readSelection leaves them out of the highlight. */
const wordsOf = (node: Element) => {
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
  let words = '';
  for (let text = walker.nextNode(); text; text = walker.nextNode()) {
    if (!text.parentElement?.closest(ICON_SELECTOR)) words += ` ${text.textContent ?? ''}`;
  }
  return clean(words);
};
const levelOf = (heading: Element) => Number(heading.tagName.slice(1));
const ignored = (node: Element, root: Element, ignore?: string) => Boolean(ignore && node.closest(ignore) && root.contains(node.closest(ignore)));

/* The heading a node sits under: the nearest one before it in the page, at any level. */
function headingAbove(node: Element, root: Element, ignore?: string): Element | null {
  let found: Element | null = null;
  for (const heading of root.querySelectorAll(HEADINGS)) {
    if (ignored(heading, root, ignore)) continue;
    if (heading.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING || heading.contains(node)) found = heading;
    else break;
  }
  return found;
}

/* A heading's section: its prose up to the next heading at its level or above, in page order. */
function sectionText(heading: Element, root: Element, ignore: string | undefined, max: number): string {
  const level = levelOf(heading);
  const parts: string[] = [];
  let started = false;
  for (const node of root.querySelectorAll(`${HEADINGS}, ${PROSE}`)) {
    if (node === heading) {
      started = true;
      continue;
    }
    if (!started || ignored(node, root, ignore) || node.parentElement?.closest(PROSE)) continue;
    if (node.matches(HEADINGS) && levelOf(node) <= level) break;
    parts.push(wordsOf(node));
    if (parts.join('\n').length >= max) break;
  }
  return parts.filter(Boolean).join('\n').slice(0, max);
}

/**
 * What a highlight is about, read from the page's structure: a heading
 * brings its section, words in a paragraph the paragraph and the heading
 * above, a piece of a code block the whole example, and a table cell its column's
 * header and its row (named by its first cell with words and no control).
 * The nearest `data-chat-source` rides along as `source`, and words outside
 * any paragraph bring that element's whole text. Text under `ignore` never counts as the page's. Each part is
 * capped to `limits` (`DEFAULT_SELECTION_LIMITS` by default), so a select-all of a long page still fits a request.
 */
export function describeSelection(selected: SelectedText, root: Element, { ignore, limits }: DescribeSelectionOptions = {}): ChatSelection {
  const caps = { ...DEFAULT_SELECTION_LIMITS, ...limits };
  const read = readStructure(selected, root, ignore, caps.around);
  /* Every part capped, so a select-all of a long page still fits a request. */
  const capped: ChatSelection = { text: read.text.slice(0, caps.text), kind: read.kind };
  for (const [key, max] of [['source', caps.label], ['heading', caps.label], ['around', caps.around], ['column', caps.label], ['row', caps.label]] as const) {
    const value = read[key]?.slice(0, max);
    if (value) capped[key] = value;
  }
  return capped;
}

/* What the highlight sits in, read from the page's structure, before any cap. */
function readStructure(selected: SelectedText, root: Element, ignore: string | undefined, maxAround: number): ChatSelection {
  const { text, holder } = selected;
  const marked = holder.closest(`[${CHAT_SOURCE_ATTRIBUTE}]`);
  const source = marked?.getAttribute(CHAT_SOURCE_ATTRIBUTE) ?? undefined;
  const base = { text, ...(source ? { source } : {}) };
  const heading = holder.closest(HEADINGS);
  if (heading) {
    return { ...base, kind: 'heading', heading: wordsOf(heading), around: sectionText(heading, root, ignore, maxAround) || undefined };
  }
  const above = headingAbove(holder, root, ignore);
  const section = above ? { heading: wordsOf(above) } : {};
  /* A code example is a block; inline code in a sentence reads with its paragraph. */
  const example = holder.closest('pre');
  if (example) return { ...base, ...section, kind: 'code', around: wordsOf(example).slice(0, maxAround) || undefined };
  const cell = holder.closest('td, th');
  const row = cell?.closest('tr');
  if (cell && row) {
    const table = row.closest('table');
    const index = [...row.children].indexOf(cell);
    const header = table?.querySelector('thead tr')?.children[index];
    /* The row's name: its first cell with words and no control, so a selection checkbox never names it. */
    const first = [...row.children].find((node) => wordsOf(node) && !node.querySelector('input, button, [role="checkbox"]'));
    const headers = [...(table?.querySelector('thead tr')?.children ?? [])].map((node) => wordsOf(node));
    const whole = [...row.children].map((node, at) => (headers[at] ? `${headers[at]}: ${wordsOf(node)}` : wordsOf(node))).join('; ');
    return {
      ...base,
      ...section,
      kind: 'cell',
      column: header && header !== cell ? wordsOf(header) || undefined : undefined,
      row: first && first !== cell ? wordsOf(first) || undefined : undefined,
      around: whole.slice(0, maxAround) || undefined,
    };
  }
  /* Words bring their paragraph; outside one, an element the host marked brings its whole text (a card's label, figure and change). */
  const paragraph = holder.closest(PROSE) ?? marked;
  const words = paragraph && !ignored(paragraph, root, ignore) ? wordsOf(paragraph) : '';
  return { ...base, ...section, kind: 'prose', around: words && words !== text ? words.slice(0, maxAround) : undefined };
}
