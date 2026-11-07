"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Deadline } from "rift-ds/components/Deadline/Deadline";
import { Text } from "rift-ds/components/Text/Text";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

/* One fixed moment, so the page reads the same on every visit. */
const NOW = "2026-11-06T17:00:00Z";
const from = (hours: number) => new Date(Date.parse(NOW) + hours * 3_600_000).toISOString();

export default function DeadlinePage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Deadline</h1>
            <PageLinks storybookPath="/?path=/docs/components-deadline--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>A due date against now</p>
            <p className={styles.introBody}>
              A deadline says how long is left, and turns from neutral to the warning role as it nears and to the error role on its last day. Use it for submission cutoffs, invoice due dates, trial expiry and ticket service levels.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="Statuses" />
            <div className={styles.variantRow}>
              <Deadline date={from(5 * 24)} now={NOW} />
              <Deadline date={from(2 * 24)} now={NOW} />
              <Deadline date={from(5)} now={NOW} />
              <Deadline date={from(-26)} now={NOW} />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Display and form" />
            <div className={styles.demoStack}>
              <Deadline date="2026-11-08T00:00:00Z" now={NOW} timeZone="America/Los_Angeles" display="both" prefixLabel="Closes" />
              <Deadline date={from(10 * 24)} now={NOW} display="absolute" prefixLabel="Expires" timeZone="UTC" />
              <Text>
                Invoice INV-2041 is <Deadline variant="text" date={from(30)} now={NOW} prefixLabel="due" />.
              </Text>
            </div>
          </section>

          <ComponentInstallStrip slug="deadline" />
        </main>
      </div>
    </>
  );
}
