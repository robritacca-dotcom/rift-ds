'use client';

import React, { useRef, useState } from 'react';
import { Field } from '../Field/Field';
import { CircularButton } from '../CircularButton/CircularButton';
import './Input.css';
import '../../fonts/material-symbols.css';
import { mirrorClass } from '../../behaviors/direction';

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
  /** Helper text displayed below the input. With the older `error` flag and no `errorText`, it doubles as the error message. */
  helperText?: string;
  /** The error message, shown under the input while the helper text keeps its place. Setting it marks the input invalid; Field's spec owns the wiring. */
  errorText?: React.ReactNode;
  /**
   * Text or a node inside the field before the value, read by a screen reader
   * as part of the field (a currency symbol, `https://`, a country code). Not
   * the decorative `iconLeft`.
   */
  prefix?: React.ReactNode;
  /** Text or a node inside the field after the value, read by a screen reader as part of the field (a unit, `.com`, `%`). Not the decorative `iconRight`. */
  suffix?: React.ReactNode;
  /** A control inside the field at its end, after the suffix: a show/hide button, a copy button. Unlike `suffix` it is not read as part of the field; it is a control of its own. */
  action?: React.ReactNode;
  /** Show a clear button while the field holds a value. It empties the field, fires `onChange` and `onValueChange` with an empty value, then `onClear`, and returns focus to the field. */
  clearable?: boolean;
  /** Accessible name of the clear button. Defaults to "Clear". */
  clearLabel?: string;
  /** Called after the clear button empties the field. */
  onClear?: () => void;
  /** Leading icon — Material Symbol name (string) or custom element (ReactNode) */
  iconLeft?: string | React.ReactNode;
  /** Trailing icon — Material Symbol name (string) or custom element (ReactNode) */
  iconRight?: string | React.ReactNode;
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
      errorText,
      prefix,
      suffix,
      action,
      clearable = false,
      clearLabel = 'Clear',
      onClear,
      iconLeft,
      iconRight,
      onChange,
      onValueChange,
      className = '',
      ariaLabel,
      name,
      id,
      defaultValue,
      readOnly,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-input';
    const innerRef = useRef<HTMLInputElement | null>(null);
    const setRef = (node: HTMLInputElement | null) => {
      innerRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };
    // Whether an uncontrolled field holds a value, so the clear button knows
    // when to show; a controlled one reads `value`.
    const [uncontrolledFilled, setUncontrolledFilled] = useState(
      defaultValue != null && String(defaultValue) !== '',
    );
    const filled = value !== undefined ? value !== '' && value != null : uncontrolledFilled;
    const hasErrorText = errorText != null && errorText !== false && errorText !== '';
    const invalid = error || hasErrorText;
    const hasPrefix = prefix != null && prefix !== false && prefix !== '';
    const hasSuffix = suffix != null && suffix !== false && suffix !== '';
    const hasAction = action != null && action !== false;
    const affixed = hasPrefix || hasSuffix || clearable || hasAction;
    const showClear = clearable && filled && !disabled && !readOnly;

    const classes = [
      baseClass,
      size === 'compact' ? `${baseClass}--compact` : '',
      invalid ? `${baseClass}--error` : '',
      affixed ? `${baseClass}--affixed` : '',
      disabled ? `${baseClass}--disabled` : '',
      iconLeft ? `${baseClass}--has-icon-left` : '',
      iconRight ? `${baseClass}--has-icon-right` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (value === undefined) setUncontrolledFilled(e.target.value !== '');
      onChange?.(e);
      onValueChange?.(e.target.value);
    };

    /* Empty the field the way typing would: set the native value and fire an
       input event, so React's onChange (and a form library listening to it)
       hears the change whether the field is controlled or not. */
    const handleClear = () => {
      const input = innerRef.current;
      if (!input) return;
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      setter?.call(input, '');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      onClear?.();
      input.focus();
    };

    // Keep the historical id derivation — Field only generates one as a
    // fallback, so an explicit id/name/label still wins and existing markup
    // (and any consumer's own htmlFor) is unchanged.
    const inputId = id || name || label?.toLowerCase().replace(/\s+/g, '-');
    /* A consumer's aria-describedby joins the helper id rather than losing to it. */
    /* The prefix and suffix are read as part of the field, so they join it too. */
    const prefixId = hasPrefix ? `${inputId}-prefix` : undefined;
    const suffixId = hasSuffix ? `${inputId}-suffix` : undefined;
    const describedBy =
      [
        rest['aria-describedby'],
        prefixId,
        suffixId,
        hasErrorText ? `${inputId}-error` : undefined,
        helperText ? `${inputId}-helper` : undefined,
      ]
        .filter(Boolean)
        .join(' ') || undefined;

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
          {iconLeft && (
            <span
              className={`${baseClass}__icon ${baseClass}__icon--left${typeof iconLeft === 'string' ? ` material-symbols-rounded ${mirrorClass(iconLeft)}` : ''}`}
              aria-hidden="true"
            >
              {iconLeft}
            </span>
          )}
          {hasPrefix && (
            <span className={`${baseClass}__affix ${baseClass}__affix--prefix`} id={prefixId} dir="auto">
              {prefix}
            </span>
          )}
          <input
            {...rest}
            ref={setRef}
            className={`${baseClass}__field`}
            type={type}
            id={inputId}
            name={name}
            value={value}
            defaultValue={defaultValue}
            readOnly={readOnly}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            aria-label={rest['aria-label'] ?? ariaLabel ?? label}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            onChange={handleChange}
          />
          {hasSuffix && (
            <span className={`${baseClass}__affix ${baseClass}__affix--suffix`} id={suffixId} dir="auto">
              {suffix}
            </span>
          )}
          {hasAction && <span className={`${baseClass}__action`}>{action}</span>}
          {showClear && (
            <CircularButton
              className={`${baseClass}__clear`}
              icon="close"
              variant="tertiary"
              size="compact"
              ariaLabel={clearLabel}
              onClick={handleClear}
            />
          )}
          {iconRight && (
            <span
              className={`${baseClass}__icon ${baseClass}__icon--right${typeof iconRight === 'string' ? ` material-symbols-rounded ${mirrorClass(iconRight)}` : ''}`}
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
