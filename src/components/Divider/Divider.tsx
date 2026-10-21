import React from 'react';
import './Divider.css';

/** Props owned by Divider itself — everything else falls through to the root node. */
type DividerOwnProps = {
  /** Divider direction */
  orientation?: 'horizontal' | 'vertical';
  /** Optional label rendered inline in the line (horizontal only) */
  label?: string;
  /** Label placement along the line */
  labelPosition?: 'start' | 'center';
  /** Margin around the divider (block for horizontal, inline for vertical) */
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
};

export interface DividerProps
  extends DividerOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof DividerOwnProps | 'children'> {}

/**
 * Divider component — a thin rule separating stacked content.
 * Plain horizontal by default; supports an inline text label
 * and a vertical orientation for use inside flex rows.
 * Renders an `<hr>` for a plain horizontal rule and a `<div role="separator">`
 * otherwise; forwards a ref to whichever it renders and spreads native
 * attributes onto it.
 */
export const Divider = React.forwardRef<HTMLElement, DividerProps>(
  (
    {
      orientation = 'horizontal',
      label,
      labelPosition = 'center',
      spacing = 'md',
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-divider';
    const spacingClass = `${baseClass}--spacing-${spacing}`;

    if (orientation === 'vertical') {
      const classes = [baseClass, `${baseClass}--vertical`, spacingClass, className]
        .filter(Boolean)
        .join(' ');
      return (
        <div
          {...rest}
          ref={ref as React.Ref<HTMLDivElement>}
          className={classes}
          role="separator"
          aria-orientation="vertical"
        />
      );
    }

    if (label) {
      const classes = [
        baseClass,
        `${baseClass}--labeled`,
        `${baseClass}--label-${labelPosition}`,
        spacingClass,
        className,
      ]
        .filter(Boolean)
        .join(' ');
      return (
        <div
          {...rest}
          ref={ref as React.Ref<HTMLDivElement>}
          className={classes}
          role="separator"
          aria-orientation="horizontal"
        >
          <span className={`${baseClass}__label`}>{label}</span>
        </div>
      );
    }

    const classes = [baseClass, spacingClass, className].filter(Boolean).join(' ');
    return (
      <hr
        {...(rest as React.ComponentPropsWithoutRef<'hr'>)}
        ref={ref as React.Ref<HTMLHRElement>}
        className={classes}
      />
    );
  },
);

Divider.displayName = 'Divider';
