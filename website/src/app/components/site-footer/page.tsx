"use client";

import React from "react";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";
import { SiteFooter } from "rift-ds/components/SiteFooter/SiteFooter";
import { IconButton } from "rift-ds/components/IconButton/IconButton";

const COLUMNS = [
  {
    label: "Docs",
    links: [
      { label: "Introduction", href: "#introduction" },
      { label: "Installation", href: "#installation" },
      { label: "Theming", href: "#theming" },
    ],
  },
  {
    label: "Components",
    links: [
      { label: "Button", href: "#button" },
      { label: "Menu bar", href: "#menubar" },
      { label: "Table", href: "#table" },
    ],
  },
  {
    label: "Community",
    links: [
      { label: "Discussions", href: "https://example.com/discussions", external: true },
      { label: "Contributing", href: "#contributing" },
    ],
  },
];

export default function SiteFooterPage() {
  return (
    <div className={styles.dsContent}>
      <PageBreadcrumb />
      <div className={`${styles.pageHeader} animate-in`}>
        <h1 className={styles.pageTitle}>Site footer</h1>
        <PageLinks storybookPath="/?path=/docs/components-sitefooter--docs" />
      </div>

      <div className={`${styles.introSection} animate-in animate-delay-1`}>
        <p className={styles.subDisplay}>The bottom of a site</p>
        <p className={styles.introBody}>
          The pair to the site header: the brand and a line about the site, columns of links, and a row of small print with social links at its end. The columns fold from a row to a grid to a single stack as the footer narrows, with no breakpoints of its own.
        </p>
      </div>

      <section className={styles.section}>
        <SectionTitle title="Default" />
        <div className={styles.frame}>
          <SiteFooter
            brand="Acme"
            description="Components and guides for building the Acme app."
            columns={COLUMNS}
            legal="© 2026 Acme. Released under the MIT licence."
            social={
              <>
                <IconButton icon="rss_feed" label="Feed" variant="tertiary" size="compact" href="#feed" />
                <IconButton icon="mail" label="Newsletter" variant="tertiary" size="compact" href="#newsletter" />
              </>
            }
          />
        </div>
        <p className={styles.demoText}>
          It has no surface of its own: the page is its floor, and the host sets its width.
        </p>
      </section>

      <ComponentInstallStrip slug="site-footer" />
    </div>
  );
}
