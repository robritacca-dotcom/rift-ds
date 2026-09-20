import React from 'react';
import './TypographySwatch.css';

export interface TypographySwatchProps {
  /** Display name rendered as the preview text (e.g. "Mega 1") */
  name: string;
  /** Font weight label (e.g. "Light", "SemiBold", "Regular") */
  weight: string;
  /** Font size value (e.g. "132", "16") */
  size: string;
  /** Line height value (e.g. "85%", "44px") */
  lineHeight: string;
  /** Letter spacing value (e.g. "2%", "-1%", "0") */
  letterSpacing: string;
  /** Inline style object applied to the preview text for live rendering */
  previewStyle?: React.CSSProperties;
  /** Additional CSS classes */
  className?: string;
}

/**
 * TypographySwatch component from Figma design system.
 * Displays a typography style in a card with a live preview
 * of the text and four value columns showing font weight,
 * size, line height, and letter spacing.
 */
export const TypographySwatch = ({
  name,
  weight,
  size,
  lineHeight,
  letterSpacing,
  previewStyle,
  className = '',
}: TypographySwatchProps) => {
  const baseClass = 'ds-typography-swatch';
  const classes = [baseClass, className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <span className={`${baseClass}__preview`} style={previewStyle}>
        {name}
      </span>
      <hr className={`${baseClass}__divider`} />
      <div className={`${baseClass}__values`}>
        <div className={`${baseClass}__value-item`}>
          <span className={`${baseClass}__value-number`}>{weight}</span>
          <span className={`${baseClass}__value-label`}>Font weight</span>
        </div>
        <div className={`${baseClass}__value-item`}>
          <span className={`${baseClass}__value-number`}>{size}</span>
          <span className={`${baseClass}__value-label`}>Font size</span>
        </div>
        <div className={`${baseClass}__value-item`}>
          <span className={`${baseClass}__value-number`}>{lineHeight}</span>
          <span className={`${baseClass}__value-label`}>Line height</span>
        </div>
        <div className={`${baseClass}__value-item`}>
          <span className={`${baseClass}__value-number`}>{letterSpacing}</span>
          <span className={`${baseClass}__value-label`}>Letter spacing</span>
        </div>
      </div>
    </div>
  );
};
