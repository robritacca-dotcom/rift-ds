import React from 'react';
import './EmptyState.css';
import '../../fonts/material-symbols.css';

/** Props owned by EmptyState itself — everything else falls through to the root div. */
type EmptyStateOwnProps = {
  /** Material Symbol icon name, or a custom element (e.g. an illustration) */
  icon?: string | React.ReactNode;
  /**
   * Short headline describing the empty condition.
   * Note: this shadows the native `title` tooltip attribute, which EmptyState does not expose.
   */
  title: string;
  /** Supporting copy — say what to do next, not just what is missing */
  description?: string;
  /** Action slot — typically one primary Button, optionally a secondary */
  action?: React.ReactNode;
  /** Component size */
  size?: 'default' | 'compact';
  /**
   * Visual treatment. `plain` sits directly on the page; `bordered` draws a
   * dashed container, which reads better inside a card, table, or panel.
   */
  variant?: 'plain' | 'bordered';
  /** Additional CSS classes */
  className?: string;
};

export interface EmptyStateProps
  extends EmptyStateOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof EmptyStateOwnProps | 'children'> {}

/**
 * EmptyState component — the placeholder shown when a list, table, search,
 * or dashboard has nothing to display. Pairs an icon with a headline,
 * supporting copy, and an optional action so the blank space still tells
 * the user what to do next. Forwards a ref to the root div and spreads
 * native attributes onto it.
 */
export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      icon,
      title,
      description,
      action,
      size = 'default',
      variant = 'plain',
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-empty-state';

    const classes = [
      baseClass,
      `${baseClass}--${variant}`,
      size === 'compact' ? `${baseClass}--compact` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div {...rest} ref={ref} className={classes}>
        {icon && (
          <div className={`${baseClass}__icon`} aria-hidden="true">
            {typeof icon === 'string' ? (
              <span className="material-symbols-rounded">{icon}</span>
            ) : (
              icon
            )}
          </div>
        )}

        <div className={`${baseClass}__content`}>
          <p className={`${baseClass}__title`}>{title}</p>
          {description && <p className={`${baseClass}__description`}>{description}</p>}
        </div>

        {action && <div className={`${baseClass}__action`}>{action}</div>}
      </div>
    );
  },
);

EmptyState.displayName = 'EmptyState';
