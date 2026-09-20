import { useCallback } from 'react';
import {
  ComposedChart as RechartsComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ChartSummaryItem } from './BarChart';
import { getChartSeriesColors } from './palette';
import './Chart.css';

interface ComboTooltipPayloadEntry {
  value?: number;
  color?: string;
  fill?: string;
  name?: string;
  [key: string]: unknown;
}

interface ComboTooltipProps {
  active?: boolean;
  payload?: ComboTooltipPayloadEntry[];
  label?: string | number;
}

export interface ComboChartProps {
  /** Array of data objects */
  data: Record<string, unknown>[];
  /** Key in data for x-axis values */
  xKey?: string;
  /** Key in data for the bar series */
  barKey: string;
  /** Display name for the bar series, shown in the tooltip; defaults to the key */
  barLabel?: string;
  /** Key in data for the line series */
  lineKey: string;
  /** Display name for the line series, shown in the tooltip; defaults to the key */
  lineLabel?: string;
  /** Bar fill colour (CSS value or token reference) */
  barColor?: string;
  /** Line stroke colour (CSS value or token reference) */
  lineColor?: string;
  /** Plot the line on its own right-hand y-axis, for series in different units */
  secondaryAxis?: boolean;
  /** Chart title */
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
}

/**
 * Reads a CSS custom property from the document root.
 * Falls back to the provided default if unavailable (e.g. SSR).
 */
function getCSSVar(name: string, fallback: string): string {
  // A var() reference resolves live in SVG paint, so the chart follows a
  // theme switch without re-rendering; the fallback covers SSR markup and
  // token-less consumers.
  return `var(${name}, ${fallback})`;
}

/**
 * Custom tooltip rendered inside the chart on hover showing both series.
 */
function ComboTooltip({ active, payload, label }: ComboTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="ds-chart__tooltip">
      <div className="ds-chart__tooltip-label">{label}</div>
      {payload.map((entry, i) => (
        <div key={i} className="ds-chart__tooltip-row">
          <span
            className="ds-chart__tooltip-dot"
            style={{ backgroundColor: entry.color || entry.fill }}
          />
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
 * Combo chart built on Recharts with design-system tokens: one bar series
 * with an overlaid line series, optionally on a second y-axis, for pairs
 * like monthly spend (bars) against ROAS (line). Part of the Chart component
 * family, sharing wrapper, header, tooltip, and summary-stat styles.
 */
export const ComboChart = ({
  data,
  xKey = 'label',
  barKey,
  barLabel,
  lineKey,
  lineLabel,
  barColor,
  lineColor,
  secondaryAxis = true,
  title,
  subtitle,
  summaryItems,
  height = 350,
  bare = false,
  className = '',
}: ComboChartProps) => {
  const baseClass = 'ds-chart';
  const classes = [baseClass, bare ? `${baseClass}--bare` : '', className]
    .filter(Boolean)
    .join(' ');

  /* Resolve theme-aware colours once per render */
  const seriesColors = getChartSeriesColors();
  const resolvedBarColor = barColor || getCSSVar('--color-action-primary-bg', '#0E6E8F');
  const resolvedLineColor = lineColor || seriesColors[1];
  const textSecondary = getCSSVar('--color-text-secondary', '#303030');
  const gridColor = getCSSVar('--color-divider', 'rgba(214, 214, 214, 0.8)');
  const cursorColor = getCSSVar('--color-bg-container-secondary', '#F1F1F1');

  const resolvedBarLabel = barLabel || barKey;
  const resolvedLineLabel = lineLabel || lineKey;

  const renderTooltip = useCallback(
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    (props: any) => <ComboTooltip {...props} />,
    [],
  );

  return (
    <div className={classes}>
      {/* Header */}
      {(title || subtitle || summaryItems) && (
        <div className={`${baseClass}__header`}>
          <div className={`${baseClass}__header-text`}>
            {title && <h3 className={`${baseClass}__title`}>{title}</h3>}
            {subtitle && <p className={`${baseClass}__subtitle`}>{subtitle}</p>}
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

      {/* Chart */}
      <div className={`${baseClass}__body`}>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsComposedChart
            data={data}
            margin={{ top: 8, right: secondaryAxis ? -12 : 4, bottom: 0, left: -12 }}
          >
            <CartesianGrid vertical={false} stroke={gridColor} />
            <XAxis
              dataKey={xKey}
              tick={{ fill: textSecondary, fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: gridColor }}
            />
            <YAxis
              yAxisId="bar"
              tick={{ fill: textSecondary, fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            {secondaryAxis && (
              <YAxis
                yAxisId="line"
                orientation="right"
                tick={{ fill: textSecondary, fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
            )}
            <Tooltip
              content={renderTooltip}
              cursor={{ fill: cursorColor, opacity: 0.4 }}
            />
            <Bar
              yAxisId="bar"
              dataKey={barKey}
              name={resolvedBarLabel}
              fill={resolvedBarColor}
              radius={[3, 3, 0, 0]}
              maxBarSize={32}
            />
            <Line
              yAxisId={secondaryAxis ? 'line' : 'bar'}
              type="monotone"
              dataKey={lineKey}
              name={resolvedLineLabel}
              stroke={resolvedLineColor}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </RechartsComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
