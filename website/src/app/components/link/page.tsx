"use client";

import React from "react";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import { Link } from "rift-ds/components/Link/Link";
import { Text } from "rift-ds/components/Text/Text";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

export default function LinkPage() {
  return (
    <div className={styles.dsContent}>
      <PageBreadcrumb />
      <div className={`${styles.pageHeader} animate-in`}>
        <h1 className={styles.pageTitle}>Link</h1>
        <PageLinks storybookPath="/?path=/docs/components-link--docs" />
      </div>

      <div className={`${styles.introSection} animate-in animate-delay-1`}>
        <p className={styles.subDisplay}>A text link, inside a sentence or on its own</p>
        <p className={styles.introBody}>
          Link renders through the app’s link component so it navigates through the router. An inline link takes the sentence’s face and colour; a standalone link takes the tertiary action text colour. An external link opens a new tab and says so to a screen reader.
        </p>
      </div>

      {/* Variants */}
      <section className={styles.section}>
        <SectionTitle title="Variants" />
        <div className={styles.demoStack}>
          <Text>Update your card in <Link href="#billing">billing settings</Link> before the next invoice.</Text>
          <Link href="#password" variant="standalone">Forgot your password?</Link>
          <Link href="#transactions" variant="standalone" size="compact" iconRight="arrow_forward">View all transactions</Link>
        </div>
      </section>

      {/* External and disabled */}
      <section className={styles.section}>
        <SectionTitle title="External and disabled" />
        <div className={styles.demoStack}>
          <Link href="https://example.com/help" variant="standalone" external>Help centre</Link>
          <Link href="#statement" variant="standalone" disabled>Download statement</Link>
        </div>
      </section>

      <section className={styles.section}>
        <SectionTitle title="Skip link" />
        <div className={styles.kitDemo}>
          <Link variant="skip" href="#main-content">Skip to content</Link>
          <p className={styles.kitNote}>
            Put it first on the page. It stays hidden until a keyboard reader tabs to it, then appears at the top so they can pass the header and navigation in one press. Press Tab from the address bar to see it.
          </p>
        </div>
      </section>

      <ComponentInstallStrip slug="link" />
    </div>
  );
}
