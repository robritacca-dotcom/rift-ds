"use client";

import React, { useState } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { ChatHeader } from "@robr0/design-system/components/ChatHeader/ChatHeader";
import { CircularButton } from "@robr0/design-system/components/CircularButton/CircularButton";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";


function ViewSwitchDemo() {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <div className={styles.frame}>
      <ChatHeader
        title="Assistant"
        actions={
          <>
            <CircularButton
              icon="edit_square"
              variant="tertiary"
              ariaLabel="New chat"
            />
            <CircularButton
              icon={fullscreen ? "close_fullscreen" : "open_in_full"}
              variant="tertiary"
              ariaLabel={fullscreen ? "Exit full screen" : "Enter full screen"}
              onClick={() => setFullscreen((v) => !v)}
            />
            <CircularButton
              icon="close"
              variant="tertiary"
              ariaLabel="Close chat"
            />
          </>
        }
      />
    </div>
  );
}

export default function ChatHeaderPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Chat header</h1>
            <PageLinks storybookPath="/?path=/docs/components-chatheader--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              The top row of a chat surface
            </p>
            <p className={styles.introBody}>
              The conversation&apos;s name sits on the left and its controls on
              the right. Like the composer at the other end, it draws no
              divider. The thread&apos;s own padding provides the separation,
              and each control in the actions slot owns its behaviour.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <p className={styles.demoText}>
              A title and a single close control cover the smallest chat
              surfaces.
            </p>
            <div className={styles.frame}>
              <ChatHeader
                title="Assistant"
                actions={
                  <CircularButton
                    icon="close"
                    variant="tertiary"
                    ariaLabel="Close chat"
                  />
                }
              />
            </div>
          </section>

          {/* Full controls */}
          <section className={styles.section}>
            <SectionTitle title="Full controls" />
            <p className={styles.demoText}>
              A widget header carries new chat, a view switch, and close. The
              view switch here really toggles, so the icon and its accessible
              name stay in step.
            </p>
            <ViewSwitchDemo />
          </section>

          {/* Long titles */}
          <section className={styles.section}>
            <SectionTitle title="Long titles" />
            <p className={styles.demoText}>
              A long conversation name truncates with an ellipsis instead of
              wrapping the row, so the controls never move.
            </p>
            <div className={`${styles.frame} ${styles.frameNarrow}`}>
              <ChatHeader
                title="Planning the northern lights trip with the extended family"
                actions={
                  <CircularButton
                    icon="close"
                    variant="tertiary"
                    ariaLabel="Close chat"
                  />
                }
              />
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
