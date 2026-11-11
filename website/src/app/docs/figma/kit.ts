import { tokenValues, type ThemeMode } from "rift-ds/tokens/values";
import { themeSelectorTiles } from "@/lib/theme/presets";

/**
 * Helpers for the /docs/figma page. Which themes are modes of the kit's
 * Theme collection is KIT_THEMES in ./page.tsx, its one home, written out as
 * literals there so the site chat can read it (a corpus-facts block keeps
 * literal data only, and only from page.tsx). assertKitThemes holds that
 * table to the theme registry, so a wrong label or an unknown id fails the
 * build.
 */
export type KitTheme = { id: string; label: string };

export function assertKitThemes(themes: readonly KitTheme[]): void {
  const tiles = themeSelectorTiles("light");
  for (const { id, label } of themes) {
    const tile = tiles.find((t) => t.value === id);
    if (!tile || !tokenValues[id]) {
      throw new Error(`docs/figma/page.tsx: KIT_THEMES names "${id}", which is not a shipped theme`);
    }
    if (tile.label !== label) {
      throw new Error(`docs/figma/page.tsx: KIT_THEMES calls "${id}" "${label}", but the theme registry calls it "${tile.label}"`);
    }
  }
}

/** The kit's themes, in the kit's mode order, with their selector tiles. */
export function figmaThemes(ids: readonly string[], mode: ThemeMode) {
  const tiles = themeSelectorTiles(mode);
  return ids.flatMap((id) => {
    const tile = tiles.find((t) => t.value === id);
    return tile ? [tile] : [];
  });
}

/** Every theme the system ships, in or out of the kit. */
export const SYSTEM_THEME_COUNT = Object.keys(tokenValues).length;

/**
 * A token's variable name in the kit: the category prefix becomes the
 * group, so `--color-bg-container-primary` is `bg/container-primary` and
 * `--radius-pill` is `radius/pill`.
 */
export function figmaVariableName(token: string): string {
  const bare = token.replace(/^--(color-)?/, "");
  const dash = bare.indexOf("-");
  return dash === -1 ? bare : `${bare.slice(0, dash)}/${bare.slice(dash + 1)}`;
}

/** The variables the page's panel shows, each with the collection that holds it in the kit. */
export const PANEL_VARIABLES: ReadonlyArray<{ token: string; collection: "Mode" | "Theme" }> = [
  { token: "--color-action-primary-bg", collection: "Mode" },
  { token: "--color-bg-page-primary", collection: "Mode" },
  { token: "--color-bg-container-primary", collection: "Mode" },
  { token: "--color-bg-container-border", collection: "Mode" },
  { token: "--color-text-primary", collection: "Mode" },
  { token: "--color-text-secondary", collection: "Mode" },
  { token: "--radius-pill", collection: "Theme" },
  { token: "--radius-300", collection: "Theme" },
];
