'use client';

import React from 'react';
import { CheckboxIndicator } from '../Checkbox/Checkbox';
import { RadioIndicator } from '../RadioButton/RadioButton';
import { SwitchIndicator } from '../ToggleSwitch/ToggleSwitch';
import './SelectionCard.css';

/* ============================================
   TYPES
   ============================================ */

export interface SelectionCardOption {
  /** Unique value for this option */
  value: string;
  /** Primary label */
  label: string;
  /** Optional description text below the label */
  description?: string;
  /** Whether this option is disabled */
  disabled?: boolean;
}

/** Props owned by SelectionCard itself — everything else falls through to the group. */
type SelectionCardOwnProps = {
  /** Selection mode — radio (single), checkbox (multi), or toggle (each card is an on/off switch) */
  mode?: 'radio' | 'checkbox' | 'toggle';
  /** Available options */
  options: SelectionCardOption[];
  /**
   * Currently selected value(s), controlled: a string for radio, a string[]
   * otherwise. Leave undefined to let the group keep its own selection,
   * seeded from `defaultValue`.
   */
  value?: string | string[];
  /** Selected value(s) on first render when uncontrolled (`value` undefined). */
  defaultValue?: string | string[];
  /** Called with the next selection — a string in radio mode, an array otherwise */
  onValueChange?: (value: string | string[]) => void;
  /** Group name (used for aria-label on the group) */
  name?: string;
  /** Additional CSS classes */
  className?: string;
  /**
   * Legacy change handler, kept for backwards compatibility.
   *
   * @deprecated Use `onValueChange` instead.
   */
  onChange?: (value: string | string[]) => void;
};

export interface SelectionCardProps
  extends SelectionCardOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof SelectionCardOwnProps> {}

/* ============================================
   COMPONENT
   ============================================ */

export const SelectionCard = React.forwardRef<HTMLDivElement, SelectionCardProps>(
  (
    {
      mode = 'radio',
      options,
      value: valueProp,
      defaultValue,
      onValueChange,
      onChange,
      name,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-selection-card';
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const isControlled = valueProp !== undefined;
    const value = isControlled ? valueProp : internalValue;

    const selectedValues: string[] = Array.isArray(value)
      ? value
      : value !== undefined
        ? [value]
        : [];

    const isSelected = (optionValue: string) => selectedValues.includes(optionValue);

    const handleSelect = (option: SelectionCardOption) => {
      if (option.disabled) return;

      const next =
        mode === 'radio'
          ? option.value
          : isSelected(option.value)
            ? selectedValues.filter((v) => v !== option.value)
            : [...selectedValues, option.value];

      if (!isControlled) setInternalValue(next);
      onValueChange?.(next);
      onChange?.(next);
    };

    const handleKeyDown = (e: React.KeyboardEvent, option: SelectionCardOption) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleSelect(option);
      }
    };

    const groupRole = mode === 'radio' ? 'radiogroup' : 'group';
    const itemRole = mode === 'radio' ? 'radio' : mode === 'toggle' ? 'switch' : 'checkbox';

    const groupClasses = [`${baseClass}-group`, className].filter(Boolean).join(' ');

    return (
      <div
        {...rest}
        ref={ref}
        className={groupClasses}
        role={groupRole}
        aria-label={rest['aria-label'] ?? name}
      >
        {options.map((option) => {
          const selected = isSelected(option.value);
          const cardClasses = [
            baseClass,
            'ds-control-host',
            selected ? `${baseClass}--selected` : '',
            option.disabled ? `${baseClass}--disabled` : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <div
              key={option.value}
              className={cardClasses}
              role={itemRole}
              aria-checked={selected}
              aria-disabled={option.disabled}
              tabIndex={option.disabled ? -1 : 0}
              onClick={() => handleSelect(option)}
              onKeyDown={(e) => handleKeyDown(e, option)}
            >
              <div className={`${baseClass}__content`}>
                <span className={`${baseClass}__label`}>{option.label}</span>
                {option.description && (
                  <span className={`${baseClass}__description`}>{option.description}</span>
                )}
              </div>

              {/* The real controls' own indicators, so a card's radio, box or
                  switch is the one the standalone control draws. */}
              <div className={`${baseClass}__indicator`}>
                {mode === 'radio' ? (
                  <RadioIndicator checked={selected} />
                ) : mode === 'toggle' ? (
                  <SwitchIndicator checked={selected} />
                ) : (
                  <CheckboxIndicator checked={selected} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  },
);

SelectionCard.displayName = 'SelectionCard';
