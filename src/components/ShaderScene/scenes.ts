/**
 * ShaderScene's scenes. Each is one look: its GLSL `scene()`, its settings
 * as typed data (so a host can draw a slider per setting) and the colour
 * roles it reads. All read the background field's roles
 * (`--color-ambient-*`), the ones a theme tunes for ambient shaders, so a
 * theme recolours them with no wiring.
 */
import type { Scene } from './types';

/**
 * The horizon, ported from /labs/horizon as a scene: a planet's limb at
 * night with a sun on the arc (at the apex by default), soft layers of light along the arc,
 * a hazy world of land and cloud below, and deep ocean blue further down.
 * The horizon lab's own fades and grain are passes here, so they can be switched
 * and tuned like any other scene's.
 */
export const horizon: Scene = {
  id: "horizon",
  label: "Horizon",
  description: "A planet's limb at night, a sun on the arc, a hazy world and ocean below.",
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
    { key: "dawn", label: "Sun position", min: -0.5, max: 0.5, step: 0.01, default: 0 },
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
  /* The sun sits on the arc over its own place across the stage (the apex
     at 0), and the light along the limb gathers round it. */
  float sx = u_dawn * aspect;
  float reachX = clamp(sx, -radius * 0.98, radius * 0.98);
  float sy = centre.y + sqrt(radius * radius - reachX * reachX);
  float fx = w.x - sx;
  float sunX = exp(-pow(fx, 2.0) / (2.0 * 0.28 * 0.28));
  float wide = exp(-pow(fx, 2.0) / (2.0 * 0.75 * 0.75));
  float energy = (0.4 + 0.45 * wide + 0.9 * sunX) * u_glow;
  float side = clamp(abs(fx) / halfW, 0.0, 1.0);

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

  vec2 src = vec2(sx, sy - 0.005);
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

/**
 * The rift, after /labs/rift, as a soft shader rather than streaming type:
 * a glowing vertical tear in the page that opens widest at its middle and
 * narrows to a seam at either end, a bright core inside a wide glow and a
 * faint haze, and streaks of light drawn in toward it from both sides. The
 * tear's line wanders slowly, and the colour runs from one ambient tone at
 * the top to another at the bottom, the rift lab's own pair.
 */
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

/**
 * The glyph field: soft light printed in type.
 * Two layers in one pass. Six stretched Gaussian lights (a wide haze, a
 * bloom, a white-hot core, one long thin streak and two blooms below) are
 * added over the ground and tone-mapped, so where colours stack the core
 * burns to white; they drift, breathe and roll on slow travelling swells.
 * Then the screen is cut into character cells: each cell reads the light at
 * its centre and prints a glyph from the ramp that thickens with the
 * brightness, lighter than what is under it. Below a floor nothing prints,
 * so the type gathers on the light and scatters to dots at its edge.
 * Nothing snaps: the scatter eases from one roll to the next, and a cell
 * crossing a step of the ramp dissolves between the two glyphs.
 */
export const glyphs: Scene = {
  id: "glyphs",
  label: "Glyphs",
  description: "Soft light printed in type: a streak and its blooms read through characters that thicken with the brightness.",
  mode: "dark",
  colours: [
    "--color-ambient-4",
    "--color-ambient-2",
    "--color-ambient-1",
    "--color-ambient-3",
    "--color-ambient-5",
  ],
  glyphs: ".·xxXXSO0#@",
  /* Type at 1x on a 2x screen is soft, and this scene is cheap: six
     Gaussians and two noise lookups a pixel. */
  pixelRatio: 2,
  params: [
    { key: "cell", label: "Type size", min: 6, max: 40, step: 1, default: 15 },
    { key: "ink", label: "Type strength", min: 0, max: 1, step: 0.01, default: 0.42 },
    { key: "density", label: "Density", min: 0.2, max: 4, step: 0.05, default: 1.6 },
    { key: "floor", label: "Floor", min: 0, max: 0.6, step: 0.01, default: 0.06 },
    { key: "scatter", label: "Scatter", min: 0, max: 1.5, step: 0.01, default: 0.55 },
    { key: "shimmer", label: "Shimmer", min: 0, max: 6, step: 0.1, default: 0.75 },
    { key: "exposure", label: "Exposure", min: 0.2, max: 4, step: 0.05, default: 1.25 },
    { key: "spread", label: "Spread", min: 0.3, max: 2.5, step: 0.05, default: 0.85 },
    { key: "warp", label: "Warp", min: 0, max: 2, step: 0.05, default: 0.6 },
    { key: "wave", label: "Wave", min: 0, max: 3, step: 0.05, default: 1 },
    { key: "drift", label: "Drift", min: 0, max: 3, step: 0.05, default: 1.4 },
    { key: "mosaic", label: "Mosaic", min: 0, max: 1, step: 0.01, default: 0 },
    { key: "rise", label: "Height", min: -0.45, max: 0.45, step: 0.01, default: 0 },
  ],
  glsl: /* glsl */ `
/* A theme's ambient tones can be muted; pushed from their own grey and up
   to full brightness they still read as hues once they are light. */
vec3 glyphHue(vec3 c) {
  float grey = (c.r + c.g + c.b) / 3.0;
  c = max(grey + (c - grey) * 1.8, vec3(0.0));
  return c / max(max(c.r, max(c.g, c.b)), 1e-3);
}

/* One stretched Gaussian light: centre in 0 to 1 across and up the stage,
   half extents along and across its own axis in stage heights, a tilt. */
float glyphLamp(vec2 p, float aspect, vec2 centre, vec2 extent, float tilt, float k, float t) {
  vec2 c = (centre - 0.5) * vec2(aspect, 1.0);
  c += u_drift * 0.05 * vec2(sin(t * 0.13 + k * 1.7), cos(t * 0.11 + k * 2.3));
  float a = tilt + u_drift * 0.06 * sin(t * 0.09 + k * 1.3);
  vec2 d = p - c;
  d = vec2(cos(a) * d.x + sin(a) * d.y, -sin(a) * d.x + cos(a) * d.y) / (extent * u_spread);
  return (1.0 + u_drift * 0.12 * sin(t * 0.21 + k * 2.9)) * exp(-dot(d, d));
}

/* The light at a pixel, tone-mapped. */
vec3 glyphLight(vec2 frag, float t) {
  float aspect = u_size.x / u_size.y;
  vec2 p = (frag / u_size - 0.5) * vec2(aspect, 1.0);
  p.y -= u_rise;
  p += u_warp * 0.09 * (vec2(vnoise(p * 1.6 + t * 0.05), vnoise(p * 1.6 + 7.3 - t * 0.04)) - 0.5);
  /* Slow travelling swells, so the streak rolls like a ribbon. */
  p.y += u_wave * (0.045 * sin(p.x * 2.6 + t * 0.35) + 0.025 * sin(p.x * 5.3 - t * 0.27 + 1.7));
  p.x += u_wave * 0.03 * sin(p.y * 3.1 + t * 0.22);

  vec3 haze = glyphHue(u_col[0]);
  vec3 bloom = glyphHue(u_col[1]);
  vec3 streak = glyphHue(u_col[2]);
  vec3 low = glyphHue(u_col[3]);
  vec3 foot = glyphHue(u_col[4]);
  vec3 core = mix((haze + bloom + streak + low + foot) / 5.0, vec3(1.0), 0.85);

  vec3 c = u_ground;
  c += haze * 0.55 * glyphLamp(p, aspect, vec2(0.47, 0.62), vec2(0.95, 0.3), 0.05, 0.0, t);
  c += bloom * 0.95 * glyphLamp(p, aspect, vec2(0.66, 0.74), vec2(0.5, 0.17), 0.2, 1.0, t);
  c += core * 1.7 * glyphLamp(p, aspect, vec2(0.68, 0.625), vec2(0.3, 0.045), 0.0, 2.0, t);
  c += streak * 1.5 * glyphLamp(p, aspect, vec2(0.3, 0.585), vec2(0.62, 0.011), 0.0, 3.0, t);
  c += low * 1.0 * glyphLamp(p, aspect, vec2(0.8, 0.42), vec2(0.36, 0.2), -0.7, 4.0, t);
  c += foot * 0.75 * glyphLamp(p, aspect, vec2(0.76, 0.2), vec2(0.4, 0.16), -1.1, 5.0, t);
  return u_ground + (1.0 - exp(-(c - u_ground) * u_exposure));
}

vec3 scene(vec2 uv, float t) {
  vec2 frag = uv * u_size;
  float cellH = max(4.0, floor(u_cell * u_ratio + 0.5));
  vec2 size = vec2(cellH * 0.6, cellH);
  vec2 cell = floor(frag / size);
  vec2 local = fract(frag / size);

  vec3 blocky = glyphLight((cell + 0.5) * size, t);
  vec3 col = mix(glyphLight(frag, t), blocky, u_mosaic);
  /* A mosaic shows its seams. */
  vec2 edge = min(local, 1.0 - local) * size;
  col = mix(col, u_ground, u_mosaic * 0.3 * (1.0 - smoothstep(0.0, 1.5 * u_ratio, min(edge.x, edge.y))));

  float lum = dot(blocky - u_ground, vec3(0.2126, 0.7152, 0.0722));
  float beat = t * u_shimmer;
  int tick = int(mod(floor(beat), 512.0));
  ivec2 at = ivec2(cell) + 2048;
  float roll = mix(rnd(at + tick * ivec2(17, 31)), rnd(at + (tick + 1) * ivec2(17, 31)),
                   smoothstep(0.0, 1.0, fract(beat)));
  float v = (lum - u_floor) / (1.0 - u_floor) * u_density
    + (roll - 0.5) * u_scatter * min(1.0, lum * 6.0 + 0.15);
  float g = max(v, 0.0) * u_glyphCount;
  float first = min(u_glyphCount - 1.0, floor(g));
  float second = min(u_glyphCount - 1.0, first + 1.0);
  float ink = mix(texture(u_glyphs, vec2((first + local.x) / u_glyphCount, local.y)).r,
                  texture(u_glyphs, vec2((second + local.x) / u_glyphCount, local.y)).r,
                  smoothstep(0.25, 0.75, fract(g)));
  return mix(col, vec3(1.0), ink * u_ink * smoothstep(0.0, 0.1, v) * (0.45 + 0.55 * min(1.0, v)));
}
`,
};

/**
 * The prism: light through a cut stone. A handful of beams leave the
 * facets of something above the stage, and no two alike: each has its own
 * facet to leave from, its own angle, width and strength, so the light is
 * uneven the way a diamond's is, a few strong beams among faint ones. The
 * beams themselves are true: each runs dead straight, opens as it travels
 * and thins as it opens, and each colour role leaves at a slightly
 * different angle, so a beam is white where its colours still overlap and
 * breaks into the theme's spectrum at its edges, more the further it runs.
 * The stone turns slowly, so beams swing a little and come and go.
 */
export const prism: Scene = {
  id: "prism",
  label: "Prism",
  description: "Beams of light from a cut stone, uneven in strength, their edges split into the theme's spectrum.",
  mode: "dark",
  colours: [
    "--color-ambient-5",
    "--color-ambient-6",
    "--color-ambient-1",
    "--color-ambient-2",
    "--color-ambient-4",
  ],
  params: [
    { key: "offset", label: "Position", min: -0.5, max: 0.5, step: 0.01, default: 0.12 },
    { key: "spread", label: "Spread", min: 0, max: 2, step: 0.01, default: 0.6 },
    { key: "tilt", label: "Tilt", min: -1, max: 1, step: 0.01, default: -0.25 },
    { key: "fan", label: "Fan", min: 0, max: 3, step: 0.01, default: 1 },
    { key: "beams", label: "Beams", min: 1, max: 10, step: 1, default: 7 },
    { key: "sharp", label: "Sharpness", min: 0, max: 1, step: 0.01, default: 0.35 },
    { key: "dispersion", label: "Dispersion", min: 0, max: 2, step: 0.01, default: 1 },
    { key: "bleed", label: "Bleed", min: 0, max: 2, step: 0.01, default: 1 },
    { key: "glow", label: "Glow", min: 0, max: 2, step: 0.01, default: 1 },
    { key: "drift", label: "Drift", min: 0, max: 3, step: 0.05, default: 1 },
  ],
  glsl: /* glsl */ `
/* A theme's ambient tones can be muted; pushed from their own grey and up
   to full brightness they read as a spectrum once they are light. */
vec3 prismHue(vec3 c) {
  float grey = (c.r + c.g + c.b) / 3.0;
  c = max(grey + (c - grey) * 1.8, vec3(0.0));
  return c / max(max(c.r, max(c.g, c.b)), 1e-3);
}

vec3 scene(vec2 uv, float t) {
  float aspect = u_size.x / u_size.y;
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);
  t *= u_drift;

  vec3 hues[5];
  vec3 total = vec3(0.0);
  for (int k = 0; k < 5; k++) {
    hues[k] = prismHue(u_col[k]);
    total += hues[k];
  }

  float edge = mix(0.95, 0.12, u_sharp);
  vec3 light = vec3(0.0);
  for (int i = 0; i < 10; i++) {
    if (float(i) >= u_beams) break;
    ivec2 id = ivec2(i * 37 + 5, 91);
    /* The facet this beam leaves, above the stage, and the way it points. */
    vec2 facet = vec2(
      u_offset * aspect + (rnd(id) - 0.5) * (0.25 + 0.5 * u_spread),
      0.58 + 0.5 * rnd(id + 1)
    );
    float angle = u_tilt * 0.7 + (rnd(id + 2) - 0.5) * 1.5 * u_spread
      + 0.05 * sin(t * (0.05 + 0.06 * rnd(id + 3)) + 6.28 * rnd(id + 4));
    vec2 dir = vec2(sin(angle), -cos(angle));
    vec2 rel = p - facet;
    float run = dot(rel, dir);
    if (run <= 0.0) continue;
    float across = dot(rel, vec2(dir.y, -dir.x));

    /* A few strong beams among faint ones, each breathing as the stone turns. */
    float strength = pow(rnd(id + 5), 2.2)
      * (0.45 + 0.55 * sin(t * (0.04 + 0.05 * rnd(id + 6)) + 6.28 * rnd(id + 7)));
    strength = max(strength, 0.0) + 0.012;
    float mouth = 0.004 + 0.035 * rnd(id + 8) * rnd(id + 8);
    float halfW = mouth + u_fan * (0.008 + 0.035 * rnd(id + 9)) * run;
    float split = (0.5 + rnd(id + 10)) * 0.13 * u_dispersion * run;
    /* It thins as it opens and gives out with distance. */
    float carry = pow((mouth + 0.02) / (halfW + 0.02), 0.7) * exp(-run / (0.9 + 1.4 * rnd(id + 11)));

    vec3 beam = vec3(0.0);
    for (int k = 0; k < 5; k++) {
      float off = abs(across - (float(k) / 4.0 - 0.5) * split);
      float body = 1.0 - smoothstep(halfW * (1.0 - edge), halfW * (1.0 + edge) + 0.002, off);
      float halo = exp(-(off * off) / (2.0 * (halfW * 1.7 + 0.015) * (halfW * 1.7 + 0.015)));
      beam += hues[k] * (body + 0.1 * u_bleed * halo);
    }
    /* Every colour in one place is white light. */
    light += beam / max(total, vec3(1e-3)) * strength * carry;
  }
  return u_ground + light * 0.5 * u_glow;
}
`,
};

/**
 * Meteors: a shower over a planet's edge. Stars hold a dark sky; meteors
 * fall across it in lanes at one angle, three depths of them, each a white
 * head with a tail that cools through the theme's colours as it thins; and
 * a planet's limb crosses the foot of the scene, lit to a crescent by a sun
 * that flares where it clears the edge. The limb hides what falls behind it.
 * It is soft by default: the streaks, the crescent and the flare are all
 * blurred, and the sky between them is left all but black.
 */
export const meteors: Scene = {
  id: "meteors",
  label: "Meteors",
  description: "A meteor shower over a planet's edge, a sun flaring on the limb.",
  mode: "dark",
  colours: [
    "--color-ambient-2",
    "--color-ambient-3",
    "--color-ambient-5",
    "--color-ambient-1",
    "--color-ambient-4",
  ],
  params: [
    { key: "crown", label: "Limb height", min: -0.2, max: 0.7, step: 0.01, default: 0.26 },
    { key: "curve", label: "Flatness", min: 0.8, max: 8, step: 0.1, default: 2.2 },
    { key: "lean", label: "Lean", min: -0.6, max: 0.6, step: 0.01, default: -0.18 },
    { key: "sun", label: "Sun position", min: -0.5, max: 0.5, step: 0.01, default: 0.22 },
    { key: "flare", label: "Flare", min: 0, max: 2, step: 0.01, default: 1 },
    { key: "glow", label: "Glow", min: 0, max: 2, step: 0.01, default: 1 },
    { key: "shower", label: "Shower", min: 0, max: 2, step: 0.01, default: 1 },
    { key: "angle", label: "Fall angle", min: -1.2, max: 1.2, step: 0.01, default: 0.38 },
    { key: "tail", label: "Tail length", min: 0.2, max: 3, step: 0.01, default: 1 },
    { key: "fall", label: "Fall speed", min: 0, max: 3, step: 0.01, default: 1 },
    { key: "stars", label: "Stars", min: 0, max: 2, step: 0.01, default: 1 },
    { key: "soft", label: "Softness", min: 0, max: 2, step: 0.01, default: 1 },
  ],
  glsl: /* glsl */ `
vec3 meteorHue(vec3 c) {
  float grey = (c.r + c.g + c.b) / 3.0;
  c = max(grey + (c - grey) * 1.8, vec3(0.0));
  return c / max(max(c.r, max(c.g, c.b)), 1e-3);
}

vec3 scene(vec2 uv, float t) {
  float aspect = u_size.x / u_size.y;
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y);
  float px = 1.0 / u_size.y;

  vec3 near = meteorHue(u_col[0]);
  vec3 far = meteorHue(u_col[1]);
  vec3 ember = meteorHue(u_col[2]);
  vec3 sunTint = meteorHue(u_col[3]);
  vec3 deep = meteorHue(u_col[4]);

  /* ---- The limb: a circle far larger than the stage, leaning. */
  float radius = u_curve * max(aspect, 1.0);
  vec2 centre = vec2(u_lean * radius, u_crown - radius * sqrt(max(1.0 - u_lean * u_lean, 0.05)));
  float d = length(p - centre) - radius;
  float sky = smoothstep(0.0, 2.0 * px + 0.012 * u_soft, d);
  /* The sun sits on the edge, over its own place across the stage. */
  float sx = u_sun * aspect;
  float reachX = clamp(sx - centre.x, -radius * 0.98, radius * 0.98);
  vec2 sun = vec2(sx, centre.y + sqrt(radius * radius - reachX * reachX) + 0.004);
  vec2 r = p - sun;
  float fromSun = length(r);
  float lit = exp(-fromSun / 0.55);
  float litWide = exp(-fromSun / 1.4);

  vec3 light = vec3(0.0);

  /* ---- Stars, one to a cell at most. */
  vec2 frag = uv * u_size;
  ivec2 cell = ivec2(floor(frag / 30.0));
  vec2 at = (vec2(cell) + 0.15 + 0.7 * vec2(rnd(cell + 37), rnd(cell + 71))) * 30.0;
  float sd = length(frag - at);
  float pick = rnd(cell + 911);
  float star = exp(-(sd * sd) / (2.0 * 0.7 * 0.7)) * step(0.74, pick) * 0.32
    * (0.25 + 0.75 * pow(rnd(cell + 5), 3.0))
    * (0.7 + 0.3 * sin(t * (0.5 + 1.5 * rnd(cell + 13)) + 40.0 * pick));
  light += mix(vec3(1.0), mix(near, far, rnd(cell + 3)), 0.3) * star * u_stars * (1.0 - 0.8 * exp(-fromSun / 0.18));

  /* ---- The shower: lanes across the fall, three depths of them. */
  vec2 dir = vec2(-sin(u_angle), -cos(u_angle));
  vec2 q = vec2(p.x, p.y - 0.5);
  float a = dot(q, vec2(-dir.y, dir.x));
  float b = dot(q, dir);
  /* Long enough that a meteor and its whole tail are off the stage when
     its lane starts over, so none ever blinks out. */
  float span = 2.0 + aspect + u_tail;
  for (int i = 0; i < 3; i++) {
    float depth = 1.0 + float(i) * 0.7;
    float laneW = 0.13 / depth;
    float lane = floor(a / laneW);
    ivec2 id = ivec2(int(lane) + 2048, i * 57 + 3);
    float u = t * u_fall * (0.1 + 0.16 * rnd(id)) / depth + rnd(id + 11) * 17.0;
    ivec2 pass = id + ivec2(0, int(mod(floor(u), 512.0)) * 131 + 7);
    float there = step(1.0 - 0.7 * u_shower, rnd(pass + 5));
    float head = (fract(u) - 0.5) * span;
    float ax = (lane + 0.2 + 0.6 * rnd(pass + 9)) * laneW;
    float len = u_tail * (0.16 + 0.34 * rnd(pass + 13)) / depth;
    float back = (head - b) / len;
    float w = max((0.0011 + 0.0012 * rnd(pass + 17)) * (1.0 + 0.5 * u_soft) / depth, 0.6 * px) * (1.0 - 0.5 * clamp(back, 0.0, 1.0));
    float across = exp(-pow((a - ax) / w, 2.0) * 0.5);
    float trail = smoothstep(-3.0 * w / len, 0.25 * u_soft, back) * pow(max(1.0 - back, 0.0), 1.6);
    vec3 tint = mix(vec3(1.0), near, smoothstep(0.0, 0.22, back));
    tint = mix(tint, ember, smoothstep(0.2, 0.6, back));
    tint = mix(tint, far, smoothstep(0.55, 1.0, back));
    light += tint * across * trail * there * (0.3 + 0.7 * rnd(pass + 21)) * 0.55 / (1.0 + 1.2 * u_soft) / sqrt(depth);
  }

  /* ---- Air on the limb: a thin wash, cool away from the sun. */
  vec3 air = mix(far, near, lit);
  light += air * lobe(d - 0.012, 0.06, 0.02) * (0.015 + 0.08 * litWide) * u_glow;
  light += deep * lobe(d, 0.3, 0.05) * 0.012 * litWide * u_glow;
  light *= sky;

  /* ---- The planet's lit edge: a band of light with no line in it, wide
     by the sun and thinning to nothing away from it. */
  float blur = 0.004 + 0.02 * u_soft;
  float litMid = exp(-fromSun / 0.75);
  float band = lobe(d + 0.3 * blur, blur * (0.12 + 1.1 * litMid), blur * (0.15 + 1.9 * litMid));
  vec3 edge = mix(air, vec3(1.0), 0.3 + 0.55 * litMid);
  light += edge * band * (0.06 + 0.6 * litMid * litMid) * u_glow;

  /* ---- The sun: a soft core, a bloom, and four short spikes that the
     softness melts into it. */
  float coreR = 0.01 + 0.008 * u_soft;
  float core = exp(-dot(r, r) / (2.0 * coreR * coreR));
  float bloom = exp(-dot(r, r) / (2.0 * 0.07 * 0.07)) * 0.3 + exp(-fromSun / 0.16) * 0.1;
  vec2 k = vec2(r.x + r.y, r.x - r.y) * 0.7071;
  float thick = 0.006 + 0.012 * u_soft;
  float spikes = exp(-pow(k.x / thick, 2.0) * 0.5) * exp(-abs(k.y) / 0.09)
    + exp(-pow(k.y / thick, 2.0) * 0.5) * exp(-abs(k.x) / 0.09);
  float veil = mix(0.5, 1.0, sky);
  light += mix(sunTint, vec3(1.0), 0.85) * (core * 0.55 + spikes * 0.6 / (1.0 + u_soft) * veil) * u_flare;
  light += mix(sunTint, vec3(1.0), 0.7) * bloom * veil * u_flare;

  return u_ground + light;
}
`,
};

/**
 * Waves: a sea drawn in points, seen from above it. A plane of dots runs off
 * into the dark and rolls in slow swells, each dot a round point that grows and brightens on a
 * crest and all but goes out in a trough, over a glow that lies in the
 * water under them. The surface is found by marching the eye's ray through
 * the slab the swells can occupy, in steps too short to pass through a
 * crest, so a near crest hides the trough behind it and nothing flickers; each dot is then drawn round on the screen from its own place on the
 * surface. Far off, where the dots would be finer than a pixel, they melt
 * into the glow rather than shimmer.
 */
export const waves: Scene = {
  id: "waves",
  label: "Waves",
  description: "A sea of points rolling off into the dark, bright on the crests, over a deep glow.",
  mode: "dark",
  colours: ["--color-ambient-4", "--color-ambient-3", "--color-ambient-2"],
  params: [
    { key: "rise", label: "Height", min: -0.3, max: 0.9, step: 0.01, default: 0.12 },
    { key: "pitch", label: "View", min: 0.15, max: 1.2, step: 0.01, default: 0.3 },
    { key: "swell", label: "Swell", min: 0, max: 2, step: 0.01, default: 1 },
    { key: "wavelength", label: "Wave length", min: 0.4, max: 3, step: 0.01, default: 1 },
    { key: "density", label: "Density", min: 3, max: 30, step: 0.5, default: 16 },
    { key: "dot", label: "Dot size", min: 0.3, max: 2, step: 0.01, default: 1 },
    { key: "glow", label: "Glow", min: 0, max: 2, step: 0.01, default: 1 },
    { key: "reach", label: "Reach", min: 0.2, max: 3, step: 0.01, default: 1 },
    { key: "drift", label: "Drift", min: 0, max: 3, step: 0.05, default: 1 },
  ],
  glsl: /* glsl */ `
vec3 waveHue(vec3 c) {
  float grey = (c.r + c.g + c.b) / 3.0;
  c = max(grey + (c - grey) * 1.8, vec3(0.0));
  return c / max(max(c.r, max(c.g, c.b)), 1e-3);
}

const float WAVE_LENS = 1.6;

/* The sea's height at a place on the plane, -1 to 1. */
float waveHeight(vec2 q, float t) {
  q /= u_wavelength;
  float h = 0.5 * sin(dot(q, vec2(0.62, 0.78)) * 1.15 + t * 0.3)
    + 0.28 * sin(dot(q, vec2(-0.74, 0.55)) * 2.1 - t * 0.23 + 1.3)
    + 0.7 * (vnoise(q * 0.5 + vec2(0.0, t * 0.05)) - 0.5);
  return h / 1.13;
}

vec3 scene(vec2 uv, float t) {
  float aspect = u_size.x / u_size.y;
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - u_rise);
  float px = 1.0 / u_size.y;
  t *= u_drift;

  vec3 deep = waveHue(u_col[0]);
  vec3 smoke = waveHue(u_col[1]);
  vec3 crest = mix(mix(deep, waveHue(u_col[2]), 0.25), vec3(1.0), 0.65);

  /* An eye one unit over the plane, looking down at it by the pitch. The
     ray through this pixel falls by 'fall' and runs out by 'run' a step. */
  float cp = cos(u_pitch);
  float sp = sin(u_pitch);
  float fall = WAVE_LENS * sp - p.y * cp;
  float run = WAVE_LENS * cp + p.y * sp;
  float amp = 0.3 * u_swell;
  float farZ = 6.6 * u_reach;
  vec3 light = vec3(0.0);

  if (fall > 1e-4 && run > 1e-4) {
    /* The ray can only meet the sea inside the slab the swells occupy. */
    float enter = (1.0 - amp) / fall;
    float leave = min((1.0 + amp) / fall, 2.5 * farZ / run);
    /* March by the clear height over the sea, divided by the fastest the
       ray and the sea can close on each other, so a step can never pass
       through a crest: fixed strides did, and whether a thin crest was
       caught turned on where the samples fell, so patches of sea flickered
       as the swell moved. Steps shrink toward the surface; a ray still
       short of it when they run out is grazing a crest, and rests there. */
    float closing = fall + amp * 1.7 / u_wavelength * length(vec2(p.x, run));
    float k = enter;
    /* The last crest the ray cleared on its way: where its height over
       the sea stopped falling and rose again. */
    float skimK = -1.0;
    float lastOver = 1e3;
    float lastK = enter;
    bool falling = false;
    for (int i = 0; i < 72; i++) {
      float over = (1.0 - fall * k) - amp * waveHeight(vec2(p.x * k, run * k), t);
      if (over < 0.0015 * k || k > leave) break;
      if (over > lastOver && falling) skimK = lastK;
      falling = over < lastOver;
      lastOver = over;
      lastK = k;
      k += over / closing;
    }
    k = min(k, leave);

    vec2 at = vec2(p.x * k, run * k);
    float z = at.y;
    float h = waveHeight(at, t);
    float lift = smoothstep(-0.7, 0.8, h);
    /* Black takes the far sea, and starkly: the dots go first, over a
       short run, and the glow under them a little further out. The near
       edge eases in. */
    float nearEdge = smoothstep(0.0, 0.08, uv.y);
    float fog = exp(-pow(z / (0.8 * farZ), 4.0)) * nearEdge;
    float dotFog = exp(-pow(z / (0.56 * farZ), 6.0)) * nearEdge;

    /* The glow in the water, smoky, brighter under a crest. */
    float cloud = fbm(at * 0.3 + vec2(t * 0.03, -t * 0.02));
    vec3 body = mix(deep, smoke, 0.3 * smoothstep(0.35, 0.75, cloud));
    light += body * (0.04 + 0.22 * lift * lift) * (0.35 + 0.9 * cloud) * fog * u_glow;

    /* The dots: this row's and the rows before and behind it, each drawn
       round on the screen from its own place on the surface. */
    float cellW = 1.0 / u_density;
    float row = floor(z / cellW);
    /* The rows either side of where the ray lands, three each way: seen
       side-on a swell packs its rows closer than a dot is wide, and a dot
       left out of the search was a notch in its neighbours that came and
       went as the swell moved. */
    /* And a dot stands proud of the surface it sits on, so one on a crest
       shows above the crest's edge, where the ray has already gone past
       to the sea behind: the rows at the crest it last cleared are looked
       at too, or those dots are cut flat along every crest. */
    float skimRow = skimK > 0.0 ? floor(run * skimK / cellW) : row;
    float dots = 0.0;
    vec2 before = p;
    vec2 behind = p;
    float here = 0.0;
    for (int j = -3; j <= 6; j++) {
      float r = j <= 3 ? row + float(j) : skimRow + float(j - 5);
      if (j > 3 && abs(r - row) < 3.5) continue;
      float cz = (r + 0.5) * cellW;
      /* Where this ray is when it is that far out, to pick the column. */
      float kz = cz / run;
      /* Every other row sits half a cell across, like a halftone. */
      float stagger = 0.5 * mod(r, 2.0);
      float cx = (floor(p.x * kz / cellW - stagger) + 0.5 + stagger) * cellW;
      float ch = waveHeight(vec2(cx, cz), t);
      float cy = amp * ch - 1.0;
      float depth = max(cz * cp - cy * sp, 1e-3);
      vec2 on = vec2(cx, cy * cp + cz * sp) * WAVE_LENS / depth;
      if (j == -1) before = on;
      if (j == 1) behind = on;
      float up = smoothstep(-0.7, 0.8, ch);
      float rad = 0.15 * cellW * u_dot * (0.4 + 0.6 * up) * WAVE_LENS / depth;
      if (j == 0) here = rad;
      /* A dot finer than a pixel is drawn a pixel wide and that much
         fainter, with a softer edge, so it glides rather than snapping
         from one pixel to the next. */
      float shown = max(rad, 1.2 * px);
      float soft = px * mix(1.5, 1.0, smoothstep(1.5 * px, 4.0 * px, rad));
      float disc = 1.0 - smoothstep(shown - soft, shown + soft, length(p - on));
      dots = max(dots, disc * (rad * rad) / (shown * shown) * (0.1 + 0.9 * up * up));
    }
    /* Where the rows are finer than the pixels, or the dots themselves
       are, they become their average: a field of points too small to
       draw can only twinkle. */
    float rowPx = 0.5 * length(behind - before) / px;
    float even = 0.06 * u_dot * u_dot * (0.1 + 0.9 * lift * lift);
    dots = mix(even, dots, smoothstep(1.5, 3.5, rowPx) * smoothstep(0.7, 1.6, here / px));
    light += mix(deep, crest, 0.3 + 0.7 * lift) * dots * dotFog * 1.3;
  }
  return u_ground + light;
}
`,
};

/**
 * The aurora: silk in colour, the one scene with no dark in its middle.
 * A plane is folded over itself by slow sine warps, each fold feeding the
 * next, and the folded plane picks the theme's tones in wide soft ribbons:
 * a base tone, three more laid through it, a pale bloom where two ribbons
 * cross, and a void, one deep pool the ground shows through, which is what
 * gives the colour its depth. Nothing in it has an edge.
 */
export const aurora: Scene = {
  id: "aurora",
  label: "Aurora",
  description: "Wide ribbons of the theme's colour folding through one another, round a deep void.",
  mode: "dark",
  colours: [
    "--color-ambient-4",
    "--color-ambient-3",
    "--color-ambient-5",
    "--color-ambient-2",
    "--color-ambient-6",
  ],
  params: [
    { key: "scale", label: "Scale", min: 0.3, max: 3, step: 0.01, default: 1 },
    { key: "fold", label: "Folds", min: 0, max: 2, step: 0.01, default: 1 },
    { key: "tilt", label: "Tilt", min: -1.6, max: 1.6, step: 0.01, default: 0.5 },
    { key: "void", label: "Void", min: 0, max: 1, step: 0.01, default: 0.8 },
    { key: "bloom", label: "Bloom", min: 0, max: 1, step: 0.01, default: 0.6 },
    { key: "bright", label: "Brightness", min: 0.1, max: 1.5, step: 0.01, default: 0.8 },
    { key: "drift", label: "Drift", min: 0, max: 3, step: 0.05, default: 1 },
  ],
  glsl: /* glsl */ `
/* Each tone saturated and lifted to full value, so the ribbons glow in a
   theme's colour however dark its role sits. A tone with next to no hue
   (a monochrome theme's greys) keeps its own value instead: lifted, every
   grey would come out the same white. */
vec3 auroraHue(vec3 c) {
  float hi = max(c.r, max(c.g, c.b));
  float chroma = (hi - min(c.r, min(c.g, c.b))) / max(hi, 1e-3);
  float grey = (c.r + c.g + c.b) / 3.0;
  vec3 s = max(grey + (c - grey) * 1.6, vec3(0.0));
  vec3 lifted = s / max(max(s.r, max(s.g, s.b)), 1e-3);
  return mix(c, lifted, smoothstep(0.04, 0.2, chroma));
}

vec3 scene(vec2 uv, float t) {
  float aspect = u_size.x / u_size.y;
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);
  t *= u_drift;
  float ca = cos(u_tilt);
  float sa = sin(u_tilt);
  vec2 w = vec2(ca * p.x + sa * p.y, -sa * p.x + ca * p.y) * 2.3 * u_scale;

  /* Fold the plane: each warp bends it along the last one's grain. */
  for (int i = 1; i <= 4; i++) {
    float n = float(i);
    w.x += u_fold * 0.6 / n * sin(n * 1.25 * w.y + t * 0.11 + n * 1.7);
    w.y += u_fold * 0.5 / n * cos(n * 1.05 * w.x - t * 0.09 + n * 2.3);
  }

  float a = 0.5 + 0.5 * sin(w.x * 1.15 + w.y * 0.5 + t * 0.05);
  float b = 0.5 + 0.5 * sin(w.y * 1.35 - w.x * 0.45 + 2.1 - t * 0.04);
  float c = 0.5 + 0.5 * sin((w.x + w.y) * 0.85 + 4.2 + t * 0.03);
  float e = 0.5 + 0.5 * sin(w.x * 0.6 - w.y * 0.95 + 0.7);

  vec3 base = auroraHue(u_col[0]);
  vec3 col = base;
  col = mix(col, auroraHue(u_col[1]), smoothstep(0.3, 0.9, a) * 0.8);
  col = mix(col, mix(auroraHue(u_col[3]), vec3(1.0), 0.25), smoothstep(0.35, 0.95, c) * 0.6);
  col = mix(col, auroraHue(u_col[2]), smoothstep(0.6, 1.0, b) * 0.8);
  col = mix(col, auroraHue(u_col[4]), smoothstep(0.7, 1.0, e) * smoothstep(0.5, 0.9, b) * 0.6);
  /* A pale bloom where ribbons cross. */
  col = mix(col, vec3(1.0), u_bloom * smoothstep(0.25, 0.95, a * c + 0.35 * e) * 0.85);

  /* The void, with the base tone deepening toward it. */
  float pool = 0.5 + 0.5 * sin(w.x * 0.75 - w.y * 1.1 + 5.3 + t * 0.02);
  float dark = u_void * smoothstep(0.5, 0.95, pool);
  col = mix(col, base * 0.5, smoothstep(0.0, 0.6, dark) * 0.7);
  float lit = 1.0 - smoothstep(0.35, 1.0, dark);
  return u_ground + col * lit * u_bright;
}
`,
};

/**
 * The highway: a straight highway at night, seen from its shoulder, running to a
 * low horizon. It is drawn in long-exposure light trails, every one a
 * straight line to the single point where the road ends, with light
 * streaming along them rather than the lines themselves moving. A cold haze
 * sits on the horizon and drifts over the ground, and a hot point with a
 * flare marks where the trails meet, and a city's lights lie along the
 * horizon under slow clouds and drifting mist.
 */
export const highway: Scene = {
  id: "highway",
  label: "Highway",
  description: "A straight highway at night, drawn in light trails that pull to one point on a hazy horizon.",
  mode: "dark",
  /* The haze, the tail lights nearest you, the light of the road's far end,
     and the oncoming light on the far side. */
  colours: [
    "--color-ambient-4",
    "--color-ambient-5",
    "--color-ambient-6",
    "--color-ambient-2",
  ],
  params: [
    { key: "crown", label: "Horizon height", min: 0.15, max: 0.85, step: 0.01, default: 0.27 },
    { key: "trails", label: "Trails", min: 0, max: 2, step: 0.01, default: 1 },
    { key: "haze", label: "Haze", min: 0, max: 2, step: 0.01, default: 1 },
    { key: "meet", label: "Vanishing light", min: 0, max: 2, step: 0.01, default: 1 },
    { key: "city", label: "City lights", min: 0, max: 2, step: 0.01, default: 1 },
    { key: "clouds", label: "Clouds", min: 0, max: 2, step: 0.01, default: 1 },
    { key: "side", label: "Vanishing point", min: -0.8, max: 0.8, step: 0.01, default: 0.22 },
    { key: "flow", label: "Flow", min: 0, max: 3, step: 0.05, default: 1 },
  ],
  glsl: /* glsl */ `
/* A theme's ambient tones can be muted, a monochrome theme's most of all.
   As the prism does, each is pushed from its own grey and up to full
   brightness, so it reads as colour once it is light, then taken to
   display space, where the scene is composed. */
vec3 highwayHue(vec3 c) {
  float grey = (c.r + c.g + c.b) / 3.0;
  c = max(grey + (c - grey) * 1.8, vec3(0.0));
  return pow(c / max(max(c.r, max(c.g, c.b)), 1e-3), vec3(1.0 / 2.2));
}

/* One trail: a hot core, a halo round it, and a wide wash on the asphalt. */
vec3 highwayTrail(float l, float at, float width, float px, vec3 tint, float flow) {
  float s = sqrt(width * width + px * px);
  float d = l - at;
  float core = exp(-d * d / (s * s)) * (width / s);
  float halo = exp(-d * d / (s * s * 34.0 + 0.0006)) * 0.29;
  float wash = exp(-abs(d) / 0.45) * 0.045;
  return (tint * (core * 1.7 + halo + wash) + vec3(1.0, 0.9, 0.86) * core * core * 0.6) * flow;
}

/* Light moves along a trail: a slow shimmer, and brighter heads that travel
   it with their glow dragging behind. Each head fades in over its front, so
   no hard edge crosses the road. */
float highwayPulse(float d, float t, float seed, float dir) {
  float n = vnoise(vec2(d * 4.6 - t * 0.5 * dir + seed * 7.3, seed * 3.1));
  float u = fract(t * 0.3 - dir * d * 0.5 + seed * 0.37);
  float v = fract(u + 0.45);
  float heads = exp(-u * 3.2) * smoothstep(0.0, 0.09, u) + 0.7 * exp(-v * 4.5) * smoothstep(0.0, 0.09, v);
  return 0.4 + 0.4 * smoothstep(0.22, 0.78, n) + 1.3 * heads;
}

vec3 scene(vec2 uv, float t) {
  float aspect = u_size.x / u_size.y;
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y);
  t *= u_flow;
  vec2 vp = vec2(u_side * aspect, u_crown);
  float up = p.y - vp.y;
  float side = (p.x - vp.x) / aspect;
  /* The light comes from the road's far end and gives out with distance
     from it: far to the other side, the haze, the horizon line and the
     city all fade away into the dark. */
  float reachOut = smoothstep(-1.12, -0.5, side);
  float right = mix(0.14, 1.0, smoothstep(-1.5, 0.1, side)) * reachOut;

  vec3 cool = highwayHue(u_col[0]);
  vec3 tail = highwayHue(u_col[1]);
  vec3 warm = highwayHue(u_col[2]);
  vec3 oncoming = mix(highwayHue(u_col[3]), vec3(1.0), 0.35);
  vec3 steel = mix(vec3(dot(cool, vec3(0.2126, 0.7152, 0.0722))), cool, 0.3) * 0.6;

  vec3 col = vec3(0.0);
  if (up > 0.0) {
    /* Sky: a cold haze on the horizon, a shaft of it leaning away, and the
       trails lighting it where the road runs in. */
    /* Mist: two layers of it sliding past each other, the finer one hugging
       the horizon, so the haze thickens and thins as it drifts. */
    float drift = fbm(vec2(p.x * 1.4 - t * 0.06, up * 5.0 + t * 0.015));
    drift = mix(drift, fbm(vec2(p.x * 3.1 + t * 0.045, up * 12.0 - t * 0.02)), 0.4);
    drift = smoothstep(0.15, 0.85, drift);
    vec3 haze = steel * right * (exp(-up / 0.07) * 1.3 + exp(-up / 0.3) * 0.58 + exp(-up / 0.7) * 0.05) * (0.22 + 1.35 * drift);
    vec2 lean = normalize(vec2(-1.0, 0.34));
    vec2 rel = p - vp;
    float along = dot(rel, lean);
    float across = dot(rel, vec2(-lean.y, lean.x));
    float shaft = exp(-across * across / 0.03) * exp(-max(along, 0.0) / 1.2) * smoothstep(0.0, 0.25, along);
    haze += steel * shaft * 0.72 * (0.5 + 1.0 * drift);
    /* Clouds, seen from below and flattening towards the horizon, moving
       slowly across. They catch the light from the road's far end on their
       undersides and dim the haze behind them where they are thick. */
    float lay = 1.0 / (up + 0.2);
    vec2 cu = vec2((p.x - vp.x) * lay * 0.42 + t * 0.022, lay * 0.55 + t * 0.004);
    float cloud = fbm(cu + 0.9 * vec2(fbm(cu * 0.6 + 3.1), fbm(cu * 0.6 + 8.4)));
    cloud = smoothstep(0.42, 0.78, cloud) * smoothstep(0.0, 0.06, up) * u_clouds;
    haze *= 1.0 - 0.6 * cloud;
    haze += steel * cloud * (0.08 + 0.38 * right) * (exp(-up / 0.35) + 0.05);
    float rise = exp(-up / 0.05) * exp(-pow((p.x - vp.x) / (0.2 * aspect), 2.0));
    haze += tail * rise * 0.2 * u_trails * (0.6 + 0.8 * drift);
    /* Keep the darks deep: the thin end of the haze is pulled down towards
       black and only what is already bright is let through at strength. */
    haze *= mix(0.4, 1.12, smoothstep(0.02, 0.36, dot(haze, vec3(0.3333))));
    col += haze * u_haze;
    float speck = step(0.9982, rnd(ivec2(gl_FragCoord.xy / 2.0)));
    col += steel * 1.6 * speck * 0.25 * smoothstep(0.02, 0.3, up);
  } else {
    /* Ground: a plane seen in perspective. You stand on the right shoulder;
       the road runs away to the left of you, its edge line just beside. */
    float below = max(-up, 0.0005);
    float d = log(u_crown / below);
    float l = (p.x - vp.x) / below / 3.0;
    float px = 1.6 / u_size.y / below / 3.0;

    float on = smoothstep(1.06 + px, 0.98, abs(l + 0.72));
    float grit = fbm(vec2(l * 5.0, d * 9.0));
    vec3 asphalt = vec3(0.027, 0.034, 0.036) * (0.6 + 0.8 * grit);
    vec3 verge = vec3(0.012, 0.019, 0.015) * (0.5 + 0.9 * fbm(vec2((p.x - vp.x) / below * 0.5, d * 6.0)));
    col = mix(verge, asphalt, on);
    float edge = exp(-pow((l - 0.22) / (0.011 + px), 2.0));
    col += vec3(0.75, 0.8, 0.85) * edge * 0.3 * (1.0 - exp(-below / 0.02));

    float fog = exp(-below / 0.035);
    col += steel * right * fog * 0.46 * u_haze;
    col += steel * on * exp(-below / 0.1) * 0.085 * u_haze;

    /* Every trail is a straight line to the vanishing point. What moves is
       the light along it: fine fibres streaming past, the way a long
       exposure smears a moving lamp. */
    float fibre = vnoise(vec2(l * 70.0, d * 1.4 - t * 0.7));
    float reach = 1.0 - exp(-below / 0.007);
    vec3 light = vec3(0.0);
    light += highwayTrail(l, -0.24, 0.020, px, tail, highwayPulse(d, t, 1.0, 1.0));
    light += highwayTrail(l, -0.50, 0.022, px, tail, highwayPulse(d, t, 2.0, 1.0));
    light += highwayTrail(l, -0.66, 0.008, px, tail, highwayPulse(d, t, 6.0, 1.0)) * 0.4;
    light += highwayTrail(l, -0.82, 0.020, px, tail, highwayPulse(d, t, 3.0, 1.0)) * 0.9;
    light += highwayTrail(l, -1.06, 0.010, px, tail, highwayPulse(d, t, 7.0, 1.0)) * 0.5;
    light += highwayTrail(l, -1.34, 0.013, px, oncoming, highwayPulse(d, t, 4.0, -1.0)) * 0.55;
    light += highwayTrail(l, -1.52, 0.013, px, oncoming, highwayPulse(d, t, 5.0, -1.0)) * 0.45;
    col += light * (0.7 + 0.6 * fibre) * reach * u_trails;

    /* Fog lying on the ground, drifting, and catching the colour of the
       trails that run through it. */
    float bank = fbm(vec2(p.x * 2.2 + t * 0.06, d * 1.6 - t * 0.035));
    float mist = exp(-below / 0.075) * (0.25 + 1.1 * bank);
    vec3 scatter = tail * exp(-pow(l + 0.62, 2.0) / 0.5) + oncoming * exp(-pow(l + 1.43, 2.0) / 0.2) * 0.3;
    col += scatter * mist * 0.3 * u_trails * u_haze;
    col += steel * right * mist * 0.37 * u_haze;
  }

  /* The line where they meet, warm at the far end, and the hot point where
     every trail ends, with a flare across the horizon. */
  float line = exp(-pow(up / 0.0024, 2.0));
  col += mix(steel * 1.8, warm, smoothstep(-0.25, 0.1, side)) * line * right * 0.55 * u_haze;
  /* A city along the horizon: a low glow, and its lights in two rows, the
     upper ones on buildings and the lower ones their reflections. */
  float cx = p.x * 230.0;
  ivec2 cell = ivec2(int(floor(cx)) + 4096, 0);
  float inCell = exp(-pow((fract(cx) - 0.5) / 0.16, 2.0));
  /* The lights gather into districts with dark gaps between them, and no
     two burn alike. */
  float district = smoothstep(0.3, 0.75, vnoise(vec2(p.x * 3.2, 7.0)));
  float lit = step(0.9 - 0.5 * district, rnd(cell + ivec2(0, 3))) * (0.35 + 0.65 * rnd(cell + ivec2(0, 11)));
  float lift = 0.002 + 0.013 * rnd(cell + ivec2(0, 9));
  float lamp = exp(-pow((up - lift) / 0.0018, 2.0)) + 0.5 * exp(-pow((up + lift * 0.6) / 0.0024, 2.0));
  /* Most lights shimmer, each at its own pace; about one in seven is a
     beacon that blinks slowly on and off. */
  float pace = rnd(cell + ivec2(0, 7));
  float shimmer = 0.6 + 0.4 * sin(t * (1.2 + 2.6 * pace) + 6.283 * pace);
  float beacon = smoothstep(0.35, 0.5, sin(t * (0.9 + 1.4 * pace) + 6.283 * pace) * 0.5 + 0.5);
  float twinkle = mix(shimmer, beacon * 1.5, step(0.86, rnd(cell + ivec2(0, 13))));
  col += mix(warm, tail, rnd(cell + ivec2(0, 5))) * inCell * lit * lamp * twinkle * 0.6 * u_city * reachOut;
  col += mix(warm, steel * 1.6, 0.5) * exp(-abs(up) / (up > 0.0 ? 0.022 : 0.008)) * (0.35 + 0.65 * vnoise(vec2(p.x * 9.0, 1.0))) * 0.1 * u_city * reachOut;

  vec2 away = p - vp;
  float meet = exp(-dot(away, away) / 0.0016) * 0.9 + exp(-dot(away, away) / 0.02) * 0.22;
  float flare = exp(-pow(away.y / 0.0035, 2.0)) * exp(-abs(away.x) / 0.22) * 0.5;
  col += (mix(warm, vec3(1.0), 0.55) * meet + mix(warm, vec3(1.0), 0.3) * flare) * u_meet;

  return u_ground + pow(max(col, vec3(0.0)), vec3(2.2));
}
`,
};

/** Every scene, in picker order. */
/**
 * The ocean: open water seen from straight above, with sea life drawn in
 * type swimming through it. It is the one scene with a day of its own, told
 * from the page ground: on a light page it is a shallow tropical sea, the
 * ground showing through turquoise water under a net of sunlight, the
 * animals dark against the sand; on a dark page it is deep water at night,
 * deep blue with the net cut into it as shadow and a patch of moonlight, where the animals
 * are bioluminescent: their characters pulse in their own colour and the
 * water round each body glows with it. The water is drawn
 * in square blocks with a few flat steps of light, as a pixel drawing is,
 * and the animals are type, as are the loose characters that trace the
 * crests of the net and travel with them; nothing in the scene sits still. The water answers the animals: each
 * parts it at the nose and drags a rippled wake behind, the net of light
 * carried along at the animal's own pace, and by night the stirred water
 * glows. The animals wear the theme's accents, each its own and every
 * fish of a school a different one. Each animal is a silhouette (a shark, a ray, a turtle,
 * schools of small fish) read at the centre of every character cell, so it
 * moves a cell at a time, and a cell prints a heavier character the deeper
 * inside the body it lies. Every crossing takes a new heading and lane.
 */
export const ocean: Scene = {
  id: "ocean",
  label: "Ocean",
  description: "Open water from above, sea life drawn in type swimming through it: a turquoise shallow by day, deep and moonlit by night.",
  /* The water's green and its blue (turquoise is the two mixed), then the
     rest of the ambient set, which with those two colours the animals. */
  colours: [
    "--color-ambient-2",
    "--color-ambient-4",
    "--color-ambient-1",
    "--color-ambient-3",
    "--color-ambient-5",
    "--color-ambient-6",
  ],
  glyphs: ".:;~!il1][)(}{|/?jftrxnuvczXYUJCLQ0OZmwqpdb",
  /* Type at 1x on a 2x screen is soft. */
  pixelRatio: 2,
  params: [
    { key: "cell", label: "Type size", min: 6, max: 30, step: 1, default: 11 },
    { key: "pixel", label: "Pixel size", min: 1, max: 24, step: 1, default: 7 },
    { key: "life", label: "Sea life", min: 0, max: 1, step: 0.01, default: 0.9 },
    { key: "scale", label: "Animal size", min: 0.4, max: 2.5, step: 0.05, default: 1 },
    { key: "swim", label: "Swim speed", min: 0, max: 4, step: 0.05, default: 1 },
    { key: "wake", label: "Wake", min: 0, max: 2, step: 0.01, default: 1 },
    { key: "caustics", label: "Caustics", min: 0, max: 2, step: 0.01, default: 1 },
    { key: "depth", label: "Depth", min: 0, max: 1.5, step: 0.01, default: 1 },
    { key: "light", label: "Light", min: 0, max: 2, step: 0.01, default: 1 },
    { key: "glints", label: "Glints", min: 0, max: 3, step: 0.05, default: 1 },
    { key: "ripple", label: "Ripple", min: 0.4, max: 3, step: 0.05, default: 1 },
  ],
  glsl: /* glsl */ `
/* A theme's ambient tone at full brightness, so it reads as a hue. */
vec3 oceanHue(vec3 c) {
  return c / max(max(c.r, max(c.g, c.b)), 1e-3);
}

/* Light through moving water: a net of bright lines, folded from a few
   turns of one point round another. It tiles, so the caller warps it. */
float oceanCaustic(vec2 p, float t) {
  vec2 q = mod(p * 6.2831853, 6.2831853) - 250.0;
  vec2 i = q;
  float c = 1.0;
  for (int n = 0; n < 4; n++) {
    float s = t * (1.0 - 3.5 / float(n + 1));
    i = q + vec2(cos(s - i.x) + sin(s + i.y), sin(s - i.y) + cos(s + i.x));
    c += 1.0 / length(vec2(q.x / (sin(i.x + s) / 0.005), q.y / (cos(i.y + s) / 0.005)));
  }
  c = 1.17 - pow(c / 4.0, 1.4);
  return pow(abs(c), 8.0);
}

/* The animals. Each returns how deep inside the body a point lies: 1 at
   its core, 0 on its edge, and falling below that with distance outside,
   which is what the night's glow is read from. q is in body lengths, the nose at +x. */
float oceanBlob(vec2 d, vec2 r) {
  return 1.0 - length(d / r);
}

/* A pair of swept fins: a chord that narrows to nothing at the tip. */
float oceanFin(vec2 q, float root, float sweep, float chord, float span) {
  float a = abs(q.y);
  float c = chord * (1.0 - a / span);
  return c > 0.0 ? 1.0 - abs(q.x - (root - sweep * a)) / c : -4.0;
}

float oceanShark(vec2 q) {
  float w = 0.2 * pow(max(1.0 - q.x * q.x, 0.0), 0.55) * mix(0.25, 1.0, smoothstep(-1.0, 0.2, q.x));
  float body = w > 0.0 ? 1.0 - abs(q.y) / w : -4.0;
  float fins = max(oceanFin(q, 0.3, 1.0, 0.2, 0.5), oceanFin(q, -1.0, 0.9, 0.1, 0.28));
  return max(body, fins > 0.0 ? 0.7 * fins : fins);
}

float oceanRay(vec2 q) {
  float tail = q.x > -1.7 && q.x < -0.3 ? 0.5 * (1.0 - abs(q.y) / 0.06) : -4.0;
  return max(oceanFin(q, 0.15, 0.4, 0.62, 1.0), tail);
}

float oceanTurtle(vec2 q, float w) {
  vec2 h = vec2(q.x, abs(q.y));
  float a = 1.0 + 0.35 * sin(w);
  vec2 d = h - vec2(0.38, 0.42);
  vec2 front = vec2(cos(a) * d.x + sin(a) * d.y, -sin(a) * d.x + cos(a) * d.y);
  float limbs = max(oceanBlob(front - vec2(0.3, 0.0), vec2(0.42, 0.14)),
                    oceanBlob(h - vec2(-0.62, 0.34), vec2(0.2, 0.1)));
  return max(max(oceanBlob(q, vec2(0.62, 0.5)), oceanBlob(q - vec2(0.8, 0.0), vec2(0.22, 0.17))), limbs > 0.0 ? 0.7 * limbs : limbs);
}

/* A school: one small fish to a square of a grid, each off its centre,
   about half the squares empty, all inside an oval. */
float oceanSchool(vec2 q, float w, int k, out int tint) {
  vec2 g = q * 6.0;
  vec2 id = floor(g);
  ivec2 at = ivec2(id) + ivec2(64 + k * 31, 64);
  tint = int(rnd(at + 3) * 5.999);
  if (length((id + 0.5) / vec2(6.0, 3.6)) > 1.0 || rnd(at) < 0.48) return -4.0;
  vec2 f = fract(g) - 0.5 - 0.28 * (vec2(rnd(at + 7), rnd(at + 13)) - 0.5);
  f.y += 0.05 * sin(f.x * 6.0 + w + rnd(at + 5) * 6.0);
  float fish = max(oceanBlob(f, vec2(0.3, 0.13)), oceanBlob(f + vec2(0.3, 0.0), vec2(0.1, 0.12)));
  /* Outside a fish the value falls away fast, so the night's glow hugs
     each one instead of filling its square of the grid. */
  return fish > 0.0 ? fish : fish * 5.0;
}

/* Six animals, each crossing the stage on a straight lane and coming back
   on a new one: its heading, mostly along the stage, and its lane are
   rolled again for every crossing. This is animal k's own frame: where p
   lies along (x) and across (y) its lane, with its heading and its size. */
vec2 oceanLane(int k, vec2 p, float aspect, float cells, float t, out float turn, out float size) {
  float lap = length(vec2(aspect, 1.0)) + 1.4;
  float s = t * u_swim * (0.04 + 0.025 * rnd(ivec2(k, 5))) / lap + rnd(ivec2(k, 9)) + float(k) * 0.37;
  float along = (fract(s) - 0.5) * lap;
  ivec2 seed = ivec2(k * 17 + 3, int(floor(s)) + 40);
  turn = (rnd(seed) - 0.5) * 1.3 + (rnd(seed + 1) > 0.5 ? 3.14159265 : 0.0);
  float lane = (rnd(seed + 2) - 0.5) * 0.75 + 0.04 * sin(along * 2.0 + float(k));
  int kind = k < 4 ? k : 5 - k;
  /* Half a body length in stage heights, and never fewer characters
     than it takes to read as the animal on a short stage. */
  size = max(kind == 0 ? 0.22 : kind == 1 ? 0.26 : kind == 2 ? 0.13 : 0.085,
             cells * (kind == 0 ? 15.0 : kind == 1 ? 16.0 : kind == 2 ? 9.0 : 7.0)) * u_scale;
  return vec2(cos(turn) * p.x + sin(turn) * p.y, -sin(turn) * p.x + cos(turn) * p.y) - vec2(along, lane);
}

/* tint: which of the scene's colours the nearest animal wears. Each fish
   of a school takes its own; the others have one apiece. */
float oceanLife(vec2 p, float aspect, float cells, float t, out int tint) {
  float best = -4.0;
  tint = 0;
  for (int k = 0; k < 6; k++) {
    float turn;
    float size;
    vec2 q = oceanLane(k, p, aspect, cells, t, turn, size) / size;
    if (abs(q.x) > 2.6 || abs(q.y) > 2.0) continue;
    int kind = k < 4 ? k : 5 - k;
    float w = t * u_swim * 2.0 + float(k) * 1.7;
    float v;
    int wears = k == 0 ? 0 : k == 2 ? 3 : k == 3 ? 2 : 4;
    if (kind == 0) {
      q.y += 0.1 * sin(q.x * 2.4 + w) * smoothstep(0.5, -1.0, q.x);
      v = oceanShark(q);
    } else if (kind == 1) {
      v = oceanSchool(q, w * 2.0, k, wears);
    } else if (kind == 2) {
      q.y *= 1.0 + 0.1 * sin(w);
      v = oceanRay(q);
    } else {
      v = oceanTurtle(q, w);
    }
    if (v > best) {
      best = v;
      tint = wears;
    }
  }
  return best;
}

/* What the animals do to the water. Each parts it at the nose and drags a
   wake behind that opens and dies away over a few body lengths, with a
   train of ripples along it. All of it is written in the animal's own
   frame, so it travels at the animal's pace and turns with its heading.
   xy: how far the water is carried; z: the wake's strength there. */
vec3 oceanWake(vec2 p, float aspect, float cells, float t) {
  vec3 wake = vec3(0.0);
  for (int k = 0; k < 6; k++) {
    float turn;
    float size;
    vec2 q = oceanLane(k, p, aspect, cells, t, turn, size) / size;
    if (q.x > 1.8 || q.x < -7.0 || abs(q.y) > 3.0) continue;
    float behind = max(-q.x, 0.0);
    float width = 0.4 + 0.22 * behind;
    float strength = exp(-q.y * q.y / (width * width)) * smoothstep(1.6, 0.4, q.x) * exp(-behind * 0.45);
    /* Carried along with the animal, pushed out from its line, and rippled. */
    vec2 carry = vec2(0.5, 0.45 * q.y / width + 0.25 * sin(q.x * 5.0 + abs(q.y) * 4.0)) * strength * size;
    wake.xy += vec2(cos(turn) * carry.x - sin(turn) * carry.y, sin(turn) * carry.x + cos(turn) * carry.y);
    wake.z += strength * (0.55 + 0.45 * sin(q.x * 7.0 + abs(q.y) * 6.0));
  }
  return wake;
}

/* The net of light at a point. The water keeps the animals' pace: the net
   drifts across the stage about as fast as they swim and changes shape
   more slowly still, so nothing in the water outruns them, and it is
   carried and brightened where one passes. */
float oceanNet(vec2 p, vec3 wake, float flow) {
  vec2 wp = (p - wake.xy + vec2(0.022, 0.012) * flow) * u_ripple;
  wp += 0.07 * (vec2(vnoise(wp * 1.3 + flow * 0.03), vnoise(wp * 1.3 + 5.2 - flow * 0.025)) - 0.5);
  return min(1.0, oceanCaustic(wp * 0.9, flow * 0.03 + 23.0) + 0.45 * wake.z);
}

vec3 scene(vec2 uv, float t) {
  float aspect = u_size.x / u_size.y;
  /* The water is drawn in square blocks, and the type in cells over it. */
  float block = max(1.0, floor(u_pixel * u_ratio + 0.5));
  vec2 p = ((floor(uv * u_size / block) + 0.5) * block / u_size - 0.5) * vec2(aspect, 1.0);
  /* Day on a light page, night on a dark one. */
  float day = smoothstep(0.1, 0.45, dot(u_ground, vec3(0.2126, 0.7152, 0.0722)));
  vec3 green = oceanHue(u_col[0]);
  vec3 blue = oceanHue(u_col[1]);
  vec3 turquoise = mix(green, blue, 0.38);
  vec3 silver = mix(mix(blue, turquoise, 0.3), vec3(1.0), 0.6);

  float cells = max(4.0, floor(u_cell * u_ratio + 0.5)) * 0.6 / u_size.y;
  vec3 wake = oceanWake(p, aspect, cells, t) * u_wake;
  float flow = t * (0.4 + 0.6 * u_swim);
  /* A few flat steps of light, as a pixel drawing has. */
  float net = floor(oceanNet(p, wake, flow) * 5.0 + 0.5) / 5.0 * u_caustics;
  float deep = smoothstep(0.3, 0.75, fbm(p * 0.8 + vec2(t * 0.012, 3.0))) * u_depth;
  /* Where the sun or the moon lies on the water. */
  vec2 dl = (p - vec2(0.26 * aspect, 0.2)) / vec2(0.6, 0.32);
  float glow = exp(-dot(dl, dl)) * u_light;

  vec3 shallow = mix(u_ground, turquoise, 0.88);
  vec3 sea = mix(shallow, mix(turquoise, blue, 0.22) * 0.7, min(1.0, deep * 0.8));
  sea += u_ground * net * (0.3 + 0.5 * glow) * (1.0 - 0.5 * min(1.0, deep));
  /* By night the net is shadow, not light: the water is a deep blue and
     the waves darken it towards the ground, so nothing pale lies on it but
     the moon's own patch. */
  vec3 night = u_ground + (blue * (0.02 + 0.016 * (1.0 - min(1.0, deep))) + silver * glow * 0.02)
    * (1.0 - 0.85 * min(1.0, net));
  vec3 col = mix(night, sea, day);

  /* The type: the animals, and thin characters adrift between them. */
  float cellH = max(4.0, floor(u_cell * u_ratio + 0.5));
  vec2 size = vec2(cellH * 0.6, cellH);
  vec2 cell = floor(uv * u_size / size);
  vec2 local = fract(uv * u_size / size);
  local.x = 0.06 + local.x * 0.88;
  vec2 pc = ((cell + 0.5) * size / u_size - 0.5) * vec2(aspect, 1.0);
  int tint;
  float body = oceanLife(pc, aspect, size.x / u_size.y, t, tint);
  vec3 accent = oceanHue(u_col[tint]);
  float inside = smoothstep(0.0, 0.06, body);
  ivec2 at = ivec2(cell) + 2048;
  float g = floor(clamp(mix(rnd(at), pow(max(body, 0.0), 0.6), 0.5), 0.0, 0.999) * u_glyphCount);
  float ink = texture(u_glyphs, vec2((g + local.x) / u_glyphCount, local.y)).r * inside;
  /* Each animal wears one of the theme's accents. By day it is that
     colour deepened, a dark shape over the sand. By night it makes its own
     light in it: each character pulses, hot at the core, and the water
     round the body glows with it. */
  float pulse = 0.5 + 0.5 * sin(t * 0.9 + rnd(at) * 6.2831853 + pc.x * 9.0);
  vec3 lure = mix(accent, mix(accent, vec3(1.0), 0.3), pulse);
  vec3 lit = mix(lure, vec3(1.0), 0.55 * max(body, 0.0)) * (0.65 + 0.5 * pulse);
  col += (1.0 - day) * u_life * (lure * 0.16 * pow(smoothstep(-1.6, 0.1, body), 2.0) + turquoise * 0.05 * min(1.0, wake.z)); 
  col = mix(col, mix(lit, mix(mix(blue, turquoise, 0.25) * 0.11, accent * 0.5, 0.85), day),
            u_life * (mix(0.14, 0.34, day) * smoothstep(0.0, 0.25, body) + 0.86 * ink));

  /* The loose characters belong to the waves: a cell prints one only
     while a bright line of the net lies over it, so they trace the crests
     and travel with them, and gather in an animal's wake. */
  float crest = smoothstep(0.22, 0.6, oceanNet(pc, wake, flow));
  float on = step(rnd(at + ivec2(31, 17)), 0.3 * u_glints * crest * (1.0 + glow)) * (1.0 - inside);
  float thin = floor(rnd(at + ivec2(3, 71)) * min(10.0, u_glyphCount));
  float glint = texture(u_glyphs, vec2((thin + local.x) / u_glyphCount, local.y)).r * on * crest;
  return mix(col, mix(mix(turquoise, vec3(1.0), 0.3), u_ground, day), glint * 0.8);
}
`,
};

/**
 * The sky: cloud massed overhead and lit by a low sun, painted more than
 * observed. The clouds lie on one flat layer far above, so they are large
 * and slow at the top of the frame and small, close-packed and hazed where
 * the layer runs off to the horizon, and the layer is bent before it is
 * read, so a cloud billows and curls as paint does rather than sitting as
 * a puff. The drama is the light. The sun stands low and the cloud burns
 * with it: each cloud is lit by comparing its thickness with the cloud a
 * step towards the light, which gives it a hot side and a shaded one
 * without a ray being marched, and the colour runs from the hot side
 * through an ember middle to a cold shade; where cloud is thin in front of
 * the sun the light comes through it, and the strip of sky on the horizon
 * under the cloud burns hardest of all. Like the ocean it has a day of its own, told from the page
 * ground: on a light page a golden hour, cream and rose cloud with a deep
 * blue shade over a sky that warms to the horizon; on a dark page the
 * last of a sunset with the night already overhead: the sky near black
 * with stars, heavy cloud standing as silhouettes darker still, burning
 * like coals only where it faces the sun, over a horizon on fire. The sky is the fourth ambient role cooled with a
 * little of the second, the sun the first, the fire in the cloud the fifth
 * and sixth and its shade the third, so a theme recolours it. Contrails
 * cross the far sky low over the horizon, well above the weather, so
 * every cloud stands in front of them, and they hold the sun's colour;
 * one more is still being laid, high in the frame, by a plane a few pixels
 * long. Deep blue shows through overhead in slow patches.
 */
export const sky: Scene = {
  id: "sky",
  label: "Sky",
  description: "Cloud massed overhead and burning with a low sun: a golden hour on a light page, the last of a sunset under a night sky on a dark one.",
  /* The sky's blue, the sun's gold, the tint in a cloud's shade, the green
     that cools the blue towards slate, and the two tones of the fire. */
  colours: [
    "--color-ambient-4",
    "--color-ambient-1",
    "--color-ambient-3",
    "--color-ambient-2",
    "--color-ambient-5",
    "--color-ambient-6",
  ],
  params: [
    { key: "cover", label: "Cloud cover", min: 0, max: 1, step: 0.01, default: 0.72 },
    { key: "scale", label: "Cloud size", min: 0.3, max: 3, step: 0.01, default: 1.4 },
    { key: "soft", label: "Softness", min: 0.1, max: 2, step: 0.01, default: 0.6 },
    { key: "warp", label: "Billow", min: 0, max: 2, step: 0.01, default: 1 },
    { key: "wisps", label: "High cloud", min: 0, max: 1, step: 0.01, default: 0.5 },
    { key: "trails", label: "Contrails", min: 0, max: 1.5, step: 0.01, default: 0.7 },
    { key: "planeX", label: "Plane crosses at", min: -1, max: 1, step: 0.01, default: 0 },
    { key: "planeY", label: "Plane height", min: 0, max: 1, step: 0.01, default: 0.7 },
    { key: "planeTurn", label: "Plane heading", min: -1, max: 1, step: 0.01, default: 0.03 },
    { key: "wind", label: "Wind", min: 0, max: 4, step: 0.05, default: 1 },
    { key: "horizon", label: "Horizon", min: -0.6, max: 0.4, step: 0.01, default: 0.07 },
    { key: "depth", label: "Sky depth", min: 0, max: 1.5, step: 0.01, default: 1 },
    { key: "sun", label: "Sun", min: 0, max: 2, step: 0.01, default: 1 },
    { key: "fire", label: "Fire", min: 0, max: 1.5, step: 0.01, default: 1 },
    { key: "sunX", label: "Sun position", min: -1, max: 1, step: 0.01, default: 0.18 },
    { key: "sunY", label: "Sun height", min: 0, max: 1, step: 0.01, default: 0.26 },
    { key: "stars", label: "Stars", min: 0, max: 2, step: 0.01, default: 1 },
  ],
  glsl: /* glsl */ `
/* A theme's ambient tone at full brightness, so it reads as a hue. A tone
   with next to no hue (a monochrome theme's greys) keeps its own value:
   lifted, a grey would come out white, and the sky would be the page. */
vec3 skyHue(vec3 c) {
  float hi = max(c.r, max(c.g, c.b));
  float chroma = (hi - min(c.r, min(c.g, c.b))) / max(hi, 1e-3);
  return mix(c, c / max(hi, 1e-3), smoothstep(0.04, 0.2, chroma));
}

/* How much cloud stands over a point of the layer. The fine octaves slide
   over the broad ones, so a cloud boils slowly as it drifts. */
float skyCloud(vec2 q, float t) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 7; i++) {
    s += a * vnoise(q + t * 0.012 * float(i) * vec2(1.0, 0.6));
    q = q * 2.03 + vec2(17.0, 9.0);
    a *= 0.54;
  }
  return s * 0.93;
}

/* A mix made by eye rather than by light, so a blue thinned with the page
   stays blue instead of going to lilac. */
vec3 skyMix(vec3 a, vec3 b, float k) {
  return pow(mix(pow(a, vec3(1.0 / 2.2)), pow(b, vec3(1.0 / 2.2)), k), vec3(2.2));
}

/* Contrails: straight streaks far off and far above the cloud, low over
   the horizon and small with the distance, each on a heading of its own, laid across one
   another. A trail is thin and whole at its new
   end and spreads and breaks up towards its old one, and all of them
   slide slowly with the wind. */
float skyTrails(vec2 p, float aspect, float w) {
  float s = 0.0;
  for (int i = 0; i < 7; i++) {
    float a = rnd(ivec2(i, 91));
    float b = rnd(ivec2(i, 17));
    float c = rnd(ivec2(i, 53));
    float ang = (a - 0.5) * 0.9;
    vec2 dir = vec2(cos(ang), sin(ang));
    vec2 at = vec2((b - 0.5) * aspect * 0.9, 0.1 + 0.26 * c) + vec2(0.0016, 0.0004) * w * (0.4 + b);
    vec2 d = p - at;
    float along = dot(d, dir);
    float across = dot(d, vec2(-dir.y, dir.x));
    float u = along / (0.22 + 0.4 * a) + 0.5;
    float age = 1.0 - clamp(u, 0.0, 1.0);
    float width = mix(0.0014, 0.0055, age * age) * (0.6 + 0.8 * c);
    float body = exp(-across * across / (width * width));
    float ends = smoothstep(0.0, 0.3, u) * smoothstep(1.0, 0.985, u);
    float broken = mix(1.0, 0.35 + 0.65 * vnoise(vec2(along * 40.0 + float(i) * 9.0, float(i) * 3.0 + across * 40.0)), age);
    s += body * ends * broken * mix(1.0, 0.45, age) * (0.45 + 0.55 * b);
  }
  return min(1.0, s);
}

/* One plane, very far off and high in the frame, well clear of the other
   trails. Its path is the host's to lay: the point it flies through and
   its heading are settings, so a page can route it clear of its type. It
   crosses the sky on a straight line and
   drawing a new trail as it goes: x is its silhouette, a fuselage, swept
   wings and a tail a few pixels long, and y the streak behind it, thin and
   bright at the plane and spreading and fading with age. */
vec2 skyPlane(vec2 p, float aspect, float w) {
  float turn = u_planeTurn * 3.14159265;
  vec2 dir = vec2(cos(turn), sin(turn));
  vec2 through = vec2(u_planeX * 0.5 * aspect, u_planeY);
  float run = aspect + 1.8;
  vec2 d = p - (through + dir * (fract(w * 0.003 + 0.46) - 0.5) * run);
  float along = dot(d, dir);
  float across = abs(dot(d, vec2(-dir.y, dir.x)));
  float age = clamp((-along - 0.011) / 0.55, 0.0, 1.0);
  float width = mix(0.0012, 0.0042, age);
  float streak = exp(-across * across / (width * width)) * step(0.011, -along) * (1.0 - age) * (1.0 - age);
  float body = 1.0 - smoothstep(0.7, 1.0, length(vec2(along / 0.008, across / 0.0012)));
  float wing = (1.0 - smoothstep(0.7, 1.0, abs(along + 0.0006 + across * 0.4) / 0.0017))
    * (1.0 - smoothstep(0.006, 0.007, across));
  float tail = (1.0 - smoothstep(0.7, 1.0, abs(along + 0.0064 + across * 0.35) / 0.0011))
    * (1.0 - smoothstep(0.0022, 0.0028, across));
  return vec2(max(body, max(wing, tail)), streak);
}

vec3 scene(vec2 uv, float t) {
  float aspect = u_size.x / u_size.y;
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y);
  /* Day on a light page, night on a dark one. */
  float day = smoothstep(0.1, 0.45, dot(u_ground, vec3(0.2126, 0.7152, 0.0722)));
  vec3 blue = mix(skyHue(u_col[0]), skyHue(u_col[3]), 0.35);
  vec3 gold = skyHue(u_col[1]);
  vec3 tint = skyHue(u_col[2]);
  vec3 ember = skyHue(u_col[4]);
  vec3 flame = mix(ember, skyHue(u_col[5]), 0.45);
  /* The hottest tone: the sixth role warmed with the sun's. */
  vec3 blazing = mix(skyHue(u_col[5]), gold, 0.2);
  /* The dusk sky's own tone: the blue greyed towards slate. */
  vec3 slate = mix(blue, vec3(dot(blue, vec3(0.2126, 0.7152, 0.0722))), 0.4);

  /* Height above the horizon, and the point of the cloud layer this pixel
     looks at: the layer is flat, so it runs away as the eye drops. It
     closes up sideways only half as fast as it does in depth, or the cloud
     at the edges of a wide frame would be sheared into streaks. */
  float up = uv.y - u_horizon;
  float rise = max(up, 0.0) + 0.22;
  vec2 layer = vec2(p.x / mix(0.75, rise, 0.5), 1.3 / rise);
  float far = smoothstep(0.0, 0.3, up);
  float w = t * u_wind;
  vec2 drift = vec2(0.022, 0.007) * w;

  /* Where the sun stands, how far its light reaches, and the band of sky
     along the horizon that takes its colour. */
  vec2 sunAt = vec2(u_sunX * 0.5 * aspect, u_sunY);
  vec2 toSun = sunAt - p;
  float sunDist = length(toSun);
  float reach = exp(-sunDist * sunDist / 0.7);
  float glow = exp(-sunDist * sunDist / 0.1) * u_sun;
  float disc = exp(-sunDist * sunDist / 0.005) * u_sun;
  float facingSky = exp(-sunDist * sunDist / 0.2);
  float low = exp(-max(up, 0.0) * max(up, 0.0) / 0.1);
  /* The strip right on the horizon, under the cloud, where the sky burns. */
  float band = exp(-max(up, 0.0) * max(up, 0.0) / 0.012);
  float burn = u_fire * min(1.0, u_sun);

  /* The open sky: warm along the horizon, deep overhead. */
  float climb = pow(clamp(up, 0.0, 1.0), 0.65);
  vec3 dayHaze = skyMix(skyMix(u_ground, blue, 0.14 * u_depth), mix(flame, gold, 0.4), min(1.0, burn * (0.3 + 0.5 * band) * (0.4 + 0.6 * reach)));
  vec3 daySky = mix(dayHaze, skyMix(u_ground, mix(blue, tint, 0.12), min(1.0, 0.7 * u_depth)), climb);
  daySky = skyMix(daySky, mix(gold, vec3(1.0), 0.6), min(1.0, glow * 0.7 + disc));
  vec3 blaze = (mix(ember, tint, 0.3) * 0.07 * low + mix(blazing, ember, 0.25) * 0.75 * band) * burn * (0.12 + 0.88 * reach);
  vec3 nightHaze = u_ground + slate * 0.012 * u_depth + blaze;
  /* The night comes down from the top: the sky is all but the ground
     overhead and keeps a little slate only towards the sunset. */
  vec3 nightSky = u_ground + slate * (0.03 * low + 0.012) * (0.4 + 0.6 * reach) * u_depth + blaze
    + mix(blazing, ember, 0.35) * glow * 0.32 + mix(gold, vec3(1.0), 0.3) * disc * 0.5;

  /* Deep blue shows through overhead in slow patches, where the night has
     not quite closed. */
  vec3 deep = mix(skyHue(u_col[0]), tint, 0.18);
  float open = smoothstep(0.3, 0.7, vnoise(layer * 0.45 + drift * 0.3 + 71.0));
  nightSky += deep * (0.012 + 0.075 * open * climb) * u_depth;
  daySky = mix(daySky, skyMix(u_ground, deep, min(1.0, 0.85 * u_depth)), 0.45 * open * climb);

  /* Stars, a point to a cell, each with its own place, size and beat, and
     only high up, clear of the fire. */
  vec2 sc = uv * u_size / (13.0 * u_ratio);
  ivec2 id = ivec2(floor(sc));
  float pick = rnd(id + ivec2(3, 57));
  vec2 at = 0.2 + 0.6 * vec2(rnd(id + ivec2(7, 3)), rnd(id + ivec2(13, 29)));
  /* A light twinkle: each star swells and dims at a pace of its own, never
     going out. */
  float beat = rnd(id + ivec2(19, 41));
  float star = step(pick, 0.12 * u_stars)
    * smoothstep(0.11, 0.0, length(fract(sc) - at))
    * (0.25 + 0.75 * rnd(id + ivec2(5, 11)))
    * mix(0.4, 1.0, pow(0.5 + 0.5 * sin(t * (0.5 + 1.5 * beat) + beat * 44.0), 2.0))
    * smoothstep(0.2, 0.6, up) * (1.0 - facingSky);
  nightSky += mix(slate, vec3(1.0), 0.7) * star * 0.5;

  /* Thin high cloud, combed along the wind and slower than the cloud
     below; it catches the fire before anything else does. */
  float comb = skyCloud(layer * vec2(0.5, 2.6) / u_scale + drift * 0.4 + 31.0, w * 0.5);
  float wisp = smoothstep(0.42, 0.8, comb) * u_wisps * far;
  daySky = skyMix(daySky, skyMix(vec3(1.0), flame, 0.45 * burn * reach), wisp * 0.6);
  nightSky += mix(slate, mix(ember, blazing, 0.4), min(1.0, burn * reach * 1.4)) * wisp * (0.008 + 0.1 * facingSky * u_sun);

  /* The layer is bent before it is read, so the cloud billows and curls.
     Then the cloud here, and the cloud a step towards the light: thicker
     there, and this point is in shade. */
  vec2 q = layer * 1.7 / u_scale + drift;
  q += u_warp * 0.55 * (vec2(
    vnoise(q * 0.7 + vec2(3.1, w * 0.012)),
    vnoise(q * 0.7 + vec2(9.4 - w * 0.01, 5.2))
  ) - 0.5);
  vec2 lightStep = normalize(vec2(toSun.x, -toSun.y) + vec2(1e-4, 0.0)) * 0.26;
  float here = skyCloud(q, w);
  float there = skyCloud(q + lightStep, w);
  float edge = mix(0.66, 0.34, u_cover);
  float cloud = smoothstep(edge, edge + 0.13 * u_soft, here) * far;
  float lit = clamp(0.45 + (here - there) * 6.0, 0.0, 1.0);
  float core = smoothstep(edge, edge + 0.3, here);
  float shadow = clamp((1.0 - lit) * 0.85 + core * 0.45 - reach * 0.25, 0.0, 1.0);
  /* The contrails. The planes fly well above the weather, so every cloud
     stands in front of them: the cloud hides a trail wherever it stands,
     at its full thickness even where distance has hazed it, and the high
     cloud veils it. They hold the sun's colour long after the cloud has
     lost it: hot towards the sun, rose and then violet away from it. */
  float hidden = smoothstep(edge - 0.07, edge + 0.04, here);
  float trail = skyTrails(vec2(p.x, up), aspect, w) * u_trails * smoothstep(0.02, 0.12, up)
    * (1.0 - hidden) * (1.0 - 0.85 * min(1.0, wisp));
  /* The one plane still flying, and the trail it is laying. */
  vec2 plane = skyPlane(vec2(p.x, up), aspect, w) * step(0.01, u_trails) * (1.0 - hidden);
  trail = min(1.0, trail + plane.y * 1.3 * (1.0 - 0.85 * min(1.0, wisp)));
  vec3 trailHue = mix(mix(tint, ember, 0.6), mix(blazing, gold, 0.3), smoothstep(0.1, 0.8, reach));
  daySky = skyMix(daySky, skyMix(vec3(1.0), trailHue, min(1.0, 0.75 * burn)), min(1.0, trail * 0.85));
  nightSky += mix(mix(slate, vec3(1.0), 0.5) * 0.25, trailHue, min(1.0, burn)) * trail * u_sun * (0.14 + 0.9 * reach);
  daySky = mix(daySky, mix(blue, tint, 0.5) * 0.06, plane.x);
  nightSky = mix(nightSky, u_ground * 0.3, plane.x);

  /* Thin cloud in front of the sun lets the light through. */
  float through = min(1.0, glow * (1.0 - core) * 0.9);
  float hot = 1.0 - smoothstep(0.0, 0.55, shadow);
  float cold = smoothstep(0.45, 1.0, shadow);

  /* By day: cream on the hot side, rose through the middle, and a deep
     blue shade greyed with the third role. Far cloud takes the haze. */
  vec3 cream = skyMix(vec3(1.0), gold, 0.35 * burn * (0.35 + 0.65 * reach));
  vec3 rose = skyMix(vec3(1.0), mix(flame, ember, 0.3), min(1.0, 0.8 * burn * (0.5 + 0.5 * reach)));
  vec3 shade = skyMix(mix(blue, tint, 0.5), u_ground, 0.15) * 0.42;
  vec3 dayCloud = mix(mix(rose, cream, hot), shade, cold);
  dayCloud = mix(dayCloud, mix(gold, vec3(1.0), 0.75), through);
  dayCloud = mix(dayHaze, dayCloud, smoothstep(0.0, 0.4, up));
  /* By night the cloud makes the light: coals on the hot side, embers
     through the middle, and a shade darker than the sky behind it. With
     no fire it is a moonlit cloud, silver on slate. */
  /* Only the cloud that faces the sunset burns; the rest has gone to
     night. */
  float facing = facingSky;
  float power = u_sun * (0.02 + 0.95 * facing);
  vec3 silver = mix(slate, vec3(1.0), 0.6);
  vec3 coal = mix(silver * 0.3, mix(blazing, ember, 0.35) * 0.85, min(1.0, burn)) * power;
  vec3 embers = mix(slate * 0.1, mix(ember, tint, 0.5) * 0.2, min(1.0, burn)) * (0.1 * u_sun * reach + 0.9 * power);
  /* The shade is a silhouette: darker than the sky it stands against. */
  vec3 nightCloud = mix(u_ground * 0.75 + mix(embers, coal, hot), u_ground * 0.45 + tint * 0.004 * reach, cold);
  nightCloud += mix(gold, vec3(1.0), 0.35) * through * 0.55;
  nightCloud = mix(nightHaze, nightCloud, smoothstep(0.0, 0.4, up));

  vec3 col = mix(mix(nightSky, nightCloud, cloud), mix(daySky, dayCloud, cloud), day);
  /* Below the horizon the land is dark by night and haze by day. */
  vec3 land = mix(u_ground + flame * burn * 0.03 * reach, dayHaze, day);
  return mix(land, col, smoothstep(-0.012, 0.012, up));
}
`,
};

/**
 * The galaxy: a spiral seen at a slant, deep in a field of stars. A disc
 * of light thins outwards from a hot core, wound into two arms. The arms
 * are drawn on the disc unwound, where each lies straight, so the cloud
 * in them, the dust lanes cut along their inner edges and the knots of
 * young stars strung down them all run with the arm, in filaments, and
 * the dust is heavier on the side of the disc tipped towards the eye. The
 * core is a bulge rounder than the disc, standing out of it, near white
 * at its heart in a wide halo of the theme's warm colours, and the disc
 * cools through the theme's colours to its rim. Two companions keep it
 * company, a small soft ellipse off the disc and a tight bright one
 * beside the core. The stars are four depths of points, one to a cell at
 * most, thick in some parts of the sky and thin in others: a dust of
 * faint ones, two scatters of brighter ones and a few near ones with a
 * glow of their own, all twinkling slowly. Behind it all a band of lit
 * gas crosses the sky, billowed and creeping, with a rift of dust down
 * its middle and the stars crowded into it. The arms turn, too slowly to
 * see move. Stars are points, finer than soft light, so the scene draws
 * at up to two pixels per CSS pixel and sizes everything in CSS pixels.
 */
export const galaxy: Scene = {
  id: "galaxy",
  label: "Galaxy",
  description: "A spiral galaxy seen at a slant, a hot core in wound arms, deep in a field of stars.",
  mode: "dark",
  pixelRatio: 2,
  /* The disc's rim, its middle, the halo round the core, and the core. */
  colours: [
    "--color-ambient-4",
    "--color-ambient-3",
    "--color-ambient-5",
    "--color-ambient-1",
  ],
  params: [
    { key: "x", label: "Position across", min: -0.6, max: 0.6, step: 0.01, default: 0 },
    { key: "y", label: "Position up", min: -0.6, max: 0.6, step: 0.01, default: -0.03 },
    { key: "scale", label: "Size", min: 0.2, max: 3, step: 0.01, default: 1.9 },
    { key: "tilt", label: "Tilt", min: -1.57, max: 1.57, step: 0.01, default: 0.4 },
    { key: "incline", label: "Openness", min: 0.08, max: 1, step: 0.01, default: 0.3 },
    { key: "arms", label: "Arms", min: 0, max: 2, step: 0.01, default: 1 },
    { key: "wind", label: "Winding", min: 0, max: 10, step: 0.1, default: 4 },
    { key: "dust", label: "Dust", min: 0, max: 2, step: 0.01, default: 1 },
    { key: "core", label: "Core", min: 0, max: 2, step: 0.01, default: 1 },
    { key: "glow", label: "Glow", min: 0, max: 2, step: 0.01, default: 1 },
    { key: "companions", label: "Companions", min: 0, max: 2, step: 0.01, default: 1 },
    { key: "stars", label: "Stars", min: 0, max: 2, step: 0.01, default: 1 },
    { key: "nebula", label: "Nebula", min: 0, max: 2, step: 0.01, default: 1 },
    { key: "band", label: "Nebula angle", min: -1.57, max: 1.57, step: 0.01, default: -0.3 },
    { key: "bandY", label: "Nebula height", min: -0.7, max: 0.7, step: 0.01, default: 0 },
    { key: "spin", label: "Spin", min: -4, max: 4, step: 0.05, default: 1 },
  ],
  glsl: /* glsl */ `
vec3 galaxyHue(vec3 c) {
  float grey = (c.r + c.g + c.b) / 3.0;
  c = max(grey + (c - grey) * 1.8, vec3(0.0));
  return c / max(max(c.r, max(c.g, c.b)), 1e-3);
}

/* One depth of stars, in CSS pixels: one to a cell at most, held clear of
   the cell's edge so none is cut by it, on a grid turned its own way so
   no two depths line up and none lines up with the screen. Most are
   faint and a few are bright; thick is how full this part of the sky is.
   x is the star's light, y a roll for its colour. */
vec2 galaxyStars(vec2 at, float size, int seed, float thick, float sigma, float halo, float t) {
  float turn = 0.6 + float(seed) * 0.37;
  at = mat2(cos(turn), sin(turn), -sin(turn), cos(turn)) * at + 4096.0;
  ivec2 cell = ivec2(floor(at / size));
  ivec2 id = cell + ivec2(seed, seed * 3);
  vec2 dd = at - (vec2(cell) + 0.16 + 0.68 * vec2(rnd(id + 37), rnd(id + 71))) * size;
  float pick = rnd(id + 911);
  float mag = 0.07 + 0.93 * pow(rnd(id + 5), 5.0);
  /* Each star breathes at its own rate, deeply, and now and then one
     flashes: a short glint well over its own light. */
  float rate = 0.8 + 2.8 * rnd(id + 13);
  float twinkle = 0.62 + 0.38 * sin(t * rate + 40.0 * pick)
    + 0.8 * pow(max(sin(t * (0.35 + 0.5 * rnd(id + 17)) + 90.0 * pick), 0.0), 24.0);
  /* The near stars, the ones with a glow, hold almost steady: a point
     that flickers twinkles, a glowing bulb that does only pulses. */
  twinkle = mix(twinkle, 0.9 + 0.1 * sin(t * 0.4 * rate + 40.0 * pick), smoothstep(0.6, 1.0, sigma));
  float s = sigma * (0.8 + 0.5 * mag);
  float point = exp(-dot(dd, dd) / (2.0 * s * s));
  float bloom = halo * mag * (exp(-length(dd) / (2.2 * s)) + 0.25 * exp(-length(dd) / (7.0 * s)));
  return vec2((point + bloom) * step(pick, thick) * mag * twinkle, rnd(id + 3));
}

/* Two octaves, for the shapes that only steer finer noise. */
float galaxyDrift(vec2 p) {
  return 0.65 * vnoise(p) + 0.35 * vnoise(p * 2.1 + vec2(17.0, 9.0));
}

vec3 scene(vec2 uv, float t) {
  float aspect = u_size.x / u_size.y;
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);
  vec2 css = uv * u_size / u_ratio;

  vec3 blue = galaxyHue(u_col[0]);
  vec3 violet = galaxyHue(u_col[1]);
  vec3 rose = galaxyHue(u_col[2]);
  vec3 warm = galaxyHue(u_col[3]);

  vec3 light = vec3(0.0);

  /* ---- The galaxy's own frame: q runs along the disc's long axis and
     across it, with the rim at 1; d is the same place on the disc's face,
     the slant undone, and dr that face turned by the spin. */
  vec2 g = p - vec2(u_x * aspect, u_y);
  float ca = cos(u_tilt);
  float sa = sin(u_tilt);
  vec2 q = vec2(ca * g.x + sa * g.y, ca * g.y - sa * g.x) / (0.5 * u_scale);
  vec2 d = vec2(q.x, q.y / u_incline);
  float turn = t * u_spin * 0.012;
  float ct = cos(turn);
  float st = sin(turn);
  vec2 dr = vec2(ct * d.x + st * d.y, ct * d.y - st * d.x);
  float r = length(d);

  vec3 glow = vec3(0.0);
  if (r < 1.25) {
    /* ---- The disc, unwound: turning each ring back by its own winding
       lays the two arms out straight along one line, so noise laid on
       it is cloud and dust that follow the arms, and the slant alone
       draws them out along the disc. */
    float w = 0.5 * u_wind * log(r + 0.05);
    float cw = cos(w);
    float sw = sin(w);
    vec2 dw = vec2(cw * dr.x - sw * dr.y, sw * dr.x + cw * dr.y);
    float cloud = fbm(dw * 3.6 + 7.0);
    float fine = fbm(dw * vec2(12.0, 15.0) + 23.0);
    float phase = 2.0 * atan(dw.y, dw.x) + 3.4 * (cloud - 0.5);
    float arm = pow(0.5 + 0.5 * cos(phase), 1.25);
    float outer = smoothstep(0.04, 0.26, r);
    float disc = exp(-r / 0.27) * smoothstep(1.2, 0.4, r);
    /* The outer disc thins out: its light drops, the gaps between the
       arms go dark, and the arms themselves break into patches with
       empty sky between them. */
    float thin = smoothstep(0.2, 0.7, r);
    float broken = mix(1.0, smoothstep(0.47, 0.7, fbm(dw * 5.5 + 80.0) + 0.12 * arm), thin);
    disc *= mix(1.0, 0.3, thin) * broken;
    float wound = mix(1.0, mix(0.3, 0.015, thin) + 1.5 * arm, min(1.0, u_arms) * outer) * (1.0 + max(u_arms - 1.0, 0.0) * arm * outer);
    /* Dust: ragged lanes on each arm's inner edge, and heavier on the
       near side of the disc, where it stands in front of the core's
       light. That one-sidedness is what tips the disc back into depth. */
    float nearSide = smoothstep(0.5, -0.5, d.y);
    float ridge = 1.0 - abs(2.0 * fbm(dw * vec2(7.0, 9.0) + 41.0) - 1.0);
    float lane = pow(0.5 + 0.5 * cos(phase - 1.5), 3.0) * smoothstep(0.45, 0.9, ridge + 0.25 * fine);
    float veil = min(0.94, u_dust * lane * outer * smoothstep(1.1, 0.5, r) * (0.55 + 0.75 * nearSide));
    /* The disc is stars too fine to tell apart: cloud, and a fine tooth. */
    float tooth = 0.86 + 0.28 * vnoise(css * 1.7);
    vec3 body = mix(mix(rose, violet, smoothstep(0.0, 0.2, r)), blue, smoothstep(0.06, 0.4, r));
    glow += mix(body, vec3(1.0), 0.18) * disc * wound * (0.35 + 1.3 * fine) * tooth * 0.75 * u_glow;
    /* Knots of young stars strung down the arms, blue-white, and the
       rose of the gas between them. */
    float knot = pow(fbm(dw * 19.0 + 60.0), 5.0) * arm * disc * outer;
    glow += mix(blue, vec3(1.0), 0.6) * knot * 26.0 * u_glow * min(1.0, u_arms);
    glow += rose * pow(fine, 4.0) * arm * disc * outer * 2.2 * u_glow * min(1.0, u_arms);
    glow *= 1.0 - veil;
    /* The lanes are not black: dust reddens what shines through it. */
    glow += mix(rose, warm, 0.4) * veil * disc * 0.1 * u_glow;
  }
  /* A halo wider than the disc and rounder, so the disc sits in it. */
  float rh = length(vec2(q.x, q.y / mix(u_incline, 1.0, 0.3)));
  glow += mix(blue, violet, 0.3) * (exp(-rh / 0.3) * 0.028 + exp(-rh / 1.1) * 0.002) * u_glow;

  /* ---- The core: a bulge rounder than the disc, standing out of it. */
  vec2 b = vec2(q.x, q.y / mix(u_incline, 1.0, 0.5));
  float rb = length(b);
  glow += mix(rose, violet, 0.35) * (exp(-rb / 0.1) * 0.5 + exp(-rb / 0.28) * 0.1) * u_core;
  glow += mix(mix(warm, rose, 0.4), vec3(1.0), 0.6) * (exp(-rb * rb / (2.0 * 0.035 * 0.035)) * 1.6 + exp(-rb / 0.05) * 0.8) * u_core;
  /* Rolled off like film, so the core burns out to white with colour
     held in its shoulder and the faint arms keep their place under it. */
  light += 1.0 - exp(-1.5 * glow);
  /* The disc's own stars: the sky's faint ones come up where it shines. */
  float among = 1.0 + 3.0 * min(1.0, dot(glow, vec3(0.6)));

  /* ---- Two companions: a soft ellipse off the disc, and a tight bright
     one beside the core. */
  vec2 e = q - vec2(0.03, -0.64);
  e = vec2(0.8 * e.x + 0.6 * e.y, 0.8 * e.y - 0.6 * e.x) * vec2(1.0, 1.7);
  float re = length(e);
  light += mix(blue, vec3(1.0), 0.45) * (exp(-re / 0.03) * 0.5 + exp(-re * re / (2.0 * 0.012 * 0.012)) * 0.6 + exp(-re / 0.09) * 0.05) * u_companions;
  float rc = length(q - vec2(-0.31, 0.27));
  light += mix(blue, vec3(1.0), 0.8) * (exp(-rc * rc / (2.0 * 0.011 * 0.011)) + exp(-rc / 0.022) * 0.3 + exp(-rc / 0.07) * 0.04) * u_companions;

  /* ---- The nebula: a band of lit gas across the whole sky, behind the
     galaxy, as our own galaxy lies across a night sky. m runs along the
     band and across it. The gas is noise pushed about by slower noise,
     so it gathers into billows and pulls out into wisps, and that push
     drifts, so the gas creeps like plasma. It is bright down the band's
     middle, where a ragged rift of dust is cut back out of it, cools from
     rose through violet to blue at its edges, and the stars crowd into it. */
  float cb = cos(u_band);
  float sb = sin(u_band);
  vec2 m = vec2(cb * p.x + sb * (p.y - u_bandY), cb * (p.y - u_bandY) - sb * p.x);
  vec2 mq = m * vec2(1.5, 3.0) + 11.0;
  vec2 push = vec2(galaxyDrift(mq + vec2(0.0, t * 0.006)), galaxyDrift(mq + vec2(5.2, 1.3) - vec2(t * 0.005, 0.0)));
  float gas = fbm(mq + 2.4 * push);
  float wisp = fbm(m * vec2(4.5, 8.0) + 3.2 * push + 40.0);
  /* Filaments: the bright seams where two billows meet. */
  float seam = pow(1.0 - abs(2.0 * fbm(m * vec2(6.0, 11.0) + 4.0 * push + 90.0) - 1.0), 5.0);
  float off = m.y + 0.16 * (push.x - 0.5);
  float body = exp(-off * off / (2.0 * 0.19 * 0.19));
  float heart = exp(-off * off / (2.0 * 0.07 * 0.07));
  float rift = smoothstep(0.42, 0.8, 1.0 - abs(2.0 * galaxyDrift(m * vec2(3.0, 7.0) + 1.6 * push + 70.0) - 1.0)) * heart;
  float billow = body * smoothstep(0.3, 0.68, gas);
  vec3 gasHue = mix(mix(blue, violet, smoothstep(0.3, 0.65, wisp)), rose, smoothstep(0.5, 0.8, gas) * heart);
  vec3 neb = gasHue * billow * (0.12 + 2.4 * wisp * wisp * wisp + 0.9 * seam) * 0.36;
  neb += mix(warm, rose, 0.5) * heart * gas * gas * (0.6 * gas + 0.5 * seam) * 0.42;
  neb *= 1.0 - 0.92 * rift;
  light += (1.0 - exp(-2.0 * neb)) * u_nebula;

  /* ---- The stars, four depths of them, thick where the sky's own
     cloud and the nebula are and thin between, over a breath of that
     cloud's colour. */
  float mist = fbm(p * 1.7 + 3.0);
  float thick = clamp(1.6 * mist - 0.46 + 0.75 * billow * (1.0 - rift) * min(1.0, u_nebula), 0.025, 0.85);
  vec2 dust = galaxyStars(css, 4.0, 0, thick, 0.42, 0.0, t);
  vec2 far = galaxyStars(css, 11.0, 3, thick, 0.55, 0.0, t);
  vec2 mid = galaxyStars(css, 37.0, 7, 0.25 + 0.6 * thick, 0.75, 0.1, t);
  vec2 near = galaxyStars(css, 150.0, 11, 0.45, 1.2, 0.4, t);
  vec3 dustTint = mix(vec3(1.0), mix(blue, violet, dust.y), 0.55);
  vec3 farTint = mix(vec3(1.0), mix(blue, violet, far.y), 0.45);
  vec3 midTint = mix(vec3(1.0), mix(mix(blue, violet, mid.y), warm, step(0.9, mid.y)), 0.35);
  vec3 nearTint = mix(vec3(1.0), mix(mix(blue, rose, near.y), warm, step(0.85, near.y)), 0.22);
  light += (dustTint * dust.x * 0.42 * among + farTint * far.x * 0.85 * among + midTint * mid.x * 1.3 + nearTint * near.x * 1.8) * u_stars;
  light += mix(blue, violet, 0.6 * mist) * mist * mist * mist * 0.018 * min(1.0, u_stars);

  return u_ground + light;
}
`,
};

export const SCENES = [horizon, rift, glyphs, prism, meteors, waves, aurora, highway, ocean, sky, galaxy];
