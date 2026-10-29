'use client';

import React, { useCallback, useId, useState } from 'react';
import { useLinkComponent, type LinkComponent } from '../../behaviors/LinkProvider';
import './SidebarPanel.css';
import '../../fonts/material-symbols.css';

/* ============================================
   TYPES
   ============================================ */

export interface SidebarPanelItem {
  /** Unique key for this item */
  key: string;
  /** Display label */
  label: string;
  /** Renders the item as a real link to this URL instead of a button. Ignored when the item has children, whose row is the accordion toggle */
  href?: string;
  /** Click handler — also fires on a link item, so a consumer can route client-side */
  onClick?: () => void;
  /** Trailing pill, e.g. unread items. A count takes the count badge colours; a word stays a quiet pill */
  badge?: string | number;
  /** Group heading this item sits under; consecutive items sharing a group render beneath one heading */
  group?: string;
  /** Nested items — turns this row into an accordion. One level deep: grandchildren are not rendered */
  children?: SidebarPanelItem[];
}

type SidebarPanelOwnProps = {
  /** Items to list, optionally grouped with `group` and nested one level with `children` */
  items: SidebarPanelItem[];
  /**
   * Heading at the top of the panel, usually the label of the item that opened it. Also the panel's accessible name, after a native `aria-label`; with neither, the panel is named "Section navigation".
   * Note: this shadows the native `title` tooltip attribute, which SidebarPanel does not expose.
   */
  title?: string;
  /** Key of the item for the current page. Its accordion parent starts open */
  activeKey?: string;
  /** Keys of the accordion rows open on first render, in addition to the active item's parent */
  defaultOpenKeys?: string[];
  /** Renders a collapse button beside the heading and calls this when it is pressed */
  onCollapse?: () => void;
  /** Accessible name of the collapse button. Defaults to "Collapse <title>", or "Collapse panel" when there is no title */
  collapseLabel?: string;
  /** Renders a back row above the heading and calls this when it is pressed; the drill-in navigation on small screens */
  onBack?: () => void;
  /** Label of the back row */
  backLabel?: string;
  /** Additional CSS classes */
  className?: string;
  /**
   * The component its links render with, such as Next.js's `Link`, so they
   * navigate through the app's router. Wins over a LinkProvider's; a plain
   * `<a>` when neither is set.
   */
  linkComponent?: LinkComponent;
};

export interface SidebarPanelProps
  extends SidebarPanelOwnProps,
    Omit<React.ComponentPropsWithoutRef<'nav'>, keyof SidebarPanelOwnProps> {}

/** A badge that is a count (`3`, `"12"`, `"99+"`), which takes the count
    badge pair; a word such as "New" keeps the quiet pill. */
function isCount(badge: string | number) {
  return typeof badge === 'number' || /^\d+\+?$/.test(badge.trim());
}

/** Splits items into runs that share a group, preserving order. */
function groupRuns(items: SidebarPanelItem[]) {
  const runs: { group?: string; items: SidebarPanelItem[] }[] = [];
  for (const item of items) {
    const last = runs[runs.length - 1];
    if (last && last.group === item.group) last.items.push(item);
    else runs.push({ group: item.group, items: [item] });
  }
  return runs;
}

/* ============================================
   COMPONENT
   ============================================ */

/**
 * SidebarPanel — the secondary column of app navigation. Lists the pages
 * inside one section, with optional group headings and one level of
 * accordion nesting. Stands alone, or opens beside `AppSidebar` when its
 * items carry deeper levels (see `subNav` there).
 */
export const SidebarPanel = React.forwardRef<HTMLElement, SidebarPanelProps>(
  (
    {
      items,
      title,
      activeKey,
      defaultOpenKeys,
      onCollapse,
      collapseLabel,
      onBack,
      backLabel = 'Back',
      className = '',
      linkComponent,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-sidebar-panel';
    const Link = useLinkComponent(linkComponent);
    const uid = useId();

    /* The accordion holding the current page starts open, so the reader
       lands with their position already showing. */
    const [openKeys, setOpenKeys] = useState<Set<string>>(() => {
      const initial = new Set(defaultOpenKeys ?? []);
      if (activeKey) {
        for (const item of items) {
          if (item.children?.some((child) => child.key === activeKey)) initial.add(item.key);
        }
      }
      return initial;
    });

    const toggle = useCallback((key: string) => {
      setOpenKeys((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    }, []);

    const renderLeaf = (item: SidebarPanelItem, nested: boolean) => {
      const isActive = item.key === activeKey;
      const classes = [
        `${baseClass}__row`,
        nested ? `${baseClass}__row--nested` : '',
        isActive ? `${baseClass}__row--active` : '',
      ]
        .filter(Boolean)
        .join(' ');
      const content = (
        <>
          <span className={`${baseClass}__label`}>{item.label}</span>
          {item.badge !== undefined && (
            <span className={`${baseClass}__badge${isCount(item.badge) ? ` ${baseClass}__badge--count` : ''}`}>
              {item.badge}
            </span>
          )}
        </>
      );
      return item.href ? (
        <Link
          className={classes}
          href={item.href}
          onClick={() => item.onClick?.()}
          aria-current={isActive ? 'page' : undefined}
        >
          {content}
        </Link>
      ) : (
        <button
          type="button"
          className={classes}
          onClick={() => item.onClick?.()}
          aria-current={isActive ? 'page' : undefined}
        >
          {content}
        </button>
      );
    };

    const renderItem = (item: SidebarPanelItem) => {
      const children = item.children ?? [];
      if (children.length === 0) {
        return <li key={item.key}>{renderLeaf(item, false)}</li>;
      }
      const isOpen = openKeys.has(item.key);
      const holdsActive = children.some((child) => child.key === activeKey);
      const regionId = `${uid}-${item.key.replace(/\s+/g, '-')}`;
      return (
        <li key={item.key}>
          <button
            type="button"
            className={[
              `${baseClass}__row`,
              `${baseClass}__row--parent`,
              holdsActive && !isOpen ? `${baseClass}__row--holds-active` : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-expanded={isOpen}
            aria-controls={regionId}
            onClick={() => {
              toggle(item.key);
              item.onClick?.();
            }}
          >
            <span className={`${baseClass}__label`}>{item.label}</span>
            {item.badge !== undefined && (
            <span className={`${baseClass}__badge${isCount(item.badge) ? ` ${baseClass}__badge--count` : ''}`}>
              {item.badge}
            </span>
          )}
            <span
              className={[
                `${baseClass}__chevron material-symbols-rounded`,
                isOpen ? `${baseClass}__chevron--open` : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-hidden="true"
            >
              expand_more
            </span>
          </button>
          {/* Kept mounted so the height can animate; inert while closed so
              the hidden rows leave the tab order and the accessibility tree. */}
          <div
            id={regionId}
            className={[`${baseClass}__nested`, isOpen ? `${baseClass}__nested--open` : '']
              .filter(Boolean)
              .join(' ')}
            inert={!isOpen}
          >
            <ul className={`${baseClass}__nested-list`}>
              {children.map((child) => (
                <li key={child.key}>{renderLeaf(child, true)}</li>
              ))}
            </ul>
          </div>
        </li>
      );
    };

    return (
      <nav
        {...rest}
        ref={ref}
        className={[baseClass, className].filter(Boolean).join(' ')}
        aria-label={rest['aria-label'] ?? title ?? 'Section navigation'}
      >
        {onBack && (
          <button type="button" className={`${baseClass}__back`} onClick={onBack}>
            <span className={`${baseClass}__back-icon material-symbols-rounded ds-mirror-rtl`} aria-hidden="true">
              chevron_left
            </span>
            <span className={`${baseClass}__label`}>{backLabel}</span>
          </button>
        )}

        {(title || onCollapse) && (
          <div className={`${baseClass}__header`}>
            {title && <h2 className={`${baseClass}__title`}>{title}</h2>}
            {onCollapse && (
              <button
                type="button"
                className={`${baseClass}__collapse`}
                onClick={onCollapse}
                aria-label={collapseLabel ?? (title ? `Collapse ${title}` : 'Collapse panel')}
              >
                <span className="material-symbols-rounded ds-mirror-rtl" aria-hidden="true">
                  left_panel_close
                </span>
              </button>
            )}
          </div>
        )}

        <div className={`${baseClass}__body`}>
          {groupRuns(items).map((run, i) => (
            <div key={`${run.group ?? ''}-${i}`} className={`${baseClass}__group`}>
              {run.group && <div className={`${baseClass}__group-label`}>{run.group}</div>}
              <ul className={`${baseClass}__list`}>{run.items.map(renderItem)}</ul>
            </div>
          ))}
        </div>
      </nav>
    );
  },
);

SidebarPanel.displayName = 'SidebarPanel';
