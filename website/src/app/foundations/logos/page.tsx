"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { EntityCard } from "rift-ds/components/EntityCard/EntityCard";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import { getSidebarLinks, foundationsSidebarLinks } from "@/config/navigation";
import styles from "./page.module.css";
import { FIGMA_FILE_URL } from "@/config/brand.generated";

const { sidebarLinks } = getSidebarLinks(foundationsSidebarLinks, "/foundations/logos");

/* ============================================
   LOGO DATA
   Each entry is { label, file }.
   Grouped into logical categories.
   ============================================ */

interface LogoEntry {
  label: string;
  file: string;
}

interface LogoCategory {
  title: string;
  logos: LogoEntry[];
}

const logoCategories: LogoCategory[] = [
  {
    title: "Brand",
    logos: [
      { label: "mark", file: "mark.svg" },
    ],
  },
  {
    title: "Design & prototyping",
    logos: [
      { label: "Figma", file: "Figma.svg" },
    ],
  },
  {
    title: "Development & infrastructure",
    logos: [
      { label: "React", file: "React.svg" },
      { label: "nextjs black", file: "nextjs black.svg" },
      { label: "nextjs white", file: "nextjs white.svg" },
      { label: "vite", file: "vite.svg" },
      { label: "storybook", file: "storybook.svg" },
      { label: "Git", file: "Git.svg" },
      { label: "npm", file: "npm.svg" },
      { label: "vercel black", file: "vercel black.svg" },
      { label: "vercel white", file: "vercel white.svg" },
    ],
  },
  {
    title: "AI & tooling",
    logos: [
      { label: "Claude", file: "Claude.svg" },
      { label: "ChatGPT", file: "ChatGPT.svg" },
    ],
  },
];

/* ============================================
   PAGE
   ============================================ */

export default function LogosPage() {
  return (
    <>

      <MegaNav />

      <div className={styles.dsLayout}>
        <Sidebar links={sidebarLinks} />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          {/* Page Title */}
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Logos</h1>
            <PageLinks
              figmaUrl={`${FIGMA_FILE_URL}?node-id=253-13813`}
              storybookPath="/?path=/docs/foundations-logos--docs"
            />
          </div>

          {/* Intro */}
          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              SVG logos for the brand and the tools the docs reference
            </p>
            <p className={styles.introBody}>
              Each is sized and exported from a single Figma frame to keep alignment and proportions consistent when used inside cards and layouts.
            </p>
          </div>

          {/* Logo Categories */}
          {logoCategories.map((category, idx) => (
            <section
              key={category.title}
              className={`${styles.logoSection}${idx < 2 ? " animate-in animate-delay-2" : ""}`}
            >
              <SectionTitle title={category.title} trailing={category.logos.length} />

              <div className={styles.logoGrid}>
                {category.logos.map((logo) => (
                  <EntityCard
                    key={logo.file}
                    label={logo.label}
                    imageSrc={`/logos/${logo.file}`}
                    imageAlt={logo.label}
                  />
                ))}
              </div>
            </section>
          ))}
        </main>
      </div>

    </>
  );
}
