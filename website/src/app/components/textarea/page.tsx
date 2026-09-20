"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Textarea } from "@robr0/design-system/components/Textarea/Textarea";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

export default function TextareaPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
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
              For descriptions, comments, and messages. Includes an optional character counter and resize handle. Use Input instead when the value fits on a single line.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <Textarea label="Placeholder" placeholder="Enter a description..." onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Textarea label="With value" value="Design systems engineer passionate about tokens, components, and scalable UI architecture." onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Textarea label="Required" placeholder="Add your comments..." required onChange={() => {}} />
              </div>
            </div>
          </section>

          {/* Compact */}
          <section className={styles.section}>
            <SectionTitle title="Compact" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <Textarea label="Placeholder" placeholder="Enter a description..." size="compact" rows={3} onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Textarea label="With value" value="Compact textarea with smaller text and tighter padding." size="compact" rows={3} onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Textarea label="Required" placeholder="Add your comments..." required size="compact" rows={3} onChange={() => {}} />
              </div>
            </div>
          </section>

          {/* States */}
          <section className={styles.section}>
            <SectionTitle title="States" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <Textarea label="Helper text" placeholder="Tell us what you think..." helperText="Your feedback helps us improve" onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Textarea label="Character counter" placeholder="What's happening?" maxLength={280} value="Building a design system" onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Textarea label="Error" value="Too short" error helperText="Description must be at least 50 characters" onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Textarea label="Disabled" value="This field is not editable" disabled onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Textarea label="No resize" placeholder="Cannot be resized..." resize="none" rows={3} onChange={() => {}} />
              </div>
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
