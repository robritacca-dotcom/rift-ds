import React from 'react';
import './MapLegend.css';

/** One row of the key. */
export interface MapLegendItem {
  /**
   * The marker the row explains. `point` and `anchor` draw Globe's cross and
   * square; `arc` draws a short stroke of the arc gradient; a `line` is a flat
   * rule in `color`; any React node renders as given.
   */
  glyph: 'point' | 'anchor' | 'arc' | 'line' | React.ReactNode;
  /** What the marker means. */
  label: React.ReactNode;
  /** Colour for the `line` glyph (and the `arc` glyph, replacing its gradient). Any CSS colour. */
  color?: string;
}

/** Props owned by MapLegend itself — everything else falls through to the root `<div>`. */
type MapLegendOwnProps = {
  /**
   * The map's name, set above the key. Intentionally shadows the native
   * `title` tooltip attribute, which MapLegend does not expose.
   */
  title?: string;
  /** One or two lines saying what the map shows. */
  description?: React.ReactNode;
  /** The key itself: one row per marker kind. */
  items?: MapLegendItem[];
  /** Additional CSS classes */
  className?: string;
};

export interface MapLegendProps
  extends MapLegendOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof MapLegendOwnProps | 'children'> {}

const GLYPH_SIZE = 12;
const half = GLYPH_SIZE / 2;
const mark = 3.5;

/** The built-in glyphs, drawn on the same geometry Globe uses so the key matches the map. */
const builtInGlyph = (item: MapLegendItem, gradientId: string) => {
  switch (item.glyph) {
    case 'point':
      return <path d={`M${half - mark} ${half}H${half + mark}M${half} ${half - mark}V${half + mark}`} />;
    case 'anchor':
      return (
        <rect x={half - mark} y={half - mark} width={mark * 2} height={mark * 2} />
      );
    case 'arc':
      return (
        <path
          d={`M1 ${GLYPH_SIZE - 2}Q${half} -${half} ${GLYPH_SIZE - 1} ${GLYPH_SIZE - 2}`}
          style={{ stroke: item.color ?? `url(#${gradientId})` }}
        />
      );
    case 'line':
      return (
        <path
          d={`M1 ${half}H${GLYPH_SIZE - 1}`}
          style={item.color ? { stroke: item.color } : undefined}
        />
      );
    default:
      return null;
  }
};

const isBuiltIn = (glyph: MapLegendItem['glyph']) =>
  glyph === 'point' || glyph === 'anchor' || glyph === 'arc' || glyph === 'line';

/**
 * MapLegend — the block in the corner of a map: its name, a line on what it
 * shows, and the key to its markers. The built-in glyphs are drawn on the
 * same geometry Globe draws its markers with; WorldMap's dot and outlined
 * square are its own, so a flat-map key passes its glyphs as React nodes.
 * Pure markup, no hooks, so it renders from a Server Component; the key is
 * a `<dl>`, glyph as term and meaning as description.
 */
export const MapLegend = React.forwardRef<HTMLDivElement, MapLegendProps>(
  ({ title, description, items = [], className = '', ...rest }, ref) => {
    const baseClass = 'ds-map-legend';
    const gradientId = React.useId();
    const classes = [baseClass, className].filter(Boolean).join(' ');

    return (
      <div {...rest} ref={ref} className={classes}>
        {title && <span className={`${baseClass}__title`}>{title}</span>}
        {description && <p className={`${baseClass}__description`}>{description}</p>}
        {items.length > 0 && (
          <dl className={`${baseClass}__key`}>
            {items.map((item, i) => (
              <div key={i} className={`${baseClass}__row`}>
                <dt className={`${baseClass}__glyph`} aria-hidden="true">
                  {isBuiltIn(item.glyph) ? (
                    <svg
                      viewBox={`0 0 ${GLYPH_SIZE} ${GLYPH_SIZE}`}
                      width={GLYPH_SIZE}
                      height={GLYPH_SIZE}
                      xmlns="http://www.w3.org/2000/svg"
                      focusable="false"
                    >
                      {item.glyph === 'arc' && !item.color && (
                        <defs>
                          <linearGradient id={`${gradientId}-${i}`} x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0" className={`${baseClass}__arc-stop-start`} />
                            <stop offset="1" className={`${baseClass}__arc-stop-end`} />
                          </linearGradient>
                        </defs>
                      )}
                      {builtInGlyph(item, `${gradientId}-${i}`)}
                    </svg>
                  ) : (
                    item.glyph
                  )}
                </dt>
                <dd className={`${baseClass}__label`}>{item.label}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    );
  },
);

MapLegend.displayName = 'MapLegend';
