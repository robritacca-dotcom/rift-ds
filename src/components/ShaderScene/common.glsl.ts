/**
 * The GLSL every scene and pass can call: ShaderField's integer hash (no
 * fract(sin()) patterning, so no lines in the grain), value noise, fbm and
 * the one-sided Gaussian the horizon is built from.
 */
export const COMMON_GLSL = /* glsl */ `
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
  ivec2 c = ivec2(i) + 4096;
  return mix(
    mix(rnd(c), rnd(c + ivec2(1, 0)), u.x),
    mix(rnd(c + ivec2(0, 1)), rnd(c + ivec2(1, 1)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    s += a * vnoise(p);
    p = p * 2.02 + vec2(17.0, 9.0);
    a *= 0.5;
  }
  return s;
}

/* A one-sided Gaussian: one sigma above zero, another below. */
float lobe(float d, float above, float below) {
  float s = d > 0.0 ? above : below;
  return exp(-(d * d) / (2.0 * s * s));
}
`;
