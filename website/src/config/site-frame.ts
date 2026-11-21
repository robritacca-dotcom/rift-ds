/**
 * The site frame: how a page with the site's chrome is laid out once it
 * moves from the frame each page draws by hand (MegaNav, a sidebar, a
 * .dsLayout row and a main) to the library's SiteLayout, through
 * website/src/components/SiteFrame/SiteFrame.tsx.
 *
 * Nothing reads `SITE_FRAME_ENABLED` yet: no live page has moved, and the values below
 * are what the frame draws today's pages with, so moving one is a swap, not
 * a redesign. /labs/site-frame hosts three real pages in the frame with a
 * lever panel over these same settings, to choose them before any page
 * moves. Moving the site is then: pick the settings here, set
 * `SITE_FRAME_ENABLED`,
 * render each chrome-bearing page's article inside SiteFrame instead of its
 * hand-written frame (the Button page's ButtonDocs, the index's
 * ComponentsIndex and the home page's `chrome={false}` are the pattern),
 * and stand down the root layout's footer and anchor rail for the routes
 * that moved, since the frame brings both.
 */

export type SiteFrameSettings = {
  /** How wide the page runs: contained at `containedWidth`, or the window's width. */
  width: "contained" | "full";
  /** The contained width's step: narrow 1200px, default 1440px, wide 1680px. */
  containedWidth: "narrow" | "default" | "wide";
  /**
   * The header, the sidebar and the footer, which move as one: `content`
   * keeps the sidebar beside the article with the header and footer at the
   * page's width; `edge` docks the sidebar to the window's edge and runs
   * the header and footer full width.
   */
  sidebarDock: "content" | "edge";
  /** The on-this-page rail: floating at the window's end edge, or a column. */
  asidePlacement: "edge" | "column";
  /** The sidebar: the site's own pill list, or the library's NavList. */
  sidebar: "site" | "navlist";
};

/** Whether pages render inside SiteFrame. Off: no page has moved. */
export const SITE_FRAME_ENABLED = false;

/**
 * The settings the frame draws with, set to match today's pages. The
 * reader's layout pick (the header's layout switcher, offered only inside
 * the frame; lib/siteFrameLayout.ts holds the presets and the stored pick)
 * overrides `sidebarDock` and `containedWidth`.
 */
export const SITE_FRAME: SiteFrameSettings = {
  width: "contained",
  containedWidth: "default",
  sidebarDock: "content",
  asidePlacement: "edge",
  sidebar: "site",
};
