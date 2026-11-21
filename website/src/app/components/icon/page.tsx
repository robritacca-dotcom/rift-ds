import React from "react";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { Icon } from "rift-ds/components/Icon/Icon";
import { Stack } from "rift-ds/components/Stack/Stack";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

export default function IconPage() {
  return (
    <div className={styles.dsContent}>
      <PageBreadcrumb />
      <div className={`${styles.pageHeader} animate-in`}>
        <h1 className={styles.pageTitle}>Icon</h1>
        <PageLinks storybookPath="/?path=/docs/components-icon--docs" />
      </div>

      <div className={`${styles.introSection} animate-in animate-delay-1`}>
        <p className={styles.subDisplay}>One glyph on the icon scale</p>
        <p className={styles.introBody}>
          Icon draws one Material Symbol for the places no other component draws one: beside a heading, in a line of text, at the head of a card. It sits on the icon scale, mirrors in a right-to-left context when it points along the line, and stays hidden from assistive tech unless it carries meaning of its own, when a label names it.
        </p>
      </div>

      <section className={styles.section}>
        <SectionTitle title="Sizes" />
        <div className={styles.demoSurface}>
          <Stack direction="row" gap="500">
            <Icon name="settings" size="500" />
            <Icon name="settings" size="600" />
            <Icon name="settings" size="800" />
            <Icon name="settings" size="1200" />
          </Stack>
        </div>
      </section>

      <section className={styles.section}>
        <SectionTitle title="Tones, filled and tile" />
        <div className={styles.demoSurface}>
          <Stack direction="row" gap="500">
            <Icon name="star" />
            <Icon name="star" tone="neutral" />
            <Icon name="star" filled />
            <Icon name="payments" size="500" tile />
            <Icon name="lock" label="Private" />
          </Stack>
        </div>
      </section>

      <ComponentInstallStrip slug="icon" />
    </div>
  );
}
