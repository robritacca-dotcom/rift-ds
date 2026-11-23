import React from 'react';
import './ProgressBar.css';
import { DEFAULT_LOCALE, formatPercent } from '../../behaviors/locale';

/** Props owned by ProgressBar itself — everything else falls through to the root div. */
type ProgressBarOwnProps = {
  /** Current progress value (0–100) */
  value?: number;
  /** Size of the bar */
  size?: 'default' | 'compact';
  /** Show percentage label */
  showLabel?: boolean;
  /**
   * Legacy accessible-name prop for the bar, saying what is loading. A native `aria-label` wins when both are passed; with neither, the bar is named "Progress".
   *
   * @deprecated Pass the native `aria-label` attribute instead.
   */
  ariaLabel?: string;
  /** The BCP 47 locale the percentage label is written in, such as `ar-EG`. Defaults to `en-US`. This component can render from a Server Component, so it takes the prop alone and reads no LocaleProvider. */
  locale?: string;
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
  ({ value = 0, size = 'default', showLabel = false, ariaLabel, locale = DEFAULT_LOCALE, className = '', ...rest }, ref) => {
    const clamped = Math.max(0, Math.min(100, value));
    const baseClass = 'ds-progress-bar';
    const classes = [
      baseClass,
      `${baseClass}--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // A native `aria-label` wins over the deprecated `ariaLabel`, and
    // "Progress" is the last resort.
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
        aria-label={restAriaLabel || ariaLabel || 'Progress'}
      >
        <div className={`${baseClass}__track`}>
          <div className={`${baseClass}__fill`} style={{ width: `${clamped}%` }} />
        </div>
        {showLabel && <span className={`${baseClass}__label`}>{formatPercent(clamped, locale)}</span>}
      </div>
    );
  },
);

ProgressBar.displayName = 'ProgressBar';
