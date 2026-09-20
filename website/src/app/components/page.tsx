import MegaNav from "../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../components/Sidebar/ComponentsSidebar";
import PageLinks from "../../components/PageLinks/PageLinks";
import ComponentCardGrid from "../../components/ComponentCardGrid/ComponentCardGrid";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import {
  componentMetadata,
  componentCategoryMetadata,
} from "@robr0/design-system/components/registry";
import styles from "./page.module.css";

export default function ComponentsPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          {/* Page Title */}
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Components</h1>
            <PageLinks figmaUrl="https://www.figma.com/design/8NzqDS8iRsBTFPbNGj3Woj/robr0-ds26?node-id=113-6513" storybookPath="/?path=/docs/components-button--docs" />
          </div>

          {/* Intro */}
          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Every building block in one place
            </p>
            <p className={styles.introBody}>
              Each component is built on the colour, spacing, and typography tokens from the foundations pages. They all share the same padding rules, focus styles, and sizing conventions so they feel consistent when combined. Click into any component to see its variants, states, and sizing options.
            </p>
          </div>

          {/* One section per category, cards alphabetical within */}
          <div className={`${styles.categorySections} animate-in animate-delay-2`}>
            {componentCategoryMetadata.map((cat) => (
              <section key={cat.id} id={cat.id} className={styles.categorySection}>
                <SectionTitle
                  title={cat.label}
                  trailing={`${componentMetadata.filter((c) => c.category === cat.id).length}`}
                  divider={false}
                />
                <ComponentCardGrid
                  components={componentMetadata.filter((c) => c.category === cat.id)}
                />
              </section>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
