'use client';

import React, { useState, useCallback } from 'react';
import { AppSidebar } from '../AppSidebar/AppSidebar';
import type { AppSidebarSection, AppSidebarProfile } from '../AppSidebar/AppSidebar';
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
 * and a centred content area.
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

    const classes = [
      baseClass,
      expanded ? `${baseClass}--expanded` : '',
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
          linkComponent={linkComponent}
        />
        <main className={`${baseClass}__main`}>
          <div className={`${baseClass}__content`}>
            {children}
          </div>
        </main>
      </div>
    );
  },
);

AppLayout.displayName = 'AppLayout';
