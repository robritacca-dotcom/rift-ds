"use client";

import React, { useState } from "react";
import Link from "next/link";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { InspectorSegmentedControl } from "rift-ds/components/Inspector/InspectorSegmentedControl";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";
import styles from "./page.module.css";

const elevationOptions = [
  { value: "default", label: "Default" },
  { value: "flat", label: "Flat" },
  { value: "soft", label: "Soft" },
];

const alignOptions = [
  { value: "left", label: "Left" },
  { value: "centre", label: "Centre" },
  { value: "right", label: "Right" },
];

export default function InspectorSegmentedControlPage() {
  const [elevation, setElevation] = useState("default");
  const [align, setAlign] = useState("left");

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Inspector segmented control</h1>
            <PageLinks storybookPath="/?path=/docs/components-inspectorsegmentedcontrol--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>A choice between a few options in one row</p>
            <p className={styles.introBody}>
              The name sits on the left and the options as chips at the bar’s end. The selected chip takes a neutral fill, never the action colour. Each option is a native radio, so the set announces as one radiogroup named by the label, arrow keys move the selection, and it submits with a form.
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
                <InspectorSegmentedControl
                  label="Elevation"
                  options={elevationOptions}
                  value={elevation}
                  onValueChange={setElevation}
                />
              </div>
              <div className={styles.demoColumn}>
                <span className={styles.demoCaption}>Compact</span>
                <InspectorSegmentedControl
                  size="compact"
                  label="Align"
                  options={alignOptions}
                  value={align}
                  onValueChange={setAlign}
                />
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Disabled option" />
            <p className={styles.introBody}>
              Set <code>disabled</code> on one option to take that choice out of the set while the others stay available.
            </p>
            <div className={styles.demoColumn}>
              <InspectorSegmentedControl
                label="Theme"
                defaultValue="light"
                options={[
                  { value: "light", label: "Light" },
                  { value: "dark", label: "Dark" },
                  { value: "auto", label: "Auto", disabled: true },
                ]}
              />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Disabled" />
            <div className={styles.sizeRow}>
              <div className={styles.demoColumn}>
                <span className={styles.demoCaption}>Default</span>
                <InspectorSegmentedControl label="Elevation" options={elevationOptions} defaultValue="flat" disabled />
              </div>
              <div className={styles.demoColumn}>
                <span className={styles.demoCaption}>Compact</span>
                <InspectorSegmentedControl size="compact" label="Align" options={alignOptions} defaultValue="centre" disabled />
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="When to use it" />
            <p className={styles.introBody}>
              Use the inspector segmented control for a setting with two to four short options in a dense panel, usually inside an{" "}
              <Link href="/components/inspector-section">inspector section</Link>. For a free-standing pill strip in a form or a toolbar, such as a view switcher, use{" "}
              <Link href="/components/segmented-control">Segmented control</Link> instead.
            </p>
          </section>

          <ComponentInstallStrip slug="inspector-segmented-control" />
        </main>
      </div>
    </>
  );
}
