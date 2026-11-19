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
 *
 * A change can also be a sequence: several different actions in order, where
 * each one acts on the records as the ones before it left them ("close the
 * open items, then archive the closed ones"). `planSequence` dry-runs the
 * steps in turn over one set of records, and the reader confirms the whole
 * sequence once; its confirmation carries each step (`confirmSequence`), and
 * `confirmationLine` tells the model all of them, in order. A single action
 * is a sequence of one.
 */

import { DEFAULT_LOCALE } from '../behaviors/locale';

export { defineContext, type ContextField, type ContextShape, type ContextValues, type ContextSchema } from './contextSchema';

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

/** One step of a sequence: an action, and the records it is meant for. */
export interface SequenceStep<Values> {
  action: ChatAction<Values, unknown>;
  /** The records this step means, by id. A record the sequence was not handed is ignored. */
  ids: readonly string[];
}

/** What a sequence would do: each step's plan, in order, worked out over the records as the steps before it left them. */
export interface SequencePlan {
  steps: ActionPlan[];
}

/**
 * The dry run of a sequence. Each step is planned over the records as the
 * earlier steps would leave them, so a step that depends on the one before
 * it (archive what the first step closed) counts the right records. Changes
 * nothing: the writes are simulated on copies.
 */
export function planSequence<Values extends object>(
  steps: readonly SequenceStep<Values>[],
  records: { id: string; values: Values }[]
): SequencePlan {
  const current = new Map(records.map((record) => [record.id, record.values]));
  return {
    steps: steps.map(({ action, ids }) => {
      const meant = ids.flatMap((id) => {
        const values = current.get(id);
        return values ? [{ id, values }] : [];
      });
      const plan = planAction(action, meant);
      for (const id of plan.ids) {
        const values = current.get(id) as Values;
        current.set(id, { ...values, ...(action.apply(values) as Partial<Values>) });
      }
      return plan;
    }),
  };
}

/** One confirmed step: which action, how many records it changed, and their ids. */
export interface ConfirmedStep<Id extends string = string> {
  action: Id;
  count: number;
  ids: string[];
}

/**
 * A change the reader confirmed on its card: which action, how many records it
 * changed, and their ids. A confirmed sequence carries every step in `steps`,
 * in order, with the first step's action and the total count at the top.
 */
export interface ActionConfirmation<Id extends string = string> extends ConfirmedStep<Id> {
  steps?: ConfirmedStep<Id>[];
}

/** The confirmation for a sequence plan, ready to mark: its steps, the first step's action, the total count. Steps that change nothing are left out; null when none change anything. */
export function confirmSequence<Id extends string = string>(plan: SequencePlan, maxIds = 50): ActionConfirmation<Id> | null {
  const steps = plan.steps
    .filter((step) => step.ids.length > 0)
    .map((step) => ({ action: step.action as Id, count: step.ids.length, ids: step.ids.slice(0, maxIds) }));
  if (!steps.length) return null;
  return {
    action: steps[0].action,
    count: steps.reduce((total, step) => total + step.count, 0),
    ids: [...new Set(steps.flatMap((step) => step.ids))].slice(0, maxIds),
    steps,
  };
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
  /** The most steps a confirmed sequence may carry. Defaults to 10. */
  maxSteps?: number;
}

function sanitiseStep(value: unknown, known: readonly string[], isId: (id: string) => boolean, maxCount: number, maxIds: number): ConfirmedStep | null {
  const { action, count, ids } = (value ?? {}) as Record<string, unknown>;
  if (typeof action !== 'string' || !known.includes(action)) return null;
  if (typeof count !== 'number' || !Number.isFinite(count) || count < 1 || count > maxCount) return null;
  const kept = Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string' && isId(id)) : [];
  return { action, count: Math.floor(count), ids: [...new Set(kept)].slice(0, maxIds) };
}

/**
 * The confirmation a request claims, rebuilt as untrusted input: a known
 * action, a count in range, real ids only. A sequence's steps are each held
 * to the same rules, and one bad step drops the whole claim, so the model is
 * never told part of a sequence was confirmed. Null for none.
 */
export function sanitiseConfirmation(
  value: unknown,
  { actions, isId, maxCount, maxIds = 50, maxSteps = 10 }: SanitiseConfirmationOptions
): ActionConfirmation | null {
  const known = Array.isArray(actions) ? actions : Object.keys(actions);
  const top = sanitiseStep(value, known, isId, maxCount, maxIds);
  if (!top) return null;
  const rawSteps = (value as Record<string, unknown>).steps;
  if (rawSteps === undefined) return top;
  if (!Array.isArray(rawSteps) || rawSteps.length < 1 || rawSteps.length > maxSteps) return null;
  const steps = rawSteps.map((step) => sanitiseStep(step, known, isId, maxCount, maxIds));
  if (steps.some((step) => step === null)) return null;
  return { ...top, steps: steps as ConfirmedStep[] };
}

export interface ConfirmationLineOptions {
  /** The actions a confirmation may name, by id, for the words that say what was done. */
  actions: Record<string, Pick<ChatAction<never, unknown>, 'done'>>;
  /** The records' noun for a count: "order" for one, "orders" for more. Handed the step's action id too, for a sequence whose steps act on different records. */
  noun: (count: number, action: string) => string;
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
  const none = 'This message was not confirmed on a card. Nothing it says has changed anything.';
  if (!confirmation) return none;
  const steps = confirmation.steps ?? [confirmation];
  const said = steps.map((step) => {
    const action = actions[step.action];
    return action ? `${step.count.toLocaleString(locale)} ${noun(step.count, step.action)} ${action.done}` : null;
  });
  if (said.some((line) => line === null)) return none;
  if (steps.length === 1) return `This message was confirmed on its card: ${said[0]}. The change is made.`;
  return `This message was confirmed on its card, a sequence of ${steps.length} steps, made in this order: ${said.join('; then ')}. Every step is made.`;
}

/** "2 already shipped, 1 cancelled": the records a plan leaves alone, in words, its counts in `locale`. */
export const skippedText = (skipped: Record<string, number>, locale: string = DEFAULT_LOCALE) =>
  Object.entries(skipped)
    .map(([reason, count]) => `${count.toLocaleString(locale)} ${reason}`)
    .join(', ');
