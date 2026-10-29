"use client";

import { ThemeToggle as LibraryThemeToggle } from "rift-ds/components/ThemeToggle/ThemeToggle";
import type { ColorModeSetting } from "rift-ds/components/ThemeToggle/colorMode";
import { useColorMode } from "rift-ds/components/ThemeToggle/useColorMode";
import styles from "./ThemeToggle.module.css";

/** The three settings, in the order every theme control shows them. */
export const themeSegments = [
  { value: "system", label: "System", icon: "routine" },
  { value: "light", label: "Light", icon: "light_mode" },
  { value: "dark", label: "Dark", icon: "dark_mode" },
];

/**
 * The visitor's theme setting and the one way to change it: the package's
 * own useColorMode, which writes data-theme-setting and data-theme on <html>
 * (set first by the inline script in layout.tsx, built from the package's
 * colorModeScript) and persists the choice. Every theme control on the site
 * reads and writes through it (the header's here, and the immersive stages'
 * StageThemeFlip), so they behave identically and match what a consumer of
 * the package gets.
 */
export function useThemeSetting(): [setting: string, setSetting: (value: string) => void] {
  const [setting, setSetting] = useColorMode();
  return [setting, (value) => setSetting(value as ColorModeSetting)];
}

/**
 * The site's header toggle: the package's ThemeToggle as an icon strip
 * (its labels become tooltips), compact in the header to match the row's
 * other controls, or at the default size where a seat has room.
 */
export default function ThemeToggle({
  className,
  size = "default",
}: {
  className?: string;
  /** `compact` for a seat with less room, such as the header or the template sidebars' footer row. */
  size?: "default" | "compact";
}) {
  return (
    <div className={`${styles.themeToggle} ${className || ""}`}>
      <LibraryThemeToggle size={size} showLabels={false} aria-label="Theme" />
    </div>
  );
}
