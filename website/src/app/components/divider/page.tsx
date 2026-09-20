"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Divider } from "@robr0/design-system/components/Divider/Divider";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";


export default function DividerPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Divider</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-divider--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              A thin rule between content
            </p>
            <p className={styles.introBody}>
              Separates stacked content with a hairline rule in the divider
              colour. Horizontal by default, with an optional inline label and
              a vertical orientation for flex rows. Use it inside forms, lists,
              and cards. Page sections under an h2 heading already carry
              their own divider.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <div className={styles.demoBox}>
              <p className={styles.demoText}>
                The plain divider renders a semantic hr element, one pixel
                tall in the divider colour.
              </p>
              <Divider />
              <p className={styles.demoText}>
                It spans the full width of its container with a 16px block
                margin by default.
              </p>
            </div>
          </section>

          {/* With label */}
          <section className={styles.section}>
            <SectionTitle title="With label" />
            <div className={styles.demoBox}>
              <p className={styles.demoText}>Sign in with your email address.</p>
              <Divider label="or" />
              <p className={styles.demoText}>Continue with a provider instead.</p>
            </div>
            <div className={styles.demoBox}>
              <p className={styles.demoText}>
                A start-positioned label reads as a quiet inline heading.
              </p>
              <Divider label="Details" labelPosition="start" />
              <p className={styles.demoText}>
                Everything after the rule belongs to the labelled group.
              </p>
            </div>
          </section>

          {/* Vertical */}
          <section className={styles.section}>
            <SectionTitle title="Vertical" />
            <div className={styles.demoBox}>
              <div className={styles.demoRow}>
                <span className={styles.demoText}>Edit</span>
                <Divider orientation="vertical" />
                <span className={styles.demoText}>Duplicate</span>
                <Divider orientation="vertical" />
                <span className={styles.demoText}>Delete</span>
              </div>
            </div>
          </section>

          {/* Spacing */}
          <section className={styles.section}>
            <SectionTitle title="Spacing" />
            <div className={styles.demoBox}>
              <p className={styles.demoText}>none: 0</p>
              <Divider spacing="none" />
              <p className={styles.demoText}>sm: 8px</p>
              <Divider spacing="sm" />
              <p className={styles.demoText}>md: 16px (default)</p>
              <Divider spacing="md" />
              <p className={styles.demoText}>lg: 20px</p>
              <Divider spacing="lg" />
              <p className={styles.demoText}>End of scale.</p>
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
