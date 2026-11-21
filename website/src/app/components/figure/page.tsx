"use client";

import React from "react";
import Image from "next/image";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import { Figure } from "rift-ds/components/Figure/Figure";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";
import { PHOTO_LANDSCAPE, PHOTO_PORTRAIT, PHOTOS } from "@/lib/attachment-demo";

export default function FigurePage() {
  return (
    <div className={styles.dsContent}>
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

      <section className={styles.section}>
        <SectionTitle title="Do and Don&apos;t" />
        <div className={styles.kitDemo}>
          <div className={styles.kitPair}>
            <Figure variant="positive" caption="Crop to the subject, so the eye lands where the story is.">
              <Image src={PHOTO_PORTRAIT} alt="A green mountain split by a long crack, cropped close" width={640} height={480} />
            </Figure>
            <Figure variant="error" caption="Leave the subject small in a wide frame of empty sky.">
              <Image src={PHOTO_LANDSCAPE} alt="A small figure in a wide canyon" width={640} height={480} />
            </Figure>
          </div>
          <p className={styles.kitNote}>
            A verdict adds a coloured bar and a Do or Don&apos;t mark in words, so a guideline pair reads without relying on colour. Two figures in a grid make the pair.
          </p>
        </div>
      </section>

      <ComponentInstallStrip slug="figure" />
    </div>
  );
}
