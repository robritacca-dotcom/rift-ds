"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Instructions } from "@robr0/design-system/components/Instructions/Instructions";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

export default function InstructionsPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Instructions</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-instructions--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Walk users through a process in order
            </p>
            <p className={styles.introBody}>
              Each step gets a numbered badge and an optional connecting line to the next. Can run vertically for detailed walkthroughs or horizontally for compact progress indicators.
            </p>
          </div>

          {/* Numbered */}
          <section className={styles.section}>
            <SectionTitle title="Numbered" />
            <div className={styles.variantStack}>
              <Instructions
                title="Getting started"
                steps={[
                  { label: "Install dependencies", description: "Run npm install to set up the project." },
                  { label: "Configure tokens", description: "Import the token CSS files into your app entry point." },
                  { label: "Import components", description: "Start using components from the design system." },
                ]}
              />
            </div>
          </section>

          {/* With icons */}
          <section className={styles.section}>
            <SectionTitle title="With icons" />
            <div className={styles.variantStack}>
              <Instructions
                title="Setup pipeline"
                steps={[
                  { label: "Design in Figma", description: "Create components and define tokens.", icon: "palette" },
                  { label: "Generate code", description: "Use Claude Code to read Figma via MCP.", icon: "code" },
                  { label: "Deploy", description: "Push to GitHub and auto-deploy to Vercel.", icon: "rocket_launch" },
                ]}
              />
            </div>
          </section>

          {/* Horizontal */}
          <section className={styles.section}>
            <SectionTitle title="Horizontal" />
            <div className={styles.variantStack} style={{ width: "100%" }}>
              <Instructions
                direction="horizontal"
                numbered={false}
                steps={[
                  { label: "Design", icon: "palette" },
                  { label: "Develop", icon: "code" },
                  { label: "Test", icon: "bug_report" },
                  { label: "Deploy", icon: "rocket_launch" },
                ]}
              />
            </div>
          </section>

          {/* Compact */}
          <section className={styles.section}>
            <SectionTitle title="Compact" />
            <div className={styles.variantStack}>
              <Instructions
                size="compact"
                title="Quick start"
                steps={[
                  { label: "Install", description: "npm install @robr0/design-system" },
                  { label: "Import tokens", description: "Add token CSS to your app" },
                  { label: "Use components", description: "Import and render components" },
                ]}
              />
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
