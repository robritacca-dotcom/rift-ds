"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { SourceTrail } from "@robr0/design-system/components/SourceTrail/SourceTrail";
import { Reasoning } from "@robr0/design-system/components/Reasoning/Reasoning";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

export default function SourceTrailPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Source trail</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-sourcetrail--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Where the answer came from
            </p>
            <p className={styles.introBody}>
              An agent that researches should show its working. The source
              trail lists what it opened, in order, each row a source chip
              with a status and a note on what the source contributed. A long
              trail collapses to one line, so the receipts are there without
              crowding the answer.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <div className={styles.variantStack} style={{ alignItems: "stretch", maxWidth: "520px" }}>
              <SourceTrail
                items={[
                  { title: "Design tokens quarterly", icon: "article", detail: "The three-tier token architecture" },
                  { title: "Colour contrast working group notes", icon: "article", detail: "AA pairings for the action colour" },
                  { title: "Component API changelog", icon: "history", detail: "When the convenience callbacks landed" },
                ]}
              />
            </div>
          </section>

          {/* Streaming */}
          <section className={styles.section}>
            <SectionTitle title="Streaming" />
            <p className={styles.introBody}>
              Mid-research, the header counts and spins, the active row
              carries its own spinner, and sources the agent has queued but
              not opened sit quiet. Appended rows ease in; the motion is pure
              CSS, so reduced motion stills it.
            </p>
            <div className={styles.variantStack} style={{ alignItems: "stretch", maxWidth: "520px" }}>
              <SourceTrail
                streaming
                items={[
                  { title: "Design tokens quarterly", icon: "article", status: "done" },
                  { title: "Colour contrast working group notes", icon: "article", status: "active" },
                  { title: "Component API changelog", icon: "history", status: "pending" },
                ]}
              />
            </div>
          </section>

          {/* In a research answer */}
          <section className={styles.section}>
            <SectionTitle title="In a research answer" />
            <p className={styles.introBody}>
              The trail pairs with reasoning: the thinking collapses above,
              the sources settle below, and both fold away once read.
            </p>
            <div className={styles.variantStack} style={{ alignItems: "stretch", maxWidth: "520px" }}>
              <Reasoning label="Compared the token docs against the changelog" duration={12}>
                The token architecture pages agree on the three-tier rule;
                the changelog dates the convenience callbacks to the same
                release that documented them.
              </Reasoning>
              <SourceTrail
                defaultOpen={false}
                items={[
                  { title: "Design tokens quarterly", status: "done" },
                  { title: "Colour contrast working group notes", status: "done" },
                  { title: "Component API changelog", status: "done" },
                  { title: "Release notes archive", status: "done" },
                ]}
              />
            </div>
          </section>

          {/* Linking out */}
          <section className={styles.section}>
            <SectionTitle title="Linking out" />
            <p className={styles.introBody}>
              A row with an href renders its chip as a link and opens in a
              new tab, so checking a source never abandons the conversation.
            </p>
            <div className={styles.variantStack} style={{ alignItems: "stretch", maxWidth: "520px" }}>
              <SourceTrail
                title="Sources for this answer"
                items={[
                  { title: "Design tokens quarterly", icon: "link", href: "https://example.com/tokens" },
                  { title: "Colour contrast working group notes", icon: "link", href: "https://example.com/contrast" },
                ]}
              />
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
