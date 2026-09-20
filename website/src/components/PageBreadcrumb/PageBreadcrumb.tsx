"use client";

import { usePathname } from "next/navigation";
import { Breadcrumb } from "@robr0/design-system/components/Breadcrumb/Breadcrumb";
import { getBreadcrumbs } from "@/config/navigation";
import { buildBreadcrumbJsonLd } from "@/lib/structuredData";
import styles from "./PageBreadcrumb.module.css";

interface PageBreadcrumbProps {
  /**
   * Real title for the current page, when it can't be derived from the URL —
   * e.g. feed-driven article titles, where title-casing the slug loses
   * punctuation ("Youre Not Building…"). Replaces the last crumb's label.
   */
  currentLabel?: string;
}

/**
 * Renders the current page's breadcrumb trail based on the URL.
 * Returns nothing for top-level pages where no trail is needed
 * (home, /contact, /about, /work).
 */
export default function PageBreadcrumb({ currentLabel }: PageBreadcrumbProps) {
  const pathname = usePathname() ?? "/";
  let items = getBreadcrumbs(pathname);

  if (items.length === 0) return null;

  if (currentLabel) {
    items = items.map((item, i) =>
      i === items.length - 1 ? { ...item, label: currentLabel } : item
    );
  }

  return (
    <div className={styles.wrap}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(items)) }}
      />
      <Breadcrumb items={items} />
    </div>
  );
}
