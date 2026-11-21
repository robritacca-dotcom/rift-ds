"use client";

import React from "react";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import { Rating } from "rift-ds/components/Rating/Rating";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

export default function RatingPage() {
  return (
    <div className={styles.dsContent}>
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

      <section className={styles.section}>
        <SectionTitle title="Thumbs" />
        <div className={styles.kitDemo}>
          <Rating variant="thumbs" label="Was this page helpful?" upLabel="Yes, it helped" downLabel="No, it did not help" />
          <p className={styles.kitNote}>
            A two-way verdict for a quick &quot;Was this helpful?&quot;. Value 1 is up and 2 is down, with the same keys as the stars.
          </p>
        </div>
      </section>

      <ComponentInstallStrip slug="rating" />
    </div>
  );
}
