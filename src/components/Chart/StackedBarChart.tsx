import { useCallback } from 'react';
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
import { getChartSeriesColors } from './palette';
import './Chart.css';

interface StackedTooltipPayloadEntry {
  value?: number;
  color?: string;
  dataKey?: string;
  name?: string;
  [key: string]: unknown;
}

interface StackedTooltipProps {
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

export interface StackedBarChartProps {
  /** Array of data objects */
  data: Record<string, unknown>[];
  /** Key in data for x-axis values */
  xKey?: string;
  /** One or more bar series to render (stacked) */
  series: BarSeriesConfig[];
  /** Chart title */
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
}

function getCSSVar(name: string, fallback: string): string {
  // A var() reference resolves live in SVG paint, so the chart follows a
  // theme switch without re-rendering; the fallback covers SSR markup and
  // token-less consumers.
  return `var(${name}, ${fallback})`;
}

function StackedTooltip({ active, payload, label }: StackedTooltipProps) {
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
 * Stacked bar chart built on Recharts with design-system tokens.
 * Supports multiple series stacked on top of each other.
 */
export const StackedBarChart = ({
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
}: StackedBarChartProps) => {
  const baseClass = 'ds-chart';
  const classes = [baseClass, bare ? `${baseClass}--bare` : '', className]
    .filter(Boolean)
    .join(' ');

  const textSecondary = getCSSVar('--color-text-secondary', '#303030');
  const gridColor = getCSSVar('--color-divider', 'rgba(214, 214, 214, 0.8)');
  const cursorColor = getCSSVar('--color-bg-container-secondary', '#F1F1F1');
  const defaultColors = getChartSeriesColors();

  const renderTooltip = useCallback(
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    (props: any) => <StackedTooltip {...props} />,
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
          <RechartsBarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -12 }}>
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
              tickFormatter={yAxisFormatter}
            />
            <Tooltip
              content={renderTooltip}
              cursor={{ fill: cursorColor, opacity: 0.4 }}
            />
            {series.map((s, i) => (
              <Bar
                key={s.dataKey}
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
};
