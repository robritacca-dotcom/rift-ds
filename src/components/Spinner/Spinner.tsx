import './Spinner.css';

export interface SpinnerProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Visual variant — `inherit` draws the spinner in `currentColor`, for use inside coloured controls */
  variant?: 'primary' | 'neutral' | 'inherit';
  /** Accessible label */
  label?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Spinner indicates a loading state with an animated circular indicator.
 */
export const Spinner = ({
  size = 'md',
  variant = 'primary',
  label = 'Loading',
  className = '',
}: SpinnerProps) => {
  const baseClass = 'ds-spinner';
  const classes = [
    baseClass,
    `${baseClass}--${size}`,
    `${baseClass}--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} role="status" aria-label={label}>
      <svg className={`${baseClass}__circle`} viewBox="0 0 24 24" fill="none">
        <circle
          className={`${baseClass}__track`}
          cx="12"
          cy="12"
          r="10"
          strokeWidth="3"
        />
        <circle
          className={`${baseClass}__arc`}
          cx="12"
          cy="12"
          r="10"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
};
