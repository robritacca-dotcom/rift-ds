"use client";

import React, { useState } from "react";
import Link from "next/link";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { InspectorToggleSwitch } from "rift-ds/components/Inspector/InspectorToggleSwitch";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";
import styles from "./page.module.css";

export default function InspectorToggleSwitchPage() {
  const [pill, setPill] = useState(true);
  const [tight, setTight] = useState(false);

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Inspector toggle switch</h1>
            <PageLinks storybookPath="/?path=/docs/components-inspectortoggleswitch--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>An on or off setting in one row</p>
            <p className={styles.introBody}>
              The whole bar is the switch, with the name on the left and a small track at the end. A native checkbox with <code>{'role="switch"'}</code> covers the bar, so a click anywhere toggles it, Space toggles it from the keyboard, and both <code>checked</code> and <code>defaultChecked</code> work. The on state is neutral, never the action colour.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="Sizes" />
            <p className={styles.introBody}>
              The <code>size</code> prop matches Button’s: default is 40px tall and compact is 32px.
            </p>
            <div className={styles.sizeRow}>
              <div className={styles.demoColumn}>
                <span className={styles.demoCaption}>Default</span>
                <InspectorToggleSwitch label="Pill buttons" checked={pill} onCheckedChange={setPill} />
              </div>
              <div className={styles.demoColumn}>
                <span className={styles.demoCaption}>Compact</span>
                <InspectorToggleSwitch size="compact" label="Tight headings" checked={tight} onCheckedChange={setTight} />
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Off and on" />
            <div className={styles.demoColumn}>
              <InspectorToggleSwitch label="Show grid" defaultChecked={false} />
              <InspectorToggleSwitch label="Snap to grid" defaultChecked />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Disabled" />
            <div className={styles.sizeRow}>
              <div className={styles.demoColumn}>
                <span className={styles.demoCaption}>Off</span>
                <InspectorToggleSwitch label="Show grid" disabled />
              </div>
              <div className={styles.demoColumn}>
                <span className={styles.demoCaption}>On</span>
                <InspectorToggleSwitch label="Snap to grid" defaultChecked disabled />
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="When to use it" />
            <p className={styles.introBody}>
              Use the inspector toggle switch for a setting that applies at once in a dense panel, usually inside an{" "}
              <Link href="/components/inspector-section">inspector section</Link>. For a standalone switch with its label beside it, in a form or a settings page with room to breathe, use{" "}
              <Link href="/components/toggle-switch">Toggle switch</Link> instead.
            </p>
          </section>

          <ComponentInstallStrip slug="inspector-toggle-switch" />
        </main>
      </div>
    </>
  );
}
