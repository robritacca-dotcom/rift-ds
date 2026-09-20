import React from 'react';
import './EmptyState.css';
import '../../fonts/material-symbols.css';

export interface EmptyStateProps {
  /** Material Symbol icon name, or a custom element (e.g. an illustration) */
  icon?: string | React.ReactNode;
  /** Short headline describing the empty condition */
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
}

/**
 * EmptyState component — the placeholder shown when a list, table, search,
 * or dashboard has nothing to display. Pairs an icon with a headline,
 * supporting copy, and an optional action so the blank space still tells
 * the user what to do next.
 */
export const EmptyState = ({
  icon,
  title,
  description,
  action,
  size = 'default',
  variant = 'plain',
  className = '',
}: EmptyStateProps) => {
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
    <div className={classes}>
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
};
