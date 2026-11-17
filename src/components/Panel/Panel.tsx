// No 'use client' directive: Panel is purely presentational (no hooks, no event
// handlers), so it stays renderable from a React Server Component.

import React from 'react';
import './Panel.css';

/** Props owned by Panel itself; everything else falls through to the <div>. */
type PanelOwnProps = {
  /** Interior padding: 'default' uses --padding-500, 'compact' uses --padding-400, 'none' removes it */
  padding?: 'default' | 'compact' | 'none';
  /** Draws the container border the Widget tile wears, so the panel keeps a visible edge in a theme whose page fill matches the panel's. */
  bordered?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Panel content */
  children?: React.ReactNode;
};

export interface PanelProps
  extends PanelOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof PanelOwnProps> {}

/**
 * Panel component: the plain dashboard surface.
 * A rounded container on the primary container background with no shadow and,
 * unless `bordered`, no border: just the surface, ready for whatever a
 * dashboard region holds.
 * Content stacks vertically with a medium gap.
 *
 * Forwards a ref to the `<div>` element and spreads unrecognised props onto it.
 */
export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ padding = 'default', bordered = false, className = '', children, ...rest }, ref) => {
    const baseClass = 'ds-panel';

    const classes = [
      baseClass,
      padding === 'compact' ? `${baseClass}--compact` : '',
      padding === 'none' ? `${baseClass}--flush` : '',
      bordered ? `${baseClass}--bordered` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div {...rest} ref={ref} className={classes}>
        {children}
      </div>
    );
  },
);

Panel.displayName = 'Panel';
