import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { SiteHeader, type SiteHeaderSection } from "rift-ds/components/SiteHeader/SiteHeader";
import { CircularButton } from "rift-ds/components/CircularButton/CircularButton";
import { CommandPaletteTrigger } from "rift-ds/components/CommandPaletteTrigger/CommandPaletteTrigger";
import { ThemeToggle } from "rift-ds/components/ThemeToggle/ThemeToggle";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";
import styles from "./page.module.css";

/* A fictional docs site: the header's shape, not this site's pages. The
   links are in-page anchors, so following one leaves the reader here. */
const SECTIONS: SiteHeaderSection[] = [
  {
    id: "docs",
    label: "Docs",
    href: "#docs",
    mega: {
      items: [
        { href: "#docs-guides", label: "Guides", description: "Step-by-step walkthroughs from install to first release.", icon: "menu_book" },
        { href: "#docs-recipes", label: "Recipes", description: "Short answers to the questions that come up every week.", icon: "restaurant" },
        { href: "#docs-api", label: "API reference", description: "Every endpoint, parameter and error, generated from source.", icon: "data_object" },
        { href: "#docs-changelog", label: "Changelog", description: "What changed in each version and how to move to it.", icon: "history" },
      ],
    },
  },
  {
    id: "examples",
    label: "Examples",
    href: "#examples",
    mega: {
      items: [
        { href: "#examples-blog", label: "Blog", description: "Posts, tags and an RSS feed.", icon: "article" },
        { href: "#examples-shop", label: "Shop", description: "A catalogue, a cart and a checkout.", icon: "storefront" },
        { href: "#examples-dashboard", label: "Dashboard", description: "Charts and tables over live data.", icon: "monitoring" },
      ],
    },
  },
  { id: "pricing", label: "Pricing", href: "#pricing", current: true },
  { id: "blog", label: "Blog", href: "#blog" },
];

const brand = (
  <span className={styles.brand}>
    <span className="material-symbols-rounded" aria-hidden="true">deployed_code</span>
    Acme
  </span>
);

const search = <CircularButton icon="search" variant="secondary" tone="neutral" ariaLabel="Search" tooltip={false} />;

/* The condensed demo's two sets: the same controls, then their narrower forms. */
const fullActions = (
  <>
    <CommandPaletteTrigger size="compact" className={styles.searchField} />
    <ThemeToggle size="compact" showLabels={false} />
  </>
);

const condensedActions = (
  <>
    <CommandPaletteTrigger size="compact" iconOnly />
    <ThemeToggle size="compact" cycle />
  </>
);

/* ============================================
   PAGE
   ============================================ */

export default function SiteHeaderPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Site header</h1>
            <PageLinks storybookPath="/?path=/docs/components-siteheader--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>A whole site’s navigation in one bar</p>
            <p className={styles.introBody}>
              The brand, a pill for each section with a mega menu on any section that has one, and actions at the
              end. It sticks to the top of the viewport over a progressive blur, and the blur’s tint arrives once
              the page scrolls. When the pills no longer fit, the bar folds to a menu button that opens a drawer of
              the same sections. The header at the top of this page is one.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="Sections and menus" />
            <p className={styles.introBody}>
              Hover or focus Docs or Examples to open its menu, and press the down arrow on a focused pill to step into
              it. The current section takes the action colour, marked here on Pricing.
            </p>
            <div className={styles.frame}>
              <SiteHeader brand={brand} sections={SECTIONS} actions={search} sticky={false} navLabel="Example" />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Condensing first" />
            <p className={styles.introBody}>
              Give the header a narrower set of the same controls and it uses them before it folds: when the full row
              stops fitting, the search field becomes its icon circle and the mode strip one circle that steps through
              the settings, and the pills stay. Only when that row runs out of room too does the bar fold.
            </p>
            <div className={`${styles.frame} ${styles.frameMid}`}>
              <SiteHeader
                brand={brand}
                sections={SECTIONS}
                actions={fullActions}
                condensedActions={condensedActions}
                sticky={false}
                navLabel="Example, condensed"
              />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="The fold" />
            <p className={styles.introBody}>
              The bar measures itself rather than the viewport, so it folds exactly when its pills stop fitting,
              whatever the number of sections, the length of the labels or the room a docked panel leaves. Folded, the
              menu button opens a drawer of the same sections.
            </p>
            <div className={`${styles.frame} ${styles.frameNarrow}`}>
              <SiteHeader brand={brand} sections={SECTIONS} actions={search} sticky={false} navLabel="Example, folded" />
            </div>
          </section>

          <ComponentInstallStrip slug="site-header" />
        </main>
      </div>
    </>
  );
}
