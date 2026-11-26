"use client";

import { useSyncExternalStore } from "react";
import type { AppSidebarSection } from "rift-ds/components/AppSidebar/AppSidebar";
import { BREAKPOINT_MOBILE_PX, mediaBelow } from "rift-ds/tokens/breakpoints";
import { themeSegments, useThemeSetting } from "@/components/ThemeToggle/ThemeToggle";
import { themeTiles } from "@/lib/theme/theme-tiles.generated";
import { useSiteTheme } from "@/lib/theme/use-theme-overrides";
import {
  applyBrand,
  readBrand,
  SERVED_THEME_ID,
  STAGED_CUSTOM_THEME_ATTR,
  subscribeBrand,
} from "@/lib/theme/brand";
import type { ChatBackdrop } from "rift-ds/chat";
import {
  CHAT_BACKDROPS,
  TEMPLATE_LAYOUTS,
  TEMPLATE_WIDTHS,
  setChatBackdrop,
  setTemplateLayout,
  setTemplateWidth,
  type TemplateLayout,
  type TemplateLayoutScope,
  type TemplateWidth,
} from "@/lib/templateLayout";
import { useChatBackdrop, useTemplateLayout, useTemplateWidth } from "./useTemplateLayout";
import styles from "./TemplateShell.module.css";

const PHONE_QUERY = mediaBelow(BREAKPOINT_MOBILE_PX);
const subscribePhone = (callback: () => void) => {
  const query = window.matchMedia(PHONE_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
};
const readPhone = () => window.matchMedia(PHONE_QUERY).matches;

/* The playground marks a custom mix in its levers on the staged frame's root. */
const subscribeCustom = (callback: () => void) => {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: [STAGED_CUSTOM_THEME_ATTR] });
  return () => observer.disconnect();
};
const readCustom = () => document.documentElement.hasAttribute(STAGED_CUSTOM_THEME_ATTR);

const swatch = (color: string, radius?: string) => (
  <span className={styles.railSwatch} style={{ backgroundColor: color, borderRadius: radius }} />
);

/**
 * The templates' Appearance section: Theme, Mode, Layout and Width as
 * rows that each show their current value and open their choices, where
 * the chosen one carries the mark and a pick applies at once. The template
 * rail opens them in its side panel and its phone drawer drills into
 * them; the chat home's history rail, an AppSidebar too, takes the same
 * section. Layout and Width leave below the mobile
 * breakpoint, where every mode gives way to the plain page and the width
 * changes nothing.
 *
 * `scope` names whose layout the rows write: every template's (the
 * default), or the chat home's, which keeps its own, has no Width (a chat
 * is its own page) and adds the Backdrop a flush chat carries.
 */
export function useAppearanceRailSection({ scope = "templates" }: { scope?: TemplateLayoutScope } = {}): AppSidebarSection {
  const brand = useSyncExternalStore(subscribeBrand, readBrand, () => SERVED_THEME_ID);
  const tiles = themeTiles(useSiteTheme() === "dark" ? "dark" : "light");
  const tile = tiles.find((t) => t.value === brand) ?? tiles[0];
  /* Staged in the playground with its levers off every named theme: the
     row says Custom and no theme carries the mark. */
  const custom = useSyncExternalStore(subscribeCustom, readCustom, () => false);
  const customColor = "var(--color-action-primary-bg)";
  const [setting, setSetting] = useThemeSetting();
  const mode = themeSegments.find((segment) => segment.value === setting) ?? themeSegments[0];
  const layout = useTemplateLayout(scope);
  const width = useTemplateWidth();
  const backdrop = useChatBackdrop();
  const backdropNow = CHAT_BACKDROPS.find((option) => option.value === backdrop) ?? CHAT_BACKDROPS[0];
  const layoutNow = TEMPLATE_LAYOUTS.find((option) => option.value === layout) ?? TEMPLATE_LAYOUTS[0];
  const widthNow = TEMPLATE_WIDTHS.find((option) => option.value === width) ?? TEMPLATE_WIDTHS[0];
  const phone = useSyncExternalStore(subscribePhone, readPhone, () => false);

  return {
    category: "Appearance",
    items: [
      {
        key: "appearance-theme",
        label: "Theme",
        icon: custom ? swatch(customColor) : swatch(tile.color ?? "currentColor", tile.swatchRadius),
        value: custom ? "Custom" : tile.label,
        children: [
          ...tiles.map((t) => ({
            key: `theme-${t.value}`,
            label: t.label,
            description: t.description,
            icon: swatch(t.color ?? "currentColor", t.swatchRadius),
            selected: !custom && t.value === brand,
            onClick: () => applyBrand(t.value),
          })),
          custom
            ? { key: "theme-custom", label: "Custom", description: "Made in the playground", icon: swatch(customColor), selected: true, group: "Your own" }
            : { key: "theme-playground", label: "Make your own", description: "Opens the playground", icon: "add", href: "/playground", group: "Your own" },
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
                onClick: () => setTemplateLayout(option.value as TemplateLayout, scope),
              })),
            },
            ...(scope === "chat"
              ? layout === "flush"
                ? [
                    {
                      key: "appearance-backdrop",
                      label: "Backdrop",
                      icon: backdropNow.icon,
                      value: backdropNow.label,
                      children: CHAT_BACKDROPS.map((option) => ({
                        key: `backdrop-${option.value}`,
                        label: option.label,
                        description: option.description,
                        icon: option.icon,
                        selected: option.value === backdrop,
                        onClick: () => setChatBackdrop(option.value as ChatBackdrop),
                      })),
                    },
                  ]
                : []
              : [
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
          ]),
    ],
  };
}
