"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { RadialChart } from "@robr0/design-system/components/Chart/RadialChart";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

const sprintData = [
  { name: "Design", value: 86 },
  { name: "Development", value: 65 },
  { name: "Testing", value: 42 },
];

export default function RadialChartPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Radial chart</h1>
            <PageLinks storybookPath="/?path=/docs/components-radialchart--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Completion as concentric rings
            </p>
            <p className={styles.introBody}>
              Each ring tracks one measure toward its target, with per-ring colour overrides. Suited to KPI overviews and progress readouts.
            </p>
          </div>

          <section className={`${styles.section} animate-in animate-delay-2`}>
            <SectionTitle title="Progress rings" />
            <div className={styles.chartRow}>
              <RadialChart
                data={sprintData}
                title="Sprint progress"
                subtitle="Completion by phase"
                height={380}
              />
              <RadialChart
                data={[
                  { name: "Revenue", value: 78, color: "#06D6A0" },
                  { name: "Users", value: 92, color: "#118AB2" },
                  { name: "Retention", value: 55, color: "#FFD166" },
                ]}
                title="KPI overview"
                subtitle="Q2 2024 targets"
                height={380}
              />
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
