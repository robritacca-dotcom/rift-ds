import { describe, expect, it } from 'vitest';
import {
  addDecimal,
  compareDecimal,
  currencyFractionDigits,
  formatInTimeZone,
  formatMoney,
  formatRelative,
  fromMinorUnits,
  multiplyDecimal,
  parseDecimal,
  subtractDecimal,
  sumDecimal,
  toMinorUnits,
} from './index';

/** Intl writes narrow and non-breaking spaces; compare on plain ones. */
const plain = (text: string) => text.replace(/\s/g, " ");

describe('parseDecimal', () => {
  it('reads the locale marks', () => {
    expect(parseDecimal('1,234.5', { locale: 'en-US' })).toBe('1234.5');
    expect(parseDecimal('1.234,5', { locale: 'de-DE' })).toBe('1234.5');
    expect(parseDecimal('1 234,5', { locale: 'fr-FR' })).toBe('1234.5');
    expect(parseDecimal("1'234.50", { locale: 'de-CH' })).toBe('1234.50');
  });
  it('reads a pasted amount in another convention', () => {
    expect(parseDecimal('$1,234.5', { locale: 'de-DE' })).toBe('1234.5');
    expect(parseDecimal('1.234,56 €', { locale: 'en-US' })).toBe('1234.56');
  });
  it('treats a lone group mark before three digits as grouping', () => {
    expect(parseDecimal('1,234', { locale: 'en-US' })).toBe('1234');
    expect(parseDecimal('1.234', { locale: 'de-DE' })).toBe('1234');
    expect(parseDecimal('1,23', { locale: 'en-US' })).toBe('1.23');
    expect(parseDecimal('1,234,567', { locale: 'en-US' })).toBe('1234567');
  });
  it('reads negatives in every common shape', () => {
    expect(parseDecimal('-12.5')).toBe('-12.5');
    expect(parseDecimal('−12.5')).toBe('-12.5');
    expect(parseDecimal('(12.50)')).toBe('-12.50');
    expect(parseDecimal('12.50-')).toBe('-12.50');
    expect(parseDecimal('-$12.50')).toBe('-12.50');
  });
  it('reads non-ASCII digits', () => {
    expect(parseDecimal('١٢٣٫٥', { locale: 'ar' })).toBe('123.5');
    expect(parseDecimal('१२३.५', { locale: 'hi-IN' })).toBe('123.5');
  });
  it('rounds to fractionDigits, half-up unless asked', () => {
    expect(parseDecimal('1.005', { fractionDigits: 2 })).toBe('1.01');
    expect(parseDecimal('1.005', { fractionDigits: 2, rounding: 'half-even' })).toBe('1.00');
    expect(parseDecimal('1.015', { fractionDigits: 2, rounding: 'half-even' })).toBe('1.02');
    expect(parseDecimal('7', { fractionDigits: 2 })).toBe('7.00');
  });
  it('returns null for no number', () => {
    expect(parseDecimal('')).toBeNull();
    expect(parseDecimal(null)).toBeNull();
    expect(parseDecimal('abc')).toBeNull();
    expect(parseDecimal('$')).toBeNull();
  });
  it('strips leading zeros and keeps a bare fraction', () => {
    expect(parseDecimal('007.10')).toBe('7.10');
    expect(parseDecimal('.5')).toBe('0.5');
    expect(parseDecimal('5.')).toBe('5');
  });
});

describe('currencyFractionDigits', () => {
  it('follows ISO 4217', () => {
    expect(currencyFractionDigits('JPY')).toBe(0);
    expect(currencyFractionDigits('usd')).toBe(2);
    expect(currencyFractionDigits('KWD')).toBe(3);
  });
});

describe('formatMoney', () => {
  it('writes the currency in the locale', () => {
    expect(formatMoney('1234.5', { currency: 'USD' })).toBe('$1,234.50');
    expect(plain(formatMoney('1234.5', { currency: 'EUR', locale: 'de-DE' }))).toBe('1.234,50 €');
    expect(formatMoney('1234', { currency: 'JPY', locale: 'en-US' })).toBe('¥1,234');
    expect(formatMoney('1.2345', { currency: 'KWD', display: 'code' }).replace(/\s/g, ' ')).toBe('KWD 1.235');
  });
  it('keeps every digit of a large amount', () => {
    expect(formatMoney('12345678901234567.89', { currency: 'USD' })).toBe('$12,345,678,901,234,567.89');
  });
  it('rounds on the digits, never through a float', () => {
    expect(formatMoney('1.005', { currency: 'USD' })).toBe('$1.01');
    expect(formatMoney('0.125', { currency: 'USD', rounding: 'half-even' })).toBe('$0.12');
    expect(formatMoney(1.005, { currency: 'USD' })).toBe('$1.01');
  });
  it('honours sign and notation', () => {
    expect(formatMoney('5', { currency: 'USD', signDisplay: 'always' })).toBe('+$5.00');
    expect(formatMoney('-5', { currency: 'USD' })).toBe('-$5.00');
    expect(formatMoney('1200000', { currency: 'USD', notation: 'compact' })).toBe('$1.2M');
  });
});

describe('arithmetic', () => {
  it('adds and subtracts exactly', () => {
    expect(addDecimal('0.1', '0.2')).toBe('0.3');
    expect(addDecimal('1.50', '2.5')).toBe('4.00');
    expect(subtractDecimal('1', '1.01')).toBe('-0.01');
    expect(subtractDecimal('0.10', '0.10')).toBe('0.00');
  });
  it('multiplies and rounds once', () => {
    expect(multiplyDecimal('19.99', '3')).toBe('59.97');
    expect(multiplyDecimal('10.00', '0.0825')).toBe('0.82');
    expect(multiplyDecimal('2.50', '0.5')).toBe('1.25');
    expect(multiplyDecimal('0.05', '0.5')).toBe('0.02');
    expect(multiplyDecimal('0.05', '0.5', { rounding: 'half-up' })).toBe('0.03');
    expect(multiplyDecimal('-0.05', '0.5', { rounding: 'half-up' })).toBe('-0.03');
    expect(multiplyDecimal('1.000', 1.5, { fractionDigits: 3 })).toBe('1.500');
  });
  it('compares across scales', () => {
    expect(compareDecimal('1.50', '1.5')).toBe(0);
    expect(compareDecimal('-2', '1')).toBe(-1);
    expect(compareDecimal('10', '9.999')).toBe(1);
  });
  it('sums a list', () => {
    expect(sumDecimal([])).toBe('0');
    expect(sumDecimal(['0.1', '0.2', '0.3', '-0.6'])).toBe('0.0');
  });
  it('throws on a non-decimal', () => {
    expect(() => addDecimal('1,5', '1')).toThrow(RangeError);
    expect(() => compareDecimal('NaN', '1')).toThrow(RangeError);
  });
});

describe('minor units', () => {
  it('converts to and from the smallest unit', () => {
    expect(toMinorUnits('12.34', { currency: 'USD' })).toBe(BigInt(1234));
    expect(toMinorUnits('12', { currency: 'JPY' })).toBe(BigInt(12));
    expect(toMinorUnits('1.2345', { currency: 'KWD' })).toBe(BigInt(1234));
    expect(fromMinorUnits(1234, { currency: 'USD' })).toBe('12.34');
    expect(fromMinorUnits(BigInt(-5), { fractionDigits: 2 })).toBe('-0.05');
  });
});

describe('formatRelative', () => {
  const now = '2026-11-06T12:00:00Z';
  it('picks its own unit', () => {
    expect(formatRelative('2026-11-06T12:00:30Z', { now })).toBe('in 30 seconds');
    expect(formatRelative('2026-11-06T11:55:00Z', { now })).toBe('5 minutes ago');
    expect(formatRelative('2026-11-06T15:00:00Z', { now })).toBe('in 3 hours');
    expect(formatRelative('2026-11-07T12:00:00Z', { now })).toBe('tomorrow');
    expect(formatRelative('2026-11-27T12:00:00Z', { now })).toBe('in 3 weeks');
    expect(formatRelative('2026-09-06T12:00:00Z', { now })).toBe('2 months ago');
    expect(formatRelative('2027-11-06T12:00:00Z', { now })).toBe('next year');
  });
  it('counts calendar days at minUnit day', () => {
    expect(formatRelative('2026-11-06', { now, minUnit: 'day' })).toBe('today');
    expect(formatRelative('2026-11-09', { now, minUnit: 'day', numeric: 'always' })).toBe('in 3 days');
  });
  it('writes in the locale', () => {
    expect(formatRelative('2026-11-08T12:00:00Z', { now, locale: 'de-DE' })).toBe('übermorgen');
  });
});

describe('formatInTimeZone', () => {
  it('shows the wall clock of the zone', () => {
    const date = '2026-11-07T00:00:00Z';
    expect(plain(formatInTimeZone(date, { timeZone: 'America/Los_Angeles', timeStyle: 'short' }))).toBe('4:00 PM');
    expect(formatInTimeZone(date, { timeZone: 'UTC', locale: 'en-GB', timeStyle: 'short' })).toBe('00:00');
  });
});
