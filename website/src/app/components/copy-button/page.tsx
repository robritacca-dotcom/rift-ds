"use client";

import React from "react";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";
import { CopyButton } from "rift-ds/components/CopyButton/CopyButton";

export default function CopyButtonPage() {
  return (
    <div className={styles.dsContent}>
      <PageBreadcrumb />
      <div className={`${styles.pageHeader} animate-in`}>
        <h1 className={styles.pageTitle}>Copy button</h1>
        <PageLinks storybookPath="/?path=/docs/components-copybutton--docs" />
      </div>

      <div className={`${styles.introSection} animate-in animate-delay-1`}>
        <p className={styles.subDisplay}>Copy a value and say so</p>
        <p className={styles.introBody}>
          A button that puts a value on the clipboard, then turns its glyph to a check and its label to Copied for a moment. Code blocks and description lists copy through it, so every copy in the library confirms the same way.
        </p>
      </div>

      <section className={styles.section}>
        <SectionTitle title="With text" />
        <div className={styles.demoRow}>
          <CopyButton value="npm install rift-ds" />
          <CopyButton value="npm install rift-ds" variant="secondary" size="default" copyText="Copy command" />
          <CopyButton value="npm install rift-ds" variant="secondary" tone="neutral" size="default" copyText="Copy link" />
        </div>
        <p className={styles.demoText}>
          Tertiary and compact by default, to sit quietly in a header or beside a value. <code>tone=&quot;neutral&quot;</code>{" "}
          draws the secondary outline in the neutral greys, for a utility control such as a page&apos;s copy link.
        </p>
      </section>

      <section className={styles.section}>
        <SectionTitle title="Icon only" />
        <div className={styles.demoRow}>
          <CopyButton value="#0E6E8F" iconOnly copyLabel="Copy the colour" />
          <CopyButton value="#0E6E8F" iconOnly variant="secondary" size="default" copyLabel="Copy the colour" />
        </div>
        <p className={styles.demoText}>
          An IconButton with its name in a tooltip. The name changes to Copied after a press, which a screen reader announces.
        </p>
      </section>

      <section className={styles.section}>
        <SectionTitle title="A value read at the press" />
        <div className={styles.demoRow}>
          <CopyButton value={() => window.location.href} copyText="Copy link" />
        </div>
        <p className={styles.demoText}>
          Pass a function for a value that moves, such as the address of the current page.
        </p>
      </section>

      <ComponentInstallStrip slug="copy-button" />
    </div>
  );
}
