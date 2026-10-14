"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { ArtifactCard } from "rift-ds/components/ArtifactCard/ArtifactCard";
import { ArtifactPanel } from "rift-ds/components/ArtifactPanel/ArtifactPanel";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

/* Demo data: Fernway Trails is a fictional walking club, and every artifact
   named below is invented set dressing. */

const ROUTE_CODE = `export const routes = [
  { name: "Heron Loop", km: 9 },
  { name: "Quarry Rise", km: 14 },
];`;

function Toggle() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className={styles.cardStage}>
      <ArtifactCard
        title="Trail report"
        meta="Dashboard"
        icon="dashboard"
        open={open}
        onClick={() => setOpen((current) => !current)}
      />
    </div>
  );
}

function WithPanel() {
  const [open, setOpen] = React.useState(true);
  return (
    <div className={`${styles.panelFrame} ${styles.panelFrameShort}`} data-anchor-ignore>
      <div className={styles.cardColumn}>
        <ArtifactCard
          title="routes.ts"
          meta="TypeScript"
          icon="code"
          open={open}
          onClick={() => setOpen((current) => !current)}
        />
      </div>
      {open && (
        <div className={styles.cardPanel}>
          <ArtifactPanel
            title="routes.ts"
            meta="TypeScript"
            icon="code"
            code={ROUTE_CODE}
            language="typescript"
            onClose={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  );
}

export default function ArtifactCardPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Artifact card</h1>
            <PageLinks storybookPath="/?path=/docs/components-artifactcard--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>What the chat made, in the thread</p>
            <p className={styles.introBody}>
              Artifact card is the tile a reply leaves in the conversation
              for something too big for a turn: a dashboard, a page, a file.
              It names the artifact and opens it in an Artifact panel. The
              card is a toggle button, so the host holds one piece of state,
              whether the artifact is open, and the card shows which.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="A toggle" />
            <p className={styles.demoText}>
              Press the card to open its artifact and press it again to
              close. Open, it holds a fill, its cue turns from open to close,
              and it announces itself as pressed. The card keeps no state of
              its own: open and onClick are the whole contract.
            </p>
            <Toggle />
          </section>

          <section className={styles.section}>
            <SectionTitle title="With its panel" />
            <p className={styles.demoText}>
              The card and the panel share a title, a meta line and an icon,
              so the two read as one thing in two places. Here the card and
              the panel’s own close button drive the same state.
            </p>
            <WithPanel />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Content" />
            <p className={styles.demoText}>
              The meta line and the icon are optional; without an icon the
              card draws a document mark. A long title ends in an ellipsis
              and the card keeps its width. Disabled, it dims and stops
              taking presses.
            </p>
            <div className={styles.cardStage}>
              <ArtifactCard title="Untitled document" />
              <ArtifactCard
                title="Spring walk sign-up page, second draft with the committee's comments"
                meta="Page · Version 2"
                icon="web"
              />
              <ArtifactCard title="Trail report" meta="Dashboard" icon="dashboard" disabled />
            </div>
          </section>

          <ComponentInstallStrip slug="artifact-card" />
        </main>
      </div>
    </>
  );
}
