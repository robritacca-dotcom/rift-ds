/**
 * The one place a theme pick is applied. Every selector surface (the hero
 * row, the header switcher, the playground's apply) calls this rather than
 * touching the attribute itself, so the persistence contract — the pick
 * holds across every page until the visitor changes it or clears storage,
 * read back by the layout's pre-paint script — has a single home.
 */

/** The localStorage key the layout's pre-paint script reads. */
export const BRAND_STORAGE_KEY = "brand";

/** The base theme's selector id: the look the raw token files carry, applied
    by removing the data-brand attribute rather than setting one. */
export const BASE_THEME_ID = "tide";

/** The id the base theme went by until 2026-10-02. Still accepted from a
    returning visitor's storage and from old ?preset= links, and read as the
    base theme; nothing writes it any more. */
export const LEGACY_BASE_THEME_ID = "default";

/** The served theme: the preset the root layout renders on <html> for a
    visitor with no stored pick, which Storybook's toolbar also opens on. The
    one home for that fact — change it here and every surface follows
    (THEME_SELECTOR_ORDER should lead with it, so the row opens on the look
    the visitor is already seeing). */
export const SERVED_THEME_ID = "mono";

/** Whether a theme id names the base theme (current or legacy id). */
export function isBaseTheme(id: string | null | undefined): boolean {
  return id === BASE_THEME_ID || id === LEGACY_BASE_THEME_ID;
}

/** Apply a theme id (the base theme removes the attribute — the raw token files). */
export function applyBrand(id: string) {
  /* setAttribute/removeAttribute rather than the dataset proxy: the hooks
     lint reads a dataset assignment as mutating shared state. */
  if (isBaseTheme(id)) {
    id = BASE_THEME_ID;
    document.documentElement.removeAttribute("data-brand");
  } else {
    document.documentElement.setAttribute("data-brand", id);
  }
  try {
    localStorage.setItem(BRAND_STORAGE_KEY, id);
  } catch {
    /* private mode: the pick still applies for this page's lifetime */
  }
  /* A template staged in the playground's frame tells the playground, which
     loads the pick into its levers. Even a pick the store already holds
     counts: it takes the playground off a custom mix. */
  try {
    if (window.parent !== window) {
      window.parent.dispatchEvent(new CustomEvent(BRAND_PICK_EVENT, { detail: id }));
    }
  } catch {
    /* a cross-origin parent is not the playground */
  }
}

/** Fired on the playground's window when a staged template picks a theme;
    the event's detail is the theme id. */
export const BRAND_PICK_EVENT = "brandpick";

/** Set on the playground's root (and mirrored onto a staged template's)
    while its levers hold a custom mix rather than a named theme, so the
    template's Theme menu says Custom. */
export const STAGED_CUSTOM_THEME_ATTR = "data-staged-custom-theme";

/** Same-tab change event for storeBrand, which sets no attribute. */
const BRAND_CHANGE_EVENT = "brandchange";

/** The stored pick, or null when none is kept (or storage is blocked). */
export function readStoredBrand(): string | null {
  try {
    const stored = localStorage.getItem(BRAND_STORAGE_KEY);
    return isBaseTheme(stored) ? BASE_THEME_ID : stored;
  } catch {
    return null;
  }
}

/** Keep a pick without painting it: the playground's picker, which suspends
    the attribute while it is mounted and paints the theme through its own
    levers, so a template and the next page still open on it. */
export function storeBrand(id: string) {
  try {
    localStorage.setItem(BRAND_STORAGE_KEY, isBaseTheme(id) ? BASE_THEME_ID : id);
  } catch {
    /* private mode: the pick lasts only as long as the page */
  }
  window.dispatchEvent(new Event(BRAND_CHANGE_EVENT));
}

/** The active theme id: the stored pick, which every surface writes, then
    the attribute (no pick kept, or storage blocked). The stored pick comes
    first because the playground suspends the attribute, and a template
    staged in its frame must still show the playground's pick. */
export function readBrand(): string {
  return (
    readStoredBrand() ??
    document.documentElement.getAttribute("data-brand") ??
    BASE_THEME_ID
  );
}

/** Subscribe to brand changes from any surface (MutationObserver + storage). */
export function subscribeBrand(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-brand"],
  });
  window.addEventListener("storage", callback);
  window.addEventListener(BRAND_CHANGE_EVENT, callback);
  return () => {
    observer.disconnect();
    window.removeEventListener("storage", callback);
    window.removeEventListener(BRAND_CHANGE_EVENT, callback);
  };
}
