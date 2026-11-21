import React from "react";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { OrgChart } from "rift-ds/components/OrgChart/OrgChart";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

export default function OrgChartPage() {
  return (
    <div className={styles.dsContent}>
      <PageBreadcrumb />
      <div className={`${styles.pageHeader} animate-in`}>
        <h1 className={styles.pageTitle}>Org chart</h1>
        <PageLinks storybookPath="/?path=/docs/components-orgchart--docs" />
      </div>

      <div className={`${styles.introSection} animate-in animate-delay-1`}>
        <p className={styles.subDisplay}>Who reports to whom</p>
        <p className={styles.introBody}>
          Org chart draws people top down, each a card with their avatar, name and role, their reports in a row beneath them and lines between. Underneath it is nested lists, so a screen reader hears each person’s reports as a list inside their entry, and a chart wider than its column scrolls sideways.
        </p>
      </div>

      <section className={styles.section}>
        <SectionTitle title="A team" />
        <div className={styles.demoSurface}>
          <OrgChart
            label="Product team"
            root={{
              id: "lead", name: "Ada Lovelace", role: "Head of product",
              reports: [
                { id: "design", name: "Grace Hopper", role: "Design lead", reports: [
                  { id: "d1", name: "Alan Turing", role: "Product designer" },
                  { id: "d2", name: "Katherine Johnson", role: "Researcher" },
                ] },
                { id: "eng", name: "Margaret Hamilton", role: "Engineering lead", reports: [
                  { id: "e1", name: "Dennis Ritchie", role: "Engineer" },
                  { id: "e2", name: "Barbara Liskov", role: "Engineer" },
                ] },
              ],
            }}
          />
        </div>
      </section>

      <ComponentInstallStrip slug="org-chart" />
    </div>
  );
}
