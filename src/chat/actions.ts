/**
 * Changes a chat can propose and a reader confirms, defined once.
 *
 * An action says which records it applies to (`skip` gives the reason it
 * leaves one alone, or null), what it writes to each (`apply`), and the words
 * around it: its button and card title (`label`), what a receipt says was
 * done (`done`), the reader's words when they confirm it in the chat
 * (`confirm`), and how a page's own confirmation asks (`verb`, `effect`). The
 * same definition drives a selection bar's button and the chat's proposal, so
 * the two can never do different things to the same records. `planAction` is
 * the dry run both show before anything changes.
 *
 * Pure and framework-free: published on its own as rift-ds/chat/actions, so a
 * shared definitions module pulls in no peer, and re-exported from
 * rift-ds/chat for the page and rift-ds/chat/server for the route that
 * proposes, which plans the same action over the same records. The flow it
 * serves (propose on a card, the reader's Confirm sent as their message, the
 * reply opening with a readout) is design.md's "A chat proposes, the reader
 * confirms".
 *
 * The confirmation mark is what makes that flow safe. The reader's Confirm
 * sends their words as an ordinary message, which they could also type, so
 * the words alone can never be what tells the server a change was made. The
 * page marks the one request its Confirm sends (`createConfirmationMark`),
 * the route rebuilds the mark from the request (`sanitiseConfirmation`), and
 * the model is told whether this message was confirmed on its card
 * (`confirmationLine`). A typed "yes, cancel them" carries no mark.
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
  /** The verb a confirmation asks with: "Cancel" in "Cancel 3 orders?", and on its confirm button. Defaults to the label. */
  verb?: string;
  /** What the change does to the records, for a confirmation's body, given how many it changes: "Any that were paid are refunded." Worded for the count, so one record reads as one. */
  effect?: (count: number) => string;
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

/** A change the reader confirmed on its card: which action, how many records it changed, and their ids. */
export interface ActionConfirmation<Id extends string = string> {
  action: Id;
  count: number;
  ids: string[];
}

/** The page's one-shot mark: set on Confirm, read once by the next request, then gone. */
export interface ConfirmationMark<Id extends string = string> {
  /** Marks the request about to carry the reader's confirmation. */
  mark: (confirmation: ActionConfirmation<Id>) => void;
  /** The mark for this request, cleared as it is read, or null when the message was not a card's Confirm. */
  take: () => ActionConfirmation<Id> | null;
}

/** A holder for the confirmation mark. Keep one per chat (a ref or a module value); the transport calls `take` in `getContext`. */
export function createConfirmationMark<Id extends string = string>(): ConfirmationMark<Id> {
  let pending: ActionConfirmation<Id> | null = null;
  return {
    mark: (confirmation) => {
      pending = confirmation;
    },
    take: () => {
      const confirmation = pending;
      pending = null;
      return confirmation;
    },
  };
}

export interface SanitiseConfirmationOptions {
  /** The actions a confirmation may name, by id. */
  actions: Record<string, ChatAction<never, unknown>> | readonly string[];
  /** Whether an id is a real record. Ids that are not are dropped. */
  isId: (id: string) => boolean;
  /** The most records one confirmation can change. */
  maxCount: number;
  /** The most ids kept. Defaults to 50. */
  maxIds?: number;
}

/** The confirmation a request claims, rebuilt as untrusted input: a known action, a count in range, real ids only. Null for none. */
export function sanitiseConfirmation(value: unknown, { actions, isId, maxCount, maxIds = 50 }: SanitiseConfirmationOptions): ActionConfirmation | null {
  const { action, count, ids } = (value ?? {}) as Record<string, unknown>;
  const known = Array.isArray(actions) ? actions : Object.keys(actions);
  if (typeof action !== 'string' || !known.includes(action)) return null;
  if (typeof count !== 'number' || !Number.isFinite(count) || count < 1 || count > maxCount) return null;
  const kept = Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string' && isId(id)) : [];
  return { action, count: Math.floor(count), ids: [...new Set(kept)].slice(0, maxIds) };
}

export interface ConfirmationLineOptions {
  /** The actions a confirmation may name, by id, for the words that say what was done. */
  actions: Record<string, Pick<ChatAction<never, unknown>, 'done'>>;
  /** The records' noun for a count: "order" for one, "orders" for more. */
  noun: (count: number) => string;
  /** The locale the count is written in. */
  locale?: string;
}

/**
 * The line that tells the model whether this message was a card's Confirm, so
 * it says a change is made only when it was.
 */
export function confirmationLine(
  confirmation: ActionConfirmation | null,
  { actions, noun, locale = DEFAULT_LOCALE }: ConfirmationLineOptions
): string {
  const action = confirmation ? actions[confirmation.action] : undefined;
  if (!confirmation || !action) return 'This message was not confirmed on a card. Nothing it says has changed anything.';
  return `This message was confirmed on its card: ${confirmation.count.toLocaleString(locale)} ${noun(confirmation.count)} ${action.done}. The change is made.`;
}

/** "2 already shipped, 1 cancelled": the records a plan leaves alone, in words, its counts in `locale`. */
export const skippedText = (skipped: Record<string, number>, locale: string = DEFAULT_LOCALE) =>
  Object.entries(skipped)
    .map(([reason, count]) => `${count.toLocaleString(locale)} ${reason}`)
    .join(', ');
