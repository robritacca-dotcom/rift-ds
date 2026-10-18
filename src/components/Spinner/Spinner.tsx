import './Spinner.css';

export interface SpinnerProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Colour of the arc: `default` in the primary text colour, `neutral` in
   * the secondary one, `inherit` in `currentColor`, for use inside coloured
   * controls.
   */
  tone?: 'default' | 'neutral' | 'inherit';
  /**
   * Legacy name for `tone`, from before colour moved onto its own prop:
   * `primary` is `tone="default"`.
   *
   * @deprecated Use `tone` instead.
   */
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
  tone,
  variant,
  label = 'Loading',
  className = '',
}: SpinnerProps) => {
  const baseClass = 'ds-spinner';
  // `variant` is the deprecated spelling of `tone`; the modifier class keeps
  // its original names so styles written against them still apply.
  const resolvedTone = tone ?? (variant === 'primary' ? 'default' : variant) ?? 'default';
  const toneClass = resolvedTone === 'default' ? 'primary' : resolvedTone;
  const classes = [
    baseClass,
    `${baseClass}--${size}`,
    `${baseClass}--${toneClass}`,
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
