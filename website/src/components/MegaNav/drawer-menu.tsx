"use client";

import { useSyncExternalStore } from "react";
import type { DrillMenuEntry, DrillMenuItem } from "rift-ds/components/DrillMenu/DrillMenu";
import type { SiteHeaderDrawerItem } from "rift-ds/components/SiteHeader/SiteHeader";
import { componentsSidebarGroups, type MegaItem } from "@/config/navigation";
import { SHOW_FIGMA_LINKS } from "@/config/social";
import { AUTHOR_NAME, AUTHOR_URL, FIGMA_URL, NPM_URL, REPOSITORY_URL, STORYBOOK_URL } from "@/config/brand.generated";
import { AuthorMarkIcon, FigmaIcon, GitHubIcon, NpmIcon, StorybookIcon } from "@/components/BrandIcons/BrandIcons";
import { themeSegments, useThemeSetting } from "@/components/ThemeToggle/ThemeToggle";
import { themeTiles } from "@/lib/theme/theme-tiles.generated";
import { useSiteTheme } from "@/lib/theme/use-theme-overrides";
import { applyBrand, readBrand, SERVED_THEME_ID, subscribeBrand } from "@/lib/theme/brand";
import { SITE_BACKGROUNDS, backgroundEntry, setSiteBackground, useSiteBackground } from "@/lib/shaders/background";
import styles from "./MegaNav.module.css";

/**
 * A section's pages as the header drawer's rows: the icon and the label,
 * without the mega menu's descriptions (the drawer is for going, the panel
 * for choosing). A component category drills into its components, the
 * sidebar group of the same id, since a category has no page of its own
 * beyond its anchor on /components.
 */
export function drawerPages(items: MegaItem[]): SiteHeaderDrawerItem[] {
  return items.map(({ href, label, icon }) => {
    const category = componentsSidebarGroups.find((group) => href.endsWith(`#${group.id}`));
    return {
      href,
      label,
      icon,
      ...(category ? { items: category.links.map((link) => ({ href: link.href, label: link.label })) } : {}),
    };
  });
}

const mark = (glyph: React.ReactNode) => <span className={styles.drawerMark}>{glyph}</span>;

/**
 * Where the system lives off-site, in the order a phone visitor wants it:
 * the repo, the package, the kit and the stories before the agent tooling
 * and the registry, then the author. The landing page's link row
 * and the footer's credit, given the room a full-screen menu has.
 */
const RESOURCES: DrillMenuItem[] = [
  { label: "GitHub repo", description: "Source, issues and releases", href: REPOSITORY_URL, icon: mark(<GitHubIcon />), external: true },
  { label: "npm package", description: "Install rift-ds", href: NPM_URL, icon: mark(<NpmIcon />), external: true },
  ...(SHOW_FIGMA_LINKS
    ? [{ label: "Figma kit", description: "Every component, drawn", href: FIGMA_URL, icon: mark(<FigmaIcon />), external: true }]
    : []),
  { label: "Storybook", description: "Every component's stories", href: STORYBOOK_URL, icon: mark(<StorybookIcon />), external: true },
  { label: "MCP endpoint", description: "Connect a coding agent", href: "/api/mcp", icon: "hub" },
  { label: "AGENTS.md", description: "The agent starter file", href: "/AGENTS.md", icon: "description" },
  { label: "shadcn registry", description: "Add components with the shadcn CLI", href: "/docs/get-started#shadcn-registry", icon: "terminal" },
  { label: AUTHOR_NAME, description: "Designed and built by", href: AUTHOR_URL, icon: mark(<AuthorMarkIcon />), external: true },
];

/**
 * The Appearance group a phone menu carries where the bar or the rail has
 * given up its look controls: Theme, Background (when the page paints one)
 * and Mode, each a row showing its current value that drills into its
 * choices. Every pick applies at once through the same helpers the
 * switchers use, and the stack stays on its level so the reader sees the
 * page change behind the row.
 */
export function useAppearanceSection({ background: withBackground = true }: { background?: boolean } = {}): DrillMenuEntry {
  const brand = useSyncExternalStore(subscribeBrand, readBrand, () => SERVED_THEME_ID);
  const tiles = themeTiles(useSiteTheme() === "dark" ? "dark" : "light");
  const tile = tiles.find((t) => t.value === brand) ?? tiles[0];
  const [setting, setSetting] = useThemeSetting();
  const mode = themeSegments.find((segment) => segment.value === setting) ?? themeSegments[0];
  const background = backgroundEntry(useSiteBackground()) ?? SITE_BACKGROUNDS[0];

  const swatch = (color: string, radius?: string) => (
    <span className={styles.drawerSwatch} style={{ backgroundColor: color, borderRadius: radius }} />
  );

  const theme: DrillMenuItem = {
    id: "theme",
    label: "Theme",
    icon: swatch(tile.color ?? "currentColor", tile.swatchRadius),
    value: tile.label,
    items: [
      {
        type: "section",
        items: tiles.map((t) => ({
          id: t.value,
          label: t.label,
          description: t.description,
          icon: swatch(t.color ?? "currentColor", t.swatchRadius),
          selected: t.value === brand,
          onClick: () => applyBrand(t.value),
        })),
      },
      { type: "section", items: [{ label: "Make your own", description: "Opens the playground", href: "/playground", icon: "add" }] },
    ],
  };
  const backgroundRow: DrillMenuItem = {
    id: "background",
    label: "Background",
    icon: background.icon,
    value: background.label,
    items: [
      {
        type: "section",
        items: SITE_BACKGROUNDS.map((entry) => ({
          id: entry.id,
          label: entry.label,
          description: entry.description,
          icon: entry.icon,
          selected: entry.id === background.id,
          onClick: () => setSiteBackground(entry.id),
        })),
      },
      {
        type: "section",
        items: [{ label: "Tune a scene", description: "Opens the playground", href: "/playground?view=shaders", icon: "tune" }],
      },
    ],
  };
  const modeRow: DrillMenuItem = {
    id: "mode",
    label: "Mode",
    icon: mode.icon,
    value: mode.label,
    items: themeSegments.map((segment) => ({
      id: segment.value,
      label: segment.label,
      description: segment.description,
      icon: segment.icon,
      selected: segment.value === setting,
      onClick: () => setSetting(segment.value),
    })),
  };

  return {
    type: "section",
    id: "appearance",
    label: "Appearance",
    items: withBackground ? [theme, backgroundRow, modeRow] : [theme, modeRow],
  };
}

/**
 * The header drawer's rows after the sections: Resources drills into the
 * links off-site, then the Appearance group. It is there at every width the
 * menu opens at: on a phone the bar has given those controls up, and on a
 * tablet, where the bar still shows them as small circles, the menu is the
 * roomier way to reach them, with their current values named.
 */
export function useDrawerEntries(phone: boolean): DrillMenuEntry[] {
  const appearance = useAppearanceSection();
  // A plain row, so it joins the sections' list right under Docs rather
  // than standing alone. The full-width sheet has room to name what is
  // inside; the tablet drawer's narrower row does not.
  const resources: DrillMenuEntry = {
    id: "resources",
    label: "Resources",
    ...(phone ? { value: "GitHub, npm, Figma" } : {}),
    items: RESOURCES,
  };
  return [resources, appearance];
}
