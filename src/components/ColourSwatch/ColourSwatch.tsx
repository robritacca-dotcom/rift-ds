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
  /** Additional CSS classes */
  className?: string;
}

/**
 * ColourSwatch component from Figma design system
 * Displays a colour swatch card with a values box showing
 * Primitive, Hex, and RGB. Values switch when theme changes.
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
  className = '',
}: ColourSwatchProps) => {
  const baseClass = 'ds-colour-swatch';
  const statusClass = status ? `${baseClass}--status` : '';
  const classes = [baseClass, statusClass, className].filter(Boolean).join(' ');

  const values = theme === 'light' && light ? light : dark;

  const style: React.CSSProperties = {
    backgroundColor: `var(${cssVar})`,
    ...(status && borderVar ? { borderColor: `var(${borderVar})` } : {}),
  };

  return (
    <div className={classes} style={style}>
      <div className={`${baseClass}__title-box`}>
        <h3 className={`${baseClass}__title`}>{label}</h3>
      </div>
      <div className={`${baseClass}__values`}>
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
