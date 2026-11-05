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
 * `useHeldHighlight` repaints a range through the CSS Custom Highlight API
 * while it is the chat's context, because typing moves the browser's one
 * selection into the composer and the page's highlight goes with it. It is
 * drawn in `::highlight(ds-chat-focus)` on `--color-chat-context-bg`, the
 * context note's own fill, so the page and the note read as one thing. A
 * browser without the API shows no held highlight; nothing else changes.
 */

import { useEffect, useRef, type RefObject } from 'react';
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
