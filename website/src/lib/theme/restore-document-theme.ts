import {
  DEFAULT_COLOR_MODE_STORAGE_KEY,
  isColorModeSetting,
} from "rift-ds/components/ThemeToggle/colorMode";
import { BRAND_STORAGE_KEY, isBaseTheme } from "./brand";
import { BACKGROUND_STORAGE_KEY, restoreSiteBackground } from "@/lib/shaders/background-storage";

/**
 * Put back what the layout's pre-paint script wrote on <html>, when it is
 * gone: the colour mode, the theme pick, the background pick and the ready
 * mark that lifts the document's visibility:hidden. Does nothing while the
 * ready mark stands.
 *
 * Two paths lose them. A hydration failure that reaches the root makes
 * React client-render <html>, and acquiring that singleton removes every
 * attribute on it before setting the ones the layout renders: the page goes
 * invisible except the few rules that set visibility themselves, and the
 * mode falls back to the rendered dark. And a page that throws while
 * rendering on the server is served as Next's error document, where the
 * script never runs at all. On the first path the package's colorModeScript
 * repairs the mode by itself; the theme pick and the ready mark are the
 * site's own, so this restores them, and it restores the mode too because
 * the second path has no script to do it. DocumentThemeGuard calls this
 * from the root layout; the error card calls it too, as its own fallback.
 * Kept out of
 * brand.ts, which the build scripts load straight from Node, where the
 * package's .tsx colour-mode module cannot be read.
 */
export function restoreDocumentTheme() {
  const root = document.documentElement;
  if (root.hasAttribute("data-theme-ready")) return;
  let saved: string | null = null;
  let brand: string | null = null;
  let background: string | null = null;
  try {
    saved = localStorage.getItem(DEFAULT_COLOR_MODE_STORAGE_KEY);
    brand = localStorage.getItem(BRAND_STORAGE_KEY);
    background = localStorage.getItem(BACKGROUND_STORAGE_KEY);
  } catch {
    /* Private mode: the served theme stands. */
  }
  const setting = isColorModeSetting(saved) ? saved : "system";
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  root.setAttribute("data-theme-setting", setting);
  root.setAttribute("data-theme", setting === "system" ? (prefersDark ? "dark" : "light") : setting);
  if (isBaseTheme(brand)) root.removeAttribute("data-brand");
  else if (brand) root.setAttribute("data-brand", brand);
  restoreSiteBackground(root, background);
  root.setAttribute("data-theme-ready", "");
}
