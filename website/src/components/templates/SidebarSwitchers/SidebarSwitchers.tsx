"use client";

import ThemeToggle from "../../ThemeToggle/ThemeToggle";
import BrandSwitcher from "../../BrandSwitcher/BrandSwitcher";
import styles from "./SidebarSwitchers.module.css";

/**
 * The template shells' footer controls: the theme (preset) switcher beside
 * the light/dark toggle, the same pair the site header carries. The menu
 * opens upward and left-aligned, because this row sits at the sidebar's
 * floor. One component so every template's row stays identical — including
 * the sign-in screen, which has no sidebar and carries it on the form pane's
 * floor instead.
 */
export default function SidebarSwitchers() {
  return (
    <div className={styles.row}>
      <BrandSwitcher placement="up" align="left" />
      <ThemeToggle />
    </div>
  );
}
