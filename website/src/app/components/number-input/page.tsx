"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { NumberInput } from "@robr0/design-system/components/NumberInput/NumberInput";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

export default function NumberInputPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Number input</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-numberinput--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Numeric field with stepper controls
            </p>
            <p className={styles.introBody}>
              Type a number directly or use the steppers on either side. Values stay inside the min and max bounds: the steppers disable at the limits, and a typed out-of-range value clamps into range on blur.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <NumberInput label="Quantity" defaultValue={2} />
              </div>
              <div className={styles.variantItem}>
                <NumberInput label="Empty" placeholder="0" />
              </div>
              <div className={styles.variantItem}>
                <NumberInput label="Helper text" defaultValue={4} helperText="Whole numbers only" />
              </div>
              <div className={styles.variantItem}>
                <NumberInput label="Required" defaultValue={1} required />
              </div>
            </div>
          </section>

          {/* Bounds and step */}
          <section className={styles.section}>
            <SectionTitle title="Bounds and step" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <NumberInput label="Guests" defaultValue={2} min={1} max={8} helperText="Between 1 and 8" />
              </div>
              <div className={styles.variantItem}>
                <NumberInput label="At the maximum" defaultValue={8} min={1} max={8} helperText="Increase is disabled" />
              </div>
              <div className={styles.variantItem}>
                <NumberInput label="Opacity" defaultValue={0.5} min={0} max={1} step={0.1} helperText="Steps of 0.1" />
              </div>
            </div>
          </section>

          {/* Compact */}
          <section className={styles.section}>
            <SectionTitle title="Compact" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <NumberInput label="Quantity" defaultValue={1} size="compact" />
              </div>
              <div className={styles.variantItem}>
                <NumberInput label="With bounds" defaultValue={5} min={0} max={10} size="compact" />
              </div>
            </div>
          </section>

          {/* States */}
          <section className={styles.section}>
            <SectionTitle title="States" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <NumberInput label="Error" defaultValue={0} error helperText="Enter a quantity of at least 1" />
              </div>
              <div className={styles.variantItem}>
                <NumberInput label="Disabled" defaultValue={3} disabled />
              </div>
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
