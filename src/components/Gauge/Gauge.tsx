import React from 'react';
import '../Chart/Chart.css';
import './Gauge.css';

/** One colour switch point: at or above `value`, the dial takes `tone`. */
export interface GaugeThreshold {
  /** Reading at which this tone takes over. */
  value: number;
  /** Tone applied from this reading upward. */
  tone: 'accent' | 'positive' | 'warning' | 'error' | 'neutral';
}

/** Props owned by Gauge itself — everything else falls through to the root div. */
type GaugeOwnProps = {
  /** Current reading. Clamped into the `min`–`max` range for drawing. */
  value: number;
  /** Lower bound of the dial. */
  min?: number;
  /** Upper bound of the dial. */
  max?: number;
  /**
   * Colour role for the value arc. `accent` (the default) follows the chart
   * palette's lead colour. Ignored while a threshold matches — thresholds
   * exist so the dial recolours itself as the reading crosses them.
   */
  tone?: 'accent' | 'positive' | 'warning' | 'error' | 'neutral';
  /**
   * Colour switch points, e.g. warning at 70 and error at 90. The highest
   * threshold at or below the current reading wins; below them all, the
   * `tone` prop applies.
   */
  thresholds?: GaugeThreshold[];
  /** Shows the reading in the centre of the dial. */
  showValue?: boolean;
  /** Formats the centre reading — for units, precision, or locale. */
  formatValue?: (value: number) => string;
  /**
   * What the reading measures, shown as a caption under it and used as the
   * accessible name, e.g. "CPU usage".
   */
  label?: string;
  /** Chart title, in the shared chart header. */
  title?: string;
  /** Description text below the title. */
  subtitle?: string;
  /** Strip the card chrome (border, padding, fill) when the chart sits inside another panel that supplies the surface */
  bare?: boolean;
  /** Rendered dial diameter in pixels. The arc geometry scales with it. */
  size?: number;
  /** Arc thickness in pixels. */
  strokeWidth?: number;
  /** Additional CSS classes */
  className?: string;
};

export interface GaugeProps
  extends GaugeOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof GaugeOwnProps | 'children'> {}

/* The dial is a three-quarter circle: 270° of sweep with the gap at the
   bottom. Expressed through pathLength=100, the track occupies 75 units. */
const SWEEP_UNITS = 75;

/**
 * Gauge — a radial dial for a single bounded reading: capacity, usage, a
 * score against a target. Pure SVG computed from props — no charting library,
 * no hooks — so it renders from a Server Component. It wears the chart
 * family's card chrome (title, subtitle, padding) and takes `bare` to drop
 * it inside a Panel, like every other chart. Thresholds recolour the dial
 * through the status roles as the reading crosses them, and the arc animates
 * between readings via a CSS transition. The dial is announced as a `meter`
 * with the label as its accessible name.
 */
export const Gauge = React.forwardRef<HTMLDivElement, GaugeProps>(
  (
    {
      value,
      min = 0,
      max = 100,
      tone = 'accent',
      thresholds,
      showValue = true,
      formatValue,
      label,
      title,
      subtitle,
      bare = false,
      size = 120,
      strokeWidth = 12,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-gauge';
    const chartClass = 'ds-chart';

    // A degenerate range (max <= min) draws an empty dial rather than NaN.
    const range = max - min;
    const fraction = range > 0 ? Math.min(Math.max((value - min) / range, 0), 1) : 0;

    // The highest threshold at or below the reading wins.
    const activeThreshold = thresholds
      ?.filter((t) => value >= t.value)
      .sort((a, b) => b.value - a.value)[0];
    const resolvedTone = activeThreshold?.tone ?? tone;

    const classes = [
      chartClass,
      bare && `${chartClass}--bare`,
      baseClass,
      `${baseClass}--${resolvedTone}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    const valueUnits = Math.round(SWEEP_UNITS * fraction * 100) / 100;

    const displayValue = formatValue ? formatValue(value) : String(Math.round(value));

    // The meter semantics live on the dial, not the card; a consumer-passed
    // aria-label follows them there.
    const { 'aria-label': restAriaLabel, ...restProps } = rest;

    return (
      <div {...restProps} ref={ref} className={classes}>
        {(title || subtitle) && (
          <div className={`${chartClass}__header`}>
            <div className={`${chartClass}__header-text`}>
              {title && <h3 className={`${chartClass}__title`}>{title}</h3>}
              {subtitle && <p className={`${chartClass}__subtitle`}>{subtitle}</p>}
            </div>
          </div>
        )}
        <div className={`${chartClass}__body ${baseClass}__body`}>
          <div
            className={`${baseClass}__dial`}
            style={{ width: size, height: size }}
            role="meter"
            aria-valuenow={value}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuetext={displayValue}
            aria-label={label ?? restAriaLabel}
          >
            <svg
              className={`${baseClass}__svg`}
              viewBox={`0 0 ${size} ${size}`}
              width={size}
              height={size}
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Both circles start at 3 o'clock; rotating 135° puts the gap at
                  the bottom. pathLength=100 makes the dash sums size-independent. */}
              <circle
                className={`${baseClass}__track`}
                cx={center}
                cy={center}
                r={radius}
                pathLength={100}
                strokeWidth={strokeWidth}
                strokeDasharray={`${SWEEP_UNITS} ${100 - SWEEP_UNITS}`}
                transform={`rotate(135 ${center} ${center})`}
              />
              {valueUnits > 0 && (
                <circle
                  className={`${baseClass}__arc`}
                  cx={center}
                  cy={center}
                  r={radius}
                  pathLength={100}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${valueUnits} ${100 - valueUnits}`}
                  transform={`rotate(135 ${center} ${center})`}
                />
              )}
            </svg>
            {(showValue || label) && (
              <div className={`${baseClass}__center`}>
                {showValue && <span className={`${baseClass}__value`}>{displayValue}</span>}
                {label && <span className={`${baseClass}__label`}>{label}</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);

Gauge.displayName = 'Gauge';
