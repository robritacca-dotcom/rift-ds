'use client';

import React, { useLayoutEffect, useRef, useState } from 'react';
import {
  Dropdown,
  type DropdownOption,
  type DropdownOptionGroup,
} from '../Dropdown/Dropdown';
import './Inspector.css';

/** Props owned by InspectorDropdown itself — everything else falls through to the wrapper. */
type InspectorDropdownOwnProps = {
  /** The setting's name, drawn inside the bar on the left. Also the dropdown's accessible name. */
  label: string;
  /** Currently selected value. */
  value?: string;
  /** Available options (flat list). Each option's `font` previews the face, as in Dropdown. */
  options: DropdownOption[];
  /** Optional grouped options. When provided, renders groups with labels and separators. */
  groups?: DropdownOptionGroup[];
  /** Shown on the right when nothing is selected. */
  placeholder?: string;
  /** Whether the dropdown is disabled. */
  disabled?: boolean;
  /** Component size, matching Button: `default` is 40px tall, `compact` 32px. */
  size?: 'default' | 'compact';
  /** Called with the newly selected value. */
  onValueChange?: (value: string) => void;
  /** Additional CSS classes, applied to the wrapper. */
  className?: string;
};

export interface InspectorDropdownProps
  extends InspectorDropdownOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof InspectorDropdownOwnProps | 'onChange'> {}

/**
 * A one-row select for inspector panels: the name on the left, the chosen
 * option and a chevron on the right. It is the library Dropdown with its
 * trigger dressed as an inspector bar, so the menu, its keyboard model and
 * its per-option font previews are Dropdown's own. The form counterpart,
 * with a label above, is Dropdown itself.
 *
 * The name is an overlay the trigger reserves room for. It is measured,
 * since names differ in width and a web font can change one after load,
 * and it lets clicks through, so the whole bar opens the menu. Forwards a
 * ref to the wrapper and spreads unrecognised props onto it.
 */
export const InspectorDropdown = React.forwardRef<HTMLDivElement, InspectorDropdownProps>(
  (
    {
      label,
      value,
      options,
      groups,
      placeholder,
      disabled = false,
      size = 'default',
      onValueChange,
      className = '',
      style,
      ...rest
    },
    ref,
  ) => {
    /* Dropdown derives its element ids from `id || name || label`, and this
       wrapper passes it none of those, so it gets a generated one: without
       it two inspector dropdowns on a page would share option ids. */
    const dropdownId = React.useId();
    const labelRef = useRef<HTMLSpanElement>(null);
    const [labelWidth, setLabelWidth] = useState(0);

    useLayoutEffect(() => {
      const node = labelRef.current;
      if (!node) return;
      const measure = () => setLabelWidth(node.offsetWidth);
      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(node);
      return () => observer.disconnect();
    }, []);

    const classes = [
      'ds-inspector-dropdown',
      size === 'compact' ? 'ds-inspector-dropdown--compact' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        {...rest}
        ref={ref}
        className={classes}
        style={
          { ...style, '--ds-inspector-label-width': `${labelWidth}px` } as React.CSSProperties
        }
      >
        <span ref={labelRef} className="ds-inspector-dropdown__label" aria-hidden="true">
          {label}
        </span>
        <Dropdown
          id={dropdownId}
          aria-label={label}
          size={size}
          value={value}
          options={options}
          groups={groups}
          placeholder={placeholder}
          disabled={disabled}
          onValueChange={onValueChange}
        />
      </div>
    );
  },
);

InspectorDropdown.displayName = 'InspectorDropdown';
