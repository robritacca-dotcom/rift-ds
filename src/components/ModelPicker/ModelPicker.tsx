'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { ChosenMark } from '../Dropdown/Dropdown';
import { SegmentedControl } from '../SegmentedControl/SegmentedControl';
import { useLayer } from '../../behaviors/useLayer';
import { useAnchoredPosition } from '../../behaviors/useAnchoredPosition';
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
   * Text the trigger shows when no model is selected, and the trigger's
   * accessible name when no `aria-label` is passed. Defaults to "Choose a model".
   */
  placeholder?: string;
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
  /** Accessible name of the model list in the open panel. */
  listLabel?: string;
  /** Heading of the effort row, which is also the accessible name of its radio group. */
  effortLabel?: string;
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
 * ref to the root element and spreads unrecognised props onto it, except
 * `aria-label`, `aria-labelledby` and `aria-describedby`, which go to the
 * trigger, the element that carries the combobox role.
 */
export const ModelPicker = React.forwardRef<HTMLDivElement, ModelPickerProps>(
  (
    {
      models,
      value,
      defaultValue,
      onValueChange,
      placeholder = 'Choose a model',
      effort,
      defaultEffort,
      onEffortChange,
      effortOptions = DEFAULT_EFFORT_OPTIONS,
      listLabel = 'Model',
      effortLabel = 'Effort',
      placement = 'bottom',
      disabled = false,
      className = '',
      // The naming and description attributes belong on the combobox
      // trigger, not the role-less root the other rest props land on.
      'aria-label': ariaLabelAttr,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-model-picker';
    const id = useId();
    const listboxId = `${id}-listbox`;
    const rootRef = useRef<HTMLDivElement | null>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    const [isOpen, setIsOpen] = useState(false);

    // The panel is placed against the trigger by the shared anchored-position
    // behaviour, on the `placement` side, flipped when that side has no room.
    useAnchoredPosition({
      open: isOpen,
      anchorRef: triggerRef,
      panelRef,
      side: placement,
      align: 'start',
      gapProperty: '--gap-050',
    });
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

    // Light dismiss through the shared layer stack: a press outside closes the
    // menu, and never also closes a Dialog it sits in.
    useLayer({
      open: isOpen,
      onDismiss: () => setIsOpen(false),
      dismissOnOutsidePress: true,
      getElements: () => [rootRef.current],
    });

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
          // Handled: the layer stack leaves a prevented Escape alone, so
          // closing the list does not also close a Dialog around it.
          if (isOpen) {
            e.preventDefault();
            setIsOpen(false);
          }
          break;
        case 'Tab':
          // Leave the panel open so the effort row is reachable; a click
          // outside or Escape still closes it.
          break;
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
          ref={triggerRef}
          type="button"
          className={`${baseClass}__trigger`}
          disabled={disabled}
          // A select-only combobox, Dropdown's pattern: aria-activedescendant
          // is not allowed on a plain button, so the open list failed axe.
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={isOpen ? listboxId : undefined}
          aria-activedescendant={activeOptionId}
          aria-label={ariaLabelAttr ?? placeholder}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          onClick={() => {
            setIsOpen((prev) => !prev);
            setFocusedIndex(-1);
          }}
          onKeyDown={handleTriggerKeyDown}
        >
          <span className={`${baseClass}__trigger-label`}>
            {selectedModel ? selectedModel.label : placeholder}
          </span>
          <span className={`${baseClass}__chevron material-symbols-rounded`} aria-hidden="true">
            expand_more
          </span>
        </button>

        {isOpen && (
          <div ref={panelRef} className={`${baseClass}__panel`}>
            <ul
              className={`${baseClass}__list`}
              role="listbox"
              id={listboxId}
              ref={listRef}
              aria-label={listLabel}
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
                    <ChosenMark />
                  )}
                </li>
              ))}
            </ul>

            {hasEffort && (
              <div className={`${baseClass}__effort`}>
                <span className={`${baseClass}__effort-label`} id={`${id}-effort-label`}>
                  {effortLabel}
                </span>
                {/* The library's own mutually exclusive set, in the neutral
                    tone so the pick does not outweigh the model list's
                    chosen mark beside it. */}
                <SegmentedControl
                  className={`${baseClass}__effort-options`}
                  segments={effortOptions.map((option) => ({
                    value: option.value,
                    label: option.label,
                  }))}
                  value={currentEffort ?? ''}
                  onValueChange={selectEffort}
                  size="compact"
                  tone="neutral"
                  aria-labelledby={`${id}-effort-label`}
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
);

ModelPicker.displayName = 'ModelPicker';
