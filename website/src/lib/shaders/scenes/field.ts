/**
 * The blob field, after the home page's ambient background: eight soft
 * Gaussian sources at the home page's positions and sizes, coloured from
 * its tokens, blended in linear space, warped by fbm so the field flows,
 * and stretched along a diagonal into light streams. A compact
 * re-implementation for the playground's ground, not ShaderField itself: the cursor wake
 * and the CSS fallback are left out, and the field fills the stage rather
 * than a band.
 */
import type { Scene } from "../types";

export const field: Scene = {
  id: "field",
  label: "Field",
  description: "The home page's ambient field: soft sources of colour that flow and stream.",
  colours: [
    "--color-ambient-1",
    "--color-ambient-2",
    "--color-ambient-3",
    "--color-bg-container-secondary",
    "--color-ambient-4",
    "--color-ambient-5",
    "--color-ambient-6",
    "--color-core-ui-secondary",
  ],
  params: [
    { key: "intensity", label: "Intensity", min: 0, max: 1, step: 0.01, default: 0.55 },
    { key: "spread", label: "Spread", min: 0.4, max: 2, step: 0.01, default: 1 },
    { key: "warp", label: "Flow", min: 0, max: 0.5, step: 0.005, default: 0.14 },
    { key: "scale", label: "Flow scale", min: 0.5, max: 6, step: 0.05, default: 2.7 },
    { key: "streak", label: "Streaks", min: 0, max: 1, step: 0.01, default: 0.4 },
    { key: "lift", label: "Lift", min: -0.5, max: 0.5, step: 0.01, default: 0.1 },
  ],
  glsl: /* glsl */ `
/* The home page's blobs: centre (x, y downward, in widths from the
   centre), size, period, phase. */
const vec4 BLOBS[8] = vec4[8](
  vec4(0.175, 0.125, 0.45, 18.0),
  vec4(0.125, 0.125, 0.55, 16.0),
  vec4(0.35, 0.25, 0.9, 22.0),
  vec4(0.025, 0.075, 0.55, 14.0),
  vec4(-0.125, 0.475, 0.55, 17.0),
  vec4(0.39, -0.26, 0.48, 19.0),
  vec4(0.35, 0.3, 0.3, 15.0),
  vec4(-0.125, -0.025, 0.75, 20.0)
);
const float PHASES[8] = float[8](0.0, 1.0, 0.5, 1.5, 0.8, 0.3, 1.2, 0.7);

vec3 scene(vec2 uv, float t) {
  /* Origin at the centre, one unit a stage width, y downward, lifted. */
  vec2 p = (gl_FragCoord.xy - 0.5 * u_size) / u_size.x;
  p.y = -p.y + u_lift;

  float ca = cos(0.5);
  float sa = sin(0.5);
  mat2 toStreak = mat2(ca, -sa, sa, ca);
  float squeeze = 1.0 + u_streak * 4.0;

  vec2 ps = toStreak * p;
  ps.y *= squeeze;
  vec2 q = vec2(
    fbm(ps * u_scale + vec2(0.0, t * 0.03)),
    fbm(ps * u_scale + vec2(5.2, 1.3) - t * 0.024)
  );
  vec2 w = p + u_warp * (q - 0.5);

  vec3 acc = vec3(0.0);
  float cov = 0.0;
  for (int i = 0; i < 8; i++) {
    float speed = 6.2832 / BLOBS[i].w;
    vec2 c = BLOBS[i].xy + 0.045 * vec2(cos(speed * t + PHASES[i]), sin(speed * 0.8 * t + PHASES[i] * 1.7));
    vec2 d = toStreak * (w - c);
    d.y *= squeeze;
    float s = BLOBS[i].z * 0.5 * u_spread;
    float g = exp(-dot(d, d) / (2.0 * s * s));
    acc += u_col[i] * g;
    cov += g;
  }
  vec3 colour = acc / max(cov, 1e-4);
  float alpha = u_intensity * (1.0 - exp(-cov * 0.9));
  return mix(u_ground, colour, alpha);
}
`,
};
