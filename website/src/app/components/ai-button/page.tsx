"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { AiButton } from "@robr0/design-system/components/AiButton/AiButton";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";


export default function AiButtonPage() {
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
              teal, and this ring marks the surfaces where an AI responds, so
              neither affordance dilutes the other. This site&rsquo;s own chat
              opens from one.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <p className={styles.demoText}>
              The resting state is quiet: a thin gradient ring and a low glow.
              Hover raises the glow; the ring turns on its own uneven cadence,
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
        </main>
      </div>

    </>
  );
}
