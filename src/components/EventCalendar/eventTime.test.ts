import { describe, expect, it } from 'vitest';
import { compareTimes, minutesOf } from './eventTime';

describe('minutesOf', () => {
  it('reads 24-hour times, padded or not', () => {
    expect(minutesOf('8:50')).toBe(530);
    expect(minutesOf('08:50')).toBe(530);
    expect(minutesOf('13:40')).toBe(820);
    expect(minutesOf('0:05')).toBe(5);
  });
  it('reads 12-hour times with any spelling of the day period', () => {
    expect(minutesOf('1:40 PM')).toBe(820);
    expect(minutesOf('1:40 pm')).toBe(820);
    expect(minutesOf('1:40 p.m.')).toBe(820);
    expect(minutesOf('12:15 AM')).toBe(15);
    expect(minutesOf('12 pm')).toBe(720);
  });
  it('reads other separators', () => {
    expect(minutesOf('13h40')).toBe(820);
    expect(minutesOf('13 h 40')).toBe(820);
    expect(minutesOf('9.30')).toBe(570);
  });
  it('returns null for text that is not a clock time', () => {
    expect(minutesOf('All day')).toBeNull();
    expect(minutesOf('25:00')).toBeNull();
    expect(minutesOf('8:75')).toBeNull();
    expect(minutesOf('13:00 pm')).toBeNull();
  });
});

describe('compareTimes', () => {
  const sorted = (times: string[]) => [...times].sort((a, b) => compareTimes(a, b, 'en-US'));
  it('sorts by the clock, not the text', () => {
    expect(sorted(['12:50', '8:50', '13:40'])).toEqual(['8:50', '12:50', '13:40']);
    expect(sorted(['1:40 PM', '11:00 AM', '9:00 AM'])).toEqual(['9:00 AM', '11:00 AM', '1:40 PM']);
  });
  it('puts clock times ahead of other text', () => {
    expect(sorted(['Lunch', '8:50'])).toEqual(['8:50', 'Lunch']);
  });
});
