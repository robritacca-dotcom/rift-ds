'use client';

import React, { useEffect, useState } from 'react';
import { DropdownMenu } from '../DropdownMenu/DropdownMenu';
import './TopAppBar.css';
import '../../fonts/material-symbols.css';

/* ============================================
   TYPES
   ============================================ */

export interface TopAppBarAction {
  /** Unique key for this action */
  key: string;
  /** Icon — Material Symbol name (string) or custom element (ReactNode) */
  icon: string | React.ReactNode;
  /** Accessible label; also the overflow menu's row text */
  label: string;
  /** Click handler */
  onClick?: () => void;
  /** Renders the action as a link to this URL instead of a button */
  href?: string;
  /** Shows a dot on the icon's corner, e.g. unread notifications */
  badge?: boolean;
}

/**
 * An action in the overflow menu. The menu's rows are buttons and draw no
 * icon badge, so `href` and `badge` are left out rather than silently
 * dropped: route from `onClick` instead.
 */
export type TopAppBarOverflowAction = Omit<TopAppBarAction, 'href' | 'badge'>;

type TopAppBarOwnProps = {
  /** The screen's title */
  title: string;
  /** A second line under the title, e.g. a count or a date range */
  subtitle?: string;
  /**
   * Which platform's bar to draw. `default` is the Rift bar; `ios` is the iOS
   * 26 navigation bar, with glass circle buttons over content and a soft
   * blurred edge; `android` is the Material 3 Expressive top app bar.
   */
  platform?: 'default' | 'ios' | 'android';
  /**
   * `small` puts the title in the bar. `medium` and `large` add an expanded
   * title under it that collapses into the bar as the page scrolls; on iOS
   * both are the large title.
   */
  size?: 'small' | 'medium' | 'large';
  /** Title alignment in the bar. Defaults to centred on iOS and to the start edge elsewhere */
  align?: 'start' | 'center';
  /** The leading control: a menu button, a back button, or a close button */
  navigation?: 'menu' | 'back' | 'close';
  /** Called when the leading control is pressed */
  onNavigate?: () => void;
  /** Accessible label of the leading control; defaults to "Open menu", "Back" or "Close" */
  navigationLabel?: string;
  /**
   * Trailing actions. The first three show as icon buttons; any more join the
   * overflow menu, ahead of `overflowActions`, where they render as plain rows
   * (a menu row draws no badge and routes from `onClick`, not `href`)
   */
  actions?: TopAppBarAction[];
  /** Actions listed in a menu behind a trailing "More" button */
  overflowActions?: TopAppBarOverflowAction[];
  /** Accessible label of the button that opens the overflow menu */
  overflowLabel?: string;
  /**
   * Whether content has scrolled under the bar, which collapses an expanded
   * title and switches the bar to its scrolled surface. Leave unset to have
   * the bar watch `scrollTarget` itself.
   */
  scrolled?: boolean;
  /** The element whose scroll the bar watches when `scrolled` is unset. Defaults to the window */
  scrollTarget?: HTMLElement | null;
  /** Level of the title's heading element */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Keeps the bar stuck to the top of its scroll container */
  sticky?: boolean;
  /** Additional CSS classes */
  className?: string;
};

export interface TopAppBarProps
  extends TopAppBarOwnProps,
    Omit<React.ComponentPropsWithoutRef<'header'>, keyof TopAppBarOwnProps> {}

/* Per-platform glyphs for the leading control. */
const NAV_ICONS: Record<'default' | 'ios' | 'android', Record<'menu' | 'back' | 'close', string>> = {
  default: { menu: 'menu', back: 'arrow_back', close: 'close' },
  ios: { menu: 'menu', back: 'chevron_left', close: 'close' },
  android: { menu: 'menu', back: 'arrow_back', close: 'close' },
};

const NAV_LABELS = { menu: 'Open menu', back: 'Back', close: 'Close' } as const;

/* ============================================
   COMPONENT
   ============================================ */

/**
 * TopAppBar — the header of a mobile screen: a leading menu or back button,
 * the screen title, and trailing actions. Comes in the Rift style or as a
 * close match for iOS or Android, with titles that collapse on scroll.
 */
export const TopAppBar = React.forwardRef<HTMLElement, TopAppBarProps>(
  (
    {
      title,
      subtitle,
      platform = 'default',
      size = 'small',
      align,
      navigation,
      onNavigate,
      navigationLabel,
      actions = [],
      overflowActions = [],
      overflowLabel = 'More',
      scrolled: controlledScrolled,
      scrollTarget,
      headingLevel = 1,
      sticky = true,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-top-app-bar';
    const isIos = platform === 'ios';
    const resolvedAlign = align ?? (isIos ? 'center' : 'start');
    const expandable = size !== 'small';

    /* Scroll watching: only when the host leaves `scrolled` unset. Starts
       false on the server and the first client render alike, so hydration
       never disagrees. */
    const [watchedScrolled, setWatchedScrolled] = useState(false);
    useEffect(() => {
      if (controlledScrolled !== undefined) return;
      const target: HTMLElement | Window = scrollTarget ?? window;
      const read = () => {
        const top = target instanceof Window ? target.scrollY : target.scrollTop;
        setWatchedScrolled(top > 4);
      };
      read();
      target.addEventListener('scroll', read, { passive: true });
      return () => target.removeEventListener('scroll', read);
    }, [controlledScrolled, scrollTarget]);
    const isScrolled = controlledScrolled ?? watchedScrolled;

    /* With an expanded title, the bar's own title shows only once the
       expanded one has collapsed; the hidden copy leaves the a11y tree. */
    const inlineTitleShown = !expandable || isScrolled;

    const classes = [
      baseClass,
      `${baseClass}--${platform}`,
      `${baseClass}--${size}`,
      `${baseClass}--align-${resolvedAlign}`,
      isScrolled ? `${baseClass}--scrolled` : '',
      sticky ? `${baseClass}--sticky` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const Heading = `h${headingLevel}` as 'h1';

    const renderIcon = (icon: string | React.ReactNode) =>
      typeof icon === 'string' ? (
        <span className={`${baseClass}__icon material-symbols-rounded`} aria-hidden="true">
          {icon}
        </span>
      ) : (
        <span className={`${baseClass}__icon`} aria-hidden="true">
          {icon}
        </span>
      );

    const renderAction = (action: TopAppBarAction) => {
      const content = (
        <>
          {renderIcon(action.icon)}
          {action.badge && <span className={`${baseClass}__badge`} aria-hidden="true" />}
        </>
      );
      const label = action.badge ? `${action.label}, new` : action.label;
      return action.href ? (
        <a
          key={action.key}
          className={`${baseClass}__button`}
          href={action.href}
          onClick={action.onClick}
          aria-label={label}
        >
          {content}
        </a>
      ) : (
        <button
          key={action.key}
          type="button"
          className={`${baseClass}__button`}
          onClick={action.onClick}
          aria-label={label}
        >
          {content}
        </button>
      );
    };

    const titleBlock = (
      <>
        <span className={`${baseClass}__title-text`}>{title}</span>
        {subtitle && <span className={`${baseClass}__subtitle`}>{subtitle}</span>}
      </>
    );

    /* Past three, actions spill into the overflow menu rather than being
       dropped: a shape the type accepts is never silently lost. */
    const trailing = actions.slice(0, 3);
    const overflowItems: TopAppBarOverflowAction[] = [
      ...actions.slice(3).map(({ key, icon, label, onClick }) => ({ key, icon, label, onClick })),
      ...overflowActions,
    ];
    const hasTrailing = trailing.length > 0 || overflowItems.length > 0;

    return (
      <header {...rest} ref={ref} className={classes}>
        <div className={`${baseClass}__row`}>
          <div className={`${baseClass}__leading`}>
            {navigation && (
              <button
                type="button"
                className={`${baseClass}__button ${baseClass}__button--nav`}
                onClick={onNavigate}
                aria-label={navigationLabel ?? NAV_LABELS[navigation]}
              >
                {renderIcon(NAV_ICONS[platform][navigation])}
              </button>
            )}
          </div>

          {inlineTitleShown ? (
            <Heading className={`${baseClass}__title`}>{titleBlock}</Heading>
          ) : (
            <div className={`${baseClass}__title ${baseClass}__title--hidden`} aria-hidden="true">
              {titleBlock}
            </div>
          )}

          <div className={`${baseClass}__trailing`}>
            {hasTrailing && (
              /* iOS groups the trailing buttons into one glass capsule. */
              <div className={`${baseClass}__group`}>
                {trailing.map(renderAction)}
                {overflowItems.length > 0 && (
                  <DropdownMenu
                    align="end"
                    className={`${baseClass}__overflow`}
                    trigger={
                      <button type="button" className={`${baseClass}__button`} aria-label={overflowLabel}>
                        {renderIcon(isIos ? 'more_horiz' : 'more_vert')}
                      </button>
                    }
                    items={overflowItems.map((action) => ({
                      label: action.label,
                      icon: action.icon,
                      onClick: action.onClick,
                    }))}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {expandable && (
          <div className={`${baseClass}__expanded`} inert={isScrolled}>
            <div className={`${baseClass}__expanded-inner`}>
              {inlineTitleShown ? (
                <div className={`${baseClass}__large-title`} aria-hidden="true">
                  {titleBlock}
                </div>
              ) : (
                <Heading className={`${baseClass}__large-title`}>{titleBlock}</Heading>
              )}
            </div>
          </div>
        )}
      </header>
    );
  },
);

TopAppBar.displayName = 'TopAppBar';
