import React from 'react';
import './ColourSwatch.css';

export interface ColourSwatchValues {
  /** The primitive token name this colour maps to (e.g. "--teal--07--") — omit to hide the row */
  primitive?: string;
  /** The hex value (e.g. "#118AB2") or rgba string */
  hex: string;
  /** The RGB breakdown (e.g. "17 / 138 / 178") */
  rgb: string;
}

export interface ColourSwatchProps {
  /** Display label for the swatch (e.g. "Primary", "Red") */
  label: string;
  /** CSS custom property used as background (e.g. "--color-core-ui-primary") */
  cssVar: string;
  /** Values to display for dark theme */
  dark: ColourSwatchValues;
  /** Values to display for light theme — defaults to dark values if omitted */
  light?: ColourSwatchValues;
  /** Which theme is currently active — controls which values are shown */
  theme?: 'dark' | 'light';
  /** Render as a status swatch with left border accent */
  status?: boolean;
  /** CSS custom property for the status left border colour */
  borderVar?: string;
  /** The label of the row that prints the token's name, the value of `cssVar`, as text */
  tokenLabel?: string;
  /**
   * The card's size. `default` is the tall card, its values on panels over
   * the colour. `compact` is a short chip of the colour, a primitive ramp
   * cell tall, with the label and hex under it, for a page that shows many
   * colours at a glance; the token name rides the chip's tooltip.
   * @default 'default'
   */
  size?: 'default' | 'compact';
  /** Additional CSS classes */
  className?: string;
}

/**
 * ColourSwatch component from Figma design system
 * Displays a colour swatch card with a values box showing the
 * token's name, then Primitive, Hex, and RGB. Values switch when theme changes.
 * Used on Semantic colours and Primitive colours pages.
 */
export const ColourSwatch = ({
  label,
  cssVar,
  dark,
  light,
  theme = 'dark',
  status = false,
  borderVar,
  tokenLabel = 'Token',
  size = 'default',
  className = '',
}: ColourSwatchProps) => {
  const baseClass = 'ds-colour-swatch';
  const statusClass = status ? `${baseClass}--status` : '';
  const sizeClass = size === 'compact' ? `${baseClass}--compact` : '';
  const classes = [baseClass, statusClass, sizeClass, className].filter(Boolean).join(' ');

  const values = theme === 'light' && light ? light : dark;

  const style: React.CSSProperties = {
    backgroundColor: `var(${cssVar})`,
    ...(status && borderVar ? { borderColor: `var(${borderVar})` } : {}),
  };

  if (size === 'compact') {
    /* The colour is the chip alone, so the words sit on the page and read
       in every colour; the chip's hairline holds a colour that matches the
       page. */
    return (
      <div className={classes}>
        <div className={`${baseClass}__chip`} style={style} title={cssVar} />
        <div className={`${baseClass}__caption`}>
          <h3 className={`${baseClass}__title`}>{label}</h3>
          <span className={`${baseClass}__hex`}>{values.hex}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={classes} style={style}>
      <div className={`${baseClass}__title-box`}>
        <h3 className={`${baseClass}__title`}>{label}</h3>
      </div>
      <div className={`${baseClass}__values`}>
        <div className={`${baseClass}__row`}>
          <span className={`${baseClass}__label`}>{tokenLabel}</span>
          <span className={`${baseClass}__data`}>{cssVar}</span>
        </div>
        {values.primitive && (
          <div className={`${baseClass}__row`}>
            <span className={`${baseClass}__label`}>Primitive</span>
            <span className={`${baseClass}__data`}>{values.primitive}</span>
          </div>
        )}
        <div className={`${baseClass}__row`}>
          <span className={`${baseClass}__label`}>Hex</span>
          <span className={`${baseClass}__data`}>{values.hex}</span>
        </div>
        <div className={`${baseClass}__row`}>
          <span className={`${baseClass}__label`}>RGB</span>
          <span className={`${baseClass}__data`}>{values.rgb}</span>
        </div>
      </div>
    </div>
  );
};
