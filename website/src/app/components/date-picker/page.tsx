"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { DatePicker } from "@robr0/design-system/components/DatePicker/DatePicker";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

export default function DatePickerPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Date picker</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-datepicker--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              A full calendar grid that sits inline on the page
            </p>
            <p className={styles.introBody}>
              Highlights today, supports min/max date limits, and lets users pick a date by clicking a cell. Use this when the date context matters and users benefit from seeing the full month. Use Date Input instead for a lighter-weight form field.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <div className={styles.variantRow}>
              <DatePicker onDateSelect={() => {}} />
            </div>
          </section>

          {/* With selected */}
          <section className={styles.section}>
            <SectionTitle title="With selected date" />
            <div className={styles.variantRow}>
              <DatePicker value="2026-02-16" onDateSelect={() => {}} />
            </div>
          </section>

          {/* Disabled */}
          <section className={styles.section}>
            <SectionTitle title="Disabled" />
            <div className={styles.variantRow}>
              <DatePicker value="2026-02-16" disabled onDateSelect={() => {}} />
            </div>
          </section>

          {/* Compact */}
          <section className={styles.section}>
            <SectionTitle title="Compact" />
            <div className={styles.variantRow}>
              <DatePicker size="compact" onDateSelect={() => {}} />
              <DatePicker size="compact" value="2026-02-16" onDateSelect={() => {}} />
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
