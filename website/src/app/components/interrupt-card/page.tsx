"use client";

import React, { useState } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { InterruptCard } from "rift-ds/components/InterruptCard/InterruptCard";
import { ToolCall } from "rift-ds/components/ToolCall/ToolCall";
import { Button } from "rift-ds/components/Button/Button";
import { CodeBlock } from "rift-ds/components/CodeBlock/CodeBlock";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";


const APPROVAL_OPTIONS = [
  { value: "allow-once", label: "Allow once", variant: "primary" as const },
  { value: "allow-always", label: "Always allow" },
  { value: "deny", label: "Deny" },
];

const WRITE_ARGS = `{
  "path": "src/routes/checkout.ts",
  "bytes": 2048
}`;

/** The full loop: choose an option, see the answered state, reset. */
function DecisionDemo() {
  const [value, setValue] = useState<string | undefined>(undefined);

  return (
    <div className={styles.demoColumn}>
      <InterruptCard
        title="Allow file edit?"
        description="The agent wants to write to src/routes/checkout.ts."
        options={APPROVAL_OPTIONS}
        value={value}
        onValueChange={setValue}
      />
      {value !== undefined && (
        <Button
          variant="secondary"
          size="compact"
          label="Reset"
          onClick={() => setValue(undefined)}
        />
      )}
    </div>
  );
}

export default function InterruptCardPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Interrupt card</h1>
            <PageLinks storybookPath="/?path=/docs/components-interruptcard--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              The agent stops and asks before it acts
            </p>
            <p className={styles.introBody}>
              A human-in-the-loop checkpoint: a question, some context, and
              option buttons to decide. The card stays deliberately quiet
              while it waits, one tone behind a regular border, because the
              question itself is the signal. Once answered, the footer echoes
              the choice.
            </p>
          </div>

          {/* Anatomy */}
          <section className={styles.section}>
            <SectionTitle title="The question" />
            <p className={styles.demoText}>
              A title that asks, one line of context, and the choices left to
              right. Mark the recommended option primary so there is a
              default to reach for.
            </p>
            <div className={styles.stack}>
              <InterruptCard
                title="Allow file edit?"
                description="The agent wants to write to src/routes/checkout.ts."
                options={APPROVAL_OPTIONS}
              />
            </div>
          </section>

          {/* With a tool call */}
          <section className={styles.section}>
            <SectionTitle title="With a tool call" />
            <p className={styles.demoText}>
              The detail slot holds whatever the decision covers. The
              intended pairing is a pending tool call, so the person can open
              the arguments before answering.
            </p>
            <div className={styles.stack}>
              <InterruptCard
                title="Allow file edit?"
                description="Review the call, then decide."
                options={APPROVAL_OPTIONS}
              >
                <ToolCall
                  name="write_file"
                  status="pending"
                  summary="src/routes/checkout.ts"
                >
                  <CodeBlock code={WRITE_ARGS} language="json" />
                </ToolCall>
              </InterruptCard>
            </div>
          </section>

          {/* Deciding */}
          <section className={styles.section}>
            <SectionTitle title="Deciding" />
            <p className={styles.demoText}>
              The card is fully controlled: it reports the choice and the
              consumer renders it back. Pick an option to see the answered
              state, where the buttons give way to the chosen label echoed
              in the footer.
            </p>
            <DecisionDemo />
          </section>

          {/* Danger options */}
          <section className={styles.section}>
            <SectionTitle title="Destructive options" />
            <p className={styles.demoText}>
              A destructive approval takes <code>tone: &quot;destructive&quot;</code>, which renders
              the destructive button. The card itself stays quiet either way,
              because the state is still the same: waiting on a person.
            </p>
            <div className={styles.stack}>
              <InterruptCard
                title="Delete 3 files?"
                description="This removes the generated fixtures and cannot be undone."
                options={[
                  { value: "delete", label: "Delete", variant: "secondary", tone: "destructive" },
                  { value: "cancel", label: "Cancel" },
                ]}
              />
            </div>
          </section>

          {/* Bare */}
          <section className={styles.section}>
            <SectionTitle title="Inside another panel" />
            <p className={styles.demoText}>
              With bare, the card drops its own fill, border and corners and
              keeps only its padding and layout, so it reads as the panel it
              sits in, with one border. AI button&apos;s request panel is the
              host it exists for.
            </p>
            <div className={styles.stack}>
              <div
                style={{
                  maxWidth: 360,
                  borderRadius: "var(--radius-600)",
                  border: "var(--border-025) solid var(--color-bg-container-border)",
                  background: "var(--color-bg-glass)",
                  boxShadow: "var(--shadow-floating)",
                }}
              >
                <InterruptCard
                  bare
                  title="Allow file edit?"
                  description="The agent wants to write to src/routes/checkout.ts."
                  options={[
                    { value: "allow-once", label: "Allow once", variant: "primary" },
                    { value: "deny", label: "Deny" },
                  ]}
                />
              </div>
            </div>
          </section>

          <ComponentInstallStrip slug="interrupt-card" />
        </main>
      </div>

    </>
  );
}
