import React from 'react';
import { Table, type TableColumn, type TableRow } from '../Table/Table';
import { DEFAULT_LOCALE } from '../../behaviors/locale';
import { formatMoney, multiplyDecimal, sumDecimal, type DecimalString } from '../../format/money';
import './Statement.css';

/** One line of a section: what it is, and its amount in each period. */
export interface StatementLine {
  /** A stable id for the line. */
  id: string;
  /** What the amount is ("Subscriptions", "Rent"). */
  label: string;
  /** The amount in each period, as a decimal string (`"1234.50"`), in the order of `periods`. */
  amounts: DecimalString[];
}

/** A titled group of lines, with an optional total under them. */
export interface StatementSection {
  /** Marks the entry as a section. */
  kind: 'section';
  /** A stable id for the section. */
  id: string;
  /** The section's heading ("Revenue", "Operating expenses"). */
  title: string;
  /** The section's lines. */
  lines: StatementLine[];
  /** The label of the section's total row; leave it out to show no total. */
  totalLabel?: string;
  /** How the section counts toward the subtotals below it: `1` adds (revenue), `-1` subtracts (costs entered as positive amounts). Defaults to 1. */
  sign?: 1 | -1;
}

/** A running total of every section above it, each counted by its sign: a gross profit, a net profit. */
export interface StatementSubtotal {
  /** Marks the entry as a subtotal. */
  kind: 'subtotal';
  /** A stable id for the subtotal. */
  id: string;
  /** What the subtotal is ("Gross profit", "Net profit"). */
  label: string;
}

/** Props owned by Statement itself; everything else falls through to the `<table>`. */
type StatementOwnProps = {
  /** The periods the amounts are for, the column headers in order ("Q1", "Q2", "Year to date"). */
  periods: string[];
  /** The sections and subtotals, top to bottom; the last subtotal is the bottom line. */
  items: (StatementSection | StatementSubtotal)[];
  /** The ISO 4217 code the amounts are in. Defaults to `USD`. */
  currency?: string;
  /** The statement's name, read as the table's caption ("Profit and loss, 2026"). */
  caption: string;
  /** Shows the caption above the table; it is read either way. */
  captionVisible?: boolean;
  /** The header of the label column. Defaults to "Item". */
  labelHeader?: string;
  /** The BCP 47 locale the amounts are written in, such as `de-DE`. Defaults to `en-US`. This component can render from a Server Component, so it takes the prop alone and reads no LocaleProvider. */
  locale?: string;
  /** Row density: `compact` for a statement in a side panel. */
  size?: 'default' | 'compact';
  /** Additional CSS classes */
  className?: string;
};

export interface StatementProps extends StatementOwnProps, Omit<React.ComponentPropsWithoutRef<'table'>, keyof StatementOwnProps | 'children'> {}

/**
 * A financial statement: titled sections of lines, each with its total, and
 * the subtotals that run between them down to a bottom line, in one column
 * per period. A profit and loss, a cash flow, a budget against actuals. The
 * sums are decimal arithmetic, so no amount drifts by a cent. A Table
 * underneath, so it reads, scrolls and themes as every table does.
 * Server-renderable.
 */
export const Statement = React.forwardRef<HTMLTableElement, StatementProps>(
  (
    {
      periods,
      items,
      currency = 'USD',
      caption,
      captionVisible = false,
      labelHeader = 'Item',
      locale = DEFAULT_LOCALE,
      size = 'default',
      className = '',
      ...rest
    },
    ref,
  ) => {
    const money = (value: DecimalString) => formatMoney(value, { currency, locale });
    const periodKey = (index: number) => `p${index}`;
    const columns: TableColumn[] = [
      { key: 'label', header: labelHeader, rowHeader: true },
      ...periods.map((period, index) => ({ key: periodKey(index), header: period, align: 'end' as const })),
    ];
    const amountsCells = (amounts: DecimalString[]) =>
      Object.fromEntries(periods.map((_, index) => [periodKey(index), money(amounts[index] ?? '0')]));

    const rows: TableRow[] = [];
    // The running total of every section so far, per period, each by its sign.
    let running: DecimalString[] = periods.map(() => '0');
    for (const item of items) {
      if (item.kind === 'section') {
        rows.push({ id: item.id, variant: 'heading', cells: { label: item.title } });
        for (const line of item.lines) {
          rows.push({
            id: `${item.id}-${line.id}`,
            cells: { label: <span className="ds-statement__line">{line.label}</span>, ...amountsCells(line.amounts) },
          });
        }
        const totals = periods.map((_, index) => sumDecimal(item.lines.map((line) => line.amounts[index] ?? '0')));
        if (item.totalLabel) {
          rows.push({ id: `${item.id}-total`, variant: 'total', cells: { label: item.totalLabel, ...amountsCells(totals) } });
        }
        const sign = item.sign ?? 1;
        running = running.map((value, index) => sumDecimal([value, multiplyDecimal(totals[index], String(sign))]));
      } else {
        rows.push({ id: item.id, variant: 'total', cells: { label: item.label, ...amountsCells(running) } });
      }
    }

    const classes = ['ds-statement', className].filter(Boolean).join(' ');
    return (
      <Table
        {...rest}
        ref={ref}
        className={classes}
        columns={columns}
        rows={rows}
        caption={caption}
        captionHidden={!captionVisible}
        size={size}
      />
    );
  },
);

Statement.displayName = 'Statement';
