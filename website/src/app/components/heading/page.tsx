"use client";

import React from "react";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import { Heading } from "rift-ds/components/Heading/Heading";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

export default function HeadingPage() {
  return (
    <div className={styles.dsContent}>
      <PageBreadcrumb />
      <div className={`${styles.pageHeader} animate-in`}>
        <h1 className={styles.pageTitle}>Heading</h1>
        <PageLinks storybookPath="/?path=/docs/components-heading--docs" />
      </div>

      <div className={`${styles.introSection} animate-in animate-delay-1`}>
        <p className={styles.subDisplay}>A heading whose level and look are chosen apart</p>
        <p className={styles.introBody}>
          Heading sets the element from <code>level</code> and the look from <code>tier</code>, so the page outline stays correct whatever size a design calls for. Display tiers take the display text role and heading tiers the heading role, so a theme that tones either tones every Heading with it.
        </p>
      </div>

      {/* Tiers */}
      <section className={styles.section}>
        <SectionTitle title="Tiers" />
        <div className={styles.demoStack} data-anchor-ignore>
          <Heading level={3} tier="display-2">Display 2</Heading>
          <Heading level={3} tier="sub-display">Sub display</Heading>
          <Heading level={3} tier="heading-1">Heading 1</Heading>
          <Heading level={3} tier="heading-2">Heading 2</Heading>
          <Heading level={3} tier="heading-3">Heading 3</Heading>
          <Heading level={3} tier="title-body">Title in the body face</Heading>
        </div>
      </section>

      {/* Level apart from tier */}
      <section className={styles.section}>
        <SectionTitle title="Level apart from tier" />
        <div className={styles.demoStack} data-anchor-ignore>
          <Heading level={3} tier="heading-1">An h3 in the heading 1 tier</Heading>
          <Heading level={3} tier="title-body">Invoice INV-2041</Heading>
        </div>
      </section>

      {/* Tone and wrapping */}
      <section className={styles.section}>
        <SectionTitle title="Tone and wrapping" />
        <div className={`${styles.demoStack} ${styles.demoStage}`} data-anchor-ignore>
          <Heading level={3} tier="heading-3" tone="neutral">Notification settings</Heading>
          <Heading level={3} tier="title-body" truncate>Northwind supply agreement, renewal draft for review</Heading>
          <Heading level={3} tier="heading-2" balance>Every payment, invoice and payout in one place</Heading>
        </div>
      </section>

      <section className={styles.section}>
        <SectionTitle title="Anchor links" />
        <div className={styles.kitDemo}>
          <Heading level={3} anchor>Getting started</Heading>
          <p className={styles.kitNote}>
            With <code>anchor</code>, the heading takes an id made from its text and a link to itself that shows on hover and focus, so a reader can link straight to the section. It stays a Server Component.
          </p>
        </div>
      </section>

      <ComponentInstallStrip slug="heading" />
    </div>
  );
}
