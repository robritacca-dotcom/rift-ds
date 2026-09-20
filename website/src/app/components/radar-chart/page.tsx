"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { RadarChart } from "@robr0/design-system/components/Chart/RadarChart";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

const radarData = [
  { subject: "Design", teamA: 120, teamB: 90 },
  { subject: "Frontend", teamA: 98, teamB: 130 },
  { subject: "Backend", teamA: 86, teamB: 100 },
  { subject: "DevOps", teamA: 99, teamB: 85 },
  { subject: "Testing", teamA: 85, teamB: 65 },
  { subject: "Communication", teamA: 65, teamB: 120 },
];

export default function RadarChartPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Radar chart</h1>
            <PageLinks storybookPath="/?path=/docs/components-radarchart--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Compare series across several axes at once
            </p>
            <p className={styles.introBody}>
              Each spoke is a category and each ring a value step, so overlapping shapes show strengths at a glance. Works with one series or several.
            </p>
          </div>

          <section className={`${styles.section} animate-in animate-delay-2`}>
            <SectionTitle title="Multi-series and single series" />
            <div className={styles.chartRow}>
              <RadarChart
                data={radarData}
                categoryKey="subject"
                series={[
                  { dataKey: "teamA", label: "Team Alpha" },
                  { dataKey: "teamB", label: "Team Beta" },
                ]}
                title="Team skills"
                subtitle="Competency comparison across domains"
                height={380}
              />
              <RadarChart
                data={radarData}
                categoryKey="subject"
                series={[
                  { dataKey: "teamA", label: "Team Alpha", fillOpacity: 0.4 },
                ]}
                title="Team Alpha focus"
                subtitle="Single-series radar"
                height={380}
              />
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
