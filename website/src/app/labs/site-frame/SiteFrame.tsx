"use client";

/**
 * The site frame lab: three of the site's own pages (the home page, the
 * components index and the Button page) in SiteFrame, the site's chrome as
 * the library's SiteLayout (website/src/components/SiteFrame), with a lever
 * panel over SiteFrameSettings (website/src/config/site-frame.ts), to pick
 * the settings before any live page moves. The articles are the real
 * pages' own, imported unchanged, so what differs is the frame alone. The
 * panel starts at the site's settings and persists across the three pages,
 * because this layout never remounts.
 *
 * Chromeless (src/config/chromeless.ts), so the root layout's own site
 * frame and chat button stand down and this lab brings its own frame; the
 * lab mounts the site's chat launcher, which a chromeless route hides.
 */

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import { ChatLauncher } from "rift-ds/chat";
import { useSiteWidgetProps } from "@/components/SiteChat/useSiteWidgetProps";
import { ASSISTANT_NAME } from "@/config/brand.generated";
import SiteFrame, { type SiteFrameNav } from "@/components/SiteFrame/SiteFrame";
import { componentsSidebarGroups } from "@/config/navigation";
import { SITE_FRAME, type SiteFrameSettings } from "@/config/site-frame";
import { setSiteFrameLayout, useSiteFrameLayout } from "@/lib/siteFrameLayout";
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

/** The components section's pages, pointed at their lab copies where the lab has one. */
const NAV: SiteFrameNav = {
  links: [{ href: labHref("/components"), label: "Components overview" }],
  groups: componentsSidebarGroups.map((group) => ({
    ...group,
    links: group.links.map((link) => ({ ...link, href: labHref(link.href) })),
  })),
};

export default function SiteFrameLab({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? BASE;
  const kind = pathname === BASE ? "home" : pathname === `${BASE}/components` ? "index" : "sub";

  // The frame and its contained size are the reader's layout pick, shared
  // with the header's layout switcher; the other levers are the lab's own.
  const [own, setOwn] = useState<SiteFrameSettings>(SITE_FRAME);
  const layout = useSiteFrameLayout();
  const settings: SiteFrameSettings = { ...own, ...layout };
  const set = <K extends keyof SiteFrameSettings>(key: K) => (value: SiteFrameSettings[K]) => {
    if (key === "sidebarDock" || key === "containedWidth") setSiteFrameLayout({ [key]: value });
    else setOwn((current) => ({ ...current, [key]: value }));
  };
  const { width, containedWidth, sidebarDock: dock, asidePlacement, sidebar: sidebarKind } = settings;
  // null until the reader toggles it: open on a wide window and folded below
  // 1440px by CSS (SiteFrame.module.css), where the open panel would cover
  // the page it is tuning. Decided in CSS so the server and the client agree.
  const [panelOpen, setPanelOpen] = useState<boolean | null>(null);
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

  return (
    <>
      <SiteFrame
        nav={kind === "home" ? undefined : NAV}
        currentHref={pathname}
        onThisPage={kind === "sub"}
        settings={settings}
      >
        {children}
      </SiteFrame>

      <aside className={styles.panel} aria-label="Site frame levers" data-state={panelOpen === null ? "auto" : panelOpen ? "open" : "closed"}>
        <button type="button" className={styles.panelToggle} onClick={() => setPanelOpen((open) => !(open ?? window.innerWidth >= 1440))} aria-expanded={panelOpen !== false}>
          <span className="material-symbols-rounded" aria-hidden="true">tune</span>
          Site frame lab
        </button>
        {panelOpen !== false && (
          <div className={styles.panelBody}>
            <nav className={styles.pageLinks} aria-label="Lab pages">
              {PAGES.map((page) => (
                <Link key={page.href} href={page.href} className={styles.pageLink} aria-current={page.href === pathname ? "page" : undefined}>
                  {page.label}
                </Link>
              ))}
            </nav>
            <Lever label="Page width" value={width} onChange={set("width")} options={[["contained", "Contained"], ["full", "Full"]]} />
            <Lever
              label="Contained size"
              value={containedWidth}
              onChange={set("containedWidth")}
              options={[["narrow", "Narrow"], ["default", "Default"], ["wide", "Wide"]]}
              disabled={width === "full"}
            />
            <p className={styles.note}>{widthNote}</p>
            <Lever label="Frame: header, sidebar, footer" value={dock} onChange={set("sidebarDock")} options={[["content", "Contained"], ["edge", "Edge to edge"]]} />
            <Lever label="Sidebar" value={sidebarKind} onChange={set("sidebar")} options={[["site", "Site's own"], ["navlist", "NavList"]]} />
            <Lever label="On this page" value={asidePlacement} onChange={set("asidePlacement")} options={[["edge", "Floating"], ["column", "Column"]]} />
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
