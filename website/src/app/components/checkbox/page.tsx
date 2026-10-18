"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Checkbox, CheckboxGroup, CheckboxIndicator } from "rift-ds/components/Checkbox/Checkbox";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

export default function CheckboxPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Checkbox</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-checkbox--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Toggle a single option on or off, or select multiple items
            </p>
            <p className={styles.introBody}>
              Supports a third &quot;mixed&quot; state for cases like a parent checkbox that controls a partially selected group. Use Radio Button when only one choice should be selected at a time.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <Checkbox label="Unchecked" checked={false} onCheckedChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Checkbox label="Checked" checked={true} onCheckedChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Checkbox label="Indeterminate" indeterminate={true} checked={false} onCheckedChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Checkbox checked={true} aria-label="No label" onCheckedChange={() => {}} />
              </div>
            </div>
          </section>

          {/* Compact */}
          <section className={styles.section}>
            <SectionTitle title="Compact" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <Checkbox label="Unchecked" checked={false} size="compact" onCheckedChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Checkbox label="Checked" checked={true} size="compact" onCheckedChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Checkbox label="Indeterminate" indeterminate={true} checked={false} size="compact" onCheckedChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Checkbox checked={true} size="compact" aria-label="No label" onCheckedChange={() => {}} />
              </div>
            </div>
          </section>

          {/* States */}
          <section className={styles.section}>
            <SectionTitle title="States" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <Checkbox label="Disabled, unchecked" checked={false} disabled onCheckedChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Checkbox label="Disabled, checked" checked={true} disabled onCheckedChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Checkbox label="Disabled, indeterminate" indeterminate={true} checked={false} disabled onCheckedChange={() => {}} />
              </div>
            </div>
          </section>

          {/* Group — Vertical */}
          <section className={styles.section}>
            <SectionTitle title="Group, vertical" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <CheckboxGroup
                  label="Notifications"
                  items={[
                    { label: "Email", value: "email" },
                    { label: "SMS", value: "sms" },
                    { label: "Push", value: "push" },
                  ]}
                  values={["email", "push"]}
                  onValuesChange={() => {}}
                />
              </div>
            </div>
          </section>

          {/* Group — Horizontal */}
          <section className={styles.section}>
            <SectionTitle title="Group, horizontal" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <CheckboxGroup
                  label="Toppings"
                  direction="horizontal"
                  items={[
                    { label: "Cheese", value: "cheese" },
                    { label: "Pepperoni", value: "pepperoni" },
                    { label: "Olives", value: "olives" },
                    { label: "Anchovies", value: "anchovies", disabled: true },
                  ]}
                  values={["cheese"]}
                  onValuesChange={() => {}}
                />
              </div>
            </div>
          </section>

          {/* Group — Compact */}
          <section className={styles.section}>
            <SectionTitle title="Group, compact" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <CheckboxGroup
                  label="Preferences"
                  size="compact"
                  items={[
                    { label: "Dark mode", value: "dark" },
                    { label: "Notifications", value: "notif" },
                    { label: "Auto-save", value: "autosave" },
                  ]}
                  values={["dark", "autosave"]}
                  onValuesChange={() => {}}
                />
              </div>
            </div>
          </section>

          {/* Indicator */}
          <section className={styles.section}>
            <SectionTitle title="Indicator" />
            <p className={styles.introBody}>
              The box alone, for a row that is itself the control, like a QuestionCard option. The row owns the role, the state and the keyboard; the indicator draws the same box, check and colours as the checkbox, and lights when the row is hovered.
            </p>
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <CheckboxIndicator />
              </div>
              <div className={styles.variantItem}>
                <CheckboxIndicator checked />
              </div>
              <div className={styles.variantItem}>
                <CheckboxIndicator indeterminate />
              </div>
              <div className={styles.variantItem}>
                <CheckboxIndicator checked size="compact" />
              </div>
            </div>
          </section>

          <ComponentInstallStrip slug="checkbox" />
        </main>
      </div>

    </>
  );
}
