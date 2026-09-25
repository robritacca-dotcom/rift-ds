/**
 * Reading a theme out of an image.
 *
 * The playground's levers are hexes; a photograph is a few hundred thousand
 * pixels. This module is the bridge, and it runs entirely in the visitor's
 * browser: the dropped file is decoded into an object URL, drawn once onto a
 * canvas that never leaves the page, and read back as pixels. Nothing is
 * uploaded, nothing is stored, and the object URL dies with the tab.
 *
 * Two steps, kept separate so each can be judged on its own:
 *
 *   extractPalette  — median-cut quantization down to a ranked set of
 *                     representative colours, plus the image's mean chroma.
 *                     Pure colour science, no opinion about theming.
 *   themeFromPalette — the opinion: which swatch becomes the action colour,
 *                     how hard the neutrals get tinted, and how the six
 *                     ambient accent roles are filled. Every value it returns
 *                     is a lever the playground already has, so an image is
 *                     not a new kind of theme; it is a way of moving the
 *                     existing levers all at once.
 *
 * Colour maths comes from theme-overrides so there is one implementation of
 * hex/rgb/hsl in the site, not two.
 */
import {
  ACCENT_NAMES,
  SHIPPED_ACCENTS,
  hexToRgb,
  hslToRgb,
  rgbToHex,
  rgbToHsl,
  type AccentName,
  type AccentSextet,
} from "./theme-overrides";

type Rgb = [number, number, number];
type Hsl = [number, number, number];

/** Longest edge the image is downsampled to before quantization. Small on
    purpose: a theme is about masses of colour, and 160px carries those while
    keeping the whole pass well under a frame. */
const SAMPLE_EDGE = 160;

/** Boxes the median cut splits into. More would resolve finer detail the
    levers cannot express anyway. */
const BOX_COUNT = 16;

/** Below this saturation a swatch reads as grey, not as a hue. */
const CHROMATIC_SAT = 0.12;

/** Hues closer than this are the same colour for theming purposes, so only
    the stronger of the pair survives into the distinct set. */
const HUE_MERGE_DEGREES = 18;

/** How far an image hue may sit from an accent role's own hue and still be
    treated as that role's colour. */
const ACCENT_MATCH_DEGREES = 40;

/** The band an action fill has to sit in to work as a button background with
    light text on it, in the light theme. The shipped teal is L 0.31. */
const ACTION_SAT: readonly [number, number] = [0.32, 1];
const ACTION_LIGHT: readonly [number, number] = [0.24, 0.46];

/** The band the ambient accents sit in: vivid enough to colour a background
    blob and a chart series, never so pale they stop being distinguishable. */
const ACCENT_SAT: readonly [number, number] = [0.45, 0.95];
const ACCENT_LIGHT: readonly [number, number] = [0.42, 0.66];

/** The seed that tints the neutral scale wants to stay a hint of a colour,
    not a second brand. */
const TINT_SAT: readonly [number, number] = [0.3, 0.9];
const TINT_LIGHT: readonly [number, number] = [0.3, 0.55];

/** Swatches shown on the source card. */
const DISPLAY_SWATCHES = 6;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const band = (
  [h, s, l]: Hsl,
  sat: readonly [number, number],
  light: readonly [number, number]
): Hsl => [h, clamp(s, sat[0], sat[1]), clamp(l, light[0], light[1])];

const toHex = (hsl: Hsl) => rgbToHex(hslToRgb(hsl));

/** Shortest distance between two hues, in degrees (0..180). */
const hueDistance = (a: number, b: number) => {
  const d = Math.abs(((a % 360) + 360) % 360 - ((b % 360) + 360) % 360);
  return Math.min(d, 360 - d);
};

/** The accent roles' own hues, read from the shipped sextet rather than
    restated, so a retuned accent moves this with it. */
const ACCENT_HUES: Record<AccentName, number> = ACCENT_NAMES.reduce(
  (acc, name) => {
    acc[name] = rgbToHsl(hexToRgb(SHIPPED_ACCENTS[name]))[0];
    return acc;
  },
  {} as Record<AccentName, number>
);

/** One representative colour from the quantized image. */
export interface PaletteSwatch {
  hex: string;
  hsl: Hsl;
  /** Share of the sampled pixels this swatch stands for, 0..1. */
  weight: number;
}

export interface ImagePalette {
  /** Representative colours, most of the image first. */
  swatches: PaletteSwatch[];
  /** Mean saturation across the sample, 0..1. Near zero is a greyscale image. */
  chroma: number;
}

/**
 * Draws the image small and reads its pixels back. Returns an empty array
 * when the canvas cannot be read: a zero-dimension decode, a browser with no
 * 2D context, or a tainted canvas, which a cross-origin source would cause
 * (the drop handler only accepts local files, so that path should not arise,
 * but a silent empty palette beats a thrown error on the stage).
 */
function samplePixels(image: HTMLImageElement): Rgb[] {
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  if (!width || !height) return [];

  const scale = Math.min(1, SAMPLE_EDGE / Math.max(width, height));
  const canvasWidth = Math.max(1, Math.round(width * scale));
  const canvasHeight = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];
  ctx.drawImage(image, 0, 0, canvasWidth, canvasHeight);

  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, canvasWidth, canvasHeight).data;
  } catch {
    return [];
  }

  const pixels: Rgb[] = [];
  for (let i = 0; i < data.length; i += 4) {
    // Mostly transparent pixels carry no colour worth theming from.
    if (data[i + 3] < 128) continue;
    pixels.push([data[i], data[i + 1], data[i + 2]]);
  }
  return pixels;
}

/**
 * Median cut: repeatedly split the box with the widest channel spread at its
 * median, until there are `count` boxes. Cheap, deterministic, and it keeps
 * a small vivid region alive instead of averaging it into the background the
 * way a plain mean would.
 */
function medianCut(pixels: Rgb[], count: number): Rgb[][] {
  let boxes: Rgb[][] = [pixels];

  while (boxes.length < count) {
    let target = -1;
    let widest = 0;
    let channel = 0;

    boxes.forEach((box, index) => {
      if (box.length < 2) return;
      for (let c = 0; c < 3; c += 1) {
        let min = 255;
        let max = 0;
        for (const pixel of box) {
          if (pixel[c] < min) min = pixel[c];
          if (pixel[c] > max) max = pixel[c];
        }
        const range = max - min;
        if (range > widest) {
          widest = range;
          target = index;
          channel = c;
        }
      }
    });

    // Every box is either a single pixel or a single colour: nothing left
    // to split, however many boxes were asked for.
    if (target < 0 || widest === 0) break;

    const box = boxes[target];
    box.sort((a, b) => a[channel] - b[channel]);
    const mid = box.length >> 1;
    boxes = [
      ...boxes.slice(0, target),
      box.slice(0, mid),
      box.slice(mid),
      ...boxes.slice(target + 1),
    ];
  }

  return boxes.filter((box) => box.length > 0);
}

/** Quantizes an already-decoded image into its ranked representative colours. */
export function extractPalette(image: HTMLImageElement): ImagePalette {
  const pixels = samplePixels(image);
  if (pixels.length === 0) return { swatches: [], chroma: 0 };

  const total = pixels.length;
  let chromaSum = 0;
  for (const pixel of pixels) chromaSum += rgbToHsl(pixel)[1];

  const swatches = medianCut(pixels, BOX_COUNT).map((box) => {
    let r = 0;
    let g = 0;
    let b = 0;
    for (const pixel of box) {
      r += pixel[0];
      g += pixel[1];
      b += pixel[2];
    }
    const rgb: Rgb = [r / box.length, g / box.length, b / box.length];
    return {
      hex: rgbToHex(rgb),
      hsl: rgbToHsl(rgb),
      weight: box.length / total,
    };
  });

  swatches.sort((a, b) => b.weight - a.weight);
  return { swatches, chroma: chromaSum / total };
}

/**
 * How much a swatch is worth as a brand colour: saturated, away from the
 * lightness extremes where hue stops reading, and actually present in the
 * image. The weight is heavily rooted so a large flat sky cannot simply
 * outvote the one vivid thing in the frame.
 */
function vividness(swatch: PaletteSwatch): number {
  const [, sat, light] = swatch.hsl;
  if (sat < CHROMATIC_SAT) return 0;
  const body = Math.max(0.05, 1 - Math.abs(light - 0.5) * 1.6);
  return sat * body * Math.pow(swatch.weight, 0.25);
}

/** The image's chromatic colours, strongest first, with near-identical hues
    merged so six accents cannot all come out the same blue. */
function distinctChromatic(swatches: PaletteSwatch[]): PaletteSwatch[] {
  const ranked = [...swatches].sort((a, b) => vividness(b) - vividness(a));
  const out: PaletteSwatch[] = [];
  for (const swatch of ranked) {
    if (swatch.hsl[1] < CHROMATIC_SAT) continue;
    if (out.some((kept) => hueDistance(kept.hsl[0], swatch.hsl[0]) < HUE_MERGE_DEGREES)) {
      continue;
    }
    out.push(swatch);
  }
  return out;
}

const median = (values: number[]) => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[sorted.length >> 1];
};

/**
 * The six ambient accent roles, filled from the image.
 *
 * Each role keeps its own place in the hue circle and takes the nearest image
 * hue that has not already been claimed. A role with nothing near it keeps
 * its shipped hue but adopts the image's chroma character, so a muted photo
 * produces a muted sextet rather than six shipped colours with two image ones
 * bolted on. The set stays six distinguishable hues either way, which is what
 * the background blobs and chart series 2 to 7 need of it.
 */
function accentsFrom(chromatic: PaletteSwatch[]): AccentSextet {
  if (chromatic.length === 0) return { ...SHIPPED_ACCENTS };

  const characterSat = median(chromatic.map((s) => s.hsl[1]));
  const characterLight = median(chromatic.map((s) => s.hsl[2]));
  const claimed = new Set<number>();
  const accents = {} as AccentSextet;

  for (const name of ACCENT_NAMES) {
    const roleHue = ACCENT_HUES[name];
    let best = -1;
    let bestDistance = Infinity;
    chromatic.forEach((swatch, index) => {
      if (claimed.has(index)) return;
      const distance = hueDistance(swatch.hsl[0], roleHue);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = index;
      }
    });

    if (best >= 0 && bestDistance <= ACCENT_MATCH_DEGREES) {
      claimed.add(best);
      accents[name] = toHex(band(chromatic[best].hsl, ACCENT_SAT, ACCENT_LIGHT));
    } else {
      accents[name] = toHex(
        band([roleHue, characterSat, characterLight], ACCENT_SAT, ACCENT_LIGHT)
      );
    }
  }

  return accents;
}

/** A set of lever positions read from an image. Every field is a lever the
    playground already owns. */
export interface ImageTheme {
  /** The action colour. */
  brand: string;
  tintOn: boolean;
  tintSeed: string;
  /** Percent, matching the Tint neutrals slider. */
  tintStrength: number;
  accents: AccentSextet;
  /** The swatches the theme was read from, for the source card to show. */
  swatches: PaletteSwatch[];
}

/**
 * Turns a palette into lever positions. Returns null when the palette is
 * empty, which is the one case the caller has to report rather than apply.
 */
export function themeFromPalette(palette: ImagePalette): ImageTheme | null {
  if (palette.swatches.length === 0) return null;

  const chromatic = distinctChromatic(palette.swatches);
  const lead = chromatic[0];

  /* A greyscale image gets a greyscale theme rather than an invented hue:
     the action colour lands on the image's darkest mass, which is a grey,
     and actionColorPlan points the action tokens at the neutral scale.
     `swatches` is non-empty above, so the darkest one always exists. */
  const darkest = [...palette.swatches].sort((a, b) => a.hsl[2] - b.hsl[2])[0];
  const brand = lead
    ? toHex(band(lead.hsl, ACTION_SAT, ACTION_LIGHT))
    : toHex([0, 0, clamp(darkest.hsl[2], 0.08, 0.3)]);

  /* The neutral wash follows the image's overall cast, which is the most of
     the frame rather than the most vivid part of it. */
  const cast =
    [...palette.swatches]
      .filter((s) => s.hsl[1] >= CHROMATIC_SAT)
      .sort((a, b) => b.weight - a.weight)[0] ?? lead;

  return {
    brand,
    tintOn: palette.chroma >= 0.08,
    tintSeed: cast ? toHex(band(cast.hsl, TINT_SAT, TINT_LIGHT)) : brand,
    tintStrength: Math.round(clamp(palette.chroma * 22, 3, 12)),
    accents: accentsFrom(chromatic),
    swatches: (chromatic.length > 0 ? chromatic : palette.swatches).slice(
      0,
      DISPLAY_SWATCHES
    ),
  };
}

/** What a dropped or chosen file yields: the object URL the card renders and
    the lever positions read from it. */
export interface ImageThemeSource {
  /** Object URL for the decoded file. The caller owns revoking it. */
  url: string;
  name: string;
  theme: ImageTheme;
}

/**
 * Decodes a local image file and reads a theme from it.
 *
 * The file is turned into an object URL, which is a handle to the bytes the
 * browser already holds: no network request, no upload, no storage. The URL
 * is revoked here on every failure path, and handed to the caller to revoke
 * on success once the card that renders it goes away.
 */
export async function themeFromFile(file: File): Promise<ImageThemeSource | null> {
  if (!file.type.startsWith("image/")) return null;

  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const theme = themeFromPalette(extractPalette(image));
    if (!theme) {
      URL.revokeObjectURL(url);
      return null;
    }
    return { url, name: file.name, theme };
  } catch {
    // A corrupt or unsupported file: decode() rejects and the caller reports.
    URL.revokeObjectURL(url);
    return null;
  }
}
