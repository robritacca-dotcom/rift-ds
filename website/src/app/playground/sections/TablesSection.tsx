"use client";

import styles from "../page.module.css";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import {
  DataTable,
  type DataTableColumn,
  type DataTableRow,
} from "rift-ds/components/DataTable/DataTable";
import { TableToolbar } from "rift-ds/components/TableToolbar/TableToolbar";
import { Table, type TableColumn, type TableRow } from "rift-ds/components/Table/Table";

/* The working table: typed columns so every cell kind the table draws
   (status, person, currency, progress, date, tags) sits under
   one theme at once, with a toolbar, selectable rows and a pager. */
const ACCOUNT_COLUMNS: DataTableColumn[] = [
  { key: "account", header: "Account", type: "text", rowHeader: true, sortable: true },
  {
    key: "stage",
    header: "Stage",
    type: "status",
    sortable: true,
    options: [
      { value: "lead", label: "Lead", status: "neutral" },
      { value: "trial", label: "Trial", status: "info" },
      { value: "won", label: "Won", status: "positive" },
      { value: "at-risk", label: "At risk", status: "warning" },
    ],
  },
  { key: "owner", header: "Owner", type: "person", sortable: true },
  { key: "value", header: "Value", type: "currency", sortable: true },
  { key: "onboarded", header: "Onboarded", type: "progress" },
  { key: "renews", header: "Renews", type: "date", sortable: true },
  { key: "tags", header: "Tags", type: "tags" },
];

const ACCOUNT_ROWS: DataTableRow[] = [
  { id: "a1", values: { account: "Northwind", stage: "won", owner: "Priya Shah", value: 48000, onboarded: 80, renews: "2026-11-04", tags: ["enterprise", "renewal"] } },
  { id: "a2", values: { account: "Fabrikam", stage: "trial", owner: "Avery Chen", value: 12500, onboarded: 35, renews: "2027-01-18", tags: ["self-serve"] } },
  { id: "a3", values: { account: "Contoso", stage: "at-risk", owner: "Jonas Berg", value: 31200, onboarded: 60, renews: "2026-12-02", tags: ["enterprise", "support"] } },
  { id: "a4", values: { account: "Tailspin", stage: "lead", owner: "Mina Okafor", value: 6400, onboarded: 0, renews: "2027-03-09", tags: ["startup"] } },
  { id: "a5", values: { account: "Litware", stage: "won", owner: "Priya Shah", value: 22800, onboarded: 100, renews: "2027-02-21", tags: ["renewal"] } },
  { id: "a6", values: { account: "Proseware", stage: "trial", owner: "Avery Chen", value: 9100, onboarded: 20, renews: "2027-04-30", tags: ["self-serve", "upsell"] } },
  { id: "a7", values: { account: "Adatum", stage: "won", owner: "Jonas Berg", value: 54300, onboarded: 90, renews: "2026-11-27", tags: ["enterprise"] } },
];

/* The reading table: the bordered style a doc page uses, with the
   tokens it carries and what each one re-themes. */
const TOKEN_COLUMNS: TableColumn[] = [
  { key: "lever", header: "Lever", rowHeader: true },
  { key: "token", header: "Token" },
  { key: "reaches", header: "Reaches" },
];

const TOKEN_ROWS: TableRow[] = [
  { id: "t1", cells: { lever: "Action colour", token: <code>--color-action-primary-bg</code>, reaches: "Checkboxes and the current page" } },
  { id: "t2", cells: { lever: "Neutral tint", token: <code>--color-table-header-bg</code>, reaches: "Header fill, selected rows and row lines" } },
  { id: "t3", cells: { lever: "Corner radius", token: <code>--radius-600</code>, reaches: "The bordered container" } },
];

export default function TablesSection() {
  return (
    <section className={styles.demoSection} aria-label="Tables">
      <SectionTitle title="Tables" />
      <p className={styles.sectionNote}>
        Every table draws from one set of tokens, so the header fill, stripes and
        row lines follow the neutral tint, while the checkboxes and the current
        page take the action colour. Sort a column, filter from the toolbar, or select a row to watch
        the bar turn into bulk actions.
      </p>

      <DataTable
        columns={ACCOUNT_COLUMNS}
        rows={ACCOUNT_ROWS}
        caption="Accounts"
        selectable
        defaultSort={{ key: "value", direction: "desc" }}
        pageSize={5}
        toolbar={
          <TableToolbar
            secondaryActions={[
              { id: "export", label: "Export", icon: "download", onSelect: () => {} },
            ]}
            primaryAction={{ id: "new", label: "New account", icon: "add", onSelect: () => {} }}
            bulkActions={[
              { id: "assign", label: "Assign", icon: "person_add", onSelect: () => {} },
              { id: "archive", label: "Archive", icon: "archive", destructive: true, onSelect: () => {} },
            ]}
          />
        }
      />

      <Table
        columns={TOKEN_COLUMNS}
        rows={TOKEN_ROWS}
        bordered
        caption="What re-themes a table"
        captionHidden
      />
    </section>
  );
}
