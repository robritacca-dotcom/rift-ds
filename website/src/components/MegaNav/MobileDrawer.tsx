"use client";

import type { CSSProperties } from "react";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import { NavList, type NavListItem } from "@robr0/design-system/components/NavList/NavList";
import SiteLogo from "./SiteLogo";
import styles from "./MegaNav.module.css";

/**
 * The full-screen mobile menu: scrim, pinned close button, and the drawer
 * holding the site tree as a NavList. State lives in MegaNav — the drawer
 * only renders it and reports closes.
 */
export default function MobileDrawer({
  open,
  stuck,
  closeTop,
  pathname,
  items,
  expandedSection,
  onExpandedChange,
  onClose,
}: {
  open: boolean;
  /** Frozen at open: whether the header was stuck when the drawer opened. */
  stuck: boolean;
  /** Frozen at open: where the tapped menu button sat, so the X pins to it. */
  closeTop: number | null;
  pathname: string;
  items: NavListItem[];
  /** The one expanded accordion section, or null for all closed. */
  expandedSection: string | null;
  onExpandedChange: (section: string | null) => void;
  onClose: () => void;
}) {
  return (
    <div
      className={`${styles.mobileMenuOverlay} ${open ? styles.mobileMenuOverlayOpen : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-hidden={!open}
      style={
        closeTop != null
          ? ({ "--mn-close-top": `${closeTop}px` } as CSSProperties)
          : undefined
      }
    >
      <button
        type="button"
        className={styles.mobileMenuClose}
        onClick={onClose}
        aria-label="Close menu"
      >
        <span className="material-symbols-rounded" aria-hidden="true">
          close
        </span>
      </button>
      <div className={`${styles.mobileMenu} ${stuck ? styles.mobileMenuStuck : ""}`}>
        <SiteLogo className={styles.mobileMenuLogo} onClick={onClose} />
        <nav className={styles.mobileMenuNav} aria-label="Mobile navigation">
          <NavList
            items={items}
            currentHref={pathname}
            expandedIds={expandedSection ? [expandedSection] : []}
            onExpandedChange={(ids) => onExpandedChange(ids[0] ?? null)}
            onNavigate={onClose}
          />
        </nav>
        <div className={styles.mobileThemeToggle}>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
