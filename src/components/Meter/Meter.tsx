import React from 'react';
import './Meter.css';
import { DEFAULT_LOCALE, formatPercent } from '../../behaviors/locale';

/** Props owned by Meter itself — everything else falls through to the root node. */
type MeterOwnProps = {
  /** Current level */
  value?: number;
  /** Lower bound of the range */
  min?: number;
  /** Upper bound of the range */
  max?: number;
  /**
   * Visible label naming what is measured, doubling as the meter's accessible
   * name. A native `aria-label` takes precedence, and with neither the meter
   * is announced as "Level".
   */
  label?: string;
  /** Shows the value readout on the trailing edge of the label row */
  showValue?: boolean;
  /** Readout override — replaces the default percentage, spoken via aria-valuetext */
  valueText?: string;
  /** Status role colouring the fill */
  variant?: 'info' | 'positive' | 'warning' | 'error' | 'neutral';
  /** Component size (bar height) */
  size?: 'default' | 'compact';
  /** The BCP 47 locale the default percentage readout is written in, such as `ar-EG`. Defaults to `en-US`. This component can render from a Server Component, so it takes the prop alone and reads no LocaleProvider. */
  locale?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface MeterProps
  extends MeterOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof MeterOwnProps> {}

/**
 * Level indicator for a known quantity — storage used, tokens spent,
 * password strength, battery left. The counterpart to ProgressBar, which
 * shows a task moving toward completion; a Meter shows how full something
 * is right now, and its status colour says whether that is good news.
 *
 * Purely presentational (no 'use client'), so it renders from a Server
 * Component. Forwards a ref to the root element and spreads unrecognised
 * props onto it.
 */
export const Meter = React.forwardRef<HTMLDivElement, MeterProps>(
  (
    {
      value = 0,
      min = 0,
      max = 100,
      label,
      showValue = false,
      valueText,
      variant = 'info',
      size = 'default',
      locale = DEFAULT_LOCALE,
      className = '',
      'aria-label': ariaLabel,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-meter';

    const range = max - min;
    const fraction = range > 0 ? Math.max(0, Math.min(1, (value - min) / range)) : 0;
    const percent = Math.round(fraction * 100);
    const readout = valueText ?? formatPercent(percent, locale);

    const classes = [baseClass, `${baseClass}--${variant}`, `${baseClass}--${size}`, className]
      .filter(Boolean)
      .join(' ');

    return (
      <div {...rest} ref={ref} className={classes}>
        {(label || showValue) && (
          <div className={`${baseClass}__header`}>
            {label && <span className={`${baseClass}__label`}>{label}</span>}
            {showValue && <span className={`${baseClass}__value`}>{readout}</span>}
          </div>
        )}
        <div
          className={`${baseClass}__track`}
          role="meter"
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuetext={valueText}
          aria-label={ariaLabel ?? label ?? 'Level'}
        >
          <div className={`${baseClass}__fill`} style={{ width: `${fraction * 100}%` }} />
        </div>
      </div>
    );
  },
);

Meter.displayName = 'Meter';
