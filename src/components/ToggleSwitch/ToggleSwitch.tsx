'use client';

import React, { useId, useState } from 'react';
import { CheckIcon } from '../Checkbox/Checkbox';
import './ToggleSwitch.css';
import '../../behaviors/direction.css';

/** Props owned by ToggleSwitch itself — everything else falls through to the <button>. */
type ToggleSwitchOwnProps = {
  /**
   * Whether the toggle is on, controlled. Leave undefined to let the switch
   * keep its own state, seeded from `defaultChecked`.
   */
  checked?: boolean;
  /** Whether the toggle starts on when uncontrolled (`checked` undefined). Defaults to true, so an uncontrolled switch starts on unless this is false. */
  defaultChecked?: boolean;
  /** Label text displayed next to the toggle */
  label?: string;
  /** Whether to show the label */
  showLabel?: boolean;
  /** Helper or error message rendered under the label text */
  helperText?: string;
  /** Error state — recolours the helper text and marks the switch invalid */
  error?: boolean;
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
      checked: checkedProp,
      defaultChecked = true,
      label = 'Toggle',
      showLabel = true,
      helperText,
      error = false,
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
    const [internalChecked, setInternalChecked] = useState(defaultChecked);
    const isControlled = checkedProp !== undefined;
    const checked = isControlled ? checkedProp : internalChecked;
    const generatedId = useId();
    const helperId = helperText ? `${generatedId}-helper` : undefined;
    const describedBy = helperId ?? rest['aria-describedby'];
    const classes = [
      baseClass,
      size === 'compact' ? `${baseClass}--compact` : '',
      checked ? '' : `${baseClass}--off`,
      disabled ? `${baseClass}--disabled` : '',
      helperText ? `${baseClass}--has-helper` : '',
      error ? `${baseClass}--error` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (disabled) return;
      if (!isControlled) setInternalChecked(!checked);
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
        aria-label={rest['aria-label'] || ariaLabel || label}
        aria-describedby={describedBy}
        aria-invalid={error || undefined}
      >
        <SwitchIndicator checked={checked} size={size} />
        {/* Without a helper the label stays a bare span, so existing markup
            (and layout) is untouched; with one, label and helper stack in a
            text column beside the track. */}
        {helperText ? (
          <span className={`${baseClass}__text`}>
            {showLabel && <span className={`${baseClass}__label`}>{label}</span>}
            <span className={`${baseClass}__helper`} id={helperId}>
              {helperText}
            </span>
          </span>
        ) : (
          showLabel && <span className={`${baseClass}__label`}>{label}</span>
        )}
      </button>
    );
  },
);

ToggleSwitch.displayName = 'ToggleSwitch';

/* ============================================
   SWITCH INDICATOR — the track on its own
   ============================================ */

/** Props owned by SwitchIndicator itself — everything else falls through to the <span>. */
type SwitchIndicatorOwnProps = {
  /** Whether the switch is on. */
  checked?: boolean;
  /** Track size: `default` is 42×24px, `compact` 34×20px. */
  size?: 'default' | 'compact';
  /** Additional CSS classes */
  className?: string;
};

export interface SwitchIndicatorProps
  extends SwitchIndicatorOwnProps,
    Omit<React.ComponentPropsWithoutRef<'span'>, keyof SwitchIndicatorOwnProps | 'children'> {}

/**
 * The switch's track and thumb, as a presentational piece for a host that
 * is itself the control: InspectorToggleSwitch's bar and SelectionCard's
 * toggle mode draw it, so a switch looks and moves the same wherever it
 * appears. Hidden from assistive technology; the host carries
 * `role="switch"` and the state.
 */
export const SwitchIndicator = React.forwardRef<HTMLSpanElement, SwitchIndicatorProps>(
  ({ checked = false, size = 'default', className = '', ...rest }, ref) => {
    const base = 'ds-toggle-switch__track';
    const classes = [
      base,
      checked ? '' : `${base}--off`,
      size === 'compact' ? `${base}--compact` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <span aria-hidden="true" {...rest} ref={ref} className={classes}>
        <span className="ds-toggle-switch__thumb">
          <CheckIcon className="ds-toggle-switch__thumb-icon" />
        </span>
      </span>
    );
  },
);

SwitchIndicator.displayName = 'SwitchIndicator';
