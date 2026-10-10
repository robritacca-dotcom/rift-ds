import React from 'react';
import './StatusDot.css';

/** Props owned by StatusDot itself — everything else falls through to the root span. */
type StatusDotOwnProps = {
  /** Status role the dot carries — coloured through the plain-surface `--color-status-*-icon` steps. */
  variant?: 'info' | 'positive' | 'warning' | 'error' | 'neutral';
  /** Dot diameter, derived from the icon scale (half of `--icon-size-500/600/800`); `xs` is the 8px list-row mark, sized on the gap scale. */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /**
   * Draws the dot hollow: a ring in the role's colour around an empty
   * centre, for a settled or empty state that still holds its seat beside
   * filled dots.
   */
  outline?: boolean;
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
  /**
   * Renders the dot as decoration: no `role="status"`, hidden from assistive
   * technology. For a dot repeated down a list, where the host announces the
   * state in the row's own text and a live region per row would be noise.
   */
  decorative?: boolean;
  /** Additional CSS classes */
  className?: string;
};

export interface StatusDotProps
  extends StatusDotOwnProps,
    Omit<React.ComponentPropsWithoutRef<'span'>, keyof StatusDotOwnProps> {}

/**
 * StatusDot — the bare presence/status indicator: a small dot in one of the
 * five status roles, filled or hollow, with an optional visible label and
 * an optional live pulse. Where Badge carries a text label on a tinted fill, StatusDot is the
 * mark alone — for table rows, avatars, nav items, and anywhere a full badge
 * is too loud.
 *
 * Purely presentational: safe to render from a Server Component.
 */
export const StatusDot = React.forwardRef<HTMLSpanElement, StatusDotProps>(
  (
    {
      variant = 'neutral',
      size = 'md',
      outline = false,
      pulse = false,
      label,
      decorative = false,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-status-dot';

    const classes = [
      baseClass,
      `${baseClass}--${variant}`,
      `${baseClass}--${size}`,
      outline && `${baseClass}--outline`,
      pulse && `${baseClass}--pulse`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <span
        {...rest}
        ref={ref}
        className={classes}
        role={decorative ? undefined : 'status'}
        aria-hidden={decorative ? true : rest['aria-hidden']}
      >
        <span className={`${baseClass}__indicator`} aria-hidden="true" />
        {label && <span className={`${baseClass}__label`}>{label}</span>}
      </span>
    );
  },
);

StatusDot.displayName = 'StatusDot';
