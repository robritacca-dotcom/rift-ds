import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { Statement } from "rift-ds/components/Statement/Statement";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

export default function StatementPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Statement</h1>
            <PageLinks storybookPath="/?path=/docs/components-statement--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>Sections that add up to a bottom line</p>
            <p className={styles.introBody}>
              Statement lays out a financial statement: titled sections of amounts, each with its total, and the subtotals that run between them down to a bottom line, one column per period. Costs are entered as they are and counted against the subtotals by their sign, and every sum is decimal arithmetic, so no total drifts by a cent.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="Profit and loss" />
            <div className={styles.demoSurface}>
              <Statement
                caption="Profit and loss"
                captionVisible
                periods={["Q1", "Q2"]}
                items={[
                  { kind: "section", id: "revenue", title: "Revenue", totalLabel: "Total revenue", lines: [
                    { id: "subs", label: "Subscriptions", amounts: ["84200.00", "91350.50"] },
                    { id: "services", label: "Services", amounts: ["12400.00", "9800.00"] },
                  ] },
                  { kind: "section", id: "cogs", title: "Cost of sales", totalLabel: "Total cost of sales", sign: -1, lines: [
                    { id: "hosting", label: "Hosting", amounts: ["8120.40", "8640.10"] },
                    { id: "support", label: "Support", amounts: ["6300.00", "6300.00"] },
                  ] },
                  { kind: "subtotal", id: "gross", label: "Gross profit" },
                  { kind: "section", id: "opex", title: "Operating expenses", totalLabel: "Total operating expenses", sign: -1, lines: [
                    { id: "people", label: "People", amounts: ["52000.00", "54000.00"] },
                    { id: "rent", label: "Rent", amounts: ["7500.00", "7500.00"] },
                  ] },
                  { kind: "subtotal", id: "net", label: "Net profit" },
                ]}
              />
            </div>
          </section>

          <ComponentInstallStrip slug="statement" />
        </main>
      </div>
    </>
  );
}
