"use client";

import type { DropdownMenuEntry } from "rift-ds/components/DropdownMenu/DropdownMenu";
import HeaderSwitcher from "../HeaderSwitcher/HeaderSwitcher";
import { SITE_FRAME_LAYOUTS, presetFor, setSiteFrameLayout, useSiteFrameLayout } from "@/lib/siteFrameLayout";

/**
 * The header's layout switcher, a HeaderSwitcher beside the background
 * switcher: a menu of the site frame's layout presets (SITE_FRAME_LAYOUTS
 * in lib/siteFrameLayout), each its icon, its name and a line on it, the
 * active one marked. The trigger wears the active preset's icon with a
 * tooltip naming it. The header shows it only inside SiteFrame and only on
 * a desktop bar, where the two layouts differ: below the tablet step the
 * sidebar leaves the page and both draw the same.
 */
export default function LayoutSwitcher({
  className,
  align = "end",
  size = "default",
}: {
  className?: string;
  /** The trigger's size: `compact` for a seat with less room. */
  size?: "default" | "compact";
  /** Which trigger edge the menu hugs. */
  align?: "start" | "end";
}) {
  const layout = useSiteFrameLayout();
  const current = presetFor(layout);

  const items: DropdownMenuEntry[] = SITE_FRAME_LAYOUTS.map((preset) => ({
    label: preset.label,
    description: preset.description,
    icon: preset.icon,
    selected: preset.id === current?.id,
    onClick: () => setSiteFrameLayout(preset.layout),
  }));

  return (
    <HeaderSwitcher
      className={className}
      size={size}
      align={align}
      items={items}
      icon={current?.icon ?? "width_normal"}
      label={`Layout: ${current?.label ?? "Custom"}`}
    />
  );
}
