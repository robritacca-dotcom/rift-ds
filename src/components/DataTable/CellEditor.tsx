'use client';

/**
 * DataTable's cell editors: one library field per editor kind, drawn over the
 * cell it edits. Internal to DataTable (the table is the public surface); the
 * editors stay here until a host needs one alone (the spec's `InlineEdit`).
 *
 * The host covers the cell's own box, so nothing grows and nothing reflows
 * while a cell edits; a textarea grows over the rows below as a floating
 * layer. A validation error floats under the editor in the same way, read out
 * through `role="alert"`.
 */

import React, { useLayoutEffect, useRef } from 'react';
import { Input } from '../Input/Input';
import { Textarea } from '../Textarea/Textarea';
import { NumberInput } from '../NumberInput/NumberInput';
import { Dropdown } from '../Dropdown/Dropdown';
import { Combobox } from '../Combobox/Combobox';
import { TagInput } from '../TagInput/TagInput';
import { DateInput } from '../DateInput/DateInput';
import { TimePicker } from '../TimePicker/TimePicker';
import { CHOOSE_KINDS, type CellEditorKind, type CellValue } from './editorKinds';

const asText = (value: CellValue) => (value == null ? '' : Array.isArray(value) ? value.join(', ') : String(value));
const asList = (value: CellValue) =>
  Array.isArray(value) ? value : value == null || value === '' ? [] : [String(value)];

export function CellEditor({
  kind,
  value,
  label,
  options = [],
  error,
  open,
  onValueChange,
  onChoose,
}: {
  kind: Exclude<CellEditorKind, 'checkbox' | 'switch'>;
  value: CellValue;
  /** The field's accessible name: the column and the row it edits. */
  label: string;
  options?: { value: string; label: string }[];
  error?: boolean;
  /** Opens a choice editor's list as it starts. */
  open?: boolean;
  /** The draft changed. */
  onValueChange: (value: CellValue) => void;
  /** A choice editor's pick, which is the whole edit. */
  onChoose: (value: CellValue) => void;
}) {
  // Editors are always the compact field, whatever the table's density: a
  // field the height of a default row would crowd the cell it covers.
  const size = 'compact';
  const choose = (next: CellValue) => (CHOOSE_KINDS.has(kind) ? onChoose(next) : onValueChange(next));
  switch (kind) {
    case 'textarea':
      return (
        <Textarea
          size={size}
          value={asText(value)}
          onValueChange={onValueChange}
          aria-label={label}
          error={error}
          rows={3}
        />
      );
    case 'number':
      return (
        <NumberInput
          size={size}
          value={typeof value === 'number' ? value : ''}
          onValueChange={(next) => onValueChange(next)}
          aria-label={label}
          error={error}
        />
      );
    case 'select':
      return (
        <Dropdown
          size={size}
          options={options}
          value={asText(value)}
          defaultOpen={open}
          onValueChange={choose}
          aria-label={label}
          error={error}
        />
      );
    case 'multiselect':
      return (
        <Combobox
          size={size}
          multiple
          options={options}
          value={asList(value)}
          onValueChange={(next) => onValueChange(next)}
          aria-label={label}
          error={error}
        />
      );
    case 'combobox':
      return (
        <Combobox
          size={size}
          options={options}
          value={asText(value)}
          onValueChange={(next) => choose(Array.isArray(next) ? next[0] : next)}
          aria-label={label}
          error={error}
        />
      );
    case 'tags':
      return (
        <TagInput
          size={size}
          values={asList(value)}
          onValuesChange={onValueChange}
          aria-label={label}
          error={error}
        />
      );
    case 'date':
      return <DateInput size={size} value={asText(value)} onValueChange={onValueChange} aria-label={label} error={error} />;
    case 'time':
      return <TimePicker size={size} value={asText(value)} onValueChange={choose} aria-label={label} error={error} />;
    default:
      return <Input size={size} value={asText(value)} onValueChange={onValueChange} aria-label={label} error={error} />;
  }
}

/**
 * The layer an editor sits in, over its cell. It takes focus as it mounts
 * (the field's first focusable part; a typed start leaves the caret after
 * the typed character, any other start selects the value), and holds the
 * error bubble.
 */
export function EditorHost({
  kind,
  error,
  replaced,
  autoFocus = true,
  onKeyDown,
  onBlur,
  children,
}: {
  kind: CellEditorKind;
  /** The validation message, when the draft does not pass. */
  error?: string;
  /** The edit began with a typed character, which the draft already holds. */
  replaced?: boolean;
  /** Takes focus as it opens; in row mode only the first editor does. */
  autoFocus?: boolean;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  onBlur?: React.FocusEventHandler<HTMLDivElement>;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!autoFocus) return;
    // The text entry first (a NumberInput's stepper buttons come before its
    // input), then whatever a choice field opens with.
    const field =
      ref.current?.querySelector<HTMLElement>('input:not([type="hidden"]), textarea') ??
      ref.current?.querySelector<HTMLElement>('button, [tabindex]:not([tabindex="-1"])');
    if (!field) return;
    field.focus({ preventScroll: true });
    if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
      try {
        if (replaced) field.setSelectionRange(field.value.length, field.value.length);
        else field.select();
      } catch {
        // A number or date input takes no selection range. Writing its own
        // value back puts the caret after it, so the next key a typed start
        // sends lands after the first.
        if (replaced) {
          const typed = field.value;
          field.value = '';
          field.value = typed;
        }
      }
    }
    // Focus once, as the editor opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div
      ref={ref}
      className={`ds-data-table__editor ds-data-table__editor--${kind}`}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
    >
      {children}
      {error && (
        <div className="ds-data-table__edit-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
