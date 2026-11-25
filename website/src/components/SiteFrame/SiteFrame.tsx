"use client";

/**
 * SiteFrame: the site's chrome as the library's SiteLayout, around every
 * framed page (SiteFrameMount in the root layout). The real header
 * (MegaNav, with the layout switcher this frame enables), a sidebar of the
 * section's pages (the library's SideNav by default, or the site's own
 * Sidebar, by `settings.sidebar`), the page's article, the on-this-page
 * rail (the library's AnchorNav reading the article's h2s) and the real
 * footer, laid out by SiteFrameSettings (website/src/config/site-frame.ts
 * owns them and the route rules).
 *
 * SiteFrame.module.css holds what hosting SiteLayout on this site takes:
 * the header's height, the stretch across the body's padding, the rail's
 * offset for the docked chat and a scroll box for the site's own sidebar
 * that lets its active pill hang. Each is commented there.
 */

import type { ReactNode } from "react";
import { SiteLayout } from "rift-ds/components/SiteLayout/SiteLayout";
import { SideNav, type SideNavEntry } from "rift-ds/components/SideNav/SideNav";
import { AnchorNav } from "rift-ds/components/AnchorNav/AnchorNav";
import MegaNav from "@/components/MegaNav/MegaNav";
import Sidebar, { type SidebarLink, type SidebarLinkGroup } from "@/components/Sidebar/Sidebar";
import SiteFooter from "@/components/SiteFooter/SiteFooter";
import { SITE_FRAME, type SiteFrameSettings } from "@/config/site-frame";
import { useSiteFrameLayout } from "@/lib/siteFrameLayout";
import { SiteFrameContext } from "./context";
import styles from "./SiteFrame.module.css";

/** A section's pages, in the shape both sidebars read. */
export type SiteFrameNav = {
  /** Links above the groups, such as the section's overview. */
  links: SidebarLink[];
  /** The groups of pages. */
  groups: SidebarLinkGroup[];
};

export interface SiteFrameProps {
  /** The page's article. */
  children: ReactNode;
  /** The section's pages for the sidebar; leave it out for a page with none (the home page). */
  nav?: SiteFrameNav;
  /** The current page's path, which the sidebar marks. */
  currentHref: string;
  /** Show the on-this-page rail (a page with sections to jump between). */
  onThisPage?: boolean;
  /**
   * The settings to draw with. Left out, the site's own (SITE_FRAME) with
   * the reader's layout pick (the header's layout switcher) over them.
   */
  settings?: SiteFrameSettings;
  /** The id of the main region, the root layout's skip link target. */
  mainId?: string;
}

const toSideNav = (nav: SiteFrameNav): SideNavEntry[] => [
  ...nav.links.map((link) => ({ label: link.label, href: link.href })),
  ...nav.groups.map((group) => ({
    type: "section" as const,
    id: group.id,
    label: group.label ?? "",
    items: group.links.map((link) => ({ label: link.label, href: link.href })),
  })),
];

export default function SiteFrame({
  children,
  nav,
  currentHref,
  onThisPage = false,
  settings: settingsProp,
  mainId = "main-content",
}: SiteFrameProps) {
  const layout = useSiteFrameLayout();
  const settings = settingsProp ?? { ...SITE_FRAME, ...layout };
  const mark = (link: SidebarLink) => ({ ...link, active: link.href === currentHref || undefined });
  const sidebar = !nav ? undefined : settings.sidebar === "site" ? (
    <div className={styles.siteSidebar}>
      <Sidebar
        links={nav.links.map(mark)}
        groups={nav.groups.map((group) => ({ ...group, links: group.links.map(mark) }))}
      />
    </div>
  ) : (
    <SideNav items={toSideNav(nav)} size="compact" scrollable currentHref={currentHref} />
  );

  return (
    <SiteFrameContext.Provider value>
    <SiteLayout
      className={styles.frame}
      width={settings.width}
      // The narrow step is a reading width for an article beside a sidebar;
      // a page with no sidebar (the home page, privacy, the templates index)
      // keeps the default step's full width in either layout.
      containedWidth={nav ? settings.containedWidth : "default"}
      sidebarDock={settings.sidebarDock}
      asidePlacement={settings.asidePlacement}
      mainId={mainId}
      // The root layout draws the site's skip link, aimed at this main.
      skipLinkLabel=""
      header={<MegaNav />}
      sidebar={sidebar}
      aside={
        onThisPage ? (
          <AnchorNav
            fromHeadings={{ root: `#${mainId}`, selector: "h2" }}
            variant={settings.asidePlacement === "edge" ? "floating" : "list"}
          />
        ) : undefined
      }
      footer={<SiteFooter />}
    >
      {children}
    </SiteLayout>
    </SiteFrameContext.Provider>
  );
}
