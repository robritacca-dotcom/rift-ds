'use client';

import React, { useCallback, useId } from 'react';
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { ChartSummaryItem } from './BarChart';
import { getChartSeriesColors, readTokenPx } from './palette';
import { useChartAnimation } from './useChartAnimation';
import './Chart.css';

interface RadarTooltipPayloadEntry {
  value?: number;
  color?: string;
  dataKey?: string;
  name?: string;
  [key: string]: unknown;
}

interface RadarTooltipProps {
  active?: boolean;
  payload?: RadarTooltipPayloadEntry[];
  label?: string | number;
}

export interface RadarSeriesConfig {
  /** Key in data for this series */
  dataKey: string;
  /** Display name (shown in tooltip and legend) */
  label: string;
  /** Fill / stroke colour — CSS value */
  color?: string;
  /** Fill opacity (0–1) */
  fillOpacity?: number;
}

/** Props owned by RadarChart itself; everything else falls through to the root div. */
type RadarChartOwnProps = {
  /** Array of data objects — each should have a category key and one or more value keys */
  data: Record<string, unknown>[];
  /** Key in data for the category labels on each axis */
  categoryKey?: string;
  /** One or more radar series to render */
  series: RadarSeriesConfig[];
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

export interface RadarChartProps
  extends RadarChartOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof RadarChartOwnProps | 'children'> {}

function getCSSVar(name: string, fallback: string): string {
  // A var() reference resolves live in SVG paint, so the chart follows a
  // theme switch without re-rendering; the fallback covers SSR markup and
  // token-less consumers.
  return `var(${name}, ${fallback})`;
}

function RadarTooltip({ active, payload, label }: RadarTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="ds-chart__tooltip">
      <div className="ds-chart__tooltip-label">{label}</div>
      {payload.map((entry, i) => (
        <div key={i} className="ds-chart__tooltip-row">
          <span className="ds-chart__tooltip-dot" style={{ backgroundColor: entry.color }} />
          <span className="ds-chart__tooltip-name">{entry.name}</span>
          <span className="ds-chart__tooltip-value">
            {entry.value?.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Radar chart built on Recharts with design-system tokens.
 * Renders one or more data series as filled polygons on a polar grid.
 */
export const RadarChart = React.forwardRef<HTMLDivElement, RadarChartProps>(({
  data,
  categoryKey = 'subject',
  series,
  title,
  subtitle,
  summaryItems,
  height = 350,
  bare = false,
  className = '',
  ...rest
}, ref) => {
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
  const seriesColors = getChartSeriesColors();

  const renderTooltip = useCallback(
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    (props: any) => <RadarTooltip {...props} />,
    [],
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
                    {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className={`${baseClass}__body`}>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsRadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke={gridColor} />
            <PolarAngleAxis
              dataKey={categoryKey}
              tick={{ fill: textSecondary, fontSize: textSize }}
            />
            <PolarRadiusAxis
              tick={{ fill: textSecondary, fontSize: textSize }}
              axisLine={false}
              tickCount={5}
            />
            <Tooltip content={renderTooltip} />
            {series.map((s, i) => (
              <Radar
                key={s.dataKey}
                {...animation}
                name={s.label}
                dataKey={s.dataKey}
                stroke={s.color || seriesColors[i % seriesColors.length]}
                fill={s.color || seriesColors[i % seriesColors.length]}
                fillOpacity={s.fillOpacity ?? 0.3}
              />
            ))}
            {series.length > 1 && (
              <Legend
                wrapperStyle={{ color: textSecondary, fontSize: textSize }}
              />
            )}
          </RechartsRadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

RadarChart.displayName = 'RadarChart';
