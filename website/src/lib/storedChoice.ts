/**
 * A visitor's pick of one value from a fixed set, kept in localStorage so it
 * follows them between pages and survives a reload: the one way the site
 * remembers a layout choice (the templates' shell mode and width, the chat
 * home's backdrop, the site frame's dock and contained size). Same-tab
 * changes reach every reader through a window event named for the group of
 * choices; other tabs through the storage event. Read through
 * useSyncExternalStore with the default as the server snapshot, so the
 * server and the first paint agree.
 */

/** The stored value when it is one of the set, the fallback otherwise (none kept, an unknown one, or storage blocked). */
export function readStoredChoice<T extends string>(
  key: string,
  valid: (value: string | null) => value is T,
  fallback: T
): T {
  try {
    const stored = localStorage.getItem(key);
    return valid(stored) ? stored : fallback;
  } catch {
    return fallback;
  }
}

/** Stores a pick and tells this tab's readers of the group. */
export function writeStoredChoice(key: string, value: string, changeEvent: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode: the pick only lasts until the next change event */
  }
  window.dispatchEvent(new Event(changeEvent));
}

/** A subscribe function for useSyncExternalStore over one group of choices. */
export const subscribeStoredChoice = (changeEvent: string) => (callback: () => void) => {
  window.addEventListener(changeEvent, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(changeEvent, callback);
    window.removeEventListener("storage", callback);
  };
};

/** A type guard for a value of a fixed set, for readStoredChoice. */
export const oneOf =
  <T extends string>(values: readonly T[]) =>
  (value: string | null): value is T =>
    values.includes(value as T);
