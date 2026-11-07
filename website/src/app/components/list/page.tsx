"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { List, ListItem } from "rift-ds/components/List/List";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

export default function ListPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>List</h1>
            <PageLinks storybookPath="/?path=/docs/components-list--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>Ordered and unordered lists with any marker</p>
            <p className={styles.introBody}>
              List marks each item with a disc, a number, the form controls’ check or an icon, and every item can carry a line of detail under it. Use it for features, steps and requirements.
            </p>
          </div>

          {/* Markers */}
          <section className={styles.section}>
            <SectionTitle title="Markers" />
            <div className={styles.variantRow}>
              <List>
                <ListItem>Unlimited invoices</ListItem>
                <ListItem>Card and bank payments</ListItem>
                <ListItem>Automatic reminders</ListItem>
              </List>
              <List marker="check">
                <ListItem>Unlimited invoices</ListItem>
                <ListItem>Card and bank payments</ListItem>
                <ListItem>Automatic reminders</ListItem>
              </List>
              <List marker="bolt">
                <ListItem>Instant payouts</ListItem>
                <ListItem>Same-day settlement</ListItem>
                <ListItem>Live balance</ListItem>
              </List>
            </div>
          </section>

          {/* Steps */}
          <section className={styles.section}>
            <SectionTitle title="Steps" />
            <div className={styles.demoStage}>
              <List variant="ordered" spacing="relaxed">
                <ListItem description="Your legal name and the address on your bank statements.">Add your business details</ListItem>
                <ListItem description="We send two small deposits to confirm the account.">Connect a bank account</ListItem>
                <ListItem description="Most reviews finish within one business day.">Submit for review</ListItem>
              </List>
            </div>
          </section>

          {/* Item icons */}
          <section className={styles.section}>
            <SectionTitle title="Item icons" />
            <List variant="plain" size="compact" spacing="compact">
              <ListItem icon="lock">Two-step sign-in for every seat</ListItem>
              <ListItem icon="schedule">Scheduled exports to your storage</ListItem>
              <ListItem icon="support_agent">Priority support on weekdays</ListItem>
            </List>
          </section>

          <ComponentInstallStrip slug="list" />
        </main>
      </div>
    </>
  );
}
