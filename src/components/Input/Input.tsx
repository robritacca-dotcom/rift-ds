'use client';

import React from 'react';
import { Field } from '../Field/Field';
import './Input.css';
import '../../fonts/material-symbols.css';

/** Props owned by Input itself — everything else falls through to the <input>. */
type InputOwnProps = {
  /** Input label text */
  label?: string;
  /** Current value */
  value?: string;
  /** Input type — curated subset; use a dedicated component for checkbox/radio/file */
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url';
  /** Component size (not the native character-width `size` attribute) */
  size?: 'default' | 'compact';
  /** Error state — shows error styling and message */
  error?: boolean;
  /** Helper or error message displayed below the input */
  helperText?: string;
  /** Material Symbol icon name on the left */
  iconLeft?: string;
  /** Material Symbol icon name on the right */
  iconRight?: string;
  /**
   * Convenience callback receiving the value directly.
   * Fires alongside `onChange`, which keeps the standard React event signature
   * so form libraries (react-hook-form, Formik, TanStack Form) work unmodified.
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

export interface InputProps
  extends InputOwnProps,
    Omit<React.ComponentPropsWithoutRef<'input'>, keyof InputOwnProps> {}

/**
 * Text input with optional label, helper text, icons and error state.
 *
 * Forwards a ref to the underlying `<input>` and spreads unrecognised props onto
 * it, so `autoComplete`, `maxLength`, `inputMode`, `data-*` and form-library
 * registration all work.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      placeholder = '',
      value,
      type = 'text',
      size = 'default',
      disabled = false,
      required = false,
      error = false,
      helperText,
      iconLeft,
      iconRight,
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
    const baseClass = 'ds-input';

    const classes = [
      baseClass,
      size === 'compact' ? `${baseClass}--compact` : '',
      error ? `${baseClass}--error` : '',
      disabled ? `${baseClass}--disabled` : '',
      iconLeft ? `${baseClass}--has-icon-left` : '',
      iconRight ? `${baseClass}--has-icon-right` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onValueChange?.(e.target.value);
    };

    // Keep the historical id derivation — Field only generates one as a
    // fallback, so an explicit id/name/label still wins and existing markup
    // (and any consumer's own htmlFor) is unchanged.
    const inputId = id || name || label?.toLowerCase().replace(/\s+/g, '-');
    const describedBy = helperText ? `${inputId}-helper` : rest['aria-describedby'];

    return (
      <Field
        className={classes}
        label={label}
        helperText={helperText}
        error={error}
        required={required}
        disabled={disabled}
        size={size}
        id={inputId}
      >
        <div className={`${baseClass}__field-wrapper`}>
          {iconLeft && (
            <span
              className={`${baseClass}__icon ${baseClass}__icon--left material-symbols-rounded`}
              aria-hidden="true"
            >
              {iconLeft}
            </span>
          )}
          <input
            {...rest}
            ref={ref}
            className={`${baseClass}__field`}
            type={type}
            id={inputId}
            name={name}
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            aria-label={ariaLabel || rest['aria-label'] || label}
            aria-invalid={error}
            aria-describedby={describedBy}
            onChange={handleChange}
          />
          {iconRight && (
            <span
              className={`${baseClass}__icon ${baseClass}__icon--right material-symbols-rounded`}
              aria-hidden="true"
            >
              {iconRight}
            </span>
          )}
        </div>
      </Field>
    );
  },
);

Input.displayName = 'Input';
