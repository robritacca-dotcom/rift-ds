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
  /**
   * Currently active value(s), controlled. Leave undefined to let the group
   * keep its own selection, seeded from `defaultValue`.
   */
  value?: string | string[];
  /** Active value(s) on first render when uncontrolled (`value` undefined). */
  defaultValue?: string | string[];
  /**
   * Allow multiple selection, where each item toggles on or off. Without it
   * exactly one item is active once chosen, and pressing it again keeps it.
   */
  multiple?: boolean;
  /** Component size */
  size?: 'default' | 'compact';
  /**
   * Colour of active items: `default` takes the action colour, `neutral`
   * fills them grey, for a set whose selection should not carry the action
   * colour's weight.
   */
  tone?: 'default' | 'neutral';
  /**
   * Legacy name for `tone`, from before colour moved onto its own prop:
   * `primary` is `tone="default"`.
   *
   * @deprecated Use `tone` instead.
   */
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
 * ToggleGroup is a set of pressable buttons. By default it is single
 * selection: pressing an item makes it the one active item, and pressing the
 * active item again keeps it active. With `multiple`, each item toggles on or
 * off independently.
 *
 * Forwards a ref to the wrapping group element and spreads unrecognised props
 * onto it.
 */
export const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  (
    {
      items,
      value,
      defaultValue = [],
      multiple = false,
      size = 'default',
      tone,
      variant,
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
    // `variant` is the deprecated spelling of `tone`; the modifier class keeps
    // its original names so styles written against them still apply.
    const resolvedTone = tone ?? (variant === 'neutral' ? 'neutral' : 'default');
    const classes = [
      baseClass,
      `${baseClass}--${size}`,
      `${baseClass}--${resolvedTone === 'neutral' ? 'neutral' : 'primary'}`,
      disabled ? `${baseClass}--disabled` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const [internalValue, setInternalValue] = React.useState<string | string[]>(defaultValue);
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;
    const activeValues = Array.isArray(currentValue) ? currentValue : [currentValue];

    const emit = (next: string | string[]) => {
      if (!isControlled) setInternalValue(next);
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
        aria-label={rest['aria-label'] ?? ariaLabel}
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
