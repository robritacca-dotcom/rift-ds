"use client";

import React, { useState } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Badge } from "rift-ds/components/Badge/Badge";
import {
  DataTable,
  type DataTableColumn,
  type DataTableFilter,
  type DataTableRow,
} from "rift-ds/components/DataTable/DataTable";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { Table } from "rift-ds/components/Table/Table";
import { TableToolbar, type TableToolbarView } from "rift-ds/components/TableToolbar/TableToolbar";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

const STATUS = { Open: "info", Blocked: "error", Done: "positive" } as const;

const rows: DataTableRow[] = [
  {
    id: "i1",
    values: {
      title: "Composer loses focus on paste",
      status: "Open",
      owner: "Jane Doe",
      estimate: 3,
      due: "2026-11-04",
      labels: ["editor"],
    },
  },
  {
    id: "i2",
    values: {
      title: "Dark-mode chart palette drifts",
      status: "Blocked",
      owner: "Alex Smith",
      estimate: 5,
      due: "2026-11-12",
      labels: ["charts", "theme"],
    },
  },
  {
    id: "i3",
    values: {
      title: "Sidebar badge miscounts drafts",
      status: "Open",
      owner: "Sam Reyes",
      estimate: 1,
      due: "2026-11-02",
      labels: ["nav"],
    },
  },
  {
    id: "i4",
    values: {
      title: "Toast stacks past its inset",
      status: "Done",
      owner: "Jane Doe",
      estimate: 2,
      due: "2026-10-28",
      labels: ["feedback"],
    },
  },
  {
    id: "i5",
    values: {
      title: "Globe drag stutters on trackpads",
      status: "Open",
      owner: "Sam Reyes",
      estimate: 8,
      due: "2026-11-20",
      labels: ["maps", "gestures"],
    },
  },
  {
    id: "i6",
    values: {
      title: "Stepper skips the review step",
      status: "Done",
      owner: "Alex Smith",
      estimate: 2,
      due: "2026-10-30",
      labels: ["forms"],
    },
  },
];

const options = (values: string[]) =>
  values.map((value) => ({ value, label: value }));

const columns: DataTableColumn[] = [
  { key: "title", header: "Issue", rowHeader: true, sortable: true },
  {
    key: "status",
    header: "Status",
    sortable: true,
    options: options(Object.keys(STATUS)),
    render: (row) => {
      const status = row.values.status as keyof typeof STATUS;
      return <Badge label={status} variant={STATUS[status]} />;
    },
  },
  {
    key: "owner",
    header: "Owner",
    sortable: true,
    options: options(["Jane Doe", "Alex Smith", "Sam Reyes"]),
  },
  { key: "estimate", header: "Points", sortable: true, align: "right" },
  { key: "due", header: "Due", sortable: true },
  { key: "labels", header: "Labels", hideable: true },
];

/* The same issues with typed status and owner columns, groupable, for the
   sort, group and bulk demos. */
const typedColumns: DataTableColumn[] = columns.map((col) =>
  col.key === "status" || col.key === "owner" ? { ...col, groupable: true } : col,
);

const VIEWS: TableToolbarView[] = [
  { id: "all", name: "All issues", view: { version: 1 } },
  {
    id: "open",
    name: "Open",
    view: {
      version: 1,
      filters: [{ id: "status-1", column: "status", operator: "isAnyOf", value: ["Open", "Blocked"] }],
      sorts: [{ key: "due", direction: "asc" }],
    },
  },
  { id: "owner", name: "By owner", view: { version: 1, grouping: ["owner"] } },
];

export default function TableToolbarPage() {
  const [filters, setFilters] = useState<DataTableFilter[]>([]);
  const [search, setSearch] = useState("");
  const shown = rows.filter((row) =>
    String(row.values.title).toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Table toolbar</h1>
            <PageLinks storybookPath="/?path=/docs/components-tabletoolbar--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              The controls over a table, in one row
            </p>
            <p className={styles.introBody}>
              Search, filters as chips, sort, group, the columns, the density,
              saved views, a bulk bar for selected rows and the page&apos;s
              actions, in one row that never wraps. Put it in a data
              table&apos;s toolbar slot and it reads and sets the table&apos;s
              own state with no props. Its filters and the table&apos;s header
              filters are one list, so a filter set from either shows in both.
            </p>
          </div>

          <section className={`${styles.section} animate-in animate-delay-2`}>
            <SectionTitle title="Inside a data table" />
            <p className={styles.sectionBody}>
              Add a filter from the Filter button, beside search, or from a
              column&apos;s menu. Each chip reads its column, its condition
              and its value, and opens the same editor as the header; chips
              that do not fit fold into a +N chip. Columns shows, hides and
              orders the columns, and the density switch sets the table&apos;s
              density, which every control in the bar follows. The primary
              action is a split button when it carries a menu.
            </p>
            <DataTable
              columns={columns}
              rows={rows}
              columnMenu
              caption="Issues"
              defaultFilters={[
                {
                  id: "status-1",
                  column: "status",
                  operator: "isAnyOf",
                  value: ["Open", "Blocked"],
                },
              ]}
              toolbar={
                <TableToolbar
                  primaryAction={{
                    id: "new",
                    label: "New issue",
                    icon: "add",
                    onSelect: () => {},
                    menu: [
                      { id: "template", label: "From a template", icon: "content_copy", onSelect: () => {} },
                      { id: "import", label: "Import", icon: "upload", onSelect: () => {} },
                    ],
                  }}
                />
              }
            />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Sort and group" />
            <p className={styles.sectionBody}>
              Sort lists the sorts first sort first: drag a row, or press Alt
              with the arrows, to reorder them, and Add sort picks another
              column. Group picks the column the rows gather by, with Collapse
              all and Expand all. Each icon carries a count while it is set.
            </p>
            <DataTable
              columns={typedColumns}
              rows={rows}
              multiSort
              columnMenu
              caption="Issues, sorted and grouped"
              defaultSorts={[
                { key: "status", direction: "asc" },
                { key: "estimate", direction: "desc" },
              ]}
              defaultGrouping={["owner"]}
              toolbar={<TableToolbar />}
            />
          </section>

          <section className={styles.section}>
            <SectionTitle title="The bulk bar" />
            <p className={styles.sectionBody}>
              Tick a row and the bar becomes the bulk bar at the same height:
              Clear, the count, Select all N past the page, then each action in
              full, the destructive ones last, with a More menu for what does
              not fit. An action runs on the selection, which can be every
              matching row, as a query a server can act on.
            </p>
            <DataTable
              columns={columns}
              rows={rows}
              selectable
              pageSize={3}
              defaultSelectedIds={["i1", "i2"]}
              caption="Issues, two selected"
              toolbar={
                <TableToolbar
                  bulkActions={[
                    { id: "assign", label: "Assign", icon: "person_add", onSelect: () => {} },
                    { id: "label", label: "Add label", icon: "label", onSelect: () => {} },
                    { id: "delete", label: "Delete", icon: "delete", destructive: true, onSelect: () => {} },
                  ]}
                />
              }
            />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Saved views" />
            <p className={styles.sectionBody}>
              Views sit as tabs on their own row over the bar. Picking one
              applies its setup to the table; once the table moves on from it,
              the tab shows a dot, and its menu saves, saves as new, resets,
              renames or deletes it. The plus saves the table as a new view.
            </p>
            <DataTable
              columns={typedColumns}
              rows={rows}
              multiSort
              columnMenu
              caption="Issues, saved views"
              toolbar={<TableToolbar defaultViews={VIEWS} />}
            />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Narrow" />
            <p className={styles.sectionBody}>
              Narrower than a phone, measured on the bar itself, it folds to
              icons: search opens in a panel, the chips move into the Filter
              panel with a count on its icon, and More holds the secondary
              actions and the density. On a phone screen every panel opens as
              a sheet from the bottom.
            </p>
            <div className={styles.narrowFrame}>
              <DataTable
                columns={columns}
                rows={rows}
                pageSize={3}
                caption="Issues, narrow"
                defaultFilters={[
                  { id: "status-1", column: "status", operator: "isAnyOf", value: ["Open"] },
                ]}
                toolbar={
                  <TableToolbar
                    primaryAction={{ id: "new", label: "New issue", icon: "add", onSelect: () => {} }}
                  />
                }
              />
            </div>
          </section>

          <section className={`${styles.section} animate-in animate-delay-3`}>
            <SectionTitle title="Over any table" />
            <p className={styles.sectionBody}>
              Outside a data table the bar is driven by its own props: the
              columns it knows about, and each piece of state as a controlled or
              uncontrolled pair. Here it searches a plain table.
            </p>
            <TableToolbar
              columns={[{ key: "title", label: "Issue" }]}
              filterable={false}
              columnsPanel={false}
              densitySwitch={false}
              search={search}
              onSearchChange={setSearch}
              filters={filters}
              onFiltersChange={setFilters}
              count={{ shown: shown.length, total: rows.length }}
            />
            <Table
              bordered
              columns={[
                { key: "title", header: "Issue" },
                { key: "owner", header: "Owner" },
              ]}
              rows={shown.map((row) => ({
                id: row.id,
                cells: { title: row.values.title, owner: row.values.owner },
              }))}
            />
          </section>

          <section className={`${styles.section} animate-in animate-delay-4`}>
            <SectionTitle title="Filters" />
            <p className={styles.sectionBody}>
              A column&apos;s filter takes the conditions its values call for:
              text contains, starts with or is; a number compares or falls
              between two; a date is before, after or between; a column with
              options is any of or none of them; a list has any, all or none of
              its values. Every condition joins with and. A filter left without
              a value when its editor closes is dropped.
            </p>
          </section>

          <ComponentInstallStrip slug="table-toolbar" />
        </main>
      </div>
    </>
  );
}
