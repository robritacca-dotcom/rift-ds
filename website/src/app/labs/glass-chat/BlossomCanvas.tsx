"use client";

/**
 * The art behind the glass chat: a blossom tree drawn procedurally onto a
 * low-resolution canvas and scaled up unsmoothed, so every cell reads as a
 * fat pixel. Nothing is fetched and nothing is a bitmap asset: the tree is
 * grown from a seeded generator (the same tree on every visit and at every
 * size), and its colours are the theme's own accent tokens, resolved from
 * the live cascade, so a theme switch or a preset repaints it.
 */

import React from "react";

/** CSS pixels per art cell. The chunkiness of the whole picture. */
const CELL = 4;

/** The accents the canopy runs through, left to right. */
const CANOPY_TOKENS = [
  "--color-core-accent-violet",
  "--color-core-accent-coral",
  "--color-core-accent-amber",
  "--color-core-accent-gold",
];
const TRUNK_TOKEN = "--color-core-accent-amber";
const GROUND_TOKEN = "--color-bg-page-primary";

type Rgb = [number, number, number];

const LIGHT: Rgb = [255, 255, 255];
const DARK: Rgb = [0, 0, 0];

const mix = (a: Rgb, b: Rgb, t: number): Rgb => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

/** A small seeded generator, so the tree never changes between paints. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Resolves a colour token to sRGB bytes through the cascade at `host`,
 * whatever notation the theme wrote it in: the browser computes the colour,
 * a 1x1 canvas rasterizes it.
 */
function createTokenReader(host: HTMLElement) {
  const probe = document.createElement("span");
  probe.style.display = "none";
  host.appendChild(probe);
  const dot = document.createElement("canvas");
  dot.width = 1;
  dot.height = 1;
  const dotCtx = dot.getContext("2d", { willReadFrequently: true });
  return {
    read(token: string): Rgb {
      if (!dotCtx) return [128, 128, 128];
      probe.style.color = `var(${token})`;
      dotCtx.clearRect(0, 0, 1, 1);
      dotCtx.fillStyle = getComputedStyle(probe).color;
      dotCtx.fillRect(0, 0, 1, 1);
      const [r, g, b] = dotCtx.getImageData(0, 0, 1, 1).data;
      return [r, g, b];
    },
    dispose() {
      probe.remove();
    },
  };
}

function paint(canvas: HTMLCanvasElement, host: HTMLElement) {
  const cols = Math.max(1, Math.round(host.clientWidth / CELL));
  const rows = Math.max(1, Math.round(host.clientHeight / CELL));
  canvas.width = cols;
  canvas.height = rows;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const reader = createTokenReader(host);
  const canopy = CANOPY_TOKENS.map((token) => reader.read(token));
  const ground = reader.read(GROUND_TOKEN);
  const trunk = mix(reader.read(TRUNK_TOKEN), ground, 0.6);
  reader.dispose();

  const image = ctx.createImageData(cols, rows);
  const put = (x: number, y: number, c: Rgb, alpha = 255) => {
    const px = Math.round(x);
    const py = Math.round(y);
    if (px < 0 || py < 0 || px >= cols || py >= rows) return;
    const i = (py * cols + px) * 4;
    image.data[i] = c[0];
    image.data[i + 1] = c[1];
    image.data[i + 2] = c[2];
    image.data[i + 3] = alpha;
  };

  const rand = mulberry32(11);
  /* The tree is sized off the stage's height and rooted a little right of
     centre, tall enough that its crown clears the window's top edge: the
     canopy fills the window's reveal and the crown stands outside it. */
  const unit = rows / 100;
  const rootX = cols * 0.6;
  const groundY = rows * 0.9;

  /* ------------------------------------------------------- the wood */
  const tips: { x: number; y: number; reach: number }[] = [];

  const limb = (
    x: number,
    y: number,
    angle: number,
    length: number,
    girth: number,
    depth: number
  ) => {
    const x2 = x + Math.cos(angle) * length;
    const y2 = y + Math.sin(angle) * length;
    const steps = Math.ceil(length);
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const cx = x + (x2 - x) * t;
      const cy = y + (y2 - y) * t;
      const half = Math.max(0.5, (girth * (1 - t * 0.3)) / 2);
      for (let dx = -half; dx <= half; dx++) {
        /* The lit side of the limb is a shade lighter. */
        put(cx + dx, cy, dx < 0 ? mix(trunk, LIGHT, 0.12) : trunk);
      }
    }
    if (depth <= 3) tips.push({ x: x2, y: y2, reach: depth });
    if (depth === 0) return;
    const forks = rand() < 0.3 ? 3 : 2;
    for (let f = 0; f < forks; f++) {
      const side = forks === 2 ? (f === 0 ? -1 : 1) : f - 1;
      /* Limbs lean outward and level off, the layered habit of a
         windswept pine or an old cherry rather than a round bush. */
      const lean = side * (0.38 + rand() * 0.34) + (rand() - 0.5) * 0.2;
      const next = angle + lean;
      const levelled = next + (-Math.PI / 2 - next) * 0.12;
      limb(
        x2,
        y2,
        levelled,
        length * (0.68 + rand() * 0.14),
        girth * 0.68,
        depth - 1
      );
    }
  };

  limb(rootX, groundY, -Math.PI / 2 - 0.08, unit * 24, unit * 3.6, 6);

  /* The root flare, so the trunk meets the ground instead of ending. */
  for (let dx = -unit * 4; dx <= unit * 4; dx++) {
    const rise = Math.max(0, unit * 2.4 - Math.abs(dx) * 0.6);
    for (let dy = 0; dy < rise; dy++) put(rootX + dx, groundY - dy, trunk);
  }

  /* ---------------------------------------------------- the blossom */
  /* Each tip carries a flattened pad of petals. Density falls off toward
     the rim, which is what dithers the edge; the shade steps from a lit
     top to a shadowed underside. */
  const minX = Math.min(...tips.map((tip) => tip.x));
  const maxX = Math.max(...tips.map((tip) => tip.x));
  const span = Math.max(1, maxX - minX);

  const canopyAt = (t: number): Rgb => {
    const scaled = Math.min(0.999, Math.max(0, t)) * (canopy.length - 1);
    const index = Math.floor(scaled);
    return mix(canopy[index], canopy[index + 1], scaled - index);
  };

  for (const tip of tips) {
    const base = canopyAt((tip.x - minX) / span + (rand() - 0.5) * 0.25);
    const ramp: Rgb[] = [
      mix(base, LIGHT, 0.62),
      mix(base, LIGHT, 0.3),
      base,
      mix(base, DARK, 0.28),
      mix(base, DARK, 0.52),
    ];
    const rx = unit * (5.5 + rand() * 4.5 - tip.reach * 0.5);
    const ry = rx * (0.42 + rand() * 0.16);
    const petals = Math.round(rx * ry * 3.2);
    for (let p = 0; p < petals; p++) {
      const theta = rand() * Math.PI * 2;
      const radius = Math.sqrt(rand());
      const dx = Math.cos(theta) * radius * rx;
      const dy = Math.sin(theta) * radius * ry;
      if (rand() < radius * radius * 0.85) continue;
      const shade = (dy / ry + 1) / 2 + (rand() - 0.5) * 0.45;
      const step = Math.min(ramp.length - 1, Math.max(0, Math.floor(shade * ramp.length)));
      put(tip.x + dx, tip.y - ry * 0.4 + dy, ramp[step]);
    }
  }

  /* --------------------------------------------------- the ground */
  /* Fallen petals under the canopy, thinning with distance from the
     trunk, and a faint dithered line where the ground catches light. */
  const drift = span * 0.75;
  const fallen = Math.round(span * 5);
  for (let p = 0; p < fallen; p++) {
    const offset = (rand() + rand() + rand() - 1.5) * drift;
    const depth = rand() * rand() * unit * 7;
    const colour = canopyAt((rootX + offset - minX) / span);
    put(
      rootX + offset,
      groundY + depth,
      mix(colour, ground, 0.25 + rand() * 0.45)
    );
  }

  ctx.putImageData(image, 0, 0);
}

export default function BlossomCanvas({ className }: { className?: string }) {
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => paint(canvas, host));
    };
    schedule();

    /* Repaint when the stage resizes, and when the theme or the preset
       changes the tokens the picture is mixed from. */
    const resize = new ResizeObserver(schedule);
    resize.observe(host);
    const theme = new MutationObserver(schedule);
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "data-brand", "style"],
    });

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      theme.disconnect();
    };
  }, []);

  return (
    <div ref={hostRef} className={className} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
