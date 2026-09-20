"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { ToggleSwitch } from "@robr0/design-system/components/ToggleSwitch/ToggleSwitch";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
/* ============================================
   PAGE
   ============================================ */


export default function ToggleSwitchPage() {
  return (
    <>

      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          {/* Page Title */}
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Toggle switch</h1>
            <PageLinks
              figmaUrl="https://www.figma.com/design/8NzqDS8iRsBTFPbNGj3Woj/robr0-ds26?node-id=253-10071"
              storybookPath="/?path=/docs/components-toggleswitch--docs"
            />
          </div>

          {/* Intro */}
          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              An on/off switch for immediate settings
            </p>
            <p className={styles.introBody}>
              For settings that take effect right away, like enabling dark mode or toggling a notification. The sliding thumb and check icon give clear visual feedback. Use Checkbox instead for options that need to be saved or submitted as part of a form.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <ToggleSwitch checked={true} label="On" onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <ToggleSwitch checked={false} label="Off" onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <ToggleSwitch checked={true} showLabel={false} ariaLabel="No label" onChange={() => {}} />
              </div>
            </div>
          </section>

          {/* Compact */}
          <section className={styles.section}>
            <SectionTitle title="Compact" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <ToggleSwitch checked={true} label="On" size="compact" onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <ToggleSwitch checked={false} label="Off" size="compact" onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <ToggleSwitch checked={true} showLabel={false} size="compact" ariaLabel="No label" onChange={() => {}} />
              </div>
            </div>
          </section>

          {/* States */}
          <section className={styles.section}>
            <SectionTitle title="States" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <ToggleSwitch checked={true} disabled label="Disabled, on" onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <ToggleSwitch checked={false} disabled label="Disabled, off" onChange={() => {}} />
              </div>
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
