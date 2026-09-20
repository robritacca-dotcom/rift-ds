'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo, useId } from 'react';
import { Field } from '../Field/Field';
import './Combobox.css';
import '../../fonts/material-symbols.css';

export interface ComboboxOption {
  /** Display label — also the text matched when filtering */
  label: string;
  /** Option value */
  value: string;
  /** Optional secondary line shown under the label */
  description?: string;
  /** Whether this option is disabled */
  disabled?: boolean;
}

export interface ComboboxOptionGroup {
  /** Group heading */
  label: string;
  /** Options within the group */
  options: ComboboxOption[];
}

/** Props owned by Combobox itself — everything else falls through to the wrapper. */
type ComboboxOwnProps = {
  /** Combobox label text */
  label?: string;
  /** Placeholder shown in the text field when nothing is selected */
  placeholder?: string;
  /**
   * Selected value — a `string` in single mode, `string[]` when `multiple`
   * is set. Leave undefined for an empty selection.
   */
  value?: string | string[];
  /** Available options (flat list) */
  options: ComboboxOption[];
  /** Optional grouped options — when provided, `options` is ignored */
  groups?: ComboboxOptionGroup[];
  /** Allow selecting more than one option; selections render as removable chips */
  multiple?: boolean;
  /** Component size */
  size?: 'default' | 'compact';
  /** Whether the combobox is disabled */
  disabled?: boolean;
  /** Whether the combobox is required */
  required?: boolean;
  /** Error state — shows error styling and message */
  error?: boolean;
  /** Helper or error message displayed below the field */
  helperText?: string;
  /** Show a loading affordance in the menu — for async option fetching */
  loading?: boolean;
  /** Message shown when the filter matches no options */
  emptyMessage?: string;
  /** Show a clear button once something is selected */
  clearable?: boolean;
  /**
   * Called with the new selection — a `string` in single mode,
   * `string[]` when `multiple` is set.
   */
  onValueChange?: (value: string | string[]) => void;
  /** Called as the user types, for async/server-side filtering */
  onSearchChange?: (query: string) => void;
  /** Skip built-in filtering — use when options are filtered upstream */
  manualFiltering?: boolean;
  /** Additional CSS classes */
  className?: string;
  /**
   * Legacy change handler, kept for backwards compatibility.
   *
   * @deprecated Use `onValueChange` instead.
   */
  onChange?: (value: string | string[]) => void;
  /**
   * Legacy accessible-name prop.
   *
   * @deprecated Pass the native `aria-label` attribute instead.
   */
  ariaLabel?: string;
  /**
   * Used only as a fallback for deriving the element id (`id || name || generated`).
   *
   * Note: Combobox renders a `<div>` wrapper around a text input, not a native
   * `<select>`, so `name` does **not** make the selection participate in native
   * form submission.
   */
  name?: string;
};

export interface ComboboxProps
  extends ComboboxOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof ComboboxOwnProps> {}

/**
 * Combobox component — a text field combined with a filterable listbox.
 * Unlike Dropdown (a static select), it narrows options as the user types
 * and supports multi-select chips and async option loading.
 *
 * Forwards a ref to the wrapping element and spreads unrecognised props onto it.
 */
export const Combobox = React.forwardRef<HTMLDivElement, ComboboxProps>(({
  label,
  placeholder = 'Search…',
  value,
  options,
  groups,
  multiple = false,
  size = 'default',
  disabled = false,
  required = false,
  error = false,
  helperText,
  loading = false,
  emptyMessage = 'No results found',
  clearable = false,
  onValueChange,
  onChange,
  onSearchChange,
  manualFiltering = false,
  className = '',
  ariaLabel,
  name,
  id,
  ...rest
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const generatedId = useId();

  /** Keep the internal ref (used for click-outside) while honouring a forwarded one. */
  const setRootRef = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  const baseClass = 'ds-combobox';
  const isGrouped = Boolean(groups && groups.length > 0);
  const inputId = id || name || generatedId;

  // Normalise the selection to an array regardless of mode
  const selectedValues = useMemo<string[]>(() => {
    if (value === undefined || value === null) return [];
    return Array.isArray(value) ? value : [value];
  }, [value]);

  const allOptions = useMemo<ComboboxOption[]>(
    () => (isGrouped ? groups!.flatMap((g) => g.options) : options),
    [isGrouped, groups, options]
  );

  const matches = useCallback(
    (option: ComboboxOption) => {
      if (manualFiltering || query.trim() === '') return true;
      return option.label.toLowerCase().includes(query.trim().toLowerCase());
    },
    [manualFiltering, query]
  );

  // Filtered view, preserving group structure for rendering
  const filteredGroups = useMemo<ComboboxOptionGroup[]>(() => {
    if (!isGrouped) return [];
    return groups!
      .map((group) => ({ ...group, options: group.options.filter(matches) }))
      .filter((group) => group.options.length > 0);
  }, [isGrouped, groups, matches]);

  const filteredOptions = useMemo<ComboboxOption[]>(
    () => (isGrouped ? filteredGroups.flatMap((g) => g.options) : options.filter(matches)),
    [isGrouped, filteredGroups, options, matches]
  );

  const selectedOptions = useMemo(
    () =>
      selectedValues
        .map((v) => allOptions.find((opt) => opt.value === v))
        .filter((opt): opt is ComboboxOption => Boolean(opt)),
    [selectedValues, allOptions]
  );

  const singleSelected = !multiple ? selectedOptions[0] : undefined;

  // In single mode the field shows the selected label until the user types
  const inputValue = isOpen || multiple ? query : singleSelected?.label ?? '';

  const openMenu = () => {
    if (disabled) return;
    setIsOpen(true);
    setFocusedIndex(-1);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setFocusedIndex(-1);
    setQuery('');
  };

  const emitChange = (next: string[]) => {
    const payload = multiple ? next : (next[0] ?? '');
    onValueChange?.(payload);
    onChange?.(payload);
  };

  const handleSelect = (option: ComboboxOption) => {
    if (option.disabled) return;

    if (multiple) {
      const next = selectedValues.includes(option.value)
        ? selectedValues.filter((v) => v !== option.value)
        : [...selectedValues, option.value];
      emitChange(next);
      setQuery('');
      setFocusedIndex(-1);
      inputRef.current?.focus();
    } else {
      emitChange([option.value]);
      closeMenu();
      inputRef.current?.blur();
    }
  };

  const handleRemove = (optionValue: string) => {
    emitChange(selectedValues.filter((v) => v !== optionValue));
    inputRef.current?.focus();
  };

  const handleClear = () => {
    emitChange([]);
    setQuery('');
    inputRef.current?.focus();
  };

  const handleQueryChange = (next: string) => {
    setQuery(next);
    setFocusedIndex(-1);
    if (!isOpen) setIsOpen(true);
    onSearchChange?.(next);
  };

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
      setIsOpen(false);
      setFocusedIndex(-1);
      setQuery('');
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, handleClickOutside]);

  const moveFocus = (direction: 1 | -1) => {
    setFocusedIndex((prev) => {
      let next = prev + direction;
      while (next >= 0 && next < filteredOptions.length && filteredOptions[next].disabled) {
        next += direction;
      }
      if (next < 0 || next >= filteredOptions.length) return prev;
      return next;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          openMenu();
        } else {
          moveFocus(1);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) moveFocus(-1);
        break;
      case 'Enter':
        if (isOpen && focusedIndex >= 0 && filteredOptions[focusedIndex]) {
          e.preventDefault();
          handleSelect(filteredOptions[focusedIndex]);
        }
        break;
      case 'Escape':
        if (isOpen) {
          e.preventDefault();
          closeMenu();
        }
        break;
      case 'Backspace':
        // Empty query in multi mode — pop the last chip
        if (multiple && query === '' && selectedValues.length > 0) {
          emitChange(selectedValues.slice(0, -1));
        }
        break;
      case 'Tab':
        setIsOpen(false);
        setFocusedIndex(-1);
        setQuery('');
        break;
    }
  };

  // Keep the active option in view during keyboard navigation
  useEffect(() => {
    if (!isOpen || focusedIndex < 0 || !listRef.current) return;
    const active = listRef.current.querySelector<HTMLElement>(
      `[data-option-index="${focusedIndex}"]`
    );
    active?.scrollIntoView({ block: 'nearest' });
  }, [focusedIndex, isOpen]);

  const listboxId = `${inputId}-listbox`;
  const activeOptionId =
    focusedIndex >= 0 && filteredOptions[focusedIndex]
      ? `${inputId}-option-${filteredOptions[focusedIndex].value}`
      : undefined;

  const classes = [
    baseClass,
    size === 'compact' ? `${baseClass}--compact` : '',
    isOpen ? `${baseClass}--open` : '',
    error ? `${baseClass}--error` : '',
    disabled ? `${baseClass}--disabled` : '',
    multiple ? `${baseClass}--multiple` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const renderOption = (option: ComboboxOption, index: number) => {
    const isSelected = selectedValues.includes(option.value);
    return (
      <li
        key={option.value}
        id={`${inputId}-option-${option.value}`}
        data-option-index={index}
        className={[
          `${baseClass}__option`,
          isSelected ? `${baseClass}__option--selected` : '',
          option.disabled ? `${baseClass}__option--disabled` : '',
          index === focusedIndex ? `${baseClass}__option--focused` : '',
        ]
          .filter(Boolean)
          .join(' ')}
        role="option"
        aria-selected={isSelected}
        aria-disabled={option.disabled}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => handleSelect(option)}
      >
        <span className={`${baseClass}__option-text`}>
          <span className={`${baseClass}__option-label`}>{option.label}</span>
          {option.description && (
            <span className={`${baseClass}__option-description`}>{option.description}</span>
          )}
        </span>
        {isSelected && (
          <span className={`${baseClass}__check material-symbols-rounded`} aria-hidden="true">
            check
          </span>
        )}
      </li>
    );
  };

  const hasSelection = selectedValues.length > 0;

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
      <div className={`${baseClass}__control`} onClick={() => inputRef.current?.focus()}>
        <span className={`${baseClass}__search-icon material-symbols-rounded`} aria-hidden="true">
          search
        </span>

        <div className={`${baseClass}__field`}>
          {multiple &&
            selectedOptions.map((option) => (
              <span key={option.value} className={`${baseClass}__chip`}>
                {option.label}
                <button
                  type="button"
                  className={`${baseClass}__chip-remove`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(option.value);
                  }}
                  disabled={disabled}
                  aria-label={`Remove ${option.label}`}
                >
                  <span className="material-symbols-rounded" aria-hidden="true">
                    close
                  </span>
                </button>
              </span>
            ))}

          <input
            ref={inputRef}
            id={inputId}
            name={name}
            type="text"
            className={`${baseClass}__input`}
            role="combobox"
            autoComplete="off"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={activeOptionId}
            aria-label={ariaLabel || rest['aria-label'] || (!label ? placeholder : undefined)}
            aria-describedby={helperText ? `${inputId}-helper` : undefined}
            aria-invalid={error || undefined}
            aria-required={required || undefined}
            placeholder={multiple && hasSelection ? '' : placeholder}
            value={inputValue}
            disabled={disabled}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={openMenu}
            onKeyDown={handleKeyDown}
          />
        </div>

        {clearable && hasSelection && !disabled && (
          <button
            type="button"
            className={`${baseClass}__clear`}
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            aria-label="Clear selection"
          >
            <span className="material-symbols-rounded" aria-hidden="true">
              close
            </span>
          </button>
        )}

        <span className={`${baseClass}__chevron material-symbols-rounded`} aria-hidden="true">
          expand_more
        </span>
      </div>

      {isOpen && (
        <ul className={`${baseClass}__menu`} role="listbox" id={listboxId} ref={listRef}>
          {loading && (
            <li className={`${baseClass}__status`} role="presentation">
              Loading…
            </li>
          )}

          {!loading && filteredOptions.length === 0 && (
            <li className={`${baseClass}__status`} role="presentation">
              {emptyMessage}
            </li>
          )}

          {!loading &&
            (isGrouped
              ? (() => {
                  let flatIndex = 0;
                  return filteredGroups.map((group) => (
                    <li key={group.label} className={`${baseClass}__group`} role="none">
                      <span className={`${baseClass}__group-label`} role="presentation">
                        {group.label}
                      </span>
                      <ul
                        className={`${baseClass}__group-list`}
                        role="group"
                        aria-label={group.label}
                      >
                        {group.options.map((option) => renderOption(option, flatIndex++))}
                      </ul>
                    </li>
                  ));
                })()
              : filteredOptions.map((option, index) => renderOption(option, index)))}
        </ul>
      )}

    </Field>
  );
});

Combobox.displayName = 'Combobox';
