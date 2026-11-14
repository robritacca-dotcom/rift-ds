import { useRef } from 'react';
import { MOTION_SHORTCUT_SEQUENCE_MS } from '../tokens/motion';

/**
 * Type-to-find for a list of named items: a menu's items, a listbox's
 * options. Typing a character moves to the next item whose name starts with
 * it; typing several quickly narrows to the first name that starts with all
 * of them, and pressing one character again steps through the names that
 * share it (the WAI-ARIA menu and listbox patterns' typeahead).
 *
 * `useTypeahead` returns one function. A component's keydown handler calls
 * it first, for every key, with the event, the items' names in order and
 * the index it is on. On an index it moves there and is done; on `null` it
 * carries on to its own keys. The handler
 * owns the move and `preventDefault`; this owns only the matching, so it
 * serves a list that moves focus and one that points with
 * `aria-activedescendant` alike.
 *
 * It answers `null`, leaving the key alone, for anything that is not one
 * printable character, for a chord (Ctrl, Meta, Alt), and for a Space that
 * starts a search, since Space on its own activates the item. A `null`
 * name is an item that cannot be landed on (disabled, or unnamed).
 *
 * The run of characters ends at any other key (an arrow, Enter, Escape),
 * which is why the handler passes every key through, or when the next key comes later than the
 * shortcut-sequence window, the same pause that ends a "g then i" shortcut,
 * read from the events' own timestamps so no timer is kept.
 */
export type Typeahead = (
  event: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey' | 'altKey' | 'timeStamp'>,
  names: readonly (string | null | undefined)[],
  current: number,
) => number | null;

const MODIFIERS = new Set(['Shift', 'Control', 'Alt', 'Meta', 'CapsLock']);

export function useTypeahead(): Typeahead {
  const run = useRef({ text: '', at: 0 });

  return (event, names, current) => {
    const { key } = event;
    if (key.length !== 1) {
      // Any other key (an arrow, Enter, Escape) ends the run; a modifier going down does not.
      if (!MODIFIERS.has(key)) run.current = { text: '', at: 0 };
      return null;
    }
    if (event.ctrlKey || event.metaKey || event.altKey) return null;
    const fresh = event.timeStamp - run.current.at > MOTION_SHORTCUT_SEQUENCE_MS;
    if (key === ' ' && (fresh || run.current.text === '')) return null;

    const typed = key.toLowerCase();
    const text = fresh ? typed : run.current.text + typed;
    run.current = { text, at: event.timeStamp };

    // One character pressed again steps through the names that share it.
    const repeated = [...text].every((character) => character === typed);
    const needle = repeated ? typed : text;
    // A longer run keeps the item it is on while it still matches.
    const offset = repeated ? 1 : 0;
    for (let step = 0; step < names.length; step += 1) {
      const index = (Math.max(current, 0) + offset + step) % names.length;
      if (names[index]?.trim().toLowerCase().startsWith(needle)) return index;
    }
    return null;
  };
}
