import React from 'react';
import { mirrorClass } from '../../behaviors/direction';
import '../../fonts/material-symbols.css';
import './Icon.css';

/** Props owned by Icon itself; everything else falls through to the root span. */
type IconOwnProps = {
  /** The Material Symbol's name (`settings`, `arrow_forward`). A glyph that points along the reading direction mirrors in a right-to-left context. */
  name: string;
  /** The size, as a step on the icon scale (`--icon-size-600`, the size beside body text, by default). */
  size?: '500' | '600' | '800' | '1200';
  /** The glyph's colour role. `inherit` takes the colour of the text around it. */
  tone?: 'default' | 'neutral' | 'inherit';
  /** Draws the filled form of the glyph, as a selected nav item does. */
  filled?: boolean;
  /** What the icon means, when it carries meaning no text beside it says. With a label the icon is an image with that name; without one it is decorative and hidden from assistive tech. */
  label?: string;
  /** Sets the glyph on a round tile of the icon fill, the mark at the head of a stat card or a list row. */
  tile?: boolean;
  /** Additional CSS classes */
  className?: string;
};

export interface IconProps extends IconOwnProps, Omit<React.ComponentPropsWithRef<'span'>, keyof IconOwnProps | 'children'> {}

/**
 * One Material Symbol on the icon scale, for the places no other component
 * draws one: beside a heading, at the head of a stat card, in a row of text.
 * Decorative unless it has a `label`. Presentational and server-renderable.
 */
export function Icon({
  name,
  size = '600',
  tone = 'default',
  filled = false,
  label,
  tile = false,
  className = '',
  style,
  ref,
  ...rest
}: IconProps) {
  const named = Boolean(label);
  const classes = [
    'ds-icon',
    `ds-icon--${tone}`,
    filled ? 'ds-icon--filled' : '',
    tile ? 'ds-icon--tile' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <span
      role={named ? 'img' : undefined}
      aria-label={named ? label : undefined}
      aria-hidden={named ? undefined : true}
      {...rest}
      ref={ref}
      className={classes}
      style={{ ...style, '--ds-icon-size': `var(--icon-size-${size})` } as React.CSSProperties}
    >
      <span className={`ds-icon__glyph material-symbols-rounded ${mirrorClass(name)}`} aria-hidden="true">
        {name}
      </span>
    </span>
  );
}
