import React from "react";
import Link from "next/link";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import PipelineWireframe from "@/components/PipelineWireframe/PipelineWireframe";
import { MegaMenu, type MegaMenuItem } from "rift-ds/components/MegaMenu/MegaMenu";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";
import styles from "./page.module.css";

/* A fictional docs site's menu: the panel's shape, not this site's pages. */
const ITEMS: MegaMenuItem[] = [
  { href: "#guides", label: "Guides", description: "Step-by-step walkthroughs from install to first release.", icon: "menu_book" },
  { href: "#recipes", label: "Recipes", description: "Short answers to the questions that come up every week.", icon: "restaurant" },
  { href: "#api", label: "API reference", description: "Every endpoint, parameter and error, generated from source.", icon: "data_object" },
  { href: "#changelog", label: "Changelog", description: "What changed in each version and how to move to it.", icon: "history" },
  { href: "#examples", label: "Examples", description: "Small complete apps to copy from.", icon: "deployed_code" },
  { href: "#community", label: "Community", description: "Forums, office hours and the people answering in them.", icon: "forum" },
];

const SHOWCASE = {
  href: "#tour",
  overline: "New here",
  label: "Start with the tour",
  description: "Ten minutes from an empty folder to a deployed app.",
  cover: <PipelineWireframe />,
};

/* ============================================
   PAGE
   ============================================ */

export default function MegaMenuPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Mega menu</h1>
            <PageLinks storybookPath="/?path=/docs/components-megamenu--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>A section of a site at a glance</p>
            <p className={styles.introBody}>
              A wide panel of link rows, each with an icon and a line on what the page holds, beside an optional
              featured card. It is the panel only: the host places it and owns the triggers, so it owns{" "}
              <code>open</code> too. Hover a section in this site’s header to see one in place;{" "}
              <Link href="/components/site-header">Site header</Link> is the reference host.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="With a showcase" />
            <p className={styles.introBody}>
              The rows run four to a column in two thirds of the panel, and the card fills the last third, its cover
              stretching to whatever height the rows reach.
            </p>
            <MegaMenu open items={ITEMS} showcase={SHOWCASE} />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Rows only" />
            <p className={styles.introBody}>
              Without a showcase the rows take the whole panel and wrap into further columns, so a long menu grows
              sideways and never into a scroll.
            </p>
            <MegaMenu open items={ITEMS} />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Current page" />
            <p className={styles.introBody}>
              <code>currentHref</code> marks the row for the page being viewed, or a parent of it, one step past the
              hover wash so the two never read the same.
            </p>
            <MegaMenu open items={ITEMS} currentHref="#api" />
          </section>

          <ComponentInstallStrip slug="mega-menu" />
        </main>
      </div>
    </>
  );
}
