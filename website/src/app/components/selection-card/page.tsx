"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { SelectionCard } from "@robr0/design-system/components/SelectionCard/SelectionCard";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";


export default function SelectionCardPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Selection card</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-selectioncard--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Pick one or more from a set of prominent options
            </p>
            <p className={styles.introBody}>
              Selection cards give each option a large, descriptive surface so users can make informed decisions. Use radio mode when only one option is allowed, checkbox mode when multiple options can be selected, and toggle mode for independent on/off settings. Each card shows the matching indicator in its right edge.
            </p>
          </div>

          {/* Radio */}
          <section className={styles.section}>
            <SectionTitle title="Radio (single select)" />
            <div className={styles.demoContainer}>
              <SelectionCard
                mode="radio"
                name="Compute Environment"
                value="kubernetes"
                options={[
                  {
                    value: "kubernetes",
                    label: "Kubernetes",
                    description: "Run GPU workloads on a K8s configured cluster. This is the default.",
                  },
                  {
                    value: "vm",
                    label: "Virtual Machine",
                    description: "Access a VM configured cluster to run workloads.",
                  },
                ]}
              />
            </div>
          </section>

          {/* Toggle */}
          <section className={styles.section}>
            <SectionTitle title="Toggle (on/off switches)" />
            <div className={styles.demoContainer}>
              <SelectionCard
                mode="toggle"
                name="Settings"
                value={["notifications", "analytics"]}
                options={[
                  {
                    value: "notifications",
                    label: "Notifications",
                    description: "Enable push notifications for important updates.",
                  },
                  {
                    value: "analytics",
                    label: "Analytics",
                    description: "Share anonymous usage data to help improve the product.",
                  },
                  {
                    value: "beta",
                    label: "Beta features",
                    description: "Get early access to experimental features.",
                  },
                ]}
              />
            </div>
          </section>

          {/* Checkbox */}
          <section className={styles.section}>
            <SectionTitle title="Checkbox (multi select)" />
            <div className={styles.demoContainer}>
              <SelectionCard
                mode="checkbox"
                name="Features"
                value={["monitoring", "backups"]}
                options={[
                  {
                    value: "monitoring",
                    label: "Monitoring",
                    description: "Enable real-time monitoring and alerting for your cluster.",
                  },
                  {
                    value: "logging",
                    label: "Logging",
                    description: "Centralised log aggregation and search.",
                  },
                  {
                    value: "backups",
                    label: "Backups",
                    description: "Automated daily backups with point-in-time recovery.",
                  },
                ]}
              />
            </div>
          </section>

          {/* Disabled */}
          <section className={styles.section}>
            <SectionTitle title="With disabled option" />
            <div className={styles.demoContainer}>
              <SelectionCard
                mode="radio"
                name="Plan"
                value="pro"
                options={[
                  {
                    value: "pro",
                    label: "Pro",
                    description: "For teams and growing businesses.",
                  },
                  {
                    value: "enterprise",
                    label: "Enterprise",
                    description: "Custom solutions for large organisations. Coming soon.",
                    disabled: true,
                  },
                ]}
              />
            </div>
          </section>

          {/* No description */}
          <section className={styles.section}>
            <SectionTitle title="Without descriptions" />
            <div className={styles.demoContainer}>
              <SelectionCard
                mode="radio"
                name="Theme"
                value="dark"
                options={[
                  { value: "light", label: "Light" },
                  { value: "dark", label: "Dark" },
                  { value: "system", label: "System" },
                ]}
              />
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
