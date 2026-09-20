import { useCallback } from 'react';
import {
  RadialBarChart as RechartsRadialBarChart,
  RadialBar,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PolarAngleAxis,
} from 'recharts';
import type { ChartSummaryItem } from './BarChart';
import { getChartSeriesColors } from './palette';
import './Chart.css';

interface RadialTooltipPayloadEntry {
  value?: number;
  payload?: { name?: string; fill?: string; [key: string]: unknown };
  [key: string]: unknown;
}

interface RadialTooltipProps {
  active?: boolean;
  payload?: RadialTooltipPayloadEntry[];
}

export interface RadialDataItem {
  /** Display name */
  name: string;
  /** Numeric value */
  value: number;
  /** Ring fill colour */
  color?: string;
}

export interface RadialChartProps {
  /** Array of data items — each renders as a concentric ring */
  data: RadialDataItem[];
  /** Maximum value for the radial scale (100 = percentage) */
  maxValue?: number;
  /** Chart title */
  title?: string;
  /** Description text below the title */
  subtitle?: string;
  /** Summary stats displayed in the header */
  summaryItems?: ChartSummaryItem[];
  /** Chart area height in pixels */
  height?: number;
  /** Inner radius of the innermost ring */
  innerRadius?: number;
  /** Outer radius of the outermost ring */
  outerRadius?: number;
  /** Show legend */
  showLegend?: boolean;
  /** Headline printed in the donut hole, e.g. "46%"; pairs best with showLegend false, since the legend shifts the rings above centre */
  centerLabel?: string;
  /** Small caption under the centre headline */
  centerSublabel?: string;
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

function RadialTooltip({ active, payload }: RadialTooltipProps) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];

  return (
    <div className="ds-chart__tooltip">
      <div className="ds-chart__tooltip-row">
        <span
          className="ds-chart__tooltip-dot"
          style={{ backgroundColor: entry.payload?.fill }}
        />
        <span className="ds-chart__tooltip-name">{entry.payload?.name}</span>
        <span className="ds-chart__tooltip-value">
          {entry.value?.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

/**
 * Radial bar chart built on Recharts with design-system tokens.
 * Each data item renders as a concentric ring — great for
 * progress indicators and comparative gauges.
 */
export const RadialChart = ({
  data,
  maxValue = 100,
  title,
  subtitle,
  summaryItems,
  height = 350,
  innerRadius = 40,
  outerRadius = 140,
  showLegend = true,
  centerLabel,
  centerSublabel,
  bare = false,
  className = '',
}: RadialChartProps) => {
  const baseClass = 'ds-chart';
  const classes = [baseClass, bare ? `${baseClass}--bare` : '', className]
    .filter(Boolean)
    .join(' ');
  const defaultColors = getChartSeriesColors();
  const textSecondary = getCSSVar('--color-text-secondary', '#303030');
  const bgColor = getCSSVar('--color-bg-container-primary', '#FFFFFF');

  /* Recharts RadialBarChart needs fill on each data item */
  const chartData = data.map((item, i) => ({
    ...item,
    fill: item.color || defaultColors[i % defaultColors.length],
  }));

  const renderTooltip = useCallback(
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    (props: any) => <RadialTooltip {...props} />,
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
          <RechartsRadialBarChart
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            data={chartData}
            startAngle={90}
            endAngle={-270}
            barSize={16}
          >
            <PolarAngleAxis type="number" domain={[0, maxValue]} tick={false} />
            <RadialBar
              background={{ fill: bgColor }}
              dataKey="value"
              cornerRadius={8}
            />
            <Tooltip content={renderTooltip} />
            {showLegend && (
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                {...({ payload: chartData.map((d) => ({
                  value: d.name,
                  type: 'circle' as const,
                  color: d.fill,
                  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                })) } as any)}
                formatter={(value: string) => (
                  <span style={{ color: textSecondary, fontSize: 12 }}>{value}</span>
                )}
              />
            )}
          </RechartsRadialBarChart>
        </ResponsiveContainer>
        {centerLabel && (
          <div className={`${baseClass}__radial-center`}>
            <span className={`${baseClass}__radial-center-value`}>{centerLabel}</span>
            {centerSublabel && (
              <span className={`${baseClass}__radial-center-sub`}>{centerSublabel}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
