"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Meter } from "@robr0/design-system/components/Meter/Meter";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

export default function MeterPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Meter</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-meter--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              How full, not how far along
            </p>
            <p className={styles.introBody}>
              The counterpart to the progress bar: a meter shows the level of a known quantity, and its status colour says whether that level is good news. Storage, token budgets, password strength, battery.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <div className={styles.variantStack} style={{ alignItems: "stretch", maxWidth: "420px" }}>
              <Meter label="Storage used" value={64} showValue />
              <Meter label="Context window" value={128000} max={200000} valueText="128k of 200k tokens" showValue />
            </div>
          </section>

          {/* Statuses */}
          <section className={styles.section}>
            <SectionTitle title="Statuses" />
            <div className={styles.variantStack} style={{ alignItems: "stretch", maxWidth: "420px" }}>
              <Meter label="Info" value={60} showValue />
              <Meter label="Positive" value={80} variant="positive" showValue />
              <Meter label="Warning" value={90} variant="warning" showValue />
              <Meter label="Error" value={100} variant="error" showValue />
              <Meter label="Neutral" value={40} variant="neutral" showValue />
            </div>
          </section>

          {/* Custom readout */}
          <section className={styles.section}>
            <SectionTitle title="Custom readout" />
            <div className={styles.variantStack} style={{ alignItems: "stretch", maxWidth: "420px" }}>
              <Meter label="Password strength" value={80} variant="positive" valueText="Strong" showValue />
            </div>
          </section>

          {/* Sizes */}
          <section className={styles.section}>
            <SectionTitle title="Sizes" />
            <div className={styles.variantStack} style={{ alignItems: "stretch", maxWidth: "420px" }}>
              <Meter label="Default" value={45} showValue />
              <Meter label="Compact" value={45} size="compact" showValue />
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
