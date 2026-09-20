'use client';

import React from 'react';
import './ToggleGroup.css';

export interface ToggleGroupItem {
  /** Unique value */
  value: string;
  /** Display label or icon name (Material Symbols) */
  label: string;
  /** Use Material Symbol icon instead of text */
  icon?: boolean;
}

/** Props owned by ToggleGroup itself — everything else falls through to the wrapper. */
type ToggleGroupOwnProps = {
  /** Available items */
  items: ToggleGroupItem[];
  /** Currently active value(s) */
  value?: string | string[];
  /** Allow multiple selection */
  multiple?: boolean;
  /** Component size */
  size?: 'default' | 'compact';
  /** Visual treatment of active items — teal by default, `neutral` fills them grey */
  variant?: 'primary' | 'neutral';
  /** Whether the whole group is disabled */
  disabled?: boolean;
  /** Called with the next selection — a string when single, an array when `multiple` */
  onValueChange?: (value: string | string[]) => void;
  /** Additional CSS classes */
  className?: string;
  /**
   * Legacy change handler, kept for backwards compatibility.
   *
   * @deprecated Use `onValueChange` instead.
   */
  onChange?: (value: string | string[]) => void;
  /**
   * Legacy accessible-name prop.
   *
   * @deprecated Pass the native `aria-label` attribute instead.
   */
  ariaLabel?: string;
};

export interface ToggleGroupProps
  extends ToggleGroupOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof ToggleGroupOwnProps> {}

/**
 * ToggleGroup is a set of two-state buttons that can be toggled on or off.
 *
 * Forwards a ref to the wrapping group element and spreads unrecognised props
 * onto it.
 */
export const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  (
    {
      items,
      value = [],
      multiple = false,
      size = 'default',
      variant = 'primary',
      disabled = false,
      onValueChange,
      onChange,
      ariaLabel,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-toggle-group';
    const classes = [
      baseClass,
      `${baseClass}--${size}`,
      `${baseClass}--${variant}`,
      disabled ? `${baseClass}--disabled` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const activeValues = Array.isArray(value) ? value : [value];

    const emit = (next: string | string[]) => {
      onValueChange?.(next);
      onChange?.(next);
    };

    const handleClick = (itemValue: string) => {
      if (disabled) return;

      if (multiple) {
        const next = activeValues.includes(itemValue)
          ? activeValues.filter((v) => v !== itemValue)
          : [...activeValues, itemValue];
        emit(next);
      } else {
        emit(itemValue);
      }
    };

    return (
      <div
        {...rest}
        ref={ref}
        className={classes}
        role="group"
        aria-label={ariaLabel || rest['aria-label']}
      >
        {items.map((item) => {
          const isActive = activeValues.includes(item.value);
          const btnClass = [`${baseClass}__item`, isActive ? `${baseClass}__item--active` : '']
            .filter(Boolean)
            .join(' ');

          return (
            <button
              key={item.value}
              className={btnClass}
              onClick={() => handleClick(item.value)}
              aria-pressed={isActive}
              aria-label={item.icon ? item.label : undefined}
              disabled={disabled}
              type="button"
            >
              {item.icon ? (
                <span className="material-symbols-rounded" aria-hidden="true">
                  {item.label}
                </span>
              ) : (
                item.label
              )}
            </button>
          );
        })}
      </div>
    );
  },
);

ToggleGroup.displayName = 'ToggleGroup';
