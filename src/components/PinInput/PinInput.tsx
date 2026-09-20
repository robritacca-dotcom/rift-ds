'use client';

import React from 'react';
import { Field } from '../Field/Field';
import './PinInput.css';

/** Build a fixed-length cell array from a value string, one character per cell. */
const toChars = (value: string, length: number): string[] =>
  Array.from({ length }, (_, i) => value[i] ?? '');

/** Props owned by PinInput itself — everything else falls through to the group container. */
type PinInputOwnProps = {
  /** Number of cells, one character each */
  length?: number;
  /** Current code (controlled) — character at index n renders in cell n */
  value?: string;
  /** Initial code (uncontrolled) */
  defaultValue?: string;
  /**
   * Convenience callback receiving the joined code whenever any cell changes.
   * There is no single native `onChange` here: the control is a group of
   * one-character inputs, so the value callback is the primary API.
   */
  onValueChange?: (value: string) => void;
  /** Fires once when every cell is filled, with the complete code */
  onComplete?: (value: string) => void;
  /** Render cells as password fields, hiding the entered characters */
  mask?: boolean;
  /** Accepted characters — `numeric` rejects non-digits and sets a numeric keyboard */
  format?: 'numeric' | 'alphanumeric';
  /** Label text rendered above the cells; also names the group for screen readers */
  label?: string;
  /** Helper or error message displayed below the cells */
  helperText?: string;
  /** Error state — recolours cell borders and the helper text */
  error?: boolean;
  /** Whether the whole control is disabled */
  disabled?: boolean;
  /** Additional CSS classes — applied to the wrapper, not the cells */
  className?: string;
};

export interface PinInputProps
  extends PinInputOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof PinInputOwnProps> {}

/**
 * Segmented one-time-code input: one cell per character, with auto-advance,
 * Backspace retreat, arrow-key movement and paste distribution.
 *
 * The ref forwards to the FIRST cell's `<input>`, so `ref.current.focus()`
 * focuses the start of the code. Unrecognised props spread onto the
 * `role="group"` container `<div>` that wraps the cells — there is no single
 * underlying input for them to land on — so `data-*` and `aria-*` attributes
 * describe the group.
 */
export const PinInput = React.forwardRef<HTMLInputElement, PinInputProps>(
  (
    {
      length = 6,
      value,
      defaultValue,
      onValueChange,
      onComplete,
      mask = false,
      format = 'numeric',
      label,
      helperText,
      error = false,
      disabled = false,
      className = '',
      id,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-pininput';

    const generatedId = React.useId();
    const controlId = id || generatedId;

    const isControlled = value !== undefined;
    const [internalChars, setInternalChars] = React.useState<string[]>(() =>
      toChars(defaultValue ?? '', length),
    );
    const chars = isControlled ? toChars(value, length) : internalChars;

    const cellRefs = React.useRef<Array<HTMLInputElement | null>>([]);

    const setCellRef = (index: number) => (node: HTMLInputElement | null) => {
      cellRefs.current[index] = node;
      if (index === 0) {
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }
    };

    const classes = [
      baseClass,
      error ? `${baseClass}--error` : '',
      disabled ? `${baseClass}--disabled` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    /** Strip characters the format does not accept. */
    const sanitize = (raw: string) =>
      raw.replace(format === 'numeric' ? /[^0-9]/g : /[^a-zA-Z0-9]/g, '');

    const focusCell = (index: number) => {
      const clamped = Math.max(0, Math.min(index, length - 1));
      const cell = cellRefs.current[clamped];
      cell?.focus();
      cell?.select();
    };

    const commit = (next: string[]) => {
      if (!isControlled) setInternalChars(next);
      onValueChange?.(next.join(''));
    };

    // onComplete fires on the transition into "every cell filled", once —
    // clearing a cell re-arms it. A defaultValue that is already complete
    // does not fire on mount.
    const joined = chars.join('');
    const complete = joined.length === length;
    const wasComplete = React.useRef(complete);
    React.useEffect(() => {
      if (complete && !wasComplete.current) onComplete?.(joined);
      wasComplete.current = complete;
    }, [complete, joined, onComplete]);

    const handleCellChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const clean = sanitize(e.target.value);
      if (e.target.value && !clean) return; // rejected character — keep the cell as it was

      const next = [...chars];
      if (clean.length <= 1) {
        next[index] = clean;
        commit(next);
        if (clean) focusCell(index + 1);
      } else {
        // More than one character can land in a cell via OTP autofill.
        let cursor = index;
        for (const ch of clean) {
          if (cursor >= length) break;
          next[cursor] = ch;
          cursor += 1;
        }
        commit(next);
        focusCell(cursor);
      }
    };

    const handleCellKeyDown = (index: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        e.preventDefault();
        const next = [...chars];
        if (next[index]) {
          next[index] = '';
          commit(next);
          focusCell(index - 1);
        } else if (index > 0) {
          next[index - 1] = '';
          commit(next);
          focusCell(index - 1);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        focusCell(index - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        focusCell(index + 1);
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const clean = sanitize(e.clipboardData.getData('text')).slice(0, length);
      if (!clean) return;
      // A pasted code always distributes from cell 0, whichever cell held focus.
      commit(toChars(clean, length));
      focusCell(clean.length);
    };

    const describedBy = helperText ? `${controlId}-helper` : rest['aria-describedby'];
    const characterNoun = format === 'numeric' ? 'Digit' : 'Character';

    return (
      <Field
        className={classes}
        label={label}
        helperText={helperText}
        error={error}
        disabled={disabled}
        id={controlId}
      >
        <div
          {...rest}
          role="group"
          aria-labelledby={label ? `${controlId}-label` : undefined}
          aria-label={!label ? rest['aria-label'] : undefined}
          aria-describedby={describedBy}
          className={`${baseClass}__cells`}
        >
          {chars.map((char, index) => (
            <input
              key={index}
              ref={setCellRef(index)}
              className={`${baseClass}__cell`}
              type={mask ? 'password' : 'text'}
              inputMode={format === 'numeric' ? 'numeric' : 'text'}
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              maxLength={1}
              value={char}
              disabled={disabled}
              id={index === 0 ? controlId : undefined}
              aria-label={`${characterNoun} ${index + 1} of ${length}`}
              aria-invalid={error || undefined}
              onChange={handleCellChange(index)}
              onKeyDown={handleCellKeyDown(index)}
              onPaste={handlePaste}
              onFocus={(e) => e.target.select()}
            />
          ))}
        </div>
      </Field>
    );
  },
);

PinInput.displayName = 'PinInput';
