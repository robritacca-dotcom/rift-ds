"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Treemap } from "@robr0/design-system/components/Chart/Treemap";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

const treemapData = [
  { name: "Documents", size: 4200 },
  { name: "Photos", size: 3800 },
  { name: "Videos", size: 7200 },
  { name: "Music", size: 1500 },
  { name: "Apps", size: 2800 },
  { name: "System", size: 1200 },
  { name: "Downloads", size: 2100 },
  { name: "Other", size: 900 },
];

export default function TreemapPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Treemap</h1>
            <PageLinks storybookPath="/?path=/docs/components-treemap--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Part-to-whole as nested rectangles
            </p>
            <p className={styles.introBody}>
              Each rectangle sizes to its value, so the biggest contributors are impossible to miss. Suited to storage, budgets, and other breakdowns.
            </p>
          </div>

          <section className={`${styles.section} animate-in animate-delay-2`}>
            <SectionTitle title="Default" />
            <Treemap
              data={treemapData}
              title="Disk usage"
              subtitle="Storage breakdown by category (MB)"
              summaryItems={[
                { label: "Total", value: "23.7 GB" },
                { label: "Free", value: "12.3 GB" },
              ]}
            />
          </section>
        </main>
      </div>

    </>
  );
}
