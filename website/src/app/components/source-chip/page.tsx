"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { SourceChip } from "rift-ds/components/SourceChip/SourceChip";
import { SourceLogoMock } from "@/components/SourceLogoMock/SourceLogoMock";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";


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
              answer: a numeral, the source’s logo or a globe, then the source
              name, truncating before it can crowd the text around it.
            </p>
          </div>

          {/* Numbered citations */}
          <section className={styles.section}>
            <SectionTitle title="Numbered citations" />
            <p className={styles.demoText}>
              The citation number sits in its own small circle, tucked into
              the start of the pill with the same inset above, below and
              before it, so a run of chips reads as a numbered list at a
              glance.
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

          {/* Source preview */}
          <section className={styles.section}>
            <SectionTitle title="Source preview" />
            <p className={styles.demoText}>
              Give a chip an excerpt and it previews its source on hover,
              focus or press: the full title over the passage the answer drew
              on, with where it lives on the line above. A logo leads that
              line even when the chip itself shows a number. The panel opens above
              the chip, drops below when there is no room, and slides sideways
              to stay in view. A chip with a preview and no link becomes a
              button, so the keyboard reaches it too.
            </p>
            <div className={styles.row}>
              <SourceChip
                index={1}
                title="Design tokens quarterly"
                logo={<SourceLogoMock letter="T" tone="violet" />}
                source="tokens.example.com"
                excerpt="A semantic token names a role and points at a primitive. Change the primitive once and every component that reads the role follows."
                href="https://example.com/design-tokens-quarterly"
              />
              <SourceChip
                logo={<SourceLogoMock letter="L" tone="mint" />}
                title="Theming layered systems"
                source="example.com/theming"
                excerpt="A theme re-keys the primitives and re-points the semantic layer. The tiers themselves never change, which is what keeps a retheme a one-file job."
              />
              <SourceChip
                title="The primitives handbook"
                source="handbook.example.com"
                meta="12 min read"
                excerpt="Primitives hold raw values and nothing else. No component reads one directly."
              />
            </div>
          </section>

          {/* Logos and the globe */}
          <section className={styles.section}>
            <SectionTitle title="Logos and the globe" />
            <p className={styles.demoText}>
              Without a number, the leading slot shows the source’s logo,
              cropped to the same circle the numeral sits in. A source with no
              logo gets a globe, so the slot is never empty. If both an index
              and a logo are passed, the index wins and the logo moves to the
              preview.
            </p>
            <div className={styles.row}>
              <SourceChip
                logo={<SourceLogoMock letter="I" tone="coral" />}
                title="Interface annual review"
              />
              <SourceChip
                logo={<SourceLogoMock letter="P" tone="cobalt" />}
                title="The primitives handbook"
              />
              <SourceChip
                logo={<SourceLogoMock letter="G" tone="gold" />}
                title="Grid notes"
              />
              <SourceChip title="Layout systems memo" />
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

          <ComponentInstallStrip slug="source-chip" />
        </main>
      </div>

    </>
  );
}
