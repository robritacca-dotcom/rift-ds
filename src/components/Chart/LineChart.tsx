import { useCallback } from 'react';
import {
  LineChart as RechartsLineChart,
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

interface LineChartTooltipPayloadEntry {
  value?: number;
  color?: string;
  dataKey?: string;
  name?: string;
  [key: string]: unknown;
}

interface LineChartTooltipProps {
  active?: boolean;
  payload?: LineChartTooltipPayloadEntry[];
  label?: string | number;
}

export interface LineSeriesConfig {
  /** Key in data for this series */
  dataKey: string;
  /** Display name (shown in tooltip) */
  label: string;
  /** Line colour — CSS value */
  color?: string;
  /** Dashed line */
  strokeDasharray?: string;
}

export interface LineChartProps {
  /** Array of data objects */
  data: Record<string, unknown>[];
  /** Key in data for x-axis values */
  xKey?: string;
  /** One or more line series to render */
  series: LineSeriesConfig[];
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

function getCSSVar(name: string, fallback: string): string {
  // A var() reference resolves live in SVG paint, so the chart follows a
  // theme switch without re-rendering; the fallback covers SSR markup and
  // token-less consumers.
  return `var(${name}, ${fallback})`;
}

function LineChartTooltip({ active, payload, label }: LineChartTooltipProps) {
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
 * Line chart built on Recharts with design-system tokens.
 * Supports multiple series with individual colours.
 */
export const LineChart = ({
  data,
  xKey = 'label',
  series,
  title,
  subtitle,
  summaryItems,
  height = 350,
  bare = false,
  className = '',
}: LineChartProps) => {
  const baseClass = 'ds-chart';
  const classes = [baseClass, bare ? `${baseClass}--bare` : '', className]
    .filter(Boolean)
    .join(' ');

  const textSecondary = getCSSVar('--color-text-secondary', '#303030');
  const gridColor = getCSSVar('--color-divider', 'rgba(214, 214, 214, 0.8)');
  const seriesColors = getChartSeriesColors();

  const renderTooltip = useCallback(
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    (props: any) => <LineChartTooltip {...props} />,
    [],
  );

  return (
    <div className={classes}>
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

      <div className={`${baseClass}__body`}>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsLineChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -12 }}>
            <CartesianGrid vertical={false} stroke={gridColor} />
            <XAxis
              dataKey={xKey}
              tick={{ fill: textSecondary, fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: gridColor }}
            />
            <YAxis
              tick={{ fill: textSecondary, fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={renderTooltip} />
            {series.map((s, i) => (
              <Line
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.label}
                stroke={s.color || seriesColors[i % seriesColors.length]}
                strokeWidth={2}
                strokeDasharray={s.strokeDasharray}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
