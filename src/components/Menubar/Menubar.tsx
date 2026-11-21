'use client';

import React, { useRef, useState } from 'react';
import { DropdownMenu, type DropdownMenuEntry } from '../DropdownMenu/DropdownMenu';
import { logicalArrowKey } from '../../behaviors/direction';
import type { ShortcutKeyLabels } from '../../behaviors/shortcut-keys';
import './Menubar.css';

/** One menu in the bar: its trigger's label and the entries it opens. */
export interface MenubarMenu {
  /** The trigger's text, e.g. "File". Also the open menu's accessible name. */
  label: string;
  /** The menu's entries, in DropdownMenu's shape: items, groups, separators, checkbox and radio items, sub-menus and shortcuts. */
  items: DropdownMenuEntry[];
  /** Show the trigger but do not let it open. */
  disabled?: boolean;
  /** Stable identity for the menu, when two menus share a label. Defaults to the label. */
  id?: string;
}

/** Props owned by Menubar itself. */
type MenubarOwnProps = {
  /** The menus, in order along the bar. */
  menus: MenubarMenu[];
  /** Accessible name for the bar. */
  label?: string;
  /** Trigger and menu size. */
  size?: 'default' | 'compact';
  /** Key names for the shortcut hints in every menu, for a keyboard other than English (passed to each DropdownMenu). */
  keyLabels?: ShortcutKeyLabels;
  /** Additional CSS classes */
  className?: string;
};

export interface MenubarProps
  extends MenubarOwnProps,
    Omit<React.ComponentPropsWithRef<'div'>, keyof MenubarOwnProps | 'children' | 'role'> {}

/**
 * Menubar: a persistent row of menus, the way a desktop app's File, Edit
 * and View sit along the top of its window. Each menu is a DropdownMenu, so
 * its panel, items, sub-menus, shortcuts and keys are DropdownMenu's own;
 * the bar adds the WAI-ARIA menubar behaviour around them. The bar is one
 * tab stop, the inline arrows move along it (and, while a menu is open,
 * open the next one instead), Home and End jump to its ends, and with a
 * menu open, pointing at another trigger opens that one.
 */
export function Menubar({
  menus,
  label = 'Menu bar',
  size = 'default',
  keyLabels,
  className = '',
  ref,
  ...rest
}: MenubarProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const baseClass = 'ds-menubar';
  const classes = [baseClass, size === 'compact' ? `${baseClass}--compact` : '', className]
    .filter(Boolean)
    .join(' ');

  const enabled = menus.map((menu, i) => (menu.disabled ? -1 : i)).filter((i) => i >= 0);
  const move = (to: number) => {
    setFocusIndex(to);
    triggers.current[to]?.focus();
    if (openIndex !== null) setOpenIndex(to);
  };
  const step = (from: number, by: 1 | -1) => {
    const at = enabled.indexOf(from);
    return enabled[(at + by + enabled.length) % enabled.length];
  };

  const handleKeyDown = (index: number) => (event: React.KeyboardEvent<HTMLButtonElement>) => {
    switch (logicalArrowKey(event.key, event.currentTarget)) {
      case 'ArrowRight':
        event.preventDefault();
        move(step(index, 1));
        break;
      case 'ArrowLeft':
        event.preventDefault();
        move(step(index, -1));
        break;
      case 'Home':
        if (openIndex === null) {
          event.preventDefault();
          move(enabled[0]);
        }
        break;
      case 'End':
        if (openIndex === null) {
          event.preventDefault();
          move(enabled[enabled.length - 1]);
        }
        break;
    }
  };

  return (
    <div aria-label={label} {...rest} ref={ref} className={classes} role="menubar">
      {menus.map((menu, index) => (
        <DropdownMenu
          key={menu.id ?? menu.label}
          className={`${baseClass}__menu`}
          items={menu.items}
          size={size}
          keyLabels={keyLabels}
          open={openIndex === index}
          onOpenChange={(open) => {
            if (menu.disabled) return;
            setOpenIndex((current) => (open ? index : current === index ? null : current));
            if (open) setFocusIndex(index);
          }}
          trigger={
            <button
              ref={(node) => {
                triggers.current[index] = node;
              }}
              type="button"
              role="menuitem"
              className={`${baseClass}__trigger`}
              tabIndex={index === focusIndex ? 0 : -1}
              aria-disabled={menu.disabled || undefined}
              onKeyDown={handleKeyDown(index)}
              onFocus={() => setFocusIndex(index)}
              onMouseEnter={() => {
                if (openIndex !== null && openIndex !== index && !menu.disabled) {
                  setOpenIndex(index);
                  setFocusIndex(index);
                  triggers.current[index]?.focus();
                }
              }}
            >
              {menu.label}
            </button>
          }
        />
      ))}
    </div>
  );
}
