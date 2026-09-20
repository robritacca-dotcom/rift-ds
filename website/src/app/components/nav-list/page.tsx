"use client";

import React, { useState } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { NavList } from "@robr0/design-system/components/NavList/NavList";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

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
    <NavList
      items={nestedItems}
      expandedIds={expandedIds}
      onExpandedChange={setExpandedIds}
      aria-label="Controlled example"
    />
  );
}

export default function NavListPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Nav list</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-navlist--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Navigation links as a vertical list
            </p>
            <p className={styles.introBody}>
              Nav list renders navigation trees for drawers and side menus. Every row is a real link built on the tertiary Button, so shape, sizing, and states match the rest of the system, and sections expand with a separate chevron toggle: tapping the label navigates, tapping the chevron expands.
            </p>
          </div>

          {/* Basic */}
          <section className={styles.section}>
            <SectionTitle title="Basic list" />
            <div style={{ maxWidth: "360px" }}>
              <NavList items={basicItems} aria-label="Basic example" />
            </div>
          </section>

          {/* Nested */}
          <section className={styles.section}>
            <SectionTitle title="Nested sections" />
            <div style={{ maxWidth: "360px" }}>
              <NavList
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
              <NavList
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
              <NavList items={staticGroupItems} aria-label="Static group example" />
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
