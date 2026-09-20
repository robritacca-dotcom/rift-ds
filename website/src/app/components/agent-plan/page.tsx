"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { AgentPlan } from "@robr0/design-system/components/AgentPlan/AgentPlan";
import { Button } from "@robr0/design-system/components/Button/Button";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";


const liveSteps = [
  { label: "Read project files", status: "completed" as const },
  { label: "Update light mode tokens", status: "completed" as const },
  { label: "Implement dark mode tokens", status: "active" as const },
  { label: "Add a reusable theme toggle" },
  { label: "Run lint and a production build" },
];

function SimulatedRun() {
  const [step, setStep] = React.useState(2);
  const total = 5;
  const labels = [
    "Survey the token files",
    "Rename the composer radius token",
    "Update every call site",
    "Regenerate the token registry",
    "Run the full verify",
  ];
  const steps = labels.map((label, index) => ({
    label,
    status:
      index < step
        ? ("completed" as const)
        : index === step && step < total
          ? ("active" as const)
          : undefined,
  }));

  return (
    <div className={styles.demoColumn}>
      <AgentPlan steps={steps} />
      <div className={styles.demoControls}>
        <Button
          variant="secondary"
          size="compact"
          label="Advance a step"
          disabled={step >= total}
          onClick={() => setStep((current) => Math.min(current + 1, total))}
        />
        <Button
          variant="tertiary"
          size="compact"
          label="Reset"
          onClick={() => setStep(0)}
        />
      </div>
    </div>
  );
}

export default function AgentPlanPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Agent plan</h1>
            <PageLinks storybookPath="/?path=/docs/components-agentplan--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              The whole task, ticked off as the agent works
            </p>
            <p className={styles.introBody}>
              Agent status says what is happening right now and Tool call
              records one action. Agent plan holds the task itself: a
              collapsible checklist with one row per step, a live progress
              readout in the header, and completed work receding as the run
              advances.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="A plan in progress" />
            <p className={styles.demoText}>
              Each step carries its own status. Completed steps tick off and
              recede, the active step takes a spinner and an emphasised
              label, and pending steps wait their turn. The header title is
              computed from the steps unless you set one.
            </p>
            <div className={styles.demoColumn}>
              <AgentPlan steps={liveSteps} />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Watch it advance" />
            <p className={styles.demoText}>
              The same plan driven by state. The header readout and the step
              indicators follow the data, nothing animates on its own.
            </p>
            <SimulatedRun />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Failure" />
            <p className={styles.demoText}>
              A failed step colours its indicator and label through the error
              role, and an optional detail line says what went wrong.
            </p>
            <div className={styles.demoColumn}>
              <AgentPlan
                steps={[
                  { label: "Read project files", status: "completed" },
                  {
                    label: "Run the test suite",
                    status: "failed",
                    detail: "2 stories throw on render",
                  },
                  { label: "Open a pull request" },
                ]}
              />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Collapsed" />
            <p className={styles.demoText}>
              The list collapses behind the header, so a long plan can sit
              quietly inside a chat transcript. The progress readout stays
              visible either way.
            </p>
            <div className={styles.demoColumn}>
              <AgentPlan
                defaultOpen={false}
                steps={[
                  { label: "Read project files", status: "completed" },
                  { label: "Implement dark mode tokens", status: "active" },
                  { label: "Run lint and a production build" },
                ]}
              />
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
