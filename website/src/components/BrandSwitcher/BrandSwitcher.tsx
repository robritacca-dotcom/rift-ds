"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ThemePicker } from "rift-ds/components/ThemePicker/ThemePicker";
import { themeSelectorTiles } from "@/lib/theme/presets";
import { useSiteTheme } from "@/lib/theme/use-theme-overrides";
import { applyBrand, readBrand, SERVED_THEME_ID, subscribeBrand } from "@/lib/theme/brand";
import styles from "./BrandSwitcher.module.css";

// Matches the SSR value of data-brand on <html> in layout.tsx.
const getServerSnapshot = () => SERVED_THEME_ID;

/**
 * The header's theme switcher: the package's ThemePicker over every shipped
 * look, the same tiles the home page's dot row and the playground's picker
 * render, from the same builder. Selection applies through the shared brand
 * helper, and every instance stays in sync by subscribing to the attribute
 * itself, the way ThemeToggle does. The menu ends with a row that opens the
 * playground, where a visitor builds a theme of their own.
 */
export default function BrandSwitcher({
  className,
  placement = "down",
  align = "right",
  size = "default",
}: {
  className?: string;
  /** The trigger's size: `compact` for a seat with less room. */
  size?: "default" | "compact";
  /** Which way the menu prefers to open; it flips when that side has no room. */
  placement?: "down" | "up";
  /** Which trigger edge the menu hugs. */
  align?: "left" | "right";
}) {
  const active = useSyncExternalStore(subscribeBrand, readBrand, getServerSnapshot);
  const theme = useSiteTheme();
  const tiles = themeSelectorTiles(theme === "dark" ? "dark" : "light");

  return (
    <ThemePicker
      className={className}
      size={size}
      themes={tiles}
      value={active}
      onValueChange={applyBrand}
      placement={placement === "up" ? "top" : "bottom"}
      align={align === "left" ? "start" : "end"}
      footer={
        /* The list ends where a new theme would begin: the dashed slot
           opens the playground, where a visitor builds their own. */
        <Link href="/playground" role="menuitem" className={styles.row}>
          <span className={styles.rowSwatchAdd} aria-hidden="true">
            <span className="material-symbols-rounded">add</span>
          </span>
          <span className={styles.rowText}>
            <span className={styles.rowName}>Make your own</span>
            <span className={styles.rowFont}>Opens the playground</span>
          </span>
        </Link>
      }
    />
  );
}
