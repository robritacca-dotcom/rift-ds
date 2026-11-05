"use client";

/**
 * The merchant sales table. The rows are built in the browser, because the server
 * would build all of them just to draw a first page, so the static HTML and the
 * moment before the effect runs draw the table's own skeleton rows. It opens on the
 * month the KPI band reports, as a date filter the reader can change, and shows a
 * merchant's columns of the ledger's many. The rest wait in the Columns panel, and
 * Describe reaches all of them through the same model route as the labs bench. The
 * screen's chat drives the table too, through the bridge below, and follows the
 * ticked rows through onSelectionChange and how far the table is narrowed.
 */

import { memo, useEffect, useMemo, useState, type RefObject } from "react";
import { Badge } from "rift-ds/components/Badge/Badge";
import { DataTable, type DataTableColumn, type DataTableRow } from "rift-ds/components/DataTable/DataTable";
import { TableToolbar } from "rift-ds/components/TableToolbar/TableToolbar";
import { COLUMN_KEYS, LEDGER_COLUMNS, ledgerRows } from "@/data/order-ledger";
import { MERCHANT_OPENING_FILTER, MERCHANT_OPENING_SORT, MERCHANT_SHOWN_COLUMNS } from "@/data/merchant-sales";
import { askOrderLedger } from "@/lib/order-ledger-command";
import { useTableContext } from "../../../../../src/components/DataTable/tableContext";
import type { TableBridge } from "./MerchantChat";
import type { PageView } from "./chatFocus";
import { ORDER_ACTIONS, withEdit, type OrderActionId, type OrderEdits } from "@/lib/order-actions";
import type { TableToolbarSelection } from "rift-ds/components/TableToolbar/TableToolbar";
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

/* The table as it opens: a search or any other filter narrows it from there. */
const OPENING_FILTERS = JSON.stringify([MERCHANT_OPENING_FILTER].map(({ column, operator, value }) => ({ column, operator, value })));
const narrowed = (view: TableBridge["view"]) =>
  (view.search ?? "").trim() !== "" || JSON.stringify((view.filters ?? []).map(({ column, operator, value }) => ({ column, operator, value }))) !== OPENING_FILTERS;

/* Keeps the chat's hold on the table current, and tells it how far the table is narrowed. It renders nothing, and sits in the toolbar slot because that is inside the table's context. */
function TableBridgeSeat({ bridge: bridgeRef, onPageView }: { bridge: RefObject<TableBridge | null>; onPageView: (view: PageView) => void }) {
  const table = useTableContext();
  useEffect(() => {
    bridgeRef.current = table;
  });
  const filtered = table ? narrowed(table.view) : false;
  const count = table?.matchingCount ?? 0;
  useEffect(() => {
    onPageView({ filtered, count });
  }, [onPageView, filtered, count]);
  return null;
}

function OrdersTable({
  bridge,
  onSelectionChange,
  onPageView,
  onAsk,
  edits,
  onAction,
}: {
  bridge: RefObject<TableBridge | null>;
  onSelectionChange: (ids: string[]) => void;
  onPageView: (view: PageView) => void;
  /** Opens the assistant on the ticked rows, from the selection bar. */
  onAsk: () => void;
  /** The page's edits, drawn over the seeded rows. */
  edits: OrderEdits;
  /** Runs an order action on the selection, from the bar. */
  onAction: (action: OrderActionId, selection: TableToolbarSelection) => void;
}) {
  const [rows, setRows] = useState<ReturnType<typeof ledgerRows> | null>(null);
  useEffect(() => {
    /* A task of its own, so the skeleton paints before the build holds the thread. */
    const task = setTimeout(() => setRows(ledgerRows()));
    return () => clearTimeout(task);
  }, []);
  /* The order actions come from their one definition, the chat's too. */
  const barAction = (id: OrderActionId) => {
    const action = ORDER_ACTIONS[id];
    return { id, label: action.label, icon: action.icon, destructive: action.destructive, onSelect: (selection: TableToolbarSelection) => onAction(id, selection) };
  };
  /* Only the edited orders are copied; the rest keep their identity, so the table re-renders what changed. */
  const shown = useMemo(
    () => rows?.map((row) => (edits[row.id] ? { ...row, values: withEdit(row.values, edits[row.id]) } : row)) ?? [],
    [rows, edits],
  );
  return (
    <DataTable
      columns={COLUMNS}
      rows={shown}
      loading={rows === null}
      caption="Orders"
      defaultColumnOrder={[...SHOWN, ...HIDDEN]}
      defaultHiddenColumns={HIDDEN}
      defaultPageSize={25}
      defaultFilters={[MERCHANT_OPENING_FILTER]}
      defaultSort={MERCHANT_OPENING_SORT}
      selectable
      onSelectionChange={onSelectionChange}
      multiSort
      columnMenu
      resizableColumns
      reorderableColumns
      phoneLayout="stack"
      toolbar={
        <>
        <TableBridgeSeat bridge={bridge} onPageView={onPageView} />
        <TableToolbar
          command={{
            onSubmit: async (request) => {
              const { view, message } = await askOrderLedger(request);
              return { view, message };
            },
          }}
          labels={{ commandPlaceholder: "Overdue orders over $50,000, largest first" }}
          bulkActions={[
            { id: "ask", label: "Ask AI", icon: "auto_awesome", onSelect: onAsk },
            barAction("fulfil"),
            { id: "labels", label: "Print labels", icon: "print", onSelect: () => {} },
            { id: "export", label: "Export", icon: "download", onSelect: () => {} },
            barAction("cancel"),
            barAction("refund"),
          ]}
        />
        </>
      }
    />
  );
}

/* Memoised because the screen around it re-renders with the chat, on every streamed word, and 20,000 rows must not follow. */
export default memo(OrdersTable);
