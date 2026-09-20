"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Rating } from "@robr0/design-system/components/Rating/Rating";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

export default function RatingPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Rating</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-rating--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Scores, reviews, and quality signals
            </p>
            <p className={styles.introBody}>
              A radio group of stars: arrow keys move the selection, hover previews it, and a read-only mode renders the same row as a static score. The icon and scale length are configurable.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <div className={styles.variantStack}>
              <Rating defaultValue={3} label="Rate this component" />
              <Rating label="Empty rating" />
            </div>
          </section>

          {/* Sizes */}
          <section className={styles.section}>
            <SectionTitle title="Sizes" />
            <div className={styles.variantStack}>
              <Rating defaultValue={4} label="Default size" />
              <Rating defaultValue={4} size="compact" label="Compact size" />
            </div>
          </section>

          {/* Read only */}
          <section className={styles.section}>
            <SectionTitle title="Read only" />
            <div className={styles.variantStack}>
              <Rating value={4} readOnly label="Average rating" />
              <Rating value={2} readOnly size="compact" label="Average rating" />
            </div>
          </section>

          {/* Custom scale and icon */}
          <section className={styles.section}>
            <SectionTitle title="Custom scale and icon" />
            <div className={styles.variantStack}>
              <Rating defaultValue={7} max={10} label="Score out of ten" />
              <Rating defaultValue={3} icon="favorite" label="Favourite level" />
            </div>
          </section>

          {/* States */}
          <section className={styles.section}>
            <SectionTitle title="States" />
            <div className={styles.variantStack}>
              <Rating defaultValue={3} allowClear label="Clearable: select the current star again to clear" />
              <Rating value={2} disabled label="Disabled rating" />
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
