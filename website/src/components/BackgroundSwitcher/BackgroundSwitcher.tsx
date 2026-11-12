"use client";

import type { ComponentPropsWithoutRef } from "react";
import { useRouter } from "next/navigation";
import { DropdownMenu, type DropdownMenuEntry } from "rift-ds/components/DropdownMenu/DropdownMenu";
import { Tooltip } from "rift-ds/components/Tooltip/Tooltip";
import { loadShaderScene } from "@/lib/shaders/lazy-scene";
import {
  SITE_BACKGROUNDS,
  backgroundEntry,
  setSiteBackground,
  useSiteBackground,
} from "@/lib/shaders/background";
import styles from "./BackgroundSwitcher.module.css";

/* A scene's code is not on the page until it is wanted (lib/shaders/
   lazy-scene): a hover or a focus on the trigger starts the load, so a
   pick in the menu rarely waits on it. */
const preloadScenes = () => {
  loadShaderScene().catch(() => {});
};

/* The trigger as its own element, so the menu semantics DropdownMenu
   clones onto its trigger (the aria attributes, the click and the keys)
   land on the real button and not on the tooltip's wrapper. The tooltip
   names the bare icon, the way the theme switcher's names its swatch;
   the sheet hides it while the menu is open, since the menu says it all. */
function Trigger({
  icon,
  tip,
  compact,
  className,
  ...buttonProps
}: ComponentPropsWithoutRef<"button"> & { icon: string; tip: string; compact: boolean }) {
  return (
    <Tooltip content={tip} position="bottom" className={`${styles.tip} ${className ?? ""}`}>
      <button
        type="button"
        {...buttonProps}
        className={`${styles.trigger} ${compact ? styles.triggerCompact : ""}`}
        aria-label={tip}
        onPointerEnter={preloadScenes}
        onFocus={preloadScenes}
      >
        <span className="material-symbols-rounded" aria-hidden="true">
          {icon}
        </span>
      </button>
    </Tooltip>
  );
}

/**
 * The header's background switcher, beside the theme switcher: a menu of
 * every background in SITE_BACKGROUNDS, each row its icon, its name and a
 * line on it, the active one marked, in the form the theme menu's rows
 * take. The trigger wears the active background's icon on the same
 * circular track the theme switcher's trigger wears, with a tooltip naming
 * it, so the two read as a pair. The home hero's scene row and the
 * playground's scene picks set the same background, and the playground
 * opens on it. Selection applies through the shared helper, and
 * every instance (the bar's and the drawer's) stays in sync by subscribing
 * to the attribute itself. The menu ends with
 * a row that opens the playground's Shaders view, where a visitor tunes a
 * scene of their own.
 */
export default function BackgroundSwitcher({
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
  const active = useSiteBackground();
  const router = useRouter();
  const current = backgroundEntry(active) ?? SITE_BACKGROUNDS[0];

  const items: DropdownMenuEntry[] = [
    ...SITE_BACKGROUNDS.map((entry) => ({
      label: entry.label,
      description: entry.description,
      icon: entry.icon,
      selected: entry.id === current.id,
      onClick: () => setSiteBackground(entry.id),
    })),
    { type: "separator" as const },
    {
      label: "Tune a scene",
      description: "Opens the playground",
      icon: "tune",
      onClick: () => router.push("/playground?view=shaders"),
    },
  ];

  return (
    <DropdownMenu
      className={className}
      size={size}
      align={align}
      items={items}
      trigger={
        <Trigger icon={current.icon} tip={`Background: ${current.label}`} compact={size === "compact"} />
      }
    />
  );
}
