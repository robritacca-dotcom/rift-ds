"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { MessageCard } from "@robr0/design-system/components/MessageCard/MessageCard";
import { AreaChart } from "@robr0/design-system/components/Chart/AreaChart";
import { ChatMessage } from "@robr0/design-system/components/ChatMessage/ChatMessage";
import { Avatar } from "@robr0/design-system/components/Avatar/Avatar";
import { Button } from "@robr0/design-system/components/Button/Button";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";


const signupData = [
  { day: "Mon", signups: 210 },
  { day: "Tue", signups: 260 },
  { day: "Wed", signups: 240 },
  { day: "Thu", signups: 380 },
  { day: "Fri", signups: 300 },
  { day: "Sat", signups: 150 },
  { day: "Sun", signups: 120 },
];

export default function MessageCardPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Message card</h1>
            <PageLinks storybookPath="/?path=/docs/components-messagecard--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Structured rich content inside a chat turn
            </p>
            <p className={styles.introBody}>
              Link previews, search results, booking-style responses. A
              message card gives rich content a quiet frame inside an
              assistant turn or bubble: media on top, a title and description
              in the body, actions in a footer. It is not the navigation
              Card. That one is a tile you click to go somewhere; this one
              is content furniture the conversation scrolls past, wearing
              the same card geometry.
            </p>
          </div>

          {/* Anatomy */}
          <section className={styles.section}>
            <SectionTitle title="Anatomy" />
            <p className={styles.demoText}>
              A free-text meta line carries a domain or date in your own
              formatting, and the description stays to a line or two.
            </p>
            <div className={styles.stack}>
              <MessageCard
                title="Design tokens, explained"
                meta="fieldnotes.example · 4 min read"
                description="How a three-tier token architecture keeps a component library on one palette."
              />
            </div>
          </section>

          {/* Link previews */}
          <section className={styles.section}>
            <SectionTitle title="Link previews" />
            <p className={styles.demoText}>
              The classic unfurl. The actions footer sits outside the body,
              mirroring the tool call footer, so link actions and approvals
              read as the same row across the ai components.
            </p>
            <div className={styles.stack}>
              <MessageCard
                title="Harbour Line timetable"
                meta="transit.harbourline.example"
                description="Departures every twelve minutes from Pier 4 until midnight."
                actions={<Button variant="secondary" size="compact" label="Open" />}
              />
              <MessageCard
                title="Alpine pass conditions"
                meta="roads.grimsel.example"
                description="Open to traffic. Chains recommended above 1,800 metres after dark."
                actions={
                  <>
                    <Button variant="secondary" size="compact" label="Open" />
                    <Button variant="tertiary" size="compact" label="Share" />
                  </>
                }
              />
            </div>
          </section>

          {/* With media */}
          <section className={styles.section}>
            <SectionTitle title="With media" />
            <p className={styles.demoText}>
              The media slot sits inset from the card edges with its own
              rounded corners, concentric with the card&apos;s shell. It takes
              drawn content as readily as an image; here it holds a live
              area chart.
            </p>
            <div className={styles.stack}>
              <MessageCard
                media={
                  <AreaChart
                    data={signupData}
                    xKey="day"
                    series={[{ dataKey: "signups", label: "Signups" }]}
                    height={150}
                  />
                }
                title="Weekly signups"
                meta="Updated this morning"
                description="Thursday is still the strongest day, holding the pattern from last month."
              />
            </div>
          </section>

          {/* Inside a message */}
          <section className={styles.section}>
            <SectionTitle title="Inside a message" />
            <p className={styles.demoText}>
              The intended habitat. The card claims no width of its own, so
              the turn that holds it sets the measure.
            </p>
            <div className={styles.conversation}>
              <ChatMessage
                role="user"
                author="Mara Voss"
                timestamp="2:40 PM"
                avatar={<Avatar name="Mara Voss" size="sm" />}
              >
                When does the last ferry leave tonight?
              </ChatMessage>
              <ChatMessage
                role="assistant"
                author="Assistant"
                timestamp="2:41 PM"
                avatar={<Avatar name="A I" size="sm" />}
              >
                <p className={styles.turnText}>
                  The last ferry back leaves at 11:48 PM. Full timetable
                  below.
                </p>
                <MessageCard
                  title="Harbour Line timetable"
                  meta="transit.harbourline.example"
                  description="Departures every twelve minutes from Pier 4 until midnight."
                  actions={<Button variant="secondary" size="compact" label="Open" />}
                />
              </ChatMessage>
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
