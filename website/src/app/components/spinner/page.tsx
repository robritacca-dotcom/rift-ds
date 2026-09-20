"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Spinner } from "@robr0/design-system/components/Spinner/Spinner";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

export default function SpinnerPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Spinner</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-spinner--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Loading in progress
            </p>
            <p className={styles.introBody}>
              An animated circular indicator that communicates an ongoing process. Available in three sizes and two colour variants to suit different contexts.
            </p>
          </div>

          {/* Sizes */}
          <section className={styles.section}>
            <SectionTitle title="Sizes" />
            <div className={styles.variantRow}>
              <Spinner size="sm" />
              <Spinner size="md" />
              <Spinner size="lg" />
            </div>
          </section>

          {/* Variants */}
          <section className={styles.section}>
            <SectionTitle title="Variants" />
            <div className={styles.variantRow}>
              <Spinner variant="primary" size="lg" />
              <Spinner variant="neutral" size="lg" />
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
