"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { BentoTile } from "rift-ds/components/BentoTile/BentoTile";
import { Badge } from "rift-ds/components/Badge/Badge";
import { Sparkline } from "rift-ds/components/Sparkline/Sparkline";
import { Stat } from "rift-ds/components/Stat/Stat";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";
import styles from "./page.module.css";

/* Fictional figures for a fictional product. */
const TREND = [22, 28, 25, 31, 36, 34, 41, 39, 46, 52];
const TEAMS = ["Northwind", "Halcyon", "Meridian", "Lumen", "Basalt", "Cinder", "Tessel"];
const TEXTURES = ["dots", "lines", "rings", "grid", "waves", "rays"] as const;

function Revenue() {
  return (
    <div className={styles.revenue}>
      <Stat label="Monthly revenue" value="$48,210" delta="+12.4%" trend="up" />
      <Sparkline data={TREND} variant="area" tone="accent" width={240} height={48} label="Revenue, last ten months" />
    </div>
  );
}

/* ============================================
   PAGE
   ============================================ */

export default function BentoTilePage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Bento tile</h1>
            <PageLinks storybookPath="/?path=/docs/components-bentotile--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>A feature tile for a bento grid</p>
            <p className={styles.introBody}>
              A heading over a content area that holds anything, seated in a safe inset so it never runs under the
              heading, on a shader pair, a plain surface or nothing. Pass expanded content and the whole tile opens
              into an overlay.
            </p>
          </div>

          {/* ----------------------------------------
              BACKGROUNDS
              ---------------------------------------- */}
          <section className={styles.section}>
            <SectionTitle title="Backgrounds" />
            <p className={styles.sectionBody}>
              The default is a shader pair: a wash of light in the bottom-left corner with a line texture laid over it.
              Solid is the container surface alone, and transparent leaves only the border and the content.
            </p>
            <div className={styles.grid3}>
              <BentoTile title="Shader" description='background="shader"'>
                <Revenue />
              </BentoTile>
              <BentoTile title="Solid" description='background="solid"' background="solid">
                <Revenue />
              </BentoTile>
              <BentoTile title="Transparent" description='background="transparent"' background="transparent">
                <Revenue />
              </BentoTile>
            </div>
          </section>

          {/* ----------------------------------------
              SHADER PAIRS
              ---------------------------------------- */}
          <section className={styles.section}>
            <SectionTitle title="Shader pairs" />
            <p className={styles.sectionBody}>
              Six pairs, and pair N is ambient colour N with texture N. Tiles rotate through them by their position in
              the grid, so shader tiles side by side always differ, and highlight pins one. Both halves follow the
              theme&rsquo;s ambient colours and share one strength.
            </p>
            <div className={styles.grid3}>
              {TEXTURES.map((texture, i) => (
                <BentoTile
                  key={texture}
                  title={`Pair ${i + 1}`}
                  description={`Ambient ${i + 1} with ${texture}`}
                  headingLevel={3}
                  highlight={(i + 1) as 1 | 2 | 3 | 4 | 5 | 6}
                />
              ))}
            </div>
          </section>

          {/* ----------------------------------------
              CONTENT
              ---------------------------------------- */}
          <section className={styles.section}>
            <SectionTitle title="Content" />
            <p className={styles.sectionBody}>
              The content area takes anything. Align places it at the top, middle or foot of the space under the
              heading, and content that does not fit fades out at the edge it overflows rather than being cut. The
              area answers container queries against the tile&rsquo;s own width, so a scene can drop a part when its
              tile is narrow instead of squeezing every part until something truncates.
            </p>
            <div className={styles.grid3}>
              {(["start", "center", "end"] as const).map((align) => (
                <BentoTile key={align} title={`Align ${align}`} background="solid" align={align}>
                  <Badge label="Content" variant="info" />
                </BentoTile>
              ))}
            </div>
            <div className={styles.grid2}>
              <BentoTile title="More than fits" description="Seven rows in a fixed height" background="solid" align="start">
                <div className={styles.rows}>
                  {TEAMS.map((team) => (
                    <Stat key={team} label={team} value="12 seats" />
                  ))}
                </div>
              </BentoTile>
              <BentoTile title="Answers its own width" description="The stat drops out in a narrow tile">
                <div className={styles.split}>
                  <div className={styles.splitSide}>
                    <Stat label="Active" value="41" delta="+6" trend="up" />
                  </div>
                  <Revenue />
                </div>
              </BentoTile>
            </div>
          </section>

          {/* ----------------------------------------
              EXPANDING
              ---------------------------------------- */}
          <section className={styles.section}>
            <SectionTitle title="Expanding" />
            <p className={styles.sectionBody}>
              With expanded content the whole tile is a control. Hovered, its border takes the action colour, and
              opening morphs the tile into an overlay where the browser supports it. Escape closes the overlay and
              returns focus to the tile.
            </p>
            <div className={styles.grid2}>
              <BentoTile
                title="Revenue that themes itself"
                className={styles.wide}
                expandedContent={
                  <div className={styles.list}>
                    <p className={styles.sectionBody}>
                      The overlay holds anything: copy, actions, or a larger copy of the tile&rsquo;s content.
                    </p>
                    <Revenue />
                  </div>
                }
              >
                <Revenue />
              </BentoTile>
            </div>
          </section>

          <ComponentInstallStrip slug="bento-tile" />
        </main>
      </div>
    </>
  );
}
