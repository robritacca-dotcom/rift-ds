import { useCallback } from 'react';
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
import { getChartSeriesColors } from './palette';
import './Chart.css';

interface ScatterTooltipPayloadEntry {
  value?: number;
  name?: string;
  dataKey?: string;
  payload?: Record<string, unknown>;
  [key: string]: unknown;
}

interface ScatterTooltipProps {
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

export interface ScatterChartProps {
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

function ScatterTooltip({ active, payload, xLabel, yLabel }: ScatterTooltipProps) {
  if (!active || !payload?.length) return null;

  const xEntry = payload.find((p) => p.dataKey === payload[0]?.dataKey);
  const yEntry = payload.find((p) => p.name === yLabel) || payload[1];

  return (
    <div className="ds-chart__tooltip">
      <div className="ds-chart__tooltip-row">
        <span className="ds-chart__tooltip-name">{xLabel}</span>
        <span className="ds-chart__tooltip-value">
          {xEntry?.value?.toLocaleString()}
        </span>
      </div>
      {yEntry && (
        <div className="ds-chart__tooltip-row">
          <span className="ds-chart__tooltip-name">{yLabel}</span>
          <span className="ds-chart__tooltip-value">
            {yEntry.value?.toLocaleString()}
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
export const ScatterChart = ({
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
}: ScatterChartProps) => {
  const baseClass = 'ds-chart';
  const classes = [baseClass, bare ? `${baseClass}--bare` : '', className]
    .filter(Boolean)
    .join(' ');

  const seriesColors = getChartSeriesColors();
  const textSecondary = getCSSVar('--color-text-secondary', '#303030');
  const gridColor = getCSSVar('--color-divider', 'rgba(214, 214, 214, 0.8)');

  const renderTooltip = useCallback(
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    (props: any) => <ScatterTooltip {...props} xLabel={xLabel} yLabel={yLabel} />,
    [xLabel, yLabel],
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
          <RechartsScatterChart margin={{ top: 8, right: 4, bottom: 0, left: -12 }}>
            <CartesianGrid stroke={gridColor} />
            <XAxis
              type="number"
              dataKey={xKey}
              name={xLabel}
              tick={{ fill: textSecondary, fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: gridColor }}
            />
            <YAxis
              type="number"
              dataKey={yKey}
              name={yLabel}
              tick={{ fill: textSecondary, fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <ZAxis range={[48, 48]} />
            <Tooltip content={renderTooltip} />
            {datasets.map((ds, i) => (
              <Scatter
                key={ds.name}
                name={ds.name}
                data={ds.data}
                fill={ds.color || seriesColors[i % seriesColors.length]}
              />
            ))}
            {datasets.length > 1 && (
              <Legend wrapperStyle={{ color: textSecondary, fontSize: 12 }} />
            )}
          </RechartsScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
