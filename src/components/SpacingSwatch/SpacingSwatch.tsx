import './SpacingSwatch.css';

export type SpacingSwatchVariant = 'border' | 'radius' | 'gap' | 'padding';

export interface SpacingSwatchProps {
  /** Size label (e.g. "XS", "MD", "Full") */
  label: string;
  /** Pixel value to display (e.g. "1px", "24px", "999px") */
  value: string;
  /** Numeric pixel amount used to size the preview element */
  px: number;
  /** Which type of spatial preview to render */
  variant: SpacingSwatchVariant;
  /** Additional CSS classes */
  className?: string;
}

/**
 * SpacingSwatch component from Figma design system.
 * Displays a spatial token card with a visual preview,
 * size label, and pixel value. Four variants cover
 * border width, radius, gap, and padding tokens.
 */
export const SpacingSwatch = ({
  label,
  value,
  px,
  variant,
  className = '',
}: SpacingSwatchProps) => {
  const baseClass = 'ds-spacing-swatch';
  const classes = [baseClass, className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <div className={`${baseClass}__preview`}>
        {variant === 'border' && (
          <div
            className={`${baseClass}__border-bar`}
            style={{ width: `${px}px` }}
          />
        )}
        {variant === 'radius' && (
          <div
            className={`${baseClass}__radius-box`}
            style={{ borderRadius: px >= 999 ? '50%' : `${px}px` }}
          />
        )}
        {variant === 'gap' && (
          <div
            className={`${baseClass}__gap-bar`}
            style={{ width: `${px}px` }}
          />
        )}
        {variant === 'padding' && (
          <div
            className={`${baseClass}__padding-outer`}
            style={{ padding: `${px}px` }}
          >
            <div className={`${baseClass}__padding-inner`} />
          </div>
        )}
      </div>
      <span className={`${baseClass}__label`}>{label}</span>
      <span className={`${baseClass}__value`}>{value}</span>
    </div>
  );
};
