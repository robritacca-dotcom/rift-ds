'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import './ModelPicker.css';
import '../../fonts/material-symbols.css';

export interface ModelPickerModel {
  /** Display name, e.g. "Fable 5". */
  label: string;
  /** Stable identifier reported through `onValueChange`. */
  value: string;
  /** One line on what the model is good at or how fast it is. */
  description?: string;
  /** Small trailing tag, e.g. "New". */
  badge?: string;
  /** Whether this model can be chosen. */
  disabled?: boolean;
}

export interface ModelPickerEffortOption {
  /** Display label, e.g. "Medium". */
  label: string;
  /** Stable identifier reported through `onEffortChange`. */
  value: string;
}

const DEFAULT_EFFORT_OPTIONS: ModelPickerEffortOption[] = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

/** Props owned by ModelPicker itself — everything else falls through to the root element. */
type ModelPickerOwnProps = {
  /** The models on offer, in display order. */
  models: ModelPickerModel[];
  /** Selected model value for controlled use. Pair with `onValueChange`. */
  value?: string;
  /** Initially selected model value for uncontrolled use. Defaults to the first model. */
  defaultValue?: string;
  /** Fires with the newly selected model's value. */
  onValueChange?: (value: string) => void;
  /**
   * Selected effort level for controlled use. Setting this (or `defaultEffort`)
   * is what makes the effort row appear at all.
   */
  effort?: string;
  /** Initially selected effort level for uncontrolled use. */
  defaultEffort?: string;
  /** Fires with the newly selected effort value. */
  onEffortChange?: (effort: string) => void;
  /** The effort levels on offer. Defaults to low, medium and high. */
  effortOptions?: ModelPickerEffortOption[];
  /** Which side of the trigger the panel opens on. In a composer pinned to the bottom of the screen, use `top`. */
  placement?: 'bottom' | 'top';
  /** Whether the whole control is disabled. */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
};

export interface ModelPickerProps
  extends ModelPickerOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof ModelPickerOwnProps> {}

/**
 * ModelPicker is the model selector for a chat surface: a quiet pill trigger
 * showing the current model, and a floating panel listing every model with a
 * one-line description — plus, when an effort value is provided, a row of
 * effort levels below a divider.
 *
 * Built for Composer's `actions` slot, but freestanding anywhere. Forwards a
 * ref to the root element and spreads unrecognised props onto it.
 */
export const ModelPicker = React.forwardRef<HTMLDivElement, ModelPickerProps>(
  (
    {
      models,
      value,
      defaultValue,
      onValueChange,
      effort,
      defaultEffort,
      onEffortChange,
      effortOptions = DEFAULT_EFFORT_OPTIONS,
      placement = 'bottom',
      disabled = false,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-model-picker';
    const id = useId();
    const listboxId = `${id}-listbox`;
    const rootRef = useRef<HTMLDivElement | null>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);

    const isValueControlled = value !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = useState(
      defaultValue ?? models[0]?.value,
    );
    const currentValue = isValueControlled ? value : uncontrolledValue;

    const isEffortControlled = effort !== undefined;
    const [uncontrolledEffort, setUncontrolledEffort] = useState(defaultEffort);
    const currentEffort = isEffortControlled ? effort : uncontrolledEffort;
    const hasEffort = currentEffort !== undefined;

    /** Keep the internal ref (used for click-outside) while honouring a forwarded one. */
    const setRootRef = (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    const selectedModel = models.find((m) => m.value === currentValue);

    const selectModel = (modelValue: string) => {
      if (!isValueControlled) setUncontrolledValue(modelValue);
      onValueChange?.(modelValue);
      setIsOpen(false);
    };

    const selectEffort = (effortValue: string) => {
      if (!isEffortControlled) setUncontrolledEffort(effortValue);
      onEffortChange?.(effortValue);
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

    const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (isOpen && focusedIndex >= 0 && !models[focusedIndex]?.disabled) {
            selectModel(models[focusedIndex].value);
          } else {
            setIsOpen((prev) => !prev);
            setFocusedIndex(-1);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setFocusedIndex((prev) => {
              let next = prev + 1;
              while (next < models.length && models[next].disabled) next++;
              return next < models.length ? next : prev;
            });
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (isOpen) {
            setFocusedIndex((prev) => {
              let next = prev - 1;
              while (next >= 0 && models[next].disabled) next--;
              return next >= 0 ? next : prev;
            });
          }
          break;
        case 'Home':
          if (isOpen) {
            e.preventDefault();
            const first = models.findIndex((m) => !m.disabled);
            if (first >= 0) setFocusedIndex(first);
          }
          break;
        case 'End':
          if (isOpen) {
            e.preventDefault();
            let last = models.length - 1;
            while (last >= 0 && models[last].disabled) last--;
            if (last >= 0) setFocusedIndex(last);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          break;
        case 'Tab':
          // Leave the panel open so the effort row is reachable; a click
          // outside or Escape still closes it.
          break;
      }
    };

    const handleEffortKeyDown = (e: React.KeyboardEvent, index: number) => {
      let targetIndex = -1;
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          targetIndex = (index + 1) % effortOptions.length;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          targetIndex = (index - 1 + effortOptions.length) % effortOptions.length;
          break;
      }
      if (targetIndex >= 0) {
        selectEffort(effortOptions[targetIndex].value);
        document.getElementById(`${id}-effort-option-${targetIndex}`)?.focus();
      }
    };

    useEffect(() => {
      if (isOpen && focusedIndex >= 0 && listRef.current) {
        const focusedEl = listRef.current.children[focusedIndex] as HTMLElement;
        focusedEl?.scrollIntoView({ block: 'nearest' });
      }
    }, [focusedIndex, isOpen]);

    const activeOptionId =
      isOpen && focusedIndex >= 0 && models[focusedIndex]
        ? `${id}-option-${focusedIndex}`
        : undefined;

    const checkedEffortIndex = effortOptions.findIndex((o) => o.value === currentEffort);
    const effortTabStop = checkedEffortIndex >= 0 ? checkedEffortIndex : 0;

    const classes = [
      baseClass,
      `${baseClass}--${placement}`,
      isOpen ? `${baseClass}--open` : '',
      disabled ? `${baseClass}--disabled` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div {...rest} ref={setRootRef} className={classes}>
        <button
          type="button"
          className={`${baseClass}__trigger`}
          disabled={disabled}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={isOpen ? listboxId : undefined}
          aria-activedescendant={activeOptionId}
          aria-label={rest['aria-label'] ?? 'Choose a model'}
          onClick={() => {
            setIsOpen((prev) => !prev);
            setFocusedIndex(-1);
          }}
          onKeyDown={handleTriggerKeyDown}
        >
          <span className={`${baseClass}__trigger-label`}>
            {selectedModel ? selectedModel.label : 'Choose a model'}
          </span>
          <span className={`${baseClass}__chevron material-symbols-rounded`} aria-hidden="true">
            expand_more
          </span>
        </button>

        {isOpen && (
          <div className={`${baseClass}__panel`}>
            <ul
              className={`${baseClass}__list`}
              role="listbox"
              id={listboxId}
              ref={listRef}
              aria-label="Model"
            >
              {models.map((model, index) => (
                <li
                  key={model.value}
                  id={`${id}-option-${index}`}
                  className={[
                    `${baseClass}__option`,
                    model.value === currentValue ? `${baseClass}__option--selected` : '',
                    model.disabled ? `${baseClass}__option--disabled` : '',
                    index === focusedIndex ? `${baseClass}__option--focused` : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  role="option"
                  aria-selected={model.value === currentValue}
                  aria-disabled={model.disabled}
                  onClick={() => !model.disabled && selectModel(model.value)}
                >
                  <span className={`${baseClass}__option-main`}>
                    <span className={`${baseClass}__option-label`}>
                      {model.label}
                      {model.badge && (
                        <span className={`${baseClass}__option-badge`}>{model.badge}</span>
                      )}
                    </span>
                    {model.description && (
                      <span className={`${baseClass}__option-description`}>
                        {model.description}
                      </span>
                    )}
                  </span>
                  {model.value === currentValue && (
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

            {hasEffort && (
              <div className={`${baseClass}__effort`}>
                <span className={`${baseClass}__effort-label`} id={`${id}-effort-label`}>
                  Effort
                </span>
                <div
                  className={`${baseClass}__effort-options`}
                  role="radiogroup"
                  aria-labelledby={`${id}-effort-label`}
                >
                  {effortOptions.map((option, index) => (
                    <button
                      key={option.value}
                      type="button"
                      id={`${id}-effort-option-${index}`}
                      className={[
                        `${baseClass}__effort-option`,
                        option.value === currentEffort
                          ? `${baseClass}__effort-option--selected`
                          : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      role="radio"
                      aria-checked={option.value === currentEffort}
                      tabIndex={index === effortTabStop ? 0 : -1}
                      onClick={() => selectEffort(option.value)}
                      onKeyDown={(e) => handleEffortKeyDown(e, index)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
);

ModelPicker.displayName = 'ModelPicker';
