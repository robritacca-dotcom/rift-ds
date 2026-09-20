'use client';

import React from 'react';
import './Slider.css';

/** Props owned by Slider itself — everything else falls through to the <input type="range">. */
type SliderOwnProps = {
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
      value = 50,
      min = 0,
      max = 100,
      step = 1,
      disabled = false,
      size = 'default',
      onChange,
      onValueChange,
      ariaLabel = 'Slider',
      className = '',
      style,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-slider';
    const classes = [
      baseClass,
      `${baseClass}--${size}`,
      disabled ? `${baseClass}--disabled` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const percentage = ((value - min) / (max - min)) * 100;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onValueChange?.(Number(e.target.value));
    };

    return (
      <div className={classes}>
        <input
          {...rest}
          ref={ref}
          type="range"
          className={`${baseClass}__input`}
          value={value}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={handleChange}
          aria-label={ariaLabel || rest['aria-label']}
          style={{
            background: `linear-gradient(to right, var(--color-action-primary-bg) ${percentage}%, var(--color-bg-container-tertiary) ${percentage}%)`,
            ...style,
          }}
        />
      </div>
    );
  },
);

Slider.displayName = 'Slider';
