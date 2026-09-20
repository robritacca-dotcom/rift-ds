"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { LineChart } from "@robr0/design-system/components/Chart/LineChart";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

const lineData = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
  { month: "Apr", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "Jun", desktop: 214, mobile: 140 },
];

export default function LineChartPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Line chart</h1>
            <PageLinks storybookPath="/?path=/docs/components-linechart--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Trends over time, one line per series
            </p>
            <p className={styles.introBody}>
              Each series gets its own colour and legend entry, and the summary row totals the story. Built on Recharts with system tokens for the series palette, axes, gridlines, and typography.
            </p>
          </div>

          <section className={`${styles.section} animate-in animate-delay-2`}>
            <SectionTitle title="Default" />
            <LineChart
              data={lineData}
              xKey="month"
              series={[
                { dataKey: "desktop", label: "Desktop" },
                { dataKey: "mobile", label: "Mobile" },
              ]}
              title="Visitors by device"
              subtitle="January to June 2024"
              summaryItems={[
                { label: "Desktop", value: "1,224" },
                { label: "Mobile", value: 860 },
              ]}
            />
          </section>
        </main>
      </div>

    </>
  );
}
