/**
 * The header's search button and the palette mount live in different trees
 * (MegaNav renders per page, the palette mounts once from the root layout),
 * so the open signal travels as a window event rather than shared state —
 * the same never-meet pattern as the nav drawer's <html> attribute.
 */
export const SITE_PALETTE_OPEN_EVENT = "rr:site-palette-open";

export function openSitePalette() {
  window.dispatchEvent(new Event(SITE_PALETTE_OPEN_EVENT));
}
