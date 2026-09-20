"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { TimePicker } from "@robr0/design-system/components/TimePicker/TimePicker";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

export default function TimePickerPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Time picker</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-timepicker--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              A time-of-day field with a list of selectable times
            </p>
            <p className={styles.introBody}>
              Opens a scrollable list of times generated from a range and a step, so every choice is a valid one. The value is always a 24-hour HH:MM string; the 12-hour or 24-hour display is a formatting choice.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <TimePicker label="Placeholder" />
              </div>
              <div className={styles.variantItem}>
                <TimePicker label="With value" defaultValue="09:30" />
              </div>
              <div className={styles.variantItem}>
                <TimePicker label="Required" required />
              </div>
            </div>
          </section>

          {/* Hour formats */}
          <section className={styles.section}>
            <SectionTitle title="Hour formats" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <TimePicker label="12-hour" defaultValue="14:30" />
              </div>
              <div className={styles.variantItem}>
                <TimePicker label="24-hour" hourFormat="24" defaultValue="14:30" />
              </div>
            </div>
          </section>

          {/* Steps and ranges */}
          <section className={styles.section}>
            <SectionTitle title="Steps and ranges" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <TimePicker label="15 minute steps" stepMinutes={15} defaultValue="08:45" />
              </div>
              <div className={styles.variantItem}>
                <TimePicker
                  label="Business hours"
                  minTime="09:00"
                  maxTime="17:00"
                  defaultValue="10:00"
                  helperText="Weekdays, 9 to 5"
                />
              </div>
            </div>
          </section>

          {/* Compact */}
          <section className={styles.section}>
            <SectionTitle title="Compact" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <TimePicker label="Placeholder" size="compact" />
              </div>
              <div className={styles.variantItem}>
                <TimePicker label="With value" size="compact" defaultValue="16:00" />
              </div>
            </div>
          </section>

          {/* States */}
          <section className={styles.section}>
            <SectionTitle title="States" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <TimePicker label="Helper text" helperText="Local time" />
              </div>
              <div className={styles.variantItem}>
                <TimePicker label="Error" error helperText="Please select a time" />
              </div>
              <div className={styles.variantItem}>
                <TimePicker label="Disabled" defaultValue="09:30" disabled />
              </div>
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
