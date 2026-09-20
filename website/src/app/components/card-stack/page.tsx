"use client";

import React, { useState } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { CardStack } from "@robr0/design-system/components/CardStack/CardStack";
import { Card } from "@robr0/design-system/components/Card/Card";
import { Badge } from "@robr0/design-system/components/Badge/Badge";
import { Button } from "@robr0/design-system/components/Button/Button";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

const roles = [
  { title: "Prompt Engineer", rate: "$120/hr", org: "Anthropic" },
  { title: "ML Engineer", rate: "$135/hr", org: "Perplexity" },
  { title: "LLM Platform Engineer", rate: "$130-160/hr", org: "Google" },
  { title: "Research Engineer", rate: "$140/hr", org: "DeepMind" },
];

// Passed as an array, not a fragment: the stack counts its children,
// and a fragment would read as one card.
const roleCards = roles.map((role) => (
  <Card key={role.title} title={role.title}>
    <div className={styles.roleBody}>
      <Badge variant="neutral" label={role.rate} />
      <span className={styles.roleOrg}>{role.org}</span>
    </div>
  </Card>
));

export default function CardStackPage() {
  const [index, setIndex] = useState(0);

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Card stack</h1>
            <PageLinks storybookPath="/?path=/docs/components-cardstack--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              One card at a time, the rest waiting underneath
            </p>
            <p className={styles.introBody}>
              A deck for browsing a set one item at a time: roles, prompts,
              flashcards, anything worth a considered look. Click the top card
              and it lifts up and away while the next one rises into place;
              arrow keys flip it from the keyboard. The stack is the pattern,
              not the cards: it takes any children, and Card is the intended
              filling.
            </p>
          </div>

          <section className={`${styles.section} animate-in animate-delay-2`}>
            <SectionTitle title="Default" />
            <p className={styles.sectionBody}>
              Two edges peek out behind the top card, and the deck loops, so
              flipping never hits a wall. Click the card, or focus the stack
              and use the arrow keys.
            </p>
            <div className={styles.deckRow}>
              <CardStack label="Open roles" className={styles.deck}>
                {roleCards}
              </CardStack>
            </div>
          </section>

          <section className={`${styles.section} animate-in animate-delay-3`}>
            <SectionTitle title="Controlled" />
            <p className={styles.sectionBody}>
              <code>index</code>, <code>defaultIndex</code> and{" "}
              <code>onIndexChange</code> follow the usual controlled pair, so
              external controls and the deck itself stay one position.
            </p>
            <div className={styles.deckRow}>
              <CardStack
                label="Open roles, controlled"
                index={index}
                onIndexChange={setIndex}
                className={styles.deck}
              >
                {roleCards}
              </CardStack>
            </div>
            <div className={styles.deckControls}>
              <Button
                label="Previous"
                variant="secondary"
                size="compact"
                onClick={() => setIndex((index + roles.length - 1) % roles.length)}
              />
              <span className={styles.deckPosition}>
                {index + 1} of {roles.length}
              </span>
              <Button
                label="Next"
                variant="secondary"
                size="compact"
                onClick={() => setIndex((index + 1) % roles.length)}
              />
            </div>
          </section>

          <section className={`${styles.section} animate-in animate-delay-4`}>
            <SectionTitle title="Depth" />
            <p className={styles.sectionBody}>
              <code>peek</code> sets how many edges show behind the top card.
              Zero makes a clean single card that still flips; three reads as
              a taller pile.
            </p>
            <div className={styles.deckRow}>
              <div className={styles.exampleCell}>
                <span className={styles.exampleLabel}>peek=0</span>
                <CardStack label="Flat deck" peek={0} className={styles.deck}>
                  {roleCards}
                </CardStack>
              </div>
              <div className={styles.exampleCell}>
                <span className={styles.exampleLabel}>peek=3</span>
                <CardStack label="Deep deck" peek={3} className={styles.deck}>
                  {roleCards}
                </CardStack>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
