"use client";

import React, { useEffect, useRef, useState } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { AiButton } from "rift-ds/components/AiButton/AiButton";
import type { AgentStatusState } from "rift-ds/components/AgentStatus/AgentStatusPatterns";
import { Button } from "rift-ds/components/Button/Button";
import { InterruptCard } from "rift-ds/components/InterruptCard/InterruptCard";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";


/* Each state has an icon, so the switch folds to icons where its words do not fit. */
const STATUSES: { value: AgentStatusState; label: string; icon: string }[] = [
  { value: "idle", label: "Idle", icon: "radio_button_unchecked" },
  { value: "thinking", label: "Thinking", icon: "psychology" },
  { value: "working", label: "Working", icon: "autorenew" },
  { value: "waiting", label: "Waiting", icon: "front_hand" },
  { value: "done", label: "Done", icon: "check_circle" },
  { value: "error", label: "Error", icon: "error" },
];

/* How long the demo task "works" before it reports done. */
const DEMO_TASK_MS = 3200;
/* How long the approval demo works before it stops to ask. */
const DEMO_ASK_MS = 1600;

const APPROVAL_OPTIONS = [
  { value: "allow-once", label: "Allow once", variant: "primary" as const },
  { value: "deny", label: "Deny" },
];

export default function AiButtonPage() {
  const [status, setStatus] = useState<AgentStatusState>("idle");
  const taskTimer = useRef<number | null>(null);
  useEffect(() => () => {
    if (taskTimer.current) window.clearTimeout(taskTimer.current);
  }, []);
  const pick = (next: AgentStatusState) => {
    if (taskTimer.current) window.clearTimeout(taskTimer.current);
    setStatus(next);
  };
  /* The approval demo: work, stop to ask, then finish or fail on the answer. */
  const [askStatus, setAskStatus] = useState<AgentStatusState>("idle");
  const askTimer = useRef<number | null>(null);
  useEffect(() => () => {
    if (askTimer.current) window.clearTimeout(askTimer.current);
  }, []);
  const runAsk = () => {
    if (askTimer.current) window.clearTimeout(askTimer.current);
    setAskStatus("working");
    askTimer.current = window.setTimeout(() => setAskStatus("waiting"), DEMO_ASK_MS);
  };
  const answer = (choice: string) => {
    setAskStatus("working");
    askTimer.current = window.setTimeout(
      () => setAskStatus(choice === "deny" ? "error" : "done"),
      DEMO_ASK_MS,
    );
  };

  const runTask = () => {
    pick("working");
    taskTimer.current = window.setTimeout(() => pick("done"), DEMO_TASK_MS);
  };

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>AI button</h1>
            <PageLinks storybookPath="/?path=/docs/components-aibutton--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              The entry point that says a model answers here
            </p>
            <p className={styles.introBody}>
              Icon and label on a solid field pushed past the page floor,
              bright white in light and true black in dark, ringed by the AI
              gradient turning slowly, with a soft glow of the same gradient
              haloing the edge.
              The treatment is reserved: ordinary actions keep the flat action
              colour, and this ring marks the surfaces where an AI responds, so
              neither affordance dilutes the other. This site&rsquo;s own chat
              opens from one.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <p className={styles.demoText}>
              The resting state is quiet: a hairline gradient ring at reduced
              strength and a low glow. Hover widens the ring to full strength
              and raises the glow; the ring turns on its own uneven cadence,
              drifting and settling rather than ticking round at one rate. On
              mount it lights rather than arriving: the glow blooms out of the
              corner and the ring fades up a beat behind it.
            </p>
            <div className={styles.row}>
              <AiButton />
            </div>
          </section>

          {/* Label and icon */}
          <section className={styles.section}>
            <SectionTitle title="Label and icon" />
            <p className={styles.demoText}>
              The label names the conversation, not the technology. Any
              Material Symbol works as the leading icon.
            </p>
            <div className={styles.row}>
              <AiButton label="Chat with the agent" icon="forum" />
              <AiButton label="Summarise this page" icon="notes" />
            </div>
          </section>

          {/* Sizes */}
          <section className={styles.section}>
            <SectionTitle title="Sizes" />
            <p className={styles.demoText}>
              Two sizes on Button&rsquo;s control scale, so the two components
              sit together without negotiation.
            </p>
            <div className={styles.row}>
              <AiButton />
              <AiButton size="compact" />
            </div>
          </section>

          {/* States */}
          <section className={styles.section}>
            <SectionTitle title="States" />
            <p className={styles.demoText}>
              Disabled drops to 0.4 opacity and pauses the rotation. Under
              reduced motion the ring and glow stay put and only the turning
              stops.
            </p>
            <div className={styles.row}>
              <AiButton disabled />
            </div>
          </section>

          {/* Status */}
          <section className={styles.section}>
            <SectionTitle title="Status" />
            <p className={styles.demoText}>
              With status, the button reports what the agent behind it is
              doing, in AgentStatus&rsquo;s vocabulary. The label never
              changes; the icon carries the state. Thinking and working swap
              the icon for the agent mark, a square of dots sized exactly to
              the icon, and spin the ring faster. Waiting shows the mark
              breathing in the warning colour with the ring at rest, because
              the next move is yours. Done and error turn the whole button to
              their status colours, with the mark filled solid in green or
              red for a beat,
              then the resting look returns. The
              button stays clickable throughout, so a click can open the
              conversation to watch the work.
            </p>
            <div className={styles.row}>
              <SegmentedControl
                segments={STATUSES}
                value={status}
                onValueChange={(v) => pick(v as AgentStatusState)}
                size="compact"
                aria-label="Status"
                collapse
              />
              <Button label="Run a task" variant="secondary" size="compact" onClick={runTask} />
            </div>
            <div className={styles.row}>
              <AiButton label="Agent" status={status} />
              <AiButton label="Agent" size="compact" status={status} />
            </div>
          </section>

          {/* Request */}
          <section className={styles.section}>
            <SectionTitle title="Asking for approval" />
            <p className={styles.demoText}>
              When the agent stops to ask, request puts what it needs in a
              glass panel at the button, so the question appears where the
              person is already looking. Any content works; an InterruptCard
              approval is the usual one. The panel opens each time the status
              becomes waiting. Escape or a click on the button folds it away,
              the waiting mark stays, and another click brings it back. Run the
              task, then answer the card.
            </p>
            <div className={styles.row}>
              <Button label="Run a task" variant="secondary" size="compact" onClick={runAsk} />
            </div>
            <div className={`${styles.row} ${styles.requestClearance}`}>
              <AiButton
                label="Agent"
                status={askStatus}
                requestPlacement="bottom"
                request={
                  <InterruptCard
                    bare
                    title="Allow file edit?"
                    description="The agent wants to write to src/routes/checkout.ts."
                    options={APPROVAL_OPTIONS}
                    onValueChange={answer}
                  />
                }
              />
            </div>
          </section>

          {/* As a link */}
          <section className={styles.section}>
            <SectionTitle title="As a link" />
            <p className={styles.demoText}>
              With an href it renders as an anchor, for entry points that
              navigate to an AI surface rather than opening one in place.
            </p>
            <div className={styles.row}>
              <AiButton label="Open the chat" icon="forum" href="#" />
            </div>
          </section>

          {/* Summary panel */}
          <section className={styles.section}>
            <SectionTitle title="Summary panel" />
            <p className={styles.demoText}>
              With a summary, hovering the button summons a frosted glass
              panel: the gradient sweeps once around its border, skeleton
              lines think for a beat, and a pre-written summary types itself
              in, once. Prompt chips launch the conversation mid-answer. The
              button and panel share one hover zone, so the pointer can
              travel between them freely; summaryPinned holds it open for
              callers with their own reveal signal, and summaryPlacement
              flips it below the button. Hover the button to try it; the
              site&rsquo;s own chat button does the same on every page that
              carries the shared chrome.
            </p>
            <div className={`${styles.row} ${styles.summaryClearance}`}>
              <AiButton
                label="Hover to summarize"
                icon="notes"
                summary={{
                  title: "The Meridian workspace rebuild",
                  caption: "6 min read",
                  text: "A fictional walkthrough of rebuilding a workspace product on token-owned foundations, with the decisions that made the difference.",
                  suggestions: [
                    { id: "deeper", label: "Go deeper on this page" },
                    { id: "decisions", label: "What were the key decisions?" },
                  ],
                }}
              />
            </div>
          </section>

          <ComponentInstallStrip slug="ai-button" />
        </main>
      </div>

    </>
  );
}
