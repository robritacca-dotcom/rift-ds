"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { CodeBlock } from "rift-ds/components/CodeBlock/CodeBlock";
import { Table } from "rift-ds/components/Table/Table";
import PageLinks from "../../../components/PageLinks/PageLinks";
import { BlockPreview } from "../../docs/blocks/BlockPreview";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

const USAGE = `<SiteLayout
  width="contained"
  sidebarDock="edge"
  asidePlacement="column"
  readingWidth
  header={<SiteHeader brand="Acme" sections={sections} foldBelow="tablet" />}
  sidebar={<NavList items={pages} size="compact" scrollable currentHref={path} />}
  aside={<AnchorNav fromHeadings={{ root: '#main' }} />}
  footer={<SiteFooter columns={columns} />}
>
  <article>…</article>
</SiteLayout>`;

const LEVERS = [
  { id: "width", prop: "width", values: "contained (default), full", does: "How wide the columns run: centred at 1440px, or edge to edge with the gutter" },
  { id: "containedWidth", prop: "containedWidth", values: "narrow, default (default), wide", does: "The contained width's step: 1200px, 1440px or 1680px, followed by the header and the footer" },
  { id: "headerWidth", prop: "headerWidth", values: "contained, full", does: "The header bar's width; moves with the dock (full when edge-docked, the page width beside the content), set only to break the pairing" },
  { id: "footerWidth", prop: "footerWidth", values: "contained, full", does: "The footer row's width; moves with the header, set only to break the pairing" },
  { id: "sidebarDock", prop: "sidebarDock", values: "content (default), edge", does: "The sidebar as the row's first column, or docked to the window's start edge behind a hairline; the header and the footer move with it" },
  { id: "asidePlacement", prop: "asidePlacement", values: "column (default), edge", does: "The aside as a column after the content, or pinned to the window's end edge as AnchorNav's floating minimap" },
  { id: "readingWidth", prop: "readingWidth", values: "true, false (default)", does: "The main column held to about 75 characters, centred, while the page is contained" },
  { id: "reserve", prop: "--ds-site-layout-reserve-end", values: "a length, 0 by default", does: "Room the frame gives up at its end edge for a docked panel, such as a chat; an edge aside moves in with it" },
] as const;

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
              A header, a sidebar of pages, the content, an on-this-page aside and a footer, laid out by choices you
              set apart: how wide the page, the header and the footer each run, where the sidebar docks and where the
              aside sits. Any combination holds. The sidebar sticks below the header and scrolls on its own, the aside
              gives way on a laptop, and on a tablet or phone the header&apos;s one menu carries the sidebar&apos;s pages.
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
            <SectionTitle title="Layout levers" />
            <p className={styles.demoText}>
              Every lever is a prop on SiteLayout, so a swap is one value changed in one place. The widths read the
              shell recipe&apos;s width axis, the same one AppLayout and the templates read, apart from any shell mode.
            </p>
            <Table
              columns={[
                { key: "prop", header: "Prop", mono: true },
                { key: "values", header: "Values" },
                { key: "does", header: "What it sets" },
              ]}
              rows={LEVERS.map((l) => ({ id: l.id, cells: { prop: l.prop, values: l.values, does: l.does } }))}
              bordered
            />
            <CodeBlock code={USAGE} language="tsx" />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Responsive" />
            <p className={styles.demoText}>
              Below 1152px a column aside gives way. Below 960px the sidebar and an edge aside leave the page and the
              content takes the header&apos;s gutter. Give each SiteHeader section its pages as{" "}
              <code>drawerItems</code> and set <code>foldBelow=&quot;tablet&quot;</code>, so the header folds at the
              same step and its menu carries the sidebar&apos;s pages: a reader has one menu, never two.
            </p>
          </section>

          <ComponentInstallStrip slug="site-layout" />
        </main>
      </div>
    </>
  );
}
