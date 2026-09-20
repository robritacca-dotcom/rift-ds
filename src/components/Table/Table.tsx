// No 'use client' directive: Table is purely presentational — no hooks, no event
// handlers — so it stays renderable from a React Server Component.

import React from 'react';
import './Table.css';

export interface TableColumn {
  /** Unique column identifier, used as the key into each row's cells */
  key: string;
  /** Header label displayed in the column header */
  header: React.ReactNode;
  /** Optional column width (CSS value like '200px', '30%', 'auto') */
  width?: string;
  /** Text alignment for cells in this column */
  align?: 'left' | 'center' | 'right';
}

export interface TableRow {
  /** Unique row identifier */
  id: string;
  /** Cell values keyed by column key — each accepts any React node */
  cells: Record<string, React.ReactNode>;
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
   * markdown content pages.
   */
  bordered?: boolean;
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
      caption,
      captionHidden = false,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-table';

    const classes = [
      baseClass,
      `${baseClass}--${size}`,
      striped ? `${baseClass}--striped` : '',
      bordered ? `${baseClass}--bordered` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const table = (
      <table {...rest} ref={ref} className={classes}>
        {caption && (
          <caption
            className={captionHidden ? `${baseClass}__caption--hidden` : `${baseClass}__caption`}
          >
            {caption}
          </caption>
        )}

        <thead className={`${baseClass}__head`}>
          <tr className={`${baseClass}__row ${baseClass}__row--header`}>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`${baseClass}__header-cell`}
                scope="col"
                style={{
                  width: col.width,
                  textAlign: col.align || 'left',
                }}
              >
                {/* An empty header cell is unannounced — fall back to the
                    column key so the column is still identifiable. */}
                {col.header || <span className={`${baseClass}__sr-only`}>{col.key}</span>}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className={`${baseClass}__body`}>
          {rows.map((row) => (
            <tr key={row.id} className={`${baseClass}__row`}>
              {columns.map((col) => (
                <td key={col.key} className={`${baseClass}__cell`}>
                  <div
                    className={`${baseClass}__cell-content`}
                    style={{
                      justifyContent:
                        col.align === 'center'
                          ? 'center'
                          : col.align === 'right'
                            ? 'flex-end'
                            : 'flex-start',
                    }}
                  >
                    {row.cells[col.key]}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );

    if (bordered) {
      return <div className={`${baseClass}__wrapper`}>{table}</div>;
    }

    return table;
  },
);

Table.displayName = 'Table';
