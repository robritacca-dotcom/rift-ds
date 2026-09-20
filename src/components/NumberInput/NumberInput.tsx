'use client';

import React, { useState } from 'react';
import { Field } from '../Field/Field';
import './NumberInput.css';
import '../../fonts/material-symbols.css';

/** Props owned by NumberInput itself — everything else falls through to the <input>. */
type NumberInputOwnProps = {
  /** Input label text */
  label?: string;
  /** Current value (controlled). Pass an empty string for an empty field */
  value?: number | '';
  /** Initial value (uncontrolled) */
  defaultValue?: number;
  /** Minimum allowed value — steppers stop here, and typed values clamp to it on blur */
  min?: number;
  /** Maximum allowed value — steppers stop here, and typed values clamp to it on blur */
  max?: number;
  /** Amount each stepper click (or arrow key) changes the value by */
  step?: number;
  /** Component size (not the native character-width `size` attribute) */
  size?: 'default' | 'compact';
  /** Error state — shows error styling and message */
  error?: boolean;
  /** Helper or error message displayed below the input */
  helperText?: string;
  /**
   * Convenience callback receiving the numeric value directly — `null` when
   * the field is empty or unparseable. Fires on typing alongside `onChange`
   * (which keeps the standard React event signature so form libraries work
   * unmodified) and also on stepper clicks, where no native change event exists.
   */
  onValueChange?: (value: number | null) => void;
  /** Additional CSS classes — applied to the wrapper, not the <input> */
  className?: string;
};

export interface NumberInputProps
  extends NumberInputOwnProps,
    Omit<React.ComponentPropsWithoutRef<'input'>, keyof NumberInputOwnProps | 'type'> {}

const parseValue = (raw: number | string | ''): number | null => {
  if (raw === '' || raw === undefined) return null;
  const parsed = typeof raw === 'number' ? raw : parseFloat(raw);
  return Number.isNaN(parsed) ? null : parsed;
};

const decimalsOf = (value: number): number => {
  const text = String(value);
  const dot = text.indexOf('.');
  return dot === -1 ? 0 : text.length - dot - 1;
};

/**
 * Numeric field with increment and decrement steppers and min/max clamping.
 *
 * The native spinners are hidden and replaced by stepper buttons that clamp to
 * `min`/`max` and disable at the bounds; a typed out-of-range value clamps into
 * range on blur. Forwards a ref to the underlying `<input>` and spreads
 * unrecognised props onto it, so `inputMode`, `data-*` and form-library
 * registration all work.
 */
export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      label,
      value,
      defaultValue,
      min,
      max,
      step = 1,
      size = 'default',
      disabled = false,
      required = false,
      error = false,
      helperText,
      onChange,
      onValueChange,
      onBlur,
      className = '',
      name,
      id,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-numberinput';
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<string>(
      defaultValue !== undefined ? String(defaultValue) : '',
    );
    const currentValue = isControlled ? value : internalValue;
    const currentNumber = parseValue(currentValue);

    const classes = [
      baseClass,
      size === 'compact' ? `${baseClass}--compact` : '',
      error ? `${baseClass}--error` : '',
      disabled ? `${baseClass}--disabled` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const clamp = (candidate: number): number => {
      if (min !== undefined && candidate < min) return min;
      if (max !== undefined && candidate > max) return max;
      return candidate;
    };

    const commit = (next: number) => {
      if (!isControlled) setInternalValue(String(next));
      onValueChange?.(next);
    };

    const stepBy = (direction: 1 | -1) => {
      const base = currentNumber ?? 0;
      const precision = Math.max(decimalsOf(base), decimalsOf(step));
      commit(clamp(Number((base + direction * step).toFixed(precision))));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setInternalValue(e.target.value);
      onChange?.(e);
      onValueChange?.(parseValue(e.target.value));
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const typed = parseValue(e.target.value);
      if (typed !== null) {
        const clamped = clamp(typed);
        if (clamped !== typed) commit(clamped);
      }
      onBlur?.(e);
    };

    const atMin = min !== undefined && currentNumber !== null && currentNumber <= min;
    const atMax = max !== undefined && currentNumber !== null && currentNumber >= max;

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
        <div className={`${baseClass}__shell`}>
          <button
            type="button"
            className={`${baseClass}__stepper`}
            aria-label="Decrease value"
            disabled={disabled || atMin}
            onClick={() => stepBy(-1)}
          >
            <span className="material-symbols-rounded" aria-hidden="true">
              remove
            </span>
          </button>
          <input
            {...rest}
            ref={ref}
            className={`${baseClass}__input`}
            type="number"
            id={inputId}
            name={name}
            value={currentValue}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            required={required}
            aria-label={rest['aria-label'] || label}
            aria-invalid={error}
            aria-describedby={describedBy}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <button
            type="button"
            className={`${baseClass}__stepper`}
            aria-label="Increase value"
            disabled={disabled || atMax}
            onClick={() => stepBy(1)}
          >
            <span className="material-symbols-rounded" aria-hidden="true">
              add
            </span>
          </button>
        </div>
      </Field>
    );
  },
);

NumberInput.displayName = 'NumberInput';
