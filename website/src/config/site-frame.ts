/**
 * The site frame: how every page with the site's chrome is laid out, the
 * library's SiteLayout hosted by website/src/components/SiteFrame and
 * mounted once from the root layout (SiteFrameMount), so the header, the
 * sidebar, the on-this-page rail and the footer persist across navigation
 * while each page renders only its article. A chromeless route
 * (src/config/chromeless.ts) gets none of it.
 *
 * The frame reads everything from config: each route's sidebar is the nav
 * list that holds it (siteFrameNavFor), its rail follows
 * src/config/anchor-nav.ts (siteFrameRailFor), and SITE_FRAME below sets
 * how it lays out, with the reader's layout pick (the header's layout
 * switcher, lib/siteFrameLayout.ts) over the dock and the contained size.
 * /labs/site-frame hosts three pages with a lever panel over every setting.
 */

import { isChromeless } from "./chromeless";
import { ANCHOR_NAV_EXCLUDED_ROUTES, ANCHOR_NAV_SELF_MANAGED_ROUTES } from "./anchor-nav";
import {
  componentsSidebarGroups,
  docsSidebarLinks,
  foundationsSidebarLinks,
  type NavLink,
  type SidebarGroup,
} from "./navigation";

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
  /** The sidebar: the site's own pill list, or the library's SideNav. */
  sidebar: "site" | "navlist";
};

/**
 * The settings the frame draws with: the page contained beside its
 * sidebar, the library's SideNav as the sidebar, the rail floating at the
 * edge. The
 * reader's layout pick (the header's layout switcher, offered only inside
 * the frame; lib/siteFrameLayout.ts holds the presets and the stored pick)
 * overrides `sidebarDock` and `containedWidth`.
 */
export const SITE_FRAME: SiteFrameSettings = {
  width: "contained",
  containedWidth: "default",
  sidebarDock: "content",
  asidePlacement: "edge",
  sidebar: "navlist",
};

/** Whether a route is laid out by the frame: every route with the site's chrome. */
export const isFramed = (pathname: string) => !isChromeless(pathname);

/** A section's pages, in the shape the frame's sidebar reads. */
export type SiteFrameNavSource = {
  /** Links above the groups, such as the section's overview. */
  links: NavLink[];
  /** Titled groups of pages. */
  groups: SidebarGroup[];
  /** The row to mark current, when it is not the route itself (a page under a listed one). */
  current?: string;
};

/**
 * The sidebar for a route: the components section's grouped list under
 * /components, otherwise the flat list (foundations, or the docs cluster)
 * that holds the route, or, for a page under a listed one (a theme's
 * specimen), its parent's list with the parent marked current. A route in
 * no list (the home page, privacy, the templates index) has no sidebar.
 */
export function siteFrameNavFor(pathname: string): SiteFrameNavSource | undefined {
  if (pathname === "/components" || pathname.startsWith("/components/")) {
    return { links: [{ href: "/components", label: "Components overview" }], groups: componentsSidebarGroups };
  }
  const lists = [foundationsSidebarLinks, docsSidebarLinks];
  for (const list of lists) {
    if (list.some((link) => link.href === pathname)) return { links: list, groups: [] };
  }
  // A page under a listed one (a theme's specimen under the themes
  // gallery) takes its parent's section, the parent marked current.
  for (const list of lists) {
    const parent = list
      .filter((link) => pathname.startsWith(`${link.href}/`))
      .sort((a, b) => b.href.length - a.href.length)[0];
    if (parent) return { links: list, groups: [], current: parent.href };
  }
  return undefined;
}

/**
 * Whether a route carries the floating on-this-page rail: every framed
 * route except the doors anchor-nav.ts excludes and the pages that mount
 * their own rail from server-derived items.
 */
export const siteFrameRailFor = (pathname: string) =>
  !ANCHOR_NAV_EXCLUDED_ROUTES.has(pathname) && !ANCHOR_NAV_SELF_MANAGED_ROUTES.has(pathname);

/** The pairing of the dock and the contained size a reader picks between. */
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

/** The preset a layout matches, if it is one. */
export const presetFor = (layout: SiteFrameLayout) =>
  SITE_FRAME_LAYOUTS.find(
    (preset) => preset.layout.sidebarDock === layout.sidebarDock && preset.layout.containedWidth === layout.containedWidth
  );
