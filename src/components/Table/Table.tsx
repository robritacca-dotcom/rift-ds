// No 'use client' directive: Table is purely presentational — no hooks, no event
// handlers — so it stays renderable from a React Server Component. The one
// measured part, the bordered wrapper's ScrollRegion, is a client boundary of
// its own.

import React from 'react';
import './Table.css';
import { ScrollRegion } from '../../behaviors/ScrollRegion';
import '../../behaviors/visually-hidden.css';
import { warnOnce } from '../../behaviors/devWarning';

export interface TableColumn {
  /** Unique column identifier, used as the key into each row's cells */
  key: string;
  /** Header label displayed in the column header */
  header: React.ReactNode;
  /** Optional column width (CSS value like '200px', '30%', 'auto') */
  width?: string;
  /** Text alignment for cells in this column. `start` (the default) and `end` follow the reading direction, so a number column set to `end` sits right in English and left in Arabic; `left` and `right` are screen sides. */
  align?: 'start' | 'center' | 'end' | 'left' | 'right';
  /** The column's current sort, the direction DataTable's sorts use, set as `aria-sort` on its header so a screen reader announces it while reading the column. Leave unset on unsorted columns. */
  sort?: 'asc' | 'desc';
  /** Whether this column names each row. Its cells render as row headers (`<th scope="row">`), so moving along a row announces which record it is. */
  rowHeader?: boolean;
  /** Set the column's cells in the code face, wrapping long values at any character: for prop names, types, defaults, tokens and other code a reference table lists. */
  mono?: boolean;
}

export interface TableRow {
  /** Unique row identifier */
  id: string;
  /** Cell values keyed by column key — each accepts any React node */
  cells: Record<string, React.ReactNode>;
  /** Whether the row is selected, drawn with the table's selected-row tint. */
  selected?: boolean;
  /** `heading` opens a group of rows in the emphasis weight; `total` is a row the ones above add up to, in the emphasis weight under a heavier rule. */
  variant?: 'default' | 'heading' | 'total';
}

/** Props owned by Table itself — everything else falls through to the <table>. */
type TableOwnProps = {
  /** Column definitions */
  columns: TableColumn[];
  /** Row data */
  rows: TableRow[];
  /** Visual size */
  size?: 'default' | 'compact';
  /** Alternating row background colours */
  striped?: boolean;
  /**
   * Adds an outer border + border-radius container, a tinted thead background,
   * and `--color-divider` row lines — matching the bordered table style used on
   * markdown content pages. `frameless` wins when both are set.
   */
  bordered?: boolean;
  /** Draws a vertical line between columns, as well as the lines between rows. A frameless table draws none. */
  columnDividers?: boolean;
  /**
   * Draws the table with no frame: no outline, no header band and no column
   * dividers, the first and last columns' content flush with the page, and
   * a hovered row lifted into a raised tile that reaches past the columns.
   * The page needs room for that reach on both sides (`--padding-400`).
   * Wins over `bordered`. On a phone (a viewport under `BREAKPOINT_PHONE_PX`)
   * it is drawn as the plain table, the outer control as an ordinary column.
   */
  frameless?: boolean;
  /**
   * With `frameless`, makes the first column the row's outer control: a
   * 40px column, its content centred, that sits inside the tile's start and
   * shows on hover, on keyboard focus, when checked, or while any row's is
   * checked. Put a drag grip or a checkbox in it. The page needs 40px of
   * room on the table's start side for it. Leave at least one other column
   * without a width: when every column has one, the browser stretches them
   * all, the control's with them.
   */
  outerControl?: boolean;
  /** Accessible caption for the table */
  caption?: string;
  /** Whether to visually hide the caption (still available to screen readers) */
  captionHidden?: boolean;
  /** Additional CSS classes */
  className?: string;
};

export interface TableProps
  extends TableOwnProps,
    Omit<React.ComponentPropsWithoutRef<'table'>, keyof TableOwnProps> {}

/**
 * Table component from Figma design system.
 * Data table with flexible cell content — supports text, icons,
 * inputs, buttons, and any other React nodes inside cells.
 *
 * Forwards a ref to the `<table>` element and spreads unrecognised props onto
 * it. When `bordered`, the table is wrapped in a container div — the ref and
 * spread props still target the inner `<table>`.
 */
export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  (
    {
      columns,
      rows,
      size = 'default',
      striped = false,
      bordered = false,
      columnDividers = false,
      frameless = false,
      outerControl = false,
      caption,
      captionHidden = false,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-table';
    if (frameless && bordered) warnOnce('Table: `frameless` and `bordered` both set; frameless wins.');
    const framed = bordered && !frameless;
    const outer = frameless && outerControl;
    // The outer control's column is centred whatever the column says.
    const alignOf = (col: TableColumn, index: number) => (outer && index === 0 ? 'center' : col.align);

    const classes = [
      baseClass,
      `${baseClass}--${size}`,
      striped ? `${baseClass}--striped` : '',
      framed ? `${baseClass}--bordered` : '',
      columnDividers && !frameless ? `${baseClass}--column-dividers` : '',
      frameless ? `${baseClass}--frameless` : '',
      outer ? `${baseClass}--outer-control` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // A bordered table draws its visible caption outside the outline (see
    // the frame rule in Table.css), so the <caption> itself is hidden.
    const outsideCaption = framed && caption && !captionHidden;

    const table = (
      <table {...rest} ref={ref} className={classes}>
        {caption && (
          <caption
            className={
              captionHidden || outsideCaption ? `${baseClass}__caption ds-visually-hidden` : `${baseClass}__caption`
            }
          >
            {caption}
          </caption>
        )}

        <thead className={`${baseClass}__head`}>
          <tr className={`${baseClass}__row ${baseClass}__row--header`}>
            {columns.map((col, index) => (
              <th
                key={col.key}
                className={`${baseClass}__header-cell`}
                scope="col"
                aria-sort={col.sort === 'asc' ? 'ascending' : col.sort === 'desc' ? 'descending' : undefined}
                style={{
                  width: col.width,
                  textAlign: alignOf(col, index) || 'start',
                }}
              >
                {/* An empty header cell is unannounced — fall back to the
                    column key so the column is still identifiable. */}
                {col.header || <span className="ds-visually-hidden">{col.key}</span>}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className={`${baseClass}__body`}>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={[
                `${baseClass}__row`,
                row.selected ? `${baseClass}__row--selected` : '',
                row.variant && row.variant !== 'default' ? `${baseClass}__row--${row.variant}` : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {columns.map((col, index) => {
                const align = alignOf(col, index);
                const content = (
                  <div
                    className={`${baseClass}__cell-content${col.mono ? ` ${baseClass}__cell-content--mono` : ''}`}
                    style={{
                      // flex-start and flex-end follow the reading direction;
                      // left and right stay on their screen side.
                      justifyContent:
                        align === 'center'
                          ? 'center'
                          : align === 'end'
                            ? 'flex-end'
                            : align === 'left' || align === 'right'
                              ? align
                              : 'flex-start',
                    }}
                  >
                    {row.cells[col.key]}
                  </div>
                );
                return col.rowHeader ? (
                  <th key={col.key} className={`${baseClass}__cell ${baseClass}__cell--row-header`} scope="row">
                    {content}
                  </th>
                ) : (
                  <td key={col.key} className={`${baseClass}__cell`}>
                    {content}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );

    // The bordered wrapper is the table's scroll container: a named,
    // focusable region while it overflows, a plain div while it fits.
    if (framed) {
      const region = <ScrollRegion className={`${baseClass}__wrapper`}>{table}</ScrollRegion>;
      if (!outsideCaption) return region;
      return (
        <div className={`${baseClass}__frame`}>
          <div className={`${baseClass}__caption`} aria-hidden="true">
            {caption}
          </div>
          {region}
        </div>
      );
    }

    // The plain table scrolls in a borderless container of its own, the
    // same region as the bordered one, so a wide table scrolls inside its
    // column rather than running off the page.
    // A frameless table's scroll container reaches past its column by the
    // tile's bleed (and the outer control's width) so the tile has room.
    const scrollClasses = [
      `${baseClass}__scroll`,
      frameless ? `${baseClass}__scroll--frameless` : '',
      outer ? `${baseClass}__scroll--outer-control` : '',
    ]
      .filter(Boolean)
      .join(' ');
    return <ScrollRegion className={scrollClasses}>{table}</ScrollRegion>;
  },
);

Table.displayName = 'Table';
