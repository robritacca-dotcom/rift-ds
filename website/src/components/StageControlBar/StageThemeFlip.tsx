"use client";

import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import { themeSegments, useThemeSetting } from "@/components/ThemeToggle/ThemeToggle";

/**
 * The stages' theme control: every immersive surface drops the site header
 * that owns the theme toggle, so each one's StageControlBar carries this
 * instead. Same settings (System, Light, Dark), same store and the same
 * setter as the header's ThemeToggle, through useThemeSetting, so System
 * follows the OS here exactly as it does on the rest of the site. Labelled
 * rather than icon-only like the header's, matching the bar's other
 * controls, and because the header's tooltips open downward, off the foot
 * of the screen where the bar sits; a small stage asks for the icons alone
 * (`showLabels`), where the words would push the bar past a phone's width.
 */
export default function StageThemeFlip({
  showLabels = true,
}: {
  /** False on a small stage, where the bar has room for the icons alone;
      the labels stay as the segments' accessible names. */
  showLabels?: boolean;
}) {
  const [setting, setSetting] = useThemeSetting();

  return (
    <SegmentedControl
      segments={themeSegments}
      value={setting}
      onValueChange={setSetting}
      size="compact"
      showLabels={showLabels}
      aria-label="Site theme"
    />
  );
}
