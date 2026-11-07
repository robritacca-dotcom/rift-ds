/**
 * The finishing passes, in the order they run. Light passes work on the
 * linear colour and pull it toward the page ground (`u_page`, the page's
 * own colour, which a night scene on a light page does not share with its
 * own `u_ground`); srgb passes work on
 * the encoded colour. Each is compiled into every shader and switched by
 * its `u_<id>_on` uniform, so toggling one never recompiles.
 */
import type { Pass } from "./types";

export const PASSES: Pass[] = [
  {
    id: "scrim",
    label: "Scrim",
    stage: "light",
    on: false,
    params: [{ key: "amount", label: "Amount", min: 0, max: 0.9, step: 0.01, default: 0.35 }],
    glsl: /* glsl */ `
vec3 pass_scrim(vec3 c, vec2 uv) {
  return mix(c, u_page, u_scrim_amount);
}`,
  },
  {
    id: "vignette",
    label: "Vignette",
    stage: "light",
    on: false,
    params: [
      { key: "amount", label: "Amount", min: 0, max: 1, step: 0.01, default: 0.5 },
      { key: "size", label: "Size", min: 0.2, max: 1.2, step: 0.01, default: 0.75 },
    ],
    glsl: /* glsl */ `
vec3 pass_vignette(vec3 c, vec2 uv) {
  vec2 q = (uv - 0.5) * vec2(u_size.x / u_size.y, 1.0);
  float v = smoothstep(u_vignette_size, u_vignette_size * 0.35, length(q));
  return mix(u_page, c, mix(1.0, v, u_vignette_amount));
}`,
  },
  {
    id: "fadeTop",
    label: "Fade the top",
    stage: "light",
    on: true,
    params: [
      { key: "start", label: "Starts at", min: 0.2, max: 0.95, step: 0.01, default: 0.43 },
      { key: "softness", label: "Softness", min: 0.3, max: 2, step: 0.01, default: 0.75 },
    ],
    glsl: /* glsl */ `
vec3 pass_fadeTop(vec3 c, vec2 uv) {
  float f = 1.0 - pow(smoothstep(u_fadeTop_start, 1.0, uv.y), u_fadeTop_softness);
  return mix(u_page, c, f);
}`,
  },
  {
    id: "fadeBottom",
    label: "Fade the bottom",
    stage: "light",
    on: true,
    params: [
      { key: "from", label: "Solid below", min: 0, max: 0.4, step: 0.01, default: 0.04 },
      { key: "to", label: "Clear above", min: 0.05, max: 0.7, step: 0.01, default: 0.3 },
    ],
    glsl: /* glsl */ `
vec3 pass_fadeBottom(vec3 c, vec2 uv) {
  float f = smoothstep(u_fadeBottom_from, max(u_fadeBottom_to, u_fadeBottom_from + 0.01), uv.y);
  return mix(u_page, c, f);
}`,
  },
  {
    id: "grain",
    label: "Film grain",
    stage: "srgb",
    on: true,
    params: [{ key: "amount", label: "Amount", min: 0, max: 0.4, step: 0.005, default: 0.198 }],
    glsl: /* glsl */ `
vec3 pass_grain(vec3 c, vec2 uv) {
  uvec2 gp = uvec2(gl_FragCoord.xy) + uvec2(
    uint(fract(u_time * 7.31) * 1024.0) * 7919u,
    uint(fract(u_time * 3.17) * 1024.0) * 104729u
  );
  float gr = float(ihash(gp) & 255u) / 255.0 - 0.5;
  return c + gr * u_grain_amount * 0.35;
}`,
  },
];
