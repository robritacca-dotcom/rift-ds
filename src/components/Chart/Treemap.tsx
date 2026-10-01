'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
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

// ── Readable labels ─────────────────────────────────────────────────────────
// A cell's fill is any colour — a series token, or whatever a consumer
// passes — so no single text token reads on all of them. The label picks,
// per cell, whichever of the two opposite-polarity text tokens contrasts
// more with the colour the cell actually paints (text-primary and
// text-on-inverse are dark/light in one theme and light/dark in the other).
// The measurement is client-side; the server markup carries text-primary.

type LabelTone = 'primary' | 'on-inverse';
type Rgb = [number, number, number];

let colorProbe: CanvasRenderingContext2D | null | undefined;

/** Any CSS colour string to sRGB channels, via the canvas normaliser. */
function toRgb(value: string): Rgb | null {
  const input = value.trim();
  if (!input || input === 'none') return null;
  if (colorProbe === undefined) {
    colorProbe = document.createElement('canvas').getContext('2d');
  }
  if (!colorProbe) return null;
  colorProbe.fillStyle = '#000000';
  colorProbe.fillStyle = input;
  const out = String(colorProbe.fillStyle);
  if (out.startsWith('#')) {
    return [1, 3, 5].map((i) => parseInt(out.slice(i, i + 2), 16)) as Rgb;
  }
  const m = out.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const [r, g, b] = m[1].split(/[\s,/]+/).map(Number);
  return [r, g, b];
}

const luminance = ([r, g, b]: Rgb) => {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};

const contrast = (a: Rgb, b: Rgb) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (hi + 0.05) / (lo + 0.05);
};

/** WCAG AA for the labels' size (12px semibold is not "large" text). */
const AA_TEXT = 4.5;

interface LabelStyle {
  tone: LabelTone;
  /**
   * A mid-tone fill can sit below AA with both tokens — near-black and
   * near-white both land around 4.3:1 on a fill near 22% luminance. Then
   * the label wears a halo in the opposite token, so the text reads
   * against its halo rather than the fill.
   */
  halo: boolean;
}

function pickLabelStyle(rect: SVGRectElement): LabelStyle {
  const style = getComputedStyle(rect);
  const fill = toRgb(style.fill);
  const primary = toRgb(style.getPropertyValue('--color-text-primary'));
  const onInverse = toRgb(style.getPropertyValue('--color-text-on-inverse'));
  if (!fill || !primary || !onInverse) return { tone: 'primary', halo: false };
  const primaryRatio = contrast(primary, fill);
  const onInverseRatio = contrast(onInverse, fill);
  const tone = primaryRatio >= onInverseRatio ? 'primary' : 'on-inverse';
  return { tone, halo: Math.max(primaryRatio, onInverseRatio) < AA_TEXT };
}

/**
 * Bumps whenever the root element's theme could have changed — a
 * `data-theme` flip, a `data-brand` preset, or overrides written to its
 * inline style — so every cell re-measures its fill.
 */
function useThemeVersion(): number {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const observer = new MutationObserver(() => setVersion((v) => v + 1));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'data-brand', 'style', 'class'],
    });
    return () => observer.disconnect();
  }, []);
  return version;
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
function TreemapContent(props: any) {
  const { x, y, width, height, name, index, color, themeVersion } = props;
  const rectRef = useRef<SVGRectElement>(null);
  const [label, setLabel] = useState<LabelStyle>({ tone: 'primary', halo: false });

  const seriesColors = getChartSeriesColors();
  const fill = color || seriesColors[index % seriesColors.length];
  const visible = width >= 4 && height >= 4;
  const showLabel = width > 50 && height > 28;

  useEffect(() => {
    if (!showLabel || !rectRef.current) return;
    setLabel(pickLabelStyle(rectRef.current));
  }, [fill, showLabel, themeVersion]);

  if (!visible) return null;

  const primaryText = getCSSVar('--color-text-primary', '#050505');
  const onInverseText = getCSSVar('--color-text-on-inverse', '#F1F1F1');
  const textColor = label.tone === 'primary' ? primaryText : onInverseText;
  const haloColor = label.tone === 'primary' ? onInverseText : primaryText;

  return (
    <g>
      <rect
        ref={rectRef}
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
          style={{
            fill: textColor,
            fontSize: 12,
            fontWeight: 600,
            ...(label.halo && {
              stroke: haloColor,
              strokeWidth: 3,
              strokeLinejoin: 'round' as const,
              paintOrder: 'stroke',
            }),
          }}
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
  const titleId = useId();
  const subtitleId = useId();
  const themeVersion = useThemeVersion();
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
    <div
      className={classes}
      role="figure"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={subtitle ? subtitleId : undefined}
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
          <RechartsTreemap
            data={data}
            dataKey={dataKey}
            aspectRatio={4 / 3}
            content={<TreemapContent themeVersion={themeVersion} />}
          >
            <Tooltip content={renderTooltip} />
          </RechartsTreemap>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
