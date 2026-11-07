"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { DescriptionList } from "rift-ds/components/DescriptionList/DescriptionList";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

export default function DescriptionListPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Description list</h1>
            <PageLinks storybookPath="/?path=/docs/components-descriptionlist--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>Terms and their values</p>
            <p className={styles.introBody}>
              A description list sets out facts for a review screen, a receipt, account details or a record inspector. Entries stack, sit in two columns that stack when the list is narrow, or fill a grid; values can be copied or carry an action, and an empty value says so in words.
            </p>
          </div>

          {/* Stacked */}
          <section className={styles.section}>
            <SectionTitle title="Stacked" />
            <div className={styles.demoStage}>
              <DescriptionList
                items={[
                  { term: "Account holder", details: "Northwind Supply Ltd" },
                  { term: "Sort code", details: "04-00-04" },
                  { term: "Account number", details: "1234 5678", copyable: "12345678" },
                  { term: "Reference", details: null },
                ]}
              />
            </div>
          </section>

          {/* Inline */}
          <section className={styles.section}>
            <SectionTitle title="Inline" />
            <div className={styles.demoStage}>
              <DescriptionList
                layout="inline"
                size="compact"
                termWidth="wide"
                align="end"
                dividers
                items={[
                  { term: "Subtotal", details: "$1,084.00" },
                  { term: "Delivery", details: "$200.00" },
                  { term: "Total paid", details: "$1,284.00" },
                ]}
              />
            </div>
          </section>

          {/* Grid */}
          <section className={styles.section}>
            <SectionTitle title="Grid" />
            <DescriptionList
              layout="grid"
              columns={3}
              items={[
                { term: "Status", details: "Open" },
                { term: "Priority", details: "High" },
                { term: "Assignee", details: "Priya Shah" },
                { term: "Created", details: "2 Nov 2026" },
                { term: "Due", details: "9 Nov 2026" },
                { term: "Ticket", details: "SUP-4410", copyable: true },
              ]}
            />
          </section>

          <ComponentInstallStrip slug="description-list" />
        </main>
      </div>
    </>
  );
}
