"use client";

/**
 * The phone-app dressing a template wears in a Mobile preview (the
 * templates carousel's Mobile mode, or the playground's Mobile stage): an iOS large-title TopAppBar where the web top bar was, and
 * a floating glass BottomNav built from the template's own nav, with the
 * assistant on its search circle, and a menu button opening a full-screen
 * drawer with the whole sidebar as a NavStack (its entity switcher, every
 * destination drilling in as the rail's phone drawer does, the profile), so nothing the rail carries is out of reach on the phone. It
 * is the mobile dashboard's chrome, so every template previews as an app
 * rather than a narrow website. The preview's frame is the phone's screen,
 * so the Drawer's portal covers exactly the phone, with none of the mobile
 * dashboard's scaling.
 *
 * Only a Mobile preview asks for it. The carousel and the playground mark
 * a Mobile preview's frame with `data-app-frame` on the root element
 * (same-origin, the way the playground stages a product name), and a
 * template reads it through useAppFrame. A narrowed Desktop stage never
 * sets it, since a narrow window is not a phone. At its own route the attribute never exists, so the full
 * template page is untouched at every width.
 */

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { TopAppBar } from "rift-ds/components/TopAppBar/TopAppBar";
import { Avatar } from "rift-ds/components/Avatar/Avatar";
import { Drawer } from "rift-ds/components/Drawer/Drawer";
import { NavStack, type NavStackEntry, type NavStackItem } from "rift-ds/components/NavStack/NavStack";
import {
  BottomNav,
  type BottomNavItem,
} from "rift-ds/components/BottomNav/BottomNav";
import type { AppSidebarProfile, AppSidebarSection, AppSidebarSubItem } from "rift-ds/components/AppSidebar/AppSidebar";
import styles from "./AppFrame.module.css";

const ATTR = "data-app-frame";

const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: [ATTR],
  });
  return () => observer.disconnect();
};

/** Whether the carousel is previewing this template as a phone app. */
export function useAppFrame(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => document.documentElement.hasAttribute(ATTR),
    () => false,
  );
}

export const APP_FRAME_ATTR = ATTR;

/* BottomNav takes three to five destinations; four leaves room for the
   assistant's circle beside the capsule, as on the mobile dashboard. */
const TAB_COUNT = 4;

/** The tab bar's destinations: the sidebar's first items, the current
    page always among them. */
function tabsFrom(
  sections: AppSidebarSection[],
  activeKey: string,
): BottomNavItem[] {
  const items = sections.flatMap((section) => section.items);
  const tabs = items.slice(0, TAB_COUNT);
  if (!tabs.some((item) => item.key === activeKey)) {
    const active = items.find((item) => item.key === activeKey);
    if (active) tabs[TAB_COUNT - 1] = active;
  }
  return tabs.map(({ key, label, icon, badge }) => ({
    key,
    label,
    icon,
    badge,
  }));
}

/** What the menu drawer holds: the rail's contents, in phone form. */
export type AppFrameMenu = {
  /** The drawer's title: the product's name. */
  title: string;
  sections: AppSidebarSection[];
  activeKey: string;
  profile?: AppSidebarProfile;
  /** Rows above the destinations, as the rail draws its switcher under the brand: the entity switcher as a row that drills into its choices. */
  topEntries?: NavStackEntry[];
};

/* The rail's sections as the drawer's levels, the way AppSidebar's own
   phone drawer draws them: each section under its heading, a row with
   children drilling into them, a choice keeping the drawer open, and a
   demo destination a hash, as the rail's are. */
const subRow = (sub: AppSidebarSubItem): NavStackItem => ({
  id: sub.key,
  label: sub.label,
  description: sub.description,
  icon: sub.icon,
  badge: sub.badge,
  ...(sub.children?.length
    ? { items: sub.children.map(subRow) }
    : sub.selected !== undefined
      ? { selected: sub.selected, onClick: () => sub.onClick?.() }
      : { href: sub.href ?? `#${sub.key}` }),
});

const menuEntries = (menu: AppFrameMenu): NavStackEntry[] => [
  ...(menu.topEntries ?? []),
  ...menu.sections.map((section, index) => ({
    type: "section" as const,
    id: `section-${index}`,
    label: section.category,
    items: section.items.map((item): NavStackItem => ({
      id: item.key,
      label: item.label,
      icon: item.icon,
      badge: item.badge,
      value: item.value,
      current: item.key === menu.activeKey || undefined,
      ...(item.children?.length ? { items: item.children.map(subRow) } : { href: `#${item.key}` }),
    })),
  })),
];

/** The menu drawer: a full-screen sheet over the phone, the levels drilling in, the profile at the foot. */
function AppFrameMenuDrawer({ menu, open, onOpenChange }: { menu: AppFrameMenu; open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={menu.title}
      side="left"
      size="sm"
      className={styles.menuDrawer}
      footer={
        menu.profile && (
          <div className={styles.menuProfile}>
            <Avatar name={menu.profile.name} size="md" />
            <span className={styles.menuProfileText}>
              <span className={styles.menuProfileName}>{menu.profile.name}</span>
              {menu.profile.email && <span className={styles.menuProfileEmail}>{menu.profile.email}</span>}
            </span>
          </div>
        )
      }
    >
      <NavStack
        items={menuEntries(menu)}
        currentHref={`#${menu.activeKey}`}
        navLabel={menu.title}
        onNavigate={(_item, event) => {
          event.preventDefault();
          // A destination closes the menu, as the mobile dashboard's does.
          onOpenChange(false);
        }}
      />
    </Drawer>
  );
}

/** The screen's header in app form: the large iOS title over the content, with the menu button when there is a menu. */
export function AppFrameHeader({
  title,
  subtitle,
  menu,
}: {
  title: string;
  subtitle?: string;
  menu?: AppFrameMenu;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
    <TopAppBar
      platform="ios"
      size="large"
      title={title}
      subtitle={subtitle}
      navigation={menu ? "menu" : undefined}
      onNavigate={menu ? () => setMenuOpen(true) : undefined}
      className={styles.header}
      actions={[
        {
          key: "notifications",
          icon: "notifications",
          label: "Notifications",
          badge: true,
        },
      ]}
    />
    {menu && <AppFrameMenuDrawer menu={menu} open={menuOpen} onOpenChange={setMenuOpen} />}
    </>
  );
}

/**
 * The screen column in app form: the header over the template's own main
 * column. Off, it renders the main column alone, so a template wraps its
 * `<main>` in it once and keeps one tree for both modes.
 */
export function AppFrameScreen({
  enabled,
  title,
  subtitle,
  menu,
  children,
}: {
  enabled: boolean;
  title: string;
  subtitle?: string;
  menu?: AppFrameMenu;
  children: ReactNode;
}) {
  if (!enabled) return <>{children}</>;
  return (
    <div className={styles.screen}>
      <AppFrameHeader title={title} subtitle={subtitle} menu={menu} />
      {children}
    </div>
  );
}

/** The floating tab bar: the sidebar's destinations, the assistant beside them on a screen that has one. */
export function AppFrameTabBar({
  sections,
  activeKey,
  productName,
  onAsk,
}: {
  sections: AppSidebarSection[];
  activeKey: string;
  productName: string;
  onAsk?: () => void;
}) {
  return (
    <div className={styles.tabBar}>
      <BottomNav
        platform="ios"
        items={tabsFrom(sections, activeKey)}
        activeKey={activeKey}
        search={
          onAsk && {
            label: `Ask ${productName} AI`,
            icon: "auto_awesome",
            onClick: onAsk,
          }
        }
        aria-label={productName}
      />
    </div>
  );
}
