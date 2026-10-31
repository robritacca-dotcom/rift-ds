"use client";

/**
 * The merchant sales table, in its own module because it is browser only: the
 * server would build all the rows just to draw a first page. It opens on the
 * month the KPI band reports, as a date filter the reader can change, and shows a
 * merchant's columns of the ledger's many. The rest wait in the Columns panel, and
 * Describe reaches all of them through the same model route as the labs bench.
 */

import { useMemo } from "react";
import { DataTable, type DataTableColumn } from "rift-ds/components/DataTable/DataTable";
import { TableToolbar } from "rift-ds/components/TableToolbar/TableToolbar";
import { COLUMN_KEYS, LEDGER_COLUMNS, ledgerRows } from "@/data/order-ledger";
import { askOrderLedger } from "@/lib/order-ledger-command";

const SHOWN = [
  "orderId",
  "placedOn",
  "product",
  "category",
  "customer",
  "channel",
  "status",
  "payment",
  "units",
  "netRevenue",
  "marginPct",
  "carrier",
  "daysLate",
];
const HIDDEN = COLUMN_KEYS.filter((key) => !SHOWN.includes(key));
/* A column's own defaultHidden would hide it whatever the table is told, so this screen's choice replaces the ledger's. */
const COLUMNS = (LEDGER_COLUMNS as unknown as DataTableColumn[]).map((col) => ({
  ...col,
  defaultHidden: HIDDEN.includes(col.key),
}));

export default function OrdersTable() {
  const rows = useMemo(() => ledgerRows(), []);
  return (
    <DataTable
      columns={COLUMNS}
      rows={rows}
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
