"use client";

import React from "react";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import { Badge } from "rift-ds/components/Badge/Badge";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

export default function BadgePage() {
  return (
    <div className={styles.dsContent}>
      <PageBreadcrumb />
      <div className={`${styles.pageHeader} animate-in`}>
        <h1 className={styles.pageTitle}>Badge</h1>
        <PageLinks
          storybookPath="/?path=/docs/components-badge--docs"
        />
      </div>

      <div className={`${styles.introSection} animate-in animate-delay-1`}>
        <p className={styles.subDisplay}>
          Small inline status labels
        </p>
        <p className={styles.introBody}>
          Badges are compact indicators used to highlight status, category, or metadata. Each variant maps to a status colour so the meaning is immediately clear.
        </p>
      </div>

      {/* Variants */}
      <section className={styles.section}>
        <SectionTitle title="Variants" />
        <div className={styles.variantRow}>
          <Badge variant="info" label="Info" />
          <Badge variant="positive" label="Success" />
          <Badge variant="warning" label="Warning" />
          <Badge variant="error" label="Error" />
          <Badge variant="neutral" label="Neutral" />
        </div>
      </section>

      {/* Usage examples */}
      <section className={styles.section}>
        <SectionTitle title="Usage examples" />
        <div className={styles.variantRow}>
          <Badge variant="positive" label="Active" />
          <Badge variant="neutral" label="Draft" />
          <Badge variant="warning" label="Pending review" />
          <Badge variant="error" label="Overdue" />
          <Badge variant="info" label="New" />
        </div>
      </section>

      <ComponentInstallStrip slug="badge" />
    </div>
  );
}
