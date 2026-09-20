"use client";

import { useState } from "react";
import styles from "../page.module.css";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import { Tabs } from "@robr0/design-system/components/Tabs/Tabs";
import { Pagination } from "@robr0/design-system/components/Pagination/Pagination";
import { Breadcrumb } from "@robr0/design-system/components/Breadcrumb/Breadcrumb";

const PREVIEW_TABS = [
  { value: "overview", label: "Overview" },
  { value: "activity", label: "Activity" },
  { value: "settings", label: "Settings" },
];

const BREADCRUMB_ITEMS = [
  { label: "Home", href: "#" },
  { label: "Projects", href: "#" },
  { label: "Design system" },
];

export default function NavigationSection() {
  const [activeTab, setActiveTab] = useState("overview");
  const [page, setPage] = useState(3);

  return (
    <section className={styles.demoSection} aria-label="Navigation">
      <SectionTitle title="Navigation" />
      <p className={styles.sectionNote}>
        Active indicators, current-page markers, and hover states all derive from the
        same action tokens as the buttons above, so one colour pick keeps wayfinding
        consistent.
      </p>

      <Tabs
        tabs={PREVIEW_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        ariaLabel="Preview tabs"
      />

      <div className={styles.demoRow}>
        <Pagination page={page} pageCount={8} onPageChange={setPage} ariaLabel="Demo pagination" />
      </div>

      <Breadcrumb items={BREADCRUMB_ITEMS} ariaLabel="Demo breadcrumb" />
    </section>
  );
}
