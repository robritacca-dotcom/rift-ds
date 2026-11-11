/**
 * The renderer both canvases share: the live stage and the thumbnail baker.
 * `createRenderer` compiles one scene with the passes into a program on a
 * WebGL2 context and returns a `draw` that sets every uniform from a values
 * object and paints one frame. `readColours` resolves a scene's tokens from
 * the live cascade. A scene that prints type (`glyphs`) also gets its ramp
 * as a strip texture, drawn in the theme's code face.
 */
import { assemble, uniformNames, VERTEX } from "./assemble";
import type { Pass, Scene, Values } from "./types";
import { MAX_COLOURS } from "./types";

export type Rgb = [number, number, number];

/** A near-black ground in linear RGB, which a night-only scene computes its light against on a light page. */
const NIGHT_GROUND: Rgb = [0.0015, 0.0018, 0.003];
export type Colours = {
  /** The ground the scene is painted against. */
  ground: Rgb;
  /** The page's own ground, which the passes fade to. */
  page: Rgb;
  /** A night scene on a light page, laid on as a pale tint. */
  lightMode: boolean;
  colours: Rgb[];
};

/** Resolves the page ground and a scene's tokens to linear RGB at `host`. */
export function readColours(host: HTMLElement, tokens: string[]): Colours {
  const probe = document.createElement("span");
  probe.style.display = "none";
  host.appendChild(probe);
  const dot = document.createElement("canvas");
  dot.width = 1;
  dot.height = 1;
  const ctx = dot.getContext("2d", { willReadFrequently: true });
  const lin = (c: number) => Math.pow(c / 255, 2.2);
  const read = (token: string): Rgb => {
    if (!ctx) return [0.2, 0.2, 0.2];
    probe.style.color = `var(${token})`;
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = getComputedStyle(probe).color;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return [lin(r), lin(g), lin(b)];
  };
  const ground = read("--color-bg-page-primary");
  const colours = tokens.slice(0, MAX_COLOURS).map(read);
  probe.remove();
  return { ground, page: ground, lightMode: false, colours };
}

/**
 * A scene's colours for a surface: read from the cascade. A night-only
 * scene on a light page computes its light against a dark ground of its
 * own, and the shader lays that light onto the page as a pale tint
 * (u_lightMode), so its masks still fade to the page and the theme stays
 * light.
 */
export function coloursFor(host: HTMLElement, scene: Scene): Colours {
  const colours = readColours(host, scene.colours);
  const pageIsDark = document.documentElement.getAttribute("data-theme") === "dark";
  if (scene.mode === "dark" && !pageIsDark) {
    colours.ground = NIGHT_GROUND;
    colours.lightMode = true;
  }
  return colours;
}

/** The face a scene's type is drawn in: the theme's code face at `host`. */
export function glyphFontFor(host: HTMLElement) {
  return getComputedStyle(host).getPropertyValue("--font-family-code").trim() || "monospace";
}

const GLYPH_W = 48;
const GLYPH_H = 80;

/** A scene's ramp as one strip, a character per cell, white on black. */
function drawGlyphs(ramp: string, font: string) {
  const glyphs = [...ramp];
  const strip = document.createElement("canvas");
  strip.width = GLYPH_W * glyphs.length;
  strip.height = GLYPH_H;
  const ctx = strip.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, strip.width, strip.height);
    ctx.fillStyle = "#fff";
    ctx.font = `700 ${GLYPH_H * 0.78}px ${font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    glyphs.forEach((glyph, i) => ctx.fillText(glyph, (i + 0.5) * GLYPH_W, GLYPH_H * 0.52));
  }
  return { strip, count: glyphs.length };
}

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/** The value a uniform takes from a values object. */
function valueOf(values: Values, passes: Pass[], name: string): number {
  for (const pass of passes) {
    const prefix = `u_${pass.id}_`;
    if (!name.startsWith(prefix)) continue;
    const state = values.passes[pass.id];
    const key = name.slice(prefix.length);
    if (key === "on") return state?.on ? 1 : 0;
    return state?.params[key] ?? 0;
  }
  return values.scene[name.slice(2)] ?? 0;
}

export function createRenderer(gl: WebGL2RenderingContext, scene: Scene, passes: Pass[]) {
  const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fs = compile(gl, gl.FRAGMENT_SHADER, assemble(scene, passes));
  const program = gl.createProgram();
  if (!vs || !fs || !program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.useProgram(program);
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const at = (name: string) => gl.getUniformLocation(program, name);
  const uSize = at("u_size");
  const uTime = at("u_time");
  const uGround = at("u_ground");
  const uPage = at("u_page");
  const uLightMode = at("u_lightMode");
  const uCols = at("u_col");
  const uRatio = at("u_ratio");
  const uGlyphCount = at("u_glyphCount");
  const uPointerAt = at("u_pointerAt");
  const uPointerStir = at("u_pointerStir");
  const uPointerFollow = at("u_pointerFollow");
  const floats = uniformNames(scene, passes).map((name) => [name, at(name)] as const);
  const glyphTexture = scene.glyphs ? gl.createTexture() : null;
  let glyphFont = "";

  return {
    setColours({ ground, page, lightMode, colours }: Colours) {
      gl.uniform3fv(uGround, ground);
      gl.uniform3fv(uPage, page);
      gl.uniform1f(uLightMode, lightMode ? 1 : 0);
      const flat = new Float32Array(MAX_COLOURS * 3);
      colours.forEach((rgb, i) => flat.set(rgb, i * 3));
      gl.uniform3fv(uCols, flat);
    },
    /** The eased pointer (-1 to 1 across the surface), how much it is moving
        (0 to 1) and how strongly the scene answers it (0 ignores it). */
    setPointer(x: number, y: number, stir: number, follow: number) {
      gl.uniform2f(uPointerAt, x, y);
      gl.uniform1f(uPointerStir, stir);
      gl.uniform1f(uPointerFollow, follow);
    },
    /** Draws a type scene's ramp in `font`; a scene without one ignores it. */
    setGlyphs(font: string) {
      if (!scene.glyphs || !glyphTexture || font === glyphFont) return;
      glyphFont = font;
      const { strip, count } = drawGlyphs(scene.glyphs, font);
      gl.bindTexture(gl.TEXTURE_2D, glyphTexture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, strip);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.uniform1f(uGlyphCount, count);
    },
    draw(values: Values, time: number, width: number, height: number, ratio = 1) {
      gl.viewport(0, 0, width, height);
      gl.uniform2f(uSize, width, height);
      gl.uniform1f(uRatio, ratio);
      gl.uniform1f(uTime, time);
      for (const [name, location] of floats) gl.uniform1f(location, valueOf(values, passes, name));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      gl.deleteTexture(glyphTexture);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    },
  };
}

/**
 * Paints each recipe once on a throwaway context and returns the pictures
 * as data URLs, then releases the context, so the tiles cost no live GPU
 * context of their own and the page keeps one.
 */
export function bakeThumbnails(
  host: HTMLElement,
  jobs: { scene: Scene; values: Values }[],
  passes: Pass[],
  width: number,
  height: number
): string[] {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const gl = canvas.getContext("webgl2", { antialias: false, alpha: false, preserveDrawingBuffer: true });
  if (!gl) return jobs.map(() => "");
  const urls = jobs.map(({ scene, values }) => {
    const renderer = createRenderer(gl, scene, passes);
    if (!renderer) return "";
    renderer.setColours(coloursFor(host, scene));
    renderer.setGlyphs(glyphFontFor(host));
    renderer.draw(values, 20, width, height);
    const url = canvas.toDataURL("image/jpeg", 0.85);
    renderer.dispose();
    return url;
  });
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  return urls;
}
