"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { ErrorSummary } from "rift-ds/components/ErrorSummary/ErrorSummary";
import { Input } from "rift-ds/components/Input/Input";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

export default function ErrorSummaryPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Error summary</h1>
            <PageLinks storybookPath="/?path=/docs/components-errorsummary--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>Every error on a form, at the top of it</p>
            <p className={styles.introBody}>
              An error summary lists what needs fixing before a form can go on, each error a link that moves focus to its field and brings its label into view. It takes the focus when errors first appear, so the reader starts from it.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Errors" />
            <div className={`${styles.demoStack} ${styles.demoStage}`}>
              <ErrorSummary
                focusOnMount={false}
                errors={[
                  { id: "summary-demo-name", message: "Enter your legal business name." },
                  { id: "summary-demo-email", message: "Enter an email address like name@example.com." },
                ]}
              />
              <Input id="summary-demo-name" label="Legal business name" errorText="Enter your legal business name." />
              <Input id="summary-demo-email" type="email" label="Email" errorText="Enter an email address like name@example.com." />
            </div>
          </section>

          {/* Single error */}
          <section className={styles.section}>
            <SectionTitle title="One error" />
            <div className={styles.demoStage}>
              <ErrorSummary
                focusOnMount={false}
                headingLevel={3}
                description="Fix this to continue to payment."
                errors={[{ id: "summary-demo-email", message: "Enter an email address like name@example.com." }]}
              />
            </div>
          </section>

          <ComponentInstallStrip slug="error-summary" />
        </main>
      </div>
    </>
  );
}
