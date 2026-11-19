/**
 * The changes the chat may propose, defined once for the page and the route.
 *
 * A chat proposes and the reader confirms: the route's tool plans an action
 * over the records the request means and sends the plan as a card; the card
 * (ProposalCard.tsx) runs it on the reader's Confirm and sends their words as
 * their message; the route opens the reply with the record of what was done.
 * The page's own buttons should run these same actions, so the chat and the
 * page can never do different things to the same records.
 *
 * Replace the records and the actions with your own. This module imports
 * nothing but rift-ds/chat/actions, so the route and the browser can both
 * import it.
 */
import { defineAction } from 'rift-ds/chat/actions';

/** One record the actions act on. Yours will have more fields. */
export type Item = { title: string; state: 'open' | 'done' | 'archived' };

export const ACTIONS = {
  complete: defineAction<Item>({
    id: 'complete',
    label: 'Mark done',
    done: 'marked done',
    confirm: (these) => `Mark ${these} done`,
    effect: (count) => (count === 1 ? 'It moves to done.' : 'They move to done.'),
    icon: 'check_circle',
    skip: (item) => (item.state === 'open' ? null : 'not open'),
    apply: () => ({ state: 'done' }),
  }),
  archive: defineAction<Item>({
    id: 'archive',
    label: 'Archive',
    done: 'archived',
    confirm: (these) => `Archive ${these}`,
    effect: (count) => (count === 1 ? 'It leaves the list.' : 'They leave the list.'),
    icon: 'archive',
    destructive: true,
    skip: (item) => (item.state === 'done' ? null : 'not done'),
    apply: () => ({ state: 'archived' }),
  }),
};

export type ActionId = keyof typeof ACTIONS;

/** "this item" or "these 3 items", for the reader's confirming words. */
export const theseItems = (count: number) => (count === 1 ? 'this item' : `these ${count} items`);

/** The noun after a count, for the line that tells the model what was confirmed. */
export const itemNoun = (count: number) => (count === 1 ? 'item' : 'items');

/**
 * Sample records, so the example runs. Replace with a read of your own
 * data: the route plans against it, and the page applies to it.
 */
export const SAMPLE_ITEMS: Record<string, Item> = {
  'item-1': { title: 'Write the brief', state: 'open' },
  'item-2': { title: 'Book the venue', state: 'done' },
  'item-3': { title: 'Send the invites', state: 'open' },
};
