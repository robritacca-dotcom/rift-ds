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
import { TableToolbar } from "rift-ds/components/TableToolbar/TableToolbar";
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
              Search, filters as chips, a More panel with the density switch
              and the columns, the page&apos;s actions and the result count. Put it in a data
              table&apos;s toolbar slot and it reads and sets the table&apos;s
              own state with no props. Its filters and the table&apos;s header
              filters are one list, so a filter set from either shows in both.
            </p>
          </div>

          <section className={`${styles.section} animate-in animate-delay-2`}>
            <SectionTitle title="Inside a data table" />
            <p className={styles.sectionBody}>
              Add a filter from the Filter button, or from a column&apos;s menu.
              Each chip reads its column, its condition and its value, and opens
              the same editor as the header. The More panel sets the
              table&apos;s density, which every control in the bar follows, and
              shows, hides and orders its columns. Secondary actions sit as
              icons beside the one labelled primary action.
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
                  secondaryActions={[
                    {
                      id: "export",
                      label: "Export",
                      icon: "download",
                      onSelect: () => {},
                    },
                  ]}
                  primaryAction={{
                    id: "new",
                    label: "New issue",
                    icon: "add",
                    onSelect: () => {},
                  }}
                />
              }
            />
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
