"use client";

import React, { useState } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { AgentStatus, AgentStatusMark } from "rift-ds/components/AgentStatus/AgentStatus";
import { agentStatusPatterns } from "rift-ds/components/AgentStatus/AgentStatusPatterns";
import type { AgentStatusState } from "rift-ds/components/AgentStatus/AgentStatusPatterns";
import { agentRingProps } from "rift-ds/components/AgentStatus/AgentRing";
import { Button } from "rift-ds/components/Button/Button";
import { Input } from "rift-ds/components/Input/Input";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import { Table } from "rift-ds/components/Table/Table";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";


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

const RING_STATES: { value: AgentStatusState; label: string }[] = [
  { value: "idle", label: "Idle" },
  { value: "thinking", label: "Thinking" },
  { value: "working", label: "Working" },
  { value: "waiting", label: "Waiting" },
  { value: "done", label: "Done" },
  { value: "error", label: "Error" },
];

/* The mark's states, in AgentStatus's order. */
const MARK_STATES: { value: AgentStatusState; label: string }[] = [
  { value: "idle", label: "Idle" },
  { value: "thinking", label: "Thinking" },
  { value: "working", label: "Working" },
  { value: "waiting", label: "Waiting" },
  { value: "done", label: "Done" },
  { value: "error", label: "Error" },
];

const RING_COLUMNS = [
  { key: "invoice", header: "Invoice" },
  { key: "client", header: "Client" },
  { key: "amount", header: "Amount", align: "right" as const },
];

const RING_ROWS = [
  { id: "1", cells: { invoice: "INV-1042", client: "Northwind", amount: "$1,200" } },
  { id: "2", cells: { invoice: "INV-1043", client: "Halden & Co", amount: "$860" } },
];

/* The ring's demo: one state, three targets of different shapes. */
function RingDemo() {
  const [state, setState] = useState<AgentStatusState>("working");
  /* A re-pick of done or error replays its beat: the key remounts the targets. */
  const [run, setRun] = useState(0);
  const ring = agentRingProps(state === "idle" ? null : state);
  return (
    <>
      <SegmentedControl
        segments={RING_STATES}
        value={state}
        onValueChange={(v) => {
          setState(v as AgentStatusState);
          setRun((r) => r + 1);
        }}
        size="compact"
        aria-label="Ring state"
      />
      <div key={run} className={styles.ringTargets}>
        <div {...ring} className={`${ring.className} ${styles.ringSection}`}>
          <p className={styles.ringSectionTitle}>A section</p>
          <p className={styles.demoText}>
            Any block the agent is rewriting, from a paragraph to a whole
            settings group.
          </p>
        </div>
        <div {...ring} className={`${ring.className} ${styles.ringField}`}>
          <Input aria-label="Billing email" defaultValue="accounts@northwind.test" />
        </div>
        <div {...ring} className={`${ring.className} ${styles.ringTable}`}>
          <Table columns={RING_COLUMNS} rows={RING_ROWS} size="compact" bordered />
        </div>
      </div>
    </>
  );
}

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
              Named choreographies over one 4×3 grid. Each dot is told
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

          {/* The square mark */}
          <section className={styles.section}>
            <SectionTitle title="The square mark" />
            <p className={styles.demoText}>
              AgentStatusMark is the same dots at icon size, for a slot where
              a glyph would sit: a button&rsquo;s icon, a tab, a list row. The
              grid is a 4×4 square sized by the icon scale and inset to a
              Material Symbol&rsquo;s live area, so it swaps with a glyph
              without moving or reading larger than it. Every pattern above is
              redrawn for the square on the same twelve-slot cycle, and the
              states and colours are AgentStatus&rsquo;s. Orbit is the default,
              and the one AI button shows while it works; waiting defaults to
              breathe, a still pulse that says it is the person&rsquo;s turn.
            </p>
            <div className={styles.patternGrid}>
              {agentStatusPatterns.map((pattern) => (
                <span key={pattern} className={styles.markItem}>
                  <AgentStatusMark pattern={pattern} />
                  <span>
                    <span className={styles.patternPrefix}>Mark</span>{" "}
                    {prettyPattern(pattern)}
                  </span>
                </span>
              ))}
            </div>
            <div className={styles.markStates}>
              {MARK_STATES.map(({ value, label }) => (
                <span key={value} className={styles.markItem}>
                  <AgentStatusMark state={value} />
                  <span>{label}</span>
                </span>
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

          {/* Pill */}
          <section className={styles.section}>
            <SectionTitle title="Pill" />
            <p className={styles.demoText}>
              The pill variant is a glass status for a run that goes on while
              the person keeps working: it floats over the page and reports
              each step. Once the run ends the dots fill solid in the status
              colour, and the label says what happened. An action
              after the text opens the run. The pill does not position itself;
              the host seats it.
            </p>
            <div className={styles.stack}>
              <AgentStatus
                variant="pill"
                size="compact"
                state="working"
                label="Working · step 3 of 5"
                action={<Button label="Open" variant="tertiary" size="compact" />}
              />
              <AgentStatus
                variant="pill"
                size="compact"
                state="waiting"
                label="Waiting for your approval"
                action={<Button label="Review" variant="tertiary" size="compact" />}
              />
              <AgentStatus
                variant="pill"
                size="compact"
                state="done"
                label="Done, 4 changes"
                action={<Button label="Open" variant="tertiary" size="compact" />}
              />
              <AgentStatus variant="pill" size="compact" state="error" label="Stopped at step 2" />
            </div>
          </section>

          {/* Ring */}
          <section className={styles.section}>
            <SectionTitle title="The agent ring" />
            <p className={styles.demoText}>
              The agent ring marks whatever the agent is working on: a
              section, a whole table, a row, a card, a field. It is a class and
              an attribute rather than a component, so it goes on any element,
              and{" "}
              <code className={styles.code}>agentRingProps(state)</code> returns
              both. Working turns the AI gradient around the element, waiting
              breathes in the warning colour on the dots&rsquo; own cycle, and
              done and error show their status colour for a beat, then fade. It overlays the element&rsquo;s edge, so
              nothing moves, and it takes the element&rsquo;s corners.{" "}
              <code className={styles.code}>--ds-agent-ring-radius</code> gives
              a square surface corners and{" "}
              <code className={styles.code}>--ds-agent-ring-offset</code> stands
              the ring clear of a borderless one. A field takes it on its
              wrapper, since an input cannot draw one itself.
            </p>
            <RingDemo />
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

          <ComponentInstallStrip slug="agent-status" />
        </main>
      </div>

    </>
  );
}
