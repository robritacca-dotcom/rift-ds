'use client';

import React, { useState, useRef, useEffect, useCallback, useLayoutEffect, useId } from 'react';
import { MOTION_HOVER_HIDE_DELAY_MS } from '../../tokens/motion';
import type {
  DropdownMenuEntry,
  DropdownMenuItem,
} from '../DropdownMenu/DropdownMenu';
import './ContextMenu.css';
import '../../fonts/material-symbols.css';

/* ============================================
   TYPES
   ============================================ */

/** Props owned by ContextMenu itself — everything else falls through to the wrapper div. */
type ContextMenuOwnProps = {
  /** Menu entries — the same model as DropdownMenu (items, groups, separators) */
  items: DropdownMenuEntry[];
  /** Component size */
  size?: 'default' | 'compact';
  /** Accessible name for the menu */
  ariaLabel?: string;
  /** Additional CSS classes */
  className?: string;
  /** The right-clickable area the menu is attached to */
  children: React.ReactNode;
};

export interface ContextMenuProps
  extends ContextMenuOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof ContextMenuOwnProps> {}

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
        {item.icon && (
          <span className={`${baseClass}__item-icon material-symbols-rounded`} aria-hidden="true">
            {item.icon}
          </span>
        )}
        {item.label}
      </span>
      <span className={`${baseClass}__submenu-icon material-symbols-rounded`} aria-hidden="true">
        chevron_right
      </span>
      {subOpen && item.children && (
        <ul className={`${baseClass}__panel ${baseClass}__submenu`} role="menu">
          {item.children.map((entry, index) => (
            <SubEntry
              key={index}
              entry={entry}
              baseClass={baseClass}
              itemId={`${itemId}-sub-${index}`}
              size={size}
              onActivate={onActivate}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

/** Entry renderer for sub-menu panels (no focus tracking below the root level) */
const SubEntry = ({
  entry,
  baseClass,
  itemId,
  size,
  onActivate,
}: {
  entry: DropdownMenuEntry;
  baseClass: string;
  itemId: string;
  size: 'default' | 'compact';
  onActivate: () => void;
}) => {
  if (entry.type === 'separator') {
    return <li className={`${baseClass}__separator`} role="separator" />;
  }
  if (entry.type === 'group') {
    return (
      <li className={`${baseClass}__group`} role="none">
        <span className={`${baseClass}__group-label`} role="presentation">
          {entry.label}
        </span>
        <ul className={`${baseClass}__group-list`} role="group" aria-label={entry.label}>
          {entry.items.map((subEntry, subIndex) => (
            <SubEntry
              key={subIndex}
              entry={subEntry}
              baseClass={baseClass}
              itemId={`${itemId}-sub-${subIndex}`}
              size={size}
              onActivate={onActivate}
            />
          ))}
        </ul>
      </li>
    );
  }
  if (entry.children && entry.children.length > 0) {
    return (
      <SubMenuItem
        item={entry}
        baseClass={baseClass}
        itemId={itemId}
        focused={false}
        size={size}
        onActivate={onActivate}
      />
    );
  }
  const itemClasses = [
    `${baseClass}__item`,
    entry.disabled ? `${baseClass}__item--disabled` : '',
    entry.destructive ? `${baseClass}__item--destructive` : '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <li
      id={itemId}
      className={itemClasses}
      role="menuitem"
      aria-disabled={entry.disabled || undefined}
      onClick={(e) => {
        e.stopPropagation();
        if (!entry.disabled) {
          entry.onClick?.();
          onActivate();
        }
      }}
    >
      <span className={`${baseClass}__item-label`}>
        {entry.icon && (
          <span className={`${baseClass}__item-icon material-symbols-rounded`} aria-hidden="true">
            {entry.icon}
          </span>
        )}
        {entry.label}
      </span>
      {entry.shortcut && <span className={`${baseClass}__shortcut`}>{entry.shortcut}</span>}
    </li>
  );
};

/* ============================================
   CONTEXT MENU — ROOT COMPONENT
   ============================================ */

/**
 * ContextMenu opens a floating menu at the pointer position when the wrapped
 * area is right-clicked (or the keyboard ContextMenu / Shift+F10 key is used).
 * Entries use the same model as DropdownMenu — items, groups, separators,
 * icons, shortcut hints, destructive and disabled states, and one level of
 * sub-menus.
 */
export const ContextMenu = React.forwardRef<HTMLDivElement, ContextMenuProps>(
  (
    {
      items,
      size = 'default',
      ariaLabel,
      className = '',
      children,
      onContextMenu,
      ...rest
    },
    ref,
  ) => {
    const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const panelRef = useRef<HTMLUListElement | null>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);
    const generatedId = useId();

    const baseClass = 'ds-context-menu';
    const classes = [baseClass, className].filter(Boolean).join(' ');

    const isOpen = position !== null;
    const flatItems = collectItems(items);

    const setRootRef = (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    const handleClose = useCallback(() => {
      setPosition(null);
      setFocusedIndex(-1);
      const previous = previousFocusRef.current;
      previousFocusRef.current = null;
      if (previous && document.contains(previous)) {
        previous.focus();
      }
    }, []);

    const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
      onContextMenu?.(e);
      e.preventDefault();
      // Keyboard invocation (ContextMenu key / Shift+F10) reports 0,0 —
      // anchor to the target area instead of the viewport corner.
      let x = e.clientX;
      let y = e.clientY;
      if (x === 0 && y === 0 && rootRef.current) {
        const rect = rootRef.current.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      }
      if (!isOpen) {
        previousFocusRef.current = document.activeElement as HTMLElement;
      }
      setPosition({ x, y });
      setFocusedIndex(-1);
    };

    /* Click outside */
    useEffect(() => {
      if (!isOpen) return;
      const handler = (e: MouseEvent) => {
        if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
          handleClose();
        }
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, [isOpen, handleClose]);

    /* The panel is fixed-positioned, so scrolling would leave it stranded — close instead */
    useEffect(() => {
      if (!isOpen) return;
      const handler = () => handleClose();
      window.addEventListener('scroll', handler, true);
      window.addEventListener('resize', handler);
      return () => {
        window.removeEventListener('scroll', handler, true);
        window.removeEventListener('resize', handler);
      };
    }, [isOpen, handleClose]);

    /* Clamp the panel inside the viewport, then focus it for keyboard nav */
    useLayoutEffect(() => {
      if (!isOpen || !panelRef.current || !position) return;
      const panel = panelRef.current;
      const rect = panel.getBoundingClientRect();
      const margin = 8;
      let { x, y } = position;
      if (x + rect.width + margin > window.innerWidth) {
        x = Math.max(margin, window.innerWidth - rect.width - margin);
      }
      if (y + rect.height + margin > window.innerHeight) {
        y = Math.max(margin, window.innerHeight - rect.height - margin);
      }
      if (x !== position.x || y !== position.y) {
        setPosition({ x, y });
        return;
      }
      panel.focus({ preventScroll: true });
    }, [isOpen, position]);

    /* Keyboard navigation on the focused panel */
    const handleKeyDown = (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'Enter':
        case ' ': {
          e.preventDefault();
          if (focusedIndex >= 0) {
            const item = flatItems[focusedIndex];
            if (item && !item.disabled && !item.children) {
              item.onClick?.();
              handleClose();
            }
          }
          break;
        }
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => {
            let next = prev + 1;
            while (next < flatItems.length && flatItems[next].disabled) next++;
            return next < flatItems.length ? next : prev;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => {
            let next = prev < 0 ? flatItems.length - 1 : prev - 1;
            while (next >= 0 && flatItems[next].disabled) next--;
            return next >= 0 ? next : prev;
          });
          break;
        case 'Home':
          e.preventDefault();
          setFocusedIndex((prev) => {
            let next = 0;
            while (next < flatItems.length && flatItems[next].disabled) next++;
            return next < flatItems.length ? next : prev;
          });
          break;
        case 'End':
          e.preventDefault();
          setFocusedIndex((prev) => {
            let next = flatItems.length - 1;
            while (next >= 0 && flatItems[next].disabled) next--;
            return next >= 0 ? next : prev;
          });
          break;
        case 'Escape':
        case 'Tab':
          e.preventDefault();
          handleClose();
          break;
      }
    };

    /* Render entries with focus tracking (root level only, like DropdownMenu) */
    const renderEntry = (
      entry: DropdownMenuEntry,
      index: number,
      itemCounter: { count: number },
    ): React.ReactNode => {
      if (entry.type === 'separator') {
        return <li key={`sep-${index}`} className={`${baseClass}__separator`} role="separator" />;
      }

      if (entry.type === 'group') {
        return (
          <li key={`group-${index}`} className={`${baseClass}__group`} role="none">
            <span className={`${baseClass}__group-label`} role="presentation">
              {entry.label}
            </span>
            <ul className={`${baseClass}__group-list`} role="group" aria-label={entry.label}>
              {entry.items.map((subEntry, subIndex) =>
                renderEntry(subEntry, subIndex, itemCounter),
              )}
            </ul>
          </li>
        );
      }

      const myIndex = itemCounter.count;
      itemCounter.count++;
      const isFocused = myIndex === focusedIndex;

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

      const itemClasses = [
        `${baseClass}__item`,
        isFocused ? `${baseClass}__item--focused` : '',
        entry.disabled ? `${baseClass}__item--disabled` : '',
        entry.destructive ? `${baseClass}__item--destructive` : '',
      ]
        .filter(Boolean)
        .join(' ');

      return (
        <li
          key={`item-${index}`}
          id={`${generatedId}-item-${myIndex}`}
          className={itemClasses}
          role="menuitem"
          aria-disabled={entry.disabled || undefined}
          onClick={(e) => {
            e.stopPropagation();
            if (!entry.disabled) {
              entry.onClick?.();
              handleClose();
            }
          }}
        >
          <span className={`${baseClass}__item-label`}>
            {entry.icon && (
              <span
                className={`${baseClass}__item-icon material-symbols-rounded`}
                aria-hidden="true"
              >
                {entry.icon}
              </span>
            )}
            {entry.label}
          </span>
          {entry.shortcut && <span className={`${baseClass}__shortcut`}>{entry.shortcut}</span>}
        </li>
      );
    };

    const panelClasses = [
      `${baseClass}__panel`,
      size === 'compact' ? `${baseClass}__panel--compact` : '',
    ]
      .filter(Boolean)
      .join(' ');

    const itemCounter = { count: 0 };

    return (
      <div {...rest} ref={setRootRef} className={classes} onContextMenu={handleContextMenu}>
        {children}
        {isOpen && (
          <ul
            className={panelClasses}
            role="menu"
            aria-label={ariaLabel}
            aria-activedescendant={
              focusedIndex >= 0 ? `${generatedId}-item-${focusedIndex}` : undefined
            }
            tabIndex={-1}
            ref={(el) => {
              panelRef.current = el;
            }}
            // The pointer position is runtime data, not a design decision —
            // the one sanctioned inline style in this component.
            style={{ left: position.x, top: position.y }}
            onKeyDown={handleKeyDown}
          >
            {items.map((entry, index) => renderEntry(entry, index, itemCounter))}
          </ul>
        )}
      </div>
    );
  },
);

ContextMenu.displayName = 'ContextMenu';
