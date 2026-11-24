/**
 * The playground's shader vocabulary (the Shaders view, and the ground it
 * lays under every view). A scene is one look (a horizon, a blob field); a pass is a finishing step any scene can take (grain, a fade, a
 * vignette); a recipe is a scene, its settings, and which passes are on
 * with theirs. Every setting is declared as data, so the panel draws its
 * sliders from the declaration and never needs a hand-built control.
 */

/** One numeric setting of a scene, drawn as a slider by a host that offers controls. */
export type ShaderSceneParamSpec = {
  /** The setting's name: a GLSL identifier, which the scene reads as `uniform float u_<key>`. */
  key: string;
  /** The name a host prints beside the slider. */
  label: string;
  /** The lowest value the slider offers. */
  min: number;
  /** The highest value the slider offers. */
  max: number;
  /** The slider's step. */
  step: number;
  /** The value the scene takes when `params` does not set this key. */
  default: number;
};

/** The engine's own name for a setting; `ShaderSceneParamSpec` is the published one. */
export type ParamSpec = ShaderSceneParamSpec;

/**
 * A scene of your own, as ShaderScene's `scene` prop takes it: the colour
 * roles it reads, its settings, and the GLSL that paints it. Hold it at
 * module scope or pass it inline; the program is rebuilt only when its
 * content changes.
 */
export type ShaderSceneSource = {
  /**
   * The colour custom properties the scene reads, resolved from the live
   * cascade at the scene into `u_col[0..]` in this order, eight at most.
   * Name the `--color-ambient-*` roles and the scene re-themes with the page.
   */
  colours: string[];
  /**
   * `dark` for a scene that only adds light and so only reads on a dark
   * ground. On a light page its light is computed against a near-black
   * ground of its own and laid onto the page as colour, its brightest
   * marks as a deepened ink of the scene's first colour. A scene
   * without it paints for both modes itself, from the page ground
   * (`u_ground`).
   */
  mode?: "dark";
  /**
   * A ramp of characters, thin to heavy, for a scene that prints type. It
   * is drawn once into a strip texture in the theme's code face
   * (`--font-family-code`) and reaches the GLSL as `u_glyphs`, with the
   * number of characters in `u_glyphCount`.
   */
  glyphs?: string;
  /**
   * The most drawing-buffer pixels per CSS pixel the scene may use, for a
   * scene with detail finer than soft light (type, points). Defaults to 1;
   * the ratio in use reaches the GLSL as `u_ratio`.
   */
  pixelRatio?: number;
  /** The scene's settings. Each arrives in the GLSL as `uniform float u_<key>`, declared for you. */
  params: ShaderSceneParamSpec[];
  /**
   * GLSL ES 3.00 defining `vec3 scene(vec2 uv, float t)`, which returns the
   * pixel's linear colour over the ground (`u_ground`). `uv` runs 0 to 1
   * from the bottom left and `t` is the scene's clock in seconds. The
   * uniforms and the noise helpers are declared before it.
   */
  glsl: string;
};

/**
 * A scene the library ships: a source with the id it is picked by, and the
 * label and description a picker prints. `glsl` defines
 * `vec3 scene(vec2 uv, float t)`, returning the final linear colour of the
 * pixel over the page ground (`u_ground`). Its settings arrive as
 * `uniform float u_<key>`, and its colours as `u_col[i]` in the order
 * `colours` lists their tokens.
 */
export type Scene = ShaderSceneSource & {
  id: string;
  label: string;
  description: string;
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
