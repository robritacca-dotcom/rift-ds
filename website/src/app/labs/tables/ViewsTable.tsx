"use client";

import { useState } from "react";
import { DataTable, type DataTableColumn } from "rift-ds/components/DataTable/DataTable";
import { TableToolbar, type TableToolbarView } from "rift-ds/components/TableToolbar/TableToolbar";
import { makeTypedRows, typedColumns } from "./TypedTable";

/* The typed accounts with three saved views: all of them, the open
   pipeline (a filter and a sort), and by owner (grouped, two columns
   hidden). The views live in this component's state, as an app would keep
   them in its store. */
const columns: DataTableColumn[] = typedColumns.map((col) => ({
  ...col,
  groupable: col.key === "stage" || col.key === "owner",
  aggregate: col.key === "value" ? "sum" : undefined,
}));

const VIEWS: TableToolbarView[] = [
  { id: "all", label: "All accounts", view: { version: 1 } },
  {
    id: "open",
    label: "Open pipeline",
    view: {
      version: 1,
      filters: [{ id: "stage-1", column: "stage", operator: "isAnyOf", value: ["lead", "trial", "proposal"] }],
      sorts: [{ key: "value", direction: "desc" }],
    },
  },
  {
    id: "owner",
    label: "By owner",
    view: { version: 1, grouping: ["owner"], hiddenColumns: ["team", "site", "contacted"] },
  },
];

export function ViewsTable({ size, lines }: { size: "default" | "compact"; lines: boolean }) {
  const [rows] = useState(makeTypedRows);
  return (
    <DataTable
      columns={columns}
      rows={rows}
      size={size}
      columnDividers={lines}
      columnMenu
      multiSort
      caption="Accounts"
      toolbar={<TableToolbar defaultViews={VIEWS} />}
    />
  );
}
