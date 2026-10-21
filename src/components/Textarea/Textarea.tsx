'use client';

import React from 'react';
import { Field } from '../Field/Field';
import './Textarea.css';

/** Props owned by Textarea itself — everything else falls through to the <textarea>. */
type TextareaOwnProps = {
  /** Textarea label text */
  label?: string;
  /**
   * Current value (controlled). Leave it undefined for an uncontrolled
   * textarea, which keeps its own state seeded from `defaultValue`.
   */
  value?: string;
  /** Initial value when uncontrolled (`value` undefined). */
  defaultValue?: string;
  /** Component size */
  size?: 'default' | 'compact';
  /** Error state — shows error styling and message */
  error?: boolean;
  /** Helper or error message displayed below */
  helperText?: string;
  /** Whether the textarea is resizable */
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  /** Max character count — shows counter when set */
  maxLength?: number;
  /**
   * Convenience callback receiving the value directly.
   * Fires alongside `onChange`, which keeps the standard React event signature
   * so form libraries work unmodified.
   */
  onValueChange?: (value: string) => void;
  /** Additional CSS classes — applied to the wrapper, not the <textarea> */
  className?: string;
  /**
   * Legacy accessible-name prop.
   *
   * @deprecated Pass the native `aria-label` attribute instead.
   */
  ariaLabel?: string;
};

export interface TextareaProps
  extends TextareaOwnProps,
    Omit<React.ComponentPropsWithoutRef<'textarea'>, keyof TextareaOwnProps> {}

/**
 * Multi-line text input with optional label, helper text, character counter
 * and error state.
 *
 * Forwards a ref to the underlying `<textarea>` and spreads unrecognised props
 * onto it.
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      placeholder = '',
      value,
      defaultValue,
      rows = 4,
      size = 'default',
      disabled = false,
      required = false,
      error = false,
      helperText,
      resize = 'vertical',
      maxLength,
      onChange,
      onValueChange,
      className = '',
      ariaLabel,
      name,
      id,
      style,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-textarea';

    const classes = [
      baseClass,
      size === 'compact' ? `${baseClass}--compact` : '',
      error ? `${baseClass}--error` : '',
      disabled ? `${baseClass}--disabled` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = React.useState(defaultValue ?? '');
    const currentValue = isControlled ? value : internalValue;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!isControlled) setInternalValue(e.target.value);
      onChange?.(e);
      onValueChange?.(e.target.value);
    };

    const inputId = id || name || label?.toLowerCase().replace(/\s+/g, '-');
    const charCount = currentValue.length;
    /* A consumer's aria-describedby joins the helper id rather than losing to it. */
    const describedBy =
      [rest['aria-describedby'], helperText ? `${inputId}-helper` : undefined]
        .filter(Boolean)
        .join(' ') || undefined;

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
        aside={
          maxLength ? (
            <span className={`${baseClass}__counter`} aria-live="polite" aria-atomic="true">
              {charCount}/{maxLength}
            </span>
          ) : undefined
        }
      >
        <textarea
          {...rest}
          ref={ref}
          className={`${baseClass}__field`}
          id={inputId}
          name={name}
          value={currentValue}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          aria-label={rest['aria-label'] ?? ariaLabel ?? label}
          aria-invalid={error}
          aria-describedby={describedBy}
          onChange={handleChange}
          style={{ resize, ...style }}
        />
      </Field>
    );
  },
);

Textarea.displayName = 'Textarea';
