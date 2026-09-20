"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { CodeBlock } from "@robr0/design-system/components/CodeBlock/CodeBlock";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

const USAGE_SNIPPET = `import { Chip } from '@robr0/design-system/components/Chip/Chip';

<Chip label="Filter" icon="check" selected onClick={toggle} />`;

const TOKEN_SNIPPET = `/* Semantic tokens reference primitives — never skip a tier */
--color-action-primary-bg: var(--primitive-teal-08);   /* #0E6E8F */
--color-text-primary: var(--primitive-neutral-09);     /* #050505 */
--radius-full: var(--primitive-radius-full);           /* 999px */`;

const SCROLL_SNIPPET = `:root {
  --color-action-primary-bg: var(--primitive-teal-08);
  --color-action-primary-bg-hover: var(--primitive-teal-09);
  --color-action-passive-bg: var(--primitive-neutral-02);
  --color-action-passive-bg-hover: var(--primitive-neutral-03);
  --color-bg-page: var(--primitive-white);
  --color-bg-container-primary: var(--primitive-neutral-01);
  --color-bg-container-secondary: var(--primitive-neutral-02);
  --color-bg-container-tertiary: var(--primitive-neutral-03);
  --color-bg-container-border: var(--primitive-neutral-03);
  --color-text-primary: var(--primitive-neutral-09);
  --color-text-secondary: var(--primitive-neutral-07);
  --color-text-tertiary: var(--primitive-neutral-05);
  --color-status-info: var(--primitive-blue-07);
  --color-status-positive: var(--primitive-green-07);
  --color-status-warning: var(--primitive-orange-07);
  --color-status-error: var(--primitive-red-07);
  --color-status-neutral: var(--primitive-neutral-06);
}`;

export default function CodeBlockPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Code block</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-codeblock--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Monospace code with a header and one-click copy
            </p>
            <p className={styles.introBody}>
              The system&apos;s one sanctioned monospace context. An optional header carries a
              filename and language tag; the copy button confirms with a check for two
              seconds. Long lines scroll horizontally inside the block, a{' '}
              <code>maxHeight</code> caps tall snippets with an inner vertical scroll, and{' '}
              <code>collapsible</code> folds the whole code area behind a chevron.
            </p>
          </div>

          {/* With header */}
          <section className={styles.section}>
            <SectionTitle title="With filename and language" />
            <CodeBlock code={TOKEN_SNIPPET} filename="tokens-light.css" language="css" />
          </section>

          {/* Usage snippet */}
          <section className={styles.section}>
            <SectionTitle title="Usage snippet" />
            <p className={styles.introBody}>
              The intended everyday use: component usage examples on these showcase pages.
            </p>
            <CodeBlock code={USAGE_SNIPPET} language="tsx" />
          </section>

          {/* Collapsible */}
          <section className={styles.section}>
            <SectionTitle title="Collapsible" />
            <p className={styles.introBody}>
              With <code>collapsible</code>, a chevron beside the filename opens and closes
              the code area, the same animation as Accordion. Add{' '}
              <code>defaultCollapsed</code> to start closed.
            </p>
            <CodeBlock
              code={USAGE_SNIPPET}
              filename="ChipExample.tsx"
              language="tsx"
              collapsible
            />
            <CodeBlock
              code={TOKEN_SNIPPET}
              filename="tokens-light.css"
              language="css"
              collapsible
              defaultCollapsed
            />
          </section>

          {/* Constrained height */}
          <section className={styles.section}>
            <SectionTitle title="Constrained height" />
            <p className={styles.introBody}>
              With <code>maxHeight</code>, tall snippets scroll vertically inside the block
              while the header stays pinned. Numbers are pixels; strings pass through as-is.
            </p>
            <CodeBlock
              code={SCROLL_SNIPPET}
              filename="tokens-light.css"
              language="css"
              maxHeight={220}
            />
          </section>

          {/* Bare */}
          <section className={styles.section}>
            <SectionTitle title="Bare (no header)" />
            <CodeBlock code="npm run storybook" showCopy={false} />
          </section>
        </main>
      </div>

    </>
  );
}
