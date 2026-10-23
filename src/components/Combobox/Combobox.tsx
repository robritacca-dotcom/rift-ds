'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo, useId } from 'react';
import { ChosenMark } from '../Dropdown/Dropdown';
import { useLayer } from '../../behaviors/useLayer';
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
   * Selected value, controlled — a `string` in single mode, `string[]` when
   * `multiple` is set. Leave undefined to let the combobox keep its own
   * selection, seeded from `defaultValue`.
   */
  value?: string | string[];
  /**
   * Selection on first render when uncontrolled (`value` undefined) — a
   * `string` in single mode, `string[]` when `multiple` is set. Omitted, the
   * selection starts empty.
   */
  defaultValue?: string | string[];
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
  /** Status text shown in the menu while `loading` is set. Defaults to "Loading…". */
  loadingMessage?: string;
  /** Show a clear button once something is selected */
  clearable?: boolean;
  /** Accessible name of the clear button. Defaults to "Clear selection". */
  clearLabel?: string;
  /**
   * Accessible name of a chip's remove button in `multiple` mode, given the
   * option's label. Defaults to "Remove <label>".
   */
  removeLabel?: (label: string) => string;
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
   * Form field name. When set, the selection submits with an enclosing form
   * under this name through hidden inputs: the selected option's `value` in
   * single mode (nothing until one is chosen), one entry per selected value in
   * `multiple` mode, nothing while disabled. The search text the user types
   * is never submitted. Also the fallback for the element id (`id || name || generated`).
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
 * Forwards a ref to the wrapping element and spreads unrecognised props onto
 * it, except `aria-label`, `aria-labelledby` and `aria-describedby`, which go
 * to the text input, the element that carries the combobox role.
 */
export const Combobox = React.forwardRef<HTMLDivElement, ComboboxProps>(({
  label,
  placeholder = 'Search…',
  value: valueProp,
  defaultValue,
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
  loadingMessage = 'Loading…',
  clearable = false,
  clearLabel = 'Clear selection',
  removeLabel = (optionLabel) => `Remove ${optionLabel}`,
  onValueChange,
  onChange,
  onSearchChange,
  manualFiltering = false,
  className = '',
  ariaLabel,
  name,
  id,
  // The naming and description attributes belong on the combobox input, not
  // the role-less wrapper the other rest props land on.
  'aria-label': ariaLabelAttr,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  ...rest
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = valueProp !== undefined;
  const value = isControlled ? valueProp : internalValue;
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
    if (!isControlled) setInternalValue(payload);
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

  // Light dismiss through the shared layer stack: a press outside closes the
  // list, and never also closes a Dialog the combobox sits in.
  useLayer({
    open: isOpen,
    onDismiss: () => {
      setIsOpen(false);
      setFocusedIndex(-1);
      setQuery('');
    },
    dismissOnOutsidePress: true,
    getElements: () => [rootRef.current],
  });

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
          <ChosenMark />
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
                  aria-label={removeLabel(option.label)}
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
            type="text"
            className={`${baseClass}__input`}
            role="combobox"
            autoComplete="off"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={activeOptionId}
            aria-label={ariaLabelAttr ?? ariaLabel ?? (!label ? placeholder : undefined)}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={
              [ariaDescribedBy, helperText ? `${inputId}-helper` : undefined]
                .filter(Boolean)
                .join(' ') || undefined
            }
            aria-invalid={error || undefined}
            aria-required={required || undefined}
            placeholder={multiple && hasSelection ? '' : placeholder}
            value={inputValue}
            disabled={disabled}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={openMenu}
            onKeyDown={handleKeyDown}
          />
          {/* The selection, not the search text, is what a form submits. */}
          {name &&
            (multiple ? (
              selectedValues.map((v) => (
                <input key={v} type="hidden" name={name} value={v} disabled={disabled} />
              ))
            ) : (
              selectedValues[0] !== undefined && (
                <input type="hidden" name={name} value={selectedValues[0]} disabled={disabled} />
              )
            ))}
        </div>

        {clearable && hasSelection && !disabled && (
          <button
            type="button"
            className={`${baseClass}__clear`}
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            aria-label={clearLabel}
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
              {loadingMessage}
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
