/**
 * GLSL sources for ShaderField, the system's ambient background field.
 *
 * This file owns the shader and BLOB_COUNT only. The blob table and every
 * tuneable parameter are data, passed in by the caller, so a look can be
 * retuned without touching GLSL.
 *
 * The field is a sum of soft Gaussian sources. It computes the true Gaussian
 * falloff a stack of blurred CSS discs only approximates, blends in linear
 * space so midpoints keep their saturation, warps the field with fbm noise so
 * it flows instead of translating rigidly, and dithers away the 8-bit banding
 * these wide, soft ramps otherwise produce.
 *
 * Coordinate space is chosen to match a CSS blob layer exactly, so a fallback
 * built from absolutely-positioned discs lines up with it: origin at the
 * container centre (`left`/`top: 50%`), one unit = the field's reference
 * width (discs are vw-sized, and CSS percentage margins — top included —
 * resolve against the containing block's width). Centres are therefore
 * constants that never need re-uploading on resize.
 *
 * That reference width is the container's own width until `crop` holds it
 * back on a narrow viewport, where the field keeps more of the scale it was
 * composed at and the viewport crops into it instead. The hook resolves it to
 * `u_unit`, in drawing-buffer pixels, so the shader itself never has to know
 * which of the two it is looking at.
 *
 * Colours arrive already converted to linear RGB (the hook does the sRGB
 * decode once per theme change); the shader only encodes back at the end.
 */

/**
 * Sizes the shader's uniform arrays, so it is a compile-time constant here
 * rather than a length read from data. A caller may pass fewer blobs — unused
 * slots are parked off-field — but never more; ShaderField's own default table
 * fills it exactly, and scripts/validate-shader-background.mjs reads this
 * number out of this file to hold the website's config to it.
 */
export const BLOB_COUNT = 8;

export const vertexSource = /* glsl */ `#version 300 es
// Fullscreen triangle — no buffers, three vertices from gl_VertexID.
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`;

export const fragmentSource = /* glsl */ `#version 300 es
precision highp float;

uniform vec2  u_resolution;  // drawing-buffer size in pixels
uniform float u_unit;        // pixels per field unit (see coordinate space)
uniform float u_time;        // field time, seconds (speed applied JS-side)
uniform vec3  u_color[${BLOB_COUNT}];  // linear RGB per blob
uniform vec4  u_blob[${BLOB_COUNT}];   // xy = centre, z = sigma, w = emission weight
uniform vec4  u_motion[${BLOB_COUNT}]; // xy = angular speeds, zw = phases
uniform float u_intensity;   // peak-alpha ceiling
uniform float u_warp;        // domain-warp strength
uniform float u_scale;       // noise frequency
uniform float u_grain;       // film-grain strength
uniform float u_streak;      // anisotropic stretch: 0 = blobs, 1 = light streams
uniform vec2  u_mouse;       // pointer in field coordinates (smoothed JS-side)
uniform float u_mvel;        // smoothed pointer speed, width units/s
uniform float u_react;       // cursor-reactivity strength

out vec4 outColor;

// Integer hash — WebGL2 has real uint ops, so no fract(sin()) precision
// lottery on mobile GPUs.
uint ihash(uvec2 p) {
  p = p * uvec2(73333u, 7777u) ^ (p.yx >> 3u);
  uint h = p.x ^ (p.y * 2654435761u);
  h ^= h >> 15u;
  h *= 2246822519u;
  h ^= h >> 13u;
  return h;
}

float rnd(ivec2 p) {
  return float(ihash(uvec2(p)) >> 8) * (1.0 / 16777216.0);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  ivec2 c = ivec2(i);
  return mix(
    mix(rnd(c), rnd(c + ivec2(1, 0)), u.x),
    mix(rnd(c + ivec2(0, 1)), rnd(c + ivec2(1, 1)), u.x),
    u.y
  );
}

// 3 octaves; a 4th is invisible at this softness.
float fbm(vec2 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    s += a * vnoise(p);
    p = p * 2.02 + vec2(17.0, 9.0);
    a *= 0.5;
  }
  return s;
}

void main() {
  // CSS coordinate space: origin at container centre, one unit = the
  // reference width the hook resolved, y running downward.
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution) / u_unit;
  p.y = -p.y;

  // Light-stream axis: a fixed diagonal. Distances across the axis are
  // magnified before the Gaussian, so every source stretches along it and
  // the field reads as rays instead of discs.
  float ca = cos(0.5);
  float sa = sin(0.5);
  mat2 toStreak = mat2(ca, -sa, sa, ca);
  float squeeze = 1.0 + u_streak * 4.0;

  // Domain warp: the field flows rather than drifts. The noise is sampled
  // in the same anisotropic space, so the flow lines follow the streams.
  float t = u_time;
  vec2 ps = toStreak * p;
  ps.y *= squeeze;
  vec2 q = vec2(
    fbm(ps * u_scale + vec2(0.0, t * 0.030)),
    fbm(ps * u_scale + vec2(5.2, 1.3) - t * 0.024)
  );
  vec2 w = p + u_warp * (q - 0.5);

  // Cursor wake: a smooth vortex around the pointer, amplified by speed.
  // The displacement is built from the *unnormalised* offset so it falls to
  // zero at the cursor itself. Normalising here (md/mr) made the direction
  // spin through 360 degrees at full strength across the centre pixel, which
  // rendered as a pinch — a cone converging to a point.
  vec2 md = p - u_mouse;
  float mr2 = dot(md, md);
  float minf = exp(-mr2 / (2.0 * 0.22 * 0.22));
  vec2 swirl = vec2(-md.y, md.x);
  // smoothstep, not min(): a hard clamp stepped visibly as speed crossed it.
  float stir = 0.25 + 1.3 * smoothstep(0.0, 0.8, u_mvel);
  w += u_react * minf * stir * (swirl * 0.9 + md * 0.35);

  // Accumulate true Gaussians in linear space. Positive weights emit;
  // negative weights absorb (shadows — the eclipse disc).
  vec3 acc = vec3(0.0);
  float cov = 0.0;
  float shade = 0.0;
  for (int i = 0; i < ${BLOB_COUNT}; i++) {
    vec2 c = u_blob[i].xy + 0.045 * vec2(
      cos(u_motion[i].x * t + u_motion[i].z),
      sin(u_motion[i].y * t + u_motion[i].w)
    );
    vec2 d = toStreak * (w - c);
    d.y *= squeeze;
    float s = u_blob[i].z;
    float g = exp(-dot(d, d) / (2.0 * s * s));
    float wgt = u_blob[i].w;
    if (wgt >= 0.0) {
      acc += u_color[i] * (g * wgt);
      cov += g * wgt;
    } else {
      shade += g * -wgt;
    }
  }

  // Glow trail: wider and softer than the swirl, and mostly velocity-driven,
  // so a resting cursor does not park a bright dot on the field.
  //
  // The wake brightens whatever colour it is passing over rather than adding
  // one of its own. Injecting u_color[0] meant the trail always wore the
  // first blob's token — gold in the site palette, violet in beam — which
  // read as a stray colour with no relationship to the field beneath it.
  // Weighting by the local hue keeps the wake colour-neutral: it reads as
  // light falling on the field, and it stays correct for any palette.
  vec3 local = acc / max(cov, 1e-4);
  float gfall = exp(-mr2 / (2.0 * 0.3 * 0.3));
  float glow = u_react * gfall * (0.12 + 0.5 * smoothstep(0.0, 0.8, u_mvel));
  acc += local * glow;
  cov += glow;

  vec3 lin = acc / max(cov, 1e-4);
  float lit = max(cov - shade, 0.0);
  float alpha = u_intensity * (1.0 - exp(-lit * 0.9));

  vec3 srgb = pow(max(lin, vec3(0.0)), vec3(1.0 / 2.2));

  // Film grain: animated hash noise. At u_grain 0 this degenerates to the
  // ±1/255 dither that kills banding, so the two share one lookup.
  uvec2 gp = uvec2(gl_FragCoord.xy) + uvec2(
    uint(fract(t * 7.31) * 1024.0) * 7919u,
    uint(fract(t * 3.17) * 1024.0) * 104729u
  );
  float gr = float(ihash(gp) & 255u) / 255.0 - 0.5;
  srgb += gr * (1.0 / 255.0 + u_grain * 0.35);
  // A small grain-driven alpha floor lets the sparkle read even where the
  // field itself is empty (the reference's grainy dark scene).
  float grainFloor = u_grain * 0.1 * (gr + 0.5);
  alpha = clamp(alpha * (1.0 + gr * u_grain * 0.5) + grainFloor, 0.0, 1.0);
  srgb = clamp(srgb, 0.0, 1.0);

  // Premultiplied output (context is created with premultipliedAlpha: true).
  outColor = vec4(srgb * alpha, alpha);
}
`;
