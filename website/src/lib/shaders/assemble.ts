/**
 * Builds one fragment shader from a scene and the passes: the uniforms
 * both declare, the common GLSL, the scene's `scene()`, each pass's
 * function, and a `main` that runs the scene, then the light passes, then
 * the encode, then the srgb passes, each gated by its `u_<id>_on`.
 */
import { COMMON_GLSL } from "./common";
import type { Pass, Scene } from "./types";
import { MAX_COLOURS } from "./types";

export const VERTEX = /* glsl */ `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`;

/** Every float uniform the shader declares, for the canvas to set each frame. */
export function uniformNames(scene: Scene, passes: Pass[]) {
  return [
    ...scene.params.map((param) => `u_${param.key}`),
    ...passes.flatMap((pass) => [
      `u_${pass.id}_on`,
      ...pass.params.map((param) => `u_${pass.id}_${param.key}`),
    ]),
  ];
}

export function assemble(scene: Scene, passes: Pass[]) {
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
uniform vec3 u_ground;
uniform vec3 u_col[${MAX_COLOURS}];
${floats}

out vec4 outColor;

${COMMON_GLSL}

${scene.glsl}

${passes.map((pass) => pass.glsl).join("\n")}

void main() {
  vec2 uv = gl_FragCoord.xy / u_size;
  vec3 lin = scene(uv, u_time);
${call("light", "lin")}
  vec3 srgb = pow(max(lin, vec3(0.0)), vec3(1.0 / 2.2));
  /* A one-step dither under everything, so wide ramps never band. */
  srgb += (float(ihash(uvec2(gl_FragCoord.xy)) & 255u) / 255.0 - 0.5) / 255.0;
${call("srgb", "srgb")}
  outColor = vec4(clamp(srgb, 0.0, 1.0), 1.0);
}
`;
}
