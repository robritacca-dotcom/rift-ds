"use client";

/**
 * The textures behind the bento banners. Each banner gets a surface of its
 * own, and every colour in them is a token resolved from the live cascade,
 * so a theme switch or a preset repaints them.
 *
 * The canvases share one loop: sized to their box at device pixel ratio,
 * drawn only while on screen, and frozen on a single frame under reduced
 * motion, the same contract ShaderField keeps for the GPU field.
 */

import React, { useEffect, useRef, useState } from "react";
import { ShaderField, type ShaderBlob, type ShaderParams } from "rift-ds/components/ShaderField/ShaderField";
import styles from "./Bento.module.css";

type Rgb = [number, number, number];

/** Resolves colour tokens to sRGB through the cascade at `el`, any notation. */
function readTokens(el: HTMLElement, tokens: readonly string[]): Rgb[] {
  const cs = getComputedStyle(el);
  const dot = document.createElement("canvas").getContext("2d");
  return tokens.map((t) => {
    if (!dot) return [128, 128, 128];
    dot.fillStyle = "#000";
    dot.fillStyle = cs.getPropertyValue(t).trim() || "#000";
    dot.fillRect(0, 0, 1, 1);
    const d = dot.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2]];
  });
}

const mix = (a: Rgb, b: Rgb, t: number): Rgb => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
const rgba = (c: Rgb, a: number) =>
  `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a.toFixed(3)})`;

/** A small seeded generator, so a texture is the same on every visit. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type DrawFn = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  colours: Rgb[],
) => void;

function useCanvasLoop(tokens: readonly string[], draw: DrawFn) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);
  useEffect(() => {
    drawRef.current = draw;
  });

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let colours = readTokens(canvas, tokens);
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = false;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();

    const frame = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const dpr = canvas.width / Math.max(w, 1);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawRef.current(ctx, w, h, still ? 4 : (performance.now() - start) / 1000, colours);
    };
    const loop = () => {
      frame();
      raf = visible && !still ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const ro = new ResizeObserver(([entry]) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = entry.contentRect.width;
      h = entry.contentRect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      kick();
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) kick();
    });
    io.observe(canvas);

    const mo = new MutationObserver(() => {
      colours = readTokens(canvas, tokens);
      kick();
    });
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "data-brand", "style"],
    });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
    };
    // The token list is a module constant at every call site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}

/* ------------------------------------------------------------- halo */

const HALO_TOKENS = ["--color-core-accent-coral", "--color-core-accent-violet", "--color-core-accent-amber"] as const;

type Mote = { a: number; r: number; size: number; tw: number; hue: number; drift: number };

/**
 * A ring of fine motes, densest on the ring and thinning either side of it,
 * each orbiting slowly and twinkling on its own phase.
 */
export function ParticleHalo({ className = "" }: { className?: string }) {
  const [motes] = useState<Mote[]>(() => {
    const rnd = mulberry32(7);
    return Array.from({ length: 2600 }, () => {
      // Box-Muller: a normal spread across the ring's width.
      const n = Math.sqrt(-2 * Math.log(rnd() + 1e-6)) * Math.cos(2 * Math.PI * rnd());
      return {
        a: rnd() * Math.PI * 2,
        r: 1 + n * 0.09,
        size: 0.5 + rnd() * 1.3,
        tw: rnd() * Math.PI * 2,
        hue: rnd(),
        drift: (0.4 + rnd()) * (rnd() < 0.5 ? -1 : 1),
      };
    });
  });

  const ref = useCanvasLoop(HALO_TOKENS, (ctx, w, h, t, [coral, violet, amber]) => {
    const cx = w / 2;
    const cy = h * 0.52;
    const R = Math.min(w, h) * 0.42;
    for (const m of motes) {
      const a = m.a + t * 0.012 * m.drift;
      const r = R * (m.r + 0.012 * Math.sin(t * 0.6 + m.tw));
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r * 0.96;
      const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.4 + m.tw * 3));
      const c = m.hue < 0.6 ? mix(coral, violet, m.hue / 0.6) : mix(violet, amber, (m.hue - 0.6) / 0.4);
      const edge = Math.max(0, 1 - Math.abs(m.r - 1) / 0.28);
      ctx.fillStyle = rgba(c, 0.9 * tw * edge);
      ctx.fillRect(x, y, m.size, m.size);
    }
  });

  return <canvas ref={ref} className={`${styles.artCanvas} ${className}`} aria-hidden="true" />;
}

/* ------------------------------------------------------------- wash */

/**
 * A ShaderField composition clipped to a banner, with a CSS gradient under
 * it as the fallback. The field paints over the fallback once it resolves.
 */
export function ShaderWash({
  blobs,
  params,
  fallback,
  className = "",
}: {
  blobs: readonly ShaderBlob[];
  params?: Partial<ShaderParams>;
  fallback: string;
  className?: string;
}) {
  const [status, setStatus] = useState<"pending" | "active" | "unavailable">("pending");
  return (
    <div className={`${styles.wash} ${className}`} data-status={status} aria-hidden="true">
      <div className={styles.washFallback} style={{ background: fallback }} />
      <ShaderField
        className={styles.washField}
        blobs={blobs}
        params={{ crop: 0, react: 0, ...params }}
        onStatusChange={setStatus}
      />
    </div>
  );
}

/** The bento's shader compositions, one per banner that wears a wash. */
export const WASHES = {
  /** A diagonal sweep of warm light up from the bottom left, Stripe's checkout banner. */
  sweep: {
    blobs: [
      { token: "--color-core-accent-cobalt", size: 0.5, cx: -0.5, cy: 0.42, period: 17, phase: 0.8, weight: 2.4 },
      { token: "--color-core-accent-violet", size: 0.6, cx: -0.3, cy: 0.3, period: 22, phase: 0.5, weight: 3 },
      { token: "--color-core-accent-coral", size: 0.55, cx: -0.02, cy: 0.12, period: 16, phase: 1, weight: 3 },
      { token: "--color-core-accent-amber", size: 0.55, cx: 0.26, cy: -0.06, period: 18, phase: 0, weight: 3 },
      { token: "--color-core-accent-gold", size: 0.4, cx: 0.5, cy: -0.24, period: 14, phase: 1.5, weight: 2.4 },
    ] satisfies ShaderBlob[],
    params: { intensity: 1, streak: 0.85, warp: 0.1, grain: 0.06, speed: 1.4 },
  },
  /** A pool of violet light rising from the foot of a narrow banner. */
  rise: {
    blobs: [
      { token: "--color-core-accent-violet", size: 1.65, cx: -0.1, cy: 0.9, period: 20, phase: 0, weight: 3.38 },
      { token: "--color-core-accent-cobalt", size: 1.2, cx: -0.5, cy: 0.6, period: 18, phase: 1, weight: 2.34 },
      { token: "--color-core-accent-coral", size: 1.05, cx: 0.45, cy: 0.75, period: 16, phase: 0.4, weight: 2.34 },
      { token: "--color-core-accent-amber", size: 0.75, cx: 0.55, cy: 0.35, period: 21, phase: 1.3, weight: 1.56 },
    ] satisfies ShaderBlob[],
    params: { intensity: 0.85, streak: 0.15, warp: 0.18, grain: 0.05, speed: 1.2 },
  },
  /** A soft iridescent band, laid across the face of the issued card. */
  foil: {
    blobs: [
      { token: "--color-core-accent-coral", size: 0.75, cx: 0.25, cy: -0.35, period: 12, phase: 0, weight: 3.12 },
      { token: "--color-core-accent-violet", size: 0.83, cx: -0.15, cy: -0.05, period: 14, phase: 1, weight: 3.12 },
      { token: "--color-core-accent-cobalt", size: 0.6, cx: -0.4, cy: 0.15, period: 15, phase: 0.6, weight: 2.34 },
      { token: "--color-core-accent-amber", size: 0.68, cx: 0.35, cy: 0.25, period: 13, phase: 1.8, weight: 2.86 },
    ] satisfies ShaderBlob[],
    params: { intensity: 1, streak: 1, warp: 0.22, grain: 0.08, speed: 3 },
  },
} as const;
