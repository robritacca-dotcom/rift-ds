'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Field } from '../Field/Field';
import './RichDropdown.css';
import '../../fonts/material-symbols.css';

export interface RichDropdownOption {
  /** Display name of the option, rendered in its own heading face. */
  label: string;
  /** Stable identifier reported through `onValueChange`. */
  value: string;
  /**
   * CSS font-family stack this option's headings use — the option name
   * renders in it. Falls back to the theme's heading face when omitted.
   */
  headingFont?: string;
  /**
   * CSS font-family stack this option's body text uses — the detail line
   * renders in it. Falls back to the theme's body face when omitted.
   */
  bodyFont?: string;
  /** Key colour shown as the option's swatch dot — any valid CSS colour. */
  color?: string;
  /**
   * Corner radius for the swatch, so the dot can carry the option's corner
   * language too — a sharp-cornered look gets a square swatch. Any CSS
   * radius value (`'0px'`, `'4px'`); the default is a full circle.
   */
  swatchRadius?: string;
  /** One-line supporting text, typically the font pairing's names. */
  description?: string;
  /** Whether this option can be chosen. */
  disabled?: boolean;
}

/** Props owned by RichDropdown itself — everything else falls through to the wrapper. */
type RichDropdownOwnProps = {
  /** Field label text */
  label?: string;
  /** Placeholder when no value selected */
  placeholder?: string;
  /** Selected option value for controlled use. Pair with `onValueChange`. */
  value?: string;
  /** Initially selected option value for uncontrolled use. */
  defaultValue?: string;
  /** The options on offer, in display order. */
  options: RichDropdownOption[];
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Whether the picker is required */
  required?: boolean;
  /** Error state */
  error?: boolean;
  /** Helper or error message */
  helperText?: string;
  /** Fires with the newly selected option's value. */
  onValueChange?: (value: string) => void;
  /** Additional CSS classes */
  className?: string;
  /**
   * Used only as a fallback for deriving the element id (`id || name || label`).
   *
   * Note: RichDropdown renders a `<div role="combobox">`, not a native
   * `<select>`, so `name` does **not** make it participate in native form
   * submission.
   */
  name?: string;
};

export interface RichDropdownProps
  extends RichDropdownOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof RichDropdownOwnProps> {}

const baseClass = 'ds-rich-dropdown';

/** The per-option fonts and colour are runtime data, not theme — they reach
    the stylesheet through custom properties, never inline declarations. */
const cellStyle = (option: RichDropdownOption): React.CSSProperties => {
  const style: Record<string, string> = {};
  if (option.headingFont) style['--ds-rich-dropdown-heading-font'] = option.headingFont;
  if (option.bodyFont) style['--ds-rich-dropdown-body-font'] = option.bodyFont;
  if (option.color) style['--ds-rich-dropdown-color'] = option.color;
  if (option.swatchRadius) style['--ds-rich-dropdown-swatch-radius'] = option.swatchRadius;
  return style as React.CSSProperties;
};

/** One rich cell — the same anatomy fills the options and the closed trigger. */
const OptionCell = ({ option }: { option: RichDropdownOption }) => (
  <span className={`${baseClass}__cell`} style={cellStyle(option)}>
    {option.color && <span className={`${baseClass}__swatch`} aria-hidden="true" />}
    <span className={`${baseClass}__text`}>
      <span className={`${baseClass}__name`}>{option.label}</span>
      {option.description && (
        <span className={`${baseClass}__detail`}>{option.description}</span>
      )}
    </span>
  </span>
);

/**
 * Dropdown's rich sibling: a select where every option is a self-portrait —
 * the name set in the option's own heading face, a detail line in its body
 * face, and a dot of its key colour. The closed trigger shows the selected
 * option the same way. Built for theme and style presets, brand kits —
 * anywhere the look being chosen can preview itself. When the label alone
 * is enough (even in its own face), use Dropdown and its per-option `font`.
 *
 * Same combobox + listbox pattern as Dropdown, with full keyboard
 * navigation. Forwards a ref to the wrapping element and spreads
 * unrecognised props onto it.
 */
export const RichDropdown = React.forwardRef<HTMLDivElement, RichDropdownProps>(
  (
    {
      label,
      placeholder = 'Select an option',
      value,
      defaultValue,
      options,
      disabled = false,
      required = false,
      error = false,
      helperText,
      onValueChange,
      className = '',
      name,
      id,
      ...rest
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const isControlled = value !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
    const currentValue = isControlled ? value : uncontrolledValue;

    /** Keep the internal ref (used for click-outside) while honouring a forwarded one. */
    const setRootRef = (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    const classes = [
      baseClass,
      isOpen ? `${baseClass}--open` : '',
      error ? `${baseClass}--error` : '',
      disabled ? `${baseClass}--disabled` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const selectedOption = options.find((opt) => opt.value === currentValue);
    const inputId = id || name || label?.toLowerCase().replace(/\s+/g, '-');

    const handleToggle = () => {
      if (!disabled) {
        setIsOpen((prev) => !prev);
        setFocusedIndex(-1);
      }
    };

    const handleSelect = (optionValue: string) => {
      if (!isControlled) setUncontrolledValue(optionValue);
      onValueChange?.(optionValue);
      setIsOpen(false);
    };

    const handleClickOutside = useCallback((e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }, []);

    useEffect(() => {
      if (!isOpen) return;
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, handleClickOutside]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (isOpen && focusedIndex >= 0 && !options[focusedIndex]?.disabled) {
            handleSelect(options[focusedIndex].value);
          } else {
            setIsOpen((prev) => !prev);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setFocusedIndex((prev) => {
              let next = prev + 1;
              while (next < options.length && options[next].disabled) next++;
              return next < options.length ? next : prev;
            });
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (isOpen) {
            setFocusedIndex((prev) => {
              let next = prev - 1;
              while (next >= 0 && options[next].disabled) next--;
              return next >= 0 ? next : prev;
            });
          }
          break;
        case 'Home':
          if (isOpen) {
            e.preventDefault();
            const first = options.findIndex((opt) => !opt.disabled);
            if (first >= 0) setFocusedIndex(first);
          }
          break;
        case 'End':
          if (isOpen) {
            e.preventDefault();
            let last = options.length - 1;
            while (last >= 0 && options[last].disabled) last--;
            if (last >= 0) setFocusedIndex(last);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          break;
        case 'Tab':
          setIsOpen(false);
          break;
      }
    };

    useEffect(() => {
      if (isOpen && focusedIndex >= 0 && listRef.current) {
        const focusedEl = document.getElementById(`${inputId}-option-${focusedIndex}`);
        focusedEl?.scrollIntoView({ block: 'nearest' });
      }
    }, [focusedIndex, isOpen, inputId]);

    const activeOptionId =
      isOpen && focusedIndex >= 0 && options[focusedIndex]
        ? `${inputId}-option-${focusedIndex}`
        : undefined;

    return (
      <Field
        {...rest}
        className={classes}
        ref={setRootRef}
        label={label}
        helperText={helperText}
        error={error}
        required={required}
        disabled={disabled}
        id={inputId}
      >
        <div
          className={`${baseClass}__trigger`}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          // A div is not a labelable element, so Field's htmlFor cannot reach
          // it — point at the label's id instead (Field renders `${id}-label`).
          aria-labelledby={label ? `${inputId}-label` : undefined}
          aria-label={rest['aria-label'] || (!label ? placeholder : undefined)}
          aria-controls={isOpen ? `${inputId}-listbox` : undefined}
          aria-activedescendant={activeOptionId}
          aria-describedby={helperText ? `${inputId}-helper` : rest['aria-describedby']}
          aria-invalid={error || undefined}
          tabIndex={disabled ? -1 : 0}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
        >
          {selectedOption ? (
            <OptionCell option={selectedOption} />
          ) : (
            <span className={`${baseClass}__placeholder`}>{placeholder}</span>
          )}
          <span className={`${baseClass}__chevron material-symbols-rounded`} aria-hidden="true">
            expand_more
          </span>
        </div>
        {isOpen && (
          <ul
            className={`${baseClass}__menu`}
            role="listbox"
            id={`${inputId}-listbox`}
            ref={listRef}
            aria-labelledby={label ? `${inputId}-label` : undefined}
          >
            {options.map((option, index) => (
              <li
                key={option.value}
                id={`${inputId}-option-${index}`}
                className={[
                  `${baseClass}__option`,
                  option.value === currentValue ? `${baseClass}__option--selected` : '',
                  option.disabled ? `${baseClass}__option--disabled` : '',
                  index === focusedIndex ? `${baseClass}__option--focused` : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                role="option"
                aria-selected={option.value === currentValue}
                aria-disabled={option.disabled}
                onClick={() => !option.disabled && handleSelect(option.value)}
              >
                <OptionCell option={option} />
                {option.value === currentValue && (
                  <span
                    className={`${baseClass}__check material-symbols-rounded`}
                    aria-hidden="true"
                  >
                    check
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Field>
    );
  },
);

RichDropdown.displayName = 'RichDropdown';
