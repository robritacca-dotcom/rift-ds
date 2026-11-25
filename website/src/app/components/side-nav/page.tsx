"use client";

import React, { useState } from "react";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import { SideNav, type SideNavEntry } from "rift-ds/components/SideNav/SideNav";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

const DOCS_PAGES = ["Accordion", "Alert", "Avatar", "Badge", "Breadcrumb", "Button", "Calendar", "Card", "Checkbox", "Code block", "Combobox", "Dialog", "Drawer", "Dropdown menu", "Field", "Input", "Kbd", "Menubar", "Pagination", "Popover", "Select", "Slider", "Switch", "Table", "Tabs", "Toast", "Tooltip"];

const DOCS_NAV: SideNavEntry[] = [
  {
    type: "section",
    label: "Getting started",
    items: [
      { label: "Introduction", href: "#introduction" },
      { label: "Installation", href: "#installation" },
      { label: "Theming", href: "#theming", items: [{ label: "Colours", href: "#theming-colours" }, { label: "Dark mode", href: "#theming-dark-mode" }] },
      { label: "CLI", href: "#cli", badge: "New" },
    ],
  },
  {
    type: "section",
    label: "Components",
    items: DOCS_PAGES.map((label) => ({ label, href: `#components-${label.toLowerCase().replace(/ /g, "-")}` })),
  },
  {
    type: "section",
    label: "Guides",
    collapsible: true,
    items: [{ label: "Forms", href: "#guides-forms" }, { label: "Accessibility", href: "#guides-accessibility" }],
  },
];


const basicItems = [
  { label: "Overview", href: "#overview" },
  { label: "Getting started", href: "#getting-started" },
  { label: "Guides", href: "#guides" },
  { label: "Changelog", href: "#changelog" },
];

const nestedItems = [
  { label: "Overview", href: "#overview" },
  {
    label: "Guides",
    href: "#guides",
    id: "guides",
    items: [
      { label: "Theming", href: "#theming" },
      { label: "Migration", href: "#migration" },
    ],
  },
  {
    label: "Reference",
    href: "#reference",
    id: "reference",
    items: [
      { label: "Tokens", href: "#tokens" },
      { label: "Utilities", href: "#utilities" },
    ],
  },
];

const staticGroupItems = [
  { label: "Overview", href: "#overview" },
  {
    label: "Foundations",
    href: "#foundations",
    collapsible: false,
    items: [
      { label: "Colour", href: "#colour" },
      { label: "Typography", href: "#typography" },
    ],
  },
];

function ControlledExample() {
  const [expandedIds, setExpandedIds] = useState<string[]>(["guides"]);
  return (
    <SideNav
      items={nestedItems}
      expandedIds={expandedIds}
      onExpandedChange={setExpandedIds}
      aria-label="Controlled example"
    />
  );
}

export default function SideNavPage() {
  return (
    <div className={styles.dsContent}>
      <PageBreadcrumb />
      <div className={`${styles.pageHeader} animate-in`}>
        <h1 className={styles.pageTitle}>Side nav</h1>
        <PageLinks
          storybookPath="/?path=/docs/components-sidenav--docs"
        />
      </div>

      <div className={`${styles.introSection} animate-in animate-delay-1`}>
        <p className={styles.subDisplay}>
          Navigation links as a vertical list
        </p>
        <p className={styles.introBody}>
          Side nav renders navigation trees for drawers and side menus. Every row is a real link built on the tertiary Button, so shape, sizing, and states match the rest of the system, and sections expand with a separate chevron toggle: tapping the label navigates, tapping the chevron expands.
        </p>
      </div>

      {/* Basic */}
      <section className={styles.section}>
        <SectionTitle title="Basic list" />
        <div style={{ maxWidth: "360px" }}>
          <SideNav items={basicItems} aria-label="Basic example" />
        </div>
      </section>

      {/* Nested */}
      <section className={styles.section}>
        <SectionTitle title="Nested sections" />
        <div style={{ maxWidth: "360px" }}>
          <SideNav
            items={nestedItems}
            defaultExpandedIds={["guides"]}
            aria-label="Nested example"
          />
        </div>
      </section>

      {/* Current page */}
      <section className={styles.section}>
        <SectionTitle title="Current page" />
        <div style={{ maxWidth: "360px" }}>
          <SideNav
            items={basicItems}
            currentHref="#guides"
            aria-label="Current page example"
          />
        </div>
      </section>

      {/* Controlled */}
      <section className={styles.section}>
        <SectionTitle title="Controlled, one open at a time" />
        <div style={{ maxWidth: "360px" }}>
          <ControlledExample />
        </div>
      </section>

      {/* Static group */}
      <section className={styles.section}>
        <SectionTitle title="Static group" />
        <div style={{ maxWidth: "360px" }}>
          <SideNav items={staticGroupItems} aria-label="Static group example" />
        </div>
      </section>

      {/* Icons */}
      <section className={styles.section}>
        <SectionTitle title="Icons" />
        <div style={{ maxWidth: "360px" }}>
          <SideNav
            items={[
              { label: "Overview", href: "#icons-overview", icon: "home" },
              { label: "Guides", href: "#icons-guides", icon: "menu_book" },
              { label: "Reference", href: "#icons-reference", icon: "code", badge: "New" },
              { label: "Settings", href: "#icons-settings", icon: "settings" },
            ]}
            currentHref="#icons-guides"
            aria-label="Icons example"
          />
        </div>
      </section>

      <section className={styles.section}>
        <SectionTitle title="A long sidebar" />
        <div className={styles.kitDemo}>
          <nav aria-label="Documentation example" className={styles.kitFrame}>
            <SideNav items={DOCS_NAV} size="compact" scrollable currentHref="#components-menubar" />
          </nav>
          <p className={styles.kitNote}>
            Compact rows, titled sections, a badge, and its own scroll: <code>scrollable</code> keeps the scroll inside the list at both ends and brings the current page into view on load. The branch that holds the current page starts open.
          </p>
        </div>
      </section>

      <ComponentInstallStrip slug="side-nav" />
    </div>
  );
}
