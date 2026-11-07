"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { SignaturePad } from "rift-ds/components/SignaturePad/SignaturePad";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

export default function SignaturePadPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Signature pad</h1>
            <PageLinks storybookPath="/?path=/docs/components-signaturepad--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>A signature, drawn or typed</p>
            <p className={styles.introBody}>
              A signature pad takes a drawn signature or a typed name, for e-sign consent, delivery proof and approvals. Drawn strokes are smoothed and kept as SVG, so the signature scales and prints, and a PNG is made on demand. Typing is the way in for anyone who cannot draw with a pointer, so the pad offers both by default.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="Draw or type" />
            <div className={styles.demoStage}>
              <SignaturePad label="Signature" helperText="Sign with a mouse, a finger or a pen, or type your name." />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="One method" />
            <div className={`${styles.demoStack} ${styles.demoStage}`}>
              <SignaturePad label="Recipient signature" mode="draw" height="tall" />
              <SignaturePad label="Approved by" mode="type" size="compact" defaultValue={{ kind: "typed", text: "Priya Shah" }} />
            </div>
          </section>

          <ComponentInstallStrip slug="signature-pad" />
        </main>
      </div>
    </>
  );
}
