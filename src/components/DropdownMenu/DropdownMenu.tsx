'use client';

import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import { ChosenMark } from '../Dropdown/Dropdown';
import { CheckboxIndicator } from '../Checkbox/Checkbox';
import { useLayer } from '../../behaviors/useLayer';
import { useAnchoredPosition } from '../../behaviors/useAnchoredPosition';
import { MOTION_HOVER_HIDE_DELAY_MS } from '../../tokens/motion';
import './DropdownMenu.css';
import '../../fonts/material-symbols.css';
import { MenuKeyLabelsContext, MenuShortcutHint } from './ShortcutHint';
import { shortcutAriaAnyPlatform, type Shortcut, type ShortcutKeyLabels } from '../../behaviors/shortcut-keys';

/* ============================================
   TYPES
   ============================================ */

export interface DropdownMenuItem {
  type?: 'item';
  /** Display label */
  label: string;
  /** Keyboard shortcut hint as literal text (e.g. "⇧ ⌘ P"). `keys` writes it for the reader's platform instead. */
  shortcut?: string;
  /** Keyboard shortcut hint in the shortcut grammar (`mod+shift+p`), written for the reader's platform (⇧⌘P on a Mac, Ctrl+Shift+P elsewhere) and announced through `aria-keyshortcuts`. Display only: bind the action itself with `useShortcut`. Wins over `shortcut`. */
  keys?: Shortcut;
  /** Item icon — Material Symbol name (string) or custom element (ReactNode) */
  icon?: string | React.ReactNode;
  /** Disabled state */
  disabled?: boolean;
  /** Marks a dangerous or irreversible item (delete, remove…): it takes the destructive colour, with the error tint on hover and focus */
  destructive?: boolean;
  /** Marks the item as the current choice of a set: it holds the passive wash and a trailing check, and is announced as a checked radio item. Leave undefined on plain action items; pass `false` on the unchosen members of a set so they are announced as radio items too. Ignored on an item that opens a sub-menu. */
  selected?: boolean;
  /** Marks the item as one of a set picked independently: it leads with the checkbox's box, ticked when true, and is announced as a checkbox item. Leave undefined on plain action items. The host toggles it in `onClick`. Ignored on an item that opens a sub-menu. */
  checked?: boolean;
  /** Whether choosing the item closes the menu. Defaults to false for a checkbox item, so several can be toggled in one visit, and true for every other item. */
  closeOnSelect?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Nested sub-menu items */
  children?: DropdownMenuEntry[];
}

export interface DropdownMenuSeparator {
  type: 'separator';
}

export interface DropdownMenuGroup {
  type: 'group';
  /** Section heading */
  label: string;
  /** Items within the group */
  items: DropdownMenuEntry[];
}

export type DropdownMenuEntry =
  | DropdownMenuItem
  | DropdownMenuSeparator
  | DropdownMenuGroup;

type DropdownMenuOwnProps = {
  /** Trigger element that opens the menu */
  trigger: React.ReactNode;
  /** Menu entries (items, groups, separators) */
  items: DropdownMenuEntry[];
  /** Horizontal alignment of the panel */
  align?: 'start' | 'end';
  /** Component size */
  size?: 'default' | 'compact';
  /** Whether the menu is open (controlled mode) */
  open?: boolean;
  /** Whether the menu starts open when uncontrolled */
  defaultOpen?: boolean;
  /** Callback when the menu opens or closes */
  onOpenChange?: (open: boolean) => void;
  /** Replaces any legend an item's `keys` is written with, such as `{ ctrl: 'Strg' }` for a German keyboard. */
  keyLabels?: ShortcutKeyLabels;
  /** Additional CSS classes on the root wrapper, which holds the trigger and the panel */
  className?: string;
};

export interface DropdownMenuProps
  extends DropdownMenuOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof DropdownMenuOwnProps | 'children'> {}

/* ============================================
   HELPERS
   ============================================ */

/** Flatten all actionable items from entries for keyboard navigation */
function collectItems(entries: DropdownMenuEntry[]): DropdownMenuItem[] {
  const result: DropdownMenuItem[] = [];
  for (const entry of entries) {
    if (entry.type === 'separator') continue;
    if (entry.type === 'group') {
      result.push(...collectItems(entry.items));
    } else {
      result.push(entry);
    }
  }
  return result;
}

/** The role and checked state an item is announced with. */
function itemSemantics(item: DropdownMenuItem) {
  if (item.checked !== undefined) {
    return { role: 'menuitemcheckbox', 'aria-checked': item.checked } as const;
  }
  if (item.selected !== undefined) {
    return { role: 'menuitemradio', 'aria-checked': item.selected } as const;
  }
  return { role: 'menuitem' } as const;
}

/** Whether choosing an item closes the menu. */
const closesOnSelect = (item: DropdownMenuItem) => item.closeOnSelect ?? item.checked === undefined;

/** The roles a keyboard-focusable menu row can carry. */
const ITEM_SELECTOR = '[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"]';

/* ============================================
   SUB-MENU ITEM
   ============================================ */

interface SubMenuItemProps {
  item: DropdownMenuItem;
  baseClass: string;
  itemId: string;
  focused: boolean;
  size: 'default' | 'compact';
  onActivate: () => void;
}

const SubMenuItem = ({ item, baseClass, itemId, focused, size, onActivate }: SubMenuItemProps) => {
  const [subOpen, setSubOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rowRef = useRef<HTMLLIElement>(null);
  const subPanelRef = useRef<HTMLUListElement>(null);

  // The sub-menu is placed beside its row by the shared anchored-position
  // behaviour, flipping to the left when there is no room on the right.
  useAnchoredPosition({
    open: subOpen,
    anchorRef: rowRef,
    panelRef: subPanelRef,
    side: 'right',
    align: 'start',
    gapProperty: '--gap-050',
    fitHeight: true,
  });

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setSubOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setSubOpen(false), MOTION_HOVER_HIDE_DELAY_MS);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Open sub-menu when focused via keyboard
  useEffect(() => {
    if (focused && item.children && item.children.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing submenu visibility to keyboard focus arriving from the parent menu
      setSubOpen(true);
    }
  }, [focused, item.children]);

  const classes = [
    `${baseClass}__item`,
    focused ? `${baseClass}__item--focused` : '',
    item.disabled ? `${baseClass}__item--disabled` : '',
    item.destructive ? `${baseClass}__item--destructive` : '',
    `${baseClass}__item--has-submenu`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <li
      ref={rowRef}
      id={itemId}
      className={classes}
      role="menuitem"
      aria-haspopup="menu"
      aria-expanded={subOpen}
      aria-disabled={item.disabled || undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={(e) => {
        e.stopPropagation();
        if (!item.disabled) setSubOpen((prev) => !prev);
      }}
    >
      <span className={`${baseClass}__item-label`}>
        {item.icon &&
          (typeof item.icon === 'string' ? (
            <span className={`${baseClass}__item-icon material-symbols-rounded`} aria-hidden="true">
              {item.icon}
            </span>
          ) : (
            <span className={`${baseClass}__item-icon`} aria-hidden="true">
              {item.icon}
            </span>
          ))}
        {item.label}
      </span>
      <span className={`${baseClass}__submenu-icon material-symbols-rounded`} aria-hidden="true">
        chevron_right
      </span>
      {subOpen && item.children && (
        <MenuPanel
          entries={item.children}
          baseClass={baseClass}
          itemIdBase={`${itemId}-sub`}
          size={size}
          isSubmenu
          panelRef={subPanelRef}
          onItemActivate={onActivate}
        />
      )}
    </li>
  );
};

/* ============================================
   MENU PANEL (reusable for root + sub-menus)
   ============================================ */

interface MenuPanelProps {
  entries: DropdownMenuEntry[];
  baseClass: string;
  itemIdBase: string;
  size: 'default' | 'compact';
  isSubmenu?: boolean;
  panelRef?: React.Ref<HTMLUListElement>;
  onItemActivate: () => void;
}

const MenuPanel = ({
  entries,
  baseClass,
  itemIdBase,
  size,
  isSubmenu = false,
  panelRef,
  onItemActivate,
}: MenuPanelProps) => {
  const panelClasses = [
    `${baseClass}__panel`,
    isSubmenu ? `${baseClass}__submenu` : '',
    size === 'compact' ? `${baseClass}__panel--compact` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderEntry = (entry: DropdownMenuEntry, index: number, idBase: string) => {
    const entryId = `${idBase}-${index}`;

    if (entry.type === 'separator') {
      return <li key={`sep-${index}`} className={`${baseClass}__separator`} role="separator" />;
    }

    if (entry.type === 'group') {
      return (
        <li key={`group-${index}`} className={`${baseClass}__group`} role="group" aria-label={entry.label}>
          <span className={`${baseClass}__group-label`}>{entry.label}</span>
          <ul className={`${baseClass}__group-list`} role="group">
            {entry.items.map((subEntry, subIndex) => renderEntry(subEntry, subIndex, entryId))}
          </ul>
        </li>
      );
    }

    // Item with children → sub-menu
    if (entry.children && entry.children.length > 0) {
      return (
        <SubMenuItem
          key={`submenu-${index}`}
          item={entry}
          baseClass={baseClass}
          itemId={entryId}
          focused={false}
          size={size}
          onActivate={onItemActivate}
        />
      );
    }

    // Regular item
    const itemClasses = [
      `${baseClass}__item`,
      entry.disabled ? `${baseClass}__item--disabled` : '',
      entry.destructive ? `${baseClass}__item--destructive` : '',
      entry.selected ? `${baseClass}__item--selected` : '',
      entry.checked !== undefined ? `${baseClass}__item--checkbox ds-control-host` : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <li
        key={`item-${index}`}
        id={entryId}
        className={itemClasses}
        {...itemSemantics(entry)}
        aria-disabled={entry.disabled || undefined}
        aria-keyshortcuts={entry.keys ? shortcutAriaAnyPlatform(entry.keys) : undefined}
        onClick={(e) => {
          e.stopPropagation();
          if (!entry.disabled) {
            entry.onClick?.();
            if (closesOnSelect(entry)) onItemActivate();
          }
        }}
      >
        <span className={`${baseClass}__item-label`}>
          {/* Picked independently: the checkbox's own box leads the row,
              the convention every multi-select list shares. */}
          {entry.checked !== undefined && (
            <CheckboxIndicator
              className={`${baseClass}__item-check`}
              checked={entry.checked}
              size="compact"
            />
          )}
          {entry.icon &&
            (typeof entry.icon === 'string' ? (
              <span className={`${baseClass}__item-icon material-symbols-rounded`} aria-hidden="true">
                {entry.icon}
              </span>
            ) : (
              <span className={`${baseClass}__item-icon`} aria-hidden="true">
                {entry.icon}
              </span>
            ))}
          {entry.label}
        </span>
        <MenuShortcutHint item={entry} className={`${baseClass}__shortcut`} />
        {entry.selected && (
          <ChosenMark />
        )}
      </li>
    );
  };

  return (
    <ul ref={panelRef} className={panelClasses} role="menu">
      {entries.map((entry, index) => renderEntry(entry, index, itemIdBase))}
    </ul>
  );
};

/* ============================================
   DROPDOWN MENU — ROOT COMPONENT
   ============================================ */

export const DropdownMenu = React.forwardRef<HTMLDivElement, DropdownMenuProps>(({
  trigger,
  items,
  align = 'start',
  size = 'default',
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  keyLabels,
  className = '',
  ...rest
}, ref) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  // Reports every change, and stores the value only when uncontrolled.
  const setIsOpen = useCallback(
    (value: boolean) => {
      if (!isControlled) setInternalOpen(value);
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange],
  );
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const setRootRef = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };
  const panelRef = useRef<HTMLUListElement | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();

  // The panel is placed against the trigger by the shared anchored-position
  // behaviour: fixed, so a scroll container cannot clip it, flipped above
  // when there is no room below, and capped to the room it has.
  useAnchoredPosition({
    open: isOpen,
    anchorRef: triggerRef,
    panelRef,
    side: 'bottom',
    align,
    gapProperty: '--gap-050',
    fitHeight: true,
  });

  const baseClass = 'ds-dropdown-menu';
  const classes = [baseClass, className].filter(Boolean).join(' ');

  const flatItems = collectItems(items);

  const menuId = `${generatedId}-menu`;
  const activeDescendantId =
    isOpen && focusedIndex >= 0 ? `${generatedId}-item-${focusedIndex}` : undefined;

  const handleToggle = () => {
    if (!isOpen) setFocusedIndex(-1);
    setIsOpen(!isOpen);
  };

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
  }, [setIsOpen]);

  /* A press outside closes the menu, through the shared layer stack, so it
     never also closes a Dialog the menu sits in. */
  useLayer({
    open: isOpen,
    onDismiss: handleClose,
    dismissOnOutsidePress: true,
    getElements: () => [rootRef.current],
  });

  /* Keyboard navigation */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else if (focusedIndex >= 0) {
          const item = flatItems[focusedIndex];
          if (item && !item.disabled && !item.children) {
            item.onClick?.();
            if (closesOnSelect(item)) handleClose();
          }
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          setFocusedIndex((prev) => {
            let next = prev + 1;
            while (next < flatItems.length && flatItems[next].disabled) next++;
            return next < flatItems.length ? next : prev;
          });
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex((prev) => {
            let next = prev - 1;
            while (next >= 0 && flatItems[next].disabled) next--;
            return next >= 0 ? next : prev;
          });
        }
        break;
      case 'Home':
        if (isOpen) {
          e.preventDefault();
          setFocusedIndex((prev) => {
            let next = 0;
            while (next < flatItems.length && flatItems[next].disabled) next++;
            return next < flatItems.length ? next : prev;
          });
        }
        break;
      case 'End':
        if (isOpen) {
          e.preventDefault();
          setFocusedIndex((prev) => {
            let next = flatItems.length - 1;
            while (next >= 0 && flatItems[next].disabled) next--;
            return next >= 0 ? next : prev;
          });
        }
        break;
      case 'Escape':
        // Handled: the layer stack leaves a prevented Escape alone, so
        // closing the menu does not also close a Dialog around it.
        if (isOpen) {
          e.preventDefault();
          handleClose();
        }
        break;
      case 'Tab':
        handleClose();
        break;
    }
  };

  /* Scroll focused item into view */
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && panelRef.current) {
      const allItems = panelRef.current.querySelectorAll(ITEM_SELECTOR);
      const el = allItems[focusedIndex] as HTMLElement | undefined;
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex, isOpen]);

  /* Render the panel with focus tracking */
  const renderPanelEntry = (entry: DropdownMenuEntry, index: number, itemCounter: { count: number }) => {
    if (entry.type === 'separator') {
      return <li key={`sep-${index}`} className={`${baseClass}__separator`} role="separator" />;
    }

    if (entry.type === 'group') {
      return (
        <li key={`group-${index}`} className={`${baseClass}__group`} role="none">
          <span className={`${baseClass}__group-label`} role="presentation">{entry.label}</span>
          <ul className={`${baseClass}__group-list`} role="group" aria-label={entry.label}>
            {entry.items.map((subEntry, subIndex) =>
              renderPanelEntry(subEntry, subIndex, itemCounter)
            )}
          </ul>
        </li>
      );
    }

    const myIndex = itemCounter.count;
    itemCounter.count++;
    const isFocused = myIndex === focusedIndex;

    // Sub-menu item
    if (entry.children && entry.children.length > 0) {
      return (
        <SubMenuItem
          key={`submenu-${index}`}
          item={entry}
          baseClass={baseClass}
          itemId={`${generatedId}-item-${myIndex}`}
          focused={isFocused}
          size={size}
          onActivate={handleClose}
        />
      );
    }

    // Regular item
    const itemClasses = [
      `${baseClass}__item`,
      isFocused ? `${baseClass}__item--focused` : '',
      entry.disabled ? `${baseClass}__item--disabled` : '',
      entry.destructive ? `${baseClass}__item--destructive` : '',
      entry.selected ? `${baseClass}__item--selected` : '',
      entry.checked !== undefined ? `${baseClass}__item--checkbox ds-control-host` : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <li
        key={`item-${index}`}
        id={`${generatedId}-item-${myIndex}`}
        className={itemClasses}
        {...itemSemantics(entry)}
        aria-disabled={entry.disabled || undefined}
        aria-keyshortcuts={entry.keys ? shortcutAriaAnyPlatform(entry.keys) : undefined}
        onClick={(e) => {
          e.stopPropagation();
          if (!entry.disabled) {
            entry.onClick?.();
            if (closesOnSelect(entry)) handleClose();
          }
        }}
      >
        <span className={`${baseClass}__item-label`}>
          {/* Picked independently: the checkbox's own box leads the row,
              the convention every multi-select list shares. */}
          {entry.checked !== undefined && (
            <CheckboxIndicator
              className={`${baseClass}__item-check`}
              checked={entry.checked}
              size="compact"
            />
          )}
          {entry.icon &&
            (typeof entry.icon === 'string' ? (
              <span className={`${baseClass}__item-icon material-symbols-rounded`} aria-hidden="true">
                {entry.icon}
              </span>
            ) : (
              <span className={`${baseClass}__item-icon`} aria-hidden="true">
                {entry.icon}
              </span>
            ))}
          {entry.label}
        </span>
        <MenuShortcutHint item={entry} className={`${baseClass}__shortcut`} />
        {entry.selected && (
          <ChosenMark />
        )}
      </li>
    );
  };

  const panelClasses = [
    `${baseClass}__panel`,
    align === 'end' ? `${baseClass}__panel--align-end` : '',
    size === 'compact' ? `${baseClass}__panel--compact` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const itemCounter = { count: 0 };

  // A consumer's own handlers on the trigger element must keep firing —
  // cloneElement replaces props, so compose rather than overwrite.
  const triggerProps = React.isValidElement(trigger)
    ? (trigger.props as {
        onClick?: React.MouseEventHandler;
        onKeyDown?: React.KeyboardEventHandler;
      })
    : undefined;

  return (
    <MenuKeyLabelsContext.Provider value={keyLabels}>
      <div {...rest} className={classes} ref={setRootRef}>
        {/*
          The trigger is consumer-supplied and is virtually always already a
          control (a Button). Wrapping it in role="button" tabIndex=0 put an
          interactive element inside an interactive container. Put the menu
          semantics on the real control instead, and only synthesise a button
          when the trigger is not an element we can clone onto.
        */}
        <div ref={triggerRef} className={`${baseClass}__trigger`}>
          {React.isValidElement(trigger) ? (
            React.cloneElement(trigger as React.ReactElement<Record<string, unknown>>, {
              'aria-haspopup': 'menu',
              'aria-expanded': isOpen,
              'aria-controls': isOpen ? menuId : undefined,
              'aria-activedescendant': activeDescendantId,
              onClick: (e: React.MouseEvent) => {
                triggerProps?.onClick?.(e);
                handleToggle();
              },
              onKeyDown: (e: React.KeyboardEvent) => {
                triggerProps?.onKeyDown?.(e);
                handleKeyDown(e);
              },
            })
          ) : (
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={isOpen}
              aria-controls={isOpen ? menuId : undefined}
              aria-activedescendant={activeDescendantId}
              onClick={handleToggle}
              onKeyDown={handleKeyDown}
            >
              {trigger}
            </button>
          )}
        </div>
        {isOpen && (
          <ul
            id={menuId}
            className={panelClasses}
            role="menu"
            ref={(el) => {
              panelRef.current = el;
            }}
          >
            {items.map((entry, index) => renderPanelEntry(entry, index, itemCounter))}
          </ul>
        )}
      </div>
    </MenuKeyLabelsContext.Provider>
  );
});

DropdownMenu.displayName = 'DropdownMenu';
