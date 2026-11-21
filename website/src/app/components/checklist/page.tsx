"use client";

import React from "react";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { Checklist } from "rift-ds/components/Checklist/Checklist";
import { Button } from "rift-ds/components/Button/Button";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

export default function ChecklistPage() {
  return (
    <div className={styles.dsContent}>
      <PageBreadcrumb />
      <div className={`${styles.pageHeader} animate-in`}>
        <h1 className={styles.pageTitle}>Checklist</h1>
        <PageLinks storybookPath="/?path=/docs/components-checklist--docs" />
      </div>

      <div className={`${styles.introSection} animate-in animate-delay-1`}>
        <p className={styles.subDisplay}>Tasks to tick off, with who owns each</p>
        <p className={styles.introBody}>
          Checklist lists the tasks of a setup, an onboarding or a release, each with its own done state, an owner and an action to do it, under a count done and a bar. Ticking a task moves the count. Read-only, it reports done marks the host already knows and says each row’s state in words.
        </p>
      </div>

      <section className={styles.section}>
        <SectionTitle title="Default" />
        <div className={styles.demoSurface}>
          <Checklist
            title="Get set up"
            defaultValues={["profile", "team"]}
            items={[
              { id: "profile", label: "Complete your profile", description: "Add a photo and a short bio.", owner: { name: "Ada Lovelace" } },
              { id: "team", label: "Invite your team", description: "Bring in the people you work with.", owner: { name: "Grace Hopper" } },
              { id: "connect", label: "Connect a data source", owner: { name: "Alan Turing" }, action: <Button label="Connect" size="compact" variant="secondary" /> },
              { id: "notify", label: "Choose your notifications" },
            ]}
          />
        </div>
      </section>

      <section className={styles.section}>
        <SectionTitle title="Read-only" />
        <div className={styles.demoSurface}>
          <Checklist
            title="Before you publish"
            readOnly
            values={["copy"]}
            size="compact"
            items={[
              { id: "copy", label: "Copy reviewed" },
              { id: "links", label: "Links checked" },
              { id: "images", label: "Images have alt text" },
            ]}
          />
        </div>
      </section>

      <ComponentInstallStrip slug="checklist" />
    </div>
  );
}
