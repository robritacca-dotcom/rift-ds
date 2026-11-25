"use client";

import { ThemeToggle as LibraryThemeToggle } from "rift-ds/components/ThemeToggle/ThemeToggle";
import type { ColorModeSetting } from "rift-ds/components/ThemeToggle/colorMode";
import { useColorMode } from "rift-ds/components/ThemeToggle/useColorMode";
import styles from "./ThemeToggle.module.css";
import HeaderSwitcher from "../HeaderSwitcher/HeaderSwitcher";

/** The three settings, in the order every theme control shows them, each with the line a list of them shows under its name. */
export const themeSegments = [
  { value: "system", label: "System", icon: "routine", description: "Follows your device" },
  { value: "light", label: "Light", icon: "light_mode", description: "Light surfaces, dark text" },
  { value: "dark", label: "Dark", icon: "dark_mode", description: "Dark surfaces, light text" },
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

/** The menu form: a HeaderSwitcher wearing the current setting's icon, opening a list of the three. */
function ThemeMenu({ className, size }: { className?: string; size: "default" | "compact" }) {
  const [setting, setSetting] = useThemeSetting();
  const current = themeSegments.find((segment) => segment.value === setting) ?? themeSegments[0];
  return (
    <HeaderSwitcher
      className={className}
      size={size}
      items={themeSegments.map((segment) => ({
        label: segment.label,
        description: segment.description,
        icon: segment.icon,
        selected: segment.value === current.value,
        onClick: () => setSetting(segment.value),
      }))}
      icon={current.icon}
      label={`Colour mode: ${current.label}`}
    />
  );
}

/**
 * The site's header toggle: the package's ThemeToggle as an icon strip
 * (its labels become tooltips), compact in the header to match the row's
 * other controls, or at the default size where a seat has room. `menu`
 * folds it to one circle that opens a list of the settings, the form the
 * header's other switchers take, for the condensed bar.
 */
export default function ThemeToggle({
  className,
  size = "default",
  cycle = false,
  menu = false,
}: {
  className?: string;
  /** `compact` for a seat with less room, such as the header or the template sidebars' footer row. */
  size?: "default" | "compact";
  /** The package's one-circle form, which steps through the settings, for the header's condensed bar. */
  cycle?: boolean;
  /** One circle that opens a list of the settings, as the header's other switchers do. */
  menu?: boolean;
}) {
  if (menu) {
    return (
      <div className={`${styles.themeToggle} ${className || ""}`}>
        <ThemeMenu size={size} />
      </div>
    );
  }
  return (
    <div className={`${styles.themeToggle} ${className || ""}`}>
      <LibraryThemeToggle
        size={size}
        showLabels={false}
        cycle={cycle}
        aria-label="Theme"
      />
    </div>
  );
}

