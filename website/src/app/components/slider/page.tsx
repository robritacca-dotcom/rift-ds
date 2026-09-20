"use client";

import React, { useState } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Slider } from "@robr0/design-system/components/Slider/Slider";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

export default function SliderPage() {
  const [value1, setValue1] = useState(60);
  const [value2, setValue2] = useState(35);

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Slider</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-slider--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Select a value from a range
            </p>
            <p className={styles.introBody}>
              A draggable input that lets users pick a numeric value within a defined range. Supports default and compact sizes with a filled track to show the current position.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <div className={styles.variantStack} style={{ maxWidth: "400px" }}>
              <Slider value={value1} onValueChange={setValue1} />
            </div>
          </section>

          {/* Compact */}
          <section className={styles.section}>
            <SectionTitle title="Compact" />
            <div className={styles.variantStack} style={{ maxWidth: "400px" }}>
              <Slider value={value2} onValueChange={setValue2} size="compact" />
            </div>
          </section>

          {/* Disabled */}
          <section className={styles.section}>
            <SectionTitle title="Disabled" />
            <div className={styles.variantStack} style={{ maxWidth: "400px" }}>
              <Slider value={50} disabled />
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
