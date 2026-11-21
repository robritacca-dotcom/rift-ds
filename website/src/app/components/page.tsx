import { sectionLandingMetadata } from "@/config/navigation";
import MegaNav from "../../components/MegaNav/MegaNav";
import ComponentsSidebar from "../../components/Sidebar/ComponentsSidebar";
import ComponentsIndex from "./ComponentsIndex";
import styles from "./page.module.css";

// Page-level, so it never cascades to the sub-pages (see sectionLandingMetadata).
export const metadata = sectionLandingMetadata("/components");

export default function ComponentsPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <ComponentsIndex />
        </main>
      </div>
    </>
  );
}
