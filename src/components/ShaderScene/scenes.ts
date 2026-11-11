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
 * night with a fixed sun at the apex, soft layers of light along the arc,
 * a hazy world of land and cloud below, and deep ocean blue further down.
 * The horizon lab's own fades and grain are passes here, so they can be switched
 * and tuned like any other scene's.
 */
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
 * The prism: light through cut glass. Shafts of light cross the dark at a
 * tilt, some wide and soft, some thin and hard, gathered round one place
 * and thinning away from it. Each shaft is drawn once per colour role, every
 * role a step further along, as glass bends each wavelength a little more:
 * where the copies overlap they sum to white, and where they part the edge
 * of the shaft breaks into the theme's own spectrum.
 */
export const prism: Scene = {
  id: "prism",
  label: "Prism",
  description: "Shafts of light through glass, their edges split into the theme's spectrum.",
  mode: "dark",
  colours: [
    "--color-ambient-5",
    "--color-ambient-6",
    "--color-ambient-1",
    "--color-ambient-2",
    "--color-ambient-4",
  ],
  params: [
    { key: "position", label: "Position", min: -0.5, max: 0.5, step: 0.01, default: 0.2 },
    { key: "spread", label: "Spread", min: 0.15, max: 2, step: 0.01, default: 0.55 },
    { key: "tilt", label: "Tilt", min: -1, max: 1, step: 0.01, default: -0.22 },
    { key: "fan", label: "Fan", min: 0, max: 1, step: 0.01, default: 0.35 },
    { key: "shafts", label: "Shafts", min: 1, max: 10, step: 0.1, default: 2.8 },
    { key: "sharp", label: "Sharpness", min: 0, max: 1, step: 0.01, default: 0.65 },
    { key: "dispersion", label: "Dispersion", min: 0, max: 2, step: 0.01, default: 1 },
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

/* The theme's spectrum, one end to the other. */
vec3 prismSpectrum(float x) {
  float f = clamp(x, 0.0, 1.0) * 4.0;
  int i = int(min(floor(f), 3.0));
  return mix(prismHue(u_col[i]), prismHue(u_col[i + 1]), f - float(i));
}

/* The shafts across their own axis: wide soft ones and thin hard ones. */
float prismShafts(float s, float t) {
  float wide = vnoise(vec2(s * u_shafts * 0.5 + t * 0.021, 3.7));
  float thin = vnoise(vec2(s * u_shafts * 2.4 - t * 0.034, 9.1));
  float wideEdge = mix(0.4, 0.1, u_sharp);
  float thinEdge = mix(0.22, 0.02, u_sharp);
  float soft = smoothstep(0.56, 0.56 + wideEdge, wide);
  /* No two thin shafts are as bright as each other. */
  float each = 0.12 + 0.88 * smoothstep(0.3, 0.75, vnoise(vec2(s * u_shafts * 0.9 + 5.3, 1.9)));
  return 0.16 * soft * soft + each * smoothstep(0.72, 0.72 + thinEdge, thin);
}

vec3 scene(vec2 uv, float t) {
  float aspect = u_size.x / u_size.y;
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);
  t *= u_drift;

  /* Across the shafts, which open as they fall from above. */
  float s = (p.x - u_position * aspect + u_tilt * p.y) / (1.0 + u_fan * (0.5 - p.y));
  float along = p.y - u_tilt * p.x;
  s += 0.04 * (fbm(vec2(p.x * 0.9 + t * 0.02, p.y * 0.7 - t * 0.015)) - 0.5);

  vec3 light = vec3(0.0);
  vec3 total = vec3(0.0);
  for (int k = 0; k < 14; k++) {
    float x = float(k) / 13.0;
    vec3 hue = prismSpectrum(x);
    light += hue * prismShafts(s + (x - 0.5) * 0.085 * u_dispersion, t);
    total += hue;
  }
  /* Every copy in one place is white light. */
  light /= max(total, vec3(1e-3));

  float gather = exp(-(s * s) / (2.0 * u_spread * u_spread));
  /* Each shaft comes and goes along its length. */
  float reach = 0.35 + 0.65 * smoothstep(0.25, 0.75, fbm(vec2(s * 2.4, along * 0.9 - t * 0.03) + 4.0));
  vec3 haze = (total / 14.0) * 0.0015 * exp(-(s * s) / (2.0 * u_spread * u_spread * 2.5));
  return u_ground + (light * gather * reach * 0.9 + haze) * u_glow;
}
`,
};

/**
 * Meteors: a shower over a planet's edge. Stars hold a dark sky; meteors
 * fall across it in lanes at one angle, three depths of them, each a white
 * head with a tail that cools through the theme's colours as it thins; and
 * a planet's limb crosses the foot of the scene, lit to a crescent by a sun
 * that flares where it clears the edge. The limb hides what falls behind it.
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
  float sky = smoothstep(0.0, 2.0 * px, d);
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
  float star = exp(-(sd * sd) / (2.0 * 0.7 * 0.7)) * step(0.62, pick)
    * (0.25 + 0.75 * pow(rnd(cell + 5), 3.0))
    * (0.7 + 0.3 * sin(t * (0.5 + 1.5 * rnd(cell + 13)) + 40.0 * pick));
  light += mix(vec3(1.0), mix(near, far, rnd(cell + 3)), 0.3) * star * u_stars * (1.0 - 0.8 * exp(-fromSun / 0.18));

  /* ---- The shower: lanes across the fall, three depths of them. */
  vec2 dir = vec2(-sin(u_angle), -cos(u_angle));
  vec2 q = vec2(p.x, p.y - 0.5);
  float a = dot(q, vec2(-dir.y, dir.x));
  float b = dot(q, dir);
  float span = 2.0 + aspect;
  for (int i = 0; i < 3; i++) {
    float depth = 1.0 + float(i) * 0.7;
    float laneW = 0.13 / depth;
    float lane = floor(a / laneW);
    ivec2 id = ivec2(int(lane) + 2048, i * 57 + 3);
    float u = t * u_fall * (0.1 + 0.16 * rnd(id)) / depth + rnd(id + 11) * 17.0;
    ivec2 pass = id + ivec2(0, int(mod(floor(u), 512.0)) * 131 + 7);
    float there = step(1.0 - 0.55 * u_shower, rnd(pass + 5));
    float head = (fract(u) - 0.5) * span;
    float ax = (lane + 0.2 + 0.6 * rnd(pass + 9)) * laneW;
    float len = u_tail * (0.1 + 0.3 * rnd(pass + 13)) / depth;
    float back = (head - b) / len;
    float w = max((0.0011 + 0.0012 * rnd(pass + 17)) / depth, 0.6 * px) * (1.0 - 0.6 * clamp(back, 0.0, 1.0));
    float across = exp(-pow((a - ax) / w, 2.0) * 0.5);
    float trail = smoothstep(-3.0 * w / len, 0.0, back) * pow(max(1.0 - back, 0.0), 1.6);
    vec3 tint = mix(vec3(1.0), near, smoothstep(0.0, 0.22, back));
    tint = mix(tint, ember, smoothstep(0.2, 0.6, back));
    tint = mix(tint, far, smoothstep(0.55, 1.0, back));
    light += tint * across * trail * there * (0.35 + 0.65 * rnd(pass + 21)) * 0.9 / sqrt(depth);
  }

  /* ---- Air on the limb: tight and bright by the sun, wide and cool away from it. */
  vec3 air = mix(far, near, lit);
  light += air * lobe(d - 0.012, 0.07, 0.02) * (0.1 + 0.5 * litWide) * u_glow;
  light += deep * lobe(d, 0.3, 0.05) * 0.06 * litWide * u_glow;
  light *= sky;

  /* ---- The planet's lit edge: a crescent, thick by the sun. */
  float inside = max(-d, 0.0);
  float crescent = exp(-inside / (0.004 + 0.07 * lit * lit)) * (0.06 + 0.94 * lit);
  vec3 edge = mix(mix(air, vec3(1.0), 0.75 * lit), vec3(1.0), 0.5 * exp(-inside / 0.006));
  light += edge * crescent * (1.0 - sky) * 0.95 * u_glow;
  light += mix(near, vec3(1.0), 0.5) * exp(-pow(d / (1.5 * px), 2.0)) * (0.12 + 0.6 * litWide) * u_glow;

  /* ---- The sun: a core, a bloom and four spikes. */
  float core = exp(-dot(r, r) / (2.0 * 0.012 * 0.012));
  float bloom = exp(-dot(r, r) / (2.0 * 0.07 * 0.07)) * 0.5 + exp(-fromSun / 0.16) * 0.22;
  vec2 k = vec2(r.x + r.y, r.x - r.y) * 0.7071;
  float spikes = exp(-pow(k.x / 0.006, 2.0) * 0.5) * exp(-abs(k.y) / 0.085)
    + exp(-pow(k.y / 0.006, 2.0) * 0.5) * exp(-abs(k.x) / 0.085);
  float veil = mix(0.4, 1.0, sky);
  light += mix(sunTint, vec3(1.0), 0.8) * (core * 1.4 + spikes * 0.55 * veil) * u_flare;
  light += mix(sunTint, vec3(1.0), 0.55) * bloom * veil * u_flare;

  return u_ground + light;
}
`,
};

/**
 * Waves: a sea drawn in points, seen from above it. A plane of dots runs off
 * into mist and rolls in slow swells, each dot a round point that grows and brightens on a
 * crest and all but goes out in a trough, over a glow that lies in the
 * water under them. The surface is found by marching the eye's ray through
 * the slab the swells can occupy, so a near crest hides the trough behind
 * it; each dot is then drawn round on the screen from its own place on the
 * surface. Far off, where the dots would be finer than a pixel, they melt
 * into the glow rather than shimmer.
 */
export const waves: Scene = {
  id: "waves",
  label: "Waves",
  description: "A sea of points rolling off into mist, bright on the crests, over a deep glow.",
  mode: "dark",
  colours: ["--color-ambient-4", "--color-ambient-3", "--color-ambient-2"],
  params: [
    { key: "rise", label: "Height", min: -0.3, max: 0.9, step: 0.01, default: 0.12 },
    { key: "pitch", label: "View", min: 0.15, max: 1.2, step: 0.01, default: 0.3 },
    { key: "swell", label: "Swell", min: 0, max: 2, step: 0.01, default: 1 },
    { key: "reach", label: "Wave length", min: 0.4, max: 3, step: 0.01, default: 1 },
    { key: "density", label: "Density", min: 3, max: 30, step: 0.5, default: 16 },
    { key: "dot", label: "Dot size", min: 0.3, max: 2, step: 0.01, default: 1 },
    { key: "glow", label: "Glow", min: 0, max: 2, step: 0.01, default: 1 },
    { key: "mist", label: "Mist", min: 0.2, max: 3, step: 0.01, default: 1 },
    { key: "flow", label: "Flow", min: 0, max: 3, step: 0.01, default: 1 },
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
  q /= u_reach;
  float h = 0.5 * sin(dot(q, vec2(0.62, 0.78)) * 1.15 + t * 0.3)
    + 0.28 * sin(dot(q, vec2(-0.74, 0.55)) * 2.1 - t * 0.23 + 1.3)
    + 0.7 * (vnoise(q * 0.5 + vec2(0.0, t * 0.05)) - 0.5);
  return h / 1.13;
}

vec3 scene(vec2 uv, float t) {
  float aspect = u_size.x / u_size.y;
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - u_rise);
  float px = 1.0 / u_size.y;
  t *= u_flow;

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
  float farZ = 6.3 * u_mist;
  vec3 light = vec3(0.0);

  if (fall > 1e-4 && run > 1e-4) {
    /* The ray can only meet the sea inside the slab the swells occupy. */
    float enter = (1.0 - amp) / fall;
    float leave = min((1.0 + amp) / fall, 2.5 * farZ / run);
    float k = enter;
    float last = enter;
    float stride = max(leave - enter, 0.0) / 28.0;
    for (int i = 0; i < 28; i++) {
      float over = (1.0 - fall * k) - amp * waveHeight(vec2(p.x * k, run * k), t);
      if (over < 0.0) break;
      last = k;
      k += stride;
    }
    k = min(k, leave);
    /* Close in on the surface between the last two steps. */
    for (int i = 0; i < 5; i++) {
      float mid = 0.5 * (last + k);
      float over = (1.0 - fall * mid) - amp * waveHeight(vec2(p.x * mid, run * mid), t);
      if (over < 0.0) k = mid; else last = mid;
    }

    vec2 at = vec2(p.x * k, run * k);
    float z = at.y;
    float h = waveHeight(at, t);
    float lift = smoothstep(-0.7, 0.8, h);
    /* Mist takes the far sea, and the near edge eases in. */
    float fog = exp(-(z * z) / (farZ * farZ)) * smoothstep(0.0, 0.08, uv.y);

    /* The glow in the water, smoky, brighter under a crest. */
    float cloud = fbm(at * 0.3 + vec2(t * 0.03, -t * 0.02));
    vec3 body = mix(deep, smoke, 0.3 * smoothstep(0.35, 0.75, cloud));
    light += body * (0.04 + 0.22 * lift * lift) * (0.35 + 0.9 * cloud) * fog * u_glow;

    /* The dots: this row's and the rows before and behind it, each drawn
       round on the screen from its own place on the surface. */
    float cellW = 1.0 / u_density;
    float row = floor(z / cellW);
    float dots = 0.0;
    vec2 before = p;
    vec2 behind = p;
    for (int j = -1; j <= 1; j++) {
      float cz = (row + float(j) + 0.5) * cellW;
      /* Where this ray is when it is that far out, to pick the column. */
      float kz = cz / run;
      /* Every other row sits half a cell across, like a halftone. */
      float stagger = 0.5 * mod(row + float(j), 2.0);
      float cx = (floor(p.x * kz / cellW - stagger) + 0.5 + stagger) * cellW;
      float ch = waveHeight(vec2(cx, cz), t);
      float cy = amp * ch - 1.0;
      float depth = max(cz * cp - cy * sp, 1e-3);
      vec2 on = vec2(cx, cy * cp + cz * sp) * WAVE_LENS / depth;
      if (j == -1) before = on;
      if (j == 1) behind = on;
      float up = smoothstep(-0.7, 0.8, ch);
      float rad = 0.15 * cellW * u_dot * (0.4 + 0.6 * up) * WAVE_LENS / depth;
      float shown = max(rad, 0.75 * px);
      float disc = 1.0 - smoothstep(shown - px, shown + px, length(p - on));
      dots = max(dots, disc * (rad * rad) / (shown * shown) * (0.1 + 0.9 * up * up));
    }
    /* Where rows are finer than the pixels, the dots become their average. */
    float rowPx = 0.5 * length(behind - before) / px;
    float even = 0.06 * u_dot * u_dot * (0.1 + 0.9 * lift * lift);
    dots = mix(even, dots, smoothstep(1.5, 3.5, rowPx));
    light += mix(deep, crest, 0.3 + 0.7 * lift) * dots * fog * 1.3;
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
vec3 auroraHue(vec3 c) {
  float grey = (c.r + c.g + c.b) / 3.0;
  c = max(grey + (c - grey) * 1.6, vec3(0.0));
  return c / max(max(c.r, max(c.g, c.b)), 1e-3);
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

/** Every scene, in picker order. */
export const SCENES = [horizon, rift, glyphs, prism, meteors, waves, aurora];
