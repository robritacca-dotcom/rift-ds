import { useCallback } from 'react';
import {
  Treemap as RechartsTreemap,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ChartSummaryItem } from './BarChart';
import { getChartSeriesColors } from './palette';
import './Chart.css';

interface TreemapTooltipPayloadEntry {
  value?: number;
  name?: string;
  payload?: Record<string, unknown>;
  [key: string]: unknown;
}

interface TreemapTooltipProps {
  active?: boolean;
  payload?: TreemapTooltipPayloadEntry[];
}

export interface TreemapDataItem {
  /** Display name for the node */
  name: string;
  /** Numeric size — determines rectangle area */
  size: number;
  /** Optional fill colour */
  color?: string;
  /** Nested children for hierarchical data */
  children?: TreemapDataItem[];
  [key: string]: unknown;
}

export interface TreemapProps {
  /** Hierarchical data — each item needs `name` and `size` (or `children`) */
  data: TreemapDataItem[];
  /** Key used for sizing rectangles */
  dataKey?: string;
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

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
function TreemapContent(props: any) {
  const { x, y, width, height, name, index, color } = props;
  if (width < 4 || height < 4) return null;

  const seriesColors = getChartSeriesColors();
  const fill = color || seriesColors[index % seriesColors.length];
  const textColor = getCSSVar('--color-text-primary', '#050505');
  const showLabel = width > 50 && height > 28;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={4}
        ry={4}
        style={{ fill, stroke: getCSSVar('--color-bg-container-primary', '#FFFFFF'), strokeWidth: 2 }}
      />
      {showLabel && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fill: textColor, fontSize: 12, fontWeight: 600 }}
        >
          {name}
        </text>
      )}
    </g>
  );
}

function TreemapTooltip({ active, payload }: TreemapTooltipProps) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];

  return (
    <div className="ds-chart__tooltip">
      <div className="ds-chart__tooltip-label">{entry.name}</div>
      <div className="ds-chart__tooltip-row">
        <span className="ds-chart__tooltip-name">Size</span>
        <span className="ds-chart__tooltip-value">
          {entry.value?.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

/**
 * Treemap chart built on Recharts with design-system tokens.
 * Displays hierarchical data as nested coloured rectangles sized by value.
 */
export const Treemap = ({
  data,
  dataKey = 'size',
  title,
  subtitle,
  summaryItems,
  height = 350,
  bare = false,
  className = '',
}: TreemapProps) => {
  const baseClass = 'ds-chart';
  const classes = [baseClass, bare ? `${baseClass}--bare` : '', className]
    .filter(Boolean)
    .join(' ');

  const renderTooltip = useCallback(
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    (props: any) => <TreemapTooltip {...props} />,
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
          <RechartsTreemap
            data={data}
            dataKey={dataKey}
            aspectRatio={4 / 3}
            content={<TreemapContent />}
          >
            <Tooltip content={renderTooltip} />
          </RechartsTreemap>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
