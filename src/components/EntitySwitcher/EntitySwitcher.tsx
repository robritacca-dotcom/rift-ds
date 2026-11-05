'use client';

import React from 'react';
import { Popover } from '../Popover/Popover';
import { Input } from '../Input/Input';
import { ChosenMark } from '../Dropdown/Dropdown';
import { logicalArrowKey, mirrorClass } from '../../behaviors/direction';
import './EntitySwitcher.css';
import '../../behaviors/direction.css';
import '../../fonts/material-symbols.css';

/** One entity in the tree: a company, a business unit, a team, an advertiser, an account. */
export interface EntitySwitcherItem {
  /** Unique across the whole tree; the value `value` and `onValueChange` carry. */
  id: string;
  /** The entity's name: the trigger's title and the row's label. */
  name: string;
  /** One line under the name. The trigger falls back to the entity's path when it is omitted. */
  description?: string;
  /** A logo or photo, by image URL, filling the mark's tile. Wins over `icon`. Decorative: the name carries the entity. */
  logo?: string;
  /** The mark when there is no `logo`: a Material Symbol name (string) or any element (ReactNode), such as an inline SVG logo. Initials stand in when both are omitted. */
  icon?: string | React.ReactNode;
  /** The entities under this one. Any child anywhere in the tree makes the list drill in. */
  children?: EntitySwitcherItem[];
  /** Whether the entity is shown but cannot be picked or opened. */
  disabled?: boolean;
}

/** Props owned by EntitySwitcher itself; everything else falls through to the root `<div>`. */
type EntitySwitcherOwnProps = {
  /** The top level of the tree. Its shape decides the list: all leaves is one flat list, any children make it drill in. */
  items: EntitySwitcherItem[];
  /** The selected entity's id (controlled). */
  value?: string;
  /** The entity selected at first (uncontrolled). The first entity when omitted. */
  defaultValue?: string;
  /** Called with the id and the entity when one is picked. */
  onValueChange?: (id: string, item: EntitySwitcherItem) => void;
  /** Whether the panel is open (controlled). */
  open?: boolean;
  /** Whether the panel starts open (uncontrolled). */
  defaultOpen?: boolean;
  /** Called when the panel opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /**
   * The mark alone, the rest of the trigger faded out, and the panel opening
   * beside it rather than below: the form for a collapsed rail. The mark
   * never moves between the two forms. Left unset, it follows a host rail
   * that marks itself `data-expanded="false"` (AppSidebar's
   * `persistentTopSlot`).
   */
  collapsed?: boolean;
  /** How many entities, across every level, before the search field appears. */
  searchThreshold?: number;
  /** Accessible name of the trigger and the panel; the selected entity's name follows it on the trigger. */
  switcherLabel?: string;
  /** Placeholder and accessible name of the search field. */
  searchLabel?: string;
  /** The row that climbs out of a level. `{name}` is the level above. */
  backLabel?: string;
  /** Stands in for `{name}` in `backLabel` when the level above is the top. */
  topLevelLabel?: string;
  /** The description of the row that picks a whole branch, leading its level. `{name}` is the branch. */
  wholeBranchLabel?: string;
  /** Shown when a search finds nothing. */
  emptyLabel?: string;
  /** Additional CSS classes on the root. */
  className?: string;
};

export interface EntitySwitcherProps
  extends EntitySwitcherOwnProps,
    Omit<React.ComponentPropsWithRef<'div'>, keyof EntitySwitcherOwnProps | 'children'> {}

type Located = { item: EntitySwitcherItem; path: EntitySwitcherItem[] };

/** Every entity with the ancestors above it, depth first. */
function flatten(items: EntitySwitcherItem[], path: EntitySwitcherItem[] = []): Located[] {
  return items.flatMap((item) => [
    { item, path },
    ...flatten(item.children ?? [], [...path, item]),
  ]);
}

function initials(name: string) {
  const words = name.trim().split(/\s+/);
  const letters = words.length > 1 ? words[0][0] + words[1][0] : name.trim().slice(0, 2);
  return letters.toUpperCase();
}

/** The entity's tile: its logo, else its icon, else its initials. Decorative. */
function Mark({ item, large = false }: { item: EntitySwitcherItem; large?: boolean }) {
  const className = ['ds-entity-switcher__mark', large ? 'ds-entity-switcher__mark--large' : '']
    .filter(Boolean)
    .join(' ');
  let face: React.ReactNode;
  if (item.logo) {
    face = <img className="ds-entity-switcher__mark-image" src={item.logo} alt="" />;
  } else if (typeof item.icon === 'string') {
    face = (
      <span
        className={['material-symbols-rounded', mirrorClass(item.icon), 'ds-entity-switcher__mark-icon']
          .filter(Boolean)
          .join(' ')}
      >
        {item.icon}
      </span>
    );
  } else if (item.icon) {
    face = <span className="ds-entity-switcher__mark-node">{item.icon}</span>;
  } else {
    face = <span className="ds-entity-switcher__mark-initials">{initials(item.name)}</span>;
  }
  return (
    <span className={className} aria-hidden="true">
      {face}
    </span>
  );
}

const fill = (template: string, name: string) => template.replace('{name}', name);

/**
 * EntitySwitcher: the "which one am I looking at" control, an entity's mark,
 * name and description over a panel to switch it. The data shapes the panel:
 * a list of leaves is one flat list, and any nesting makes it drill in, each
 * level led by its parent so a whole branch can be picked, with a back row
 * to climb out and a search across every level once the tree is large.
 * Forwards a ref to the root div and spreads native attributes onto it.
 */
export function EntitySwitcher({
  items,
  value,
  defaultValue,
  onValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  collapsed: collapsedProp,
  searchThreshold = 8,
  switcherLabel = 'Switch entity',
  searchLabel = 'Search',
  backLabel = 'Back to {name}',
  topLevelLabel = 'all',
  wholeBranchLabel = 'All of {name}',
  emptyLabel = 'Nothing matches',
  className = '',
  style,
  ref,
  ...rest
}: EntitySwitcherProps) {
  const all = React.useMemo(() => flatten(items), [items]);
  const byId = React.useMemo(() => new Map(all.map((l) => [l.item.id, l])), [all]);
  const searchable = all.length > searchThreshold;

  const [ownValue, setOwnValue] = React.useState(defaultValue);
  const selectedId = value ?? ownValue;
  const selected = (selectedId ? byId.get(selectedId) : undefined) ?? all[0];

  const [ownOpen, setOwnOpen] = React.useState(defaultOpen);
  const open = openProp ?? ownOpen;

  const [query, setQuery] = React.useState('');
  // The chain of entities drilled into; empty is the top level.
  const [trail, setTrail] = React.useState<EntitySwitcherItem[]>([]);
  // Measured on open: the panel matches the trigger's width below it, or
  // opens beside the mark when the switcher is collapsed.
  const [width, setWidth] = React.useState<number>();
  const [beside, setBeside] = React.useState(false);

  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const setRootRef = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  const setOpen = (next: boolean) => {
    if (next) {
      // Open on the level that holds the selection: a selected parent shows
      // its own level, where it leads the list.
      const s = selected;
      setTrail(s ? (s.item.children?.length ? [...s.path, s.item] : s.path) : []);
      setQuery('');
      const isCollapsed =
        collapsedProp ?? !!rootRef.current?.closest('[data-expanded="false"]');
      setBeside(isCollapsed);
      setWidth(isCollapsed ? undefined : rootRef.current?.getBoundingClientRect().width);
    }
    if (openProp === undefined) setOwnOpen(next);
    onOpenChange?.(next);
  };

  const pick = (item: EntitySwitcherItem) => {
    if (value === undefined) setOwnValue(item.id);
    onValueChange?.(item.id, item);
    setOpen(false);
  };

  const focusFirstRow = () =>
    requestAnimationFrame(() =>
      listRef.current?.querySelector<HTMLElement>('[data-row]:not([aria-disabled="true"])')?.focus(),
    );

  const drill = (next: EntitySwitcherItem[]) => {
    setTrail(next);
    // Keep the keyboard in the list as the level changes under it.
    focusFirstRow();
  };

  const term = query.trim().toLowerCase();
  const level = trail[trail.length - 1];
  const rows: Located[] = term
    ? all.filter((l) => l.item.name.toLowerCase().includes(term))
    : (level?.children ?? items).map((item) => ({ item, path: trail }));

  const onListKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const rowEls = Array.from(
      listRef.current?.querySelectorAll<HTMLElement>('[data-row]:not([aria-disabled="true"])') ?? [],
    );
    const at = rowEls.indexOf(document.activeElement as HTMLElement);
    const key = logicalArrowKey(event.key, event.currentTarget);
    if (key === 'ArrowDown' || key === 'ArrowUp') {
      event.preventDefault();
      const step = key === 'ArrowDown' ? 1 : -1;
      rowEls[(at + step + rowEls.length) % rowEls.length]?.focus();
    } else if (key === 'Home' || key === 'End') {
      event.preventDefault();
      rowEls[key === 'Home' ? 0 : rowEls.length - 1]?.focus();
    } else if (key === 'ArrowLeft' && trail.length && !term) {
      event.preventDefault();
      drill(trail.slice(0, -1));
    } else if (key === 'ArrowRight' && at >= 0) {
      const target = byId.get(rowEls[at].dataset.drill ?? '');
      if (target) {
        event.preventDefault();
        drill([...target.path, target.item]);
      }
    }
  };

  const row = ({ item, path }: Located, lead = false) => {
    const opens = !lead && !term && !!item.children?.length;
    const isSelected = item.id === selected?.item.id;
    const sub = term
      ? path.map((p) => p.name).join(' / ') || item.description
      : lead
        ? fill(wholeBranchLabel, item.name)
        : item.description;
    const rowClass = [
      'ds-entity-switcher__row',
      item.disabled ? 'ds-entity-switcher__row--disabled' : '',
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <button
        key={(lead ? 'lead-' : '') + item.id}
        type="button"
        role={opens ? 'menuitem' : 'menuitemradio'}
        aria-checked={opens ? undefined : isSelected}
        aria-haspopup={opens ? 'menu' : undefined}
        aria-disabled={item.disabled || undefined}
        tabIndex={-1}
        data-row=""
        data-drill={opens && !item.disabled ? item.id : undefined}
        className={rowClass}
        onClick={() => {
          if (item.disabled) return;
          if (opens) drill([...path, item]);
          else pick(item);
        }}
      >
        <Mark item={item} />
        <span className="ds-entity-switcher__text">
          <span className="ds-entity-switcher__name">{item.name}</span>
          {sub && <span className="ds-entity-switcher__description">{sub}</span>}
        </span>
        {opens ? (
          <span
            className="material-symbols-rounded ds-mirror-rtl ds-entity-switcher__trailing"
            aria-hidden="true"
          >
            chevron_right
          </span>
        ) : isSelected ? (
          <ChosenMark />
        ) : null}
      </button>
    );
  };

  const content = (
    <div className="ds-entity-switcher__panel">
      {searchable && (
        <div className="ds-entity-switcher__search">
          <Input
            type="search"
            size="compact"
            iconLeft="search"
            value={query}
            onValueChange={setQuery}
            placeholder={searchLabel}
            aria-label={searchLabel}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                focusFirstRow();
              }
            }}
          />
        </div>
      )}
      <div
        ref={listRef}
        role="menu"
        aria-label={switcherLabel}
        className="ds-entity-switcher__list"
        onKeyDown={onListKeyDown}
      >
        {!term && level && (
          <>
            <button
              type="button"
              role="menuitem"
              tabIndex={-1}
              data-row=""
              className="ds-entity-switcher__row ds-entity-switcher__row--back"
              onClick={() => drill(trail.slice(0, -1))}
            >
              <span
                className="material-symbols-rounded ds-mirror-rtl ds-entity-switcher__back-icon"
                aria-hidden="true"
              >
                arrow_back
              </span>
              <span className="ds-entity-switcher__name">
                {fill(backLabel, trail[trail.length - 2]?.name ?? topLevelLabel)}
              </span>
            </button>
            {row({ item: level, path: trail.slice(0, -1) }, true)}
            <div className="ds-entity-switcher__separator" role="separator" />
          </>
        )}
        {rows.length ? (
          rows.map((l) => row(l))
        ) : (
          <p className="ds-entity-switcher__empty">{emptyLabel}</p>
        )}
      </div>
    </div>
  );

  // Rows take focus by arrow key, so the first one is reached on open.
  React.useEffect(() => {
    if (open && !searchable) focusFirstRow();
  }, [open, searchable]);

  if (!selected) return null;
  const triggerSub =
    selected.item.description ?? (selected.path.map((p) => p.name).join(' / ') || undefined);

  const rootClass = [
    'ds-entity-switcher',
    collapsedProp === true ? 'ds-entity-switcher--collapsed' : '',
    // An explicit `false` opts out of following a collapsed host rail.
    collapsedProp === false ? 'ds-entity-switcher--expanded' : '',
    beside ? 'ds-entity-switcher--beside' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Popover
      {...rest}
      ref={setRootRef}
      className={rootClass}
      style={
        width
          ? ({ ...style, '--ds-entity-switcher-width': `${width}px` } as React.CSSProperties)
          : style
      }
      content={content}
      surface="menu"
      position={beside ? 'end' : 'bottom'}
      align="start"
      open={open}
      onOpenChange={setOpen}
      // Popover names the trigger and the panel with this, so the trigger
      // announces the selection as well as what it does.
      ariaLabel={`${switcherLabel}: ${selected.item.name}`}
    >
      {/* One trigger in both forms: collapsed, the mark holds its seat and
          the rest fades, so nothing jumps. */}
      <button type="button" className="ds-entity-switcher__trigger">
        <Mark item={selected.item} large />
        <span className="ds-entity-switcher__text">
          <span className="ds-entity-switcher__title">{selected.item.name}</span>
          {triggerSub && <span className="ds-entity-switcher__description">{triggerSub}</span>}
        </span>
        <span className="material-symbols-rounded ds-entity-switcher__chevron" aria-hidden="true">
          unfold_more
        </span>
      </button>
    </Popover>
  );
}
