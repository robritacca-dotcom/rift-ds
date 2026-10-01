"use client";

import React, { useState } from "react";
import Link from "next/link";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { InspectorDropdown } from "rift-ds/components/Inspector/InspectorDropdown";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";
import styles from "./page.module.css";

const layoutOptions = [
  { value: "grid", label: "Grid" },
  { value: "list", label: "List" },
  { value: "board", label: "Board" },
];

const fontOptions = [
  { value: "match", label: "Match body" },
  { value: "serif", label: "Serif", font: "Georgia, serif" },
  { value: "mono", label: "Monospace", font: "ui-monospace, Menlo, monospace" },
];

export default function InspectorDropdownPage() {
  const [layout, setLayout] = useState("grid");
  const [compactLayout, setCompactLayout] = useState("list");
  const [font, setFont] = useState("serif");

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Inspector dropdown</h1>
            <PageLinks storybookPath="/?path=/docs/components-inspectordropdown--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>A pick from a list in one row</p>
            <p className={styles.introBody}>
              The name sits on the left and the chosen option and a chevron on the right. It is the library Dropdown with its trigger dressed as an inspector bar, so the menu, its keyboard model and its per-option font previews are Dropdown’s own. A click anywhere on the bar, the name included, opens the menu.
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
                <InspectorDropdown label="Layout" options={layoutOptions} value={layout} onValueChange={setLayout} />
              </div>
              <div className={styles.demoColumn}>
                <span className={styles.demoCaption}>Compact</span>
                <InspectorDropdown
                  size="compact"
                  label="Layout"
                  options={layoutOptions}
                  value={compactLayout}
                  onValueChange={setCompactLayout}
                />
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Font previews" />
            <p className={styles.introBody}>
              Give an option a <code>font</code> and its row renders in that face, as in Dropdown. The selected option’s face carries into the bar, so a typeface picker previews the current choice where it sits.
            </p>
            <div className={styles.demoColumn}>
              <InspectorDropdown label="Headings" options={fontOptions} value={font} onValueChange={setFont} />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Placeholder" />
            <p className={styles.introBody}>
              With no value set, the bar shows the <code>placeholder</code> on the right.
            </p>
            <div className={styles.demoColumn}>
              <InspectorDropdown label="Layout" options={layoutOptions} placeholder="Choose" />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Disabled" />
            <div className={styles.sizeRow}>
              <div className={styles.demoColumn}>
                <span className={styles.demoCaption}>Default</span>
                <InspectorDropdown label="Layout" options={layoutOptions} value="grid" disabled />
              </div>
              <div className={styles.demoColumn}>
                <span className={styles.demoCaption}>Compact</span>
                <InspectorDropdown size="compact" label="Layout" options={layoutOptions} value="list" disabled />
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="When to use it" />
            <p className={styles.introBody}>
              Use the inspector dropdown for a pick from a short list in a dense panel, usually inside an{" "}
              <Link href="/components/inspector-section">inspector section</Link>, whose open body lets the menu open past its edge. For a form field with a label above and helper text below, use{" "}
              <Link href="/components/dropdown">Dropdown</Link> itself.
            </p>
          </section>

          <ComponentInstallStrip slug="inspector-dropdown" />
        </main>
      </div>
    </>
  );
}
