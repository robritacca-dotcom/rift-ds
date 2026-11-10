'use client';

import { createContext, useContext } from 'react';
import { formatShortcut, usePlatform, type ShortcutKeyLabels } from '../../behaviors/shortcuts';
import { mirrorClass } from '../../behaviors/direction';
import type { DropdownMenuItem } from './DropdownMenu';

/** The menu's `keyLabels`, handed to every row however deep its submenu sits. */
// The context and the one component that reads it live together, like LinkProvider's.
// eslint-disable-next-line react-refresh/only-export-components
export const MenuKeyLabelsContext = createContext<ShortcutKeyLabels | undefined>(undefined);

/**
 * A menu row's trailing shortcut hint, shared by DropdownMenu and
 * ContextMenu: `keys` written for the reader's platform (⇧⌘P on a Mac,
 * Ctrl+Shift+P elsewhere), else the literal `shortcut`, else nothing.
 */
export function MenuShortcutHint({ item, className }: { item: DropdownMenuItem; className: string }) {
  const platform = usePlatform();
  const keyLabels = useContext(MenuKeyLabelsContext);
  if (item.keys) return <span className={className}>{formatShortcut(item.keys, platform, keyLabels)}</span>;
  if (item.shortcut) return <span className={className}>{item.shortcut}</span>;
  return null;
}

/**
 * A menu row's trailing icon (`iconRight`), after the label and any
 * shortcut hint, shared by DropdownMenu and ContextMenu. Decorative: the
 * label says what the item does.
 */
export function MenuIconRight({ item, baseClass }: { item: DropdownMenuItem; baseClass: string }) {
  if (!item.iconRight) return null;
  return typeof item.iconRight === 'string' ? (
    <span className={`${baseClass}__item-icon-right material-symbols-rounded ${mirrorClass(item.iconRight)}`} aria-hidden="true">
      {item.iconRight}
    </span>
  ) : (
    <span className={`${baseClass}__item-icon-right`} aria-hidden="true">
      {item.iconRight}
    </span>
  );
}
