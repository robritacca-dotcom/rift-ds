"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { StatusDot } from "@robr0/design-system/components/StatusDot/StatusDot";
import { Avatar } from "@robr0/design-system/components/Avatar/Avatar";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

export default function StatusDotPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Status dot</h1>
            <PageLinks storybookPath="/?path=/docs/components-statusdot--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              The smallest possible status
            </p>
            <p className={styles.introBody}>
              Where Badge carries a text label on a tinted fill, the status dot is the mark alone: a dot in one of the five status roles, for table rows, avatars, and nav items where a full badge is too loud. An optional pulse says something is live right now.
            </p>
          </div>

          {/* Variants */}
          <section className={styles.section}>
            <SectionTitle title="Variants" />
            <div className={styles.variantRow}>
              <StatusDot variant="info" label="Syncing" />
              <StatusDot variant="positive" label="Operational" />
              <StatusDot variant="warning" label="Degraded" />
              <StatusDot variant="error" label="Down" />
              <StatusDot variant="neutral" label="Offline" />
            </div>
          </section>

          {/* Sizes */}
          <section className={styles.section}>
            <SectionTitle title="Sizes" />
            <div className={styles.variantRow}>
              <StatusDot variant="positive" size="sm" label="Small" />
              <StatusDot variant="positive" size="md" label="Medium" />
              <StatusDot variant="positive" size="lg" label="Large" />
            </div>
          </section>

          {/* Pulse */}
          <section className={styles.section}>
            <SectionTitle title="Pulse" />
            <p className={styles.sectionNote}>
              The pulse radiates a ring of the dot&apos;s own colour, for the states that are happening as the visitor watches: recording, online now, a deploy in flight. It stills under reduced motion.
            </p>
            <div className={styles.variantRow}>
              <StatusDot variant="info" pulse label="Deploying" />
              <StatusDot variant="positive" pulse label="Live" />
              <StatusDot variant="error" pulse label="Recording" />
            </div>
          </section>

          {/* In context */}
          <section className={styles.section}>
            <SectionTitle title="In context" />
            <p className={styles.sectionNote}>
              A bare dot beside an avatar or a row label leans on its neighbour for meaning; pass an aria-label so a screen reader hears what the colour says.
            </p>
            <div className={styles.presenceRow}>
              {[
                { name: "Ada Fielding", state: "positive" as const, word: "Online" },
                { name: "Noor Casey", state: "warning" as const, word: "Away" },
                { name: "Jules Marr", state: "neutral" as const, word: "Offline" },
              ].map(({ name, state, word }) => (
                <div key={name} className={styles.presenceItem}>
                  <Avatar name={name} size="md" />
                  <div className={styles.presenceMeta}>
                    <span className={styles.presenceName}>{name}</span>
                    <StatusDot variant={state} size="sm" label={word} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
