import type React from 'react';

/* The mention pattern's data shapes and its pure helpers. No React runtime
   in this module: a host can run these on a server, in a reducer, or in a
   test. Mention.tsx re-exports all of it. */

/* ============================================
   DATA SHAPES
   ============================================ */

/** One thing a person can reference: a teammate, a file, a skill. */
export type MentionItem = {
  /** Stable identity, unique within its source. */
  id: string;
  /** The name shown in the menu and written into the text after the trigger character. */
  label: string;
  /** A quieter second phrase on the same row: a role, a path, what a skill does. */
  description?: string;
  /** Leading mark: a Material Symbol name, or any node (an Avatar). Decorative. */
  icon?: string | React.ReactNode;
  /** Extra words the filter matches on besides the label. */
  keywords?: string[];
  /** Listed but not choosable. */
  disabled?: boolean;
};

/** Everything one trigger character opens: `@` for entities, `/` for skills. */
export type MentionSource = {
  /** The single character that opens this source. */
  trigger: string;
  /** The items it offers. */
  items: MentionItem[];
  /** Accessible name for this source's menu ("People", "Skills"). */
  label?: string;
};

/** A trigger being typed: where it starts, and what has been typed after it. */
export type MentionQuery = {
  /** The trigger character that opened it. */
  trigger: string;
  /** The text typed after the trigger, up to the caret. */
  query: string;
  /** Index of the trigger character. */
  start: number;
  /** Index of the caret. */
  end: number;
};

/** One run of text from `splitMentions`: plain words, or a recognised mention. */
export type MentionSegment =
  | { type: 'text'; text: string }
  | { type: 'mention'; text: string; trigger: string; item: MentionItem };

/* ============================================
   PURE HELPERS
   No React in these: a host can run them on a server, in a reducer, or in
   a test.
   ============================================ */

/** A query longer than this is prose that happens to follow a trigger, not a lookup. */
const MAX_QUERY_LENGTH = 48;

const isSpace = (char: string | undefined) => char === undefined || /\s/.test(char);

/**
 * Reads the mention being typed at the caret, if there is one: a trigger
 * character that opens a word, followed by no whitespace up to the caret.
 * A trigger in the middle of a word (the slash in a path, the at-sign in an
 * address) opens nothing.
 */
export function getMentionQuery(
  text: string,
  caret: number,
  triggers: string[],
): MentionQuery | null {
  for (let index = caret - 1; index >= 0 && caret - index <= MAX_QUERY_LENGTH + 1; index -= 1) {
    const char = text[index];
    if (isSpace(char)) return null;
    if (triggers.includes(char) && isSpace(text[index - 1])) {
      return { trigger: char, query: text.slice(index + 1, caret), start: index, end: caret };
    }
  }
  return null;
}

/**
 * Narrows and ranks a source's items for a query: labels that start with it
 * first, then labels where a later word starts with it, then labels that
 * contain it, then keyword matches. An empty query returns every item in its
 * given order.
 */
export function filterMentionItems(items: MentionItem[], query: string): MentionItem[] {
  const needle = query.trim().toLowerCase();
  if (needle === '') return items;
  const rank = (item: MentionItem) => {
    const label = item.label.toLowerCase();
    if (label.startsWith(needle)) return 0;
    if (label.split(/[\s\-_:./]+/).some((word) => word.startsWith(needle))) return 1;
    if (label.includes(needle)) return 2;
    if (item.keywords?.some((keyword) => keyword.toLowerCase().includes(needle))) return 3;
    return -1;
  };
  return items
    .map((item, index) => ({ item, index, rank: rank(item) }))
    .filter((entry) => entry.rank >= 0)
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map((entry) => entry.item);
}

/** Characters a mention may directly follow, besides whitespace and the start of the text. */
const OPENERS = new Set(['(', '[', '{', '"', '“', '‘', "'"]);

/** A mention ends where its label ends: the next character cannot continue a name. */
const continuesName = (char: string | undefined) =>
  char !== undefined && /[\p{L}\p{N}_-]/u.test(char);

/**
 * Splits text into plain runs and the mentions it contains. A mention is a
 * trigger character followed by the exact label of one of that source's
 * items, standing as its own word. Nothing is stored alongside the text: a
 * mention is recognised wherever its name is written, and stops being one
 * the moment the name is edited.
 */
export function splitMentions(text: string, sources: MentionSource[]): MentionSegment[] {
  const candidates = sources
    .flatMap((source) =>
      source.items.map((item) => ({
        trigger: source.trigger,
        item,
        token: `${source.trigger}${item.label}`,
      })),
    )
    // Longest first, so a name that begins with a shorter name wins its own match
    .sort((a, b) => b.token.length - a.token.length);
  const triggers = new Set(sources.map((source) => source.trigger));

  const segments: MentionSegment[] = [];
  let plainFrom = 0;
  let index = 0;
  while (index < text.length) {
    const before = text[index - 1];
    if (triggers.has(text[index]) && (isSpace(before) || OPENERS.has(before as string))) {
      const match = candidates.find(
        (candidate) =>
          text.startsWith(candidate.token, index) &&
          !continuesName(text[index + candidate.token.length]),
      );
      if (match) {
        if (index > plainFrom) segments.push({ type: 'text', text: text.slice(plainFrom, index) });
        segments.push({
          type: 'mention',
          text: match.token,
          trigger: match.trigger,
          item: match.item,
        });
        index += match.token.length;
        plainFrom = index;
        continue;
      }
    }
    index += 1;
  }
  if (plainFrom < text.length) segments.push({ type: 'text', text: text.slice(plainFrom) });
  return segments;
}

/**
 * Writes a chosen item over the query being typed: the trigger, the label,
 * and one trailing space, so the next word starts clean. Returns the new
 * text and where the caret belongs in it.
 */
export function insertMention(
  text: string,
  query: Pick<MentionQuery, 'trigger' | 'start' | 'end'>,
  item: MentionItem,
): { value: string; caret: number } {
  const before = text.slice(0, query.start);
  const after = text.slice(query.end);
  const token = `${query.trigger}${item.label}`;
  // A space is already waiting when the mention is written mid-sentence
  const spacer = after.startsWith(' ') ? '' : ' ';
  return {
    value: `${before}${token}${spacer}${after}`,
    caret: before.length + token.length + 1,
  };
}

/** The DOM id of one option inside a MentionMenu, for `aria-activedescendant`. */
export const mentionOptionId = (menuId: string, itemId: string) => `${menuId}-option-${itemId}`;

/** The DOM id of the listbox inside a MentionMenu, for `aria-controls`. */
export const mentionListboxId = (menuId: string) => `${menuId}-listbox`;
