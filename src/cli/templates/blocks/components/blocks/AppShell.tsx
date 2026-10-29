'use client';

/**
 * The app shell every rift-ds block page sits in: the floating sidebar, a
 * top bar (search, the AI entry and the colour mode), a page header
 * (breadcrumb, title, actions) and the content column, with the spacing
 * set. This file is yours: rename the product, change the navigation, and
 * grow it with your app.
 *
 * The top bar sticks to the top of the page and the content scrolls under
 * it: bare while the page is at the top, then a fill above it and the
 * library's ProgressiveBlur behind it fade in once the page scrolls.
 *
 * Responsive by construction: above 768px the sidebar floats beside the
 * page and the content moves over by its width; below it the sidebar
 * becomes a drawer behind its own menu button, the search field folds to
 * its icon, and the content runs edge to edge at a tighter gutter.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AiButton } from 'rift-ds/components/AiButton/AiButton';
import {
  AppSidebar,
  type AppSidebarProfile,
  type AppSidebarSection,
} from 'rift-ds/components/AppSidebar/AppSidebar';
import { Breadcrumb, type BreadcrumbItem } from 'rift-ds/components/Breadcrumb/Breadcrumb';
import { CommandPaletteTrigger } from 'rift-ds/components/CommandPaletteTrigger/CommandPaletteTrigger';
import { ProgressiveBlur } from 'rift-ds/components/ProgressiveBlur/ProgressiveBlur';
import { ThemeToggle } from 'rift-ds/components/ThemeToggle/ThemeToggle';
import styles from './AppShell.module.css';

/** The product's name, shown beside the logo in the sidebar. */
const PRODUCT_NAME = 'Acme';

/** The sidebar's navigation. Give an item an `href` (`'/dashboard'`) to make it a link. */
const NAV_SECTIONS: AppSidebarSection[] = [
  {
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

const PROFILE: AppSidebarProfile = {
  name: 'Alex Morgan',
  email: 'alex@example.com',
};

export interface AppShellProps {
  /** The sidebar item for this page. */
  activeKey: string;
  /** The page's place in the app, ending with the page itself. */
  breadcrumb?: BreadcrumbItem[];
  /** The page title, the one h1. */
  title: string;
  /** Compact buttons at the end of the page header. */
  actions?: ReactNode;
  /** The page content. */
  children: ReactNode;
}

export function AppShell({ activeKey, breadcrumb, title, actions, children }: AppShellProps) {
  const [expanded, setExpanded] = useState(true);

  // The top bar is stuck once the marker at its resting place scrolls out
  // of view; the fill and the blur behind the bar follow.
  const markerRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;
    const observer = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting));
    observer.observe(marker);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.shell}>
      <AppSidebar
        sections={NAV_SECTIONS}
        profile={PROFILE}
        activeKey={activeKey}
        expanded={expanded}
        onExpandedChange={setExpanded}
        logoText={PRODUCT_NAME}
        layout="floating"
      />

      <div className={`${styles.main} ${expanded ? styles.mainExpanded : ''}`}>
        <div className={styles.content}>
          <div ref={markerRef} className={styles.topBarMarker} aria-hidden="true" />
          <header className={styles.topBar} data-stuck={stuck ? '' : undefined}>
            <ProgressiveBlur className={styles.topBarBlur} tinted={stuck} />
            {/* Wire both to your command palette: CommandPalette from
                rift-ds, opened from here and from Cmd+K. */}
            <CommandPaletteTrigger className={styles.search} />
            <div className={styles.topBarActions}>
              <CommandPaletteTrigger iconOnly className={styles.searchIcon} />
              {/* The AI entry. Point it at your chat: `npx rift-ds init chat`
                  scaffolds one, and ChatLauncher opens it. */}
              <AiButton />
              <ThemeToggle showLabels={false} />
            </div>
          </header>

          <main className={styles.page}>
            <div className={styles.pageHead}>
              <div className={styles.pageHeadText}>
                {breadcrumb && <Breadcrumb items={breadcrumb} />}
                <h1 className={styles.title}>{title}</h1>
              </div>
              {actions && <div className={styles.pageActions}>{actions}</div>}
            </div>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
