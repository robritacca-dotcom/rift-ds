"use client";

import { useRouter } from "next/navigation";
import type { DropdownMenuEntry } from "rift-ds/components/DropdownMenu/DropdownMenu";
import HeaderSwitcher from "../HeaderSwitcher/HeaderSwitcher";
import { loadShaderScene } from "@/lib/shaders/lazy-scene";
import {
  SITE_BACKGROUNDS,
  backgroundEntry,
  setSiteBackground,
  useSiteBackground,
} from "@/lib/shaders/background";

/* A scene's code is not on the page until it is wanted (lib/shaders/
   lazy-scene): a hover or a focus on the trigger starts the load, so a
   pick in the menu rarely waits on it. */
const preloadScenes = () => {
  loadShaderScene().catch(() => {});
};

/**
 * The header's background switcher, a HeaderSwitcher beside the theme
 * switcher: a menu of
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
    <HeaderSwitcher
      className={className}
      size={size}
      align={align}
      items={items}
      icon={current.icon}
      label={`Background: ${current.label}`}
      onIntent={preloadScenes}
    />
  );
}
