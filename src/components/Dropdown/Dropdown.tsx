'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Field } from '../Field/Field';
import './Dropdown.css';
import '../../fonts/material-symbols.css';

export interface DropdownOption {
  /** Display label */
  label: string;
  /** Option value */
  value: string;
  /**
   * CSS font-family stack to render this option's label in, so a typeface
   * can preview itself in a font picker. Applies to the option row and to
   * the closed trigger while the option is selected; omitted, the label
   * keeps the theme's own face.
   */
  font?: string;
  /**
   * Material Symbol drawn before the label, in the option row and on the
   * closed trigger while the option is selected.
   */
  icon?: string;
  /** Whether this option is disabled */
  disabled?: boolean;
}

export interface DropdownOptionGroup {
  /** Group heading */
  label: string;
  /** Options within the group */
  options: DropdownOption[];
}

/** Props owned by Dropdown itself — everything else falls through to the wrapper. */
type DropdownOwnProps = {
  /** Dropdown label text */
  label?: string;
  /** Placeholder when no value selected */
  placeholder?: string;
  /** Currently selected value */
  value?: string;
  /** Available options (flat list) */
  options: DropdownOption[];
  /** Optional grouped options — when provided, renders groups with labels and separators */
  groups?: DropdownOptionGroup[];
  /** Component size */
  size?: 'default' | 'compact';
  /** Whether the dropdown is disabled */
  disabled?: boolean;
  /** Whether the dropdown is required */
  required?: boolean;
  /** Error state */
  error?: boolean;
  /** Helper or error message */
  helperText?: string;
  /** Called with the newly selected value */
  onValueChange?: (value: string) => void;
  /** Additional CSS classes */
  className?: string;
  /**
   * Legacy change handler, kept for backwards compatibility.
   *
   * @deprecated Use `onValueChange` instead.
   */
  onChange?: (value: string) => void;
  /**
   * Legacy accessible-name prop.
   *
   * @deprecated Pass the native `aria-label` attribute instead.
   */
  ariaLabel?: string;
  /**
   * Used only as a fallback for deriving the element id (`id || name || label`).
   *
   * Note: Dropdown renders a `<div role="combobox">`, not a native `<select>`,
   * so `name` does **not** make it participate in native form submission.
   */
  name?: string;
};

export interface DropdownProps
  extends DropdownOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof DropdownOwnProps> {}

/** An option's preview face is runtime data, not theme — it reaches the
    stylesheet through a custom property, never an inline declaration. */
const fontStyle = (font?: string) =>
  font ? ({ '--ds-dropdown-font': font } as React.CSSProperties) : undefined;

/**
 * Static single-select dropdown. Renders a `<div role="combobox">` paired with a
 * `role="listbox"` menu; supports flat and grouped options with full keyboard
 * navigation.
 *
 * Forwards a ref to the wrapping element and spreads unrecognised props onto it.
 */
export const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>(
  (
    {
      label,
      placeholder = 'Select an option',
      value,
      options,
      groups,
      size = 'default',
      disabled = false,
      required = false,
      error = false,
      helperText,
      onValueChange,
      onChange,
      className = '',
      ariaLabel,
      name,
      id,
      ...rest
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const listRef = useRef<HTMLUListElement>(null);

    /** Keep the internal ref (used for click-outside) while honouring a forwarded one. */
    const setRootRef = (node: HTMLDivElement | null) => {
      dropdownRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    const baseClass = 'ds-dropdown';
    const isGrouped = groups && groups.length > 0;

    const classes = [
      baseClass,
      size === 'compact' ? `${baseClass}--compact` : '',
      isOpen ? `${baseClass}--open` : '',
      error ? `${baseClass}--error` : '',
      disabled ? `${baseClass}--disabled` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // Flatten all options for keyboard navigation (groups or flat)
    const flatOptions: DropdownOption[] = isGrouped ? groups.flatMap((g) => g.options) : options;

    const selectedOption = flatOptions.find((opt) => opt.value === value);
    const inputId = id || name || label?.toLowerCase().replace(/\s+/g, '-');

    const handleToggle = () => {
      if (!disabled) {
        setIsOpen((prev) => !prev);
        setFocusedIndex(-1);
      }
    };

    const handleSelect = (optionValue: string) => {
      onValueChange?.(optionValue);
      onChange?.(optionValue);
      setIsOpen(false);
    };

    const handleClickOutside = useCallback((e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
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
          if (isOpen && focusedIndex >= 0 && !flatOptions[focusedIndex]?.disabled) {
            handleSelect(flatOptions[focusedIndex].value);
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
              while (next < flatOptions.length && flatOptions[next].disabled) next++;
              return next < flatOptions.length ? next : prev;
            });
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (isOpen) {
            setFocusedIndex((prev) => {
              let next = prev - 1;
              while (next >= 0 && flatOptions[next].disabled) next--;
              return next >= 0 ? next : prev;
            });
          }
          break;
        case 'Home':
          if (isOpen) {
            e.preventDefault();
            const first = flatOptions.findIndex((opt) => !opt.disabled);
            if (first >= 0) setFocusedIndex(first);
          }
          break;
        case 'End':
          if (isOpen) {
            e.preventDefault();
            let last = flatOptions.length - 1;
            while (last >= 0 && flatOptions[last].disabled) last--;
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
      // Look the option up by id — in the grouped variant the list's direct
      // children are group lis, so children[focusedIndex] is the wrong element.
      if (isOpen && focusedIndex >= 0 && listRef.current) {
        const focusedEl = document.getElementById(`${inputId}-option-${focusedIndex}`);
        focusedEl?.scrollIntoView({ block: 'nearest' });
      }
    }, [focusedIndex, isOpen, inputId]);

    const activeOptionId =
      isOpen && focusedIndex >= 0 && flatOptions[focusedIndex]
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
        size={size}
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
          aria-label={ariaLabel || rest['aria-label'] || (!label ? placeholder : undefined)}
          aria-controls={isOpen ? `${inputId}-listbox` : undefined}
          aria-activedescendant={activeOptionId}
          // Previously missing entirely: the helper/error message was rendered
          // but never announced, and the error state was visual-only.
          aria-describedby={helperText ? `${inputId}-helper` : rest['aria-describedby']}
          aria-invalid={error || undefined}
          tabIndex={disabled ? -1 : 0}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
        >
          <span
            className={`${baseClass}__value ${!selectedOption ? `${baseClass}__value--placeholder` : ''}`}
            style={fontStyle(selectedOption?.font)}
          >
            {selectedOption?.icon && (
              <span
                className={`${baseClass}__value-icon material-symbols-rounded`}
                aria-hidden="true"
              >
                {selectedOption.icon}
              </span>
            )}
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className={`${baseClass}__chevron material-symbols-rounded`} aria-hidden="true">
            expand_more
          </span>
        </div>
        {isOpen && (
          <ul
            className={[`${baseClass}__menu`, isGrouped ? `${baseClass}__menu--grouped` : '']
              .filter(Boolean)
              .join(' ')}
            role="listbox"
            id={`${inputId}-listbox`}
            ref={listRef}
            aria-labelledby={label ? `${inputId}-label` : undefined}
          >
            {isGrouped
              ? (() => {
                  let flatIndex = 0;
                  return groups.map((group, groupIdx) => (
                    <li key={`group-${groupIdx}`} className={`${baseClass}__group`} role="none">
                      <span className={`${baseClass}__group-label`} role="presentation">
                        {group.label}
                      </span>
                      <ul
                        className={`${baseClass}__group-list`}
                        role="group"
                        aria-label={group.label}
                      >
                        {group.options.map((option) => {
                          const myIndex = flatIndex++;
                          return (
                            <li
                              key={option.value}
                              id={`${inputId}-option-${myIndex}`}
                              className={[
                                `${baseClass}__option`,
                                option.value === value ? `${baseClass}__option--selected` : '',
                                option.disabled ? `${baseClass}__option--disabled` : '',
                                myIndex === focusedIndex ? `${baseClass}__option--focused` : '',
                              ]
                                .filter(Boolean)
                                .join(' ')}
                              style={fontStyle(option.font)}
                              role="option"
                              aria-selected={option.value === value}
                              aria-disabled={option.disabled}
                              onClick={() => !option.disabled && handleSelect(option.value)}
                            >
                              <span className={`${baseClass}__option-content`}>
                                {option.icon && (
                                  <span
                                    className={`${baseClass}__option-icon material-symbols-rounded`}
                                    aria-hidden="true"
                                  >
                                    {option.icon}
                                  </span>
                                )}
                                {option.label}
                              </span>
                              {option.value === value && (
                                <span
                                  className={`${baseClass}__check material-symbols-rounded`}
                                  aria-hidden="true"
                                >
                                  check
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                      {groupIdx < groups.length - 1 && (
                        <li className={`${baseClass}__separator`} role="separator" />
                      )}
                    </li>
                  ));
                })()
              : options.map((option, index) => (
                  <li
                    key={option.value}
                    id={`${inputId}-option-${index}`}
                    className={[
                      `${baseClass}__option`,
                      option.value === value ? `${baseClass}__option--selected` : '',
                      option.disabled ? `${baseClass}__option--disabled` : '',
                      index === focusedIndex ? `${baseClass}__option--focused` : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    style={fontStyle(option.font)}
                    role="option"
                    aria-selected={option.value === value}
                    aria-disabled={option.disabled}
                    onClick={() => !option.disabled && handleSelect(option.value)}
                  >
                    <span className={`${baseClass}__option-content`}>
                      {option.icon && (
                        <span
                          className={`${baseClass}__option-icon material-symbols-rounded`}
                          aria-hidden="true"
                        >
                          {option.icon}
                        </span>
                      )}
                      {option.label}
                    </span>
                    {option.value === value && (
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

Dropdown.displayName = 'Dropdown';
