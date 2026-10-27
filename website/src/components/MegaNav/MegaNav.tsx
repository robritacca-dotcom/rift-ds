"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SiteHeader, type SiteHeaderSection } from "rift-ds/components/SiteHeader/SiteHeader";
import { CommandPaletteTrigger } from "rift-ds/components/CommandPaletteTrigger/CommandPaletteTrigger";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import BrandSwitcher from "../BrandSwitcher/BrandSwitcher";
import { openSitePalette } from "../SitePalette/palette-bus";
import { getNavSections } from "@/config/navigation";
import { ShowcaseCover } from "./ShowcaseCover";
import SiteLogo from "./SiteLogo";
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
      actions={
        // Opens the global palette mounted from the root layout; the two
        // trees never meet, so the click travels via palette-bus.
        <CommandPaletteTrigger className={styles.searchBtn} onClick={openSitePalette} />
      }
      wideActions={
        <>
          <BrandSwitcher />
          <ThemeToggle />
        </>
      }
      drawerFooter={
        // The drawer serves every width the pills leave, so it carries both
        // selectors: look, then light and dark. The look menu opens upward,
        // since the row sits on the drawer floor.
        <div className={styles.drawerFooter}>
          <BrandSwitcher placement="up" align="left" />
          <ThemeToggle />
        </div>
      }
      drawerOpen={menuOpen}
      onDrawerOpenChange={setMenuOpen}
    />
  );
}
