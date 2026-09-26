"use client";

import Link from "next/link";
import type { MouseEvent as ReactMouseEvent } from "react";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import BrandSwitcher from "../BrandSwitcher/BrandSwitcher";
import { openSitePalette } from "../SitePalette/palette-bus";
import { Kbd } from "rift-ds/components/Kbd/Kbd";
import { getNavSections } from "@/config/navigation";
import MegaPanel from "./MegaPanel";
import SiteLogo from "./SiteLogo";
import styles from "./MegaNav.module.css";

/** The input-dressed button that opens the global command palette. */
function SearchButton({ tabIndex }: { tabIndex?: number }) {
  return (
    // Opens the global palette mounted from the root layout — the two trees
    // never meet, so the click travels via palette-bus.
    <button
      type="button"
      className={styles.searchBtn}
      onClick={openSitePalette}
      aria-label="Search or ask anything"
      aria-keyshortcuts="Meta+K"
      tabIndex={tabIndex}
    >
      <span className="material-symbols-rounded" aria-hidden="true">
        search
      </span>
      <span className={styles.searchLabel} aria-hidden="true">
        Search or ask anything
      </span>
      <span className={styles.searchKeys} aria-hidden="true">
        <Kbd size="compact">⌘</Kbd>
        <Kbd size="compact">K</Kbd>
      </span>
    </button>
  );
}

export interface HeaderBarProps {
  pathname: string;
  /** The open section's id (null: no panel) — one shared state across both bars. */
  openId: string | null;
  /**
   * False while this bar is hidden behind the other one: its links leave the
   * tab order and its mega panel ignores the pointer, so the visible bar's
   * twin never catches focus or clicks.
   */
  tabbable: boolean;
  /** The sticky overlay bar — distinct panel id and nav landmark label. */
  sticky?: boolean;
  mobileOpen: boolean;
  onMegaEnter: (id: string) => void;
  onMegaLeave: () => void;
  /** A click on a trigger navigates, so the panel closes underneath it. */
  onMegaClose: () => void;
  onMobileToggle: (e: ReactMouseEvent<HTMLButtonElement>) => void;
}

/**
 * One header bar — logo, one trigger per nav section, search, theme toggle,
 * hamburger, and a single anchored mega panel whose content is the open
 * section's groups. Rendered twice by MegaNav: once in flow and once inside
 * the sticky overlay, differing only in the props above.
 */
export default function HeaderBar({
  pathname,
  openId,
  tabbable,
  sticky = false,
  mobileOpen,
  onMegaEnter,
  onMegaLeave,
  onMegaClose,
  onMobileToggle,
}: HeaderBarProps) {
  const megaId = sticky ? "nav-mega-sticky" : "nav-mega";
  const linkTab = tabbable ? undefined : -1;
  const sections = getNavSections();
  const openSection = sections.find((s) => s.id === openId && s.mega) ?? null;

  return (
    <div className={styles.headerInner}>
      <div className={styles.logoSlot}>
        <SiteLogo tabIndex={linkTab} />
      </div>

      <div className={styles.navCenter}>
        <nav className={styles.nav} aria-label={sticky ? "Primary (sticky)" : "Primary"}>
          {sections.map((section) => {
            const active = section.isActive(pathname);
            const open = openId === section.id;

            // A section without a mega is a plain pill: no caret, no popup
            // semantics — a hover just lets any open panel's close timer run.
            if (!section.mega) {
              return (
                <Link
                  key={section.id}
                  href={section.href}
                  className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
                  onClick={onMegaClose}
                  tabIndex={linkTab}
                  aria-current={active ? "page" : undefined}
                >
                  {section.label}
                </Link>
              );
            }

            return (
              <div
                key={section.id}
                className={styles.dsWrap}
                onMouseEnter={() => onMegaEnter(section.id)}
                onMouseLeave={onMegaLeave}
              >
                {/* The trigger is a link: hover or focus opens the section's
                    panel, a click lands on the section's landing page. */}
                <Link
                  href={section.href}
                  data-mega-trigger={section.id}
                  data-bar={sticky ? "sticky" : "flow"}
                  className={`${styles.navLink} ${styles.dsTrigger} ${
                    open ? styles.navLinkOpen : ""
                  } ${active ? styles.navLinkActive : ""}`}
                  aria-expanded={open}
                  aria-haspopup="true"
                  aria-controls={megaId}
                  onFocus={() => onMegaEnter(section.id)}
                  onClick={onMegaClose}
                  tabIndex={linkTab}
                >
                  <span>{section.label}</span>
                  <span
                    className={`${styles.caret} ${open ? styles.caretOpen : ""} material-symbols-rounded`}
                    aria-hidden="true"
                  >
                    expand_more
                  </span>
                </Link>
              </div>
            );
          })}
        </nav>
      </div>

      <div className={styles.rightSlot}>
        <SearchButton tabIndex={linkTab} />
        <BrandSwitcher className={styles.desktopBrandSwitcher} />
        <ThemeToggle className={styles.desktopThemeToggle} />
        <button
          type="button"
          className={`${styles.mobileMenuBtn} ${mobileOpen ? styles.mobileMenuBtnHidden : ""}`}
          onClick={onMobileToggle}
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          tabIndex={linkTab}
        >
          <span className="material-symbols-rounded" aria-hidden="true">
            menu
          </span>
        </button>
      </div>

      {/* MEGA MENU — one panel, its content the open section's grid. Inside
          headerInner so the panel anchors to the content box, not the header:
          the sticky bar is full viewport width and carries its gutters as
          padding, which absolute positioning ignores (see .headerInner). */}
      <div
        id={megaId}
        className={`${styles.mega} ${openSection ? styles.megaOpen : ""}`}
        style={!tabbable ? { pointerEvents: "none" } : undefined}
        onMouseEnter={() => openId && onMegaEnter(openId)}
        onMouseLeave={onMegaLeave}
        aria-hidden={!openSection}
      >
        {openSection?.mega && (
          <MegaPanel
            groups={openSection.mega.groups}
            showcase={openSection.mega.showcase}
            pathname={pathname}
            tabbable={!!openSection && tabbable}
          />
        )}
      </div>
    </div>
  );
}
