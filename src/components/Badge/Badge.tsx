import React from 'react';
import './Badge.css';

/** Props owned by Badge itself — everything else falls through to the root span. */
type BadgeOwnProps = {
  /** Badge label text */
  label: string;
  /** Badge variant determines colour */
  variant?: 'info' | 'positive' | 'warning' | 'error' | 'neutral';
  /** Additional CSS classes */
  className?: string;
};

export interface BadgeProps
  extends BadgeOwnProps,
    Omit<React.ComponentPropsWithoutRef<'span'>, keyof BadgeOwnProps | 'children'> {}

/**
 * Badge component for small inline status labels.
 * Supports info, positive, warning, error, and neutral variants.
 * Forwards a ref to the root span and spreads native attributes onto it;
 * a passed `role` replaces the default `status`.
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ label, variant = 'neutral', className = '', ...rest }, ref) => {
    const baseClass = 'ds-badge';
    const variantClass = `${baseClass}--${variant}`;

    const classes = [baseClass, variantClass, className]
      .filter(Boolean)
      .join(' ');

    return (
      <span role="status" {...rest} ref={ref} className={classes}>
        {label}
      </span>
    );
  },
);

Badge.displayName = 'Badge';
