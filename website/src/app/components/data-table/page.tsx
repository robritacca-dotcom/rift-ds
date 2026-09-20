"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import {
  DataTable,
  type DataTableColumn,
  type DataTableRow,
} from "@robr0/design-system/components/DataTable/DataTable";
import { Badge } from "@robr0/design-system/components/Badge/Badge";
import { Dropdown } from "@robr0/design-system/components/Dropdown/Dropdown";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";


const statusVariant = {
  Shipped: "positive",
  Waiting: "warning",
  Failed: "error",
} as const;

const columns: DataTableColumn[] = [
  { key: "name", header: "Customer", sortable: true },
  {
    key: "status",
    header: "Status",
    sortable: true,
    render: (row) => (
      <Badge
        variant={statusVariant[row.values.status as keyof typeof statusVariant] ?? "neutral"}
        label={String(row.values.status)}
      />
    ),
  },
  { key: "updated", header: "Last updated", sortable: true },
  { key: "price", header: "Price", sortable: true, align: "right" },
];

const rows: DataTableRow[] = [
  { id: "r1", values: { name: "John Clarkson", status: "Waiting", updated: "2026-09-05", price: 3412 } },
  { id: "r2", values: { name: "Aspen Lubin", status: "Failed", updated: "2026-03-25", price: 1899 } },
  { id: "r3", values: { name: "Michael Ekstrom", status: "Shipped", updated: "2026-08-01", price: 2752 } },
  { id: "r4", values: { name: "Kianna Vaccaro", status: "Shipped", updated: "2026-04-02", price: 145 } },
  { id: "r5", values: { name: "Livia Saris", status: "Failed", updated: "2026-11-14", price: 708 } },
  { id: "r6", values: { name: "Jaydon Aminoff", status: "Waiting", updated: "2026-07-17", price: 224 } },
  { id: "r7", values: { name: "Maria Lubin", status: "Shipped", updated: "2026-11-15", price: 2959 } },
  { id: "r8", values: { name: "Ann Press", status: "Waiting", updated: "2026-09-20", price: 2646 } },
  { id: "r9", values: { name: "Zaire Torff", status: "Shipped", updated: "2026-02-04", price: 3770 } },
  { id: "r10", values: { name: "Omar Vetrovs", status: "Failed", updated: "2026-07-10", price: 1747 } },
  { id: "r11", values: { name: "Talan Calzoni", status: "Shipped", updated: "2026-11-13", price: 3976 } },
  { id: "r12", values: { name: "Gretchen Septimus", status: "Shipped", updated: "2026-04-20", price: 3740 } },
];

function FilteredDemo() {
  const [status, setStatus] = React.useState("all");
  const filtered =
    status === "all" ? rows : rows.filter((row) => row.values.status === status);

  return (
    <DataTable
      columns={columns}
      rows={filtered}
      caption="Customers, filtered by status"
      searchable
      pageSize={5}
      toolbar={
        <Dropdown
          aria-label="Filter by status"
          size="compact"
          value={status}
          onValueChange={setStatus}
          options={[
            { label: "All statuses", value: "all" },
            { label: "Shipped", value: "Shipped" },
            { label: "Waiting", value: "Waiting" },
            { label: "Failed", value: "Failed" },
          ]}
        />
      }
    />
  );
}

export default function DataTablePage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Data table</h1>
            <PageLinks storybookPath="/?path=/docs/components-datatable--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Table, wired and working
            </p>
            <p className={styles.introBody}>
              Table draws rows, and this one runs them: sorting on header
              click, a search field, row selection with a select all header,
              client side pagination, and an empty state, assembled from the
              presentational pieces so a working data view is one component
              rather than an afternoon of plumbing.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="Fully wired" />
            <p className={styles.demoText}>
              Search, selection, sorting, and pagination together. Rows carry
              raw values keyed by column, and a column&apos;s render prop
              turns them into cells, like the status Badges here, while
              sorting and search keep reading the raw value underneath.
            </p>
            <DataTable
              columns={columns}
              rows={rows}
              caption="Customers"
              searchable
              selectable
              pageSize={5}
              defaultSort={{ key: "name", direction: "asc" }}
            />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Your filters, its plumbing" />
            <p className={styles.demoText}>
              The toolbar slot takes consumer owned controls, like this
              status Dropdown. Filter the rows you pass in and the readout,
              pagination, and empty state follow.
            </p>
            <FilteredDemo />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Sorting only" />
            <p className={styles.demoText}>
              Every part is opt in. With no search, selection, or page size,
              the component is just a table with sortable headers. Clicks
              cycle ascending, descending, then back to the given order.
            </p>
            <DataTable
              columns={columns}
              rows={rows.slice(0, 5)}
              caption="Customers, sorting only"
            />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Empty" />
            <p className={styles.demoText}>
              A search with no matches renders the bordered empty state
              instead of a bare table, and the result count reads zero.
              Override it through the emptyState prop.
            </p>
            <DataTable
              columns={columns}
              rows={[]}
              caption="Customers, no results"
              searchable
              pageSize={5}
            />
          </section>
        </main>
      </div>
    </>
  );
}
