'use client';

import React, { useRef, useState } from 'react';
import { SegmentedControl } from '../SegmentedControl/SegmentedControl';
import { useAnchoredPosition } from '../../behaviors/useAnchoredPosition';
import type { ColorModeSetting } from './colorMode';
import { useColorMode } from './useColorMode';
import './ThemeToggle.css';

/** Props owned by ThemeToggle itself — everything else falls through to the strip. */
type ThemeToggleOwnProps = {
  /** Control size, on SegmentedControl's scale. */
  size?: 'default' | 'compact';
  /** Show each segment's label beside its icon. Set `false` for an icon-only strip: each label becomes the segment's tooltip on hover and keyboard focus, and stays its accessible name. */
  showLabels?: boolean;
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
 * Forwards a ref to the strip and spreads unrecognised props onto it.
 */
export const ThemeToggle = React.forwardRef<HTMLDivElement, ThemeToggleProps>(
  (
    {
      size = 'compact',
      showLabels = true,
      storageKey,
      systemLabel = 'System',
      lightLabel = 'Light',
      darkLabel = 'Dark',
      className = '',
      'aria-label': ariaLabel = 'Colour mode',
      ...rest
    },
    ref,
  ) => {
    const [setting, setSetting] = useColorMode({ storageKey });

    // The icon strip's tooltips: the label of the segment under the pointer
    // or keyboard focus is placed against its segment by the shared
    // anchored-position behaviour, so a seat that clips (a sidebar's floor)
    // cannot cut it off, and it flips above when there is no room below.
    const stripRef = useRef<HTMLDivElement | null>(null);
    const segmentRef = useRef<HTMLElement | null>(null);
    const labelRef = useRef<HTMLElement | null>(null);
    const [tip, setTip] = useState<number | null>(null);
    const setStripRef = (node: HTMLDivElement | null) => {
      stripRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };
    const showTip = (target: EventTarget | null) => {
      if (showLabels) return;
      const segment = (target as HTMLElement | null)?.closest<HTMLElement>('.ds-segmented-control__segment');
      const strip = stripRef.current;
      if (!segment || !strip) return;
      segmentRef.current = segment;
      labelRef.current = segment.querySelector<HTMLElement>('.ds-segmented-control__label');
      setTip([...strip.querySelectorAll('.ds-segmented-control__segment')].indexOf(segment));
    };
    useAnchoredPosition({
      open: tip !== null,
      target: tip,
      anchorRef: segmentRef,
      panelRef: labelRef,
      side: 'bottom',
      align: 'center',
      gapProperty: '--gap-100',
    });
    const segments = [
      { value: 'system', label: systemLabel, icon: 'routine' },
      { value: 'light', label: lightLabel, icon: 'light_mode' },
      { value: 'dark', label: darkLabel, icon: 'dark_mode' },
    ];
    return (
      <SegmentedControl
        aria-label={ariaLabel}
        {...rest}
        ref={setStripRef}
        onPointerOver={(event) => {
          rest.onPointerOver?.(event);
          showTip(event.target);
        }}
        onFocus={(event) => {
          rest.onFocus?.(event);
          showTip(event.target);
        }}
        className={['ds-theme-toggle', !showLabels && 'ds-theme-toggle--icons', className]
          .filter(Boolean)
          .join(' ')}
        segments={segments}
        value={setting}
        onValueChange={(value) => setSetting(value as ColorModeSetting)}
        size={size}
        // The icon strip keeps its labels rendered: the stylesheet turns each
        // into the segment's tooltip, so the glyphs are never left unnamed.
        showLabels
      />
    );
  },
);

ThemeToggle.displayName = 'ThemeToggle';
