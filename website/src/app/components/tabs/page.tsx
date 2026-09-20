"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Tabs } from "@robr0/design-system/components/Tabs/Tabs";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

export default function TabsPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Tabs</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-tabs--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Switch between views or sections within the same page
            </p>
            <p className={styles.introBody}>
              The active tab gets an underline and a colour change. Supports optional icons and a full-width mode that stretches tabs to fill the container. Use Segmented Control instead when the options represent filters or modes rather than separate content areas.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <div className={styles.variantStack}>
              <Tabs
                tabs={[
                  { label: "Overview", value: "overview" },
                  { label: "Tokens", value: "tokens" },
                  { label: "Usage", value: "usage" },
                ]}
                activeTab="overview"
                onTabChange={() => {}}
              />
            </div>
          </section>

          {/* With icons */}
          <section className={styles.section}>
            <SectionTitle title="With icons" />
            <div className={styles.variantStack}>
              <Tabs
                tabs={[
                  { label: "Design", value: "design", icon: "palette" },
                  { label: "Code", value: "code", icon: "code" },
                  { label: "Accessibility", value: "a11y", icon: "accessibility" },
                ]}
                activeTab="design"
                onTabChange={() => {}}
              />
            </div>
          </section>

          {/* Compact */}
          <section className={styles.section}>
            <SectionTitle title="Compact" />
            <div className={styles.variantStack}>
              <Tabs
                tabs={[
                  { label: "All", value: "all" },
                  { label: "Active", value: "active" },
                  { label: "Archived", value: "archived" },
                ]}
                activeTab="all"
                size="compact"
                onTabChange={() => {}}
              />
            </div>
          </section>

          {/* Full width */}
          <section className={styles.section}>
            <SectionTitle title="Full width" />
            <div className={styles.variantStack} style={{ width: "100%" }}>
              <Tabs
                tabs={[
                  { label: "Details", value: "details" },
                  { label: "Reviews", value: "reviews" },
                  { label: "Related", value: "related" },
                ]}
                activeTab="details"
                fullWidth
                onTabChange={() => {}}
              />
            </div>
          </section>

          {/* With disabled */}
          <section className={styles.section}>
            <SectionTitle title="With disabled tab" />
            <div className={styles.variantStack}>
              <Tabs
                tabs={[
                  { label: "Published", value: "published" },
                  { label: "Drafts", value: "drafts" },
                  { label: "Scheduled", value: "scheduled", disabled: true },
                ]}
                activeTab="published"
                onTabChange={() => {}}
              />
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
