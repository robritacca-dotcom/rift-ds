'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { ChosenMark } from '../Dropdown/Dropdown';
import { useAnchoredPosition } from '../../behaviors/useAnchoredPosition';
import { useLayer } from '../../behaviors/useLayer';
import './ThemePicker.css';

/** One theme on offer: its name, its swatch, and optionally the faces it sets. */
export interface ThemePickerOption {
  /** The theme's id, reported through `onValueChange` (a `data-brand` value, say). */
  value: string;
  /** The theme's name. */
  label: string;
  /** The swatch colour, the theme's action colour as a CSS value. Without one the swatch is an empty chip. */
  color?: string;
  /** The swatch's corner, so the chip shows the theme's corner language too. Defaults to a circle. */
  swatchRadius?: string;
  /** A line under the name, such as the faces the theme pairs. */
  description?: string;
  /** CSS font stack the name is set in, so each row previews its heading face. */
  headingFont?: string;
  /** CSS font stack the description is set in, previewing the body face. */
  bodyFont?: string;
}

/** Props owned by ThemePicker itself — everything else falls through to the root wrapper. */
type ThemePickerOwnProps = {
  /** The themes on offer, in the order the menu lists them. */
  themes: ThemePickerOption[];
  /** The active theme, controlled. Leave undefined to let the picker keep its own, seeded from `defaultValue`. */
  value?: string;
  /** The active theme on first render when uncontrolled. Defaults to the first theme. */
  defaultValue?: string;
  /** Fires with the chosen theme's value. The host applies it (a `data-brand` attribute on `<html>`, for the shipped presets). */
  onValueChange?: (value: string) => void;
  /** Whether the menu is open, controlled. Leave undefined to let the picker open and close itself. */
  open?: boolean;
  /** Whether the menu starts open when uncontrolled. */
  defaultOpen?: boolean;
  /** Fires when the menu opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Whether the picker is disabled: the trigger takes no press and the menu cannot open. */
  disabled?: boolean;
  /** Trigger size, on the row-control scale: `default` is 40px, `compact` 32px. */
  size?: 'default' | 'compact';
  /** Which side of the trigger the menu prefers; it flips when that side has no room. */
  placement?: 'bottom' | 'top';
  /** Which trigger edge the menu lines up with. */
  align?: 'start' | 'end';
  /** Content after the themes, below a divider: a link to make a theme of your own, say. Give each control in it `role="menuitem"`, since a menu holds only menu items; the arrow keys reach it. */
  footer?: React.ReactNode;
  /** Accessible name of the trigger, given the active theme's name. Defaults to "Theme: " followed by it. */
  triggerLabel?: (label: string) => string;
  /** Accessible name of the menu. */
  menuLabel?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface ThemePickerProps
  extends ThemePickerOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof ThemePickerOwnProps | 'children' | 'defaultValue' | 'onChange'> {}

/**
 * The theme switcher: a circular trigger, the row height across, wearing
 * the active theme's swatch, and a menu of every theme on offer, each row
 * previewing its colour, corner and faces. The host supplies the themes
 * and applies the choice; the picker is the control. The menu is placed
 * by the shared anchored-position behaviour (fixed, so a clipping seat such
 * as a sidebar's floor cannot cut it off, flipping when its side has no
 * room) and dismisses through the layer stack.
 *
 * Forwards a ref to the root wrapper, which holds the trigger and the menu,
 * and spreads unrecognised props onto it.
 */
export const ThemePicker = React.forwardRef<HTMLDivElement, ThemePickerProps>(
  (
    {
      themes,
      value: valueProp,
      defaultValue,
      onValueChange,
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      disabled = false,
      size = 'default',
      placement = 'bottom',
      align = 'end',
      footer,
      triggerLabel = (label: string) => `Theme: ${label}`,
      menuLabel = 'Theme',
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-theme-picker';
    const [ownValue, setOwnValue] = useState(defaultValue ?? themes[0]?.value);
    const value = valueProp ?? ownValue;
    const [ownOpen, setOwnOpen] = useState(defaultOpen);
    const isOpen = openProp ?? ownOpen;
    const setOpen = (next: boolean) => {
      if (next === isOpen) return;
      if (openProp === undefined) setOwnOpen(next);
      onOpenChange?.(next);
    };

    const rootRef = useRef<HTMLDivElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const menuId = useId();
    const setRootRef = (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    useAnchoredPosition({
      open: isOpen,
      anchorRef: triggerRef,
      panelRef: menuRef,
      side: placement,
      align,
      gapProperty: '--gap-200',
      fitHeight: true,
    });
    useLayer({
      open: isOpen,
      onDismiss: () => {
        setOpen(false);
        triggerRef.current?.focus();
      },
      dismissOnOutsidePress: true,
      getElements: () => [rootRef.current],
    });

    // Opening moves focus to the active row, so the arrow keys start there.
    useEffect(() => {
      if (!isOpen) return;
      const menu = menuRef.current;
      const active = menu?.querySelector<HTMLElement>('[aria-checked="true"]');
      (active ?? menu?.querySelector<HTMLElement>('[role="menuitemradio"]'))?.focus();
    }, [isOpen]);

    const choose = (next: string) => {
      if (valueProp === undefined) setOwnValue(next);
      onValueChange?.(next);
      setOpen(false);
      triggerRef.current?.focus();
    };

    /* Up and down move through the rows (and into the footer's links),
       Home and End jump to the ends. */
    const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      const items = [
        ...(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"], [role="menuitem"]') ?? []),
      ];
      if (!items.length) return;
      event.preventDefault();
      const at = items.indexOf(document.activeElement as HTMLElement);
      const next =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? items.length - 1
            : (at + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items[next]?.focus();
    };

    const active = themes.find((theme) => theme.value === value) ?? themes[0];
    const swatch = (theme: ThemePickerOption | undefined, part: string) => (
      <span
        className={`${baseClass}__${part}`}
        style={{ backgroundColor: theme?.color, borderRadius: theme?.swatchRadius }}
        aria-hidden="true"
      />
    );

    return (
      <div
        {...rest}
        ref={setRootRef}
        className={[baseClass, `${baseClass}--${size}`, isOpen && `${baseClass}--open`, className]
          .filter(Boolean)
          .join(' ')}
      >
        <button
          ref={triggerRef}
          type="button"
          className={`${baseClass}__trigger`}
          aria-label={active ? triggerLabel(active.label) : menuLabel}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-controls={isOpen ? menuId : undefined}
          disabled={disabled}
          onClick={() => setOpen(!isOpen)}
        >
          {swatch(active, 'swatch')}
        </button>
        {isOpen && !disabled && (
          <div
            ref={menuRef}
            id={menuId}
            className={`${baseClass}__menu`}
            role="menu"
            aria-label={menuLabel}
            onKeyDown={handleMenuKeyDown}
          >
            {themes.map((theme) => {
              const selected = theme.value === value;
              return (
                <button
                  key={theme.value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  className={[`${baseClass}__row`, selected && `${baseClass}__row--selected`]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => choose(theme.value)}
                >
                  {swatch(theme, 'row-swatch')}
                  <span className={`${baseClass}__row-text`}>
                    <span className={`${baseClass}__row-name`} style={{ fontFamily: theme.headingFont }}>
                      {theme.label}
                    </span>
                    {theme.description && (
                      <span className={`${baseClass}__row-description`} style={{ fontFamily: theme.bodyFont }}>
                        {theme.description}
                      </span>
                    )}
                  </span>
                  {selected && <ChosenMark />}
                </button>
              );
            })}
            {footer != null && (
              <>
                <span className={`${baseClass}__divider`} aria-hidden="true" />
                <div className={`${baseClass}__footer`} role="none">
                  {footer}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  },
);

ThemePicker.displayName = 'ThemePicker';
