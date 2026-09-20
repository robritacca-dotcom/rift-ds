"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Waveform } from "@robr0/design-system/components/Waveform/Waveform";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

export default function WaveformPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Waveform</h1>
            <PageLinks storybookPath="/?path=/docs/components-waveform--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Voice made visible
            </p>
            <p className={styles.introBody}>
              The audio channel&apos;s indicator: a row of bars that dance while sound is happening. The animated states run on the same twelve-slot cycle as the agent status patterns, so every moving indicator in a surface keeps one rhythm; a real analyser can drive the bars directly instead.
            </p>
          </div>

          {/* States */}
          <section className={styles.section}>
            <SectionTitle title="States" />
            <p className={styles.sectionNote}>
              Idle parks the bars low and still. Listening runs a gentle half-height wave for an open microphone; speaking runs the full one for audio going out.
            </p>
            <div className={styles.stateRow}>
              <div className={styles.stateTile}>
                <Waveform state="idle" />
                <span className={styles.stateLabel}>Idle</span>
              </div>
              <div className={styles.stateTile}>
                <Waveform state="listening" />
                <span className={styles.stateLabel}>Listening</span>
              </div>
              <div className={styles.stateTile}>
                <Waveform state="speaking" />
                <span className={styles.stateLabel}>Speaking</span>
              </div>
            </div>
          </section>

          {/* Sizes */}
          <section className={styles.section}>
            <SectionTitle title="Sizes" />
            <div className={styles.stateRow}>
              <div className={styles.stateTile}>
                <Waveform state="speaking" />
                <span className={styles.stateLabel}>Default</span>
              </div>
              <div className={styles.stateTile}>
                <Waveform state="speaking" size="compact" />
                <span className={styles.stateLabel}>Compact</span>
              </div>
            </div>
          </section>

          {/* Width */}
          <section className={styles.section}>
            <SectionTitle title="Width" />
            <p className={styles.sectionNote}>
              The bar count sets the wave&apos;s width. Five reads as an icon; sixteen reads as an instrument.
            </p>
            <div className={styles.stateRow}>
              <div className={styles.stateTile}>
                <Waveform state="speaking" bars={5} />
                <span className={styles.stateLabel}>5 bars</span>
              </div>
              <div className={styles.stateTile}>
                <Waveform state="speaking" bars={16} />
                <span className={styles.stateLabel}>16 bars</span>
              </div>
            </div>
          </section>

          {/* Tinting */}
          <section className={styles.section}>
            <SectionTitle title="Tinting" />
            <p className={styles.sectionNote}>
              Monochrome by default, like the agent working states: colour is reserved for meaning. When several voices share a surface, tint each wave through its custom property.
            </p>
            <div className={styles.stateRow}>
              <div className={styles.stateTile}>
                <Waveform
                  state="speaking"
                  label="Agent speaking"
                  style={{ "--ds-waveform-color": "var(--color-core-accent-mint)" } as React.CSSProperties}
                />
                <span className={styles.stateLabel}>Mint</span>
              </div>
              <div className={styles.stateTile}>
                <Waveform
                  state="speaking"
                  label="Agent speaking"
                  style={{ "--ds-waveform-color": "var(--color-core-accent-violet)" } as React.CSSProperties}
                />
                <span className={styles.stateLabel}>Violet</span>
              </div>
              <div className={styles.stateTile}>
                <Waveform
                  state="speaking"
                  label="Agent speaking"
                  style={{ "--ds-waveform-color": "var(--color-core-accent-coral)" } as React.CSSProperties}
                />
                <span className={styles.stateLabel}>Coral</span>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
