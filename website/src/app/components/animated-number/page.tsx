"use client";

import React, { useState } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { AnimatedNumber } from "@robr0/design-system/components/AnimatedNumber/AnimatedNumber";
import { Button } from "@robr0/design-system/components/Button/Button";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

export default function AnimatedNumberPage() {
  // Remount key replays the count-up; the revenue value feeds the tween demo.
  const [replay, setReplay] = useState(0);
  const [revenue, setRevenue] = useState(128400);

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Animated number</h1>
            <PageLinks storybookPath="/?path=/docs/components-animatednumber--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              A number that counts to its value
            </p>
            <p className={styles.introBody}>
              On mount it counts up from zero; when the value changes it tweens from where it was, easing out so the landing reads as arrival. The digits sit on tabular figures, so nothing around them jitters while they roll. Screen readers hear only the settled value, and reduced motion snaps straight to it.
            </p>
          </div>

          {/* Count-up */}
          <section className={styles.section}>
            <SectionTitle title="Count-up" />
            <div className={styles.variantRow} key={replay}>
              <span className={styles.bigNumber}>
                <AnimatedNumber value={48210} />
              </span>
              <Button
                label="Replay"
                variant="secondary"
                size="compact"
                iconLeft="replay"
                onClick={() => setReplay((k) => k + 1)}
              />
            </div>
          </section>

          {/* Value changes */}
          <section className={styles.section}>
            <SectionTitle title="Value changes" />
            <p className={styles.sectionNote}>
              A change tweens from the previous value, not from zero, so a moving metric reads as movement rather than a reset.
            </p>
            <div className={styles.variantRow}>
              <span className={styles.bigNumber}>
                <AnimatedNumber
                  value={revenue}
                  format={(n) =>
                    n.toLocaleString(undefined, {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    })
                  }
                />
              </span>
              <Button
                label="Close a deal"
                variant="secondary"
                size="compact"
                onClick={() => setRevenue((v) => v + Math.round(2000 + Math.random() * 14000))}
              />
            </div>
          </section>

          {/* In a stat row */}
          <section className={styles.section}>
            <SectionTitle title="In a stat row" />
            <p className={styles.sectionNote}>
              The component owns no face, size, or colour: it inherits the type around it, so it drops into a stat tile, a table cell, or a sentence.
            </p>
            <div className={styles.statRow} key={`stats-${replay}`}>
              <div className={styles.statTile}>
                <span className={styles.statLabel}>Requests</span>
                <span className={styles.statValue}>
                  <AnimatedNumber value={48210} />
                </span>
              </div>
              <div className={styles.statTile}>
                <span className={styles.statLabel}>Uptime</span>
                <span className={styles.statValue}>
                  <AnimatedNumber value={99.98} decimals={2} />%
                </span>
              </div>
              <div className={styles.statTile}>
                <span className={styles.statLabel}>p95 latency</span>
                <span className={styles.statValue}>
                  <AnimatedNumber value={187} />ms
                </span>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
