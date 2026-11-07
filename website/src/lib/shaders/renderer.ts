/**
 * The renderer both canvases share: the live stage and the thumbnail baker.
 * `createRenderer` compiles one scene with the passes into a program on a
 * WebGL2 context and returns a `draw` that sets every uniform from a values
 * object and paints one frame. `readColours` resolves a scene's tokens from
 * the live cascade.
 */
import { assemble, uniformNames, VERTEX } from "./assemble";
import type { Pass, Scene, Values } from "./types";
import { MAX_COLOURS } from "./types";

export type Rgb = [number, number, number];

/** A near-black ground in linear RGB, for baking a night-only scene's card. */
const NIGHT_GROUND: Rgb = [0.0015, 0.0018, 0.003];
export type Colours = { ground: Rgb; colours: Rgb[] };

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
  return { ground, colours };
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
  const uCols = at("u_col");
  const floats = uniformNames(scene, passes).map((name) => [name, at(name)] as const);

  return {
    setColours({ ground, colours }: Colours) {
      gl.uniform3fv(uGround, ground);
      const flat = new Float32Array(MAX_COLOURS * 3);
      colours.forEach((rgb, i) => flat.set(rgb, i * 3));
      gl.uniform3fv(uCols, flat);
    },
    draw(values: Values, time: number, width: number, height: number) {
      gl.viewport(0, 0, width, height);
      gl.uniform2f(uSize, width, height);
      gl.uniform1f(uTime, time);
      for (const [name, location] of floats) gl.uniform1f(location, valueOf(values, passes, name));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
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
    const colours = readColours(host, scene.colours);
    /* A night-only scene bakes on a dark ground even while the page is
       light, so its card shows it the way it runs. */
    const pageIsDark = document.documentElement.getAttribute("data-theme") === "dark";
    if (scene.mode === "dark" && !pageIsDark) colours.ground = NIGHT_GROUND;
    renderer.setColours(colours);
    renderer.draw(values, 20, width, height);
    const url = canvas.toDataURL("image/jpeg", 0.85);
    renderer.dispose();
    return url;
  });
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  return urls;
}
