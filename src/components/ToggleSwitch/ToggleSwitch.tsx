'use client';

import React from 'react';
import './ToggleSwitch.css';
import '../../fonts/material-symbols.css';

/** Props owned by ToggleSwitch itself — everything else falls through to the <button>. */
type ToggleSwitchOwnProps = {
  /** Whether the toggle is on (checked) */
  checked?: boolean;
  /** Label text displayed next to the toggle */
  label?: string;
  /** Whether to show the label */
  showLabel?: boolean;
  /** Component size */
  size?: 'default' | 'compact';
  /** Called with the next checked state when toggled */
  onCheckedChange?: (checked: boolean) => void;
  /** Additional CSS classes */
  className?: string;
  /**
   * Legacy change handler, kept for backwards compatibility.
   *
   * @deprecated Use `onCheckedChange` instead.
   */
  onChange?: (checked: boolean) => void;
  /**
   * Legacy accessible-name prop.
   *
   * @deprecated Pass the native `aria-label` attribute instead.
   */
  ariaLabel?: string;
};

export interface ToggleSwitchProps
  extends ToggleSwitchOwnProps,
    Omit<React.ComponentPropsWithoutRef<'button'>, keyof ToggleSwitchOwnProps | 'type'> {}

/**
 * ToggleSwitch component from Figma design system.
 * Used for binary on/off settings like theme switching.
 *
 * Renders a `<button role="switch">`, forwards a ref to it, and spreads
 * unrecognised props onto it.
 */
export const ToggleSwitch = React.forwardRef<HTMLButtonElement, ToggleSwitchProps>(
  (
    {
      checked = true,
      label = 'Toggle',
      showLabel = true,
      disabled = false,
      size = 'default',
      onCheckedChange,
      onChange,
      onClick,
      className = '',
      ariaLabel,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-toggle-switch';
    const classes = [
      baseClass,
      size === 'compact' ? `${baseClass}--compact` : '',
      checked ? '' : `${baseClass}--off`,
      disabled ? `${baseClass}--disabled` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (disabled) return;
      onCheckedChange?.(!checked);
      onChange?.(!checked);
    };

    return (
      <button
        {...rest}
        ref={ref}
        type="button"
        className={classes}
        onClick={handleClick}
        disabled={disabled}
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel || rest['aria-label'] || label}
      >
        <div className={`${baseClass}__track`}>
          <div className={`${baseClass}__thumb`}>
            <span
              className={`${baseClass}__thumb-icon material-symbols-rounded`}
              aria-hidden="true"
            >
              check
            </span>
          </div>
        </div>
        {showLabel && <span className={`${baseClass}__label`}>{label}</span>}
      </button>
    );
  },
);

ToggleSwitch.displayName = 'ToggleSwitch';
