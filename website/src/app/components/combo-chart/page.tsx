"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { ComboChart } from "@robr0/design-system/components/Chart/ComboChart";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

const spendRoasData = [
  { label: "Jan", spend: 42, roas: 2.8 },
  { label: "Feb", spend: 46, roas: 2.9 },
  { label: "Mar", spend: 51, roas: 3.1 },
  { label: "Apr", spend: 48, roas: 3.0 },
  { label: "May", spend: 55, roas: 3.3 },
  { label: "Jun", spend: 61, roas: 3.4 },
  { label: "Jul", spend: 58, roas: 3.6 },
  { label: "Aug", spend: 64, roas: 3.7 },
  { label: "Sep", spend: 70, roas: 3.9 },
  { label: "Oct", spend: 74, roas: 4.0 },
  { label: "Nov", spend: 82, roas: 4.1 },
  { label: "Dec", spend: 88, roas: 4.2 },
];

export default function ComboChartPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Combo chart</h1>
            <PageLinks storybookPath="/?path=/docs/components-combochart--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Two related series, one chart
            </p>
            <p className={styles.introBody}>
              Bars carry one series and an overlaid line carries a second, with the line on its own right-hand axis when the units differ. Built for pairs like monthly spend against ROAS, where the interesting part is how they move together.
            </p>
          </div>

          <section className={`${styles.section} animate-in animate-delay-2`}>
            <SectionTitle title="Interactive" />
            <ComboChart
              data={spendRoasData}
              barKey="spend"
              barLabel="Spend ($K)"
              lineKey="roas"
              lineLabel="ROAS"
              title="Combo chart (interactive)"
              subtitle="Monthly ad spend against return on ad spend"
              summaryItems={[
                { label: "Total spend", value: "$739K" },
                { label: "Avg ROAS", value: "3.5x" },
              ]}
            />
          </section>
        </main>
      </div>

    </>
  );
}
