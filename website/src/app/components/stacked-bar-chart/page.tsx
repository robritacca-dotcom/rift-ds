"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { StackedBarChart } from "@robr0/design-system/components/Chart/StackedBarChart";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

const trafficData = [
  { label: "Jan", desktop: 186, mobile: 80, tablet: 24 },
  { label: "Feb", desktop: 305, mobile: 200, tablet: 38 },
  { label: "Mar", desktop: 237, mobile: 120, tablet: 30 },
  { label: "Apr", desktop: 73, mobile: 190, tablet: 18 },
  { label: "May", desktop: 209, mobile: 130, tablet: 26 },
  { label: "Jun", desktop: 214, mobile: 140, tablet: 22 },
];

const trafficSeries = [
  { dataKey: "desktop", label: "Desktop" },
  { dataKey: "mobile", label: "Mobile" },
  { dataKey: "tablet", label: "Tablet" },
];

export default function StackedBarChartPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Stacked bar chart</h1>
            <PageLinks storybookPath="/?path=/docs/components-stackedbarchart--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Totals and their composition in one bar
            </p>
            <p className={styles.introBody}>
              Segments stack to the total, so each bar answers two questions at once: how much, and made of what.
            </p>
          </div>

          <section className={`${styles.section} animate-in animate-delay-2`}>
            <SectionTitle title="Default" />
            <StackedBarChart
              data={trafficData}
              xKey="label"
              series={trafficSeries}
              title="Visitors by device"
              subtitle="Monthly traffic, January to June 2024"
              height={350}
            />
          </section>
        </main>
      </div>

    </>
  );
}
