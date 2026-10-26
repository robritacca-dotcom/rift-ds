"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { DataTable } from "rift-ds/components/DataTable/DataTable";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";
import {
  ColumnsDemo,
  DetailsDemo,
  EditingDemo,
  GroupingDemo,
  OverviewDemo,
  PhoneDemo,
  ScaleDemo,
  ServerDemo,
  TypesDemo,
  ViewsDemo,
  accountColumns,
  makeAccounts,
} from "./demos";

const few = accountColumns.filter((col) => ["account", "stage", "owner", "value"].includes(col.key));

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
            <p className={styles.subDisplay}>The table that runs your data</p>
            <p className={styles.introBody}>
              Table draws rows, and this one runs them: typed columns, sorting
              by one column or several, filters, search, selection, paging,
              editing in place, grouping with totals, row details, saved views,
              thousands of rows and rows that live on a server. Every part is
              opt in, so the smallest form is a table with sortable headers,
              and a TableToolbar in its toolbar slot drives it with no props.
            </p>
          </div>

          <section className={`${styles.section} animate-in animate-delay-2`}>
            <SectionTitle title="A working table" />
            <p className={styles.demoText}>
              Typed columns, the control bar, selection and paging together.
              Add a filter, sort by a header (Shift-click adds a second sort),
              tick a few rows and the bar becomes the bulk bar.
            </p>
            <OverviewDemo />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Column types" />
            <p className={styles.demoText}>
              A column&apos;s type sets its cell, its alignment, its sort, its
              filter conditions and its editor, with no render function: text,
              status, person, currency and number, progress, date, tags,
              checkbox and link. Format carries the locale, the currency and the
              date style, and a render function still wins over the type.
            </p>
            <TypesDemo />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Columns" />
            <p className={styles.demoText}>
              Drag a header&apos;s edge to resize it, or double-click it to
              fit. Drag a header to move it. Each header&apos;s menu sorts,
              pins, moves, hides and filters, and Alt+Down opens it from the
              keyboard. Account is pinned to the start, so the rest scroll
              under it.
            </p>
            <ColumnsDemo />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Editing" />
            <p className={styles.demoText}>
              An editable column opens the editor its type brings. Double-click
              a cell, or focus it and press Enter or start typing; Enter saves
              and moves down, Tab saves and moves on, Escape cancels. Row
              editing opens a whole row with Save and Cancel. A checkbox stays
              live and saves as it is ticked.
            </p>
            <EditingDemo />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Groups and totals" />
            <p className={styles.demoText}>
              Grouped by stage, in the stage&apos;s own order. Each group row
              carries its count and each column&apos;s aggregate, its chevron
              folds it and its checkbox selects the group. The footer&apos;s
              cells each pick a calculation over every matching row.
            </p>
            <GroupingDemo />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Row details" />
            <p className={styles.demoText}>
              renderDetail adds a chevron column, and an opened row shows its
              details beneath it, across the table, rendered only once opened.
            </p>
            <DetailsDemo />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Saved views" />
            <p className={styles.demoText}>
              A view is the table&apos;s setup as one object: sorts, filters,
              search, columns, grouping and density. Pick a tab and the table
              takes its setup; change anything and the tab shows a dot, and
              its menu saves, resets, renames or deletes it.
            </p>
            <ViewsDemo />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Thousands of rows" />
            <p className={styles.demoText}>
              Past two hundred unpaged rows the table draws only the rows in
              view, so five thousand scroll, sort and filter as quickly as
              ten. With hasMore it asks for the next batch as the end comes
              into view.
            </p>
            <ScaleDemo />
          </section>

          <section className={styles.section}>
            <SectionTitle title="On a phone" />
            <p className={styles.demoText}>
              Narrower than a phone, measured on the table itself, Scroll keeps
              the rows and pins the row header while the rest scroll sideways,
              and Stack draws each row as a card.
            </p>
            <PhoneDemo />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Rows on a server" />
            <p className={styles.demoText}>
              In manual mode the table leaves sorting, filtering, search and
              paging to your server: it reports what the reader asks for and
              shows the page it is given, with rowCount driving the pager. A
              refetch keeps the rows on screen, dimmed under a thin line.
            </p>
            <ServerDemo />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Loading" />
            <p className={styles.demoText}>
              While the first rows are on their way, loading draws skeleton
              rows under the real header, each a text line tall, so the rows
              that replace them do not jump.
            </p>
            <DataTable columns={few} rows={[]} loading pageSize={4} caption="Accounts, loading" />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Failed load" />
            <p className={styles.demoText}>
              An error with nothing on screen takes the table&apos;s body, with
              Try again calling onRetry. A failed fetch over rows already shown
              keeps them, with the error in a banner above.
            </p>
            <DataTable
              columns={few}
              rows={[]}
              error="The server took too long to answer."
              onRetry={() => {}}
              caption="Accounts, failed load"
            />
            <DataTable
              columns={few}
              rows={makeAccounts(2)}
              error="The server took too long to answer."
              onRetry={() => {}}
              caption="Accounts, failed refetch"
            />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Empty" />
            <p className={styles.demoText}>
              No rows renders the bordered empty state instead of a bare
              table. Replace it through emptyState, or its words through
              emptyStateLabels.
            </p>
            <DataTable columns={few} rows={[]} searchable caption="Accounts, no results" />
          </section>

          <ComponentInstallStrip slug="data-table" />
        </main>
      </div>
    </>
  );
}
