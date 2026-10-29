import Link from "next/link";
import { sectionLandingMetadata } from "@/config/navigation";
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
// Page-level, so it never cascades to the sub-pages (see sectionLandingMetadata).
export const metadata = sectionLandingMetadata("/templates");

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
              A template is a complete product screen made only from the
              library’s components and tokens, so it follows every theme. Open
              one to use it full screen, and take it as a reference for your
              own. To start an app from the same pieces, the{" "}
              <Link href="/docs/blocks" className={styles.inlineLink}>
                blocks
              </Link>{" "}
              install as pages you own.
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
