"use client";

import React, { useState } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { TypographySwatch } from "@robr0/design-system/components/TypographySwatch/TypographySwatch";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import { Tabs } from "@robr0/design-system/components/Tabs/Tabs";
import PageLinks from "../../../components/PageLinks/PageLinks";
import { getSidebarLinks, foundationsSidebarLinks } from "@/config/navigation";
import styles from "./page.module.css";

const { sidebarLinks } = getSidebarLinks(foundationsSidebarLinks, "/foundations/typography");

/* ============================================
   TYPOGRAPHY DATA
   Real values from tokens-typography.css.
   previewStyle uses CSS vars for live rendering.
   Display-tier styles carry a `mobile` variant — the values the tokens
   resolve to below 768px. Mobile previews use literal px (a CSS var would
   resolve against the visitor's actual viewport, not the toggle).
   Mega and Display state their leading as the unitless ratio the token
   holds; the heading and body tiers state theirs in px, as those tokens do.
   ============================================ */

interface TypeStyleData {
  name: string;
  weight: string;
  size: string;
  lineHeight: string;
  letterSpacing: string;
  previewStyle: React.CSSProperties;
  mobile?: {
    size: string;
    lineHeight: string;
    previewStyle: React.CSSProperties;
  };
}

const megaStyles: TypeStyleData[] = [
  {
    name: "Mega 1",
    weight: "Light",
    size: "132px",
    lineHeight: "0.92",
    letterSpacing: "2%",
    previewStyle: {
      fontFamily: "var(--font-mega-1-family)",
      fontSize: "var(--font-mega-1-size)",
      fontWeight: "var(--font-mega-1-weight)" as unknown as number,
      lineHeight: "var(--font-mega-1-line-height)",
      letterSpacing: "var(--font-mega-1-letter-spacing)",
    },
    mobile: {
      size: "64px",
      lineHeight: "0.92",
      previewStyle: { fontSize: "64px", lineHeight: 0.92 },
    },
  },
  {
    name: "Mega 2",
    weight: "Light",
    size: "116px",
    lineHeight: "0.92",
    letterSpacing: "2%",
    previewStyle: {
      fontFamily: "var(--font-mega-2-family)",
      fontSize: "var(--font-mega-2-size)",
      fontWeight: "var(--font-mega-2-weight)" as unknown as number,
      lineHeight: "var(--font-mega-2-line-height)",
      letterSpacing: "var(--font-mega-2-letter-spacing)",
    },
    mobile: {
      size: "56px",
      lineHeight: "0.92",
      previewStyle: { fontSize: "56px", lineHeight: 0.92 },
    },
  },
];

const displayStyles: TypeStyleData[] = [
  {
    name: "Display 1",
    weight: "Light",
    size: "96px",
    lineHeight: "1.05",
    letterSpacing: "2%",
    previewStyle: {
      fontFamily: "var(--font-display-1-family)",
      fontSize: "var(--font-display-1-size)",
      fontWeight: "var(--font-display-1-weight)" as unknown as number,
      lineHeight: "var(--font-display-1-line-height)",
      letterSpacing: "var(--font-display-1-letter-spacing)",
    },
    mobile: {
      size: "48px",
      lineHeight: "1.05",
      previewStyle: { fontSize: "48px", lineHeight: 1.05 },
    },
  },
  {
    name: "Display 2",
    weight: "Light",
    size: "64px",
    lineHeight: "1.1",
    letterSpacing: "1.5%",
    previewStyle: {
      fontFamily: "var(--font-display-2-family)",
      fontSize: "var(--font-display-2-size)",
      fontWeight: "var(--font-display-2-weight)" as unknown as number,
      lineHeight: "var(--font-display-2-line-height)",
      letterSpacing: "var(--font-display-2-letter-spacing)",
    },
    mobile: {
      size: "40px",
      lineHeight: "1.15",
      previewStyle: { fontSize: "40px", lineHeight: 1.15 },
    },
  },
  {
    name: "Sub display",
    weight: "Light",
    size: "30px",
    lineHeight: "44px",
    letterSpacing: "1.5%",
    previewStyle: {
      fontFamily: "var(--font-sub-display-family)",
      fontSize: "var(--font-sub-display-size)",
      fontWeight: "var(--font-sub-display-weight)" as unknown as number,
      lineHeight: "var(--font-sub-display-line-height)",
      letterSpacing: "var(--font-sub-display-letter-spacing)",
    },
    mobile: {
      size: "24px",
      lineHeight: "36px",
      previewStyle: { fontSize: "24px", lineHeight: "36px" },
    },
  },
];

const headingStyles: TypeStyleData[] = [
  {
    name: "Heading 1",
    weight: "SemiBold",
    size: "30px",
    lineHeight: "44px",
    letterSpacing: "1.5%",
    previewStyle: {
      fontFamily: "var(--font-heading-1-family)",
      fontSize: "var(--font-heading-1-size)",
      fontWeight: "var(--font-heading-1-weight)" as unknown as number,
      lineHeight: "var(--font-heading-1-line-height)",
      letterSpacing: "var(--font-heading-1-letter-spacing)",
    },
  },
  {
    name: "Heading 2",
    weight: "SemiBold",
    size: "26px",
    lineHeight: "32px",
    letterSpacing: "1.5%",
    previewStyle: {
      fontFamily: "var(--font-heading-2-family)",
      fontSize: "var(--font-heading-2-size)",
      fontWeight: "var(--font-heading-2-weight)" as unknown as number,
      lineHeight: "var(--font-heading-2-line-height)",
      letterSpacing: "var(--font-heading-2-letter-spacing)",
    },
  },
  {
    name: "Heading 3",
    weight: "SemiBold",
    size: "22px",
    lineHeight: "28px",
    letterSpacing: "1.5%",
    previewStyle: {
      fontFamily: "var(--font-heading-3-family)",
      fontSize: "var(--font-heading-3-size)",
      fontWeight: "var(--font-heading-3-weight)" as unknown as number,
      lineHeight: "var(--font-heading-3-line-height)",
      letterSpacing: "var(--font-heading-3-letter-spacing)",
    },
  },
];

const bodyStyles: TypeStyleData[] = [
  {
    name: "Title",
    weight: "SemiBold",
    size: "16px",
    lineHeight: "24px",
    letterSpacing: "-1%",
    previewStyle: {
      fontFamily: "var(--font-title-body-family)",
      fontSize: "var(--font-title-body-size)",
      fontWeight: "var(--font-title-body-weight)" as unknown as number,
      lineHeight: "var(--font-title-body-line-height)",
      letterSpacing: "var(--font-title-body-letter-spacing)",
    },
  },
  {
    name: "Paragraph Em",
    weight: "Medium",
    size: "16px",
    lineHeight: "24px",
    letterSpacing: "-1%",
    previewStyle: {
      fontFamily: "var(--font-paragraph-em-family)",
      fontSize: "var(--font-paragraph-em-size)",
      fontWeight: "var(--font-paragraph-em-weight)" as unknown as number,
      lineHeight: "var(--font-paragraph-em-line-height)",
      letterSpacing: "var(--font-paragraph-em-letter-spacing)",
    },
  },
  {
    name: "Paragraph",
    weight: "Regular",
    size: "16px",
    lineHeight: "24px",
    letterSpacing: "0",
    previewStyle: {
      fontFamily: "var(--font-paragraph-family)",
      fontSize: "var(--font-paragraph-size)",
      fontWeight: "var(--font-paragraph-weight)" as unknown as number,
      lineHeight: "var(--font-paragraph-line-height)",
      letterSpacing: "var(--font-paragraph-letter-spacing)",
    },
  },
  {
    name: "Paragraph SM Em",
    weight: "Medium",
    size: "14px",
    lineHeight: "20px",
    letterSpacing: "0",
    previewStyle: {
      fontFamily: "var(--font-paragraph-sm-em-family)",
      fontSize: "var(--font-paragraph-sm-em-size)",
      fontWeight: "var(--font-paragraph-sm-em-weight)" as unknown as number,
      lineHeight: "var(--font-paragraph-sm-em-line-height)",
      letterSpacing: "var(--font-paragraph-sm-em-letter-spacing)",
    },
  },
  {
    name: "Paragraph SM",
    weight: "Regular",
    size: "14px",
    lineHeight: "20px",
    letterSpacing: "0",
    previewStyle: {
      fontFamily: "var(--font-paragraph-sm-family)",
      fontSize: "var(--font-paragraph-sm-size)",
      fontWeight: "var(--font-paragraph-sm-weight)" as unknown as number,
      lineHeight: "var(--font-paragraph-sm-line-height)",
      letterSpacing: "var(--font-paragraph-sm-letter-spacing)",
    },
  },
  {
    name: "Overline",
    weight: "SemiBold",
    size: "14px",
    lineHeight: "20px",
    letterSpacing: "+8%",
    previewStyle: {
      fontFamily: "var(--font-overline-family)",
      fontSize: "var(--font-overline-size)",
      fontWeight: "var(--font-overline-weight)" as unknown as number,
      lineHeight: "var(--font-overline-line-height)",
      letterSpacing: "var(--font-overline-letter-spacing)",
      textTransform: "uppercase" as const,
    },
  },
  {
    name: "Caption",
    weight: "Regular",
    size: "12px",
    lineHeight: "16px",
    letterSpacing: "0",
    previewStyle: {
      fontFamily: "var(--font-caption-family)",
      fontSize: "var(--font-caption-size)",
      fontWeight: "var(--font-caption-weight)" as unknown as number,
      lineHeight: "var(--font-caption-line-height)",
      letterSpacing: "var(--font-caption-letter-spacing)",
    },
  },
];

/* Code — the one sanctioned monospace context (--font-family-code).
   Sizing rides the Paragraph SM scale; only the family changes. */
const codeStyles: TypeStyleData[] = [
  {
    name: "Code",
    weight: "Regular",
    size: "14px",
    lineHeight: "20px",
    letterSpacing: "0",
    previewStyle: {
      fontFamily: "var(--font-family-code)",
      fontSize: "var(--font-paragraph-sm-size)",
      fontWeight: "var(--font-paragraph-sm-weight)" as unknown as number,
      lineHeight: "var(--font-paragraph-sm-line-height)",
      letterSpacing: "var(--font-paragraph-sm-letter-spacing)",
    },
  },
];

const typeSections = [
  { title: "Mega", styles: megaStyles },
  { title: "Display", styles: displayStyles },
  { title: "Heading", styles: headingStyles },
  { title: "Body", styles: bodyStyles },
  { title: "Code", styles: codeStyles },
];

/* ============================================
   PAGE
   ============================================ */

const viewportTabs = [
  { value: "desktop", label: "Desktop", icon: "desktop_windows" },
  { value: "mobile", label: "Mobile", icon: "smartphone" },
];

export default function TypographyPage() {
  const [viewport, setViewport] = useState("desktop");
  const isMobileView = viewport === "mobile";

  return (
    <>

      <MegaNav />

      <div className={styles.dsLayout}>
        <Sidebar links={sidebarLinks} />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          {/* Page Title */}
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Typography</h1>
            <PageLinks
              figmaUrl="https://www.figma.com/design/8NzqDS8iRsBTFPbNGj3Woj/robr0-ds26?node-id=191-1656"
              storybookPath="/?path=/docs/foundations-typography--docs"
            />
          </div>

          {/* Intro */}
          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Everything is set in{" "}
              <a
                href="https://fonts.google.com/specimen/Nunito+Sans"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.fontLink}
              >
                Nunito Sans
              </a>
            </p>
            <p className={styles.introBody}>
              Mega and Display styles are for hero moments and landing pages. Headings structure sections. Title is for bold labels. Paragraph Em is the default for buttons and interactive controls. Paragraph is body copy. The SM variants scale each of those down for compact components and secondary text. Overline is the uppercase label face, always paired with an uppercase transform at the use site. Caption is the floor, for footnotes and disclaimers only.
            </p>
            <p className={styles.introBody}>
              Every style chains its family through one of two role tokens: the
              display and heading styles read <code>--font-family-heading</code>,
              the body styles read <code>--font-family-body</code>, and both
              resolve to <code>--font-family-primary</code>. This site keeps the
              roles on one face by design. Consumers of the package can point
              them at different faces to pair a heading font with a body font,
              and preview pairings in the playground.
            </p>
          </div>

          {/* Viewport toggle — Mega/Display/Sub-display step down below
              768px; headings and body hold at every size. */}
          <div className={`${styles.viewportToggle} animate-in animate-delay-2`}>
            <Tabs
              tabs={viewportTabs}
              activeTab={viewport}
              onTabChange={setViewport}
              ariaLabel="Token values by viewport"
            />
            <p className={styles.viewportNote}>
              {isMobileView
                ? "Below 768px the display tier steps down automatically. Headings and body never step."
                : "Above 768px every style renders at its full size."}
            </p>
          </div>

          {/* Type Sections */}
          {typeSections.map((section, idx) => (
            <section
              key={section.title}
              className={`${styles.typeSection}${idx < 2 ? " animate-in animate-delay-2" : ""}`}
            >
              <SectionTitle title={section.title} />

              <div className={styles.typeStyles}>
                {section.styles.map((t) => {
                  const m = isMobileView ? t.mobile : undefined;
                  return (
                    <TypographySwatch
                      key={t.name}
                      name={t.name}
                      weight={t.weight}
                      size={m?.size ?? t.size}
                      lineHeight={m?.lineHeight ?? t.lineHeight}
                      letterSpacing={t.letterSpacing}
                      previewStyle={
                        m ? { ...t.previewStyle, ...m.previewStyle } : t.previewStyle
                      }
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </main>
      </div>

    </>
  );
}
