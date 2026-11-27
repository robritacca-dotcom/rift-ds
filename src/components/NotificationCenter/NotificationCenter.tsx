'use client';

import React, { useId, useState } from 'react';
import { EmptyState, type EmptyStateProps } from '../EmptyState/EmptyState';
import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { Tabs } from '../Tabs/Tabs';
import { DropdownMenu, type DropdownMenuEntry } from '../DropdownMenu/DropdownMenu';
import './NotificationCenter.css';
import '../../behaviors/visually-hidden.css';
import '../../fonts/material-symbols.css';
import { useLocale } from '../../behaviors/LocaleProvider';
import { useLinkComponent, type LinkComponent } from '../../behaviors/LinkProvider';

export interface NotificationCenterTab {
  /** Display label */
  label: string;
  /** Unique tab identifier */
  value: string;
  /** Count shown beside the label, e.g. the number of notifications in this filter. */
  count?: number;
}

/** Props owned by NotificationItem itself — everything else falls through to the root element. */
type NotificationItemOwnProps = {
  /**
   * One-line headline, e.g. who did what.
   * Note: this shadows the native `title` tooltip attribute, which NotificationItem does not expose.
   */
  title: string;
  /** When it happened, as already-formatted text like "2m" or "Mon". */
  time?: string;
  /** Marks the notification as not yet read: a dot beside the time and emphasised title. */
  unread?: boolean;
  /** Visually hidden text announcing the unread dot. Defaults to "Unread". */
  unreadLabel?: string;
  /** Leading visual — a Material Symbol name (string) or a custom element (e.g. an Avatar). */
  media?: string | React.ReactNode;
  /** Action row under the body — typically compact Buttons like "Reply" or "Retry". */
  actions?: React.ReactNode;
  /**
   * Opens the notification. The title becomes a button whose hit area
   * covers the whole row, so the row hovers and clicks as one; the action
   * row stays clickable on its own. Replaces the native `onSelect`
   * attribute, which fires on text selection inside an input.
   */
  onSelect?: () => void;
  /** Opens the notification at this address instead: the title becomes a link covering the row. */
  href?: string;
  /**
   * Clears this one notification. A compact close button sits at the row's
   * end, shown on hover and focus (and always on a touch screen), above the
   * row's own click.
   */
  onDismiss?: () => void;
  /** The dismiss button's accessible name, from the title. Default "Dismiss <title>". */
  dismissLabel?: (title: string) => string;
  /**
   * The component the row's link renders with, such as Next.js's `Link`, so
   * it navigates through the app's router. Wins over a LinkProvider's; a
   * plain `<a>` when neither is set.
   */
  linkComponent?: LinkComponent;
  /** Additional CSS classes */
  className?: string;
  /** Supporting copy under the title. */
  children?: React.ReactNode;
};

export interface NotificationItemProps
  extends NotificationItemOwnProps,
    Omit<React.ComponentPropsWithoutRef<'article'>, keyof NotificationItemOwnProps> {}

/**
 * NotificationItem is one row of a NotificationCenter: a leading visual, a
 * headline with its time, supporting copy, and an optional row of actions.
 * An unread item takes a dot and an emphasised title.
 */
export const NotificationItem = React.forwardRef<HTMLElement, NotificationItemProps>(
  (
    {
      title,
      time,
      unread = false,
      unreadLabel = 'Unread',
      media,
      actions,
      onSelect,
      href,
      onDismiss,
      dismissLabel = (itemTitle: string) => `Dismiss ${itemTitle}`,
      linkComponent,
      className = '',
      children,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-notification-item';
    const Link = useLinkComponent(linkComponent);
    const interactive = Boolean(href || onSelect);

    const classes = [baseClass, unread ? `${baseClass}--unread` : '', interactive ? `${baseClass}--interactive` : '', className]
      .filter(Boolean)
      .join(' ');

    return (
      <article {...rest} ref={ref} className={classes}>
        {media && (
          <span className={`${baseClass}__media`} aria-hidden="true">
            {typeof media === 'string' ? (
              <span className="material-symbols-rounded">{media}</span>
            ) : (
              media
            )}
          </span>
        )}
        <div className={`${baseClass}__body`}>
          <div className={`${baseClass}__top`}>
            {href ? (
              <Link href={href} className={`${baseClass}__title ${baseClass}__open`} onClick={onSelect}>
                {title}
              </Link>
            ) : onSelect ? (
              <button type="button" className={`${baseClass}__title ${baseClass}__open`} onClick={onSelect}>
                {title}
              </button>
            ) : (
              <span className={`${baseClass}__title`}>{title}</span>
            )}
            {/* The dismiss sits just before the time, so the time and the
                dot hang at the row's end whether it shows or not. */}
            {onDismiss && (
              <span className={`${baseClass}__dismiss`}>
                <IconButton icon="close" label={dismissLabel(title)} variant="tertiary" size="compact" onClick={onDismiss} />
              </span>
            )}
            {time && <span className={`${baseClass}__time`}>{time}</span>}
            {unread && (
              <span className={`${baseClass}__dot`}>
                <span className="ds-visually-hidden">{unreadLabel}</span>
              </span>
            )}
          </div>
          {children && <div className={`${baseClass}__text`}>{children}</div>}
          {actions && <div className={`${baseClass}__actions`}>{actions}</div>}
        </div>
      </article>
    );
  },
);

NotificationItem.displayName = 'NotificationItem';

/** Props owned by NotificationCenter itself — everything else falls through to the root element. */
type NotificationCenterOwnProps = {
  /**
   * Heading shown in the header.
   * Note: this shadows the native `title` tooltip attribute, which NotificationCenter does not expose.
   */
  title?: string;
  /** How many notifications are unread, shown as a badge beside the title (only announced when filter tabs carry the count). Omit to hide it. */
  unreadCount?: number;
  /** The unread count's text, given the count. Defaults to "<count> unread". */
  unreadCountLabel?: (count: number) => string;
  /** Accessible name of the filter tablist. Defaults to "<title> filters". */
  tabsLabel?: string;
  /**
   * Fires when Mark all as read is chosen from the header's options menu.
   * The item is disabled while `unreadCount` is zero.
   */
  onMarkAllRead?: () => void;
  /** The options menu's mark-all-read item. Default "Mark all as read". */
  markAllLabel?: string;
  /** Fires when Clear all is chosen from the header's options menu, a destructive item that empties the inbox. */
  onClearAll?: () => void;
  /** The options menu's clear-all item. Default "Clear all". */
  clearAllLabel?: string;
  /**
   * More items for the header's options menu, after Mark all as read and
   * before Clear all, such as notification settings or a link to the full
   * page.
   */
  menuItems?: DropdownMenuEntry[];
  /** The options button's accessible name and tooltip. Default "Notification options". */
  optionsLabel?: string;
  /** Filter tabs under the header, each with an optional count. */
  tabs?: NotificationCenterTab[];
  /**
   * Value of the active filter tab, for controlled use. Leave it undefined to
   * let the component keep its own selection, seeded from `defaultValue`.
   */
  value?: string;
  /**
   * Value of the tab active on first render when the tabs are uncontrolled.
   * Falls back to the first tab.
   */
  defaultValue?: string;
  /** Fires with the newly selected tab's value. */
  onValueChange?: (value: string) => void;
  /**
   * Legacy name for `value`; `value` wins when both are set.
   *
   * @deprecated Use `value` instead.
   */
  activeTab?: string;
  /**
   * Legacy name for `defaultValue`; `defaultValue` wins when both are set.
   *
   * @deprecated Use `defaultValue` instead.
   */
  defaultTab?: string;
  /**
   * Legacy change callback; fires alongside `onValueChange`.
   *
   * @deprecated Use `onValueChange` instead.
   */
  onTabChange?: (value: string) => void;
  /**
   * Opens the full list of notifications. When given (or `seeAllHref`), a
   * footer under the list carries a See all button.
   */
  onSeeAll?: () => void;
  /** Opens the full list at this address instead: the See all button becomes a link. */
  seeAllHref?: string;
  /** The See all button's label. Default "See all". */
  seeAllLabel?: string;
  /**
   * The component the See all link renders with, such as Next.js's `Link`.
   * Wins over a LinkProvider's; a plain `<a>` when neither is set.
   */
  linkComponent?: LinkComponent;
  /** What to render when there are no children — defaults to a built-in empty state. */
  emptyState?: React.ReactNode;
  /**
   * The built-in empty state's copy, merged over the English defaults: title
   * "Nothing new", description "Notifications will collect here as they
   * arrive." Ignored when `emptyState` is set.
   */
  emptyStateLabels?: Partial<Pick<EmptyStateProps, 'title' | 'description'>>;
  /** The BCP 47 locale the tab counts are written in, such as `ar-EG`. Defaults to the nearest LocaleProvider's, else `en-US`. */
  locale?: string;
  /** Additional CSS classes */
  className?: string;
  /** The notifications, newest first — typically NotificationItems. */
  children?: React.ReactNode;
};

export interface NotificationCenterProps
  extends NotificationCenterOwnProps,
    Omit<React.ComponentPropsWithoutRef<'section'>, keyof NotificationCenterOwnProps> {}

/**
 * NotificationCenter is the persistent inbox for everything that happened
 * while the user was away: a header with the unread count and a mark-all-read
 * control, optional filter tabs with counts, and a scrollable list of
 * NotificationItems. Filtering is the consumer's job — swap the children when
 * the tab changes.
 *
 * Toast interrupts; this accumulates.
 */
export const NotificationCenter = React.forwardRef<HTMLElement, NotificationCenterProps>(
  (
    {
      title = 'Notifications',
      unreadCount,
      unreadCountLabel = (count) => `${count} unread`,
      tabsLabel,
      onMarkAllRead,
      markAllLabel = 'Mark all as read',
      onClearAll,
      clearAllLabel = 'Clear all',
      menuItems = [],
      optionsLabel = 'Notification options',
      tabs,
      value,
      defaultValue,
      onValueChange,
      activeTab,
      defaultTab,
      onTabChange,
      emptyState,
      emptyStateLabels,
      onSeeAll,
      seeAllHref,
      seeAllLabel = 'See all',
      linkComponent,
      locale: localeProp,
      className = '',
      children,
      ...rest
    },
    ref,
  ) => {
    const locale = useLocale(localeProp);
    const baseClass = 'ds-notification-center';

    // `activeTab` and `defaultTab` are the deprecated spellings of `value`
    // and `defaultValue`; the new names win when both are set.
    const controlledTab = value ?? activeTab;
    const isTabControlled = controlledTab !== undefined;
    const [uncontrolledTab, setUncontrolledTab] = useState(
      defaultValue ?? defaultTab ?? tabs?.[0]?.value,
    );
    const currentTab = isTabControlled ? controlledTab : uncontrolledTab;

    // Ids tying each tab to the list as its tabpanel. Index-based, because
    // tab values are consumer strings and not guaranteed id-safe.
    const idBase = useId();
    const panelId = `${idBase}-panel`;
    const activeTabIndex = tabs?.findIndex((tab) => tab.value === currentTab) ?? -1;
    const hasTabs = !!tabs && tabs.length > 0;

    const selectTab = (next: string) => {
      if (!isTabControlled) setUncontrolledTab(next);
      onValueChange?.(next);
      onTabChange?.(next);
    };

    const hasItems = React.Children.count(children) > 0;

    // The header's options menu: Mark all as read first, the host's items,
    // then Clear all set apart as the destructive one.
    const options: DropdownMenuEntry[] = [
      ...(onMarkAllRead
        ? [{ label: markAllLabel, icon: 'done_all', onClick: onMarkAllRead, disabled: unreadCount === 0 }]
        : []),
      ...menuItems,
      ...(onClearAll
        ? [
            ...(onMarkAllRead || menuItems.length > 0 ? [{ type: 'separator' as const }] : []),
            { label: clearAllLabel, icon: 'delete_sweep', onClick: onClearAll, destructive: true, disabled: !hasItems },
          ]
        : []),
    ];

    const classes = [baseClass, className].filter(Boolean).join(' ');

    return (
      <section {...rest} ref={ref} className={classes}>
        <header className={`${baseClass}__header`}>
          <div className={`${baseClass}__heading`}>
            <span className={`${baseClass}__title`}>{title}</span>
            {/* The live region stays mounted, so the count reaching zero is
                announced as well as each step down to it. */}
            {/* With filter tabs the Unread tab carries the count, so the
                badge leaves the header and the count is only announced. */}
            <span className={hasTabs ? 'ds-visually-hidden' : `${baseClass}__unread`} aria-live="polite">
              {unreadCount !== undefined && unreadCount > 0 ? (
                hasTabs ? (
                  unreadCountLabel(unreadCount)
                ) : (
                  <Badge variant="info" label={unreadCountLabel(unreadCount)} />
                )
              ) : null}
            </span>
          </div>
          {options.length > 0 ? (
            <DropdownMenu
              className={`${baseClass}__options`}
              align="end"
              items={options}
              trigger={<IconButton icon="more_horiz" label={optionsLabel} variant="tertiary" size="compact" />}
            />
          ) : null}
        </header>

        {hasTabs && (
          // The library's Tabs, compact, driving the list below as their
          // panel: it owns the keys (arrows, Home and End) and the counts.
          <Tabs
            className={`${baseClass}__tabs`}
            size="compact"
            aria-label={tabsLabel ?? `${title} filters`}
            tabs={tabs.map((tab) => ({ value: tab.value, label: tab.label, count: tab.count, panelId }))}
            value={currentTab}
            onValueChange={selectTab}
            locale={locale}
          />
        )}

        {/* The list is the panel the tabs control — tabpanel only when tabs exist. */}
        <div
          className={`${baseClass}__list`}
          role={hasTabs ? 'tabpanel' : undefined}
          id={hasTabs ? panelId : undefined}
          aria-label={hasTabs && activeTabIndex >= 0 ? tabs[activeTabIndex].label : undefined}
        >
          {hasItems
            ? children
            : emptyState ?? (
                <EmptyState
                  icon="notifications"
                  title={emptyStateLabels?.title ?? 'Nothing new'}
                  description={
                    emptyStateLabels?.description ??
                    'Notifications will collect here as they arrive.'
                  }
                  size="compact"
                />
              )}
        </div>

        {onSeeAll || seeAllHref ? (
          <footer className={`${baseClass}__footer`}>
            <Button
              variant="tertiary"
              size="compact"
              label={seeAllLabel}
              iconRight="arrow_forward"
              href={seeAllHref}
              linkComponent={linkComponent}
              onClick={onSeeAll}
            />
          </footer>
        ) : null}
      </section>
    );
  },
);

NotificationCenter.displayName = 'NotificationCenter';
