// No 'use client' directive: Panel is purely presentational (no hooks, no event
// handlers), so it stays renderable from a React Server Component.

import React from 'react';
import './Panel.css';

/** Props owned by Panel itself; everything else falls through to the <div>. */
type PanelOwnProps = {
  /** Interior padding: 'default' uses --padding-lg, 'compact' uses --padding-md, 'none' removes it */
  padding?: 'default' | 'compact' | 'none';
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
 * A rounded container on the primary container background with no border and
 * no shadow: just the surface, ready for whatever a dashboard region holds.
 * Content stacks vertically with a medium gap.
 *
 * Forwards a ref to the `<div>` element and spreads unrecognised props onto it.
 */
export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ padding = 'default', className = '', children, ...rest }, ref) => {
    const baseClass = 'ds-panel';

    const classes = [
      baseClass,
      padding === 'compact' ? `${baseClass}--compact` : '',
      padding === 'none' ? `${baseClass}--flush` : '',
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
