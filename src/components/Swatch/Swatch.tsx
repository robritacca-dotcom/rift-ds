import React from 'react';
import './Swatch.css';

/** Props owned by Swatch itself — everything else falls through to the <button>. */
type SwatchOwnProps = {
  /** The colour this swatch shows — any valid CSS colour, typically a hex value */
  value: string;
  /**
   * Accessible name for the swatch. Defaults to the colour value, which is
   * meaningful but terse — prefer a human name ("Teal 07") when you have one.
   */
  label?: string;
  /** Selected state — renders the selection ring and sets aria-pressed */
  selected?: boolean;
  /** Swatch size */
  size?: 'default' | 'compact';
  /** Corner treatment — circle matches the site's preset grids; square suits picker triggers */
  shape?: 'circle' | 'square';
  /** Whether the swatch is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
};

export interface SwatchProps
  extends SwatchOwnProps,
    Omit<React.ComponentPropsWithoutRef<'button'>, keyof SwatchOwnProps | 'type'> {}

/**
 * A clickable colour tile — the building block for preset palettes and
 * picker triggers. Renders a `<button>` whose background is the `value`
 * colour; `selected` draws the theme-aware selection ring.
 *
 * Purely presentational (no hooks), so it can be rendered from a Server
 * Component; interactivity arrives through the native `onClick` you pass.
 * Forwards a ref to the `<button>` and spreads unrecognised props onto it.
 */
export const Swatch = React.forwardRef<HTMLButtonElement, SwatchProps>(
  (
    {
      value,
      label,
      selected = false,
      size = 'default',
      shape = 'circle',
      disabled = false,
      className = '',
      style,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-swatch';

    const classes = [
      baseClass,
      size === 'compact' ? `${baseClass}--compact` : '',
      shape === 'square' ? `${baseClass}--square` : '',
      selected ? `${baseClass}--selected` : '',
      disabled ? `${baseClass}--disabled` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // The colour is runtime data, not theme — it reaches CSS through a
    // custom property so the stylesheet stays free of inline backgrounds.
    const swatchStyle = { ...style, '--ds-swatch-color': value } as React.CSSProperties;

    return (
      <button
        {...rest}
        ref={ref}
        type="button"
        className={classes}
        style={swatchStyle}
        disabled={disabled}
        aria-pressed={selected}
        aria-label={rest['aria-label'] ?? label ?? value}
      />
    );
  },
);

Swatch.displayName = 'Swatch';
