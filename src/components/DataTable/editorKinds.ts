/**
 * DataTable's editor kinds and the facts about each that the table and the
 * editors share: which are live controls, which a typed key opens, which a
 * pick commits, and each compact field's narrowest width. Internal to
 * DataTable, like CellEditor.tsx beside it.
 */

/** The editor kinds a column can name, each one of the library's fields. */
export type CellEditorKind =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'combobox'
  | 'tags'
  | 'date'
  | 'time'
  | 'checkbox'
  | 'switch';

/** Any value a cell can hold. */
export type CellValue = string | number | boolean | string[] | null | undefined;

/** Kinds drawn as a live control in the cell, toggled in place rather than opened. */
export const LIVE_KINDS: ReadonlySet<CellEditorKind> = new Set(['checkbox', 'switch']);

/** Kinds that a printable key opens with that key as the new value. */
export const TYPED_KINDS: ReadonlySet<CellEditorKind> = new Set(['text', 'textarea', 'number']);

/**
 * The narrowest each compact field still shows a short value whole beside
 * its chrome (a stepper, a chevron, a calendar or a clock, a chip), in the
 * base theme. An editable column is never narrower than its editor's floor
 * plus the editor's inset, so a field always fits its cell, in row mode too,
 * where the editors sit side by side.
 */
export const EDITOR_MIN_WIDTH: Record<Exclude<CellEditorKind, 'checkbox' | 'switch'>, number> = {
  text: 96,
  textarea: 160,
  number: 136,
  select: 128,
  combobox: 160,
  multiselect: 200,
  tags: 200,
  date: 184,
  time: 144,
};

/** Kinds whose choice is the whole edit, so picking one commits it. */
export const CHOOSE_KINDS: ReadonlySet<CellEditorKind> = new Set(['select', 'combobox', 'time']);
