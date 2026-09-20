import React from 'react';
import './MapCallout.css';

/** Props owned by MapCallout itself — everything else falls through to the root `<div>`. */
type MapCalloutOwnProps = {
  /**
   * The place's name, set in capitals: "Santiago, CL". Intentionally shadows
   * the native `title` tooltip attribute, which MapCallout does not expose.
   */
  title: string;
  /** Readout lines under the title, in order: a status, a reading, a route. */
  lines?: React.ReactNode[];
  /**
   * Which way the text ranges. A callout sitting left of its marker ranges
   * right so it hangs off the point; `start` is the ordinary reading order.
   */
  align?: 'start' | 'end';
  /** Additional CSS classes */
  className?: string;
};

export interface MapCalloutProps
  extends MapCalloutOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof MapCalloutOwnProps | 'children'> {}

/**
 * MapCallout — the annotation beside a point on a map or globe: the name in
 * capitals, then the readouts beneath it in the code face, so a coordinate
 * and a reading line up digit for digit. Pure markup, no hooks, so it
 * renders from a Server Component; Globe's `renderCallout` is its intended
 * home, where `align` follows the overlay's `data-side`.
 */
export const MapCallout = React.forwardRef<HTMLDivElement, MapCalloutProps>(
  ({ title, lines = [], align = 'start', className = '', ...rest }, ref) => {
    const baseClass = 'ds-map-callout';
    const classes = [baseClass, `${baseClass}--${align}`, className].filter(Boolean).join(' ');

    return (
      <div {...rest} ref={ref} className={classes}>
        <span className={`${baseClass}__title`}>{title}</span>
        {lines.map((line, i) => (
          <span key={i} className={`${baseClass}__line`}>
            {line}
          </span>
        ))}
      </div>
    );
  },
);

MapCallout.displayName = 'MapCallout';
