"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Banner } from "@robr0/design-system/components/Banner/Banner";
import { Button } from "@robr0/design-system/components/Button/Button";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

export default function BannerPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Banner</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-banner--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Page-level announcements and standing notices
            </p>
            <p className={styles.introBody}>
              The third sibling in the feedback family: Alert sits inline in the content, Toast interrupts and leaves, Banner spans the page and stays until dismissed. Use it for release notes, maintenance windows, and environment flags.
            </p>
          </div>

          {/* Variants */}
          <section className={styles.section}>
            <SectionTitle title="Variants" />
            <div className={styles.variantStack} style={{ alignItems: "stretch" }}>
              <Banner variant="info" title="Scheduled maintenance.">The dashboard will be read-only on Saturday between 02:00 and 04:00 UTC.</Banner>
              <Banner variant="positive" title="Version 2.0 is live.">Every workspace has been upgraded automatically.</Banner>
              <Banner variant="warning" title="Trial ending.">Your workspace moves to the free plan in 3 days.</Banner>
              <Banner variant="error" title="Sync paused.">We could not reach the server. Changes are saved locally.</Banner>
              <Banner variant="neutral">You are viewing the staging environment.</Banner>
            </div>
          </section>

          {/* With action */}
          <section className={styles.section}>
            <SectionTitle title="With action" />
            <div className={styles.variantStack} style={{ alignItems: "stretch" }}>
              <Banner
                variant="warning"
                title="Trial ending."
                action={<Button variant="secondary" size="compact" label="Upgrade" />}
              >
                Your workspace moves to the free plan in 3 days.
              </Banner>
            </div>
          </section>

          {/* Dismissible */}
          <section className={styles.section}>
            <SectionTitle title="Dismissible" />
            <div className={styles.variantStack} style={{ alignItems: "stretch" }}>
              <Banner variant="info" title="New in this release." dismissible onDismiss={() => {}}>
                The reporting page now exports to CSV.
              </Banner>
            </div>
          </section>

          {/* Centered */}
          <section className={styles.section}>
            <SectionTitle title="Centered" />
            <div className={styles.variantStack} style={{ alignItems: "stretch" }}>
              <Banner variant="neutral" align="center">Read-only preview. Sign in to make changes.</Banner>
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
