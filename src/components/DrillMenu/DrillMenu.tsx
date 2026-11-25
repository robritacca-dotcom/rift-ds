'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLinkComponent, type LinkComponent } from '../../behaviors/LinkProvider';
import { mirrorClass } from '../../behaviors/direction';
import { ChosenMark } from '../Dropdown/Dropdown';
import '../../behaviors/direction.css';
import { holdsCurrent, idOf, isSection, drillMenuPathTo, rowsOf } from './path';
import './DrillMenu.css';
import '../../fonts/material-symbols.css';

export interface DrillMenuItem {
  /** Row text. */
  label: string;
  /**
   * Where the row links. On a row with `items` it is the level's landing
   * page instead: the level opens with an overview row linking to it.
   */
  href?: string;
  /** Stable identity, used in `path`. Defaults to `href`, then `label`. */
  id?: string;
  /** A second line under the label, in the secondary text style. */
  description?: string;
  /** Icon before the label: a Material Symbol name (string) or a custom element, such as a swatch or a brand mark. */
  icon?: string | React.ReactNode;
  /** A pill after the label: a count (a number, or digits with an optional `+`) on the count badge pair, a word such as "New" as a quiet pill. */
  badge?: string | number;
  /** The setting's current value at the row's trailing end, such as "Dark", on a row that drills into a list of choices. */
  value?: string;
  /** The heading of the level this row opens, and the name the back rows below it give that level. Defaults to `label`, for a row whose label is a value (a chosen account) rather than the level's name. */
  title?: string;
  /** Rows on the level this row opens. A row with items drills in instead of navigating. */
  items?: DrillMenuEntry[];
  /**
   * Marks the row as the page being viewed, regardless of the exact match
   * against `currentHref`, for a section that stays current on its child
   * routes.
   */
  current?: boolean;
  /** On an `onClick` row in a list of choices, whether it is the chosen one: true carries the chosen mark, and either value sets `aria-pressed`. */
  selected?: boolean;
  /** The link leaves the site: it opens in a new tab and carries an outward arrow. */
  external?: boolean;
  /**
   * Makes the row an action rather than a link, such as a pick or a copy.
   * The stack stays on its level; a choice list's rows set `selected` too.
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * A group of rows under an optional heading: one level's resources or
 * settings, say, set apart from the rows above it.
 */
export interface DrillMenuSection {
  /** Marks the entry as a section rather than a row. */
  type: 'section';
  /** The heading over the rows. Leave it out for a group set apart by space alone. */
  label?: string;
  /** The section's rows. */
  items: DrillMenuItem[];
  /**
   * `prominent` draws the rows in the heading-3 style on a taller row, for
   * a menu that wants its top level louder. The site header's and the app
   * sidebar's drawers keep the default rows.
   * @default 'default'
   */
  variant?: 'default' | 'prominent';
  /** Stable identity for the React key. Defaults to the label. */
  id?: string;
}

/** An entry on a level: a row, or a section of rows. */
export type DrillMenuEntry = DrillMenuItem | DrillMenuSection;

const isCount = (badge: string | number) => typeof badge === 'number' || /^\d+\+?$/.test(badge);

/** Props owned by DrillMenu itself — everything else falls through to the `<nav>`. */
type DrillMenuOwnProps = {
  /** The first level's rows and sections. A row with `items` drills into the next level. */
  items: DrillMenuEntry[];
  /** href of the current page: the exactly matching row gets `aria-current="page"` and the current treatment, and every row on the way to it the current treatment. */
  currentHref?: string;
  /** The ids of the rows drilled into, first level first: `[]` is the first level. Pair with `onPathChange`. */
  path?: string[];
  /**
   * The path the stack opens on, when it owns its state. Left out, it opens
   * on the deepest level that holds the current page (`currentHref`, or a
   * row marked `current`), so a reader deep in a section reopens the menu
   * where they are; `[]` opens on the first level always.
   */
  defaultPath?: string[];
  /** Fires with the new path whenever a row drills in or the back row steps out, in both controlled and uncontrolled modes. */
  onPathChange?: (path: string[]) => void;
  /** Fires when a link row is followed, alongside native navigation, such as to close the drawer the stack sits in. */
  onNavigate?: (item: DrillMenuItem, event: React.MouseEvent<HTMLElement>) => void;
  /** Content above the first level's rows, such as a search field. */
  header?: React.ReactNode;
  /** The back row's text on the second level, naming the first. */
  rootLabel?: string;
  /** The back row's accessible name, given the title of the level it returns to. Defaults to "Back to <title>". */
  backLabel?: (title: string) => string;
  /** The overview row's text on a level whose row has an `href`, given that row's label. Defaults to "<label> overview". */
  overviewLabel?: (label: string) => string;
  /** The accessible name of the `<nav>` landmark. */
  navLabel?: string;
  /**
   * The component its links render with, such as Next.js's `Link`, so they
   * navigate through the app's router. Wins over a LinkProvider's; a plain
   * `<a>` when neither is set.
   */
  linkComponent?: LinkComponent;
  /** Additional CSS classes. */
  className?: string;
};

export interface DrillMenuProps
  extends DrillMenuOwnProps,
    Omit<React.ComponentPropsWithRef<'nav'>, keyof DrillMenuOwnProps> {}


/**
 * A drill-in menu for a phone: each level fills the space it is given, a
 * row with children opens the next level in its place, and a back row
 * names the level it returns to. Rows are a touch target tall, with an
 * optional icon, a second line, a current value and a trailing chevron,
 * external arrow or chosen mark, every label on one start line. The level
 * changes with a short slide along the reading direction; focus moves to
 * the new level's title, and back to the row it came from on the way out.
 * The path is uncontrolled by default (`defaultPath`) or controlled with
 * `path` and `onPathChange`.
 */
export function DrillMenu({
  items,
  currentHref,
  path: pathProp,
  defaultPath,
  onPathChange,
  onNavigate,
  header,
  rootLabel = 'Menu',
  backLabel = (title) => `Back to ${title}`,
  overviewLabel = (label) => `${label} overview`,
  navLabel = 'Menu',
  linkComponent,
  className = '',
  ref,
  ...rest
}: DrillMenuProps) {
  const Link = useLinkComponent(linkComponent);
  const [ownPath, setOwnPath] = useState<string[]>(() => defaultPath ?? drillMenuPathTo(items, currentHref));
  const path = pathProp ?? ownPath;
  // Which way the last step went; null until the first step, so the first
  // render neither animates nor moves focus.
  const [direction, setDirection] = useState<'in' | 'out' | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const levelRef = useRef<HTMLDivElement>(null);
  // The row to return focus to after stepping out.
  const returnTo = useRef<string | null>(null);

  // Walk the path; a stale id (the items changed under it) stops the walk.
  const trail: DrillMenuItem[] = [];
  let entries = items;
  for (const id of path) {
    const next = rowsOf(entries).find((row) => idOf(row) === id && row.items);
    if (!next) break;
    trail.push(next);
    entries = next.items!;
  }
  const level = trail[trail.length - 1];
  const parent = trail[trail.length - 2];

  const setPath = (next: string[]) => {
    if (pathProp === undefined) setOwnPath(next);
    onPathChange?.(next);
  };
  /* After a step, the new level's control under the pointer (the search
     field where the back row was) would show a hover the reader never
     gave it. The stack marks itself settling until the pointer next
     moves, and hover holds off until then; clicks still land. */
  const settle = (from: HTMLElement) => {
    const nav = from.closest<HTMLElement>('.ds-drill-menu');
    if (!nav) return;
    nav.setAttribute('data-settling', '');
    const done = () => {
      nav.removeAttribute('data-settling');
      nav.removeEventListener('pointermove', done);
    };
    nav.addEventListener('pointermove', done);
  };
  const drillIn = (item: DrillMenuItem) => {
    setDirection('in');
    returnTo.current = null;
    setPath([...trail.map(idOf), idOf(item)]);
  };
  const stepOut = () => {
    setDirection('out');
    returnTo.current = level ? idOf(level) : null;
    setPath(trail.slice(0, -1).map(idOf));
  };

  // Focus follows the step: into the new level's title, or back onto the
  // row the reader came from.
  useLayoutEffect(() => {
    if (direction === null) return;
    const back = returnTo.current;
    const row = back ? levelRef.current?.querySelector<HTMLElement>(`[data-drill-menu-id="${CSS.escape(back)}"]`) : null;
    (row ?? titleRef.current ?? levelRef.current?.querySelector<HTMLElement>('a, button'))?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- a step, not the direction, moves focus
  }, [trail.length]);

  // A level starts at its top: the scroll area around the stack (a
  // drawer's body) is brought back up to it.
  useEffect(() => {
    if (direction === null) return;
    // Only the vertical scroll moves: scrollIntoView would also slide a
    // scroll area that has any room sideways.
    for (let node = levelRef.current?.parentElement; node; node = node.parentElement) {
      const { overflowY } = getComputedStyle(node);
      if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) {
        node.scrollTo({ top: 0 });
        break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- a step, not the direction, scrolls
  }, [trail.length]);

  const renderRow = (item: DrillMenuItem, variant: 'default' | 'prominent' = 'default') => {
    const id = idOf(item);
    const drills = Boolean(item.items);
    const isCurrent = holdsCurrent(item, currentHref);
    const exact = !drills && (item.current || (currentHref != null && item.href === currentHref));
    const classes = [
      'ds-drill-menu__row',
      variant === 'prominent' && 'ds-drill-menu__row--prominent',
      isCurrent && 'ds-drill-menu__row--current',
    ]
      .filter(Boolean)
      .join(' ');
    const trailing = drills ? (
      <span className="ds-drill-menu__chevron material-symbols-rounded ds-mirror-rtl" aria-hidden="true">
        chevron_right
      </span>
    ) : item.selected ? (
      <ChosenMark className="ds-drill-menu__chosen" />
    ) : item.external ? (
      <span className="ds-drill-menu__external material-symbols-rounded" aria-hidden="true">
        arrow_outward
      </span>
    ) : null;
    const body = (
      <>
        {item.icon != null && (
          <span className="ds-drill-menu__icon" aria-hidden="true">
            {typeof item.icon === 'string' ? <span className={`material-symbols-rounded ${mirrorClass(item.icon)}`}>{item.icon}</span> : item.icon}
          </span>
        )}
        <span className="ds-drill-menu__text">
          <span className="ds-drill-menu__label">{item.label}</span>
          {item.description && <span className="ds-drill-menu__description">{item.description}</span>}
        </span>
        {item.badge !== undefined && (
          <span className={`ds-drill-menu__badge${isCount(item.badge) ? ' ds-drill-menu__badge--count' : ''}`}>{item.badge}</span>
        )}
        {item.value && <span className="ds-drill-menu__value">{item.value}</span>}
        {trailing && <span className="ds-drill-menu__trail">{trailing}</span>}
      </>
    );

    if (drills || item.onClick || !item.href) {
      return (
        <li key={id} className="ds-drill-menu__item">
          <button
            type="button"
            className={classes}
            data-drill-menu-id={id}
            aria-pressed={item.selected !== undefined && !drills ? item.selected : undefined}
            onClick={(event) => {
              if (drills) {
                settle(event.currentTarget);
                drillIn(item);
              }
              else item.onClick?.(event);
            }}
          >
            {body}
          </button>
        </li>
      );
    }
    return (
      <li key={id} className="ds-drill-menu__item">
        <Link
          href={item.href}
          className={classes}
          data-drill-menu-id={id}
          aria-current={exact ? 'page' : undefined}
          {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          onClick={(event: React.MouseEvent<HTMLElement>) => onNavigate?.(item, event)}
        >
          {body}
        </Link>
      </li>
    );
  };

  // Rows outside any section gather into unnamed groups between sections,
  // so every row sits in a list.
  const groups: { key: string; section?: DrillMenuSection; rows: DrillMenuItem[] }[] = [];
  entries.forEach((entry, index) => {
    if (isSection(entry)) groups.push({ key: entry.id ?? entry.label ?? `section-${index}`, section: entry, rows: entry.items });
    else {
      const last = groups[groups.length - 1];
      if (last && !last.section) last.rows.push(entry);
      else groups.push({ key: `rows-${index}`, rows: [entry] });
    }
  });

  return (
    <nav {...rest} ref={ref} aria-label={navLabel} className={['ds-drill-menu', className].filter(Boolean).join(' ')}>
      <div
        ref={levelRef}
        key={trail.map(idOf).join('/') || 'root'}
        className={['ds-drill-menu__level', direction && `ds-drill-menu__level--${direction}`]
          .filter(Boolean)
          .join(' ')}
      >
        {level ? (
          <div className="ds-drill-menu__head">
            <button type="button" className="ds-drill-menu__back" aria-label={backLabel(parent ? parent.title ?? parent.label : rootLabel)} onClick={(event) => {
                settle(event.currentTarget);
                stepOut();
              }}>
              <span className="ds-drill-menu__back-chevron material-symbols-rounded ds-mirror-rtl" aria-hidden="true">
                chevron_left
              </span>
              <span>{parent ? parent.title ?? parent.label : rootLabel}</span>
            </button>
            <h2 ref={titleRef} tabIndex={-1} className="ds-drill-menu__title">
              {level.title ?? level.label}
            </h2>
          </div>
        ) : (
          header && <div className="ds-drill-menu__header">{header}</div>
        )}

        {level?.href && (
          <ul className="ds-drill-menu__list">
            {renderRow({ label: overviewLabel(level.label), href: level.href, icon: level.icon, id: `${idOf(level)}#overview` })}
          </ul>
        )}

        {groups.map(({ key, section, rows }) => (
          <section key={key} className="ds-drill-menu__section">
            {section?.label && <h3 className="ds-drill-menu__section-label">{section.label}</h3>}
            <ul className="ds-drill-menu__list">{rows.map((item) => renderRow(item, section?.variant))}</ul>
          </section>
        ))}
      </div>
    </nav>
  );
}
