"use client";

import { useState } from "react";
import { Badge } from "rift-ds/components/Badge/Badge";
import {
  DataTable,
  type DataTableCellEdit,
  type DataTableColumn,
  type DataTableRow,
  type DataTableRowEdit,
} from "rift-ds/components/DataTable/DataTable";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import styles from "./TablesBench.module.css";

/* Every editor kind, on fictional tasks. The rows live in this component's
   state, as an app's would: the table only reports edits. */

const PEOPLE = [
  "Priya Shah",
  "Sam Rivera",
  "Jordan Lee",
  "Lee Chen",
  "Alex Morgan",
];
const STATUS = {
  todo: "Todo",
  doing: "Doing",
  review: "In review",
  done: "Done",
} as const;
const STATUS_ROLE = {
  todo: "neutral",
  doing: "info",
  review: "warning",
  done: "positive",
} as const;
const REGIONS = ["North", "South", "East", "West", "Central"];

const options = (values: string[]) =>
  values.map((value) => ({ value, label: value }));

const TASKS = [
  "Draft the launch post",
  "Fix the invoice totals",
  "Review the pricing copy",
  "Ship the export button",
  "Tidy the onboarding emails",
  "Book the customer calls",
];

const initialRows: DataTableRow[] = TASKS.map((name, i) => ({
  id: `t${i + 1}`,
  values: {
    name,
    owner: PEOPLE[i % PEOPLE.length],
    status: (Object.keys(STATUS) as (keyof typeof STATUS)[])[i % 4],
    region: REGIONS[i % REGIONS.length],
    budget: 4000 + i * 3500,
    tags: i % 2 ? ["web", "launch"] : ["billing"],
    watchers: [PEOPLE[(i + 1) % PEOPLE.length]],
    due: `2026-11-${String(3 + i * 4).padStart(2, "0")}`,
    time: ["09:00", "10:30", "14:00", "16:15"][i % 4],
    note: "Waiting on the carrier to confirm the delivery window.",
    done: i % 3 === 0,
    billable: i % 2 === 0,
  },
}));

/** How long the bench's fictional server takes to answer a save. */
const SAVE_DELAY_MS = 700;
/** Budgets above this fail to save, to show the rollback. */
const BUDGET_SAVE_LIMIT = 100000;

const columns: DataTableColumn[] = [
  {
    key: "name",
    header: "Task",
    rowHeader: true,
    width: "220px",
    cellText: "truncate",
    editor: "text",
    validate: (value) =>
      String(value ?? "").trim() ? undefined : "A task needs a name",
  },
  {
    key: "owner",
    header: "Owner",
    width: "170px",
    editor: "select",
    options: options(PEOPLE),
  },
  {
    key: "status",
    header: "Status",
    width: "140px",
    editor: "select",
    options: Object.entries(STATUS).map(([value, label]) => ({ value, label })),
    render: (row) => {
      const status = row.values.status as keyof typeof STATUS;
      return <Badge label={STATUS[status]} variant={STATUS_ROLE[status]} />;
    },
  },
  {
    key: "region",
    header: "Region",
    width: "150px",
    editor: "combobox",
    options: options(REGIONS),
  },
  {
    key: "budget",
    header: "Budget",
    width: "140px",
    align: "end",
    editor: "number",
    render: (row) =>
      typeof row.values.budget === "number"
        ? `$${row.values.budget.toLocaleString("en-US")}`
        : "",
    validate: (value) =>
      typeof value === "number" && value < 0
        ? "Budget cannot be negative"
        : undefined,
  },
  {
    key: "tags",
    header: "Tags",
    width: "200px",
    editor: "tags",
    cellText: "truncate",
  },
  {
    key: "watchers",
    header: "Watchers",
    width: "220px",
    editor: "multiselect",
    options: options(PEOPLE),
    cellText: "truncate",
  },
  { key: "due", header: "Due", width: "160px", editor: "date" },
  { key: "time", header: "Time", width: "140px", editor: "time" },
  {
    key: "note",
    header: "Note",
    width: "240px",
    editor: "textarea",
    cellText: "truncate",
  },
  {
    key: "done",
    header: "Done",
    width: "90px",
    align: "center",
    editor: "checkbox",
  },
  {
    key: "billable",
    header: "Billable",
    width: "100px",
    align: "center",
    editor: "switch",
  },
];

export function EditingTable({
  size,
  lines,
}: {
  size: "default" | "compact";
  lines: boolean;
}) {
  const [rows, setRows] = useState(initialRows);
  const [mode, setMode] = useState<"cell" | "row">("cell");

  const apply = (id: string, values: DataTableRow["values"]) =>
    setRows((current) =>
      current.map((row) =>
        row.id === id ? { ...row, values: { ...row.values, ...values } } : row,
      ),
    );

  /* A fictional server: budgets save after a moment, and fail past the
     limit; everything else saves at once. */
  const persist = (id: string, values: DataTableRow["values"]) => {
    if (!("budget" in values)) {
      apply(id, values);
      return;
    }
    return new Promise<void>((resolve, reject) =>
      setTimeout(() => {
        if (
          typeof values.budget === "number" &&
          values.budget > BUDGET_SAVE_LIMIT
        )
          reject(new Error("over the limit"));
        else {
          apply(id, values);
          resolve();
        }
      }, SAVE_DELAY_MS),
    );
  };

  return (
    <div className={styles.editing}>
      <SegmentedControl
        size="compact"
        aria-label="Edit mode"
        segments={[
          { value: "cell", label: "Cell editing" },
          { value: "row", label: "Row editing" },
        ]}
        value={mode}
        onValueChange={(value) => setMode(value as "cell" | "row")}
      />
      <DataTable
        size={size}
        columnDividers={lines}
        columns={columns}
        rows={rows}
        editMode={mode}
        resizableColumns
        caption="Editable tasks"
        onCellEdit={({ row, key, value }: DataTableCellEdit) =>
          persist(row.id, { [key]: value })
        }
        onRowEdit={({ row, values }: DataTableRowEdit) =>
          persist(row.id, values)
        }
      />
    </div>
  );
}
