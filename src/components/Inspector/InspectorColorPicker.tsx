'use client';

import React from 'react';
import { ColorPicker } from '../ColorPicker/ColorPicker';
import './Inspector.css';

/** Props owned by InspectorColorPicker itself — everything else falls through to the wrapper. */
type InspectorColorPickerOwnProps = {
  /** The setting's name, drawn inside the bar on the left. Also the start of the trigger's accessible name. */
  label: string;
  /** Current colour as a hex string — 3, 6 or 8 digit, with or without `#`. */
  value?: string;
  /** Initial colour for uncontrolled use. */
  defaultValue?: string;
  /**
   * Called with the colour as an uppercase hex string (`#RRGGBB`, or
   * `#RRGGBBAA` when `showAlpha` and alpha is below 100%). Fires live while
   * dragging, as in ColorPicker.
   */
  onValueChange?: (value: string) => void;
  /** Add an alpha (opacity) slider to the panel and emit 8-digit hex when alpha is below 100%. */
  showAlpha?: boolean;
  /** When set, a hidden input carries the current hex under this name, so the picker joins native form submission. */
  name?: string;
  /** Whether the picker is disabled. */
  disabled?: boolean;
  /** Component size, matching Button: `default` is 40px tall, `compact` 32px. */
  size?: 'default' | 'compact';
  /** Additional CSS classes, applied to the wrapper. */
  className?: string;
};

export interface InspectorColorPickerProps
  extends InspectorColorPickerOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof InspectorColorPickerOwnProps | 'onChange' | 'defaultValue'> {}

/**
 * A one-row colour setting for inspector panels: the name on the left, the
 * hex reading and a round swatch at the bar's end. It is the library
 * ColorPicker with its trigger dressed as an inspector bar, so the panel,
 * its saturation area, hue and alpha sliders and hex field are
 * ColorPicker's own. The form counterpart, with a label above and helper
 * text below, is ColorPicker itself.
 *
 * The whole bar is the trigger: the name is an overlay that lets clicks
 * through, and the trigger is named by the name followed by the hex reading
 * ("Tint colour #163300"). Forwards a ref to the wrapper and spreads
 * unrecognised props onto it.
 */
export const InspectorColorPicker = React.forwardRef<HTMLDivElement, InspectorColorPickerProps>(
  (
    {
      label,
      value,
      defaultValue,
      onValueChange,
      showAlpha = false,
      name,
      disabled = false,
      size = 'default',
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseId = React.useId();
    const labelId = `${baseId}-label`;
    const triggerId = `${baseId}-trigger`;

    const classes = [
      'ds-inspector-color-picker',
      size === 'compact' ? 'ds-inspector-color-picker--compact' : '',
      disabled ? 'ds-inspector-color-picker--disabled' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div {...rest} ref={ref} className={classes}>
        <span id={labelId} className="ds-inspector-color-picker__label" aria-hidden="true">
          {label}
        </span>
        <ColorPicker
          id={triggerId}
          aria-labelledby={`${labelId} ${triggerId}-value`}
          size={size}
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          showAlpha={showAlpha}
          showText
          name={name}
          disabled={disabled}
        />
      </div>
    );
  },
);

InspectorColorPicker.displayName = 'InspectorColorPicker';
