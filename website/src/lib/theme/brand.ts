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
}

/** The active theme id, as the attribute currently says. */
export function readBrand(): string {
  return document.documentElement.getAttribute("data-brand") ?? BASE_THEME_ID;
}

/** Subscribe to brand changes from any surface (MutationObserver + storage). */
export function subscribeBrand(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-brand"],
  });
  window.addEventListener("storage", callback);
  return () => {
    observer.disconnect();
    window.removeEventListener("storage", callback);
  };
}
