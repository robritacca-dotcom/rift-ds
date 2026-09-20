"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { AgentStatus } from "@robr0/design-system/components/AgentStatus/AgentStatus";
import { agentStatusPatterns } from "@robr0/design-system/components/AgentStatus/AgentStatusPatterns";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";


/** "fill-sweep" → "Fill sweep" */
const prettyPattern = (pattern: string) =>
  pattern.charAt(0).toUpperCase() + pattern.slice(1).replace(/-/g, " ");

/** The core accent ramps, in the order design.md lists them. */
const accentRamps = [
  ["coral", "Coral"],
  ["amber", "Amber"],
  ["gold", "Gold"],
  ["mint", "Mint"],
  ["cobalt", "Cobalt"],
  ["violet", "Violet"],
] as const;

export default function AgentStatusPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Agent status</h1>
            <PageLinks storybookPath="/?path=/docs/components-agentstatus--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>What the agent is doing, right now</p>
            <p className={styles.introBody}>
              A dot-matrix indicator beside a line of status text. An agent
              spends most of its time in a state a person cannot see, so the
              indicator has one job: make the difference between working,
              waiting on you, and finished legible at a glance.
            </p>
          </div>

          {/* States */}
          <section className={styles.section}>
            <SectionTitle title="States" />
            <p className={styles.demoText}>
              Six states. The three working states are deliberately monochrome
              and colour is held back for the states where it means something:
              waiting on a person, finished, failed. The terminal states fill
              the matrix solid, so the shape reads as done before the colour
              does.
            </p>
            <div className={styles.stack}>
              <AgentStatus state="idle" />
              <AgentStatus state="thinking" />
              <AgentStatus state="working" label="Reading 14 files" />
              <AgentStatus state="waiting" label="Waiting for approval" />
              <AgentStatus state="done" label="Finished in 4s" />
              <AgentStatus state="error" label="Tool call failed" />
            </div>
          </section>

          {/* Patterns */}
          <section className={styles.section}>
            <SectionTitle title="Patterns" />
            <p className={styles.demoText}>
              Fifteen named choreographies over one 4×3 grid. Each dot is told
              which of the cycle&apos;s twelve slots it lights in, and the dots a
              pattern never lights opt out entirely, so a pattern is a
              sequence of numbers rather than its own animation. One grid and
              one cycle length means switching pattern never changes the
              indicator&apos;s footprint or its rhythm.
            </p>
            <div className={styles.patternGrid}>
              {agentStatusPatterns.map((pattern) => (
                <AgentStatus key={pattern} pattern={pattern}>
                  <span className={styles.patternPrefix}>Agent</span>{" "}
                  {prettyPattern(pattern)}
                </AgentStatus>
              ))}
            </div>
          </section>

          {/* Shimmer */}
          <section className={styles.section}>
            <SectionTitle title="The label sweep" />
            <p className={styles.demoText}>
              While the agent is active a highlight sweeps the label left to
              right. It is the same treatment Reasoning uses on its summary, so
              &ldquo;the model is working&rdquo; looks the same wherever it
              appears. Turn it off with <code className={styles.code}>shimmer</code>{" "}
              for a quieter row.
            </p>
            <div className={styles.stack}>
              <AgentStatus state="working" label="Sweeping" />
              <AgentStatus state="working" label="Not sweeping" shimmer={false} />
            </div>
          </section>

          {/* Sizes and variants */}
          <section className={styles.section}>
            <SectionTitle title="Sizes and variants" />
            <div className={styles.stack}>
              <AgentStatus label="Default, matching message text" />
              <AgentStatus size="compact" label="Compact, matching compact message text" />
            </div>
            <p className={styles.demoText}>
              The bar variant is a full-width row for the top of a panel, where
              the status belongs to the whole surface rather than to a line of
              content.
            </p>
            <AgentStatus
              variant="bar"
              state="working"
              label="Running the test suite"
              pattern="scan"
            />
          </section>

          {/* Accents */}
          <section className={styles.section}>
            <SectionTitle title="Accents" />
            <p className={styles.demoText}>
              The working colours are deliberately quiet, and the status
              colours are spoken for. Every colour on the component routes
              through a custom property, though, so when several agents share
              a surface each row can take its identity from one of the core
              accent ramps: set{" "}
              <code className={styles.code}>--ds-agent-color</code> and its
              label and sweep companions on the row, and the dots, the label,
              and the sweep all follow the accent.
            </p>
            <div className={styles.stack}>
              {accentRamps.map(([name, label]) => (
                <AgentStatus
                  key={name}
                  className={`${styles.accent} ${styles[name]}`}
                  state="working"
                  label={label}
                />
              ))}
            </div>
          </section>

          {/* Accessibility */}
          <section className={styles.section}>
            <SectionTitle title="Accessibility" />
            <p className={styles.demoText}>
              The root is a polite live region and the matrix is hidden from
              assistive technology, so a state change is announced once as text
              rather than as twelve dots. Under reduced-motion preferences the
              matrix parks at a static, legible opacity and the sweep resolves
              to flat text. The meaning has to survive the animation being
              switched off, because for some readers it always is.
            </p>
          </section>
        </main>
      </div>

    </>
  );
}
