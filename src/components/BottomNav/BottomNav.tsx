'use client';

import React from 'react';
import './BottomNav.css';
import '../../fonts/material-symbols.css';

/* ============================================
   TYPES
   ============================================ */

export interface BottomNavItem {
  /** Unique key for this destination */
  key: string;
  /** Display label, always shown under the icon */
  label: string;
  /** Icon — Material Symbol name (string, drawn filled when selected) or custom element (ReactNode) */
  icon: string | React.ReactNode;
  /** Renders the destination as a real link to this URL instead of a button */
  href?: string;
  /** Click handler — also fires on a link destination, so a consumer can route client-side */
  onClick?: () => void;
  /** Count on the icon's corner; `true` shows a dot with no number */
  badge?: number | string | true;
}

export interface BottomNavSearch {
  /** The button's accessible name on iOS, and its visible tab label on the other platforms */
  label: string;
  /**
   * Icon — Material Symbol name (string) or custom element (ReactNode).
   * Defaults to `search`; set it when the set-apart slot launches something
   * else, such as an assistant.
   */
  icon?: string | React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Renders the button as a link to this URL instead */
  href?: string;
}

type BottomNavOwnProps = {
  /** Destinations, three to five of them */
  items: BottomNavItem[];
  /** Key of the destination for the current page */
  activeKey?: string;
  /** Called with a destination's key when it is pressed */
  onValueChange?: (key: string) => void;
  /**
   * Which platform's tab bar to draw. `default` is the Rift bar; `ios` is the
   * iOS 26 Liquid Glass capsule floating over content with a sliding lens
   * behind the selection; `android` is the Material 3 Expressive navigation
   * bar with a pill indicator behind the selected icon.
   */
  platform?: 'default' | 'ios' | 'android';
  /**
   * A destination set apart from the rest, search unless its `icon` says
   * otherwise. On iOS it is its own glass circle beside the bar; elsewhere it
   * joins the bar as the last destination.
   */
  search?: BottomNavSearch;
  /**
   * iOS only: shrinks the bar to the selected destination alone, the way the
   * system bar minimises while the page scrolls down. Ignored on other platforms.
   */
  minimized?: boolean;
  /** Pins the bar to the bottom of the viewport, above the home-indicator safe area */
  fixed?: boolean;
  /**
   * Accessible name of the navigation landmark. Defaults to "Tabs", distinct
   * from Nav's "Main", so a screen carrying both announces two different navs
   */
  'aria-label'?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface BottomNavProps
  extends BottomNavOwnProps,
    Omit<React.ComponentPropsWithoutRef<'nav'>, keyof BottomNavOwnProps> {}

/* ============================================
   COMPONENT
   ============================================ */

/**
 * BottomNav — the tab bar of a mobile app: three to five top-level
 * destinations along the bottom of the screen, in the Rift style or as a
 * close match for iOS or Android.
 */
export const BottomNav = React.forwardRef<HTMLElement, BottomNavProps>(
  (
    {
      items,
      activeKey,
      onValueChange,
      platform = 'default',
      search,
      minimized = false,
      fixed = false,
      'aria-label': ariaLabel = 'Tabs',
      className = '',
      style,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-bottom-nav';
    const isIos = platform === 'ios';

    /* Outside iOS the search destination is simply the last tab. */
    const destinations: BottomNavItem[] =
      search && !isIos
        ? [...items, { key: '__search', label: search.label, icon: search.icon ?? 'search', href: search.href, onClick: search.onClick }]
        : items;

    const activeIndex = destinations.findIndex((item) => item.key === activeKey);
    const isMinimized = isIos && minimized && activeIndex >= 0;

    const classes = [
      baseClass,
      `${baseClass}--${platform}`,
      fixed ? `${baseClass}--fixed` : '',
      isMinimized ? `${baseClass}--minimized` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    /* The iOS lens slides between slots: its offset is the selected slot's
       index, set as a custom property so the transform can transition. */
    const lensStyle = {
      ...style,
      '--ds-bottom-nav-count': destinations.length,
      '--ds-bottom-nav-index': Math.max(activeIndex, 0),
    } as React.CSSProperties;

    const renderIcon = (icon: BottomNavItem['icon']) =>
      typeof icon === 'string' ? (
        <span className={`${baseClass}__icon material-symbols-rounded`} aria-hidden="true">
          {icon}
        </span>
      ) : (
        <span className={`${baseClass}__icon`} aria-hidden="true">
          {icon}
        </span>
      );

    const renderBadge = (badge: BottomNavItem['badge']) => {
      if (badge === undefined) return null;
      return badge === true ? (
        <span className={`${baseClass}__badge ${baseClass}__badge--dot`} aria-hidden="true" />
      ) : (
        <span className={`${baseClass}__badge`} aria-hidden="true">
          {badge}
        </span>
      );
    };

    return (
      <nav {...rest} ref={ref} className={classes} style={lensStyle} aria-label={ariaLabel}>
        <div className={`${baseClass}__bar`}>
          {isIos && activeIndex >= 0 && <span className={`${baseClass}__lens`} aria-hidden="true" />}
          <ul className={`${baseClass}__list`}>
            {destinations.map((item) => {
              const isActive = item.key === activeKey;
              const itemClasses = [
                `${baseClass}__item`,
                isActive ? `${baseClass}__item--active` : '',
              ]
                .filter(Boolean)
                .join(' ');
              const badgeText =
                item.badge === undefined
                  ? ''
                  : item.badge === true
                    ? ', new'
                    : `, ${item.badge} new`;
              const content = (
                <>
                  <span className={`${baseClass}__indicator`}>
                    {renderIcon(item.icon)}
                    {renderBadge(item.badge)}
                  </span>
                  <span className={`${baseClass}__label`}>{item.label}</span>
                  {badgeText && <span className={`${baseClass}__sr`}>{badgeText}</span>}
                </>
              );
              const handleClick = () => {
                item.onClick?.();
                if (item.key !== '__search') onValueChange?.(item.key);
              };
              return (
                <li
                  key={item.key}
                  className={`${baseClass}__slot`}
                  /* A minimised bar keeps only the selected slot; the rest
                     leave the tab order along with the view. */
                  inert={isMinimized && !isActive}
                >
                  {item.href ? (
                    <a
                      className={itemClasses}
                      href={item.href}
                      onClick={handleClick}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {content}
                    </a>
                  ) : (
                    <button
                      type="button"
                      className={itemClasses}
                      onClick={handleClick}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {content}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {isIos &&
          search &&
          (search.href ? (
            <a className={`${baseClass}__search`} href={search.href} onClick={search.onClick} aria-label={search.label}>
              {renderIcon(search.icon ?? 'search')}
            </a>
          ) : (
            <button type="button" className={`${baseClass}__search`} onClick={search.onClick} aria-label={search.label}>
              {renderIcon(search.icon ?? 'search')}
            </button>
          ))}
      </nav>
    );
  },
);

BottomNav.displayName = 'BottomNav';
