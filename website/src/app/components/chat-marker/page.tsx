"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { ChatMarker } from "@robr0/design-system/components/ChatMarker/ChatMarker";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";


export default function ChatMarkerPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Chat marker</h1>
            <PageLinks storybookPath="/?path=/docs/components-chatmarker--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              The row in a conversation that is not a message
            </p>
            <p className={styles.introBody}>
              Date breaks, joins, mode changes, system notes. A marker sits
              between two divider lines in quiet tertiary text, so the eye
              skips it while scanning turns and screen readers treat it as a
              boundary rather than a message.
            </p>
          </div>

          {/* Date breaks */}
          <section className={styles.section}>
            <SectionTitle title="Date breaks" />
            <p className={styles.demoText}>
              The most common marker. Keep the label short: a day name, a
              date, nothing more.
            </p>
            <div className={styles.stack}>
              <ChatMarker>Today</ChatMarker>
              <ChatMarker>Yesterday</ChatMarker>
              <ChatMarker>Monday, 3 August</ChatMarker>
            </div>
          </section>

          {/* System notes */}
          <section className={styles.section}>
            <SectionTitle title="System notes" />
            <p className={styles.demoText}>
              An optional leading icon gives an event a glyph. The icon is
              decorative; the label carries the meaning.
            </p>
            <div className={styles.stack}>
              <ChatMarker icon="history">Conversation resumed</ChatMarker>
              <ChatMarker icon="model_training">Model changed</ChatMarker>
              <ChatMarker icon="lock">Messages are end-to-end encrypted</ChatMarker>
            </div>
          </section>

          {/* Without lines */}
          <section className={styles.section}>
            <SectionTitle title="Without lines" />
            <p className={styles.demoText}>
              Turning the lines off keeps the label centred on the same
              geometry. Use it when markers stack close together and the rules
              would start to read as a table.
            </p>
            <div className={styles.stack}>
              <ChatMarker line={false}>Yesterday</ChatMarker>
              <ChatMarker line={false} icon="schedule">
                2:41 PM
              </ChatMarker>
            </div>
          </section>

          {/* In a conversation */}
          <section className={styles.section}>
            <SectionTitle title="In a conversation" />
            <p className={styles.demoText}>
              Markers punctuate the transcript without joining it. Events
              belong here; system messages with real content belong in a chat
              message.
            </p>
            <div className={styles.conversation}>
              <ChatMarker>Yesterday</ChatMarker>
              <p className={styles.turn}>
                Where did we land on the sidebar layout?
              </p>
              <p className={styles.turn}>
                We kept the searchable variant and parked the density work.
              </p>
              <ChatMarker icon="history">Conversation resumed</ChatMarker>
              <p className={styles.turn}>
                Picking this back up. Can you summarise the open questions?
              </p>
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
