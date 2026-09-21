'use client';

import React, { useId } from 'react';
import { Field } from '../Field/Field';
import './Slider.css';

/** Props owned by Slider itself — everything else falls through to the <input type="range">. */
type SliderOwnProps = {
  /** Label text rendered above the slider */
  label?: string;
  /** Helper or error message rendered below the slider */
  helperText?: string;
  /** Error state — recolours the helper text and marks the slider invalid */
  error?: boolean;
  /** Marks the slider required and renders the required marker on its label */
  required?: boolean;
  /** Shows the current value opposite the helper line */
  showValue?: boolean;
  /** Current value */
  value?: number;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment */
  step?: number;
  /** Component size (not the native character-width `size` attribute) */
  size?: 'default' | 'compact';
  /**
   * Convenience callback receiving the numeric value directly.
   * Fires alongside `onChange`, which keeps the standard React event signature
   * so form libraries work unmodified.
   */
  onValueChange?: (value: number) => void;
  /** Additional CSS classes — applied to the wrapper, not the <input> */
  className?: string;
  /**
   * Legacy accessible-name prop.
   *
   * @deprecated Pass the native `aria-label` attribute instead.
   */
  ariaLabel?: string;
};

export interface SliderProps
  extends SliderOwnProps,
    Omit<React.ComponentPropsWithoutRef<'input'>, keyof SliderOwnProps | 'type'> {}

/**
 * Slider allows selecting a value from within a given range.
 *
 * Forwards a ref to the underlying `<input type="range">` and spreads
 * unrecognised props onto it.
 */
export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      label,
      helperText,
      error = false,
      required = false,
      showValue = false,
      value = 50,
      min = 0,
      max = 100,
      step = 1,
      disabled = false,
      size = 'default',
      onChange,
      onValueChange,
      ariaLabel,
      className = '',
      style,
      id,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-slider';
    /* The scaffolding stacks label / track / helper, so the root leaves its
       bare flex row only when any of them is present — a bare slider's
       markup is untouched. */
    const fielded = Boolean(label || helperText || showValue);
    const classes = [
      baseClass,
      `${baseClass}--${size}`,
      disabled ? `${baseClass}--disabled` : '',
      fielded ? `${baseClass}--fielded` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const generatedId = useId();
    const inputId = id || generatedId;
    const describedBy = helperText ? `${inputId}-helper` : rest['aria-describedby'];

    const percentage = ((value - min) / (max - min)) * 100;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onValueChange?.(Number(e.target.value));
    };

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
        aside={showValue ? <span className={`${baseClass}__value`}>{value}</span> : undefined}
      >
        <input
          {...rest}
          ref={ref}
          type="range"
          className={`${baseClass}__input`}
          id={inputId}
          value={value}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={handleChange}
          /* With a visible label the <label htmlFor> owns the name — an
             aria-label would override it. Without one, the native attribute
             wins over the deprecated prop (whose old 'Slider' default made
             the native attribute unreachable), with 'Slider' as the final
             fallback so an unlabelled slider is never nameless. */
          aria-label={label ? undefined : rest['aria-label'] || ariaLabel || 'Slider'}
          aria-describedby={describedBy}
          aria-invalid={error || undefined}
          style={{
            background: `linear-gradient(to right, var(--color-action-primary-bg) ${percentage}%, var(--color-bg-container-tertiary) ${percentage}%)`,
            ...style,
          }}
        />
      </Field>
    );
  },
);

Slider.displayName = 'Slider';
