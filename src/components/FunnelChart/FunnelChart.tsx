'use client';

import React, { useCallback } from 'react';
import {
  FunnelChart as RechartsFunnelChart,
  Funnel,
  LabelList,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getChartSeriesColors } from '../Chart/palette';
import { useChartAnimation } from '../Chart/useChartAnimation';
import '../Chart/Chart.css';
import './FunnelChart.css';

/** One stage of the funnel, ordered widest first. */
export interface FunnelStage {
  /** Stage name, shown beside the stage and read into the chart's accessible label. */
  label: string;
  /** Raw count for the stage — drives the stage's width as a share of the first stage. */
  value: number;
  /**
   * Preformatted value ("96.4K") for the tooltip and the accessible label.
   * Falls back to the raw `value`, locale-formatted.
   */
  displayValue?: string;
}

/** Props owned by FunnelChart itself — everything else falls through to the root div. */
type FunnelChartOwnProps = {
  /** Ordered stages, first stage widest. Each later stage's width is its share of the first. */
  data: FunnelStage[];
  /**
   * Chart title, in the shared chart header.
   * Note: this shadows the native `title` tooltip attribute, which FunnelChart does not expose.
   */
  title?: string;
  /** Description text below the title. */
  subtitle?: string;
  /** Strip the card chrome (border, padding, fill) when the chart sits inside another panel that supplies the surface */
  bare?: boolean;
  /** Chart area height in pixels. */
  height?: number;
  /** Shows each stage's name beside its band. Turn off when a legend under the chart already carries the names. */
  showLabels?: boolean;
  /**
   * The chart's accessible name, summarising every stage, given `data` when it
   * holds at least one stage. Defaults to "Funnel: " then each stage's label and
   * reading (its `displayValue`, else the value in the reader's locale),
   * comma-separated, e.g. "Funnel: Visits 12,400, Sign-ups 3,100".
   */
  summaryLabel?: (data: FunnelStage[]) => string;
  /** The chart's accessible name when `data` is empty. Defaults to "Funnel, no data". */
  emptyLabel?: string;
  /**
   * Floor percentage from the stepped-bar rendering this chart used to have.
   * @deprecated The funnel now draws true trapezoids sized by value, so a
   * height floor no longer applies; the prop is ignored.
   */
  minStageShare?: number;
  /** Additional CSS classes */
  className?: string;
};

export interface FunnelChartProps
  extends FunnelChartOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof FunnelChartOwnProps | 'children'> {}

const defaultSummaryLabel = (data: FunnelStage[]) =>
  `Funnel: ${data
    .map((stage) => `${stage.label} ${stage.displayValue ?? stage.value.toLocaleString()}`)
    .join(', ')}`;

interface FunnelTooltipPayloadEntry {
  value?: number;
  payload?: { name?: string; fill?: string; displayValue?: string; share?: number };
  [key: string]: unknown;
}

interface FunnelTooltipProps {
  active?: boolean;
  payload?: FunnelTooltipPayloadEntry[];
}

function getCSSVar(name: string, fallback: string): string {
  // A var() reference resolves live in SVG paint, so the chart follows a
  // theme switch without re-rendering; the fallback covers SSR markup and
  // token-less consumers.
  return `var(${name}, ${fallback})`;
}

function FunnelTooltip({ active, payload }: FunnelTooltipProps) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const stage = entry.payload;

  return (
    <div className="ds-chart__tooltip">
      <div className="ds-chart__tooltip-label">{stage?.name}</div>
      <div className="ds-chart__tooltip-row">
        <span
          className="ds-chart__tooltip-dot"
          style={{ backgroundColor: stage?.fill }}
        />
        <span className="ds-chart__tooltip-name">
          {stage?.share !== undefined ? `${stage.share}%` : ''}
        </span>
        <span className="ds-chart__tooltip-value">
          {stage?.displayValue ?? entry.value?.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

/**
 * FunnelChart — ordered stages as a centred funnel of trapezoid bands, built
 * on Recharts' native Funnel so the stages sweep in on load and share the
 * family's tooltip and palette. Each band's width is its stage's share of the
 * first, the honest recharts geometry: the taper itself is the conversion
 * story, and the glass tooltip carries each stage's reading and percentage.
 * It wears the chart family's card chrome (title, subtitle, padding) and
 * takes `bare` to drop it inside a Panel, like every other chart. The whole
 * funnel is summarised in one accessible label, stage by stage. Degenerate
 * data stays safe: an empty array renders an empty chart area.
 */
export const FunnelChart = React.forwardRef<HTMLDivElement, FunnelChartProps>(
  (
    {
      data,
      title,
      subtitle,
      bare = false,
      height = 190,
      showLabels = true,
      summaryLabel = defaultSummaryLabel,
      emptyLabel = 'Funnel, no data',
      minStageShare,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-funnel-chart';
    const animation = useChartAnimation(data);
    const chartClass = 'ds-chart';
    const classes = [chartClass, bare && `${chartClass}--bare`, baseClass, className]
      .filter(Boolean)
      .join(' ');

    const seriesColors = getChartSeriesColors();
    const textSecondary = getCSSVar('--color-text-secondary', '#303030');
    const surfaceColor = getCSSVar('--color-bg-container-primary', '#FFFFFF');

    const firstValue = data.length > 0 ? data[0].value : 0;
    const stages = data.map((stage, i) => ({
      name: stage.label,
      value: stage.value,
      displayValue: stage.displayValue,
      share: firstValue > 0 ? Math.round((stage.value / firstValue) * 100) : 0,
      fill: seriesColors[i % seriesColors.length],
    }));

    const ariaLabel = data.length > 0 ? summaryLabel(data) : emptyLabel;

    const renderTooltip = useCallback(
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      (props: any) => <FunnelTooltip {...props} />,
      [],
    );

    return (
      <div {...rest} ref={ref} className={classes}>
        {(title || subtitle) && (
          <div className={`${chartClass}__header`}>
            <div className={`${chartClass}__header-text`}>
              {title && <h3 className={`${chartClass}__title`}>{title}</h3>}
              {subtitle && <p className={`${chartClass}__subtitle`}>{subtitle}</p>}
            </div>
          </div>
        )}
        <div className={`${chartClass}__body`} role="img" aria-label={ariaLabel}>
          <ResponsiveContainer width="100%" height={height}>
            <RechartsFunnelChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <Tooltip content={renderTooltip} />
              {/* The shared hook keeps the sweep-in to mount and new data, on
                  recharts' 'auto' guard, which already turns itself off under
                  prefers-reduced-motion and in SSR. The surface-coloured stroke
                  separates the bands in either theme. */}
              <Funnel
                {...animation}
                dataKey="value"
                nameKey="name"
                data={stages}
                lastShapeType="rectangle"
                stroke={surfaceColor}
                strokeWidth={2}
              >
                {showLabels && (
                  <LabelList
                    position="right"
                    dataKey="name"
                    fill={textSecondary}
                    stroke="none"
                    fontSize={12}
                  />
                )}
              </Funnel>
            </RechartsFunnelChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  },
);

FunnelChart.displayName = 'FunnelChart';
