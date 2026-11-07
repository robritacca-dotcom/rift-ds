"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { AppSidebar } from "rift-ds/components/AppSidebar/AppSidebar";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import {
  EntitySwitcher,
  type EntitySwitcherItem,
} from "rift-ds/components/EntitySwitcher/EntitySwitcher";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

/** A placeholder app screen behind each demo rail, so the rail reads beside content. */
function MockAppContent() {
  return (
    <div className={styles.mockContent} aria-hidden="true">
      <div className={styles.mockSurface}>
        <div className={styles.mockHeader}>
          <span className={styles.mockTitle} />
          <span className={styles.mockAction} />
        </div>
        <div className={styles.mockStats}>
          <span className={styles.mockBlock} />
          <span className={styles.mockBlock} />
          <span className={styles.mockBlock} />
        </div>
        <span className={`${styles.mockBlock} ${styles.mockChart}`} />
        <div className={styles.mockList}>
          <span className={styles.mockRow} />
          <span className={styles.mockRow} />
          <span className={styles.mockRow} />
        </div>
      </div>
    </div>
  );
}

const demoEntities: EntitySwitcherItem[] = [
  {
    id: "northwind",
    name: "Northwind Group",
    description: "Company",
    children: [
      { id: "consumer", name: "Consumer", description: "Business unit" },
      { id: "enterprise", name: "Enterprise", description: "Business unit" },
    ],
  },
  { id: "halcyon", name: "Halcyon Studio", description: "Agency client" },
];

const switcherSections = [
  {
    items: [
      { key: "dashboard", icon: "dashboard", label: "Dashboard" },
      { key: "analytics", icon: "analytics", label: "Analytics" },
      { key: "projects", icon: "folder", label: "Projects" },
      { key: "calendar", icon: "calendar_today", label: "Calendar" },
    ],
  },
];

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

const footerViews = [
  { label: "List", value: "list", icon: "view_list" },
  { label: "Grid", value: "grid", icon: "grid_view" },
];

type DemoLayout = "flush" | "floating" | "inset";

const layoutOptions: { label: string; value: DemoLayout }[] = [
  { label: "Flush", value: "flush" },
  { label: "Floating", value: "floating" },
  { label: "Inset", value: "inset" },
];

/** What each layout does, shown under the switch for the one picked. */
const layoutNotes: Record<DemoLayout, string> = {
  flush:
    "Flush, the default, runs the rail edge to edge on the shell colour behind a hairline divider, and the panel continues it on the same ground, nothing raised.",
  floating:
    "Floating sets the rail as a glass card inset from the edges, and the panel joins it as a second card, one gap along from the first.",
  inset:
    "Inset runs the rail flush on the app shell colour, the panel continues it with a divider between them, and the content sits in a raised inset surface beyond both, as the templates draw it.",
};

export default function AppSidebarPage() {
  const [demoLayout, setDemoLayout] = React.useState<DemoLayout>("flush");

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
              A two-state sidebar that collapses to a 64px icon rail or expands to 280px with labels, category headings, accordion sub-items with tree-line connectors, and a profile section at the bottom. Items take an optional count badge; topSlot and footerSlot host consumer content that fades out while collapsed, persistentTopSlot keeps the top slot for content with a collapsed form of its own, collapsedFooterSlot stands in for the footer while it is, and a click on the empty space of the collapsed rail expands it; and the layout prop sets how the rail meets the page: flush, floating as a glass card inset from the viewport edges, or inset, flush on the app shell colour beside an inset content surface.
            </p>
            <p className={styles.introBody}>
              Navigation runs three levels deep, and subNav picks the shape once per sidebar. In the default accordion mode the second level is the accordion under a row, and a sub-item with children of its own opens them as the third level in a SidebarPanel beside the rail. In panel mode a top-level row opens its sub-items straight into the panel, whose own accordion carries the third level, and the collapsed rail widens to 80px to put a label under every icon. On small screens neither shows a panel: the drawer drills in to a second screen with a back row.
            </p>
          </div>

          {/* Expanded */}
          <section className={styles.section}>
            <SectionTitle title="Expanded" />
            <div className={styles.sidebarDemo}>
              <MockAppContent />
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
              <MockAppContent />
              <AppSidebar
                sections={demoSections}
                profile={demoProfile}
                activeKey="dashboard"
                defaultExpanded={false}
              />
            </div>
          </section>

          {/* Collapsed footer */}
          <section className={styles.section}>
            <SectionTitle title="Collapsed footer" />
            <p className={styles.introBody}>
              <code>collapsedFooterSlot</code> takes the footer&apos;s place while the rail is
              collapsed: the same controls at their smallest, stacked on the rail&apos;s axis. Click
              the rail&apos;s empty space to expand it and see the footer it stands in for.
            </p>
            <div className={styles.sidebarDemo}>
              <MockAppContent />
              <AppSidebar
                sections={demoSections}
                profile={demoProfile}
                activeKey="dashboard"
                defaultExpanded={false}
                footerSlot={
                  <SegmentedControl
                    aria-label="View"
                    size="compact"
                    segments={footerViews}
                    defaultValue="list"
                  />
                }
                collapsedFooterSlot={
                  <SegmentedControl
                    aria-label="View"
                    size="compact"
                    segments={footerViews}
                    defaultValue="list"
                    cycle
                  />
                }
              />
            </div>
          </section>

          {/* Entity switcher in the top slot */}
          <section className={styles.section}>
            <SectionTitle title="Entity switcher" />
            <p className={styles.sectionBody}>
              The top slot under the logo is where an EntitySwitcher sits, the company, team or account the app is scoped to. With persistentTopSlot the slot stays through the collapse: the switcher keeps its mark on the rail&apos;s axis and fades the rest, so nothing moves as the rail sweeps, and its panel opens beside the collapsed rail. Collapse the rail to see it.
            </p>
            <div className={styles.sidebarDemo} data-anchor-ignore>
              <MockAppContent />
              <AppSidebar
                sections={switcherSections}
                profile={demoProfile}
                activeKey="dashboard"
                subNav="panel"
                defaultExpanded={true}
                showMobileTrigger={false}
                persistentTopSlot
                topSlot={
                  <EntitySwitcher
                    items={demoEntities}
                    defaultValue="consumer"
                    switcherLabel="Switch workspace"
                  />
                }
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
              <MockAppContent />
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

          {/* Panel mode, in each layout */}
          <section className={styles.section}>
            <SectionTitle title="Panel mode" />
            <p className={styles.sectionBody}>
              With subNav set to panel, the collapsed rail is the whole first level, so it widens to 80px and names each destination under its icon. Reports opens its sub-items straight into the panel, and Financial planning becomes the panel’s own accordion. The row feeding the open panel carries the selection fill. The layout prop sets how the rail and its panel meet the page.
            </p>
            <div className={styles.layoutSwitch}>
              <SegmentedControl
                aria-label="Layout"
                size="compact"
                segments={layoutOptions}
                value={demoLayout}
                onValueChange={(value) => setDemoLayout(value as DemoLayout)}
              />
              <p className={styles.layoutNote} aria-live="polite">
                {layoutNotes[demoLayout]}
              </p>
            </div>
            <div
              className={[
                styles.sidebarDemo,
                demoLayout === "floating" ? styles.sidebarDemoTinted : "",
              ]
                .filter(Boolean)
                .join(" ")}
              data-anchor-ignore
            >
              <MockAppContent />
              <AppSidebar
                sections={threeLevelSections}
                profile={demoProfile}
                activeKey="reports"
                activeSubKey="standard"
                subNav="panel"
                layout={demoLayout}
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
