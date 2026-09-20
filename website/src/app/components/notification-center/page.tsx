"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import {
  NotificationCenter,
  NotificationItem,
} from "@robr0/design-system/components/NotificationCenter/NotificationCenter";
import { Avatar } from "@robr0/design-system/components/Avatar/Avatar";
import { Button } from "@robr0/design-system/components/Button/Button";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";


type Demo = {
  id: string;
  tab: "mentions" | "system";
  unread: boolean;
  title: string;
  time: string;
  media: string | React.ReactNode;
  body: string;
  actions?: React.ReactNode;
};

const demoItems: Demo[] = [
  {
    id: "n1",
    tab: "mentions",
    unread: true,
    title: "Livia mentioned you",
    time: "2m",
    media: <Avatar name="Livia Saris" size="sm" />,
    body: "Can you review the new empty state before we ship the dashboard?",
    actions: (
      <>
        <Button variant="secondary" size="compact" label="Reply" />
        <Button variant="tertiary" size="compact" label="View thread" />
      </>
    ),
  },
  {
    id: "n2",
    tab: "system",
    unread: true,
    title: "Workspace backup is ready",
    time: "18m",
    media: "cloud_done",
    body: "The nightly backup finished and is ready to download.",
    actions: <Button variant="secondary" size="compact" label="Download" />,
  },
  {
    id: "n3",
    tab: "mentions",
    unread: false,
    title: "You joined the design project",
    time: "1h",
    media: <Avatar name="Maria Lubin" size="sm" />,
    body: "Maria added you as an editor, so every file is now open to you.",
  },
  {
    id: "n4",
    tab: "system",
    unread: false,
    title: "Preview deployment failed",
    time: "Sat",
    media: "error",
    body: "The build stopped while validating the application routes.",
    actions: (
      <>
        <Button variant="secondary" size="compact" label="Retry" />
        <Button variant="tertiary" size="compact" label="View logs" />
      </>
    ),
  },
];

function InboxDemo() {
  const [items, setItems] = React.useState(demoItems);
  const [tab, setTab] = React.useState("all");

  const visible = tab === "all" ? items : items.filter((item) => item.tab === tab);
  const unread = items.filter((item) => item.unread).length;

  return (
    <div className={styles.demoColumn}>
      <NotificationCenter
        unreadCount={unread}
        onMarkAllRead={() =>
          setItems((current) => current.map((item) => ({ ...item, unread: false })))
        }
        tabs={[
          { label: "All", value: "all", count: items.length },
          {
            label: "Mentions",
            value: "mentions",
            count: items.filter((item) => item.tab === "mentions").length,
          },
          {
            label: "System",
            value: "system",
            count: items.filter((item) => item.tab === "system").length,
          },
        ]}
        activeTab={tab}
        onTabChange={setTab}
      >
        {visible.map((item) => (
          <NotificationItem
            key={item.id}
            title={item.title}
            time={item.time}
            unread={item.unread}
            media={item.media}
            actions={item.actions}
          >
            {item.body}
          </NotificationItem>
        ))}
      </NotificationCenter>
    </div>
  );
}

export default function NotificationCenterPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Notification centre</h1>
            <PageLinks storybookPath="/?path=/docs/components-notificationcenter--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Everything that happened while you were away
            </p>
            <p className={styles.introBody}>
              Toast interrupts, this accumulates. A header with the unread
              count and a mark all read control, optional filter tabs with
              counts, and a scrolling list of notification items with their
              own actions. Filtering stays with you: swap the children when
              the tab changes.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="A working inbox" />
            <p className={styles.demoText}>
              The tabs filter, the counts follow the data, and mark all read
              clears the dots. Unread items carry an emphasised title and an
              info coloured dot, never the action teal.
            </p>
            <InboxDemo />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Items" />
            <p className={styles.demoText}>
              An item takes a Material Symbol name or any element as its
              leading visual, a right aligned time, supporting copy, and a
              row of compact buttons when the notification can be acted on.
            </p>
            <div className={styles.demoColumn}>
              <NotificationCenter title="Item anatomy">
                <NotificationItem
                  title="Deployment finished"
                  time="2m"
                  unread
                  media="rocket_launch"
                  actions={
                    <Button variant="secondary" size="compact" label="View site" />
                  }
                >
                  The site is live on production.
                </NotificationItem>
                <NotificationItem
                  title="Ann requested your review"
                  time="Mon"
                  media={<Avatar name="Ann Press" size="sm" />}
                >
                  The pull request updates the notification preferences flow.
                </NotificationItem>
                <NotificationItem title="Security check completed" time="Sun" media="verified_user">
                  No exposed credentials or vulnerable dependencies were found.
                </NotificationItem>
              </NotificationCenter>
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Empty" />
            <p className={styles.demoText}>
              With nothing to show, the built in empty state keeps the panel
              from reading as broken. Pass your own through the emptyState
              prop when the moment needs different words.
            </p>
            <div className={styles.demoColumn}>
              <NotificationCenter />
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
