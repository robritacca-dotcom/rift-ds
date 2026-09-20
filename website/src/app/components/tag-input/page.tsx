"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { TagInput } from "@robr0/design-system/components/TagInput/TagInput";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

export default function TagInputPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Tag input</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-taginput--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Multi-value entry held as removable tags
            </p>
            <p className={styles.introBody}>
              Type a value and press Enter or comma to commit it as a tag. Backspace on an empty draft removes the last tag, each tag has its own remove button, and maxTags caps the list. Use Combobox instead when the values come from a known option list.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <TagInput label="Empty" placeholder="Add a tag..." />
              </div>
              <div className={styles.variantItem}>
                <TagInput label="With values" defaultValues={["design", "tokens"]} placeholder="Add a tag..." />
              </div>
              <div className={styles.variantItem}>
                <TagInput label="Helper text" placeholder="Add a tag..." helperText="Press Enter or comma to add a tag" />
              </div>
            </div>
          </section>

          {/* Compact */}
          <section className={styles.section}>
            <SectionTitle title="Compact" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <TagInput label="Empty" placeholder="Add a tag..." size="compact" />
              </div>
              <div className={styles.variantItem}>
                <TagInput label="With values" defaultValues={["design", "tokens"]} size="compact" placeholder="Add a tag..." />
              </div>
            </div>
          </section>

          {/* States */}
          <section className={styles.section}>
            <SectionTitle title="States" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <TagInput label="Required" placeholder="Add a tag..." required />
              </div>
              <div className={styles.variantItem}>
                <TagInput label="Max tags" defaultValues={["one", "two", "three"]} maxTags={3} helperText="Up to 3 tags" />
              </div>
              <div className={styles.variantItem}>
                <TagInput label="Error" defaultValues={["not-a-topic"]} error helperText="One of these tags is not recognised" />
              </div>
              <div className={styles.variantItem}>
                <TagInput label="Disabled" defaultValues={["locked", "read-only"]} disabled />
              </div>
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
