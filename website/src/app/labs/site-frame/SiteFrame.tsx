"use client";

/**
 * The site frame lab: three of the site's own pages (the home page, the
 * components index and the Button page) hosted in the library's SiteLayout
 * rather than the frame each page draws by hand (MegaNav, ComponentsSidebar,
 * a .dsLayout row and a main). The articles are the real pages' own,
 * imported unchanged, so what differs is the frame alone.
 *
 * The real header (MegaNav) fills the header slot and the real footer the
 * footer slot. The sidebar slot holds either the site's own Sidebar or the
 * library's NavList, so the two can be compared in place; the aside is the
 * library's AnchorNav reading the article's headings, on the sub page only,
 * as the site's floating rail is. The lever panel sets every SiteLayout lever
 * and persists across the three pages, because this layout never remounts.
 *
 * Chromeless (src/config/chromeless.ts), so the root layout's footer,
 * anchor rail and chat button stand down and the frame brings its own; the
 * header's Ask button still opens the site chat.
 */

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SiteLayout } from "rift-ds/components/SiteLayout/SiteLayout";
import { NavList, type NavListEntry } from "rift-ds/components/NavList/NavList";
import { AnchorNav } from "rift-ds/components/AnchorNav/AnchorNav";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import { ChatLauncher } from "rift-ds/chat";
import { useSiteWidgetProps } from "@/components/SiteChat/useSiteWidgetProps";
import { ASSISTANT_NAME } from "@/config/brand.generated";
import MegaNav from "@/components/MegaNav/MegaNav";
import Sidebar from "@/components/Sidebar/Sidebar";
import SiteFooter from "@/components/SiteFooter/SiteFooter";
import { componentsSidebarGroups } from "@/config/navigation";
import styles from "./SiteFrame.module.css";

const BASE = "/labs/site-frame";
const PAGES = [
  { href: BASE, label: "Home" },
  { href: `${BASE}/components`, label: "Index" },
  { href: `${BASE}/components/button`, label: "Sub page" },
] as const;

/** A real site path, pointed at its lab copy where the lab has one. */
const labHref = (href: string) =>
  href === "/components" ? `${BASE}/components` : href === "/components/button" ? `${BASE}/components/button` : href;

const NAV: NavListEntry[] = [
  { label: "Components overview", href: labHref("/components") },
  ...componentsSidebarGroups.map((group) => ({
    type: "section" as const,
    id: group.id,
    label: group.label,
    items: group.links.map((link) => ({ label: link.label, href: labHref(link.href) })),
  })),
];

type Width = "contained" | "full";

export default function SiteFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? BASE;
  const kind = pathname === BASE ? "home" : pathname === `${BASE}/components` ? "index" : "sub";

  const [width, setWidth] = useState<Width>("contained");
  const [containedWidth, setContainedWidth] = useState<"narrow" | "default" | "wide">("default");
  const [dock, setDock] = useState<"content" | "edge">("content");
  const [asidePlacement, setAsidePlacement] = useState<"edge" | "column">("edge");
  const [sidebarKind, setSidebarKind] = useState<"site" | "navlist">("site");
  const [panelOpen, setPanelOpen] = useState(true);
  // The site's chat launcher stands down on a chromeless route, panel and
  // all, so the lab mounts the same launcher with the site's own settings:
  // the floating button, the dock and the header's Ask button all work.
  const chatWidget = useSiteWidgetProps();

  // The window's width, so the panel can say when a contained step is wider
  // than the window and so draws the same page as full.
  const [windowWidth, setWindowWidth] = useState(0);
  useEffect(() => {
    const read = () => setWindowWidth(window.innerWidth);
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);
  const step = { narrow: 1200, default: 1440, wide: 1680 }[containedWidth];
  const widthNote =
    width === "full"
      ? "Full width: the contained size waits for Contained."
      : windowWidth && windowWidth <= step
        ? `Window ${windowWidth}px: narrower than the ${step}px step, so it draws the same as full. Widen the window or pick a smaller step.`
        : `Window ${windowWidth}px: the page caps at ${step}px.`;

  const siteSidebar = (
    <Sidebar
      links={[{ href: labHref("/components"), label: "Components overview", active: pathname === `${BASE}/components` || undefined }]}
      groups={componentsSidebarGroups.map((group) => ({
        ...group,
        links: group.links.map((link) => ({
          ...link,
          href: labHref(link.href),
          active: labHref(link.href) === pathname || undefined,
        })),
      }))}
    />
  );
  const sidebar =
    kind === "home" ? undefined : sidebarKind === "site" ? (
      <div className={styles.siteSidebar}>{siteSidebar}</div>
    ) : (
      <NavList items={NAV} size="compact" scrollable currentHref={pathname} />
    );

  return (
    <>
      <SiteLayout
        className={styles.frame}
        width={width}
        containedWidth={containedWidth}
        sidebarDock={dock}
        asidePlacement={asidePlacement}
        mainId="lab-main"
        header={<MegaNav />}
        sidebar={sidebar}
        aside={
          kind === "sub" ? (
            <AnchorNav
              fromHeadings={{ root: "#lab-main", selector: "h2" }}
              variant={asidePlacement === "edge" ? "floating" : "list"}
            />
          ) : undefined
        }
        footer={<SiteFooter />}
      >
        {children}
      </SiteLayout>

      <aside className={styles.panel} aria-label="Site frame levers" data-open={panelOpen || undefined}>
        <button type="button" className={styles.panelToggle} onClick={() => setPanelOpen((open) => !open)} aria-expanded={panelOpen}>
          <span className="material-symbols-rounded" aria-hidden="true">tune</span>
          Site frame lab
        </button>
        {panelOpen && (
          <div className={styles.panelBody}>
            <nav className={styles.pageLinks} aria-label="Lab pages">
              {PAGES.map((page) => (
                <Link key={page.href} href={page.href} className={styles.pageLink} aria-current={page.href === pathname ? "page" : undefined}>
                  {page.label}
                </Link>
              ))}
            </nav>
            <Lever label="Page width" value={width} onChange={setWidth} options={[["contained", "Contained"], ["full", "Full"]]} />
            <Lever
              label="Contained size"
              value={containedWidth}
              onChange={setContainedWidth}
              options={[["narrow", "Narrow"], ["default", "Default"], ["wide", "Wide"]]}
              disabled={width === "full"}
            />
            <p className={styles.note}>{widthNote}</p>
            <Lever label="Frame: header, sidebar, footer" value={dock} onChange={setDock} options={[["content", "Contained"], ["edge", "Edge to edge"]]} />
            <Lever label="Sidebar" value={sidebarKind} onChange={setSidebarKind} options={[["site", "Site's own"], ["navlist", "NavList"]]} />
            <Lever label="On this page" value={asidePlacement} onChange={setAsidePlacement} options={[["edge", "Floating"], ["column", "Column"]]} />
          </div>
        )}
      </aside>

      <ChatLauncher label={`Ask ${ASSISTANT_NAME}`} panelLabel="Site chat" widget={chatWidget} />
    </>
  );
}

function Lever<T extends string>({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: [T, string][];
  disabled?: boolean;
}) {
  return (
    <div className={styles.lever}>
      <span className={styles.leverLabel}>{label}</span>
      <SegmentedControl
        size="compact"
        fullWidth
        aria-label={label}
        value={value}
        onValueChange={(next) => onChange(next as T)}
        segments={options.map(([v, l]) => ({ value: v, label: l, disabled }))}
      />
    </div>
  );
}
