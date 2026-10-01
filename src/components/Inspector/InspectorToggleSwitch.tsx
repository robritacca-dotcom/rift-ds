'use client';

import React from 'react';
import './Inspector.css';

/** Props owned by InspectorToggleSwitch itself — everything else falls through to the <input type="checkbox">. */
type InspectorToggleSwitchOwnProps = {
  /** The setting's name, drawn inside the bar on the left. Also the switch's accessible name. */
  label: string;
  /** Component size, matching Button: `default` is 40px tall, `compact` 32px (not the native character-width `size` attribute). */
  size?: 'default' | 'compact';
  /**
   * Convenience callback receiving the checked state directly.
   * Fires alongside `onChange`, which keeps the standard React event signature.
   */
  onCheckedChange?: (checked: boolean) => void;
  /** Additional CSS classes, applied to the bar rather than the <input>. */
  className?: string;
};

export interface InspectorToggleSwitchProps
  extends InspectorToggleSwitchOwnProps,
    Omit<React.ComponentPropsWithoutRef<'input'>, keyof InspectorToggleSwitchOwnProps | 'type'> {}

/**
 * A one-row switch for inspector panels: the whole bar is the switch, with
 * the name on the left and a small track on the right. The form
 * counterpart, a standalone switch with its label beside it, is
 * ToggleSwitch.
 *
 * A native checkbox with `role="switch"` covers the bar, and the paint
 * reads its `:checked` state, so `checked` and `defaultChecked` both work.
 * Forwards a ref to that input and spreads unrecognised props onto it.
 */
export const InspectorToggleSwitch = React.forwardRef<
  HTMLInputElement,
  InspectorToggleSwitchProps
>(
  (
    {
      label,
      size = 'default',
      disabled = false,
      onChange,
      onCheckedChange,
      className = '',
      id,
      ...rest
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    const classes = [
      'ds-inspector-bar',
      'ds-inspector-toggle-switch',
      size === 'compact' ? 'ds-inspector-bar--compact' : '',
      disabled ? 'ds-inspector-bar--disabled' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    return (
      <div className={classes}>
        <label htmlFor={inputId} className="ds-inspector-bar__label">
          {label}
        </label>
        <span className="ds-inspector-toggle-switch__track" aria-hidden="true">
          <span className="ds-inspector-toggle-switch__knob" />
        </span>
        <input
          {...rest}
          ref={ref}
          id={inputId}
          className="ds-inspector-bar__native"
          type="checkbox"
          role="switch"
          disabled={disabled}
          onChange={handleChange}
        />
      </div>
    );
  },
);

InspectorToggleSwitch.displayName = 'InspectorToggleSwitch';
