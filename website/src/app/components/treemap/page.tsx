"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Treemap } from "rift-ds/components/Chart/Treemap";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

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

const lightFillData = [
  { name: "Paper", size: 6200, color: "#F1F1F1" },
  { name: "Butter", size: 4100, color: "#FFE9A8" },
  { name: "Mint", size: 3600, color: "#BFF5E4" },
  { name: "Charcoal", size: 3000, color: "#2A2A2A" },
  { name: "Sky", size: 2400, color: "#BFE3F5" },
  { name: "Slate", size: 1900, color: "#7A7A7A" },
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

          <section className={`${styles.section} animate-in animate-delay-3`}>
            <SectionTitle title="Readable labels" />
            <p className={styles.sectionNote}>
              Labels sit on the cells, so each one measures its own fill and takes whichever
              text colour reads better against it. On a mid-tone, where neither reaches AA,
              the label gains a thin halo in the opposite colour. Pass light custom colours
              and every name stays legible in both themes.
            </p>
            <Treemap
              data={lightFillData}
              title="Paint stock"
              subtitle="Light and dark custom fills side by side"
            />
          </section>

          <ComponentInstallStrip slug="treemap" />
        </main>
      </div>

    </>
  );
}
