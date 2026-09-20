"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { ProgressBar } from "@robr0/design-system/components/ProgressBar/ProgressBar";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

export default function ProgressBarPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Progress bar</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-progressbar--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Task completion at a glance
            </p>
            <p className={styles.introBody}>
              A horizontal bar that fills to indicate how far through a process or task the user is. Available in default and compact sizes with an optional percentage label.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <div className={styles.variantStack} style={{ maxWidth: "400px" }}>
              <ProgressBar value={80} showLabel />
              <ProgressBar value={45} showLabel />
              <ProgressBar value={100} showLabel />
            </div>
          </section>

          {/* Compact */}
          <section className={styles.section}>
            <SectionTitle title="Compact" />
            <div className={styles.variantStack} style={{ maxWidth: "400px" }}>
              <ProgressBar value={65} size="compact" />
              <ProgressBar value={30} size="compact" />
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
