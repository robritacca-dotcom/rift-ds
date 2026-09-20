import './Badge.css';

export interface BadgeProps {
  /** Badge label text */
  label: string;
  /** Badge variant determines colour */
  variant?: 'info' | 'positive' | 'warning' | 'error' | 'neutral';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Badge component for small inline status labels.
 * Supports info, positive, warning, error, and neutral variants.
 */
export const Badge = ({
  label,
  variant = 'neutral',
  className = '',
}: BadgeProps) => {
  const baseClass = 'ds-badge';
  const variantClass = `${baseClass}--${variant}`;

  const classes = [baseClass, variantClass, className]
    .filter(Boolean)
    .join(' ');

  return <span className={classes} role="status">{label}</span>;
};
