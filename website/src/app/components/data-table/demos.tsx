"use client";

import { useState } from "react";
import {
  DataTable,
  periodColumns,
  totalOf,
  type DataTableCellEdit,
  type DataTableColumn,
  type DataTableRow,
  type DataTableView,
} from "rift-ds/components/DataTable/DataTable";
import { Button } from "rift-ds/components/Button/Button";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import { TableToolbar, type TableToolbarCommand, type TableToolbarView  } from "rift-ds/components/TableToolbar/TableToolbar";
import styles from "./page.module.css";

/* Fictional accounts, typed columns and no render functions: each column's
   type draws, aligns, sorts and filters it. Every demo on the page reads
   from these, so the page shows one table growing rather than ten. */

const PEOPLE = ["Priya Shah", "Sam Rivera", "Jordan Lee", "Lee Chen", "Alex Morgan"];
const ACCOUNTS = ["Northwind", "Fabrikam", "Contoso", "Tailspin", "Litware", "Adatum", "Proseware", "Woodgrove"];
const TAGS = ["enterprise", "renewal", "pilot", "upsell", "new"];

export const STAGES = [
  { value: "lead", label: "Lead", status: "neutral" as const },
  { value: "trial", label: "Trial", status: "info" as const },
  { value: "proposal", label: "Proposal", status: "warning" as const },
  { value: "won", label: "Won", status: "positive" as const },
  { value: "lost", label: "Lost", status: "error" as const },
];

export const accountColumns: DataTableColumn[] = [
  { key: "account", header: "Account", type: "text", rowHeader: true, sortable: true, width: "150px" },
  { key: "stage", header: "Stage", type: "status", options: STAGES, sortable: true, groupable: true, width: "130px" },
  {
    key: "owner",
    header: "Owner",
    type: "person",
    options: PEOPLE.map((person) => ({ value: person, label: person })),
    sortable: true,
    groupable: true,
    width: "170px",
  },
  { key: "value", header: "Value", type: "currency", format: { fractionDigits: 0 }, sortable: true, aggregate: "sum", width: "120px" },
  { key: "seats", header: "Seats", type: "number", sortable: true, aggregate: "sum", width: "90px" },
  { key: "onboarded", header: "Onboarded", type: "progress", sortable: true, aggregate: "avg", width: "180px" },
  { key: "renews", header: "Renews", type: "date", sortable: true, width: "130px" },
  { key: "tags", header: "Tags", type: "tags", width: "180px" },
  { key: "billable", header: "Billable", type: "checkbox", sortable: true, width: "120px" },
  { key: "site", header: "Site", type: "link", width: "180px" },
];

/** Fictional accounts, `count` of them; past the named eight the names repeat with a number. */
export const makeAccounts = (count = ACCOUNTS.length): DataTableRow[] =>
  Array.from({ length: count }, (_, i) => {
    const base = ACCOUNTS[i % ACCOUNTS.length];
    const account = i < ACCOUNTS.length ? base : `${base} ${Math.floor(i / ACCOUNTS.length) + 1}`;
    return {
      id: `a${i + 1}`,
      values: {
        account,
        stage: STAGES[i % STAGES.length].value,
        owner: PEOPLE[i % PEOPLE.length],
        value: 4000 + ((i * 7919) % 92000),
        seats: 5 + ((i * 37) % 480),
        onboarded: (i * 23) % 101,
        renews: `2027-${String(((i * 5) % 12) + 1).padStart(2, "0")}-${String(((i * 7) % 27) + 1).padStart(2, "0")}`,
        tags: TAGS.filter((_, t) => (i + t) % 3 === 0),
        billable: i % 3 !== 1,
        site: `https://www.${base.toLowerCase()}.example/`,
      },
    };
  });

const ACCOUNTS_ROWS = makeAccounts();
const pick = (...keys: string[]) => accountColumns.filter((col) => keys.includes(col.key));

/** The whole table: typed columns, the control bar, selection and paging. */
export function OverviewDemo() {
  return (
    <DataTable
      columns={accountColumns}
      rows={makeAccounts(16)}
      selectable
      columnMenu
      multiSort
      pageSize={5}
      caption="Accounts"
      toolbar={
        <TableToolbar
          bulkActions={[
            { id: "assign", label: "Assign owner", icon: "person_add", onSelect: () => {} },
            { id: "delete", label: "Delete", icon: "delete", destructive: true, onSelect: () => {} },
          ]}
          primaryAction={{
            id: "new",
            label: "New account",
            icon: "add",
            onSelect: () => {},
            menu: [{ id: "import", label: "Import", icon: "upload", onSelect: () => {} }],
          }}
        />
      }
    />
  );
}

/** Every column type, one column each. */
/**
 * A stand-in for a handler that calls a model, so the command can be tried here
 * for free: it reads a stage or "biggest" out of the sentence, says when it can do
 * neither, and fails on request. Your handler would turn any sentence into a view.
 */
const DEMO_COMMAND: TableToolbarCommand = {
  onSubmit: async ({ text, view }) => {
    const asked = text.toLowerCase();
    if (asked.includes("fail")) throw new Error("The stand-in failed on request. The table has not changed.");
    const stage = STAGES.find((option) => asked.includes(option.label.toLowerCase()));
    if (stage)
      return {
        view: { ...view, filters: [{ id: "stage-1", column: "stage", operator: "isAnyOf", value: [stage.value] }] },
        message: `The table now shows ${stage.label} accounts.`,
      };
    if (/big|large|value/.test(asked))
      return { view: { ...view, sorts: [{ key: "value", direction: "desc" }] }, message: "The biggest accounts now come first." };
    return { message: "This stand-in only knows the stages and biggest first. Your handler would call a model." };
  },
};

/** The AI command: Describe takes the bar's row, and the sentence becomes a view. */
export function CommandDemo() {
  return (
    <DataTable
      columns={accountColumns}
      rows={makeAccounts(16)}
      columnMenu
      multiSort
      pageSize={5}
      caption="Accounts, with an AI command"
      toolbar={
        <TableToolbar
          command={DEMO_COMMAND}
          labels={{ commandPlaceholder: "Try: biggest first, a stage such as Won, or fail" }}
        />
      }
    />
  );
}

export function TypesDemo() {
  return <DataTable columns={accountColumns} rows={ACCOUNTS_ROWS.slice(0, 4)} caption="Accounts, every column type" />;
}

/** Resize, move, pin and hide, from the header and its menu. */
export function ColumnsDemo() {
  return (
    <DataTable
      columns={accountColumns.map((col) => (col.key === "account" ? { ...col, pin: "start" as const } : col))}
      rows={ACCOUNTS_ROWS.slice(0, 4)}
      columnMenu
      resizableColumns
      reorderableColumns
      columnDividers
      caption="Accounts, columns to arrange"
    />
  );
}

/** The frameless look, with the row checkbox hung as the outer control. */
export function FramelessDemo() {
  return (
    <DataTable
      columns={pick("account", "owner", "stage", "value")}
      rows={ACCOUNTS_ROWS.slice(0, 5)}
      frameless
      outerControl
      selectable
      defaultSelectedIds={[ACCOUNTS_ROWS[1].id, ACCOUNTS_ROWS[2].id]}
      caption="Accounts, frameless"
    />
  );
}

/** Edit a cell in place; the rows live in this component's state. */
export function EditingDemo() {
  const [rows, setRows] = useState(() => ACCOUNTS_ROWS.slice(0, 4));
  const [mode, setMode] = useState<"cell" | "row">("cell");
  const onCellEdit = ({ row, key, value }: DataTableCellEdit) =>
    setRows((current) => current.map((r) => (r.id === row.id ? { ...r, values: { ...r.values, [key]: value } } : r)));
  return (
    <div className={styles.demoStack}>
      <SegmentedControl
        size="compact"
        aria-label="Editing mode"
        segments={[
          { value: "cell", label: "Cell editing" },
          { value: "row", label: "Row editing" },
        ]}
        value={mode}
        onValueChange={(value) => setMode(value as "cell" | "row")}
      />
      <DataTable
        columns={pick("account", "stage", "owner", "value", "renews", "billable").map((col) =>
          col.key === "account" ? col : { ...col, editable: true },
        )}
        rows={rows}
        editMode={mode}
        onCellEdit={onCellEdit}
        onRowEdit={({ row, values }) =>
          setRows((current) => current.map((r) => (r.id === row.id ? { ...r, values: { ...r.values, ...values } } : r)))
        }
        caption="Accounts, editable"
      />
    </div>
  );
}

/** Grouped by stage, each group with its totals, and a totals footer. */
export function GroupingDemo() {
  return (
    <DataTable
      columns={pick("account", "stage", "owner", "value", "seats", "onboarded")}
      rows={makeAccounts(12)}
      defaultGrouping={["stage"]}
      totalsRow
      selectable
      columnMenu
      caption="Accounts by stage"
    />
  );
}

/** A chevron opens a row's details beneath it. */
export function DetailsDemo() {
  return (
    <DataTable
      columns={pick("account", "stage", "owner", "value")}
      rows={ACCOUNTS_ROWS.slice(0, 4)}
      defaultExpandedIds={["a1"]}
      renderDetail={(row) => (
        <p className={styles.detail}>
          {String(row.values.account)} has {String(row.values.seats)} seats and is{" "}
          {String(row.values.onboarded)}% onboarded. Its tags are{" "}
          {(row.values.tags as string[]).join(", ") || "none"}.
        </p>
      )}
      caption="Accounts with details"
    />
  );
}

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
  { id: "owner", label: "By owner", view: { version: 1, grouping: ["owner"], hiddenColumns: ["tags", "site"] } },
];

/** Saved views as tabs over the bar. */
export function ViewsDemo() {
  return (
    <DataTable
      columns={accountColumns}
      rows={makeAccounts(12)}
      columnMenu
      multiSort
      caption="Accounts, saved views"
      toolbar={<TableToolbar defaultViews={VIEWS} />}
    />
  );
}

const MANY = makeAccounts(5000);
/* A pause standing in for the network, so the refetch line is seen. */
const FAKE_LATENCY = 700;

/** Five thousand rows, only those in view drawn. */
export function ScaleDemo() {
  return (
    <DataTable
      columns={accountColumns}
      rows={MANY}
      maxHeight={420}
      selectable
      multiSort
      caption="Five thousand accounts"
      toolbar={<TableToolbar />}
    />
  );
}

/** The same table at a phone's width, as a scroll or as cards. */
export function PhoneDemo() {
  const [layout, setLayout] = useState<"scroll" | "stack">("stack");
  return (
    <div className={styles.demoStack}>
      <SegmentedControl
        size="compact"
        aria-label="Phone layout"
        segments={[
          { value: "stack", label: "Stack" },
          { value: "scroll", label: "Scroll" },
        ]}
        value={layout}
        onValueChange={(value) => setLayout(value as "scroll" | "stack")}
      />
      <div className={styles.phoneFrame}>
        <DataTable
          columns={pick("account", "stage", "owner", "value", "renews")}
          rows={ACCOUNTS_ROWS.slice(0, 3)}
          phoneLayout={layout}
          selectable
          caption="Accounts on a phone"
        />
      </div>
    </div>
  );
}

/** Server mode on a fake server: the table reports, this fetches. */
export function ServerDemo() {
  const ALL = MANY.slice(0, 120);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(() => ALL.slice(0, 5));
  const [loading, setLoading] = useState(false);
  const goTo = (next: number) => {
    setPage(next);
    setLoading(true);
    window.setTimeout(() => {
      setRows(ALL.slice((next - 1) * 5, next * 5));
      setLoading(false);
    }, FAKE_LATENCY);
  };
  return (
    <DataTable
      manual
      columns={pick("account", "stage", "owner", "value")}
      rows={rows}
      rowCount={ALL.length}
      loading={loading}
      page={page}
      onPageChange={goTo}
      pageSize={5}
      caption="Accounts from a server"
    />
  );
}

/* Stock counted across four weeks: one editable, summed column a week,
   a total across each row, a subtotal per site and the sum down. */
const WEEKS = periodColumns({
  start: "2026-03-02",
  count: 4,
  unit: "week",
  keyPrefix: "w:",
  column: { type: "number", align: "end", editable: true, aggregate: "sum", minWidth: 96 },
});
const WEEK_KEYS = WEEKS.map((column) => column.key);
const STOCK_COLUMNS: DataTableColumn[] = [
  { key: "site", header: "Site", rowHeader: true, groupable: true, pin: "start" },
  { key: "range", header: "Range" },
  ...WEEKS,
  { key: "total", header: "Total", type: "number", align: "end", compute: totalOf(WEEK_KEYS), aggregate: "sum", pin: "end" },
];
const STOCK_ROWS: DataTableRow[] = (
  [
    ["North depot", "Ambient", [120, 132, 118, 140]],
    ["North depot", "Chilled", [64, 58, 71, 66]],
    ["South depot", "Ambient", [98, 104, 110, 101]],
    ["South depot", "Chilled", [40, 45, 39, 52]],
  ] as const
).map(([site, range, counts], index) => ({
  id: `s${index + 1}`,
  values: { site, range, ...Object.fromEntries(WEEK_KEYS.map((key, i) => [key, counts[i]])) },
}));

/** A run of periods as columns, with totals across, by group and down. */
export function PeriodsDemo() {
  const [rows, setRows] = useState(STOCK_ROWS);
  return (
    <DataTable
      caption="Stock counted by week"
      columns={STOCK_COLUMNS}
      rows={rows}
      defaultGrouping={["site"]}
      totalsRow
      onCellEdit={({ row: edited, key, value }: DataTableCellEdit) =>
        setRows((current) => current.map((row) => (row.id === edited.id ? { ...row, values: { ...row.values, [key]: value } } : row)))
      }
    />
  );
}

/** The whole setup held outside the table, set from buttons and handed back. */
export function ControlledViewDemo() {
  const [view, setView] = useState<DataTableView>({ version: 1 });
  return (
    <div className={styles.controlledView}>
      <div className={styles.controlledViewButtons}>
        <Button
          variant="secondary"
          size="compact"
          label="Highest value first"
          onClick={() => setView({ version: 1, sorts: [{ key: "value", direction: "desc" }], search: "" })}
        />
        <Button variant="secondary" size="compact" label="Reset" onClick={() => setView({ version: 1 })} />
      </div>
      <DataTable columns={accountColumns} rows={makeAccounts(12)} caption="Accounts, view held outside" view={view} onViewChange={setView} />
    </div>
  );
}
