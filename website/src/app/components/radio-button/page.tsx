"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { RadioButton, RadioGroup } from "@robr0/design-system/components/RadioButton/RadioButton";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

export default function RadioButtonPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Radio button</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-radiobutton--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Choose exactly one option from a small set
            </p>
            <p className={styles.introBody}>
              Can be used individually or grouped in vertical and horizontal layouts. Use Checkbox instead when users can select more than one, or Dropdown when the list of options is long.
            </p>
          </div>

          {/* Single states */}
          <section className={styles.section}>
            <SectionTitle title="States" />
            <div className={styles.stateGrid}>
              <div className={styles.gridCorner} />
              <span className={styles.gridColHeader}>With label</span>
              <span className={styles.gridColHeader}>Without label</span>

              <span className={styles.gridRowHeader}>Unselected</span>
              <div className={styles.gridCell}>
                <RadioButton label="Option A" checked={false} onChange={() => {}} />
              </div>
              <div className={styles.gridCell}>
                <RadioButton checked={false} ariaLabel="Unselected" onChange={() => {}} />
              </div>

              <span className={styles.gridRowHeader}>Selected</span>
              <div className={styles.gridCell}>
                <RadioButton label="Option A" checked={true} onChange={() => {}} />
              </div>
              <div className={styles.gridCell}>
                <RadioButton checked={true} ariaLabel="Selected" onChange={() => {}} />
              </div>

              <span className={styles.gridRowHeader}>Disabled, unselected</span>
              <div className={styles.gridCell}>
                <RadioButton label="Disabled" checked={false} disabled onChange={() => {}} />
              </div>
              <div className={styles.gridCell}>
                <RadioButton checked={false} disabled ariaLabel="Disabled" onChange={() => {}} />
              </div>

              <span className={styles.gridRowHeader}>Disabled, selected</span>
              <div className={styles.gridCell}>
                <RadioButton label="Disabled" checked={true} disabled onChange={() => {}} />
              </div>
              <div className={styles.gridCell}>
                <RadioButton checked={true} disabled ariaLabel="Disabled selected" onChange={() => {}} />
              </div>
            </div>
          </section>

          {/* Group layouts */}
          <section className={styles.section}>
            <SectionTitle title="Radio group" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <RadioGroup
                  label="Vertical"
                  name="demo-vertical"
                  value="medium"
                  options={[
                    { label: "Small", value: "small" },
                    { label: "Medium", value: "medium" },
                    { label: "Large", value: "large" },
                  ]}
                  direction="vertical"
                  onChange={() => {}}
                />
              </div>
              <div className={styles.variantItem}>
                <RadioGroup
                  label="Horizontal"
                  name="demo-horizontal"
                  value="teal"
                  options={[
                    { label: "Red", value: "red" },
                    { label: "Teal", value: "teal" },
                    { label: "Purple", value: "purple" },
                  ]}
                  direction="horizontal"
                  onChange={() => {}}
                />
              </div>
              <div className={styles.variantItem}>
                <RadioGroup
                  label="With disabled option"
                  name="demo-disabled"
                  value="pro"
                  options={[
                    { label: "Free", value: "free" },
                    { label: "Pro", value: "pro" },
                    { label: "Enterprise", value: "enterprise", disabled: true },
                  ]}
                  direction="vertical"
                  onChange={() => {}}
                />
              </div>
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
