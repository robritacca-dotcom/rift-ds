"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { GanttChart } from "@robr0/design-system/components/GanttChart/GanttChart";
import type { GanttChartItem } from "@robr0/design-system/components/GanttChart/GanttChart";
import PageLinks from "../../../components/PageLinks/PageLinks";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import styles from "./page.module.css";

const deliveryPlan: GanttChartItem[] = [
  { id: "charter", label: "Project charter", start: "2026-02-02", end: "2026-02-13", color: "cobalt" },
  { id: "review", label: "Plan review", start: "2026-02-16", end: "2026-02-27", color: "cobalt" },
  { id: "scope", label: "Scope and goals", start: "2026-03-02", end: "2026-03-13", color: "mint" },
  { id: "budget", label: "Budget", start: "2026-03-09", end: "2026-03-27", color: "mint" },
  { id: "comms", label: "Communication plan", start: "2026-03-23", end: "2026-04-10", color: "gold" },
];

const phasedProgramme: GanttChartItem[] = [
  { id: "charter", label: "Project charter", start: "2026-02-02", end: "2026-02-13", color: "cobalt", group: "Conception" },
  { id: "review", label: "Plan review", start: "2026-02-16", end: "2026-02-27", color: "cobalt", group: "Conception" },
  { id: "scope", label: "Scope and goals", start: "2026-03-02", end: "2026-03-13", color: "mint", group: "Planning" },
  { id: "budget", label: "Budget", start: "2026-03-09", end: "2026-03-27", color: "mint", group: "Planning" },
  { id: "risk", label: "Risk management", start: "2026-03-16", end: "2026-04-03", color: "mint", group: "Planning" },
  { id: "tracking", label: "Status and tracking", start: "2026-04-06", end: "2026-06-26", color: "violet", group: "Execution" },
  { id: "quality", label: "Quality", start: "2026-04-13", end: "2026-06-12", color: "violet", group: "Execution" },
];

const releaseWorkstreams: GanttChartItem[] = [
  { id: "foundation", label: "Foundations", start: "2026-02-02", end: "2026-03-13", color: "cobalt", progress: 100 },
  { id: "build", label: "Component build", start: "2026-03-02", end: "2026-04-24", color: "mint", progress: 65 },
  { id: "docs", label: "Documentation", start: "2026-04-06", end: "2026-05-15", color: "gold", progress: 20 },
  { id: "launch-prep", label: "Launch prep", start: "2026-05-04", end: "2026-05-29", color: "coral", progress: 0 },
];

const releaseMilestones = [
  { id: "kickoff", label: "Kickoff", date: "2026-02-02", color: "cobalt" as const },
  { id: "beta", label: "Beta release", date: "2026-04-17", color: "violet" as const },
  { id: "ga", label: "General availability", date: "2026-05-29", color: "coral" as const },
];

const roadmapItems: GanttChartItem[] = [
  { id: "shipped", label: "Shipped work", start: "2026-02-02", end: "2026-03-27", color: "cobalt", progress: 100 },
  { id: "current", label: "In flight", start: "2026-03-23", end: "2026-04-24", color: "mint", progress: 40 },
  {
    id: "planned",
    label: "Planned work",
    start: "2026-05-04",
    end: "2026-06-26",
    color: "violet",
    projected: true,
    detail: "Target: late Q2",
  },
];

function SelectionDemo() {
  const [selected, setSelected] = React.useState<GanttChartItem | null>(null);

  return (
    <div className={styles.demoStack}>
      <GanttChart
        items={deliveryPlan}
        today="2026-03-16"
        selectedId={selected?.id}
        onItemClick={(item) =>
          setSelected((current) => (current?.id === item.id ? null : item))
        }
        title="Delivery plan"
        subtitle="Click a bar to select it"
      />
      <p className={styles.demoReadout} aria-live="polite">
        {selected
          ? `Selected: ${selected.label}, ${selected.start} to ${selected.end}`
          : "Nothing selected yet."}
      </p>
    </div>
  );
}

export default function GanttChartPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Gantt chart</h1>
            <PageLinks storybookPath="/?path=/docs/components-ganttchart--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              A schedule you can read at a glance
            </p>
            <p className={styles.introBody}>
              Phases and tasks as bars on a shared timeline, with milestone
              diamonds, per-bar progress, and a rule marking today. Read-only
              by design: it draws a schedule, it does not edit one. The label
              rail stays pinned while the timeline scrolls sideways on narrow
              screens, and it wears the same card, header, and padding as
              every other chart, with bare stripping them inside a panel that
              supplies the surface.
            </p>
          </div>

          <section className={`${styles.section} animate-in animate-delay-2`}>
            <SectionTitle title="Default" />
            <p className={styles.sectionBody}>
              A flat plan over one quarter. The window fits the data, snapped
              outward to whole months, and each bar takes an accent from the
              core accent roles. Hovering a bar raises its full reading:
              label, dates, and progress when there is one. The rule marks
              today, and the today prop pins it to a given day, so a
              statically built page and its hydrating client can never
              disagree about where it sits; this demo pins it mid March.
            </p>
            <GanttChart
              items={deliveryPlan}
              today="2026-03-16"
              title="Delivery plan"
              subtitle="February through April"
            />
          </section>

          <section className={`${styles.section} animate-in animate-delay-3`}>
            <SectionTitle title="Phases" />
            <p className={styles.sectionBody}>
              Items sharing a group gather under one overline heading, so a
              programme reads phase by phase without a second component.
            </p>
            <GanttChart
              items={phasedProgramme}
              showToday={false}
              title="Programme timeline"
              subtitle="Three phases from conception to execution"
            />
          </section>

          <section className={`${styles.section} animate-in animate-delay-4`}>
            <SectionTitle title="Progress and milestones" />
            <p className={styles.sectionBody}>
              A progress reading turns the bar into a quiet track with the
              accent filling the completed share. Milestones are point-in-time
              diamonds on their own rows, rendered at the end of their group.
            </p>
            <GanttChart
              items={releaseWorkstreams}
              milestones={releaseMilestones}
              showToday={false}
              title="Release readiness"
              subtitle="Workstreams and the dates that anchor them"
            />
          </section>

          <section className={`${styles.section} animate-in`}>
            <SectionTitle title="Projected work" />
            <p className={styles.sectionBody}>
              Planned work whose dates are targets rather than commitments
              draws as a dashed outline, and a detail line rides along in the
              tooltip to say so.
            </p>
            <GanttChart
              items={roadmapItems}
              showToday={false}
              title="Roadmap"
              subtitle="Dashed bars are targets, not commitments"
            />
          </section>

          <section className={`${styles.section} animate-in`}>
            <SectionTitle title="Selection" />
            <p className={styles.sectionBody}>
              Bars become buttons only when a click callback is passed, and
              selection is controlled: the selected bar takes the teal outline
              the system reserves for the chosen item of a set.
            </p>
            <SelectionDemo />
          </section>
        </main>
      </div>
    </>
  );
}
