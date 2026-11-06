"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { ActionCard, type ActionCardStatus } from "rift-ds/components/ActionCard/ActionCard";
import { Button } from "rift-ds/components/Button/Button";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

/* Demo data: Fernway Trails is a fictional walking club, and every walk and
   booking named below is invented set dressing. */

function Lifecycle() {
  const [status, setStatus] = React.useState<ActionCardStatus>("proposed");
  return (
    <div className={styles.cardStage}>
      <ActionCard
        title="Close bookings: 8 walks"
        detail="Left as they are: 2 already full"
        icon="event_busy"
        receipt="8 walks closed to bookings"
        status={status}
        onConfirm={() => setStatus("confirmed")}
        onDismiss={() => setStatus("dismissed")}
        onUndo={() => setStatus("undone")}
      />
      {status !== "proposed" && (
        <Button variant="tertiary" size="compact" label="Propose it again" iconLeft="refresh" onClick={() => setStatus("proposed")} />
      )}
    </div>
  );
}

export default function ActionCardPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Action card</h1>
            <PageLinks storybookPath="/?path=/docs/components-actioncard--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>A change the reader confirms</p>
            <p className={styles.introBody}>
              Action card is how an assistant asks before it changes anything.
              It says what the change does and what it leaves alone, and
              waits for Confirm. The card never makes the change: the host
              does, through the same action its own buttons use, then the
              card keeps the record of what happened, with Undo while it can
              be reversed.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="Propose, confirm, undo" />
            <p className={styles.demoText}>
              Confirm and the card turns into one row that says what was
              done, announced to a screen reader as a status, unless it lists
              its facts, which it keeps under the receipt. Dismiss and it
              says nothing changed. The host owns the status: onConfirm makes
              the change and sets it to confirmed, onUndo reverses it.
            </p>
            <Lifecycle />
          </section>

          <section className={styles.section}>
            <SectionTitle title="A change that takes something away" />
            <p className={styles.demoText}>
              Set tone to destructive and Confirm takes the destructive colour, for a
              cancellation or a refund. The other button reads Dismiss, never
              Cancel, which beside a cancellation would read as the action
              itself.
            </p>
            <div className={styles.cardStage}>
              <ActionCard title="Cancel bookings: 14 bookings" detail="Left as they are: 3 already cancelled" icon="cancel" tone="destructive" />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Records" />
            <p className={styles.demoText}>
              Once the reader has answered, the card is the thread&apos;s
              record of it: what was done, or that nothing changed, or that
              it was reversed.
            </p>
            <div className={styles.cardStage}>
              <ActionCard title="Close bookings: 8 walks" receipt="8 walks closed to bookings" icon="event_busy" status="confirmed" onUndo={() => {}} />
              <ActionCard title="Close bookings: 8 walks" icon="event_busy" status="dismissed" />
              <ActionCard title="Close bookings: 8 walks" icon="event_busy" status="undone" />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="With its facts" />
            <p className={styles.demoText}>
              Give the card facts and the reader confirms with the numbers in
              front of them: a line each, label beside value. Confirmed, the
              card keeps them under the receipt, and a Confirmed read-out
              stands where Confirm was, so the proposal and its record share
              one shape. Write the facts for the state the card is in.
            </p>
            <div className={styles.cardStage}>
              <ActionCard
                title="Close bookings: 8 walks"
                detail="Their waitlists are kept."
                icon="event_busy"
                tone="destructive"
                facts={[
                  { label: "Status", value: "Open 6 · Nearly full 2 → Closed 8" },
                  { label: "Booked", value: "41 walkers" },
                  { label: "Left alone", value: "3 already full" },
                ]}
              />
              <ActionCard
                title="Close bookings: 8 walks"
                receipt="8 walks closed to bookings"
                status="confirmed"
                onUndo={() => {}}
                facts={[
                  { label: "Status", value: "Open 6 · Nearly full 2 → Closed 8" },
                  { label: "Booked", value: "41 walkers" },
                ]}
              />
            </div>
          </section>

          <ComponentInstallStrip slug="action-card" />
        </main>
      </div>
    </>
  );
}
