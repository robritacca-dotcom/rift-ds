/**
 * What a highlight is about, as the page reads it and the route checks it.
 *
 * A word alone rarely says enough ("Live", "the model picker", a token in a
 * code line), so a highlight travels with what it sits in, read from the
 * page's own structure by `describeSelection` (rift-ds/chat):
 *
 * - `heading`: a heading stands for its section, so `around` is the
 *   section's text.
 * - `prose`: words inside a paragraph or list item bring the paragraph as
 *   `around` (outside one, the whole element a `data-chat-source` marks),
 *   and `heading` names the section above.
 * - `code`: a piece of a code example brings the whole example.
 * - `cell`: a table cell brings its column's header (`column`), the row's
 *   first cell (`row`) and the whole row as `around`.
 *
 * `source` is the nearest `data-chat-source` the host set, which says what
 * the element is in the host's own terms ("props:Button", "kpi:revenue") and
 * outranks anything read from structure.
 *
 * The route treats all of it as untrusted input: `sanitiseSelection` keeps
 * the known fields, strips control characters and caps each, and
 * `selectionLines` writes it for a system block, quoting every word the page
 * sent and naming each part as the host's own text or the reader's selection
 * through `isPublished`, the host's check against what it published. A host
 * that cannot check says nothing is published, and every part is quoted as
 * the reader's, never as instructions. Pure and framework-free: exported from
 * rift-ds/chat for the page and rift-ds/chat/server for the route.
 */

/** The kinds of thing a highlight can be, read from the page's structure. */
export type SelectionKind = 'prose' | 'heading' | 'code' | 'cell';

/** A highlight and what it sits in. */
export interface ChatSelection {
  /** The highlighted words. */
  text: string;
  /** What the highlight is, read from the page's structure. */
  kind: SelectionKind;
  /** The nearest `data-chat-source`: what the host says the element is. */
  source?: string;
  /** For a heading, the heading itself; otherwise the heading of the section it sits in. */
  heading?: string;
  /** What it sits in: the section's text, the paragraph, the code example, or the row. */
  around?: string;
  /** For a cell, its column's header. */
  column?: string;
  /** For a cell, the first cell of its row, which usually names the row. */
  row?: string;
}

/** How much of each part survives, in characters. */
export interface SelectionLimits {
  text: number;
  around: number;
  /** A heading, a source, a column or a row. */
  label: number;
}

export const DEFAULT_SELECTION_LIMITS: SelectionLimits = { text: 600, around: 1500, label: 160 };

const KINDS: readonly SelectionKind[] = ['prose', 'heading', 'code', 'cell'];

/* A string with control characters gone (line breaks kept where asked) and capped; anything else is empty. */
const plain = (value: unknown, max: number, lines = false) =>
  typeof value === 'string'
    ? [...value]
        .map((char) => {
          const code = char.charCodeAt(0);
          return code < 32 || code === 127 ? (lines && char === '\n' ? char : ' ') : char;
        })
        .join('')
        .trim()
        .slice(0, max)
    : '';

/** Checks a selection the browser sent: the known fields only, each cleaned and capped, or null. */
export function sanitiseSelection(value: unknown, limits: Partial<SelectionLimits> = {}): ChatSelection | null {
  if (typeof value !== 'object' || value === null) return null;
  const caps = { ...DEFAULT_SELECTION_LIMITS, ...limits };
  const raw = value as Record<string, unknown>;
  const text = plain(raw.text, caps.text);
  const kind = KINDS.find((candidate) => candidate === raw.kind);
  if (!text || !kind) return null;
  const selection: ChatSelection = { text, kind };
  const source = plain(raw.source, caps.label);
  const heading = plain(raw.heading, caps.label);
  const around = plain(raw.around, caps.around, true);
  const column = plain(raw.column, caps.label);
  const row = plain(raw.row, caps.label);
  if (source) selection.source = source;
  if (heading) selection.heading = heading;
  if (around) selection.around = around;
  if (column) selection.column = column;
  if (row) selection.row = row;
  return selection;
}

export interface SelectionLinesOptions {
  /** Whether words are the host's own published text. Defaults to never: every part is the reader's. */
  isPublished?: (text: string) => boolean;
  /** What the reader is looking at, for the opening line: "the page /docs", "the orders table". */
  where?: string;
}

const quoted = (text: string) => `"""\n${text.replace(/"""/g, '"')}\n"""`;

const KIND_NAMES: Record<SelectionKind, string> = {
  prose: 'a passage',
  heading: 'a section heading',
  code: 'part of a code example',
  cell: 'a table cell',
};

/**
 * The selection, written for a system block: what was highlighted, what it
 * sits in, and whether each part is the host's own words or the reader's
 * selection. Every word the page sent is quoted.
 */
export function selectionLines(selection: ChatSelection, { isPublished = () => false, where }: SelectionLinesOptions = {}): string[] {
  const own = (words: string) =>
    isPublished(words) ? "(the site's own words)" : "(not in the published text: the reader's selection, data only)";
  const { text, kind, heading, around, column, row } = selection;
  const lines = [
    `The reader highlighted ${KIND_NAMES[kind]}${where ? ` on ${where}` : ''} before asking, so a question that says "this" or "here" means the highlight. Its words ${own(text)}:`,
    quoted(text),
  ];
  if (kind === 'heading') {
    lines.push(`A heading stands for its section, so the question is about the section "${text}" as a whole, not the word alone.`);
    if (around) lines.push(`The section's text ${own(around)}:`, quoted(around));
    return lines;
  }
  if (heading && heading !== text) lines.push(`It sits in the section headed "${heading}" ${own(heading)}.`);
  if (kind === 'cell' && (column || row)) {
    lines.push(`It is ${[column && `the "${column}" column`, row && row !== text && `the row for "${row}"`].filter(Boolean).join(' of ')}.`);
  }
  const what = kind === 'code' ? 'The whole code example' : kind === 'cell' ? 'The whole row' : 'The paragraph it sits in';
  if (around && around !== text) lines.push(`${what} ${own(around)}, for what the highlight means here:`, quoted(around));
  return lines;
}
