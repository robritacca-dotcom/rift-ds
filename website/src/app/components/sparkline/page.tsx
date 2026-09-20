"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Sparkline } from "@robr0/design-system/components/Sparkline/Sparkline";
import { Stat } from "@robr0/design-system/components/Stat/Stat";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

const trendUp = [4, 6, 5, 8, 7, 10, 9, 12, 14, 13, 16];
const trendDown = [16, 14, 15, 12, 13, 10, 11, 8, 7, 8, 5];
const wobble = [8, 10, 7, 11, 9, 12, 8, 10, 11, 9, 12];
const flat = [5, 5, 5, 5, 5, 5, 5, 5];

const tones = [
  { tone: "accent", label: "Accent", data: wobble },
  { tone: "positive", label: "Positive", data: trendUp },
  { tone: "negative", label: "Negative", data: trendDown },
  { tone: "neutral", label: "Neutral", data: wobble },
] as const;

export default function SparklinePage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Sparkline</h1>
            <PageLinks storybookPath="/?path=/docs/components-sparkline--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              The trend at a glance, no axes required
            </p>
            <p className={styles.introBody}>
              A tiny line chart for the inside of a Stat, a table cell, or any
              spot where one number needs its recent history. Pure SVG computed
              from a plain array: no recharts, no client JavaScript, so it
              renders from a Server Component and costs nothing repeated down a
              column.
            </p>
          </div>

          <section className={`${styles.section} animate-in animate-delay-2`}>
            <SectionTitle title="Variants" />
            <div className={styles.exampleRow}>
              <div className={styles.exampleCell}>
                <span className={styles.exampleLabel}>Line</span>
                <Sparkline data={wobble} />
              </div>
              <div className={styles.exampleCell}>
                <span className={styles.exampleLabel}>Area</span>
                <Sparkline data={wobble} variant="area" />
              </div>
              <div className={styles.exampleCell}>
                <span className={styles.exampleLabel}>No dot</span>
                <Sparkline data={wobble} showDot={false} />
              </div>
            </div>
          </section>

          <section className={`${styles.section} animate-in animate-delay-3`}>
            <SectionTitle title="Tones" />
            <div className={styles.exampleRow}>
              {tones.map((t) => (
                <div key={t.tone} className={styles.exampleCell}>
                  <span className={styles.exampleLabel}>{t.label}</span>
                  <Sparkline data={[...t.data]} tone={t.tone} />
                </div>
              ))}
            </div>
          </section>

          <section className={`${styles.section} animate-in animate-delay-4`}>
            <SectionTitle title="Inside a stat" />
            <p className={styles.sectionBody}>
              The intended home: a quiet trend under the headline number.
              Match the tone to the delta so the two read as one signal.
            </p>
            <div className={styles.statRow}>
              <div className={styles.statCell}>
                <Stat
                  value="3.8M"
                  label="Monthly sessions"
                  delta="+12%"
                  trend="up"
                />
                <Sparkline
                  data={trendUp}
                  tone="positive"
                  label="Sessions, trending up"
                />
              </div>
              <div className={styles.statCell}>
                <Stat
                  value="1,204"
                  label="Weekly signups"
                  delta="-8%"
                  trend="down"
                />
                <Sparkline
                  data={trendDown}
                  tone="negative"
                  label="Signups, trending down"
                />
              </div>
              <div className={styles.statCell}>
                <Stat value="99.98%" label="Uptime" delta="No change" />
                <Sparkline data={flat} tone="neutral" label="Uptime, steady" />
              </div>
            </div>
          </section>

          <section className={`${styles.section} animate-in animate-delay-5`}>
            <SectionTitle title="Degenerate data" />
            <p className={styles.sectionBody}>
              Awkward series never break the drawing. An all-equal series
              renders a horizontal midline, a single point renders just the
              dot, and an empty array renders nothing at all.
            </p>
            <div className={styles.exampleRow}>
              <div className={styles.exampleCell}>
                <span className={styles.exampleLabel}>Flat series</span>
                <Sparkline data={flat} tone="neutral" />
              </div>
              <div className={styles.exampleCell}>
                <span className={styles.exampleLabel}>One point</span>
                <Sparkline data={[7]} tone="neutral" />
              </div>
              <div className={styles.exampleCell}>
                <span className={styles.exampleLabel}>Empty</span>
                <Sparkline data={[]} tone="neutral" />
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
