/**
 * The site frame's layout, the reader's pick: where the sidebar docks (the
 * header and the footer move with it) and the contained width's step. Two
 * presets (SITE_FRAME_LAYOUTS in config/site-frame.ts, plain data a server
 * page can read) name the pairings the header's layout switcher offers:
 * `contained`, today's form, and `full`, edge to edge over the narrow step's
 * 1080px reading column. Each field is a stored choice (lib/storedChoice),
 * so it follows the reader between pages; nothing stored means SITE_FRAME's
 * own settings. The lab's Frame and Contained size levers write
 * the same store, so the header and the lab never disagree.
 */
import { useSyncExternalStore } from "react";
import { oneOf, readStoredChoice, subscribeStoredChoice, writeStoredChoice } from "./storedChoice";
import { SITE_FRAME, type SiteFrameLayout } from "@/config/site-frame";

export { SITE_FRAME_LAYOUTS, presetFor, type SiteFrameLayout } from "@/config/site-frame";

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
