"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { AreaChart } from "@robr0/design-system/components/Chart/AreaChart";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

const areaData = [
  { month: "Jan", organic: 140, paid: 60 },
  { month: "Feb", organic: 210, paid: 95 },
  { month: "Mar", organic: 185, paid: 120 },
  { month: "Apr", organic: 260, paid: 145 },
  { month: "May", organic: 230, paid: 170 },
  { month: "Jun", organic: 310, paid: 200 },
];

export default function AreaChartPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Area chart</h1>
            <PageLinks storybookPath="/?path=/docs/components-areachart--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Volume over time as a filled area
            </p>
            <p className={styles.introBody}>
              Area charts emphasise how much has accumulated, not just where the line sits. Series stack or overlap with soft fills, and the summary row carries the headline numbers.
            </p>
          </div>

          <section className={`${styles.section} animate-in animate-delay-2`}>
            <SectionTitle title="Multi-series" />
            <AreaChart
              data={areaData}
              xKey="month"
              series={[
                { dataKey: "organic", label: "Organic" },
                { dataKey: "paid", label: "Paid" },
              ]}
              title="Traffic sources"
              subtitle="Organic vs paid visits, January to June 2024"
              summaryItems={[
                { label: "Organic", value: "1,335" },
                { label: "Paid", value: 790 },
              ]}
            />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Single series" />
            <AreaChart
              data={areaData}
              xKey="month"
              series={[{ dataKey: "organic", label: "Organic" }]}
              title="Organic traffic"
              subtitle="January to June 2024"
            />
          </section>
        </main>
      </div>

    </>
  );
}
