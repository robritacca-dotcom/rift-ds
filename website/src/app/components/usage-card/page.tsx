"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { UsageCard } from "@robr0/design-system/components/UsageCard/UsageCard";
import { Gauge } from "@robr0/design-system/components/Gauge/Gauge";
import { Panel } from "@robr0/design-system/components/Panel/Panel";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

export default function UsageCardPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Usage card</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-usagecard--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              The agent&apos;s budget at a glance
            </p>
            <p className={styles.introBody}>
              Every agent runs on budgets: a context window, a plan limit, a
              rate cap. This card puts them in one place as meter rows with
              reset captions, and the fills recolour as a level approaches its
              limit, so the answer to “how much is left” never needs a click.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <div className={styles.variantStack} style={{ alignItems: "stretch", maxWidth: "440px" }}>
              <UsageCard
                title="Usage"
                subtitle="Plan limits and the current session"
                items={[
                  { label: "Context window", value: 126000, max: 200000, valueText: "126k / 200k tokens" },
                  { label: "Weekly limit", value: 38, resetLabel: "Resets Tuesday, 3:00 pm" },
                  { label: "Session limit", value: 12, resetLabel: "Resets in 2 h 40 min" },
                ]}
              />
            </div>
          </section>

          {/* Thresholds */}
          <section className={styles.section}>
            <SectionTitle title="Thresholds" />
            <p className={styles.introBody}>
              A fill is informational until it crosses the warning threshold
              (0.8 of its maximum by default), then warning, then error from
              0.95. An item&apos;s own variant pins the colour instead: a
              frozen quota can sit at 100% in neutral without shouting.
            </p>
            <div className={styles.variantStack} style={{ alignItems: "stretch", maxWidth: "440px" }}>
              <UsageCard
                title="Near the limits"
                items={[
                  { label: "Context window", value: 182000, max: 200000, valueText: "182k / 200k tokens" },
                  { label: "Weekly limit", value: 97, resetLabel: "Resets Tuesday, 3:00 pm" },
                  { label: "Archived quota", value: 100, valueText: "Frozen", variant: "neutral" },
                ]}
              />
            </div>
          </section>

          {/* Custom readouts */}
          <section className={styles.section}>
            <SectionTitle title="Custom readouts" />
            <p className={styles.introBody}>
              Each row&apos;s readout is free text, so budgets keep their own
              units: token counts, spend, file counts.
            </p>
            <div className={styles.variantStack} style={{ alignItems: "stretch", maxWidth: "440px" }}>
              <UsageCard
                items={[
                  { label: "Monthly spend", value: 41, valueText: "$8.20 of $20.00" },
                  { label: "Stored files", value: 3, max: 50, valueText: "3 of 50 files" },
                ]}
              />
            </div>
          </section>

          {/* Bare */}
          <section className={styles.section}>
            <SectionTitle title="Bare, inside a panel" />
            <p className={styles.introBody}>
              Like every chart-chrome card, bare mode drops the border,
              padding and fill so the card can sit inside a panel that
              supplies the surface, here beside a gauge.
            </p>
            <div className={styles.variantRow}>
              <Panel className={styles.variantItem} style={{ width: "440px", display: "flex", flexDirection: "column", gap: "var(--gap-lg)" }}>
                <UsageCard
                  title="Usage"
                  bare
                  items={[
                    { label: "Context window", value: 64, resetLabel: "Compacts automatically when full" },
                    { label: "Weekly limit", value: 22, resetLabel: "Resets Tuesday, 3:00 pm" },
                  ]}
                />
                <Gauge value={64} label="Context" bare />
              </Panel>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
