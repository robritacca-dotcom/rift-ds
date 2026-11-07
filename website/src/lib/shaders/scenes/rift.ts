/**
 * The rift, after /labs/rift, as a soft shader rather than streaming type:
 * a glowing vertical tear in the page that opens widest at its middle and
 * narrows to a seam at either end, a bright core inside a wide glow and a
 * faint haze, and streaks of light drawn in toward it from both sides. The
 * tear's line wanders slowly, and the colour runs from one ambient tone at
 * the top to another at the bottom, the rift lab's own pair.
 */
import type { Scene } from "../types";

export const rift: Scene = {
  id: "rift",
  label: "Rift",
  description: "A glowing tear in the page, opening at its middle, light streaming in.",
  mode: "dark",
  colours: ["--color-ambient-2", "--color-ambient-3", "--color-ambient-1"],
  params: [
    { key: "offset", label: "Position", min: -0.45, max: 0.45, step: 0.01, default: 0 },
    { key: "open", label: "Opening", min: 0, max: 1.5, step: 0.01, default: 0.8 },
    { key: "glow", label: "Glow", min: 0, max: 2, step: 0.01, default: 1 },
    { key: "wave", label: "Wander", min: 0, max: 1, step: 0.01, default: 0.4 },
    { key: "streaks", label: "Streaks", min: 0, max: 2, step: 0.01, default: 1 },
    { key: "flow", label: "Flow", min: 0, max: 0.3, step: 0.005, default: 0.08 },
  ],
  glsl: /* glsl */ `
#define u_from u_col[0]
#define u_to u_col[1]
#define u_spark u_col[2]

vec3 scene(vec2 uv, float t) {
  float aspect = u_size.x / u_size.y;
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);

  vec2 q = vec2(
    fbm(p * 1.6 + vec2(0.0, t * 0.03)),
    fbm(p * 1.6 + vec2(5.2, 1.3) - t * 0.025)
  );

  /* The tear's line, wandering slowly along its length. */
  float cx = u_offset * aspect + u_wave * 0.35 * (fbm(vec2(p.y * 1.6, t * 0.04)) - 0.5);
  float dx = p.x - cx + u_flow * (q.x - 0.5);
  float ady = abs(dx);

  /* Widest at the middle, a seam at the ends. */
  float open = u_open * exp(-(p.y * p.y) / (2.0 * 0.3 * 0.3));
  float coreW = 0.006 + 0.01 * open;
  float glowW = 0.07 + 0.2 * open;
  float core = exp(-(dx * dx) / (2.0 * coreW * coreW)) * (0.25 + 0.6 * open);
  float glow = exp(-(dx * dx) / (2.0 * glowW * glowW)) * (0.25 + 0.75 * open);
  float haze = exp(-ady / 0.38) * (0.4 + 0.6 * open);

  /* Streaks drawn in toward the tear: bands that move inward over time. */
  float s = fbm(vec2(ady * 3.0 + t * 0.35, p.y * 42.0 + q.y * 3.0));
  float streak = smoothstep(0.58, 0.86, s) * exp(-ady / 0.2) * smoothstep(0.01, 0.06, ady) * u_streaks;

  vec3 colour = mix(u_from, u_to, smoothstep(-0.45, 0.45, p.y + (q.y - 0.5) * 0.4));
  vec3 light = vec3(0.0);
  light += colour * glow * 0.7 * u_glow;
  light += colour * haze * 0.1;
  light += mix(colour, vec3(1.0), 0.45) * core * 0.7 * u_glow;
  light += mix(colour, u_spark, 0.35) * streak * 0.22;
  return u_ground + light;
}
`,
};
