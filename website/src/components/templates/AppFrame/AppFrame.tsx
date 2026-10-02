"use client";

/**
 * The phone-app dressing a template wears in the templates carousel's
 * Mobile mode: an iOS large-title TopAppBar where the web top bar was, and
 * a floating glass BottomNav built from the template's own nav, with the
 * assistant on its search circle. It is the mobile dashboard's chrome, so
 * every template previews as an app rather than a narrow website.
 *
 * Only the carousel asks for it. The carousel marks a Mobile preview's
 * frame with `data-app-frame` on the root element (same-origin, the way the
 * playground stages a product name), and a template reads it through
 * useAppFrame. At its own route the attribute never exists, so the full
 * template page is untouched at every width.
 */

import { useSyncExternalStore, type ReactNode } from "react";
import { TopAppBar } from "rift-ds/components/TopAppBar/TopAppBar";
import {
  BottomNav,
  type BottomNavItem,
} from "rift-ds/components/BottomNav/BottomNav";
import type { AppSidebarSection } from "rift-ds/components/AppSidebar/AppSidebar";
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

/** The screen's header in app form: the large iOS title over the content. */
export function AppFrameHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <TopAppBar
      platform="ios"
      size="large"
      title={title}
      subtitle={subtitle}
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
  children,
}: {
  enabled: boolean;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  if (!enabled) return <>{children}</>;
  return (
    <div className={styles.screen}>
      <AppFrameHeader title={title} subtitle={subtitle} />
      {children}
    </div>
  );
}

/** The floating tab bar: the sidebar's destinations, the assistant beside them. */
export function AppFrameTabBar({
  sections,
  activeKey,
  productName,
  onAsk,
}: {
  sections: AppSidebarSection[];
  activeKey: string;
  productName: string;
  onAsk: () => void;
}) {
  return (
    <div className={styles.tabBar}>
      <BottomNav
        platform="ios"
        items={tabsFrom(sections, activeKey)}
        activeKey={activeKey}
        search={{
          label: `Ask ${productName} AI`,
          icon: "auto_awesome",
          onClick: onAsk,
        }}
        aria-label={productName}
      />
    </div>
  );
}
