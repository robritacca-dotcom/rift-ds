/* The max accessibility mode (POC): one attribute, data-a11y="max" on
   <html>, which a11y-max.generated.css and a11y-max.css key off. The
   root layout's pre-paint script owns the default: a saved pick wins,
   and with none saved the mode follows the OS's prefers-contrast: more.
   It also follows the storage event, so a same-origin frame (the home
   page's template preview) flips with the page that owns the toggle.

   A pick is stored either way, "max" or "standard", so choosing Standard
   on a machine set to increased contrast sticks instead of reverting to
   the OS default on the next load. */

/** The localStorage key the layout's pre-paint script reads. */
export const A11Y_STORAGE_KEY = "a11y";

export function readA11yMax(): boolean {
  return document.documentElement.getAttribute("data-a11y") === "max";
}

export function applyA11yMax(on: boolean) {
  const root = document.documentElement;
  /* data-motion="reduce" is the library's own switch (src/behaviors/
     useReducedMotion.ts): charts, counters and the globe stop moving. */
  if (on) {
    root.setAttribute("data-a11y", "max");
    root.setAttribute("data-motion", "reduce");
  } else {
    root.removeAttribute("data-a11y");
    root.removeAttribute("data-motion");
  }
  try {
    localStorage.setItem(A11Y_STORAGE_KEY, on ? "max" : "standard");
  } catch {
    /* private mode: the mode still applies for this page's lifetime */
  }
}

export function subscribeA11yMax(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-a11y"],
  });
  return () => observer.disconnect();
}
