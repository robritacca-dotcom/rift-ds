import React from 'react';
import './StatusDot.css';

/** Props owned by StatusDot itself — everything else falls through to the root span. */
type StatusDotOwnProps = {
  /** Status role the dot carries — coloured through the plain-surface `--color-status-*-icon` steps. */
  variant?: 'info' | 'positive' | 'warning' | 'error' | 'neutral';
  /** Dot diameter, derived from the icon scale (half of `--icon-size-sm/md/lg`). */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Radiates a repeating ring from the dot for a live state — recording,
   * online now, deploy in flight. The ring stills under reduced motion.
   */
  pulse?: boolean;
  /**
   * Visible text beside the dot. Omit it for a bare dot only when the meaning
   * has another home — a row label, or an `aria-label` passed through — since
   * a colour alone announces nothing.
   */
  label?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface StatusDotProps
  extends StatusDotOwnProps,
    Omit<React.ComponentPropsWithoutRef<'span'>, keyof StatusDotOwnProps> {}

/**
 * StatusDot — the bare presence/status indicator: a small dot in one of the
 * five status roles, with an optional visible label and an optional live
 * pulse. Where Badge carries a text label on a tinted fill, StatusDot is the
 * mark alone — for table rows, avatars, nav items, and anywhere a full badge
 * is too loud.
 *
 * Purely presentational: safe to render from a Server Component.
 */
export const StatusDot = React.forwardRef<HTMLSpanElement, StatusDotProps>(
  ({ variant = 'neutral', size = 'md', pulse = false, label, className = '', ...rest }, ref) => {
    const baseClass = 'ds-status-dot';

    const classes = [
      baseClass,
      `${baseClass}--${variant}`,
      `${baseClass}--${size}`,
      pulse && `${baseClass}--pulse`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <span {...rest} ref={ref} className={classes} role="status">
        <span className={`${baseClass}__indicator`} aria-hidden="true" />
        {label && <span className={`${baseClass}__label`}>{label}</span>}
      </span>
    );
  },
);

StatusDot.displayName = 'StatusDot';
