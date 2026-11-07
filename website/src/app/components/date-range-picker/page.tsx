"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { DateRangePicker } from "rift-ds/components/DateRangePicker/DateRangePicker";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

export default function DateRangePickerPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Date range picker</h1>
            <PageLinks storybookPath="/?path=/docs/components-daterangepicker--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>A range of days, chosen in two presses</p>
            <p className={styles.introBody}>
              A date range picker sets a billing period, a report’s window, a booking or a leave request. The first press sets the start and the second the end, the days between preview as the pointer moves, and presets set a range in one press.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="Two months" />
            <DateRangePicker
              defaultValue={{ start: "2026-11-03", end: "2026-11-12" }}
              presets={[
                { label: "Last 7 days", range: { start: "2026-10-30", end: "2026-11-05" } },
                { label: "October", range: { start: "2026-10-01", end: "2026-10-31" } },
                { label: "Q3", range: { start: "2026-07-01", end: "2026-09-30" } },
              ]}
            />
          </section>

          <section className={styles.section}>
            <SectionTitle title="One month" />
            <DateRangePicker months={1} size="compact" defaultValue={{ start: "2026-11-09", end: "2026-11-13" }} />
          </section>

          <ComponentInstallStrip slug="date-range-picker" />
        </main>
      </div>
    </>
  );
}
