'use client';

import React from 'react';
import { Field } from '../Field/Field';
import './DateInput.css';
import '../../fonts/material-symbols.css';

/** Props owned by DateInput itself — everything else falls through to the <input>. */
type DateInputOwnProps = {
  /** Input label text */
  label?: string;
  /** Current value (YYYY-MM-DD format) */
  value?: string;
  /** Component size (not the native character-width `size` attribute) */
  size?: 'default' | 'compact';
  /** Error state: marks the control invalid and, in the older form without `errorText`, recolours the helper text as the error message. */
  error?: boolean;
  /** Helper text displayed below the control. With the older `error` flag and no `errorText`, it doubles as the error message. */
  helperText?: string;
  /** The error message, shown under the control while the helper text keeps its place. Setting it marks the control invalid, so `error` is not needed alongside it; Field's spec owns the wiring. */
  errorText?: React.ReactNode;
  /** Minimum selectable date (YYYY-MM-DD) */
  min?: string;
  /** Maximum selectable date (YYYY-MM-DD) */
  max?: string;
  /**
   * Convenience callback receiving the value directly.
   * Fires alongside `onChange`, which keeps the standard React event signature
   * so form libraries work unmodified.
   */
  onValueChange?: (value: string) => void;
  /** Additional CSS classes — applied to the wrapper, not the <input> */
  className?: string;
  /**
   * Legacy accessible-name prop.
   *
   * @deprecated Pass the native `aria-label` attribute instead.
   */
  ariaLabel?: string;
};

export interface DateInputProps
  extends DateInputOwnProps,
    Omit<React.ComponentPropsWithoutRef<'input'>, keyof DateInputOwnProps | 'type'> {}

/**
 * Date input component with native date picker.
 * Uses the browser's built-in date input with custom styling,
 * calendar icon, label, and validation states.
 *
 * Forwards a ref to the underlying `<input type="date">` and spreads
 * unrecognised props onto it.
 */
export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  (
    {
      label,
      value,
      placeholder,
      size = 'default',
      disabled = false,
      required = false,
      error = false,
      helperText,
      errorText,
      min,
      max,
      onChange,
      onValueChange,
      className = '',
      ariaLabel,
      name,
      id,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-date-input';

    const hasErrorText = errorText != null && errorText !== false && errorText !== '';
    const invalid = error || hasErrorText;
    const classes = [
      baseClass,
      `${baseClass}--${size}`,
      invalid ? `${baseClass}--error` : '',
      disabled ? `${baseClass}--disabled` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onValueChange?.(e.target.value);
    };

    const inputId = id || name || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <Field
        className={classes}
        label={label}
        helperText={helperText}
        errorText={errorText}
        error={error}
        required={required}
        disabled={disabled}
        size={size}
        id={inputId}
      >
        <div className={`${baseClass}__field-wrapper`}>
          <span className={`${baseClass}__icon material-symbols-rounded`} aria-hidden="true">
            calendar_today
          </span>
          <input
            {...rest}
            ref={ref}
            className={`${baseClass}__field`}
            type="date"
            id={inputId}
            name={name}
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            min={min}
            max={max}
            aria-label={rest['aria-label'] ?? ariaLabel ?? label}
            aria-invalid={invalid}
            aria-describedby={
              [rest['aria-describedby'], hasErrorText ? `${inputId}-error` : undefined, helperText ? `${inputId}-helper` : undefined]
                .filter(Boolean)
                .join(' ') || undefined
            }
            onChange={handleChange}
          />
        </div>
      </Field>
    );
  },
);

DateInput.displayName = 'DateInput';
