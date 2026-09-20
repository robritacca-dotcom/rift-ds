"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Checkbox, CheckboxGroup } from "@robr0/design-system/components/Checkbox/Checkbox";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

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
                <Checkbox label="Unchecked" checked={false} onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Checkbox label="Checked" checked={true} onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Checkbox label="Indeterminate" indeterminate={true} checked={false} onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Checkbox checked={true} ariaLabel="No label" onChange={() => {}} />
              </div>
            </div>
          </section>

          {/* Compact */}
          <section className={styles.section}>
            <SectionTitle title="Compact" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <Checkbox label="Unchecked" checked={false} size="compact" onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Checkbox label="Checked" checked={true} size="compact" onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Checkbox label="Indeterminate" indeterminate={true} checked={false} size="compact" onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Checkbox checked={true} size="compact" ariaLabel="No label" onChange={() => {}} />
              </div>
            </div>
          </section>

          {/* States */}
          <section className={styles.section}>
            <SectionTitle title="States" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <Checkbox label="Disabled, unchecked" checked={false} disabled onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Checkbox label="Disabled, checked" checked={true} disabled onChange={() => {}} />
              </div>
              <div className={styles.variantItem}>
                <Checkbox label="Disabled, indeterminate" indeterminate={true} checked={false} disabled onChange={() => {}} />
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
                  onChange={() => {}}
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
                  onChange={() => {}}
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
