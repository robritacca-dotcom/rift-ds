import { describe, expect, it } from 'vitest';
import { buildWeeks } from './weeks';

const dates = (weeks: ({ date: string } | null)[][]) => weeks.map((week) => week.map((day) => day?.date ?? null));

describe('buildWeeks', () => {
  it('pads the first week to the first day and ends at the last day', () => {
    // 2026-11-17 is a Tuesday.
    const weeks = buildWeeks([{ date: '2026-11-17' }, { date: '2026-11-18' }], 0);
    expect(dates(weeks)).toEqual([[null, null, '2026-11-17', '2026-11-18']]);
  });

  it('puts each day on its own weekday row, with gaps left empty', () => {
    // Tuesdays and Thursdays only, over two weeks.
    const weeks = buildWeeks(
      [{ date: '2026-11-17' }, { date: '2026-11-19' }, { date: '2026-11-24' }, { date: '2026-11-26' }],
      0,
    );
    expect(dates(weeks)).toEqual([
      [null, null, '2026-11-17', null, '2026-11-19', null, null],
      [null, null, '2026-11-24', null, '2026-11-26'],
    ]);
  });

  it('starts columns on the given weekday', () => {
    // Monday-first: Tuesday is row 1.
    const weeks = buildWeeks([{ date: '2026-11-17' }], 1);
    expect(dates(weeks)).toEqual([[null, '2026-11-17']]);
  });

  it('keeps the last entry for a date listed twice, and ignores order', () => {
    const weeks = buildWeeks(
      [
        { date: '2026-11-18', id: 'b' },
        { date: '2026-11-17', id: 'a' },
        { date: '2026-11-18', id: 'c' },
      ],
      0,
    );
    expect(weeks[0].map((day) => day && day.id)).toEqual([null, null, 'a', 'c']);
  });

  it('crosses a daylight-saving change without drifting', () => {
    // US clocks change on 2026-11-01 (a Sunday).
    const weeks = buildWeeks([{ date: '2026-10-31' }, { date: '2026-11-01' }, { date: '2026-11-08' }], 0);
    expect(dates(weeks)).toEqual([
      [null, null, null, null, null, null, '2026-10-31'],
      ['2026-11-01', null, null, null, null, null, null],
      ['2026-11-08'],
    ]);
  });

  it('returns no weeks for no days', () => {
    expect(buildWeeks([], 0)).toEqual([]);
  });
});
