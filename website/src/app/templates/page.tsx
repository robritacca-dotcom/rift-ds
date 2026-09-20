"use client";

import MegaNav from "../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import TemplateShowcase from "./TemplateShowcase";
import styles from "./page.module.css";

/**
 * The templates index deliberately breaks the section-index formula: no
 * sidebar and no card grid. A template's whole point is the full screen, so
 * the page shows one — a live, scaled preview in a carousel of the built
 * templates. The sidebar would only offer links that eject the reader into
 * a chromeless page; the preview is the navigation.
 */
export default function TemplatesPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          {/* Page Title */}
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Templates</h1>
          </div>

          {/* Intro */}
          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Whole screens built from the system alone
            </p>
            <p className={styles.introBody}>
              A template is a complete screen assembled from the library: every
              control is a component, and every colour, space, and type style
              resolves to a semantic token. The first began as a labs rebuild
              of a reference product, a way to find where the system falls
              short; the others are original screens, composed to
              stretch the parts a rebuild never reaches. All data in them is
              fictional. Each preview below is the template itself, live and
              following the site’s theme; open one to use it full screen.
            </p>
          </div>

          <div className={`${styles.showcaseSection} animate-in animate-delay-2`}>
            <TemplateShowcase />
          </div>
        </main>
      </div>
    </>
  );
}
