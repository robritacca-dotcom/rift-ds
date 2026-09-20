"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Breadcrumb } from "@robr0/design-system/components/Breadcrumb/Breadcrumb";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

export default function BreadcrumbPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Breadcrumb</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-breadcrumb--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              The page&apos;s place in the hierarchy
            </p>
            <p className={styles.introBody}>
              A horizontal trail of links that shows the user&apos;s current location within the site hierarchy. Middle items collapse automatically when the path is long.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <Breadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "Components", href: "/components" },
                { label: "Breadcrumb" },
              ]}
            />
          </section>

          {/* Long path. The demo trails point at "#", not realistic-looking
              paths: an href is invisible in the rendered breadcrumb, and live
              anchors to fictional routes hand every crawler (and every
              curious click) a 404. */}
          <section className={styles.section}>
            <SectionTitle title="Long path" />
            <Breadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "Products", href: "#" },
                { label: "Category", href: "#" },
                { label: "Subcategory", href: "#" },
                { label: "Item detail" },
              ]}
            />
          </section>

          {/* Collapsed */}
          <section className={styles.section}>
            <SectionTitle title="Collapsed" />
            <Breadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "Section", href: "#" },
                { label: "Category", href: "#" },
                { label: "Components", href: "#" },
                { label: "Breadcrumb" },
              ]}
              maxItems={3}
            />
          </section>
        </main>
      </div>

    </>
  );
}
