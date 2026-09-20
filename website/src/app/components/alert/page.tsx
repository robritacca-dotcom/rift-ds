"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Alert } from "@robr0/design-system/components/Alert/Alert";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

export default function AlertPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Alert</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-alert--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Feedback, confirmations, warnings, and errors
            </p>
            <p className={styles.introBody}>
              Each variant maps to a status colour (positive, warning, error, info, neutral) so the meaning is immediately clear. Can be dismissed with an optional close button.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <div className={styles.variantStack}>
              <Alert variant="info" title="Information" description="This is an informational message with helpful context." />
              <Alert variant="positive" title="Success" description="Your changes have been saved successfully." />
              <Alert variant="warning" title="Warning" description="This action may have unintended consequences." />
              <Alert variant="error" title="Error" description="Something went wrong. Please try again." />
              <Alert variant="neutral" title="Note" description="This is a general purpose notification." />
            </div>
          </section>

          {/* Compact */}
          <section className={styles.section}>
            <SectionTitle title="Compact" />
            <div className={styles.variantStack}>
              <Alert variant="info" size="compact" title="Information" description="Compact informational message." />
              <Alert variant="positive" size="compact" title="Success" description="Your changes have been saved." />
              <Alert variant="warning" size="compact" title="Warning" description="This action may have consequences." />
              <Alert variant="error" size="compact" title="Error" description="Something went wrong." />
              <Alert variant="neutral" size="compact" title="Note" description="General purpose notification." />
            </div>
          </section>

          {/* States */}
          <section className={styles.section}>
            <SectionTitle title="States" />
            <div className={styles.variantStack}>
              <Alert variant="info" title="Dismissible" description="Click the close button to dismiss this alert." dismissible onDismiss={() => {}} />
              <Alert variant="positive" title="Title only" />
              <Alert variant="warning" description="Description only: your session will expire in 5 minutes." />
              <Alert variant="error" title="Dismissible compact" description="Something went wrong." size="compact" dismissible onDismiss={() => {}} />
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
