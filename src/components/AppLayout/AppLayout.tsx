'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AppSidebar } from '../AppSidebar/AppSidebar';
import type { AppSidebarSection, AppSidebarProfile, AppSidebarLayout } from '../AppSidebar/AppSidebar';
import { MOTION_SCROLL_SETTLE_MS } from '../../tokens/motion';
import type { LinkComponent } from '../../behaviors/LinkProvider';
import './AppLayout.css';

/** Props owned by AppLayout itself — everything else falls through to the outer wrapper `<div>`. */
type AppLayoutOwnProps = {
  /** Sidebar navigation sections */
  sections: AppSidebarSection[];
  /** Sidebar profile */
  profile?: AppSidebarProfile;
  /** Active nav item key */
  activeKey?: string;
  /** Active sub-item key */
  activeSubKey?: string;
  /** Active third-level item key, listed in the sidebar's side panel */
  activeTertiaryKey?: string;
  /** Where sub-items show: the sidebar's accordion, or straight into its side panel (see AppSidebar) */
  subNav?: 'accordion' | 'panel';
  /** Whether sidebar starts expanded */
  defaultExpanded?: boolean;
  /** Logo text next to icon */
  logoText?: string;
  /** Custom logo element */
  logo?: React.ReactNode;
  /** Page content — centred in the main area */
  children: React.ReactNode;
  /**
   * How the rail and the content meet the page. `flush` (the default) runs
   * the rail edge to edge with the content centred beside it. `floating`
   * floats the rail as a glass card, the content still centred. `inset` runs
   * the rail flush on the app shell colour and sets the content full width
   * in a surface inset from the other edges, which scrolls inside itself.
   */
  layout?: AppSidebarLayout;
  /**
   * Colour scheme: 'dark' pins the layout to the dark theme (the historical
   * behaviour and the default); 'inherit' drops the pin so the layout
   * follows the surrounding data-theme like any other component.
   */
  theme?: 'dark' | 'inherit';
  /**
   * The component its links render with, such as Next.js's `Link`, so they
   * navigate through the app's router; passed on to the AppSidebar rail. Wins over a
   * LinkProvider's; a plain `<a>` when neither is set.
   */
  linkComponent?: LinkComponent;
  /** Additional CSS classes on outer wrapper */
  className?: string;
};

export interface AppLayoutProps
  extends AppLayoutOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof AppLayoutOwnProps> {}

/**
 * AppLayout — full-page template with a collapsible sidebar
 * and a content area, centred or set in an inset surface (see `layout`).
 *
 * The forwarded ref and any unrecognised props target the outer wrapper
 * `<div>`. With `theme="inherit"` a `data-theme` passed by the consumer
 * reaches the wrapper; with the default `dark` pin the component's own wins.
 */
export const AppLayout = React.forwardRef<HTMLDivElement, AppLayoutProps>(
  (
    {
      sections,
      profile,
      activeKey,
      activeSubKey,
      activeTertiaryKey,
      subNav,
      defaultExpanded = true,
      logoText,
      logo,
      children,
      layout = 'flush',
      theme = 'dark',
      linkComponent,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-app-layout';
    const [expanded, setExpanded] = useState(defaultExpanded);

    const handleExpandedChange = useCallback((next: boolean) => {
      setExpanded(next);
    }, []);

    // The inset surface's scrollbar shows only while it scrolls: the flag is
    // written straight to the DOM, so a scroll never re-renders the page.
    const scrollTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    useEffect(() => () => clearTimeout(scrollTimer.current), []);
    const handleSurfaceScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
      const scroller = event.currentTarget;
      scroller.dataset.scrolling = '';
      clearTimeout(scrollTimer.current);
      scrollTimer.current = setTimeout(() => {
        delete scroller.dataset.scrolling;
      }, MOTION_SCROLL_SETTLE_MS);
    }, []);

    const classes = [
      baseClass,
      expanded ? `${baseClass}--expanded` : '',
      layout !== 'flush' ? `${baseClass}--${layout}` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        {...rest}
        ref={ref}
        className={classes}
        // Spread conditionally so `inherit` leaves a consumer's own
        // data-theme in place rather than overwriting it with undefined.
        {...(theme === 'dark' ? { 'data-theme': 'dark' } : {})}
      >
        <AppSidebar
          sections={sections}
          profile={profile}
          activeKey={activeKey}
          activeSubKey={activeSubKey}
          activeTertiaryKey={activeTertiaryKey}
          subNav={subNav}
          expanded={expanded}
          onExpandedChange={handleExpandedChange}
          logoText={logoText}
          logo={logo}
          layout={layout}
          linkComponent={linkComponent}
        />
        <main className={`${baseClass}__main`}>
          {layout === 'inset' ? (
            // The surface clips to its rounded corners and the scroller
            // inside it scrolls, so the scrollbar never squares a corner.
            <div className={`${baseClass}__surface`}>
              <div className={`${baseClass}__scroller`} onScroll={handleSurfaceScroll}>
                <div className={`${baseClass}__content`}>{children}</div>
              </div>
            </div>
          ) : (
            <div className={`${baseClass}__content`}>{children}</div>
          )}
        </main>
      </div>
    );
  },
);

AppLayout.displayName = 'AppLayout';
