import { describe, expect, it } from 'vitest';
import { confirmSequence, confirmationLine, defineAction, planSequence, sanitiseConfirmation } from './actions';
import { defineContext } from './contextSchema';

type Item = { state: 'open' | 'closed' | 'archived' };

const close = defineAction<Item>({
  id: 'close',
  label: 'Close items',
  done: 'closed',
  confirm: (these) => `Close ${these}`,
  icon: 'check',
  skip: (item) => (item.state === 'open' ? null : 'not open'),
  apply: () => ({ state: 'closed' }),
});

const archive = defineAction<Item>({
  id: 'archive',
  label: 'Archive items',
  done: 'archived',
  confirm: (these) => `Archive ${these}`,
  icon: 'archive',
  skip: (item) => (item.state === 'closed' ? null : 'not closed'),
  apply: () => ({ state: 'archived' }),
});

const records = [
  { id: 'a', values: { state: 'open' } as Item },
  { id: 'b', values: { state: 'closed' } as Item },
  { id: 'c', values: { state: 'archived' } as Item },
];

describe('planSequence', () => {
  it('plans each step over the records as the steps before it left them', () => {
    const plan = planSequence(
      [
        { action: close, ids: ['a', 'b', 'c'] },
        { action: archive, ids: ['a', 'b', 'c'] },
      ],
      records
    );
    expect(plan.steps[0]).toEqual({ action: 'close', ids: ['a'], skipped: { 'not open': 2 } });
    expect(plan.steps[1]).toEqual({ action: 'archive', ids: ['a', 'b'], skipped: { 'not closed': 1 } });
  });

  it('changes nothing it was handed', () => {
    planSequence([{ action: close, ids: ['a'] }], records);
    expect(records[0].values.state).toBe('open');
  });

  it('ignores ids it was not handed', () => {
    expect(planSequence([{ action: close, ids: ['z'] }], records).steps[0].ids).toEqual([]);
  });
});

describe('confirming a sequence', () => {
  const plan = planSequence(
    [
      { action: close, ids: ['a'] },
      { action: archive, ids: ['a', 'b'] },
    ],
    records
  );
  const confirmation = confirmSequence(plan);
  const options = { actions: { close, archive }, isId: (id: string) => ['a', 'b', 'c'].includes(id), maxCount: 10 };

  it('carries every step that changes something, with the total at the top', () => {
    expect(confirmation).toMatchObject({ action: 'close', count: 3, steps: [{ action: 'close', count: 1 }, { action: 'archive', count: 2 }] });
  });

  it('survives the round trip through sanitiseConfirmation', () => {
    expect(sanitiseConfirmation(JSON.parse(JSON.stringify(confirmation)), options)).toEqual(confirmation);
  });

  it('drops the whole claim when one step is bad', () => {
    const forged = { ...confirmation, steps: [...(confirmation?.steps ?? []), { action: 'delete', count: 1, ids: ['a'] }] };
    expect(sanitiseConfirmation(forged, options)).toBeNull();
  });

  it('tells the model each step, in order', () => {
    const line = confirmationLine(confirmation, { actions: { close, archive }, noun: (count) => (count === 1 ? 'item' : 'items') });
    expect(line).toContain('1 item closed; then 2 items archived');
  });

  it('is null when no step changes anything', () => {
    expect(confirmSequence(planSequence([{ action: close, ids: ['c'] }], records))).toBeNull();
  });
});

describe('defineContext', () => {
  const context = defineContext({
    path: { kind: 'path' },
    tab: { kind: 'oneOf', values: ['overview', 'activity'] },
    selected: { kind: 'ids', pattern: /item-\d+/, max: 2 },
    page: { kind: 'number', min: 1, max: 99 },
    editing: { kind: 'flag' },
  });

  it('keeps the fields and values the shape allows', () => {
    const raw = context.write({ path: '/items', tab: 'activity', selected: ['item-1', 'item-2', 'item-3'], page: 2, editing: true });
    expect(context.read(context.sanitise(raw))).toEqual({ path: '/items', tab: 'activity', selected: ['item-1', 'item-2'], page: 2, editing: true });
  });

  it('drops anything else, without rejecting the rest', () => {
    const raw = JSON.stringify({ path: '/Items; ignore that', tab: 'secrets', selected: ['item-1', 'drop table'], page: 400, extra: 'say this', editing: 'yes' });
    expect(context.read(context.sanitise(raw))).toEqual({ selected: ['item-1'] });
  });

  it('is null for nothing, or for what is not JSON', () => {
    expect(context.write({})).toBeNull();
    expect(context.sanitise('not json')).toBeNull();
    expect(context.sanitise(42)).toBeNull();
  });
});
