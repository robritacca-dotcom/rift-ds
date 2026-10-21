import React from 'react';
import './Spinner.css';

/** Props owned by Spinner itself — everything else falls through to the root span. */
type SpinnerOwnProps = {
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
  /** Accessible label, announced as the spinner's name. A passed `aria-label` takes precedence. */
  label?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface SpinnerProps
  extends SpinnerOwnProps,
    Omit<React.ComponentPropsWithoutRef<'span'>, keyof SpinnerOwnProps | 'children'> {}

/**
 * Spinner indicates a loading state with an animated circular indicator.
 * Forwards a ref to the root span and spreads native attributes onto it.
 */
export const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
  ({ size = 'md', tone, variant, label = 'Loading', className = '', ...rest }, ref) => {
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
      <span role="status" aria-label={label} {...rest} ref={ref} className={classes}>
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
  },
);

Spinner.displayName = 'Spinner';
