"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { AppSidebar } from "rift-ds/components/AppSidebar/AppSidebar";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

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

const reportsChildren = [
  { key: "standard", label: "Standard reports" },
  { key: "custom", label: "Custom reports" },
  { key: "kpis", label: "KPIs", badge: "New" },
  {
    key: "planning",
    label: "Financial planning",
    children: [
      { key: "cash-overview", label: "Cash flow overview" },
      { key: "cash-planner", label: "Cash flow planner" },
      { key: "budgets", label: "Budgets" },
      { key: "forecasts", label: "Forecasts" },
    ],
  },
];

const threeLevelSections = [
  {
    items: [
      { key: "home", icon: "home", label: "Home" },
      { key: "create", icon: "add_circle", label: "Create" },
      { key: "reports", icon: "monitoring", label: "Reports", children: reportsChildren },
      { key: "apps", icon: "apps", label: "My apps" },
    ],
  },
  {
    category: "Pinned",
    items: [
      { key: "clients", icon: "group", label: "Clients" },
      { key: "payroll", icon: "payments", label: "Payroll" },
    ],
  },
];

const demoProfile = {
  name: "Avery",
  email: "avery@example.com",
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
            <p className={styles.introBody}>
              Navigation runs three levels deep, and subNav picks the shape once per sidebar. In the default accordion mode the second level is the accordion under a row, and a sub-item with children of its own opens them as the third level in a SidebarPanel beside the rail. In panel mode a top-level row opens its sub-items straight into the panel, whose own accordion carries the third level, and the collapsed rail widens to 80px to put a label under every icon. On small screens neither shows a panel: the drawer drills in to a second screen with a back row.
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

          {/* Third level, accordion mode */}
          <section className={styles.section}>
            <SectionTitle title="Third level" />
            <p className={styles.sectionBody}>
              Reports holds the second level as its accordion. Financial planning has children of its own, so it carries a trailing chevron and opens them in the panel beside the rail. The accordion and the panel holding the current page both start open. Press Financial planning again, or the panel’s collapse control, to close it.
            </p>
            <div className={styles.sidebarDemo} data-anchor-ignore>
              <AppSidebar
                sections={threeLevelSections}
                profile={demoProfile}
                activeKey="reports"
                activeSubKey="planning"
                activeTertiaryKey="budgets"
                defaultExpanded={true}
                showMobileTrigger={false}
              />
            </div>
          </section>

          {/* Panel mode */}
          <section className={styles.section}>
            <SectionTitle title="Panel mode" />
            <p className={styles.sectionBody}>
              With subNav set to panel, the collapsed rail is the whole first level, so it widens to 80px and names each destination under its icon. Reports opens its sub-items straight into the panel, and Financial planning becomes the panel’s own accordion. The row feeding the open panel carries the selection fill.
            </p>
            <div className={styles.sidebarDemo} data-anchor-ignore>
              <AppSidebar
                sections={threeLevelSections}
                profile={demoProfile}
                activeKey="reports"
                activeSubKey="standard"
                subNav="panel"
                defaultExpanded={false}
                showMobileTrigger={false}
              />
            </div>
          </section>

          {/* Panel mode, floating */}
          <section className={styles.section}>
            <SectionTitle title="Panel mode, floating" />
            <p className={styles.sectionBody}>
              With floating set, the panel joins the rail as a second glass card, one gap along from the first.
            </p>
            <div className={`${styles.sidebarDemo} ${styles.sidebarDemoTinted}`} data-anchor-ignore>
              <AppSidebar
                sections={threeLevelSections}
                profile={demoProfile}
                activeKey="reports"
                activeSubKey="kpis"
                subNav="panel"
                floating={true}
                defaultExpanded={false}
                showMobileTrigger={false}
              />
            </div>
          </section>

          <ComponentInstallStrip slug="app-sidebar" />
        </main>
      </div>

    </>
  );
}
