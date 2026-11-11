/**
 * The playground's shader vocabulary (the Shaders view, and the ground it
 * lays under every view). A scene is one look (a horizon, a blob field); a pass is a finishing step any scene can take (grain, a fade, a
 * vignette); a recipe is a scene, its settings, and which passes are on
 * with theirs. Every setting is declared as data, so the panel draws its
 * sliders from the declaration and never needs a hand-built control.
 */

/** One numeric setting, drawn as a slider. */
export type ParamSpec = {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
};

/**
 * A look. `glsl` defines `vec3 scene(vec2 uv, float t)`, returning the
 * final linear colour of the pixel over the page ground (`u_ground`). Its
 * settings arrive as `uniform float u_<key>`, and its colours as
 * `u_col[i]` in the order `colours` lists their tokens.
 */
export type Scene = {
  id: string;
  label: string;
  description: string;
  /** Colour tokens, resolved from the live cascade into `u_col[0..]`. */
  colours: string[];
  /**
   * `dark` for a scene that only reads on a dark ground (it adds light).
   * On a light page its surface paints a near-black ground of its own
   * (coloursFor), rather than setting data-theme on itself: a nested
   * [data-theme] matches the base dark tokens and would hide the theme
   * preset's colours.
   */
  mode?: "dark";
  /**
   * A ramp of characters, thin to heavy, for a scene that prints type. The
   * renderer draws it once into a strip texture in the theme's code face
   * (`--font-family-code`) and hands it to the GLSL as `u_glyphs`, with
   * the number of characters in `u_glyphCount`.
   */
  glyphs?: string;
  /**
   * The most drawing-buffer pixels per CSS pixel the scene may use, for a
   * scene with detail finer than soft light (type). Defaults to 1; the
   * ratio in use reaches the GLSL as `u_ratio`.
   */
  pixelRatio?: number;
  params: ParamSpec[];
  glsl: string;
};

/**
 * A finishing step. `glsl` defines one function named `pass_<id>`: a
 * `light` pass takes and returns the linear colour, before encoding; an
 * `srgb` pass takes and returns the encoded colour. Its settings arrive as
 * `uniform float u_<id>_<key>`, and `u_<id>_on` switches it.
 */
export type Pass = {
  id: string;
  label: string;
  stage: "light" | "srgb";
  on: boolean;
  params: ParamSpec[];
  glsl: string;
};

/** What the canvas reads every frame. A ref holds it, so a drag never renders. */
export type Values = {
  speed: number;
  scene: Record<string, number>;
  passes: Record<string, { on: boolean; params: Record<string, number> }>;
};

/** A recipe as it is copied out: the scene's id with the values above. */
export type Recipe = Values & { sceneId: string };

export const MAX_COLOURS = 8;

export function defaultsFor(params: ParamSpec[]) {
  return Object.fromEntries(params.map((param) => [param.key, param.default]));
}
