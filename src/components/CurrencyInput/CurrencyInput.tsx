'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Input } from '../Input/Input';
import { useLocale } from '../../behaviors/LocaleProvider';
import {
  addDecimal,
  compareDecimal,
  currencyFractionDigits,
  parseDecimal,
  subtractDecimal,
  type DecimalString,
} from '../../format/money';
import './CurrencyInput.css';

/** Props owned by CurrencyInput itself; everything else falls through to the visible `<input>`. */
type CurrencyInputOwnProps = {
  /** Label text above the field. */
  label?: string;
  /** The amount as a decimal string (`"1234.50"`), or `null` for none (controlled). Pair with `onValueChange`. */
  value?: DecimalString | null;
  /** The amount the field starts with (uncontrolled). */
  defaultValue?: DecimalString | null;
  /** Called with the amount as a normalised decimal string as the reader types, or `null` while the field holds no number. Fires alongside the native `onChange`. */
  onValueChange?: (value: DecimalString | null) => void;
  /** The ISO 4217 code of the currency, such as `USD`, `EUR` or `JPY`. Defaults to `USD`. */
  currency?: string;
  /** How the currency shows inside the field: its symbol, its code, or nothing (when the label already says it). The side it sits on follows the locale. */
  currencyDisplay?: 'symbol' | 'code' | 'none';
  /** Digits after the point. Defaults to the currency's own: 0 for JPY, 2 for USD, 3 for KWD. */
  fractionDigits?: number;
  /** Accept a negative amount (a refund, an adjustment). Defaults to false. */
  allowNegative?: boolean;
  /** The smallest amount, as a decimal string. A value below it is raised to it when the field loses focus. */
  min?: DecimalString;
  /** The largest amount, as a decimal string. A value above it is lowered to it when the field loses focus. */
  max?: DecimalString;
  /** How much the Up and Down arrow keys add or take away, as a decimal string. Defaults to `"1"`. */
  step?: DecimalString;
  /** The BCP 47 locale the amount is read and written in, such as `de-DE`. Defaults to the nearest LocaleProvider's, else `en-US`. */
  locale?: string;
  /** Component size (not the native character-width `size` attribute). */
  size?: 'default' | 'compact';
  /** Helper text below the field. */
  helperText?: string;
  /** The error message under the field; setting it marks the field invalid. */
  errorText?: React.ReactNode;
  /** Error state without a message of its own. */
  error?: boolean;
  /** The form field name. The form receives the normalised decimal string through a hidden input, never the formatted text. */
  name?: string;
  /** Additional CSS classes, applied to the wrapper. */
  className?: string;
};

export interface CurrencyInputProps
  extends CurrencyInputOwnProps,
    Omit<React.ComponentPropsWithRef<'input'>, keyof CurrencyInputOwnProps | 'type' | 'prefix'> {}

type Affix = { text: string; side: 'prefix' | 'suffix' } | null;

/** Where the locale writes the currency, and as what: read from Intl, never assumed to be on the left. */
function affixFor(currency: string, locale: string, display: 'symbol' | 'code' | 'none'): Affix {
  if (display === 'none') return null;
  const parts = new Intl.NumberFormat(locale, { style: 'currency', currency, currencyDisplay: display }).formatToParts(1);
  const at = parts.findIndex((p) => p.type === 'currency');
  if (at === -1) return null;
  const firstNumber = parts.findIndex((p) => p.type === 'integer');
  return { text: parts[at].value, side: at < firstNumber ? 'prefix' : 'suffix' };
}

/** The locale's decimal mark. */
const decimalMarkOf = (locale: string) =>
  new Intl.NumberFormat(locale).formatToParts(1.5).find((p) => p.type === 'decimal')?.value ?? '.';

/** An amount as the field shows it while editing: the locale's decimal mark, no grouping. */
const editingText = (value: DecimalString | null, locale: string) =>
  value == null ? '' : value.replace('.', decimalMarkOf(locale)).replace('-', '−');

/** An amount as the field shows it at rest: grouped, at the currency's digits. */
function restingText(value: DecimalString | null, locale: string, digits: number) {
  if (value == null) return '';
  const format = new Intl.NumberFormat(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits });
  // Intl reads a numeric string at full precision (ES2023); the cast is the lib typing lagging the runtime.
  return format.format(value as unknown as number);
}

/** Characters an amount can be typed with: digits in any script, the marks, spaces and minus signs. */
const TYPABLE = /^[\p{Nd}.,'’\s٫٬\-−]*$/u;

/**
 * An amount of money. The value is a decimal string, never a float, so a
 * cent is never lost; the field reads the locale's own marks and a pasted
 * amount in any convention, groups the digits once the reader moves on, and
 * places the currency where the locale writes it.
 */
export function CurrencyInput({
  label,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  currency = 'USD',
  currencyDisplay = 'symbol',
  fractionDigits,
  allowNegative = false,
  min,
  max,
  step = '1',
  locale: localeProp,
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
  onKeyDown,
  onPaste,
  ref,
  ...rest
}: CurrencyInputProps) {
  const locale = useLocale(localeProp);
  const digits = fractionDigits ?? currencyFractionDigits(currency);
  const controlled = valueProp !== undefined;
  const [uncontrolled, setUncontrolled] = useState<DecimalString | null>(defaultValue);
  const value = controlled ? valueProp : uncontrolled;
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState(() => restingText(value, locale, digits));
  const affix = useMemo(() => affixFor(currency, locale, currencyDisplay), [currency, locale, currencyDisplay]);
  const lastEmitted = useRef<DecimalString | null>(value);

  // A value set from outside while the reader is not editing shows at rest;
  // one set while editing (a reset button) replaces the text too, unless it
  // is the value the typing itself produced.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing the shown text to a value set from outside
    if (!focused) setText(restingText(value, locale, digits));
    else if (value !== lastEmitted.current) setText(editingText(value, locale));
    lastEmitted.current = value;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- text follows the value, never the other way
  }, [value, locale, digits]);

  const clamp = (amount: DecimalString | null): DecimalString | null => {
    if (amount == null) return null;
    let next = amount;
    if (!allowNegative && compareDecimal(next, '0') < 0) next = '0';
    if (min !== undefined && compareDecimal(next, min) < 0) next = min;
    if (max !== undefined && compareDecimal(next, max) > 0) next = max;
    return parseDecimal(next, { fractionDigits: digits });
  };

  const commit = (amount: DecimalString | null) => {
    lastEmitted.current = amount;
    if (!controlled) setUncontrolled(amount);
    onValueChange?.(amount);
  };

  const read = (raw: string) => {
    const parsed = parseDecimal(raw, { locale });
    if (parsed == null) return null;
    return !allowNegative && compareDecimal(parsed, '0') < 0 ? parsed.replace('-', '') : parsed;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    if (!TYPABLE.test(raw)) return;
    if (!allowNegative && /[-−]/.test(raw)) return;
    setText(raw);
    onChange?.(event);
    const parsed = read(raw);
    if (parsed !== value) commit(parsed);
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    onPaste?.(event);
    if (event.defaultPrevented) return;
    const pasted = event.clipboardData.getData('text');
    if (TYPABLE.test(pasted)) return;
    // A paste with a symbol, a code or words around the number ($1,234.5,
    // "EUR 12,00"): read the number out of it rather than refusing it.
    event.preventDefault();
    const parsed = read(pasted);
    if (parsed == null) return;
    setText(editingText(parsed, locale));
    commit(parsed);
  };

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    setText(editingText(value, locale));
    onFocus?.(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    const settled = clamp(value);
    if (settled !== value) commit(settled);
    setText(restingText(settled, locale, digits));
    onBlur?.(event);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) return;
    event.preventDefault();
    const base = value ?? '0';
    const next = clamp(event.key === 'ArrowUp' ? addDecimal(base, step) : subtractDecimal(base, step));
    if (next === value) return;
    commit(next);
    setText(editingText(next, locale));
  };

  return (
    <>
      <Input
        {...rest}
        ref={ref}
        className={['ds-currency-input', className].filter(Boolean).join(' ')}
        label={label}
        size={size}
        type="text"
        inputMode="decimal"
        autoComplete={rest.autoComplete ?? 'off'}
        value={text}
        disabled={disabled}
        error={error}
        helperText={helperText}
        errorText={errorText}
        prefix={affix?.side === 'prefix' ? affix.text : undefined}
        suffix={affix?.side === 'suffix' ? affix.text : undefined}
        onChange={handleChange}
        onPaste={handlePaste}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
      {name && <input type="hidden" name={name} value={value ?? ''} disabled={disabled} />}
    </>
  );
}
