"use client";

import { useState } from "react";
import {
  DataTable,
  type DataTableCellEdit,
  type DataTableColumn,
  type DataTableRow,
} from "rift-ds/components/DataTable/DataTable";
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
  { key: "value", header: "Value", type: "currency", sortable: true, aggregate: "sum", width: "120px" },
  { key: "seats", header: "Seats", type: "number", sortable: true, aggregate: "sum", width: "90px" },
  { key: "onboarded", header: "Onboarded", type: "progress", sortable: true, aggregate: "avg", width: "150px" },
  { key: "renews", header: "Renews", type: "date", sortable: true, width: "130px" },
  { key: "tags", header: "Tags", type: "tags", width: "180px" },
  { key: "billable", header: "Billable", type: "checkbox", sortable: true, width: "90px" },
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
