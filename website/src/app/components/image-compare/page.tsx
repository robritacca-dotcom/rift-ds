"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { ImageCompare } from "@robr0/design-system/components/ImageCompare/ImageCompare";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

// A demo cover drawn twice, once for each theme. A light/dark pair of the
// same composition is exactly what a compare slider is for.
const coverLight = "/images/demo-cover-light.svg";
const coverDark = "/images/demo-cover-dark.svg";

export default function ImageComparePage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Image compare</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-imagecompare--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Before and after, behind one divider
            </p>
            <p className={styles.introBody}>
              Two images share a frame and a draggable split. Drag anywhere, or put focus on the handle and use the arrow keys. The pair below is one composition drawn once for daylight and once for dusk.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <div className={styles.variantStack} style={{ alignItems: "stretch" }}>
              <ImageCompare
                beforeSrc={coverLight}
                afterSrc={coverDark}
                beforeAlt="Demo cover illustration, daylight version"
                afterAlt="Demo cover illustration, dusk version"
                beforeLabel="Daylight"
                afterLabel="Dusk"
              />
            </div>
          </section>

          {/* Start position */}
          <section className={styles.section}>
            <SectionTitle title="Start position" />
            <div className={styles.variantStack} style={{ alignItems: "stretch" }}>
              <ImageCompare
                beforeSrc={coverLight}
                afterSrc={coverDark}
                beforeAlt="Demo cover illustration, daylight version"
                afterAlt="Demo cover illustration, dusk version"
                beforeLabel="Daylight"
                afterLabel="Dusk"
                defaultPosition={25}
              />
            </div>
          </section>

          {/* Without labels */}
          <section className={styles.section}>
            <SectionTitle title="Without labels" />
            <div className={styles.variantStack} style={{ alignItems: "stretch" }}>
              <ImageCompare
                beforeSrc={coverLight}
                afterSrc={coverDark}
                beforeAlt="Demo cover illustration, daylight version"
                afterAlt="Demo cover illustration, dusk version"
                showLabels={false}
                aspectRatio="21 / 9"
              />
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
