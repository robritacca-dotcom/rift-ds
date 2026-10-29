"use client";

import { DataTable, type DataTableCellEdit, type DataTableColumn } from "rift-ds/components/DataTable/DataTable";
import { TableToolbar } from "rift-ds/components/TableToolbar/TableToolbar";
import { typedColumns, useTypedRows } from "./TypedTable";

/* The typed accounts, grouped: Stage and Owner can group the rows (from a
   header menu or the bar's Group control), the figures total per group,
   and the footer's cells each pick their own calculation. */
const AGGREGATES: Record<string, DataTableColumn["aggregate"]> = {
  value: "sum",
  seats: "sum",
  onboarded: "avg",
  renews: "count",
};

const columns: DataTableColumn[] = typedColumns.map((col) => ({
  ...col,
  groupable: col.key === "stage" || col.key === "owner" || col.key === "billable",
  aggregate: AGGREGATES[col.key],
}));

export function GroupedTable({ size, lines }: { size: "default" | "compact"; lines: boolean }) {
  const [rows, setRows] = useTypedRows();
  const onCellEdit = ({ row, key, value }: DataTableCellEdit) =>
    setRows((current) => current.map((r) => (r.id === row.id ? { ...r, values: { ...r.values, [key]: value } } : r)));
  return (
    <DataTable
      columns={columns}
      rows={rows}
      size={size}
      columnDividers={lines}
      columnMenu
      selectable
      multiSort
      totalsRow
      defaultGrouping={["stage"]}
      onCellEdit={onCellEdit}
      caption="Accounts by stage"
      toolbar={<TableToolbar />}
    />
  );
}
