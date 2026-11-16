/**
 * Builds one fragment shader from a scene and the passes: the uniforms
 * both declare, the common GLSL, the scene's `scene()`, each pass's
 * function, and a `main` that runs the scene, lays a night scene onto a
 * light page when it must (u_lightMode), then runs the light passes, the
 * encode and the srgb passes, each gated by its `u_<id>_on`.
 *
 * The scene's GLSL is numbered as source string 1 from its own first line
 * (`#line`), so a compiler log names the line the author wrote, as
 * `ERROR: 1:<line>`; everything the engine wrote is string 0 or 2.
 */
import { COMMON_GLSL } from "./common.glsl";
import type { Pass, ShaderSceneSource } from "./types";
import { MAX_COLOURS } from "./types";

export const VERTEX = /* glsl */ `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`;

/** Every float uniform the shader declares, for the canvas to set each frame. */
export function uniformNames(scene: ShaderSceneSource, passes: Pass[]) {
  return [
    ...scene.params.map((param) => `u_${param.key}`),
    ...passes.flatMap((pass) => [
      `u_${pass.id}_on`,
      ...pass.params.map((param) => `u_${pass.id}_${param.key}`),
    ]),
  ];
}

export function assemble(scene: ShaderSceneSource, passes: Pass[]) {
  const floats = uniformNames(scene, passes)
    .map((name) => `uniform float ${name};`)
    .join("\n");
  const call = (stage: Pass["stage"], target: string) =>
    passes
      .filter((pass) => pass.stage === stage)
      .map((pass) => `  if (u_${pass.id}_on > 0.5) ${target} = pass_${pass.id}(${target}, uv);`)
      .join("\n");

  return /* glsl */ `#version 300 es
precision highp float;

uniform vec2 u_size;
uniform float u_time;
uniform vec3 u_ground;   // the scene's ground: the page's, or a night scene's own
uniform vec3 u_page;     // the page's ground, which the passes fade to
uniform float u_lightMode; // 1: a night scene laid onto a light page
uniform float u_ratio;   // drawing-buffer pixels per CSS pixel
uniform vec3 u_col[${MAX_COLOURS}];
${scene.glyphs ? "uniform sampler2D u_glyphs;\nuniform float u_glyphCount;" : ""}
${floats}

out vec4 outColor;

${COMMON_GLSL}

#line 1 1
${scene.glsl}
#line 1 2

${passes.map((pass) => pass.glsl).join("\n")}

void main() {
  vec2 uv = gl_FragCoord.xy / u_size;
  vec3 lin = scene(uv, u_time);
  /* A night scene on a light page: the light it adds over its own dark
     ground is laid onto the page as a pale tint, its hue washed most of
     the way to white and never more than a light wash, so a horizon reads
     as a soft dawn on paper rather than a dark block on it. */
  if (u_lightMode > 0.5) {
    vec3 light = max(lin - u_ground, vec3(0.0));
    float peak = max(light.r, max(light.g, light.b));
    vec3 hue = light / max(peak, 1e-4);
    vec3 pastel = mix(hue, vec3(1.0), 0.3);
    float strength = clamp(pow(dot(light, vec3(0.2126, 0.7152, 0.0722)) * 4.0, 0.7), 0.0, 0.85);
    lin = mix(u_page, u_page * pastel, strength);
  }
${call("light", "lin")}
  vec3 srgb = pow(max(lin, vec3(0.0)), vec3(1.0 / 2.2));
  /* A one-step dither under everything, so wide ramps never band. */
  srgb += (float(ihash(uvec2(gl_FragCoord.xy)) & 255u) / 255.0 - 0.5) / 255.0;
${call("srgb", "srgb")}
  outColor = vec4(clamp(srgb, 0.0, 1.0), 1.0);
}
`;
}

/**
 * What is wrong with a scene before the compiler is asked, for the
 * development warnings: the mistakes whose compiler message, or whose
 * silence, would not lead an author back to the cause. `resolves` says
 * whether a colour custom property has a value at the scene.
 */
export function sceneProblems(
  scene: ShaderSceneSource,
  passes: Pass[],
  resolves: (property: string) => boolean
): string[] {
  const problems: string[] = [];
  for (const param of scene.params) {
    if (!/^[A-Za-z]\w*$/.test(param.key)) {
      problems.push(`ShaderScene: the param key "${param.key}" is not a GLSL identifier, so its uniform cannot be declared.`);
    }
  }
  const declared = new Set<string>();
  const twice = new Set<string>();
  for (const [, name] of assemble(scene, passes).matchAll(/^\s*uniform\s+\w+\s+(\w+)/gm)) {
    if (declared.has(name)) twice.add(name);
    declared.add(name);
  }
  for (const name of twice) {
    problems.push(`ShaderScene: the uniform ${name} is declared twice. A param key must not repeat a uniform the engine or a pass declares, and the scene's GLSL must not declare its params itself.`);
  }
  if (scene.colours.length > MAX_COLOURS) {
    problems.push(`ShaderScene: a scene reads at most ${MAX_COLOURS} colours, and this one lists ${scene.colours.length}; the rest are dropped.`);
  }
  for (const property of scene.colours) {
    if (!resolves(property)) {
      problems.push(`ShaderScene: the colour ${property} has no value at the scene, so it falls back to the text colour.`);
    }
  }
  return problems;
}
