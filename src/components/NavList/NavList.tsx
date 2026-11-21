'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { Button } from '../Button/Button';
import { Badge } from '../Badge/Badge';
import { MOTION_SCROLL_SETTLE_MS } from '../../tokens/motion';
import type { LinkComponent } from '../../behaviors/LinkProvider';
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
  /** A short tag after the label, such as "New" or "Beta", drawn as a neutral Badge. */
  badge?: string;
}

/**
 * A titled section of rows: a heading over its items, the way a long
 * documentation sidebar groups its pages. Sections sit only at the top
 * level; their items nest like any others.
 */
export interface NavListSection {
  /** Marks the entry as a section rather than a row. */
  type: 'section';
  /** The section's heading. */
  label: string;
  /** The section's rows. */
  items: NavListItem[];
  /** Stable identity for its expansion state. Defaults to the label. */
  id?: string;
  /** Let the reader fold the section under its heading. Default false: the heading is a plain label. */
  collapsible?: boolean;
}

/** A top-level entry: a row, or a section of rows. */
export type NavListEntry = NavListItem | NavListSection;

const isSection = (entry: NavListEntry): entry is NavListSection => (entry as NavListSection).type === 'section';

/** Props owned by NavList itself — everything else falls through to the list element. */
type NavListOwnProps = {
  /** Navigation tree to render: rows, and at the top level, sections of rows. */
  items: NavListEntry[];
  /**
   * Row density. `default` is the drawer's 40px top row; `compact` sets
   * every row on the 32px compact control height, for a long sidebar of
   * pages (a documentation site's hundred entries).
   */
  size?: 'default' | 'compact';
  /**
   * Make the list its own scroll area: it fills the height its parent
   * gives it, scrolls inside without carrying the page along at its ends,
   * and brings the current row into view when it first renders. Put it in
   * a column with a fixed or sticky height.
   */
  scrollable?: boolean;
  /** Accessible name for a section's fold toggle while folded, given its heading. Defaults to "Expand <label>". */
  sectionExpandLabel?: (label: string) => string;
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
  /** Accessible name of a collapsed section's chevron toggle, given the row's label. Defaults to "Expand <label>". */
  expandLabel?: (label: string) => string;
  /** Accessible name of an expanded section's chevron toggle, given the row's label. Defaults to "Collapse <label>". */
  collapseLabel?: (label: string) => string;
  /**
   * The component its links render with, such as Next.js's `Link`, so they
   * navigate through the app's router; passed on to each row's Button. Wins over a
   * LinkProvider's; a plain `<a>` when neither is set.
   */
  linkComponent?: LinkComponent;
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
      size = 'default',
      scrollable = false,
      sectionExpandLabel,
      currentHref,
      expandedIds,
      defaultExpandedIds,
      onExpandedChange,
      multiple = false,
      onNavigate,
      expandLabel = (label) => `Expand ${label}`,
      collapseLabel = (label) => `Collapse ${label}`,
      linkComponent,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-nav-list';
    const uid = useId();

    const itemId = (item: NavListItem) => item.id ?? item.href;
    const sectionId = (section: NavListSection) => `section:${section.id ?? section.label}`;

    // Uncontrolled, the branch that holds the current page starts open, so
    // a reader landing deep in a long tree sees where they are.
    const [internalExpanded, setInternalExpanded] = useState<string[]>(() => {
      const open = new Set(defaultExpandedIds ?? []);
      const holdsCurrent = (item: NavListItem): boolean =>
        (item.current ?? (currentHref !== undefined && item.href === currentHref)) ||
        Boolean(item.items?.some(holdsCurrent));
      const walk = (list: NavListItem[]) => {
        for (const item of list) {
          if (item.items?.some(holdsCurrent)) open.add(itemId(item));
          if (item.items) walk(item.items);
        }
      };
      for (const entry of items) {
        if (isSection(entry)) {
          if (entry.collapsible && entry.items.some(holdsCurrent)) open.add(sectionId(entry));
          walk(entry.items);
        } else {
          walk([entry]);
        }
      }
      return [...open];
    });
    const expanded = expandedIds ?? internalExpanded;
    const rootRef = useRef<HTMLUListElement | null>(null);
    const setRootRef = (node: HTMLUListElement | null) => {
      rootRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    // A scrollable list keeps its scrollbar out of sight until it scrolls,
    // and fades its content out at whichever end has more to scroll to.
    // Written straight to the DOM (data attributes), never React state, so
    // a scroll re-renders nothing.
    useEffect(() => {
      const root = rootRef.current;
      if (!scrollable || !root) return;
      let settle: ReturnType<typeof setTimeout> | undefined;
      const edges = () => {
        const max = root.scrollHeight - root.clientHeight;
        root.toggleAttribute('data-fade-start', root.scrollTop > 1);
        root.toggleAttribute('data-fade-end', root.scrollTop < max - 1);
      };
      const onScroll = () => {
        edges();
        root.setAttribute('data-scrolling', '');
        clearTimeout(settle);
        settle = setTimeout(() => root.removeAttribute('data-scrolling'), MOTION_SCROLL_SETTLE_MS);
      };
      edges();
      root.addEventListener('scroll', onScroll, { passive: true });
      const resize = new ResizeObserver(edges);
      resize.observe(root);
      return () => {
        clearTimeout(settle);
        root.removeEventListener('scroll', onScroll);
        resize.disconnect();
      };
    }, [scrollable]);

    // A scrollable list brings the current row into view once, on mount,
    // scrolling only itself: never the page around it.
    useEffect(() => {
      const root = rootRef.current;
      if (!scrollable || !root) return;
      const row = root.querySelector<HTMLElement>('[aria-current="page"]');
      if (!row) return;
      const top = row.getBoundingClientRect().top - root.getBoundingClientRect().top;
      if (top < 0 || top > root.clientHeight - row.offsetHeight) {
        root.scrollTop += top - root.clientHeight / 3;
      }
      // Mount only: later navigation is the reader's own scroll.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
            size={level === 1 && size === 'default' ? 'default' : 'compact'}
            label={item.label}
            iconRight={item.badge ? <Badge className={`${baseClass}__badge`} label={item.badge} variant="neutral" /> : undefined}
            href={item.href}
            linkComponent={linkComponent}
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
                aria-label={isOpen ? collapseLabel(item.label) : expandLabel(item.label)}
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

    const renderSection = (section: NavListSection) => {
      const id = sectionId(section);
      const panelId = `${uid}-${id}`;
      const isOpen = !section.collapsible || expanded.includes(id);
      return (
        <li key={id} className={`${baseClass}__section`}>
          {section.collapsible ? (
            <button
              type="button"
              className={`${baseClass}__heading ${baseClass}__heading--toggle`}
              aria-expanded={isOpen}
              aria-controls={panelId}
              aria-label={isOpen ? collapseLabel(section.label) : (sectionExpandLabel ?? expandLabel)(section.label)}
              onClick={() => toggle(id)}
            >
              <span className={`${baseClass}__heading-text`}>{section.label}</span>
              <span className={`${baseClass}__chevron material-symbols-rounded`} aria-hidden="true">
                expand_more
              </span>
            </button>
          ) : (
            <span className={`${baseClass}__heading`} id={`${panelId}-heading`}>
              {section.label}
            </span>
          )}
          <div
            id={panelId}
            className={`${baseClass}__panel ${isOpen ? `${baseClass}__panel--open` : ''}`}
            inert={!isOpen}
          >
            <ul
              className={`${baseClass}__section-list`}
              aria-labelledby={section.collapsible ? undefined : `${panelId}-heading`}
              aria-label={section.collapsible ? section.label : undefined}
            >
              {renderItems(1, section.items)}
            </ul>
          </div>
        </li>
      );
    };

    const classes = [
      baseClass,
      size === 'compact' ? `${baseClass}--compact` : '',
      scrollable ? `${baseClass}--scrollable` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <ul {...rest} ref={setRootRef} className={classes}>
        {items.map((entry) => (isSection(entry) ? renderSection(entry) : renderItems(1, [entry])))}
      </ul>
    );
  },
);

NavList.displayName = 'NavList';
