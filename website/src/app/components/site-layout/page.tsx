"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { CodeBlock } from "rift-ds/components/CodeBlock/CodeBlock";
import PageLinks from "../../../components/PageLinks/PageLinks";
import { BlockPreview } from "../../docs/blocks/BlockPreview";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

const USAGE = `<SiteLayout
  width="full"
  sidebarDock="edge"
  header={<SiteHeader brand="Acme" sections={sections} width="full" />}
  sidebar={<NavList items={pages} size="compact" scrollable currentHref={path} />}
  aside={<AnchorNav fromHeadings={{ root: '#main' }} />}
  footer={<SiteFooter columns={columns} />}
>
  <article>…</article>
</SiteLayout>`;

export default function SiteLayoutPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Site layout</h1>
            <PageLinks storybookPath="/?path=/docs/components-sitelayout--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>The frame of a docs site</p>
            <p className={styles.introBody}>
              A header, a sidebar of pages, the content, an on-this-page aside and a footer, laid out by two choices
              you set apart: how wide the page runs, and where the sidebar docks. The sidebar sticks below the header
              and scrolls on its own, the aside gives way on a laptop, and on a phone the sidebar folds into a drawer.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="Live" />
            <BlockPreview src="/docs/blocks/docs" title="The docs block, built on SiteLayout" />
            <p className={styles.demoText}>
              The docs block, <code>npx rift-ds init block docs</code>: a full-width header over a sidebar docked to the
              window&apos;s edge.
            </p>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Width and dock" />
            <p className={styles.demoText}>
              <code>width</code> is <code>contained</code> (the columns centred at 1440px) or <code>full</code>.{" "}
              <code>sidebarDock</code> is <code>content</code> (the sidebar is the row&apos;s first column, centred with
              it) or <code>edge</code> (docked to the window&apos;s start, the content contained in the room after it).
              The header takes its own <code>width</code>, so the three mix freely. AppLayout, the templates and the
              blocks read the same width axis, apart from their shell mode.
            </p>
            <CodeBlock code={USAGE} language="tsx" />
          </section>

          <ComponentInstallStrip slug="site-layout" />
        </main>
      </div>
    </>
  );
}
