/**
 * What each of the site's `--layout-*` custom properties is for.
 *
 * The values live in website/src/app/globals.css and nowhere else:
 * /foundations/layout reads them from the stylesheet at build time
 * (lib/layout-source.ts), so this list holds only the words. The
 * properties are the site's, not the package's (the site frame's own
 * columns are SiteLayout's `--ds-site-layout-*`), which is why they sit in
 * the site's stylesheet rather than the token files.
 * scripts/validate-foundation-mirrors.mjs holds this list to the
 * stylesheet in both directions, so a new property cannot ship without a
 * description, and a removed one cannot linger here.
 */

export interface LayoutProperty {
  /** The custom property, as declared in globals.css. */
  name: string;
  /** What it sizes, in a sentence. */
  role: string;
}

export const LAYOUT_PROPERTIES: readonly LayoutProperty[] = [
  {
    name: "--layout-sidebar-width",
    role: "The site’s own pill sidebar’s width (the site frame lab’s Sidebar option), and the footer brand block’s width outside the frame.",
  },
  {
    name: "--layout-column-gap",
    role: "The gap between a page’s own columns: its details rail, or a document’s table of contents.",
  },
  {
    name: "--layout-rail-width",
    role: "A page’s own details rail’s width (the overview’s and the releases page’s).",
  },
  {
    name: "--layout-toolbar-height",
    role: "The immersive stages’ slim toolbar height, shared by the bar and the pages that reserve room beneath it.",
  },
  {
    name: "--layout-stage-clearance",
    role: "The room a stage keeps clear under its floating toolbar.",
  },
  {
    name: "--layout-stage-bottom-clearance",
    role: "The room a stage keeps clear above its bottom control bar.",
  },
  {
    name: "--layout-anchor-clearance",
    role: "How far below the viewport top an anchor target comes to rest, clear of the sticky header and its blur.",
  },
  {
    name: "--layout-viewport-height",
    role: "What one viewport tall means to a page, so a section that fills the first screen behaves inside an embedding frame too.",
  },
  {
    name: "--layout-chat-width",
    role: "The docked chat panel’s resting width, which its widen grip can grow.",
  },
  {
    name: "--layout-chat-float-height",
    role: "The floating chat card’s resting height.",
  },
  {
    name: "--layout-chat-inset",
    role: "The gap the chat panel and its button keep from the viewport edges.",
  },
  {
    name: "--layout-shell-inset",
    role: "The gap around the inset layout’s content surface and its docked assistant.",
  },
];
