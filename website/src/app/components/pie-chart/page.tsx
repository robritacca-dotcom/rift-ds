"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { PieChart } from "@robr0/design-system/components/Chart/PieChart";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

const browserData = [
  { name: "Chrome", value: 275 },
  { name: "Safari", value: 200 },
  { name: "Firefox", value: 187 },
  { name: "Edge", value: 173 },
  { name: "Other", value: 90 },
];

const taskData = [
  { name: "Completed", value: 72, color: "#06D6A0" },
  { name: "In Progress", value: 18, color: "#FFD166" },
  { name: "Failed", value: 10, color: "#EF476F" },
];

export default function PieChartPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Pie chart</h1>
            <PageLinks storybookPath="/?path=/docs/components-piechart--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Share of a whole, as pie or donut
            </p>
            <p className={styles.introBody}>
              Slices size to their share, with per-slice colour overrides for status data. Set an inner radius and the pie becomes a donut.
            </p>
          </div>

          <section className={`${styles.section} animate-in animate-delay-2`}>
            <SectionTitle title="Pie and donut" />
            <div className={styles.chartRow}>
              <PieChart
                data={browserData}
                title="Browser share"
                subtitle="Visitor distribution by browser"
                height={380}
              />
              <PieChart
                data={taskData}
                title="Task status (donut)"
                subtitle="Current sprint"
                innerRadius={80}
                height={380}
              />
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
