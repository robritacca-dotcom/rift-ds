"use client";

import { useCallback, useSyncExternalStore } from "react";
import { SegmentedControl } from "@robr0/design-system/components/SegmentedControl/SegmentedControl";
import styles from "./ThemeToggle.module.css";

const themeSegments = [
  { value: "system", label: "System", icon: "routine" },
  { value: "light", label: "Light", icon: "light_mode" },
  { value: "dark", label: "Dark", icon: "dark_mode" },
];

/**
 * Two attributes on <html> carry the theme, both set by the inline script in
 * layout.tsx before first paint and mutated on toggle:
 *
 * - `data-theme-setting` is the visitor's choice — system, light or dark.
 *   System is the default; this control renders it.
 * - `data-theme` is what that resolves to — light or dark — and is what every
 *   stylesheet and theme-reading component consumes. While the setting is
 *   system, the inline script's matchMedia listener keeps it following the OS.
 *
 * Every ThemeToggle instance (in-flow header, sticky header, mobile menu)
 * subscribes to the attribute, so they all stay in sync no matter which one
 * is clicked, and they never drift on client-side navigation.
 */
function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme-setting"],
  });
  // Reflect theme changes made in other tabs.
  window.addEventListener("storage", callback);
  return () => {
    observer.disconnect();
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot() {
  return document.documentElement.getAttribute("data-theme-setting") || "system";
}

// Matches the SSR value of data-theme-setting on <html> in layout.tsx.
function getServerSnapshot() {
  return "system";
}

export default function ThemeToggle({ className }: { className?: string }) {
  const setting = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const handleChange = useCallback((value: string) => {
    const root = document.documentElement;
    root.setAttribute("data-theme-setting", value);
    const resolved =
      value === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : value;
    root.setAttribute("data-theme", resolved);
    localStorage.setItem("theme", value);
    // No setState needed — the MutationObserver above notifies every instance.
  }, []);

  return (
    <div className={`${styles.themeToggle} ${className || ""}`}>
      <SegmentedControl
        segments={themeSegments}
        activeSegment={setting}
        onSegmentChange={handleChange}
        size="compact"
        ariaLabel="Theme"
      />
    </div>
  );
}
