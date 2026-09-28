'use client';

import React, { useState, useCallback } from 'react';
import { AppSidebar } from '../AppSidebar/AppSidebar';
import type { AppSidebarSection, AppSidebarProfile } from '../AppSidebar/AppSidebar';
import './AppLayout.css';

export interface AppLayoutProps {
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
  /** Additional CSS classes on outer wrapper */
  className?: string;
}

/**
 * AppLayout — full-page template with a collapsible sidebar
 * and a centred content area.
 */
export const AppLayout = ({
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
  className = '',
}: AppLayoutProps) => {
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
    <div className={classes} data-theme={theme === 'dark' ? 'dark' : undefined}>
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
      />
      <main className={`${baseClass}__main`}>
        <div className={`${baseClass}__content`}>
          {children}
        </div>
      </main>
    </div>
  );
};
