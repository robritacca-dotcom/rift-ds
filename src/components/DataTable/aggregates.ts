/**
 * DataTable's calculations: what a group row and the totals footer show for
 * a column. A column's `aggregate` names its default; the footer's menu
 * offers the calculations the column's values allow. Internal: the public
 * names are DataTableAggregate and DataTableTotal, re-exported from
 * DataTable.
 */

import type { CellValue } from './editorKinds';

/** The calculations a column's `aggregate` can name. */
export type Aggregate = 'sum' | 'avg' | 'min' | 'max' | 'count' | 'countDistinct' | 'range';

/** Every calculation the totals footer offers, `none` included (Notion's Calculate set). */
export type Total = 'none' | 'count' | 'countDistinct' | 'empty' | 'filled' | 'percentEmpty' | 'sum' | 'avg' | 'min' | 'max' | 'range';

/** The calculations that read numbers, offered only on a column whose values are numbers. */
export const NUMERIC_TOTALS: ReadonlySet<Total> = new Set(['sum', 'avg', 'min', 'max', 'range']);

/** The footer menu's calculations, in menu order. */
export const TOTALS: Total[] = [
  'none',
  'count',
  'countDistinct',
  'empty',
  'filled',
  'percentEmpty',
  'sum',
  'avg',
  'min',
  'max',
  'range',
];

const isEmpty = (value: CellValue) =>
  value == null || value === '' || (Array.isArray(value) && value.length === 0);

/**
 * One calculation over a column's values. `amount` is a number in the
 * column's own units, formatted through its type (a sum of money reads as
 * money); `count` is a plain count; `percent` a share of 100; `pair` the
 * ends of a range. `null` when there is nothing to show.
 */
export type Result =
  | { kind: 'amount'; value: number }
  | { kind: 'count'; value: number }
  | { kind: 'percent'; value: number }
  | { kind: 'pair'; value: [number, number] }
  | null;

export const calculate = (total: Total, values: CellValue[]): Result => {
  const numbers = values.filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
  switch (total) {
    case 'none':
      return null;
    case 'count':
      return { kind: 'count', value: values.length };
    case 'countDistinct':
      return {
        kind: 'count',
        value: new Set(values.filter((value) => !isEmpty(value)).map((value) => JSON.stringify(value))).size,
      };
    case 'empty':
      return { kind: 'count', value: values.filter(isEmpty).length };
    case 'filled':
      return { kind: 'count', value: values.filter((value) => !isEmpty(value)).length };
    case 'percentEmpty':
      return values.length === 0
        ? null
        : { kind: 'percent', value: (values.filter(isEmpty).length / values.length) * 100 };
    case 'sum':
      return numbers.length ? { kind: 'amount', value: numbers.reduce((a, b) => a + b, 0) } : null;
    case 'avg':
      return numbers.length ? { kind: 'amount', value: numbers.reduce((a, b) => a + b, 0) / numbers.length } : null;
    case 'min':
      return numbers.length ? { kind: 'amount', value: Math.min(...numbers) } : null;
    case 'max':
      return numbers.length ? { kind: 'amount', value: Math.max(...numbers) } : null;
    case 'range':
      return numbers.length ? { kind: 'pair', value: [Math.min(...numbers), Math.max(...numbers)] } : null;
    default:
      return null;
  }
};
