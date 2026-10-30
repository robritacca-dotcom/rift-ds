"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SiteHeader, type SiteHeaderSection } from "rift-ds/components/SiteHeader/SiteHeader";
import { CommandPaletteTrigger } from "rift-ds/components/CommandPaletteTrigger/CommandPaletteTrigger";
import { AiButton } from "rift-ds/components/AiButton/AiButton";
import { useChatWidget } from "rift-ds/chat";
import { ASSISTANT_NAME } from "@/config/brand.generated";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import BrandSwitcher from "../BrandSwitcher/BrandSwitcher";
import { openSitePalette } from "../SitePalette/palette-bus";
import { getNavSections } from "@/config/navigation";
import { ShowcaseCover } from "./ShowcaseCover";
import SiteLogo from "./SiteLogo";
import GetStartedSplit from "./GetStartedSplit";
import styles from "./MegaNav.module.css";

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
                cover: <ShowcaseCover graphic={showcase.graphic} />,
              },
            },
            // Pages that need a pointer and a wide screen stay out of the
            // drawer, which only narrow screens see.
            drawerItems: items.filter((item) => !item.desktopOnly),
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
      label=""
      aria-label={`Ask ${ASSISTANT_NAME}`}
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
      // Each action set opens the global palette mounted from the root
      // layout; the two trees never meet, so the click travels via
      // palette-bus. The condensed set is the same controls in their
      // narrower forms, which the header swaps in before the pills fold.
      actions={
        <>
          <CommandPaletteTrigger size="compact" className={styles.searchBtn} onClick={openSitePalette} />
          {chatButton}
          <BrandSwitcher size="compact" className={styles.barOnly} />
          <ThemeToggle size="compact" className={styles.barOnly} />
        </>
      }
      condensedActions={
        <>
          <CommandPaletteTrigger size="compact" iconOnly onClick={openSitePalette} />
          {chatButton}
          <BrandSwitcher size="compact" className={styles.barOnly} />
          <ThemeToggle size="compact" cycle className={styles.barOnly} />
        </>
      }
      wideActions={<GetStartedSplit />}
      drawerFooter={
        // The drawer floor carries Get started, which folds with the pills,
        // and at phone widths the look and mode controls the bar gives up,
        // stacked in the bar's order. The look menu opens upward, since the
        // stack sits on the drawer floor.
        <div className={styles.drawerFooter}>
          <BrandSwitcher size="compact" placement="up" align="left" className={styles.drawerOnly} />
          <ThemeToggle size="compact" className={styles.drawerOnly} />
          <GetStartedSplit onNavigate={() => setMenuOpen(false)} />
        </div>
      }
      drawerOpen={menuOpen}
      onDrawerOpenChange={setMenuOpen}
    />
  );
}
