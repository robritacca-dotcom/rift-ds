import { describe, expect, it } from 'vitest';
import { periodColumns, periodsOf, totalOf } from './periodColumns';

describe('periodsOf', () => {
  it('steps days, weeks and months as calendar dates', () => {
    expect(periodsOf({ start: '2026-02-27', count: 3, unit: 'day' }).map((p) => p.date)).toEqual(['2026-02-27', '2026-02-28', '2026-03-01']);
    expect(periodsOf({ start: '2026-03-02', count: 2, unit: 'week' }).map((p) => p.date)).toEqual(['2026-03-02', '2026-03-09']);
    expect(periodsOf({ start: '2026-11-15', count: 3, unit: 'month' }).map((p) => p.date)).toEqual(['2026-11-01', '2026-12-01', '2027-01-01']);
  });

  it('prefixes the keys', () => {
    expect(periodsOf({ start: '2026-03-02', count: 1, unit: 'day', keyPrefix: 'd:' })[0].key).toBe('d:2026-03-02');
  });

  it('refuses a start that is not a date', () => {
    expect(() => periodsOf({ start: 'March', count: 1, unit: 'day' })).toThrow();
  });
});

describe('periodColumns', () => {
  it('heads each column in the locale and shares the column settings', () => {
    const columns = periodColumns({ start: '2026-03-02', count: 2, unit: 'day', column: { type: 'number', editable: true } });
    expect(columns.map((c) => String(c.header))).toEqual([expect.stringMatching(/Mon/), expect.stringMatching(/Tue/)]);
    expect(String(columns[0].header)).toContain('2');
    expect(columns.every((c) => c.type === 'number' && c.editable === true)).toBe(true);
    expect(periodColumns({ start: '2026-03-02', count: 1, unit: 'month', locale: 'de-DE' })[0].header).toMatch(/^Mär/);
  });
});

describe('totalOf', () => {
  it('adds the numbers under the keys and skips anything else', () => {
    expect(totalOf(['a', 'b', 'c'])({ a: 2, b: 3.5, c: 'x', d: 100 })).toBe(5.5);
  });
});
