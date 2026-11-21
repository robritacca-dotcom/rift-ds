import { sectionLandingMetadata } from "@/config/navigation";
import ComponentsIndex from "./ComponentsIndex";
import styles from "./page.module.css";

// Page-level, so it never cascades to the sub-pages (see sectionLandingMetadata).
export const metadata = sectionLandingMetadata("/components");

export default function ComponentsPage() {
  return (
    <div className={styles.dsContent}>
      <ComponentsIndex />
    </div>
  );
}
