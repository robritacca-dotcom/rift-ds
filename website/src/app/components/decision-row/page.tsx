"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { DecisionRow, type DecisionRowStatus } from "rift-ds/components/DecisionRow/DecisionRow";
import { Avatar } from "rift-ds/components/Avatar/Avatar";
import { Widget } from "rift-ds/components/Widget/Widget";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

const REQUESTS = [
  { id: "a", name: "Priya Natarajan", what: "Access to the design files", when: "10m ago" },
  { id: "b", name: "Tom Okafor", what: "A second monitor", when: "Yesterday" },
  { id: "c", name: "Lena Fischer", what: "Edit rights on the roadmap", when: "Mon" },
];

function Queue() {
  const [statuses, setStatuses] = React.useState<Record<string, DecisionRowStatus>>({});
  return (
    <Widget title="Waiting on you">
      {REQUESTS.map((request) => (
        <DecisionRow
          key={request.id}
          title={request.name}
          description={request.what}
          meta={request.when}
          leading={<Avatar name={request.name} size="sm" />}
          status={statuses[request.id] ?? "pending"}
          onStatusChange={(status) => setStatuses((current) => ({ ...current, [request.id]: status }))}
          onUndo={() => {}}
          acceptLabel="Approve"
          declineLabel="Deny"
          acceptedLabel="Approved"
          declinedLabel="Denied"
        />
      ))}
    </Widget>
  );
}

export default function DecisionRowPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Decision row</h1>
            <PageLinks storybookPath="/?path=/docs/components-decisionrow--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>A yes or a no, and then the answer</p>
            <p className={styles.introBody}>
              Decision row is one item waiting on the reader: a request, an invitation, a draft, a change to review. While it waits it offers two buttons in your words, and once decided it settles to a mark saying which, with Undo while you can still reverse it. It is a Widget row with that lifecycle, so it sits in a Widget beside plain rows. When the buttons leave, focus moves to Undo or to the row, and the outcome is announced.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="A queue" />
            <div className={styles.demoSurface}>
              <Queue />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="In your own words" />
            <div className={styles.demoSurface}>
              <Widget title="Drafts">
                <DecisionRow
                  title="Reply to the supplier"
                  description="Written by the assistant"
                  acceptLabel="Keep"
                  declineLabel="Discard"
                  acceptedLabel="Kept"
                  declinedLabel="Discarded"
                />
                <DecisionRow
                  title="Remove Sam from the workspace"
                  description="Requested by an admin"
                  acceptLabel="Remove"
                  declineLabel="Keep"
                  acceptedLabel="Removed"
                  declinedLabel="Kept"
                  tone="destructive"
                />
              </Widget>
            </div>
          </section>

          <ComponentInstallStrip slug="decision-row" />
        </main>
      </div>
    </>
  );
}
