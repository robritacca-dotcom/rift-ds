"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

export default function SectionTitlePage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Section title</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-sectiontitle--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Divide page content into labelled sections
            </p>
            <p className={styles.introBody}>
              Pairs a heading with a full-width divider line to separate groups of related content. An optional trailing slot can display counts, badges, or other metadata alongside the heading.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <div className={styles.variantStack} data-anchor-ignore>
              <SectionTitle title="Navigation icons" />
              <SectionTitle title="Primary, compact" />
              <SectionTitle title="States" />
            </div>
          </section>

          {/* With trailing content */}
          <section className={styles.section}>
            <SectionTitle title="With trailing content" />
            <div className={styles.variantStack} data-anchor-ignore>
              <SectionTitle title="Navigation icons" trailing="24" />
              <SectionTitle title="Status variants" trailing="6" />
              <SectionTitle title="Primary, compact" trailing="New" />
            </div>
          </section>

          {/* Without divider */}
          <section className={styles.section}>
            <SectionTitle title="Without divider" />
            <p className={styles.sectionBody}>
              Set divider to false above content that draws its own lines, such as bordered tables or calendars, so the heading separates by whitespace alone instead of doubling up the rules.
            </p>
            <div className={styles.variantStack} data-anchor-ignore>
              <SectionTitle title="Upcoming events" divider={false} />
              <SectionTitle title="Team members" trailing="12" divider={false} />
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
