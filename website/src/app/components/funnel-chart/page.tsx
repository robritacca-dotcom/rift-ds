"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { FunnelChart } from "@robr0/design-system/components/FunnelChart/FunnelChart";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

const conversionFunnel = [
  { label: "Visits", value: 96400, displayValue: "96.4K" },
  { label: "Sign-ups", value: 38600, displayValue: "38.6K" },
  { label: "Trials", value: 14100, displayValue: "14.1K" },
  { label: "Customers", value: 5200, displayValue: "5.2K" },
];

const salesFunnel = [
  { label: "Leads", value: 12400, displayValue: "12.4K" },
  { label: "Qualified", value: 6100, displayValue: "6.1K" },
  { label: "Won", value: 2300, displayValue: "2.3K" },
];

const adsFunnel = [
  { label: "Impressions", value: 480000, displayValue: "480K" },
  { label: "Clicks", value: 21600, displayValue: "21.6K" },
  { label: "Installs", value: 4300, displayValue: "4.3K" },
  { label: "Purchases", value: 610, displayValue: "610" },
];

export default function FunnelChartPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Funnel chart</h1>
            <PageLinks storybookPath="/?path=/docs/components-funnelchart--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Where the numbers thin out, stage by stage
            </p>
            <p className={styles.introBody}>
              Ordered stages as a centred funnel of trapezoid bands, each
              one&apos;s width its share of the first: the taper itself is
              the conversion story. Built on the charting library&apos;s
              native funnel, so the stages sweep in on load and hovering a
              band raises the family&apos;s glass tooltip with the
              stage&apos;s reading and percentage. It wears the same card,
              header, and padding as every other chart, and bare strips them
              inside a panel that supplies the surface.
            </p>
          </div>

          <section className={`${styles.section} animate-in animate-delay-2`}>
            <SectionTitle title="Default" />
            <p className={styles.sectionBody}>
              Four stages from visit to customer. The first stage always spans
              the full width; every later band reads as a fraction of it, with
              its name at its side. Title and subtitle sit in the shared chart
              header.
            </p>
            <FunnelChart
              data={conversionFunnel}
              title="Acquisition funnel"
              subtitle="Visits through to paying customers"
            />
          </section>

          <section className={`${styles.section} animate-in animate-delay-3`}>
            <SectionTitle title="With legend tiles" />
            <p className={styles.sectionBody}>
              When a row of legend tiles gives each stage its label and
              formatted count in the same series order, showLabels turns the
              in-chart names off so nothing says anything twice. Composed like
              this, the funnel goes bare and the surrounding panel supplies
              the surface.
            </p>
            <div className={styles.funnelWithLegend}>
              <FunnelChart bare showLabels={false} data={salesFunnel} />
              <div className={styles.legendRow}>
                {salesFunnel.map((stage, i) => (
                  <div key={stage.label} className={styles.legendTile}>
                    <span
                      className={styles.legendDot}
                      data-series={i + 1}
                      aria-hidden="true"
                    />
                    <span className={styles.legendLabel}>{stage.label}</span>
                    <span className={styles.legendValue}>
                      {stage.displayValue}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className={`${styles.section} animate-in animate-delay-4`}>
            <SectionTitle title="Steep drop-off" />
            <p className={styles.sectionBody}>
              A steep drop-off draws exactly as steep as it is: the late
              stages narrow to slivers of the first, and the tooltip carries
              each stage&apos;s true count and percentage.
            </p>
            <FunnelChart data={adsFunnel} />
          </section>
        </main>
      </div>
    </>
  );
}
