"use client";

/**
 * A shader surface: one of the playground's scenes (website/src/lib/shaders)
 * painted to fill its positioned parent, the way ShaderField fills the
 * Components view's banner. It is the theme's own shader, swapped: the
 * Shaders view picks a scene and this paints it wherever the playground
 * stages a shader (the banner, and the Shaders view's own stage).
 *
 * It holds one WebGL2 context, builds a renderer for the scene, and every
 * frame paints it from the values ref, so moving a slider writes a number
 * and renders nothing (CLAUDE.md's drag rule). Time advances by the speed
 * setting, so changing the pace never jumps.
 *
 * The colours are the scene's tokens resolved from the live cascade at the
 * surface, read again whenever the theme, the preset or a lever changes
 * them, so the levers recolour it live. Nothing here sets data-theme: a
 * nested [data-theme] matches the base dark tokens and would hide the
 * preset's own colours. A night-only scene paints a dark ground of its own
 * on a light page (coloursFor). A visitor who prefers reduced motion gets a
 * still frame that still answers the sliders.
 */

import React from "react";
import { coloursFor, createRenderer } from "@/lib/shaders/renderer";
import type { Pass, Scene, Values } from "@/lib/shaders/types";
import styles from "./ShaderSurface.module.css";

export default function ShaderSurface({
  scene,
  passes,
  values,
}: {
  /** The scene to paint. A new scene rebuilds the program. */
  scene: Scene;
  /** The finishing passes, all compiled in and switched by the values. */
  passes: Pass[];
  /** The live settings, read every frame and never rendered from. */
  values: React.RefObject<Values>;
}) {
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl2", { antialias: false, alpha: false });
    if (!host || !canvas || !gl) return;
    const renderer = createRenderer(gl, scene, passes);
    if (!renderer) return;

    const applyColours = () => renderer.setColours(coloursFor(host, scene));
    const resize = () => {
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.round(host.clientWidth * ratio));
      canvas.height = Math.max(1, Math.round(host.clientHeight * ratio));
    };

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let time = 20;
    let last = performance.now();
    let frame = 0;
    const draw = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (!still) time += dt * (values.current?.speed ?? 1);
      if (values.current) renderer.draw(values.current, time, canvas.width, canvas.height);
      frame = requestAnimationFrame(draw);
    };

    applyColours();
    resize();
    frame = requestAnimationFrame(draw);

    const sizeObserver = new ResizeObserver(resize);
    sizeObserver.observe(host);
    /* The playground's levers land as inline custom properties on <html>
       (the style attribute), presets and modes as attributes: all three
       re-read the colours. */
    const themeObserver = new MutationObserver(applyColours);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "data-brand", "style"],
    });

    return () => {
      cancelAnimationFrame(frame);
      sizeObserver.disconnect();
      themeObserver.disconnect();
      renderer.dispose();
    };
  }, [scene, passes, values]);

  return (
    <div ref={hostRef} className={styles.surface} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
