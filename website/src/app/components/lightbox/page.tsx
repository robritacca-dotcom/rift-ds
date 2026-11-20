"use client";

import React, { useState } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Lightbox } from "rift-ds/components/Lightbox/Lightbox";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";
import { PHOTO_LANDSCAPE, PHOTO_PORTRAIT, PHOTOS } from "@/lib/attachment-demo";

/** The sample pictures every attachment and media demo draws from. */
const SHOTS = [
  {
    src: PHOTO_LANDSCAPE,
    alt: "A figure in a glowing canyon below snowy peaks",
    caption: "A lone figure at the mouth of the canyon.",
  },
  {
    src: PHOTOS[3],
    alt: "A blue beam of light rising over dark cliffs",
    caption: "A beam of light over the falls at night.",
  },
  {
    src: PHOTO_PORTRAIT,
    alt: "A green mountain split by a long crack",
    caption: "A fault running up a green peak, at its own tall shape.",
  },
];

export default function LightboxPage() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const shot = SHOTS[index];
  const count = SHOTS.length;

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Lightbox</h1>
            <PageLinks storybookPath="/?path=/docs/components-lightbox--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              The image, and nothing else
            </p>
            <p className={styles.introBody}>
              The fullscreen media viewer: a shot centred over a deep frosted scrim, with a caption chip and gallery stepping. It rides the same shared overlay machinery as the dialogs, so Escape, the focus trap, the inert page behind, and the counted scroll lock all come for free.
            </p>
          </div>

          {/* Gallery */}
          <section className={styles.section}>
            <SectionTitle title="Gallery" />
            <p className={styles.sectionNote}>
              Click a shot to open it. The chevrons and the arrow keys step through the set; the consumer owns the collection and the index.
            </p>
            <div className={styles.thumbGrid}>
              {SHOTS.map(({ src, alt }, i) => (
                <button
                  key={alt}
                  type="button"
                  className={styles.thumb}
                  onClick={() => {
                    setIndex(i);
                    setOpen(true);
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={alt} />
                </button>
              ))}
            </div>
          </section>

          <Lightbox
            open={open}
            onOpenChange={setOpen}
            src={shot.src}
            alt={shot.alt}
            caption={shot.caption}
            onPrev={() => setIndex((i) => (i - 1 + count) % count)}
            onNext={() => setIndex((i) => (i + 1) % count)}
          />

          <ComponentInstallStrip slug="lightbox" />
        </main>
      </div>
    </>
  );
}
