"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Skeleton } from "@robr0/design-system/components/Skeleton/Skeleton";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

export default function SkeletonPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Skeleton</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-skeleton--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Placeholders while content loads
            </p>
            <p className={styles.introBody}>
              Skeletons indicate where content will appear, reducing perceived wait time. Available as text lines, circles, or rectangles to match the shape of the content being loaded.
            </p>
          </div>

          {/* Text */}
          <section className={styles.section}>
            <SectionTitle title="Text" />
            <div className={styles.variantStack} style={{ maxWidth: "300px" }}>
              <Skeleton variant="text" width="200px" />
              <Skeleton variant="text" lines={3} width="280px" />
            </div>
          </section>

          {/* Circular */}
          <section className={styles.section}>
            <SectionTitle title="Circular" />
            <div className={styles.variantRow}>
              <Skeleton variant="circular" width="32px" height="32px" />
              <Skeleton variant="circular" width="48px" height="48px" />
              <Skeleton variant="circular" width="64px" height="64px" />
            </div>
          </section>

          {/* Rectangular */}
          <section className={styles.section}>
            <SectionTitle title="Rectangular" />
            <Skeleton variant="rectangular" width="300px" height="120px" />
          </section>

          {/* Card placeholder */}
          <section className={styles.section}>
            <SectionTitle title="Card placeholder" />
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", maxWidth: "300px" }}>
              <Skeleton variant="circular" width="40px" height="40px" />
              <div style={{ flex: 1 }}>
                <Skeleton variant="text" lines={3} />
              </div>
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
