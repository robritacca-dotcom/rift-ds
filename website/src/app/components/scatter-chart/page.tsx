"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { ScatterChart } from "@robr0/design-system/components/Chart/ScatterChart";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

function generateScatterCluster(cx: number, cy: number, count: number, spread: number) {
  return Array.from({ length: count }, () => ({
    x: Math.round(cx + (Math.random() - 0.5) * spread),
    y: Math.round(cy + (Math.random() - 0.5) * spread),
  }));
}

const scatterDatasets = [
  { name: "Group A", data: generateScatterCluster(60, 200, 20, 80) },
  { name: "Group B", data: generateScatterCluster(180, 120, 20, 80) },
];

export default function ScatterChartPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Scatter chart</h1>
            <PageLinks storybookPath="/?path=/docs/components-scatterchart--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Correlation across two axes
            </p>
            <p className={styles.introBody}>
              Each dataset plots as a coloured point cloud with its own legend entry. Axis labels and summary stats carry the reading.
            </p>
          </div>

          <section className={`${styles.section} animate-in animate-delay-2`}>
            <SectionTitle title="Clusters" />
            <ScatterChart
              datasets={scatterDatasets}
              xKey="x"
              yKey="y"
              xLabel="Height (cm)"
              yLabel="Weight (kg)"
              title="Height vs Weight"
              subtitle="Sample population clusters"
              summaryItems={[
                { label: "Correlation", value: "0.82" },
                { label: "Points", value: 40 },
              ]}
            />
          </section>
        </main>
      </div>

    </>
  );
}
