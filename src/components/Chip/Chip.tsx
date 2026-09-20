import React from 'react';
import './Chip.css';
import '../../fonts/material-symbols.css';

export interface ChipProps {
  /** Chip label — string for plain text, ReactNode for richer content (e.g. a numbered prefix) */
  label: React.ReactNode;
  /** Leading icon — Material Symbol name (string) or custom element (ReactNode) */
  icon?: string | React.ReactNode;
  /** Selected state (filter-style chips) — renders the teal active fill */
  selected?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Chip size — `large` matches the default Button and paragraph body scale, for pills that are a primary tap target rather than metadata */
  size?: 'large' | 'default' | 'compact';
  /** Click handler — presence makes the chip an interactive <button> */
  onClick?: () => void;
  /** Remove handler — renders a trailing close button (input-style chips) */
  onRemove?: () => void;
  /** Accessible label for the remove button */
  removeLabel?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Chip component — compact pill for attributes, filters, and inline metadata.
 * Non-clickable by default (renders a <span>); pass onClick for an
 * interactive <button>, and/or onRemove for a trailing close button.
 */
export const Chip = ({
  label,
  icon,
  selected,
  disabled = false,
  size = 'default',
  onClick,
  onRemove,
  removeLabel = 'Remove',
  className = '',
}: ChipProps) => {
  const baseClass = 'ds-chip';

  const classes = [
    baseClass,
    `${baseClass}--${size}`,
    selected && `${baseClass}--selected`,
    disabled && `${baseClass}--disabled`,
    onClick && !onRemove && `${baseClass}--clickable`,
    onRemove && `${baseClass}--removable`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  /** Render the leading icon slot — string → Material Symbol, ReactNode → custom element */
  const renderIcon = (iconProp: string | React.ReactNode) => {
    if (typeof iconProp === 'string') {
      return (
        <span className={`${baseClass}__icon material-symbols-rounded`} aria-hidden="true">
          {iconProp}
        </span>
      );
    }
    return (
      <span className={`${baseClass}__icon`} aria-hidden="true">
        {iconProp}
      </span>
    );
  };

  const content = (
    <>
      {icon && renderIcon(icon)}
      <span className={`${baseClass}__label`}>{label}</span>
    </>
  );

  // aria-pressed only applies when the chip is an explicit toggle
  const ariaPressed = typeof selected === 'boolean' ? selected : undefined;

  // Removable chip — <span> container so the remove <button> isn't nested
  // inside another button; a clickable main region wraps the content instead
  if (onRemove) {
    return (
      <span className={classes}>
        {onClick ? (
          <button
            type="button"
            className={`${baseClass}__main`}
            onClick={onClick}
            disabled={disabled}
            aria-pressed={ariaPressed}
          >
            {content}
          </button>
        ) : (
          content
        )}
        <button
          type="button"
          className={`${baseClass}__remove`}
          onClick={onRemove}
          disabled={disabled}
          aria-label={removeLabel}
        >
          <span className="material-symbols-rounded" aria-hidden="true">
            close
          </span>
        </button>
      </span>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        className={classes}
        onClick={onClick}
        disabled={disabled}
        aria-pressed={ariaPressed}
      >
        {content}
      </button>
    );
  }

  return <span className={classes}>{content}</span>;
};
