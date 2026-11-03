/**
 * The rift: one bright tear down the stage, drawing fine type in toward it. The
 * scene has two outputs. Type goes into a character grid for the clear space
 * outside the window. Big soft forms are painted under the pane, because frost
 * destroys detail and only a large silhouette survives it.
 */

export const CELL_W = 9;
export const CELL_H = 17;

export type Rgb = [number, number, number];
export type Palette = { from: Rgb; to: Rgb; core: Rgb };

export type Grid = {
  cols: number;
  rows: number;
  density: Float32Array;
  tint: Float32Array;
};

export function createGrid(width: number, height: number): Grid {
  const cols = Math.ceil(width / CELL_W) + 1;
  const rows = Math.ceil(height / CELL_H) + 1;
  return { cols, rows, density: new Float32Array(cols * rows), tint: new Float32Array(cols * rows) };
}

export const mix = (a: Rgb, b: Rgb, t: number): Rgb => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

const rgba = ([r, g, b]: Rgb, alpha: number) => `rgba(${r | 0},${g | 0},${b | 0},${alpha})`;

const SEGMENTS = 22;
const MOTES = 170;
/** How far from the opening its light still reaches into the type. */
const FALLOFF = 90;

type Mote = { x: number; y: number; side: number; pace: number; tint: number };

export function createRift(width: number, height: number) {
  const baseX = width * 0.62;
  const lean = width * 0.06;
  const jags = Array.from({ length: SEGMENTS + 1 }, (_, i) => {
    const size = Math.sin((i / SEGMENTS) * Math.PI) * 0.75 + 0.25;
    return { offset: (i % 2 ? 1 : -1) * (6 + Math.random() * 30) * size, phase: Math.random() * Math.PI * 2 };
  });

  const centre = (y: number, time: number) => {
    const t = y / height;
    const scaled = Math.max(0, Math.min(SEGMENTS - 0.001, t * SEGMENTS));
    const i = Math.floor(scaled);
    const f = scaled - i;
    const wobble = (j: (typeof jags)[number]) => j.offset + Math.sin(time * 0.3 + j.phase) * 3;
    return baseX + (t - 0.5) * lean + wobble(jags[i]) * (1 - f) + wobble(jags[i + 1]) * f;
  };

  const spawn = (anywhere: boolean): Mote => {
    const side = Math.random() < 0.5 ? -1 : 1;
    const y = Math.random() * height;
    const gap = anywhere ? Math.random() * width * 0.6 : width * (0.3 + Math.random() * 0.35);
    return { x: centre(y, 0) + side * (40 + gap), y, side, pace: 16 + Math.random() * 26, tint: Math.random() };
  };

  const motes = Array.from({ length: MOTES }, () => spawn(true));
  let shown = 0.8;

  /* The opening's half-width: a long lens, breathing. */
  const halfWidth = (y: number, time: number) => {
    const t = Math.max(0, Math.min(1, y / height));
    const lens = Math.pow(Math.sin(t * Math.PI), 0.7);
    return (10 + 26 * lens) * shown * (1 + Math.sin(time * 0.45) * 0.14);
  };

  return {
    /** `busy` is true while the chat is working, and the rift opens wider. */
    step(dt: number, time: number, busy: boolean) {
      shown += ((busy ? 1.7 : 0.8) - shown) * Math.min(1, dt * 1.1);
      motes.forEach((mote, i) => {
        const gap = Math.abs(mote.x - centre(mote.y, time));
        /* Faster the closer it gets, the pull of the thing. */
        mote.x -= mote.side * mote.pace * (1 + 90 / (gap + 30)) * shown * dt;
        if (gap < halfWidth(mote.y, time) + 4) motes[i] = spawn(false);
      });
    },

    rasterise(grid: Grid, time: number) {
      const { cols, rows, density, tint } = grid;
      density.fill(0);
      for (let row = 0; row < rows; row++) {
        const y = (row + 0.5) * CELL_H;
        const x = centre(y, time);
        const half = halfWidth(y, time);
        const reach = half + FALLOFF;
        const fromCol = Math.max(0, Math.floor((x - reach) / CELL_W));
        const toCol = Math.min(cols - 1, Math.ceil((x + reach) / CELL_W));
        for (let col = fromCol; col <= toCol; col++) {
          const offset = (col + 0.5) * CELL_W - x;
          const gap = Math.abs(offset);
          const i = row * cols + col;
          density[i] = gap < half ? 1 : 0.72 * Math.pow(Math.max(0, 1 - (gap - half) / FALLOFF), 2.4);
          tint[i] = Math.max(0, Math.min(1, 0.5 + offset / (FALLOFF * 2)));
        }
      }
      for (const mote of motes) {
        const col = Math.floor(mote.x / CELL_W);
        const row = Math.floor(mote.y / CELL_H);
        if (col < 0 || row < 0 || col >= cols || row >= rows) continue;
        const i = row * cols + col;
        const near = 1 - Math.min(1, Math.abs(mote.x - centre(mote.y, time)) / (width * 0.5));
        const value = 0.14 + near * 0.5;
        if (value > density[i]) {
          density[i] = value;
          tint[i] = mote.tint;
        }
      }
    },

    /** Paints the soft forms in stage pixels; the caller clips them to the pane. */
    under(ctx: CanvasRenderingContext2D, palette: Palette, time: number) {
      const shape = (scale: number) => {
        ctx.beginPath();
        for (let i = 0; i <= SEGMENTS; i++) {
          const y = (i / SEGMENTS) * height;
          const x = centre(y, time) - halfWidth(y, time) * scale;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        for (let i = SEGMENTS; i >= 0; i--) {
          const y = (i / SEGMENTS) * height;
          ctx.lineTo(centre(y, time) + halfWidth(y, time) * scale, y);
        }
        ctx.closePath();
      };
      /* Light spilling from it on each side, then the tear itself. */
      const x = centre(height / 2, time);
      const spill = ctx.createLinearGradient(x - width * 0.34, 0, x + width * 0.34, 0);
      spill.addColorStop(0, rgba(palette.from, 0));
      spill.addColorStop(0.5, rgba(mix(palette.from, palette.to, 0.5), 0.75));
      spill.addColorStop(1, rgba(palette.to, 0));
      ctx.fillStyle = spill;
      ctx.fillRect(x - width * 0.34, 0, width * 0.68, height);
      ctx.fillStyle = rgba(palette.from, 0.75);
      shape(3.2);
      ctx.fill();
      ctx.fillStyle = rgba(palette.to, 0.9);
      shape(1.8);
      ctx.fill();
      ctx.fillStyle = rgba(palette.core, 1);
      shape(0.9);
      ctx.fill();
    },
  };
}

export type Rift = ReturnType<typeof createRift>;
