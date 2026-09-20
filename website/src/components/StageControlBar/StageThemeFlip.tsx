"use client";

import { SegmentedControl } from "@robr0/design-system/components/SegmentedControl/SegmentedControl";
import { useSiteTheme } from "@/lib/theme/use-theme-overrides";

/**
 * The stages' light/dark flip, normalized: every immersive surface drops the
 * site header that owns the theme toggle, so each one's StageControlBar
 * carries this instead — same control, same store the header toggle writes
 * (the root attribute plus the persisted choice).
 */
export default function StageThemeFlip() {
  const theme = useSiteTheme();

  const apply = (next: string) => {
    document.documentElement.setAttribute("data-theme", next);
    /* An explicit pick, so the setting moves off "system" too — otherwise
       the root script's OS-change listener would override the bar's choice. */
    document.documentElement.setAttribute("data-theme-setting", next);
    window.localStorage.setItem("theme", next);
  };

  return (
    <SegmentedControl
      segments={[
        { value: "light", label: "Light", icon: "light_mode" },
        { value: "dark", label: "Dark", icon: "dark_mode" },
      ]}
      activeSegment={theme}
      onSegmentChange={apply}
      size="compact"
      ariaLabel="Site theme"
    />
  );
}
