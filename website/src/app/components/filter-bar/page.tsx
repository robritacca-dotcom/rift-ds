"use client";

import React, { useState } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { FilterBar } from "@robr0/design-system/components/FilterBar/FilterBar";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

const issueFilters = [
  {
    id: "status",
    label: "Status",
    icon: "flag",
    options: [
      { value: "open", label: "Open" },
      { value: "in-progress", label: "In progress" },
      { value: "done", label: "Done" },
    ],
  },
  {
    id: "assignee",
    label: "Assignee",
    icon: "person",
    options: [
      { value: "jane", label: "Jane Doe" },
      { value: "alex", label: "Alex Smith" },
      { value: "sam", label: "Sam Reyes" },
    ],
  },
  {
    id: "priority",
    label: "Priority",
    icon: "priority_high",
    multiple: false,
    options: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
    ],
  },
];

const issues = [
  { title: "Composer loses focus on paste", status: "open", assignee: "jane", priority: "high" },
  { title: "Dark-mode chart palette drifts", status: "in-progress", assignee: "alex", priority: "medium" },
  { title: "Sidebar badge miscounts drafts", status: "open", assignee: "sam", priority: "low" },
  { title: "Toast stacks past its inset", status: "done", assignee: "jane", priority: "medium" },
  { title: "Globe drag stutters on trackpads", status: "in-progress", assignee: "sam", priority: "high" },
  { title: "Stepper skips the review step", status: "done", assignee: "alex", priority: "low" },
];

const statusLabels: Record<string, string> = {
  open: "Open",
  "in-progress": "In progress",
  done: "Done",
};

export default function FilterBarPage() {
  const [values, setValues] = useState<Record<string, string[]>>({
    status: ["open", "in-progress"],
  });

  const visible = issues.filter((issue) =>
    Object.entries(values).every(([id, active]) =>
      active.includes(issue[id as keyof typeof issue] as string),
    ),
  );

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Filter bar</h1>
            <PageLinks storybookPath="/?path=/docs/components-filterbar--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Narrowing a collection, one chip at a time
            </p>
            <p className={styles.introBody}>
              Each chip opens a popover of options. Active filters show their
              choice, grow a clear button, and flip to the action fill; a
              clear-all appears once anything is set. State is one map of
              filter id to active values, so wiring it to a table or a list is
              a single callback.
            </p>
          </div>

          <section className={`${styles.section} animate-in animate-delay-2`}>
            <SectionTitle title="Wired to a collection" />
            <p className={styles.sectionBody}>
              A controlled bar filtering the rows below it. Status and assignee
              take several values; priority is single-select and closes on
              choice.
            </p>
            <FilterBar
              filters={issueFilters}
              values={values}
              onValuesChange={setValues}
            />
            <div className={styles.resultList}>
              {visible.map((issue) => (
                <div key={issue.title} className={styles.resultRow}>
                  <span>{issue.title}</span>
                  <span className={styles.resultMeta}>
                    {statusLabels[issue.status]}
                  </span>
                </div>
              ))}
              {visible.length === 0 && (
                <div className={styles.resultEmpty}>
                  Nothing matches the active filters.
                </div>
              )}
            </div>
          </section>

          <section className={`${styles.section} animate-in animate-delay-3`}>
            <SectionTitle title="Uncontrolled" />
            <p className={styles.sectionBody}>
              With defaultValues the bar keeps its own state and reports every
              change. An empty map means unfiltered, so consumers never guess
              at sentinel values.
            </p>
            <FilterBar filters={issueFilters} defaultValues={{ priority: ["high"] }} />
          </section>

          <section className={`${styles.section} animate-in animate-delay-4`}>
            <SectionTitle title="Compact" />
            <p className={styles.sectionBody}>
              The compact size tightens the chips to Chip&apos;s compact
              paddings, for toolbars above dense tables.
            </p>
            <FilterBar
              size="compact"
              filters={issueFilters}
              defaultValues={{ assignee: ["jane"], status: ["open"] }}
              clearLabel="Reset"
            />
          </section>

          <section className={`${styles.section} animate-in animate-delay-5`}>
            <SectionTitle title="Keyboard" />
            <p className={styles.sectionBody}>
              The popovers are real listboxes driven from the chip: arrows
              move, Enter and Space toggle, Escape closes, and focus never
              leaves the trigger. Single-select filters close as soon as a
              choice lands.
            </p>
          </section>
        </main>
      </div>
    </>
  );
}
