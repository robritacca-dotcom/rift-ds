"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { DateInput } from "@robr0/design-system/components/DateInput/DateInput";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

export default function DateInputPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Date input</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-dateinput--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              A text field that opens the browser&apos;s native date picker
            </p>
            <p className={styles.introBody}>
              Good for forms where you need a quick date entry without the weight of a full calendar. Use Date Picker instead when you want an always-visible inline calendar.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <DateInput label="Placeholder" onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <DateInput label="With value" value="2026-06-15" onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <DateInput label="Required" required onChange={() => {}} />
              </div>
            </div>
          </section>

          {/* Compact */}
          <section className={styles.section}>
            <SectionTitle title="Compact" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <DateInput label="Placeholder" size="compact" onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <DateInput label="With value" size="compact" value="2026-06-15" onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <DateInput label="Required" size="compact" required onChange={() => {}} />
              </div>
            </div>
          </section>

          {/* States */}
          <section className={styles.section}>
            <SectionTitle title="States" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <DateInput label="Helper text" helperText="Select a date within the next 30 days" onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <DateInput label="Error" value="2020-01-01" error helperText="Date must be in the future" onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <DateInput label="Disabled" value="2026-03-15" disabled onChange={() => {}} />
              </div>
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
