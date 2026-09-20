"use client";

import React, { useState } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { ToolCall } from "@robr0/design-system/components/ToolCall/ToolCall";
import { Button } from "@robr0/design-system/components/Button/Button";
import { CodeBlock } from "@robr0/design-system/components/CodeBlock/CodeBlock";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import { MOTION_AUTOPLAY_INTERVAL_MS } from "@robr0/design-system/tokens/motion";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";


const GREP_ARGS = `{
  "path": "src/tokens/tokens-light.css",
  "pattern": "--color-status-"
}`;

const WRITE_ARGS = `{
  "path": "src/components/Button/Button.tsx",
  "bytes": 4182
}`;

/**
 * A run replayed as a log: calls appear in order, each running briefly
 * before settling. The log surface is a composition, not a component —
 * ToolCall is the line, and an ordinary list is the container.
 */
function LiveRunDemo() {
  const script = React.useMemo(
    () => [
      { name: "read_file", summary: "src/tokens/tokens-light.css", duration: "0.1s" },
      { name: "grep", summary: "--color-status-", duration: "0.4s" },
      { name: "write_file", summary: "src/components/Button/Button.css", duration: "0.2s" },
      { name: "run_tests", summary: "npm run test", duration: "8.1s" },
    ],
    []
  );
  const [revealed, setRevealed] = useState(0);
  const timer = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const play = () => {
    setRevealed(0);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setRevealed((current) => {
        if (current >= script.length) {
          if (timer.current) clearInterval(timer.current);
          return current;
        }
        return current + 1;
      });
    }, MOTION_AUTOPLAY_INTERVAL_MS / 4);
  };

  React.useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-sm)", alignItems: "flex-start", width: "100%" }}>
      <Button variant="secondary" size="compact" label={revealed === 0 ? "Play the run" : "Replay"} onClick={play} />
      {script.slice(0, revealed).map((call, index) => (
        <ToolCall
          key={call.name}
          name={call.name}
          summary={call.summary}
          status={index === revealed - 1 && revealed < script.length ? "running" : "success"}
          duration={index === revealed - 1 && revealed < script.length ? undefined : call.duration}
          style={{ alignSelf: "stretch" }}
        />
      ))}
    </div>
  );
}

/** The approval flow, so the pending state can actually be answered. */
function ApprovalDemo() {
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");

  return (
    <ToolCall
      name="write_file"
      status={status}
      summary="src/components/Button/Button.tsx"
      duration={status === "pending" ? undefined : "0.2s"}
      actions={
        status === "pending" ? (
          <>
            <Button
              variant="secondary"
              size="compact"
              label="Deny"
              onClick={() => setStatus("error")}
            />
            <Button
              variant="primary"
              size="compact"
              label="Allow"
              onClick={() => setStatus("success")}
            />
          </>
        ) : (
          <Button
            variant="secondary"
            size="compact"
            label="Reset"
            onClick={() => setStatus("pending")}
          />
        )
      }
    >
      <CodeBlock code={WRITE_ARGS} language="json" />
    </ToolCall>
  );
}

export default function ToolCallPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Tool call</h1>
            <PageLinks storybookPath="/?path=/docs/components-toolcall--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>What ran, how it went, what it returned</p>
            <p className={styles.introBody}>
              A run is mostly a list of these. So the collapsed header carries
              everything needed to skim it (the tool, the target, the outcome,
              the time), and the body carries everything needed to audit it.
            </p>
          </div>

          {/* Statuses */}
          <section className={styles.section}>
            <SectionTitle title="Statuses" />
            <p className={styles.demoText}>
              The container stays neutral, so a long run reads as a list rather
              than a wall of tinted cards. The status word and its icon carry
              the state; the border never changes.
            </p>
            <div className={styles.stack}>
              <ToolCall name="read_file" summary="package.json" duration="0.1s" />
              <ToolCall name="bash" summary="npm run lint" status="running" />
              <ToolCall
                name="write_file"
                summary="src/app/page.tsx"
                status="pending"
              />
              <ToolCall
                name="fetch"
                summary="https://api.example.com/v2/users"
                status="error"
                duration="1.1s"
              >
                ENOENT: no such file or directory
              </ToolCall>
            </div>
          </section>

          {/* Detail */}
          <section className={styles.section}>
            <SectionTitle title="Arguments and result" />
            <p className={styles.demoText}>
              Pass the call&apos;s detail as children and the header becomes a
              disclosure. With nothing to disclose it renders as a plain row
              instead: a row that cannot open should not look pressable.
            </p>
            <div className={styles.stack}>
              <ToolCall
                name="grep"
                summary="--color-status- in tokens-light.css"
                duration="0.4s"
                defaultOpen
              >
                <CodeBlock code={GREP_ARGS} language="json" />
              </ToolCall>
            </div>
          </section>

          {/* Approval */}
          <section className={styles.section}>
            <SectionTitle title="Waiting on a person" />
            <p className={styles.demoText}>
              Approval controls render outside the collapsible panel. Someone
              deciding whether to allow a write should not have to expand the
              call to find the button, and someone who wants to check the
              arguments first can still open it.
            </p>
            <ApprovalDemo />
          </section>

          {/* Live run */}
          <section className={styles.section}>
            <SectionTitle title="A live run" />
            <p className={styles.demoText}>
              The log surface is a composition, not a component: tool call is
              the line, and an ordinary list is the container. Play the run
              and the calls appear in order, each running briefly before it
              settles.
            </p>
            <LiveRunDemo />
          </section>
        </main>
      </div>

    </>
  );
}
