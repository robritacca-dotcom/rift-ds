"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { BarChart } from "@robr0/design-system/components/Chart/BarChart";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

function generatePageViews() {
  const data: { label: string; value: number }[] = [];
  const start = new Date(2024, 3, 1);
  for (let i = 0; i < 90; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const value = Math.round(80 + Math.random() * 300);
    data.push({ label, value });
  }
  return data;
}

const pageViewData = generatePageViews();

export default function BarChartPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Bar chart</h1>
            <PageLinks storybookPath="/?path=/docs/components-barchart--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Compare values across categories or time
            </p>
            <p className={styles.introBody}>
              Bars carry a value each, with hover tooltips, an optional data label, and a summary row for headline stats. The default palette leads with the action teal and steps through the accent tokens.
            </p>
          </div>

          <section className={`${styles.section} animate-in animate-delay-2`}>
            <SectionTitle title="Interactive" />
            <BarChart
              data={pageViewData}
              title="Bar chart (interactive)"
              subtitle="Showing total visitors for the last 3 months"
              dataLabel="Page views"
              summaryItems={[
                { label: "Desktop", value: 24828 },
                { label: "Mobile", value: 25010 },
              ]}
            />
          </section>
        </main>
      </div>

    </>
  );
}
