"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Text } from "rift-ds/components/Text/Text";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

export default function TextPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Text</h1>
            <PageLinks storybookPath="/?path=/docs/components-text--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>Running text in a tier of the type scale</p>
            <p className={styles.introBody}>
              Text sets body copy, helper copy, captions and amounts in the type scale. It carries the status roles for a message of that kind, truncates or clamps, and switches to tabular figures so a column of amounts lines up.
            </p>
          </div>

          {/* Tiers */}
          <section className={styles.section}>
            <SectionTitle title="Tiers" />
            <div className={styles.demoStack}>
              <Text tier="paragraph">Paragraph: payouts arrive two business days after a payment clears.</Text>
              <Text tier="paragraph" weight="emphasis">Paragraph emphasis</Text>
              <Text tier="paragraph-sm">Paragraph small: helper copy and table cells.</Text>
              <Text tier="caption">Caption: the smallest notes.</Text>
              <Text tier="overline" tone="neutral">Overline</Text>
              <Text tier="code">sk_test_51H8</Text>
            </div>
          </section>

          {/* Tones */}
          <section className={styles.section}>
            <SectionTitle title="Tones" />
            <div className={styles.demoStack}>
              <Text tier="paragraph-sm" tone="neutral">We use this address for receipts and security alerts.</Text>
              <Text tier="paragraph-sm" tone="positive">Changes saved.</Text>
              <Text tier="paragraph-sm" tone="warning">Your trial ends in 3 days.</Text>
              <Text tier="paragraph-sm" tone="error">The card was declined.</Text>
            </div>
          </section>

          {/* Amounts and truncation */}
          <section className={styles.section}>
            <SectionTitle title="Amounts and truncation" />
            <div className={`${styles.demoStack} ${styles.demoStage}`}>
              {["$1,204.00", "$88.10", "$12,950.75"].map((amount) => (
                <Text key={amount} as="span" numeric align="end">{amount}</Text>
              ))}
              <Text tier="paragraph-sm" truncate>Acme Logistics, 4 Harbour Road, Unit 12, Portside Industrial Estate, Harbourside</Text>
              <Text tier="paragraph-sm" tone="neutral" lines={2}>Customer asked to move delivery to the afternoon slot, and confirmed by phone that the loading dock can take a long-wheelbase van after two o’clock on weekdays.</Text>
            </div>
          </section>

          <ComponentInstallStrip slug="text" />
        </main>
      </div>
    </>
  );
}
