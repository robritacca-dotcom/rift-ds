'use client';

import React, { useCallback, useId } from 'react';
import {
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ZAxis,
} from 'recharts';
import type { ChartSummaryItem } from './BarChart';
import { getChartSeriesColors, readTokenPx } from './palette';
import { useChartAnimation } from './useChartAnimation';
import { MOTION_CHART_ENTRANCE_MS } from '../../tokens/motion';
import './Chart.css';
import { useLocale } from '../../behaviors/LocaleProvider';
import { formatAxisNumber, formatNumber } from '../../behaviors/locale';

interface ScatterTooltipPayloadEntry {
  value?: number;
  name?: string;
  dataKey?: string;
  payload?: Record<string, unknown>;
  [key: string]: unknown;
}

interface ScatterTooltipProps {
  /** The locale the values are written in. */
  locale: string;
  active?: boolean;
  payload?: ScatterTooltipPayloadEntry[];
  xLabel: string;
  yLabel: string;
}

export interface ScatterDatasetConfig {
  /** Display name for this dataset (shown in tooltip and legend) */
  name: string;
  /** Array of data points */
  data: Record<string, unknown>[];
  /** Fill colour */
  color?: string;
}

/** Props owned by ScatterChart itself; everything else falls through to the root div. */
type ScatterChartOwnProps = {
  /** The BCP 47 locale the values, tooltips and value axis are written in, such as `de-DE`. Defaults to the nearest LocaleProvider's, else `en-US`. */
  locale?: string;
  /** One or more scatter datasets to plot */
  datasets: ScatterDatasetConfig[];
  /** Key in data for x-axis values */
  xKey?: string;
  /** Key in data for y-axis values */
  yKey?: string;
  /** Display label for x-axis */
  xLabel?: string;
  /** Display label for y-axis */
  yLabel?: string;
  /**
   * Chart title, in the shared chart header; it also names the figure.
   * Note: this replaces the native `title` tooltip attribute, which the chart does not expose.
   */
  title?: string;
  /** Description text below the title */
  subtitle?: string;
  /** Summary stats displayed in the header */
  summaryItems?: ChartSummaryItem[];
  /** Chart area height in pixels */
  height?: number;
  /** Strip the card chrome (border, padding, fill) when the chart sits inside another panel that supplies the surface */
  bare?: boolean;
  /** Additional CSS classes on the wrapper */
  className?: string;
};

export interface ScatterChartProps
  extends ScatterChartOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof ScatterChartOwnProps | 'children'> {}

function getCSSVar(name: string, fallback: string): string {
  // A var() reference resolves live in SVG paint, so the chart follows a
  // theme switch without re-rendering; the fallback covers SSR markup and
  // token-less consumers.
  return `var(${name}, ${fallback})`;
}

function ScatterTooltip({ locale, active, payload, xLabel, yLabel }: ScatterTooltipProps) {
  if (!active || !payload?.length) return null;

  const xEntry = payload.find((p) => p.dataKey === payload[0]?.dataKey);
  const yEntry = payload.find((p) => p.name === yLabel) || payload[1];

  return (
    <div className="ds-chart__tooltip">
      <div className="ds-chart__tooltip-row">
        <span className="ds-chart__tooltip-name">{xLabel}</span>
        <span className="ds-chart__tooltip-value">
          {(xEntry?.value === undefined ? undefined : formatNumber(xEntry?.value, locale))}
        </span>
      </div>
      {yEntry && (
        <div className="ds-chart__tooltip-row">
          <span className="ds-chart__tooltip-name">{yLabel}</span>
          <span className="ds-chart__tooltip-value">
            {(yEntry.value === undefined ? undefined : formatNumber(yEntry.value, locale))}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Scatter chart built on Recharts with design-system tokens.
 * Plots one or more datasets as point clouds on an X/Y grid.
 */
export const ScatterChart = React.forwardRef<HTMLDivElement, ScatterChartProps>(({
  datasets,
  xKey = 'x',
  yKey = 'y',
  xLabel = 'X',
  yLabel = 'Y',
  title,
  subtitle,
  summaryItems,
  height = 350,
  bare = false,
  className = '',
  locale: localeProp,
  ...rest
}, ref) => {
  const locale = useLocale(localeProp);
  const formatTick = useCallback(
    (value: unknown) => (typeof value === 'number' ? formatAxisNumber(value, locale) : String(value)),
    [locale],
  );
  const titleId = useId();
  const subtitleId = useId();
  /* Scatter is the one recharts item with no end callback, so the wrapper
     paces the sweep itself and the hook drops the flag on a timer. */
  const animation = useChartAnimation(datasets, datasets.length, {
    durationMs: MOTION_CHART_ENTRANCE_MS,
  });
  const baseClass = 'ds-chart';
  const classes = [baseClass, bare ? `${baseClass}--bare` : '', className]
    .filter(Boolean)
    .join(' ');

  const seriesColors = getChartSeriesColors();
  const textSecondary = getCSSVar('--color-text-secondary', '#303030');
  // Ticks and legend read the caption type token, so a theme's type scale
  // reaches them. recharts sizes text through an SVG attribute, which cannot
  // hold var(), so the resolved number is read at render.
  const textSize = readTokenPx('--font-caption-size', '12px');
  const gridColor = getCSSVar('--color-divider', 'rgba(214, 214, 214, 0.8)');

  const renderTooltip = useCallback(
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    (props: any) => <ScatterTooltip {...props} locale={locale} xLabel={xLabel} yLabel={yLabel} />,
    [xLabel, yLabel, locale],
  );

  return (
    <div
      {...rest}
      ref={ref}
      className={classes}
      role="figure"
      aria-labelledby={title ? titleId : rest['aria-labelledby']}
      aria-describedby={subtitle ? subtitleId : rest['aria-describedby']}
    >
      {(title || subtitle || summaryItems) && (
        <div className={`${baseClass}__header`}>
          <div className={`${baseClass}__header-text`}>
            {title && <h3 id={titleId} className={`${baseClass}__title`}>{title}</h3>}
            {subtitle && <p id={subtitleId} className={`${baseClass}__subtitle`}>{subtitle}</p>}
          </div>
          {summaryItems && summaryItems.length > 0 && (
            <div className={`${baseClass}__summary`}>
              {summaryItems.map((item, i) => (
                <div key={i} className={`${baseClass}__summary-item`}>
                  <span className={`${baseClass}__summary-label`}>{item.label}</span>
                  <span className={`${baseClass}__summary-value`}>
                    {typeof item.value === 'number' ? formatNumber(item.value, locale) : item.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className={`${baseClass}__body`}>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsScatterChart margin={{ top: 8, right: 4, bottom: 0, left: -12 }}>
            <CartesianGrid stroke={gridColor} />
            <XAxis
              tickFormatter={formatTick}
              type="number"
              dataKey={xKey}
              name={xLabel}
              tick={{ fill: textSecondary, fontSize: textSize }}
              tickLine={false}
              axisLine={{ stroke: gridColor }}
            />
            <YAxis
              tickFormatter={formatTick}
              type="number"
              dataKey={yKey}
              name={yLabel}
              tick={{ fill: textSecondary, fontSize: textSize }}
              tickLine={false}
              axisLine={false}
            />
            <ZAxis range={[48, 48]} />
            <Tooltip content={renderTooltip} />
            {datasets.map((ds, i) => (
              <Scatter
                key={ds.name}
                {...animation}
                name={ds.name}
                data={ds.data}
                fill={ds.color || seriesColors[i % seriesColors.length]}
              />
            ))}
            {datasets.length > 1 && (
              <Legend wrapperStyle={{ color: textSecondary, fontSize: textSize }} />
            )}
          </RechartsScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

ScatterChart.displayName = 'ScatterChart';
