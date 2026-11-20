"use client";

import React from "react";
import Image from "next/image";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Figure } from "rift-ds/components/Figure/Figure";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";
import { PHOTO_LANDSCAPE, PHOTOS } from "@/lib/attachment-demo";

export default function FigurePage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Figure</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-figure--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Images with captions, in the article frame
            </p>
            <p className={styles.introBody}>
              A Figure wraps any image (a plain <code>&lt;img&gt;</code> or{" "}
              <code>next/image</code>) in the system&apos;s rounded container with an
              optional caption. Pass an <code>onClick</code> and it becomes zoomable:
              zoom cursor, hover dim, and keyboard activation for lightboxes.
            </p>
          </div>

          {/* With caption */}
          <section className={styles.section}>
            <SectionTitle title="With caption" />
            <Figure caption="A lone figure at the mouth of a glowing canyon.">
              <Image
                src={PHOTO_LANDSCAPE}
                alt="A figure in a glowing canyon below snowy peaks"
                width={768}
                height={480}
              />
            </Figure>
          </section>

          {/* Zoomable */}
          <section className={styles.section}>
            <SectionTitle title="Zoomable" />
            <p className={styles.introBody}>
              With <code>onClick</code> the figure gains the zoom affordance: in an
              article layout this opens the lightbox.
            </p>
            <Figure
              caption="Zoomable: click or press Enter to trigger the handler."
              onClick={() => window.alert("In an article layout this opens the lightbox.")}
            >
              <Image
                src={PHOTOS[1]}
                alt="A green mountain split by a long crack"
                width={768}
                height={768}
              />
            </Figure>
          </section>

          <ComponentInstallStrip slug="figure" />
        </main>
      </div>

    </>
  );
}
