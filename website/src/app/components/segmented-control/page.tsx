"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

export default function SegmentedControlPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Segmented control</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-segmentedcontrol--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Toggle between a small set of related options
            </p>
            <p className={styles.introBody}>
              For view modes or filters where the active segment fills with the action colour, or a quiet grey with the neutral tone. Works well for 2 to 4 choices. Use Tabs instead when the options represent distinct content sections with their own panels.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <div className={styles.variantStack}>
              <SegmentedControl
                segments={[
                  { label: "Day", value: "day" },
                  { label: "Week", value: "week" },
                  { label: "Month", value: "month" },
                ]}
                value="week"
                onValueChange={() => {}}
              />
            </div>
          </section>

          {/* With icons */}
          <section className={styles.section}>
            <SectionTitle title="With icons" />
            <div className={styles.variantStack}>
              <SegmentedControl
                segments={[
                  { label: "Grid", value: "grid", icon: "grid_view" },
                  { label: "List", value: "list", icon: "view_list" },
                  { label: "Board", value: "board", icon: "view_column" },
                ]}
                value="grid"
                onValueChange={() => {}}
              />
              <SegmentedControl
                segments={[
                  { label: "Light", value: "light", icon: "light_mode" },
                  { label: "Dark", value: "dark", icon: "dark_mode" },
                ]}
                value="dark"
                onValueChange={() => {}}
              />
            </div>
          </section>

          {/* Neutral */}
          <section className={styles.section}>
            <SectionTitle title="Neutral" />
            <p className={styles.introBody}>
              <code>tone=&quot;neutral&quot;</code> fills the active segment with a solid grey
              instead of the primary colour, for sets where the selection
              should read quietly.
            </p>
            <div className={styles.variantStack}>
              <SegmentedControl
                tone="neutral"
                segments={[
                  { label: "Day", value: "day" },
                  { label: "Week", value: "week" },
                  { label: "Month", value: "month" },
                ]}
                value="week"
                onValueChange={() => {}}
              />
              <SegmentedControl
                tone="neutral"
                segments={[
                  { label: "Grid", value: "grid", icon: "grid_view" },
                  { label: "List", value: "list", icon: "view_list" },
                ]}
                value="grid"
                onValueChange={() => {}}
              />
            </div>
          </section>

          {/* Full width */}
          <section className={styles.section}>
            <SectionTitle title="Full width" />
            <div className={styles.variantStack} style={{ width: "100%" }}>
              <SegmentedControl
                segments={[
                  { label: "Overview", value: "overview" },
                  { label: "Analytics", value: "analytics" },
                  { label: "Reports", value: "reports" },
                ]}
                value="overview"
                fullWidth
                onValueChange={() => {}}
              />
            </div>
          </section>

          {/* With disabled */}
          <section className={styles.section}>
            <SectionTitle title="With disabled segment" />
            <div className={styles.variantStack}>
              <SegmentedControl
                segments={[
                  { label: "Free", value: "free" },
                  { label: "Pro", value: "pro" },
                  { label: "Enterprise", value: "enterprise", disabled: true },
                ]}
                value="pro"
                onValueChange={() => {}}
              />
            </div>
          </section>

          {/* Compact */}
          <section className={styles.section}>
            <SectionTitle title="Compact" />
            <div className={styles.variantStack}>
              <SegmentedControl
                size="compact"
                segments={[
                  { label: "All", value: "all" },
                  { label: "Active", value: "active" },
                  { label: "Archived", value: "archived" },
                ]}
                value="all"
                onValueChange={() => {}}
              />
              <SegmentedControl
                size="compact"
                segments={[
                  { label: "Code", value: "code", icon: "code" },
                  { label: "Preview", value: "preview", icon: "visibility" },
                  { label: "Split", value: "split", icon: "vertical_split" },
                ]}
                value="code"
                onValueChange={() => {}}
              />
            </div>
          </section>

          <ComponentInstallStrip slug="segmented-control" />
        </main>
      </div>

    </>
  );
}
