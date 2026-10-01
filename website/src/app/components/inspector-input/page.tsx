"use client";

import React, { useState } from "react";
import Link from "next/link";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { InspectorInput } from "rift-ds/components/Inspector/InspectorInput";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";
import styles from "./page.module.css";

export default function InspectorInputPage() {
  const [name, setName] = useState("Acme Corp");
  const [handle, setHandle] = useState("acme");

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Inspector input</h1>
            <PageLinks storybookPath="/?path=/docs/components-inspectorinput--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>A short text setting in one row</p>
            <p className={styles.introBody}>
              The name sits on the left as the field’s real label, so clicking it focuses the field, and the typed value is right-aligned in the rest of the bar. Unrecognised props reach the underlying input, so <code>placeholder</code>, <code>maxLength</code> and form registration all work.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="Sizes" />
            <p className={styles.introBody}>
              The <code>size</code> prop matches Button’s: default is 40px tall and compact is 32px.
            </p>
            <div className={styles.sizeRow}>
              <div className={styles.demoColumn}>
                <span className={styles.demoCaption}>Default</span>
                <InspectorInput label="Product name" value={name} onValueChange={setName} />
              </div>
              <div className={styles.demoColumn}>
                <span className={styles.demoCaption}>Compact</span>
                <InspectorInput size="compact" label="Handle" value={handle} onValueChange={setHandle} />
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Placeholder" />
            <p className={styles.introBody}>
              An empty field shows its placeholder in the tertiary text colour, right-aligned where the value will appear.
            </p>
            <div className={styles.demoColumn}>
              <InspectorInput label="Product name" placeholder="Acme Corp" />
              <InspectorInput size="compact" label="Website" type="url" placeholder="example.com" />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Disabled" />
            <div className={styles.sizeRow}>
              <div className={styles.demoColumn}>
                <span className={styles.demoCaption}>Default</span>
                <InspectorInput label="Product name" defaultValue="Acme Corp" disabled />
              </div>
              <div className={styles.demoColumn}>
                <span className={styles.demoCaption}>Compact</span>
                <InspectorInput size="compact" label="Handle" defaultValue="acme" disabled />
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="When to use it" />
            <p className={styles.introBody}>
              Use the inspector input for a short value in a panel of many settings, usually inside an{" "}
              <Link href="/components/inspector-section">inspector section</Link>. For a form field, or any value that needs helper text, an error message or room to read what was typed, use{" "}
              <Link href="/components/input">Input</Link> instead.
            </p>
          </section>

          <ComponentInstallStrip slug="inspector-input" />
        </main>
      </div>
    </>
  );
}
