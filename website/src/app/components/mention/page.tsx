"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import {
  Mention,
  MentionMenu,
  MentionText,
  filterMentionItems,
} from "rift-ds/components/Mention/Mention";
import type { MentionSource } from "rift-ds/components/Mention/Mention";
import { ChatMessage } from "rift-ds/components/ChatMessage/ChatMessage";
import { Composer } from "rift-ds/components/Composer/Composer";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

const people: MentionSource = {
  trigger: "@",
  label: "People and files",
  items: [
    { id: "mira", label: "Mira Castellan", description: "Design lead", icon: "person" },
    { id: "tobias", label: "Tobias Renner", description: "Platform", icon: "person" },
    { id: "ines", label: "Ines Okonjo", description: "Research", icon: "person" },
    { id: "roadmap", label: "roadmap.md", description: "Docs", icon: "description" },
    { id: "tokens", label: "tokens.css", description: "Source", icon: "description" },
  ],
};

const skills: MentionSource = {
  trigger: "/",
  label: "Skills",
  items: [
    { id: "ship", label: "ship", description: "Make finished work live" },
    { id: "super-ship", label: "super-ship", description: "Audit, then ship" },
    { id: "checkpoint", label: "checkpoint", description: "Save progress to a branch" },
    { id: "park", label: "park", description: "Shelve the work for later" },
    { id: "review", label: "review", description: "Read the diff for bugs" },
    { id: "status", label: "status", description: "Where things stand" },
    { id: "summarize", label: "summarize", description: "The thread so far, in brief" },
  ],
};

const sources = [people, skills];

const OPENING = "/ship the thread changes once @Mira Castellan has read @roadmap.md";

export default function MentionPage() {
  const [value, setValue] = React.useState("");
  const [sent, setSent] = React.useState([OPENING]);

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Mention</h1>
            <PageLinks storybookPath="/?path=/docs/components-mention--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              A name in a sentence that points at something real
            </p>
            <p className={styles.introBody}>
              Typing @ reaches for an entity, a person or a file. Typing /
              reaches for a skill. Either one opens a menu that narrows as the
              word grows, and the choice stays in the text as a tag, in the
              field while it is being written and in the message once it is
              sent.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="The tag" />
            <p className={styles.demoText}>
              A mention takes the type around it and adds a colour and a soft
              fill. The trigger character sits a step quieter than the name.
              It has no weight or spacing of its own, so it can be laid over
              the text of an input without moving a letter.
            </p>
            <p className={styles.demoSentence}>
              Ask <Mention>Mira Castellan</Mention> to look over{" "}
              <Mention>roadmap.md</Mention>, then run{" "}
              <Mention trigger="/">ship</Mention>.
            </p>
          </section>

          <section className={styles.section}>
            <SectionTitle title="The menu" />
            <p className={styles.demoText}>
              The menu never takes focus. The caret stays in the field, which
              owns the arrow keys and tells assistive technology which row is
              highlighted. Part way through a word, the typed part of each
              name holds full strength and the rest steps back.
            </p>
            <div className={styles.demoRow}>
              <MentionMenu
                items={people.items}
                activeId="mira"
                label="People and files"
              />
              <MentionMenu
                items={filterMentionItems(skills.items, "sh")}
                activeId="ship"
                query="sh"
                label="Skills"
              />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="In the Composer" />
            <p className={styles.demoText}>
              Composer wires the whole pattern through one prop. Type @ or /
              at the start of a word. Arrows move through the menu, Enter or
              Tab writes the choice, and Escape closes it. Send the message to
              see the same tags in the bubble. The value stays a plain string
              throughout: a mention is recognised wherever its exact name
              stands, and stops being one when the name is edited.
            </p>
            <div className={styles.demoColumn}>
              {sent.map((text, index) => (
                <ChatMessage key={index} role="user">
                  <MentionText text={text} sources={sources} />
                </ChatMessage>
              ))}
              <Composer
                placeholder="Type @ to mention, / for skills"
                value={value}
                onValueChange={setValue}
                onSubmit={(text) => {
                  // The demo keeps the last few turns so the stage stays one height
                  setSent((turns) => [...turns, text].slice(-3));
                  setValue("");
                }}
                mentions={sources}
              />
            </div>
          </section>

          <ComponentInstallStrip slug="mention" />
        </main>
      </div>
    </>
  );
}
