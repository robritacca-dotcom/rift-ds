/**
 * What each of the site's `--layout-*` custom properties is for.
 *
 * The values live in website/src/app/globals.css and nowhere else:
 * /foundations/layout reads them from the stylesheet at build time
 * (lib/layout-source.ts), so this list holds only the words. The
 * properties are the site's page shell, not the package's, which is why
 * they sit in the site's stylesheet rather than the token files.
 * scripts/validate-foundation-mirrors.mjs holds this list to the
 * stylesheet in both directions, so a new property cannot ship without a
 * description, and a removed one cannot linger here.
 *
 * `shell` marks the three the page draws as its shell diagram; the rest
 * cannot be drawn usefully and go in its table.
 */

export interface LayoutProperty {
  /** The custom property, as declared in globals.css. */
  name: string;
  /** What it sizes, in a sentence. */
  role: string;
  /** Drawn in the shell diagram rather than listed in the table. */
  shell?: boolean;
}

export const LAYOUT_PROPERTIES: readonly LayoutProperty[] = [
  {
    name: "--layout-sidebar-width",
    role: "The left navigation rail’s width.",
    shell: true,
  },
  {
    name: "--layout-column-gap",
    role: "The gap between the shell’s columns.",
    shell: true,
  },
  {
    name: "--layout-rail-width",
    role: "The right details rail’s width.",
    shell: true,
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
];
