'use client';

import React from 'react';
import './Checkbox.css';

/** Props owned by Checkbox itself — everything else falls through to the wrapper. */
type CheckboxOwnProps = {
  /** Label text */
  label?: string;
  /** Whether the checkbox is checked */
  checked?: boolean;
  /** Whether the checkbox is in an indeterminate state */
  indeterminate?: boolean;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
  /** Component size */
  size?: 'default' | 'compact';
  /** Called with the next checked state when toggled */
  onCheckedChange?: (checked: boolean) => void;
  /** Additional CSS classes */
  className?: string;
  /**
   * Legacy change handler, kept for backwards compatibility.
   *
   * @deprecated Use `onCheckedChange` instead.
   */
  onChange?: (checked: boolean) => void;
  /**
   * Legacy accessible-name prop.
   *
   * @deprecated Pass the native `aria-label` attribute instead.
   */
  ariaLabel?: string;
  /**
   * Legacy form-field name.
   *
   * @deprecated No-op. This component renders a `<div role="checkbox">`, not a
   * native `<input>`, so it cannot participate in native form submission.
   * Declared only so the attribute is not forwarded to an element that rejects it.
   */
  name?: string;
};

export interface CheckboxProps
  extends CheckboxOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof CheckboxOwnProps> {}

/** Custom SVG check icon — pixel-perfect centering without font metrics */
const CheckIcon = () => (
  <svg
    className="ds-checkbox__icon"
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M2 7.5L5.5 11L12 3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Custom SVG minus icon for indeterminate state */
const MinusIcon = () => (
  <svg
    className="ds-checkbox__icon"
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    aria-hidden="true"
  >
    <path d="M2 7H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const Checkbox = React.forwardRef<HTMLDivElement, CheckboxProps>(
  (
    {
      label,
      checked = false,
      indeterminate = false,
      disabled = false,
      size = 'default',
      onCheckedChange,
      onChange,
      className = '',
      ariaLabel,
      name: _name,
      onClick,
      onKeyDown,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-checkbox';

    const classes = [
      baseClass,
      size === 'compact' ? `${baseClass}--compact` : '',
      checked ? `${baseClass}--checked` : '',
      indeterminate && !checked ? `${baseClass}--indeterminate` : '',
      disabled ? `${baseClass}--disabled` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const toggle = () => {
      if (disabled) return;
      onCheckedChange?.(!checked);
      onChange?.(!checked);
    };

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      onClick?.(e);
      toggle();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggle();
      }
    };

    return (
      <div
        {...rest}
        ref={ref}
        className={classes}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="checkbox"
        aria-checked={indeterminate && !checked ? 'mixed' : checked}
        aria-disabled={disabled}
        aria-label={ariaLabel || rest['aria-label'] || label}
        tabIndex={disabled ? -1 : 0}
      >
        <div className={`${baseClass}__box`}>
          {indeterminate && !checked ? <MinusIcon /> : <CheckIcon />}
        </div>
        {label && <span className={`${baseClass}__label`}>{label}</span>}
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';

/* ============================================
   CHECKBOX GROUP — Wraps multiple Checkboxes
   ============================================ */

type CheckboxGroupOwnProps = {
  /** Group label */
  label?: string;
  /** Checkbox options */
  items: { label: string; value: string; disabled?: boolean }[];
  /** Currently selected values */
  values?: string[];
  /** Layout direction */
  direction?: 'vertical' | 'horizontal';
  /** Component size */
  size?: 'default' | 'compact';
  /** Called with the next selected values */
  onValuesChange?: (values: string[]) => void;
  /** Additional CSS classes */
  className?: string;
  /**
   * Legacy change handler, kept for backwards compatibility.
   *
   * @deprecated Use `onValuesChange` instead.
   */
  onChange?: (values: string[]) => void;
};

export interface CheckboxGroupProps
  extends CheckboxGroupOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof CheckboxGroupOwnProps> {}

export const CheckboxGroup = React.forwardRef<HTMLDivElement, CheckboxGroupProps>(
  (
    {
      label,
      items,
      values = [],
      direction = 'vertical',
      size = 'default',
      onValuesChange,
      onChange,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-checkbox-group';
    const classes = [baseClass, `${baseClass}--${direction}`, className]
      .filter(Boolean)
      .join(' ');

    const handleToggle = (itemValue: string) => {
      const next = values.includes(itemValue)
        ? values.filter((v) => v !== itemValue)
        : [...values, itemValue];
      onValuesChange?.(next);
      onChange?.(next);
    };

    return (
      <div {...rest} ref={ref} className={classes} role="group" aria-label={label}>
        {label && <span className={`${baseClass}__label`}>{label}</span>}
        <div className={`${baseClass}__items`}>
          {items.map((item) => (
            <Checkbox
              key={item.value}
              label={item.label}
              checked={values.includes(item.value)}
              disabled={item.disabled}
              size={size}
              onCheckedChange={() => handleToggle(item.value)}
            />
          ))}
        </div>
      </div>
    );
  },
);

CheckboxGroup.displayName = 'CheckboxGroup';
