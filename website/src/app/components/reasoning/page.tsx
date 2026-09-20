"use client";

import React, { useEffect, useState } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Reasoning } from "@robr0/design-system/components/Reasoning/Reasoning";
import { AgentStatus } from "@robr0/design-system/components/AgentStatus/AgentStatus";
import { Button } from "@robr0/design-system/components/Button/Button";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";


const TRACE = `The request asks for the total across both regions, but the two
tables report in different currencies. I need to convert before summing, and
the rate should be the one on the invoice date rather than today's. Otherwise
the November figures move every time the report is re-run.`;

/** Runs a stream and settles into a duration, so the transition is visible on the page. */
function StreamDemo() {
  const [streaming, setStreaming] = useState(false);
  const [duration, setDuration] = useState<number | undefined>(9);

  useEffect(() => {
    if (!streaming) return;
    const timer = setTimeout(() => {
      setStreaming(false);
      setDuration(9);
    }, 4000);
    return () => clearTimeout(timer);
  }, [streaming]);

  const start = () => {
    setDuration(undefined);
    setStreaming(true);
  };

  return (
    <div className={styles.stack}>
      <Button
        variant="secondary"
        size="compact"
        onClick={start}
        disabled={streaming}
        label={streaming ? "Thinking" : "Run it again"}
      />
      <Reasoning streaming={streaming} duration={duration}>
        {TRACE}
      </Reasoning>
    </div>
  );
}

export default function ReasoningPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Reasoning</h1>
            <PageLinks storybookPath="/?path=/docs/components-reasoning--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>Thinking, without it taking over</p>
            <p className={styles.introBody}>
              A model&apos;s reasoning trace is useful and long. Reasoning gives
              it somewhere to go: open while it streams in, collapsed to a
              one-line summary once it finishes, and quiet enough throughout
              that it never competes with the answer beside it.
            </p>
          </div>

          {/* Live */}
          <section className={styles.section}>
            <SectionTitle title="Streaming, then settled" />
            <p className={styles.demoText}>
              While the trace arrives, the panel is open and the summary
              shimmers. When the stream ends it collapses to the time it took.
            </p>
            <StreamDemo />
          </section>

          {/* Resting */}
          <section className={styles.section}>
            <SectionTitle title="The resting state" />
            <p className={styles.demoText}>
              Collapsed by default once complete. With no duration to report,
              the summary falls back to a plain label; pass{" "}
              <code className={styles.code}>label</code> to say something more
              specific than how long it took.
            </p>
            <div className={styles.stack}>
              <Reasoning duration={12}>{TRACE}</Reasoning>
              <Reasoning>{TRACE}</Reasoning>
              <Reasoning label="Checked the currency conversion" duration={8}>
                {TRACE}
              </Reasoning>
            </div>
          </section>

          {/* Expanded */}
          <section className={styles.section}>
            <SectionTitle title="Expanded" />
            <p className={styles.demoText}>
              The trace sits on a rail in secondary text. It is deliberately
              plainer than the response it belongs to: the reader came for the
              answer, and opened this only to check the working.
            </p>
            <Reasoning duration={4} defaultOpen>
              {TRACE}
            </Reasoning>
          </section>

          {/* Sizes */}
          <section className={styles.section}>
            <SectionTitle title="Sizes" />
            <p className={styles.demoText}>
              The scale pairs with ChatMessage: the default size matches
              default message text, and{" "}
              <code className={styles.code}>size=&quot;compact&quot;</code>{" "}
              matches compact message text, so the trace never outweighs the
              answer beside it.
            </p>
            <div className={styles.stack}>
              <Reasoning duration={12} defaultOpen>
                {TRACE}
              </Reasoning>
              <Reasoning size="compact" duration={12} defaultOpen>
                {TRACE}
              </Reasoning>
            </div>
          </section>

          {/* Summary only */}
          <section className={styles.section}>
            <SectionTitle title="When there is no trace" />
            <p className={styles.demoText}>
              Not every model hands back reasoning to read. With nothing
              behind the line,{" "}
              <code className={styles.code}>summaryOnly</code>{" "}
              drops the chevron, the trigger, and the panel: a disclosure that opens
              onto nothing is a promise the component cannot keep. The line
              keeps the trigger&rsquo;s own geometry, so a trace arriving
              mid-response promotes it to a real disclosure without moving
              anything.
            </p>
            <Reasoning
              streaming
              summaryOnly
              summary={<AgentStatus state="working" label="Reading the site" />}
            />
          </section>

          {/* Behaviour */}
          <section className={styles.section}>
            <SectionTitle title="Two decisions worth knowing" />
            <p className={styles.demoText}>
              <strong>The auto-collapse yields to the reader.</strong> Opening
              on stream and closing on completion is right until someone opens
              the panel themselves. After that, the stream ending no longer
              moves it. A panel that shuts while you are reading it is worse
              than one that stays open.
            </p>
            <p className={styles.demoText}>
              <strong>Only the summary is a live region.</strong> A trace
              announced token by token floods a screen reader. The body is
              ordinary expandable content and the announcement covers the
              boundaries instead: thinking, then thought for so long.
            </p>
          </section>
        </main>
      </div>

    </>
  );
}
