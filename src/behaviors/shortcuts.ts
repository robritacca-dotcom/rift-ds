'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { MOTION_SHORTCUT_SEQUENCE_MS } from '../tokens/motion';
import { warnOnce } from './devWarning';
import { activeModalPanel } from './useFocusScope';
import { hasOpenLayer, openLayerContains } from './useLayer';
import {
  KEY_ALIASES,
  detectPlatform,
  parseShortcut,
  type Shortcut,
  type ShortcutPlatform,
  type Step,
} from './shortcut-keys';

export {
  detectPlatform,
  formatShortcut,
  parseShortcut,
  shortcutAria,
  shortcutKeys,
  type Shortcut,
  type ShortcutKeyLabels,
  type ShortcutPlatform,
} from './shortcut-keys';

/**
 * Keyboard shortcuts: the one document keydown listener every app-level key
 * binding goes through, the grammar a shortcut is written in, and the way it
 * is drawn on each platform.
 *
 * A shortcut is a string: steps separated by spaces, each step modifiers and
 * a key joined by `+`. `mod+k` is ⌘K on Apple platforms and Ctrl+K
 * elsewhere; `shift+?`, `alt+arrowup`, `escape`; `g i` is G then I. Keys are
 * a character or a name (enter, escape, space, tab, backspace, delete, the
 * arrows, home, end, pageup, pagedown, f1 to f12, plus).
 *
 * Who hears a key, in order:
 * - Nothing does while an IME is composing, or once a component has handled
 *   the key itself (`event.preventDefault()`), so a list's own arrow keys or
 *   an input's own Escape never also fire a shortcut. Escape is the layer
 *   stack's while any overlay is open (useLayer), so an `escape` shortcut
 *   is for closing something that is not a library overlay.
 * - Nothing does while focus is in a text field, unless the shortcut opts in
 *   with `allowInInput` (a palette's Cmd+K should work from a search box).
 * - A `global` shortcut always does.
 * - A `scope`d shortcut does while focus is inside its element, or while
 *   nothing has focus and the element sits on the surface in front (the open
 *   modal, else the page). Lightbox's arrows are scoped to its panel.
 * - Any other shortcut belongs to the page: it does only while no modal is
 *   open and focus is not inside an open overlay (a menu, a popover), the
 *   same topmost-only rule the layer stack applies to Escape.
 * When several match, the longest sequence wins, then the shortcut
 * registered last. A matched key's default is prevented.
 *
 * Exactly one document listener exists while any shortcut is registered, and
 * none otherwise. scripts/validate-overlay-listeners.mjs holds every other
 * document key listener in the library and the site to this module.
 */

export interface ShortcutOptions {
  /** What the shortcut does, in a few words, for a help list built from `useRegisteredShortcuts`. */
  description?: string;
  /** The heading a help list files the shortcut under, such as "Navigation". */
  group?: string;
  /** Whether the shortcut is live. Default true. */
  enabled?: boolean;
  /** Fires only while focus is inside this element (see the module's rules). */
  scope?: React.RefObject<HTMLElement | null>;
  /** Fires whatever is open or focused, outside text fields. Default false. */
  global?: boolean;
  /** Fires while focus is in a text field too. Default false. */
  allowInInput?: boolean;
}

type Registration = {
  steps: Step[][];
  shortcuts: Shortcut[];
  handlerRef: { current: (event: KeyboardEvent) => void };
  optionsRef: { current: ShortcutOptions };
};

const noSubscription = () => () => {};

/**
 * The platform shortcuts are drawn for. The server and the first client
 * render both say `other`, then the client settles on its own, so drawing a
 * shortcut never breaks hydration.
 */
export function usePlatform(): ShortcutPlatform {
  return useSyncExternalStore(noSubscription, detectPlatform, () => 'other');
}

/** The key an event names, in the grammar's spelling. */
const eventKey = (event: KeyboardEvent): string => {
  const key = event.key.toLowerCase();
  return KEY_ALIASES[key] ?? key;
};

/** The key's physical letter or digit, for a layout or an Alt that changes the character (Alt+K is ˚ on a Mac). */
const codeKey = (event: KeyboardEvent): string | null => {
  const match = /^(?:Key([A-Z])|Digit(\d))$/.exec(event.code ?? '');
  return match ? (match[1] ?? match[2]).toLowerCase() : null;
};

const matchesStep = (step: Step, event: KeyboardEvent, platform: ShortcutPlatform): boolean => {
  const ctrl = step.ctrl || (step.mod && platform === 'other');
  const meta = step.meta || (step.mod && platform === 'apple');
  if (event.ctrlKey !== ctrl || event.metaKey !== meta || event.altKey !== step.alt) return false;
  // A symbol that takes Shift to type (?, !, :) is written without it, so
  // Shift is only compared for letters, digits and named keys.
  const symbol = step.key.length === 1 && !/[a-z0-9]/.test(step.key);
  if (!symbol && event.shiftKey !== step.shift) return false;
  return eventKey(event) === step.key || codeKey(event) === step.key;
};

const isTextField = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return true;
  if (target instanceof HTMLInputElement) {
    return !['checkbox', 'radio', 'button', 'submit', 'reset', 'range', 'color', 'file', 'image'].includes(target.type);
  }
  return false;
};

const registrations: Registration[] = [];
let version = 0;
const listeners = new Set<() => void>();
const notify = () => {
  version += 1;
  for (const listener of listeners) listener();
};

/** The recent keys, for sequences: each with the time it was pressed. */
let recent: { event: KeyboardEvent; at: number }[] = [];

const eligible = (registration: Registration, target: EventTarget | null): boolean => {
  const options = registration.optionsRef.current;
  if (options.enabled === false) return false;
  if (isTextField(target) && !options.allowInInput) return false;
  if (options.global) return true;
  const modal = activeModalPanel();
  const node = target instanceof Node ? target : null;
  const unfocused = !node || node === document.body || node === document.documentElement;
  const scope = options.scope?.current;
  if (scope) {
    if (!unfocused) return scope.contains(node);
    return modal ? modal.contains(scope) : !openLayerContains(scope);
  }
  if (modal) return false;
  return unfocused || !openLayerContains(node);
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.isComposing || event.defaultPrevented) return;
  // Escape dismisses the topmost overlay while one is open (useLayer), and
  // the two listeners can run in either order, so the stack keeps it.
  if (event.key === 'Escape' && hasOpenLayer()) return;
  if (['Shift', 'Control', 'Alt', 'Meta'].includes(event.key)) return;
  const now = event.timeStamp || performance.now();
  const last = recent[recent.length - 1];
  if (last && now - last.at > MOTION_SHORTCUT_SEQUENCE_MS) recent = [];
  recent = [...recent.slice(-3), { event, at: now }];

  const platform = detectPlatform();
  let best: { registration: Registration; length: number; index: number } | null = null;
  registrations.forEach((registration, index) => {
    if (!eligible(registration, event.target)) return;
    for (const steps of registration.steps) {
      if (steps.length > recent.length) continue;
      const tail = recent.slice(recent.length - steps.length);
      if (!steps.every((step, i) => matchesStep(step, tail[i].event, platform))) continue;
      if (!best || steps.length > best.length || (steps.length === best.length && index > best.index)) {
        best = { registration, length: steps.length, index };
      }
    }
  });
  if (!best) return;
  const { registration } = best as { registration: Registration };
  event.preventDefault();
  recent = [];
  registration.handlerRef.current(event);
};

const register = (registration: Registration) => {
  for (const shortcut of registration.shortcuts) {
    const scope = registration.optionsRef.current.scope;
    const clash = registrations.find(
      (other) =>
        other.optionsRef.current.enabled !== false &&
        other.optionsRef.current.scope === scope &&
        other.shortcuts.includes(shortcut),
    );
    if (clash && registration.optionsRef.current.enabled !== false) {
      warnOnce(`The shortcut "${shortcut}" is registered twice in one scope; the one registered last wins.`);
    }
  }
  registrations.push(registration);
  if (registrations.length === 1) document.addEventListener('keydown', handleKeyDown);
  notify();
  return () => {
    const index = registrations.indexOf(registration);
    if (index !== -1) registrations.splice(index, 1);
    if (registrations.length === 0) {
      document.removeEventListener('keydown', handleKeyDown);
      recent = [];
    }
    notify();
  };
};

/**
 * Binds a shortcut (or several, as an array) to `handler` while the component
 * is mounted and `enabled` is not false. The handler and options are read at
 * key time, so passing new ones each render never re-registers the shortcut.
 */
export function useShortcut(
  shortcut: Shortcut | Shortcut[],
  handler: (event: KeyboardEvent) => void,
  options: ShortcutOptions = {},
): void {
  const handlerRef = useRef(handler);
  const optionsRef = useRef(options);
  useEffect(() => {
    handlerRef.current = handler;
    optionsRef.current = options;
  });
  const shortcuts = Array.isArray(shortcut) ? shortcut : [shortcut];
  const key = shortcuts.join('\u0000');
  const enabled = options.enabled !== false;
  useEffect(() => {
    if (!enabled) return;
    const list = key.split('\u0000');
    return register({ shortcuts: list, steps: list.map(parseShortcut), handlerRef, optionsRef });
  }, [key, enabled]);
}

/** A live shortcut as a help list reads it. */
export interface RegisteredShortcut {
  /** The shortcuts that run it, in the grammar. */
  shortcuts: Shortcut[];
  /** What it does, from the binding's `description`. */
  description: string;
  /** Its heading, from the binding's `group`. */
  group?: string;
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

let snapshot: { version: number; list: RegisteredShortcut[] } = { version: -1, list: [] };
const readRegistered = (): RegisteredShortcut[] => {
  if (snapshot.version !== version) {
    snapshot = {
      version,
      list: registrations
        .filter((r) => r.optionsRef.current.enabled !== false && r.optionsRef.current.description)
        .map((r) => ({
          shortcuts: r.shortcuts,
          description: r.optionsRef.current.description ?? '',
          group: r.optionsRef.current.group,
        })),
    };
  }
  return snapshot.list;
};
const EMPTY: RegisteredShortcut[] = [];

/**
 * Every live shortcut that has a description, in registration order, for a
 * "keyboard shortcuts" help dialog. Updates as shortcuts mount and unmount.
 */
export function useRegisteredShortcuts(): RegisteredShortcut[] {
  return useSyncExternalStore(subscribe, readRegistered, () => EMPTY);
}

