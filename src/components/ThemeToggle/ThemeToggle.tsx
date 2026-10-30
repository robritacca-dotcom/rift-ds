'use client';

import React, { useEffect } from 'react';
import { SegmentedControl } from '../SegmentedControl/SegmentedControl';
import { CircularButton } from '../CircularButton/CircularButton';
import { DEFAULT_COLOR_MODE_STORAGE_KEY, type ColorModeSetting } from './colorMode';
import { useColorMode } from './useColorMode';
import './ThemeToggle.css';

/** Props owned by ThemeToggle itself — everything else falls through to the strip. */
type ThemeToggleOwnProps = {
  /**
   * The setting shown, for a host that owns colour mode (its own settings
   * store, or a library such as next-themes). A pick then only calls
   * `onValueChange`, and the host applies it. Leave undefined to let the
   * toggle keep the setting in its own store, `useColorMode`.
   */
  value?: ColorModeSetting;
  /** The setting applied when the store holds no choice yet, for uncontrolled use. Without it, a first visit follows the operating system. */
  defaultValue?: ColorModeSetting;
  /** Fires with the setting after every pick, controlled or not. */
  onValueChange?: (value: ColorModeSetting) => void;
  /** Control size, on SegmentedControl's scale: `default` (the default), the height of the CommandPaletteTrigger and AiButton beside it in a top bar, or `compact`. */
  size?: 'default' | 'compact';
  /** Show each segment's label beside its icon. Set `false` for an icon-only strip: each label becomes the segment's tooltip on hover and keyboard focus, and stays its accessible name. */
  showLabels?: boolean;
  /**
   * Draw one circle that shows the current setting and steps to the next on
   * each press (System, Light, Dark), in place of the strip, for a row short
   * of room, such as a condensed SiteHeader's `condensedActions`. Each label
   * becomes the circle's tooltip and its accessible name comes from `cycleLabel`.
   */
  cycle?: boolean;
  /** The cycle circle's accessible name, from the current setting's label and the next one's. Default: the control's `aria-label`, then both, as in "Colour mode: Light. Switch to Dark". */
  cycleLabel?: (current: string, next: string) => string;
  /** The localStorage key the choice is kept under. Match the key given to `colorModeScript`. Default `theme`. */
  storageKey?: string;
  /** Label of the setting that follows the operating system. */
  systemLabel?: string;
  /** Label of the light setting. */
  lightLabel?: string;
  /** Label of the dark setting. */
  darkLabel?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface ThemeToggleProps
  extends ThemeToggleOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof ThemeToggleOwnProps | 'children' | 'onChange' | 'defaultValue'> {}

/**
 * The colour-mode control: System, Light and Dark on a SegmentedControl,
 * over `useColorMode`, so every instance on a page stays in step and the
 * choice survives a reload. Pair it with `colorModeScript` in the document
 * head, which applies the stored choice before first paint.
 *
 * Forwards a ref to the strip (in the `cycle` form, the circle's wrapper)
 * and spreads unrecognised props onto it.
 */
export const ThemeToggle = React.forwardRef<HTMLDivElement, ThemeToggleProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      size = 'default',
      showLabels = true,
      cycle = false,
      storageKey,
      systemLabel = 'System',
      lightLabel = 'Light',
      darkLabel = 'Dark',
      className = '',
      'aria-label': ariaLabel = 'Colour mode',
      cycleLabel = (current: string, next: string) => `${ariaLabel}: ${current}. Switch to ${next}`,
      ...rest
    },
    ref,
  ) => {
    const [storedSetting, setSetting] = useColorMode({ storageKey });
    const setting = value ?? storedSetting;
    /* A first visit takes the default; a stored choice always wins. */
    useEffect(() => {
      if (value !== undefined || defaultValue === undefined) return;
      let stored: string | null = null;
      try {
        stored = localStorage.getItem(storageKey ?? DEFAULT_COLOR_MODE_STORAGE_KEY);
      } catch {
        // Storage unavailable: nothing is stored, so the default applies.
      }
      if (stored === null) setSetting(defaultValue);
      // eslint-disable-next-line react-hooks/exhaustive-deps -- once, on mount
    }, []);

    const segments = [
      { value: 'system', label: systemLabel, icon: 'routine' },
      { value: 'light', label: lightLabel, icon: 'light_mode' },
      { value: 'dark', label: darkLabel, icon: 'dark_mode' },
    ];
    const pick = (next: ColorModeSetting) => {
      if (value === undefined) setSetting(next);
      onValueChange?.(next);
    };

    if (cycle) {
      const index = Math.max(
        segments.findIndex((segment) => segment.value === setting),
        0,
      );
      const current = segments[index];
      const next = segments[(index + 1) % segments.length];
      return (
        <div
          {...rest}
          ref={ref}
          className={['ds-theme-toggle', 'ds-theme-toggle--cycle', className].filter(Boolean).join(' ')}
        >
          <CircularButton
            icon={current.icon}
            size={size}
            variant="secondary"
            tone="neutral"
            ariaLabel={cycleLabel(current.label, next.label)}
            tooltip={current.label}
            onClick={() => pick(next.value as ColorModeSetting)}
          />
        </div>
      );
    }

    return (
      <SegmentedControl
        aria-label={ariaLabel}
        {...rest}
        ref={ref}
        // `ds-theme-toggle--icons` styles nothing now (the icon strip is
        // SegmentedControl's `--icons` form); it stays as a consumer hook.
        className={['ds-theme-toggle', !showLabels && 'ds-theme-toggle--icons', className]
          .filter(Boolean)
          .join(' ')}
        segments={segments}
        value={setting}
        onValueChange={(picked) => pick(picked as ColorModeSetting)}
        size={size}
        // An icon strip turns each label into its segment's tooltip (the
        // SegmentedControl's own icon-only form), so no glyph goes unnamed.
        showLabels={showLabels}
      />
    );
  },
);

ThemeToggle.displayName = 'ThemeToggle';
