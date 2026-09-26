"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { usePathname } from "next/navigation";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/scroll-lock";
import { type NavListItem } from "rift-ds/components/NavList/NavList";
import { getNavSections } from "@/config/navigation";
import HeaderBar from "./HeaderBar";
import MobileDrawer from "./MobileDrawer";
import styles from "./MegaNav.module.css";

/** The drawer section (if any) whose sub-list contains the given path. */
const sectionForPath = (path: string): string | null =>
  getNavSections().find((s) => s.isActive(path))?.id ?? null;

/**
 * The site header: the in-flow bar, its sticky twin, the Design system mega
 * panel, and the mobile drawer. This component owns all the state and window
 * wiring; the pieces themselves are HeaderBar (one bar, rendered twice),
 * MegaPanel inside it, SiteLogo, and MobileDrawer.
 */
export default function MegaNav() {
  const pathname = usePathname() ?? "/";
  const [openId, setOpenId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  // Drawer accordions are closed by default; one open at a time.
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isStuck, setIsStuck] = useState(false);
  // The drawer's geometry is frozen at open: the close button pins to where
  // the tapped menu button actually was, and the stuck layout is whatever
  // the header was at that moment. isStuck keeps moving underneath (iOS
  // fires scroll events when the body lock clamps scrollY and when the URL
  // bar resizes), and a live binding made the X jump mid-open.
  const [closeTop, setCloseTop] = useState<number | null>(null);
  const [drawerStuck, setDrawerStuck] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const inFlowHeaderRef = useRef<HTMLElement>(null);

  // The drawer's whole tree, fed to NavList — one row per top-level nav
  // section, its sub-list the section's own mega items (so the drawer and
  // the panels can never disagree). NavList caps at three levels, which is
  // exactly the depth the sections produce.
  const drawerItems: NavListItem[] = getNavSections().map((section) => {
    const subItems = (section.mega?.groups ?? []).flatMap((group) =>
      group.items.map(({ label, href }) => ({ label, href }))
    );
    return {
      label: section.label,
      href: section.href,
      id: section.id,
      current: section.isActive(pathname) || undefined,
      // A megaless section is a plain drawer row, not an empty accordion.
      ...(subItems.length > 0 ? { items: subItems } : {}),
    };
  });

  // Opening the drawer pre-expands the section holding the current page.
  const toggleMobileMenu = (e: ReactMouseEvent<HTMLButtonElement>) => {
    const next = !mobileOpen;
    if (next) {
      setExpandedSection(sectionForPath(pathname));
      // The X replaces the button that was tapped, wherever the scroll has
      // put it — the two static CSS positions only cover a page at rest and
      // a fully stuck header, and between them the hamburger sits anywhere.
      setCloseTop(e.currentTarget.getBoundingClientRect().top);
      setDrawerStuck(isStuck);
    }
    setMobileOpen(next);
  };

  const openMenu = useCallback((id: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenId(id);
  }, []);

  const scheduleClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenId(null), 160);
  }, []);

  const closeMenu = useCallback(() => setOpenId(null), []);

  // Close on click outside — the header root contains both bars and their
  // panels, so one containment check covers everything.
  useEffect(() => {
    if (!openId) return;
    const onClick = (e: MouseEvent) => {
      if (inFlowHeaderRef.current?.contains(e.target as Node)) return;
      setOpenId(null);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [openId]);

  // Close on Escape, returning focus to the open section's visible trigger.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (openId) {
          const trigger = inFlowHeaderRef.current?.querySelector<HTMLElement>(
            `a[data-mega-trigger="${openId}"]:not([tabindex="-1"])`
          );
          setOpenId(null);
          trigger?.focus();
        }
        if (mobileOpen) setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openId, mobileOpen]);

  // Close mega when pathname changes (user navigated via a link).
  // The setState here is intentional — we react to external navigation,
  // which is exactly what Effects are for.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpenId(null);
    setMobileOpen(false);
    setExpandedSection(null);
  }, [pathname]);

  // Toggle the sticky overlay header when the in-flow header scrolls out of view
  useEffect(() => {
    let ticking = false;
    const check = () => {
      const el = inFlowHeaderRef.current;
      if (el) {
        setIsStuck(el.getBoundingClientRect().bottom < 0);
      }
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(check);
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    check();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while mobile menu is open. The counted lock is shared
  // with the chat panel: whichever overlay closes first must not unlock the
  // page while the other still covers it.
  //
  // The same effect flags the open drawer on <html>, which is how the chat's
  // FAB knows to get out of the way — it floats above the scrim, and a launch
  // button for a panel you cannot see is just clutter over the menu. An
  // attribute rather than shared state: the two mount from the root layout
  // and never meet, and the site already drives the header's docked inset
  // this way.
  useEffect(() => {
    if (mobileOpen) {
      lockBodyScroll("mega-nav");
      document.documentElement.setAttribute("data-nav-drawer", "open");
    } else {
      unlockBodyScroll("mega-nav");
      document.documentElement.removeAttribute("data-nav-drawer");
    }
    return () => {
      unlockBodyScroll("mega-nav");
      document.documentElement.removeAttribute("data-nav-drawer");
    };
  }, [mobileOpen]);

  return (
    <header ref={inFlowHeaderRef} className={styles.header}>
      <HeaderBar
        pathname={pathname}
        openId={openId}
        tabbable
        mobileOpen={mobileOpen}
        onMegaEnter={openMenu}
        onMegaLeave={scheduleClose}
        onMegaClose={closeMenu}
        onMobileToggle={toggleMobileMenu}
      />

      {/* STICKY OVERLAY HEADER — slides in when the in-flow header scrolls out of view */}
      <div
        className={`${styles.stickyHeader} ${isStuck ? styles.stickyHeaderVisible : ""}`}
        aria-hidden={!isStuck}
      >
        {/* Tint + progressive blur behind the bar — see .stickyBackdrop */}
        <div className={styles.stickyBackdrop} aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
        <HeaderBar
          sticky
          pathname={pathname}
          openId={openId}
          tabbable={isStuck}
          mobileOpen={mobileOpen}
          onMegaEnter={openMenu}
          onMegaLeave={scheduleClose}
          onMegaClose={closeMenu}
          onMobileToggle={toggleMobileMenu}
        />
      </div>

      <MobileDrawer
        open={mobileOpen}
        stuck={drawerStuck}
        closeTop={closeTop}
        pathname={pathname}
        items={drawerItems}
        expandedSection={expandedSection}
        onExpandedChange={setExpandedSection}
        onClose={() => setMobileOpen(false)}
      />
    </header>
  );
}
