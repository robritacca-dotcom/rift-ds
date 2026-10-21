/* The AAA mode on the site: data-a11y="aaa" on <html>, which the library's
   rift-ds/tokens/aaa.css keys off (the root layout imports it). The
   layout's pre-paint script owns the default: a saved pick wins, and with
   none saved the mode follows the OS's prefers-contrast: more, live.

   A pick is stored either way, "aaa" or "standard", so turning the mode
   off on a machine set to more contrast sticks instead of coming back on
   the next load. */

/** The localStorage key the layout's pre-paint script reads. */
export const A11Y_STORAGE_KEY = "a11y";

export function readAaaMode(): boolean {
  return document.documentElement.getAttribute("data-a11y") === "aaa";
}

export function applyAaaMode(on: boolean) {
  const root = document.documentElement;
  if (on) root.setAttribute("data-a11y", "aaa");
  else root.removeAttribute("data-a11y");
  try {
    localStorage.setItem(A11Y_STORAGE_KEY, on ? "aaa" : "standard");
  } catch {
    /* private mode: the mode still applies for this page's lifetime */
  }
}

export function subscribeAaaMode(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-a11y"] });
  return () => observer.disconnect();
}
