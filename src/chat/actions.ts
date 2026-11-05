/**
 * Changes a chat can propose and a reader confirms, defined once.
 *
 * An action says which records it applies to (`skip` gives the reason it
 * leaves one alone, or null), what it writes to each (`apply`), and the words
 * around it: its button and card title (`label`), what a receipt says was
 * done (`done`), and the reader's words when they confirm it in the chat
 * (`confirm`). The same definition drives a selection bar's button and the
 * chat's proposal, so the two can never do different things to the same
 * records. `planAction` is the dry run both show before anything changes.
 *
 * Pure and framework-free: exported from rift-ds/chat for the page and from
 * rift-ds/chat/server for the route that proposes, which plans the same
 * action over the same records. The flow it serves (propose on a card, the
 * reader's Confirm sent as their message, the reply opening with a readout)
 * is design.md's "A chat proposes, the reader confirms".
 */

import { DEFAULT_LOCALE } from '../behaviors/locale';

export interface ChatAction<Values, Edit = Partial<Values>> {
  /** A stable id the server and the page share. */
  id: string;
  /** The button's words, and the proposal card's title: "Cancel orders". */
  label: string;
  /** What a receipt says was done, after the count: "cancelled". */
  done: string;
  /** The reader's words when they confirm it in the chat, given "this order" or "these 23 orders". */
  confirm: (these: string) => string;
  /** A Material Symbol for the card and the button. */
  icon: string;
  /** Drawn as destructive on the card and the bar. */
  destructive?: boolean;
  /** Why a record is left alone ("already shipped"), or null when the action applies to it. */
  skip: (values: Values) => string | null;
  /** What the action writes to a record it applies to. */
  apply: (values: Values) => Edit;
}

/** Declares an action, typed by the records it acts on. */
export const defineAction = <Values, Edit = Partial<Values>>(action: ChatAction<Values, Edit>) => action;

/** What an action would do to some records: the ones it changes, and how many it leaves alone for each reason. */
export interface ActionPlan {
  action: string;
  ids: string[];
  skipped: Record<string, number>;
}

/** The dry run: which of these records the action changes, and why it leaves the rest. Changes nothing. */
export function planAction<Values>(action: ChatAction<Values, unknown>, records: { id: string; values: Values }[]): ActionPlan {
  const ids: string[] = [];
  const skipped: Record<string, number> = {};
  for (const record of records) {
    const reason = action.skip(record.values);
    if (reason) skipped[reason] = (skipped[reason] ?? 0) + 1;
    else ids.push(record.id);
  }
  return { action: action.id, ids, skipped };
}

/** "2 already shipped, 1 cancelled": the records a plan leaves alone, in words, its counts in `locale`. */
export const skippedText = (skipped: Record<string, number>, locale: string = DEFAULT_LOCALE) =>
  Object.entries(skipped)
    .map(([reason, count]) => `${count.toLocaleString(locale)} ${reason}`)
    .join(', ');
