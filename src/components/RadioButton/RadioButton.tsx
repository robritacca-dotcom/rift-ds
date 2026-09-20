'use client';

import React from 'react';
import './RadioButton.css';

/** Props owned by RadioButton itself — everything else falls through to the wrapper. */
type RadioButtonOwnProps = {
  /** Label text */
  label?: string;
  /** Whether this radio is selected */
  checked?: boolean;
  /** Whether the radio is disabled */
  disabled?: boolean;
  /** Value for this radio option */
  value?: string;
  /** Called with this radio's value when selected */
  onValueChange?: (value: string) => void;
  /** Additional CSS classes */
  className?: string;
  /**
   * Legacy change handler, kept for backwards compatibility.
   *
   * @deprecated Use `onValueChange` instead.
   */
  onChange?: (value: string) => void;
  /**
   * Legacy accessible-name prop.
   *
   * @deprecated Pass the native `aria-label` attribute instead.
   */
  ariaLabel?: string;
  /**
   * Legacy form-field name.
   *
   * @deprecated No-op. This component renders a `<div role="radio">`, not a
   * native `<input type="radio">`, so it does not group by name or participate
   * in native form submission — `RadioGroup` handles grouping in React state.
   * Declared only so the attribute is not forwarded to an element that rejects it.
   */
  name?: string;
};

export interface RadioButtonProps
  extends RadioButtonOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof RadioButtonOwnProps> {}

export const RadioButton = React.forwardRef<HTMLDivElement, RadioButtonProps>(
  (
    {
      label,
      checked = false,
      disabled = false,
      value = '',
      onValueChange,
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
    const baseClass = 'ds-radio';

    const classes = [
      baseClass,
      checked ? `${baseClass}--checked` : '',
      disabled ? `${baseClass}--disabled` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const select = () => {
      if (disabled) return;
      onValueChange?.(value);
      onChange?.(value);
    };

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      onClick?.(e);
      select();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        select();
      }
    };

    return (
      <div
        {...rest}
        ref={ref}
        className={classes}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="radio"
        aria-checked={checked}
        aria-disabled={disabled}
        aria-label={ariaLabel || rest['aria-label'] || label}
        tabIndex={disabled ? -1 : 0}
      >
        <div className={`${baseClass}__circle`}>
          <div className={`${baseClass}__dot`} />
        </div>
        {label && <span className={`${baseClass}__label`}>{label}</span>}
      </div>
    );
  },
);

RadioButton.displayName = 'RadioButton';

/* ============================================
   RADIO GROUP — Wraps multiple RadioButtons
   ============================================ */

type RadioGroupOwnProps = {
  /** Group label */
  label?: string;
  /** Currently selected value */
  value?: string;
  /** Radio group name */
  name: string;
  /** Radio options */
  options: { label: string; value: string; disabled?: boolean }[];
  /** Layout direction */
  direction?: 'vertical' | 'horizontal';
  /** Called with the newly selected value */
  onValueChange?: (value: string) => void;
  /** Additional CSS classes */
  className?: string;
  /**
   * Legacy change handler, kept for backwards compatibility.
   *
   * @deprecated Use `onValueChange` instead.
   */
  onChange?: (value: string) => void;
};

export interface RadioGroupProps
  extends RadioGroupOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof RadioGroupOwnProps> {}

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      label,
      value,
      name: _name,
      options,
      direction = 'vertical',
      onValueChange,
      onChange,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-radio-group';
    const classes = [baseClass, `${baseClass}--${direction}`, className]
      .filter(Boolean)
      .join(' ');

    const handleSelect = (next: string) => {
      onValueChange?.(next);
      onChange?.(next);
    };

    return (
      <div {...rest} ref={ref} className={classes} role="radiogroup" aria-label={label}>
        {label && <span className={`${baseClass}__label`}>{label}</span>}
        <div className={`${baseClass}__options`}>
          {options.map((option) => (
            <RadioButton
              key={option.value}
              label={option.label}
              value={option.value}
              checked={value === option.value}
              disabled={option.disabled}
              onValueChange={handleSelect}
            />
          ))}
        </div>
      </div>
    );
  },
);

RadioGroup.displayName = 'RadioGroup';
