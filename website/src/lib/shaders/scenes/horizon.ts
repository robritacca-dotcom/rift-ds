/**
 * The horizon, ported from /labs/horizon as a scene: a planet's limb at
 * night with a fixed sun at the apex, soft layers of light along the arc,
 * a hazy world of land and cloud below, and deep ocean blue further down.
 * The horizon lab's own fades and grain are passes here, so they can be switched
 * and tuned like any other scene's.
 */
import type { Scene } from "../types";

export const horizon: Scene = {
  id: "horizon",
  label: "Horizon",
  description: "A planet's limb at night, a fixed sun at the apex, a hazy world and ocean below.",
  mode: "dark",
  /* The background field's roles, the ones a preset tunes for ambient
     shaders and a DESIGN.md import rewrites from the action colour: in the
     base theme they are cobalt, amber, coral and gold, so the horizon's own
     look is unchanged, and an import recolours it with the field. */
  colours: [
    "--color-ambient-4",
    "--color-ambient-6",
    "--color-ambient-5",
    "--color-ambient-1",
  ],
  params: [
    { key: "crown", label: "Horizon height", min: 0.15, max: 0.75, step: 0.01, default: 0.4 },
    { key: "curve", label: "Flatness", min: 1.5, max: 10, step: 0.1, default: 5 },
    { key: "warp", label: "Flow", min: 0, max: 0.2, step: 0.005, default: 0.07 },
    { key: "glow", label: "Glow", min: 0, max: 2, step: 0.01, default: 1 },
    { key: "clouds", label: "Clouds", min: 0, max: 2, step: 0.01, default: 1 },
    { key: "ocean", label: "Ocean", min: 0, max: 2.5, step: 0.01, default: 1 },
    { key: "beam", label: "Beam", min: 0, max: 2.5, step: 0.01, default: 1 },
  ],
  glsl: /* glsl */ `
#define u_scatter u_col[0]
#define u_halo u_col[1]
#define u_rim u_col[2]
#define u_sun u_col[3]

vec3 scene(vec2 uv, float t) {
  float aspect = u_size.x / u_size.y;
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y);

  vec2 q = vec2(
    fbm(p * 1.4 + vec2(0.0, t * 0.03)),
    fbm(p * 1.4 + vec2(5.2, 1.3) - t * 0.024)
  );
  vec2 w = p + u_warp * (q - 0.5);

  float crown = u_crown;
  float radius = u_curve * max(aspect, 1.0);
  vec2 centre = vec2(0.0, crown - radius);
  vec2 wl = p + u_warp * 0.17 * (q - 0.5);
  float d = length(wl - centre) - radius;

  float halfW = 0.5 * aspect;
  float sunX = exp(-pow(w.x, 2.0) / (2.0 * 0.28 * 0.28));
  float wide = exp(-pow(w.x, 2.0) / (2.0 * 0.75 * 0.75));
  float energy = (0.4 + 0.45 * wide + 0.9 * sunX) * u_glow;
  float side = clamp(abs(w.x) / halfW, 0.0, 1.0);

  float curtain = fbm(vec2(w.x * 5.0 + t * 0.05, d * 1.2 - t * 0.02));
  float band = fbm(vec2(w.x * 1.2 - t * 0.035, d * 11.0 + t * 0.015));
  float veil = fbm(vec2(w.x * 2.2 + t * 0.02, d * 3.5 - t * 0.01) + q * 1.5);

  vec3 amber = mix(u_halo, u_sun, 0.35);
  vec3 light = vec3(0.0);
  light += u_scatter * lobe(d - 0.02, 0.24, 0.12) * (0.12 + 0.08 * curtain) * (0.7 + 0.5 * energy);
  light += mix(u_scatter, vec3(1.0), 0.35) * lobe(d - 0.05, 0.12, 0.05)
    * (0.06 + 0.16 * smoothstep(0.35, 0.8, curtain)) * energy;
  light += mix(amber, u_rim, side * 0.4) * lobe(d - 0.01, 0.07, 0.045) * (0.35 + 0.35 * band) * energy;
  light += mix(amber, u_sun, 0.3) * lobe(d, 0.02, 0.012) * (0.45 + 0.2 * band) * energy;
  light += mix(amber, vec3(1.0), 0.35) * lobe(d - 0.002, 0.006, 0.003) * 0.55 * energy;
  light += u_rim * lobe(d + 0.03, 0.05, 0.07) * (0.22 + 0.18 * veil) * (0.6 + 0.5 * energy);
  light *= 1.0 - 0.8 * smoothstep(0.0, -0.4, d);

  float below = max(-d, 0.0);
  float onGround = smoothstep(0.002, -0.012, d);
  float z = 1.0 / (below * 2.4 + 0.08);
  vec2 sp = vec2(w.x * z * 0.55, z * 0.5);
  float drift = t * 0.018;

  vec2 lp = sp * 0.9 + vec2(drift * 0.4, drift);
  float land = fbm(lp + 1.4 * vec2(fbm(lp * 0.7 + 3.1), fbm(lp * 0.7 + 8.4)));
  land = smoothstep(0.42, 0.72, land);
  vec2 cp = sp * 1.6 + vec2(-drift * 1.6, drift * 1.3);
  float cloud = fbm(cp + 2.0 * vec2(fbm(cp * 0.5 + q), fbm(cp * 0.5 - q + 5.0)));
  vec2 fp = sp * 3.4 + vec2(-drift * 2.4, drift * 1.8) + q * 0.8;
  float fine = fbm(fp + 1.2 * vec2(fbm(fp * 0.6 + 2.3), fbm(fp * 0.6 + 6.1)));
  cloud = smoothstep(0.42, 0.8, cloud);
  cloud = clamp(cloud + 0.55 * smoothstep(0.5, 0.85, fine), 0.0, 1.0) * u_clouds;
  float streaks = fbm(vec2(sp.x * 0.35 - drift * 2.0, sp.y * 4.0));

  float reach = exp(-below / 0.45);
  float near = exp(-below / 0.07);
  vec3 world = vec3(0.0);
  world += mix(u_ground, u_scatter, 0.5) * land * 0.14 * (0.35 + reach);
  world += mix(u_scatter, vec3(1.0), 0.3) * cloud * 0.48 * reach;
  world += mix(u_rim, amber, 0.4) * cloud * near * 0.6 * energy;
  world += u_scatter * streaks * 0.08 * reach;

  vec2 src = vec2(0.0, crown - 0.005);
  vec2 r = p - src;
  float ang = atan(r.x, -r.y);
  float shafts = smoothstep(0.2, 0.95, fbm(vec2(ang * 1.6, 3.7)));
  float cone = exp(-pow(ang, 2.0) / (2.0 * 0.55 * 0.55));
  float dist = length(r);
  float beams = shafts * cone * exp(-dist / 0.6);
  vec3 beamColour = mix(mix(amber, u_sun, 0.3), u_scatter, smoothstep(0.08, 0.45, dist) * 0.7);
  world += beamColour * beams * 0.45 * (0.65 + 0.5 * cloud) * u_beam;

  float bloomSky = exp(-dot(r, r) / (2.0 * 0.09 * 0.09));
  float bloomWide = exp(-dot(r, r) / (2.0 * 0.28 * 0.28));
  light += mix(u_sun, vec3(1.0), 0.35) * (bloomSky * 0.45 + bloomWide * 0.12) * u_glow;
  world += mix(u_sun, amber, 0.4) * bloomWide * 0.12 * u_glow;

  float sea = smoothstep(0.02, 0.16, below) * (1.0 - 0.65 * land);
  vec3 deep = mix(u_scatter, u_ground, 0.2);
  world *= mix(vec3(1.0), normalize(u_scatter + 0.05) * 1.2, smoothstep(0.08, 0.3, below) * 0.5);
  world += deep * sea * (0.16 + 0.07 * streaks + 0.05 * veil + 0.14 * cloud) * u_ocean;

  light += world * onGround;
  return u_ground + light;
}
`,
};
