/**
 * Money as a decimal string. Server-safe: no React, no browser API and no
 * runtime dependency, so a route handler, a server component and a client
 * control can share one set of rules.
 *
 * The contract: an amount travels as a normalised decimal string ("1234.50",
 * "-0.07"), the shape most payment and accounting APIs already send, and
 * every piece of arithmetic here runs on integers with `BigInt`, so a float
 * never touches money (0.1 + 0.2 is "0.3", never 0.30000000000000004). A
 * string that is not a decimal throws a `RangeError` rather than becoming
 * NaN quietly. design.md's "Money is a decimal string" owns the rule.
 */

import { DEFAULT_LOCALE } from '../behaviors/locale';

/** A decimal amount written with an optional leading minus, digits and an optional `.` fraction: `"1234.50"`, `"-0.07"`. */
export type DecimalString = string;

/** How a value that has more digits than it may keep is brought back: banker's rounding, or away from zero at the half. */
export type DecimalRounding = 'half-even' | 'half-up';

const TEN = BigInt(10);
const ZERO = BigInt(0);

/** An amount as an integer and the count of digits after its point: "12.30" is 1230 at scale 2. */
type Scaled = { int: bigint; scale: number };

const DECIMAL = /^(-)?(\d+)(?:\.(\d*))?$|^(-)?\.(\d+)$/;

function toScaled(value: DecimalString | number): Scaled {
  const text = typeof value === 'number' ? numberToDecimal(value) : value.trim();
  const m = DECIMAL.exec(text);
  if (!m) throw new RangeError(`Not a decimal string: ${JSON.stringify(value)}`);
  const negative = Boolean(m[1] ?? m[4]);
  const whole = m[2] ?? '0';
  const fraction = m[3] ?? m[5] ?? '';
  const int = BigInt(whole + fraction) * (negative ? BigInt(-1) : BigInt(1));
  return { int, scale: fraction.length };
}

/** A finite number as a plain decimal string, never in exponent form. */
function numberToDecimal(value: number): string {
  if (!Number.isFinite(value)) throw new RangeError(`Not a finite number: ${value}`);
  const text = String(value);
  if (!/e/i.test(text)) return text;
  return value.toFixed(20).replace(/\.?0+$/, '');
}

function fromScaled({ int, scale }: Scaled): DecimalString {
  const negative = int < ZERO;
  const digits = (negative ? -int : int).toString().padStart(scale + 1, '0');
  const whole = scale ? digits.slice(0, -scale) : digits;
  const fraction = scale ? digits.slice(-scale) : '';
  const body = fraction ? `${whole}.${fraction}` : whole;
  // A rounded or summed zero never carries a sign.
  return negative && /[1-9]/.test(body) ? `-${body}` : body;
}

function rescale(value: Scaled, scale: number, rounding: DecimalRounding = 'half-even'): Scaled {
  if (scale === value.scale) return value;
  if (scale > value.scale) return { int: value.int * TEN ** BigInt(scale - value.scale), scale };
  const divisor = TEN ** BigInt(value.scale - scale);
  const quotient = value.int / divisor;
  const remainder = value.int % divisor;
  if (remainder === ZERO) return { int: quotient, scale };
  const away = value.int < ZERO ? BigInt(-1) : BigInt(1);
  const twice = (remainder < ZERO ? -remainder : remainder) * BigInt(2);
  let int = quotient;
  if (twice > divisor) int += away;
  else if (twice === divisor) {
    const odd = (quotient < ZERO ? -quotient : quotient) % BigInt(2) === BigInt(1);
    if (rounding === 'half-up' || odd) int += away;
  }
  return { int, scale };
}

function align(a: Scaled, b: Scaled): [Scaled, Scaled] {
  const scale = Math.max(a.scale, b.scale);
  return [rescale(a, scale), rescale(b, scale)];
}

const fractionDigitsCache = new Map<string, number>();

/**
 * The digits after the point a currency is written with, from the runtime's
 * ISO 4217 data: 0 for JPY, 2 for USD, 3 for KWD.
 */
export function currencyFractionDigits(currency: string): number {
  const code = currency.toUpperCase();
  let digits = fractionDigitsCache.get(code);
  if (digits === undefined) {
    digits = new Intl.NumberFormat(DEFAULT_LOCALE, { style: 'currency', currency: code }).resolvedOptions()
      .maximumFractionDigits ?? 2;
    fractionDigitsCache.set(code, digits);
  }
  return digits;
}

/** Options for {@link parseDecimal}. */
export type ParseDecimalOptions = {
  /** The locale whose grouping and decimal marks the input is read in. Defaults to `en-US`. */
  locale?: string;
  /** Round the result to exactly this many digits after the point. Leave unset to keep what was typed. */
  fractionDigits?: number;
  /** How extra digits are rounded when `fractionDigits` is set. Defaults to `half-up`, the way a person reads an amount. */
  rounding?: DecimalRounding;
};

const markCache = new Map<string, { decimal: string; group: string }>();

function marksOf(locale: string) {
  let marks = markCache.get(locale);
  if (!marks) {
    const parts = new Intl.NumberFormat(locale, { useGrouping: true }).formatToParts(12345.6);
    marks = {
      decimal: parts.find((p) => p.type === 'decimal')?.value ?? '.',
      group: parts.find((p) => p.type === 'group')?.value ?? ',',
    };
    markCache.set(locale, marks);
  }
  return marks;
}

/** The numbering systems whose digits a pasted amount may arrive in, by their Unicode extension names. */
const NUMBERING_SYSTEMS = ['arab', 'arabext', 'beng', 'deva', 'fullwide', 'gujr', 'guru', 'khmr', 'knda', 'laoo', 'mlym', 'mymr', 'orya', 'tamldec', 'telu', 'thai', 'tibt'];

let digitMap: Map<string, string> | null = null;

/** Every non-ASCII digit the runtime can write, mapped to its ASCII twin. Built once, from Intl itself. */
function localDigits(): Map<string, string> {
  if (digitMap) return digitMap;
  digitMap = new Map();
  for (const system of NUMBERING_SYSTEMS) {
    try {
      const format = new Intl.NumberFormat(`${DEFAULT_LOCALE}-u-nu-${system}`, { useGrouping: false });
      for (let n = 0; n < 10; n++) {
        const glyph = format.format(n);
        if (glyph !== String(n)) digitMap.set(glyph, String(n));
      }
    } catch {
      // A runtime without this numbering system simply cannot paste its digits.
    }
  }
  return digitMap;
}

/** Spaces of every width, and the apostrophes some locales group with. */
const GROUP_SPACES = /[\s'’]/g;

/**
 * Text a person typed or pasted, read as a decimal string, or `null` when it
 * holds no number. Accepts the locale's own marks (`1.234,5` in de-DE) and
 * also a pasted amount in another convention: when both `.` and `,` appear,
 * the last one is the decimal mark. Currency symbols, codes and spaces are
 * ignored; a leading or trailing minus, or brackets, make it negative.
 */
export function parseDecimal(input: string | null | undefined, options: ParseDecimalOptions = {}): DecimalString | null {
  if (input == null) return null;
  const { locale = DEFAULT_LOCALE, fractionDigits, rounding = 'half-up' } = options;
  let text = String(input).trim();
  if (!text) return null;

  // Locale digits (Arabic-Indic, Devanagari and the rest) become ASCII.
  const digits = localDigits();
  text = text.replace(/\p{Nd}/gu, (d) => digits.get(d) ?? d);
  // Arabic decimal and thousands separators.
  text = text.replace(/٫/g, '.').replace(/٬/g, ',');

  const negative = /^\(.*\)$/.test(text) || /^[^\d]*[-−]/.test(text) || /[-−][^\d]*$/.test(text);
  text = text.replace(GROUP_SPACES, '').replace(/[^\d.,]/g, '');
  if (!/\d/.test(text)) return null;

  const { decimal, group } = marksOf(locale);
  const lastDot = text.lastIndexOf('.');
  const lastComma = text.lastIndexOf(',');
  let decimalMark: string | null = null;
  if (lastDot !== -1 && lastComma !== -1) {
    decimalMark = lastDot > lastComma ? '.' : ',';
  } else if (lastDot !== -1 || lastComma !== -1) {
    const mark = lastDot !== -1 ? '.' : ',';
    const count = text.split(mark).length - 1;
    const after = text.length - text.lastIndexOf(mark) - 1;
    if (count > 1) decimalMark = null;
    else if (mark === decimal) decimalMark = mark;
    else if (mark === group) decimalMark = after === 3 ? null : mark;
    else decimalMark = mark;
  }

  let whole = text;
  let fraction = '';
  if (decimalMark) {
    const at = text.lastIndexOf(decimalMark);
    whole = text.slice(0, at);
    fraction = text.slice(at + 1);
  }
  whole = whole.replace(/[.,]/g, '').replace(/^0+(?=\d)/, '') || '0';
  fraction = fraction.replace(/[.,]/g, '');

  let scaled = toScaled(`${negative ? '-' : ''}${whole}${fraction ? `.${fraction}` : ''}`);
  if (fractionDigits !== undefined) scaled = rescale(scaled, fractionDigits, rounding);
  return fromScaled(scaled);
}

/** Options for {@link formatMoney}. */
export type FormatMoneyOptions = {
  /** The ISO 4217 code of the amount's currency, such as `USD` or `JPY`. */
  currency: string;
  /** The locale the amount is written in. Defaults to `en-US`. */
  locale?: string;
  /** How the currency is named: its symbol (`$`), its code (`USD`) or its name (`US dollars`). Defaults to `symbol`. */
  display?: 'symbol' | 'code' | 'name';
  /** Digits after the point. Defaults to the currency's own (0 for JPY, 2 for USD). */
  fractionDigits?: number;
  /** When a sign is written, as `Intl.NumberFormat` takes it. Defaults to `auto`. */
  signDisplay?: 'auto' | 'always' | 'exceptZero' | 'never';
  /** `compact` writes large amounts short (`$1.2M`). Defaults to `standard`. */
  notation?: 'standard' | 'compact';
  /** How extra digits are rounded. Defaults to `half-up`, as `Intl` writes numbers. */
  rounding?: DecimalRounding;
};

/**
 * An amount written as money in a locale: `formatMoney('1234.5', { currency:
 * 'EUR', locale: 'de-DE' })` is `1.234,50 €`. The amount reaches `Intl` as a
 * string, so every digit survives (a runtime too old to read strings falls
 * back to a number).
 */
export function formatMoney(value: DecimalString | number, options: FormatMoneyOptions): string {
  const { currency, locale = DEFAULT_LOCALE, display = 'symbol', signDisplay = 'auto', notation = 'standard', rounding = 'half-up' } = options;
  const compact = notation === 'compact';
  const digits = options.fractionDigits ?? (compact ? undefined : currencyFractionDigits(currency));
  let scaled = toScaled(value);
  if (digits !== undefined) scaled = rescale(scaled, digits, rounding);
  const format = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: display,
    signDisplay,
    notation,
    ...(digits !== undefined ? { minimumFractionDigits: digits, maximumFractionDigits: digits } : {}),
  });
  // Intl reads a numeric string at full precision (ES2023); the cast is the
  // lib typing lagging the runtime.
  return format.format(fromScaled(scaled) as unknown as number);
}

/** `a + b`, exact, at the larger of the two scales. */
export function addDecimal(a: DecimalString, b: DecimalString): DecimalString {
  const [x, y] = align(toScaled(a), toScaled(b));
  return fromScaled({ int: x.int + y.int, scale: x.scale });
}

/** `a - b`, exact, at the larger of the two scales. */
export function subtractDecimal(a: DecimalString, b: DecimalString): DecimalString {
  const [x, y] = align(toScaled(a), toScaled(b));
  return fromScaled({ int: x.int - y.int, scale: x.scale });
}

/** Options for {@link multiplyDecimal}. */
export type MultiplyDecimalOptions = {
  /** Digits after the point the product keeps. Defaults to the value's own scale, so a price times a rate stays a price. */
  fractionDigits?: number;
  /** How a product with more digits is rounded. Defaults to `half-even`. */
  rounding?: DecimalRounding;
};

/** `value × factor`, rounded once at the end: a line total, a tax, a discount. */
export function multiplyDecimal(
  value: DecimalString,
  factor: DecimalString | number,
  options: MultiplyDecimalOptions = {},
): DecimalString {
  const x = toScaled(value);
  const y = toScaled(factor);
  const product = { int: x.int * y.int, scale: x.scale + y.scale };
  return fromScaled(rescale(product, options.fractionDigits ?? x.scale, options.rounding));
}

/** `-1` when `a < b`, `0` when they are equal (`"1.50"` equals `"1.5"`), `1` when `a > b`. */
export function compareDecimal(a: DecimalString, b: DecimalString): -1 | 0 | 1 {
  const [x, y] = align(toScaled(a), toScaled(b));
  return x.int < y.int ? -1 : x.int > y.int ? 1 : 0;
}

/** The exact sum of a list, `"0"` for an empty one. */
export function sumDecimal(values: readonly DecimalString[]): DecimalString {
  return values.reduce<DecimalString>((total, value) => addDecimal(total, value), '0');
}

/** The scale an amount is counted in: a currency's own digits, or a count given outright. */
export type MinorUnitScale = { currency: string } | { fractionDigits: number };

const scaleOf = (unit: MinorUnitScale) =>
  'currency' in unit ? currencyFractionDigits(unit.currency) : unit.fractionDigits;

/** An amount as a whole count of its smallest unit: `"12.34"` USD is `1234n` cents. Extra digits round half-even, as a ledger does. */
export function toMinorUnits(value: DecimalString, unit: MinorUnitScale): bigint {
  return rescale(toScaled(value), scaleOf(unit)).int;
}

/** A whole count of the smallest unit as a decimal string: `1234` cents of USD is `"12.34"`. */
export function fromMinorUnits(minor: bigint | number, unit: MinorUnitScale): DecimalString {
  if (typeof minor === 'number' && !Number.isSafeInteger(minor))
    throw new RangeError(`Not a whole count of minor units: ${minor}`);
  return fromScaled({ int: BigInt(minor), scale: scaleOf(unit) });
}
