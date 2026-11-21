"use client";

import React from "react";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import { Pagination } from "rift-ds/components/Pagination/Pagination";
import { Table } from "rift-ds/components/Table/Table";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";


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
  ["--color-divider", "neutral-02-a80", "Semantic"],
  ["--color-text-primary", "#050505", "Semantic"],
  ["--color-bg-page-primary", "#FFFFFF", "Semantic"],
  ["--radius-300", "12px", "Semantic"],
  ["--radius-pill", "999px", "Semantic"],
  ["--gap-400", "16px", "Semantic"],
  ["--padding-500", "20px", "Semantic"],
  ["--border-025", "1px", "Semantic"],
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
    <div className={styles.dsContent}>
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

      <section className={styles.section}>
        <SectionTitle title="Previous and next" />
        <div className={styles.kitDemo}>
          <Pagination variant="adjacent" previous={{ href: "#installation", label: "Installation" }} next={{ href: "#theming", label: "Theming" }} />
          <p className={styles.kitNote}>
            The <code>adjacent</code> form links to the page before and after this one in a sequence, such as a guide&apos;s chapters, as two cards that name them.
          </p>
        </div>
      </section>

      <ComponentInstallStrip slug="pagination" />
    </div>
  );
}
