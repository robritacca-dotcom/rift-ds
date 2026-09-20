"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { LegendTile } from "@robr0/design-system/components/LegendTile/LegendTile";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

const channels = [
  { label: "Direct", value: "1,204", swatch: "var(--color-chart-series-1)" },
  {
    label: "Organic search",
    value: "982",
    swatch: "var(--color-chart-series-2)",
  },
  { label: "Referral", value: "611", swatch: "var(--color-chart-series-3)" },
  { label: "Social", value: "245", swatch: "var(--color-chart-series-4)" },
] as const;

export default function LegendTilePage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Legend tile</h1>
            <PageLinks storybookPath="/?path=/docs/components-legendtile--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              The number that goes with the line
            </p>
            <p className={styles.introBody}>
              A labelled value tile for the row under a chart: a series dot
              matching the palette, the series name, and its reading. The tile
              sits one surface step below its panel so it reads as an inset,
              and it is pure JSX and CSS, so a row of them costs nothing under
              a dense dashboard.
            </p>
          </div>

          <section className={`${styles.section} animate-in animate-delay-2`}>
            <SectionTitle title="Under a chart" />
            <p className={styles.sectionBody}>
              The intended home: one tile per series, dots matching the chart
              palette, laid out in a row inside the chart&apos;s panel.
            </p>
            <div className={styles.panel}>
              <div className={styles.tileRow}>
                {channels.map((c) => (
                  <LegendTile
                    key={c.label}
                    label={c.label}
                    value={c.value}
                    swatch={c.swatch}
                  />
                ))}
              </div>
            </div>
          </section>

          <section className={`${styles.section} animate-in animate-delay-3`}>
            <SectionTitle title="Without a swatch" />
            <p className={styles.sectionBody}>
              Omit the swatch and no dot renders: the tile becomes a plain
              labelled value, for totals and summary figures that belong to no
              single series.
            </p>
            <div className={styles.tileRow}>
              <LegendTile label="Total sessions" value="3,042" />
              <LegendTile label="Conversion rate" value="4.6%" />
            </div>
          </section>

          <section className={`${styles.section} animate-in animate-delay-4`}>
            <SectionTitle title="Numbers and long labels" />
            <p className={styles.sectionBody}>
              A numeric value is formatted with toLocaleString, and a label
              that outgrows its tile truncates with an ellipsis rather than
              wrapping.
            </p>
            <div className={styles.tileRow}>
              <LegendTile
                label="Total events"
                value={1284093}
                swatch="var(--color-chart-series-5)"
              />
              <LegendTile
                className={styles.narrowTile}
                label="Returning visitors from paid campaigns"
                value="18,240"
                swatch="var(--color-chart-series-6)"
              />
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
