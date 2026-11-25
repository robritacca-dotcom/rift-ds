"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SiteHeader, type SiteHeaderSection } from "rift-ds/components/SiteHeader/SiteHeader";
import { CommandPaletteTrigger } from "rift-ds/components/CommandPaletteTrigger/CommandPaletteTrigger";
import { AiButton } from "rift-ds/components/AiButton/AiButton";
import { Button } from "rift-ds/components/Button/Button";
import { preloadChatWidget, useChatWidget, useTakeoverViewport } from "rift-ds/chat";
import { ASSISTANT_NAME } from "@/config/brand.generated";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import BrandSwitcher from "../BrandSwitcher/BrandSwitcher";
import BackgroundSwitcher from "../BackgroundSwitcher/BackgroundSwitcher";
import LayoutSwitcher from "../LayoutSwitcher/LayoutSwitcher";
import { useInSiteFrame } from "../SiteFrame/context";
import { openSitePalette } from "../SitePalette/palette-bus";
import { deferComponent, usePreloadWhenIdle } from "rift-ds/behaviors/deferComponent";
import { getNavSections, type MegaShowcase } from "@/config/navigation";
import SiteLogo from "./SiteLogo";
import GetStartedSplit from "./GetStartedSplit";
import { drawerPages, useDrawerEntries } from "./drawer-menu";
import styles from "./MegaNav.module.css";

/* A closed panel costs nothing: a mega menu's cover is a live drawing (a
   shader scene, theme tiles read from every theme's token values), and the
   header is on every page. It loads once the page is idle, ahead of the
   first hover that could open a menu. */
const DeferredShowcaseCover = deferComponent<{ graphic: MegaShowcase["graphic"] }>(() =>
  import("./ShowcaseCover").then((module) => module.ShowcaseCover),
);

/**
 * The site header: the library's SiteHeader configured with this site's
 * sections, logo, search and theme controls. Everything a header does
 * (sticking over the progressive blur, the mega menus, folding to the
 * drawer on the room the bar has) is the component's; this file only maps
 * the site's nav config onto it and wires the site chrome that lives
 * outside it.
 */
export default function MegaNav() {
  const pathname = usePathname() ?? "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const { setOpen: setChatOpen, returnFocusRef } = useChatWidget();
  // Inside SiteFrame the bar offers the frame's layout switcher.
  const inFrame = useInSiteFrame();
  usePreloadWhenIdle(DeferredShowcaseCover.preload);
  // On a phone the drawer is the whole screen, with room to name what
  // Resources holds; the Appearance rows show at every width.
  const phone = useTakeoverViewport();
  const drawerEntries = useDrawerEntries(phone);

  // A navigation closes the drawer, including one the drawer did not start
  // (the back button). The setState reacts to external navigation, which is
  // what Effects are for.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
  }, [pathname]);

  // The open drawer is flagged on <html>, which is how the chat's launch
  // button knows to get out of the way: it floats above the scrim, and a
  // button for a panel you cannot see is clutter over the menu. An attribute
  // rather than shared state, since the two mount apart and never meet.
  useEffect(() => {
    if (menuOpen) document.documentElement.setAttribute("data-nav-drawer", "open");
    else document.documentElement.removeAttribute("data-nav-drawer");
    return () => document.documentElement.removeAttribute("data-nav-drawer");
  }, [menuOpen]);

  const sections: SiteHeaderSection[] = getNavSections().map((section) => {
    const items = (section.mega?.groups ?? []).flatMap((group) => group.items);
    const showcase = section.mega?.showcase;
    return {
      id: section.id,
      label: section.label,
      href: section.href,
      current: section.isActive(pathname),
      ...(section.mega
        ? {
            mega: {
              items: items.map(({ href, label, description, icon, logo }) => ({
                href,
                label,
                description,
                icon,
                logo,
              })),
              showcase: showcase && {
                href: showcase.href,
                overline: showcase.overline,
                label: showcase.label,
                description: showcase.description,
                cover: (
                  <Suspense fallback={null}>
                    <DeferredShowcaseCover.Component graphic={showcase.graphic} />
                  </Suspense>
                ),
              },
            },
            // Pages that need a pointer and a wide screen stay out of the
            // drawer, which only narrow screens see. A showcase page lifted
            // out of the grid is back in the drawer's list (navigation.ts).
            drawerItems: drawerPages((section.mega.drawerItems ?? items).filter((item) => !item.desktopOnly)),
          }
        : {}),
    };
  });

  // The chat's phone entry point, between search and menu. Below the
  // takeover width the floating launcher stands down (globals.css), because a
  // pill in the corner sits on the page's own controls; this one keeps the
  // AI ring at the bar's size. The look and mode controls beside it stay in
  // the bar after the pills fold, and leave it for the drawer only at phone
  // widths (`barOnly`).
  const chatButton = (
    <AiButton
      className={styles.chatBtn}
      size="compact"
      icon="forum"
      iconOnly
      label={`Ask ${ASSISTANT_NAME}`}
      // The chat's code loads on first open; this button is an opener too,
      // so it starts the load on intent, as the floating one does.
      onPointerEnter={preloadChatWidget}
      onFocus={preloadChatWidget}
      onClick={(event) => {
        returnFocusRef.current = event.currentTarget;
        setChatOpen(true);
      }}
    />
  );

  return (
    <SiteHeader
      className={styles.header}
      brand={<SiteLogo />}
      sections={sections}
      currentHref={pathname}
      // The pills stop fitting a little above the tablet step (about
      // 1070px of viewport, measured), so a server-rendered page folds
      // below it until the bar has measured itself. The wider "mid" step
      // would show the menu button first on every laptop between the two.
      initialFold="tablet"
      // The tint behind the bar arrives on the first pixel of scroll, so
      // page text never slides up under a clear bar first.
      tintAfter={0}
      // Each action set opens the global palette mounted from the root
      // layout; the two trees never meet, so the click travels via
      // palette-bus. The condensed set is the same controls in their
      // narrower forms, which the header swaps in before the pills fold.
      actions={
        <>
          <CommandPaletteTrigger size="compact" className={styles.searchBtn} onClick={openSitePalette} />
          {chatButton}
          <BrandSwitcher size="compact" className={styles.barOnly} />
          {inFrame && <LayoutSwitcher size="compact" className={styles.desktopOnly} />}
          <BackgroundSwitcher size="compact" className={styles.barOnly} />
          <ThemeToggle size="compact" className={styles.barOnly} />
        </>
      }
      condensedActions={
        <>
          <CommandPaletteTrigger size="compact" iconOnly onClick={openSitePalette} />
          {chatButton}
          <BrandSwitcher size="compact" className={styles.barOnly} />
          {inFrame && <LayoutSwitcher size="compact" className={styles.desktopOnly} />}
          <BackgroundSwitcher size="compact" className={styles.barOnly} />
          <ThemeToggle size="compact" menu className={styles.barOnly} />
        </>
      }
      wideActions={<GetStartedSplit />}
      // The drawer opens on search, then the sections, Resources and
      // Appearance, with Get started pinned at its foot in thumb
      // reach. The split button's other ways in are Resources' rows.
      drawerHeader={
        <button
          type="button"
          className={styles.drawerSearch}
          onClick={() => {
            setMenuOpen(false);
            openSitePalette();
          }}
        >
          <span className="material-symbols-rounded" aria-hidden="true">search</span>
          Search the docs
        </button>
      }
      drawerEntries={drawerEntries}
      drawerFooter={
        // The assistant sits over Get started in thumb reach too: the bar's
        // chat circle is the one way in on a phone otherwise, and it sits
        // under the open sheet's header. The menu closes as the chat opens.
        <div className={styles.drawerActions}>
          <AiButton
            className={styles.drawerCta}
            icon="forum"
            label={`Ask ${ASSISTANT_NAME}`}
            onPointerEnter={preloadChatWidget}
            onFocus={preloadChatWidget}
            onClick={() => {
              setMenuOpen(false);
              setChatOpen(true);
            }}
          />
          <Button
            className={styles.drawerCta}
            label="Get started"
            variant="primary"
            href="/docs/get-started"
            onClick={() => setMenuOpen(false)}
          />
        </div>
      }
      drawerOpen={menuOpen}
      onDrawerOpenChange={setMenuOpen}
    />
  );
}
