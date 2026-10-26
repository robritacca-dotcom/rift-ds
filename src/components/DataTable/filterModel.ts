/**
 * DataTable's filter model: the filter kinds, their operators, how a filter
 * matches a value, and the words a filter is shown and read out in. Rift owns
 * the model, the table's engine runs it, and a server can receive the
 * filters as they are. Shared by DataTable (its header filters) and
 * TableToolbar (its chips), so both read and write one list of filters.
 * Internal: the public names are DataTableFilter, DataTableFilterOperator and
 * DataTableFilterLabels, re-exported from DataTable.
 *
 * Conditions join with AND. A filter whose value is still missing (one just
 * added, before a value is picked) is kept, so its chip can show, but
 * matches everything.
 */

/** The kinds of filter, each with its own operators. A typed column's kind follows its type; an untyped one's is read from its values. */
export type FilterKind = 'text' | 'number' | 'date' | 'enum' | 'tags' | 'boolean';

/** Every operator, across the kinds. */
export type FilterOperator =
  | 'contains'
  | 'notContains'
  | 'is'
  | 'isNot'
  | 'startsWith'
  | 'endsWith'
  | 'eq'
  | 'neq'
  | 'lt'
  | 'lte'
  | 'gt'
  | 'gte'
  | 'between'
  | 'before'
  | 'after'
  | 'isAnyOf'
  | 'isNoneOf'
  | 'hasAnyOf'
  | 'hasAllOf'
  | 'hasNoneOf'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'isChecked'
  | 'isNotChecked';

/** A filter's value: text or a date for one-value operators, a number, a pair for `between`, a list for the set operators. */
export type FilterValue = string | number | [number | string | null, number | string | null] | string[] | null | undefined;

/** One condition on one column. */
export interface Filter {
  /** Stable id, so a chip and its editor keep their place while the value changes. */
  id: string;
  /** The column's key. */
  column: string;
  /** How the value is compared. */
  operator: FilterOperator;
  /** What it is compared with; missing until it is picked. */
  value?: FilterValue;
}

/** Each kind's operators, in menu order; the first is the one a new filter starts with. */
export const OPERATORS: Record<FilterKind, FilterOperator[]> = {
  text: ['contains', 'notContains', 'is', 'isNot', 'startsWith', 'endsWith', 'isEmpty', 'isNotEmpty'],
  number: ['eq', 'neq', 'lt', 'lte', 'gt', 'gte', 'between', 'isEmpty', 'isNotEmpty'],
  date: ['is', 'before', 'after', 'between', 'isEmpty', 'isNotEmpty'],
  // A list filter is its checkboxes, so it has the one condition they mean.
  enum: ['isAnyOf'],
  tags: ['hasAnyOf'],
  boolean: ['isChecked', 'isNotChecked'],
};

/** Operators that take no value. */
export const VALUELESS: ReadonlySet<FilterOperator> = new Set(['isEmpty', 'isNotEmpty', 'isChecked', 'isNotChecked']);

/** Every word a filter shows or announces, each defaulting to English. */
export interface FilterLabels {
  /** An operator as a chip and the operator menu read it. */
  operators: Record<FilterOperator, string>;
  /** The toolbar's button that adds a filter. */
  addFilter: string;
  /** The editor's name, given the column's header. */
  editor: (header: string) => string;
  /** The operator field's name. */
  operatorField: string;
  /** The value field's name, given the column's header. */
  valueField: (header: string) => string;
  /** The first value of a `between`. */
  from: string;
  /** The second value of a `between`. */
  to: string;
  /** Placeholder and name of the search field over a list filter's choices. */
  searchChoices: string;
  /** Shown when the search matches none of a list filter's choices. */
  noChoices: string;
  /** Removes one filter, given its chip's text. */
  remove: (chip: string) => string;
  /** Removes every filter. */
  clearAll: string;
  /** A chip's placeholder for a value not picked yet. */
  noValue: string;
  /** Joins the two ends of a `between` on a chip. */
  and: string;
  /** Joins two or more chosen values on a chip, given how many past the first. */
  more: (count: number) => string;
  /** The header menu item that opens a column's filter. */
  filterColumn: string;
  /** Name of a filtered header's mark, given the header. */
  filtered: (header: string) => string;
  /** Announced when the filters change, given the rows that match. */
  filteredAnnouncement: (count: number) => string;
}

export const DEFAULT_FILTER_LABELS: FilterLabels = {
  operators: {
    contains: 'contains',
    notContains: 'does not contain',
    is: 'is',
    isNot: 'is not',
    startsWith: 'starts with',
    endsWith: 'ends with',
    eq: '=',
    neq: '≠',
    lt: '<',
    lte: '≤',
    gt: '>',
    gte: '≥',
    between: 'is between',
    before: 'is before',
    after: 'is after',
    isAnyOf: 'is any of',
    isNoneOf: 'is none of',
    hasAnyOf: 'has any of',
    hasAllOf: 'has all of',
    hasNoneOf: 'has none of',
    isEmpty: 'is empty',
    isNotEmpty: 'is not empty',
    isChecked: 'is checked',
    isNotChecked: 'is not checked',
  },
  addFilter: 'Filter',
  editor: (header) => `Filter ${header}`,
  operatorField: 'Condition',
  valueField: (header) => `${header} value`,
  from: 'From',
  to: 'To',
  searchChoices: 'Search',
  noChoices: 'No matches',
  remove: (chip) => `Remove filter ${chip}`,
  clearAll: 'Clear filters',
  noValue: '…',
  and: 'and',
  more: (count) => `+${count}`,
  filterColumn: 'Filter…',
  filtered: (header) => `${header} is filtered`,
  filteredAnnouncement: (count) => `${count} result${count === 1 ? '' : 's'}`,
};

type Raw = string | number | boolean | string[] | null | undefined;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}/;

/** A column's filter kind, read from its options and its values. */
export const kindOf = (values: Raw[], hasOptions: boolean): FilterKind => {
  const present = values.filter((value) => value != null && value !== '');
  if (present.some(Array.isArray)) return 'tags';
  if (hasOptions) return 'enum';
  if (present.length > 0 && present.every((value) => typeof value === 'number')) return 'number';
  if (present.length > 0 && present.every((value) => typeof value === 'string' && ISO_DATE.test(value))) return 'date';
  return 'text';
};

const isEmptyValue = (value: Raw) =>
  value == null || value === '' || (Array.isArray(value) && value.length === 0);

/** Whether a filter has what it needs to narrow anything. */
export const isComplete = (filter: Filter) => {
  if (VALUELESS.has(filter.operator)) return true;
  const value = filter.value;
  if (value == null || value === '') return false;
  if (filter.operator === 'between') return Array.isArray(value) && value[0] != null && value[1] != null;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

const text = (value: Raw) => (value == null ? '' : String(value)).toLowerCase();

/** Whether a row's value passes one filter. An incomplete filter passes everything. */
export const matches = (filter: Filter, value: Raw): boolean => {
  if (!isComplete(filter)) return true;
  const target = filter.value;
  switch (filter.operator) {
    case 'isEmpty':
      return isEmptyValue(value);
    case 'isNotEmpty':
      return !isEmptyValue(value);
    case 'isChecked':
      return value === true;
    case 'isNotChecked':
      return value !== true;
    case 'contains':
      return text(value).includes(text(target as string));
    case 'notContains':
      return !text(value).includes(text(target as string));
    case 'is':
      return text(value) === text(target as string);
    case 'isNot':
      return text(value) !== text(target as string);
    case 'startsWith':
      return text(value).startsWith(text(target as string));
    case 'endsWith':
      return text(value).endsWith(text(target as string));
    case 'eq':
      return Number(value) === Number(target);
    case 'neq':
      return Number(value) !== Number(target);
    case 'lt':
      return typeof value === 'number' && value < Number(target);
    case 'lte':
      return typeof value === 'number' && value <= Number(target);
    case 'gt':
      return typeof value === 'number' && value > Number(target);
    case 'gte':
      return typeof value === 'number' && value >= Number(target);
    case 'before':
      return value != null && String(value) < String(target);
    case 'after':
      return value != null && String(value) > String(target);
    case 'between': {
      const [low, high] = target as [number | string, number | string];
      if (value == null) return false;
      return typeof value === 'number' ? value >= Number(low) && value <= Number(high) : String(value) >= String(low) && String(value) <= String(high);
    }
    case 'isAnyOf':
      return (target as string[]).includes(String(value));
    case 'isNoneOf':
      return !(target as string[]).includes(String(value));
    case 'hasAnyOf':
      return Array.isArray(value) && (target as string[]).some((tag) => value.includes(tag));
    case 'hasAllOf':
      return Array.isArray(value) && (target as string[]).every((tag) => value.includes(tag));
    case 'hasNoneOf':
      return !Array.isArray(value) || !(target as string[]).some((tag) => value.includes(tag));
    default:
      return true;
  }
};

/** The value's part of a chip: "Paused", "Paused +2", "10 and 20", or the placeholder, each value read through `label` (an option's label, a date as people read it). */
export const valueText = (
  filter: Filter,
  labels: FilterLabels,
  label: (value: string) => string = (value) => value,
): string => {
  if (VALUELESS.has(filter.operator)) return '';
  if (!isComplete(filter)) return labels.noValue;
  const value = filter.value;
  if (filter.operator === 'between' && Array.isArray(value))
    return `${label(String(value[0]))} ${labels.and} ${label(String(value[1]))}`;
  if (Array.isArray(value)) {
    const list = value as string[];
    return list.length > 1 ? `${label(list[0])} ${labels.more(list.length - 1)}` : label(list[0]);
  }
  return label(String(value));
};

/** A new filter's id. */
export const newFilterId = (column: string, existing: Filter[]) => {
  let n = existing.length + 1;
  while (existing.some((filter) => filter.id === `${column}-${n}`)) n += 1;
  return `${column}-${n}`;
};
