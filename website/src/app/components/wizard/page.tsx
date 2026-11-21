"use client";

import React from "react";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { Wizard } from "rift-ds/components/Wizard/Wizard";
import { Input } from "rift-ds/components/Input/Input";
import { DescriptionList } from "rift-ds/components/DescriptionList/DescriptionList";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

export default function WizardPage() {
  return (
    <div className={styles.dsContent}>
      <PageBreadcrumb />
      <div className={`${styles.pageHeader} animate-in`}>
        <h1 className={styles.pageTitle}>Wizard</h1>
        <PageLinks storybookPath="/?path=/docs/components-wizard--docs" />
      </div>

      <div className={`${styles.introSection} animate-in animate-delay-1`}>
        <p className={styles.subDisplay}>A task in steps</p>
        <p className={styles.introBody}>
          Wizard puts a stepper above the step in front of the reader, its fields under their own heading, and Back and Continue at the foot beside a running summary. Moving to a step moves focus to its heading, so a screen reader hears where it landed, and the host holds Continue until the step’s fields pass.
        </p>
      </div>

      <section className={styles.section}>
        <SectionTitle title="Default" />
        <div className={styles.demoSurface}>
          <Wizard
            summary="Estimated total: $1,240.00"
            steps={[
              { id: "details", label: "Details", description: "Name and owner", content: <Input label="Project name" defaultValue="Website refresh" /> },
              { id: "team", label: "Team", description: "Who works on it", content: <Input label="Owner" defaultValue="Ada Lovelace" /> },
              { id: "review", label: "Review", description: "Check and confirm", content: <DescriptionList layout="inline" items={[{ term: "Project", details: "Website refresh" }, { term: "Owner", details: "Ada Lovelace" }]} /> },
            ]}
          />
        </div>
      </section>

      <ComponentInstallStrip slug="wizard" />
    </div>
  );
}
