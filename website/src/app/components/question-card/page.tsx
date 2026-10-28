"use client";

import React, { useState } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import {
  QuestionCard,
  type QuestionCardAnswer,
  type QuestionCardQuestion,
} from "rift-ds/components/QuestionCard/QuestionCard";
import { Button } from "rift-ds/components/Button/Button";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

const FRAMEWORK: QuestionCardQuestion = {
  id: "framework",
  prompt: "Which framework?",
  options: [
    { value: "next", label: "Next.js" },
    { value: "vite", label: "Vite" },
    { value: "remix", label: "Remix" },
  ],
  other: true,
};

const SURFACES: QuestionCardQuestion = {
  id: "surfaces",
  prompt: "Which parts will you use?",
  mode: "multi",
  options: [
    { value: "components", label: "Components", description: "The React library" },
    { value: "tokens", label: "Tokens", description: "The CSS custom properties alone" },
    { value: "chat", label: "The chat widget", description: "With its server handler" },
  ],
};

const THEME: QuestionCardQuestion = {
  id: "theme",
  prompt: "Which look?",
  options: [
    { value: "base", label: "The base theme" },
    { value: "preset", label: "A shipped preset" },
    { value: "own", label: "My own brand" },
  ],
};

/** A live card with its answered state, a skip when asked for, and a reset. */
function Demo({
  questions,
  skippable = false,
}: {
  questions: QuestionCardQuestion[];
  skippable?: boolean;
}) {
  const [value, setValue] = useState<QuestionCardAnswer[] | undefined>(undefined);
  /* Keyed by a counter so a reset also returns a set to its first question. */
  const [round, setRound] = useState(0);

  return (
    <div className={styles.demoColumn}>
      <QuestionCard
        key={round}
        questions={questions}
        values={value}
        onValuesChange={setValue}
        onSkip={skippable ? () => setValue([]) : undefined}
      />
      {value !== undefined && (
        <Button
          variant="secondary"
          size="compact"
          label="Reset"
          onClick={() => {
            setValue(undefined);
            setRound(round + 1);
          }}
        />
      )}
    </div>
  );
}

export default function QuestionCardPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Question card</h1>
            <PageLinks storybookPath="/?path=/docs/components-questioncard--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              The agent asks, and the answers are already there
            </p>
            <p className={styles.introBody}>
              When an agent needs a decision it can list the answers to, it
              offers them as rows under the reply that asked. One answer is a
              tap. Several are ticked and sent together. A short set is asked
              one question at a time. Once answered, the rows stay where they
              were, the pick marked and the rest dimmed, so the conversation
              keeps a record of what was chosen and what was on offer.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="One answer" />
            <p className={styles.demoText}>
              The tap is the answer. Something else opens a field in place of
              the last row, for the answer the list missed.
            </p>
            <Demo questions={[FRAMEWORK]} />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Several answers" />
            <p className={styles.demoText}>
              A question that takes several makes each row a toggle, marked
              with an empty checkbox to say so before anything is picked,
              where a one-answer question shows a radio. Send waits for the
              first pick, and a cap holds the rest once it is reached.
            </p>
            <Demo questions={[SURFACES]} />
          </section>

          <section className={styles.section}>
            <SectionTitle title="A set of questions" />
            <p className={styles.demoText}>
              A short set of questions, asked one at a time with a count beside
              the heading and a way back. A tap marks the answer and Next moves
              on, so a slip can be changed before it is passed; the last
              question sends with Send. The digits pick by position. Sent, the
              set folds to each question over its answer.
            </p>
            <Demo questions={[FRAMEWORK, SURFACES, THEME]} skippable />
          </section>

          <section className={styles.section}>
            <SectionTitle title="When the moment passes" />
            <p className={styles.demoText}>
              If the conversation moves on without an answer, the card stays
              on screen, dimmed and inert, with a line saying it was not
              answered. A skipped card says that instead.
            </p>
            <div className={styles.stack}>
              <QuestionCard questions={[FRAMEWORK]} disabled />
            </div>
          </section>

          <ComponentInstallStrip slug="question-card" />
        </main>
      </div>
    </>
  );
}
