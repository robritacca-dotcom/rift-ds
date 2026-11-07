"use client";

/**
 * The playground's shader ground: a fixed, full-viewport canvas behind the
 * page, in DotBackground's place and on its layer, painting the scene the
 * Shaders view picked (website/src/lib/shaders). It holds the page's one
 * running WebGL2 context, builds a renderer for the scene, and every frame
 * paints it from the values ref, so moving a slider writes a number and
 * renders nothing (CLAUDE.md's drag rule). Time advances by the speed
 * setting, so changing the pace never jumps.
 *
 * The colours are the scene's tokens resolved from the live cascade at the
 * canvas, read again whenever the theme, the preset or a lever changes
 * them, so the levers recolour the ground as they move. Nothing here sets
 * data-theme: a nested [data-theme] matches the base dark tokens and would
 * hide the preset's own colours.
 *
 * A night-only scene (mode "dark": it adds light to a dark ground) puts the
 * document in dark mode while it runs, and puts the mode back when it stops
 * unless the visitor changed it in the meantime. A visitor who prefers
 * reduced motion gets a still frame that still answers the sliders.
 */

import React from "react";
import { createRenderer, readColours } from "@/lib/shaders/renderer";
import type { Pass, Scene, Values } from "@/lib/shaders/types";
import styles from "./ShaderGround.module.css";

export default function ShaderGround({
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

  /* A night-only scene holds the document dark while it runs. */
  React.useEffect(() => {
    if (scene.mode !== "dark") return;
    const root = document.documentElement;
    const previous = root.getAttribute("data-theme");
    if (previous === "dark") return;
    root.setAttribute("data-theme", "dark");
    return () => {
      /* Only undo our own change: a visitor who flipped the mode while the
         scene ran keeps what they picked. */
      if (root.getAttribute("data-theme") !== "dark") return;
      if (previous === null) root.removeAttribute("data-theme");
      else root.setAttribute("data-theme", previous);
    };
  }, [scene.mode]);

  React.useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl2", { antialias: false, alpha: false });
    if (!host || !canvas || !gl) return;
    const renderer = createRenderer(gl, scene, passes);
    if (!renderer) return;

    const applyColours = () => renderer.setColours(readColours(host, scene.colours));
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
    <div ref={hostRef} className={styles.ground} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
