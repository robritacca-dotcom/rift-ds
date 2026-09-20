import React from 'react';
import './LegendTile.css';

/** Props owned by LegendTile itself — everything else falls through to the root div. */
type LegendTileOwnProps = {
  /** The series name shown above the value. Truncates with an ellipsis rather than wrapping. */
  label: string;
  /**
   * The reading for this series. Numbers are formatted with `toLocaleString()`;
   * pass a string when the value carries its own formatting or a unit.
   */
  value: string | number;
  /**
   * Any CSS colour for the series dot — consumers typically pass a chart
   * palette token, e.g. `var(--color-chart-series-1)`. When omitted, no dot
   * renders.
   */
  swatch?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface LegendTileProps
  extends LegendTileOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof LegendTileOwnProps> {}

/**
 * LegendTile — the labelled value tile that sits under a chart and ties a
 * series to its number. An inset tile one surface step below its panel, with
 * an optional series dot matching the chart's palette. Pure JSX and CSS: no
 * charting library, no hooks, so it renders from a Server Component and a row
 * of them costs nothing under a dense dashboard.
 */
// No 'use client': purely presentational — no hooks, handlers, or browser APIs.
export const LegendTile = React.forwardRef<HTMLDivElement, LegendTileProps>(
  ({ label, value, swatch, className = '', style, ...rest }, ref) => {
    const baseClass = 'ds-legend-tile';

    const classes = [baseClass, className].filter(Boolean).join(' ');

    // The one place a per-instance colour arrives: the swatch flows in as an
    // inline custom property, so the CSS file itself stays token-only.
    const mergedStyle = swatch
      ? ({ ...style, '--legend-tile-swatch': swatch } as React.CSSProperties)
      : style;

    return (
      <div {...rest} ref={ref} className={classes} style={mergedStyle}>
        <span className={`${baseClass}__label`}>
          {swatch && <span className={`${baseClass}__dot`} aria-hidden="true" />}
          {label}
        </span>
        <span className={`${baseClass}__value`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
      </div>
    );
  },
);

LegendTile.displayName = 'LegendTile';
