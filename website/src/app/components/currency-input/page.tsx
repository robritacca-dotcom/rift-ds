"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { CurrencyInput } from "rift-ds/components/CurrencyInput/CurrencyInput";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

export default function CurrencyInputPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Currency input</h1>
            <PageLinks storybookPath="/?path=/docs/components-currencyinput--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>An amount of money, never a float</p>
            <p className={styles.introBody}>
              A currency input holds an amount as a decimal string, so a cent is never lost. It reads the locale’s own marks and a pasted amount in any convention, groups the digits once the reader moves on, and places the currency where the locale writes it.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="Currencies and locales" />
            <div className={`${styles.demoStack} ${styles.demoStage}`}>
              <CurrencyInput label="Price" currency="USD" defaultValue="1234.5" />
              <CurrencyInput label="Budget" currency="EUR" locale="de-DE" defaultValue="25000" />
              <CurrencyInput label="Transfer amount" currency="JPY" locale="ja-JP" defaultValue="15000" />
              <CurrencyInput label="Amount" currency="KWD" currencyDisplay="code" defaultValue="12.5" />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="States" />
            <div className={`${styles.demoStack} ${styles.demoStage}`}>
              <CurrencyInput label="Adjustment" allowNegative defaultValue="-42.1" />
              <CurrencyInput label="Fee" size="compact" defaultValue="2.5" />
              <CurrencyInput label="Transfer amount" defaultValue="0" errorText="Enter an amount above zero." />
              <CurrencyInput label="Credit limit" defaultValue="5000" disabled />
            </div>
          </section>

          <ComponentInstallStrip slug="currency-input" />
        </main>
      </div>
    </>
  );
}
