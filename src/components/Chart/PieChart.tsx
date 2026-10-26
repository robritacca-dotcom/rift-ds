'use client';

import React, { useCallback, useId } from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { ChartSummaryItem } from './BarChart';
import { getChartSeriesColors, readTokenPx } from './palette';
import { useChartAnimation } from './useChartAnimation';
import './Chart.css';
import { useLocale } from '../../behaviors/LocaleProvider';
import { formatNumber } from '../../behaviors/locale';

interface PieChartTooltipPayloadEntry {
  value?: number;
  name?: string;
  payload?: { fill?: string; [key: string]: unknown };
  [key: string]: unknown;
}

interface PieChartTooltipProps {
  /** The locale the values are written in. */
  locale: string;
  active?: boolean;
  payload?: PieChartTooltipPayloadEntry[];
}

export interface PieSlice {
  /** Display name */
  name: string;
  /** Numeric value */
  value: number;
  /** Slice fill colour */
  color?: string;
}

/** Props owned by PieChart itself; everything else falls through to the root div. */
type PieChartOwnProps = {
  /** The BCP 47 locale the values, tooltips and value axis are written in, such as `de-DE`. Defaults to the nearest LocaleProvider's, else `en-US`. */
  locale?: string;
  /** Array of slices */
  data: PieSlice[];
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
  /** Inner radius for donut style (0 = solid pie) */
  innerRadius?: number;
  /** Outer radius */
  outerRadius?: number;
  /** Show legend */
  showLegend?: boolean;
  /** Strip the card chrome (border, padding, fill) when the chart sits inside another panel that supplies the surface */
  bare?: boolean;
  /** Additional CSS classes on the wrapper */
  className?: string;
};

export interface PieChartProps
  extends PieChartOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof PieChartOwnProps | 'children'> {}

function getCSSVar(name: string, fallback: string): string {
  // A var() reference resolves live in SVG paint, so the chart follows a
  // theme switch without re-rendering; the fallback covers SSR markup and
  // token-less consumers.
  return `var(${name}, ${fallback})`;
}

function PieChartTooltip({ locale, active, payload }: PieChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];

  return (
    <div className="ds-chart__tooltip">
      <div className="ds-chart__tooltip-row">
        <span
          className="ds-chart__tooltip-dot"
          style={{ backgroundColor: entry.payload?.fill }}
        />
        <span className="ds-chart__tooltip-name">{entry.name}</span>
        <span className="ds-chart__tooltip-value">
          {(entry.value === undefined ? undefined : formatNumber(entry.value, locale))}
        </span>
      </div>
    </div>
  );
}

/**
 * Pie / donut chart built on Recharts with design-system tokens.
 * Set innerRadius > 0 for a donut variant.
 */
export const PieChart = React.forwardRef<HTMLDivElement, PieChartProps>(({
  data,
  title,
  subtitle,
  summaryItems,
  height = 350,
  innerRadius = 0,
  outerRadius = 140,
  showLegend = true,
  bare = false,
  className = '',
  locale: localeProp,
  ...rest
}, ref) => {
  const locale = useLocale(localeProp);
  const titleId = useId();
  const subtitleId = useId();
  const animation = useChartAnimation(data);
  const baseClass = 'ds-chart';
  const classes = [baseClass, bare ? `${baseClass}--bare` : '', className]
    .filter(Boolean)
    .join(' ');
  const defaultColors = getChartSeriesColors();
  const textSecondary = getCSSVar('--color-text-secondary', '#303030');
  // Ticks and legend read the caption type token, so a theme's type scale
  // reaches them. recharts sizes text through an SVG attribute, which cannot
  // hold var(), so the resolved number is read at render.
  const textSize = readTokenPx('--font-caption-size', '12px');

  const renderTooltip = useCallback(
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    (props: any) => <PieChartTooltip {...props} locale={locale} />,
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
          <RechartsPieChart>
            <Pie
              {...animation}
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              strokeWidth={2}
              stroke="var(--color-bg-container-primary)"
            >
              {data.map((slice, i) => (
                <Cell
                  key={slice.name}
                  fill={slice.color || defaultColors[i % defaultColors.length]}
                />
              ))}
            </Pie>
            <Tooltip content={renderTooltip} />
            {showLegend && (
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => (
                  <span style={{ color: textSecondary, fontSize: textSize }}>{value}</span>
                )}
              />
            )}
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

PieChart.displayName = 'PieChart';
