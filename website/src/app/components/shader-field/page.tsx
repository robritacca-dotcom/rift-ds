"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import PageLinks from "../../../components/PageLinks/PageLinks";
import { Badge } from "@robr0/design-system/components/Badge/Badge";
import { Button } from "@robr0/design-system/components/Button/Button";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import {
  ShaderField,
  type ShaderBlob,
  type ShaderFieldStatus,
} from "@robr0/design-system/components/ShaderField/ShaderField";
import styles from "./page.module.css";


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

/** A composition that leans on one accent and cuts a shadow through it. */
const eclipse: ShaderBlob[] = [
  { token: "--color-core-accent-violet", size: 0.8, cx: -0.15, cy: 0.05, period: 18, phase: 0, weight: 1 },
  { token: "--color-core-accent-cobalt", size: 0.6, cx: 0.3, cy: 0.12, period: 15, phase: 1.1, weight: 1 },
  { token: "--color-core-accent-coral", size: 0.32, cx: 0.02, cy: -0.18, period: 21, phase: 0.4, weight: 1 },
  { token: "--color-bg-page-primary", size: 0.28, cx: 0.12, cy: 0.02, period: 19, phase: 0.9, weight: -0.9 },
];

const STATUS_VARIANT: Record<
  ShaderFieldStatus,
  "info" | "positive" | "neutral"
> = {
  pending: "info",
  active: "positive",
  unavailable: "neutral",
};

export default function ShaderFieldPage() {
  const [status, setStatus] = React.useState<ShaderFieldStatus>("pending");
  const [enabled, setEnabled] = React.useState(true);

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Shader field</h1>
            <PageLinks storybookPath="/?path=/docs/components-shaderfield--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>Ambient light on the GPU</p>
            <p className={styles.introBody}>
              A WebGL2 canvas that sums soft Gaussian light sources into a field
              of colour. Each source reads a semantic colour token at runtime,
              so the whole thing re-themes with the page and with any scoped
              custom-property override. It is the background of this site: what
              you are looking at behind this page is this component.
            </p>
            <p className={styles.introBody}>
              It is scenery, not interface. Nothing it does is a signal, so its
              motion can never be mistaken for feedback. That is the licence for
              a full-viewport surface to move at all.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <p className={styles.demoText}>
              Eight sources on the core accent tokens, drifting on 14 to 22
              second cycles. The field fills its positioned ancestor and ignores
              pointer events, so placement, clipping and any mask belong to the
              box you put it in.
            </p>
            <Stage>
              <ShaderField />
            </Stage>
          </section>

          {/* Parameters */}
          <section className={styles.section}>
            <SectionTitle title="Parameters" />
            <p className={styles.demoText}>
              Eight parameters describe the look. They pass through as a
              partial, merged over the shipped defaults, so changing one thing
              takes one property. Two stages rather than one per parameter,
              deliberately: every field on this page is a live GL context, and
              a documentation page that stands up a grid of them is teaching
              the wrong lesson about what this component costs.
            </p>
            <div className={styles.stageGrid}>
              <Stage caption="streak: 1, stretching every source along a fixed diagonal">
                <ShaderField params={{ streak: 1, warp: 0.2 }} />
              </Stage>
              <Stage caption="streak: 0, scale: 5.5, grain: 0.35. Discs, finer noise, more texture">
                <ShaderField
                  params={{ streak: 0, scale: 5.5, grain: 0.35, intensity: 0.7 }}
                />
              </Stage>
            </div>
          </section>

          {/* Composition */}
          <section className={styles.section}>
            <SectionTitle title="Composition" />
            <p className={styles.demoText}>
              A composition is a table of token names with positions, sizes and
              drift periods. Weights are emission: positive sources give off
              light, and a negative one absorbs it, which is how you cut a
              shadow that occludes whatever shines behind it.
            </p>
            <Stage caption="Three emitters and one absorber">
              <ShaderField
                params={{ intensity: 0.9, scale: 1.8, streak: 0 }}
                blobs={eclipse}
              />
            </Stage>
            <p className={styles.demoText}>
              One token is never in the table:{" "}
              <code>--color-action-primary-bg</code>. The action colour is
              reserved for calls to action and focus rings, and a
              full-viewport decorative field is exactly the use that would stop
              it meaning &ldquo;click here&rdquo;.
            </p>
          </section>

          {/* Cursor wake */}
          <section className={styles.section}>
            <SectionTitle title="Cursor wake" />
            <p className={styles.demoText}>
              The field can react to the pointer: a swirl around it, and a glow
              that brightens whatever colour it is passing over rather than
              adding one of its own. It ships dormant at{" "}
              <code>react: 0</code>, built rather than absent. While a wake is
              alive the render loop steps from 30fps to 60fps, then drops back,
              so the cost is paid only while it shows. Move across this one.
            </p>
            <Stage caption="react: 0.8">
              <ShaderField params={{ react: 0.8, streak: 0.2, scale: 2 }} />
            </Stage>
          </section>

          {/* Fallback */}
          <section className={styles.section}>
            <SectionTitle title="Fallback and status" />
            <p className={styles.demoText}>
              The component never decides what to paint instead of itself: that
              is a design decision, not a rendering one. It reports how it
              resolved and leaves the fallback to you. No WebGL2, a blocked or
              lost GPU context, a renderer that stalls before its first frame,
              and <code>enabled={"{false}"}</code> all arrive at the same
              status, so one fallback covers every way the field can fail.
            </p>
            <p className={styles.demoText}>
              <strong>Pending</strong> is the state worth handling. While the
              context is coming up, painting the fallback and swapping it a
              frame later reads as two backgrounds loading in sequence. So paint
              neither, and let a watchdog bound the wait rather than leaving the
              page with no background at all.
            </p>
            <Stage>
              {/* The documented pattern, wired up rather than described: the
                  fallback paints on "unavailable", not on "not active", so
                  pending shows neither layer. Disable the field to see it. */}
              {status === "unavailable" && <div className={styles.fallback} />}
              <ShaderField enabled={enabled} onStatusChange={setStatus} />
            </Stage>
            <div className={styles.statusRow}>
              <Badge variant={STATUS_VARIANT[status]} label={status} />
              <Button
                variant="secondary"
                size="compact"
                label={enabled ? "Disable the field" : "Enable the field"}
                onClick={() => setEnabled((v) => !v)}
              />
            </div>
          </section>

          {/* Motion */}
          <section className={styles.section}>
            <SectionTitle title="Reduced motion" />
            <p className={styles.demoText}>
              The system&rsquo;s motion tokens collapse under{" "}
              <code>prefers-reduced-motion</code>, but that guard is CSS and
              cannot see a <code>requestAnimationFrame</code> loop. A
              GPU-driven surface has to check the query itself, and this one
              does: it draws a single static frame and never starts the loop.
              The rule against component-level motion queries still holds for
              everything that consumes the duration tokens: an animation loop
              sits outside that contract by construction.
            </p>
          </section>
        </main>
      </div>
    </>
  );
}
