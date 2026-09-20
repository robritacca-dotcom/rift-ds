import './Divider.css';

export interface DividerProps {
  /** Divider direction */
  orientation?: 'horizontal' | 'vertical';
  /** Optional label rendered inline in the line (horizontal only) */
  label?: string;
  /** Label placement along the line */
  labelPosition?: 'start' | 'center';
  /** Margin around the divider (block for horizontal, inline for vertical) */
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Divider component — a thin rule separating stacked content.
 * Plain horizontal by default; supports an inline text label
 * and a vertical orientation for use inside flex rows.
 */
export const Divider = ({
  orientation = 'horizontal',
  label,
  labelPosition = 'center',
  spacing = 'md',
  className = '',
}: DividerProps) => {
  const baseClass = 'ds-divider';
  const spacingClass = `${baseClass}--spacing-${spacing}`;

  if (orientation === 'vertical') {
    const classes = [baseClass, `${baseClass}--vertical`, spacingClass, className]
      .filter(Boolean)
      .join(' ');
    return <div className={classes} role="separator" aria-orientation="vertical" />;
  }

  if (label) {
    const classes = [
      baseClass,
      `${baseClass}--labeled`,
      `${baseClass}--label-${labelPosition}`,
      spacingClass,
      className,
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <div className={classes} role="separator" aria-orientation="horizontal">
        <span className={`${baseClass}__label`}>{label}</span>
      </div>
    );
  }

  const classes = [baseClass, spacingClass, className].filter(Boolean).join(' ');
  return <hr className={classes} />;
};
