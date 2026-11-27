'use client';

/**
 * The app shell every rift-ds app block page sits in, composed from the
 * library's own shell pieces: AppLayout (its AppSidebar in one of the three
 * app shell modes, SHELL_LAYOUT below, the default the sidebar's Appearance
 * rows start from), an AppToolbar in AppLayout's toolbar slot (the search,
 * the notifications, help, settings and the AI entry), and a PageHeader
 * (breadcrumb, title, actions) over the page. This file is yours: rename the
 * product, change the navigation, and grow it with your app.
 *
 * Everything the shell does comes from those components, so it stays in
 * step with the library: AppLayout pins the toolbar over the page as it
 * scrolls, moves the page over while the sidebar's panel is open, sets the
 * content in a raised surface in the inset mode, and on a phone turns the
 * sidebar into a drawer behind its menu button. The toolbar folds itself by
 * its own width: the AI entry to its icon, then the search, then the icon
 * controls after the first into a More menu.
 */

import { useState, useSyncExternalStore, type ReactNode } from 'react';
import { AppLayout } from 'rift-ds/components/AppLayout/AppLayout';
import type { AppSidebarLayout, AppSidebarProfile, AppSidebarSection } from 'rift-ds/components/AppSidebar/AppSidebar';
import { AppToolbar } from 'rift-ds/components/AppToolbar/AppToolbar';
import type { BreadcrumbItem } from 'rift-ds/components/Breadcrumb/Breadcrumb';
import { NotificationCenter, NotificationItem } from 'rift-ds/components/NotificationCenter/NotificationCenter';
import { PageHeader } from 'rift-ds/components/PageHeader/PageHeader';
import { useColorMode } from 'rift-ds/components/ThemeToggle/useColorMode';
import { BREAKPOINT_MOBILE_PX, mediaBelow } from 'rift-ds/tokens/breakpoints';
import { SHIPPED_THEMES, shippedThemeOptions } from 'rift-ds/tokens/values';
// Every shipped theme, so a Theme pick applies; keep only yours once you choose.
import 'rift-ds/tokens/presets/presets.css';
import styles from './AppShell.module.css';

/**
 * How the sidebar and the content meet the page, one of the three app shell
 * modes: `flush` runs the sidebar edge to edge on the shell colour behind a
 * hairline, the content crisp beside it; `floating` lifts the sidebar into a
 * glass card off the edges; `inset` runs it flush and sets the content in a
 * raised surface held off the other edges, scrolling inside itself.
 */
const SHELL_LAYOUT: AppSidebarLayout = 'floating';

/** The sidebar's Appearance rows: what each choice is called and shows. */
const MODES = [
  { value: 'system', label: 'System', icon: 'routine', description: 'Follows your device' },
  { value: 'light', label: 'Light', icon: 'light_mode', description: 'Light surfaces, dark text' },
  { value: 'dark', label: 'Dark', icon: 'dark_mode', description: 'Dark surfaces, light text' },
] as const;

const LAYOUTS: { value: AppSidebarLayout; label: string; icon: string; description: string }[] = [
  { value: 'flush', label: 'Flush', icon: 'vertical_split', description: 'Edge to edge behind a hairline' },
  { value: 'floating', label: 'Floating', icon: 'view_sidebar', description: 'The sidebar as a card beside the page' },
  { value: 'inset', label: 'Inset', icon: 'space_dashboard', description: 'The page in a raised surface' },
];

const WIDTHS: { value: ContentWidth; label: string; icon: string; description: string }[] = [
  { value: 'narrow', label: 'Narrow', icon: 'width_normal', description: 'A slim centred column' },
  { value: 'contained', label: 'Contained', icon: 'width_wide', description: 'Centred at a comfortable width' },
  { value: 'full', label: 'Full width', icon: 'width_full', description: 'The whole column, edge to edge' },
];

/**
 * The theme is the `data-brand` attribute on <html> (none for the base
 * look). Watched, so a pick made anywhere shows here; store it where you
 * keep the reader's other preferences to make it last.
 */
const subscribeRoot = (callback: () => void) => {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-brand', 'data-theme'] });
  return () => observer.disconnect();
};
const readBrand = () => document.documentElement.getAttribute('data-brand');
const readDark = () => document.documentElement.getAttribute('data-theme') === 'dark';
const applyBrand = (brand: string | null) => {
  if (brand) document.documentElement.setAttribute('data-brand', brand);
  else document.documentElement.removeAttribute('data-brand');
};

/** Below the mobile step every mode gives way to the plain page, so Layout and Width leave the sidebar. */
const PHONE_QUERY = mediaBelow(BREAKPOINT_MOBILE_PX);
const subscribePhone = (callback: () => void) => {
  const query = window.matchMedia(PHONE_QUERY);
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
};
const readPhone = () => window.matchMedia(PHONE_QUERY).matches;

/** How wide the page runs, apart from the mode. */
type ContentWidth = 'narrow' | 'contained' | 'full';

/**
 * How wide the page runs, apart from the mode: `narrow` centres a slim
 * column (960px), `contained` centres the content column (1440px), both set
 * in AppShell.module.css, and `full` runs it the whole width the mode
 * leaves. Any mode takes any of them.
 */
const CONTENT_WIDTH: ContentWidth = 'contained';

/** The product's name, shown beside the logo in the sidebar. */
const PRODUCT_NAME = 'Acme';

/** The sidebar's navigation. Give an item an `href` (`'/dashboard'`) to make it a link. */
const NAV_SECTIONS: AppSidebarSection[] = [
  {
    category: 'Main',
    items: [
      { key: 'home', label: 'Home', icon: 'home' },
      { key: 'dashboard', label: 'Dashboard', icon: 'space_dashboard' },
      { key: 'projects', label: 'Projects', icon: 'folder' },
      { key: 'tasks', label: 'Tasks', icon: 'check_circle', badge: 4 },
      { key: 'inbox', label: 'Inbox', icon: 'inbox' },
    ],
  },
  {
    category: 'Workspace',
    items: [
      { key: 'reports', label: 'Reports', icon: 'bar_chart' },
      { key: 'settings', label: 'Settings', icon: 'settings' },
    ],
  },
];

/**
 * The settings page's sections, which open in the sidebar's side panel from
 * the Settings row, grouped as the page groups them. The settings block's
 * page (app/settings/Settings.tsx) follows the hash each one links to.
 */
export const SETTINGS_SECTIONS = [
  { id: 'general', label: 'General', group: 'Workspace', description: 'How your workspace appears to everyone in it.' },
  { id: 'notifications', label: 'Notifications', group: 'Workspace', description: 'What we email you about. Each switch saves as it flips.' },
  { id: 'profile', label: 'Profile', group: 'Account', description: 'How you appear to the people you work with.' },
  { id: 'security', label: 'Security', group: 'Account', description: 'How you sign in, and where you are signed in now.' },
] as const;

/** The navigation, with the settings sections linked from wherever the reader is. */
function navFor(activeKey: string): AppSidebarSection[] {
  // On the settings page a section is a jump within it; anywhere else it
  // opens the settings page at that section.
  const base = activeKey === 'settings' ? '' : ROUTES.settings;
  return NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.map((item) =>
      item.key === 'settings'
        ? {
            ...item,
            children: SETTINGS_SECTIONS.map((entry) => ({
              key: entry.id,
              label: entry.label,
              group: entry.group,
              href: `${base}#${entry.id}`,
              // A router's link (Next.js's) moves a hash without the
              // hashchange event the settings page follows, so on that page
              // the link sets the hash itself.
              ...(base === '' ? { onClick: () => window.location.assign(`#${entry.id}`) } : {}),
            })),
          }
        : item,
    ),
  }));
}

/**
 * Where the toolbar's links go: the notifications and settings blocks'
 * pages. Relative, so they resolve beside the page they are on: every block
 * is a top-level route in your app (`notifications` from /dashboard is
 * /notifications), and the rift-ds docs preview finds its own copies the
 * same way. Make them absolute ('/notifications') if your pages nest.
 */
const ROUTES = { notifications: 'notifications', settings: 'settings' };

/**
 * The bell's latest notifications. Read your own; See all opens the
 * notifications block's page at /notifications.
 */
const LATEST = [
  { id: 'payment', icon: 'payments', title: 'Payment received', text: 'Northwind Supply paid invoice 1042.', time: '2m' },
  { id: 'approval', icon: 'approval', title: 'Approval needed', text: 'Jordan Reyes asked to spend $1,632.42.', time: '1h' },
  { id: 'statement', icon: 'description', title: 'Statement ready', text: 'Your October statement is ready.', time: 'Mon' },
];

const PROFILE: AppSidebarProfile = {
  name: 'Alex Morgan',
  email: 'alex@example.com',
};

export interface AppShellProps {
  /** The sidebar item for this page. */
  activeKey: string;
  /** The page's place in the app, ending with the page itself. */
  breadcrumb?: BreadcrumbItem[];
  /** The sub-item for this page, such as the open settings section. */
  activeSubKey?: string;
  /** The page title, the one h1. */
  title: string;
  /** A sentence under the title. */
  description?: string;
  /** Compact buttons at the end of the page header. */
  actions?: ReactNode;
  /** The page content. */
  children: ReactNode;
}

export function AppShell({ activeKey, activeSubKey, breadcrumb, title, description, actions, children }: AppShellProps) {
  const [layout, setLayout] = useState<AppSidebarLayout>(SHELL_LAYOUT);
  const [width, setWidth] = useState<ContentWidth>(CONTENT_WIDTH);
  const [mode, setMode] = useColorMode();
  const phone = useSyncExternalStore(subscribePhone, readPhone, () => false);
  const brand = useSyncExternalStore(subscribeRoot, readBrand, () => null);
  const dark = useSyncExternalStore(subscribeRoot, readDark, () => false);
  const [unread, setUnread] = useState<string[]>(['payment', 'approval']);

  // The sidebar's Appearance section: each row shows its current choice and
  // opens the choices in the sidebar's panel, where a pick applies at once.
  // Theme and Mode are the reader's (Mode is stored, like ThemeToggle's);
  // Layout and Width are for trying the shell out, so pick yours and drop
  // them.
  const modeNow = MODES.find((option) => option.value === mode) ?? MODES[0];
  const themes = shippedThemeOptions(dark ? 'dark' : 'light');
  const themeNow = SHIPPED_THEMES.find((theme) => theme.brand === brand) ?? SHIPPED_THEMES[0];
  const swatch = (color?: string) => <span className={styles.swatch} style={{ backgroundColor: color }} />;
  const layoutNow = LAYOUTS.find((option) => option.value === layout) ?? LAYOUTS[0];
  const widthNow = WIDTHS.find((option) => option.value === width) ?? WIDTHS[0];
  const appearance: AppSidebarSection = {
    category: 'Appearance',
    items: [
      {
        key: 'appearance-theme',
        label: 'Theme',
        icon: swatch(themes.find((theme) => theme.value === themeNow.id)?.color),
        value: themeNow.label,
        children: SHIPPED_THEMES.map((theme) => ({
          key: `theme-${theme.id}`,
          label: theme.label,
          icon: swatch(themes.find((option) => option.value === theme.id)?.color),
          selected: theme.id === themeNow.id,
          onClick: () => applyBrand(theme.brand),
        })),
      },
      {
        key: 'appearance-mode',
        label: 'Mode',
        icon: modeNow.icon,
        value: modeNow.label,
        children: MODES.map((option) => ({
          key: `mode-${option.value}`,
          label: option.label,
          description: option.description,
          icon: option.icon,
          selected: option.value === mode,
          onClick: () => setMode(option.value),
        })),
      },
      ...(phone
        ? []
        : [
            {
              key: 'appearance-layout',
              label: 'Layout',
              icon: layoutNow.icon,
              value: layoutNow.label,
              children: LAYOUTS.map((option) => ({
                key: `layout-${option.value}`,
                label: option.label,
                description: option.description,
                icon: option.icon,
                selected: option.value === layout,
                onClick: () => setLayout(option.value),
              })),
            },
            {
              key: 'appearance-width',
              label: 'Width',
              icon: widthNow.icon,
              value: widthNow.label,
              children: WIDTHS.map((option) => ({
                key: `width-${option.value}`,
                label: option.label,
                description: option.description,
                icon: option.icon,
                selected: option.value === width,
                onClick: () => setWidth(option.value),
              })),
            },
          ]),
    ],
  };

  return (
    <AppLayout
      className={styles.shell}
      theme="inherit"
      sections={[...navFor(activeKey), appearance]}
      profile={PROFILE}
      activeKey={activeKey}
      activeSubKey={activeSubKey}
      logoText={PRODUCT_NAME}
      layout={layout}
      // AppLayout's width axis is contained or full; narrow is a contained
      // column held slimmer, through data-width and AppShell.module.css.
      width={width === 'full' ? 'full' : 'contained'}
      data-width={width}
      toolbar={
        <AppToolbar
          onSearch={() => {}}
          actions={[
            {
              id: 'notifications',
              icon: 'notifications',
              label: 'Notifications',
              badge: unread.length > 0 ? unread.length : undefined,
              panel: (
                <NotificationCenter
                  unreadCount={unread.length}
                  onMarkAllRead={() => setUnread([])}
                  seeAllHref={ROUTES.notifications}
                >
                  {LATEST.map((item) => (
                    <NotificationItem
                      key={item.id}
                      media={item.icon}
                      title={item.title}
                      time={item.time}
                      unread={unread.includes(item.id)}
                      onSelect={() => setUnread((ids) => ids.filter((id) => id !== item.id))}
                    >
                      {item.text}
                    </NotificationItem>
                  ))}
                </NotificationCenter>
              ),
            },
            { id: 'help', icon: 'help', label: 'Help' },
            { id: 'settings', icon: 'settings', label: 'Settings', href: ROUTES.settings },
          ]}
          onChat={() => {}}
        />
      }
    >
      <PageHeader breadcrumb={breadcrumb} title={title} description={description} actions={actions} />
      {children}
    </AppLayout>
  );
}
