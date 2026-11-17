/**
 * Colour mode: the visitor's choice of system, light or dark, applied to the
 * page as the `data-theme` the tokens read.
 *
 * Two attributes on `<html>` carry it. `data-theme-setting` is the choice
 * (`system`, `light` or `dark`); `data-theme` is what it resolves to
 * (`light` or `dark`), which every stylesheet and component reads. While the
 * setting is `system`, the page follows the operating system.
 *
 * `colorModeScript()` applies the stored choice before first paint, so a
 * returning visitor never sees the wrong mode flash; render it in the
 * document head. `useColorMode()` reads and changes the choice from any
 * component, and every instance stays in step, across tabs too. ThemeToggle
 * is the control built on it, and useColorMode.tsx holds the hook.
 *
 * This module holds the script and the vocabulary, and is safe to import
 * from a Server Component (a root layout renders the script); the hook
 * lives in `useColorMode.tsx`, a client module. Both are kept out of
 * ThemeToggle.tsx so that module exports only a component (react-refresh).
 * `.tsx` despite holding no JSX: the barrel generator and the
 * `./components/*` export subpath both address `.tsx`, so that extension is
 * what makes this reachable as `rift-ds/components/ThemeToggle/colorMode`.
 */

/** The three settings, in the order every colour-mode control shows them. */
export const colorModeSettings = ['system', 'light', 'dark'] as const;

export type ColorModeSetting = (typeof colorModeSettings)[number];

/** Where the choice is stored unless a caller names its own key. */
export const DEFAULT_COLOR_MODE_STORAGE_KEY = 'theme';

export const isColorModeSetting = (value: unknown): value is ColorModeSetting =>
  colorModeSettings.includes(value as ColorModeSetting);

/** The options both halves share, so the script and the hook agree on a key. */
export type ColorModeOptions = {
  /** The localStorage key the choice is kept under. Default `theme`. */
  storageKey?: string;
};

/** The script's options: the colour mode's key, and optionally the key a host keeps its theme choice under. */
export type ColorModeScriptOptions = ColorModeOptions & {
  /**
   * The localStorage key a host keeps its chosen theme under, as a preset id
   * (`plum`, from `SHIPPED_THEMES` in `rift-ds/tokens/values`). When set, the
   * script also applies it as `data-brand` on `<html>` before first paint, so a
   * returning visitor never sees the default theme flash first; an empty
   * value, the base theme's id or a value that is not an id leaves the
   * attribute as the layout rendered it. The host writes the key when the
   * visitor picks a theme. Unset by default: the script then never touches
   * `data-brand`.
   */
  brandStorageKey?: string;
  /** The base theme's id, which applies by removing `data-brand` rather than setting it. Default `tide`. */
  baseThemeId?: string;
};

/**
 * The script that applies the stored choice before first paint: it sets
 * `data-theme-setting` and `data-theme` on `<html>` and, while the setting
 * is `system`, keeps `data-theme` following the operating system. Render it
 * inline in the document head, before anything paints. Storage being
 * unavailable (a private window) leaves the page on `system`.
 *
 * It also puts the choice back when React wipes it. A hydration failure that
 * reaches the root (a browser extension editing the page before hydration
 * is enough) makes React client-render `<html>`, and taking that element
 * over removes every attribute on it before setting the ones the layout
 * renders. Without a repair the visitor's mode falls back to whatever the
 * layout wrote, or to light. The script watches for its own
 * `data-theme-setting` going missing, or coming back from nothing, and
 * applies the stored choice again. A ThemeToggle change only ever replaces
 * the value, so it never trips the repair.
 */
export function colorModeScript({
  storageKey = DEFAULT_COLOR_MODE_STORAGE_KEY,
  brandStorageKey,
  baseThemeId = 'tide',
}: ColorModeScriptOptions = {}): string {
  const key = JSON.stringify(storageKey);
  // The brand half is written only when a host asks for it, so the default
  // script stays byte-for-byte what it was.
  const brand = brandStorageKey
    ? `
    var brand = null;
    try { brand = localStorage.getItem(${JSON.stringify(brandStorageKey)}); } catch (e) {}
    if (brand === ${JSON.stringify(baseThemeId)}) root.removeAttribute('data-brand');
    else if (brand && /^[a-z0-9-]+$/.test(brand)) root.setAttribute('data-brand', brand);`
    : '';
  return `(function () {
  var root = document.documentElement;
  var media = window.matchMedia('(prefers-color-scheme: dark)');
  function apply() {
    var saved = null;
    try { saved = localStorage.getItem(${key}); } catch (e) {}
    var setting = saved === 'light' || saved === 'dark' ? saved : 'system';
    root.setAttribute('data-theme-setting', setting);
    root.setAttribute('data-theme', setting === 'system' ? (media.matches ? 'dark' : 'light') : setting);${brand}
  }
  apply();
  media.addEventListener('change', function (event) {
    if (root.getAttribute('data-theme-setting') === 'system') {
      root.setAttribute('data-theme', event.matches ? 'dark' : 'light');
    }
  });
  if (typeof MutationObserver === 'undefined') return;
  var observer = new MutationObserver(function (records) {
    var wiped = !root.hasAttribute('data-theme-setting');
    for (var i = 0; !wiped && i < records.length; i++) {
      if (records[i].attributeName === 'data-theme-setting' && records[i].oldValue === null) wiped = true;
    }
    if (!wiped) return;
    apply();
    observer.takeRecords();
  });
  observer.observe(root, { attributes: true, attributeOldValue: true, attributeFilter: ['data-theme-setting'] });
})();`;
}
