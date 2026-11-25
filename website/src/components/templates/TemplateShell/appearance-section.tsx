"use client";

import { useSyncExternalStore } from "react";
import type { AppSidebarSection } from "rift-ds/components/AppSidebar/AppSidebar";
import { BREAKPOINT_MOBILE_PX, mediaBelow } from "rift-ds/tokens/breakpoints";
import { themeSegments, useThemeSetting } from "@/components/ThemeToggle/ThemeToggle";
import { themeTiles } from "@/lib/theme/theme-tiles.generated";
import { useSiteTheme } from "@/lib/theme/use-theme-overrides";
import { applyBrand, readBrand, SERVED_THEME_ID, subscribeBrand } from "@/lib/theme/brand";
import {
  TEMPLATE_LAYOUTS,
  TEMPLATE_WIDTHS,
  setTemplateLayout,
  setTemplateWidth,
  type TemplateLayout,
  type TemplateWidth,
} from "@/lib/templateLayout";
import { useTemplateLayout, useTemplateWidth } from "./useTemplateLayout";
import styles from "./TemplateShell.module.css";

const PHONE_QUERY = mediaBelow(BREAKPOINT_MOBILE_PX);
const subscribePhone = (callback: () => void) => {
  const query = window.matchMedia(PHONE_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
};
const readPhone = () => window.matchMedia(PHONE_QUERY).matches;

const swatch = (color: string, radius?: string) => (
  <span className={styles.railSwatch} style={{ backgroundColor: color, borderRadius: radius }} />
);

/**
 * The template rail's Appearance section: Theme, Mode, Layout and Width as
 * rows that each show their current value and open their choices in the
 * side panel (the rail's secondary menu), where the chosen one carries the
 * mark and a pick applies at once. The phone drawer drills into the same
 * rows. Layout and Width leave below the mobile breakpoint, where every
 * mode gives way to the plain page and the width changes nothing.
 */
export function useAppearanceRailSection(): AppSidebarSection {
  const brand = useSyncExternalStore(subscribeBrand, readBrand, () => SERVED_THEME_ID);
  const tiles = themeTiles(useSiteTheme() === "dark" ? "dark" : "light");
  const tile = tiles.find((t) => t.value === brand) ?? tiles[0];
  const [setting, setSetting] = useThemeSetting();
  const mode = themeSegments.find((segment) => segment.value === setting) ?? themeSegments[0];
  const layout = useTemplateLayout();
  const width = useTemplateWidth();
  const layoutNow = TEMPLATE_LAYOUTS.find((option) => option.value === layout) ?? TEMPLATE_LAYOUTS[0];
  const widthNow = TEMPLATE_WIDTHS.find((option) => option.value === width) ?? TEMPLATE_WIDTHS[0];
  const phone = useSyncExternalStore(subscribePhone, readPhone, () => false);

  return {
    category: "Appearance",
    items: [
      {
        key: "appearance-theme",
        label: "Theme",
        icon: swatch(tile.color ?? "currentColor", tile.swatchRadius),
        value: tile.label,
        children: [
          ...tiles.map((t) => ({
            key: `theme-${t.value}`,
            label: t.label,
            description: t.description,
            icon: swatch(t.color ?? "currentColor", t.swatchRadius),
            selected: t.value === brand,
            onClick: () => applyBrand(t.value),
          })),
          { key: "theme-playground", label: "Make your own", description: "Opens the playground", icon: "add", href: "/playground", group: "Your own" },
        ],
      },
      {
        key: "appearance-mode",
        label: "Mode",
        icon: mode.icon,
        value: mode.label,
        children: themeSegments.map((segment) => ({
          key: `mode-${segment.value}`,
          label: segment.label,
          description: segment.description,
          icon: segment.icon,
          selected: segment.value === setting,
          onClick: () => setSetting(segment.value),
        })),
      },
      ...(phone
        ? []
        : [
            {
              key: "appearance-layout",
              label: "Layout",
              icon: layoutNow.icon,
              value: layoutNow.label,
              children: TEMPLATE_LAYOUTS.map((option) => ({
                key: `layout-${option.value}`,
                label: option.label,
                description: option.description,
                icon: option.icon,
                selected: option.value === layout,
                onClick: () => setTemplateLayout(option.value as TemplateLayout),
              })),
            },
            {
              key: "appearance-width",
              label: "Width",
              icon: widthNow.icon,
              value: widthNow.label,
              children: TEMPLATE_WIDTHS.map((option) => ({
                key: `width-${option.value}`,
                label: option.label,
                description: option.description,
                icon: option.icon,
                selected: option.value === width,
                onClick: () => setTemplateWidth(option.value as TemplateWidth),
              })),
            },
          ]),
    ],
  };
}
