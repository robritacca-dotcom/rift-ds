"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Card } from "@robr0/design-system/components/Card/Card";
import { EntityCard } from "@robr0/design-system/components/EntityCard/EntityCard";
import { ColourSwatch } from "@robr0/design-system/components/ColourSwatch/ColourSwatch";
import { TypographySwatch } from "@robr0/design-system/components/TypographySwatch/TypographySwatch";
import { SpacingSwatch } from "@robr0/design-system/components/SpacingSwatch/SpacingSwatch";
import { Button } from "@robr0/design-system/components/Button/Button";
import { ToggleSwitch } from "@robr0/design-system/components/ToggleSwitch/ToggleSwitch";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import { FIGMA_FILE_URL } from "@/config/brand.generated";
/* ============================================
   PAGE
   ============================================ */


export default function CardPage() {
  return (
    <>

      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          {/* Page Title */}
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Card</h1>
            <PageLinks
              figmaUrl={`${FIGMA_FILE_URL}?node-id=253-12702`}
              storybookPath="/?path=/docs/components-card--docs"
            />
          </div>

          {/* Intro */}
          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              A family of card components used throughout the system
            </p>
            <p className={styles.introBody}>
              The base card handles previews and navigation links. Specialized variants like colour swatches, spacing swatches, and typography specimens are purpose-built for documenting tokens on the foundations pages.
            </p>
          </div>

          {/* ----------------------------------------
              CARD — base preview / navigation card
              ---------------------------------------- */}
          <section className={styles.section}>
            <SectionTitle title="Card" />
            <div className={styles.cardRow}>
              <Card title="Button">
                <Button
                  label="Button"
                  variant="secondary"
                  iconRight="arrow_forward"
                />
              </Card>
              <Card title="Toggle switch">
                <ToggleSwitch checked={true} label="Dark mode" onChange={() => {}} />
              </Card>
              <Card title="Card" interactive>
                <Button
                  label="Interactive"
                  variant="tertiary"
                  size="compact"
                />
              </Card>
            </div>
          </section>

          {/* ----------------------------------------
              CASE-STUDY CARD
              ---------------------------------------- */}
          <section className={styles.section}>
            <SectionTitle title="Case study card" />
            <div className={styles.caseStudyRow}>
              <Card
                variant="case-study"
                title="Shipping the northlight docs site in a weekend"
                dek="How a fictional team assembled a docs site from the system's templates"
                companyName="Northlight"
                companyLogo="/logos/storybook.svg"
                coverSrc="/images/demo-cover-light.svg"
                href="/templates"
              />
              <Card
                variant="case-study"
                title="Retheming an analytics product with one token file"
                dek="A fictional rebrand riding the primitive layer: swap the ramps, keep the semantics"
                companyName="Fieldnote"
                companyLogo="/logos/vite.svg"
                coverSrc="/images/demo-cover-dark.svg"
                href="/playground"
              />
            </div>
            <div className={styles.caseStudyRow}>
              <Card
                variant="case-study"
                title="Coming soon"
                dek="This case study is still being written."
                companyName="Acme"
                companyLogo="/logos/React.svg"
                placeholder
              />
              <Card
                variant="case-study"
                title="The cover slot takes any element"
                dek="A cover node: the cover prop takes any element and fills the same slot coverSrc would"
                companyName="Acme"
                companyLogo="/logos/Figma.svg"
                cover={
                  /* eslint-disable-next-line @next/next/no-img-element -- SVG demo asset; next/image would need dangerouslyAllowSVG for no gain here. */
                  <img
                    src="/images/demo-cover-light.svg"
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                }
                href="/components"
              />
            </div>
          </section>

          {/* ----------------------------------------
              ENTITY CARD — compact icon / logo card
              ---------------------------------------- */}
          <section className={styles.section}>
            <SectionTitle title="Entity card" />
            <div className={styles.entityRow}>
              <EntityCard label="home" icon="home" />
              <EntityCard label="settings" icon="settings" />
              <EntityCard label="search" icon="search" />
              <EntityCard label="person" icon="person" />
              <EntityCard label="favorite" icon="favorite" />
              <EntityCard label="star" icon="star" />
            </div>
          </section>

          {/* ----------------------------------------
              COLOUR SWATCH — colour token card
              ---------------------------------------- */}
          <section className={styles.section}>
            <SectionTitle title="Colour swatch" />
            <div className={styles.swatchRow}>
              <ColourSwatch
                label="Primary"
                cssVar="--color-core-ui-primary"
                dark={{ primitive: "--teal--07--", hex: "#118AB2", rgb: "17 / 138 / 178" }}
              />
              <ColourSwatch
                label="Secondary"
                cssVar="--color-core-ui-secondary"
                dark={{ primitive: "--orange--07--", hex: "#F4845F", rgb: "244 / 132 / 95" }}
              />
              <ColourSwatch
                label="Background"
                cssVar="--color-bg-primary"
                dark={{ hex: "#050505", rgb: "5 / 5 / 5" }}
              />
            </div>
          </section>

          {/* ----------------------------------------
              TYPOGRAPHY SWATCH — type specimen card
              ---------------------------------------- */}
          <section className={styles.section}>
            <SectionTitle title="Typography swatch" />
            <div className={styles.typographyColumn}>
              <TypographySwatch
                name="Heading 1"
                weight="SemiBold"
                size="36"
                lineHeight="44px"
                letterSpacing="-1%"
                previewStyle={{
                  fontSize: "var(--font-heading-1-size)",
                  fontWeight: "var(--font-heading-1-weight)",
                  lineHeight: "var(--font-heading-1-line-height)",
                  letterSpacing: "var(--font-heading-1-letter-spacing)",
                }}
              />
              <TypographySwatch
                name="Paragraph"
                weight="Regular"
                size="16"
                lineHeight="24px"
                letterSpacing="0"
                previewStyle={{
                  fontSize: "var(--font-paragraph-size)",
                  fontWeight: "var(--font-paragraph-weight)",
                  lineHeight: "var(--font-paragraph-line-height)",
                  letterSpacing: "var(--font-paragraph-letter-spacing)",
                }}
              />
            </div>
          </section>

          {/* ----------------------------------------
              SPACING SWATCH — spatial token card
              ---------------------------------------- */}
          <section className={styles.section}>
            <SectionTitle title="Spacing swatch" />
            <div className={styles.spacingRow}>
              <SpacingSwatch label="SM" value="8px" px={8} variant="gap" />
              <SpacingSwatch label="MD" value="12px" px={12} variant="radius" />
              <SpacingSwatch label="LG" value="16px" px={16} variant="padding" />
              <SpacingSwatch label="XS" value="1px" px={1} variant="border" />
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
