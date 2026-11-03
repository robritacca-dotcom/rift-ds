"use client";

/**
 * Labs: the rift. The site's own chat as a sheet of frosted glass over a tear
 * in the page. Fine type streams toward the tear across the clear stage, and
 * behind the glass the same tear melts into colour. It opens wider while the
 * chat is working.
 *
 * The window holds the real site chat on the root provider, with nothing
 * rebuilt. Once a conversation starts the frost thickens, for the transcript.
 * The colours are the theme's ambient roles, read from the live cascade, so a
 * theme or mode switch repaints it. A visitor who prefers reduced motion gets a
 * still frame.
 *
 * The route is chromeless, so the site's own panel stands down.
 */

import React from "react";
import { ChatWidget, useChatWidget } from "rift-ds/chat";
import { useSiteWidgetProps } from "@/components/SiteChat/useSiteWidgetProps";
import GlassRail from "../glass-chat/GlassRail";
import { CELL_H, CELL_W, createGrid, createRift, mix, type Grid, type Palette, type Rgb, type Rift } from "./rift-scene";
import styles from "./RiftStage.module.css";

const RAMP = " .':;otS%X8#@";
const TINT_STEPS = 12;
const ALPHA_STEPS = 6;
const FRAME_MS = 1000 / 24;

/** A stable pseudo-random value for a cell, in 0 to 1. */
const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/** Resolves a colour token through the cascade at `host` to sRGB bytes. */
function readToken(host: HTMLElement, token: string): Rgb {
  const probe = document.createElement("span");
  probe.style.display = "none";
  probe.style.color = `var(${token})`;
  host.appendChild(probe);
  const dot = document.createElement("canvas");
  dot.width = 1;
  dot.height = 1;
  const ctx = dot.getContext("2d", { willReadFrequently: true });
  let rgb: Rgb = [128, 128, 128];
  if (ctx) {
    ctx.fillStyle = getComputedStyle(probe).color;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    rgb = [r, g, b];
  }
  probe.remove();
  return rgb;
}

/** Pushes a muted colour away from its own grey and up to full brightness, so it still reads as a hue. */
const vivid = (c: Rgb): Rgb => {
  const grey = (c[0] + c[1] + c[2]) / 3;
  const pushed = c.map((v) => Math.max(0, grey + (v - grey) * 2.2));
  const lift = 255 / Math.max(1, ...pushed);
  return [pushed[0] * lift, pushed[1] * lift, pushed[2] * lift];
};

/** The tints as ready fill styles, indexed by tint then strength. */
function buildFills(from: Rgb, to: Rgb, floor: number) {
  const fills: string[][] = [];
  for (let t = 0; t < TINT_STEPS; t++) {
    const [r, g, b] = mix(from, to, t / (TINT_STEPS - 1));
    const row: string[] = [];
    for (let a = 0; a < ALPHA_STEPS; a++) {
      const alpha = floor + (1 - floor) * (a / (ALPHA_STEPS - 1));
      row.push(`rgba(${r | 0},${g | 0},${b | 0},${alpha.toFixed(2)})`);
    }
    fills.push(row);
  }
  return fills;
}

function drawType(ctx: CanvasRenderingContext2D, grid: Grid, fills: string[][], time: number, font: string) {
  ctx.font = font;
  ctx.textBaseline = "top";
  const shimmer = Math.floor(time * 1.5);
  let lastFill = "";
  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) {
      const value = grid.density[row * grid.cols + col];
      if (value < 0.03) continue;
      /* The glyphs flicker a step either way, so nothing is ever quite still. */
      const flicker = (hash(col + shimmer, row - shimmer) - 0.5) * 1.4;
      const step = Math.round(value * (RAMP.length - 1) + flicker);
      const glyph = RAMP[Math.min(RAMP.length - 1, Math.max(1, step))];
      const tint = Math.min(TINT_STEPS - 1, Math.floor(grid.tint[row * grid.cols + col] * TINT_STEPS));
      const fill = fills[tint][Math.min(ALPHA_STEPS - 1, Math.floor(value * ALPHA_STEPS))];
      if (fill !== lastFill) {
        ctx.fillStyle = fill;
        lastFill = fill;
      }
      ctx.fillText(glyph, col * CELL_W + 1, row * CELL_H + 2);
    }
  }
}

export default function RiftStage() {
  const stageRef = React.useRef<HTMLDivElement | null>(null);
  const windowRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  const { open, setOpen, turns, live } = useChatWidget();
  const widget = useSiteWidgetProps();
  const active = turns.length > 0 || Boolean(live);
  const busyRef = React.useRef(false);
  const busy = Boolean(live);
  React.useEffect(() => {
    busyRef.current = busy;
  }, [busy]);

  /* The window is the chat's open state on this page, and it closes on the
     way out so the site panel does not arrive already open on the next route. */
  React.useEffect(() => {
    setOpen(true);
    return () => setOpen(false);
  }, [setOpen]);

  React.useEffect(() => {
    const stage = stageRef.current;
    const pane = windowRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!stage || !pane || !canvas || !ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let rift = null as Rift | null;
    let riftWidth = 0;
    let riftHeight = 0;
    let grid: Grid | null = null;
    let fills: string[][] = [];
    let palette: Palette = { from: [0, 0, 0], to: [0, 0, 0], core: [0, 0, 0] };
    let font = "12px monospace";
    let width = 0;
    let height = 0;
    let time = 0;

    const readColours = () => {
      const from = vivid(readToken(stage, "--color-ambient-2"));
      const to = vivid(readToken(stage, "--color-ambient-3"));
      const ground = readToken(stage, "--color-bg-page-primary");
      /* Lifted on a dark ground, deepened on a light one, so the type holds. */
      const isDark = ground[0] * 0.3 + ground[1] * 0.59 + ground[2] * 0.11 < 128;
      const toward: Rgb = isDark ? [255, 255, 255] : [0, 0, 0];
      palette = { from, to, core: mix(mix(from, to, 0.5), toward, 0.8) };
      fills = buildFills(mix(from, toward, 0.2), mix(to, toward, 0.2), 0.34);
      font = `12px ${getComputedStyle(stage).getPropertyValue("--font-family-code") || "monospace"}`;
    };

    const measure = () => {
      const box = stage.getBoundingClientRect();
      width = box.width;
      height = box.height;
      /* The rift is sized off the stage, so a new stage tears it afresh. */
      if (!rift || riftWidth !== width || riftHeight !== height) {
        rift = createRift(width, height);
        riftWidth = width;
        riftHeight = height;
      }
      grid = createGrid(width, height);
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const paint = () => {
      if (!rift || !grid) return;
      rift.rasterise(grid, time);
      ctx.clearRect(0, 0, width, height);
      drawType(ctx, grid, fills, time, font);
      /* Under the glass the type would blur away to nothing, so the tear also
         paints soft forms there, clipped to the pane's own rounded shape. */
      const stageBox = stage.getBoundingClientRect();
      const paneBox = pane.getBoundingClientRect();
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(
        paneBox.left - stageBox.left,
        paneBox.top - stageBox.top,
        paneBox.width,
        paneBox.height,
        parseFloat(getComputedStyle(pane).borderTopLeftRadius) || 0
      );
      ctx.clip();
      rift.under(ctx, palette, time);
      ctx.restore();
    };

    readColours();
    measure();
    /* Settle before the first paint, so the type has already gathered. */
    for (let i = 0; i < 90; i++) {
      time += 1 / 24;
      rift?.step(1 / 24, time, false);
    }
    paint();

    let frame = 0;
    let last = performance.now();
    let budget = 0;
    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      const elapsed = Math.min(100, now - last);
      last = now;
      budget += elapsed;
      /* Character art looks right stepped, and this saves a lot of drawing. */
      if (budget < FRAME_MS || !rift) return;
      const dt = budget / 1000;
      budget = 0;
      time += dt;
      rift.step(dt, time, busyRef.current);
      paint();
    };
    if (!still) frame = requestAnimationFrame(loop);

    const resize = new ResizeObserver(() => {
      measure();
      paint();
    });
    resize.observe(stage);

    const theme = new MutationObserver(() => {
      readColours();
      paint();
    });
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
    <div ref={stageRef} className={styles.stage}>
      {/* The site's own ambient background, run across the whole viewport. */}
      <div data-bg-full-bleed="" hidden />
      <canvas ref={canvasRef} className={styles.art} aria-hidden="true" />

      <div ref={windowRef} className={styles.window} data-active={active || undefined}>
        <div className={styles.frost} aria-hidden="true" />
        {/* Open only after mount, as in the glass chat: the starters are drawn
            at random, so the widget must not render on the server. */}
        {open ? (
          <div className={styles.chat}>
            <ChatWidget
              {...widget}
              logo={undefined}
              fullscreenEnabled={false}
              threads={({ overlay, close }) => (
                <GlassRail overlay={overlay} close={close} className={overlay ? undefined : styles.rail} />
              )}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
