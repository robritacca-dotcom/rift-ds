import './Alert.css';
import '../../fonts/material-symbols.css';

export interface AlertProps {
  /** Alert title text */
  title?: string;
  /** Alert description / body text */
  description?: string;
  /** Alert variant determines colour and icon */
  variant?: 'info' | 'positive' | 'warning' | 'error' | 'neutral';
  /** Component size */
  size?: 'default' | 'compact';
  /** Whether the alert can be dismissed */
  dismissible?: boolean;
  /** Custom icon override — Material Symbol name */
  icon?: string;
  /** Callback when dismiss button is clicked */
  onDismiss?: () => void;
  /** Additional CSS classes */
  className?: string;
}

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
 * with optional dismiss functionality.
 */
export const Alert = ({
  title,
  description,
  variant = 'info',
  size = 'default',
  dismissible = false,
  icon,
  onDismiss,
  className = '',
}: AlertProps) => {
  const baseClass = 'ds-alert';
  const variantClass = `${baseClass}--${variant}`;
  const sizeClass = `${baseClass}--${size}`;

  const classes = [baseClass, variantClass, sizeClass, className]
    .filter(Boolean)
    .join(' ');

  const iconName = icon || defaultIcons[variant];

  return (
    <div className={classes} role="alert">
      <span
        className={`${baseClass}__icon material-symbols-rounded`}
        aria-hidden="true"
      >
        {iconName}
      </span>

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
          aria-label="Dismiss alert"
        >
          <span className="material-symbols-rounded" aria-hidden="true">
            close
          </span>
        </button>
      )}
    </div>
  );
};
