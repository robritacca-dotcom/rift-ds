import TocCard from "../TocCard/TocCard";
import { ComponentPreview } from "../ComponentPreviews/ComponentPreviews";
import type { ComponentMeta } from "@robr0/design-system/components/registry";
import styles from "./ComponentCardGrid.module.css";

interface ComponentCardGridProps {
  /** The components to show, one TocCard each; sorted by label before render */
  components: readonly ComponentMeta[];
  className?: string;
}

export default function ComponentCardGrid({ components, className }: ComponentCardGridProps) {
  const sorted = [...components].sort((a, b) => a.label.localeCompare(b.label));
  return (
    <div className={className ? `${styles.tocGrid} ${className}` : styles.tocGrid}>
      {sorted.map((c) => (
        <TocCard key={c.slug} href={`/components/${c.slug}`} title={c.label}>
          <ComponentPreview slug={c.slug} />
        </TocCard>
      ))}
    </div>
  );
}
