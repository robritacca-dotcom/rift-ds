'use client';

import React from 'react';

/**
 * Everything a labelled form control needs to be announced correctly.
 * Derived once by `Field`; read by a control via `useField()`.
 *
 * Lives in its own module so `Field.tsx` exports only a component — the
 * react-refresh lint rule that keeps Fast Refresh working.
 */
export interface FieldContextValue {
  /** id for the control itself — the label's `htmlFor` points at it */
  controlId: string;
  /**
   * id of the rendered `<label>`, or undefined when there is no label.
   *
   * `htmlFor` only associates with *labelable* elements (input, select,
   * textarea, button…). A composite widget built from a `div` — a
   * `role="combobox"` trigger, for instance — is not labelable, so it must
   * point `aria-labelledby` at this id instead.
   */
  labelId: string | undefined;
  /** id of the helper/error text, or undefined when there is none */
  describedBy: string | undefined;
  /** whether the control should report itself invalid */
  invalid: boolean;
  /** whether the control is required */
  required: boolean;
  /** whether the control is disabled */
  disabled: boolean;
}

export const FieldContext = React.createContext<FieldContextValue | null>(null);

/**
 * Read the wiring `Field` derived.
 *
 * Returns `null` outside a `Field`, so a control that uses it still renders
 * standalone — always optional-chain the result.
 *
 * ```tsx
 * const field = useField();
 * <input id={field?.controlId} aria-describedby={field?.describedBy} />
 * ```
 */
export const useField = (): FieldContextValue | null => React.useContext(FieldContext);
