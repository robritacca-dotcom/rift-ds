"use client";

import React from "react";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import { AppSidebar, type AppSidebarSection } from "rift-ds/components/AppSidebar/AppSidebar";
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

/* A nav longer than the short demo frame, in three groups, the last row's
   icon a swatch node rather than a glyph. */
const longSections = [
  {
    category: "Analytics",
    items: [
      { key: "home", icon: "home", label: "Home" },
      { key: "realtime", icon: "monitoring", label: "Realtime" },
      { key: "audience", icon: "groups", label: "Audience" },
      { key: "acquisition", icon: "conversion_path", label: "Acquisition" },
      { key: "events", icon: "bolt", label: "Events" },
      { key: "reports", icon: "description", label: "Reports", badge: 4 },
    ],
  },
  {
    category: "Account",
    items: [
      { key: "support", icon: "headset_mic", label: "Support" },
      { key: "settings", icon: "settings", label: "Settings" },
    ],
  },
  {
    category: "Appearance",
    items: [
      { key: "theme", icon: <span className={styles.swatch} aria-hidden="true" />, label: "Theme", value: "Ember" },
      { key: "mode", icon: "dark_mode", label: "Mode", value: "Dark" },
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
    "Flush runs the rail edge to edge on the shell colour behind a hairline divider, and the panel continues it on the same ground, nothing raised.",
  floating:
    "Floating sets the rail as a card on the shell colour inset from the edges, and the panel joins it as a second card, one gap along from the first.",
  inset:
    "Inset, the default, runs the rail flush on the app shell colour, the panel continues it with a divider between them, and the content sits in a raised inset surface beyond both, as the templates draw it.",
};

/* ---- The rail's own content: a section that carries content (a short
   history), a heading action, a key hint and folding sections. Fictional
   threads for a fictional product. */
const contentSections: AppSidebarSection[] = [
  { items: [{ key: "new", icon: "edit_square", label: "New chat", keys: "mod+shift+o" }] },
  {
    category: "Projects",
    action: { label: "New project", icon: "add", onClick: () => {} },
    items: [
      { key: "atlas-app", label: "Atlas app", pixelAvatar: "atlas-app" },
      { key: "atlas-docs", label: "Atlas docs", pixelAvatar: "atlas-docs" },
    ],
  },
  {
    category: "Recent",
    items: [],
    content: (
      <ul className={styles.contentList}>
        <li>Rework the onboarding flow</li>
        <li>Speed up the search index</li>
        <li>Untangle the billing webhooks</li>
      </ul>
    ),
  },
  {
    category: "Account",
    items: [
      { key: "support", icon: "headset_mic", label: "Support" },
      { key: "settings", icon: "settings", label: "Settings" },
    ],
  },
];

function ContentDemo() {
  return (
    <div className={styles.containedDemo} data-anchor-ignore>
      <AppSidebar
        sections={contentSections}
        profile={demoProfile}
        fixed={false}
        defaultExpanded
        collapsibleSections
      />
      <div className={styles.containedContent} />
    </div>
  );
}

const frameWidths = [
  { value: "wide", label: "Wide" },
  { value: "narrow", label: "Narrow" },
];

function ContainerDemo() {
  const [frame, setFrame] = React.useState("wide");
  return (
    <>
      <div className={styles.layoutSwitch}>
        <SegmentedControl
          aria-label="Frame width"
          size="compact"
          segments={frameWidths}
          value={frame}
          onValueChange={setFrame}
        />
      </div>
      <div
        className={`${styles.containedDemo} ${frame === "narrow" ? styles.containedDemoNarrow : ""}`}
        data-anchor-ignore
      >
        <AppSidebar
          sections={contentSections}
          profile={demoProfile}
          fixed={false}
          responsive="container"
          defaultExpanded
        />
        <div className={styles.containedContent} />
      </div>
    </>
  );
}

export default function AppSidebarPage() {
  const [demoLayout, setDemoLayout] = React.useState<DemoLayout>("inset");

  return (
    <div className={styles.dsContent}>
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
          A two-state sidebar that collapses to an 80px rail naming each destination under its icon, or expands to 280px with labels, category headings and a profile section at the bottom. Items take an optional count badge; topSlot and footerSlot host consumer content that fades out while collapsed, persistentTopSlot keeps the top slot for content with a collapsed form of its own, collapsedFooterSlot stands in for the footer while it is, and a click on the empty space of the collapsed rail expands it; and the layout prop sets how the rail meets the page: inset, the default, flush on the app shell colour beside an inset content surface; flush, edge to edge behind a hairline; or floating, a glass card inset from the viewport edges.
        </p>
        <p className={styles.introBody}>
          Navigation runs three levels deep, and subNav picks the shape once per sidebar. In the default panel mode a top-level row opens its sub-items straight into a SubNavPanel beside the rail, whose own accordion carries the third level, and the collapsed rail is 80px wide to put a label under every icon. In accordion mode the second level is the accordion under a row, the collapsed rail is a 64px icon rail, and a sub-item with children of its own opens them as the third level in the panel. On small screens neither shows a panel: the drawer drills in to a second screen with a back row.
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

      {/* A long nav on the collapsed rail */}
      <section className={styles.section}>
        <SectionTitle title="A long nav" />
        <p className={styles.sectionBody}>
          When the rows outgrow the rail, as a long nav or a roomy theme&apos;s taller rows do, the logo and the rows scroll in a block of their own above the profile, which never moves. An end with more beyond it fades out, and the collapsed rail hides its scrollbar, since the fade is the cue. Collapsed, the gaps between groups close up and a short divider on the icons&apos; axis marks each break where the expanded rail names the group. An item&apos;s icon can be a node, such as a theme swatch, centred on the same axis as the glyphs.
        </p>
        <div className={`${styles.sidebarDemo} ${styles.sidebarDemoShort}`} data-anchor-ignore>
          <MockAppContent />
          <AppSidebar
            sections={longSections}
            profile={demoProfile}
            activeKey="realtime"
            defaultExpanded={false}
            showMobileTrigger={false}
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
        <SectionTitle title="Accordion mode" />
        <p className={styles.sectionBody}>
          With subNav set to accordion, Reports holds the second level as its accordion. Financial planning has children of its own, so it carries a trailing chevron and opens them in the panel beside the rail. The accordion and the panel holding the current page both start open. Press Financial planning again, or the panel’s collapse control, to close it.
        </p>
        <div className={styles.sidebarDemo} data-anchor-ignore>
          <MockAppContent />
          <AppSidebar
            sections={threeLevelSections}
            profile={demoProfile}
            activeKey="reports"
            activeSubKey="planning"
            activeTertiaryKey="budgets"
            subNav="accordion"
            defaultExpanded={true}
            showMobileTrigger={false}
          />
        </div>
      </section>

      {/* Panel mode, in each layout */}
      <section className={styles.section}>
        <SectionTitle title="Panel mode" />
        <p className={styles.sectionBody}>
          In panel mode, the default, the collapsed rail is the whole first level, so it is 80px wide and names each destination under its icon. Reports opens its sub-items straight into the panel, and Financial planning becomes the panel’s own accordion. The row feeding the open panel takes a quieter open fill, and the current page keeps its selection, so opening a setting never loses your place. The layout prop sets how the rail and its panel meet the page.
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

      {/* The rail's own content */}
      <section className={styles.section}>
        <SectionTitle title="Content and folding sections" />
        <p className={styles.sectionBody}>
          A rail can carry more than destinations. A section&apos;s content follows its rows, as the recent threads do here, at the expanded rail&apos;s width; the collapsed rail has no room for it and folds it away. A section&apos;s action puts an icon button on its heading, such as a project list&apos;s add, and an item&apos;s keys draws a shortcut hint at the row&apos;s end. With collapsibleSections each heading takes a chevron that folds its rows, and every section starts open. In the drawer the content follows the section&apos;s rows and the action becomes a row of its own. A chat&apos;s history rail is built this way.
        </p>
        <ContentDemo />
      </section>

      {/* Sized by its container */}
      <section className={styles.section}>
        <SectionTitle title="Sized by its container" />
        <p className={styles.sectionBody}>
          By default the rail follows the window: it folds in the tablet band and becomes a drawer on a phone. With responsive set to container it follows its parent instead, so a rail in a framed host switches at the same widths; narrow the frame and the rail becomes a drawer behind its menu button, opening inside the frame. A host that measures its own room passes rail or drawer and opens the drawer through drawerOpen and onDrawerOpenChange, as a chat does from its header. foldForPanel folds the rail to its icon form when the side panel opens without room beside it. Every value but viewport needs fixed set to false.
        </p>
        <ContainerDemo />
      </section>

      <ComponentInstallStrip slug="app-sidebar" />
    </div>
  );
}
