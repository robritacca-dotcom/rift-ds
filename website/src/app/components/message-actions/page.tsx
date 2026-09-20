"use client";

import React, { useState } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { MessageActions } from "@robr0/design-system/components/MessageActions/MessageActions";
import { ChatMessage } from "@robr0/design-system/components/ChatMessage/ChatMessage";
import { Avatar } from "@robr0/design-system/components/Avatar/Avatar";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";


const defaultItems = [
  { id: "copy", icon: "content_copy", label: "Copy" },
  { id: "retry", icon: "refresh", label: "Retry" },
  { id: "thumb-up", icon: "thumb_up", label: "Good response" },
  { id: "thumb-down", icon: "thumb_down", label: "Bad response" },
];

function CopyFeedbackDemo() {
  const [copied, setCopied] = useState(false);

  return (
    <MessageActions
      items={[
        {
          id: "copy",
          icon: copied ? "check" : "content_copy",
          label: copied ? "Copied" : "Copy",
        },
        { id: "retry", icon: "refresh", label: "Retry" },
      ]}
      onActionClick={(id) => {
        if (id !== "copy" || copied) return;
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    />
  );
}

export default function MessageActionsPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Message actions</h1>
            <PageLinks storybookPath="/?path=/docs/components-messageactions--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              The quiet icon row under a message
            </p>
            <p className={styles.introBody}>
              Copy, retry, feedback. Message actions is a row of ghost icon
              buttons built for the chat message actions slot, which reveals
              it on hover and keyboard focus. Each button carries its label
              as an accessible name and shows it as a tooltip. The row keeps
              no state of its own: it reports which action was pressed, and
              the consumer decides what happens next.
            </p>
          </div>

          {/* The row */}
          <section className={styles.section}>
            <SectionTitle title="The row" />
            <p className={styles.demoText}>
              Ghost buttons with no border and no resting surface, so the row
              stays quiet until pointed at. Hover a button to see its tooltip.
            </p>
            <div className={styles.stack}>
              <MessageActions items={defaultItems} />
            </div>
          </section>

          {/* Active and disabled */}
          <section className={styles.section}>
            <SectionTitle title="Active and disabled" />
            <p className={styles.demoText}>
              An active item, like the chosen feedback thumb, holds the
              pressed step of the passive ramp and announces itself with
              aria-pressed. A disabled item dims to the house 0.4 opacity.
            </p>
            <div className={styles.stack}>
              <MessageActions
                items={[
                  { id: "copy", icon: "content_copy", label: "Copy" },
                  { id: "retry", icon: "refresh", label: "Retry", disabled: true },
                  { id: "thumb-up", icon: "thumb_up", label: "Good response", active: true },
                  { id: "thumb-down", icon: "thumb_down", label: "Bad response", active: false },
                ]}
              />
            </div>
          </section>

          {/* Copy feedback */}
          <section className={styles.section}>
            <SectionTitle title="Copy feedback" />
            <p className={styles.demoText}>
              Click copy. The check mark you see is the consumer swapping the
              item&apos;s icon and label for two seconds, then swapping them
              back. The row never owns a timer or a clipboard call.
            </p>
            <div className={styles.stack}>
              <CopyFeedbackDemo />
            </div>
          </section>

          {/* In a message */}
          <section className={styles.section}>
            <SectionTitle title="In a message" />
            <p className={styles.demoText}>
              The intended habitat. Hover the assistant turn, or tab into it,
              and the actions slot reveals the row.
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
                actions={<MessageActions items={defaultItems} />}
              >
                The last ferry back leaves at 11:48 PM, from Pier 4.
              </ChatMessage>
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
