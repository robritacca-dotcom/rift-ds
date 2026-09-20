import React from 'react';
import './Banner.css';
import '../../fonts/material-symbols.css';

/** Props owned by Banner itself — everything else falls through to the root node. */
type BannerOwnProps = {
  /** Status variant determines colour and default icon */
  variant?: 'info' | 'positive' | 'warning' | 'error' | 'neutral';
  /** Short leading emphasis before the body text. Deliberately shadows the native `title` attribute — a banner never needs a hover tooltip. */
  title?: string;
  /** Banner body content — a single line of text, rendered inside the banner's paragraph */
  children?: React.ReactNode;
  /** Custom icon override — Material Symbol name */
  icon?: string;
  /** Action slot on the trailing edge, for a compact Button or link */
  action?: React.ReactNode;
  /** Whether the banner shows a dismiss button */
  dismissible?: boolean;
  /** Callback when the dismiss button is clicked */
  onDismiss?: () => void;
  /** Horizontal alignment of the banner content */
  align?: 'start' | 'center';
  /** Additional CSS classes */
  className?: string;
};

export interface BannerProps
  extends BannerOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof BannerOwnProps> {}

const defaultIcons: Record<string, string> = {
  info: 'info',
  positive: 'check_circle',
  warning: 'warning',
  error: 'error',
  neutral: 'campaign',
};

/**
 * Full-width status strip for page-level announcements: a release notice, a
 * degraded-service warning, an environment flag. The third sibling in the
 * feedback family — Alert sits inline in the layout, Toast interrupts and
 * leaves, Banner spans the page and stays until dismissed.
 *
 * Stateless like Alert: `dismissible` shows the close control and `onDismiss`
 * reports the click; removing the banner is the consumer's render decision.
 * Forwards a ref to the root element and spreads unrecognised props onto it.
 */
export const Banner = React.forwardRef<HTMLDivElement, BannerProps>(
  (
    {
      variant = 'info',
      title,
      children,
      icon,
      action,
      dismissible = false,
      onDismiss,
      align = 'start',
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-banner';

    const classes = [
      baseClass,
      `${baseClass}--${variant}`,
      align === 'center' ? `${baseClass}--center` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const iconName = icon || defaultIcons[variant];

    return (
      <div {...rest} ref={ref} className={classes} role="status">
        <div className={`${baseClass}__body`}>
          <span className={`${baseClass}__icon material-symbols-rounded`} aria-hidden="true">
            {iconName}
          </span>
          <p className={`${baseClass}__content`}>
            {title && <strong className={`${baseClass}__title`}>{title}</strong>}
            {title && children ? ' ' : null}
            {children}
          </p>
          {action && <span className={`${baseClass}__action`}>{action}</span>}
        </div>

        {dismissible && (
          <button
            type="button"
            className={`${baseClass}__dismiss`}
            onClick={onDismiss}
            aria-label="Dismiss banner"
          >
            <span className="material-symbols-rounded" aria-hidden="true">
              close
            </span>
          </button>
        )}
      </div>
    );
  },
);

Banner.displayName = 'Banner';
