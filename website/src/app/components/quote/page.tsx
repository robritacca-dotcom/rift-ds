"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Quote } from "@robr0/design-system/components/Quote/Quote";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

export default function QuotePage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Quote</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-quote--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Blockquotes and pull-quotes with attribution
            </p>
            <p className={styles.introBody}>
              Two registers: the default inline blockquote sits inside body copy with a
              quiet left rule; the pull variant borrows display type (weight 300 at
              sub-display scale) so the sentence itself is the emphasis.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default: inline blockquote" />
            <Quote>
              Large-scale systems are not primarily UI problems. They are coordination
              problems.
            </Quote>
          </section>

          {/* With attribution */}
          <section className={styles.section}>
            <SectionTitle title="With attribution" />
            <Quote
              attribution="Rob Ritacca"
              detail="Career Profile case study"
            >
              The challenge is not creating beautiful screens. The challenge is creating
              frameworks that allow hundreds of people and teams to build coherently over
              time.
            </Quote>
          </section>

          {/* Pull */}
          <section className={styles.section}>
            <SectionTitle title="Pull-quote" />
            <Quote variant="pull">
              Tokens flow from Figma to production without a handoff meeting.
            </Quote>
          </section>

          {/* Pull with attribution */}
          <section className={styles.section}>
            <SectionTitle title="Pull-quote with attribution" />
            <Quote variant="pull" attribution="Rob Ritacca" detail="Writing, 2026">
              Design still derisks development.
            </Quote>
          </section>
        </main>
      </div>

    </>
  );
}
