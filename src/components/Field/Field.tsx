'use client';

import React, { useId } from 'react';
import { FieldContext, type FieldContextValue } from './FieldContext';
import './Field.css';

/** Props owned by Field itself — everything else falls through to the wrapper. */
type FieldOwnProps = {
  /** Label text rendered above the control */
  label?: string;
  /** The form control this field labels */
  children?: React.ReactNode;
  /** Helper text rendered below the control. With `errorText` it stays as it is while an error shows; with the older `error` flag it is recoloured as the error message. */
  helperText?: string;
  /**
   * The error message, shown under the control in the error colour while the
   * helper text keeps its place, and announced politely when it changes.
   * Setting it marks the field invalid, so `error` is not needed alongside
   * it. The older form, `error` with the message in `helperText`, still
   * works.
   */
  errorText?: React.ReactNode;
  /**
   * Optional content rendered opposite the helper text — a character counter,
   * a unit, a "0/280". Present only when supplied; without it the helper sits
   * directly in the field's column and no extra wrapper is introduced.
   */
  aside?: React.ReactNode;
  /** Error state: marks the control invalid and, in the older form without `errorText`, recolours the helper text as the error message. */
  error?: boolean;
  /** Marks the field required and renders the required marker */
  required?: boolean;
  /** Whether the control is disabled — dims the label */
  disabled?: boolean;
  /** Component size */
  size?: 'default' | 'compact';
  /**
   * Group mode: renders the label as a `<span id>` instead of a
   * `<label htmlFor>`, for scaffolding a set of controls (a checkbox or
   * radio group) where no single labelable element exists — the group node
   * points `aria-labelledby` at the span via `labelId`.
   */
  group?: boolean;
  /**
   * id for the control. Generated when omitted, so the label/control/helper
   * association works with no configuration.
   */
  id?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface FieldProps
  extends FieldOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof FieldOwnProps> {}

/**
 * Field owns the scaffolding shared by every labelled form control: the label
 * and its `htmlFor`, the required marker, the helper/error message, the ids
 * that tie them together, and the `aria-describedby` / `aria-invalid` wiring.
 *
 * Controls compose inside it and read the wiring through `useField()` rather
 * than deriving ids themselves — which is what keeps accessibility correct
 * systemically instead of one component at a time.
 *
 * ```tsx
 * <Field label="Email" helperText="We never share it." required>
 *   <MyControl />
 * </Field>
 * ```
 */
export const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  (
    {
      label,
      children,
      helperText,
      errorText,
      aside,
      error = false,
      required = false,
      disabled = false,
      size = 'default',
      group = false,
      id,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-field';
    const generatedId = useId();
    const controlId = id || generatedId;
    const hasErrorText = errorText != null && errorText !== false && errorText !== '';
    const helperId = helperText ? `${controlId}-helper` : undefined;
    const errorId = hasErrorText ? `${controlId}-error` : undefined;
    const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;
    const invalid = error || hasErrorText;
    const labelId = label ? `${controlId}-label` : undefined;

    const classes = [
      baseClass,
      size === 'compact' ? `${baseClass}--compact` : '',
      error && !hasErrorText ? `${baseClass}--error` : '',
      hasErrorText ? `${baseClass}--invalid` : '',
      disabled ? `${baseClass}--disabled` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const context: FieldContextValue = {
      controlId,
      labelId,
      describedBy,
      invalid,
      required,
      disabled,
    };

    return (
      <FieldContext.Provider value={context}>
        <div {...rest} ref={ref} className={classes}>
          {label &&
            (group ? (
              /* No labelable element to point htmlFor at — the group node
                 names itself with aria-labelledby={labelId} instead. */
              <span className={`${baseClass}__label`} id={labelId}>
                {label}
                {required && (
                  <span className={`${baseClass}__required`} aria-hidden="true">
                    {' '}
                    *
                  </span>
                )}
              </span>
            ) : (
              <label className={`${baseClass}__label`} id={labelId} htmlFor={controlId}>
                {label}
                {required && (
                  <span className={`${baseClass}__required`} aria-hidden="true">
                    {' '}
                    *
                  </span>
                )}
              </label>
            ))}

          {children}

          {hasErrorText && (
            <p className={`${baseClass}__error`} id={errorId} aria-live="polite">
              {errorText}
            </p>
          )}

          {/* Without an aside the helper stays a direct child, so adopting
              Field introduces no wrapper and cannot shift existing layout. */}
          {aside ? (
            <div className={`${baseClass}__footer`}>
              {helperText ? (
                <p className={`${baseClass}__helper`} id={helperId}>
                  {helperText}
                </p>
              ) : (
                <span />
              )}
              {aside}
            </div>
          ) : (
            helperText && (
              <p className={`${baseClass}__helper`} id={helperId}>
                {helperText}
              </p>
            )
          )}
        </div>
      </FieldContext.Provider>
    );
  },
);

Field.displayName = 'Field';
