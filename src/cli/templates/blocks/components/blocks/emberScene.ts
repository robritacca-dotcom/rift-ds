/**
 * A shader scene of your own, for ShaderScene's `scene` prop: a bed of
 * light that rises in slow tongues. Rename it, then change it. The three
 * parts are everything a scene is:
 *
 * - `colours`: the custom properties it reads, handed to the GLSL as
 *   `u_col[0]`, `u_col[1]` and so on. Naming the theme's ambient roles
 *   means it follows the theme and the colour mode.
 * - `params`: its settings. Each arrives as `uniform float u_<key>`,
 *   declared for you, and is set through the component's `params` prop.
 * - `glsl`: `vec3 scene(vec2 uv, float t)`, returning the pixel's linear
 *   colour over the ground (`u_ground`). `uv` runs 0 to 1 from the bottom
 *   left, `t` is seconds, and `fbm`, `vnoise`, `rnd` and `lobe` are there
 *   to call.
 *
 * `mode: 'dark'` says it only adds light: on a light page the component
 * lays that light on as colour and ink. Leave it out for a scene that paints
 * both modes itself.
 */

import type { ShaderSceneSource } from 'rift-ds/components/ShaderScene/ShaderScene';

export const emberScene: ShaderSceneSource = {
  mode: 'dark',
  colours: ['--color-ambient-4', '--color-ambient-5'],
  params: [
    { key: 'glow', label: 'Glow', min: 0, max: 2, step: 0.01, default: 1 },
    { key: 'height', label: 'Height', min: 0.1, max: 1.5, step: 0.01, default: 0.8 },
    { key: 'scale', label: 'Scale', min: 0.5, max: 6, step: 0.05, default: 2.4 },
  ],
  glsl: /* glsl */ `
vec3 scene(vec2 uv, float t) {
  // Square the space up, so the noise is not stretched on a wide stage.
  float aspect = u_size.x / u_size.y;
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y);

  // How high the light reaches in this column: slow noise, drifting.
  float reach = u_height * (0.35 + 1.1 * fbm(vec2(p.x * u_scale + t * 0.05, t * 0.08)));

  // Brightest at the floor and gone at its reach, with a soft top edge.
  float body = smoothstep(reach, 0.0, uv.y);
  body *= body;

  // Finer noise rising through it lifts the second colour out as embers.
  float fine = fbm(vec2(p.x, uv.y) * u_scale * 5.0 - vec2(0.0, t * 0.35));
  float embers = smoothstep(0.5, 0.85, fine) * body;

  // Add the light to the ground: the fades and light mode depend on it.
  vec3 light = (u_col[0] * body * 1.2 + u_col[1] * embers * 0.5) * u_glow;
  return u_ground + light;
}
`,
};
