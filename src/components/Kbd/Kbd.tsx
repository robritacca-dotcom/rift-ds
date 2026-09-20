import React from 'react';
import './Kbd.css';

/** Props owned by Kbd itself — everything else falls through to the <kbd> element. */
type KbdOwnProps = {
  /** Key size */
  size?: 'default' | 'compact';
  /** Additional CSS classes */
  className?: string;
  /** The key legend — e.g. ⌘, K, Esc, Shift */
  children?: React.ReactNode;
};

export interface KbdProps
  extends KbdOwnProps,
    Omit<React.ComponentPropsWithoutRef<'kbd'>, keyof KbdOwnProps> {}

/**
 * Kbd renders a single keyboard key as a keycap, for shortcut hints in
 * menus and docs prose. Compose several for a chord: `<Kbd>⌘</Kbd><Kbd>K</Kbd>`.
 * Purely presentational — safe to render from a Server Component.
 */
export const Kbd = React.forwardRef<HTMLElement, KbdProps>(
  ({ size = 'default', className = '', children, ...rest }, ref) => {
    const baseClass = 'ds-kbd';

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
