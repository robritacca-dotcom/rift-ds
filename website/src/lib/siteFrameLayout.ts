/**
 * The site frame's layout, the reader's pick: where the sidebar docks (the
 * header and the footer move with it) and the contained width's step. Two
 * presets name the pairings the header's layout switcher offers:
 * `contained`, today's form, and `full`, edge to edge over the narrow step's
 * 1080px reading column. Each field is a stored choice (lib/storedChoice),
 * so it follows the reader between pages; nothing stored means SITE_FRAME's
 * own settings. The lab's Frame and Contained size levers write
 * the same store, so the header and the lab never disagree.
 */
import { useSyncExternalStore } from "react";
import { oneOf, readStoredChoice, subscribeStoredChoice, writeStoredChoice } from "./storedChoice";
import { SITE_FRAME, type SiteFrameSettings } from "@/config/site-frame";

export type SiteFrameLayout = Pick<SiteFrameSettings, "sidebarDock" | "containedWidth">;

/** The presets the header's layout switcher offers, in its order. */
export const SITE_FRAME_LAYOUTS = [
  {
    id: "contained",
    label: "Contained",
    description: "Centred on the page, the sidebar beside it",
    icon: "width_normal",
    layout: { sidebarDock: "content", containedWidth: "default" },
  },
  {
    id: "full",
    label: "Full width",
    description: "Edge to edge, a narrow reading column",
    icon: "width_full",
    layout: { sidebarDock: "edge", containedWidth: "narrow" },
  },
] as const satisfies readonly { id: string; label: string; description: string; icon: string; layout: SiteFrameLayout }[];

const DOCK_KEY = "site-frame-dock";
const SIZE_KEY = "site-frame-size";
const CHANGE_EVENT = "site-frame-layout-change";
const subscribe = subscribeStoredChoice(CHANGE_EVENT);
const isDock = oneOf(["content", "edge"] as const);
const isSize = oneOf(["narrow", "default", "wide"] as const);

const readDock = () => readStoredChoice(DOCK_KEY, isDock, SITE_FRAME.sidebarDock);
const readSize = () => readStoredChoice(SIZE_KEY, isSize, SITE_FRAME.containedWidth);

/** The reader's layout; the server and the first paint render SITE_FRAME's. */
export function useSiteFrameLayout(): SiteFrameLayout {
  const sidebarDock = useSyncExternalStore(subscribe, readDock, () => SITE_FRAME.sidebarDock);
  const containedWidth = useSyncExternalStore(subscribe, readSize, () => SITE_FRAME.containedWidth);
  return { sidebarDock, containedWidth };
}

/** Changes the layout, a preset's pair or one field of it, everywhere it shows. */
export function setSiteFrameLayout(next: Partial<SiteFrameLayout>) {
  if (next.sidebarDock) writeStoredChoice(DOCK_KEY, next.sidebarDock, CHANGE_EVENT);
  if (next.containedWidth) writeStoredChoice(SIZE_KEY, next.containedWidth, CHANGE_EVENT);
}

/** The preset a layout matches, if it is one. */
export const presetFor = (layout: SiteFrameLayout) =>
  SITE_FRAME_LAYOUTS.find(
    (preset) => preset.layout.sidebarDock === layout.sidebarDock && preset.layout.containedWidth === layout.containedWidth
  );
