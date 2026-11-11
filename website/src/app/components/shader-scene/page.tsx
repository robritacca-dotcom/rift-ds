"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import PageLinks from "../../../components/PageLinks/PageLinks";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { ShaderScene } from "rift-ds/components/ShaderScene/ShaderScene";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

function Stage({
  caption,
  children,
}: {
  caption?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.stage}>
      {children}
      {caption && <span className={styles.stageCaption}>{caption}</span>}
    </div>
  );
}

/* Held at module scope, so a re-render hands the scene the same objects and
   nothing downstream sees a change. */
const TUNED = { crown: 0.52, glow: 1.45, beam: 1.8, ocean: 0.55 };
const RIFT_PASSES = {
  fadeTop: { on: false },
  fadeBottom: { on: false },
  vignette: { on: true, params: { amount: 0.6 } },
};
const GLYPH_PASSES = {
  fadeTop: { on: false },
  fadeBottom: { on: false },
  grain: { params: { amount: 0.06 } },
};
const SCRIM = {
  scrim: { on: true, params: { amount: 0.3 } },
  vignette: { on: true },
};

export default function ShaderScenePage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Shader scene</h1>
            <PageLinks storybookPath="/?path=/docs/components-shaderscene--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>A scene, not a field</p>
            <p className={styles.introBody}>
              Where Shader field sums soft light into an abstract wash, Shader
              scene paints a place: a planet&rsquo;s limb at night, a tear of
              light opening across the dark, or a streak of light printed in
              type. All read the background
              field&rsquo;s colour roles from the page, so a theme, a preset
              or a scoped override recolours them with nothing to configure.
            </p>
            <p className={styles.introBody}>
              It is scenery, not interface. It fills the box you give it,
              ignores the pointer and stays out of the accessibility tree, so
              placement, clipping and anything that sits on top belong to you.
            </p>
          </div>

          {/* Scenes */}
          <section className={styles.section}>
            <SectionTitle title="Scenes" />
            <p className={styles.demoText}>
              The scenes, picked with <code>scene</code>. The horizon sets a
              fixed sun at the top of a curved limb over hazy land and a
              moving ocean. The rift opens at its middle and streams light
              outwards. Glyphs prints a streak of light and its blooms in
              type: each character cell reads the light under it and takes a
              heavier character the brighter it is, in the theme&rsquo;s code
              face. The horizon and glyphs are also this site&rsquo;s own
              backgrounds, picked from the header. Three stages and no more:
              each one is a live GL context.
            </p>
            <div className={styles.stageGrid}>
              <Stage caption='scene="horizon"'>
                <ShaderScene scene="horizon" />
              </Stage>
              <Stage caption='scene="rift"'>
                <ShaderScene scene="rift" passes={RIFT_PASSES} />
              </Stage>
            </div>
            <Stage caption='scene="glyphs"'>
              <ShaderScene scene="glyphs" passes={GLYPH_PASSES} speed={1} />
            </Stage>
          </section>

          {/* Settings */}
          <section className={styles.section}>
            <SectionTitle title="Settings" />
            <p className={styles.demoText}>
              Each scene&rsquo;s settings pass as a partial in{" "}
              <code>params</code>, merged over its defaults, so changing one
              thing takes one key. <code>SHADER_SCENES</code> lists every key
              with its label and range, which is all a host needs to draw its
              own sliders. A new value moves the scene on its next frame and
              never rebuilds the GL state.
            </p>
            <Stage caption="crown 0.52, glow 1.45, beam 1.8, ocean 0.55">
              <ShaderScene params={TUNED} />
            </Stage>
          </section>

          {/* Passes */}
          <section className={styles.section}>
            <SectionTitle title="Finishing passes" />
            <p className={styles.demoText}>
              Finishing passes run over the scene: a scrim, a vignette, fades to the
              page at the top and the bottom, and film grain. Each is on or off
              with its own settings in <code>passes</code>. The fades melt the
              scene into the page ground, and the scrim is the one to reach for
              when text sits on top.
            </p>
            <Stage caption="scrim 0.3 and a vignette">
              <ShaderScene passes={SCRIM} />
            </Stage>
          </section>

          {/* Light mode */}
          <section className={styles.section}>
            <SectionTitle title="Light mode" />
            <p className={styles.demoText}>
              Every scene is a night scene: it adds light to a dark ground. On
              a light page each one works its light out against a dark ground
              of its own and lays it onto the page as a pale tint, so it reads
              as a soft dawn instead of a dark block. Switch the theme to see
              the stages above change. The scene never sets{" "}
              <code>data-theme</code> itself, which would hide a preset&rsquo;s
              colours.
            </p>
          </section>

          {/* Live tuning */}
          <section className={styles.section}>
            <SectionTitle title="Tuning by drag" />
            <p className={styles.demoText}>
              A host with sliders should not render on every move. Pass a ref
              in <code>liveRef</code> and write the full values to it as the
              pointer moves: the scene reads it every frame in place of the
              props, and nothing renders until you commit. The playground&rsquo;s
              Shaders view tunes its scenes this way.
            </p>
          </section>

          {/* Motion and fallback */}
          <section className={styles.section}>
            <SectionTitle title="Reduced motion, fallback and status" />
            <p className={styles.demoText}>
              Under <code>prefers-reduced-motion</code> the scene holds a still
              frame, which still answers its settings. <code>speed</code> at 0
              does the same on purpose. Where WebGL2 is not available the box
              shows the page ground and nothing else, so the worst case is a
              plain page. It reports which happened, as Shader field does:{" "}
              <code>onStatusChange</code> and <code>data-status</code> move
              from <code>pending</code> to <code>active</code> or{" "}
              <code>unavailable</code>, and <code>enabled={"{false}"}</code>{" "}
              switches it off, so a fallback of your own has something to
              listen to. The loop also stops while the scene is scrolled out
              of view.
            </p>
          </section>

          <ComponentInstallStrip slug="shader-scene" />
        </main>
      </div>
    </>
  );
}
