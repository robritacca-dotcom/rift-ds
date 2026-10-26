'use client';

import React, { useId, useState } from 'react';
import { EmptyState, type EmptyStateProps } from '../EmptyState/EmptyState';
import './NotificationCenter.css';
import '../../behaviors/visually-hidden.css';
import '../../fonts/material-symbols.css';
import { logicalArrowKey } from '../../behaviors/direction';

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
      className = '',
      children,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-notification-item';

    const classes = [baseClass, unread ? `${baseClass}--unread` : '', className]
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
            <span className={`${baseClass}__title`}>{title}</span>
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
  /** How many notifications are unread, shown under the heading. Omit to hide the line. */
  unreadCount?: number;
  /** Text of the unread line under the heading, given the count. Defaults to "<count> unread". */
  unreadCountLabel?: (count: number) => string;
  /** Accessible name of the filter tablist. Defaults to "<title> filters". */
  tabsLabel?: string;
  /** Fires when "Mark all read" is pressed; the control only renders when this is set. */
  onMarkAllRead?: () => void;
  /** Text of the mark-all-read control. */
  markAllLabel?: string;
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
  /** What to render when there are no children — defaults to a built-in empty state. */
  emptyState?: React.ReactNode;
  /**
   * The built-in empty state's copy, merged over the English defaults: title
   * "Nothing new", description "Notifications will collect here as they
   * arrive." Ignored when `emptyState` is set.
   */
  emptyStateLabels?: Partial<Pick<EmptyStateProps, 'title' | 'description'>>;
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
      markAllLabel = 'Mark all read',
      tabs,
      value,
      defaultValue,
      onValueChange,
      activeTab,
      defaultTab,
      onTabChange,
      emptyState,
      emptyStateLabels,
      className = '',
      children,
      ...rest
    },
    ref,
  ) => {
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
    const tabIdFor = (index: number) => `${idBase}-tab-${index}`;
    const activeTabIndex = tabs?.findIndex((tab) => tab.value === currentTab) ?? -1;
    const hasTabs = !!tabs && tabs.length > 0;

    const selectTab = (next: string) => {
      if (!isTabControlled) setUncontrolledTab(next);
      onValueChange?.(next);
      onTabChange?.(next);
    };

    const handleTabKeyDown = (e: React.KeyboardEvent, index: number) => {
      if (!tabs) return;
      let target: NotificationCenterTab | undefined;
      switch (logicalArrowKey(e.key, e.currentTarget)) {
        case 'ArrowRight':
          e.preventDefault();
          target = tabs[(index + 1) % tabs.length];
          break;
        case 'ArrowLeft':
          e.preventDefault();
          target = tabs[(index - 1 + tabs.length) % tabs.length];
          break;
        case 'Home':
          e.preventDefault();
          target = tabs[0];
          break;
        case 'End':
          e.preventDefault();
          target = tabs[tabs.length - 1];
          break;
      }
      if (target) {
        selectTab(target.value);
        const tabList = (e.target as HTMLElement).parentElement;
        const buttons = tabList?.querySelectorAll<HTMLButtonElement>(`.${baseClass}__tab`);
        buttons?.[tabs.indexOf(target)]?.focus();
      }
    };

    const hasItems = React.Children.count(children) > 0;

    const classes = [baseClass, className].filter(Boolean).join(' ');

    return (
      <section {...rest} ref={ref} className={classes}>
        <header className={`${baseClass}__header`}>
          <div className={`${baseClass}__heading`}>
            <span className={`${baseClass}__title`}>{title}</span>
            {unreadCount !== undefined && unreadCount > 0 && (
              <span className={`${baseClass}__unread`} aria-live="polite">
                {unreadCountLabel(unreadCount)}
              </span>
            )}
          </div>
          {onMarkAllRead && (
            <button type="button" className={`${baseClass}__mark-all`} onClick={onMarkAllRead}>
              {markAllLabel}
            </button>
          )}
        </header>

        {hasTabs && (
          <div className={`${baseClass}__tabs`} role="tablist" aria-label={tabsLabel ?? `${title} filters`}>
            {tabs.map((tab, index) => {
              const isActive = tab.value === currentTab;
              return (
                <button
                  key={tab.value}
                  type="button"
                  id={tabIdFor(index)}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={panelId}
                  tabIndex={isActive ? 0 : -1}
                  className={[
                    `${baseClass}__tab`,
                    isActive ? `${baseClass}__tab--active` : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => selectTab(tab.value)}
                  onKeyDown={(e) => handleTabKeyDown(e, index)}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`${baseClass}__tab-count`}>{tab.count}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* The list is the panel the tabs control — tabpanel only when tabs exist. */}
        <div
          className={`${baseClass}__list`}
          role={hasTabs ? 'tabpanel' : undefined}
          id={hasTabs ? panelId : undefined}
          aria-labelledby={hasTabs && activeTabIndex >= 0 ? tabIdFor(activeTabIndex) : undefined}
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
      </section>
    );
  },
);

NotificationCenter.displayName = 'NotificationCenter';
