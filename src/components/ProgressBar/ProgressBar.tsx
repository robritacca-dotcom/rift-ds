import React from 'react';
import './ProgressBar.css';

/** Props owned by ProgressBar itself — everything else falls through to the root div. */
type ProgressBarOwnProps = {
  /** Current progress value (0–100) */
  value?: number;
  /** Size of the bar */
  size?: 'default' | 'compact';
  /** Show percentage label */
  showLabel?: boolean;
  /** Accessible label describing what is loading. Defaults to "Progress"; a passed native `aria-label` works too. */
  ariaLabel?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface ProgressBarProps
  extends ProgressBarOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof ProgressBarOwnProps | 'children'> {}

/**
 * ProgressBar displays completion progress as a horizontal bar.
 * Forwards a ref to the root `progressbar` div and spreads native
 * attributes onto it.
 */
export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ value = 0, size = 'default', showLabel = false, ariaLabel, className = '', ...rest }, ref) => {
    const clamped = Math.max(0, Math.min(100, value));
    const baseClass = 'ds-progress-bar';
    const classes = [
      baseClass,
      `${baseClass}--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // `ariaLabel` is the documented prop; a native `aria-label` is honoured
    // when it is not set, and "Progress" is the last resort.
    const { 'aria-label': restAriaLabel, ...restProps } = rest;

    return (
      <div
        {...restProps}
        ref={ref}
        className={classes}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel || restAriaLabel || 'Progress'}
      >
        <div className={`${baseClass}__track`}>
          <div className={`${baseClass}__fill`} style={{ width: `${clamped}%` }} />
        </div>
        {showLabel && <span className={`${baseClass}__label`}>{clamped}%</span>}
      </div>
    );
  },
);

ProgressBar.displayName = 'ProgressBar';
