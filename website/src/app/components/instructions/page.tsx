"use client";

import React from "react";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import { Instructions } from "rift-ds/components/Instructions/Instructions";
import { CodeBlock } from "rift-ds/components/CodeBlock/CodeBlock";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

export default function InstructionsPage() {
  return (
    <div className={styles.dsContent}>
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

      {/* Rich steps */}
      <section className={styles.section}>
        <SectionTitle title="Rich steps" />
        <div className={styles.variantStack}>
          <Instructions
            title="Set up the project"
            steps={[
              {
                label: "Install the package",
                description: (
                  <>
                    <p>Add it to the app that will render the components.</p>
                    <CodeBlock language="bash" code="npm install rift-ds" />
                  </>
                ),
              },
              {
                label: "Load the tokens",
                description: (
                  <>
                    <p>Import the token stylesheet once, at the root of the app.</p>
                    <CodeBlock language="ts" code={'import "rift-ds/tokens/tokens.css";'} />
                  </>
                ),
              },
              { label: "Render a component", description: "Plain text still sets as a paragraph." },
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
              { label: "Install", description: "npm install rift-ds" },
              { label: "Import tokens", description: "Add token CSS to your app" },
              { label: "Use components", description: "Import and render components" },
            ]}
          />
        </div>
      </section>

      <ComponentInstallStrip slug="instructions" />
    </div>
  );
}
