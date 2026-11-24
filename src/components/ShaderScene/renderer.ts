/**
 * The renderer both canvases share: the live stage and the thumbnail baker.
 * `createRenderer` compiles one scene with the passes into a program on a
 * WebGL2 context and returns a `draw` that sets every uniform from a values
 * object and paints one frame. `readColours` resolves a scene's tokens from
 * the live cascade. A scene that prints type (`glyphs`, `ocean`) also gets its ramp
 * as a strip texture, drawn in the theme's code face.
 */
import { assemble, VERTEX } from "./assemble";
import type { Pass, ShaderSceneSource, Values } from "./types";
import { MAX_COLOURS } from "./types";

export type Rgb = [number, number, number];

/** A near-black ground in linear RGB, which a night-only scene computes its light against on a light page. */
const NIGHT_GROUND: Rgb = [0.0015, 0.0018, 0.003];
export type Colours = {
  /** The ground the scene is painted against. */
  ground: Rgb;
  /** The page's own ground, which the passes fade to. */
  page: Rgb;
  /** A night scene on a light page, laid on as colour and ink. */
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
 * own, and the shader lays that light onto the page as colour and ink
 * (u_lightMode), so its masks still fade to the page and the theme stays
 * light.
 */
export function coloursFor(host: HTMLElement, scene: ShaderSceneSource): Colours {
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

/** A float uniform and where its value is read from. */
type FloatSetter = [WebGLUniformLocation | null, (values: Values) => number];

/** Where a compiler or linker log goes; the console by default. */
type Report = (log: string) => void;

function compile(gl: WebGL2RenderingContext, type: number, source: string, report: Report) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    report(gl.getShaderInfoLog(shader) ?? "");
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/**
 * Compiles a scene with the passes. A scene that fails to compile or link
 * hands its log to `report` and returns null with nothing left on the
 * context; the log's line numbers are the scene's own (assemble.ts).
 */
export function createRenderer(
  gl: WebGL2RenderingContext,
  scene: ShaderSceneSource,
  passes: Pass[],
  report: Report = (log) => console.warn(log)
) {
  const vs = compile(gl, gl.VERTEX_SHADER, VERTEX, report);
  const fs = compile(gl, gl.FRAGMENT_SHADER, assemble(scene, passes), report);
  const program = gl.createProgram();
  const discard = () => {
    gl.deleteProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return null;
  };
  if (!vs || !fs || !program) return discard();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  /* A program that compiled can still fail to link, and one that did would
     draw nothing while every call succeeded. */
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    report(gl.getProgramInfoLog(program) ?? "");
    return discard();
  }
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
  /* One setter per float uniform, each knowing where its value lives, so a
     scene's key is never mistaken for a pass's setting by its name. */
  const floats: FloatSetter[] = [
    ...scene.params.map(
      (param): FloatSetter => [at(`u_${param.key}`), (values) => values.scene[param.key] ?? 0]
    ),
    ...passes.flatMap((pass): FloatSetter[] => [
      [at(`u_${pass.id}_on`), (values) => (values.passes[pass.id]?.on ? 1 : 0)],
      ...pass.params.map(
        (param): FloatSetter => [
          at(`u_${pass.id}_${param.key}`),
          (values) => values.passes[pass.id]?.params[param.key] ?? 0,
        ]
      ),
    ]),
  ];
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
      for (const [location, read] of floats) gl.uniform1f(location, read(values));
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
  jobs: { scene: ShaderSceneSource; values: Values }[],
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
