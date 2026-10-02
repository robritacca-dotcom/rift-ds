"use client";

import React, { useState } from "react";
import Link from "next/link";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { InspectorColorPicker } from "rift-ds/components/Inspector/InspectorColorPicker";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";
import styles from "./page.module.css";

export default function InspectorColorPickerPage() {
  const [tint, setTint] = useState("#163300");
  const [brand, setBrand] = useState("#8AE86E");
  const [overlay, setOverlay] = useState("#0E6E8F80");

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Inspector colour picker</h1>
            <PageLinks storybookPath="/?path=/docs/components-inspectorcolorpicker--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>A colour setting in one row</p>
            <p className={styles.introBody}>
              The name sits on the left, and the hex reading and a round swatch sit at the bar’s end. It is the library ColorPicker with its trigger dressed as an inspector bar, so the panel, with its saturation area, hue slider and hex field, is ColorPicker’s own. A click anywhere on the bar, the name included, opens the panel.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="Sizes" />
            <p className={styles.introBody}>
              The <code>size</code> prop matches Button’s: default is 40px tall and compact is 32px. The swatch is one line of text tall, so it sits concentric with the bar’s rounded end.
            </p>
            <div className={styles.sizeRow}>
              <div className={styles.demoColumn}>
                <span className={styles.demoCaption}>Default</span>
                <InspectorColorPicker label="Tint colour" value={tint} onValueChange={setTint} />
              </div>
              <div className={styles.demoColumn}>
                <span className={styles.demoCaption}>Compact</span>
                <InspectorColorPicker size="compact" label="Brand" value={brand} onValueChange={setBrand} />
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Alpha" />
            <p className={styles.introBody}>
              Set <code>showAlpha</code> to add an opacity slider to the panel. Below full opacity the reading and the emitted value become 8-digit hex, and the swatch shows the colour over a checkerboard.
            </p>
            <div className={styles.demoColumn}>
              <InspectorColorPicker label="Overlay" value={overlay} onValueChange={setOverlay} showAlpha />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Disabled" />
            <div className={styles.sizeRow}>
              <div className={styles.demoColumn}>
                <span className={styles.demoCaption}>Default</span>
                <InspectorColorPicker label="Tint colour" value="#163300" disabled />
              </div>
              <div className={styles.demoColumn}>
                <span className={styles.demoCaption}>Compact</span>
                <InspectorColorPicker size="compact" label="Brand" value="#8AE86E" disabled />
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="When to use it" />
            <p className={styles.introBody}>
              Use the inspector colour picker for a colour setting in a dense panel, usually inside an{" "}
              <Link href="/components/inspector-section">inspector section</Link>, whose open body lets the panel open past its edge. For a fixed set of colours, a row of{" "}
              <Link href="/components/swatch">swatches</Link> is quicker to pick from. For a form field with a label above and helper text below, use{" "}
              <Link href="/components/color-picker">ColorPicker</Link> itself.
            </p>
          </section>

          <ComponentInstallStrip slug="inspector-color-picker" />
        </main>
      </div>
    </>
  );
}
