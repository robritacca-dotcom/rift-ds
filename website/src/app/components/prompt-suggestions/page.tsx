"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { PromptSuggestions } from "rift-ds/components/PromptSuggestions/PromptSuggestions";
import { ChatMessage } from "rift-ds/components/ChatMessage/ChatMessage";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";


export default function PromptSuggestionsPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Prompt suggestions</h1>
            <PageLinks storybookPath="/?path=/docs/components-promptsuggestions--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              A row of tappable prompts to start or steer a conversation
            </p>
            <p className={styles.introBody}>
              As a row, each suggestion is a clickable chip, so one component
              owns the pill look. The row scrolls sideways with pure CSS edge
              fades, wraps into a block for empty-state hero placements, or
              stacks one per line for narrow columns. For an empty-state home
              screen the same suggestions lay out as tiles or cards, with a
              line of description under each. Tapping a suggestion fires a
              callback with its stable id, never its display text.
            </p>
          </div>

          {/* The row */}
          <section className={styles.section}>
            <SectionTitle title="The row" />
            <p className={styles.demoText}>
              A single line of suggestions. Icons are optional and the label
              carries the meaning; keep each prompt short enough to read in
              a glance.
            </p>
            <div className={styles.stack}>
              <PromptSuggestions
                suggestions={[
                  { id: "trip", label: "Plan a weekend trip" },
                  { id: "recipe", label: "Suggest a dinner recipe" },
                  { id: "email", label: "Draft a polite follow-up" },
                ]}
              />
              <PromptSuggestions
                suggestions={[
                  { id: "ideas", label: "Brainstorm ideas", icon: "lightbulb" },
                  { id: "summarise", label: "Summarise a document", icon: "description" },
                  { id: "translate", label: "Translate a phrase", icon: "translate" },
                ]}
              />
            </div>
          </section>

          {/* Size */}
          <section className={styles.section}>
            <SectionTitle title="Size" />
            <p className={styles.demoText}>
              The default row sits at the body-paragraph scale, so a
              suggestion reads at the same weight as the message it will
              become. Compact drops a step for rows that sit alongside a live
              conversation, where the suggestions are a side offer rather
              than the main event.
            </p>
            <div className={styles.stack}>
              <PromptSuggestions
                suggestions={[
                  { id: "trip", label: "Plan a weekend trip" },
                  { id: "recipe", label: "Suggest a dinner recipe" },
                ]}
              />
              <PromptSuggestions
                size="compact"
                suggestions={[
                  { id: "shorter", label: "Make it shorter" },
                  { id: "formal", label: "More formal" },
                  { id: "example", label: "Give an example" },
                ]}
              />
            </div>
          </section>

          {/* Overflow and fades */}
          <section className={styles.section}>
            <SectionTitle title="Overflow and fades" />
            <p className={styles.demoText}>
              When the row overflows, a CSS mask fades the edges out as the
              hint that there is more to scroll. No scroll listeners, no
              measurement: the gradient does all the work.
            </p>
            <div className={styles.narrow}>
              <PromptSuggestions
                suggestions={[
                  { id: "trip", label: "Plan a weekend trip" },
                  { id: "recipe", label: "Suggest a dinner recipe" },
                  { id: "quiz", label: "Quiz me on capitals" },
                  { id: "poem", label: "Write a short poem" },
                  { id: "budget", label: "Sketch a monthly budget" },
                  { id: "workout", label: "Build a workout plan" },
                ]}
              />
            </div>
          </section>

          {/* Wrapped */}
          <section className={styles.section}>
            <SectionTitle title="Wrapped" />
            <p className={styles.demoText}>
              The wrap variant trades scrolling for multiple lines. Use it in
              an empty conversation, where the suggestions are the main event
              and everything should be visible at once.
            </p>
            <div className={styles.hero}>
              <p className={styles.heroPrompt}>
                What would you like to do today?
              </p>
              <PromptSuggestions
                layout="wrap"
                style={{ justifyContent: "center" }}
                suggestions={[
                  { id: "ideas", label: "Brainstorm ideas", icon: "lightbulb" },
                  { id: "summarise", label: "Summarise a document", icon: "description" },
                  { id: "translate", label: "Translate a phrase", icon: "translate" },
                  { id: "trip", label: "Plan a weekend trip", icon: "flight" },
                  { id: "recipe", label: "Suggest a dinner recipe", icon: "restaurant" },
                ]}
              />
            </div>
          </section>

          {/* Stacked */}
          <section className={styles.section}>
            <SectionTitle title="Stacked" />
            <p className={styles.demoText}>
              One suggestion per line. In a narrow column a wrapped row
              breaks wherever the labels happen to run out of room, and the
              ragged edge reads as an accident rather than a list. The pills
              still hug their labels: stretching them to a shared width would
              make a set of prompts look like a set of buttons.
            </p>
            <div className={styles.narrow}>
              <PromptSuggestions
                layout="stack"
                suggestions={[
                  { id: "philosophy", label: "Describe the system's design philosophy" },
                  { id: "recent", label: "What shipped in the latest release?" },
                  { id: "system", label: "How does this design system work?" },
                ]}
              />
            </div>
          </section>

          {/* Tiles */}
          <section className={styles.section}>
            <SectionTitle title="Tiles" />
            <p className={styles.demoText}>
              An even row of quiet blocks, each an icon over its label and a
              line saying what it leads to. Tiles answer the pointer in
              place: the fill firms up and the border darkens. The row folds
              to fewer columns as it narrows.
            </p>
            <PromptSuggestions
              layout="tiles"
              suggestions={[
                { id: "components", icon: "widgets", label: "Components", description: "Browse the library" },
                { id: "tokens", icon: "palette", label: "Tokens", description: "Colour, type and space" },
                { id: "themes", icon: "tune", label: "Themes", description: "Every shipped look" },
                { id: "start", icon: "rocket_launch", label: "Get started", description: "Install and theme" },
              ]}
            />
          </section>

          {/* Cards */}
          <section className={styles.section}>
            <SectionTitle title="Cards" />
            <p className={styles.demoText}>
              Each suggestion under a tinted cover that holds its icon, with
              the label over the question it asks. The covers take the pixel
              inks in turn, so a row is told apart by colour as well as by
              title, and a card lifts on hover the way a navigation tile
              does.
            </p>
            <PromptSuggestions
              layout="cards"
              suggestions={[
                {
                  id: "philosophy",
                  icon: "lightbulb",
                  label: "The philosophy",
                  description: "Describe the system's design philosophy.",
                },
                {
                  id: "recent",
                  icon: "new_releases",
                  label: "What is new",
                  description: "What shipped in the latest release?",
                },
                {
                  id: "system",
                  icon: "account_tree",
                  label: "How it works",
                  description: "How does this design system work?",
                },
              ]}
            />
          </section>

          {/* Pending */}
          <section className={styles.section}>
            <SectionTitle title="Pending" />
            <p className={styles.demoText}>
              While the suggestions are being generated, placeholder pills
              hold their place: the chip&apos;s real shell, with a shimmer
              bar where the label is still being written. The shell keeps
              the row&apos;s exact height, so nothing shifts when the chips
              land. Screen readers hear a busy list, not a set of empty
              items.
            </p>
            <div className={styles.narrow}>
              <PromptSuggestions
                layout="stack"
                pending
                suggestions={[]}
                ariaLabel="Suggestions loading"
              />
            </div>
          </section>

          {/* Steering mid-conversation */}
          <section className={styles.section}>
            <SectionTitle title="Steering mid-conversation" />
            <p className={styles.demoText}>
              After an answer, a short row of follow-ups keeps the thread
              moving without making anyone type. The chips read as options,
              not as messages, because the list sits outside the transcript.
            </p>
            <div className={styles.conversation}>
              <ChatMessage role="user" author="You" timestamp="2:41 PM">
                Compare the two routes for the morning commute.
              </ChatMessage>
              <ChatMessage author="Assistant" timestamp="2:41 PM">
                The riverside route is two minutes slower but far more
                reliable in the rain. The highway route wins only on dry
                days with light traffic.
              </ChatMessage>
              <PromptSuggestions
                size="compact"
                suggestions={[
                  { id: "rain", label: "Which is better in the rain?" },
                  { id: "cycle", label: "Add a cycling option" },
                  { id: "save", label: "Save this comparison" },
                ]}
              />
            </div>
          </section>

          <ComponentInstallStrip slug="prompt-suggestions" />
        </main>
      </div>

    </>
  );
}
