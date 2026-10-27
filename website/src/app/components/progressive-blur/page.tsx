import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { ProgressiveBlur } from "rift-ds/components/ProgressiveBlur/ProgressiveBlur";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";
import styles from "./page.module.css";

/* Rows of content for the blur to work on: a swatch and a line of text,
   the shape of a page scrolling under a bar. */
const ROWS = [
  "--color-status-info-text",
  "--color-status-positive-text",
  "--color-status-warning-text",
  "--color-status-error-text",
  "--color-status-info-text",
  "--color-status-positive-text",
];

function Demo({
  side,
  tinted,
  label,
}: {
  side: "top" | "bottom";
  tinted: boolean;
  label: string;
}) {
  return (
    <figure className={styles.demo}>
      <div className={styles.surface}>
        <div className={styles.rows} aria-hidden="true">
          {ROWS.map((token, i) => (
            <div key={i} className={styles.row}>
              <span className={styles.swatch} style={{ background: `var(${token})` }} />
              <span className={styles.line}>Content scrolling under the bar</span>
            </div>
          ))}
        </div>
        <ProgressiveBlur side={side} tinted={tinted} />
      </div>
      <figcaption className={styles.caption}>{label}</figcaption>
    </figure>
  );
}

/* ============================================
   PAGE
   ============================================ */

export default function ProgressiveBlurPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Progressive blur</h1>
            <PageLinks storybookPath="/?path=/docs/components-progressiveblur--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>A blur with no hard edge</p>
            <p className={styles.introBody}>
              A single sheet of frosted glass ends in a line where the blur stops. Progressive blur stacks four
              layers of rising strength, each fading out sooner than the last, so the page is frosted at one side
              and sharp by the other. It fills its positioned parent, sits behind a header or a toolbar, and lets
              the pointer through. The site header on this page sits on one.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="Sides" />
            <p className={styles.introBody}>
              Anchor it to the top behind a header, or to the bottom behind a toolbar or a footer bar.
            </p>
            <div className={styles.grid2}>
              <Demo side="top" tinted={false} label="Top" />
              <Demo side="bottom" tinted={false} label="Bottom" />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Tint" />
            <p className={styles.introBody}>
              <code>tinted</code> lays the page surface over the blur, strongest at the anchored side. The tint fades
              when it changes and the blur never does, so a header can bring it in once the page has scrolled
              without the blur snapping. Point <code>--ds-progressive-blur-tint</code> at another surface when the
              blur sits over one.
            </p>
            <div className={styles.grid2}>
              <Demo side="top" tinted={false} label="Blur only" />
              <Demo side="top" tinted label="Tinted" />
            </div>
          </section>

          <ComponentInstallStrip slug="progressive-blur" />
        </main>
      </div>
    </>
  );
}
