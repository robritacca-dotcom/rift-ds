"use client";

import { useSyncExternalStore } from "react";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import { applyA11yMax, readA11yMax, subscribeA11yMax } from "@/lib/a11y-mode";
import styles from "./ThemeToggle.module.css";

/* The max accessibility mode (POC) as a sibling of the light and dark
   control: Standard is the themed site, Accessible is one black and white
   look with no effects and no motion (src/lib/a11y-mode.ts owns the
   attribute). Same icon-only shape as ThemeToggle, so it shares that
   stylesheet: the labels become the segments' tooltips. */
const segments = [
  { value: "standard", label: "Standard", icon: "palette" },
  { value: "accessible", label: "Accessible", icon: "accessibility_new" },
];

export default function A11yToggle({ className }: { className?: string }) {
  // The server always renders Standard; the pre-paint script may already
  // have set the attribute, and the store picks it up after hydration.
  const on = useSyncExternalStore(subscribeA11yMax, readA11yMax, () => false);

  return (
    <div className={`${styles.themeToggle} ${className || ""}`}>
      <SegmentedControl
        segments={segments}
        activeSegment={on ? "accessible" : "standard"}
        onSegmentChange={(value) => applyA11yMax(value === "accessible")}
        size="compact"
        ariaLabel="Accessibility mode"
      />
    </div>
  );
}
