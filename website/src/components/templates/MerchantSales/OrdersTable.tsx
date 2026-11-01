"use client";

/**
 * The merchant sales table. The rows are built in the browser, because the server
 * would build all of them just to draw a first page, so the static HTML and the
 * moment before the effect runs draw the table's own skeleton rows. It opens on the
 * month the KPI band reports, as a date filter the reader can change, and shows a
 * merchant's columns of the ledger's many. The rest wait in the Columns panel, and
 * Describe reaches all of them through the same model route as the labs bench.
 */

import { useEffect, useState } from "react";
import { Badge } from "rift-ds/components/Badge/Badge";
import { DataTable, type DataTableColumn, type DataTableRow } from "rift-ds/components/DataTable/DataTable";
import { TableToolbar } from "rift-ds/components/TableToolbar/TableToolbar";
import { COLUMN_KEYS, LEDGER_COLUMNS, ledgerRows } from "@/data/order-ledger";
import { askOrderLedger } from "@/lib/order-ledger-command";
import styles from "./MerchantSales.module.css";

const SHOWN = [
  "orderId",
  "placedOn",
  "product",
  "category",
  "customer",
  "channel",
  "status",
  "units",
  "netRevenue",
  "marginPct",
  "carrier",
  "daysLate",
];
const HIDDEN = COLUMN_KEYS.filter((key) => !SHOWN.includes(key));

/* One column for where an order stands: its status as the badge, its payment in words beside it. Payment stays in the Columns panel and in reach of Describe. */
const withPayment = (col: DataTableColumn): DataTableColumn => ({
  ...col,
  width: "210px",
  render: (row: DataTableRow) => {
    const status = String(row.values.status);
    return (
      <span className={styles.statusCell}>
        <Badge label={status} variant={col.options?.find((option) => option.value === status)?.status} />
        <span className={styles.statusPayment}>{String(row.values.payment)}</span>
      </span>
    );
  },
});

/* A column's own defaultHidden would hide it whatever the table is told, so this screen's choice replaces the ledger's. */
const COLUMNS = (LEDGER_COLUMNS as unknown as DataTableColumn[]).map((col) => ({
  ...(col.key === "status" ? withPayment(col) : col),
  defaultHidden: HIDDEN.includes(col.key),
}));

export default function OrdersTable() {
  const [rows, setRows] = useState<ReturnType<typeof ledgerRows> | null>(null);
  useEffect(() => {
    /* A task of its own, so the skeleton paints before the build holds the thread. */
    const task = setTimeout(() => setRows(ledgerRows()));
    return () => clearTimeout(task);
  }, []);
  return (
    <DataTable
      columns={COLUMNS}
      rows={rows ?? []}
      loading={rows === null}
      caption="Orders"
      defaultColumnOrder={[...SHOWN, ...HIDDEN]}
      defaultHiddenColumns={HIDDEN}
      defaultPageSize={25}
      defaultFilters={[{ id: "placedOn-1", column: "placedOn", operator: "after", value: "2026-09-30" }]}
      defaultSort={{ key: "placedOn", direction: "desc" }}
      selectable
      multiSort
      columnMenu
      resizableColumns
      reorderableColumns
      phoneLayout="stack"
      toolbar={
        <TableToolbar
          command={{
            onSubmit: async (request) => {
              const { view, message } = await askOrderLedger(request);
              return { view, message };
            },
          }}
          labels={{ commandPlaceholder: "Overdue orders over $50,000, largest first" }}
          bulkActions={[
            { id: "fulfil", label: "Mark fulfilled", icon: "local_shipping", onSelect: () => {} },
            { id: "labels", label: "Print labels", icon: "print", onSelect: () => {} },
            { id: "export", label: "Export", icon: "download", onSelect: () => {} },
            { id: "refund", label: "Refund", icon: "undo", destructive: true, onSelect: () => {} },
          ]}
        />
      }
    />
  );
}
