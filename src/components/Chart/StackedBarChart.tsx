'use client';

import React, { useCallback, useId } from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ChartSummaryItem } from './BarChart';
import { getChartSeriesColors, readTokenPx } from './palette';
import { useChartAnimation } from './useChartAnimation';
import './Chart.css';
import { useLocale } from '../../behaviors/LocaleProvider';
import { formatAxisNumber, formatNumber } from '../../behaviors/locale';

interface StackedTooltipPayloadEntry {
  value?: number;
  color?: string;
  dataKey?: string;
  name?: string;
  [key: string]: unknown;
}

interface StackedTooltipProps {
  /** The locale the values are written in. */
  locale: string;
  active?: boolean;
  payload?: StackedTooltipPayloadEntry[];
  label?: string | number;
}

export interface BarSeriesConfig {
  /** Key in data for this series */
  dataKey: string;
  /** Display name (shown in tooltip & legend) */
  label: string;
  /** Bar fill colour */
  color?: string;
}

/** Props owned by StackedBarChart itself; everything else falls through to the root div. */
type StackedBarChartOwnProps = {
  /** The BCP 47 locale the values, tooltips and value axis are written in, such as `de-DE`. Defaults to the nearest LocaleProvider's, else `en-US`. */
  locale?: string;
  /** Array of data objects */
  data: Record<string, unknown>[];
  /** Key in data for x-axis values */
  xKey?: string;
  /** One or more bar series to render (stacked) */
  series: BarSeriesConfig[];
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
  /** Y-axis tick formatter */
  yAxisFormatter?: (value: number) => string;
  /** Strip the card chrome (border, padding, fill) when the chart sits inside another panel that supplies the surface */
  bare?: boolean;
  /** Additional CSS classes on the wrapper */
  className?: string;
};

export interface StackedBarChartProps
  extends StackedBarChartOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof StackedBarChartOwnProps | 'children'> {}

function getCSSVar(name: string, fallback: string): string {
  // A var() reference resolves live in SVG paint, so the chart follows a
  // theme switch without re-rendering; the fallback covers SSR markup and
  // token-less consumers.
  return `var(${name}, ${fallback})`;
}

function StackedTooltip({ locale, active, payload, label }: StackedTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="ds-chart__tooltip">
      <div className="ds-chart__tooltip-label">{label}</div>
      {payload.map((entry, i) => (
        <div key={i} className="ds-chart__tooltip-row">
          <span className="ds-chart__tooltip-dot" style={{ backgroundColor: entry.color }} />
          <span className="ds-chart__tooltip-name">{entry.name}</span>
          <span className="ds-chart__tooltip-value">
            {(entry.value === undefined ? undefined : formatNumber(entry.value, locale))}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Stacked bar chart built on Recharts with design-system tokens.
 * Supports multiple series stacked on top of each other.
 */
export const StackedBarChart = React.forwardRef<HTMLDivElement, StackedBarChartProps>(({
  data,
  xKey = 'label',
  series,
  title,
  subtitle,
  summaryItems,
  height = 350,
  yAxisFormatter,
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
  const animation = useChartAnimation(data, series.length);
  const baseClass = 'ds-chart';
  const classes = [baseClass, bare ? `${baseClass}--bare` : '', className]
    .filter(Boolean)
    .join(' ');

  const textSecondary = getCSSVar('--color-text-secondary', '#303030');

  // Ticks and legend read the caption type token, so a theme's type scale

  // reaches them. recharts sizes text through an SVG attribute, which cannot

  // hold var(), so the resolved number is read at render.

  const textSize = readTokenPx('--font-caption-size', '12px');
  const gridColor = getCSSVar('--color-divider', 'rgba(214, 214, 214, 0.8)');
  const cursorColor = getCSSVar('--color-bg-container-secondary', '#F1F1F1');
  const defaultColors = getChartSeriesColors();

  const renderTooltip = useCallback(
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    (props: any) => <StackedTooltip {...props} locale={locale} />,
    [locale],
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
          <RechartsBarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -12 }}>
            <CartesianGrid vertical={false} stroke={gridColor} />
            <XAxis
              dataKey={xKey}
              tick={{ fill: textSecondary, fontSize: textSize }}
              tickLine={false}
              axisLine={{ stroke: gridColor }}
            />
            <YAxis
              tick={{ fill: textSecondary, fontSize: textSize }}
              tickLine={false}
              axisLine={false}
              tickFormatter={yAxisFormatter ?? formatTick}
            />
            <Tooltip
              content={renderTooltip}
              cursor={{ fill: cursorColor, opacity: 0.4 }}
            />
            {series.map((s, i) => (
              <Bar
                key={s.dataKey}
                {...animation}
                className={`${baseClass}__bar`}
                dataKey={s.dataKey}
                name={s.label}
                fill={s.color || defaultColors[i % defaultColors.length]}
                stackId="stack"
                radius={i === series.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
                maxBarSize={32}
              />
            ))}
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

StackedBarChart.displayName = 'StackedBarChart';
