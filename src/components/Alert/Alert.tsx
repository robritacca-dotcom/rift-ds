import React from 'react';
import './Alert.css';
import '../../fonts/material-symbols.css';

/** Props owned by Alert itself — everything else falls through to the root div. */
type AlertOwnProps = {
  /**
   * Alert title text.
   * Note: this shadows the native `title` tooltip attribute, which Alert does not expose.
   */
  title?: string;
  /** Alert description / body text */
  description?: string;
  /** Alert variant determines colour and icon */
  variant?: 'info' | 'positive' | 'warning' | 'error' | 'neutral';
  /** Component size */
  size?: 'default' | 'compact';
  /** Whether the alert can be dismissed */
  dismissible?: boolean;
  /** Custom icon override — Material Symbol name (string) or custom element (ReactNode) */
  icon?: string | React.ReactNode;
  /** Callback when dismiss button is clicked */
  onDismiss?: () => void;
  /** Accessible name for the dismiss button */
  dismissLabel?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface AlertProps
  extends AlertOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof AlertOwnProps | 'children'> {}

const defaultIcons: Record<string, string> = {
  info: 'info',
  positive: 'check_circle',
  warning: 'warning',
  error: 'error',
  neutral: 'info',
};

/**
 * Alert component for contextual feedback messages.
 * Supports info, positive, warning, error, and neutral variants
 * with optional dismiss functionality. Forwards a ref to the root div and
 * spreads native attributes onto it; a passed `role` (e.g. `status` for a
 * polite announcement) replaces the default `alert`.
 */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      title,
      description,
      variant = 'info',
      size = 'default',
      dismissible = false,
      icon,
      onDismiss,
      dismissLabel = 'Dismiss alert',
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-alert';
    const variantClass = `${baseClass}--${variant}`;
    const sizeClass = `${baseClass}--${size}`;

    const classes = [baseClass, variantClass, sizeClass, className]
      .filter(Boolean)
      .join(' ');

    const iconValue = icon || defaultIcons[variant];

    return (
      <div role="alert" {...rest} ref={ref} className={classes}>
        {typeof iconValue === 'string' ? (
          <span
            className={`${baseClass}__icon material-symbols-rounded`}
            aria-hidden="true"
          >
            {iconValue}
          </span>
        ) : (
          <span className={`${baseClass}__icon`} aria-hidden="true">
            {iconValue}
          </span>
        )}

        <div className={`${baseClass}__content`}>
          {title && <p className={`${baseClass}__title`}>{title}</p>}
          {description && (
            <p className={`${baseClass}__description`}>{description}</p>
          )}
        </div>

        {dismissible && (
          <button
            type="button"
            className={`${baseClass}__dismiss`}
            onClick={onDismiss}
            aria-label={dismissLabel}
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

Alert.displayName = 'Alert';
