'use client';

/**
 * Synced choice: one pick shared by every control that names the same key,
 * remembered for the reader's next visit.
 *
 * A page of install snippets each offering npm, pnpm, yarn and bun should
 * switch together when the reader picks one, and open on that pick next
 * time. `useSyncedChoice(key, fallback)` returns the shared value and a
 * setter; every caller with the same key re-renders on a change, through
 * useSyncExternalStore over a module-level map. The pick is written to
 * localStorage under `rift-ds:choice:<key>` behind try/catch (a private
 * window, blocked storage or a server render simply skip it), and the server
 * snapshot is always the fallback, so hydration never mismatches.
 *
 * With no key the hook is inert: it returns the fallback and a no-op, so a
 * component can call it unconditionally and keep its own state.
 */
import { useCallback, useSyncExternalStore } from 'react';

const PREFIX = 'rift-ds:choice:';
const values = new Map<string, string>();
const listeners = new Map<string, Set<() => void>>();

function read(key: string): string | undefined {
  if (values.has(key)) return values.get(key);
  try {
    const stored = window.localStorage.getItem(PREFIX + key);
    if (stored !== null) values.set(key, stored);
    return stored ?? undefined;
  } catch {
    return undefined;
  }
}

function write(key: string, value: string) {
  values.set(key, value);
  try {
    window.localStorage.setItem(PREFIX + key, value);
  } catch {
    // Storage unavailable: the pick still syncs for this page view.
  }
  listeners.get(key)?.forEach((listener) => listener());
}

/** The shared pick for `key`, and a setter that moves every control sharing it. */
export function useSyncedChoice(
  key: string | undefined,
  fallback: string | undefined,
): [string | undefined, (value: string) => void] {
  const subscribe = useCallback(
    (listener: () => void) => {
      if (!key) return () => {};
      let set = listeners.get(key);
      if (!set) listeners.set(key, (set = new Set()));
      set.add(listener);
      return () => set.delete(listener);
    },
    [key],
  );
  const value = useSyncExternalStore(
    subscribe,
    () => (key ? (read(key) ?? fallback) : fallback),
    () => fallback,
  );
  const setValue = useCallback((next: string) => {
    if (key) write(key, next);
  }, [key]);
  return [value, setValue];
}
