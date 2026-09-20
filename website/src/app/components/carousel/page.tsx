"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Carousel } from "@robr0/design-system/components/Carousel/Carousel";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

const slides = [
  { bg: "var(--color-status-info-bg)", label: "Slide 1" },
  { bg: "var(--color-status-positive-bg)", label: "Slide 2" },
  { bg: "var(--color-status-warning-bg)", label: "Slide 3" },
  { bg: "var(--color-status-error-bg)", label: "Slide 4" },
];

export default function CarouselPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Carousel</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-carousel--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Browse content one slide at a time
            </p>
            <p className={styles.introBody}>
              A sliding content viewer with arrow navigation, dot indicators, optional auto-play, and keyboard support. Auto-play pauses on hover or keyboard focus, and never starts at all when the reader prefers reduced motion.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <div className={styles.carouselDemo}>
              <Carousel>
                {slides.map((slide, i) => (
                  <div key={i} className={styles.slideContent} style={{ backgroundColor: slide.bg }}>
                    {slide.label}
                  </div>
                ))}
              </Carousel>
            </div>
          </section>

          {/* Loop */}
          <section className={styles.section}>
            <SectionTitle title="Loop" />
            <div className={styles.carouselDemo}>
              <Carousel loop>
                {slides.map((slide, i) => (
                  <div key={i} className={styles.slideContent} style={{ backgroundColor: slide.bg }}>
                    {slide.label}
                  </div>
                ))}
              </Carousel>
            </div>
          </section>

          {/* Auto-play */}
          <section className={styles.section}>
            <SectionTitle title="Auto-play" />
            <div className={styles.carouselDemo}>
              <Carousel autoPlay autoPlayInterval={3000} loop>
                {slides.map((slide, i) => (
                  <div key={i} className={styles.slideContent} style={{ backgroundColor: slide.bg }}>
                    {slide.label}
                  </div>
                ))}
              </Carousel>
            </div>
          </section>

          {/* Dots only */}
          <section className={styles.section}>
            <SectionTitle title="Dots only" />
            <div className={styles.carouselDemo}>
              <Carousel showArrows={false}>
                {slides.map((slide, i) => (
                  <div key={i} className={styles.slideContent} style={{ backgroundColor: slide.bg }}>
                    {slide.label}
                  </div>
                ))}
              </Carousel>
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
