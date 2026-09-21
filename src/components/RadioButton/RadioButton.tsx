'use client';

import React, { useId } from 'react';
import { Field } from '../Field/Field';
import './RadioButton.css';

/** Props owned by RadioButton itself — everything else falls through to the wrapper. */
type RadioButtonOwnProps = {
  /** Label text */
  label?: string;
  /** Helper or error message rendered under the label text */
  helperText?: string;
  /**
   * Error state — recolours the helper text. Deliberately no `aria-invalid`:
   * ARIA does not allow it on `role="radio"`; group-level errors carry it on
   * the radiogroup via RadioGroup's `error`.
   */
  error?: boolean;
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
      helperText,
      error = false,
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
    const generatedId = useId();
    const helperId = helperText ? `${generatedId}-helper` : undefined;
    const describedBy = helperId ?? rest['aria-describedby'];

    const classes = [
      baseClass,
      checked ? `${baseClass}--checked` : '',
      disabled ? `${baseClass}--disabled` : '',
      helperText ? `${baseClass}--has-helper` : '',
      error ? `${baseClass}--error` : '',
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
        aria-label={rest['aria-label'] || ariaLabel || label}
        aria-describedby={describedBy}
        tabIndex={disabled ? -1 : 0}
      >
        <div className={`${baseClass}__circle`}>
          <div className={`${baseClass}__dot`} />
        </div>
        {/* Without a helper the label stays a bare span, so existing markup
            (and layout) is untouched; with one, label and helper stack in a
            text column beside the circle. */}
        {helperText ? (
          <span className={`${baseClass}__text`}>
            {label && <span className={`${baseClass}__label`}>{label}</span>}
            <span className={`${baseClass}__helper`} id={helperId}>
              {helperText}
            </span>
          </span>
        ) : (
          label && <span className={`${baseClass}__label`}>{label}</span>
        )}
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
  /** Helper or error message rendered below the group */
  helperText?: string;
  /** Error state — recolours the helper text and marks the group invalid */
  error?: boolean;
  /** Marks the group required and renders the required marker on its label */
  required?: boolean;
  /** Currently selected value */
  value?: string;
  /**
   * Legacy grouping name, never used.
   *
   * @deprecated No-op. Grouping is React state (`value`/`onValueChange`), not
   * native `name` semantics — the group renders `role="radiogroup"` over
   * `<div role="radio">`s, so there is nothing for a name to group.
   */
  name?: string;
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
      helperText,
      error = false,
      required = false,
      value,
      name: _name,
      options,
      direction = 'vertical',
      onValueChange,
      onChange,
      className = '',
      id,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-radio-group';
    const classes = [baseClass, `${baseClass}--${direction}`, className]
      .filter(Boolean)
      .join(' ');

    /* Same derivation Field applies internally to the same id, so the
       aria-labelledby / aria-describedby pointers below land on the label
       and helper Field renders. */
    const generatedId = useId();
    const groupId = id || generatedId;
    const labelId = label ? `${groupId}-label` : undefined;
    const describedBy = helperText ? `${groupId}-helper` : rest['aria-describedby'];

    const handleSelect = (next: string) => {
      onValueChange?.(next);
      onChange?.(next);
    };

    return (
      <Field
        {...rest}
        ref={ref}
        className={classes}
        group
        label={label}
        helperText={helperText}
        error={error}
        required={required}
        id={groupId}
        role="radiogroup"
        aria-labelledby={labelId}
        aria-describedby={describedBy}
        aria-invalid={error || undefined}
      >
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
      </Field>
    );
  },
);

RadioGroup.displayName = 'RadioGroup';
