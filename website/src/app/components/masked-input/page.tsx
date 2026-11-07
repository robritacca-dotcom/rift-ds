"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { MASK_PRESETS, MaskedInput } from "rift-ds/components/MaskedInput/MaskedInput";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

export default function MaskedInputPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Masked input</h1>
            <PageLinks storybookPath="/?path=/docs/components-maskedinput--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>A value written into its shape</p>
            <p className={styles.introBody}>
              A masked input writes a phone number, a card number, an ID number or a licence key into its shape as it is typed. The value is the raw characters, the caret holds its place across separators, and a sensitive value hides as dots until the reader shows it.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="Presets" />
            <div className={`${styles.demoStack} ${styles.demoStage}`}>
              <MaskedInput label="Phone number" mask={MASK_PRESETS.phoneUs} defaultValue="5550100199" />
              <MaskedInput label="ZIP code" mask={MASK_PRESETS.postalCode} defaultValue="941071234" />
              <MaskedInput label="Licence key" mask={MASK_PRESETS.licenceKey} defaultValue="AB12CD34EF56GH78" />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Sensitive" />
            <div className={`${styles.demoStack} ${styles.demoStage}`}>
              <MaskedInput
                label="Card number"
                mask={MASK_PRESETS.card}
                defaultValue="4242424242424242"
                sensitive
                revealable
                visibleTail={4}
              />
              <MaskedInput label="Tax ID" mask={MASK_PRESETS.idNumber} defaultValue="123456789" sensitive revealable autoHideAfter />
            </div>
          </section>

          <ComponentInstallStrip slug="masked-input" />
        </main>
      </div>
    </>
  );
}
