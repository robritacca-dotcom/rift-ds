import React from 'react';
import './Chip.css';
import '../../fonts/material-symbols.css';

/** Props owned by Chip itself — everything else falls through to the root node. */
type ChipOwnProps = {
  /** Chip label — string for plain text, ReactNode for richer content (e.g. a numbered prefix) */
  label: React.ReactNode;
  /** Leading icon — Material Symbol name (string) or custom element (ReactNode) */
  icon?: string | React.ReactNode;
  /** Selected state (filter-style chips): renders the active fill, coloured by `tone` */
  selected?: boolean;
  /**
   * Colour of the selected fill: `default` takes the action colour, `neutral`
   * fills it grey, for filter rows whose selection should read quietly.
   */
  tone?: 'default' | 'neutral';
  /** Disabled state */
  disabled?: boolean;
  /** Chip size — `large` matches the default Button and paragraph body scale, for pills that are a primary tap target rather than metadata */
  size?: 'large' | 'default' | 'compact';
  /**
   * Click handler — presence makes the chip an interactive <button>. On a
   * removable chip it is attached to the main region's button rather than
   * the root span.
   */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Remove handler — renders a trailing close button (input-style chips) */
  onRemove?: () => void;
  /**
   * Accessible label for the remove button. Defaults to "Remove". Pass a
   * function to name each chip's button after its own label, so a row of
   * chips does not announce one name for every button: it is given the
   * label's text (a rich label's text content), e.g.
   * `(label) => \`Remove ${label}\``. A plain string is used as given.
   */
  removeLabel?: string | ((label: string) => string);
  /** Additional CSS classes */
  className?: string;
};

export interface ChipProps
  extends ChipOwnProps,
    Omit<React.ComponentPropsWithoutRef<'span'>, keyof ChipOwnProps | 'children'> {}

/** The text a label reads as: strings and numbers as given, a rich node's text children joined. */
function textOf(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (React.isValidElement(node)) {
    return textOf((node.props as { children?: React.ReactNode }).children);
  }
  return '';
}

/**
 * Chip component — compact pill for attributes, filters, and inline metadata.
 * Non-clickable by default (renders a <span>); pass onClick for an
 * interactive <button>, and/or onRemove for a trailing close button.
 * Forwards a ref to the root node (the `<button>` of a clickable chip, the
 * `<span>` otherwise) and spreads native attributes onto it.
 */
export const Chip = React.forwardRef<HTMLElement, ChipProps>(
  (
    {
      label,
      icon,
      selected,
      tone = 'default',
      disabled = false,
      size = 'default',
      onClick,
      onRemove,
      removeLabel = 'Remove',
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-chip';

    const classes = [
      baseClass,
      `${baseClass}--${size}`,
      selected && `${baseClass}--selected`,
      selected && tone === 'neutral' && `${baseClass}--selected-neutral`,
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
        <span {...rest} ref={ref as React.Ref<HTMLSpanElement>} className={classes}>
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
            aria-label={
              typeof removeLabel === 'function' ? removeLabel(textOf(label)) : removeLabel
            }
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
          {...(rest as React.ComponentPropsWithoutRef<'button'>)}
          ref={ref as React.Ref<HTMLButtonElement>}
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

    return (
      <span {...rest} ref={ref as React.Ref<HTMLSpanElement>} className={classes}>
        {content}
      </span>
    );
  },
);

Chip.displayName = 'Chip';
