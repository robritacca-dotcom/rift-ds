"use client";

import React, { useState } from "react";
import Link from "next/link";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { InspectorSlider } from "rift-ds/components/Inspector/InspectorSlider";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";
import styles from "./page.module.css";

const percent = (v: number) => `${v}%`;

export default function InspectorSliderPage() {
  const [density, setDensity] = useState(100);
  const [motion, setMotion] = useState(80);

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Inspector slider</h1>
            <PageLinks storybookPath="/?path=/docs/components-inspectorslider--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>A numeric setting in one row</p>
            <p className={styles.introBody}>
              The whole bar is the slider. Its fill is the value, the name sits inside on the left and the reading on the right, so a setting costs one row with no label above it. Drag anywhere on the bar, click to jump, or use the arrow keys: a native range input covers the bar, so pointer, keyboard and screen-reader behaviour are the platform’s.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="Sizes" />
            <p className={styles.introBody}>
              The <code>size</code> prop matches Button’s, so a bar and a button of one size sit level in the same rail. Default is 40px tall and compact is 32px.
            </p>
            <div className={styles.sizeRow}>
              <div className={styles.demoColumn}>
                <span className={styles.demoCaption}>Default</span>
                <InspectorSlider
                  label="Density"
                  value={density}
                  min={70}
                  max={130}
                  step={5}
                  format={percent}
                  onValueChange={setDensity}
                />
              </div>
              <div className={styles.demoColumn}>
                <span className={styles.demoCaption}>Compact</span>
                <InspectorSlider
                  size="compact"
                  label="Motion"
                  value={motion}
                  min={50}
                  max={150}
                  step={10}
                  format={percent}
                  onValueChange={setMotion}
                />
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Reading" />
            <p className={styles.introBody}>
              Without <code>format</code>, the reading shows the step’s precision, so a step of 0.02 reads “0.50”. With it, the formatted string is both the visible reading and the value a screen reader announces.
            </p>
            <div className={styles.demoColumn}>
              <InspectorSlider label="Opacity" defaultValue={0.5} min={0} max={1} step={0.02} />
              <InspectorSlider label="Blur" defaultValue={24} min={0} max={64} format={(v) => `${v}px`} />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Disabled" />
            <div className={styles.sizeRow}>
              <div className={styles.demoColumn}>
                <span className={styles.demoCaption}>Default</span>
                <InspectorSlider label="Density" defaultValue={100} min={70} max={130} format={percent} disabled />
              </div>
              <div className={styles.demoColumn}>
                <span className={styles.demoCaption}>Compact</span>
                <InspectorSlider size="compact" label="Motion" defaultValue={80} min={50} max={150} format={percent} disabled />
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="When to use it" />
            <p className={styles.introBody}>
              Use the inspector slider in a dense panel of many settings, such as a tool’s side rail, usually inside an{" "}
              <Link href="/components/inspector-section">inspector section</Link>. In a form, where a label above and helper text below earn their room, use{" "}
              <Link href="/components/slider">Slider</Link> instead.
            </p>
          </section>

          <ComponentInstallStrip slug="inspector-slider" />
        </main>
      </div>
    </>
  );
}
