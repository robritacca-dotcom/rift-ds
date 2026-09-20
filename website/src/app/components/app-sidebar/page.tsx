"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { AppSidebar } from "@robr0/design-system/components/AppSidebar/AppSidebar";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

const demoSections = [
  {
    category: "Main",
    items: [
      { key: "dashboard", icon: "dashboard", label: "Dashboard" },
      { key: "analytics", icon: "analytics", label: "Analytics" },
      { key: "projects", icon: "folder", label: "Projects" },
      { key: "tasks", icon: "task_alt", label: "Tasks" },
      { key: "calendar", icon: "calendar_today", label: "Calendar" },
    ],
  },
  {
    category: "Design",
    items: [
      {
        key: "components",
        icon: "widgets",
        label: "Components",
        children: [
          { key: "buttons", label: "Buttons" },
          { key: "inputs", label: "Inputs" },
          { key: "cards", label: "Cards" },
        ],
      },
      {
        key: "foundations",
        icon: "palette",
        label: "Foundations",
        children: [
          { key: "colours", label: "Colours" },
          { key: "typography", label: "Typography" },
          { key: "spacing", label: "Spacing" },
        ],
      },
      { key: "icons", icon: "emoji_symbols", label: "Icons" },
    ],
  },
  {
    items: [
      { key: "settings", icon: "settings", label: "Settings" },
      { key: "help", icon: "help", label: "Help" },
    ],
  },
];

const demoProfile = {
  name: "robr0",
  email: "robr0@example.com",
};

export default function AppSidebarPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>App sidebar</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-appsidebar--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Collapsible navigation for app layouts
            </p>
            <p className={styles.introBody}>
              A two-state sidebar that collapses to a 64px icon rail or expands to 280px with labels, category headings, accordion sub-items with tree-line connectors, and a profile section at the bottom. Items take an optional count badge; topSlot and footerSlot host consumer content that fades out while collapsed; and the floating prop renders the rail as a glass card inset from the viewport edges.
            </p>
          </div>

          {/* Expanded */}
          <section className={styles.section}>
            <SectionTitle title="Expanded" />
            <div className={styles.sidebarDemo}>
              <AppSidebar
                sections={demoSections}
                profile={demoProfile}
                activeKey="dashboard"
                defaultExpanded={true}
              />
            </div>
          </section>

          {/* Collapsed */}
          <section className={styles.section}>
            <SectionTitle title="Collapsed" />
            <div className={styles.sidebarDemo}>
              <AppSidebar
                sections={demoSections}
                profile={demoProfile}
                activeKey="dashboard"
                defaultExpanded={false}
              />
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
