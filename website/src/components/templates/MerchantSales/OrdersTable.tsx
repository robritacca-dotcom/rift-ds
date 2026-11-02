"use client";

/**
 * The merchant sales table. The rows are built in the browser, because the server
 * would build all of them just to draw a first page, so the static HTML and the
 * moment before the effect runs draw the table's own skeleton rows. It opens on the
 * month the KPI band reports, as a date filter the reader can change, and shows a
 * merchant's columns of the ledger's many. The rest wait in the Columns panel, and
 * Describe reaches all of them through the same model route as the labs bench. The
 * screen's chat drives the table too, through the bridge below.
 */

import { memo, useEffect, useState, type RefObject } from "react";
import { Badge } from "rift-ds/components/Badge/Badge";
import { DataTable, type DataTableColumn, type DataTableRow } from "rift-ds/components/DataTable/DataTable";
import { TableToolbar } from "rift-ds/components/TableToolbar/TableToolbar";
import { COLUMN_KEYS, LEDGER_COLUMNS, ledgerRows } from "@/data/order-ledger";
import { MERCHANT_OPENING_FILTER, MERCHANT_OPENING_SORT, MERCHANT_SHOWN_COLUMNS } from "@/data/merchant-sales";
import { askOrderLedger } from "@/lib/order-ledger-command";
import { useTableContext } from "../../../../../src/components/DataTable/tableContext";
import type { TableBridge } from "./MerchantChat";
import styles from "./MerchantSales.module.css";

const SHOWN = MERCHANT_SHOWN_COLUMNS;
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

/* Keeps the chat's hold on the table current. It renders nothing, and sits in the toolbar slot because that is inside the table's context. */
function TableBridgeSeat({ bridge: bridgeRef }: { bridge: RefObject<TableBridge | null> }) {
  const table = useTableContext();
  useEffect(() => {
    bridgeRef.current = table;
  });
  return null;
}

function OrdersTable({ bridge }: { bridge: RefObject<TableBridge | null> }) {
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
      defaultFilters={[MERCHANT_OPENING_FILTER]}
      defaultSort={MERCHANT_OPENING_SORT}
      selectable
      multiSort
      columnMenu
      resizableColumns
      reorderableColumns
      phoneLayout="stack"
      toolbar={
        <>
        <TableBridgeSeat bridge={bridge} />
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
        </>
      }
    />
  );
}

/* Memoised because the screen around it re-renders with the chat, on every streamed word, and 20,000 rows must not follow. */
export default memo(OrdersTable);
