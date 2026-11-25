'use client';

// The old name of SubNavPanel, kept so code written against it still builds.
import React from 'react';
import { SubNavPanel, type SubNavPanelItem, type SubNavPanelProps } from '../SubNavPanel/SubNavPanel';

/**
 * Props of the deprecated SidebarPanel: SubNavPanel's.
 *
 * @deprecated Use `SubNavPanelProps`.
 */
export type SidebarPanelProps = SubNavPanelProps;

/**
 * An entry of the deprecated SidebarPanel: SubNavPanel's.
 *
 * @deprecated Use `SubNavPanelItem`.
 */
export type SidebarPanelItem = SubNavPanelItem;

/**
 * SubNavPanel under its old name. It renders the same column and adds the
 * old `ds-sidebar-panel` base class beside the new one, so a rule written
 * against the base still matches. The old modifier and element classes are
 * gone: a rule written against one moves to its `ds-sub-nav-panel` twin.
 *
 * @deprecated Use `SubNavPanel`. The column was renamed for what it is: the
 * sub-navigation beside an app's rail.
 */
export const SidebarPanel = React.forwardRef<HTMLElement, SidebarPanelProps>(({ className, ...rest }, ref) => (
  <SubNavPanel {...rest} ref={ref} className={['ds-sidebar-panel', className].filter(Boolean).join(' ')} />
));

SidebarPanel.displayName = 'SidebarPanel';
