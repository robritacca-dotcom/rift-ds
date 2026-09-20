"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Input } from "@robr0/design-system/components/Input/Input";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

export default function InputPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Input</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-input--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Single-line text field for names, emails, and search queries
            </p>
            <p className={styles.introBody}>
              Supports labels, placeholders, left/right icons, helper text, and error states. Use Textarea instead when the content needs more than one line.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <Input label="No icon" placeholder="Enter text..." onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Input label="Icon left" placeholder="Search..." iconLeft="search" onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Input label="Icon right" placeholder="Email" iconRight="mail" onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Input label="Both icons" placeholder="Search..." iconLeft="search" iconRight="tune" onChange={() => {}} />
              </div>
            </div>
          </section>

          {/* Compact */}
          <section className={styles.section}>
            <SectionTitle title="Compact" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <Input label="No icon" placeholder="Enter text..." size="compact" onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Input label="Icon left" placeholder="Search..." iconLeft="search" size="compact" onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Input label="Icon right" placeholder="Email" iconRight="mail" size="compact" onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Input label="Both icons" placeholder="Search..." iconLeft="search" iconRight="tune" size="compact" onChange={() => {}} />
              </div>
            </div>
          </section>

          {/* States */}
          <section className={styles.section}>
            <SectionTitle title="States" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <Input label="With value" value="rob@example.com" onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Input label="Required" placeholder="Enter name" required onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Input label="Helper text" placeholder="Enter password" helperText="Must be at least 8 characters" onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Input label="Error" value="invalid" error helperText="Please enter a valid value" onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Input label="Disabled" value="Disabled input" disabled onChange={() => {}} />
              </div>
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
