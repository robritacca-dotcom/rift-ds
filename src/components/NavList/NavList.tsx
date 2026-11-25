'use client';

// The old name of SideNav, kept so code written against it still builds.
import React from 'react';
import {
  SideNav,
  type SideNavEntry,
  type SideNavItem,
  type SideNavProps,
  type SideNavSection,
} from '../SideNav/SideNav';

/**
 * Props of the deprecated NavList: SideNav's.
 *
 * @deprecated Use `SideNavProps`.
 */
export type NavListProps = SideNavProps;

/**
 * A link row of the deprecated NavList: SideNav's.
 *
 * @deprecated Use `SideNavItem`.
 */
export type NavListItem = SideNavItem;

/**
 * A titled group of the deprecated NavList: SideNav's.
 *
 * @deprecated Use `SideNavSection`.
 */
export type NavListSection = SideNavSection;

/**
 * An entry of the deprecated NavList: SideNav's.
 *
 * @deprecated Use `SideNavEntry`.
 */
export type NavListEntry = SideNavEntry;

/**
 * SideNav under its old name. It renders the same list and adds the old
 * `ds-nav-list` base class beside the new one, so a rule written against
 * the base still matches. The old modifier and element classes are gone: a
 * rule written against one moves to its `ds-side-nav` twin.
 *
 * @deprecated Use `SideNav`. The list was renamed for what it is: a site's
 * side navigation.
 */
export const NavList = React.forwardRef<HTMLUListElement, NavListProps>(({ className, ...rest }, ref) => (
  <SideNav {...rest} ref={ref} className={['ds-nav-list', className].filter(Boolean).join(' ')} />
));

NavList.displayName = 'NavList';
