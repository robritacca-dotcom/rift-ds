'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLinkComponent, type LinkComponent } from '../../behaviors/LinkProvider';
import { mirrorClass } from '../../behaviors/direction';
import { ChosenMark } from '../Dropdown/Dropdown';
import '../../behaviors/direction.css';
import './NavStack.css';
import '../../fonts/material-symbols.css';

export interface NavStackItem {
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
  items?: NavStackEntry[];
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
export interface NavStackSection {
  /** Marks the entry as a section rather than a row. */
  type: 'section';
  /** The heading over the rows. Leave it out for a group set apart by space alone. */
  label?: string;
  /** The section's rows. */
  items: NavStackItem[];
  /**
   * `prominent` draws the rows in the heading-3 style on a taller row: a
   * site menu's top-level sections, read first.
   * @default 'default'
   */
  variant?: 'default' | 'prominent';
  /** Stable identity for the React key. Defaults to the label. */
  id?: string;
}

/** An entry on a level: a row, or a section of rows. */
export type NavStackEntry = NavStackItem | NavStackSection;

const isSection = (entry: NavStackEntry): entry is NavStackSection => (entry as NavStackSection).type === 'section';
const isCount = (badge: string | number) => typeof badge === 'number' || /^\d+\+?$/.test(badge);
const idOf = (item: NavStackItem) => item.id ?? item.href ?? item.label;

/** Props owned by NavStack itself — everything else falls through to the `<nav>`. */
type NavStackOwnProps = {
  /** The first level's rows and sections. A row with `items` drills into the next level. */
  items: NavStackEntry[];
  /** href of the current page: the exactly matching row gets `aria-current="page"` and the current treatment, and every row on the way to it the current treatment. */
  currentHref?: string;
  /** The ids of the rows drilled into, first level first: `[]` is the first level. Pair with `onPathChange`. */
  path?: string[];
  /** The path the stack opens on, when it owns its state. */
  defaultPath?: string[];
  /** Fires with the new path whenever a row drills in or the back row steps out, in both controlled and uncontrolled modes. */
  onPathChange?: (path: string[]) => void;
  /** Fires when a link row is followed, alongside native navigation, such as to close the drawer the stack sits in. */
  onNavigate?: (item: NavStackItem, event: React.MouseEvent<HTMLElement>) => void;
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

export interface NavStackProps
  extends NavStackOwnProps,
    Omit<React.ComponentPropsWithRef<'nav'>, keyof NavStackOwnProps> {}

/** Whether a row is the current page, or holds it somewhere below. */
function holdsCurrent(item: NavStackItem, currentHref?: string): boolean {
  if (item.current) return true;
  if (currentHref && item.href === currentHref) return true;
  return (item.items ?? []).some((entry) =>
    isSection(entry) ? entry.items.some((child) => holdsCurrent(child, currentHref)) : holdsCurrent(entry, currentHref),
  );
}

/** The rows a level lists, sections opened up. */
const rowsOf = (entries: NavStackEntry[]) => entries.flatMap((entry) => (isSection(entry) ? entry.items : [entry]));

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
export function NavStack({
  items,
  currentHref,
  path: pathProp,
  defaultPath = [],
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
}: NavStackProps) {
  const Link = useLinkComponent(linkComponent);
  const [ownPath, setOwnPath] = useState<string[]>(defaultPath);
  const path = pathProp ?? ownPath;
  // Which way the last step went; null until the first step, so the first
  // render neither animates nor moves focus.
  const [direction, setDirection] = useState<'in' | 'out' | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const levelRef = useRef<HTMLDivElement>(null);
  // The row to return focus to after stepping out.
  const returnTo = useRef<string | null>(null);

  // Walk the path; a stale id (the items changed under it) stops the walk.
  const trail: NavStackItem[] = [];
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
    const nav = from.closest<HTMLElement>('.ds-nav-stack');
    if (!nav) return;
    nav.setAttribute('data-settling', '');
    const done = () => {
      nav.removeAttribute('data-settling');
      nav.removeEventListener('pointermove', done);
    };
    nav.addEventListener('pointermove', done);
  };
  const drillIn = (item: NavStackItem) => {
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
    const row = back ? levelRef.current?.querySelector<HTMLElement>(`[data-nav-stack-id="${CSS.escape(back)}"]`) : null;
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

  const renderRow = (item: NavStackItem, variant: 'default' | 'prominent' = 'default') => {
    const id = idOf(item);
    const drills = Boolean(item.items);
    const isCurrent = holdsCurrent(item, currentHref);
    const exact = !drills && (item.current || (currentHref != null && item.href === currentHref));
    const classes = [
      'ds-nav-stack__row',
      variant === 'prominent' && 'ds-nav-stack__row--prominent',
      isCurrent && 'ds-nav-stack__row--current',
    ]
      .filter(Boolean)
      .join(' ');
    const trailing = drills ? (
      <span className="ds-nav-stack__chevron material-symbols-rounded ds-mirror-rtl" aria-hidden="true">
        chevron_right
      </span>
    ) : item.selected ? (
      <ChosenMark className="ds-nav-stack__chosen" />
    ) : item.external ? (
      <span className="ds-nav-stack__external material-symbols-rounded" aria-hidden="true">
        arrow_outward
      </span>
    ) : null;
    const body = (
      <>
        {item.icon != null && (
          <span className="ds-nav-stack__icon" aria-hidden="true">
            {typeof item.icon === 'string' ? <span className={`material-symbols-rounded ${mirrorClass(item.icon)}`}>{item.icon}</span> : item.icon}
          </span>
        )}
        <span className="ds-nav-stack__text">
          <span className="ds-nav-stack__label">{item.label}</span>
          {item.description && <span className="ds-nav-stack__description">{item.description}</span>}
        </span>
        {item.badge !== undefined && (
          <span className={`ds-nav-stack__badge${isCount(item.badge) ? ' ds-nav-stack__badge--count' : ''}`}>{item.badge}</span>
        )}
        {item.value && <span className="ds-nav-stack__value">{item.value}</span>}
        {trailing && <span className="ds-nav-stack__trail">{trailing}</span>}
      </>
    );

    if (drills || item.onClick || !item.href) {
      return (
        <li key={id} className="ds-nav-stack__item">
          <button
            type="button"
            className={classes}
            data-nav-stack-id={id}
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
      <li key={id} className="ds-nav-stack__item">
        <Link
          href={item.href}
          className={classes}
          data-nav-stack-id={id}
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
  const groups: { key: string; section?: NavStackSection; rows: NavStackItem[] }[] = [];
  entries.forEach((entry, index) => {
    if (isSection(entry)) groups.push({ key: entry.id ?? entry.label ?? `section-${index}`, section: entry, rows: entry.items });
    else {
      const last = groups[groups.length - 1];
      if (last && !last.section) last.rows.push(entry);
      else groups.push({ key: `rows-${index}`, rows: [entry] });
    }
  });

  return (
    <nav {...rest} ref={ref} aria-label={navLabel} className={['ds-nav-stack', className].filter(Boolean).join(' ')}>
      <div
        ref={levelRef}
        key={trail.map(idOf).join('/') || 'root'}
        className={['ds-nav-stack__level', direction && `ds-nav-stack__level--${direction}`]
          .filter(Boolean)
          .join(' ')}
      >
        {level ? (
          <div className="ds-nav-stack__head">
            <button type="button" className="ds-nav-stack__back" aria-label={backLabel(parent ? parent.title ?? parent.label : rootLabel)} onClick={(event) => {
                settle(event.currentTarget);
                stepOut();
              }}>
              <span className="ds-nav-stack__back-chevron material-symbols-rounded ds-mirror-rtl" aria-hidden="true">
                chevron_left
              </span>
              <span>{parent ? parent.title ?? parent.label : rootLabel}</span>
            </button>
            <h2 ref={titleRef} tabIndex={-1} className="ds-nav-stack__title">
              {level.title ?? level.label}
            </h2>
          </div>
        ) : (
          header && <div className="ds-nav-stack__header">{header}</div>
        )}

        {level?.href && (
          <ul className="ds-nav-stack__list">
            {renderRow({ label: overviewLabel(level.label), href: level.href, icon: level.icon, id: `${idOf(level)}#overview` })}
          </ul>
        )}

        {groups.map(({ key, section, rows }) => (
          <section key={key} className="ds-nav-stack__section">
            {section?.label && <h3 className="ds-nav-stack__section-label">{section.label}</h3>}
            <ul className="ds-nav-stack__list">{rows.map((item) => renderRow(item, section?.variant))}</ul>
          </section>
        ))}
      </div>
    </nav>
  );
}
