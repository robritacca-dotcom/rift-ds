"use client";

import React, { useState } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { SidebarPanel } from "rift-ds/components/SidebarPanel/SidebarPanel";
import type { SidebarPanelItem } from "rift-ds/components/SidebarPanel/SidebarPanel";
import { Button } from "rift-ds/components/Button/Button";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

const reportItems: SidebarPanelItem[] = [
  { key: "standard", label: "Standard reports" },
  { key: "custom", label: "Custom reports" },
  { key: "management", label: "Management reports" },
  { key: "kpis", label: "KPIs", badge: "New" },
  { key: "sync", label: "Spreadsheet sync" },
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

const settingsItems: SidebarPanelItem[] = [
  { key: "profile", label: "Profile", group: "Account" },
  { key: "security", label: "Security", group: "Account" },
  { key: "notifications", label: "Notifications", group: "Account", badge: 3 },
  { key: "members", label: "Members", group: "Workspace", badge: 12 },
  { key: "billing", label: "Billing", group: "Workspace" },
  { key: "integrations", label: "Integrations", group: "Workspace" },
];

function CollapseDemo() {
  const [open, setOpen] = useState(true);
  return (
    <div className={styles.panelDemo}>
      {open ? (
        <SidebarPanel
          items={reportItems}
          title="Reports and analytics"
          activeKey="custom"
          onCollapse={() => setOpen(false)}
        />
      ) : (
        <div className={styles.demoStage}>
          <Button
            variant="secondary"
            size="compact"
            iconLeft="left_panel_open"
            label="Show reports"
            onClick={() => setOpen(true)}
          />
        </div>
      )}
    </div>
  );
}

function DrillInDemo() {
  const [screen, setScreen] = useState<"menu" | "reports">("reports");
  const menuItems: SidebarPanelItem[] = [
    { key: "home", label: "Home" },
    { key: "reports", label: "Reports", onClick: () => setScreen("reports") },
    { key: "clients", label: "Clients" },
    { key: "payroll", label: "Payroll" },
  ];
  return (
    <div className={styles.panelDemo}>
      {screen === "reports" ? (
        <SidebarPanel
          items={reportItems}
          title="Reports and analytics"
          activeKey="standard"
          onBack={() => setScreen("menu")}
          backLabel="Menu"
        />
      ) : (
        <SidebarPanel items={menuItems} title="Menu" activeKey="reports" />
      )}
    </div>
  );
}

export default function SidebarPanelPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Sidebar panel</h1>
            <PageLinks storybookPath="/?path=/docs/components-sidebarpanel--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              The second column of app navigation
            </p>
            <p className={styles.introBody}>
              A 240px column listing the pages inside one section, under a heading that names it. Items can sit under group headings, carry a count badge, and nest one level deep as an accordion. It works on its own, and it is the panel AppSidebar opens beside the rail when navigation runs to a third level.
            </p>
          </div>

          <section className={`${styles.section} animate-in animate-delay-2`}>
            <SectionTitle title="Default" />
            <p className={styles.sectionBody}>
              Flat rows with one accordion. Financial planning stays closed until it is pressed, and its rows hang from a tree line under the label.
            </p>
            <div className={styles.panelDemo} data-anchor-ignore>
              <SidebarPanel
                items={reportItems}
                title="Reports and analytics"
                activeKey="standard"
              />
            </div>
          </section>

          <section className={`${styles.section} animate-in animate-delay-3`}>
            <SectionTitle title="Current page inside an accordion" />
            <p className={styles.sectionBody}>
              When activeKey names a nested row, the accordion holding it starts open, so the reader lands with their place already showing. Close it and the parent row keeps the emphasis weight.
            </p>
            <div className={styles.panelDemo} data-anchor-ignore>
              <SidebarPanel
                items={reportItems}
                title="Reports and analytics"
                activeKey="budgets"
              />
            </div>
          </section>

          <section className={`${styles.section} animate-in animate-delay-4`}>
            <SectionTitle title="Groups and badges" />
            <p className={styles.sectionBody}>
              Consecutive items that share a group render under one heading. A badge adds the same count pill the app sidebar uses.
            </p>
            <div className={styles.panelDemo} data-anchor-ignore>
              <SidebarPanel
                items={settingsItems}
                title="Settings"
                activeKey="profile"
              />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Collapse control" />
            <p className={styles.sectionBody}>
              Passing onCollapse adds a close control beside the heading. The panel reports the press; the host decides what showing and hiding it means.
            </p>
            <div data-anchor-ignore>
              <CollapseDemo />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Back row" />
            <p className={styles.sectionBody}>
              Passing onBack adds a row above the heading that returns to the level above. This is the drill-in screen the app sidebar’s mobile drawer shows in place of the panel. Press Menu, then Reports, to move between the two levels.
            </p>
            <div data-anchor-ignore>
              <DrillInDemo />
            </div>
          </section>

          <ComponentInstallStrip slug="sidebar-panel" />
        </main>
      </div>
    </>
  );
}
