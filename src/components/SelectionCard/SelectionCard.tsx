'use client';

import React from 'react';
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
  /** Currently selected value(s) — string for radio, string[] for checkbox */
  value?: string | string[];
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
   CHECK ICON — reused from Checkbox
   ============================================ */

const CheckIcon = () => (
  <svg
    className="ds-selection-card__check-icon"
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M2 7.5L5.5 11L12 3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ============================================
   COMPONENT
   ============================================ */

export const SelectionCard = React.forwardRef<HTMLDivElement, SelectionCardProps>(
  ({ mode = 'radio', options, value, onValueChange, onChange, name, className = '', ...rest }, ref) => {
    const baseClass = 'ds-selection-card';

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
        aria-label={name || rest['aria-label']}
      >
        {options.map((option) => {
          const selected = isSelected(option.value);
          const cardClasses = [
            baseClass,
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

              <div className={`${baseClass}__indicator`}>
                {mode === 'radio' ? (
                  <div className={`${baseClass}__radio`}>
                    <div className={`${baseClass}__radio-dot`} />
                  </div>
                ) : mode === 'toggle' ? (
                  <div
                    className={`${baseClass}__toggle ${selected ? '' : `${baseClass}__toggle--off`}`}
                  >
                    <div className={`${baseClass}__toggle-thumb`}>
                      <span
                        className="material-symbols-rounded ds-selection-card__toggle-icon"
                        aria-hidden="true"
                      >
                        check
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className={`${baseClass}__checkbox`}>
                    <CheckIcon />
                  </div>
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
