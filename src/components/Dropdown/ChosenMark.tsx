import React from 'react';
import './ChosenMark.css';
import '../../fonts/material-symbols.css';

/** Props owned by ChosenMark itself — everything else falls through to the <span>. */
type ChosenMarkOwnProps = {
  /** Additional CSS classes */
  className?: string;
};

export interface ChosenMarkProps
  extends ChosenMarkOwnProps,
    Omit<React.ComponentPropsWithoutRef<'span'>, keyof ChosenMarkOwnProps | 'children'> {}

/**
 * The chosen mark: the trailing check a list or menu row shows on the item
 * that is currently selected. One glyph, one colour and one size for every
 * listbox and menu in the library (Dropdown, Combobox, RichDropdown,
 * TimePicker, ModelPicker, DropdownMenu, ContextMenu, FilterBar's
 * single-select), so a chosen row reads the same wherever it appears. The
 * row renders it only when its item is selected; the row's `aria-selected`
 * or `aria-checked` carries the state, so the mark itself is hidden from
 * assistive technology.
 *
 * It is a mark, not a control: a row whose items are picked independently
 * (a multi-select) shows a CheckboxIndicator instead, and a row that is a
 * control in its own right (SelectionCard, QuestionCard) carries the real
 * indicator.
 */
export const ChosenMark = React.forwardRef<HTMLSpanElement, ChosenMarkProps>(
  ({ className = '', ...rest }, ref) => (
    <span
      aria-hidden="true"
      {...rest}
      ref={ref}
      className={['ds-chosen-mark', 'material-symbols-rounded', className].filter(Boolean).join(' ')}
    >
      check
    </span>
  ),
);

ChosenMark.displayName = 'ChosenMark';
