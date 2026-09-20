"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Pagination } from "@robr0/design-system/components/Pagination/Pagination";
import { Table } from "@robr0/design-system/components/Table/Table";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";


/* ============================================
   PAGINATED TABLE DEMO DATA
   ============================================ */

const columns = [
  { key: "name", header: "Token" },
  { key: "value", header: "Value" },
  { key: "tier", header: "Tier" },
];

const allRows = [
  ["--primitive-teal-07", "#118AB2", "Primitive"],
  ["--primitive-neutral-02", "#D6D6D6", "Primitive"],
  ["--color-action-primary-bg", "teal-08 light / teal-05 dark", "Semantic"],
  ["--color-divider", "neutral-02-semi", "Semantic"],
  ["--color-text-primary", "#050505", "Semantic"],
  ["--color-bg-page-primary", "#FFFFFF", "Semantic"],
  ["--radius-md", "12px", "Semantic"],
  ["--radius-full", "999px", "Semantic"],
  ["--gap-md", "16px", "Semantic"],
  ["--padding-lg", "20px", "Semantic"],
  ["--border-xs", "1px", "Semantic"],
  ["--font-paragraph-size", "16px", "Typography"],
].map(([name, value, tier], i) => ({
  id: String(i),
  cells: { name, value, tier },
}));

const PAGE_SIZE = 4;

function PaginatedTable() {
  const [page, setPage] = React.useState(1);
  const pageCount = Math.ceil(allRows.length / PAGE_SIZE);
  const rows = allRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className={styles.tableDemo}>
      <Table
        columns={columns}
        rows={rows}
        bordered
        caption="Design tokens"
        captionHidden
      />
      <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
    </div>
  );
}

/* ============================================
   INTERACTIVE STANDALONE EXAMPLES
   ============================================ */

function InteractivePagination(props: {
  pageCount: number;
  initialPage?: number;
  siblingCount?: number;
  size?: "default" | "compact";
}) {
  const [page, setPage] = React.useState(props.initialPage ?? 1);
  return (
    <Pagination
      page={page}
      pageCount={props.pageCount}
      onPageChange={setPage}
      siblingCount={props.siblingCount}
      size={props.size}
    />
  );
}

export default function PaginationPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Pagination</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-pagination--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Navigate long datasets a page at a time
            </p>
            <p className={styles.introBody}>
              Numbered page buttons with the first and last page always
              visible and ellipses covering the gaps. The current page uses
              the primary action fill, arrows disable at either end, and a
              compact mode trades the numbers for a page readout. Pairs
              naturally with Table.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <div className={styles.demoStack}>
              <InteractivePagination pageCount={10} />
            </div>
          </section>

          {/* Many pages */}
          <section className={styles.section}>
            <SectionTitle title="Many pages" />
            <div className={styles.demoStack}>
              <InteractivePagination pageCount={24} initialPage={12} />
              <InteractivePagination pageCount={24} initialPage={12} siblingCount={2} />
            </div>
          </section>

          {/* Compact */}
          <section className={styles.section}>
            <SectionTitle title="Compact" />
            <div className={styles.demoStack}>
              <InteractivePagination pageCount={12} initialPage={3} size="compact" />
            </div>
          </section>

          {/* With table */}
          <section className={styles.section}>
            <SectionTitle title="With a table" />
            <PaginatedTable />
          </section>
        </main>
      </div>

    </>
  );
}
