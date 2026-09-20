"use client";

import React, { useState } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Lightbox } from "@robr0/design-system/components/Lightbox/Lightbox";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

/** Offline demo image: a labelled gradient drawn as SVG, no asset to fetch. */
const demoImage = (label: string, from: string, to: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750">` +
      `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
      `<stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>` +
      `</linearGradient></defs>` +
      `<rect width="1200" height="750" fill="url(#g)"/>` +
      `<text x="600" y="390" font-family="sans-serif" font-size="64" fill="rgba(255,255,255,0.85)" text-anchor="middle">${label}</text>` +
      `</svg>`,
  )}`;

const SHOTS = [
  {
    src: demoImage("Dashboard", "#0E6E8F", "#052F3E"),
    alt: "Dashboard overview",
    caption: "The dashboard after the redesign.",
  },
  {
    src: demoImage("Detail view", "#9E47EF", "#1E47B0"),
    alt: "Record detail view",
    caption: "One record, fully expanded.",
  },
  {
    src: demoImage("Mobile", "#EF476F", "#552716"),
    alt: "Mobile layout",
    caption: "The same flow at phone width.",
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
        </main>
      </div>
    </>
  );
}
