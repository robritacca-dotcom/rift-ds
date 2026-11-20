"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { ImageCompare } from "rift-ds/components/ImageCompare/ImageCompare";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

import { PHOTO_LANDSCAPE, PHOTO_LANDSCAPE_MONO } from "@/lib/attachment-demo";

// The wide sample picture and its black-and-white copy: one photograph
// before and after an edit, which is what a compare slider is for.
const colour = PHOTO_LANDSCAPE;
const mono = PHOTO_LANDSCAPE_MONO;

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
              Two images share a frame and a draggable split. Drag anywhere, or put focus on the handle and use the arrow keys. The pair below is one photograph in colour and in black and white.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <div className={styles.variantStack} style={{ alignItems: "stretch" }}>
              <ImageCompare
                beforeSrc={colour}
                afterSrc={mono}
                beforeAlt="A figure in a glowing canyon below snowy peaks, in colour"
                afterAlt="The same canyon in black and white"
                beforeLabel="Colour"
                afterLabel="Mono"
              />
            </div>
          </section>

          {/* Start position */}
          <section className={styles.section}>
            <SectionTitle title="Start position" />
            <div className={styles.variantStack} style={{ alignItems: "stretch" }}>
              <ImageCompare
                beforeSrc={colour}
                afterSrc={mono}
                beforeAlt="A figure in a glowing canyon below snowy peaks, in colour"
                afterAlt="The same canyon in black and white"
                beforeLabel="Colour"
                afterLabel="Mono"
                defaultPosition={25}
              />
            </div>
          </section>

          {/* Without labels */}
          <section className={styles.section}>
            <SectionTitle title="Without labels" />
            <div className={styles.variantStack} style={{ alignItems: "stretch" }}>
              <ImageCompare
                beforeSrc={colour}
                afterSrc={mono}
                beforeAlt="A figure in a glowing canyon below snowy peaks, in colour"
                afterAlt="The same canyon in black and white"
                showLabels={false}
                aspectRatio="21 / 9"
              />
            </div>
          </section>

          <ComponentInstallStrip slug="image-compare" />
        </main>
      </div>

    </>
  );
}
