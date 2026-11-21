"use client";

import React from "react";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import { Textarea } from "rift-ds/components/Textarea/Textarea";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

export default function TextareaPage() {
  return (
    <div className={styles.dsContent}>
      <PageBreadcrumb />
      <div className={`${styles.pageHeader} animate-in`}>
        <h1 className={styles.pageTitle}>Textarea</h1>
        <PageLinks
          storybookPath="/?path=/docs/components-textarea--docs"
        />
      </div>

      <div className={`${styles.introSection} animate-in animate-delay-1`}>
        <p className={styles.subDisplay}>
          Multi-line text field for longer content
        </p>
        <p className={styles.introBody}>
          For descriptions, comments, and messages. Includes an optional character counter and resize handle.
        </p>
      </div>

      {/* Default */}
      <section className={styles.section}>
        <SectionTitle title="Default" />
        <div className={styles.variantRow}>
          <div className={styles.variantItem}>
            <Textarea label="Placeholder" placeholder="Enter a description..." />
          </div>
          <div className={styles.variantItem}>
            <Textarea label="With value" defaultValue="Design systems engineer passionate about tokens, components, and scalable UI architecture." />
          </div>
          <div className={styles.variantItem}>
            <Textarea label="Required" placeholder="Add your comments..." required />
          </div>
        </div>
      </section>

      {/* Compact */}
      <section className={styles.section}>
        <SectionTitle title="Compact" />
        <div className={styles.variantRow}>
          <div className={styles.variantItem}>
            <Textarea label="Placeholder" placeholder="Enter a description..." size="compact" rows={3} />
          </div>
          <div className={styles.variantItem}>
            <Textarea label="With value" defaultValue="Compact textarea with smaller text and tighter padding." size="compact" rows={3} />
          </div>
          <div className={styles.variantItem}>
            <Textarea label="Required" placeholder="Add your comments..." required size="compact" rows={3} />
          </div>
        </div>
      </section>

      {/* States */}
      <section className={styles.section}>
        <SectionTitle title="States" />
        <div className={styles.variantRow}>
          <div className={styles.variantItem}>
            <Textarea label="Helper text" placeholder="Tell us what you think..." helperText="Your feedback helps us improve" />
          </div>
          <div className={styles.variantItem}>
            <Textarea label="Character counter" placeholder="What's happening?" maxLength={280} defaultValue="Building a design system" />
          </div>
          <div className={styles.variantItem}>
            <Textarea label="Error" defaultValue="Too short" error helperText="Description must be at least 50 characters" />
          </div>
          <div className={styles.variantItem}>
            <Textarea label="Disabled" defaultValue="This field is not editable" disabled />
          </div>
          <div className={styles.variantItem}>
            <Textarea label="No resize" placeholder="Cannot be resized..." resize="none" rows={3} />
          </div>
        </div>
      </section>

      <ComponentInstallStrip slug="textarea" />
    </div>
  );
}
