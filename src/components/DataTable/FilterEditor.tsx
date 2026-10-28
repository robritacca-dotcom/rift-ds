'use client';

/**
 * The one condition editor every filter opens: the operator, then the value
 * field its kind takes (text, a number, a date, or a multi-select for
 * choices and tags; `between` takes two). Opened from a TableToolbar chip
 * and from a DataTable header's Filter… item, so a filter edits the same way
 * wherever it was set. Changes apply as they are made. Internal to DataTable
 * and TableToolbar.
 */

import { Dropdown } from '../Dropdown/Dropdown';
import { Input } from '../Input/Input';
import { NumberInput } from '../NumberInput/NumberInput';
import { DateInput } from '../DateInput/DateInput';
import { useState } from 'react';
import { Checkbox } from '../Checkbox/Checkbox';
import {
  OPERATORS,
  VALUELESS,
  type Filter,
  type FilterLabels,
  type FilterOperator,
  type FilterValue,
} from './filterModel';
import type { ToolbarColumn } from './tableContext';
import './DataTable.css';

const SET_OPERATORS: ReadonlySet<FilterOperator> = new Set([
  'isAnyOf',
  'isNoneOf',
  'hasAnyOf',
  'hasAllOf',
  'hasNoneOf',
]);

/** The value carried across an operator change, where it still fits. */
const carry = (from: FilterOperator, to: FilterOperator, value: FilterValue): FilterValue => {
  if (VALUELESS.has(to)) return undefined;
  if (SET_OPERATORS.has(from) && SET_OPERATORS.has(to)) return value;
  if (from === 'between' || to === 'between' || SET_OPERATORS.has(from) || SET_OPERATORS.has(to)) return undefined;
  return value;
};

export function FilterEditor({
  column,
  filter,
  labels,
  size = 'compact',
  onChange,
}: {
  column: ToolbarColumn;
  filter: Filter;
  labels: FilterLabels;
  /** The fields' size: the toolbar's density for a chip's editor, compact for a header's. */
  size?: 'default' | 'compact';
  onChange: (filter: Filter) => void;
}) {
  const operators = OPERATORS[column.kind];
  const setValue = (value: FilterValue) => onChange({ ...filter, value });
  const pair = (Array.isArray(filter.value) && filter.operator === 'between' ? filter.value : [null, null]) as [
    number | string | null,
    number | string | null,
  ];
  const valueName = labels.valueField(column.label);

  const value = (() => {
    if (VALUELESS.has(filter.operator)) return null;
    if (SET_OPERATORS.has(filter.operator))
      return (
        <ChoiceList
          options={column.options}
          value={Array.isArray(filter.value) ? (filter.value as string[]) : []}
          onChange={setValue}
          size={size}
          label={valueName}
          labels={labels}
        />
      );
    if (column.kind === 'number') {
      if (filter.operator === 'between')
        return (
          <div className="ds-data-table__filter-pair">
            <NumberInput
              size={size}
              value={typeof pair[0] === 'number' ? pair[0] : ''}
              onValueChange={(next) => setValue([next, pair[1]])}
              aria-label={`${valueName}, ${labels.from}`}
            />
            <NumberInput
              size={size}
              value={typeof pair[1] === 'number' ? pair[1] : ''}
              onValueChange={(next) => setValue([pair[0], next])}
              aria-label={`${valueName}, ${labels.to}`}
            />
          </div>
        );
      return (
        <NumberInput
          size={size}
          value={typeof filter.value === 'number' ? filter.value : ''}
          onValueChange={(next) => setValue(next)}
          aria-label={valueName}
        />
      );
    }
    if (column.kind === 'date') {
      if (filter.operator === 'between')
        return (
          <div className="ds-data-table__filter-pair">
            <DateInput
              size={size}
              value={typeof pair[0] === 'string' ? pair[0] : ''}
              onValueChange={(next) => setValue([next || null, pair[1]])}
              aria-label={`${valueName}, ${labels.from}`}
            />
            <DateInput
              size={size}
              value={typeof pair[1] === 'string' ? pair[1] : ''}
              onValueChange={(next) => setValue([pair[0], next || null])}
              aria-label={`${valueName}, ${labels.to}`}
            />
          </div>
        );
      return (
        <DateInput
          size={size}
          value={typeof filter.value === 'string' ? filter.value : ''}
          onValueChange={(next) => setValue(next || undefined)}
          aria-label={valueName}
        />
      );
    }
    return (
      <Input
        size={size}
        value={typeof filter.value === 'string' ? filter.value : ''}
        onValueChange={(next) => setValue(next)}
        aria-label={valueName}
      />
    );
  })();

  // Every kind with more than one condition shows the picker; a list's
  // conditions ("is any of", "is none of") say what its ticks mean.
  return (
    <div className="ds-data-table__filter-editor" role="group" aria-label={labels.editor(column.label)}>
      {operators.length > 1 && (
        <Dropdown
          size={size}
          options={operators.map((operator) => ({ value: operator, label: labels.operators[operator] }))}
          value={filter.operator}
          onValueChange={(next) => {
            const operator = next as FilterOperator;
            onChange({ ...filter, operator, value: carry(filter.operator, operator, filter.value) });
          }}
          aria-label={labels.operatorField}
        />
      )}
      {value}
    </div>
  );
}

/**
 * A list filter's value: a search field over a checkbox per choice. Typing
 * narrows the list, so one value is a search and a tick away; ticks persist
 * across searches.
 */
function ChoiceList({
  options,
  value,
  onChange,
  size,
  label,
  labels,
}: {
  options: { value: string; label: string }[];
  value: string[];
  onChange: (value: string[]) => void;
  size: 'default' | 'compact';
  label: string;
  labels: FilterLabels;
}) {
  const [query, setQuery] = useState('');
  const needle = query.trim().toLowerCase();
  const shown = needle ? options.filter((option) => option.label.toLowerCase().includes(needle)) : options;
  return (
    <div className="ds-data-table__choices">
      <Input
        size={size}
        iconLeft="search"
        placeholder={labels.searchChoices}
        aria-label={labels.searchChoices}
        value={query}
        onValueChange={setQuery}
      />
      <div className="ds-data-table__choice-list" role="group" aria-label={label}>
        {shown.map((option) => (
          <Checkbox
            key={option.value}
            size={size}
            label={option.label}
            checked={value.includes(option.value)}
            onCheckedChange={(checked) =>
              onChange(checked ? [...value, option.value] : value.filter((v) => v !== option.value))
            }
          />
        ))}
        {shown.length === 0 && <span className="ds-data-table__choices-empty">{labels.noChoices}</span>}
      </div>
    </div>
  );
}
