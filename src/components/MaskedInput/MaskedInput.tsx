'use client';

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Input } from '../Input/Input';
import { CircularButton } from '../CircularButton/CircularButton';
import { MOTION_SENSITIVE_HIDE_MS } from '../../tokens/motion';
import {
  applyMask,
  caretFor,
  concealMasked,
  maskCapacity,
  maskIsNumeric,
  readEdit,
  type Mask,
} from './mask';
import './MaskedInput.css';

/** Props owned by MaskedInput itself; everything else falls through to the visible `<input>`. */
type MaskedInputOwnProps = {
  /** Label text above the field. */
  label?: string;
  /** The shape of the value: a pattern where `#` takes a digit, `A` a letter and `*` either (`'(###) ###-####'`), or a function from the raw characters to the shown text. `MASK_PRESETS` holds common patterns. */
  mask: Mask;
  /** The raw value, the characters without the mask's separators (`"5550100199"`) (controlled). Pair with `onValueChange`. */
  value?: string;
  /** The raw value the field starts with (uncontrolled). */
  defaultValue?: string;
  /** Called with the raw value and the shown text as the reader types. Fires alongside the native `onChange`. */
  onValueChange?: (value: string, formatted: string) => void;
  /** Hide the value as dots until it is revealed: a tax ID, a card number. Defaults `autoComplete` to `off`. */
  sensitive?: boolean;
  /** Add a show and hide button to a sensitive field. */
  revealable?: boolean;
  /** Whether a sensitive value is shown (controlled). Pair with `onRevealedChange`. */
  revealed?: boolean;
  /** Whether a sensitive value starts shown (uncontrolled). Defaults to false. */
  defaultRevealed?: boolean;
  /** Called with the new state when the reader shows or hides the value, or it hides itself. */
  onRevealedChange?: (revealed: boolean) => void;
  /** How many of the last characters of a hidden value stay readable while the field is not focused, so a reader can tell which card it is. Defaults to 0. */
  visibleTail?: number;
  /** Hide a revealed value again after this many milliseconds, or after the library's reveal timeout with `true`. Off by default. */
  autoHideAfter?: number | boolean;
  /** Accessible name of the reveal button while the value is hidden. Defaults to "Show". */
  showLabel?: string;
  /** Accessible name of the reveal button while the value is shown. Defaults to "Hide". */
  hideLabel?: string;
  /** Component size (not the native character-width `size` attribute). */
  size?: 'default' | 'compact';
  /** Helper text below the field. */
  helperText?: string;
  /** The error message under the field; setting it marks the field invalid. */
  errorText?: React.ReactNode;
  /** Error state without a message of its own. */
  error?: boolean;
  /** The form field name. The form receives the raw value through a hidden input, never the shown text. */
  name?: string;
  /** Additional CSS classes, applied to the wrapper. */
  className?: string;
};

export interface MaskedInputProps
  extends MaskedInputOwnProps,
    Omit<React.ComponentPropsWithRef<'input'>, keyof MaskedInputOwnProps | 'type' | 'prefix'> {}

/**
 * A field that writes its value into a shape as the reader types: a phone
 * number, a card number, an ID number, a licence key. The value is the raw
 * characters; the separators are the field's, the caret holds its place
 * across them, and a paste is cleaned up. A sensitive value hides as dots
 * until the reader shows it.
 */
export function MaskedInput({
  label,
  mask,
  value: valueProp,
  defaultValue = '',
  onValueChange,
  sensitive = false,
  revealable = false,
  revealed: revealedProp,
  defaultRevealed = false,
  onRevealedChange,
  visibleTail = 0,
  autoHideAfter = false,
  showLabel = 'Show',
  hideLabel = 'Hide',
  size = 'default',
  helperText,
  errorText,
  error,
  name,
  disabled,
  className = '',
  onChange,
  onFocus,
  onBlur,
  ref,
  ...rest
}: MaskedInputProps) {
  const controlled = valueProp !== undefined;
  const [uncontrolled, setUncontrolled] = useState(() => applyMask(defaultValue, mask).raw);
  const raw = controlled ? applyMask(valueProp, mask).raw : uncontrolled;
  const masked = useMemo(() => applyMask(raw, mask), [raw, mask]);

  const revealControlled = revealedProp !== undefined;
  const [uncontrolledRevealed, setUncontrolledRevealed] = useState(defaultRevealed);
  const revealed = !sensitive || (revealControlled ? revealedProp : uncontrolledRevealed);
  const setRevealed = (next: boolean) => {
    if (!revealControlled) setUncontrolledRevealed(next);
    onRevealedChange?.(next);
  };

  const [focused, setFocused] = useState(false);
  const shown = revealed ? masked.text : concealMasked(masked, focused ? 0 : visibleTail);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const setRef = (node: HTMLInputElement | null) => {
    inputRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };
  const pendingCaret = useRef<number | null>(null);
  const lastInputType = useRef<string | undefined>(undefined);

  // Put the caret back where the reader was typing once the new text is in.
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (pendingCaret.current == null || !input || document.activeElement !== input) return;
    input.setSelectionRange(pendingCaret.current, pendingCaret.current);
    pendingCaret.current = null;
  });

  // A revealed value hides itself again after the timeout, when asked to.
  const hideAfter = autoHideAfter === true ? MOTION_SENSITIVE_HIDE_MS : autoHideAfter || 0;
  const revealedNow = sensitive && revealed;
  useEffect(() => {
    if (!revealedNow || hideAfter <= 0) return;
    const timer = window.setTimeout(() => setRevealed(false), hideAfter);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restart only when the reveal or the timeout changes
  }, [revealedNow, hideAfter]);

  const handleBeforeInput = (event: React.FormEvent<HTMLInputElement>) => {
    lastInputType.current = (event.nativeEvent as InputEvent).inputType;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputType = (event.nativeEvent as InputEvent).inputType ?? lastInputType.current;
    const edit = readEdit({ ...masked, text: shown }, event.target.value, inputType);
    const capped = [...edit.raw].slice(0, maskCapacity(mask)).join('');
    const next = applyMask(capped, mask);
    pendingCaret.current = caretFor(next, Math.min(edit.caretRaw, next.slots.filter(Boolean).length));
    onChange?.(event);
    if (next.raw === raw) {
      // Nothing the mask keeps changed (a refused character): restore the
      // caret, since React will not re-render on its own.
      const input = event.target;
      const caret = pendingCaret.current;
      requestAnimationFrame(() => input.setSelectionRange(caret, caret));
      return;
    }
    if (!controlled) setUncontrolled(next.raw);
    onValueChange?.(next.raw, next.text);
  };

  const revealButton =
    sensitive && revealable ? (
      <CircularButton
        icon={revealed ? 'visibility_off' : 'visibility'}
        variant="tertiary"
        size="compact"
        ariaLabel={revealed ? hideLabel : showLabel}
        aria-pressed={revealed}
        disabled={disabled}
        onClick={() => setRevealed(!revealed)}
      />
    ) : undefined;

  return (
    <>
      <Input
        autoComplete={sensitive ? 'off' : undefined}
        spellCheck={false}
        {...rest}
        // The visible field takes its id from `name`, as Input does, so an
        // ErrorSummary link built from the field name (fieldErrorsFrom) lands on it.
        id={rest.id ?? name}
        ref={setRef}
        className={['ds-masked-input', sensitive && !revealed && 'ds-masked-input--concealed', className]
          .filter(Boolean)
          .join(' ')}
        label={label}
        size={size}
        type="text"
        inputMode={rest.inputMode ?? (maskIsNumeric(mask) ? 'numeric' : undefined)}
        value={shown}
        disabled={disabled}
        error={error}
        helperText={helperText}
        errorText={errorText}
        action={revealButton}
        onBeforeInput={handleBeforeInput}
        onChange={handleChange}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
      />
      {name && <input type="hidden" name={name} value={raw} disabled={disabled} />}
    </>
  );
}

// The presets are data beside the component, not a component, so the Fast
// Refresh rule that wants a component module to export only components does
// not apply to them.
// eslint-disable-next-line react-refresh/only-export-components
export { MASK_PRESETS, applyMask } from './mask';
export type { Mask, Masked } from './mask';
