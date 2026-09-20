'use client';

import React, { useId, useState } from 'react';
import { Button } from '../Button/Button';
import './NavList.css';
import '../../fonts/material-symbols.css';

export interface NavListItem {
  /** Row text. */
  label: string;
  /** Link destination — every row is a real link. */
  href: string;
  /** Stable identity for expansion state and aria wiring. Defaults to `href`. */
  id?: string;
  /** Child rows, indented one level. Nesting is supported three levels deep. */
  items?: NavListItem[];
  /**
   * When false, an item with children renders no toggle and its children stay
   * visible — a permanent group rather than a collapsible section.
   */
  collapsible?: boolean;
  /**
   * Forces the current-page treatment on this row regardless of the exact
   * match against `currentHref` — for prefix-matched sections that should
   * stay current on their child routes.
   */
  current?: boolean;
}

/** Props owned by NavList itself — everything else falls through to the list element. */
type NavListOwnProps = {
  /** Navigation tree to render. */
  items: NavListItem[];
  /** href of the current page — the exactly matching row gets `aria-current="page"` and the active treatment. */
  currentHref?: string;
  /** Controlled list of expanded item ids. */
  expandedIds?: string[];
  /** Initially expanded item ids (uncontrolled). */
  defaultExpandedIds?: string[];
  /** Fires with the full new list of expanded ids whenever a toggle is pressed, in both controlled and uncontrolled modes. */
  onExpandedChange?: (expandedIds: string[]) => void;
  /** Allow several sections expanded at once. Default false — expanding one collapses the rest. */
  multiple?: boolean;
  /** Fires when any link is clicked, alongside native navigation — e.g. to close the drawer that contains the list. */
  onNavigate?: (item: NavListItem, event: React.MouseEvent<HTMLElement>) => void;
  /** Additional CSS classes */
  className?: string;
};

export interface NavListProps
  extends NavListOwnProps,
    Omit<React.ComponentPropsWithoutRef<'ul'>, keyof NavListOwnProps> {}

const MAX_DEPTH = 3;

/**
 * Vertical list of navigation links for drawers and side menus.
 *
 * Every row is a real link, rendered as a tertiary Button so shape, sizing,
 * and interaction states stay identical to every other button in the system.
 * An item with children gets a separate chevron toggle — tapping the label
 * navigates, tapping the chevron expands — and collapsed sublists are `inert`,
 * so they leave the tab order and the accessibility tree. Expansion is
 * uncontrolled by default (`defaultExpandedIds`) or controlled via
 * `expandedIds` + `onExpandedChange`.
 */
export const NavList = React.forwardRef<HTMLUListElement, NavListProps>(
  (
    {
      items,
      currentHref,
      expandedIds,
      defaultExpandedIds,
      onExpandedChange,
      multiple = false,
      onNavigate,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-nav-list';
    const uid = useId();

    const [internalExpanded, setInternalExpanded] = useState<string[]>(
      defaultExpandedIds ?? [],
    );
    const expanded = expandedIds ?? internalExpanded;

    const itemId = (item: NavListItem) => item.id ?? item.href;

    const toggle = (id: string) => {
      const next = expanded.includes(id)
        ? expanded.filter((entry) => entry !== id)
        : multiple
          ? [...expanded, id]
          : [id];
      if (expandedIds === undefined) setInternalExpanded(next);
      onExpandedChange?.(next);
    };

    const renderItems = (level: number, levelItems: NavListItem[]) =>
      levelItems.map((item) => {
        const id = itemId(item);
        const isCurrent = item.current ?? (currentHref !== undefined && item.href === currentHref);
        const children = level < MAX_DEPTH ? item.items : undefined;
        const collapsible = item.collapsible ?? true;
        const isOpen = expanded.includes(id);
        const panelId = `${uid}-${id}`;

        const link = (
          <Button
            variant="tertiary"
            size={level === 1 ? 'default' : 'compact'}
            label={item.label}
            href={item.href}
            ariaCurrent={isCurrent}
            className={isCurrent ? 'ds-button--active' : undefined}
            onClick={(event) => onNavigate?.(item, event)}
          />
        );

        if (!children || children.length === 0) {
          return (
            <li key={id} className={`${baseClass}__item`}>
              {link}
            </li>
          );
        }

        if (!collapsible) {
          return (
            <li key={id} className={`${baseClass}__item`}>
              {link}
              <ul className={`${baseClass}__sublist`}>{renderItems(level + 1, children)}</ul>
            </li>
          );
        }

        return (
          <li key={id} className={`${baseClass}__item`}>
            <div className={`${baseClass}__row`}>
              {link}
              <button
                type="button"
                className={`${baseClass}__toggle`}
                aria-expanded={isOpen}
                aria-controls={panelId}
                aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${item.label}`}
                onClick={() => toggle(id)}
              >
                <span
                  className={`${baseClass}__chevron material-symbols-rounded`}
                  aria-hidden="true"
                >
                  expand_more
                </span>
              </button>
            </div>
            <div
              id={panelId}
              className={`${baseClass}__panel ${isOpen ? `${baseClass}__panel--open` : ''}`}
              inert={!isOpen}
            >
              <ul className={`${baseClass}__sublist`}>{renderItems(level + 1, children)}</ul>
            </div>
          </li>
        );
      });

    return (
      <ul {...rest} ref={ref} className={`${baseClass} ${className}`.trim()}>
        {renderItems(1, items)}
      </ul>
    );
  },
);

NavList.displayName = 'NavList';
