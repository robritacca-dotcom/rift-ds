'use client';

import React from 'react';
import {
  shortcutAria,
  shortcutKeys,
  usePlatform,
  type Shortcut,
  type ShortcutKeyLabels,
} from '../../behaviors/shortcuts';
import './Kbd.css';

/** Props owned by Kbd itself — everything else falls through to the <kbd> element. */
type KbdOwnProps = {
  /** Key size */
  size?: 'default' | 'compact';
  /** Additional CSS classes */
  className?: string;
  /** The key legend — e.g. ⌘, K, Esc, Shift. Ignored when `keys` is set. */
  children?: React.ReactNode;
  /**
   * A whole shortcut in the shortcut grammar (`mod+k`, `shift+?`, `g i`),
   * drawn as one keycap per key in the platform's legends: ⌘ K on a Mac,
   * Ctrl K elsewhere. The server draws the non-Apple legends and the browser
   * settles on its own after hydration.
   */
  keys?: Shortcut;
  /** Replaces any legend `keys` is drawn with, such as `{ ctrl: 'Strg' }` for a German keyboard. Merged over the platform's defaults. */
  keyLabels?: ShortcutKeyLabels;
};

export interface KbdProps
  extends KbdOwnProps,
    Omit<React.ComponentPropsWithoutRef<'kbd'>, keyof KbdOwnProps> {}

/**
 * Kbd renders a keyboard key as a keycap, for shortcut hints in menus and
 * docs prose: one key from `children`, or a whole shortcut from `keys`, drawn
 * as nested keycaps the way HTML marks up a key combination.
 */
export const Kbd = React.forwardRef<HTMLElement, KbdProps>(
  ({ size = 'default', className = '', children, keys, keyLabels, ...rest }, ref) => {
    const baseClass = 'ds-kbd';
    const platform = usePlatform();

    if (keys) {
      const steps = shortcutKeys(keys, platform, keyLabels);
      const classes = [baseClass, `${baseClass}--combo`, className].filter(Boolean).join(' ');
      return (
        <kbd aria-keyshortcuts={shortcutAria(keys, platform)} {...rest} ref={ref} className={classes}>
          {steps.map((step, stepIndex) => (
            <span key={stepIndex} className={`${baseClass}__step`}>
              {step.map((legend, keyIndex) => (
                <kbd key={keyIndex} className={`${baseClass} ${baseClass}--${size}`}>
                  {legend}
                </kbd>
              ))}
            </span>
          ))}
        </kbd>
      );
    }

    const classes = [baseClass, `${baseClass}--${size}`, className]
      .filter(Boolean)
      .join(' ');

    return (
      <kbd {...rest} ref={ref} className={classes}>
        {children}
      </kbd>
    );
  },
);

Kbd.displayName = 'Kbd';
