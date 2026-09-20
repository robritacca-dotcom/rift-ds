/**
 * The one place a theme pick is applied. Every selector surface (the hero
 * row, the header switcher, the playground's apply) calls this rather than
 * touching the attribute itself, so the persistence contract — the pick
 * holds across every page until the visitor changes it or clears storage,
 * read back by the layout's pre-paint script — has a single home.
 */

/** The localStorage key the layout's pre-paint script reads. */
export const BRAND_STORAGE_KEY = "brand";

/** Apply a theme id ("default" removes the attribute — the raw token files). */
export function applyBrand(id: string) {
  /* setAttribute/removeAttribute rather than the dataset proxy: the hooks
     lint reads a dataset assignment as mutating shared state. */
  if (id === "default") {
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
  return document.documentElement.getAttribute("data-brand") ?? "default";
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
