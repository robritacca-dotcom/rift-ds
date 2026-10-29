import React from 'react';
import './Stat.css';
import '../../fonts/material-symbols.css';
import { DEFAULT_LOCALE, formatNumber } from '../../behaviors/locale';

/** Props owned by Stat itself — everything else falls through to the root div. */
type StatOwnProps = {
  /** The headline number, e.g. "~900%" or "3.8M" — or a node, such as an AnimatedNumber, for figures that move */
  value: React.ReactNode;
  /** What the number measures */
  label: string;
  /** Optional change annotation, e.g. "+42% vs last quarter" */
  delta?: string;
  /** Direction of the delta — colours it and adds an arrow */
  trend?: 'up' | 'down' | 'neutral';
  /**
   * Where the delta sits: stacked below the label, inline to the right of the
   * value (bottom-aligned), or `auto`: inline while the stat has room and
   * stacked once it is narrow, such as a KPI tile in a two-up phone grid.
   * `auto` fills its parent's width and reads its own, so it restacks
   * wherever it sits, whatever the viewport.
   */
  deltaPlacement?: 'stacked' | 'inline' | 'auto';
  /** Stat size */
  size?: 'default' | 'large';
  /** The BCP 47 locale a number `value` is written in, such as `ar-EG`. Defaults to `en-US`. This component can render from a Server Component, so it takes the prop alone and reads no LocaleProvider. */
  locale?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface StatProps
  extends StatOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof StatOwnProps | 'children'> {}

const TREND_ICONS: Record<NonNullable<StatOwnProps['trend']>, string> = {
  up: 'arrow_upward',
  down: 'arrow_downward',
  neutral: 'remove',
};

/**
 * Stat component — a single headline metric with a label and an
 * optional trend delta. Compose several in a row for a metrics band.
 * Forwards a ref to the root div and spreads native attributes onto it.
 */
export const Stat = React.forwardRef<HTMLDivElement, StatProps>(
  (
    {
      value,
      label,
      delta,
      trend = 'neutral',
      deltaPlacement = 'stacked',
      size = 'default',
      locale = DEFAULT_LOCALE,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-stat';

    const classes = [
      baseClass,
      `${baseClass}--${size}`,
      deltaPlacement === 'inline' ? `${baseClass}--delta-inline` : '',
      deltaPlacement === 'auto' ? `${baseClass}--delta-auto` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const parts = (
      <>
        <span className={`${baseClass}__value`}>{typeof value === 'number' ? formatNumber(value, locale) : value}</span>
        <span className={`${baseClass}__label`}>{label}</span>
        {delta && (
          <span className={`${baseClass}__delta ${baseClass}__delta--${trend}`}>
            <span className="material-symbols-rounded" aria-hidden="true">
              {TREND_ICONS[trend]}
            </span>
            {delta}
          </span>
        )}
      </>
    );

    return (
      <div {...rest} ref={ref} className={classes}>
        {/* A container query styles only what sits inside the container,
            so `auto` lays its parts out on an inner body the root measures. */}
        {deltaPlacement === 'auto' ? <span className={`${baseClass}__body`}>{parts}</span> : parts}
      </div>
    );
  },
);

Stat.displayName = 'Stat';
