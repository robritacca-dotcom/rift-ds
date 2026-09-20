"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Breadcrumb } from "@robr0/design-system/components/Breadcrumb/Breadcrumb";
import { Button } from "@robr0/design-system/components/Button/Button";
import { CircularButton } from "@robr0/design-system/components/CircularButton/CircularButton";
import { Tabs, type Tab } from "@robr0/design-system/components/Tabs/Tabs";
import { Badge } from "@robr0/design-system/components/Badge/Badge";
import { getBreadcrumbs } from "@/config/navigation";
import { buildBreadcrumbJsonLd } from "@/lib/structuredData";
import styles from "./StageToolbar.module.css";

export interface StageToolbarProps {
  /** A name beside the brand mark, for a surface that sits in no section
      and so has no breadcrumb trail to name it. */
  title?: string;
  /** A short status word next to the title ("Alpha"), for a surface
      that is live but not finished. */
  badge?: string;
  /** How the surface is left. "close" is the X, which goes back to
      wherever the visitor came from (or home, opened cold); "home" is a
      labelled way home for a surface reached by its address alone, where
      "back" would usually mean nowhere. */
  exit?: "close" | "home";
  /** Centre view tabs — omit to render a toolbar with no switch. */
  tabs?: Tab[];
  /** The active tab's value. */
  activeTab?: string;
  /** Called with the picked tab's value. */
  onTabChange?: (value: string) => void;
  /** Accessible label for the centre tab list. */
  switchLabel?: string;
  /** Extra controls for the right side, rendered before the exit —
      the hosting page's own toolbar furniture (the inspect-mode switch). */
  actions?: React.ReactNode;
  /** An extra unlinked crumb after the trail, for an overlay within the
      page (an expanded map's name). Left out of the structured data,
      which describes real pages only. */
  append?: string;
  /** Overrides what the X does, for a toolbar heading an in-page overlay
      rather than a route: called instead of any navigation. */
  onExit?: () => void;
}

/**
 * The immersive surfaces' header: a slim floating glass pill carrying the
 * brand mark and breadcrumb trail, an optional centre switch (the hosting
 * page decides what it toggles — views, surfaces), and the X out — a
 * full-screen view's toolbar, not the site's full navigation. Pages
 * beneath reserve --layout-stage-clearance (globals.css) of room for it.
 */
export default function StageToolbar({
  title,
  badge,
  exit = "close",
  tabs,
  activeTab,
  onTabChange,
  switchLabel,
  actions,
  append,
  onExit,
}: StageToolbarProps) {
  const pathname = usePathname() ?? "/";
  const items = getBreadcrumbs(pathname);
  const trail = append ? [...items, { label: append }] : items;

  const router = useRouter();
  /* The X is the way back to wherever the visitor came from; opened cold
     (a shared link), it goes home. An overlay's toolbar closes the
     overlay instead. */
  const leave = () => {
    if (onExit) onExit();
    else if (window.history.length > 2) router.back();
    else router.push("/");
  };

  return (
    <>
      {/* The pill's twin of the control bar's fade: content scrolling up
          under the toolbar dims into the page floor instead of colliding
          with it. */}
      <div className={styles.fade} aria-hidden="true" />
      <header className={styles.toolbar}>
      <div className={styles.trail}>
        <Link href="/" className={styles.logo} aria-label="Home">
          <Image src="/rr.svg" alt="" width={24} height={24} />
        </Link>
        {title && <span className={styles.title}>{title}</span>}
        {badge && <Badge label={badge} variant="info" />}
        {items.length > 0 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(buildBreadcrumbJsonLd(items)),
            }}
          />
        )}
        {trail.length > 0 && (
          /* Phones lose the trail (the logo is the way up); the
             structured data above stays either way. */
          <span className={styles.crumb}>
            <Breadcrumb items={trail} />
          </span>
        )}
      </div>

      {tabs && activeTab && (
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={onTabChange}
          size="compact"
          ariaLabel={switchLabel}
        />
      )}

      <div className={styles.actions}>
        {actions}
        {exit === "home" ? (
          <Button
            href="/"
            variant="tertiary"
            size="compact"
            iconLeft="arrow_back"
            label="Back to home"
          />
        ) : (
          <CircularButton
            icon="close"
            variant="tertiary"
            ariaLabel="Close this view"
            /* The toolbar hugs the viewport's top right corner: a top
               tooltip clips above, and the full label clips right. */
            tooltip="Close"
            tooltipPosition="bottom"
            onClick={leave}
          />
        )}
      </div>
    </header>
    </>
  );
}
