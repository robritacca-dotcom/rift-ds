"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { SourceChip } from "@robr0/design-system/components/SourceChip/SourceChip";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";


export default function SourceChipPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Source chip</h1>
            <PageLinks storybookPath="/?path=/docs/components-sourcechip--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              A numbered citation pill linking a claim to its source
            </p>
            <p className={styles.introBody}>
              Assistant answers earn trust by showing their sources. A source
              chip sits inline after a sentence or in a wrapping row under the
              answer: a small numeral or icon, then the source name, truncating
              before it can crowd the text around it.
            </p>
          </div>

          {/* Numbered citations */}
          <section className={styles.section}>
            <SectionTitle title="Numbered citations" />
            <p className={styles.demoText}>
              The citation number sits in its own small circle, so a run of
              chips reads as a numbered list at a glance.
            </p>
            <div className={styles.row}>
              <SourceChip index={1} title="Design tokens quarterly" />
              <SourceChip index={2} title="Theming layered systems" />
              <SourceChip index={3} title="The primitives handbook" />
            </div>
          </section>

          {/* As links */}
          <section className={styles.section}>
            <SectionTitle title="As links" />
            <p className={styles.demoText}>
              With an href the chip renders as an anchor. The pill shape is the
              affordance: hover deepens the background and text instead of
              adding an underline.
            </p>
            <div className={styles.row}>
              <SourceChip
                index={1}
                title="The component API field guide"
                href="https://example.com/component-api-field-guide"
              />
              <SourceChip
                index={2}
                title="Interface annual review"
                href="https://example.com/interface-annual-review"
              />
            </div>
          </section>

          {/* With icons */}
          <section className={styles.section}>
            <SectionTitle title="With icons" />
            <p className={styles.demoText}>
              An icon can take the leading slot when there is no numbering, for
              a lone citation or a source type glyph. If both an index and an
              icon are passed, the index wins.
            </p>
            <div className={styles.row}>
              <SourceChip icon="language" title="Interface annual review" />
              <SourceChip icon="menu_book" title="The primitives handbook" />
              <SourceChip icon="description" title="Layout systems memo" />
            </div>
          </section>

          {/* Under an answer */}
          <section className={styles.section}>
            <SectionTitle title="Under an answer" />
            <p className={styles.demoText}>
              The intended home: a wrapping sources row in the footer of an
              assistant answer, each chip linking one claim to where it came
              from.
            </p>
            <div className={styles.answer}>
              <p className={styles.answerText}>
                Semantic tokens resolve to primitives, so overriding a single
                primitive cascades through every component that references it.
                That is what makes whole-system retheming a one-file change.
              </p>
              <div className={styles.sourcesRow}>
                <SourceChip
                  index={1}
                  title="Design tokens quarterly"
                  href="https://example.com/design-tokens-quarterly"
                />
                <SourceChip
                  index={2}
                  title="Theming layered systems"
                  href="https://example.com/theming-layered-systems"
                />
                <SourceChip
                  index={3}
                  title="The primitives handbook"
                  href="https://example.com/the-primitives-handbook"
                />
              </div>
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
