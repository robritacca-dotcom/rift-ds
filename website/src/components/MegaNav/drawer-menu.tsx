"use client";

import { useSyncExternalStore } from "react";
import type { NavStackEntry, NavStackItem } from "rift-ds/components/NavStack/NavStack";
import type { SiteHeaderDrawerItem } from "rift-ds/components/SiteHeader/SiteHeader";
import { componentsSidebarGroups, type MegaItem } from "@/config/navigation";
import { SHOW_FIGMA_LINKS } from "@/config/social";
import { FIGMA_URL, NPM_URL, REPOSITORY_URL } from "@/config/brand.generated";
import { FigmaIcon, GitHubIcon, NpmIcon } from "@/components/BrandIcons/BrandIcons";
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

/** Where the system lives off-site, in the order a phone visitor wants it: the repo, the package and the kit before the agent tooling. */
const RESOURCES: NavStackItem[] = [
  { label: "GitHub repo", description: "Source, issues and releases", href: REPOSITORY_URL, icon: mark(<GitHubIcon />), external: true },
  { label: "npm package", description: "Install rift-ds", href: NPM_URL, icon: mark(<NpmIcon />), external: true },
  ...(SHOW_FIGMA_LINKS
    ? [{ label: "Figma kit", description: "Every component, drawn", href: FIGMA_URL, icon: mark(<FigmaIcon />), external: true }]
    : []),
  { label: "MCP endpoint", description: "Connect a coding agent", href: "/api/mcp", icon: "hub" },
  { label: "AGENTS.md", description: "The agent starter file", href: "/AGENTS.md", icon: "description" },
];

/**
 * The drawer's rows after the sections: Resources drills into the links
 * off-site, and on a phone, where the bar gives up its look controls, an
 * Appearance group drills into each one's choices. Every pick applies at
 * once through the same helpers the bar's switchers use, and the stack
 * stays on its level so the reader sees the page change behind the row.
 */
export function useDrawerEntries(phone: boolean): NavStackEntry[] {
  const brand = useSyncExternalStore(subscribeBrand, readBrand, () => SERVED_THEME_ID);
  const tiles = themeTiles(useSiteTheme() === "dark" ? "dark" : "light");
  const tile = tiles.find((t) => t.value === brand) ?? tiles[0];
  const [setting, setSetting] = useThemeSetting();
  const mode = themeSegments.find((segment) => segment.value === setting) ?? themeSegments[0];
  const background = backgroundEntry(useSiteBackground()) ?? SITE_BACKGROUNDS[0];

  const swatch = (color: string, radius?: string) => (
    <span className={styles.drawerSwatch} style={{ backgroundColor: color, borderRadius: radius }} />
  );

  const resources: NavStackEntry = {
    type: "section",
    id: "resources",
    // The full-width sheet has room to name what is inside; the tablet
    // drawer's narrower row does not.
    items: [{ id: "resources", label: "Resources", ...(phone ? { value: "GitHub, npm, Figma" } : {}), items: RESOURCES }],
  };
  if (!phone) return [resources];

  return [
    resources,
    {
      type: "section",
      id: "appearance",
      label: "Appearance",
      items: [
        {
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
                onSelect: () => applyBrand(t.value),
              })),
            },
            { type: "section", items: [{ label: "Make your own", description: "Opens the playground", href: "/playground", icon: "add" }] },
          ],
        },
        {
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
                onSelect: () => setSiteBackground(entry.id),
              })),
            },
            {
              type: "section",
              items: [{ label: "Tune a scene", description: "Opens the playground", href: "/playground?view=shaders", icon: "tune" }],
            },
          ],
        },
        {
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
            onSelect: () => setSetting(segment.value),
          })),
        },
      ],
    },
  ];
}
